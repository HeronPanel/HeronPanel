#!/bin/bash

# HeronPanel Production Installer ??
# Designed for Ubuntu 22.04+ / Debian 11+

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "?? Starting HeronPanel Professional Installation..."

# 1. System Updates
echo -e "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Dependencies
echo -e "Installing Core Dependencies..."
sudo apt-get install -y curl git build-essential postgresql postgresql-contrib golang-go

# 3. Install Docker
echo -e "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker \

# 4. Install Node.js (LTS)
echo -e "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 5. Setup Backend
echo -e "Configuring Backend..."
cd backend
npm install
# DB setup would typically happen via a prompt here
npx prisma migrate deploy
npm run build

# 6. Build Daemon
echo -e "Compiling HeronPanel Daemon..."
cd ../daemon
go mod tidy
go build -o heron-daemon main.go
sudo mv heron-daemon /usr/local/bin/

# 7. Systemd Services
echo -e "Configuring Systemd Services..."

# API Service
sudo bash -c 'cat <<EOF > /etc/systemd/system/heron-api.service
[Unit]
Description=HeronPanel API
After=network.target postgresql.service

[Service]
Type=simple
User=\
WorkingDirectory=C:\Users\MIDNYS\Desktop\HeronPanel/backend
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF'

# Daemon Service
sudo bash -c 'cat <<EOF > /etc/systemd/system/heron-daemon.service
[Unit]
Description=HeronPanel Daemon
After=network.target docker.service

[Service]
Type=simple
User=\
ExecStart=/usr/local/bin/heron-daemon
Restart=always
Environment=HERON_BACKEND_URL=http://localhost:3000
Environment=HERON_API_KEY=change-me-to-secure-key

[Install]
WantedBy=multi-user.target
EOF'

sudo systemctl daemon-reload
sudo systemctl enable heron-api
sudo systemctl enable heron-daemon
sudo systemctl start heron-api
sudo systemctl start heron-daemon

echo -e "?? Installation Complete! HeronPanel is now running."
echo -e "API: http://localhost:3000"
echo -e "Daemon: localhost:8080"
