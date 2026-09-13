package process

import (
	"fmt"
	"os/exec"
	"sync"
	"syscall"
)

type ProcessInfo struct {
	Pid    int
	Cmd    string
	Status string
}

type Manager struct {
	processes map[string]*ProcessInfo
	mu        sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		processes: make(map[string]*ProcessInfo),
	}
}

func (m *Manager) Start(serverId string, command string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if proc, ok := m.processes[serverId]; ok && proc.Status == "RUNNING" {
		return fmt.Errorf("server already running")
	}

	cmd := exec.Command("sh", "-c", command)
	err := cmd.Start()
	if err != nil {
		return err
	}

	m.processes[serverId] = &ProcessInfo{
		Pid:    cmd.Process.Pid,
		Cmd:    command,
		Status: "RUNNING",
	}
	return nil
}

func (m *Manager) Stop(serverId string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	proc, ok := m.processes[serverId]
	if !ok {
		return fmt.Errorf("server not found")
	}

	process, err := syscall.FindProcess(proc.Pid)
	if err != nil {
		return err
	}

	err = process.Kill()
	if err != nil {
		return err
	}

	proc.Status = "OFFLINE"
	return nil
}

func (m *Manager) GetStatus(serverId string) string {
	m.mu.RLock()
	defer m.mu.RUnlock()

	proc, ok := m.processes[serverId]
	if !ok {
		return "OFFLINE"
	}
	return proc.Status
}
