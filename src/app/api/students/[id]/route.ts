// src/app/api/students/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id: id },
      include: {
        course: true,
        facialData: true,
      },
    });
    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }
    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the student.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Pick only the fields that exist in the Student model
    const { firstName, lastName, email, imageUrl, courseId, year, section } = body;
    
    const updatedStudent = await prisma.student.update({
      where: { id: id },
      data: {
        firstName,
        lastName,
        email,
        imageUrl,
        courseId,
        year: year ? parseInt(year.toString()) : undefined,
        section,
      },
    });
    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the student.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Use a transaction to ensure all related data is cleaned up
    await prisma.$transaction([
      // 1. Delete Facial Data
      prisma.facialData.deleteMany({ where: { studentId: id } }),
      // 2. Delete Attendance records
      prisma.attendance.deleteMany({ where: { studentId: id } }),
      // 3. Delete Enrollments
      prisma.enrollment.deleteMany({ where: { studentId: id } }),
      // 4. Finally, delete the Student
      prisma.student.delete({ where: { id: id } }),
    ]);

    return NextResponse.json({ message: 'Student deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the student.' },
      { status: 500 }
    );
  }
}
