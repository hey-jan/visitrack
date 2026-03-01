'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import ConfirmationModal from '@/components/features/shared/ConfirmationModal';
import EditClassModal from '@/components/features/admin/classes/EditClassModal';
import AddClassModal from '@/components/features/admin/classes/AddClassModal';

const ManageClassesPage = () => {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/classes', { cache: 'no-store' });
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = useMemo(() =>
    classes.filter(cls =>
      (cls.code?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (cls.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (cls.schedule?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    ),
    [classes, searchTerm]
  );

  const handleDeleteClick = (cls: any) => {
    setClassToDelete(cls);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;
    try {
      const res = await fetch(`/api/classes/${classToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchClasses();
      } else {
        console.error('Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setClassToDelete(null);
    }
  };

  const handleEditClick = (cls: any) => {
    setClassToEdit(cls);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (updatedClass: any) => {
    fetchClasses();
    setIsEditModalOpen(false);
    setClassToEdit(null);
  };

  const handleAddClass = () => {
    setIsAddModalOpen(true);
  };

  const handleAddSave = (newClass: any) => {
    fetchClasses();
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">Class Management</h1>
        <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Course Scheduling & Logistics</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black opacity-30" />
            <input
              type="text"
              placeholder="Search by code, title or schedule..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-black outline-none transition-all placeholder:text-gray-400 font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddClass}
            className="w-full md:w-auto bg-black text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 font-bold text-sm shadow-lg shadow-gray-200"
          >
            <FaPlus size={14} />
            Create New Class
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
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Sched No.</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Class Detail</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Schedule</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Room</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Units</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClasses.map((cls, index) => (
                  <tr 
                    key={index} 
                    onClick={() => router.push(`/admin/classes/${cls.slug}`)}
                    className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <span className="text-xs font-mono font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase">{cls.schedule || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className="h-9 w-9 bg-black text-white rounded-lg flex items-center justify-center font-bold text-[10px] mr-4 shadow-sm group-hover:scale-105 transition-transform uppercase">
                          {cls.code.substring(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm uppercase tracking-tight">{cls.code}</span>
                          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{cls.title}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <p className="text-sm font-bold text-gray-900 leading-none mb-1">{cls.days || 'N/A'}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{cls.time || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-5 text-center text-sm font-bold text-gray-700 uppercase tracking-tight">{cls.room || 'N/A'}</td>
                    <td className="px-8 py-5 text-center text-sm font-medium text-gray-600">{cls.units || '0'}</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditClick(cls); }}
                          className="p-2 text-black hover:bg-gray-200 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(cls); }}
                          className="p-2 text-black hover:bg-gray-200 rounded-lg transition-colors"
                          title="Delete"
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Archive Class"
        message={`Confirm deletion of ${classToDelete?.code}: ${classToDelete?.title} from course registry.`}
      />

      {classToEdit && (
        <EditClassModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
          course={classToEdit}
        />
      )}

      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddSave}
      />
    </div>
  );
};

export default ManageClassesPage;
