import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import bcrypt from 'bcrypt';
import { students as studentsData } from './seed-data/students.ts';
import { courses as coursesData } from './seed-data/courses.ts';
import { classes as classesData } from './seed-data/classes.ts';
import { instructors as instructorsData } from './seed-data/instructor.ts';
import { admins as adminsData } from './seed-data/admin.ts';

const prisma = new PrismaClient();

interface StudentData {
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  year: number;
  section: string;
  classes: string[];
}

async function main() {
  console.log('Start seeding ...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.attendance.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.facialData.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.instructor.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.systemSettings.deleteMany({});

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
        slug: slugify(course.courseNo, { lower: true }),
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
        slug: slugify(`${instructor.firstName} ${instructor.lastName}`, { lower: true }),
      },
    });
    instructorMap.set(instructor.email, createdInstructor);
  }

  // Seed Classes
  const classMap = new Map();
  for (const aClass of classesData) {
    const instructor = instructorMap.get(aClass.instructorEmail);
    if (!instructor) {
      console.warn(`Instructor not found for class: ${aClass.code}`);
      continue;
    }
    const createdClass = await prisma.class.create({
      data: {
        code: aClass.code,
        title: aClass.title,
        // Include schedule number in slug for uniqueness
        slug: slugify(`${aClass.code}-${aClass.schedule}`, { lower: true }),
        instructorId: instructor.id,
        room: aClass.room,
        schedule: aClass.schedule,
        days: aClass.days,
        time: aClass.time,
        units: aClass.units,
      },
    });
    // Use unique identifier for mapping (code + schedule)
    classMap.set(`${aClass.code}-${aClass.schedule}`, createdClass);
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
        studentNumber: student.studentNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        slug: student.studentNumber.toLowerCase().replace(/\s+/g, '-'),
        email: student.email,
        courseId: course.id,
        year: student.year,
        section: student.section,
        enrollments: {
          create: student.classes
            .map(classCode => {
              // Find the first class in the map that matches the code
              const matchedKey = Array.from(classMap.keys()).find(key => key.startsWith(`${classCode}-`));
              return matchedKey ? { classId: classMap.get(matchedKey)!.id } : null;
            })
            .filter((item): item is { classId: string } => item !== null),
        },
      },
    });
    studentMap.set(`${student.firstName} ${student.lastName}`, createdStudent);
  }

  // Seed Attendance Data for ELDNET1
  const eldnet1Key = Array.from(classMap.keys()).find(key => key.startsWith('ELDNET1-'));
  const eldnet1Class = eldnet1Key ? classMap.get(eldnet1Key) : null;
  
  if (eldnet1Class) {
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-03-02');
    
    let sessionCount = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      // 2 is Tuesday, 4 is Thursday
      if (day === 2 || day === 4) {
        sessionCount++;
        const dateString = d.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });
        
        // Create session with sample location data
        const session = await prisma.session.create({
          data: {
            date: dateString,
            classId: eldnet1Class.id,
            latitude: 14.5995 + (Math.random() * 0.001 - 0.0005),
            longitude: 120.9842 + (Math.random() * 0.001 - 0.0005),
            address: dateString.includes('Feb 26') 
              ? "Advanced Research and Development Wing, Computer Engineering Department, 4th Floor, Innovation Building, North Campus Science and Technology Park, Quezon City, Metro Manila, Philippines, 1101"
              : "Main Computer Laboratory, Building A",
          }
        });

        // Add attendance for all students enrolled in this class
        const enrolledStudents = (studentsData as StudentData[]).filter(s => s.classes.includes('ELDNET1'));
        for (const studentData of enrolledStudents) {
          const student = studentMap.get(`${studentData.firstName} ${studentData.lastName}`);
          if (student) {
            // Randomly assign status
            const rand = Math.random();
            let status = 'Present';
            let time = '09:00 AM';
            
            // Special Case: Pedro Reyes should have 9 absences
            // Out of 17 sessions, if sessionCount <= 9, make him absent
            if (studentData.firstName === 'Pedro' && studentData.lastName === 'Reyes' && sessionCount <= 9) {
              status = 'Absent';
              time = '-';
            } else if (rand > 0.95) {
              status = 'Absent';
              time = '-';
            } else if (rand > 0.8) {
              status = 'Late';
              time = `09:${Math.floor(Math.random() * 15) + 16} AM`;
            } else {
              time = `09:0${Math.floor(Math.random() * 9)} AM`;
            }

            await prisma.attendance.create({
              data: {
                status: status,
                time: time,
                studentId: student.id,
                sessionId: session.id,
              },
            });
          }
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
