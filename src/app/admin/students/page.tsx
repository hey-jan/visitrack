'use client';

import React, { useState, useMemo } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import AddStudentModal from '../components/AddStudentModal';
import ConfirmationModal from '../components/ConfirmationModal';
import EditStudentModal from '../components/EditStudentModal';

import { students as studentsData } from '@/data/students';

const ManageStudentsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);
  const [studentToEdit, setStudentToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');

  const students = useMemo(() => studentsData, []);

  const courses = useMemo(() => ['All Courses', ...Array.from(new Set(students.map(s => s.course)))], [students]);

  const filteredStudents = useMemo(() =>
    students.filter(student => {
      const searchMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.course.toLowerCase().includes(searchTerm.toLowerCase());
      const courseMatch = selectedCourse === 'All Courses' || student.course === selectedCourse;
      return searchMatch && courseMatch;
    }),
    [students, searchTerm, selectedCourse]
  );

  const handleDeleteClick = (student: any) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    console.log('Deleting student:', studentToDelete);
    // Here you would typically make an API call to delete the student
    setIsDeleteModalOpen(false);
    setStudentToDelete(null);
  };

  const handleEditClick = (student: any) => {
    setStudentToEdit(student);
    setIsEditModalOpen(true);
  };

  const handleEditConfirm = (updatedStudent: any) => {
    console.log('Saving changes to student:', updatedStudent);
    // Here you would typically make an API call to update the student
    setIsEditModalOpen(false);
    setStudentToEdit(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Manage Students</h1>
        <p className="text-gray-500">Add, edit, or remove student records</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                className="w-96 bg-gray-100 border-none rounded-lg pl-12 pr-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-300"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select 
                className="bg-gray-100 border-none rounded-lg pl-4 pr-10 py-3 text-gray-900 focus:ring-2 focus:ring-gray-300 appearance-none"
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
              >
                {courses.map(course => <option key={course} value={course}>{course}</option>)}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                width="16"
                height="16"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-8 py-3 rounded-lg flex items-center gap-1"
          >
            <FaPlus />
            Add Student
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-4">Student Name</th>
              <th className="py-4">Course</th>
              <th className="py-4">Year</th>
              <th className="py-4">Section</th>
              <th className="py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={index} className="border-b border-gray-200 last:border-b-0">
                <td className="py-4 font-semibold text-gray-900">{student.name}</td>
                <td className="py-4 text-gray-500">{student.course}</td>
                <td className="py-4 text-gray-500">{student.year}</td>
                <td className="py-4 text-gray-500">{student.section}</td>
                <td className="py-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEditClick(student)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(student)}
                      className="text-black hover:text-gray-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddStudentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        message={`Are you sure you want to delete the student ${studentToDelete?.name}?`}
      />
      {studentToEdit && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          student={studentToEdit}
        />
      )}
    </div>
  );
};

export default ManageStudentsPage;
