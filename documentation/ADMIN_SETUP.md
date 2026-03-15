# Admin User Setup - Quick Guide

## Method 1: Using the App (Easiest)

### Step 1: Register the User
1. Go to: http://localhost:5173/register
2. Fill in:
   - **Full Name**: Admin User
   - **Email**: admin@shop.com
   - **Phone**: 1234567890
   - **Password**: admin123
   - **Confirm Password**: admin123
3. Click "Create Account"

### Step 2: Update Role to ADMIN
1. Open Prisma Studio: http://localhost:5555
   (It should already be running from the terminal)
2. Click on "User" table
3. Find the user with email "admin@shop.com"
4. Click on the "role" field
5. Change from "USER" to "ADMIN"
6. Click "Save 1 change" button

### Step 3: Login as Admin
1. Go to: http://localhost:5173/admin/login
2. Enter:
   - **Email**: admin@shop.com
   - **Password**: admin123
3. Click "Login to Dashboard"
4. You'll be redirected to the admin panel!

---

## Method 2: Direct Database (Advanced)

If you have MySQL Workbench or another database tool:

```sql
-- Update existing user to admin
UPDATE User 
SET role = 'ADMIN' 
WHERE email = 'admin@shop.com';
```

---

## Admin Login Details

**URL**: http://localhost:5173/admin/login  
**Email**: admin@shop.com  
**Password**: admin123

---

## Troubleshooting

### "Invalid credentials"
- Make sure you registered the user first
- Check that the password is exactly "admin123"

### "Access denied. Admin privileges required"
- The user role is not set to "ADMIN"
- Go to Prisma Studio and update the role

### "No users found" in admin panel
- You need to login with a user that has role "ADMIN"
- The admin login now uses real authentication (not hardcoded)

---

**Quick Summary**:
1. Register at `/register` with admin@shop.com
2. Open Prisma Studio (http://localhost:5555)
3. Change role to "ADMIN"
4. Login at `/admin/login`

That's it! 🎉
