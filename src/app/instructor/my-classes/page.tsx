'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBook, FaSearch, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaHashtag, FaLayerGroup } from 'react-icons/fa';

interface Class {
  id: string;
  name: string;
  slug: string;
  room: string;
  schedule: string;
  days: string;
  time: string;
  units: number;
  students: any[]; // Using array for students count
  instructor: {
    firstName: string;
    lastName: string;
  };
}

const MyClassesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    const fetchInstructorAndClasses = async () => {
      try {
        // First, get the current instructor
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          // Handle not being logged in, e.g., redirect to login
          console.error('Not authenticated');
          // router.push('/login');
          return;
        }
        const instructor = await userRes.json();

        // Then, fetch the classes for that instructor
        const classesRes = await fetch(`/api/classes?instructorId=${instructor.id}`);
        if (classesRes.ok) {
          const data = await classesRes.json();
          setClasses(data);
        } else {
          console.error('Failed to fetch classes');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchInstructorAndClasses();
  }, []);

  const filteredClasses = classes.filter((classInfo) =>
    classInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${classInfo.instructor?.firstName} ${classInfo.instructor?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classInfo.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classInfo.days.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classInfo.time.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">My Classes</h1>
      <div className="relative mb-8">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search classes..."
          className="w-full p-3 pl-10 border border-gray-200 rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredClasses.map((classInfo, index) => (
          <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 border-l-12 border-l-black flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex justify-between items-start gap-4 mb-8">
                <h2 className="text-2xl font-black text-black tracking-tighter leading-tight wrap-break-word uppercase flex-1">
                  {classInfo.name}
                </h2>
                <span className="bg-black/5 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest whitespace-nowrap">
                  #{classInfo.schedule}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 mb-10">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <FaCalendarAlt size={10} className="text-black opacity-40" />
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider">{classInfo.days}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <FaClock size={10} className="text-black opacity-40" />
                  <span className="text-[10px] font-bold text-black uppercase tracking-wider">{classInfo.time}</span>
                </div>
              </div>
            </div>

            <Link href={`/instructor/my-classes/${classInfo.slug}`} className="block w-full">
              <div className="bg-black text-white text-center py-4 rounded-2xl font-black hover:bg-neutral-800 transition-all uppercase tracking-widest text-[10px] shadow-sm active:scale-[0.98]">
                View Attendance
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyClassesPage;

