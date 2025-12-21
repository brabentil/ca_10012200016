import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteNonAdminUsers() {
  try {
    // First get non-admin user IDs
    const nonAdminUsers = await prisma.user.findMany({
      where: {
        role: {
          not: 'ADMIN',
        },
      },
      select: { id: true, email: true },
    });

    console.log(`Found ${nonAdminUsers.length} non-admin users to delete`);

    for (const user of nonAdminUsers) {
      console.log(`Deleting user: ${user.email}`);
      
      // Delete related records first
      await prisma.studentVerification.deleteMany({ where: { userId: user.id } });
      await prisma.orderItem.deleteMany({
        where: { order: { userId: user.id } },
      });
      await prisma.payment.deleteMany({
        where: { order: { userId: user.id } },
      });
      await prisma.delivery.deleteMany({
        where: { order: { userId: user.id } },
      });
      await prisma.order.deleteMany({ where: { userId: user.id } });
      await prisma.review.deleteMany({ where: { userId: user.id } });
      
      // Finally delete the user
      await prisma.user.delete({ where: { id: user.id } });
    }

    console.log(`✅ Deleted ${nonAdminUsers.length} non-admin users and their data`);
  } catch (error) {
    console.error('❌ Error deleting users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteNonAdminUsers();
