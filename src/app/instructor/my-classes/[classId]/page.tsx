'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaCalendarAlt, FaFilter, FaSearch, FaUser, FaFilePdf, FaFileExcel, FaChalkboardTeacher, FaMapMarkerAlt, FaClock, FaHashtag, FaLayerGroup } from 'react-icons/fa';
import * as XLSX from 'xlsx';

interface ClassDetails {
  id: string;
  name: string;
  room: string;
  schedule: string;
  days: string;
  time: string;
  units: number;
  students: Student[];
  teacher: {
    firstName: string;
    lastName: string;
  };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

interface AttendanceRecord {
  id: string;
  status: string;
  time: string;
  student: Student;
  session: {
    date: string;
  };
}

const AttendancePage = () => {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForExport, setSelectedStudentForExport] = useState('All');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch class details
        const classRes = await fetch(`/api/classes/${classId}`);
        if (classRes.ok) {
          const classData: ClassDetails = await classRes.json();
          setClassDetails(classData);
        } else {
          console.error('Failed to fetch class details');
        }

        // Fetch available attendance dates
        const datesRes = await fetch(`/api/attendance/dates/${classId}`);
        if (datesRes.ok) {
          const datesData = await datesRes.json();
          if (Array.isArray(datesData)) {
            setAvailableDates(datesData);
            if (datesData.length > 0 && !selectedDate) {
              setSelectedDate(datesData[0]); // Select the most recent date by default
            }
          } else {
            setAvailableDates([]);
          }
        } else {
          console.error('Failed to fetch attendance dates');
          setAvailableDates([]);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setAvailableDates([]);
      }
    };
    fetchData();
  }, [classId]);

  useEffect(() => {
    if (selectedDate && classId) {
      const fetchAttendance = async () => {
        setIsLoadingAttendance(true);
        try {
          const attendanceRes = await fetch(`/api/attendance/${classId}?date=${encodeURIComponent(selectedDate)}`);
          if (attendanceRes.ok) {
            const attendanceData = await attendanceRes.json();
            if (Array.isArray(attendanceData)) {
              setAttendanceRecords(attendanceData);
            } else {
              setAttendanceRecords([]);
            }
          } else {
            console.error('Failed to fetch attendance records');
            setAttendanceRecords([]);
          }
        } catch (error) {
          console.error('Error fetching attendance records:', error);
          setAttendanceRecords([]);
        } finally {
          setIsLoadingAttendance(false);
        }
      };
      fetchAttendance();
    }
  }, [classId, selectedDate]);

  if (!classDetails) {
    return <div>Loading class details...</div>;
  }

  const filteredStudents = attendanceRecords.filter((record) =>
    `${record.student.firstName} ${record.student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStudentsInClass = classDetails?.students?.length || 0;
  const presentCount = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'Absent').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;

  const handleExportExcel = async () => {
    if (!classDetails || !classDetails.students) return;

    setIsExporting(true);
    try {
      // Fetch all attendance records for the class
      const res = await fetch(`/api/attendance/${classId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch attendance data.');
      }
      const allAttendanceRecords: AttendanceRecord[] = await res.json();

      const workbook = XLSX.utils.book_new();

      // Export for a specific student
      if (selectedStudentForExport !== 'All') {
        const studentToExport = classDetails.students.find(
          (s) => `${s.firstName} ${s.lastName}` === selectedStudentForExport
        );

        if (!studentToExport) return;

        const studentAttendance = availableDates.map(date => {
          const record = allAttendanceRecords.find(ar => ar.session.date === date && ar.student.id === studentToExport.id);
          return {
            'Date': new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
            'Status': record ? record.status : 'Absent',
            'Time': record ? record.time : 'N/A',
          };
        });

        const worksheet = XLSX.utils.json_to_sheet(studentAttendance);
        XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedStudentForExport} Attendance`);
        XLSX.writeFile(workbook, `${classDetails.name.toUpperCase()}_${selectedStudentForExport}_Attendance.xlsx`);
      } else {
        // Export for all students (summary and detailed)
        const summaryRows = classDetails.students.map(student => {
          let present = 0;
          let absent = 0;
          availableDates.forEach(date => {
            const record = allAttendanceRecords.find(ar => ar.session.date === date && ar.student.id === student.id);
            if (record && (record.status === 'Present' || record.status === 'Late')) {
              present++;
            } else {
              absent++;
            }
          });
          return { 'Student Name': `${student.firstName} ${student.lastName}`, 'Present': present, 'Absent': absent };
        });

        const summaryWorksheet = XLSX.utils.aoa_to_sheet([
          ['Subject:', classDetails.name],
          ['Total Class Days:', availableDates.length],
          [],
        ]);
        XLSX.utils.sheet_add_json(summaryWorksheet, summaryRows, { origin: 'A4' });
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

        availableDates.forEach(date => {
          const recordsForDate = allAttendanceRecords.filter(ar => ar.session.date === date);
          const rows = classDetails.students.map(student => {
            const record = recordsForDate.find(ar => ar.student.id === student.id);
            return {
              'Student Name': `${student.firstName} ${student.lastName}`,
              'Status': record ? record.status : 'Absent',
              'Time': record ? record.time : 'N/A',
            };
          });

          const worksheet = XLSX.utils.json_to_sheet(rows);
          XLSX.utils.book_append_sheet(workbook, worksheet, date);
        });

        XLSX.writeFile(workbook, `${classDetails.name.toUpperCase()}_Attendance.xlsx`);
      }
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Failed to export Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <Link href="/instructor/my-classes" className="inline-flex items-center bg-black text-white px-4 py-2 rounded-lg mb-6 hover:bg-neutral-800 transition-colors">
        <FaArrowLeft className="mr-2" />
        Back to My Classes
      </Link>

      {/* Class Header */}
      <div className="bg-white p-10 rounded-3xl shadow-sm mb-8 border border-gray-100 border-l-12 border-l-black overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -mr-32 -mt-32 z-0 opacity-50" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-start justify-between gap-12">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-black text-black tracking-tighter leading-tight mb-8 wrap-break-word uppercase">
              {classDetails.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white border-4 border-gray-50 text-sm font-black shadow-sm shrink-0">
                {classDetails.teacher?.firstName[0]}{classDetails.teacher?.lastName[0]}
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] leading-none mb-1.5">Lead Instructor</p>
                <p className="text-xl font-bold text-black leading-none">{`${classDetails.teacher?.firstName} ${classDetails.teacher?.lastName}`}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-10 bg-gray-50/50 p-10 rounded-3xl border border-gray-100/50 shrink-0 self-start">
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Room</p>
              <div className="flex items-center gap-2.5">
                <FaMapMarkerAlt className="text-black opacity-40" size={14} />
                <p className="text-xl font-bold text-black leading-none">{classDetails.room}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Days</p>
              <div className="flex items-center gap-2.5">
                <FaCalendarAlt className="text-black opacity-40" size={14} />
                <p className="text-xl font-bold text-black leading-none">{classDetails.days}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Time</p>
              <div className="flex items-center gap-2.5">
                <FaClock className="text-black opacity-40" size={14} />
                <p className="text-xl font-bold text-black leading-none">{classDetails.time}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Schedule No.</p>
              <div className="flex items-center gap-2.5">
                <FaHashtag className="text-black opacity-40" size={14} />
                <p className="text-xl font-bold text-black leading-none">{classDetails.schedule}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Units</p>
              <div className="flex items-center gap-2.5">
                <FaLayerGroup className="text-black opacity-40" size={14} />
                <p className="text-xl font-bold text-black leading-none">{classDetails.units}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mb-6">
        <div className="relative">
          <button
            onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
            className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer"
          >
            <FaUser />
            {selectedStudentForExport === 'All' ? 'Filter by Student' : selectedStudentForExport}
          </button>
          {isStudentDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setSelectedStudentForExport('All');
                  setIsStudentDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                All Students
              </button>
              {classDetails.students.map(student => (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudentForExport(`${student.firstName} ${student.lastName}`);
                    setIsStudentDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  {`${student.firstName} ${student.lastName}`}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => console.log('Export PDF clicked')}
          className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer"
        >
          <FaFilePdf />
          Export PDF
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer disabled:bg-gray-500"
          disabled={isExporting}
        >
          <FaFileExcel />
          {isExporting ? 'Exporting...' : 'Export Excel'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md text-center"><p className="text-gray-500">Total Students</p><p className="text-2xl font-bold">{totalStudentsInClass}</p></div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center"><p className="text-gray-500">Present</p><p className="text-2xl font-bold">{presentCount}</p></div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center"><p className="text-gray-500">Absent</p><p className="text-2xl font-bold">{absentCount}</p></div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center"><p className="text-gray-500">Late</p><p className="text-2xl font-bold">{lateCount}</p></div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Attendance Dates */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 flex items-center"><FaCalendarAlt className="mr-2"/> Attendance Dates</h2>
            <div className="space-y-2">
              {availableDates.length > 0 ? (
                availableDates.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`w-full text-left p-3 rounded-lg ${selectedDate === date ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                    >
                      {date}
                    </button>
                  ))
              ) : (
                <p className="text-gray-500 italic p-3">No attendance dates found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="w-full md:w-3/4">
           <div className="bg-white p-6 rounded-lg shadow-md">
           <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Attendance for {selectedDate || '...'}</h2>
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
                {isLoadingAttendance ? (
                    <div className="text-center py-10 text-gray-500">Loading attendance...</div>
                ) : attendanceRecords.length > 0 ? (
                    <div className="space-y-3">
                        {/* Header */}
                        <div className="hidden md:grid md:grid-cols-3 gap-4 text-left text-gray-600 font-semibold px-4">
                            <div>Student Name</div>
                            <div>Status</div>
                            <div>Time</div>
                        </div>
                        {/* Student Rows */}
                        {filteredStudents.map((record) => (
                            <div key={record.id} className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center border border-gray-100 rounded-lg p-4">
                                <div className="font-semibold">{`${record.student.firstName} ${record.student.lastName}`}</div>
                                <div className="text-gray-800">{record.status}</div>
                                <div className="text-gray-600">{record.time}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">No attendance records found for this date.</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
