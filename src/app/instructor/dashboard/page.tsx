'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCalendarAlt } from 'react-icons/fa';

const DashboardPage = () => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(today.toLocaleDateString('en-US', options));
  }, []);

  const todaysClasses = [
    {
      name: 'CS-PRACT41',
      room: 'Rm 301',
      schedule: '11965',
      teacher: 'Prof. Maria Santos',
    },
    {
      name: 'CS-FRELEAN',
      room: 'Rm 402',
      schedule: '11973',
      teacher: 'Prof. Maria Santos',
    },
    {
      name: 'CS-OPSYS41',
      room: 'Rm 305',
      schedule: '11981',
      teacher: 'Prof. Maria Santos',
    },
    {
      name: 'CS-THESIS41',
      room: 'Rm 501',
      schedule: '12005',
      teacher: 'Prof. Maria Santos',
    },
  ];

  const absentStudents = [
    {
      name: 'Pedro Reyes',
      absences: 4,
      subjects: 'CS-PRACT41',
    },
    {
      name: 'Miguel Ramos',
      absences: 4,
      subjects: 'CS-PRACT41',
    },
    {
      name: 'Olivia Gomez',
      absences: 4,
      subjects: 'CS-FRELEAN',
    },
    {
      name: 'Diego Martinez',
      absences: 3,
      subjects: 'CS-FRELEAN',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="flex items-center text-lg">
          <FaCalendarAlt className="mr-2" />
          <span>{currentDate}</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Today's Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {todaysClasses.map((course, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold mb-2">{course.name}</h3>
                <p className="text-gray-600">
                  {course.room}
                </p>
                <p className="text-gray-600 mb-4">
                  Schedule: {course.schedule}
                </p>
              </div>
              <Link href={`/teacher/my-classes/${course.name.toLowerCase()}`}>
                <div className="bg-black text-white text-center px-4 py-2 rounded-lg">
                  View Attendance
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">
          Students with 3+ Absences (All Subjects)
        </h2>
        <div className="space-y-4">
          {absentStudents.map((student, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <h3 className="text-xl font-bold">{student.name}</h3>
                <p className="text-gray-600">
                  Absences: {student.absences} Subject: {student.subjects}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
