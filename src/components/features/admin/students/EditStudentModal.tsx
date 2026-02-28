'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onStudentUpdated: () => void;
}

interface Course {
  id: string;
  courseName: string;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, onClose, student, onStudentUpdated }) => {
  const [formData, setFormData] = useState(student);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData(student);
    setError(null);
  }, [student, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchCourses = async () => {
        try {
          const res = await fetch('/api/courses');
          const data = await res.json();
          setCourses(data);
        } catch (error) {
          console.error('Failed to fetch courses:', error);
        }
      };
      fetchCourses();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, year: parseInt(formData.year) }),
      });

      const data = await response.json();

      if (response.ok) {
        onStudentUpdated();
        onClose();
      } else {
        setError(data.error || 'Failed to update student');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('An error occurred:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student Profile">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold uppercase tracking-tight">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Student ID (Official)</label>
          <input
            type="text"
            name="studentNumber"
            required
            placeholder="e.g. 22655005"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-400 transition-all font-bold"
            value={formData?.studentNumber || ''}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">First Name</label>
            <input
              type="text"
              name="firstName"
              required
              placeholder="e.g. John"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-400 transition-all"
              value={formData?.firstName || ''}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              required
              placeholder="e.g. Doe"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-400 transition-all"
              value={formData?.lastName || ''}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 mb-4">
          <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Academic Program</label>
          <select
            name="courseId"
            required
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none"
            onChange={handleChange}
            value={formData?.courseId || ''}
          >
            <option value="">Select a Program</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.courseName}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Year Level</label>
            <input
              type="number"
              name="year"
              min="1"
              required
              placeholder="e.g. 1"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-400 transition-all"
              value={formData?.year || ''}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Section</label>
            <input
              type="text"
              name="section"
              required
              placeholder="e.g. A"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-400 transition-all"
              value={formData?.section || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Status Toggle */}
        <div className="mb-8 px-1">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-black tracking-widest mb-0.5">Record Status</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Active Students are visible in rosters</span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                name="isActive"
                className="sr-only"
                checked={formData?.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <div className={`w-10 h-5 rounded-full transition-colors ${formData?.isActive ? 'bg-black' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${formData?.isActive ? 'translate-x-5' : ''}`}></div>
              </div>
            </div>
          </label>
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
            Update Record
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditStudentModal;
