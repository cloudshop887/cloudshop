# Testing Checklist - E-Commerce Shop Management System

## 🧪 Manual Testing Guide

### 1. User Registration & Authentication
- [ ] Register new user (customer)
- [ ] Login with registered credentials
- [ ] View profile page
- [ ] Logout functionality
- [ ] Login validation (wrong password)
- [ ] Register validation (duplicate email)

### 2. Shop Registration Flow
- [ ] Navigate to "Register Shop" from navbar
- [ ] Fill in all shop details:
  - [ ] Shop Name
  - [ ] Description
  - [ ] Address
  - [ ] Category (select from dropdown)
  - [ ] Select "Other" category and enter custom category
  - [ ] Opening Hours
  - [ ] Location (latitude/longitude)
  - [ ] Banner URL
- [ ] Submit shop registration
- [ ] Verify success message
- [ ] Check shop status shows "Pending Approval"

### 3. Shop Owner Dashboard
- [ ] Navigate to "My Shop" from navbar
- [ ] Verify shop status badge (Pending/Live)
- [ ] Check analytics cards:
  - [ ] Total Products count
  - [ ] Total Orders count
  - [ ] Total Views count
  - [ ] Revenue amount
- [ ] Verify "Edit Shop" button is visible
- [ ] Check product table (empty if no products)
- [ ] Check orders table (empty if no orders)

### 4. Shop Settings (Edit Shop)
- [ ] Click "Edit Shop" button
- [ ] Verify all fields are pre-filled with current data
- [ ] Edit shop name
- [ ] Edit description
- [ ] Change category
- [ ] Update opening hours
- [ ] Modify address
- [ ] Change banner URL
- [ ] Click "Save Changes"
- [ ] Verify success message
- [ ] Navigate back to dashboard
- [ ] Confirm changes are reflected

### 5. Product Management - Manual Add
- [ ] Click "Add Product" button
- [ ] Fill in product details:
  - [ ] Product Name
  - [ ] Description
  - [ ] Price
  - [ ] Offer Price (optional)
  - [ ] Stock quantity
  - [ ] Category
  - [ ] Subcategory
  - [ ] Image URL
- [ ] Submit product
- [ ] Verify product appears in dashboard table
- [ ] Check product image displays correctly
- [ ] Verify stock count is shown

### 6. Product Management - Bulk Upload
- [ ] Click "Bulk Upload" button
- [ ] Download sample Excel template (if available)
- [ ] Create Excel file with columns:
  - name, price, description, stock, category, subcategory, imageUrl, offerPrice
- [ ] Upload Excel file
- [ ] Verify upload summary shows:
  - [ ] Total rows processed
  - [ ] Successful uploads
  - [ ] Failed uploads (if any)
- [ ] Check all products appear in dashboard
- [ ] Verify product details are correct

### 7. Product Editing
- [ ] Click "Edit" icon on a product
- [ ] Modify product name
- [ ] Change price
- [ ] Update stock
- [ ] Change image URL
- [ ] Save changes
- [ ] Verify changes in dashboard table

### 8. Product Deletion
- [ ] Click "Delete" icon on a product
- [ ] Confirm deletion in popup
- [ ] Verify product is removed from table
- [ ] Check product count decreases

### 9. Admin Panel - Login
- [ ] Navigate to `/admin/login`
- [ ] Login with admin credentials (admin/admin123)
- [ ] Verify redirect to admin dashboard
- [ ] Check admin sidebar is visible

### 10. Admin Dashboard
- [ ] Verify statistics cards:
  - [ ] Total Shops
  - [ ] Total Users
  - [ ] Total Orders
  - [ ] Revenue
- [ ] Check "Pending Shop Approvals" section
- [ ] Verify pending shops are listed
- [ ] Check shop details are displayed:
  - [ ] Shop name
  - [ ] Owner name
  - [ ] Category
  - [ ] Address
- [ ] Click "Refresh" button
- [ ] Verify data reloads

### 11. Shop Approval Process
- [ ] Find a pending shop in admin dashboard
- [ ] Click "Approve" button
- [ ] Verify shop status changes to "Approved"
- [ ] Check shop disappears from pending list
- [ ] Login as shop owner
- [ ] Verify shop status now shows "Live"
- [ ] Confirm shop is visible on public shop list

### 12. Admin - User Management
- [ ] Navigate to "Users" in admin sidebar
- [ ] Verify user list table displays:
  - [ ] Full Name
  - [ ] Email
  - [ ] Phone
  - [ ] Role
  - [ ] Join Date
- [ ] Use search to find specific user
- [ ] Click "Toggle Admin Role" button
- [ ] Verify role changes
- [ ] Click "Delete User" button
- [ ] Confirm deletion
- [ ] Verify user is removed
- [ ] Click "Refresh" button

