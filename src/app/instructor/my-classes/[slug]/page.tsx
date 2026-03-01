'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCalendarAlt, FaSearch, FaUser, FaFilePdf, FaFileExcel, FaMapMarkerAlt, FaClock, FaHashtag, FaLayerGroup, FaChevronRight, FaCamera } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import BackButton from '@/components/features/shared/BackButton';

interface ClassDetails {
  id: string;
  code: string;
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
  email: string;
  year: number;
  section: string;
  courseName: string;
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
  const slug = params.slug as string;

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForExport, setSelectedStudentForExport] = useState('All');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [viewMode, setViewMode] = useState<'logs' | 'roster'>('logs');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classRes = await fetch(`/api/classes/${slug}`);
        if (classRes.ok) {
          const classData: ClassDetails = await classRes.json();
          setClassDetails(classData);
        }

        const datesRes = await fetch(`/api/attendance/dates/${slug}`);
        if (datesRes.ok) {
          const datesData = await datesRes.json();
          if (Array.isArray(datesData)) {
            setAvailableDates(datesData);
            if (datesData.length > 0 && !selectedDate) {
              setSelectedDate(datesData[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (selectedDate && slug && viewMode === 'logs') {
      const fetchAttendance = async () => {
        setIsLoadingAttendance(true);
        try {
          const attendanceRes = await fetch(`/api/attendance/${slug}?date=${encodeURIComponent(selectedDate)}`);
          if (attendanceRes.ok) {
            const attendanceData = await attendanceRes.json();
            if (Array.isArray(attendanceData)) {
              setAttendanceRecords(attendanceData);
            }
          }
        } catch (error) {
          console.error('Error fetching attendance records:', error);
        } finally {
          setIsLoadingAttendance(false);
        }
      };
      fetchAttendance();
    }
  }, [slug, selectedDate, viewMode]);

  if (!classDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  const filteredLogs = attendanceRecords.filter((record) =>
    `${record.student.firstName} ${record.student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRoster = (classDetails.students || []).filter((student) =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStudentsInClass = classDetails?.students?.length || 0;
  const presentCount = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'Absent').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;

  const handleExportExcel = async () => {
    if (!classDetails || !classDetails.students) return;
    setIsExporting(true);
    try {
      const res = await fetch(`/api/attendance/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch attendance data.');
      const allAttendanceRecords: AttendanceRecord[] = await res.json();
      const workbook = XLSX.utils.book_new();

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
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
        XLSX.writeFile(workbook, `${classDetails.code}_${selectedStudentForExport}_Attendance.xlsx`);
      } else {
        const summaryRows = classDetails.students.map(student => {
          let present = 0;
          let absent = 0;
          availableDates.forEach(date => {
            const record = allAttendanceRecords.find(ar => ar.session.date === date && ar.student.id === student.id);
            if (record && (record.status === 'Present' || record.status === 'Late')) present++;
            else absent++;
          });
          return { 'Student Name': `${student.firstName} ${student.lastName}`, 'Present': present, 'Absent': absent };
        });
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryRows);
        XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
        XLSX.writeFile(workbook, `${classDetails.code}_Attendance_Summary.xlsx`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <BackButton variant="text" label="Back to Registry" href="/instructor/my-classes" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">{classDetails.code}</h1>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider flex items-center">
            {viewMode === 'logs' ? 'Attendance Archive & Export' : 'Class Roster & Directory'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/instructor/my-classes/${slug}/take-attendance`}
            className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-gray-200"
          >
            <FaCamera size={12} /> Take Attendance
          </Link>
          <button
            onClick={() => console.log('Export PDF')}
            className="bg-white border border-gray-200 text-black px-5 py-2.5 rounded-xl flex items-center gap-2 hover:border-black transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm"
          >
            <FaFilePdf size={12} /> Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-gray-200 disabled:opacity-50"
            disabled={isExporting}
          >
            <FaFileExcel size={12} /> {isExporting ? 'Processing...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setViewMode('logs')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            viewMode === 'logs' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Attendance Logs
        </button>
        <button
          onClick={() => setViewMode('roster')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
            viewMode === 'roster' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Master Roster
        </button>
      </div>

      {/* Class Context Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-100">
          <div className="p-6 text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Room</p>
            <p className="text-sm font-bold text-black uppercase tracking-tight">{classDetails.room}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Schedule</p>
            <p className="text-sm font-bold text-black uppercase tracking-tight">{classDetails.days}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Time</p>
            <p className="text-sm font-bold text-black uppercase tracking-tight">{classDetails.time}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID</p>
            <p className="text-sm font-mono font-bold text-gray-500 uppercase">#{classDetails.schedule}</p>
          </div>
          <div className="p-6 text-center bg-gray-50/50">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Course Units</p>
            <p className="text-sm font-bold text-black uppercase tracking-tight">{classDetails.units} Units</p>
          </div>
        </div>
      </div>

      {viewMode === 'logs' ? (
        <>
          {/* Analytics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Enrolled', value: totalStudentsInClass },
              { label: 'Present Today', value: presentCount },
              { label: 'Absent', value: absentCount },
              { label: 'Late', value: lateCount }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-black">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Date Selector Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center px-1 mb-2">
                <FaCalendarAlt className="mr-2 text-black opacity-30" size={12} />
                <h2 className="text-xs font-bold text-black uppercase tracking-widest">Session Dates</h2>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
                  {availableDates.length > 0 ? (
                    availableDates.map((date) => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`w-full text-left px-6 py-4 transition-all flex items-center justify-between group ${
                          selectedDate === date ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-tight">{date}</span>
                        <FaChevronRight size={10} className={selectedDate === date ? 'text-white' : 'text-gray-300 opacity-0 group-hover:opacity-100'} />
                      </button>
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No logs found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Records Table */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
                <h2 className="text-xs font-bold text-black uppercase tracking-widest flex items-center">
                  Logs for <span className="ml-2 text-gray-400">{selectedDate || 'Select a date'}</span>
                </h2>
                <div className="relative w-full md:w-72">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-20" size={12} />
                  <input
                    type="text"
                    placeholder="Search student..."
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Student Identity</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Status</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Arrival Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {isLoadingAttendance ? (
                        <tr>
                          <td colSpan={3} className="py-20 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
                          </td>
                        </tr>
                      ) : filteredLogs.length > 0 ? (
                        filteredLogs.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-8 py-4">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-[10px] mr-4 shadow-sm group-hover:scale-105 transition-transform">
                                  {record.student.firstName[0]}{record.student.lastName[0]}
                                </div>
                                <span className="font-semibold text-gray-900 text-sm uppercase tracking-tight">{`${record.student.firstName} ${record.student.lastName}`}</span>
                              </div>
                            </td>
                            <td className="px-8 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-gray-100 text-black border border-gray-200">
                                {record.status}
                              </span>
                            </td>
                            <td className="px-8 py-4 text-right text-xs font-mono font-bold text-gray-500 uppercase tracking-tight">
                              {record.time || 'N/A'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-20 text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No active logs for this session</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
            <h2 className="text-xs font-bold text-black uppercase tracking-widest flex items-center">
              Officially Enrolled <span className="ml-2 text-gray-400">({totalStudentsInClass} Students)</span>
            </h2>
            <div className="relative w-full md:w-72">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-20" size={12} />
              <input
                type="text"
                placeholder="Search roster..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Student Full Name</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Email Address</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Year Level</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Academic Program</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRoster.length > 0 ? (
                    filteredRoster.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-[10px] mr-4 shadow-sm group-hover:scale-105 transition-transform">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <span className="font-semibold text-gray-900 text-sm uppercase tracking-tight">{`${student.firstName} ${student.lastName}`}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-xs font-medium text-gray-500 lowercase">
                          {student.email || 'No email provided'}
                        </td>
                        <td className="px-8 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-tight">
                          Year {student.year} - {student.section}
                        </td>
                        <td className="px-8 py-4 text-right">
                          <span className="text-[10px] font-black text-black bg-gray-100 px-2.5 py-1 rounded-md uppercase tracking-tighter">
                            {student.courseName}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No students found matching your search</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #000; }
      `}</style>
    </div>
  );
};

export default AttendancePage;
