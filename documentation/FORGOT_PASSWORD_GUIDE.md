# Forgot Password Feature - Setup Guide

## Current Status
✅ **The forgot password feature is now working!**

Even without email configuration, the system will:
1. Generate a password reset token
2. Display the reset link directly on the page (since email is not configured)
3. Allow users to click the link and reset their password

## How It Works Now

### Without Email Configuration (Current Setup)
When a user requests a password reset:
1. They enter their email on `/forgot-password`
2. The system generates a secure reset token
3. **Instead of sending an email**, the reset link is displayed directly on the page
4. User can click the link to go to the reset password page
5. User enters their new password and it gets updated

### Testing the Feature
1. Go to `http://localhost:5173/forgot-password`
2. Enter a registered email address (e.g., the email you used to register)
3. Click "Send Reset Link"
4. You'll see a blue box with the reset URL - click it
5. Enter your new password twice
6. Click "Reset Password"
7. You'll be redirected to login with your new password

## Setting Up Email (Optional - For Production)

If you want actual emails to be sent, you have two options:

### Option 1: Use Mailtrap (Recommended for Testing)
1. Sign up at https://mailtrap.io (free)
2. Go to Email Testing > Inboxes
3. Copy the SMTP credentials
4. Update your `backend/.env`:
   ```env
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_EMAIL=your_mailtrap_username
   SMTP_PASSWORD=your_mailtrap_password
   FROM_EMAIL=noreply@cloudshop.com
   FROM_NAME=CloudShop
   ```
5. Restart the backend server
6. Emails will appear in your Mailtrap inbox (not real emails, just for testing)

### Option 2: Use Gmail (For Production)
1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" from Google Account settings
3. Update your `backend/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   FROM_EMAIL=your-email@gmail.com
   FROM_NAME=CloudShop
   ```
4. Restart the backend server

## Important Notes
- The reset token expires after 10 minutes for security
- If email is not configured, the reset URL is shown directly (development mode)
- In production with email configured, users will receive the link via email
- The backend logs will show whether emails are being sent or just logged
