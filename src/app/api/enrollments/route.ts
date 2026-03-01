// src/app/api/enrollments/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { studentId, classId } = data;

    if (!studentId || !classId) {
      return NextResponse.json(
        { error: 'Student ID and Class ID are required.' },
        { status: 400 }
      );
    }

    // Check if the student is already enrolled in the class
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_classId: {
          studentId,
          classId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this class.' },
        { status: 400 }
      );
    }

    const newEnrollment = await prisma.enrollment.create({
      data: {
        studentId,
        classId,
        status: 'ENROLLED',
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json(newEnrollment, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the enrollment.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');

    if (!studentId || !classId) {
      return NextResponse.json(
        { error: 'Student ID and Class ID are required.' },
        { status: 400 }
      );
    }

    await prisma.enrollment.delete({
      where: {
        studentId_classId: {
          studentId,
          classId,
        },
      },
    });

    return NextResponse.json({ message: 'Enrollment deleted successfully.' });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the enrollment.' },
      { status: 500 }
    );
  }
}
