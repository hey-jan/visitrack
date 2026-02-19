'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBook, FaSearch } from 'react-icons/fa';

interface Class {
  id: string;
  name: string;
  room: string;
  schedule: string;
  days: string;
  time: string;
  students: number;
  teacher: {
    firstName: string;
    lastName: string;
  };
}

const MyClassesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch('/api/classes');
        const data = await res.json();
        setClasses(data);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      }
    };
    fetchClasses();
  }, []);

  const filteredClasses = classes.filter((classInfo) =>
    classInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${classInfo.teacher.firstName} ${classInfo.teacher.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classInfo, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <div className="bg-black text-white p-4 rounded-lg mb-4">
              <FaBook size={24} />
            </div>
            <h2 className="text-xl font-bold">{classInfo.name}</h2>
            <p className="text-gray-600 mb-4">{`${classInfo.teacher.firstName} ${classInfo.teacher.lastName}`}</p>
            
            <div className="text-left w-full">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Room:</span>
                <span>{classInfo.room}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Days:</span>
                <span>{classInfo.days}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Time:</span>
                <span>{classInfo.time}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Total Students:</span>
                <span>{classInfo.students}</span>
              </div>
            </div>

            <Link href={`/teacher/my-classes/${classInfo.id}`} className="w-full">
              <div className="bg-black text-white px-6 py-3 rounded-lg mt-6 w-full">
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
