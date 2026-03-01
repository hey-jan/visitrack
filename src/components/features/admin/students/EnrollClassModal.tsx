'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import ClassSelector from '@/components/features/shared/ClassSelector';

interface EnrollClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  currentEnrollments: any[];
  onEnrollmentComplete: () => void;
}

const EnrollClassModal: React.FC<EnrollClassModalProps> = ({
  isOpen,
  onClose,
  studentId,
  currentEnrollments,
  onEnrollmentComplete,
}) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchClasses = async () => {
        try {
          const res = await fetch('/api/classes');
          if (res.ok) {
            const data = await res.json();
            // Filter out classes the student is already enrolled in
            const enrolledClassIds = currentEnrollments.map((e) => e.classId);
            setClasses(data.filter((c: any) => !enrolledClassIds.includes(c.id)));
          }
        } catch (error) {
          console.error('Failed to fetch classes:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchClasses();
    }
  }, [isOpen, currentEnrollments]);

  const handleEnroll = async (classId: string) => {
    setEnrolling(classId);
    setError(null);
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, classId }),
      });

      if (res.ok) {
        onEnrollmentComplete();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to enroll');
      }
    } catch (error) {
      setError('An error occurred during enrollment');
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Academic Enrollment">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold uppercase tracking-tight">
            {error}
          </div>
        )}

        <ClassSelector 
          classes={classes}
          onAction={handleEnroll}
          actionLabel="Enroll"
          isActionLoading={enrolling}
          emptyMessage="No classes available for enrollment"
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

export default EnrollClassModal;
