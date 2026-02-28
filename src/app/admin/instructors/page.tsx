'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaShieldAlt } from 'react-icons/fa';
import ConfirmationModal from '@/components/features/shared/ConfirmationModal';
import AddInstructorModal from '@/components/features/admin/instructors/AddInstructorModal';
import EditInstructorModal from '@/components/features/admin/instructors/EditInstructorModal';

const ManageInstructorsPage = () => {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [instructorToEdit, setInstructorToEdit] = useState<any>(null);
  const [instructorToDelete, setInstructorToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/instructors', { cache: 'no-store' });
      const data = await res.json();
      setInstructors(data);
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  // Auto-clear toast
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const filteredInstructors = useMemo(() =>
    instructors.filter(inst =>
      `${inst.firstName} ${inst.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [instructors, searchTerm]
  );

  const handleEditClick = (instructor: any) => {
    setInstructorToEdit(instructor);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (instructor: any) => {
    setInstructorToDelete(instructor);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!instructorToDelete) return;
    try {
      const res = await fetch(`/api/instructors/${instructorToDelete.id}`, {
        method: 'DELETE',
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (res.ok) {
          setMessage({ type: 'success', text: 'Instructor record has been successfully removed.' });
          fetchInstructors();
        } else {
          setMessage({ type: 'error', text: data.error || 'Failed to revoke instructor access.' });
        }
      } else {
        // Handle non-json response (HTML error page)
        setMessage({ type: 'error', text: 'A server-side error occurred. Please check if the instructor has active classes.' });
      }
    } catch (error) {
      console.error('Error deleting instructor:', error);
      setMessage({ type: 'error', text: 'A network error occurred. Please try again.' });
    } finally {
      setIsDeleteModalOpen(false);
      setInstructorToDelete(null);
    }
  };

  return (
    <div className="relative space-y-8">
      {/* Professional Toast Notification */}
      {message.text && (
        <div className={`fixed top-8 right-8 z-200 flex items-center p-5 rounded-2xl shadow-2xl border transform transition-all duration-500 animate-in slide-in-from-right-full bg-white ${
          message.type === 'success' ? 'border-green-100 text-green-800 shadow-green-100/20' : 'border-red-100 text-red-800 shadow-red-100/20'
        }`}>
          <div className={`mr-4 p-2.5 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <FaShieldAlt size={16} />
          </div>
          <div className="flex flex-col pr-10">
            <p className="font-bold text-[10px] uppercase tracking-widest leading-none mb-1.5">{message.type === 'success' ? 'Success' : 'Restriction'}</p>
            <p className="text-xs font-bold leading-relaxed max-w-75">{message.text}</p>
          </div>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto text-gray-300 hover:text-black transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Instructor Management</h1>
        <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Faculty Directory & Access Control</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-30" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto bg-black text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 font-bold text-sm shadow-lg shadow-gray-200"
          >
            <FaPlus size={14} />
            Register Instructor
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Full Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Email Identity</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInstructors.map((inst, index) => (
                  <tr 
                    key={index} 
                    onClick={() => router.push(`/admin/instructors/${inst.slug || inst.id}`)}
                    className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className="h-9 w-9 bg-black text-white rounded-lg flex items-center justify-center font-bold text-[10px] mr-4 shadow-sm group-hover:scale-105 transition-transform">
                          {inst.firstName[0]}{inst.lastName[0]}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm uppercase tracking-tight">{inst.firstName} {inst.lastName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-medium text-gray-500">{inst.email}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-black text-white uppercase tracking-tighter shadow-sm">Verified</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditClick(inst); }}
                          className="p-2 text-black hover:bg-gray-200 rounded-lg transition-colors"
                          title="Edit Profile"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(inst); }}
                          className="p-2 text-black hover:bg-gray-200 rounded-lg transition-colors"
                          title="Delete Account"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AddInstructorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onInstructorAdded={fetchInstructors}
      />

      {instructorToEdit && (
        <EditInstructorModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          instructor={instructorToEdit}
          onInstructorUpdated={fetchInstructors}
        />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Revoke Access"
        message={`Confirm permanent deletion of instructor ${instructorToDelete?.firstName} ${instructorToDelete?.lastName} from active directory.`}
      />
    </div>
  );
};

export default ManageInstructorsPage;
