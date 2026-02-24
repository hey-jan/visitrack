'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

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
    instructorId: '',
  });
  const [instructors, setInstructors] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchInstructors = async () => {
        try {
          const res = await fetch('/api/instructors');
          const data = await res.json();
          setInstructors(data);
        } catch (error) {
          console.error('Failed to fetch instructors:', error);
        }
      };
      fetchInstructors();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ 
      ...prev, 
      [name]: name === 'units' ? parseInt(value) || '' : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.instructorId) {
      alert('Please select an instructor');
      return;
    }
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
        // Reset form
        setFormData({
          name: '',
          schedule: '',
          time: '',
          days: '',
          room: '',
          units: '',
          instructorId: '',
        });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add class');
      }
    } catch (error) {
      console.error('Error adding class:', error);
      alert('An error occurred while adding the class');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Class">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Schedule No.</label>
            <input
              type="text"
              name="schedule"
              required
              placeholder="e.g. 12345"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all"
              onChange={handleChange}
              value={formData.schedule}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Class Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. CS 101"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all"
              onChange={handleChange}
              value={formData.name}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 mb-4">
          <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Assigned Instructor</label>
          <select
            name="instructorId"
            required
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none"
            onChange={handleChange}
            value={formData.instructorId}
          >
            <option value="">Select Instructor</option>
            {instructors.map((ins) => (
              <option key={ins.id} value={ins.id}>
                {ins.firstName} {ins.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Time</label>
            <input
              type="text"
              name="time"
              required
              placeholder="e.g. 9:00 AM"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all"
              onChange={handleChange}
              value={formData.time}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Days</label>
            <input
              type="text"
              name="days"
              required
              placeholder="e.g. MWF"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all"
              onChange={handleChange}
              value={formData.days}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Room</label>
            <input
              type="text"
              name="room"
              required
              placeholder="e.g. Lab 1"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all"
              onChange={handleChange}
              value={formData.room}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-1">Units</label>
            <input
              type="number"
              name="units"
              required
              placeholder="e.g. 3"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all"
              onChange={handleChange}
              value={formData.units}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-black text-white px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
          >
            Create Class
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddClassModal;
