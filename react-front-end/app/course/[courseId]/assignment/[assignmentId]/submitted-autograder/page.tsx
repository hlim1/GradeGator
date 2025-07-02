'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubmittedAutograderPage() {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/');
      const course = parts[2];
      const assignment = parts[4];
      setCourseId(course);
      setAssignmentId(assignment);
    }
  }, []);

  useEffect(() => {
    if (courseId && assignmentId) {
      const timeout = setTimeout(() => {
        router.push(`/course/${courseId}/assignment/${assignmentId}/submitted-feedback`);
      }, 20000); // 20 seconds before redirect

      return () => clearTimeout(timeout);
    }
  }, [courseId, assignmentId, router]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-400 border-dashed rounded-full animate-spin"></div>
        <h1 className="mt-6 text-xl font-semibold text-gray-700">
          Processing your submission...
        </h1>
        <p className="mt-2 text-gray-500 text-sm">Hang tight! You'll be redirected shortly.</p>
      </div>
    </div>
  );
}
