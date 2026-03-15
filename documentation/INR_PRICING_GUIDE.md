# Price Conversion Reference - INR Format

## Sample Products Pricing

All prices in the `sample_products.csv` file are now in **Indian Rupees (INR)**.

### Conversion Rate Used
- **1 USD ≈ ₹83** (approximate)

### Price Range Examples

| Category | Product Example | Price (INR) | Offer Price (INR) |
|----------|----------------|-------------|-------------------|
| Electronics | Wireless Headphones | ₹7,499 | ₹5,799 |
| Electronics | Smart Watch | ₹16,599 | ₹12,399 |
| Electronics | Gaming Mouse | ₹4,999 | ₹3,699 |
| Electronics | Mechanical Keyboard | ₹10,799 | ₹8,249 |
| Fashion | Cotton T-Shirt | ₹2,099 | ₹1,649 |
| Fashion | Running Shoes | ₹6,649 | ₹4,949 |
| Fashion | Backpack | ₹4,149 | ₹3,299 |
| Fashion | Leather Wallet | ₹3,299 | ₹2,449 |
| Home & Living | LED Desk Lamp | ₹3,799 | ₹2,949 |
| Home & Living | Coffee Mug Set | ₹2,899 | ₹2,299 |
| Sports | Yoga Mat | ₹3,299 | ₹2,449 |
| Sports | Water Bottle | ₹2,499 | ₹2,049 |
| Sports | Camping Tent | ₹13,299 | ₹10,749 |
| Food & Grocery | Green Tea | ₹1,649 | ₹1,249 |
| Food & Grocery | Whole Wheat Bread | ₹415 | - |
| Food & Grocery | Organic Honey | ₹1,329 | ₹1,079 |
| Health & Beauty | Face Moisturizer | ₹2,399 | ₹1,899 |
| Health & Beauty | Shampoo Set | ₹3,549 | ₹2,699 |

## How to Format Prices in CSV

### ✅ Correct Format
```csv
name,description,price,offerPrice,stock,category,imageUrl
Wireless Headphones,"Premium headphones",7499,5799,50,Electronics,https://...
```

### ❌ Incorrect Formats
```csv
# Don't use currency symbols
Wireless Headphones,"Premium headphones",₹7499,₹5799,50,Electronics,https://...

# Don't use commas in numbers
Wireless Headphones,"Premium headphones","7,499","5,799",50,Electronics,https://...

# Don't use Rs prefix
Wireless Headphones,"Premium headphones",Rs 7499,Rs 5799,50,Electronics,https://...
```

## Price Ranges by Category

### Budget Range (Under ₹1,000)
- Whole Wheat Bread: ₹415
- Almond Butter: ₹829 (offer)

### Affordable Range (₹1,000 - ₹3,000)
- Green Tea: ₹1,649
- Organic Honey: ₹1,329
- T-Shirts: ₹2,099
- Throw Pillows: ₹1,899
- Resistance Bands: ₹2,099

### Mid Range (₹3,000 - ₹7,000)
- Yoga Mat: ₹3,299
- LED Lamp: ₹3,799
- Coffee Mugs: ₹2,899
- Gaming Mouse: ₹4,999
- Backpack: ₹4,149
- Running Shoes: ₹6,649

### Premium Range (₹7,000 - ₹15,000)
- Wireless Headphones: ₹7,499
- Mechanical Keyboard: ₹10,799
- Camping Tent: ₹13,299

### Luxury Range (Above ₹15,000)
- Smart Watch: ₹16,599
- Adjustable Dumbbells: ₹24,899

## Discount Percentages

Most products have discounts ranging from **15% to 25%**:

| Product | Regular Price | Offer Price | Discount |
|---------|---------------|-------------|----------|
| Wireless Headphones | ₹7,499 | ₹5,799 | 23% |
| Smart Watch | ₹16,599 | ₹12,399 | 25% |
| T-Shirt | ₹2,099 | ₹1,649 | 21% |
| Running Shoes | ₹6,649 | ₹4,949 | 26% |
| Yoga Mat | ₹3,299 | ₹2,449 | 26% |

## Tips for Setting Your Own Prices

1. **Research Market Prices**: Check competitors for similar products
2. **Consider Costs**: Factor in product cost, shipping, and margins
3. **Round to Attractive Numbers**: Use ₹999, ₹1,499, ₹2,999 instead of exact amounts
4. **Offer Discounts Strategically**: 15-30% discounts work well for most categories
5. **Use Psychological Pricing**: ₹2,499 looks better than ₹2,500

## Currency Display in Application

The application will automatically format prices for display:
- **Input**: `7499` (in CSV)
- **Display**: `₹7,499` (in UI)

The system handles the formatting, so you only need to enter the numeric value in your CSV file.

## Quick Reference

**Format**: Just numbers, no symbols
**Currency**: Indian Rupees (INR)
**Decimals**: Optional (use for paise if needed, e.g., 99.50)
**Commas**: Don't use in CSV
**Symbols**: Don't use ₹, Rs, or any currency symbol

---

**All 30 sample products are now priced in INR and ready to use!** 🇮🇳
