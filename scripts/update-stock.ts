import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProductStock() {
  try {
    console.log('Starting stock update...');

    const result = await prisma.product.updateMany({
      data: {
        stock: 20
      }
    });

    console.log(`✅ Successfully updated ${result.count} products to have 20 items in stock`);
  } catch (error) {
    console.error('❌ Error updating stock:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductStock();
