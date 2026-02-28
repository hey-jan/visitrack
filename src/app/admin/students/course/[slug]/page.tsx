'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaArrowLeft, FaCircle } from 'react-icons/fa';
import AddStudentModal from '@/components/features/admin/students/AddStudentModal';
import ConfirmationModal from '@/components/features/shared/ConfirmationModal';
import EditStudentModal from '@/components/features/admin/students/EditStudentModal';

const CourseRosterPage = () => {
  const { slug } = useParams();
  const router = useRouter();
  
  // State
  const [students, setStudents] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('All');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [studentToEdit, setStudentToEdit] = useState<any>(null);
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Use server-side filtering for better performance
      const res = await fetch(`/api/students?course=${slug}`, { cache: 'no-store' });
      const courseStudents = await res.json();
      
      if (courseStudents.length > 0) {
        setCourse(courseStudents[0].course);
      } else {
        // Fetch course info if no students (optional but good for empty courses)
        const coursesRes = await fetch('/api/courses', { cache: 'no-store' });
        const courses = await coursesRes.json();
        const foundCourse = courses.find((c: any) => c.slug === slug);
        setCourse(foundCourse);
      }

      setStudents(courseStudents.map((student: any) => ({
        ...student,
        name: `${student.firstName} ${student.lastName}`
      })));
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  // Sections list
  const sections = useMemo(() => {
    const set = new Set<string>(students.map(s => s.section));
    return Array.from(set).sort();
  }, [students]);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return students.filter(s => {
      const matchSection = activeSection === 'All' || s.section === activeSection;
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.studentNumber && s.studentNumber.includes(searchTerm));
      return matchSection && matchSearch;
    });
  }, [students, activeSection, searchTerm]);

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      const res = await fetch(`/api/students/${studentToDelete.id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-black"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900">Program not found</h2>
        <button onClick={() => router.push('/admin/students')} className="mt-4 text-black underline font-bold">Return to Directory</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/students')}
            className="h-10 w-10 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-all text-gray-600"
          >
            <FaArrowLeft size={14} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight uppercase">{course.courseName}</h1>
            <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Registry • {course.courseNo}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-30" size={12} />
            <input
              type="text"
              placeholder="Search ID or Name..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all md:w-64 placeholder:text-gray-400 font-medium"
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

      {/* Section Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All', ...sections].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
              activeSection === section 
                ? 'bg-black text-white border-black shadow-sm' 
                : 'bg-white border-gray-200 text-gray-500 hover:border-black hover:text-black'
            }`}
          >
            {section === 'All' ? 'All Students' : `Section ${section}`}
          </button>
        ))}
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-100">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student ID</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Section</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Yr</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Attendance</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50" key={activeSection}>
              {filteredRoster.map((student) => (
                <tr 
                  key={student.id} 
                  onClick={() => router.push(`/admin/students/${student.slug}`)}
                  className={`group hover:bg-gray-50/80 transition-colors cursor-pointer animate-in fade-in duration-500 ${!student.isActive ? 'opacity-60' : ''}`}
                >
                  <td className="px-8 py-5">
                    <span className="text-xs font-mono font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase">
                      {student.studentNumber || '—'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-9 w-9 bg-black rounded-lg overflow-hidden shadow-sm flex items-center justify-center text-white text-[10px] font-bold uppercase">
                        {`${student.firstName[0]}${student.lastName[0]}`}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm tracking-tight">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <FaCircle size={6} className={student.isActive ? 'text-black' : 'text-gray-300'} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${student.isActive ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-tight bg-gray-100 text-gray-700">
                      {student.section}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center text-sm font-medium text-gray-600">{student.year}</td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-sm font-bold text-gray-900">
                      {student.attendancePercentage !== null ? `${student.attendancePercentage}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setStudentToEdit(student); setIsEditModalOpen(true); }}
                        className="p-2 text-black hover:bg-gray-200 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setStudentToDelete(student); setIsDeleteModalOpen(true); }}
                        className="p-2 text-black hover:bg-gray-200 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRoster.length === 0 && (
            <div className="py-20 text-center animate-in fade-in duration-500">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">No student records found in this section</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddStudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onStudentAdded={fetchData}
      />
      
      {studentToEdit && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          student={studentToEdit}
          onStudentUpdated={fetchData}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Archive Record"
        message={`Confirm permanent deletion of ${studentToDelete?.name} from active student registry.`}
      />
    </div>
  );
};

export default CourseRosterPage;
