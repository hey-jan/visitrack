import { PrismaClient } from '@prisma/client';
import { students as studentsData } from '../src/data/students.ts';
import { courses as coursesData } from '../src/data/courses.ts';
import { classes as classesData } from '../src/data/classes.ts';
import { attendanceData } from '../src/data/attendanceData.ts';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Seed Courses
  const courseMap = new Map();
  for (const course of coursesData) {
    const createdCourse = await prisma.course.create({
      data: {
        courseNo: course.courseNo,
        courseName: course.courseName || course.courseNo, // Use courseName if available, else fallback to courseNo
        schedNo: course.schedNo,
        time: course.time,
        days: course.days,
        room: course.room,
        units: course.units,
      },
    });
    courseMap.set(course.courseNo, createdCourse);
  }

  // Seed Teachers
  const teacher = await prisma.teacher.create({
    data: {
      firstName: 'Maria',
      lastName: 'Santos',
    },
  });

  // Seed Classes
  const classMap = new Map();
  for (const aClass of classesData) {
    const createdClass = await prisma.class.create({
      data: {
        name: aClass.name,
        teacherId: teacher.id,
        room: aClass.room,
        schedule: aClass.schedule,
        days: aClass.days,
        time: aClass.time,
      },
    });
    classMap.set(aClass.name, createdClass);
  }

  // Seed Students
  const studentMap = new Map();
  for (const student of studentsData) {
    const course = courseMap.get(student.course) ?? courseMap.get('CS101'); // Fallback to a default course
    const createdStudent = await prisma.student.create({
      data: {
        firstName: student.firstName,
        lastName: student.lastName,
        courseId: course.id,
        year: student.year,
        section: student.section,
        classes: {
          connect: student.classes.map((className) => ({ id: classMap.get(className).id })),
        },
      },
    });
    studentMap.set(`${student.firstName} ${student.lastName}`, createdStudent);
  }

  // Seed Attendance Data for CS-PRACT41
  const csPract41Class = classMap.get('CS-PRACT41');
  if (csPract41Class) {
    for (const [date, records] of Object.entries(attendanceData)) {
      for (const record of records) {
        const student = studentMap.get(`${record.firstName} ${record.lastName}`);
        if (student) {
          await prisma.attendance.create({
            data: {
              date: date,
              status: record.status,
              time: record.time,
              studentId: student.id,
              classId: csPract41Class.id,
            },
          });
        }
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
