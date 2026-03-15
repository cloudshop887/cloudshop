# 🔐 Google OAuth Setup Guide

## Step 1: Install Required Packages

Run this command in PowerShell (with admin rights) or use CMD:

```bash
cd backend
npm install passport passport-google-oauth20
```

**If you get a PowerShell execution policy error**, use CMD instead or run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Step 2: Get Google OAuth Credentials

### A. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name it (e.g., "CloudShop Auth") → Click **"Create"**

### B. Enable Google+ API
1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### C. Create OAuth Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure the **OAuth consent screen**:
   - User Type: **External**
   - App name: **CloudShop**
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"** through all steps
   
4. Back to **"Create OAuth client ID"**:
   - Application type: **Web application**
   - Name: **CloudShop Web Client**
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (frontend)
     - `http://localhost:5000` (backend)
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/auth/google/callback`
   - Click **"Create"**

5. **Copy your credentials**:
   - Client ID (looks like: `xxxxx.apps.googleusercontent.com`)
   - Client Secret (looks like: `GOCSPX-xxxxx`)

## Step 3: Update Environment Variables

Add these to your `backend/.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL (for redirects after OAuth)
FRONTEND_URL=http://localhost:5173
```

## Step 4: Files Created

I've created the following files for you:

1. **`backend/src/config/passport.js`** - Passport Google OAuth configuration
2. **`backend/src/controllers/googleAuthController.js`** - Google auth logic
3. **Updated `backend/src/routes/authRoutes.js`** - Added Google OAuth routes
4. **Updated `backend/server.js`** - Initialized Passport
5. **`frontend/src/components/GoogleLoginButton.jsx`** - Google sign-in button component

## Step 5: Usage

### Backend Routes
- **`GET /api/auth/google`** - Initiates Google OAuth flow
- **`GET /api/auth/google/callback`** - Handles Google's callback
- **`GET /api/auth/google/success`** - Returns user data after successful auth
- **`GET /api/auth/google/failure`** - Handles auth failures

### Frontend Integration
Import and use the GoogleLoginButton component:

```jsx
import GoogleLoginButton from '../components/GoogleLoginButton';

// In your Login/Register page:
<GoogleLoginButton />
```

## Step 6: How It Works

1. User clicks "Sign in with Google"
2. Redirects to Google's OAuth consent screen
3. User grants permissions
4. Google redirects back to `/api/auth/google/callback`
5. Backend creates/finds user and generates JWT token
6. Frontend receives token and user data
7. User is logged in!

## Step 7: Testing

1. Start your backend: `npm run dev`
2. Start your frontend: `npm run dev`
3. Go to login/register page
4. Click "Sign in with Google"
5. Complete Google OAuth flow
6. You should be logged in!

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the callback URL in Google Console exactly matches: `http://localhost:5000/api/auth/google/callback`
- No trailing slashes!

### "Access blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Add your email as a test user in Google Console

### "Cannot find module 'passport'"
- Run `npm install passport passport-google-oauth20` in the backend directory

## Security Notes

- **Never commit `.env` file** to Git
- In production, update redirect URIs to your production domain
- Use HTTPS in production
- Keep Client Secret secure

## What Happens to User Data?

When a user logs in with Google:
- If email exists: Links to existing account
- If email is new: Creates new user with:
  - Full name from Google
  - Email from Google
  - Profile picture from Google
  - Random password (user can't login with password unless they set one)
  - `googleId` stored for future logins

---

**Ready to go!** 🚀 Just install the packages, get your Google credentials, and update the `.env` file!
