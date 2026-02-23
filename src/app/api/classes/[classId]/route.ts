// src/app/api/classes/[classId]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    // Try to find by ID first, then by Slug
    let classDetails = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      },
    });

    if (!classDetails) {
        classDetails = await prisma.class.findUnique({
            where: { slug: classId },
            include: {
              instructor: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              enrollments: {
                include: {
                  student: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    }
                  }
                }
              }
            },
          });
    }

    if (!classDetails) {
      return NextResponse.json({ error: 'Class not found.' }, { status: 404 });
    }

    // Flatten enrollments to just students for the frontend
    const flattenedClassDetails = {
      ...classDetails,
      teacher: classDetails.instructor, // Map instructor to teacher
      students: classDetails.enrollments.map(e => e.student)
    };

    return NextResponse.json(flattenedClassDetails);
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the class.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const data = await request.json();
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data,
    });
    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the class.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    await prisma.class.delete({
      where: { id: classId },
    });
    return NextResponse.json({ message: 'Class deleted successfully.' });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the class.' },
      { status: 500 }
    );
  }
}
