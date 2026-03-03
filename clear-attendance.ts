import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // We check for 'CS-FRELEAN' to be sure
  const classCodes = ['CS-FRELEAN'];
  
  console.log('--- Attendance Clear Script ---');

  for (const code of classCodes) {
    const targetClass = await prisma.class.findFirst({
      where: { code: code }
    });

    if (targetClass) {
      console.log(`\nFound target class: ${targetClass.title} (${targetClass.code})`);
      console.log(`ID: ${targetClass.id}`);

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
      console.log(`Attendance for ${targetClass.code} has been cleared.`);
      return; // Stop after finding and clearing the class
    }
  }

  console.log(`\nClass codes ${classCodes.join(' or ')} not found in database.`);
}

main()
  .catch((e) => {
    console.error('Error running script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
