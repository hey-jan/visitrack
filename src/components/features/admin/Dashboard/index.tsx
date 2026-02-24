'use client';

import React, { useState, useEffect } from 'react';
import { FaUsers, FaBook, FaUserTie, FaChartLine } from 'react-icons/fa';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    course: {
        courseName: string;
    };
    createdAt: string;
}

interface Course {
    id: string;
    courseName: string;
}

interface Instructor {
    id: string;
}

const Dashboard = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, coursesRes, instructorsRes] = await Promise.all([
                    fetch('/api/students'),
                    fetch('/api/courses'),
                    fetch('/api/instructors')
                ]);

                const [studentsData, coursesData, instructorsData] = await Promise.all([
                    studentsRes.json(),
                    coursesRes.json(),
                    instructorsRes.json()
                ]);

                setStudents(studentsData);
                setCourses(coursesData);
                setInstructors(instructorsData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate Registrations in the last 30 days
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const newRegistrationsCount = students.filter(s => new Date(s.createdAt) > last30Days).length;

    const recentRegistrations = [...students]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">System Overview</h1>
                <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Students */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-black transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Database Size</p>
                        <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Total Students</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-black border border-gray-100 shadow-sm transition-transform group-hover:scale-110">
                        <FaUsers size={24} />
                    </div>
                </div>

                {/* Active Courses */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between group hover:border-black transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Catalog</p>
                        <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Active Courses</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-black border border-gray-100 shadow-sm transition-transform group-hover:scale-110">
                        <FaBook size={24} />
                    </div>
                </div>

                {/* Registration Rate (Last 30 Days) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between group hover:border-black transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Growth</p>
                        <p className="text-3xl font-bold text-gray-900">+{newRegistrationsCount}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">New This Month</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-black border border-gray-100 shadow-sm transition-transform group-hover:scale-110">
                        <FaChartLine size={24} />
                    </div>
                </div>

                {/* Total Instructors */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-between group hover:border-black transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Instructors</p>
                        <p className="text-3xl font-bold text-gray-900">{instructors.length}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">Active Instructors</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-black border border-gray-100 shadow-sm transition-transform group-hover:scale-110">
                        <FaUserTie size={24} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Recent Registrations</h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Loading records...</div>
                    ) : recentRegistrations.length > 0 ? (
                        recentRegistrations.map((student, index) => (
                            <div key={index} className="flex justify-between items-center px-8 py-5 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                                        {student.firstName[0]}{student.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm uppercase tracking-tight">{`${student.firstName} ${student.lastName}`}</p>
                                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{student.course.courseName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Joined</p>
                                    <p className="text-xs font-semibold text-gray-700">{new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No recent records found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
