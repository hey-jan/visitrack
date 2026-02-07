'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FaBook, FaSearch, FaCalendarAlt } from 'react-icons/fa';
import { teacherClasses } from '@/data/teacherClasses';

const MyClassesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const classes = teacherClasses;

  const isClassInSession = (classTime: string | undefined): boolean => {
    if (!classTime) {
      return false;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    const timeRegex = /^(\w+)\s+([\d:]+)\s*-\s*([\d:]+)\s*(AM|PM)$/i;
    const match = classTime.match(timeRegex);

    if (!match) {
      console.warn(`Invalid class time format: "${classTime}"`);
      return false;
    }

    const [, days, startTime, endTime, endPeriod] = match;

    const parseTime = (timeStr: string, period: string) => {
      let [hours, minutes] = timeStr.split(':').map(Number);
      if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const endMinutes = parseTime(endTime, endPeriod);
    let startMinutes = parseTime(startTime, endPeriod);

    if (startMinutes > endMinutes) {
      startMinutes -= 12 * 60; // Adjust for AM if start time is before noon but end time is in PM
    }

    const dayMap: { [key: string]: number[] } = {
      'M': [1], 'T': [2], 'W': [3], 'TH': [4], 'F': [5], 'S': [6], 'SU': [0],
      'MW': [1, 3], 'TTH': [2, 4], 'MWF': [1, 3, 5],
    };
    const classDays = dayMap[days.toUpperCase() as keyof typeof dayMap];

    if (classDays && classDays.includes(currentDay)) {
      return currentTotalMinutes >= startMinutes && currentTotalMinutes <= endMinutes;
    }

    return false;
  };

  const filteredClasses = classes.filter((classInfo) =>
    classInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classInfo.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classInfo.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classInfo.schedule.toLowerCase().includes(searchQuery.toLowerCase())
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
            
            
            <div className="text-left w-full">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Room Number:</span>
                <span>{classInfo.room}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Schedule Number:</span>
                <span>{classInfo.schedule}</span>
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

            <div className="mt-6 w-full">
              <Link href={`/teacher/my-classes/${classInfo.name.toLowerCase()}`} className="w-full block mb-2">
                <div className="bg-black text-white px-6 py-3 rounded-lg w-full">
                  View Attendance
                </div>
              </Link>
              {isClassInSession(classInfo.time) && (
                <Link href={`/teacher/my-classes/${classInfo.name.toLowerCase()}`} className="w-full block">
                  <div className="bg-green-600 text-white px-6 py-3 rounded-lg w-full flex items-center justify-center gap-2">
                    <FaCalendarAlt />
                    Take Attendance
                  </div>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyClassesPage;
