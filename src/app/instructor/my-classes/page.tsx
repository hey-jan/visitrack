'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSearch, FaCalendarAlt, FaClock, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';

interface Class {
  id: string;
  name: string;
  slug: string;
  room: string;
  schedule: string;
  days: string;
  time: string;
  units: number;
  students: any[];
  instructor: {
    firstName: string;
    lastName: string;
  };
}

const MyClassesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorAndClasses = async () => {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) return;
        const instructor = await userRes.json();

        const classesRes = await fetch(`/api/classes?instructorId=${instructor.id}`);
        if (classesRes.ok) {
          const data = await classesRes.json();
          setClasses(data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructorAndClasses();
  }, []);

  const filteredClasses = classes.filter((classInfo) =>
    classInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classInfo.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classInfo.days.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classInfo.time.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">My Class Registry</h1>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Active Academic Assignments</p>
        </div>
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-30" />
          <input
            type="text"
            placeholder="Search your classes..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((classInfo, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col hover:border-black transition-all group overflow-hidden">
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-black text-white text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest shadow-sm">
                      #{classInfo.schedule}
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                      <FaMapMarkerAlt className="mr-1.5 opacity-50 text-black" size={10} />
                      Room {classInfo.room}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-black uppercase tracking-tight leading-tight mb-6">
                    {classInfo.name}
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-50 group-hover:border-gray-100 transition-colors">
                      <FaCalendarAlt size={12} className="text-black" />
                      <span className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.1em]">{classInfo.days}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-50 group-hover:border-gray-100 transition-colors">
                      <FaClock size={12} className="text-black" />
                      <span className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.1em]">{classInfo.time}</span>
                    </div>
                  </div>
                </div>

                <Link href={`/instructor/my-classes/${classInfo.slug}`} className="block">
                  <div className="bg-gray-50 text-black text-[10px] font-bold uppercase tracking-[0.2em] text-center py-5 border-t border-gray-100 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all flex items-center justify-center gap-2">
                    Open Attendance Log <FaArrowRight size={10} />
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center px-4">
              <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-gray-200" size={24} />
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No matching classes found in your registry.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyClassesPage;
