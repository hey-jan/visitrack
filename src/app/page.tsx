import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    redirect('/login');
  }

  // Check role to redirect to appropriate dashboard
  const instructor = await prisma.instructor.findUnique({
    where: { id: session.value },
  });

  if (instructor) {
    redirect('/instructor/dashboard');
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.value },
  });

  if (admin) {
    redirect('/admin');
  }

  // If session is invalid/orphaned
  redirect('/login');
}
