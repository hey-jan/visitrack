// src/app/api/attendance/dates/[classId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const dates = await prisma.attendance.findMany({
      where: { classId: classId },
      select: {
        date: true,
      },
      distinct: ['date'],
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(dates.map((d) => d.date));
  } catch (error) {
    console.error('Error fetching attendance dates:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching attendance dates.' },
      { status: 500 }
    );
  }
}
