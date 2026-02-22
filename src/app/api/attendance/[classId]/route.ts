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

    const whereClause: any = { session: { classId: classId } };
    if (date) {
      whereClause.session.date = date;
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        session: true,
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

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'No records provided' }, { status: 400 });
    }

    // Assume all records in this batch are for the same date
    const date = records[0].date;

    // Find or create a session for this class and date
    const session = await prisma.session.upsert({
      where: {
        classId_date: {
          classId,
          date,
        },
      },
      update: {},
      create: {
        classId,
        date,
      },
    });

    // Create attendance records in a transaction
    const createdRecords = await prisma.$transaction(
      records.map((record: any) =>
        prisma.attendance.create({
          data: {
            status: record.status,
            time: record.time,
            studentId: record.studentId,
            sessionId: session.id,
            confidence: record.confidence ? parseFloat(record.confidence) : null,
            snapshotUrl: record.snapshotUrl || null,
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
