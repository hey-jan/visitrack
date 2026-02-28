// src/app/api/system-settings/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'global' },
    });

    if (!settings) {
      // Initialize if not found
      settings = await prisma.systemSettings.create({
        data: { id: 'global' },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching system settings.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    
    // Only pick valid fields
    const { lateThreshold, absentThreshold, autoMarkAbsent, confidenceScore } = data;
    
    const updateData: any = {};
    if (lateThreshold !== undefined) updateData.lateThreshold = parseInt(lateThreshold);
    if (absentThreshold !== undefined) updateData.absentThreshold = parseInt(absentThreshold);
    if (autoMarkAbsent !== undefined) updateData.autoMarkAbsent = !!autoMarkAbsent;
    if (confidenceScore !== undefined) updateData.confidenceScore = parseFloat(confidenceScore);

    const updatedSettings = await prisma.systemSettings.update({
      where: { id: 'global' },
      data: updateData,
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating system settings.' },
      { status: 500 }
    );
  }
}
