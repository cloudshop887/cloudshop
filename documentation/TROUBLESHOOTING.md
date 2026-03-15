# Common Issues & Quick Fixes

## 🔧 Quick Troubleshooting Guide

### Issue: "Cannot register shop" or "Shop registration fails"

**Possible Causes:**
1. Invalid coordinates
2. Missing required fields
3. Shop name too short (< 3 characters)
4. Address too short (< 10 characters)

**Solution:**
- Ensure all required fields are filled
- Use the "Auto-detect" button for coordinates
- Shop name must be at least 3 characters
- Provide complete address with street, area, city, pincode

---

### Issue: "Not seeing 'My Shop' link after registration"

**Solution:**
This has been fixed! The system now automatically updates your role. If you still don't see it:
1. Refresh the page (F5)
2. Check if you're logged in
3. Log out and log back in if issue persists

---

### Issue: "Getting logged out unexpectedly"

**Possible Causes:**
1. Token expired (after 30 days)
2. Invalid token

**Solution:**
- This is normal security behavior
- Simply log in again
- Your data is safe and preserved

---

### Issue: "Error uploading product images"

**Solution:**
1. Use direct image URLs (Google Drive, Imgur, etc.)
2. For Google Drive:
   - Right-click image → Get link → Anyone with link can view
   - Paste the sharing link
3. For Google Photos:
   - Use the share link directly

---

### Issue: "Products not showing in shop"

**Checklist:**
- [ ] Is your shop approved by admin?
- [ ] Are products marked as "Active"?
- [ ] Did you set a valid price and stock?
- [ ] Refresh the page

---

### Issue: "Cannot update shop settings"

**Possible Causes:**
1. Not logged in as shop owner
2. Invalid data in form fields

**Solution:**
- Ensure you're logged in
- Check all fields are valid:
  - Coordinates must be numbers
  - Times must be in HH:MM format
  - URLs must be valid (start with http:// or https://)

---

### Issue: "Orders not appearing"

**For Customers:**
- Check "My Orders" page
- Ensure you're logged in with the correct account

**For Shop Owners:**
- Check "My Shop" → "Orders" tab
- Ensure your shop is approved and active

---

### Issue: "Search not working"

**Solution:**
1. Try different search terms
2. Check spelling
3. Use category filters
4. Clear search and try again

---

### Issue: "Nearby shops not showing"

**Possible Causes:**
1. Location permission denied
2. No shops within search radius

**Solution:**
1. Allow location access when prompted
2. Increase search radius
3. Ensure shops in your area are registered and approved

---

### Issue: "Cannot place order"

**Checklist:**
- [ ] Items in cart?
- [ ] Delivery address provided?
- [ ] Shop is open?
- [ ] Products in stock?

---

### Issue: "Forgot password not working"

**Solution:**
1. Check your email inbox (and spam folder)
2. Email may take 1-2 minutes to arrive
3. Reset link expires in 10 minutes
4. If email doesn't arrive, contact support

---

### Issue: "Admin cannot approve shops"

**Solution:**
1. Ensure you're logged in as admin
2. Use admin portal: `http://localhost:5173/admin/login`
3. Admin credentials:
   - Email: admin@shop.com
   - Password: admin123

---

### Issue: "Bulk upload fails"

**Common Mistakes:**
1. Wrong file format (use .xlsx, .xls, or .csv)
2. Missing required columns (name, price)
3. Invalid data in cells

**Solution:**
- Download the sample CSV template
- Ensure columns match exactly:
  - name (required)
  - price (required)
  - description
  - stock
  - category
  - imageUrl
- Check for special characters or formatting issues

---

### Issue: "Page shows blank/white screen"

**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Clear browser cache
4. Hard refresh (Ctrl + Shift + R)
5. Try incognito/private mode

---

### Issue: "API errors / Server not responding"

**Checklist:**
- [ ] Is backend server running? (Port 5000)
- [ ] Is frontend server running? (Port 5173)
- [ ] Check `.env` file configuration
- [ ] Database connection working?

**Solution:**
```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

---

## 🆘 Emergency Fixes

### Reset Everything:
```bash
# Stop all servers
# Clear browser localStorage
localStorage.clear()

# Restart backend
cd backend
npm run dev

# Restart frontend
cd frontend
npm run dev
```

### Database Issues:
```bash
cd backend
npx prisma migrate reset
npx prisma generate
node scripts/createAdmin.js
```

---

## 📞 Still Having Issues?

1. **Check Documentation:**
   - README.md
   - BUG_FIXES_SUMMARY.md
   - FEATURES.md

2. **Check Logs:**
   - Browser console (F12)
   - Backend terminal output

3. **Common Solutions:**
   - Restart servers
   - Clear cache
   - Update dependencies: `npm install`
   - Check environment variables

---

## 🔐 Security Notes

- Never share your JWT token
- Change admin password in production
- Use HTTPS in production
- Keep dependencies updated
- Don't commit `.env` files

---

**Last Updated:** 2026-02-01  
**Version:** 1.0.0
