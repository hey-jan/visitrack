// src/app/api/instructors/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const instructors = await prisma.instructor.findMany();
    return NextResponse.json(instructors);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching instructors.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { firstName, lastName } = data;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required.' },
        { status: 400 }
      );
    }

    const newInstructor = await prisma.instructor.create({
      data: {
        firstName,
        lastName,
      },
    });

    return NextResponse.json(newInstructor, { status: 201 });
  } catch (error) {
    console.error('Error creating instructor:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the instructor.' },
      { status: 500 }
    );
  }
}
