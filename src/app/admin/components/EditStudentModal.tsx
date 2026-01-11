'use client';

import React, { useState, useEffect } from 'react';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, onClose, student }) => {
  const [formData, setFormData] = useState(student);

  useEffect(() => {
    setFormData(student);
  }, [student]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Student</h2>
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input
              type="text"
              placeholder="First Name"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={formData?.name.split(' ')[0] || ''}
              onChange={e => setFormData({ ...formData, name: `${e.target.value} ${formData.name.split(' ')[1]}` })}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={formData?.name.split(' ')[1] || ''}
              onChange={e => setFormData({ ...formData, name: `${formData.name.split(' ')[0]} ${e.target.value}` })}
            />
          </div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Course"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={formData?.course || ''}
              onChange={e => setFormData({ ...formData, course: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input
              type="text"
              placeholder="Section"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={formData?.section || ''}
              onChange={e => setFormData({ ...formData, section: e.target.value })}
            />
            <input
              type="text"
              placeholder="Year"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={formData?.year || ''}
              onChange={e => setFormData({ ...formData, year: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
