'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

interface CourseSidebarStudentProps {
  activeTab?: 'assignments' | 'gradebook' | 'files';
  onTabChange?: (tab: 'assignments' | 'gradebook' | 'files') => void;
}

export default function CourseSidebarStudent({
  activeTab = 'assignments',
  onTabChange
}: CourseSidebarStudentProps) {
  const router = useRouter();

  return (
    <aside className="w-64 min-h-screen bg-white border-r">
      <div className="p-4">
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push('/dashboard')}
        >
          <Image
            alt="Grade Gator"
            src="/logo.svg"
            width={32}
            height={32}
            className="text-transparent"
          />
          <span className="text-xl font-semibold text-gray-800">Grade Gator</span>
        </div>
      </div>
      <nav className="p-4">
        <div className="mb-4">
          <button
            onClick={() => onTabChange?.('assignments')}
            className={`flex flex-row items-center gap-2 w-full px-4 py-2 text-left rounded-lg transition-colors ${
              activeTab === 'assignments'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ClipboardDocumentListIcon className="h-5 w-5" />
            Assignments
          </button>
        </div>
        <div className="mb-4">
          <button
            onClick={() => onTabChange?.('gradebook')}
            className={`flex flex-row items-center gap-2 w-full px-4 py-2 text-left rounded-lg transition-colors ${
              activeTab === 'gradebook'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <AcademicCapIcon className="h-5 w-5" />
            Grade Book
          </button>
        </div>
        <div className="mb-4">
          <button
            onClick={() => onTabChange?.('files')}
            className={`flex flex-row items-center gap-2 w-full px-4 py-2 text-left rounded-lg transition-colors ${
              activeTab === 'files'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <DocumentTextIcon className="h-5 w-5" />
            Files
          </button>
        </div>
      </nav>
    </aside>
  );
}
