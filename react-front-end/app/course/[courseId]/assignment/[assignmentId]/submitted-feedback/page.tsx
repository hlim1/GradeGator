'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Course, apiFunctions } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function SubmittedFeedbackPage() {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [grade, setGrade] = useState<Grading | null>(null);
  const [parsedFeedback, setParsedFeedback] = useState<any | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
    if (typeof window === 'undefined') return;

    const parts = window.location.pathname.split('/');
    const course = parts[2];
    const assignment = parts[4];

    setCourseId(course);
    setAssignmentId(assignment);

    const userDataRaw = sessionStorage.getItem("userData");
    let userData = null;

    if (userDataRaw) {
      try {
        userData = JSON.parse(userDataRaw);
      } catch (err) {
      console.error("Failed to parse userData:", err);
      }
    }


    if (userData?.is_student) {
      try {
        const rawSub = sessionStorage.getItem("submissionId");
        const submissionId = rawSub ? parseInt(rawSub, 10) : null;
        const res = await apiFunctions.getGradingResults(submissionId);
        setGrade(res);

        if (res && res.length > 0 && res[0].feedback) {
          const feedbackStr = res[0].feedback;
          const start = feedbackStr.indexOf('{');
          if (start !== -1) {
            try {
              const jsonPart = feedbackStr.slice(start);
              const parsed = JSON.parse(jsonPart);
              setParsedFeedback(parsed);
            } catch (err) {
              console.error("Failed to parse feedback JSON:", err);
              setParsedFeedback(null);
            }
        } else {
          setParsedFeedback(null);
        }
      }
    } catch (error: any) {
      console.error("Error fetching grading results:", error);
    }
  }
  };

  fetchData();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Assignment Feedback</h1>
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Autograder Results</h2>
            {parsedFeedback ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p>Total Tests: {parsedFeedback.total}</p>
                <p>Passed: {parsedFeedback.passed ? 'Yes' : 'No'}</p>
                {/* Add more fields if needed */}
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(parsedFeedback, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-600">No feedback yet.</p>
            )}
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