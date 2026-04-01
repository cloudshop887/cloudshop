# Deploy Python Flask Backend to Railway

## Why Railway instead of Vercel?
- ✅ Native Python/Flask support
- ✅ Perfect for long-running apps (SocketIO works!)
- ✅ Free tier available
- ✅ Easy Neon PostgreSQL integration

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Flask backend ready for deployment"
git push origin main
```

### 2. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- Click "New Project" → "Deploy from GitHub"

### 3. Select Repository
- Choose your `cloud shop` repository
- Railway will auto-detect Python and Flask

### 4. Configure Environment Variables
In Railway Dashboard:
1. Go to **Variables** tab
2. Add these:
   ```
   DATABASE_URL = your-neon-postgresql-url
   JWT_SECRET = generate-one: openssl rand -base64 32
   FLASK_ENV = production
   ```

### 5. Deploy
- Click "Deploy"
- Wait 2-3 minutes
- You'll get a URL like: `https://your-api.railway.app`

### 6. Update Frontend API URL
Edit `frontend/.env.production`:
```
VITE_API_URL=https://your-api.railway.app/api
```

Then redeploy frontend on Vercel.

### 7. Test
```bash
curl https://your-api.railway.app/api/health
# Should return: {"status":"healthy","database":"connected"}
```

## Getting Neon Database URL
1. Go to [neon.tech](https://console.neon.tech)
2. Create a new project
3. Copy the **Pooled Connection URL** (not default connection)
4. Should look like: `postgresql://user:pass@xyz.neon.tech/dbname`

## Troubleshooting
- Check logs in Railway dashboard
- Ensure `api/requirements.txt` has all dependencies
- Database URL must use `postgresql://` (not `postgres://`)

Done! Your Flask backend will be live in minutes. 🚀
