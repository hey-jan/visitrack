'use client';

import React, { useState, useEffect } from 'react';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClass: any) => void;
  course: any; // Using 'course' prop name to avoid breaking parent for now, but it contains class data
}

const EditClassModal: React.FC<EditClassModalProps> = ({ isOpen, onClose, onSave, course: cls }) => {
  const [formData, setFormData] = useState(cls || {});

  useEffect(() => {
    setFormData(cls || {});
  }, [cls]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ 
      ...prev, 
      [name]: name === 'units' ? parseInt(value) || '' : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/classes/${cls.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updatedClass = await res.json();
        onSave(updatedClass);
        onClose();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update class');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      alert('An error occurred while updating the class');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Class</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Sched. No.</label>
            <input
              type="text"
              name="schedule"
              required
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={formData.schedule || ''}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Class Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={formData.name || ''}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Time</label>
              <input
                type="text"
                name="time"
                required
                className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                value={formData.time || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Days</label>
              <input
                type="text"
                name="days"
                required
                className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                value={formData.days || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Room</label>
              <input
                type="text"
                name="room"
                required
                className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                value={formData.room || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Units</label>
              <input
                type="number"
                name="units"
                required
                className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                value={formData.units || ''}
                onChange={handleChange}
              />
            </div>
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

export default EditClassModal;
