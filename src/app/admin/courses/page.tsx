'use client';

import React, { useState, useMemo } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmationModal from '../components/ConfirmationModal';

const ManageCoursesPage = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const courses = useMemo(() => [
    { schedNo: '11965', courseNo: 'CC-COMPROG11', time: '8:00 - 9:30 AM', days: 'MWF', room: '538', units: 3 },
    { schedNo: '12043', courseNo: 'CC-INTCOM11', time: '1:00 - 2:30 PM', days: 'TTH', room: '205', units: 3 },
    { schedNo: '11892', courseNo: 'ENGL 100', time: '10:00 - 11:30 AM', days: 'MWF', room: '104', units: 3 },
    { schedNo: '12156', courseNo: 'MATH 100', time: '2:30 - 4:00 PM', days: 'TTH', room: '402', units: 3 },
    { schedNo: '11987', courseNo: 'MATH 101', time: '11:00 AM - 12:30 PM', days: 'MWF', room: '203', units: 3 },
    { schedNo: '12345', courseNo: 'NSTP 101', time: '8:00 - 9:30 AM', days: 'S', room: '301', units: 1 },
    { schedNo: '12346', courseNo: 'PE 101', time: '1:00 - 2:30 PM', days: 'TTH', room: 'GYM', units: 2 },
    { schedNo: '12347', courseNo: 'PSYCH 101', time: '4:00 - 5:30 PM', days: 'MWF', room: '112', units: 3 },
    { schedNo: '12348', courseNo: 'ST 101', time: '10:00 - 11:30 AM', days: 'TTH', room: '223', units: 3 },
    { schedNo: '12349', courseNo: 'CC-COMPROG12', time: '8:00 - 9:30 AM', days: 'TTH', room: '539', units: 3 },
    { schedNo: '12350', courseNo: 'CC-DISCRET12', time: '1:00 - 2:30 PM', days: 'MWF', room: '206', units: 3 },
    { schedNo: '12351', courseNo: 'CC-TWRITE12', time: '10:00 - 11:30 AM', days: 'TTH', room: '105', units: 3 },
    { schedNo: '12352', courseNo: 'ENGL 101', time: '2:30 - 4:00 PM', days: 'MWF', room: '403', units: 3 },
    { schedNo: '12353', courseNo: 'ENTREP 101', time: '11:00 AM - 12:30 PM', days: 'TTH', room: '204', units: 3 },
    { schedNo: '12354', courseNo: 'HIST 101', time: '8:00 - 9:30 AM', days: 'MWF', room: '302', units: 3 },
    { schedNo: '12355', courseNo: 'HUM 101', time: '1:00 - 2:30 PM', days: 'TTH', room: '113', units: 3 },
    { schedNo: '12356', courseNo: 'NSTP 102', time: '10:00 - 11:30 AM', days: 'S', room: '303', units: 1 },
    { schedNo: '12357', courseNo: 'PE 102', time: '2:30 - 4:00 PM', days: 'TTH', room: 'GYM', units: 2 },
    { schedNo: '12358', courseNo: 'CC-DASTRUC21', time: '11:00 AM - 12:30 PM', days: 'MWF', room: '540', units: 4 },
    { schedNo: '12359', courseNo: 'CC-QUAMETH21', time: '8:00 - 9:30 AM', days: 'TTH', room: '207', units: 3 },
    { schedNo: '12360', courseNo: 'CS-DIFFCAL21', time: '1:00 - 2:30 PM', days: 'MWF', room: '404', units: 4 },
    { schedNo: '12361', courseNo: 'CS-DISCRET21', time: '10:00 - 11:30 AM', days: 'TTH', room: '106', units: 3 },
    { schedNo: '12362', courseNo: 'CS-OOPROG21', time: '2:30 - 4:00 PM', days: 'MWF', room: '541', units: 4 },
    { schedNo: '12363', courseNo: 'PE 103', time: '11:00 AM - 12:30 PM', days: 'TTH', room: 'GYM', units: 2 },
    { schedNo: '12364', courseNo: 'RIZAL 101', time: '8:00 - 9:30 AM', days: 'MWF', room: '304', units: 3 },
    { schedNo: '12365', courseNo: 'SOCIO 101', time: '1:00 - 2:30 PM', days: 'TTH', room: '114', units: 3 },
    { schedNo: '12366', courseNo: 'CC-APPSDEV22', time: '10:00 - 11:30 AM', days: 'MWF', room: '542', units: 4 },
    { schedNo: '12367', courseNo: 'CC-DATACOM22', time: '2:30 - 4:00 PM', days: 'TTH', room: '208', units: 3 },
    { schedNo: '12368', courseNo: 'CC-DIGILOG22', time: '11:00 AM - 12:30 PM', days: 'MWF', room: '107', units: 3 },
    { schedNo: '12369', courseNo: 'CS-DAALGO22', time: '8:00 - 9:30 AM', days: 'TTH', room: '543', units: 4 },
    { schedNo: '12370', courseNo: 'CS-INTCAL22', time: '1:00 - 2:30 PM', days: 'MWF', room: '405', units: 4 },
    { schedNo: '12371', courseNo: 'PE 104', time: '10:00 - 11:30 AM', days: 'TTH', room: 'GYM', units: 2 },
    { schedNo: '12372', courseNo: 'PHILO 101', time: '2:30 - 4:00 PM', days: 'MWF', room: '115', units: 3 },
    { schedNo: '12373', courseNo: 'STS 101', time: '11:00 AM - 12:30 PM', days: 'TTH', room: '305', units: 3 },
  ], []);

  const filteredCourses = useMemo(() =>
    courses.filter(course =>
      course.courseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.schedNo.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [courses, searchTerm]
  );

  const handleDeleteClick = (course: any) => {
    setCourseToDelete(course);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    console.log('Deleting course:', courseToDelete);
    // Here you would typically make an API call to delete the course
    setIsDeleteModalOpen(false);
    setCourseToDelete(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Manage Courses / Subjects</h1>
        <p className="text-gray-500">Add, edit, or remove course records</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full bg-gray-100 border-none rounded-lg pl-12 pr-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-300"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2">
            <FaPlus />
            Add Course
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-4">Sched. No.</th>
              <th className="py-4">Course No.</th>
              <th className="py-4">Time</th>
              <th className="py-4">Days</th>
              <th className="py-4">Room</th>
              <th className="py-4">Units</th>
              <th className="py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course, index) => (
              <tr key={index} className="border-b border-gray-200 last:border-b-0">
                <td className="py-4 font-semibold text-gray-900">{course.schedNo}</td>
                <td className="py-4 text-gray-500">{course.courseNo}</td>
                <td className="py-4 text-gray-500">{course.time}</td>
                <td className="py-4 text-gray-500">{course.days}</td>
                <td className="py-4 text-gray-500">{course.room}</td>
                <td className="py-4 text-gray-500">{course.units}</td>
                <td className="py-4">
                  <div className="flex gap-4">
                    <button className="text-gray-500 hover:text-gray-800">
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(course)}
                      className="text-black hover:text-gray-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Course"
        message={`Are you sure you want to delete the course ${courseToDelete?.courseNo}?`}
      />
    </div>
  );
};

export default ManageCoursesPage;
