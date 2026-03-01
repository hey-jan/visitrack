'use client';

import React from 'react';
import { FaUserTie, FaEnvelope } from 'react-icons/fa';

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface InstructorSelectorProps {
  instructors: Instructor[];
  selectedId: string;
  onSelect: (id: string) => void;
  emptyMessage?: string;
  maxHeight?: string;
}

const InstructorSelector: React.FC<InstructorSelectorProps> = ({
  instructors,
  selectedId,
  onSelect,
  emptyMessage = 'No instructors found',
  maxHeight = 'max-h-48'
}) => {
  if (instructors.length === 0) {
    return (
      <div className="py-10 text-center bg-gray-50 rounded-2xl border border-gray-100">
        <FaUserTie className="text-gray-200 mx-auto mb-3" size={24} />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-2xl border border-gray-100 p-4 ${maxHeight} overflow-y-auto custom-scrollbar`}>
      <div className="grid grid-cols-1 gap-2">
        {instructors.map((instructor) => (
          <div
            key={instructor.id}
            onClick={() => onSelect(instructor.id)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
              selectedId === instructor.id
                ? 'bg-black border-black shadow-lg shadow-black/5'
                : 'bg-white border-gray-100 hover:border-black'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs uppercase shadow-sm transition-colors ${
                selectedId === instructor.id
                  ? 'bg-neutral-800 text-white'
                  : 'bg-gray-50 text-black group-hover:bg-black group-hover:text-white'
              }`}>
                {instructor.firstName[0]}{instructor.lastName[0]}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-xs font-bold truncate ${
                  selectedId === instructor.id ? 'text-white' : 'text-gray-900'
                }`}>
                  {instructor.firstName} {instructor.lastName}
                </span>
              </div>
            </div>
            
            {selectedId === instructor.id && (
              <div className="h-2 w-2 rounded-full bg-white shadow-sm mr-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorSelector;
