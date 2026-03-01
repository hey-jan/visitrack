'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaEnvelope, FaBookOpen, FaChalkboardTeacher, FaUsers, FaClock, FaDoorOpen, FaShieldAlt, FaCircle, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import EditInstructorModal from '@/components/features/admin/instructors/EditInstructorModal';
import AssignClassModal from '@/components/features/admin/instructors/AssignClassModal';
import BackButton from '@/components/features/shared/BackButton';

const InstructorProfilePage = () => {
  const { id: slug } = useParams();
  const router = useRouter();
  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchInstructor = async () => {
    try {
      const res = await fetch(`/api/instructors/${slug}`);
      if (res.ok) {
        const data = await res.json();
        
        // Enforce slug in URL
        if (data.slug && slug !== data.slug) {
          router.replace(`/admin/instructors/${data.slug}`);
          return;
        }
        
        setInstructor(data);
      }
    } catch (error) {
      console.error('Failed to fetch instructor:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructor();
  }, [slug]);

  const handleUnassignClass = async (classId: string) => {
    if (!confirm('Are you sure you want to remove this class assignment?')) return;
    
    try {
      const newClassIds = instructor.class.filter((c: any) => c.id !== classId).map((c: any) => c.id);
      
      const res = await fetch(`/api/instructors/${instructor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classIds: newClassIds }),
      });

      if (res.ok) {
        fetchInstructor();
      }
    } catch (error) {
      console.error('Failed to unassign class:', error);
    }
  };

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
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BackButton href="/admin/instructors" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Instructor Profile</h1>
            <p className="text-sm font-medium text-gray-500 mt-1 tracking-wider uppercase">Directory / <span className="normal-case">{instructor.firstName} {instructor.lastName}</span></p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-black/5"
        >
          <FaEdit size={12} />
          Edit Profile
        </button>
      </div>

      {/* Top Section: Profile Info Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Identity Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-6 md:col-span-2">
          <div className="h-20 w-20 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-black/10 overflow-hidden uppercase shrink-0">
            {getInitials(instructor.firstName, instructor.lastName)}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 truncate">{instructor.firstName} {instructor.lastName}</h2>
            <div className="flex items-center text-gray-500 text-sm mt-1">
              <FaEnvelope className="mr-2 text-black" size={12} />
              <span className="truncate">{instructor.email}</span>
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Instructor Identity</span>
                <span className="text-xs font-bold text-gray-900 uppercase">Instructor</span>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-4">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Member Since</span>
                <span className="text-xs font-bold text-gray-900">
                  {new Date(instructor.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Load Stats */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex-1 flex items-center">
            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 shrink-0">
              <FaChalkboardTeacher className="text-black" size={16} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Teaching Load</p>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                {instructor.class?.length || 0} Assigned Classes
              </h2>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex-1 flex items-center">
            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 shrink-0">
              <FaShieldAlt className="text-black" size={16} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Account Status</p>
              <div className="flex items-center gap-2">
                <FaCircle size={6} className="text-black" />
                <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Active Instructor</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Full Width Classes Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center">
            <FaBookOpen className="mr-3 text-black" size={16} />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Class Assignments</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-md">
              AY 2025-2026
            </span>
            <button 
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-sm"
            >
              <FaPlus size={10} />
              Assign Class
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Schedule No.</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Class Detail</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Schedule</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Enrollment</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Room</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {instructor.class && instructor.class.length > 0 ? (
                instructor.class.map((cls: any) => (
                  <tr 
                    key={cls.id} 
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <span className="text-xs font-mono font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded border border-gray-100 uppercase">
                        {cls.schedule}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div 
                        onClick={() => router.push(`/admin/classes/${cls.slug}`)}
                        className="flex items-center gap-4 cursor-pointer"
                      >
                        <div className="h-9 w-9 bg-black text-white rounded-lg flex items-center justify-center font-bold text-[10px] shadow-sm uppercase shrink-0">
                          {cls.code.charAt(0)}
                        </div>
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">{cls.code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <p className="text-sm font-bold text-gray-900 uppercase">{cls.days}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{cls.time}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <FaUsers size={12} className="text-gray-300" />
                        <span className="text-xs font-bold text-gray-900 uppercase">
                          {cls._count?.enrollments || 0} Students
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-xs font-bold text-black uppercase">
                      {cls.room}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleUnassignClass(cls.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Unassign Class"
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-gray-400 text-sm font-medium italic uppercase tracking-widest">
                    No active assignments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <EditInstructorModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        instructor={instructor}
        onInstructorUpdated={fetchInstructor}
      />

      <AssignClassModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        instructorId={instructor.id}
        currentClassIds={instructor.class?.map((c: any) => c.id) || []}
        onAssignmentComplete={() => {
          setIsAssignModalOpen(false);
          fetchInstructor();
        }}
      />
    </div>
  );
};

export default InstructorProfilePage;
