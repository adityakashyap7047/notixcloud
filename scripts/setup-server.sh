#!/bin/bash
# ============================================
# NotiX Cloud — Oracle Cloud Setup Script
# Run this on a fresh Ubuntu/Oracle Linux instance
# ============================================

set -e

echo "========================================="
echo "  NotiX Cloud — Server Setup"
echo "========================================="

# --- 1. Update system ---
echo "[1/8] Updating system..."
sudo apt-get update -y
sudo apt-get upgrade -y

# --- 2. Install Docker ---
echo "[2/8] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker $USER
    echo "Docker installed. You may need to log out and back in for group changes."
else
    echo "Docker already installed."
fi

# --- 3. Install Docker Compose ---
echo "[3/8] Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed."
else
    echo "Docker Compose already installed."
fi

# --- 4. Create project directory ---
echo "[4/8] Setting up project..."
sudo mkdir -p /opt/notixcloud
sudo chown $USER:$USER /opt/notixcloud

# --- 5. Generate secure passwords ---
echo "[5/8] Generating secrets..."
DB_ROOT_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 40)
NODE_API_KEY=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 40)

echo ""
echo "========================================="
echo "  SAVE THESE SECRETS!"
echo "========================================="
echo "DB_ROOT_PASSWORD=$DB_ROOT_PASSWORD"
echo "DB_PASSWORD=$DB_PASSWORD"
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
echo "NODE_API_KEY=$NODE_API_KEY"
echo "========================================="
echo ""

# --- 6. Create .env file ---
echo "[6/8] Creating .env file..."
cat > /opt/notixcloud/.env << EOF
# Database
DB_ROOT_PASSWORD=$DB_ROOT_PASSWORD
DB_PASSWORD=$DB_PASSWORD

# NextAuth
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=https://YOUR_DOMAIN

# Discord OAuth (optional — fill in if you have it)
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Node API Key
DEFAULT_NODE_API_KEY=$NODE_API_KEY
EOF

echo ".env file created at /opt/notixcloud/.env"
echo "EDIT THIS FILE to set your domain and Discord credentials!"

# --- 7. Create Caddyfile ---
echo "[7/8] Creating Caddyfile..."
cat > /opt/notixcloud/Caddyfile << 'EOF'
YOUR_DOMAIN {
    reverse_proxy panel:3000

    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
        -Server
    }

    encode gzip
}
EOF

echo "Caddyfile created. Edit /opt/notixcloud/Caddyfile to set YOUR_DOMAIN."

# --- 8. Open firewall ports ---
echo "[8/8] Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 25565:25575/tcp  # Minecraft server ports
    sudo ufw --force enable
    echo "Firewall configured."
else
    echo "ufw not found. Make sure ports 80, 443, and 25565-25575 are open."
fi

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Clone your repo into /opt/notixcloud:"
echo "   cd /opt/notixcloud"
echo "   git clone https://github.com/YOUR_USER/notixcloud.git ."
echo ""
echo "2. Edit the .env file:"
echo "   nano /opt/notixcloud/.env"
echo "   - Set NEXTAUTH_URL to your domain"
echo "   - Set DISCORD credentials (optional)"
echo ""
echo "3. Edit the Caddyfile:"
echo "   nano /opt/notixcloud/Caddyfile"
echo "   - Replace YOUR_DOMAIN with your actual domain"
echo ""
echo "4. Start the services:"
echo "   cd /opt/notixcloud"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "5. Initialize the database:"
echo "   docker-compose -f docker-compose.prod.yml exec panel npx prisma db push"
echo ""
echo "6. Access your panel at https://YOUR_DOMAIN"
echo "========================================="
