// src/app/api/instructors/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    const instructors = await prisma.instructor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });
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
    const { firstName, lastName, email, password } = data;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'First name, last name, email, and password are required.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingInstructor = await prisma.instructor.findUnique({
      where: { email },
    });

    if (existingInstructor) {
      return NextResponse.json(
        { error: 'An instructor with this email already exists.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newInstructor = await prisma.instructor.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...instructorWithoutPassword } = newInstructor;
    return NextResponse.json(instructorWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating instructor:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the instructor.' },
      { status: 500 }
    );
  }
}
