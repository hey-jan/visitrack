// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Try to find in Instructor table
  const instructor = await prisma.instructor.findUnique({
    where: { id: session.value },
  });

  if (instructor) {
    return NextResponse.json({ ...instructor, role: 'instructor' });
  }

  // If not found, try Admin table
  const admin = await prisma.admin.findUnique({
    where: { id: session.value },
  });

  if (admin) {
    return NextResponse.json({ ...admin, role: 'admin' });
  }

  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}
