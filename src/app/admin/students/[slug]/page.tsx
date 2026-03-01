'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaEnvelope, FaBookOpen, FaGraduationCap, FaSchool, FaUserGraduate, FaCamera, FaAward, FaCircle, FaPlus, FaTrash } from 'react-icons/fa';
import Modal from '@/components/ui/Modal';
import CameraView from '@/components/features/admin/students/CameraView';
import EnrollClassModal from '@/components/features/admin/students/EnrollClassModal';
import BackButton from '@/components/features/shared/BackButton';

const StudentProfilePage = () => {
  const { slug } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStudent = async () => {
    try {
      const res = await fetch(`/api/students/${slug}`);
      if (res.ok) {
        const foundStudent = await res.json();
        
        // Enforce slug in URL: If the current URL param matches the ID instead of the slug, redirect to the slug URL
        if (foundStudent.slug && slug !== foundStudent.slug) {
          router.replace(`/admin/students/${foundStudent.slug}`);
          // Do not set loading to false here, as we are navigating away
          return;
        }

        setStudent({
          ...foundStudent,
          name: `${foundStudent.firstName} ${foundStudent.lastName}`,
          courseName: foundStudent.course?.courseName || 'N/A'
        });
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch student:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [slug]);

  const handleEnrollmentComplete = () => {
    setShowEnrollModal(false);
    fetchStudent();
  };

  const handleDeleteEnrollment = async (classId: string) => {
    if (!confirm('Are you sure you want to remove this student from this class?')) return;
    
    try {
      const res = await fetch(`/api/enrollments?studentId=${student.id}&classId=${classId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchStudent();
      }
    } catch (error) {
      console.error('Failed to delete enrollment:', error);
    }
  };

  const handleDeleteFacialData = async (id: string) => {
    if (!confirm('Are you sure you want to delete this facial data?')) return;
    
    try {
      const res = await fetch(`/api/facial-data/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchStudent();
      }
    } catch (error) {
      console.error('Failed to delete facial data:', error);
    }
  };

  const handleCapture = async (images: { front: string; left: string; right: string }) => {
    setIsProcessing(true);
    try {
      let frontImageUrl = '';
      
      const uploadPromises = Object.entries(images).map(async ([key, base64]) => {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, subDir: 'facial-data' }),
        });
        const data = await res.json();
        const imageUrl = typeof data.imageUrl === 'object' ? data.imageUrl.imageUrl : data.imageUrl;
        
        if (key === 'front') frontImageUrl = imageUrl;

        // Use the returned image URL to create facial data record
        const facialRes = await fetch('/api/facial-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student.id,
            embedding: JSON.stringify(Array.from({ length: 128 }, () => Math.random())),
            thumbnailUrl: imageUrl
          }),
        });
        return facialRes.json();
      });

      await Promise.all(uploadPromises);

      // Update student profile image if front image was captured
      if (frontImageUrl) {
        await fetch(`/api/students/${student.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: frontImageUrl }),
        });
      }

      fetchStudent();
      setShowCameraModal(false);
    } catch (error) {
      console.error('Failed to enroll facial data:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-medium text-gray-900">Student record not found</h2>
        <button onClick={() => router.push('/admin/students')} className="mt-4 text-black font-semibold text-sm underline">
          Back to list
        </button>
      </div>
    );
  }

  const registrationDate = new Date(student.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleBack = () => {
    if (student?.course?.slug) {
      router.push(`/admin/students/course/${student.course.slug}`);
    } else {
      router.push('/admin/students');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header Navigation */}
      <div className="flex items-center mb-8">
        <BackButton onClick={handleBack} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Profile</h1>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Directory / {student.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Overview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center relative group">
            <div className="h-24 w-24 rounded-2xl bg-black text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg shadow-black/10 overflow-hidden uppercase">
              {student.imageUrl ? (
                <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(student.name)
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
            <div className="flex items-center justify-center text-gray-500 text-sm mt-2">
              <FaEnvelope className="mr-2 text-black" size={12} />
              {student.email}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100 space-y-4 text-left">
              <div className="flex flex-col gap-1 px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registry Date</span>
                <span className="text-sm font-bold text-gray-900">{registrationDate}</span>
              </div>
              <div className="flex flex-col gap-1 px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student ID</span>
                <span className="text-sm font-bold text-gray-900">{student.studentNumber}</span>
              </div>
            </div>
          </div>

          {/* Facial Data Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center">
                <FaCamera className="mr-3 text-black" size={16} />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Facial Enrollment</h3>
              </div>
              <button 
                onClick={() => setShowCameraModal(true)}
                className="p-1.5 hover:bg-black hover:text-white rounded-lg transition-all text-gray-400 border border-transparent hover:border-black"
              >
                <FaPlus size={12} />
              </button>
            </div>
            <div className="p-6">
              {student.facialData && student.facialData.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {student.facialData.map((data: any, index: number) => (
                    <div key={data.id || index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group/img relative">
                      {data.thumbnailUrl ? (
                        <img src={data.thumbnailUrl} alt={`Face ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <FaCamera size={14} />
                        </div>
                      )}
                      <button 
                        onClick={() => handleDeleteFacialData(data.id)}
                        className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-red-500 hover:text-white rounded text-gray-400 opacity-0 group-hover/img:opacity-100 transition-all shadow-sm"
                        title="Delete record"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-xs italic">
                  No facial data enrolled yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Academic Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Program Card */}
          <div 
            onClick={() => student?.course?.slug && router.push(`/admin/students/course/${student.course.slug}`)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center cursor-pointer hover:border-black transition-all group/card"
          >
            <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center mr-5 shrink-0 group-hover/card:bg-black group-hover/card:text-white transition-colors">
              <FaGraduationCap size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Enrolled Program</p>
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-tight leading-tight group-hover/card:text-black transition-colors">
                {student.courseName}
              </h2>
            </div>
          </div>

          {/* Classification Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center">
              <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center mr-4">
                <FaUserGraduate className="text-black" size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Classification</p>
                <p className="text-base font-bold text-gray-900 uppercase tracking-tight">Year {student.year}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center">
              <div className="h-12 w-12 bg-gray-50 rounded-xl flex items-center justify-center mr-4">
                <FaSchool className="text-black" size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Assigned Section</p>
                <p className="text-base font-bold text-gray-900 uppercase tracking-tight">Section {student.section}</p>
              </div>
            </div>
          </div>

          {/* Enrollments Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div className="flex items-center">
                <FaBookOpen className="mr-3 text-black" size={16} />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Academic Enrollment</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-md">
                  {student.enrollments?.length || 0} Subjects
                </span>
                <button 
                  onClick={() => setShowEnrollModal(true)}
                  className="p-1.5 hover:bg-black hover:text-white rounded-lg transition-all text-gray-400 border border-transparent hover:border-black"
                >
                  <FaPlus size={12} />
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-50">
              {student.enrollments && student.enrollments.length > 0 ? (
                student.enrollments.map((enrollment: any) => (
                  <div key={enrollment.classId} className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${enrollment.status === 'DROPPED' ? 'opacity-50' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-black font-bold text-sm shadow-sm uppercase">
                        {enrollment.class.code.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 uppercase">{enrollment.class.code}</p>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {enrollment.class.days} • {enrollment.class.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Status</p>
                        <div className="flex items-center justify-end gap-1.5">
                          <FaCircle size={6} className={enrollment.status === 'ENROLLED' ? 'text-black' : 'text-gray-300'} />
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${enrollment.status === 'ENROLLED' ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                            {enrollment.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right w-24">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                        <p className="text-xs font-bold text-black uppercase">Room {enrollment.class.room}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteEnrollment(enrollment.classId)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 text-sm font-medium italic uppercase tracking-widest">
                  No active subjects found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EnrollClassModal 
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        studentId={student.id}
        currentEnrollments={student.enrollments || []}
        onEnrollmentComplete={handleEnrollmentComplete}
      />

      <Modal isOpen={showCameraModal} onClose={() => !isProcessing && setShowCameraModal(false)} title="Facial Enrollment">
        {isProcessing ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Processing Facial Data...</p>
          </div>
        ) : (
          <CameraView 
            onBack={() => setShowCameraModal(false)} 
            onCapture={handleCapture} 
          />
        )}
      </Modal>
    </div>
  );
};

export default StudentProfilePage;
