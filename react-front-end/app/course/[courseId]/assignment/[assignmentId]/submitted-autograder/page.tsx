'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function SubmittedAutograderPage() {
  const router = useRouter();
  const courseId = window.location.pathname.split('/')[2];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Assignment Submitted</h1>
        <p className="text-gray-600 mb-6">
          Your assignment has been submitted and is being processed by the autograder.
        </p>
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push(`/course/${courseId}`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Back to Course
          </button>
          <button
            onClick={() => router.push(`/course/${courseId}/submitted-feedback`)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            View Feedback
          </button>
        </div>
      </div>
    </div>
  );
} 