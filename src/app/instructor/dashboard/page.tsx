'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCalendarAlt } from 'react-icons/fa';

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
        // 1. Get current instructor
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) throw new Error('Failed to fetch instructor info');
        const instructorData = await meRes.json();
        setInstructor(instructorData);

        // 2. Get classes for this instructor
        const classesRes = await fetch(`/api/classes?instructorId=${instructorData.id}`);
        if (!classesRes.ok) throw new Error('Failed to fetch classes');
        const allInstructorClasses = await classesRes.json();

        // 3. Filter for today
        const dayAbbreviation = getDayAbbreviation(today.getDay());
        const filteredClasses = allInstructorClasses.filter((c: any) => {
          if (dayAbbreviation === 'T') {
            // Match 'T' but not 'TH'
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
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const mapping: { [key: number]: string } = {
      1: 'M',
      2: 'T',
      3: 'W',
      4: 'TH',
      5: 'F',
      6: 'S',
      0: 'SUN', // Just in case
    };
    return mapping[dayIndex] || '';
  };

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
              className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold text-black mb-3">{course.name}</h3>
                <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mb-5">
                  <span className="bg-gray-100 px-2 py-1 rounded">{course.room}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">#{course.schedule}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">{course.units} Units</span>
                </div>
              </div>
              <Link href={`/instructor/my-classes/${course.slug}`}>
                <div className="bg-black text-white text-sm font-bold text-center py-3 rounded-lg cursor-pointer hover:bg-neutral-800 transition-colors">
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
