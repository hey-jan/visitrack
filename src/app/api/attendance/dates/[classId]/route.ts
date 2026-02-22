// src/app/api/attendance/dates/[classId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const sessions = await prisma.session.findMany({
      where: { classId: classId },
      select: {
        date: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(sessions.map((s) => s.date));
  } catch (error) {
    console.error('Error fetching attendance dates:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching attendance dates.' },
      { status: 500 }
    );
  }
}
