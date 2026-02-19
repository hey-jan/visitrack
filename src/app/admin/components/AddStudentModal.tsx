'use client';

import React, { useState, useEffect } from 'react';
import { FaCamera } from 'react-icons/fa';
import CameraView from './CameraView';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: () => void;
}

interface Course {
  id: string;
  courseName: string;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onStudentAdded }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    courseId: '',
    year: '',
    section: '',
  });

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
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, year: parseInt(formData.year) }),
      });

      if (response.ok) {
        onStudentAdded();
        onClose();
      } else {
        console.error('Failed to add student');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg">
        {showCamera ? (
          <CameraView onBack={() => setShowCamera(false)} />
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Student</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                  onChange={handleChange}
                  value={formData.firstName}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                  onChange={handleChange}
                  value={formData.lastName}
                />
              </div>
              <div className="mb-6">
                <select
                  name="courseId"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                  onChange={handleChange}
                  value={formData.courseId}
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
                  onChange={handleChange}
                  value={formData.year}
                />
                <input
                  type="text"
                  name="section"
                  placeholder="Section"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                  onChange={handleChange}
                  value={formData.section}
                />
              </div>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="w-full bg-gray-200 text-gray-800 px-6 py-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaCamera />
                  Open Camera
                </button>
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
                  Add Student
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AddStudentModal;
