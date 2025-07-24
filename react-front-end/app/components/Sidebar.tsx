'use client';

import { FaBook, FaCog } from 'react-icons/fa';
import { useUser } from '../contexts/UserContext';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { User } from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SettingsModal from '@/components/SettingsModal';

export default function Sidebar() {
  const { role, setRole } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      setUser(userData);
    } else {
      router.push('/login');
    }
  }, [setRole, router]);

  return (
    <div className="h-screen w-64 bg-white shadow-md flex flex-col justify-between">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <Image src="/logo.svg" alt="Grade Gator" width={32} height={32} className="h-8 w-8" />
        <h1 className="text-xl font-bold text-green-600">Grade Gator</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          <li className="flex items-center p-4 bg-green-100 border-l-4 border-green-600">
            <FaBook className="text-green-600 mr-3" />
            <span className="text-green-600 font-medium">Courses</span>
          </li>
        </ul>
      </nav>

      {/* Footer Links */}
      <div className="p-4 border-t">
        <ul className="space-y-2">
          {/* Settings */}
          <li
            onClick={() => {console.log("clicked");setShowSettings(true);}}
            className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-green-600"
          >
            <FaCog className="size-5" />
            <span>Settings</span>
          </li>

          {/* Help center */}
          <li className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
            </svg>
            <span>Help center</span>
          </li>

          {/* Logout */}
          <Link href="/logout" className="block">
            <li className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                <path fillRule="evenodd" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5V15a.75.75 0 0 0-1.5 0v3.75a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5.25a3 3 0 0 0-3-3h-6a3 3 0 0 0-3 3V9A.75.75 0 1 0 9 9V5.25a1.5 1.5 0 0 1 1.5-1.5h6ZM5.78 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06l-1.72-1.72H15a.75.75 0 0 0 0-1.5H4.06l1.72-1.72a.75.75 0 0 0 0-1.06Z" clipRule="evenodd" />
              </svg>
              <span>Logout</span>
            </li>
          </Link>
        </ul>

        {/* Profile */}
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <Image
              src="/user-avatar.svg"
              alt="Profile"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-700">{user?.preferred_name || user?.username || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
