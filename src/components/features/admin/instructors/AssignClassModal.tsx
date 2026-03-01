'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import ClassSelector from '@/components/features/shared/ClassSelector';

interface AssignClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructorId: string;
  currentClassIds: string[];
  onAssignmentComplete: () => void;
}

const AssignClassModal: React.FC<AssignClassModalProps> = ({
  isOpen,
  onClose,
  instructorId,
  currentClassIds,
  onAssignmentComplete,
}) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchClasses = async () => {
        try {
          const res = await fetch('/api/classes');
          if (res.ok) {
            const data = await res.json();
            // SHOW ONLY: Classes that have NO instructor assigned (unassigned pool)
            setClasses(data.filter((c: any) => !c.instructorId));
          }
        } catch (error) {
          console.error('Failed to fetch classes:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchClasses();
    }
  }, [isOpen, currentClassIds]);

  const handleAssign = async (classId: string) => {
    setAssigning(classId);
    setError(null);
    try {
      // To assign, we add this classId to the set of current classIds
      const newClassIds = [...currentClassIds, classId];
      
      const res = await fetch(`/api/instructors/${instructorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classIds: newClassIds }),
      });

      if (res.ok) {
        onAssignmentComplete();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to assign class');
      }
    } catch (error) {
      setError('An error occurred during assignment');
    } finally {
      setAssigning(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Academic Class">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold uppercase tracking-tight">
            {error}
          </div>
        )}

        <ClassSelector 
          classes={classes}
          onAction={handleAssign}
          actionLabel="Assign"
          isActionLoading={assigning}
          emptyMessage="No unassigned classes available"
          maxHeight="max-h-96"
        />

        <div className="pt-4 border-t border-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignClassModal;
