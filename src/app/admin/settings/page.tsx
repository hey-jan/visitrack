'use client';

import React from 'react';

const SettingsPage = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Information</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  defaultValue="John"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  defaultValue="Doe"
                  className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                defaultValue="john.doe@example.com"
                className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="bg-black text-white px-6 py-3 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Change Password</h2>
          <form className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                className="w-full bg-gray-100 border-none rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="bg-black text-white px-6 py-3 rounded-lg"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-700">Email notifications for new registrations</p>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-700">Weekly activity summary</p>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 34px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.4s;
        }
        input:checked + .slider {
          background-color: #212121;
        }
        input:checked + .slider:before {
          transform: translateX(26px);
        }
        .slider.round {
          border-radius: 34px;
        }
        .slider.round:before {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;
