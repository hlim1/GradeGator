'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import { apiFunctions } from '@/lib/api';
import UploadModal from '@/app/components/UploadModal';

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

interface SubmittedFile {
  filename: string;
  code_text: string;
}

export default function SubmittedFeedbackPage() {
  const router = useRouter();

  const [courseId, setCourseId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [grade, setGrade] = useState<any | null>(null);
  const [parsedFeedback, setParsedFeedback] = useState<ParsedFeedback | null>(null);
  const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([]);
  const [codeDropdownsOpen, setCodeDropdownsOpen] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'results' | 'code'>('results');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userIdFromSession, setUserIdFromSession] = useState<string | null>(null);
  const [assignmentName, setAssignmentName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parts = window.location.pathname.split('/');
    const course = parts[2];
    const assignment = parts[4];
    const nameAssignment = sessionStorage.getItem("assignmentName");

    setAssignmentName(nameAssignment);
    setCourseId(course);
    setAssignmentId(assignment);

    setUserIdFromSession(sessionStorage.getItem("studentIdForFeedback"));

    if (userIdFromSession) {
      setUserId(userIdFromSession);
    } else {
      // fallback for students
      const studentId = sessionStorage.getItem("userId");
      setUserId(studentId);
    }

  }, []);

  const fetchData = async () => {
    if (!assignmentId || !userId) return;

    try {
      const submissionId = await apiFunctions.getSubmissionId(assignmentId, userId);
      const res = await apiFunctions.getGradingResults(submissionId);
      console.log(res);
      setGrade(res);

      if (res?.feedback) {
        const feedbackStr = res.feedback;
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

      if (res?.submitted_files_json) {
        setSubmittedFiles(res.submitted_files_json);
      } else if (res?.submitted_code_text) {
        setSubmittedFiles([{ filename: 'Guitar.java', code_text: res.submitted_code_text }]);
      }

    } catch (err) {
      console.error('Error fetching grading results:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [assignmentId, userId]);

  const toggleDropdown = (filename: string) => {
    setCodeDropdownsOpen(prev => ({ ...prev, [filename]: !prev[filename] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Assignment Feedback</h1>

        <div className="flex justify-between mb-4 border-b">
          <div>
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
          {!userIdFromSession &&
            <div className="pb-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Upload Submission
              </button>
            </div>
          }
        </div >

        {activeTab === 'code' ? (
          <div className="bg-gray-100 p-4 rounded-md space-y-4">
            {submittedFiles.length > 0 ? (
              submittedFiles.map((file, index) => (
                <div key={index}>
                  <div
                    className="cursor-pointer text-sm text-blue-600 hover:underline"
                    onClick={() => toggleDropdown(file.filename)}
                  >
                    <span>{codeDropdownsOpen[file.filename] ? '▼' : '▶'} {file.filename}</span>
                  </div>
                  {codeDropdownsOpen[file.filename] && (
                    <pre className="whitespace-pre-wrap bg-white p-4 rounded shadow max-h-[600px] overflow-y-auto text-sm text-gray-800 mt-2">
                      {file.code_text}
                    </pre>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600">No submitted code available.</p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 border rounded-lg p-4">
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
                <p className="text-gray-600 text-sm italic">No feedback available yet.</p>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Manual Feedback</h2>
              {grade?.manualFeedback ? (
                <p className="text-gray-800">{grade.graded_questions}</p>
              ) : (
                <p className="text-sm text-gray-600 italic">No manual feedback available.</p>
              )}
            </div>
          </>
        )}
      </div>
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assignmentName={assignmentName ?? ''}
        assignmentId={parseInt(assignmentId ?? '0')}
        courseId={courseId ?? ''}
      />
    </div>
  );
}
