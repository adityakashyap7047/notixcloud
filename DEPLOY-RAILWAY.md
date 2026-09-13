# Deploy NotiX Cloud to Railway

This guide walks you through deploying NotiX Cloud on [Railway](https://railway.app).

## Architecture

```
┌─────────────────────────────────────────────┐
│            Railway Web Service              │
│       (NotiX Cloud Panel - Next.js)         │
│                                             │
│  - Marketing site, Dashboard, Admin panel   │
│  - API routes                               │
│  - Socket.IO for real-time updates          │
└──────────────────┬──────────────────────────┘
                   │ DATABASE_URL
                   ▼
┌─────────────────────────────────────────────┐
│        Railway Managed MySQL 8.0            │
│    (auto-provisioned, connection string)    │
└─────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Game Server Nodes (Separate)        │
│   - Run the node daemon on each server      │
│   - Docker access for container management  │
│   - Connect to panel via API key            │
└─────────────────────────────────────────────┘
```

**Important:** The panel (web app) does NOT need Docker access. Game servers run on separate machines (nodes) that connect to the panel via the node daemon.

---

## Prerequisites

1. A [Railway account](https://railway.app) (no credit card needed for trial)
2. Your code pushed to a Git repository (GitHub/GitLab)

---

## Step 1: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click **Login** and sign up with GitHub (no credit card required)
3. You get a **$5 free trial credit** (lasts ~30 days)
4. After trial: **$1/month** free tier continues

---

## Step 2: Create a New Project

1. On the Railway dashboard, click **New Project**
2. Select **Empty Project**
3. Name it `notixcloud`

---

## Step 3: Add MySQL Database

1. Inside your project, click **+ New**
2. Select **Database** → **MySQL**
3. Railway auto-provisions MySQL 8.0
4. Click on the MySQL service → **Variables** tab
5. Copy the `DATABASE_URL` value (it looks like):
   ```
   mysql://username:password@mysql.railway.internal:3306/railway
   ```
6. **Save this** — you'll need it in the next step

---

## Step 4: Deploy the Web Service

### Option A: Deploy from GitHub (Recommended)

1. Click **+ New** in your project
2. Select **GitHub Repo**
3. Connect your GitHub account if not already connected
4. Select your `notixcloud` repository
5. Railway detects the `Dockerfile` and `railway.json` automatically
6. Click **Deploy**

### Option B: Deploy via Railway CLI

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```
2. Login:
   ```bash
   railway login
   ```
3. Link to your project:
   ```bash
   railway link
   ```
4. Deploy:
   ```bash
   railway up
   ```

---

## Step 5: Set Environment Variables

1. Click on your **web service** (not the MySQL service)
2. Go to the **Variables** tab
3. Add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(paste the MySQL connection string from Step 3)* |
| `NEXTAUTH_SECRET` | *(generate one — see below)* |
| `NEXTAUTH_URL` | `https://your-app.up.railway.app` |
| `DISCORD_CLIENT_ID` | *(optional — leave empty)* |
| `DISCORD_CLIENT_SECRET` | *(optional — leave empty)* |
| `DEFAULT_NODE_API_KEY` | *(generate one — see below)* |

### Generate Secrets

Run these in your terminal:
```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# DEFAULT_NODE_API_KEY
openssl rand -base64 32
```

Or use an online generator and paste the values.

---

## Step 6: Initialize the Database

After the first deploy succeeds:

1. Go to your **web service**
2. Click the **Shell** tab (or **Deployments** → latest → **View Logs**)
3. Run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. This creates all tables in your MySQL database

### Alternative: Add a deploy command

You can add this to your `railway.json` to auto-run on deploy:
```json
{
  "deploy": {
    "startCommand": "npx prisma generate && npx prisma db push && npx tsx server.ts"
  }
}
```

---

## Step 7: Set Up Game Server Nodes

The panel runs on Railway, but game servers run on separate machines:

1. **On each game server machine:**
   - Install Docker
   - Run the node daemon (see `node-daemon.sh` in the repo)
   - The daemon connects to your Railway panel via API

2. **Add nodes in the admin panel:**
   - Go to `/admin/nodes`
   - Click **Add Node**
   - Enter the node's public IP, port (25565-25575), and API key
   - The node daemon must be running on the game server machine

---

## Step 8: Custom Domain (Optional)

1. In your web service, go to **Settings** → **Networking**
2. Click **Generate Domain** for a free `*.up.railway.app` URL
3. Or click **Custom Domain** and add your domain
4. Update `NEXTAUTH_URL` to match your domain
5. Railway auto-provisions HTTPS certificates

### DNS Setup for Custom Domain

```
Type: CNAME
Name: @
Value: your-app.up.railway.app
```

---

## Troubleshooting

### Build fails
- Check that `Dockerfile` is in the root of your repo
- Railway logs will show the exact build error
- Make sure `package.json` has the correct `build` script

### Database connection errors
- Ensure `DATABASE_URL` uses the internal host: `mysql.railway.internal`
- Do NOT use an external IP — Railway services communicate internally
- Check that the MySQL service is running (green status)

### Socket.IO not working
- Railway supports WebSockets on all plans
- Make sure `NEXTAUTH_URL` matches your actual URL exactly

### App crashes on start
- Check the **Deployments** → latest → **View Logs**
- Ensure all environment variables are set
- Verify `npx prisma generate` ran successfully

###冷启动 (Cold Start)
- Railway services don't sleep like Render
- First request after deployment may take 10-15 seconds
- Subsequent requests are fast

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL connection string from Railway |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT encryption |
| `NEXTAUTH_URL` | Yes | Your app's public URL |
| `DISCORD_CLIENT_ID` | No | Discord OAuth client ID |
| `DISCORD_CLIENT_SECRET` | No | Discord OAuth client secret |
| `DOCKER_HOST` | No | Docker socket (not needed on panel) |
| `DEFAULT_NODE_API_KEY` | Yes | API key for node authentication |
| `SMTP_HOST` | No | Email server host |
| `SMTP_PORT` | No | Email server port |
| `SMTP_USER` | No | Email username |
| `SMTP_PASS` | No | Email password |

---

## Pricing

| Phase | Cost | What You Get |
|-------|------|--------------|
| Free Trial | $0 (30 days) | $5 credit, 1 vCPU, 1 GB RAM |
| Free Tier | $1/month | $1 credit, 1 vCPU, 0.5 GB RAM |
| Hobby | $5/month | $5 credit, up to 48 vCPU, 48 GB RAM |

**Note:** Railway charges per-second for actual CPU/memory usage. The $1/month free tier covers small apps easily.

---

## Useful Commands

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Open in browser
railway open

# View logs
railway logs

# Run command in production
railway shell

# Deploy
railway up
```
