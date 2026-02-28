'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaEnvelope, FaBookOpen, FaArrowLeft, FaChalkboardTeacher, FaUsers, FaClock, FaDoorOpen, FaShieldAlt, FaCircle } from 'react-icons/fa';

const InstructorProfilePage = () => {
  const { id: slug } = useParams();
  const router = useRouter();
  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const res = await fetch(`/api/instructors/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setInstructor(data);
        }
      } catch (error) {
        console.error('Failed to fetch instructor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-medium text-gray-900">Instructor record not found</h2>
        <button onClick={() => router.push('/admin/instructors')} className="mt-4 text-black font-semibold text-sm underline">
          Back to directory
        </button>
      </div>
    );
  }

  const getInitials = (first: string, last: string) => {
    return `${first[0]}${last[0]}`.toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header Navigation */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => router.push('/admin/instructors')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2 text-gray-600"
        >
          <FaArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Faculty Profile</h1>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Directory / {instructor.firstName} {instructor.lastName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="h-24 w-24 rounded-2xl bg-black text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-black/10 overflow-hidden uppercase">
              {getInitials(instructor.firstName, instructor.lastName)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{instructor.firstName} {instructor.lastName}</h2>
            <div className="flex items-center justify-center text-gray-500 text-sm mt-2">
              <FaEnvelope className="mr-2 text-black" size={12} />
              {instructor.email}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 space-y-4 text-left">
              <div className="flex flex-col gap-1 px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Faculty Identity</span>
                <span className="text-sm font-bold text-gray-900 uppercase">Instructor</span>
              </div>
              <div className="flex flex-col gap-1 px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member Since</span>
                <span className="text-sm font-bold text-gray-900">
                  {new Date(instructor.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center">
                <FaShieldAlt className="mr-3 text-black" size={16} />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Account Status</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <FaCircle size={8} className="text-black" />
                <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Active Faculty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Load Overview Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center">
            <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center mr-5 shrink-0">
              <FaChalkboardTeacher className="text-black" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Teaching Load</p>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight leading-tight">
                {instructor.class?.length || 0} Assigned Classes
              </h2>
            </div>
          </div>

          {/* Classes Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center">
                <FaBookOpen className="mr-3 text-black" size={16} />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Class Assignments</h3>
              </div>
              <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-md">
                AY 2025-2026
              </span>
            </div>
            
            <div className="divide-y divide-gray-50">
              {instructor.class && instructor.class.length > 0 ? (
                instructor.class.map((cls: any) => (
                  <div 
                    key={cls.id} 
                    onClick={() => router.push(`/admin/classes`)}
                    className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-black font-bold text-sm shadow-sm uppercase">
                        {cls.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase">
                            {cls.schedule}
                          </span>
                          <p className="text-sm font-bold text-gray-900 uppercase">{cls.name}</p>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          {cls.days} • {cls.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Enrollment</p>
                        <div className="flex items-center justify-end gap-1.5">
                          <FaUsers size={12} className="text-black opacity-30" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">
                            {cls._count?.enrollments || 0} Students
                          </span>
                        </div>
                      </div>
                      <div className="text-right w-24">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                        <p className="text-xs font-bold text-black uppercase">Room {cls.room}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 text-sm font-medium italic uppercase tracking-widest">
                  No active assignments found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfilePage;
