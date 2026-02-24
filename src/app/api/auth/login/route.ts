// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, password, accountType } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    let user = null;
    if (accountType === 'admin') {
      user = await prisma.admin.findUnique({
        where: { email },
      });
    } else {
      user = await prisma.instructor.findUnique({
        where: { email },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Set a cookie to manage the session
    const cookieStore = await cookies();
    cookieStore.set('session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return NextResponse.json({ message: 'Login successful.', role: accountType });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An error occurred during login.' }, { status: 500 });
  }
}
