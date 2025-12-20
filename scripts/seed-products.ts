import { PrismaClient } from '@prisma/client';
import { uploadToS3 } from '../lib/aws/s3';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductData {
  title: string;
  description: string;
  category: string;
  size: string;
  color: string;
  brand: string | null;
  condition: string;
  price: number;
  stock: number;
  imagePath: string;
}

const productData: ProductData[] = [
  // TOPS - Shirts
  {
    title: 'Beige Classic T-Shirt',
    description: 'Soft beige cotton t-shirt perfect for everyday wear. Pre-loved with minimal signs of use. Comfortable fit ideal for campus life.',
    category: 'TOPS',
    size: 'M',
    color: 'Beige',
    brand: null,
    condition: 'GOOD',
    price: 45.00,
    stock: 1,
    imagePath: 'tops/shirts/Beige T-shirt on white background.png',
  },
  {
    title: 'Grey Cotton T-Shirt',
    description: 'Classic grey t-shirt in excellent condition. Soft fabric, perfect for layering or wearing alone. Great wardrobe staple.',
    category: 'TOPS',
    size: 'L',
    color: 'Grey',
    brand: null,
    condition: 'LIKE_NEW',
    price: 55.00,
    stock: 1,
    imagePath: 'tops/shirts/Grey T-shirt.png',
  },
  {
    title: 'Olive Green Statement Tee',
    description: 'Trendy olive green t-shirt with vintage appeal. Comfortable fit with slight fading that adds character.',
    category: 'TOPS',
    size: 'M',
    color: 'Green',
    brand: null,
    condition: 'GOOD',
    price: 48.00,
    stock: 1,
    imagePath: 'tops/shirts/Olive Green T-shirt.png',
  },
  {
    title: 'Softly Worn Casual Tee',
    description: 'Well-loved comfortable t-shirt with that perfect broken-in feel. Ideal for casual campus days.',
    category: 'TOPS',
    size: 'L',
    color: 'Cream',
    brand: null,
    condition: 'FAIR',
    price: 35.00,
    stock: 1,
    imagePath: 'tops/shirts/Softly Worn T-shirt.png',
  },
  {
    title: 'Worn Brown Button-Up Shirt',
    description: 'Vintage brown button-up shirt with unique character. Shows signs of wear but still plenty of life left. Perfect for that retro look.',
    category: 'TOPS',
    size: 'M',
    color: 'Brown',
    brand: null,
    condition: 'VINTAGE',
    price: 65.00,
    stock: 1,
    imagePath: 'tops/shirts/Worn Brown shirt.png',
  },

  // TOPS - Hoodies
  {
    title: 'Faded Black Hoodie',
    description: 'Comfortable black hoodie with natural fading from wear. Perfect for chilly campus evenings. Soft inside lining.',
    category: 'TOPS',
    size: 'L',
    color: 'Black',
    brand: null,
    condition: 'GOOD',
    price: 95.00,
    stock: 1,
    imagePath: 'tops/hoodies/Faded black hoodie on white background.png',
  },
  {
    title: 'Faded Gray Pullover Hoodie',
    description: 'Cozy gray hoodie with vintage fade. Great for layering during cooler weather. Kangaroo pocket included.',
    category: 'TOPS',
    size: 'XL',
    color: 'Grey',
    brand: null,
    condition: 'GOOD',
    price: 100.00,
    stock: 1,
    imagePath: 'tops/hoodies/Faded gray hoodie on white backdrop.png',
  },
  {
    title: 'Faded Green Campus Hoodie',
    description: 'Trendy green hoodie with character from previous wear. Perfect campus casual wear with adjustable drawstring hood.',
    category: 'TOPS',
    size: 'M',
    color: 'Green',
    brand: null,
    condition: 'GOOD',
    price: 90.00,
    stock: 1,
    imagePath: 'tops/hoodies/Faded green hoodie on display.png',
  },
  {
    title: 'Heather Gray Pullover Hoodie',
    description: 'Classic heather gray pullover in excellent condition. Soft fleece lining, perfect for everyday wear.',
    category: 'TOPS',
    size: 'L',
    color: 'Grey',
    brand: null,
    condition: 'LIKE_NEW',
    price: 110.00,
    stock: 1,
    imagePath: 'tops/hoodies/Heather gray pullover hoodie display.png',
  },
  {
    title: 'Relaxed Taupe Hoodie',
    description: 'Comfortable taupe-colored hoodie with relaxed fit. Great neutral color that pairs with everything.',
    category: 'TOPS',
    size: 'M',
    color: 'Tan',
    brand: null,
    condition: 'LIKE_NEW',
    price: 105.00,
    stock: 1,
    imagePath: 'tops/hoodies/Relaxed taupe hoodie on white background.png',
  },
  {
    title: 'Worn Heather Gray Hoodie',
    description: 'Well-loved heather gray hoodie with that perfect worn-in softness. Great value for quality comfort.',
    category: 'TOPS',
    size: 'L',
    color: 'Grey',
    brand: null,
    condition: 'FAIR',
    price: 75.00,
    stock: 1,
    imagePath: 'tops/hoodies/Worn heather gray hoodie detail.png',
  },

  // TOPS - Pants
  {
    title: 'Beige Cotton Casual Pants',
    description: 'Versatile beige casual pants in great condition. Perfect for smart-casual campus looks. Comfortable cotton blend.',
    category: 'BOTTOMS',
    size: '32',
    color: 'Beige',
    brand: null,
    condition: 'LIKE_NEW',
    price: 120.00,
    stock: 1,
    imagePath: 'tops/pants/Beige cotton casual pants flat lay.png',
  },
  {
    title: 'Grayish-Beige Casual Pants',
    description: 'Stylish grayish-beige pants with modern cut. Great for presentations or casual outings.',
    category: 'BOTTOMS',
    size: '30',
    color: 'Grey',
    brand: null,
    condition: 'GOOD',
    price: 110.00,
    stock: 1,
    imagePath: 'tops/pants/Casual grayish-beige pants flat lay.png',
  },
  {
    title: 'Light Beige Casual Pants',
    description: 'Clean light beige casual pants, barely worn. Perfect neutral piece for any wardrobe.',
    category: 'BOTTOMS',
    size: '32',
    color: 'Beige',
    brand: null,
    condition: 'LIKE_NEW',
    price: 125.00,
    stock: 1,
    imagePath: 'tops/pants/Casual light beige pants flat lay.png',
  },
  {
    title: 'Olive Green Casual Pants',
    description: 'Trendy olive green casual pants. Great color for fall/winter. Comfortable fit with pockets.',
    category: 'BOTTOMS',
    size: '31',
    color: 'Green',
    brand: null,
    condition: 'GOOD',
    price: 115.00,
    stock: 1,
    imagePath: 'tops/pants/Olive green casual pants on display.png',
  },
  {
    title: 'Olive-Gray Utility Pants',
    description: 'Unique olive-gray colored pants with utility pockets. Perfect for casual campus wear.',
    category: 'BOTTOMS',
    size: '32',
    color: 'Green',
    brand: null,
    condition: 'GOOD',
    price: 112.00,
    stock: 1,
    imagePath: 'tops/pants/Olive-gray casual pants on display.png',
  },

  // BOTTOMS - Jeans
  {
    title: 'Classic Vintage Blue Jeans',
    description: 'Authentic vintage blue denim jeans with character. Perfect broken-in feel, classic 5-pocket style. True vintage find.',
    category: 'BOTTOMS',
    size: '32',
    color: 'Blue',
    brand: 'Vintage Denim Co.',
    condition: 'VINTAGE',
    price: 150.00,
    stock: 1,
    imagePath: 'bottoms/Jeans/Classic vintage blue jeans flatlay.png',
  },

  // OUTERWEAR - Jackets
  {
    title: 'Beige Textured Jacket',
    description: 'Stylish beige jacket with unique textured fabric. Perfect layering piece for campus. Shows minimal wear.',
    category: 'OUTERWEAR',
    size: 'M',
    color: 'Beige',
    brand: null,
    condition: 'LIKE_NEW',
    price: 180.00,
    stock: 1,
    imagePath: 'outerwear/jackets/Beige textured jacket on mannequin.png',
  },
  {
    title: 'Charcoal Gray Oversized Denim Jacket',
    description: 'Trendy oversized denim jacket in charcoal gray. Perfect streetwear piece with vintage appeal.',
    category: 'OUTERWEAR',
    size: 'L',
    color: 'Grey',
    brand: null,
    condition: 'GOOD',
    price: 165.00,
    stock: 1,
    imagePath: 'outerwear/jackets/Charcoal gray oversized denim jacket.png',
  },
  {
    title: 'Navy Blue Corduroy Jacket',
    description: 'Classic navy blue corduroy jacket. Timeless style perfect for autumn/winter campus wear.',
    category: 'OUTERWEAR',
    size: 'M',
    color: 'Blue',
    brand: null,
    condition: 'LIKE_NEW',
    price: 195.00,
    stock: 1,
    imagePath: 'outerwear/jackets/Navy blue corduroy jacket detail.png',
  },
  {
    title: 'Olive Green Corduroy Jacket',
    description: 'Stylish olive green corduroy jacket with vintage vibes. Great condition, perfect for layering.',
    category: 'OUTERWEAR',
    size: 'L',
    color: 'Green',
    brand: null,
    condition: 'GOOD',
    price: 185.00,
    stock: 1,
    imagePath: 'outerwear/jackets/Olive green corduroy jacket on display.png',
  },
  {
    title: 'Olive Green Corduroy Trucker Jacket',
    description: 'Classic trucker-style corduroy jacket in olive green. Iconic design with button closure and chest pockets.',
    category: 'OUTERWEAR',
    size: 'M',
    color: 'Green',
    brand: null,
    condition: 'GOOD',
    price: 200.00,
    stock: 1,
    imagePath: 'outerwear/jackets/Olive green corduroy trucker jacket.png',
  },

  // ACCESSORIES
  {
    title: 'Beige Canvas Tote Bag',
    description: 'Practical beige canvas tote bag perfect for books and daily essentials. Durable and eco-friendly.',
    category: 'ACCESSORIES',
    size: 'One Size',
    color: 'Beige',
    brand: null,
    condition: 'LIKE_NEW',
    price: 50.00,
    stock: 1,
    imagePath: 'accesories/Beige canvas tote bag on white.png',
  },
  {
    title: 'Olive Green Crewneck Sweatshirt',
    description: 'Cozy olive green crewneck sweatshirt. Perfect midweight layer for campus comfort.',
    category: 'TOPS',
    size: 'L',
    color: 'Green',
    brand: null,
    condition: 'LIKE_NEW',
    price: 105.00,
    stock: 1,
    imagePath: 'accesories/Olive green crewneck sweatshirt flat lay.png',
  },
  {
    title: 'Tortoiseshell Wayfarer Sunglasses',
    description: 'Classic tortoiseshell wayfarer sunglasses. Timeless style that never goes out of fashion.',
    category: 'ACCESSORIES',
    size: 'One Size',
    color: 'Brown',
    brand: null,
    condition: 'GOOD',
    price: 65.00,
    stock: 1,
    imagePath: 'accesories/Tortoiseshell wayfarers on white background.png',
  },
  {
    title: 'Vintage Brown Corduroy Bucket Hat',
    description: 'Trendy vintage brown corduroy bucket hat. Perfect for adding character to any outfit.',
    category: 'ACCESSORIES',
    size: 'One Size',
    color: 'Brown',
    brand: null,
    condition: 'VINTAGE',
    price: 60.00,
    stock: 1,
    imagePath: 'accesories/Vintage brown corduroy bucket hat.png',
  },
];

