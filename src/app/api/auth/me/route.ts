// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

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
    const { password: _, ...instructorWithoutPassword } = instructor;
    return NextResponse.json({ ...instructorWithoutPassword, role: 'instructor' });
  }

  // If not found, try Admin table
  const admin = await prisma.admin.findUnique({
    where: { id: session.value },
  });

  if (admin) {
    const { password: _, ...adminWithoutPassword } = admin;
    return NextResponse.json({ ...adminWithoutPassword, role: 'admin' });
  }

  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { firstName, lastName, currentPassword, newPassword } = data;

    // Check Instructor table
    let user = await prisma.instructor.findUnique({
      where: { id: session.value },
    });
    let role = 'instructor';

    if (!user) {
      user = await prisma.admin.findUnique({
        where: { id: session.value },
      });
      role = 'admin';
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    // Handle Password Update
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    let updatedUser;
    if (role === 'instructor') {
      updatedUser = await prisma.instructor.update({
        where: { id: session.value },
        data: updateData,
      });
    } else {
      updatedUser = await prisma.admin.update({
        where: { id: session.value },
        data: updateData,
      });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
