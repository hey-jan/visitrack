'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EyeIcon from '@/components/ui/icons/EyeIcon';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('instructor');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/instructor/dashboard');
          }
        } else {
          setCheckingSession(false);
        }
      } catch (err) {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, accountType }),
      });

      if (res.ok) {
        if (accountType === 'admin') {
          router.push('/admin');
        } else {
          router.push('/instructor/dashboard');
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

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
          {error && (
            <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
          )}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-200 placeholder-gray-500 text-black pr-12"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <EyeIcon isOpen={!showPassword} />
              </button>
            </div>
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
                onClick={() => setAccountType('instructor')}
                className={`w-1/2 py-2 rounded-lg ${accountType === 'instructor' ? 'bg-black text-white border border-gray-300' : 'bg-white text-black border border-gray-300'}`}
              >
                Instructor
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
