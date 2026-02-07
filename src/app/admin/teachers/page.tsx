'use client';

import React, { useState, useMemo } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { teachers as teachersData } from '@/data/teachers';
import AddTeacherModal from '../components/AddTeacherModal';

interface Teacher {
  id: string;
  fullName: string;
  department: string;
  email: string;
}

const ManageTeachersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<any>(null);
  const [teacherToEdit, setTeacherToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [teachers, setTeachers] = useState(teachersData);

  const departments = useMemo(() => ['All Departments', ...Array.from(new Set(teachers.map(t => t.department)))], [teachers]);

  const filteredTeachers = useMemo(() =>
    teachers.filter(teacher => {
      const searchMatch = teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          teacher.department.toLowerCase().includes(searchTerm.toLowerCase());
      const departmentMatch = selectedDepartment === 'All Departments' || teacher.department === selectedDepartment;
      return searchMatch && departmentMatch;
    }),
    [teachers, searchTerm, selectedDepartment]
  );

  const handleDeleteClick = (teacher: any) => {
    setTeacherToDelete(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    console.log('Deleting teacher:', teacherToDelete);
    // Here you would typically make an API call to delete the teacher
    setIsDeleteModalOpen(false);
    setTeacherToDelete(null);
  };

  const handleEditClick = (teacher: any) => {
    setTeacherToEdit(teacher);
    setIsEditModalOpen(true);
  };

  const handleAddTeacher = (teacher: Teacher) => {
    setTeachers([...teachers, teacher]);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Manage Teachers</h1>
        <p className="text-gray-500">Add, edit, or remove teacher records</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers..."
                className="w-96 bg-gray-100 border-none rounded-lg pl-12 pr-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-300"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select 
                className="bg-gray-100 border-none rounded-lg pl-4 pr-10 py-3 text-gray-900 focus:ring-2 focus:ring-gray-300 appearance-none"
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
              >
                {departments.map(department => <option key={department} value={department}>{department}</option>)}
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
            Add Teacher
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-4">Full Name</th>
              <th className="py-4">Department</th>
              <th className="py-4">Email</th>
              <th className="py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((teacher, index) => (
              <tr key={index} className="border-b border-gray-200 last:border-b-0">
                <td className="py-4 font-semibold text-gray-900">{teacher.fullName}</td>
                <td className="py-4 text-gray-500">{teacher.department}</td>
                <td className="py-4 text-gray-500">{teacher.email}</td>
                <td className="py-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEditClick(teacher)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(teacher)}
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

      <AddTeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTeacher}
      />
    </div>
  );
};

export default ManageTeachersPage;
