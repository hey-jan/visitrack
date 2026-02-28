// src/app/api/students/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseSlug = searchParams.get('course');

    const where: any = {};
    if (courseSlug) {
      where.course = {
        slug: courseSlug
      };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        course: true,
        facialData: true,
        enrollments: {
          include: {
            class: {
              include: {
                sessions: {
                  include: {
                    Attendance: true
                  }
                }
              }
            }
          }
        },
        Attendance: true
      },
    });

    const studentsWithAttendance = students.map(student => {
      // Calculate aggregate attendance
      let totalPossibleSessions = 0;
      let totalAttendedSessions = 0;

      student.enrollments.forEach(enrollment => {
        const sessions = enrollment.class.sessions;
        totalPossibleSessions += sessions.length;
        
        // Count how many of these sessions the student was present in
        const attendedInClass = sessions.filter(session => 
          session.Attendance.some(att => att.studentId === student.id && (att.status === 'Present' || att.status === 'Late'))
        ).length;
        
        totalAttendedSessions += attendedInClass;
      });

      const attendancePercentage = totalPossibleSessions > 0 
        ? Math.round((totalAttendedSessions / totalPossibleSessions) * 100) 
        : null;

      return {
        ...student,
        attendancePercentage
      };
    });

    return NextResponse.json(studentsWithAttendance);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching students.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { facialData, classIds, ...studentData } = data;
    
    // Basic validation
    if (!studentData.firstName || !studentData.lastName || !studentData.courseId || !studentData.studentNumber) {
      return NextResponse.json(
        { error: 'First name, last name, course, and student number are required.' },
        { status: 400 }
      );
    }

    const slug = slugify(`${studentData.firstName} ${studentData.lastName}`, { lower: true });

    // Check for uniqueness
    const existingStudentNumber = await prisma.student.findUnique({
      where: { studentNumber: studentData.studentNumber }
    });

    if (existingStudentNumber) {
      return NextResponse.json(
        { error: `Student ID ${studentData.studentNumber} is already registered.` },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.student.findUnique({
      where: { slug }
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: `A student named "${studentData.firstName} ${studentData.lastName}" is already registered. If this is a different student, please add a middle initial or suffix to differentiate.` },
        { status: 400 }
      );
    }

    const newStudent = await prisma.student.create({
      data: {
        ...studentData,
        isActive: studentData.isActive !== undefined ? studentData.isActive : true,
        slug,
        year: studentData.year ? parseInt(studentData.year.toString()) : undefined,
        facialData: facialData ? {
          create: facialData.map((f: any) => ({
            embedding: typeof f.embedding === 'string' ? f.embedding : JSON.stringify(f.embedding),
            thumbnailUrl: f.thumbnailUrl || null,
          })),
        } : undefined,
        enrollments: classIds ? {
          create: classIds.map((classId: string) => ({
            classId: classId,
          })),
        } : undefined,
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the student.' },
      { status: 500 }
    );
  }
}
