'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import ClassSelector from '@/components/features/shared/ClassSelector';

interface AddInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstructorAdded: () => void;
}

const AddInstructorModal: React.FC<AddInstructorModalProps> = ({ isOpen, onClose, onInstructorAdded }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
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
        // SHOW ONLY: Classes that have NO instructor assigned
        setClasses(data.filter((c: any) => !c.instructorId));
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
          {isLoadingClasses ? (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest animate-pulse">Loading classes...</p>
            </div>
          ) : (
            <ClassSelector 
              classes={classes}
              selectedIds={selectedClassIds}
              onToggle={handleClassToggle}
              emptyMessage="No classes available for assignment"
            />
          )}
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
