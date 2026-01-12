'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCalendarAlt, FaFilter, FaSearch } from 'react-icons/fa';

const AttendancePage = () => {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const selectedDate = 'Dec 17, 2025'; // Static for now
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in a real app, you would fetch this based on classId
  const classDetails = {
    name: classId.toUpperCase().replace('-', ' '),
    teacher: 'Prof. Maria Santos',
    room: 'Rm 301',
    schedule: '11965',
  };

  const attendanceData = {
    'Dec 17, 2025': [
      { name: 'John Dela Cruz', status: 'Present', time: '08:02 AM' },
      { name: 'Maria Garcia', status: 'Present', time: '08:03 AM' },
      { name: 'Pedro Reyes', status: 'Absent', time: '-' },
      { name: 'Ana Santos', status: 'Present', time: '08:05 AM' },
      { name: 'Jose Mendoza', status: 'Late', time: '08:15 AM' },
      { name: 'Sophia Turner', status: 'Present', time: '08:06 AM' },
      { name: 'Oliver Wilson', status: 'Present', time: '08:07 AM' },
      { name: 'Isabella Moore', status: 'Absent', time: '-' },
      { name: 'Lucas Taylor', status: 'Late', time: '08:20 AM' },
      { name: 'Mia Davis', status: 'Present', time: '08:09 AM' },
      { name: 'Ethan White', status: 'Present', time: '08:10 AM' },
      { name: 'Amelia Harris', status: 'Absent', time: '-' },
      { name: 'Jackson Clark', status: 'Present', time: '08:12 AM' },
      { name: 'Harper Lewis', status: 'Late', time: '08:25 AM' },
      { name: 'Evelyn Young', status: 'Present', time: '08:14 AM' },
    ],
    'Dec 16, 2025': [
       { name: 'John Dela Cruz', status: 'Present', time: '08:00 AM' },
       { name: 'Maria Garcia', status: 'Present', time: '08:01 AM' },
       { name: 'Pedro Reyes', status: 'Present', time: '08:04 AM' },
       { name: 'Ana Santos', status: 'Present', time: '08:05 AM' },
       { name: 'Jose Mendoza', status: 'Present', time: '08:06 AM' },
       { name: 'Sophia Turner', status: 'Present', time: '08:07 AM' },
       { name: 'Oliver Wilson', status: 'Present', time: '08:08 AM' },
       { name: 'Isabella Moore', status: 'Present', time: '08:09 AM' },
       { name: 'Lucas Taylor', status: 'Present', time: '08:10 AM' },
       { name: 'Mia Davis', status: 'Present', time: '08:11 AM' },
       { name: 'Ethan White', status: 'Present', time: '08:12 AM' },
       { name: 'Amelia Harris', status: 'Present', time: '08:13 AM' },
       { name: 'Jackson Clark', status: 'Present', time: '08:14 AM' },
       { name: 'Harper Lewis', status: 'Present', time: '08:15 AM' },
       { name: 'Evelyn Young', status: 'Present', time: '08:16 AM' },
    ],
    'Dec 11, 2025': [
      { name: 'John Dela Cruz', status: 'Present', time: '08:01 AM' },
      { name: 'Maria Garcia', status: 'Absent', time: '-' },
      { name: 'Pedro Reyes', status: 'Present', time: '08:03 AM' },
      { name: 'Ana Santos', status: 'Present', time: '08:04 AM' },
      { name: 'Jose Mendoza', status: 'Present', time: '08:05 AM' },
      { name: 'Sophia Turner', status: 'Late', time: '08:10 AM' },
      { name: 'Oliver Wilson', status: 'Present', time: '08:07 AM' },
      { name: 'Isabella Moore', status: 'Present', time: '08:08 AM' },
      { name: 'Lucas Taylor', status: 'Absent', time: '-' },
      { name: 'Mia Davis', status: 'Present', time: '08:09 AM' },
      { name: 'Ethan White', status: 'Present', time: '08:10 AM' },
      { name: 'Amelia Harris', status: 'Present', time: '08:11 AM' },
      { name: 'Jackson Clark', status: 'Present', time: '08:12 AM' },
      { name: 'Harper Lewis', status: 'Absent', time: '-' },
      { name: 'Evelyn Young', status: 'Present', time: '08:13 AM' },
    ],
    'Dec 10, 2025': [
      { name: 'John Dela Cruz', status: 'Present', time: '08:00 AM' },
      { name: 'Maria Garcia', status: 'Present', time: '08:01 AM' },
      { name: 'Pedro Reyes', status: 'Present', time: '08:02 AM' },
      { name: 'Ana Santos', status: 'Late', time: '08:10 AM' },
      { name: 'Jose Mendoza', status: 'Present', time: '08:03 AM' },
      { name: 'Sophia Turner', status: 'Present', time: '08:04 AM' },
      { name: 'Oliver Wilson', status: 'Absent', time: '-' },
      { name: 'Isabella Moore', status: 'Present', time: '08:05 AM' },
      { name: 'Lucas Taylor', status: 'Present', time: '08:06 AM' },
      { name: 'Mia Davis', status: 'Present', time: '08:07 AM' },
      { name: 'Ethan White', status: 'Present', time: '08:08 AM' },
      { name: 'Amelia Harris', status: 'Late', time: '08:15 AM' },
      { name: 'Jackson Clark', status: 'Present', time: '08:09 AM' },
      { name: 'Harper Lewis', status: 'Present', time: '08:10 AM' },
      { name: 'Evelyn Young', status: 'Present', time: '08:11 AM' },
    ],
    'Dec 09, 2025': [
      { name: 'John Dela Cruz', status: 'Absent', time: '-' },
      { name: 'Maria Garcia', status: 'Present', time: '08:02 AM' },
      { name: 'Pedro Reyes', status: 'Present', time: '08:03 AM' },
      { name: 'Ana Santos', status: 'Present', time: '08:04 AM' },
      { name: 'Jose Mendoza', status: 'Late', time: '08:10 AM' },
      { name: 'Sophia Turner', status: 'Present', time: '08:05 AM' },
      { name: 'Oliver Wilson', status: 'Present', time: '08:06 AM' },
      { name: 'Isabella Moore', status: 'Present', time: '08:07 AM' },
      { name: 'Lucas Taylor', status: 'Present', time: '08:08 AM' },
      { name: 'Mia Davis', status: 'Absent', time: '-' },
      { name: 'Ethan White', status: 'Present', time: '08:09 AM' },
      { name: 'Amelia Harris', status: 'Present', time: '08:10 AM' },
      { name: 'Jackson Clark', status: 'Late', time: '08:15 AM' },
      { name: 'Harper Lewis', status: 'Present', time: '08:11 AM' },
      { name: 'Evelyn Young', status: 'Present', time: '08:12 AM' },
    ],
    'Dec 08, 2025': [
      { name: 'John Dela Cruz', status: 'Present', time: '08:00 AM' },
      { name: 'Maria Garcia', status: 'Present', time: '08:01 AM' },
      { name: 'Pedro Reyes', status: 'Late', time: '08:10 AM' },
      { name: 'Ana Santos', status: 'Present', time: '08:02 AM' },
      { name: 'Jose Mendoza', status: 'Present', time: '08:03 AM' },
      { name: 'Sophia Turner', status: 'Present', time: '08:04 AM' },
      { name: 'Oliver Wilson', status: 'Absent', time: '-' },
      { name: 'Isabella Moore', status: 'Present', time: '08:05 AM' },
      { name: 'Lucas Taylor', status: 'Present', time: '08:06 AM' },
      { name: 'Mia Davis', status: 'Present', time: '08:07 AM' },
      { name: 'Ethan White', status: 'Late', time: '08:12 AM' },
      { name: 'Amelia Harris', status: 'Present', time: '08:08 AM' },
      { name: 'Jackson Clark', status: 'Present', time: '08:09 AM' },
      { name: 'Harper Lewis', status: 'Present', time: '08:10 AM' },
      { name: 'Evelyn Young', status: 'Present', time: '08:11 AM' },
    ],
    'Dec 07, 2025': [
      { name: 'John Dela Cruz', status: 'Present', time: '08:01 AM' },
      { name: 'Maria Garcia', status: 'Present', time: '08:02 AM' },
      { name: 'Pedro Reyes', status: 'Absent', time: '-' },
      { name: 'Ana Santos', status: 'Present', time: '08:03 AM' },
      { name: 'Jose Mendoza', status: 'Present', time: '08:04 AM' },
      { name: 'Sophia Turner', status: 'Late', time: '08:10 AM' },
      { name: 'Oliver Wilson', status: 'Present', time: '08:05 AM' },
      { name: 'Isabella Moore', status: 'Present', time: '08:06 AM' },
      { name: 'Lucas Taylor', status: 'Present', time: '08:07 AM' },
      { name: 'Mia Davis', status: 'Absent', time: '-' },
      { name: 'Ethan White', status: 'Present', time: '08:08 AM' },
      { name: 'Amelia Harris', status: 'Present', time: '08:09 AM' },
      { name: 'Jackson Clark', status: 'Present', time: '08:10 AM' },
      { name: 'Harper Lewis', status: 'Present', time: '08:11 AM' },
      { name: 'Evelyn Young', status: 'Late', time: '08:15 AM' },
    ],
    // ... more dates
  };
  
  const students = (attendanceData[selectedDate] || []).filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Link href="/teacher/my-classes" className="flex items-center text-gray-500 mb-6">
        <FaArrowLeft className="mr-2" />
        Back to My Classes
      </Link>

      {/* Class Header */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold">{classDetails.name}</h1>
        <p className="text-gray-600">
          Room: {classDetails.room}  Schedule: {classDetails.schedule}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md text-center"><p className="text-gray-500">Total Students</p><p className="text-2xl font-bold">10</p></div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center"><p className="text-gray-500">Present</p><p className="text-2xl font-bold">7</p></div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center"><p className="text-gray-500">Absent</p><p className="text-2xl font-bold">2</p></div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center"><p className="text-gray-500">Late</p><p className="text-2xl font-bold">1</p></div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Attendance Dates */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center"><FaCalendarAlt className="mr-2"/> Attendance Dates</h2>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg bg-black text-white">Dec 17, 2025</button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">Dec 16, 2025</button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">Dec 13, 2025</button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">Dec 12, 2025</button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">Dec 11, 2025</button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">Dec 10, 2025</button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">Dec 09, 2025</button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">Dec 08, 2025</button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-100">Dec 07, 2025</button>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="w-full md:w-3/4">
           <div className="bg-white p-6 rounded-lg shadow-md">
           <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Attendance for {selectedDate}</h2>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search student..."
                            className="w-full p-2 pl-10 border border-gray-200 rounded-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    {/* Header */}
                    <div className="hidden md:grid md:grid-cols-3 gap-4 text-left text-gray-600 font-semibold px-4">
                        <div>Student Name</div>
                        <div>Status</div>
                        <div>Time</div>
                    </div>
                    {/* Student Rows */}
                    {students.map((student, index) => (
                        <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center border border-gray-100 rounded-lg p-4">
                            <div className="font-semibold">{student.name}</div>
                            <div className="text-gray-800">{student.status}</div>
                            <div className="text-gray-600">{student.time}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;