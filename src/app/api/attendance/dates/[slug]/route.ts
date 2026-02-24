// src/app/api/attendance/dates/[slug]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Resolve classId if it's a slug or use it directly if it's an ID
    let actualClassId = slug;
    const classCheck = await prisma.class.findUnique({
      where: { id: slug },
      select: { id: true }
    });

    if (!classCheck) {
      const classBySlug = await prisma.class.findUnique({
        where: { slug: slug },
        select: { id: true }
      });
      if (classBySlug) {
        actualClassId = classBySlug.id;
      } else {
        // If it's not a valid ID and not a valid slug, return 404
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }
    }

    const sessions = await prisma.session.findMany({
      where: { classId: actualClassId },
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
