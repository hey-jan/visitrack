'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

interface AddInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstructorAdded: () => void;
}

interface Class {
  id: string;
  name: string;
  schedule: string;
}

const AddInstructorModal: React.FC<AddInstructorModalProps> = ({ isOpen, onClose, onInstructorAdded }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchClasses();
    }
  }, [isOpen]);

  const fetchClasses = async () => {
    setIsLoadingClasses(true);
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClassIds(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          classIds: selectedClassIds,
        }),
      });

      if (response.ok) {
        onInstructorAdded();
        onClose();
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
        });
        setSelectedClassIds([]);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to register instructor.');
      }
    } catch (error) {
      setError('An unexpected error occurred.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Instructor">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[10px] font-bold uppercase tracking-wider text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
            <input
              type="text"
              name="firstName"
              required
              placeholder="e.g. John"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all"
              onChange={handleChange}
              value={formData.firstName}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              required
              placeholder="e.g. Doe"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all"
              onChange={handleChange}
              value={formData.lastName}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
          <input
            type="email"
            name="email"
            required
            placeholder="instructor@university.edu"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all"
            onChange={handleChange}
            value={formData.email}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Initial Password</label>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all"
            onChange={handleChange}
            value={formData.password}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Classes</label>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
            {isLoadingClasses ? (
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center py-4">Loading classes...</p>
            ) : classes.length === 0 ? (
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center py-4">No classes available</p>
            ) : (
              classes.map((cls) => (
                <label key={cls.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                  <input
                    type="checkbox"
                    checked={selectedClassIds.includes(cls.id)}
                    onChange={() => handleClassToggle(cls.id)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">{cls.name}</span>
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{cls.schedule}</span>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white px-10 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Register Instructor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddInstructorModal;
