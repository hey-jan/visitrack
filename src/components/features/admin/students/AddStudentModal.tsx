'use client';

import React, { useState, useEffect } from 'react';
import { FaCamera } from 'react-icons/fa';
import CameraView from './CameraView';
import Modal from '@/components/ui/Modal';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: () => void;
}

interface Course {
  id: string;
  courseName: string;
}

interface Class {
  id: string;
  name: string;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onStudentAdded }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [capturedImages, setCapturedImages] = useState<{ front: string; left: string; right: string } | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    courseId: '',
    year: '',
    section: '',
  });

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        courseId: '',
        year: '',
        section: '',
      });
      setCapturedImages(null);
      setShowCamera(false);
      setSelectedClasses([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [coursesRes, classesRes] = await Promise.all([
            fetch('/api/courses'),
            fetch('/api/classes')
          ]);
          const coursesData = await coursesRes.json();
          const classesData = await classesRes.json();
          setCourses(coursesData);
          setClasses(classesData);
        } catch (error) {
          console.error('Failed to fetch data:', error);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId) 
        : [...prev, classId]
    );
  };

  const handleCapture = (images: { front: string; left: string; right: string }) => {
    setCapturedImages(images);
    setShowCamera(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare facial data if images were captured
      let facialData = undefined;
      
      if (capturedImages) {
        // Upload each image and get the URL
        const uploadPromises = Object.entries(capturedImages).map(async ([key, base64]) => {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64, subDir: 'facial-data' }),
          });
          const data = await res.json();
          return {
            embedding: JSON.stringify(Array.from({ length: 128 }, () => Math.random())),
            thumbnailUrl: data.imageUrl,
            key // keep track of which view it is
          };
        });

        const uploadedImages = await Promise.all(uploadPromises);
        facialData = uploadedImages.map(({ embedding, thumbnailUrl }) => ({ embedding, thumbnailUrl }));
        
        // Use the front image as the main profile picture
        const frontImage = uploadedImages.find(img => img.key === 'front');
        if (frontImage) {
          (formData as any).imageUrl = frontImage.thumbnailUrl;
        }
      }

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...formData, 
          year: parseInt(formData.year),
          facialData,
          classIds: selectedClasses
        }),
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
    <Modal isOpen={isOpen} onClose={onClose} title={showCamera ? 'Facial Enrollment' : 'Add New Student'}>
      {showCamera ? (
        <CameraView onBack={() => setShowCamera(false)} onCapture={handleCapture} />
      ) : (
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
                onChange={handleChange}
                value={formData.firstName}
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
                onChange={handleChange}
                value={formData.lastName}
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
              value={formData.courseId}
            >
              <option value="">Select a Program</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1">Year Level</label>
              <input
                type="text"
                name="year"
                required
                placeholder="e.g. 1"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-400 transition-all"
                onChange={handleChange}
                value={formData.year}
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
                onChange={handleChange}
                value={formData.section}
              />
            </div>
          </div>

          {/* Class Enrollment Section */}
          <div className="mb-6">
            <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1 block mb-2">Class Enrollment</label>
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 max-h-40 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-2">
                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <label key={cls.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-all cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black transition-all cursor-pointer"
                        checked={selectedClasses.includes(cls.id)}
                        onChange={() => handleClassToggle(cls.id)}
                      />
                      <span className="text-xs font-bold text-black uppercase tracking-tight">{cls.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400 italic text-center py-2 uppercase font-bold tracking-widest">No classes available</p>
                )}
              </div>
            </div>
          </div>

          {capturedImages && (
            <div className="mb-4">
              <label className="text-[10px] uppercase font-black text-black tracking-widest ml-1 block mb-1.5">Captured Profiles</label>
              <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <img src={capturedImages.front} alt="Front" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <img src={capturedImages.left} alt="Left" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <img src={capturedImages.right} alt="Right" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className={`w-full ${capturedImages ? 'bg-gray-50 text-black border border-gray-100' : 'bg-neutral-900 text-white'} px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-all group`}
            >
              <FaCamera className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] uppercase font-black tracking-widest">
                {capturedImages ? 'Retake Photos' : 'Enroll Facial Data'}
              </span>
            </button>
            <p className="text-center text-[9px] text-black mt-2 font-black italic">
              Required for AI attendance recognition
            </p>
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
              Save Student
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AddStudentModal;
