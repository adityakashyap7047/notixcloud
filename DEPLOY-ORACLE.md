# Deploy NotiX Cloud on Oracle Cloud Free Tier

Free forever. No credit card required after signup. 4 OCPU ARM + 24 GB RAM.

---

## Step 1: Create Oracle Cloud Account

1. Go to [cloud.oracle.com](https://cloud.oracle.com)
2. Click **Start for Free**
3. Fill in your details and verify email
4. Add a credit/debit card (only for verification — you won't be charged)
5. Choose your **home region** (closest to your players)

---

## Step 2: Create a VM Instance

1. After login, go to the **Oracle Cloud Dashboard**
2. Click **Create a VM** (or navigate: Compute → Instances → Create Instance)

3. Configure:
   - **Name:** `notixcloud`
   - **Image:** Oracle Linux 8 or Ubuntu 22.04 (your choice)
   - **Shape:** Select **Ampere A1 Flex** (ARM-based)
     - Click **Change Shape**
     - Select **Ampere A1 Flex**
     - Set **OCPU:** 4 (always free)
     - Set **RAM:** 24 GB (always free)
   - **VPU/IPs:** Always Free-eligible

4. **SSH Keys:**
   - Click **Generate SSH Key Pair**
   - Download both keys (you'll need them to connect)
   - Or paste your own public key

5. **Boot Volume:**
   - Leave defaults (50 GB is fine)
   - Check **Encrypt this boot volume** (optional)

6. Click **Create**

---

## Step 3: Open Network Ports

1. Go to your instance → **Virtual Cloud Network** → click the VCN name
2. Click **Default Security List** → **Add Ingress Rules**

3. Add these rules:

| Port | Source | Description |
|------|--------|-------------|
| 22 | 0.0.0.0/0 | SSH |
| 80 | 0.0.0.0/0 | HTTP (Caddy) |
| 443 | 0.0.0.0/0 | HTTPS (Caddy) |
| 25565-25575 | 0.0.0.0/0 | Minecraft servers |

---

## Step 4: Connect to Your Server

```bash
# Navigate to where you saved the SSH key
cd ~/Downloads

# Connect (replace with your IP)
ssh -i notixcloud_key opc@YOUR_PUBLIC_IP
```

For Ubuntu images, use `ubuntu` instead of `opc`.

---

## Step 5: Run the Setup Script

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_USER/notixcloud/main/scripts/setup-server.sh | bash
```

Or manually:
```bash
# Clone your repo
cd /opt
sudo git clone https://github.com/YOUR_USER/notixcloud.git
sudo chown -R $USER:$USER /opt/notixcloud
cd /opt/notixcloud

# Run setup
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

---

## Step 6: Configure and Launch

### 1. Edit the .env file
```bash
nano /opt/notixcloud/.env
```

Set these values:
```
NEXTAUTH_URL=https://yourdomain.com
DISCORD_CLIENT_ID=your_discord_id
DISCORD_CLIENT_SECRET=your_discord_secret
```

### 2. Edit the Caddyfile
```bash
nano /opt/notixcloud/Caddyfile
```

Replace `YOUR_DOMAIN` with your actual domain:
```
yourdomain.com {
    reverse_proxy panel:3000
    ...
}
```

### 3. Start everything
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Initialize the database
```bash
docker-compose -f docker-compose.prod.yml exec panel npx prisma db push
```

### 5. Verify it's running
```bash
docker-compose -f docker-compose.prod.yml ps
curl -I https://yourdomain.com
```

---

## Step 7: Point Your Domain

1. Go to your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)
2. Add DNS records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_ORACLE_PUBLIC_IP | Auto |
| A | * | YOUR_ORACLE_PUBLIC_IP | Auto |

3. Wait 5-30 minutes for DNS propagation
4. Caddy will automatically get an SSL certificate

---

## Step 8: Add Game Server Nodes

Now that the panel is running, add your first game server node:

1. Go to `https://yourdomain.com/admin/nodes`
2. Click **Add Node**
3. Fill in:
   - **Name:** `Main Server`
   - **IP:** Your Oracle Cloud IP
   - **Port:** 25565
   - **Daemon Port:** 8443
   - **API Key:** The `NODE_API_KEY` from your .env file
4. The node will register and be ready for server creation

**Note:** The panel and game servers run on the same machine. Docker socket access is shared via the volume mount.

---

## Useful Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f panel

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop everything
docker-compose -f docker-compose.prod.yml down

# Update and rebuild
cd /opt/notixcloud
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# Database backup
docker-compose -f docker-compose.prod.yml exec db mysqldump -u root -p notixcloud > backup.sql

# SSH into the panel container
docker-compose -f docker-compose.prod.yml exec panel sh
```

---

## Troubleshooting

### Caddy isn't getting SSL certificate
- Make sure port 80 is open in Oracle Cloud security list
- Make sure DNS is pointing to your IP
- Check Caddy logs: `docker-compose -f docker-compose.prod.yml logs caddy`

### Panel shows database connection error
- Check MySQL is healthy: `docker-compose -f docker-compose.prod.yml ps`
- Check DATABASE_URL in .env matches the format: `mysql://notixcloud:PASSWORD@db:3306/notixcloud`

### Minecraft servers can't start
- Make sure Docker socket is mounted: check volumes in docker-compose.prod.yml
- Check Docker is running: `docker ps`

### Out of memory
- Oracle Free Tier gives 24 GB RAM — plenty for the panel + several Minecraft servers
- Check usage: `docker stats`
- Adjust Minecraft server RAM allocation in the admin panel

---

## Oracle Cloud Free Tier Limits

| Resource | Always Free |
|----------|-------------|
| OCPU | 4 (Ampere A1) |
| RAM | 24 GB |
| Storage | 200 GB boot + 200 GB block |
| Bandwidth | 10 TB/month |
| Public IP | 1 (reserved) |

This is enough for:
- The NotiX panel
- 5-10 small Minecraft servers (1-2 GB RAM each)
- Or 2-3 large modded servers (4-8 GB RAM each)
