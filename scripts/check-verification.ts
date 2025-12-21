import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkVerification() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'saah.fenyinka@acity.edu.gh' },
      include: {
        studentVerification: true,
      },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📋 User:', {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
    });

    console.log('\n🎓 Verification Status:', user.studentVerification);

    if (!user.studentVerification) {
      console.log('\n⚠️  No verification record exists - user needs to:');
      console.log('   1. Go to /student-verification');
      console.log('   2. Enter Student ID and Campus');
      console.log('   3. Receive code via email');
      console.log('   4. Enter code on /verify page');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVerification();
