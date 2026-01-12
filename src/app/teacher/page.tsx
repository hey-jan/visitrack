'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TeacherPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/teacher/dashboard');
  }, [router]);

  return null;
};

export default TeacherPage;
