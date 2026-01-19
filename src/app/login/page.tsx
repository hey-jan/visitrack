'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EyeIcon from './components/EyeIcon';

const LoginPage = () => {
  const [accountType, setAccountType] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountType === 'admin') {
      router.push('/admin');
    }
    else {
      router.push('/teacher/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-8">
      <div className="max-w-md w-full">
        <h1 className="text-5xl font-bold mb-2 text-black">
          VisiTrack
        </h1>
        <p className="text-gray-600 mb-8">
          An AI-Powered Facial Recognition Attendance System
        </p>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-gray-500 text-black"
              autoComplete="off"
            />
          </div>
          <div className="mb-6 relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-200 placeholder-gray-500 text-black"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400"
            >
              <EyeIcon isOpen={!showPassword} />
            </button>
          </div>
          <div className="mb-6">
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </span>
            <div className="flex gap-x-2">
              <button
                type="button"
                onClick={() => setAccountType('admin')}
                className={`w-1/2 py-2 rounded-lg ${accountType === 'admin' ? 'bg-black text-white border border-gray-300' : 'bg-white text-black border border-gray-300'}`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setAccountType('teacher')}
                className={`w-1/2 py-2 rounded-lg ${accountType === 'teacher' ? 'bg-black text-white border border-gray-300' : 'bg-white text-black border border-gray-300'}`}
              >
                Teacher
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition duration-300"
          >
            Login
          </button>
        </form>
        <div className="text-center mt-4">
          <a href="#" className="text-sm text-gray-600 hover:underline">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
