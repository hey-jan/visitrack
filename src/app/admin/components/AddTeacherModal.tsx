'use client';

import React, { useState } from 'react';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (teacher: Teacher) => void;
}

interface Teacher {
  id: string;
  fullName: string;
  department: string;
  email: string;
}

const AddTeacherModal: React.FC<AddTeacherModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !department || !email) {
      alert('Please fill in all fields.');
      return;
    }

    const newTeacher: Teacher = {
      id: String(Math.random()), // Simple unique ID for mockup
      fullName: `${firstName} ${lastName}`,
      department,
      email,
    };

    onAdd(newTeacher);
    onClose();
    setFirstName('');
    setLastName('');
    setDepartment('');
    setEmail('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Teacher</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input
              type="text"
              placeholder="First Name"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Department"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              Add Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacherModal;
