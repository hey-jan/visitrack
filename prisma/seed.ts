import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import bcrypt from 'bcrypt';
import { students as studentsData } from './seed-data/students.ts';
import { courses as coursesData } from './seed-data/courses.ts';
import { classes as classesData } from './seed-data/classes.ts';
import { instructors as instructorsData } from './seed-data/instructor.ts';
import { admins as adminsData } from './seed-data/admin.ts';
import { attendanceData } from './seed-data/attendanceData.ts';

const prisma = new PrismaClient();

interface StudentData {
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  course: string;
  year: number;
  section: string;
  classes: string[];
}

async function main() {
  console.log('Start seeding ...');

  // Seed Admins
  for (const admin of adminsData) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    await prisma.admin.create({
      data: {
        ...admin,
        password: hashedPassword,
      },
    });
  }

  // Seed Courses
  const courseMap = new Map();
  for (const course of coursesData) {
    const createdCourse = await prisma.course.create({
      data: {
        courseNo: course.courseNo,
        courseName: course.courseName || course.courseNo,
      },
    });
    courseMap.set(course.courseNo, createdCourse);
  }

  // Seed Instructors
  const instructorMap = new Map();
  for (const instructor of instructorsData) {
    const hashedPassword = await bcrypt.hash(instructor.password, 10);
    const createdInstructor = await prisma.instructor.create({
      data: {
        ...instructor,
        password: hashedPassword,
      },
    });
    instructorMap.set(instructor.email, createdInstructor);
  }

  // Seed Classes
  const classMap = new Map();
  for (const aClass of classesData) {
    const instructor = instructorMap.get(aClass.instructorEmail);
    if (!instructor) {
      console.warn(`Instructor not found for class: ${aClass.name}`);
      continue;
    }
    const createdClass = await prisma.class.create({
      data: {
        name: aClass.name,
        slug: slugify(aClass.name, { lower: true }),
        instructorId: instructor.id,
        room: aClass.room,
        schedule: aClass.schedule,
        days: aClass.days,
        time: aClass.time,
        units: aClass.units,
      },
    });
    classMap.set(aClass.name, createdClass);
  }

  // Seed Students
  const studentMap = new Map();
  for (const student of studentsData as StudentData[]) {
    const course = courseMap.get(student.course);
    if (!course) {
       console.warn(`Course ${student.course} not found for student ${student.firstName}`);
       continue;
    }

    const createdStudent = await prisma.student.create({
      data: {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        imageUrl: student.imageUrl,
        courseId: course.id,
        year: student.year,
        section: student.section,
        enrollments: {
          create: student.classes
            .filter(className => classMap.has(className))
            .map((className) => ({
              classId: classMap.get(className)!.id,
            })),
        },
      },
    });
    studentMap.set(`${student.firstName} ${student.lastName}`, createdStudent);

    // Add placeholder facial data for first two students
    if (student.firstName === 'John' || student.firstName === 'Maria') {
      await prisma.facialData.create({
        data: {
          studentId: createdStudent.id,
          embedding: JSON.stringify(Array.from({ length: 128 }, () => Math.random())),
          thumbnailUrl: student.imageUrl,
        },
      });
    }
  }

  // Seed Attendance Data for CS-PRACT41
  const csPract41Class = classMap.get('CS-PRACT41');
  if (csPract41Class) {
    for (const [date, records] of Object.entries(attendanceData)) {
      // Create session first
      const session = await prisma.session.create({
        data: {
          date: date,
          classId: csPract41Class.id,
        }
      });

      for (const record of records) {
        const student = studentMap.get(`${record.firstName} ${record.lastName}`);
        if (student) {
          await prisma.attendance.create({
            data: {
              status: record.status,
              time: record.time,
              studentId: student.id,
              sessionId: session.id,
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
