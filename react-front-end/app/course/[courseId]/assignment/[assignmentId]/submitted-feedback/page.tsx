'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFunctions } from '@/lib/api';

interface TestResult {
  testName: string;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
}

interface ParsedFeedback {
  testResults: TestResult[];
}

export default function SubmittedFeedbackPage() {
  const router = useRouter();

  const [courseId, setCourseId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [grade, setGrade] = useState<any | null>(null);
  const [parsedFeedback, setParsedFeedback] = useState<ParsedFeedback | null>(null);
  const [submittedFileUrl, setSubmittedFileUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'code'>('results');

  // Set IDs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parts = window.location.pathname.split('/');
    const course = parts[2];
    const assignment = parts[4];
    const user = sessionStorage.getItem("userId");

    setUserId(user);
    setCourseId(course);
    setAssignmentId(assignment);
  }, []);

  // Fetch data once IDs are ready
  useEffect(() => {
    const fetchData = async () => {
      if (!assignmentId || !userId) return;

      try {
        const submissionId = await apiFunctions.getSubmissionId(assignmentId, userId);
        const res = await apiFunctions.getGradingResults(submissionId);
        console.log(res);
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
              console.error('Failed to parse feedback JSON:', err);
              setParsedFeedback(null);
            }
          } else {
            setParsedFeedback(null);
          }
        }

        if (res[0]?.submitted_file) {
          setSubmittedFileUrl(res[0].submitted_file);
        }
      } catch (err) {
        console.error('Error fetching grading results:', err);
      }
    };

    fetchData();
  }, [assignmentId, userId]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Assignment Feedback</h1>

        {/* Tab switcher */}
        <div className="flex mb-4 border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'results' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('results')}
          >
            Results
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'code' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('code')}
          >
            Code
          </button>
        </div>

        {/* Render either the results or code tab */}
        {activeTab === 'code' ? (
          <div className="bg-gray-100 p-4 rounded-md">
            {submittedFileUrl ? (
              <iframe
                src={submittedFileUrl}
                title="Submitted Code"
                className="w-full h-[600px] border rounded"
              />
            ) : (
              <p className="text-gray-600">No submitted file available.</p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Autograder Results</h2>
              {parsedFeedback?.testResults ? (
                <div className="space-y-2">
                  {parsedFeedback.testResults.map((test, index) => (
                    <div
                      key={index}
                      className="border rounded-md px-4 py-3 text-sm font-medium shadow-sm"
                    >
                      <span
                        className={`inline-block ${
                          test.passed ? 'text-green-700' : 'text-red-700'
                        }`}
                      >
                        <strong>{test.testName}</strong> {test.passed ? '✔️' : '❌'}{' '}
                        {test.input ? `with ${test.input}` : ''} → {test.actualOutput ?? '?'} (expected: {test.expectedOutput ?? '?'})
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No feedback available yet.</p>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Manual Feedback</h2>
              {grade && grade[0]?.manualFeedback ? (
                <p className="text-gray-800">{grade[0].manualFeedback}</p>
              ) : (
                <p className="text-sm text-gray-600 italic">No manual feedback available.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
