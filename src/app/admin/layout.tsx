'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.role === 'admin') {
            setAuthorized(true);
          } else {
            // Redirect instructors to their dashboard if they try to access admin
            router.push('/instructor/dashboard');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-900 font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900 font-sans">
      <Sidebar type="admin" />
      <main className="flex-1 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
