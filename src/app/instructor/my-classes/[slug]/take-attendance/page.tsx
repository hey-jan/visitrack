'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaCamera, FaUserCheck, FaStop, FaPlay } from 'react-icons/fa';
import Webcam from 'react-webcam';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  facialData: { embedding: string }[];
}

interface ClassDetails {
  id: string;
  name: string;
  students: Student[];
}

const TakeAttendancePage = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [detectedStudents, setDetectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await fetch(`/api/classes/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setClassDetails(data);
        }
      } catch (error) {
        console.error('Failed to fetch class details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [slug]);

  const toggleSession = () => {
    setIsSessionActive(!isSessionActive);
  };

  const handleFinishSession = async () => {
    if (!classDetails) return;

    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = classDetails.students.map(student => ({
      studentId: student.id,
      status: detectedStudents.has(student.id) ? 'Present' : 'Absent',
      time: detectedStudents.has(student.id) ? new Date().toLocaleTimeString() : null,
      date: today
    }));

    try {
      const res = await fetch(`/api/attendance/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceRecords),
      });

      if (res.ok) {
        router.push(`/instructor/my-classes/${slug}`);
      }
    } catch (error) {
      console.error('Failed to save attendance:', error);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Session...</div>;
  if (!classDetails) return <div className="p-10 text-center text-red-500">Class not found.</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center text-black hover:opacity-60 transition-all text-xs font-bold uppercase tracking-widest mb-4"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Attendance Session</h1>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">{classDetails.name}</p>
        </div>

        <div className="flex gap-4">
          {!isSessionActive ? (
            <button
              onClick={toggleSession}
              className="bg-black text-white px-8 py-3 rounded-xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
            >
              <FaPlay size={12} /> Start Scanner
            </button>
          ) : (
            <button
              onClick={handleFinishSession}
              className="bg-green-600 text-white px-8 py-3 rounded-xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg"
            >
              <FaUserCheck size={14} /> Finish & Save
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-video bg-gray-100 rounded-3xl border-4 border-white shadow-2xl overflow-hidden group">
            {isSessionActive ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-black/20 pointer-events-none animate-pulse"></div>
                <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Recognition Active</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FaCamera size={48} className="mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">Scanner Offline</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-125">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-xs font-black text-black uppercase tracking-widest flex items-center">
              <FaUserCheck className="mr-3" /> Detected Students
              <span className="ml-auto bg-black text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                {detectedStudents.size} / {classDetails.students.length}
              </span>
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {classDetails.students.map(student => (
              <div 
                key={student.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  detectedStudents.has(student.id) 
                    ? 'bg-green-50 border-green-100' 
                    : 'bg-white border-gray-50'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">{student.firstName} {student.lastName}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                    {detectedStudents.has(student.id) ? 'Status: Present' : 'Status: Waiting...'}
                  </p>
                </div>
                {detectedStudents.has(student.id) && (
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                    <FaUserCheck size={10} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeAttendancePage;
