// src/app/api/facial-data/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, facialData } = data;

    // Basic validation
    if (!userId || !facialData) {
      return NextResponse.json(
        { error: 'User ID and facial data are required.' },
        { status: 400 }
      );
    }

    const newFacialData = await prisma.facialData.create({
      data: {
        userId,
        data: facialData,
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
