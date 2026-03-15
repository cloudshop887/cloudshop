# Testing Forgot Password Feature

## Step-by-Step Testing Guide

### 1. Request Password Reset
1. Go to `http://localhost:5173/forgot-password`
2. Enter a registered email (e.g., the email you used to sign up)
3. Click "Send Reset Link"
4. You should see a **blue box** with the reset URL

### 2. Use the Reset Link
1. **Click the link** in the blue box (or copy and paste it into your browser)
2. You should be taken to `http://localhost:5173/reset-password/[TOKEN]`
3. You should see:
   - "Reset Password" heading
   - A small token preview (first 10 characters)
   - Two password input fields

### 3. Reset Your Password
1. Enter a new password (minimum 6 characters)
2. Confirm the password (must match)
3. Click "Reset Password"
4. You should see a success message
5. You'll be redirected to login after 2 seconds

### 4. Login with New Password
1. On the login page, use your email and the NEW password
2. You should be able to log in successfully

## Troubleshooting

### If you see "Invalid or expired reset token"
This means:
- The token has expired (tokens expire after 10 minutes)
- The token was already used
- The token doesn't exist in the database

**Solution**: Go back to `/forgot-password` and request a new reset link

### If the link doesn't work
1. Make sure you're copying the ENTIRE URL from the blue box
2. Check that the backend server is running (`npm run dev` in backend folder)
3. Check the browser console (F12) for any errors
4. Check the backend terminal for log messages

### Backend Logs to Watch For
When you submit the forgot password form, you should see:
```
SMTP not configured. Email would have been sent to: your@email.com
Subject: Password Reset Token
Message: You are receiving this email...
```

When you submit the new password, you should see:
```
Reset password attempt for token: [token]
Hashed token: [hashed]
User found: your@email.com
Password updated successfully for: your@email.com
```

## Testing Checklist
- [ ] Can request password reset
- [ ] Reset URL is displayed in blue box
- [ ] Can click the reset URL
- [ ] Reset password page loads correctly
- [ ] Can enter new password
- [ ] Password validation works (min 6 chars, passwords must match)
- [ ] Success message appears
- [ ] Redirected to login page
- [ ] Can login with new password
- [ ] Old password no longer works

## Common Issues

### "Email could not be sent"
This error should NOT appear anymore. If it does, the backend code wasn't updated properly.

### Reset link goes to 404
Make sure the route is registered in `App.jsx`:
```jsx
<Route path="/reset-password/:resetToken" element={...} />
```

### Token expires too quickly
Tokens expire after 10 minutes. If you need more time for testing, you can change this in `authController.js`:
```javascript
const resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
```
