'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCalendarAlt, FaFilter, FaSearch, FaUser, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { attendanceData } from '@/data/attendanceData';
import * as XLSX from 'xlsx';

const AttendancePage = () => {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const selectedDate = 'Dec 17, 2025'; // Static for now
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForExport, setSelectedStudentForExport] = useState('All');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  // Mock data - in a real app, you would fetch this based on classId
  const classDetails = {
    name: classId.toUpperCase().replace('-', ' '),
    teacher: 'Prof. Maria Santos',
    room: 'Rm 301',
    schedule: '11965',
  };
  
  const allStudentsList = Array.from(new Set(Object.values(attendanceData).flat().map(s => s.name)));

  const students = (attendanceData[selectedDate] || [])
    .filter((student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExportExcel = () => {
      const allDates = Object.keys(attendanceData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      const workbook = XLSX.utils.book_new();
  
      if (selectedStudentForExport !== 'All') {
        const studentName = selectedStudentForExport;
        const studentDataRows = allDates.map(date => {
          const studentRecord = attendanceData[date]?.find(s => s.name === studentName);
          return {
            'Date': new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
            'Status': studentRecord ? studentRecord.status : 'Absent',
            'Time': studentRecord ? studentRecord.time : 'N/A'
          };
        });
  
        const worksheet = XLSX.utils.json_to_sheet(studentDataRows);
        const headerRange = XLSX.utils.decode_range(worksheet['!ref'] as string);
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: headerRange.s.r, c: C });
          const cell = worksheet[cellAddress];
          if (cell) {
            cell.s = {
              fill: { fgColor: { rgb: "000000" } },
              font: { color: { rgb: "FFFFFF" }, bold: true },
            };
          }
        }
  
        XLSX.utils.book_append_sheet(workbook, worksheet, `${studentName} Attendance`);
        XLSX.writeFile(workbook, `${classId.toUpperCase()}_${studentName}_Attendance.xlsx`);
      } else {
        // Existing logic for "All" students
        const summaryRows = allStudentsList.map(studentName => {
          let presentCount = 0;
          let absentCount = 0;
          allDates.forEach(date => {
            const studentData = attendanceData[date]?.find(s => s.name === studentName);
            if (studentData && (studentData.status === 'Present' || studentData.status === 'Late')) {
              presentCount++;
            } else {
              absentCount++;
            }
          });
          return { 'Student Name': studentName, 'Present': presentCount, 'Absent': absentCount };
        });
  
        const summaryWorksheet = XLSX.utils.aoa_to_sheet([
          ['Subject:', classDetails.name],
          ['Total Class Days:', allDates.length],
          [],
        ]);
        XLSX.utils.sheet_add_json(summaryWorksheet, summaryRows, { origin: 'A4' });
        const summaryHeaderRange = { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } };
        for (let C = summaryHeaderRange.s.c; C <= summaryHeaderRange.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: summaryHeaderRange.s.r, c: C });
          const cell = summaryWorksheet[cellAddress];
          if (cell) {
            cell.s = { fill: { fgColor: { rgb: "000000" } }, font: { color: { rgb: "FFFFFF" }, bold: true } };
          }
        }
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
  
        const months = [...new Set(allDates.map(date => new Date(date).toLocaleString('en-US', { month: 'long', year: 'numeric' })))];
        months.forEach(month => {
          const datesInMonth = allDates.filter(date => new Date(date).toLocaleString('en-US', { month: 'long', year: 'numeric' }) === month);
          const headerDatesFormatted = datesInMonth.map(date => new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }));
          
          const rows = allStudentsList.map(studentName => {
            const row: { [key: string]: string } = { 'Student Name': studentName };
            datesInMonth.forEach(date => {
              const formattedDate = new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
              const studentData = attendanceData[date]?.find(s => s.name === studentName);
              row[formattedDate] = studentData ? studentData.status : 'Absent';
            });
            return row;
          });
  
          const worksheet = XLSX.utils.json_to_sheet(rows);
          const headerRange = XLSX.utils.decode_range(worksheet['!ref'] as string);
          for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: headerRange.s.r, c: C });
            const cell = worksheet[cellAddress];
            if (cell) {
              cell.s = { fill: { fgColor: { rgb: "000000" } }, font: { color: { rgb: "FFFFFF" }, bold: true } };
            }
          }
          XLSX.utils.book_append_sheet(workbook, worksheet, month);
        });
  
        XLSX.writeFile(workbook, `${classId.toUpperCase()}_Attendance.xlsx`);
      }
    };

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

      {/* Buttons */}
      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={() => console.log('Filter by Date clicked')}
          className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <FaCalendarAlt />
          Filter by Date
        </button>
        <div className="relative">
          <button
            onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
            className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <FaUser />
            {selectedStudentForExport === 'All' ? 'Filter by Student' : selectedStudentForExport}
          </button>
          {isStudentDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
              <button
                onClick={() => {
                  setSelectedStudentForExport('All');
                  setIsStudentDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                All Students
              </button>
              {allStudentsList.map(studentName => (
                <button
                  key={studentName}
                  onClick={() => {
                    setSelectedStudentForExport(studentName);
                    setIsStudentDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {studentName}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => console.log('Export PDF clicked')}
          className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <FaFilePdf />
          Export PDF
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <FaFileExcel />
          Export Excel
        </button>
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
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
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