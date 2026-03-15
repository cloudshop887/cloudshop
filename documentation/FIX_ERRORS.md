# 🛠️ Troubleshooting Guide

You encountered two specific errors. Here is how to fix them.

## 1. Error: `net::ERR_CONNECTION_REFUSED`
**Using `http://localhost:5000/api/auth/firebase-login`**

### ❌ The Problem
The **Backend Server** is not running. The Frontend (React) is working, but it can't save the user to the database because the Backend (Node.js) is offline.

### ✅ The Fix
You must run **both** servers.
1.  Close all open terminals.
2.  Double-click **`repair_and_run.bat`**.
3.  Wait for **two** black windows to appear (one for Backend, one for Frontend).

---

## 2. Error: `auth/billing-not-enabled`
**"Firebase: Error (auth/billing-not-enabled)"**

### ❌ The Problem
Google recently changed their policy for **Phone Authentication**.
- New Firebase projects automatically use "Identity Platform".
- Identity Platform requires the **Blaze (Pay as you go)** plan for SMS, even for the free tier.

### ✅ The Fixes (Choose One)

#### Option A: Upgrade to Blaze Plan (Recommended)
1.  Go to [Firebase Console](https://console.firebase.google.com/)
2.  Click **Upgrade** (bottom left).
3.  Select **Blaze Plan**.
4.  Add a credit card (You won't be charged for the first 10k verifications/month).

#### Option B: Use Google Sign-In Only
If you cannot add a credit card, you can only use **Google Sign-In** and **Email/Password**.
- The "Google Login" button will work perfectly once you run `repair_and_run.bat`.

---

## 🚀 Summary
1.  **Run `repair_and_run.bat`** to fix the connection error.
2.  **Upgrade to Blaze** if you really need Phone Login.
3.  **Google Login** will work immediately after step 1!
