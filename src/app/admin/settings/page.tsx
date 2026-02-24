'use client';

import React, { useEffect, useState } from 'react';
import EyeIcon from '@/components/ui/icons/EyeIcon';
import { FaUser, FaLock, FaEnvelope, FaShieldAlt } from 'react-icons/fa';

const SettingsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Form State
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setProfileData({
            firstName: data.firstName,
            lastName: data.lastName,
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Auto-clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile information updated successfully.' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update profile.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setUpdatingPassword(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Security credentials updated successfully.' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update security credentials.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto py-6">
      {/* Toast Notification */}
      {message.text && (
        <div className={`fixed top-8 right-8 z-50 flex items-center p-4 rounded-xl shadow-2xl border transform transition-all duration-500 animate-in slide-in-from-right-full bg-white ${
          message.type === 'success' ? 'border-green-100 text-green-800' : 'border-red-100 text-red-800'
        }`}>
          <div className={`mr-3 p-2 rounded-full ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <FaShieldAlt size={14} />
          </div>
          <div className="flex flex-col pr-8">
            <p className="font-bold text-[10px] uppercase tracking-widest leading-none mb-1">{message.type === 'success' ? 'Success' : 'Error'}</p>
            <p className="text-xs font-semibold">{message.text}</p>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto text-gray-300 hover:text-black transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Account Settings</h1>
        <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Administrator Configuration</p>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-8">
            <FaUser className="mr-3 text-black" size={16} />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Personal Information</h2>
          </div>
          
          <form className="space-y-6" onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center">
                <FaEnvelope className="mr-2 text-black opacity-30" size={10} /> Email Address
              </label>
              <input
                type="email"
                defaultValue={user?.email || ''}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-400 cursor-not-allowed uppercase tracking-tight"
                readOnly
              />
              <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Account ID cannot be modified.</p>
            </div>
            <div className="text-right pt-4">
              <button
                type="submit"
                className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 font-bold text-xs uppercase tracking-widest shadow-lg shadow-gray-200"
                disabled={savingProfile}
              >
                {savingProfile ? 'Updating...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center mb-8">
            <FaLock className="mr-3 text-black" size={16} />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Security Credentials</h2>
          </div>

          <form className="space-y-6" onSubmit={handlePasswordSubmit}>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black opacity-30 hover:opacity-100 transition-opacity"
                >
                  <EyeIcon isSlashed={!showCurrentPassword} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black opacity-30 hover:opacity-100 transition-opacity"
                  >
                    <EyeIcon isSlashed={!showNewPassword} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-black opacity-30 hover:opacity-100 transition-opacity"
                  >
                    <EyeIcon isSlashed={!showConfirmPassword} />
                  </button>
                </div>
              </div>
            </div>
            <div className="text-right pt-4">
              <button
                type="submit"
                className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 font-bold text-xs uppercase tracking-widest shadow-lg shadow-gray-200"
                disabled={updatingPassword}
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
