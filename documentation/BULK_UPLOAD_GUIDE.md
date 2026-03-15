# Bulk Product Upload Guide

## Overview
This guide explains how to use the bulk upload feature to add multiple products to your shop at once using a CSV or Excel file.

**Supported File Formats:**
- ✅ CSV (.csv) - Recommended for simplicity
- ✅ Excel 2007+ (.xlsx)
- ✅ Excel 97-2003 (.xls)

## File Format

### Required Columns
Your CSV file must include these columns in this exact order:

1. **name** - Product name (required)
2. **description** - Product description (required)
3. **price** - Regular price in dollars (required)
4. **offerPrice** - Discounted price (optional, leave empty if no discount)
5. **stock** - Available quantity (required)
6. **category** - Product category (required)
7. **imageUrl** - Direct link to product image (required)

### Supported Categories
- Electronics
- Fashion
- Home & Living
- Food & Grocery
- Health & Beauty
- Sports & Outdoors
- Books & Stationery
- Toys & Games
- Automotive
- Others

## Image URL Guidelines

### Supported Image Sources
1. **Direct URLs**: Any publicly accessible image URL
   - Example: `https://example.com/images/product.jpg`

2. **Google Drive**: Share the file and use the link
   - Example: `https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing`

3. **Google Photos (share.google)**: Use the short share link
   - Example: `https://share.google/images/YOUR_IMAGE_ID`

4. **Unsplash**: Free stock photos
   - Example: `https://images.unsplash.com/photo-PHOTO_ID?w=800`

### Image Requirements
- Images must be publicly accessible (no login required)
- Recommended size: 800x800 pixels or larger
- Supported formats: JPG, PNG, WebP
- For Google Drive/Photos: Ensure sharing is set to "Anyone with the link"

## How to Use

### Step 1: Prepare Your File
1. Open the provided `sample_products.csv` in Excel, Google Sheets, or any text editor
2. Replace the sample data with your actual products
3. Make sure all required fields are filled
4. Save the file as:
   - **CSV format** (.csv) - Recommended, works everywhere
   - **Excel format** (.xlsx or .xls) - If you prefer Excel

**Note:** CSV files are plain text and work on any platform. Excel files support formatting but may have compatibility issues.

### Step 2: Upload to Your Shop
1. Log in to your shop owner account
2. Go to "My Shop" dashboard
3. Click the "Bulk Upload" button
4. Select your CSV or Excel file
5. Click "Upload Products"
6. Wait for the upload to complete

### Step 3: Verify Upload
1. Check your product list to ensure all items were added
2. Verify that images are displaying correctly
3. Edit any products if needed

## Sample Data

A sample CSV file (`sample_products.csv`) is included with 30 example products across different categories. You can:
- Use it as a template for your own products
- Test the bulk upload feature with sample data
- Reference it for proper formatting

## Tips for Success

### Image URLs
- ✅ Use direct image links when possible
- ✅ Test image URLs in a browser before uploading
- ✅ Use high-quality product images
- ❌ Avoid using images that require authentication
- ❌ Don't use local file paths (C:\Users\...)

### Pricing
- Enter prices as numbers without currency symbols
- Example: Use `2499` for ₹2,499 (not `₹2,499` or `Rs 2499`)
- Leave offerPrice empty if there's no discount
- Ensure offerPrice is less than price
- Prices are in Indian Rupees (INR)

### Stock
- Enter whole numbers only
- Set to 0 for out-of-stock items
- Consider your actual inventory

### Descriptions
- Keep descriptions concise but informative
- Highlight key features and benefits
- Avoid special characters that might break CSV format
- Use commas carefully (they can break CSV columns)

## Troubleshooting

### Images Not Showing
1. Check if the URL is publicly accessible
2. Verify Google Drive/Photos sharing settings
3. Try opening the URL in an incognito browser window
4. Use a different image hosting service if needed

### Upload Fails
1. Check CSV format (must be comma-separated)
2. Ensure all required fields are filled
3. Remove any special characters from product names
4. Verify file size is under 5MB

### Products Missing After Upload
1. Check for duplicate product names
2. Verify all required fields have values
3. Look for error messages during upload
4. Try uploading in smaller batches

## Example CSV Row

```csv
name,description,price,offerPrice,stock,category,imageUrl
Wireless Headphones,"Premium noise-cancelling headphones with 30-hour battery",7499,5799,50,Electronics,https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800
```

**Note:** Prices are in Indian Rupees (INR). In this example, the regular price is ₹7,499 and the offer price is ₹5,799.

## Need Help?

If you encounter issues:
1. Check this guide for solutions
2. Verify your CSV file format
3. Test with the sample data first
4. Contact support if problems persist

---

**Note**: The bulk upload feature is designed to save time when adding many products. For single products or quick edits, use the regular "Add Product" form.
