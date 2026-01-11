'use client';

import React, { useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import CameraView from './CameraView';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose }) => {
  const [showCamera, setShowCamera] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg">
        {showCamera ? (
          <CameraView onBack={() => setShowCamera(false)} />
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Student</h2>
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <input
                  type="text"
                  placeholder="Course"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Section"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Year"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
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
