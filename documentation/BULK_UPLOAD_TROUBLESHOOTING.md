# Bulk Upload Troubleshooting Guide

## Testing the Bulk Upload Feature

### Step 1: Check if the Feature is Accessible
1. Log in as a shop owner
2. Go to "My Shop" dashboard
3. Click "Bulk Upload" button
4. You should see the upload page

### Step 2: Test with Sample Data
1. Use the provided `sample_products.csv` file
2. Click "Click to upload Excel or CSV file"
3. Select the CSV file
4. Click "Upload Products"
5. Wait for the response

### Step 3: Check Console for Errors
Open browser DevTools (F12) and check:
- **Console tab**: Look for any JavaScript errors
- **Network tab**: Check the `/api/products/bulk-upload` request
  - Status should be 200 OK
  - Response should show successCount and failedCount

## Common Issues and Solutions

### Issue 1: "No shop found for this user"
**Solution**: Make sure you've registered a shop first
1. Go to "Register Shop" page
2. Fill in shop details
3. Submit and wait for admin approval (if required)

### Issue 2: Upload button doesn't work
**Symptoms**: Clicking "Upload Products" does nothing
**Solutions**:
1. Check browser console for errors
2. Verify you're logged in as a shop owner
3. Check that the file is selected (file name should appear)
4. Try refreshing the page

### Issue 3: "Failed to upload file" error
**Possible causes**:
1. **Not logged in**: Log in again
2. **Token expired**: Log out and log in again
3. **Wrong user role**: Must be a SHOP_OWNER
4. **Backend not running**: Check if backend server is running on port 5000

### Issue 4: Products uploaded but not showing
**Solutions**:
1. Click "View Products" button after upload
2. Refresh the "My Shop" page
3. Check if products were actually created in database (use Prisma Studio)

### Issue 5: CSV parsing errors
**Common problems**:
- Missing required fields (name, price)
- Invalid number formats (use 2499 not ₹2,499 or Rs 2499)
- Special characters in descriptions
- Commas in text not properly quoted

**Solution**: Check the CSV format:
```csv
name,description,price,offerPrice,stock,category,imageUrl
"Product Name","Description here",2499,1999,100,Electronics,https://example.com/image.jpg
```

**Note:** All prices are in Indian Rupees (INR).

## Debugging Steps

### 1. Check Backend Logs
Look at the terminal where backend is running for errors like:
- "No shop found"
- "Missing required fields"
- Database connection errors

### 2. Check Frontend Network Request
In DevTools Network tab:
- Request URL: `http://localhost:5000/api/products/bulk-upload`
- Method: POST
- Content-Type: multipart/form-data
- Authorization header should be present

### 3. Verify File Upload
Console log should show:
```
Upload response: {
  message: "Processed X items",
  successCount: X,
  failedCount: X,
  errors: []
}
```

### 4. Check Database
Use Prisma Studio:
```bash
cd backend
npx prisma studio
```
- Open "Product" table
- Verify new products were created
- Check shopId matches your shop

## Manual Testing Checklist

- [ ] Can access bulk upload page
- [ ] Can select CSV file
- [ ] File name appears after selection
- [ ] Upload button is enabled
- [ ] Upload shows progress/loading state
- [ ] Success message appears
- [ ] Summary shows correct counts
- [ ] "View Products" button appears
- [ ] Products appear in shop dashboard
- [ ] Images display correctly

## API Testing (Advanced)

Test the endpoint directly with curl:

```bash
# Get your auth token first (from localStorage or login response)
TOKEN="your_jwt_token_here"

# Upload file
curl -X POST http://localhost:5000/api/products/bulk-upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@sample_products.csv"
```

Expected response:
```json
{
  "message": "Processed 30 items",
  "successCount": 30,
  "failedCount": 0,
  "errors": []
}
```

## Still Not Working?

1. **Restart both servers**:
   - Stop frontend (Ctrl+C)
   - Stop backend (Ctrl+C)
   - Start backend: `cd backend && npm run dev`
   - Start frontend: `cd frontend && npm run dev`

2. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R
   - Or clear cache in DevTools

3. **Check file permissions**:
   - Ensure sample_products.csv is readable
   - Try creating a simple 1-row CSV to test

4. **Verify environment**:
   - Backend running on port 5000
   - Frontend running on port 5173 (or 3000)
   - Database connection working
   - JWT secret configured

## Success Indicators

✅ Upload completes without errors
✅ Success count matches number of rows in CSV
✅ Products appear in "My Shop" dashboard
✅ Images load correctly
✅ Product details are accurate

If you see all these, the feature is working correctly!
