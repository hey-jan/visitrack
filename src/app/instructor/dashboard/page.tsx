'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';

const DashboardPage = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [instructor, setInstructor] = useState<any>(null);

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(today.toLocaleDateString('en-US', options));

    const fetchData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) throw new Error('Failed to fetch instructor info');
        const instructorData = await meRes.json();
        setInstructor(instructorData);

        const classesRes = await fetch(`/api/classes?instructorId=${instructorData.id}`);
        if (!classesRes.ok) throw new Error('Failed to fetch classes');
        const allInstructorClasses = await classesRes.json();

        const dayAbbreviation = getDayAbbreviation(today.getDay());
        const filteredClasses = allInstructorClasses.filter((c: any) => {
          // Special case for testing: "CS-FRELEAN" always shows up
          if (c.code.includes('CS-FRELEAN')) return true;
          
          if (c.days === 'DAILY' || c.days === '24/7') return true;
          
          // Handle range like "M-S" (Monday to Saturday)
          if (c.days === 'M-S' && dayAbbreviation !== 'SUN') return true;
          
          if (dayAbbreviation === 'T') {
            return c.days.replace(/TH/g, '').includes('T');
          }
          return c.days.includes(dayAbbreviation);
        });

        setTodaysClasses(filteredClasses);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDayAbbreviation = (dayIndex: number) => {
    const mapping: { [key: number]: string } = {
      1: 'M', 2: 'T', 3: 'W', 4: 'TH', 5: 'F', 6: 'S', 0: 'SUN',
    };
    return mapping[dayIndex] || '';
  };

  const absentStudents = [
    { name: 'Pedro Reyes', absences: 4, subjects: 'CS-PRACT41' },
    { name: 'Miguel Ramos', absences: 4, subjects: 'CS-PRACT41' },
    { name: 'Olivia Gomez', absences: 4, subjects: 'CS-FRELEAN' },
    { name: 'Diego Martinez', absences: 3, subjects: 'CS-FRELEAN' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Instructor Console</h1>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider flex items-center">
            Welcome back, Prof. {instructor?.lastName}
          </p>
        </div>
        <div className="flex items-center px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <FaCalendarAlt className="mr-3 text-black opacity-30" size={14} />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{currentDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-black uppercase tracking-widest flex items-center">
              <FaClock className="mr-3" /> Today's Schedule
            </h2>
            <span className="text-[10px] font-bold bg-black text-white px-3 py-1 rounded-full uppercase tracking-tighter">
              {todaysClasses.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todaysClasses.length > 0 ? (
              todaysClasses.map((course, index) => (
                <div key={index} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:border-black transition-all flex flex-col group">
                  <div className="mb-6">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Room {course.room}</span>
                    <h3 className="text-xl font-bold text-black uppercase tracking-tight leading-tight group-hover:tracking-normal transition-all">{course.code}</h3>
                    <p className="text-xs font-bold text-gray-500 mt-2 flex items-center">
                      <span className="w-1.5 h-1.5 bg-black rounded-full mr-2"></span>
                      {course.time}
                    </p>
                  </div>
                  <Link href={`/instructor/my-classes/${course.slug}`} className="mt-auto">
                    <div className="bg-gray-50 text-black text-[10px] font-bold uppercase tracking-[0.2em] text-center py-3.5 rounded-xl border border-gray-100 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all flex items-center justify-center gap-2">
                      Initialize Session <FaArrowRight size={10} />
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                <FaCalendarAlt className="text-gray-200 mb-4" size={32} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No classes scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-black uppercase tracking-widest flex items-center px-1">
            <FaExclamationTriangle className="mr-3" /> Attendance Alerts
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {absentStudents.map((student, index) => (
                <div key={index} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                    <span className="bg-red-50 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Critical</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">
                    <span className="font-bold text-black">{student.absences} Absences</span> in {student.subjects}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
              <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors">
                View All Records
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
