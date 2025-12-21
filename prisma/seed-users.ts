import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting user seed...');

  try {
    // Admin User
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@thrifthub.com' },
      update: {},
      create: {
        email: 'admin@thrifthub.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '+233244000000',
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log('✓ Admin user created:', adminUser.email);
    console.log('  Email: admin@thrifthub.com');
    console.log('  Password: admin123');

    // Test Student User
    console.log('\nCreating test student user...');
    const testPassword = await bcrypt.hash('test123', 10);
    const testUser = await prisma.user.upsert({
      where: { email: 'test@ug.edu.gh' },
      update: {},
      create: {
        email: 'test@ug.edu.gh',
        password: testPassword,
        firstName: 'Test',
        lastName: 'Student',
        phone: '+233244111111',
        role: 'STUDENT',
        isActive: true,
      },
    });
    console.log('✓ Test student user created:', testUser.email);
    console.log('  Email: test@ug.edu.gh');
    console.log('  Password: test123');

    console.log('\n✅ User seed completed successfully!');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
