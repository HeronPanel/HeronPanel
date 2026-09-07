#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# HeronPanel 5.2 universal installer
# Supports:
#   1) Local extracted project: sudo bash install.sh
#   2) GitHub repo: sudo HERONPANEL_REPO=https://github.com/OWNER/REPO.git bash install.sh
#   3) ZIP URL: sudo HERONPANEL_ZIP=https://.../HeronPanel.zip bash install.sh
# Optional:
#   HERON_USER=heronpanel HERON_DIR=/opt/heronpanel PANEL_PORT=3000 bash install.sh
#   INSTALL_NGINX=1 DOMAIN=panel.example.com bash install.sh
#   INSTALL_JAVA=1 JAVA_PACKAGE=openjdk-21-jre-headless bash install.sh

APP_NAME="HeronPanel"
APP_VERSION="5.2.0"
HERON_USER="${HERON_USER:-heronpanel}"
HERON_DIR="${HERON_DIR:-/opt/heronpanel}"
PANEL_PORT="${PANEL_PORT:-3000}"
DOMAIN="${DOMAIN:-}"
INSTALL_NGINX="${INSTALL_NGINX:-0}"
INSTALL_JAVA="${INSTALL_JAVA:-1}"
JAVA_PACKAGE="${JAVA_PACKAGE:-openjdk-21-jre-headless}"
HERONPANEL_REPO="${HERONPANEL_REPO:-}"
HERONPANEL_ZIP="${HERONPANEL_ZIP:-}"
SOURCE_DIR="${SOURCE_DIR:-}"

log(){ printf '\033[1;32m[HeronPanel]\033[0m %s\n' "$*"; }
warn(){ printf '\033[1;33m[WARNING]\033[0m %s\n' "$*" >&2; }
die(){ printf '\033[1;31m[ERROR]\033[0m %s\n' "$*" >&2; exit 1; }
trap 'die "Installation failed at line $LINENO. Check the message above."' ERR

[[ "$(id -u)" -eq 0 ]] || die "Run as root or with sudo."
command -v apt-get >/dev/null 2>&1 || die "This installer currently supports Debian/Ubuntu (apt)."

. /etc/os-release || true
log "Installing ${APP_NAME} ${APP_VERSION} on ${PRETTY_NAME:-Linux}"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl wget git unzip tar gzip build-essential sudo openssl

# Node.js >= 18.17. Use NodeSource only when existing Node is absent/too old.
node_ok=0
if command -v node >/dev/null 2>&1; then
  node_major="$(node -p 'process.versions.node.split(".")[0]')"
  node_minor="$(node -p 'process.versions.node.split(".")[1]')"
  if (( node_major > 18 || (node_major == 18 && node_minor >= 17) )); then node_ok=1; fi
fi
if (( node_ok == 0 )); then
  log "Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

if (( INSTALL_JAVA == 1 )); then
  if ! command -v java >/dev/null 2>&1; then
    log "Installing Java runtime (${JAVA_PACKAGE})..."
    apt-get install -y "$JAVA_PACKAGE"
  fi
fi

# Useful Linux CPU enforcement helper. HeronPanel works without it; systemd/cgroups remains the stronger isolation layer.
if ! command -v cpulimit >/dev/null 2>&1; then
  apt-get install -y cpulimit || warn "cpulimit package unavailable; CPU limit enforcement will be unavailable."
fi

# Create service account.
if ! id "$HERON_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir "$HERON_DIR" --shell /usr/sbin/nologin "$HERON_USER"
fi
mkdir -p "$HERON_DIR"

# Determine application source.
TMP="$(mktemp -d)"
cleanup(){ rm -rf "$TMP"; }
trap cleanup EXIT

if [[ -n "$SOURCE_DIR" ]]; then
  [[ -d "$SOURCE_DIR" ]] || die "SOURCE_DIR does not exist: $SOURCE_DIR"
  log "Installing from SOURCE_DIR=$SOURCE_DIR"
  rsync -a --delete --exclude node_modules --exclude .git "$SOURCE_DIR/" "$HERON_DIR/" 2>/dev/null || {
    cp -a "$SOURCE_DIR/." "$HERON_DIR/"
    rm -rf "$HERON_DIR/node_modules"
  }
