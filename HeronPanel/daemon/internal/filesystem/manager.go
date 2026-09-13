package filesystem

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
)

type FileInfo struct {
	Name  string json:"name"
	Size  int64  json:"size"
	IsDir bool   json:"isDir"
}

type Manager struct {
	RootDir string
}

func NewManager(root string) *Manager {
	return &Manager{RootDir: root}
}

func (m *Manager) safePath(path string) (string, error) {
	absRoot, _ := filepath.Abs(m.RootDir)
	finalPath := filepath.Join(absRoot, path)
	
	if !filepath.HasPrefix(finalPath, absRoot) {
		return "", fmt.Errorf("path traversal attempt detected")
	}
	return finalPath, nil
}

func (m *Manager) List(path string) ([]FileInfo, error) {
	fullPath, err := m.safePath(path)
	if err != nil { return nil, err }

	entries, err := ioutil.ReadDir(fullPath)
	if err != nil { return nil, err }

	var files []FileInfo
	for _, entry := range entries {
		files = append(files, FileInfo{
			Name:  entry.Name(),
			Size:  entry.Size(),
			IsDir: entry.IsDir(),
		})
	}
	return files, nil
}

func (m *Manager) ReadFile(path string) ([]byte, error) {
	fullPath, err := m.safePath(path)
	if err != nil { return nil, err }
	return ioutil.ReadFile(fullPath)
}

func (m *Manager) WriteFile(path string, content []byte) error {
	fullPath, err := m.safePath(path)
	if err != nil { return err }
	return ioutil.WriteFile(fullPath, content, 0644)
}

func (m *Manager) Delete(path string) error {
	fullPath, err := m.safePath(path)
	if err != nil { return err }
	return os.RemoveAll(fullPath)
}
