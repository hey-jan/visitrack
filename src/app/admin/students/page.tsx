'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaPlus, FaChevronRight, FaGraduationCap, FaUsers, FaChartBar } from 'react-icons/fa';
import AddStudentModal from '@/components/features/admin/students/AddStudentModal';

const ManageStudentsPage = () => {
  const router = useRouter();
  
  // State
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/students', { cache: 'no-store' });
      const data = await res.json();
      setStudents(data.map((student: any) => ({
        ...student,
        courseName: student.course?.courseName || 'N/A',
        courseNo: student.course?.courseNo || 'N/A',
        courseSlug: student.course?.slug || ''
      })));
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Compute Course Groups
  const courseGroups = useMemo(() => {
    const groups: Record<string, any> = {};
    students.forEach(student => {
      const cNo = student.courseNo;
      if (!groups[cNo]) {
        groups[cNo] = {
          name: student.courseName,
          no: cNo,
          slug: student.courseSlug,
          count: 0,
          totalAttendance: 0,
          withAttendanceCount: 0
        };
      }
      groups[cNo].count++;
      if (student.attendancePercentage !== null) {
        groups[cNo].totalAttendance += student.attendancePercentage;
        groups[cNo].withAttendanceCount++;
      }
    });

    return Object.values(groups).map((g: any) => ({
      ...g,
      avgAttendance: g.withAttendanceCount > 0 
        ? Math.round(g.totalAttendance / g.withAttendanceCount) 
        : 0
    }));
  }, [students]);

  // Filtered Courses based on search
  const filteredCourses = useMemo(() => {
    return courseGroups.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.no.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courseGroups, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Academic Records & Registry</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-30" size={12} />
            <input
              type="text"
              placeholder="Search Program..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all md:w-72 placeholder:text-gray-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-black text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 font-bold text-sm shadow-lg shadow-gray-200"
          >
            <FaPlus size={12} />
            <span>New Student</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <button
              key={course.no}
              onClick={() => router.push(`/admin/students/course/${course.slug}`)}
              className="group bg-white border border-gray-200 p-8 rounded-2xl text-left hover:border-black transition-all hover:shadow-md flex flex-col justify-between min-h-55 cursor-pointer"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 bg-black rounded-xl flex items-center justify-center text-white shadow-sm">
                    <FaGraduationCap size={20} />
                  </div>
                  <FaChevronRight className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" size={14} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 uppercase tracking-tight">{course.name}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{course.no} Department</p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaUsers size={12} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">{course.count} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaChartBar size={12} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">{course.avgAttendance}% Avg.</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddStudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onStudentAdded={fetchStudents}
      />
    </div>
  );
};

export default ManageStudentsPage;
