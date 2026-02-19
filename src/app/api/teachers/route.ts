// src/app/api/teachers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: true, // Include the related user data
      },
    });
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching teachers.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, ...teacherData } = data;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const newTeacher = await prisma.user.create({
      data: {
        email,
        password, // In a real app, you should hash the password
        role: 'teacher',
        teacher: {
          create: teacherData,
        },
      },
      include: {
        teacher: true,
      },
    });

    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the teacher.' },
      { status: 500 }
    );
  }
}
