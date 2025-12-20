# Product Seeding Script

This script uploads product images to S3 and seeds the database with 31 product listings based on the images in the `product images` folder.

## Products Included

### Tops - Shirts (5 items)
- Beige Classic T-Shirt ($15)
- Grey Cotton T-Shirt ($18)
- Olive Green Statement Tee ($16)
- Softly Worn Casual Tee ($12)
- Worn Brown Button-Up Shirt ($20)

### Tops - Hoodies (6 items)
- Faded Black Hoodie ($30)
- Faded Gray Pullover Hoodie ($32)
- Faded Green Campus Hoodie ($28)
- Heather Gray Pullover Hoodie ($35)
- Relaxed Taupe Hoodie ($33)
- Worn Heather Gray Hoodie ($25)

### Bottoms - Pants (5 items)
- Beige Cotton Casual Pants ($35)
- Grayish-Beige Casual Pants ($32)
- Light Beige Casual Pants ($38)
- Olive Green Casual Pants ($36)
- Olive-Gray Utility Pants ($34)

### Bottoms - Jeans (1 item)
- Classic Vintage Blue Jeans ($45)

### Outerwear - Jackets (5 items)
- Beige Textured Jacket ($55)
- Charcoal Gray Oversized Denim Jacket ($50)
- Navy Blue Corduroy Jacket ($60)
- Olive Green Corduroy Jacket ($58)
- Olive Green Corduroy Trucker Jacket ($62)

### Accessories (4 items)
- Beige Canvas Tote Bag ($15)
- Olive Green Crewneck Sweatshirt ($32)
- Tortoiseshell Wayfarer Sunglasses ($20)
- Vintage Brown Corduroy Bucket Hat ($18)

## Prerequisites

1. AWS S3 bucket configured with credentials in `.env.local`:
   ```
   AWS_REGION=eu-north-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_S3_BUCKET=thrifthub-product-images
   ```

2. PostgreSQL database running and configured

3. All product images present in `C:\Users\nbens\Desktop\brabentil\cloud_application_exam\product images\`

## How to Run

1. Make sure your database is up to date:
   ```bash
   npx prisma migrate dev
   ```

2. Run the seed script:
   ```bash
   npm run seed:products
   ```

## What it Does

1. Reads each product image from the local folder
2. Uploads the image to your S3 bucket
3. Creates a product record in the database with:
   - Title and description
   - Category (TOPS, BOTTOMS, OUTERWEAR, ACCESSORIES)
   - Size, color, condition
   - Price and stock
   - Link to the S3 image URL
4. Creates a product image record marked as primary

## Notes

- Each product has stock = 1 (authentic thrift store experience)
- Conditions vary: LIKE_NEW, GOOD, FAIR, VINTAGE
- Prices range from $12 to $62
- All images will be uploaded with `image/png` content type
- The script will continue even if individual uploads fail (check console for errors)

## Troubleshooting

- **AWS Credentials Error**: Make sure your `.env.local` has valid AWS credentials
- **File Not Found**: Verify the product images folder path matches your system
- **Database Error**: Ensure Prisma schema is up to date and database is running
- **S3 Upload Failed**: Check bucket permissions and CORS configuration
