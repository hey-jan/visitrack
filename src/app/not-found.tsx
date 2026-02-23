import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        {/* Visual Element */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="text-[12rem] font-black text-gray-100 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-black rounded-lg flex items-center justify-center rotate-45">
                <div className="w-16 h-16 border border-gray-200 rounded-full -rotate-45 flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-black text-black mb-4 tracking-tighter uppercase italic">
          Lost in Focus
        </h1>
        <p className="text-gray-500 mb-10 font-medium leading-relaxed">
          The page you are looking for has moved, been deleted, or perhaps it never existed in our database.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/"
            className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
          >
            Return to Dashboard
          </Link>
          <Link 
            href="/login"
            className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs border border-gray-200 hover:border-black transition-all active:scale-[0.98]"
          >
            Back to Login
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-16 pt-8 border-t border-gray-50">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
            VisiTrack • Attendance Redefined
          </p>
        </div>
      </div>
    </div>
  );
}
