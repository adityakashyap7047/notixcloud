# Deploy NotiX Cloud to Render

This guide walks you through deploying NotiX Cloud on [Render](https://render.com).

## Architecture

```
┌─────────────────────────────────────────────┐
│              Render Web Service              │
│         (NotiX Cloud Panel - Next.js)        │
│                                              │
│  - Marketing site, Dashboard, Admin panel    │
│  - API routes (no Docker access)             │
│  - Socket.IO for real-time updates           │
└──────────────────┬──────────────────────────┘
                   │ DATABASE_URL
                   ▼
┌─────────────────────────────────────────────┐
│          External MySQL Database             │
│    (PlanetScale / Railway / Any MySQL 8.0)   │
└─────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          Game Server Nodes (Separate)        │
│    - Run the node daemon on each server      │
│    - Docker access for container management  │
│    - Connect to panel via API key            │
└─────────────────────────────────────────────┘
```

**Important:** The panel (web app) does NOT need Docker access. Game servers run on separate machines (nodes) that connect to the panel via the node daemon.

---

## Prerequisites

1. A [Render account](https://render.com) (free tier works)
2. A MySQL database (see options below)
3. Your code pushed to a Git repository (GitHub/GitLab)

---

## Step 1: Set Up MySQL Database

Render doesn't offer managed MySQL, so use one of these:

### Option A: PlanetScale (Recommended - Free Tier)
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a database named `notixcloud`
3. Copy the connection string:
   ```
   mysql://username:password@aws.connect.psdb.cloud/notixcloud?sslaccept=strict
   ```

### Option B: Railway
1. Sign up at [railway.app](https://railway.app)
2. Create a MySQL service
3. Copy the connection string from the Variables tab

### Option C: FreeSQLDatabase
1. Sign up at [freesqldatabase.com](https://freesqldatabase.com)
2. Create a database and copy the connection string

---

## Step 2: Deploy to Render

### Option A: Using render.yaml (Blueprint)

1. Push your code to GitHub/GitLab
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your repository
5. Render will detect `render.yaml` and set up services
6. **Override the DATABASE_URL** in the environment variables with your actual MySQL connection string
7. Deploy

### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub/GitLab repository
4. Configure:
   - **Name:** `notixcloud`
   - **Runtime:** Docker
   - **Dockerfile:** `./Dockerfile`
   - **Plan:** Free (or Starter for production)
5. Add Environment Variables:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `mysql://user:pass@host:3306/notixcloud` |
   | `NEXTAUTH_SECRET` | *(generate a strong secret)* |
   | `NEXTAUTH_URL` | `https://your-app-name.onrender.com` |
   | `DISCORD_CLIENT_ID` | *(optional)* |
   | `DISCORD_CLIENT_SECRET` | *(optional)* |
   | `DEFAULT_NODE_API_KEY` | *(generate a random key)* |

6. Click **Create Web Service**

---

## Step 3: Initialize the Database

Once deployed, you need to push the database schema:

### Option A: Run via Render Shell
1. Go to your Web Service → **Shell** tab
2. Run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Option B: Add a Render Job
1. Create a one-off job service in Render
2. Command: `npx prisma db push`

---

## Step 4: Generate Secrets

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

Generate a DEFAULT_NODE_API_KEY:
```bash
openssl rand -base64 32
```

---

## Step 5: Set Up Game Server Nodes

The panel runs on Render, but game servers run on separate machines:

1. **On each game server machine:**
   - Install Docker
   - Run the node daemon (see `node-daemon.sh` in the repo)
   - The daemon connects to your Render panel via API

2. **Add nodes in the admin panel:**
   - Go to `/admin/nodes`
   - Add each node with its IP, port, and API key
   - Set `DOCKER_HOST` on the node machine to `unix:///var/run/docker.sock`

---

## Step 6: Custom Domain (Optional)

1. In Render, go to **Settings** → **Custom Domains**
2. Add your domain (e.g., `notixcloud.com`)
3. Update `NEXTAUTH_URL` to your custom domain
4. Set up DNS:
   ```
   Type: CNAME
   Name: @
   Value: your-app-name.onrender.com
   ```

---

## Troubleshooting

### Build fails with "prisma generate" error
- Make sure `prisma` is in `devDependencies` in package.json
- The Dockerfile runs `npx prisma generate` before build

### Database connection errors
- Ensure your MySQL host allows connections from Render's IP ranges
- Check the connection string format: `mysql://user:password@host:3306/dbname`
- For PlanetScale, add `?sslaccept=strict` to the URL

### Socket.IO not working
- Render supports WebSockets on all plans
- The panel uses Socket.IO for real-time console output
- Make sure `NEXTAUTH_URL` matches your actual URL

### App shows "Application error"
- Check the Render logs (Logs tab)
- Ensure all environment variables are set
- Verify the database is accessible

### Static assets not loading
- The Dockerfile copies `/public` and `/.next/static` correctly
- If images don't load, check `next.config.ts` remote patterns

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL connection string |
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

## Free Tier Limitations

- **Spin-down:** Free services spin down after 15 min of inactivity
- **Build time:** Limited to 500 GB-hours/month
- **Bandwidth:** 100 GB/month included
- **No Docker socket:** Panel can't manage containers directly (by design - nodes handle that)

For production, upgrade to the **Starter** plan ($7/month) for always-on service.
