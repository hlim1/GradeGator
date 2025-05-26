'use client'

import React from 'react';
import { Course } from '@/lib/api';
import { Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CourseSidebarInstructorProps {
  course: Course;
  activeTab: 'assignments' | 'gradebook' | 'roster' | 'documents';
  setActiveTab: Dispatch<SetStateAction<'assignments' | 'gradebook' | 'roster' | 'documents'>>;
}

export default function CourseSidebarInstructor({ 
  course,
  activeTab,
  setActiveTab 
}: CourseSidebarInstructorProps) {
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
            onClick={() => setActiveTab('assignments')}
            className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
              activeTab === 'assignments'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            📋 Assignments
          </button>
        </div>
        <div className="mb-4">
          <button 
            onClick={() => setActiveTab('gradebook')}
            className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
              activeTab === 'gradebook'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            📚 Grade Book
          </button>
        </div>
        <div className="mb-4">
          <button 
            onClick={() => setActiveTab('roster')}
            className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
              activeTab === 'roster'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            👥 Roster
          </button>
        </div>
        <div className="mb-4">
          <button 
            onClick={() => setActiveTab('documents')}
            className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
              activeTab === 'documents'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            📄 Documents
          </button>
        </div>
      </nav>
    </aside>
  );
} 