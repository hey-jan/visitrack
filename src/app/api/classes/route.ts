// src/app/api/classes/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    const { name, instructorId, room, schedule, days, time, units } = data;

    if (!name || !instructorId || !schedule) {
      return NextResponse.json(
        { error: 'Name, Instructor ID, and Schedule are required.' },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        instructorId,
        room,
        schedule,
        days,
        time,
        units: units ? parseInt(units) : null,
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
    return NextResponse.json(
      { error: 'An error occurred while creating the class.' },
      { status: 500 }
    );
  }
}
