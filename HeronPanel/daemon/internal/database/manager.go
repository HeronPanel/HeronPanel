package database

import (
	"fmt"
	"os/exec"
)

type DBManager struct {
	DBUser string
	DBPass string
}

func NewDBManager(user, pass string) *DBManager {
	return &DBManager{DBUser: user, DBPass: pass}
}

func (m *DBManager) CreateDatabase(dbName string) error {
	// Example for MySQL
	cmd := exec.Command("mysql", "-u", m.DBUser, "-p"+m.DBPass, fmt.Sprintf("CREATE DATABASE %s;", dbName))
	return cmd.Run()
}

func (m *DBManager) DumpDatabase(dbName string, destPath string) error {
	cmd := exec.Command("mysqldump", "-u", m.DBUser, "-p"+m.DBPass, dbName, "--result-file="+destPath)
	return cmd.Run()
}
