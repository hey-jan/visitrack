'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaUsers, FaClock, FaGraduationCap, FaExclamationTriangle, FaInfoCircle, FaDoorOpen, FaBook, FaChalkboardTeacher, FaCalendarAlt, FaLayerGroup } from 'react-icons/fa';
import BackButton from '@/components/features/shared/BackButton';

const ClassProfilePage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await fetch(`/api/classes/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setClassData(data);
        }
      } catch (error) {
        console.error('Failed to fetch class:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-medium text-gray-900">Class record not found</h2>
        <button onClick={() => router.push('/admin/classes')} className="mt-4 text-black font-semibold text-sm underline">
          Back to list
        </button>
      </div>
    );
  }

  const teacherName = classData.teacher 
    ? `${classData.teacher.firstName} ${classData.teacher.lastName}`
    : 'Not Assigned';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center">
        <BackButton href="/admin/classes" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase leading-none">Class Profile</h1>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Administrative Registry</p>
        </div>
      </div>

      {/* Top Section: Info Summary */}
      <div className="space-y-6">
        {/* Class Identity Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-black text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-black/10 shrink-0 uppercase">
            {classData.code.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight truncate">{classData.code}</h2>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mt-0.5">{classData.title || 'Untitled Course'}</p>
            
            <div className="flex gap-4 mt-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Schedule No.</span>
                <span className="text-xs font-mono font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase mt-0.5">
                  {classData.schedule}
                </span>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-4">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Instructor In-Charge</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <FaChalkboardTeacher size={10} className="text-black/30" />
                  <span className="text-xs font-bold text-gray-900 uppercase">{teacherName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Schedule */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center">
            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 shrink-0 text-black">
              <FaCalendarAlt size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Schedule</p>
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-tight truncate">
                {classData.days}
              </h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                {classData.time}
              </p>
            </div>
          </div>

          {/* Card 2: Room */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center">
            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 shrink-0 text-black">
              <FaDoorOpen size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Room</p>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                {classData.room}
              </h2>
            </div>
          </div>

          {/* Card 3: Enrollment */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center">
            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 shrink-0 text-black">
              <FaUsers size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Enrolled</p>
              <div className="flex items-baseline gap-1.5">
                <h2 className="text-lg font-black text-gray-900 leading-none">
                  {classData.students?.length || 0}
                </h2>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Students</span>
              </div>
            </div>
          </div>

          {/* Card 4: Units */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center">
            <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center mr-4 shrink-0 text-black">
              <FaLayerGroup size={16} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Credits</p>
              <div className="flex items-baseline gap-1.5">
                <h2 className="text-lg font-black text-gray-900 leading-none">
                  {classData.units || '0'}
                </h2>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Units</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-4">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center">
            <FaGraduationCap className="mr-3 text-black" size={16} />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Master Class Roster</h3>
          </div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-white px-2.5 py-1 rounded-full border border-gray-100">
            {classData.students?.length || 0} Records Found
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Program</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Year</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Attendance</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {classData.students && classData.students.length > 0 ? (
                classData.students.map((student: any) => (
                  <tr 
                    key={student.id} 
                    className="group hover:bg-gray-50/80 transition-colors cursor-default animate-in fade-in duration-500"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-black rounded-lg overflow-hidden shadow-sm flex items-center justify-center text-white text-[9px] font-bold uppercase transition-transform group-hover:scale-105">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm tracking-tight">
                          {student.firstName} {student.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tight bg-gray-100 text-gray-700">
                        {student.courseAcronym}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-600">
                      {student.year}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-900">
                          {student.attendancePercentage !== null ? `${student.attendancePercentage}%` : 'N/A'}
                        </span>
                        {student.absences >= 10 && (
                          <div className="flex items-center gap-1 text-[7px] font-black text-black uppercase tracking-tighter mt-0.5">
                            <FaExclamationTriangle size={7} />
                            DROPOUT RISK
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/students/${student.slug || student.id}`); }}
                        className="bg-gray-50 hover:bg-black hover:text-white text-gray-400 text-[9px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-lg border border-gray-100 transition-all active:scale-95"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FaUsers size={40} className="text-gray-200" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">No students currently enrolled</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassProfilePage;
