'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { FaEnvelope, FaCalendarAlt, FaBookOpen, FaHashtag } from 'react-icons/fa';

interface ViewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

const ViewStudentModal: React.FC<ViewStudentModalProps> = ({ isOpen, onClose, student }) => {
  if (!student) return null;

  const registrationDate = new Date(student.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Profile" maxWidth="max-w-2xl">
      <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-6">
          {/* Professional Header */}
          <div className="flex items-center space-x-5 bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <div className="h-20 w-20 rounded-xl bg-black flex items-center justify-center shrink-0 shadow-lg text-white text-2xl font-black italic tracking-tighter">
              {getInitials(student.name)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">{student.name}</h3>
                  <p className="text-gray-500 text-sm flex items-center mt-0.5">
                    <FaEnvelope className="mr-2 opacity-70" size={12} />
                    {student.email || 'No email registered'}
                  </p>
                </div>
                <span className="bg-black text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  {student.courseName}
                </span>
              </div>
              
              <div className="flex gap-4 mt-3">
                <div className="flex items-center text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100 uppercase tracking-tight">
                  <FaHashtag className="mr-1.5 opacity-50" size={9} />
                  ID: {student.id.substring(0, 8).toUpperCase()}
                </div>
                <div className="flex items-center text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100 uppercase tracking-tight">
                  <FaCalendarAlt className="mr-1.5 opacity-50" size={9} />
                  Joined {registrationDate}
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Academic Year</p>
              <p className="text-gray-900 font-black">Year {student.year}</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Section</p>
              <p className="text-gray-900 font-black">Section {student.section}</p>
            </div>
          </div>

          {/* Subjects Section */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4 px-1">
              <h4 className="text-xs font-black text-black uppercase tracking-tight flex items-center italic">
                <FaBookOpen className="mr-2" />
                Enrolled Subjects
              </h4>
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {student.enrollments?.length || 0} Total
              </span>
            </div>
            
            {student.enrollments && student.enrollments.length > 0 ? (
              <div className="space-y-2">
                {student.enrollments.map((enrollment: any) => (
                  <div 
                    key={enrollment.classId} 
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-black text-[10px] font-black border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                        {enrollment.class.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{enrollment.class.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium">
                          {enrollment.class.days} • {enrollment.class.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Room</p>
                      <p className="text-xs font-black text-black">{enrollment.class.room}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-bold uppercase">No Enrolled Subjects</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Close Button at bottom */}
      <div className="pt-6">
        <button 
          onClick={onClose}
          className="w-full bg-black text-white text-xs font-black py-4 rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98] uppercase tracking-widest shadow-lg shadow-gray-200 italic"
        >
          Close Profile
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #000;
        }
      `}</style>
    </Modal>
  );
};

export default ViewStudentModal;
