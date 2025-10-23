# WindChat Deployment Guide

This guide covers deploying WindChat to production using Fly.io (backend) and Vercel (frontend).

## Prerequisites

- GitHub/GitLab account (optional but recommended)
- Fly.io account (free tier available)
- Vercel account (free tier available)
- Domain name (optional)

## Architecture

```
┌──────────────┐                    ┌─────────────┐
│              │                    │             │
│   Vercel     │◄──── WebSocket ───►│   Fly.io    │
│  (Frontend)  │      Socket.IO     │  (Backend)  │
│              │                    │             │
└──────────────┘                    └─────────────┘
```

## Backend Deployment (Fly.io)

### Step 1: Install Fly CLI

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login to Fly.io

```bash
fly auth login
```

### Step 3: Navigate to Backend

```bash
cd backend
```

### Step 4: Launch App

```bash
fly launch
```

You'll be prompted:
- **App name**: Choose a unique name (e.g., `windchat-backend`)
- **Region**: Choose closest to your users
- **Database**: No
- **Redis**: No

### Step 5: Configure fly.toml

The `fly.toml` is already configured, but verify these settings:

```toml
app = "your-app-name"
primary_region = "iad"  # Change to your preferred region

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
```

### Step 6: Set Environment Variables

```bash
fly secrets set FRONTEND_URL=https://your-frontend.vercel.app
```

### Step 7: Deploy

```bash
fly deploy
```

### Step 8: Verify Deployment

```bash
fly open
fly logs
```

Your backend URL will be: `https://your-app-name.fly.dev`

## Frontend Deployment (Vercel)

### Method 1: Vercel CLI

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Navigate to Frontend

```bash
cd frontend
```

#### Step 3: Deploy

```bash
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Link to existing project**: No
- **Project name**: windchat-frontend
- **Directory**: ./
- **Override settings**: No

#### Step 4: Set Environment Variables

```bash
vercel env add VITE_SOCKET_URL
```

Enter your Fly.io backend URL: `https://your-app-name.fly.dev`

#### Step 5: Deploy to Production

```bash
vercel --prod
```

### Method 2: Vercel Dashboard (Recommended)

#### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/windchat.git
git push -u origin main
```

#### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Step 3: Add Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
   - **Name**: `VITE_SOCKET_URL`
   - **Value**: `https://your-app-name.fly.dev`
   - **Environment**: Production, Preview, Development

#### Step 4: Deploy

Click "Deploy" - Vercel will automatically build and deploy.

## Post-Deployment

### Update Backend with Frontend URL

Once your frontend is deployed:

```bash
cd backend
fly secrets set FRONTEND_URL=https://your-app.vercel.app
```

### Test the Deployment

1. Open your Vercel URL
2. Create a room
3. Open another browser/device with the same room key
4. Test messaging
5. Verify encryption is working
6. Test admin features

## Custom Domain (Optional)

### Frontend (Vercel)

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed
4. Update backend CORS:
   ```bash
   fly secrets set FRONTEND_URL=https://yourdomain.com
   ```

### Backend (Fly.io)

1. Add certificate:
   ```bash
   fly certs add api.yourdomain.com
   ```
2. Update DNS:
   - Type: CNAME
   - Name: api
   - Value: your-app-name.fly.dev

3. Update frontend environment:
   ```bash
   vercel env add VITE_SOCKET_URL production
   # Enter: https://api.yourdomain.com
   ```

## Monitoring & Maintenance

### Fly.io Monitoring

```bash
# View logs
fly logs

# Check status
fly status

# Scale (if needed)
fly scale count 2

# View metrics
fly dashboard
```

### Vercel Monitoring

- Go to Vercel Dashboard
- View Analytics, Logs, and Performance

### Health Checks

Backend health endpoint: `https://your-app-name.fly.dev/health`

### Update Deployment

**Backend:**
```bash
cd backend
git pull  # if using git
fly deploy
```

**Frontend (with Vercel GitHub integration):**
- Simply push to your repository
- Vercel auto-deploys on push

**Frontend (with CLI):**
```bash
cd frontend
vercel --prod
```

## Troubleshooting

### CORS Errors

**Problem**: Frontend can't connect to backend

**Solution**:
```bash
cd backend
fly secrets set FRONTEND_URL=https://your-exact-frontend-url.vercel.app
fly deploy
```

### WebSocket Connection Issues

**Problem**: Socket.IO not connecting

**Solution**:
1. Verify backend is running: `fly status`
2. Check logs: `fly logs`
3. Test health endpoint
4. Ensure HTTPS is used in production

### Environment Variables Not Working

**Problem**: App not reading environment variables

**Solution**:
- Frontend: Re-deploy after adding env vars
- Backend: Verify secrets with `fly secrets list`

### Build Failures

**Frontend**:
```bash
# Locally test build
cd frontend
npm run build
```

**Backend**:
```bash
# Check dependencies
cd backend
npm install
npm start
```

## Security Checklist

- [ ] Environment variables set correctly
- [ ] CORS configured with specific frontend URL
- [ ] HTTPS enabled (automatic on Fly.io and Vercel)
- [ ] No sensitive data in code
- [ ] `.env` files in `.gitignore`
- [ ] Rate limiting enabled (optional)

## Cost Optimization

### Fly.io (Backend)
- Free tier: 3 shared CPU VMs
- Auto-stop machines when idle
- Scale down to 1 instance for low traffic

### Vercel (Frontend)
- Free tier: Unlimited deployments
- 100GB bandwidth/month
- No credit card required

## Scaling

### Horizontal Scaling (Fly.io)

```bash
# Scale to 2 instances
fly scale count 2

# Scale to different regions
fly regions add lhr sin
```

### Vertical Scaling (Fly.io)

```bash
# Upgrade VM size
fly scale vm shared-cpu-2x
```

## Backup & Recovery

### Code Backup
- Use Git/GitHub for version control
- Tag releases: `git tag v1.0.0`

### Database Backup
- Not applicable (in-memory only)
- Consider adding Redis for persistence

## Support

- Fly.io Docs: https://fly.io/docs
- Vercel Docs: https://vercel.com/docs
- Socket.IO Docs: https://socket.io/docs

---

## Quick Deploy Commands

**Complete deployment from scratch:**

```bash
# Backend
cd backend
fly launch
fly secrets set FRONTEND_URL=https://your-frontend-url.vercel.app
fly deploy

# Frontend
cd frontend
vercel
vercel env add VITE_SOCKET_URL
# Enter: https://your-backend.fly.dev
vercel --prod
```

**Re-deploy after changes:**

```bash
# Backend
cd backend && fly deploy

# Frontend (if using GitHub)
git push origin main  # Auto-deploys

# Frontend (if using CLI)
cd frontend && vercel --prod
```

---

**Happy deploying! 🚀**
