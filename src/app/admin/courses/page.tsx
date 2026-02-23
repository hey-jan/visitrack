'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmationModal from '@/components/features/shared/ConfirmationModal';
import EditClassModal from '@/components/features/admin/classes/EditClassModal';
import AddClassModal from '@/components/features/admin/classes/AddClassModal';

const ManageClassesPage = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/classes');
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = useMemo(() =>
    classes.filter(cls =>
      (cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (cls.schedule?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    ),
    [classes, searchTerm]
  );

  const handleDeleteClick = (cls: any) => {
    setClassToDelete(cls);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    console.log('Deleting class:', classToDelete);
    // Here you would typically make an API call to delete the class
    setIsDeleteModalOpen(false);
    setClassToDelete(null);
  };

  const handleEditClick = (cls: any) => {
    setClassToEdit(cls);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (updatedClass: any) => {
    console.log('Updating class:', updatedClass);
    fetchClasses();
    setIsEditModalOpen(false);
    setClassToEdit(null);
  };

  const handleAddClass = () => {
    setIsAddModalOpen(true);
  };

  const handleAddSave = (newClass: any) => {
    console.log('Adding class:', newClass);
    fetchClasses();
    setIsAddModalOpen(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Manage Classes</h1>
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

        {loading ? (
          <div className="text-center py-8">Loading classes...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="py-4">Sched. No.</th>
                <th className="py-4">Class Name</th>
                <th className="py-4">Time</th>
                <th className="py-4">Days</th>
                <th className="py-4">Room</th>
                <th className="py-4">Units</th>
                <th className="py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((cls, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0">
                  <td className="py-4 font-semibold text-gray-900">{cls.schedule || 'N/A'}</td>
                  <td className="py-4 text-gray-500">{cls.name}</td>
                  <td className="py-4 text-gray-500">{cls.time || 'N/A'}</td>
                  <td className="py-4 text-gray-500">{cls.days || 'N/A'}</td>
                  <td className="py-4 text-gray-500">{cls.room || 'N/A'}</td>
                  <td className="py-4 text-gray-500">{cls.units || 'N/A'}</td>
                  <td className="py-4">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleEditClick(cls)}
                        className="text-gray-500 hover:text-gray-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cls)}
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
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Class"
        message={`Are you sure you want to delete the class ${classToDelete?.name}?`}
      />

      <EditClassModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        course={classToEdit}
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
