import React from 'react';
import { FaUsers, FaBook, FaClock, FaCheck } from 'react-icons/fa';

const Dashboard = () => {
    const registrations = [
        { name: 'David Brown', course: 'Bachelor of Science in Computer Science', date: '12/17/2025' },
        { name: 'Emily Williams', course: 'Bachelor of Science in Business Administration', date: '12/14/2025' },
        { name: 'Michael Johnson', course: 'Bachelor of Science in Engineering', date: '12/15/2025' },
        { name: 'Sophia Garcia', course: 'Bachelor of Science in Psychology', date: '12/16/2025' },
        { name: 'James Miller', course: 'Bachelor of Science in Information Systems', date: '12/18/2025' },
        { name: 'Olivia Martinez', course: 'Bachelor of Science in Nursing', date: '12/19/2025' },
        { name: 'Lucas Anderson', course: 'Bachelor of Science in Civil Engineering', date: '12/19/2025' },
        { name: 'Charlotte Thomas', course: 'Bachelor of Science in Marketing', date: '12/20/2025' },
        { name: 'Liam Jackson', course: 'Bachelor of Science in Architecture', date: '12/20/2025' },
        { name: 'Amelia White', course: 'Bachelor of Science in Accountancy', date: '12/21/2025' },
        { name: 'Ethan Harris', course: 'Bachelor of Science in Biology', date: '12/21/2025' },
        { name: 'Harper Martin', course: 'Bachelor of Science in Mathematics', date: '12/22/2025' },
        { name: 'Benjamin Thompson', course: 'Bachelor of Science in Physics', date: '12/22/2025' },
        { name: 'Evelyn Garcia', course: 'Bachelor of Science in Chemistry', date: '12/23/2025' },
        { name: 'Alexander Robinson', course: 'Bachelor of Science in Economics', date: '12/23/2025' },
        { name: 'Mia Clark', course: 'Bachelor of Science in Education', date: '12/24/2025' },
        { name: 'Daniel Rodriguez', course: 'Bachelor of Science in Criminology', date: '12/24/2025' },
        { name: 'Ava Lewis', course: 'Bachelor of Science in Hotel Management', date: '12/25/2025' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500">Thursday, December 18, 2025</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500">Total Students</p>
                        <p className="text-3xl font-bold text-gray-900">5</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <FaUsers className="text-2xl text-gray-800" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500">Total Courses</p>
                        <p className="text-3xl font-bold text-gray-900">5</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <FaBook className="text-2xl text-gray-800" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500">Recent Registrations</p>
                        <p className="text-3xl font-bold text-gray-900">5</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <FaClock className="text-2xl text-gray-800" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500">Pending Approvals</p>
                        <p className="text-3xl font-bold text-gray-900">3</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <FaCheck className="text-2xl text-gray-800" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Recent Registrations</h2>
                <ul>
                    {registrations.map((reg, index) => (
                        <li key={index} className="flex justify-between items-center py-4 border-b border-gray-200 last:border-b-0">
                            <div>
                                <p className="font-semibold text-gray-900">{reg.name}</p>
                                <p className="text-gray-500 text-sm">{reg.course}</p>
                            </div>
                            <p className="text-gray-500">{reg.date}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
