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
        sessions: {
          include: {
            Attendance: true,
          }
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                studentNumber: true,
                firstName: true,
                lastName: true,
                email: true,
                year: true,
                section: true,
                course: {
                  select: {
                    courseName: true,
                    courseNo: true
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
              sessions: {
                include: {
                  Attendance: true,
                }
              },
              enrollments: {
                include: {
                  student: {
                    select: {
                      id: true,
                      studentNumber: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      year: true,
                      section: true,
                      course: {
                        select: {
                          courseName: true,
                          courseNo: true
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

    const totalSessions = classDetails.sessions.length;

    const flattenedClassDetails = {
      ...classDetails,
      teacher: classDetails.instructor,
      students: classDetails.enrollments.map(e => {
        const studentId = e.student.id;
        const attendedCount = classDetails!.sessions.filter(session => 
          session.Attendance.some(att => att.studentId === studentId && (att.status === 'Present' || att.status === 'Late'))
        ).length;

        const absences = totalSessions - attendedCount;
        const attendancePercentage = totalSessions > 0 
          ? Math.round((attendedCount / totalSessions) * 100) 
          : null;

        return {
          ...e.student,
          enrollmentStatus: e.status || 'Enrolled',
          courseName: e.student.course?.courseName || 'N/A',
          courseAcronym: e.student.course?.courseNo || 'N/A',
          attendancePercentage,
          absences
        };
      })
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
    const { code, title, instructorId, room, schedule, days, time, units } = body;

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

    const newSlug = (code && schedule) ? slugify(`${code}-${schedule}`, { lower: true, strict: true }) : undefined;

    const updatedClass = await prisma.class.update({
      where: { id: classToUpdate.id },
      data: {
        code,
        title,
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

    await prisma.$transaction(async (tx) => {
      await tx.attendance.deleteMany({
        where: {
          session: {
            classId: classId
          }
        }
      });
      await tx.session.deleteMany({
        where: {
          classId: classId
        }
      });
      await tx.enrollment.deleteMany({
        where: {
          classId: classId
        }
      });
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
