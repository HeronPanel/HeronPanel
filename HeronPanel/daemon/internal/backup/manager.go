package backup

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"time"
)

type BackupManager struct {
	BackupDir string
}

func NewBackupManager(dir string) *BackupManager {
	return &BackupManager{BackupDir: dir}
}

func (m *BackupManager) CreateBackup(serverId string, serverPath string) (string, error) {
	timestamp := time.Now().Format("20060102-150405")
	filename := fmt.Sprintf("backup-%s-%s.tar.gz", serverId, timestamp)
	destPath := filepath.Join(m.BackupDir, filename)

	// Real system call to tar
	cmd := exec.Command("tar", "-czf", destPath, "-C", serverPath, ".")
	err := cmd.Run()
	if err != nil {
		return "", err
	}

	return filename, nil
}
