'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HiArrowLeft } from 'react-icons/hi2';

interface BackButtonProps {
  href?: string;
  label?: string;
  variant?: 'icon' | 'text' | 'ghost';
  className?: string;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  href, 
  label, 
  variant = 'icon', 
  className = '',
  onClick
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onClick) {
      onClick();
      return;
    }
    
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  const transitionBase = "transition-all duration-200 ease-in-out";

  if (variant === 'text') {
    return (
      <button 
        onClick={handleBack}
        className={`flex items-center gap-3 text-black hover:opacity-70 group py-2 mb-4 ${className}`}
      >
        <div className={`p-2 rounded-lg bg-gray-50 border border-gray-200 group-hover:bg-black group-hover:border-black group-hover:text-white ${transitionBase}`}>
          <HiArrowLeft 
            className={`group-hover:-translate-x-0.5 ${transitionBase}`} 
            size={14} 
          />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          {label || 'Back'}
        </span>
      </button>
    );
  }

  if (variant === 'ghost') {
    return (
      <button 
        onClick={handleBack}
        className={`flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 p-2 rounded-xl group mr-4 ${className}`}
        title={label || 'Go back'}
      >
        <HiArrowLeft 
          className={`group-hover:-translate-x-1 group-active:scale-90 ${transitionBase}`} 
          size={20} 
        />
      </button>
    );
  }

  // Default 'icon' variant - Professional with solid background, visible border, and proper spacing
  return (
    <button 
      onClick={handleBack}
      className={`
        relative flex items-center justify-center 
        w-10 h-10 rounded-xl bg-gray-50 border border-gray-200
        text-black hover:bg-black hover:text-white hover:border-black
        hover:shadow-md active:scale-90 group mr-5 
        ${transitionBase} ${className}
      `}
      title={label || 'Go back'}
    >
      <HiArrowLeft 
        className={`group-hover:-translate-x-0.5 ${transitionBase}`} 
        size={20} 
      />
    </button>
  );
};

export default BackButton;
