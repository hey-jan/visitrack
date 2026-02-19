// src/app/api/attendance/[classId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const whereClause: any = { classId: classId };
    if (date) {
      whereClause.date = date;
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching attendance.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const records = await request.json();

    // Create attendance records in a transaction
    const createdRecords = await prisma.$transaction(
      records.map((record: any) =>
        prisma.attendance.create({
          data: {
            date: record.date,
            status: record.status,
            time: record.time,
            studentId: record.studentId,
            classId: classId,
          },
        })
      )
    );

    return NextResponse.json(createdRecords, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance records:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating attendance records.' },
      { status: 500 }
    );
  }
}
