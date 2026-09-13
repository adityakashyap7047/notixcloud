#!/bin/bash
set -e

echo "==================================="
echo "  NotiXCloud VPS Setup Script"
echo "==================================="

PANEL_DOMAIN="${1:-localhost}"

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "[*] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "[+] Docker installed"
else
    echo "[+] Docker already installed"
fi

# Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
    echo "[*] Installing Docker Compose plugin..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
    echo "[+] Docker Compose installed"
else
    echo "[+] Docker Compose already installed"
fi

# Install jq (needed by daemon)
if ! command -v jq &> /dev/null; then
    echo "[*] Installing jq..."
    sudo apt-get install -y jq curl
    echo "[+] jq installed"
else
    echo "[+] jq already installed"
fi

# Install Node.js (needed for prisma)
if ! command -v node &> /dev/null; then
    echo "[*] Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "[+] Node.js installed"
else
    echo "[+] Node.js already installed"
fi

# Setup project
echo "[*] Setting up NotiXCloud..."
cd /opt/notixcloud 2>/dev/null || {
    echo "[!] Project not found at /opt/notixcloud"
    echo "    Please clone your repo first:"
    echo "    sudo mkdir -p /opt/notixcloud"
    echo "    sudo git clone <your-repo> /opt/notixcloud"
    exit 1
}

# Generate secrets if .env.production exists
if [ -f ".env.production" ]; then
    cp .env.production .env
    echo "[+] Using .env.production"
fi

# Build and start
echo "[*] Building containers..."
docker compose up -d --build

echo "[*] Waiting for MySQL to be ready..."
sleep 15

echo "[*] Pushing database schema..."
DATABASE_URL="mysql://notixcloud:${DB_PASSWORD:-notixcloud_pass_2024}@localhost:3306/notixcloud" \
    npx prisma db push --accept-data-loss 2>/dev/null || echo "[!] Schema push skipped"

echo ""
echo "==================================="
echo "  Setup Complete!"
echo "==================================="
echo ""
echo "  Panel: http://$(hostname -I | awk '{print $1}'):3000"
echo "  phpMyAdmin: http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo "  Next steps:"
echo "  1. Open panel in browser"
echo "  2. Register admin account"
echo "  3. Add node in /admin/nodes"
echo "  4. Start the daemon:"
echo "     bash /opt/notixcloud/node-daemon.sh &"
echo ""
