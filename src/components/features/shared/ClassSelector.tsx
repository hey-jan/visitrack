'use client';

import React from 'react';
import { FaBookOpen } from 'react-icons/fa';

interface Class {
  id: string;
  code: string;
  schedule: string;
  days?: string;
  time?: string;
  room?: string;
}

interface ClassSelectorProps {
  classes: Class[];
  selectedIds?: string[];
  activeId?: string | null;
  onToggle?: (id: string) => void;
  onAction?: (id: string) => void;
  actionLabel?: string;
  isActionLoading?: string | null;
  emptyMessage?: string;
  maxHeight?: string;
}

const ClassSelector: React.FC<ClassSelectorProps> = ({
  classes,
  selectedIds = [],
  activeId = null,
  onToggle,
  onAction,
  actionLabel = 'Select',
  isActionLoading = null,
  emptyMessage = 'No classes available',
  maxHeight = 'max-h-48'
}) => {
  if (classes.length === 0) {
    return (
      <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <FaBookOpen className="text-gray-200" size={20} />
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic px-4">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-2xl border border-gray-100 p-4 ${maxHeight} overflow-y-auto custom-scrollbar`}>
      <div className="grid grid-cols-1 gap-2">
        {classes.map((cls) => {
          const isActive = activeId === cls.id || selectedIds.includes(cls.id);
          
          return (
            <div
              key={cls.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between group ${
                onToggle ? 'cursor-pointer' : ''
              } ${
                isActive 
                  ? 'bg-black border-black shadow-lg shadow-black/5' 
                  : 'bg-white border-gray-100 hover:border-black'
              }`}
              onClick={() => onToggle?.(cls.id)}
            >
              <div className="flex items-center space-x-4">
                {/* Leading Initial Icon */}
                <div className={`h-10 w-10 border rounded-lg flex items-center justify-center font-bold text-sm shadow-sm uppercase transition-colors ${
                  isActive 
                    ? 'bg-neutral-800 border-neutral-700 text-white' 
                    : 'bg-gray-50 border-gray-100 text-black group-hover:bg-black group-hover:text-white'
                }`}>
                  {cls.code.charAt(0)}
                </div>

                <div className="flex flex-col">
                  <span className={`text-xs font-bold uppercase tracking-tight ${
                    isActive ? 'text-white' : 'text-gray-900'
                  }`}>{cls.code}</span>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest mt-0.5 ${
                    isActive ? 'text-gray-400' : 'text-gray-400'
                  }`}>
                    Sched: {cls.schedule}
                  </span>
                </div>
              </div>

              {/* Conditional Action Button */}
              {onAction && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(cls.id);
                  }}
                  disabled={isActionLoading !== null}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isActive
                      ? 'bg-white text-black hover:bg-gray-100 active:scale-95'
                      : isActionLoading === cls.id
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-black text-white hover:opacity-90 active:scale-95 shadow-lg shadow-black/5'
                  }`}
                >
                  {isActionLoading === cls.id ? 'Processing...' : actionLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClassSelector;
