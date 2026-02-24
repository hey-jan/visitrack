'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import AddStudentModal from '@/components/features/admin/students/AddStudentModal';
import ConfirmationModal from '@/components/features/shared/ConfirmationModal';
import EditStudentModal from '@/components/features/admin/students/EditStudentModal';

const ManageStudentsPage = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [studentToEdit, setStudentToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data.map((student: any) => ({
        ...student,
        name: `${student.firstName} ${student.lastName}`,
        courseName: student.course?.courseName || 'N/A'
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

  const courses = useMemo(() => {
    const courseSet = new Set(students.map(s => s.courseName));
    return ['All Courses', ...Array.from(courseSet)];
  }, [students]);

  const filteredStudents = useMemo(() =>
    students.filter(student => {
      const searchMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.courseName.toLowerCase().includes(searchTerm.toLowerCase());
      const courseMatch = selectedCourse === 'All Courses' || student.courseName === selectedCourse;
      return searchMatch && courseMatch;
    }),
    [students, searchTerm, selectedCourse]
  );

  const handleDeleteClick = (e: React.MouseEvent, student: any) => {
    e.stopPropagation();
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      const res = await fetch(`/api/students/${studentToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchStudents();
      } else {
        console.error('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleEditClick = (e: React.MouseEvent, student: any) => {
    e.stopPropagation();
    setStudentToEdit(student);
    setIsEditModalOpen(true);
  };

  const handleRowClick = (student: any) => {
    router.push(`/admin/students/${student.id}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Directory</h1>
        <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Academic Records & Management</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-30" />
              <input
                type="text"
                placeholder="Search database..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-64">
              <select 
                className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none appearance-none transition-all font-medium"
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
              >
                {courses.map(course => <option key={course} value={course}>{course}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-black opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-black text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 font-bold text-sm shadow-lg shadow-gray-200"
          >
            <FaPlus size={14} />
            Add New Record
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Full Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Program</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Level</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Section</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student, index) => (
                  <tr 
                    key={student.id || index} 
                    onClick={() => handleRowClick(student)}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className="h-9 w-9 bg-black text-white rounded-lg flex items-center justify-center font-bold text-[10px] mr-4 shadow-sm group-hover:scale-105 transition-transform">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-black bg-gray-100 px-2.5 py-1 rounded-md tracking-tight uppercase">{student.courseName}</span>
                    </td>
                    <td className="px-8 py-5 text-center text-sm font-medium text-gray-600">Year {student.year}</td>
                    <td className="px-8 py-5 text-center text-sm font-medium text-gray-600 uppercase">{student.section}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditClick(e, student)}
                          className="p-2 text-black hover:bg-gray-200 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, student)}
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
          )}
        </div>
      </div>

      <AddStudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onStudentAdded={fetchStudents}
      />
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Archive Record"
        message={`Confirm permanent deletion of ${studentToDelete?.name} from active student directory.`}
      />
      {studentToEdit && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          student={studentToEdit}
          onStudentUpdated={fetchStudents}
        />
      )}
    </div>
  );
};

export default ManageStudentsPage;
