'use client';

import React, { useState } from 'react';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newClass: any) => void;
}

const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    schedule: '',
    time: '',
    days: '',
    room: '',
    units: '',
    instructorId: 'cm7e3m2v50000ux3v8h3v8h3v', // Placeholder instructor ID, in a real app this would be a dropdown
  });

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
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const newClass = await res.json();
        onSave(newClass);
        onClose();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add class');
      }
    } catch (error) {
      console.error('Error adding class:', error);
      alert('An error occurred while adding the class');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Class</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Sched. No.</label>
            <input
              type="text"
              name="schedule"
              required
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
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
              Add Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;
