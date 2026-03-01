'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import InstructorSelector from '@/components/features/shared/InstructorSelector';

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClass: any) => void;
  course: any; 
}

const EditClassModal: React.FC<EditClassModalProps> = ({ isOpen, onClose, onSave, course: cls }) => {
  const [formData, setFormData] = useState(cls || {});
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(false);

  useEffect(() => {
    setFormData(cls || {});
  }, [cls]);

  useEffect(() => {
    if (isOpen) {
      const fetchInstructors = async () => {
        setIsLoadingInstructors(true);
        try {
          const res = await fetch('/api/instructors');
          if (res.ok) {
            const data = await res.json();
            setInstructors(data);
          }
        } catch (error) {
          console.error('Failed to fetch instructors:', error);
        } finally {
          setIsLoadingInstructors(false);
        }
      };
      fetchInstructors();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ 
      ...prev, 
      [name]: name === 'units' ? parseInt(value) || '' : value 
    }));
  };

  const handleInstructorSelect = (id: string) => {
    setFormData((prev: any) => ({ ...prev, instructorId: id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/classes/${cls.slug || cls.id}`, {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Class Details">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Schedule No.</label>
            <input
              type="text"
              name="schedule"
              required
              placeholder="e.g. 12345"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all font-bold"
              value={formData.schedule || ''}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Class Code</label>
            <input
              type="text"
              name="code"
              required
              placeholder="e.g. CS-101"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all font-bold"
              value={formData.code || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 mb-4">
          <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Descriptive Title</label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Computer Science Fundamentals"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all"
            value={formData.title || ''}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Time</label>
            <input
              type="text"
              name="time"
              required
              placeholder="e.g. 9:00 AM"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all"
              value={formData.time || ''}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Days</label>
            <input
              type="text"
              name="days"
              required
              placeholder="e.g. MWF"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all"
              value={formData.days || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Room</label>
            <input
              type="text"
              name="room"
              required
              placeholder="e.g. Lab 1"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all"
              value={formData.room || ''}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Units</label>
            <input
              type="number"
              name="units"
              required
              placeholder="e.g. 3"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-300 transition-all"
              value={formData.units || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Shared Instructor Selector */}
        <div className="mb-8">
          <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1 block mb-2">Assign Instructor</label>
          <InstructorSelector 
            instructors={instructors}
            selectedId={formData.instructorId}
            onSelect={handleInstructorSelect}
            emptyMessage="No instructors available"
          />
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
            Update Class
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditClassModal;
