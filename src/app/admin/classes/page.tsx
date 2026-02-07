'use client';

import React, { useState, useMemo } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmationModal from '../components/ConfirmationModal';
import EditClassModal from '../components/EditClassModal';

import AddClassModal from '../components/AddClassModal';

import { courses as classesData } from '@/data/classes';

const ManageClassesPage = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const classes = useMemo(() => classesData, []);

  const filteredClasses = useMemo(() =>
    classes.filter(classItem =>
      classItem.courseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.schedNo.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [classes, searchTerm]
  );

  const handleDeleteClick = (classItem: any) => {
    setClassToDelete(classItem);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    console.log('Deleting class:', classToDelete);
    // Here you would typically make an API call to delete the class
    setIsDeleteModalOpen(false);
    setClassToDelete(null);
  };

  const handleEditClick = (classItem: any) => {
    setClassToEdit(classItem);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (updatedClass: any) => {
    console.log('Updating class:', updatedClass);
    // Here you would typically make an API call to update the class
    setIsEditModalOpen(false);
    setClassToEdit(null);
  };

  const handleAddClass = () => {
    setIsAddModalOpen(true);
  };

  const handleAddSave = (newClass: any) => {
    console.log('Adding class:', newClass);
    // Here you would typically make an API call to add the class
    setIsAddModalOpen(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Manage Classes / Subjects</h1>
        <p className="text-gray-500">Add, edit, or remove class records</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search classes..."
              className="w-full bg-gray-100 border-none rounded-lg pl-12 pr-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-300"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddClass}
            className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <FaPlus />
            Add Class
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-4">Sched. No.</th>
              <th className="py-4">Course No.</th>
              <th className="py-4">Time</th>
              <th className="py-4">Days</th>
              <th className="py-4">Room</th>
              <th className="py-4">Units</th>
              <th className="py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((classItem, index) => (
              <tr key={index} className="border-b border-gray-200 last:border-b-0">
                <td className="py-4 font-semibold text-gray-900">{classItem.schedNo}</td>
                <td className="py-4 text-gray-500">{classItem.courseNo}</td>
                <td className="py-4 text-gray-500">{classItem.time}</td>
                <td className="py-4 text-gray-500">{classItem.days}</td>
                <td className="py-4 text-gray-500">{classItem.room}</td>
                <td className="py-4 text-gray-500">{classItem.units}</td>
                <td className="py-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleEditClick(classItem)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(classItem)}
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Class"
        message={`Are you sure you want to delete the class ${classToDelete?.courseNo}?`}
      />

      <EditClassModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        classItem={classToEdit}
      />

      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSave}
      />
    </div>
  );
};

export default ManageClassesPage;
