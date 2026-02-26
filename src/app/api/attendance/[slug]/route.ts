// src/app/api/attendance/[slug]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

async function resolveClassId(idOrSlug: string) {
  const classById = await prisma.class.findUnique({
    where: { id: idOrSlug },
    select: { id: true }
  });
  if (classById) return idOrSlug;

  const classBySlug = await prisma.class.findUnique({
    where: { slug: idOrSlug },
    select: { id: true }
  });
  return classBySlug?.id || null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const resolvedId = await resolveClassId(slug);
    if (!resolvedId) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const whereClause: any = { session: { classId: resolvedId } };
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const resolvedId = await resolveClassId(slug);
    if (!resolvedId) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }
    const records = await request.json();

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'No records provided' }, { status: 400 });
    }

    // Assume all records in this batch are for the same date
    const date = records[0].date;

    // Check if session already exists
    const existingSession = await prisma.session.findUnique({
      where: {
        classId_date: {
          classId: resolvedId,
          date,
        },
      },
    });

    if (existingSession) {
      return NextResponse.json({ error: 'Attendance for this session has already been recorded.' }, { status: 400 });
    }

    // Create a new session
    const session = await prisma.session.create({
      data: {
        classId: resolvedId,
        date,
      },
    });

    // Create attendance records in a transaction
    const createdRecords = await prisma.$transaction(
      records.map((record: any) =>
        prisma.attendance.create({
          data: {
            status: record.status,
            time: record.time || "",
            student: { connect: { id: record.studentId } },
            session: { connect: { id: session.id } },
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
