// src/app/api/attendance/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const attendance = await prisma.attendance.findMany({
      include: {
        session: {
          include: {
            class: true,
          },
        },
        student: true,
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

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { classId, studentId, status, date } = data;

    // Basic validation
    if (!classId || !studentId || !status) {
      return NextResponse.json(
        { error: 'Class ID, Student ID, and Status are required.' },
        { status: 400 }
      );
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];

    // Find or create a session for this class and date
    const session = await prisma.session.upsert({
      where: {
        classId_date: {
          classId,
          date: attendanceDate,
        },
      },
      update: {},
      create: {
        classId,
        date: attendanceDate,
      },
    });

    const newAttendance = await prisma.attendance.create({
      data: {
        sessionId: session.id,
        studentId,
        status,
        time: new Date().toLocaleTimeString(),
        confidence: data.confidence ? parseFloat(data.confidence) : null,
        snapshotUrl: data.snapshotUrl || null,
      },
    });

    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the attendance record.' },
      { status: 500 }
    );
  }
}
