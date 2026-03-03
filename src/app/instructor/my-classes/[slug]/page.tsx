'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaCalendarAlt, FaSearch, FaUser, FaFilePdf, FaFileExcel, 
  FaMapMarkerAlt, FaClock, FaHashtag, FaLayerGroup, 
  FaChevronRight, FaCamera, FaInfoCircle, FaFilter, FaDownload 
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

type ExportType = 'All' | 'Daily' | 'Weekly' | 'Monthly' | 'Range';

const AttendancePage = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Export Settings States
  const [exportType, setExportType] = useState<ExportType>('All');
  const [selectedStudentForExport, setSelectedStudentForExport] = useState('All');
  const [exportSpecificDate, setExportSpecificDate] = useState('');
  const [exportMonth, setExportMonth] = useState('');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  
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

  const scheduleStatus = useMemo(() => {
    if (!classDetails) return { isAvailable: false, reason: 'Loading class details...' };

    const now = new Date();
    const todayStr = now.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    if (availableDates.includes(todayStr)) {
      return { isAvailable: false, reason: 'Attendance already recorded for today.' };
    }

    const dayNames = ['SUN', 'M', 'T', 'W', 'TH', 'F', 'S'];
    const currentDay = dayNames[now.getDay()];
    const isEveryDay = classDetails.days === 'M-SUN';
    const scheduledDays = classDetails.days === 'TTH' ? ['T', 'TH'] : 
                         classDetails.days === 'MWF' ? ['M', 'W', 'F'] : 
                         [classDetails.days];

    const isCorrectDay = isEveryDay || scheduledDays.includes(currentDay);
    if (!isCorrectDay) {
      return { isAvailable: false, reason: `Not scheduled for today (${classDetails.days}).` };
    }

    if (!isEveryDay) {
      try {
        const [startTimeStr, endTimeStr] = classDetails.time.split(' - ');
        const parseTime = (timeStr: string) => {
          const [time, modifier] = timeStr.split(' ');
          let [hours, minutes] = time.split(':').map(Number);
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          const d = new Date(now);
          d.setHours(hours, minutes, 0, 0);
          return d;
        };
        const startTime = parseTime(startTimeStr);
        const endTime = parseTime(endTimeStr);
        if (now < startTime) return { isAvailable: false, reason: `Class hasn't started yet (Scheduled: ${classDetails.time}).` };
        if (now > endTime) return { isAvailable: false, reason: `Class has already ended (Scheduled: ${classDetails.time}).` };
      } catch (e) {
        console.error('Error parsing time:', e);
      }
    }
    return { isAvailable: true, reason: '' };
  }, [classDetails, availableDates]);

  const getFilteredDates = () => {
    let dates = [...availableDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    if (exportType === 'Daily' && exportSpecificDate) {
      const [y, m, d] = exportSpecificDate.split('-').map(Number);
      const target = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      dates = dates.filter(d => d === target);
    } else if (exportType === 'Monthly' && exportMonth) {
      const [year, month] = exportMonth.split('-');
      dates = dates.filter(d => {
        const dateObj = new Date(d);
        return dateObj.getFullYear() === parseInt(year) && (dateObj.getMonth() + 1) === parseInt(month);
      });
    } else if (exportType === 'Range' && exportStartDate && exportEndDate) {
      const [sy, sm, sd] = exportStartDate.split('-').map(Number);
      const [ey, em, ed] = exportEndDate.split('-').map(Number);
      const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0).getTime();
      const end = new Date(ey, em - 1, ed, 23, 59, 59, 999).getTime();
      
      dates = dates.filter(d => {
        const time = new Date(d).getTime();
        return time >= start && time <= end;
      });
    }
    
    return dates;
  };

  const handleExportExcel = async () => {
    if (!classDetails || !classDetails.students) return;
    const targetDates = getFilteredDates();
    if (targetDates.length === 0) {
      alert('No attendance records found for the selected criteria.');
      return;
    }

    setIsExporting(true);
    try {
      const res = await fetch(`/api/attendance/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch attendance data.');
      const allAttendanceRecords: AttendanceRecord[] = await res.json();
      
      const workbook = XLSX.utils.book_new();
      
      const getPeriodString = () => {
        if (exportType === 'Daily') return targetDates[0];
        if (exportType === 'Monthly' && exportMonth) {
          const [y, m] = exportMonth.split('-');
          return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        }
        if (exportType === 'Range' && exportStartDate && exportEndDate) {
          return `${exportStartDate} to ${exportEndDate}`;
        }
        return `${targetDates[0]} - ${targetDates[targetDates.length - 1]}`;
      };

      const genDate = new Date().toLocaleString();
const createMetadataHeader = (reportTitle: string, studentName?: string) => {
  return [
    ['VISITRACK ATTENDANCE MANAGEMENT SYSTEM'],
    [reportTitle.toUpperCase()],
    [],
    ['CLASS CODE:', classDetails.code, '', 'INSTRUCTOR:', `${classDetails.teacher.firstName} ${classDetails.teacher.lastName}`],
    ['PERIOD:', getPeriodString(), '', 'GENERATED:', genDate],
    ['SCHEDULE ID:', classDetails.schedule],
    ...(studentName ? [['STUDENT:', studentName.toUpperCase()]] : []),
    [],
  ];
};

      const groupByMonth = (dates: string[]) => {
        return dates.reduce((acc, date) => {
          const month = new Date(date).toLocaleString('en-US', { month: 'long', year: 'numeric' });
          if (!acc[month]) acc[month] = [];
          acc[month].push(date);
          return acc;
        }, {} as Record<string, string[]>);
      };

      const months = groupByMonth(targetDates);

      if (selectedStudentForExport !== 'All') {
        const student = classDetails.students.find(s => `${s.firstName} ${s.lastName}` === selectedStudentForExport);
        if (!student) return;

        const header = createMetadataHeader('Student Attendance Report', selectedStudentForExport);
        const tableHeader = ['DATE', 'STATUS', 'ARRIVAL TIME'];
        const tableData = targetDates.map(date => {
          const record = allAttendanceRecords.find(ar => ar.session.date === date && ar.student.id === student.id);
          return [date, record ? record.status.toUpperCase() : 'ABSENT', record ? record.time : '--:--'];
        });

        const worksheet = XLSX.utils.aoa_to_sheet([...header, tableHeader, ...tableData]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Logs');

        let filename = `${classDetails.code}_${selectedStudentForExport}_Attendance`;
        if (exportType === 'Daily') filename += `_${exportSpecificDate}`;
        else if (exportType === 'Monthly') filename += `_${exportMonth}`;
        else if (exportType === 'Range') filename += `_${exportStartDate}_to_${exportEndDate}`;
        
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      } else {
        // Summary Sheet
        const summaryHeader = createMetadataHeader('Class Attendance Summary');
        const summaryTableHeader = ['STUDENT NAME', 'PRESENT', 'ABSENT', 'TOTAL', 'OVERALL %'];
        const summaryData = classDetails.students.map(student => {
          let present = 0;
          targetDates.forEach(date => {
            const record = allAttendanceRecords.find(ar => ar.session.date === date && ar.student.id === student.id);
            if (record && (record.status === 'Present' || record.status === 'Late')) present++;
          });
          const percentage = targetDates.length > 0 ? ((present / targetDates.length) * 100).toFixed(1) : '0.0';
          return [`${student.firstName} ${student.lastName}`.toUpperCase(), present.toString(), (targetDates.length - present).toString(), targetDates.length.toString(), `${percentage}%`];
        });

        const summarySheet = XLSX.utils.aoa_to_sheet([...summaryHeader, summaryTableHeader, ...summaryData]);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

        // Monthly Sheets
        Object.entries(months).forEach(([monthName, dates]) => {
          const monthlyHeader = createMetadataHeader(`Monthly Matrix - ${monthName}`);
          const monthlyTableHeader = ['STUDENT NAME', ...dates.map(d => new Date(d).getDate().toString()), 'P', 'A', '%'];
          const monthlyData = classDetails.students.map(student => {
            let monthPresent = 0;
            const dateStatuses = dates.map(date => {
              const record = allAttendanceRecords.find(ar => ar.session.date === date && ar.student.id === student.id);
              if (record && (record.status === 'Present' || record.status === 'Late')) {
                monthPresent++;
                return record.status === 'Late' ? 'L' : 'P';
              }
              return 'A';
            });
            const percentage = ((monthPresent / dates.length) * 100).toFixed(1);
            return [`${student.firstName} ${student.lastName}`.toUpperCase(), ...dateStatuses, monthPresent.toString(), (dates.length - monthPresent).toString(), `${percentage}%`];
          });

          const worksheet = XLSX.utils.aoa_to_sheet([...monthlyHeader, monthlyTableHeader, ...monthlyData]);
          XLSX.utils.book_append_sheet(workbook, worksheet, monthName.substring(0, 31));
        });

        let filename = `${classDetails.code}_Attendance_Report`;
        if (exportType === 'Daily') filename += `_${exportSpecificDate}`;
        else if (exportType === 'Monthly') filename += `_${exportMonth}`;
        else if (exportType === 'Range') filename += `_${exportStartDate}_to_${exportEndDate}`;
        
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      }
    } catch (error) {
      console.error('Excel Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!classDetails || !classDetails.students) return;
    const targetDates = getFilteredDates();
    if (targetDates.length === 0) {
      alert('No attendance records found for the selected criteria.');
      return;
    }

    setIsExporting(true);
    try {
      const res = await fetch(`/api/attendance/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch attendance data.');
      const allAttendanceRecords: AttendanceRecord[] = await res.json();
      
      const doc = new jsPDF();

      const getPeriodString = (monthOverride?: string) => {
        if (monthOverride) return monthOverride;
        if (exportType === 'Daily') return targetDates[0];
        if (exportType === 'Monthly' && exportMonth) {
          const [y, m] = exportMonth.split('-');
          return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        }
        if (exportType === 'Range' && exportStartDate && exportEndDate) {
          const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
          return `${formatDate(exportStartDate)} - ${formatDate(exportEndDate)}`;
        }
        if (targetDates.length > 0) {
          if (targetDates.length === 1) return targetDates[0];
          return `${targetDates[0]} - ${targetDates[targetDates.length - 1]}`;
        }
        return 'N/A';
      };

      const addHeader = (title: string, monthOverride?: string, studentName?: string) => {
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        
        // --- Document Title ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0); // All black
        doc.text(title.toUpperCase(), pageWidth / 2, 22, { align: 'center' });
        
        // Subtle divider line
        doc.setDrawColor(0, 0, 0); // All black
        doc.setLineWidth(0.5);
        doc.line(14, 25, pageWidth - 14, 25);

        // --- Metadata Information ---
        doc.setFontSize(8.5);
        const leftX = 14;
        const midX = pageWidth / 2 + 5;
        
        const drawMeta = (label: string, value: string, x: number, y: number) => {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0); // All black
          doc.text(label, x, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0); // All black
          doc.text(value.toUpperCase(), x + 24, y);
        };

        const genDate = new Date().toLocaleString('en-US', { 
          month: 'short', day: '2-digit', year: 'numeric', 
          hour: '2-digit', minute: '2-digit', hour12: true 
        });

        drawMeta('CLASS CODE:', classDetails.code, leftX, 34);
        drawMeta('INSTRUCTOR:', `${classDetails.teacher.firstName} ${classDetails.teacher.lastName}`, midX, 34);
        drawMeta('PERIOD:', getPeriodString(monthOverride), leftX, 40);
        drawMeta('GENERATED:', genDate, midX, 40);
        drawMeta('SCHEDULE ID:', classDetails.schedule, leftX, 46);

        if (studentName) {
          drawMeta('STUDENT:', studentName, midX, 46);
        }

        // Professional Footer
        doc.setFontSize(7);
        doc.setTextColor(0, 0, 0); // All black
        doc.setDrawColor(0, 0, 0); // All black
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
        doc.text('VISITRACK', 14, pageHeight - 10);
        const pageInfo = `PAGE ${doc.getNumberOfPages()}`;
        doc.text(pageInfo, pageWidth - 14, pageHeight - 10, { align: 'right' });
        doc.setTextColor(0, 0, 0);
      };

      const groupByMonth = (dates: string[]) => {
        return dates.reduce((acc, date) => {
          const month = new Date(date).toLocaleString('en-US', { month: 'long', year: 'numeric' });
          if (!acc[month]) acc[month] = [];
          acc[month].push(date);
          return acc;
        }, {} as Record<string, string[]>);
      };
      const months = groupByMonth(targetDates);

      if (selectedStudentForExport !== 'All') {
        const student = classDetails.students.find(s => `${s.firstName} ${s.lastName}` === selectedStudentForExport);
        if (!student) return;

        const isDaily = exportType === 'Daily';

        if (!isDaily) {
          let grandPresent = 0;
          let grandTotal = 0;

          const monthlySummaryData = Object.entries(months).map(([monthName, dates]) => {
            let present = 0;
            dates.forEach(date => {
              const record = allAttendanceRecords.find(ar => ar.session.date === date && ar.student.id === student.id);
              if (record && (record.status === 'Present' || record.status === 'Late')) present++;
            });
            grandPresent += present;
            grandTotal += dates.length;
            const percentage = ((present / dates.length) * 100).toFixed(1);
            return [monthName, present.toString(), (dates.length - present).toString(), dates.length.toString(), `${percentage}%`];
          });

          if (Object.keys(months).length > 1) {
            const overallPercentage = ((grandPresent / grandTotal) * 100).toFixed(1);
            monthlySummaryData.push(['TOTAL', grandPresent.toString(), (grandTotal - grandPresent).toString(), grandTotal.toString(), `${overallPercentage}%`]);
          }

          autoTable(doc, {
            startY: 62,
            margin: { top: 62 },
            head: [['MONTH', 'PRESENT', 'ABSENT', 'SESSIONS', 'ATTENDANCE %']],
            body: monthlySummaryData,
            theme: 'striped',
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', halign: 'center' },
            bodyStyles: { textColor: [0, 0, 0], fontSize: 8, halign: 'center' },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
            didDrawPage: () => addHeader('Student Attendance Report', undefined, selectedStudentForExport),
            didParseCell: (data) => {
              if (Object.keys(months).length > 1 && data.row.index === monthlySummaryData.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [245, 245, 245];
              }
            }
          });
          doc.addPage();
        }

        const reportTitle = isDaily ? 'Daily Attendance Log' : 'Detailed Attendance Logs';
        const tableData = targetDates.map(date => {
          const record = allAttendanceRecords.find(ar => ar.session.date === date && ar.student.id === student.id);
          return [date, record ? record.status.toUpperCase() : 'ABSENT', record ? record.time : '--:--'];
        });

        autoTable(doc, {
          startY: 62,
          margin: { top: 62 },
          head: [['DATE', 'STATUS', 'ARRIVAL TIME']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', halign: 'center' },
          bodyStyles: { textColor: [0, 0, 0], fontSize: 8, halign: 'center' },
          didDrawPage: () => addHeader(reportTitle, undefined, selectedStudentForExport),
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 1) {
              data.cell.styles.textColor = [0, 0, 0];
            }
          }
        });

        let filename = `${classDetails.code}_${selectedStudentForExport}_Attendance`;
        if (isDaily) filename += `_${exportSpecificDate}`;
        else if (exportType === 'Monthly') filename += `_${exportMonth}`;
        else if (exportType === 'Range') filename += `_${exportStartDate}_to_${exportEndDate}`;
        
        doc.save(`${filename}.pdf`);
      } else {
        const isDaily = exportType === 'Daily';

        if (isDaily) {
          const tableData = classDetails.students.map(student => {
            const record = allAttendanceRecords.find(ar => ar.session.date === targetDates[0] && ar.student.id === student.id);
            return [
              `${student.firstName} ${student.lastName}`.toUpperCase(),
              record ? record.status.toUpperCase() : 'ABSENT',
              record ? record.time : '--:--'
            ];
          });

          autoTable(doc, {
            startY: 62,
            margin: { top: 62 },
            head: [['STUDENT NAME', 'STATUS', 'ARRIVAL TIME']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', halign: 'center' },
            bodyStyles: { textColor: [0, 0, 0], fontSize: 8, halign: 'center' },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
            didDrawPage: () => addHeader('Daily Attendance Report'),
            didParseCell: (data) => {
              if (data.section === 'body' && data.column.index === 1) {
                data.cell.styles.textColor = [0, 0, 0];
              }
            }
          });

          doc.save(`${classDetails.code}_Full_Attendance_${exportSpecificDate}.pdf`);
        } else {
          const summaryData = classDetails.students.map(student => {
            let present = 0;
            targetDates.forEach(date => {
              const record = allAttendanceRecords.find(ar => ar.session.date === date && ar.student.id === student.id);
              if (record && (record.status === 'Present' || record.status === 'Late')) present++;
            });
            const percentage = targetDates.length > 0 ? ((present / targetDates.length) * 100).toFixed(1) : '0.0';
            return [`${student.firstName} ${student.lastName}`.toUpperCase(), present.toString(), (targetDates.length - present).toString(), targetDates.length.toString(), `${percentage}%`];
          });

          autoTable(doc, {
            startY: 62,
            margin: { top: 62 },
            head: [['STUDENT NAME', 'PRESENT', 'ABSENT', 'TOTAL', 'OVERALL %']],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', halign: 'center' },
            bodyStyles: { textColor: [0, 0, 0], fontSize: 8, halign: 'center' },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
            didDrawPage: () => addHeader('Class Attendance Summary')
          });

          Object.entries(months).forEach(([monthName, dates]) => {
            doc.addPage('a4', 'l');
            const headRow = ['STUDENT NAME', ...dates.map(d => new Date(d).getDate().toString()), 'P', 'A', '%'];
            const monthlyMatrixData = classDetails.students.map(student => {
              let monthPresent = 0;
              const dateStatuses = dates.map(date => {
                const record = allAttendanceRecords.find(ar => ar.session.date === date && ar.student.id === student.id);
                if (record && (record.status === 'Present' || record.status === 'Late')) {
                  monthPresent++;
                  return record.status === 'Late' ? 'L' : 'P';
                }
                return 'A';
              });
              const percentage = ((monthPresent / dates.length) * 100).toFixed(1);
              return [`${student.firstName} ${student.lastName}`.toUpperCase(), ...dateStatuses, monthPresent.toString(), (dates.length - monthPresent).toString(), `${percentage}%`];
            });

            autoTable(doc, {
              startY: 62,
              margin: { top: 62 },
              head: [headRow],
              body: monthlyMatrixData,
              theme: 'grid',
              headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
              bodyStyles: { textColor: [0, 0, 0], fontSize: 6, halign: 'center' },
              columnStyles: { 0: { halign: 'left', cellWidth: 'auto', fontStyle: 'bold' } },
              didDrawPage: () => addHeader('Attendance Matrix', monthName),
              didParseCell: (data) => {
                if (data.section === 'body' && data.column.index > 0 && data.column.index <= dates.length) {
                  data.cell.styles.textColor = [0, 0, 0];
                }
              }
            });
          });

          let filename = `${classDetails.code}_Attendance_Summary`;
          if (exportType === 'Monthly') filename += `_${exportMonth}`;
          else if (exportType === 'Range') filename += `_${exportStartDate}_to_${exportEndDate}`;
          
          doc.save(`${filename}.pdf`);
        }
      }
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

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

  const presentCount = attendanceRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'Absent').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'Late').length;
  const currentSessionLocation = attendanceRecords[0]?.session;

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
          {scheduleStatus.isAvailable ? (
            <Link
              href={`/instructor/my-classes/${slug}/take-attendance`}
              className="bg-black text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-gray-200"
            >
              <FaCamera size={12} /> Take Attendance
            </Link>
          ) : (
            <div className="relative group">
              <button disabled className="bg-gray-100 text-gray-400 px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest cursor-not-allowed border border-gray-200">
                <FaCamera size={12} /> Take Attendance
              </button>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 bg-gray-900 text-white text-[9px] p-2 rounded-lg shadow-xl z-50 text-center font-bold uppercase tracking-wider">
                <FaInfoCircle className="inline mr-1 mb-0.5" />
                {scheduleStatus.reason}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simplified Export Configuration Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <FaFilter size={12} className="text-gray-400" />
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Export Parameters</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Report Scope</label>
            <select 
              value={selectedStudentForExport}
              onChange={(e) => setSelectedStudentForExport(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-black outline-none appearance-none cursor-pointer"
            >
              <option value="All">Full Class Report</option>
              {classDetails.students.map(s => (
                <option key={s.id} value={`${s.firstName} ${s.lastName}`}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Temporal Filter</label>
            <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
              {(['All', 'Daily', 'Monthly', 'Range'] as ExportType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setExportType(type)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                    exportType === type ? 'bg-white text-black shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              {exportType === 'Daily' ? 'Select Date' : exportType === 'Monthly' ? 'Select Month' : exportType === 'Range' ? 'Start Date' : 'Filter Status'}
            </label>
            {exportType === 'Daily' && (
              <input type="date" value={exportSpecificDate} onChange={(e) => setExportSpecificDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-black outline-none" />
            )}
            {exportType === 'Monthly' && (
              <input type="month" value={exportMonth} onChange={(e) => setExportMonth(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-black outline-none" />
            )}
            {exportType === 'Range' && (
              <input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-black outline-none" />
            )}
            {exportType === 'All' && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-[10px] font-bold text-gray-400 uppercase italic">Archival Scope</div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{exportType === 'Range' ? 'End Date' : 'Registry Export'}</label>
            {exportType === 'Range' ? (
              <input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-black outline-none" />
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="flex-1 bg-white border border-gray-200 text-black py-2 rounded-xl flex items-center justify-center gap-2 hover:border-black transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm disabled:opacity-50"
                >
                  <FaFilePdf size={10} className="text-black" /> PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  className="flex-1 bg-white border border-gray-200 text-black py-2 rounded-xl flex items-center justify-center gap-2 hover:border-black transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm disabled:opacity-50"
                >
                  <FaFileExcel size={10} className="text-black" /> Excel
                </button>
              </div>
            )}
          </div>
        </div>
        
        {exportType === 'Range' && (
          <div className="px-6 pb-6 flex justify-end">
            <div className="flex gap-2 w-full md:w-1/2 lg:w-1/4">
              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="flex-1 bg-white border border-gray-200 text-black py-2 rounded-xl flex items-center justify-center gap-2 hover:border-black transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm disabled:opacity-50"
              >
                <FaFilePdf size={10} className="text-black" /> PDF
              </button>
              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="flex-1 bg-white border border-gray-200 text-black py-2 rounded-xl flex items-center justify-center gap-2 hover:border-black transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm disabled:opacity-50"
              >
                <FaFileExcel size={10} className="text-black" /> Excel
              </button>
            </div>
          </div>
        )}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Enrolled', value: classDetails.students.length },
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

            <div className="lg:col-span-3 space-y-4">
              <div className="flex flex-col items-start gap-4 px-1">
                <div className="w-full space-y-2">
                  <h2 className="text-xs font-bold text-black uppercase tracking-widest flex items-center">
                    Logs for <span className="ml-2 text-gray-400">{selectedDate || 'Select a date'}</span>
                  </h2>
                  {selectedDate && currentSessionLocation?.latitude && (
                    <div className="flex items-start gap-2 bg-gray-50 text-gray-500 px-3 py-2 rounded-xl border border-gray-100 text-[9px] font-bold uppercase tracking-widest shadow-sm w-full">
                      <FaMapMarkerAlt size={10} className="text-black/30 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">
                        {currentSessionLocation.address || `GPS: ${currentSessionLocation.latitude.toFixed(4)}, ${currentSessionLocation.longitude?.toFixed(4)}`}
                      </span>
                    </div>
                  )}
                </div>
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
              Officially Enrolled <span className="ml-2 text-gray-400">({classDetails.students.length} Students)</span>
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
