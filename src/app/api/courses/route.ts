// src/app/api/courses/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import slugify from 'slugify';

export async function GET() {
  try {
    const courses = await prisma.course.findMany();
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching courses.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { courseNo, courseName } = data;

    // Basic validation
    if (!courseNo || !courseName) {
      return NextResponse.json(
        { error: 'Course number and name are required.' },
        { status: 400 }
      );
    }

    const newCourse = await prisma.course.create({
      data: {
        courseNo,
        courseName,
        slug: slugify(courseNo, { lower: true }),
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the course.' },
      { status: 500 }
    );
  }
}
