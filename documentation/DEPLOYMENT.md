# Deployment Guide

This guide explains how to deploy your CloudShop application for free using popular services.

## 1. Prerequisites

- A GitHub account.
- Your code pushed to a GitHub repository.
- A cloud database (MySQL).

## 2. Database Deployment (MySQL)

Since your app uses MySQL, you need a cloud-hosted database.
**Options:**
- **Railway (Recommended for ease):** Create a new project -> Add Database -> MySQL.
- **PlanetScale:** Excellent for scaling, but check free tier availability.
- **Aiven:** Offers a free MySQL tier.

**After creating the database:**
- Get the **Connection URL** (e.g., `mysql://user:password@host:port/database`).
- You will need this for the Backend deployment.

## 3. Backend Deployment (Node.js/Express)

We recommend **Render** or **Railway** for the backend because they support long-running Node.js processes (unlike Vercel/Netlify which are optimized for frontend/serverless).

### Option A: Render (Free Tier)
1. Sign up at [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Environment Variables:**
   - `DATABASE_URL`: (Paste your MySQL connection string from Step 2)
   - `JWT_SECRET`: (Create a strong random string)
   - `PORT`: (Render sets this automatically, but your code supports it)

### Option B: Railway
1. Sign up at [railway.app](https://railway.app).
2. Create a new project from your GitHub repo.
3. Configure the `backend` service variables (`DATABASE_URL`, `JWT_SECRET`).

### Important: Prisma Setup
For both Render and Railway, we added a `postinstall` script to `package.json` that runs `prisma generate`. This ensures the Prisma Client is generated for the production environment.

**Database Migrations:**
- **Render:** You can add a "Build Command" or "Pre-Deploy Command" of `npm run migrate` to apply database changes automatically. Or, you can manually run this command in the Render shell.
- **Railway:** You can add a deploy trigger or run `npm run migrate` in the command palette.

**After deployment:**
- Copy the **Backend URL** (e.g., `https://cloudshop-backend.onrender.com`).

## 4. Frontend Deployment (Vercel/Netlify)

Now deploy the React frontend.

### Option A: Vercel (Recommended)
1. Sign up at [vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Settings:
   - **Framework Preset:** Vite (should be auto-detected).
   - **Root Directory:** `frontend`
5. **Environment Variables:**
   - `VITE_API_URL`: (Paste your **Backend URL** from Step 3, e.g., `https://cloudshop-backend.onrender.com/api`)
     *Note: Make sure to include `/api` at the end if your backend routes expect it.*
6. Click **Deploy**.

### Option B: Netlify
1. Sign up at [netlify.com](https://netlify.com).
2. **Add new site** -> **Import from existing project**.
3. Connect GitHub.
4. Settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. **Environment Variables:**
   - `VITE_API_URL`: (Paste your **Backend URL**)
6. Click **Deploy**.

## 5. Final Checks

1. Open your deployed Frontend URL.
2. Try to register/login.
3. If you get CORS errors, you might need to update the `cors` configuration in `backend/server.js` to explicitly allow your frontend domain, although the current setup allows all origins (`*`) which works for testing.
