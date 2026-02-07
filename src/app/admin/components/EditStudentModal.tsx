'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaCamera } from 'react-icons/fa';
import CameraView from './CameraView';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, onClose, student }) => {
  const [formData, setFormData] = useState(student);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<{ front?: string; left?: string; right?: string }>({});

  useEffect(() => {
    setFormData(student);
    // Assuming student object might have existing photo URLs in an object
    setCapturedPhotos(student?.photoUrls || {}); 
  }, [student]);

  if (!isOpen) return null;

  const handleCapture = useCallback((images: { front: string; left: string; right: string }) => {
    setCapturedPhotos(images);
  }, []);

  const handleBack = useCallback(() => {
    setShowCamera(false);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg">
        {showCamera ? (
          <CameraView onBack={handleBack} onCapture={handleCapture} />
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Student</h2>
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                  value={formData?.name.split(' ')[0] || ''}
                  onChange={e => setFormData({ ...formData, name: `${e.target.value} ${formData.name.split(' ')[1]}` })}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                  value={formData?.name.split(' ')[1] || ''}
                  onChange={e => setFormData({ ...formData, name: `${formData.name.split(' ')[0]} ${e.target.value}` })}
                />
              </div>
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Course"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                  value={formData?.course || ''}
                  onChange={e => setFormData({ ...formData, course: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  placeholder="Section"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                  value={formData?.section || ''}
                  onChange={e => setFormData({ ...formData, section: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Year"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900"
                  value={formData?.year || ''}
                  onChange={e => setFormData({ ...formData, year: e.target.value })}
                />
              </div>

              {Object.keys(capturedPhotos).length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">Student Photos:</p>
                  <div className="grid grid-cols-3 gap-4">
                    {capturedPhotos.front && <img src={capturedPhotos.front} alt="Front profile" className="rounded-lg" />}
                    {capturedPhotos.left && <img src={capturedPhotos.left} alt="Left profile" className="rounded-lg" />}
                    {capturedPhotos.right && <img src={capturedPhotos.right} alt="Right profile" className="rounded-lg" />}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="w-full bg-gray-200 text-gray-800 px-6 py-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaCamera />
                  {Object.keys(capturedPhotos).length > 0 ? 'Change Photos' : 'Open Camera'}
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
                  className="bg-.black text-white px-6 py-3 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EditStudentModal;
