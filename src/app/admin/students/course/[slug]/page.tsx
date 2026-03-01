'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaSearch, FaPlus, FaUsers, FaInfoCircle, FaGraduationCap, 
  FaLayerGroup, FaEdit, FaTrash, FaCheckCircle, FaChartBar, FaCalendarCheck,
  FaCode, FaLaptopCode, FaServer, FaBriefcase, FaCalculator, FaMicroscope
} from 'react-icons/fa';
import AddStudentModal from '@/components/features/admin/students/AddStudentModal';
import ConfirmationModal from '@/components/features/shared/ConfirmationModal';
import EditStudentModal from '@/components/features/admin/students/EditStudentModal';

import BackButton from '@/components/features/shared/BackButton';

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
      const res = await fetch(`/api/students?course=${slug}`, { cache: 'no-store' });
      const courseStudents = await res.json();
      
      if (courseStudents.length > 0) {
        setCourse(courseStudents[0].course);
      } else {
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

  // Course Icon Helper
  const getCourseIcon = (courseNo: string) => {
    const code = courseNo.toUpperCase();
    if (code.includes('CS')) return <FaCode />;
    if (code.includes('IT')) return <FaLaptopCode />;
    if (code.includes('IS')) return <FaServer />;
    if (code.includes('BA') || code.includes('BUS')) return <FaBriefcase />;
    if (code.includes('ACC')) return <FaCalculator />;
    if (code.includes('ENG')) return <FaMicroscope />;
    return <FaGraduationCap />;
  };

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center">
          <BackButton href="/admin/students" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight uppercase">Program Registry</h1>
            <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-[0.2em]">Academic Management • Directory</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-30" size={12} />
            <input
              type="text"
              placeholder="Search ID or Name..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all md:w-64 placeholder:text-gray-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-black text-white px-5 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 font-bold text-xs shadow-lg shadow-gray-200"
          >
            <FaPlus size={10} />
            <span>New Student</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Primary Card: Program Identity */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="h-12 w-12 rounded-xl bg-black text-white flex items-center justify-center text-lg shadow-lg shadow-black/10 shrink-0 transition-transform hover:scale-105">
            {getCourseIcon(course.courseNo)}
          </div>
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-0.5">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">Academic Program</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight leading-tight mb-1.5 wrap-break-word">
              {course.courseName}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <span className="text-[9px] font-mono font-bold text-white bg-black/80 px-2 py-0.5 rounded shadow-sm">
                {course.courseNo}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-l border-gray-200 pl-2.5">
                Master Registry
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Card 1: Enrollment Profile */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between hover:border-black transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-black group-hover:bg-black group-hover:text-white transition-colors">
                  <FaUsers size={14} />
                </div>
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Enrollment</h3>
              </div>
              <FaChartBar className="text-gray-100 group-hover:text-gray-200" size={20} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900 tabular-nums">{students.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Students</span>
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-3">Active Population</p>
          </div>

          {/* Card 2: Academic Groups */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between hover:border-black transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-black group-hover:bg-black group-hover:text-white transition-colors">
                  <FaLayerGroup size={14} />
                </div>
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Groups</h3>
              </div>
              <FaInfoCircle className="text-gray-100 group-hover:text-gray-200" size={20} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900 tabular-nums">{sections.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sections</span>
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-3">Class Blocks</p>
          </div>

          {/* Card 3: Registry Status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between hover:border-black transition-all group lg:col-span-1 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black rounded-lg text-white shadow-md shadow-black/10">
                  <FaCalendarCheck size={14} />
                </div>
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded-full border border-green-100">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-bold text-green-700 uppercase tracking-wider">Live</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900 tabular-nums">
                {students.filter(s => s.isActive).length}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified</span>
            </div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-3">Active Registry</p>
          </div>
        </div>
      </div>

      {/* Section Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All', ...sections].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
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
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center">
            <FaGraduationCap className="mr-3 text-black" size={16} />
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Master Registry Roster</h3>
          </div>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-white px-2.5 py-1 rounded-full border border-gray-100">
            {filteredRoster.length} Records Found
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-100">
                <th className="px-6 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Full Name</th>
                <th className="px-6 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">Program</th>
                <th className="px-6 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">Year</th>
                <th className="px-6 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center">Attendance</th>
                <th className="px-6 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRoster.length > 0 ? (
                filteredRoster.map((student: any) => (
                  <tr 
                    key={student.id} 
                    className={`group hover:bg-gray-50/80 transition-all cursor-default animate-in fade-in duration-500 ${!student.isActive ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-black rounded-lg overflow-hidden shadow-sm flex items-center justify-center text-white text-[9px] font-bold uppercase transition-transform group-hover:scale-105">
                          {`${student.firstName[0]}${student.lastName[0]}`}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm tracking-tight">{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tight bg-gray-100 text-gray-700">
                        {course.courseNo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-medium text-gray-600">
                      {student.year}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xs font-bold text-gray-900">
                          {student.attendancePercentage !== null ? `${student.attendancePercentage}%` : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => router.push(`/admin/students/${student.slug || student.id}`)}
                          className="bg-gray-50 hover:bg-black hover:text-white text-gray-400 text-[9px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-lg border border-gray-100 transition-all active:scale-95"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setStudentToEdit(student); setIsEditModalOpen(true); }}
                          className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                          title="Edit"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setStudentToDelete(student); setIsDeleteModalOpen(true); }}
                          className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                          title="Delete"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FaUsers size={40} className="text-gray-200" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">No student records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
