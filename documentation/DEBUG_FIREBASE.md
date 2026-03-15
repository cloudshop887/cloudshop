# 🐞 Debugging Firebase Errors

You are seeing `auth/internal-error` and `AxiosError`. Here is how to fix them.

## 1. Fix `auth/internal-error` (Recaptcha/Phone)

This error usually happens for 2 reasons on localhost:

### A. Add Localhost to Authorized Domains
1. Go to **[Firebase Console](https://console.firebase.google.com/)**.
2. Go to **Authentication** > **Settings** > **Authorized Domains**.
3. Click **Add Domain**.
4. Add: `localhost`
5. Add: `127.0.0.1`

### B. Verify Billing (Important!)
Google **REQUIRES** the **Blaze Plan (Pay as you go)** for Phone Authentication now (since mid-2024).
- Even if you are on the free tier usage, the project MUST have a credit card linked.
- Go to **Settings** > **Usage and Billing** > **Details & Settings** > Modify plan to **Blaze**.
- **If you cannot do this**: You cannot use Phone Auth. Stick to Google Sign-In.

---

## 2. Fix `AxiosError` & `Connection Refused`

This means your backend is offline.

### ✅ Solution
1. **Double-click `LAUNCH_NOW.bat`** in your project folder.
2. Ensure TWO black windows open (one for Backend, one for Frontend).
3. If the Backend window closes immediately, there is still an error. Let me know!

---

## 3. Fix `cross-origin-opener-policy`

This is usually a warning, but if Google Login popup closes immediately:
1. Ensure your `authDomain` in `frontend/src/config/firebase.js` is correct: `cloud-shop-f7556.firebaseapp.com`.
2. This error often disappears once the Billing/Authorized Domain settings are fixed.