elif [[ -n "$HERONPANEL_REPO" ]]; then
  log "Cloning HeronPanel from $HERONPANEL_REPO"
  rm -rf "$TMP/repo"
  git clone --depth 1 "$HERONPANEL_REPO" "$TMP/repo"
  cp -a "$TMP/repo/." "$HERON_DIR/"
elif [[ -n "$HERONPANEL_ZIP" ]]; then
  log "Downloading HeronPanel ZIP..."
  curl -fL --retry 3 --retry-delay 2 "$HERONPANEL_ZIP" -o "$TMP/heronpanel.zip"
  mkdir -p "$TMP/unpack"
  unzip -q "$TMP/heronpanel.zip" -d "$TMP/unpack"
  candidate="$TMP/unpack"
  # Handle ZIPs with a single top-level folder.
  entries=("$TMP/unpack"/*)
  if (( ${#entries[@]} == 1 )) && [[ -d "${entries[0]}" ]] && [[ -f "${entries[0]}/package.json" ]]; then candidate="${entries[0]}"; fi
  [[ -f "$candidate/package.json" ]] || die "ZIP does not contain package.json at its project root."
  cp -a "$candidate/." "$HERON_DIR/"
elif [[ -f "$(pwd)/package.json" ]]; then
  log "Installing current project from $(pwd)"
  cp -a "$(pwd)/." "$HERON_DIR/"
  rm -rf "$HERON_DIR/node_modules"
else
  die "No source found. Set HERONPANEL_REPO, HERONPANEL_ZIP, or SOURCE_DIR, or run inside the HeronPanel project."
fi

[[ -f "$HERON_DIR/package.json" ]] || die "package.json missing after source installation."
[[ -f "$HERON_DIR/server.js" ]] || die "server.js missing after source installation."
[[ -d "$HERON_DIR/public" ]] || die "public/ missing after source installation."

# Preserve runtime data if reinstalling; ensure required dirs exist.
mkdir -p "$HERON_DIR"/{Users,Servers,Backups,Jobs,Metrics,Crashes}
[[ -f "$HERON_DIR/settings.json" ]] || printf '%s\n' '{"panelName":"HeronPanel","registrationEnabled":true}' > "$HERON_DIR/settings.json"
[[ -f "$HERON_DIR/schedules.json" ]] || printf '%s\n' '[]' > "$HERON_DIR/schedules.json"
[[ -f "$HERON_DIR/audit.log" ]] || touch "$HERON_DIR/audit.log"

cd "$HERON_DIR"
log "Installing npm dependencies..."
npm install --omit=dev --no-audit --no-fund

# Validate syntax before service creation.
node --check server.js

# Secure permissions: application code readable, runtime data writable by service user.
chown -R "$HERON_USER":"$HERON_USER" "$HERON_DIR"
find "$HERON_DIR" -type d -exec chmod 750 {} +
find "$HERON_DIR" -type f -exec chmod 640 {} +
chmod 750 "$HERON_DIR/server.js"
[[ -f "$HERON_DIR/.jwt-secret" ]] && chmod 600 "$HERON_DIR/.jwt-secret" || true

# Generate a strong JWT secret once. Existing secret is preserved on upgrades.
if [[ ! -s "$HERON_DIR/.jwt-secret" ]]; then
  umask 077
  openssl rand -hex 48 > "$HERON_DIR/.jwt-secret"
  chown "$HERON_USER":"$HERON_USER" "$HERON_DIR/.jwt-secret"
  chmod 600 "$HERON_DIR/.jwt-secret"
fi

# Default environment file. Do not put an admin password in this file.
cat > "$HERON_DIR/.env" <<EOF_ENV
NODE_ENV=production
HOST=0.0.0.0
PORT=${PANEL_PORT}
# Optional: override the persisted .jwt-secret with a secret from your secret manager.
# JWT_SECRET=
# Optional for public deployment. Set to your exact HTTPS panel origin.
# ALLOWED_ORIGIN=https://${DOMAIN:-panel.example.com}
EOF_ENV
chown "$HERON_USER":"$HERON_USER" "$HERON_DIR/.env"
chmod 600 "$HERON_DIR/.env"

# systemd unit. Runtime directory is fully controlled by HeronPanel user.
cat > /etc/systemd/system/heronpanel.service <<EOF_SERVICE
[Unit]
Description=HeronPanel Minecraft Hosting Panel
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${HERON_USER}
Group=${HERON_USER}
WorkingDirectory=${HERON_DIR}
EnvironmentFile=-${HERON_DIR}/.env
ExecStart=/usr/bin/node ${HERON_DIR}/server.js
Restart=on-failure
RestartSec=5
TimeoutStopSec=45
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true
ReadWritePaths=${HERON_DIR}
LimitNOFILE=65535
UMask=0077

[Install]
WantedBy=multi-user.target
EOF_SERVICE

systemctl daemon-reload
systemctl enable heronpanel
systemctl restart heronpanel
sleep 2
systemctl --no-pager --full status heronpanel || true

# Local health check.
if curl -fsS --max-time 10 "http://127.0.0.1:${PANEL_PORT}/" >/dev/null; then
  log "Panel is responding on http://127.0.0.1:${PANEL_PORT}"
else
  journalctl -u heronpanel -n 80 --no-pager || true
  die "HeronPanel did not answer on port ${PANEL_PORT}."
fi

# Firewall: panel HTTP/HTTPS and Minecraft Java default/custom range.
if command -v ufw >/dev/null 2>&1; then
  apt-get install -y ufw >/dev/null 2>&1 || true
  ufw allow OpenSSH >/dev/null 2>&1 || true
  if (( INSTALL_NGINX == 1 )); then
    ufw allow 'Nginx Full' >/dev/null 2>&1 || true
  else
    ufw allow "${PANEL_PORT}/tcp" >/dev/null 2>&1 || true
  fi
  # HeronPanel defaults to 25565-26500. Open this range for Minecraft servers.
  ufw allow 25565:26500/tcp >/dev/null 2>&1 || true
  # Only enable UFW when it is inactive and SSH rule exists.
  if ! ufw status | grep -q '^Status: active'; then
    ufw --force enable >/dev/null 2>&1 || warn "Could not enable UFW automatically."
  fi
fi

# Optional Nginx reverse proxy + HTTPS certificate.
if (( INSTALL_NGINX == 1 )); then
  [[ -n "$DOMAIN" ]] || die "INSTALL_NGINX=1 requires DOMAIN=panel.example.com"
  apt-get install -y nginx
  cat > /etc/nginx/sites-available/heronpanel <<EOF_NGINX
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:${PANEL_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
EOF_NGINX
  ln -sfn /etc/nginx/sites-available/heronpanel /etc/nginx/sites-enabled/heronpanel
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl enable nginx
  systemctl reload nginx

  if ! command -v certbot >/dev/null 2>&1; then
    apt-get install -y certbot python3-certbot-nginx
  fi
  log "Requesting Let's Encrypt certificate for ${DOMAIN}..."
  certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email -d "$DOMAIN" --redirect
  nginx -t
  systemctl reload nginx
fi

# Print Java and network diagnostics useful for first server creation.
log "Installation completed successfully."
echo
echo "============================================================"
echo " HeronPanel ${APP_VERSION} installed"
echo "============================================================"
echo " Install directory : ${HERON_DIR}"
echo " Service            : heronpanel"
echo " Panel port         : ${PANEL_PORT}"
if (( INSTALL_NGINX == 1 )); then
  echo " Panel URL           : https://${DOMAIN}"
else
  echo " Panel URL           : http://SERVER_IP:${PANEL_PORT}"
fi
echo " Java                : $(java -version 2>&1 | head -n1 || true)"
echo " Minecraft ports     : 25565-26500/tcp"
echo
echo "Useful commands:"
echo "  systemctl status heronpanel"
echo "  journalctl -u heronpanel -f"
echo "  systemctl restart heronpanel"
echo "  ss -lntp | grep -E ':${PANEL_PORT}|:25565'"
echo
echo "IMPORTANT: On first boot set your admin bootstrap environment before creating the admin account:"
echo "  systemctl edit heronpanel"
echo "Then add: Environment=ADMIN_PASSWORD=YOUR_STRONG_PASSWORD"
echo "and restart the service. Never commit the password to GitHub."
echo "============================================================"
