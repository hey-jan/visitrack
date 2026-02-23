'use client';

import React, { useState, useEffect } from 'react';
import { FaUsers, FaBook, FaClock, FaCheck } from 'react-icons/fa';

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

const Dashboard = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await fetch('/api/students');
                const data = await res.json();
                setStudents(data);
            } catch (error) {
                console.error('Failed to fetch students:', error);
            }
        };

        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/courses');
                const data = await res.json();
                setCourses(data);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            }
        };

        fetchStudents();
        fetchCourses();
    }, []);

    const recentRegistrations = students.slice(0, 5);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500">Total Students</p>
                        <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <FaUsers className="text-2xl text-gray-800" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500">Total Courses</p>
                        <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <FaBook className="text-2xl text-gray-800" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500">Recent Registrations</p>
                        <p className="text-3xl font-bold text-gray-900">{recentRegistrations.length}</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <FaClock className="text-2xl text-gray-800" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500">Pending Approvals</p>
                        <p className="text-3xl font-bold text-gray-900">0</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <FaCheck className="text-2xl text-gray-800" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Recent Registrations</h2>
                <ul>
                    {recentRegistrations.map((student, index) => (
                        <li key={index} className="flex justify-between items-center py-4 border-b border-gray-200 last:border-b-0">
                            <div>
                                <p className="font-semibold text-gray-900">{`${student.firstName} ${student.lastName}`}</p>
                                <p className="text-gray-500 text-sm">{student.course.courseName}</p>
                            </div>
                            <p className="text-gray-500">{new Date(student.createdAt).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
