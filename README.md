# 🚀 HeronPanel

HeronPanel is a professional management panel designed for server orchestration and monitoring, featuring a high-performance Go-based daemon and a modern Next.js frontend.

## 🛠 Technology Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Node.js, Prisma ORM
- **Database**: PostgreSQL
- **Daemon**: Go (Golang)
- **Infrastructure**: Docker, Systemd

## 📋 Prerequisites

To install HeronPanel, your system should meet the following requirements:
- **OS**: Ubuntu 22.04+ or Debian 11+
- **Hardware**: Minimum 2GB RAM (recommended 4GB+)
- **Privileges**: Root or sudo access

## 🚀 Installation

The easiest way to install HeronPanel is by using the provided installation script.

### 1. Clone the Repository
``git clone HeronPanel/HeronPanel.git && cd HeronPanel && unzip HeronPanel.zip && cd HeronPanel``

### 2. Run the Installer
``bash install.sh``

The script will automatically:
- Update system packages.
- Install Node.js, Go, PostgreSQL, and Docker.
- Configure the backend and compile the daemon.
- Setup systemd services for the API and Daemon.

## ⚙️ Configuration

Before starting the services, configure your environment variables:

1. Copy the example env file:
   ``cp .env.example .env``
  
3. Edit the .env file:
   ``nano .en``

**Key Variables:**
- DATABASE_URL: Your PostgreSQL connection string.
- JWT_SECRET: A strong secret key for authentication.
- DAEMON_API_KEY: The key used for communication between the API and the Daemon.

## 🛠 Service Management

HeronPanel runs as systemd services for maximum reliability.

### API Service
- **Start**: \sudo systemctl start heron-api\
- **Stop**: \sudo systemctl stop heron-api\
- **Restart**: \sudo systemctl restart heron-api\
- **Status**: \sudo systemctl status heron-api\

### Daemon Service
- **Start**: \sudo systemctl start heron-daemon\
- **Stop**: \sudo systemctl stop heron-daemon\
- **Restart**: \sudo systemctl restart heron-daemon\
- **Status**: \sudo systemctl status heron-daemon\

## 📂 Project Structure

- \/backend\: Node.js API and database logic.
- \/frontend\: Next.js user interface.
- \/daemon\: Go-based agent for server-side execution.
- \/config\: System configuration files.
- \/docker\: Dockerfiles and orchestration scripts.
- \/scripts\: Utility scripts for installation and maintenance.

## 🛡️ License
Refer to the LICENSE file for details.
