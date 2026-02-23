// src/app/login/components/EyeIcon.tsx
import React from 'react';

const EyeIcon = ({
  isOpen,
  ...props
}: { isOpen: boolean } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {isOpen && <path d="m2 2 20 20" />}
    </svg>
  );
};

export default EyeIcon;
