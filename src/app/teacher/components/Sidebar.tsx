'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaGraduationCap, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: FaHome },
    { href: '/teacher/my-classes', label: 'My Classes', icon: FaGraduationCap },
    { href: '/teacher/settings', label: 'Settings', icon: FaCog },
  ];

  const handleLogout = () => {
    console.log('Logging out...');
    // In a real application, you would handle the logout logic here (e.g., clear tokens, redirect to login)
    router.push('/login');
  };

  return (
    <aside className="w-72 bg-black text-white flex flex-col">
      <div className="p-6 text-2xl font-bold">Teacher Portal</div>
      <nav className="flex-1 px-4">
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href} className="mb-2">
                <Link href={link.href}>
                  <div
                    className={`flex items-center p-3 rounded-lg ${
                      isActive ? 'bg-neutral-700 text-white' : 'hover:bg-neutral-800 text-white'
                    }`}
                  >
                    <link.icon className="mr-3" />
                    {link.label}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto px-4 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center p-3 rounded-lg w-full hover:bg-neutral-800 text-white"
        >
          <FaSignOutAlt className="mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
