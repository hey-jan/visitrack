'use client';

import React, { useState, useEffect } from 'react';

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Student</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={formData?.firstName || ''}
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={formData?.lastName || ''}
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <select
              name="courseId"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              onChange={handleChange}
              value={formData?.courseId || ''}
            >
              <option value="">Select a Course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input
              type="text"
              name="year"
              placeholder="Year"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={formData?.year || ''}
              onChange={handleChange}
            />
            <input
              type="text"
              name="section"
              placeholder="Section"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={formData?.section || ''}
              onChange={handleChange}
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
