// src/app/api/attendance/alerts/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');

    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor ID is required' }, { status: 400 });
    }

    // 1. Get all classes for this instructor
    const classes = await prisma.class.findMany({
      where: { instructorId },
      include: {
        sessions: {
          include: {
            Attendance: true,
          },
        },
        enrollments: {
          include: {
            student: true,
          },
        },
      },
    });

    const alerts: { name: string; absences: number; subjects: string }[] = [];

    classes.forEach((cls) => {
      const totalSessions = cls.sessions.length;
      if (totalSessions === 0) return;

      cls.enrollments.forEach((enrollment) => {
        const student = enrollment.student;
        const attendedCount = cls.sessions.filter((session) =>
          session.Attendance.some(
            (att) =>
              att.studentId === student.id &&
              (att.status === 'Present' || att.status === 'Late')
          )
        ).length;

        const absences = totalSessions - attendedCount;

        // Threshold for alert: 3 or more absences
        if (absences >= 3) {
          alerts.push({
            name: `${student.firstName} ${student.lastName}`,
            absences,
            subjects: cls.code,
          });
        }
      });
    });

    // Sort by most absences
    alerts.sort((a, b) => b.absences - a.absences);

    return NextResponse.json(alerts.slice(0, 10)); // Top 10 alerts
  } catch (error) {
    console.error('Error fetching attendance alerts:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching alerts.' },
      { status: 500 }
    );
  }
}
