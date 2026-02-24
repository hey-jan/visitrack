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

  useEffect(() => {
    setFormData(student);
  }, [student]);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, year: parseInt(formData.year) }),
      });

      if (response.ok) {
        onStudentUpdated();
        onClose();
      } else {
        console.error('Failed to update student');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student Profile">
      <form onSubmit={handleSubmit}>
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
              type="text"
              name="year"
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
