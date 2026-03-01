// src/app/api/students/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import slugify from 'slugify';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idOrSlug } = await params;
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: {
        course: true,
        facialData: true,
        enrollments: {
          include: {
            class: true,
          },
        },
      },
    });
    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the student.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Pick fields including potential facialData and classIds
    const { 
      firstName, 
      lastName, 
      email, 
      imageUrl, 
      courseId, 
      year, 
      section, 
      studentNumber, 
      isActive,
      facialData,
      classIds
    } = body;
    
    const slug = (firstName && lastName) ? slugify(`${firstName} ${lastName}`, { lower: true }) : undefined;

    // Check for uniqueness if fields are being updated
    if (studentNumber) {
      const existingStudentNumber = await prisma.student.findFirst({
        where: { 
          studentNumber,
          NOT: { id }
        }
      });

      if (existingStudentNumber) {
        return NextResponse.json(
          { error: `Student ID ${studentNumber} is already registered to another student.` },
          { status: 400 }
        );
      }
    }

    if (email) {
      const existingEmail = await prisma.student.findFirst({
        where: { 
          email,
          NOT: { id }
        }
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: `Email ${email} is already in use by another student.` },
          { status: 400 }
        );
      }
    }

    if (slug) {
      const existingSlug = await prisma.student.findFirst({
        where: { 
          slug,
          NOT: { id }
        }
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: `A student named "${firstName} ${lastName}" is already registered. Please use a unique name variant.` },
          { status: 400 }
        );
      }
    }

    // Use a transaction to update student and related records
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update basic student info
      const student = await tx.student.update({
        where: { id: id },
        data: {
          firstName,
          lastName,
          email,
          imageUrl,
          courseId,
          year: year ? parseInt(year.toString()) : undefined,
          section,
          studentNumber,
          slug,
          isActive: isActive !== undefined ? isActive : undefined,
        },
      });

      // 2. Handle Facial Data if provided
      if (facialData && Array.isArray(facialData)) {
        // Option A: Just add new ones (assuming Edit modal adds to existing)
        // For simplicity here, we'll replace them if provided, or just create new ones
        // The user's request "enroll facial data" suggests adding or resetting
        // Let's replace to keep it clean and synchronized
        await tx.facialData.deleteMany({ where: { studentId: id } });
        await tx.facialData.createMany({
          data: facialData.map((f: any) => ({
            studentId: id,
            embedding: typeof f.embedding === 'string' ? f.embedding : JSON.stringify(f.embedding),
            thumbnailUrl: f.thumbnailUrl
          }))
        });
      }

      // 3. Handle Class Enrollments if provided
      if (classIds && Array.isArray(classIds)) {
        // Sync enrollments: remove those not in the list, add new ones
        // First, get current classIds
        const currentEnrollments = await tx.enrollment.findMany({
          where: { studentId: id }
        });
        const currentClassIds = currentEnrollments.map(e => e.classId);

        // Delete removed ones
        const toDelete = currentClassIds.filter(cid => !classIds.includes(cid));
        if (toDelete.length > 0) {
          await tx.enrollment.deleteMany({
            where: {
              studentId: id,
              classId: { in: toDelete }
            }
          });
        }

        // Add new ones
        const toAdd = classIds.filter(cid => !currentClassIds.includes(cid));
        if (toAdd.length > 0) {
          await tx.enrollment.createMany({
            data: toAdd.map(cid => ({
              studentId: id,
              classId: cid,
              status: 'ENROLLED'
            }))
          });
        }
      }

      return student;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the student.' },
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

    // Use a transaction to ensure all related data is cleaned up
    await prisma.$transaction([
      // 1. Delete Facial Data
      prisma.facialData.deleteMany({ where: { studentId: id } }),
      // 2. Delete Attendance records
      prisma.attendance.deleteMany({ where: { studentId: id } }),
      // 3. Delete Enrollments
      prisma.enrollment.deleteMany({ where: { studentId: id } }),
      // 4. Finally, delete the Student
      prisma.student.delete({ where: { id: id } }),
    ]);

    return NextResponse.json({ message: 'Student deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the student.' },
      { status: 500 }
    );
  }
}
