// src/app/api/facial-data/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.facialData.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Facial data deleted successfully.' });
  } catch (error) {
    console.error('Error deleting facial data:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting facial data.' },
      { status: 500 }
    );
  }
}