### 13. Admin - Shop Management
- [ ] Navigate to "Shops" in admin sidebar
- [ ] Verify shop list table displays:
  - [ ] Shop name and address
  - [ ] Owner details
  - [ ] Status (Approved/Pending)
  - [ ] Category
- [ ] Use filter dropdown:
  - [ ] Select "All Shops"
  - [ ] Select "Pending Requests"
  - [ ] Select "Approved Shops"
- [ ] Use search to find specific shop
- [ ] Click "View Shop" to see public view
- [ ] Click "Approve" on pending shop
- [ ] Click "Refresh" button

### 14. Search Functionality
- [ ] On homepage, search for shops by name
- [ ] Search for shops by category
- [ ] Search for custom category
- [ ] Switch to "Products" search
- [ ] Search for products by name
- [ ] Search for products by description
- [ ] Search for products by category
- [ ] Verify search results are accurate

### 15. Shop Status Visibility
- [ ] As shop owner, check homepage
- [ ] Verify "My Shop" section shows status badge
- [ ] Check if badge shows "Pending Approval" or "Live"
- [ ] Navigate to shop dashboard
- [ ] Verify status is consistent
- [ ] Go to shop settings
- [ ] Confirm status indicator is present

### 16. Custom Category Testing
- [ ] Register shop with "Other" category
- [ ] Enter custom category name (e.g., "Pet Supplies")
- [ ] Submit registration
- [ ] After approval, verify custom category displays
- [ ] Search for shops by custom category
- [ ] Verify shop appears in search results
- [ ] Add product with custom category
- [ ] Search for product by custom category

### 17. Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify all pages are responsive
- [ ] Check navigation menu on mobile
- [ ] Verify tables scroll horizontally on small screens
- [ ] Check forms are usable on mobile

### 18. Error Handling
- [ ] Try to register shop without required fields
- [ ] Attempt to add product with invalid price
- [ ] Upload Excel with missing columns
- [ ] Try to edit another user's shop
- [ ] Attempt to access admin panel as regular user
- [ ] Test with invalid image URLs
- [ ] Check network error handling (disconnect internet)

### 19. Data Persistence
- [ ] Add products and logout
- [ ] Login again and verify products are still there
- [ ] Edit shop details and refresh page
- [ ] Verify changes persist
- [ ] Clear browser cache
- [ ] Login and check data is intact

### 20. Performance
- [ ] Upload Excel with 100+ products
- [ ] Check dashboard loads quickly
- [ ] Verify search is responsive
- [ ] Test with multiple shops (10+)
- [ ] Check admin panel with many users

## 🐛 Known Issues to Check

- [ ] Verify no duplicate menu bars
- [ ] Check all routes are accessible
- [ ] Confirm no console errors
- [ ] Verify all images load correctly
- [ ] Check for any broken links
- [ ] Test all buttons are clickable
- [ ] Verify all forms submit correctly

## ✅ Expected Results

### After Shop Registration:
- Shop status: "Pending Approval"
- Visible in Admin Dashboard pending list
- NOT visible in public shop list
- Owner can see shop in "My Shop" dashboard

### After Admin Approval:
- Shop status: "Live"
- Visible in public shop list
- Searchable by customers
- Products become visible to customers

### Product Management:
- Products only visible after shop approval
- Product count updates in real-time
- Images display correctly
- Stock levels are accurate

### Admin Panel:
- All pending shops visible
- User management works
- Shop approval updates status
- Analytics display correctly

## 📊 Test Data

### Sample Shop Data:
```
Name: Fresh Fruits Market
Category: Fruits & Vegetables
Address: 123 Main Street, City
Opening Hours: 9:00 AM - 9:00 PM
Latitude: 12.9716
Longitude: 77.5946
```

### Sample Product Data:
```
Name: Fresh Apples
Price: 5.99
Stock: 100
Category: Fruits
Description: Fresh red apples from local farms
Image URL: https://images.unsplash.com/photo-1568702846914-96b305d2aaeb
```

### Sample Excel Data:
```
name,price,stock,category,description,imageUrl
Apple,5.99,100,Fruits,Fresh red apples,https://images.unsplash.com/photo-1568702846914-96b305d2aaeb
Banana,3.99,150,Fruits,Ripe yellow bananas,https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e
Orange,4.99,80,Fruits,Juicy oranges,https://images.unsplash.com/photo-1582979512210-99b6a53386f9
```

## 🎯 Success Criteria

✅ All user flows work end-to-end
✅ No console errors
✅ All data persists correctly
✅ Search works for all categories
✅ Admin approval workflow functions
✅ Shop settings update correctly
✅ Products can be added/edited/deleted
✅ Bulk upload processes Excel files
✅ Responsive on all screen sizes
✅ Error messages are user-friendly

---

**Testing Status**: Ready for Testing
**Last Updated**: 2025-11-22
