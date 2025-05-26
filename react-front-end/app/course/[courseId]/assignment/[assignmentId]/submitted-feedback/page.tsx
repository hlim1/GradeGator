'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function SubmittedFeedbackPage() {
  const router = useRouter();
  const courseId = window.location.pathname.split('/')[2];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Assignment Feedback</h1>
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Autograder Results</h2>
            <p className="text-gray-600">Your assignment has been graded by the autograder.</p>
            {/* Add actual feedback content here */}
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Manual Feedback</h2>
            <p className="text-gray-600">Instructor feedback will appear here when available.</p>
            {/* Add manual feedback content here */}
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => router.push(`/course/${courseId}`)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back to Course
          </button>
        </div>
      </div>
    </div>
  );
} 