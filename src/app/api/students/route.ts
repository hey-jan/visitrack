// src/app/api/students/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        course: true,
        enrollments: {
          include: {
            class: true
          }
        }
      },
    });
    return NextResponse.json(students);
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
    
    // Basic validation
    if (!data.firstName || !data.lastName || !data.courseId) {
      return NextResponse.json(
        { error: 'First name, last name, and course are required.' },
        { status: 400 }
      );
    }

    const newStudent = await prisma.student.create({
      data: {
        ...data,
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
