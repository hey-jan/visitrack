import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const attendanceCount = await prisma.attendance.count();
  console.log(`Total Attendance records: ${attendanceCount}`);

  const sessionsWithAttendance = await prisma.session.findMany({
    include: {
        _count: {
            select: { Attendance: true }
        }
    }
  });
  console.log('Sessions with attendance count:', JSON.stringify(sessionsWithAttendance, null, 2));
}
main().finally(() => prisma.$disconnect());
