'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaChalkboardTeacher, FaUsers, FaClock, FaDoorOpen, FaGraduationCap, FaUserGraduate, FaSchool, FaCircle } from 'react-icons/fa';

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
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header Navigation */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => router.push('/admin/classes')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2 text-gray-600"
        >
          <FaArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Class Details</h1>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Registry • {classData.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info Overview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="h-24 w-24 rounded-2xl bg-black text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-black/10 overflow-hidden uppercase">
              {classData.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">{classData.name}</h2>
            <div className="flex items-center justify-center text-gray-500 text-sm mt-2 font-mono font-bold">
              <span className="bg-gray-50 px-3 py-1 rounded border border-gray-100">
                SCHED: {classData.schedule}
              </span>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 space-y-4 text-left">
              <div className="flex flex-col gap-1 px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Assigned Instructor</span>
                <span className="text-sm font-bold text-gray-900 uppercase">{teacherName}</span>
              </div>
              <div className="flex flex-col gap-1 px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Academic Units</span>
                <span className="text-sm font-bold text-gray-900">{classData.units || '0'} Units</span>
              </div>
            </div>
          </div>

          {/* Schedule/Location Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center">
              <FaClock className="mr-3 text-black" size={16} />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Logistics</h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-black shrink-0">
                  <FaClock size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Schedule</p>
                  <p className="text-sm font-bold text-gray-900 uppercase">{classData.days} • {classData.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-black shrink-0">
                  <FaDoorOpen size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Location</p>
                  <p className="text-sm font-bold text-gray-900 uppercase">Room {classData.room}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Student Roster */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrollment Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center">
            <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center mr-5 shrink-0">
              <FaUsers className="text-black" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Enrolled Students</p>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight leading-tight">
                {classData.students?.length || 0} Total Records
              </h2>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center">
                <FaGraduationCap className="mr-3 text-black" size={16} />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Class Roster</h3>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/30 border-b border-gray-100">
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Program</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Section</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {classData.students && classData.students.length > 0 ? (
                    classData.students.map((student: any) => (
                      <tr 
                        key={student.id} 
                        className="group hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-9 w-9 bg-black rounded-lg overflow-hidden shadow-sm flex items-center justify-center text-white text-[10px] font-bold uppercase">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <span className="font-semibold text-gray-900 text-sm tracking-tight">{student.firstName} {student.lastName}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-tight bg-gray-100 text-gray-700">
                            {student.courseAcronym} {student.year}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="text-xs font-medium text-gray-600">{student.section}</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => router.push(`/admin/students/${student.slug || student.id}`)}
                            className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-gray-400 text-sm font-medium italic uppercase tracking-widest">
                        No students enrolled in this class.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassProfilePage;
