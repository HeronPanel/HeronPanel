package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"heronpanel-daemon/internal/backup"
	"heronpanel-daemon/internal/database"
	"heronpanel-daemon/internal/docker"
	"heronpanel-daemon/internal/process"
)

type HeartbeatPayload struct {
	ApiKey   string  json:"apiKey"
	Metrics  Metrics json:"metrics"
}

type Metrics struct {
	CPU    float64 json:"cpu"
	RAM    float64 json:"ram"
	Disk   float64 json:"disk"
	Uptime int64   json:"uptime"
}

type ActionRequest struct {
	ServerId string json:"serverId"
	Action   string json:"action"
	ApiKey   string json:"apiKey"
	Type     string json:"type" 
	Image    string json:"image,omitempty"
	MemLimit int64  json:"memLimit,omitempty"
}

type BackupRequest struct {
	ServerId string json:"serverId"
	ApiKey   string json:"apiKey"
}

type DBRequest struct {
	DbName string json:"dbName"
	ApiKey string json:"apiKey"
}

type ActionResponse struct {
	Status string json:"status"
	State  string json:"state"
	Error  string json:"error,omitempty"
	File   string json:"file,omitempty"
}

var procManager = process.NewManager()
var dockManager *docker.DockerManager
var backupManager = backup.NewBackupManager("/var/backups/heron")
var dbManager = database.NewDBManager("root", "password")

func getSystemMetrics() Metrics {
	return Metrics{
		CPU:    1.2, 
		RAM:    512.0, 
		Disk:   20.5,
		Uptime: time.Now().Unix(),
	}
}

func sendHeartbeat(backendURL string, apiKey string) {
	metrics := getSystemMetrics()
	payload := HeartbeatPayload{
		ApiKey:  apiKey,
		Metrics: metrics,
	}
	jsonData, _ := json.Marshal(payload)
	http.Post(backendURL+"/daemon/heartbeat", "application/json", bytes.NewBuffer(jsonData))
}

func handleAction(w http.ResponseWriter, r *http.Request) {
	var req ActionRequest
	json.NewDecoder(r.Body).Decode(&req)

	if req.ApiKey == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var res ActionResponse
	if req.Type == "DOCKER" {
		if dockManager == nil {
			dm, _ := docker.NewDockerManager()
			dockManager = dm
		}
		switch req.Action {
		case "START":
			err := dockManager.CreateAndStart(req.ServerId, req.Image, nil, req.MemLimit)
			if err != nil { res.Error = err.Error() } else { res.Status = "Success"; res.State = "RUNNING" }
		case "STOP":
			err := dockManager.Stop(req.ServerId)
			if err != nil { res.Error = err.Error() } else { res.Status = "Success"; res.State = "OFFLINE" }
		}
	} else {
		switch req.Action {
		case "START":
			err := procManager.Start(req.ServerId, "echo 'Starting process...'")
			if err != nil { res.Error = err.Error() } else { res.Status = "Success"; res.State = "RUNNING" }
		case "STOP":
			err := procManager.Stop(req.ServerId)
			if err != nil { res.Error = err.Error() } else { res.Status = "Success"; res.State = "OFFLINE" }
		}
	}
	json.NewEncoder(w).Encode(res)
}

func handleBackup(w http.ResponseWriter, r *http.Request) {
	var req BackupRequest
	json.NewDecoder(r.Body).Decode(&req)
	
	// Realistically, we'd lookup the server path from a config file
	filename, err := backupManager.CreateBackup(req.ServerId, "/home/heron/servers/"+req.ServerId)
	if err != nil {
		json.NewEncoder(w).Encode(ActionResponse{Error: err.Error()})
		return
	}
	json.NewEncoder(w).Encode(ActionResponse{Status: "Success", File: filename})
}

func handleDbCreate(w http.ResponseWriter, r *http.Request) {
	var req DBRequest
	json.NewDecoder(r.Body).Decode(&req)
	err := dbManager.CreateDatabase(req.DbName)
	if err != nil {
		json.NewEncoder(w).Encode(ActionResponse{Error: err.Error()})
		return
	}
	json.NewEncoder(w).Encode(ActionResponse{Status: "Success"})
}

func main() {
	fmt.Println("?? HeronDaemon is starting...")
	
	backendURL := os.Getenv("HERON_BACKEND_URL")
	if backendURL == "" { backendURL = "http://localhost:3000" }
	apiKey := os.Getenv("HERON_API_KEY")
	if apiKey == "" { apiKey = "default-daemon-key" }

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) { fmt.Fprintf(w, "Daemon is healthy") })
	http.HandleFunc("/action", handleAction)
	http.HandleFunc("/backup/create", handleBackup)
	http.HandleFunc("/db/create", handleDbCreate)

	go func() {
		log.Fatal(http.ListenAndServe(":8080", nil))
	}()

	ticker := time.NewTicker(30 * time.Second)
	for range ticker.C {
		sendHeartbeat(backendURL, apiKey)
	}
}
