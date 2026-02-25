// src/app/api/facial-data/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { studentId, embedding, thumbnailUrl } = data;

    // Basic validation
    if (!studentId || !embedding) {
      return NextResponse.json(
        { error: 'Student ID and embedding are required.' },
        { status: 400 }
      );
    }

    const newFacialData = await prisma.facialData.create({
      data: {
        studentId,
        embedding: typeof embedding === 'string' ? embedding : JSON.stringify(embedding),
        thumbnailUrl: thumbnailUrl || null,
      },
    });

    return NextResponse.json(newFacialData, { status: 201 });
  } catch (error) {
    console.error('Error storing facial data:', error);
    return NextResponse.json(
      { error: 'An error occurred while storing facial data.' },
      { status: 500 }
    );
  }
}
