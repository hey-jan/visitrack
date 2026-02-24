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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);

    if (!email || !password) {
      setError('Required fields are missing.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, accountType }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(data.role === 'admin' ? '/admin' : '/instructor/dashboard');
      } else {
        setError('Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError('A system error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white selection:bg-black selection:text-white">
      {/* Visual Identity Section */}
      <div className="hidden lg:flex lg:w-5/12 bg-black flex-col justify-between p-16">
        <div>
          <div className="flex items-center gap-3 mb-20">
            <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
              <span className="text-black font-black text-xs tracking-tighter">VT</span>
            </div>
            <span className="text-white font-bold text-sm uppercase tracking-[0.3em]">VisiTrack</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white tracking-tight leading-[1.1]">
              Enterprise Attendance <br /> 
              <span className="text-gray-500">Infrastructure.</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-sm">
              High-precision facial recognition and biometric synchronization for academic institutions.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-8">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Node: Active</span>
          </div>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">v2.4.0</span>
        </div>
      </div>

      {/* Authentication Section */}
      <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-8 bg-[#FAFAFA]">
        <div className="w-full max-w-95 space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Sign In</h2>
            <p className="text-xs font-medium text-gray-500">Please enter your institutional credentials.</p>
          </div>

          {/* Account Type Segment */}
          <div className="flex p-1 bg-gray-100 rounded-lg border border-gray-200">
            <button
              onClick={() => setAccountType('instructor')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all rounded-md ${
                accountType === 'instructor' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Instructor
            </button>
            <button
              onClick={() => setAccountType('admin')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all rounded-md ${
                accountType === 'admin' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Administrator
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide bg-red-50 p-3 rounded-md border border-red-100 text-center">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="identity@university.edu"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-black outline-none transition-all text-sm font-medium text-black placeholder:text-gray-300"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-black outline-none transition-all text-sm font-medium text-black placeholder:text-gray-300 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black transition-colors"
                >
                  <EyeIcon isSlashed={!showPassword} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-4 rounded-lg font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-black/5"
            >
              {isSubmitting ? <div className="h-4 w-4 border-2 border-white/30 border-b-white rounded-full animate-spin"></div> : 'Verify & Enter'}
            </button>
          </form>

          <div className="pt-10 border-t border-gray-200 flex justify-between items-center">
            <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors">Forgot Access?</button>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Secure Access Layer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
