'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const InstructorPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/instructor/dashboard');
  }, [router]);

  return null;
};

export default InstructorPage;
