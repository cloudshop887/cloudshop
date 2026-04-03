# Complete Environment Setup for Vercel, Render, and Neon

This guide covers all environment variables needed to get user login, Google login, and community alerts working on production.

---

## 1. NEON DATABASE SETUP ✅

### Step 1: Create/Get Neon Project
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project or use existing one
3. Copy your **DATABASE_URL** (looks like: `postgresql://user:password@host/dbname?sslmode=require`)

---

## 2. RENDER DEPLOYMENT SETUP 🚀

### Step 1: Create Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Create a new **Web Service**
3. Connect your GitHub repository
4. Set the following:
   - **Name**: cloudshop-api
   - **Environment**: Python 3.11
   - **Build Command**: `pip install -r api/requirements.txt && npm install && cd frontend && npm install && npm run build && cd ..`
   - **Start Command**: `cd api && python index.py`
   - **Region**: Choose closest to your users

### Step 2: Set Environment Variables on Render
In the Render dashboard, go to **Environment** and add these variables:

```
# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Flask Configuration
FLASK_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=10000

# CORS & Frontend URL
FRONTEND_URL=https://your-render-deployment-url.onrender.com

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}  # Full JSON content

# Email Configuration (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Step 3: Deploy
Push to GitHub or manually trigger deploy in Render dashboard.

---

## 3. VERCEL DEPLOYMENT SETUP 🔷

### Step 1: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com)
2. Create a new project from GitHub
3. Choose the CloudShop repository

### Step 2: Set Environment Variables on Vercel
In **Project Settings → Environment Variables**, add:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
FLASK_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FRONTEND_URL=https://your-vercel-deployment.vercel.app
```

### Step 3: Update Frontend .env.production for Vercel
Create/Update `frontend/.env.production`:

```
VITE_API_URL=https://your-vercel-deployment.vercel.app/api
VITE_SOCKET_URL=https://your-vercel-deployment.vercel.app
```

---

## 4. FIREBASE SETUP 🔥

### Step 1: Get Firebase Service Account
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (cloud-shop-f7556)
3. Go to **Settings → Service Accounts → Firebase Admin SDK**
4. Click **Generate new private key**
5. Download the JSON file

### Step 2: Encode Service Account for Environment Variables
Since JSON can't be directly pasted in env vars, you need to:

**Option A: Store as single-line JSON**
```bash
# Copy the entire JSON content and remove all newlines
cat serviceAccountKey.json | tr '\n' ' '
```

**Option B: Use base64 encoding** (Recommended for Render)
```bash
# Encode the file
base64 serviceAccountKey.json | tr -d '\n'

# In your app, decode it:
# JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString())
```

### Step 3: Add to Environment Variables
Copy the entire JSON content and paste as `FIREBASE_SERVICE_ACCOUNT`

### Step 4: Update Firebase Config in Frontend
Ensure `frontend/src/config/firebase.js` has correct credentials:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDVM8Zf17Zl6Ug9NEw7VBLLCT1Kahqj8Kk",
    authDomain: "cloud-shop-f7556.firebaseapp.com",
    projectId: "cloud-shop-f7556",
    storageBucket: "cloud-shop-f7556.firebasestorage.app",
    messagingSenderId: "927655980361",
    appId: "1:927655980361:web:b47cf274654abfc680fe98",
    measurementId: "G-YW5512XX0T"
};
```

---

## 5. USER LOGIN & GOOGLE LOGIN FIXES ✅

### Issue: User Login Not Working

**Root Cause**: Missing or incorrect DATABASE_URL

**Fix**:
1. Ensure `DATABASE_URL` is set in all deployment platforms
2. Run migrations on Neon DB:
   ```bash
   cd api
   python -c "from database import db, app; app.app_context().push(); db.create_all()"
   ```

### Issue: Google Login Not Working

**Root Cause**: Firebase not properly configured in backend

**Fix**:
1. Ensure `FIREBASE_SERVICE_ACCOUNT` is properly set
2. Check that Firebase Admin SDK is initialized in `backend/src/config/firebaseAdmin.js`
3. Verify `firebaseAuthController.js` has correct error handling

### Issue: Community Alerts Navigation

**Root Cause**: Navbar was missing in CommunityAlerts.jsx

**Fix**: ✅ Already implemented - Added `<Navbar />` to the component

---

## 6. TESTING CHECKLIST 🧪

After deployment, test these:

- [ ] **User Registration**: Go to `/register` and create a new account
- [ ] **User Login**: Go to `/login` and log in with email/password
- [ ] **Google Login**: Click "Continue with Google" button
- [ ] **Community Alerts**: Click Community Alerts in navbar and view alerts
- [ ] **Post Alert**: Click "Post New Alert" and submit an alert
- [ ] **Real-time Updates**: Alerts should appear in real-time using WebSockets

---

## 7. TROUBLESHOOTING 🛠️

### Error: "DATABASE_URL environment variable is required"
**Solution**: Add `DATABASE_URL` environment variable to your deployment platform

### Error: "Invalid Firebase Token"
**Solution**: 
1. Check `FIREBASE_SERVICE_ACCOUNT` is properly formatted
2. Ensure Firebase Admin SDK can parse the JSON

### Error: "Invalid email or password"
**Solution**:
1. Check if user exists in database: `SELECT * FROM users WHERE email='test@email.com';`
2. Verify password hashing is working (should start with `$2b$` or `$2a$`)

### Error: "Not authorized, no token"
**Solution**:
1. Check that JWT_SECRET is consistent between login and protected routes
2. Ensure token is being stored in localStorage after login

### WebSocket Connection Fails
**Solution**:
1. Check that `VITE_SOCKET_URL` in frontend matches your backend URL
2. Verify CORS is properly configured in backend

---

## 8. QUICK REFERENCE: ALL ENV VARS

### Neon Database
```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

### Render / Vercel / Local
```
FLASK_ENV=production
JWT_SECRET=your-secret-key-here
PORT=10000
FRONTEND_URL=https://your-deployment-url.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

---

## 9. PRODUCTION CHECKLIST

- [ ] All environment variables set on Render
- [ ] All environment variables set on Vercel  
- [ ] Database migrations run on Neon
- [ ] Firebase service account configured
- [ ] Frontend API URLs match backend URLs
- [ ] CORS properly configured in backend
- [ ] Tested user registration and login
- [ ] Tested Google login
- [ ] Tested community alerts
- [ ] WebSockets connected and working

---

## 10. GET HELP

If you encounter issues:
1. Check the backend logs: `renderctl logs --service cloudshop-api --tail 100`
2. Check Vercel logs in the deployment details
3. Test API directly: `curl https://your-backend-url/api/health`
4. Check browser console for frontend errors
5. Verify all environment variables are set correctly

