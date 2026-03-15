# 📱 Phone Number OTP Authentication System

This document outlines the implementation of the secure Phone OTP Authentication system.

## 🔒 Security Features

1.  **OTP Hashing**: OTPs are hashed using `bcrypt` before storage. Even database access won't reveal active OTPs.
2.  **Expiration**: OTPs strictly expire after 5 minutes.
3.  **One-Time Use**: OTPs are marked solely as `used` immediately after successful verification.
4.  **Rate Limiting**: Users can only request one OTP every 60 seconds per phone number.
5.  **Attempt Limiting**: Maximum 5 failed attempts allowed before the OTP is invalidated.
6.  **Auto-Registration**: New phone numbers are automatically registered as users upon successful verification.

## 📡 API Endpoints

### 1. Send OTP
**Endpoint:** `POST /api/auth/send-otp`

**Body:**
```json
{
  "phone": "+919999999999"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "phone": "+919999999999"
}
```

### 2. Verify OTP & Login
**Endpoint:** `POST /api/auth/verify-otp`

**Body:**
```json
{
  "phone": "+919999999999",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": 1,
    "phone": "+919999999999",
    "fullName": "User 9999",
    "role": "USER"
  },
  "token": "jwt_token_string..."
}
```

### 3. Resend OTP
**Endpoint:** `POST /api/auth/resend-otp`
Same payload as Send OTP. Resets the 5-minute expiration window but respects the 60-second cooldown.

## 💻 Frontend Implementation

- **Route:** `/otp-login`
- **File:** `src/pages/OTPLogin.jsx`
- **Features:** 
  - Input formatting for 10-digit numbers
  - Countdown timer for resend
  - Development mode alert for OTPs (remove in production)
  - Auto-redirect based on role

## 🗄️ Database Schema (Prisma)

```prisma
model OTP {
  id        Int      @id @default(autoincrement())
  phone     String
  otpHash   String
  expiresAt DateTime
  attempts  Int      @default(0)
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([phone])
  @@index([phone, used])
}
```

## 🚀 Setup & Usage

1.  **Development Mode**: In development (`NODE_ENV !== 'production'`), the OTP is returned in the API response and alerted on the frontend for easy testing.
2.  **Production**: You must replace the mock `sendOTPViaSMS` function in `backend/src/services/otpService.js` with a real SMS provider like Twilio, AWS SNS, or MSG91.

### Example Twilio Integration:
Uncomment the code block in `otpService.js`:
```javascript
const client = require('twilio')(accountSid, authToken);
await client.messages.create({
   body: `Your verification code is ${otp}`,
   from: '+1234567890',
   to: phone
});
```

## 🧹 Maintenance

A cron job ideally should run periodically to clean up expired OTP records.
Function provided: `cleanupExpiredOTPs()` in `otpService.js`.
