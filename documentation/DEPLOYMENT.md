# Deployment Guide - Neon Database Only

This guide explains how to deploy your CloudShop application using **Neon PostgreSQL** database.

## Prerequisites

- A GitHub account  
- Your code pushed to a GitHub repository  
- A Neon PostgreSQL account

## 1. Database Setup (Neon PostgreSQL)

**Neon** is a fully managed PostgreSQL database that's perfect for your Python Flask backend.

### Steps:
1. Go to [neon.tech](https://console.neon.tech) and sign up (free).
2. Create a new project.
3. Copy your **connection string** (it will look like: `postgresql://user:password@host:port/database`).
   - Make sure to use the **Pooler** endpoint for better performance.
4. You'll need this for your Flask backend.

## 2. Local Development with Neon

### Set up environment variables:

1. In the `api/` folder, create a `.env` file:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   JWT_SECRET=your-secret-key
   FLASK_ENV=development
   ```

2. Install dependencies:
   ```bash
   cd api
   pip install -r requirements.txt
   ```

3. Run the Flask backend:
   ```bash
   python index.py
   ```
   Your backend will run on `http://localhost:5000`.

## 3. Local Frontend Setup

### For the main React app:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

### For the Community alerts (Next.js):
```bash
cd community-frontend
npm install
npm run dev
```
Runs on `http://localhost:3000`.

## 4. Production Deployment Options

When ready to go live:

### Backend Options:
- **Railway** or **PythonAnywhere** for Flask  
- Use your Neon connection string as `DATABASE_URL`

### Frontend Options:
- **Vercel** (Recommended for React/Vite)
- **Netlify** (Alternative)
- Set `VITE_API_URL` to your production backend URL
6. Click **Deploy**.

## 5. Final Checks

1. Open your deployed Frontend URL.
2. Try to register/login.
3. If you get CORS errors, you might need to update the `cors` configuration in `backend/server.js` to explicitly allow your frontend domain, although the current setup allows all origins (`*`) which works for testing.
