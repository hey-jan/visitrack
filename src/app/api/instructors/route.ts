// src/app/api/instructors/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const instructors = await prisma.instructor.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true,
            schedule: true
          }
        }
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
    const { firstName, lastName, email, password, classIds } = data;

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
    const slug = slugify(`${firstName} ${lastName}`, { lower: true });

    const newInstructor = await prisma.instructor.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        slug,
        class: {
          connect: Array.isArray(classIds) ? classIds.map((id: string) => ({ id })) : []
        }
      },
      include: {
        class: true
      }
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
