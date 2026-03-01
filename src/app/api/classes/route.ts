// src/app/api/classes/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');

    const whereClause = instructorId ? { instructorId } : {};

    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching classes.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { code, title, instructorId, room, schedule, days, time, units } = data;

    if (!code || !title || !instructorId || !schedule) {
      return NextResponse.json(
        { error: 'Code, Title, Instructor ID, and Schedule are required.' },
        { status: 400 }
      );
    }

    // Generate a slug from code and schedule
    const slug = slugify(`${code}-${schedule}`, { lower: true, strict: true });

    const newClass = await prisma.class.create({
      data: {
        code,
        title,
        slug,
        instructorId,
        room,
        schedule,
        days,
        time,
        units: units ? parseInt(units.toString()) : null,
      },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    
    // Handle unique constraint violation for slug
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'A class with this code and schedule already exists.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while creating the class.' },
      { status: 500 }
    );
  }
}
