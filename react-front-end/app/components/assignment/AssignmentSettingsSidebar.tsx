'use client'

import React from 'react';
import { Assignment} from '@/lib/api';
import { Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AssignmentSidebarProps {
  assignment: Assignment;
  activeTab: 'submissions' | 'settings' | 'autograder' | 'rubric';
  setActiveTab: Dispatch<SetStateAction<'submissions' | 'settings' | 'autograder' | 'rubric'>>;
}

export default function AssignmentSidebar({
  assignment,
  activeTab,
  setActiveTab
}: AssignmentSidebarProps) {
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
            onClick={() => setActiveTab('submissions')}
            className={`flex flex-row gap-x-2 w-full px-4 py-2 text-left rounded-lg transition-colors ${
              activeTab === 'submissions'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
            </svg>
            Submissions
          </button>
        </div>
        <div className="mb-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-row gap-x-2 w-full px-4 py-2 text-left rounded-lg transition-colors ${
              activeTab === 'settings'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
            </svg>
            Settings
          </button>
        </div>
        <div className="mb-4">
          <button
            onClick={() => setActiveTab('autograder')}
            className={`flex flex-row gap-x-2 w-full px-4 py-2 text-left rounded-lg transition-colors ${
              activeTab === 'autograder'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Autograder
          </button>
        </div>
        <div className="mb-4">
          <button
            onClick={() => setActiveTab('rubric')}
            className={`flex flex-row gap-x-2 w-full px-4 py-2 text-left rounded-lg transition-colors ${
              activeTab === 'rubric'
                ? 'bg-green-100 text-green-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            Rubric
          </button>
        </div>
      </nav>
    </aside>
  );
}