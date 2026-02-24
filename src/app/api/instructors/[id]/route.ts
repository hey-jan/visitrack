// src/app/api/instructors/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { firstName, lastName, email, password } = data;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedInstructor = await prisma.instructor.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...instructorWithoutPassword } = updatedInstructor;
    return NextResponse.json(instructorWithoutPassword);
  } catch (error) {
    console.error('Error updating instructor:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the instructor.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Restriction Check: Check if instructor has associated classes
    const classCount = await prisma.class.count({
      where: { instructorId: id },
    });

    if (classCount > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete instructor. This account is currently assigned to ${classCount} active ${classCount === 1 ? 'class' : 'classes'}. Please reassign or delete these classes first.` 
        },
        { status: 400 }
      );
    }

    await prisma.instructor.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Instructor deleted successfully.' });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    return NextResponse.json(
      { error: 'A system error occurred while trying to delete the instructor.' },
      { status: 500 }
    );
  }
}
