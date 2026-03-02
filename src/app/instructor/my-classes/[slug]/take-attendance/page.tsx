'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaCamera, FaUserCheck, FaStop, FaPlay, FaCheckCircle, FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Webcam from 'react-webcam';
import BackButton from '@/components/features/shared/BackButton';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  facialData: { embedding: string }[];
}

interface ClassDetails {
  id: string;
  code: string;
  days: string;
  time: string;
  students: Student[];
}

const TakeAttendancePage = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [detectedStudents, setDetectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [recognitionResults, setRecognitionResults] = useState<any[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        return data.display_name;
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
    return null;
  };

  useEffect(() => {
    const fetchClassAndStatus = async () => {
      try {
        const today = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });
        const [classRes, attendanceRes] = await Promise.all([
          fetch(`/api/classes/${slug}`),
          fetch(`/api/attendance/${slug}?date=${encodeURIComponent(today)}`)
        ]);

        if (classRes.ok) {
          const data = await classRes.json();
          setClassDetails(data);
        }

        if (attendanceRes.ok) {
          const existingAttendance = await attendanceRes.json();
          if (existingAttendance && existingAttendance.length > 0) {
            setIsAlreadyCompleted(true);
            const presentIds = existingAttendance
              .filter((rec: any) => rec.status === 'Present' || rec.status === 'Late')
              .map((rec: any) => rec.student.id);
            setDetectedStudents(new Set(presentIds));
            
            // If session exists, it might have location data
            if (existingAttendance[0].session) {
              const sess = existingAttendance[0].session;
              if (sess.latitude && sess.longitude) {
                setLocation({ 
                  latitude: sess.latitude, 
                  longitude: sess.longitude,
                  address: sess.address 
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClassAndStatus();
  }, [slug]);

  // Recognition Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const captureRecognition = async () => {
      if (!webcamRef.current || !isSessionActive || !classDetails) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      try {
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        
        const formData = new FormData();
        formData.append('file', blob, 'capture.jpg');
        
        const allowedIds = classDetails.students.map(s => s.firstName.toLowerCase()).join(',');
        formData.append('allowed_ids', allowedIds);

        const recognizeRes = await fetch('http://localhost:8001/recognize', {
          method: 'POST',
          body: formData,
        });

        if (recognizeRes.ok) {
          const data = await recognizeRes.json();
          setRecognitionResults(data.results);
          
          data.results.forEach((result: any) => {
            if (result.name !== "Unknown") {
              const student = classDetails.students.find(
                s => `${s.firstName.toLowerCase()}` === result.name.toLowerCase() || 
                     `${s.firstName.toLowerCase()}_${s.lastName.toLowerCase()}` === result.name.toLowerCase() ||
                     s.id === result.name
              );
              
              if (student) {
                setDetectedStudents(prev => new Set([...Array.from(prev), student.id]));
              }
            }
          });
        }
      } catch (error) {
        console.error('Recognition API error:', error);
      }
    };

    if (isSessionActive) {
      interval = setInterval(captureRecognition, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
      setRecognitionResults([]);
    };
  }, [isSessionActive, classDetails, slug]);

  // Drawing Canvas Overlay
  useEffect(() => {
    if (!canvasRef.current || !webcamRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (recognitionResults.length > 0) {
      recognitionResults.forEach(result => {
        const [x1, y1, x2, y2] = result.bbox;
        const width = x2 - x1;
        const height = y2 - y1;

        ctx.strokeStyle = result.name === "Unknown" ? '#ef4444' : '#22c55e';
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, width, height);

        ctx.fillStyle = result.name === "Unknown" ? '#ef4444' : '#22c55e';
        const label = `${result.name} (${Math.round(result.confidence * 100)}%)`;
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(x1, y1 - 25, textWidth + 10, 25);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(label, x1 + 5, y1 - 8);
      });
    }
  }, [recognitionResults]);

  const toggleSession = async () => {
    if (isAlreadyCompleted) return;

    if (!isSessionActive) {
      // Get location when starting session
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const address = await reverseGeocode(lat, lon);
            
            setLocation({
              latitude: lat,
              longitude: lon,
              address: address || undefined
            });
            setLocationError(null);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationError("Location access denied or unavailable.");
          }
        );
      } else {
        setLocationError("Geolocation is not supported by your browser.");
      }

      try {
        await fetch('http://localhost:8001/sync', { method: 'POST' });
      } catch (error) {
        console.error('Failed to sync recognition backend:', error);
      }
    }
    setIsSessionActive(!isSessionActive);
  };

  const handleFinishSession = async () => {
    if (!classDetails) return;

    setIsSessionActive(false);
    setRecognitionResults([]);

    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    
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
        body: JSON.stringify({
          records: attendanceRecords,
          latitude: location?.latitude,
          longitude: location?.longitude,
          address: location?.address
        }),
      });

      if (res.ok) {
        setIsAlreadyCompleted(true);
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
        <div className="space-y-4">
          <BackButton variant="text" label="Back" />
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Attendance Session</h1>
            {location && (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                <FaMapMarkerAlt size={10} /> {location.address ? 'Location Verified' : 'Location Captured'}
              </div>
            )}
            {locationError && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                <FaMapMarkerAlt size={10} /> {locationError}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-black text-white bg-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">
              {classDetails.code}
            </span>
            <div className="h-4 w-px bg-gray-200 mx-1"></div>
            <div className="flex items-center gap-2 bg-gray-50 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100">
              <FaCalendarAlt size={10} /> {classDetails.days}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100">
              <FaClock size={10} /> {classDetails.time}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {isAlreadyCompleted ? (
            <div className="bg-green-50 text-green-700 px-8 py-3 rounded-xl flex items-center gap-3 font-bold text-xs uppercase tracking-widest border border-green-100 shadow-sm">
              <FaCheckCircle size={14} /> Session Completed
            </div>
          ) : !isSessionActive ? (
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
            {isAlreadyCompleted ? (
              <div className="flex flex-col items-center justify-center h-full bg-green-50/30 p-10 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <FaCheckCircle size={40} className="text-green-600" />
                </div>
                <p className="text-sm font-black text-green-800 uppercase tracking-[0.2em]">Attendance Recorded</p>
                <p className="text-[10px] text-green-600 mt-2 font-bold uppercase mb-4">Class: {classDetails.code} • {new Date().toLocaleDateString()}</p>
                
                {location && (
                  <div className="bg-white/50 backdrop-blur-sm border border-green-100 rounded-2xl p-4 max-w-md">
                    <p className="text-[10px] text-green-800 font-black uppercase tracking-widest flex items-center justify-center gap-2 mb-2">
                      <FaMapMarkerAlt size={10} /> Verified Location
                    </p>
                    <p className="text-xs font-bold text-gray-600 leading-relaxed">
                      {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                    </p>
                  </div>
                )}
              </div>
            ) : isSessionActive ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  width={640}
                  height={480}
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #000; }
      `}</style>
    </div>
  );
};

export default TakeAttendancePage;
