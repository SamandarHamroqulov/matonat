import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = 's4410206@gmail.com';
  const superAdminPassword = 'samacoder0805'; // Make sure to change in production

  const existingAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(superAdminPassword, 10);
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash,
        fullName: 'Super Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log(`✅ Super Admin created: ${superAdminEmail} / ${superAdminPassword}`);
  } else {
    console.log('✅ Super Admin already exists.');
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
