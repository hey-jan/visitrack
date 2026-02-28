export const attendanceData: { [key: string]: { firstName: string, lastName: string; status: string; time: string }[] } = {
  'Jan 10, 2026': [
    { firstName: 'John', lastName: 'Dela Cruz', status: 'Present', time: '08:00 AM' },
    { firstName: 'Maria', lastName: 'Garcia', status: 'Present', time: '08:01 AM' },
    { firstName: 'Pedro', lastName: 'Reyes', status: 'Present', time: '08:02 AM' },
    { firstName: 'Ana', lastName: 'Santos', status: 'Late', time: '08:15 AM' },
    { firstName: 'Jose', lastName: 'Mendoza', status: 'Present', time: '08:03 AM' },
    { firstName: 'Sophia', lastName: 'Turner', status: 'Absent', time: '-' },
    { firstName: 'Oliver', lastName: 'Wilson', status: 'Present', time: '08:04 AM' },
  ],
  'Jan 09, 2026': [
    { firstName: 'John', lastName: 'Dela Cruz', status: 'Present', time: '08:00 AM' },
    { firstName: 'Maria', lastName: 'Garcia', status: 'Absent', time: '-' },
    { firstName: 'Pedro', lastName: 'Reyes', status: 'Present', time: '08:01 AM' },
    { firstName: 'Ana', lastName: 'Santos', status: 'Present', time: '08:02 AM' },
    { firstName: 'Jose', lastName: 'Mendoza', status: 'Present', time: '08:03 AM' },
    { firstName: 'Sophia', lastName: 'Turner', status: 'Present', time: '08:04 AM' },
    { firstName: 'Oliver', lastName: 'Wilson', status: 'Present', time: '08:05 AM' },
  ],
  'Jan 08, 2026': [
    { firstName: 'John', lastName: 'Dela Cruz', status: 'Present', time: '08:00 AM' },
    { firstName: 'Maria', lastName: 'Garcia', status: 'Present', time: '08:01 AM' },
    { firstName: 'Pedro', lastName: 'Reyes', status: 'Absent', time: '-' },
    { firstName: 'Ana', lastName: 'Santos', status: 'Present', time: '08:02 AM' },
    { firstName: 'James', lastName: 'Wilson', status: 'Present', time: '08:03 AM' },
  ],
  'Jan 07, 2026': [
    { firstName: 'John', lastName: 'Dela Cruz', status: 'Absent', time: '-' },
    { firstName: 'Maria', lastName: 'Garcia', status: 'Present', time: '08:01 AM' },
    { firstName: 'Pedro', lastName: 'Reyes', status: 'Present', time: '08:02 AM' },
    { firstName: 'Ana', lastName: 'Santos', status: 'Present', time: '08:03 AM' },
    { firstName: 'James', lastName: 'Wilson', status: 'Present', time: '08:04 AM' },
  ]
};
