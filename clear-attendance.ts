
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const className = 'CS-FRELEAN';
  
  // Find the class
  const targetClass = await prisma.class.findFirst({
    where: { name: className }
  });

  if (!targetClass) {
    console.log(`Class ${className} not found.`);
    return;
  }

  console.log(`Found class: ${targetClass.name} (ID: ${targetClass.id})`);

  // Delete attendance records related to sessions of this class
  const attendanceDeleted = await prisma.attendance.deleteMany({
    where: {
      session: {
        classId: targetClass.id
      }
    }
  });

  console.log(`Deleted ${attendanceDeleted.count} attendance records.`);

  // Delete sessions of this class
  const sessionsDeleted = await prisma.session.deleteMany({
    where: {
      classId: targetClass.id
    }
  });

  console.log(`Deleted ${sessionsDeleted.count} sessions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
