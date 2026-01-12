'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTachometerAlt, FaChalkboardTeacher, FaCog } from 'react-icons/fa';

const Sidebar = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { href: '/teacher/my-classes', label: 'My Classes', icon: FaChalkboardTeacher },
    { href: '/teacher/settings', label: 'Settings', icon: FaCog },
  ];

  return (
    <aside className="w-72 bg-black text-white flex flex-col">
      <div className="p-6 text-3xl font-bold">Teacher Portal</div>
      <nav className="flex-1 px-4">
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href} className="mb-2">
                <Link href={link.href}>
                  <div
                    className={`flex items-center p-3 rounded-lg ${
                      isActive ? 'bg-white text-black' : 'hover:bg-neutral-800 text-white'
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
    </aside>
  );
};

export default Sidebar;
