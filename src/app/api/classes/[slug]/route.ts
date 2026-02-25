// src/app/api/classes/[slug]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import slugify from 'slugify';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    // Try to find by Slug first, then by ID
    let classDetails = await prisma.class.findUnique({
      where: { slug: slug },
      include: {
        instructor: {
          select: {
            id: true,
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
                email: true,
                year: true,
                section: true,
                course: {
                  select: {
                    courseName: true
                  }
                },
                facialData: {
                  select: {
                    id: true,
                    thumbnailUrl: true
                  }
                }
              }
            }
          }
        }
      },
    });

    if (!classDetails) {
        classDetails = await prisma.class.findUnique({
            where: { id: slug },
            include: {
              instructor: {
                select: {
                  id: true,
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
                      email: true,
                      year: true,
                      section: true,
                      course: {
                        select: {
                          courseName: true
                        }
                      },
                      facialData: {
                        select: {
                          id: true,
                          thumbnailUrl: true
                        }
                      }
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
      students: classDetails.enrollments.map(e => ({
        ...e.student,
        courseName: e.student.course?.courseName || 'N/A'
      }))
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Pick only the fields that exist in the Class model
    const { name, instructorId, room, schedule, days, time, units } = body;

    // Resolve the actual ID first
    let classToUpdate = await prisma.class.findUnique({
      where: { slug: slug },
      select: { id: true }
    });

    if (!classToUpdate) {
      classToUpdate = await prisma.class.findUnique({
        where: { id: slug },
        select: { id: true }
      });
    }

    if (!classToUpdate) {
      return NextResponse.json({ error: 'Class not found.' }, { status: 404 });
    }

    // Generate a new slug if name is provided
    const newSlug = name ? slugify(name, { lower: true, strict: true }) : undefined;

    const updatedClass = await prisma.class.update({
      where: { id: classToUpdate.id },
      data: {
        name,
        slug: newSlug,
        instructorId,
        room,
        schedule,
        days,
        time,
        units: units ? parseInt(units.toString()) : undefined,
      },
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Resolve the actual ID first
    let classToDelete = await prisma.class.findUnique({
      where: { slug: slug },
      select: { id: true }
    });

    if (!classToDelete) {
      classToDelete = await prisma.class.findUnique({
        where: { id: slug },
        select: { id: true }
      });
    }

    if (!classToDelete) {
      return NextResponse.json({ error: 'Class not found.' }, { status: 404 });
    }

    const classId = classToDelete.id;

    // Use a transaction to clean up all related class data
    await prisma.$transaction(async (tx) => {
      // 1. Delete all Attendance records linked to sessions of this class
      await tx.attendance.deleteMany({
        where: {
          session: {
            classId: classId
          }
        }
      });

      // 2. Delete all Sessions linked to this class
      await tx.session.deleteMany({
        where: {
          classId: classId
        }
      });

      // 3. Delete all Enrollments linked to this class
      await tx.enrollment.deleteMany({
        where: {
          classId: classId
        }
      });

      // 4. Finally, delete the Class itself
      await tx.class.delete({
        where: {
          id: classId
        }
      });
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
