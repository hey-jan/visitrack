'use client';

import React from 'react';
import Link from 'next/link';

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Login</h1>
      <div className="flex space-x-4">
        <Link href="/admin">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-xl hover:bg-blue-700 transition duration-300">
            Admin Login
          </button>
        </Link>
        <Link href="/teacher/dashboard">
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg text-xl hover:bg-green-700 transition duration-300">
            Teacher Login
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
