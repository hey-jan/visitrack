'use client';

import React, { useState } from 'react';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classItem: any) => void;
}

const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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
              name="schedNo"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Course No.</label>
            <input
              type="text"
              name="courseNo"
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
                className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Days</label>
              <input
                type="text"
                name="days"
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
                className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Units</label>
              <input
                type="number"
                name="units"
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
