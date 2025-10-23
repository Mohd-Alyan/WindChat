# ⚡ Quick Deploy Reference Card

Ultra-quick reference for deploying WindChat to production.

---

## 🎯 3-Step Deployment

### Step 1: GitHub (2 min)
```bash
git init
git add .
git commit -m "WindChat production"
git remote add origin https://github.com/YOUR_USERNAME/windchat.git
git branch -M main
git push -u origin main
```

### Step 2: Render Backend (5 min)
1. https://dashboard.render.com/ → New + → Web Service
2. Connect GitHub → Select windchat repo
3. Settings:
   - Root: `backend`
   - Build: `npm install`
   - Start: `npm start`
4. Environment:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `FRONTEND_URL=` (add later)
5. Deploy → Copy URL

### Step 3: Vercel Frontend (5 min)
1. https://vercel.com/dashboard → New Project
2. Import windchat from GitHub
3. Settings:
   - Root: `frontend`
   - Framework: Vite
4. Environment:
   - `VITE_SOCKET_URL=https://your-render-url.onrender.com`
5. Deploy → Copy URL

### Step 4: Connect (2 min)
1. Render → Environment → Update:
   - `FRONTEND_URL=https://your-vercel-url.vercel.app`
2. Save → Auto-redeploys

---

## ✅ Verify Deployment

1. Visit your Vercel URL
2. Create a room
3. Join from another device
4. Send messages

---

## 🔧 Environment Variables

### Render (Backend)
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-app.vercel.app
```

### Vercel (Frontend)
```
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## 🚨 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| Can't connect | Check `VITE_SOCKET_URL` uses HTTPS |
| CORS error | Update `FRONTEND_URL` in Render |
| Slow first load | Normal (Render free tier waking up) |
| 404 error | Check root directory settings |

---

## 📱 Test URLs

**Health Check:** `https://your-backend.onrender.com/health`
**Frontend:** `https://your-app.vercel.app`

---

## 💰 Cost

**Free Tier:** $0/month
- Render: 750 hours/month
- Vercel: 100GB bandwidth/month

**Upgraded:** $7/month
- Render always-on (no sleep)

---

## 📚 Full Documentation

- **Complete Guide:** `DEPLOY_GUIDE.md`
- **Checklist:** `PRODUCTION_CHECKLIST.md`
- **Details:** `PRODUCTION_READY.md`

---

**⏱️ Total Time:** ~15 minutes
**💵 Total Cost:** $0 (free tier)
**🌍 Global:** ✅ Works worldwide

**Go deploy! 🚀**
