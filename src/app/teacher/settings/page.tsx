'use client';

import React, { useState } from 'react';
import { FaUserCircle, FaBell, FaLock, FaSignOutAlt } from 'react-icons/fa';

// A reusable toggle switch component
const ToggleSwitch = ({ label, enabled, setEnabled }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-gray-700">{label}</span>
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none ${
        enabled ? 'bg-black' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);


const SettingsPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Settings</h1>

      <div className="space-y-8">
        {/* Profile Information Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FaUserCircle className="mr-3" /> Profile Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1 text-lg">Prof. Maria Santos</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-lg">maria.santos@university.edu</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Teacher ID</label>
              <p className="mt-1 text-lg">TCH-11965</p>
            </div>
             <button className="bg-gray-200 text-black px-4 py-2 rounded-lg mt-2">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FaBell className="mr-3" /> Notifications
          </h2>
          <div className="space-y-2">
            <ToggleSwitch 
              label="Absence Alerts (Email)"
              enabled={emailNotifications}
              setEnabled={setEmailNotifications}
            />
            <ToggleSwitch 
              label="Class Reminders (Push)"
              enabled={pushNotifications}
              setEnabled={setPushNotifications}
            />
          </div>
        </div>

        {/* Account & Security Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <FaLock className="mr-3" /> Account & Security
          </h2>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center justify-center">
              <FaLock className="mr-2" /> Change Password
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center">
              <FaSignOutAlt className="mr-2" /> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