async function uploadImage(imagePath: string): Promise<string> {
  const fullPath = path.join(
    'C:',
    'Users',
    'nbens',
    'Desktop',
    'brabentil',
    'cloud_application_exam',
    'product images',
    imagePath
  );

  console.log(`Reading image: ${fullPath}`);
  const imageBuffer = fs.readFileSync(fullPath);
  const fileName = path.basename(imagePath);
  
  console.log(`Uploading ${fileName} to S3...`);
  const imageUrl = await uploadToS3(imageBuffer, fileName, 'image/png');
  console.log(`Uploaded successfully: ${imageUrl}`);
  
  return imageUrl;
}

async function seedProducts() {
  console.log('Starting product seed...');

  for (const product of productData) {
    try {
      console.log(`\nProcessing: ${product.title}`);
      
      // Upload image to S3
      const imageUrl = await uploadImage(product.imagePath);

      // Create product
      const createdProduct = await prisma.product.create({
        data: {
          title: product.title,
          description: product.description,
          category: product.category as any,
          size: product.size,
          color: product.color,
          brand: product.brand,
          condition: product.condition as any,
          price: product.price,
          stock: product.stock,
          images: {
            create: {
              imageUrl: imageUrl,
              isPrimary: true,
            },
          },
        },
      });

      console.log(`✓ Created product: ${createdProduct.title} (ID: ${createdProduct.id})`);
    } catch (error) {
      console.error(`✗ Failed to create product: ${product.title}`, error);
    }
  }

  console.log('\n✅ Product seeding completed!');
}

async function main() {
  try {
    await seedProducts();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
