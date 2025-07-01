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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="curre> 62               
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.> 63             
            </svg>
            Assignments
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            Grade Book
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
            Roster
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Documents
          </button>
        </div>
      </nav>
    </aside>
  );
} 