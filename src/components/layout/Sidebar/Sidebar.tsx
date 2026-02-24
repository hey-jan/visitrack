'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaHome, FaUserGraduate, FaBook, FaCog, FaSignOutAlt, FaGraduationCap, FaUserTie } from 'react-icons/fa';

interface NavLink {
  href: string;
  label: string;
  icon: IconType;
}

interface SidebarProps {
  type: 'admin' | 'instructor';
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

const adminLinks: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: FaHome },
  { href: '/admin/students', label: 'Manage Students', icon: FaUserGraduate },
  { href: '/admin/instructors', label: 'Manage Instructors', icon: FaUserTie },
  { href: '/admin/classes', label: 'Manage Classes', icon: FaBook },
  { href: '/admin/settings', label: 'Settings', icon: FaCog },
];

const instructorLinks: NavLink[] = [
  { href: '/instructor/dashboard', label: 'Dashboard', icon: FaHome },
  { href: '/instructor/my-classes', label: 'My Classes', icon: FaGraduationCap },
  { href: '/instructor/settings', label: 'Settings', icon: FaCog },
];

const Sidebar = ({ type }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  const portalName = type === 'admin' ? 'Admin' : 'Instructor';
  const navLinks = type === 'admin' ? adminLinks : instructorLinks;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-72 bg-black text-white flex flex-col shrink-0">
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tighter uppercase italic">Visitrack</h1>
        <p className="text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase mt-1">{portalName} Portal</p>
      </div>

      <nav className="flex-1 px-4">
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin' && link.href !== '/instructor/dashboard' && pathname.startsWith(link.href));
            return (
              <li key={link.href} className="mb-2">
                <Link href={link.href}>
                  <div
                    className={`flex items-center p-4 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-white text-black font-black shadow-lg shadow-white/5' 
                        : 'text-gray-400 hover:bg-neutral-900 hover:text-white font-bold'
                    }`}
                  >
                    <link.icon className={`mr-3 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                    <span className="uppercase tracking-widest text-[10px]">{link.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 mt-auto">
        {user && (
          <div className="bg-neutral-900 rounded-2xl p-4 mb-4 border border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black text-[10px] font-black shadow-sm shrink-0 uppercase">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-[8px] uppercase font-black text-gray-500 tracking-widest leading-none mb-1 text-ellipsis overflow-hidden">Authenticated as</p>
                <p className="text-sm font-bold text-white leading-none truncate">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 truncate font-medium bg-black/50 p-2 rounded-lg border border-neutral-800/50">
              {user.email}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center p-4 rounded-xl w-full hover:bg-neutral-900 text-gray-400 hover:text-red-500 transition-all group"
        >
          <FaSignOutAlt className="mr-3 group-hover:translate-x-1 transition-transform" />
          <span className="uppercase tracking-widest text-[10px] font-black">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
