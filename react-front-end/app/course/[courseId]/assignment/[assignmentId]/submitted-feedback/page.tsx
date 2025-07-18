'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Assignment, apiFunctions } from '@/lib/api';
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
  rubric?: RubricEntry[];
}

interface SubmittedFile {
  filename: string;
  code_text: string;
}

interface RubricEntry {
  name: string;
  max_score: number;
}

export default function SubmittedFeedbackPage() {
  const router = useRouter();

  const [courseId, setCourseId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [grade, setGrade] = useState<any | null>(null);
  const [parsedFeedback, setParsedFeedback] = useState<ParsedFeedback | null>(null);
  const [rubric, setRubric] = useState<RubricEntry[]>([]);
  const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([]);
  const [codeDropdownsOpen, setCodeDropdownsOpen] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'results' | 'code'>('results');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userIdFromSession, setUserIdFromSession] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null >(null);
  const [assignmentName, setAssignmentName] = useState<string | null>(null);
  const [isManuallyGraded, setIsManuallyGraded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize ids and session info once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parts = window.location.pathname.split('/');
    const course = parts[2];
    const assignment = parts[4];
    const nameAssignment = sessionStorage.getItem('assignmentName');

    setAssignmentName(nameAssignment);
    setCourseId(course);
    setAssignmentId(assignment);

    const userFromAssignment = sessionStorage.getItem("studentIdForFeedback")

    if (userFromAssignment) {
      // User is instructor for this course
      setUserIdFromSession(userFromAssignment);
      setUserId(userFromAssignment);
    } else {
      // fallback for students
      // User is student for this course
      const studentId = sessionStorage.getItem("userId");
      setUserId(studentId);
    }

    setLoading(false);
  }, []);

  // Fetch grade & feedback data when assignmentId or userId changes and both exist
  useEffect(() => {
    if (!assignmentId || !userId) return;

    async function fetchData() {
      try {
        const assignmentData = await apiFunctions.getAssignment(assignmentId);
        setAssignment(assignmentData);
        console.log("User Id being used for submission fetch",userId);
        const submissionId = await apiFunctions.getSubmissionId(assignmentId, userId);
        const res = await apiFunctions.getGradingResults(submissionId);
        console.log('Grading results:', res);

        setGrade(res);

        // Parse JSON feedback if exists
        if (res?.feedback) {
          try {
            // 1. Parse the outer feedback JSON
            const outer = JSON.parse(res.feedback);
            setRubric(outer.rubric ?? []);

            // 2. Extract the output string that contains embedded JSON
            const outputStr = outer.output;

            // 3. Find the start of the embedded JSON in output
            const start = outputStr.indexOf('{');
            if (start !== -1) {
              // 4. Parse the nested JSON inside output
              const nested = JSON.parse(outputStr.slice(start));
              setParsedFeedback(nested);
            } else {
              setParsedFeedback(null);
            }
          } catch (err) {
            console.error("Failed to parse feedback JSON or nested output:", err);
            setParsedFeedback(null);
            setRubric([]);
          }
        }

        // Set submitted files or fallback code text
        if (res?.submitted_files_json) {
          setSubmittedFiles(res.submitted_files_json);
        } else if (res?.submitted_code_text) {
          setSubmittedFiles([{ filename: 'Code.java', code_text: res.submitted_code_text }]);
        } else {
          setSubmittedFiles([]);
        }
      } catch (err) {
        console.error('Error fetching grading results:', err);
      }
    }

    fetchData();
  }, [assignmentId, userId]);

  useEffect(() => {
    if (assignment) {
      console.log('Assignment Data (updated):', assignment);
      setIsManuallyGraded(assignment.is_manually_graded);
    }
  }, [assignment]);

  const toggleDropdown = (filename: string) => {
    setCodeDropdownsOpen(prev => ({ ...prev, [filename]: !prev[filename] }));
  };

  const totalScores = useMemo(() => {
    const totalMax = rubric.reduce((sum, entry) => sum + entry.max_score, 0);
    const totalEarned = rubric.reduce((sum, entry, i) => {
      const test = parsedFeedback?.testResults?.[i];
      return test?.passed ? sum + entry.max_score : sum;
    }, 0);
    return { totalEarned, totalMax };
  }, [rubric, parsedFeedback]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Assignment Feedback</h1>

        <div className="flex justify-between mb-4 border-b">
          <div>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'results' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'}`}
              onClick={() => setActiveTab('results')}
            >
              Results
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'code' ? 'border-b-2 border-blue-500 text-blue-700' : 'text-gray-600'}`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </button>
          </div>
          {!loading && !userIdFromSession && (
            <div className="pb-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Upload Submission
              </button>
            </div>
          )}
        </div>

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
              {rubric.length > 0 ? (
                <>
                  <div className="text-right">Score</div>
                  {rubric.map((entry, i) => {
                    const test = parsedFeedback?.testResults?.[i];
                    const earned = test?.passed ? entry.max_score : 0;
                    return (
                      <div key={i} className="flex justify-between text-sm text-gray-800 mb-2">
                        <div>
                          <span className={test?.passed ? 'flex flex-col text-green-700' : 'text-red-700'}>
                            <div>
                              <strong>{test?.testName ?? entry.name}</strong>{' '}
                              {test?.passed ? '✔️' : '❌'}{' '}
                            </div>
                            {test?.input ? `with ${test.input}` : ''} → {test?.actualOutput ?? '?'} (expected: {test?.expectedOutput ?? '?'})
                          </span>
                        </div>
                        <div className="ml-8 font-medium">
                          {earned} / {entry.max_score}
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-4 font-semibold text-right">
                    Total: {totalScores.totalEarned} / {totalScores.totalMax}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 italic">No feedback available yet.</p>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Manual Feedback</h2>
              {isManuallyGraded ? (
                <div>
                  {assignment.questions?.map((question, index) => {
                    const questionGrade = grade?.question_scores?.[index.toString()];
                    return (
                      <div key={index} className="mb-2">
                        <p className="font-medium text-gray-800">
                          {question.title} - [{question.points} pts]
                        </p>

                        {questionGrade?.score !== undefined && (
                          <p className="ml-2 text-sm text-blue-600">
                            Score Given: {questionGrade.score} / {question.points}
                          </p>
                        )}

                        {question.rubrics?.map((rubric, i) => {
                          const rubricGrade = questionGrade?.rubrics?.[i.toString()];
                          const isAwarded = rubricGrade?.awarded;

                          return (
                            <div
                              key={i}
                              className={`ml-4 text-sm ${
                                isAwarded === true
                                  ? 'text-green-700 font-semibold'
                                  : isAwarded === false
                                  ? 'text-red-500 line-through'
                                  : 'text-gray-600'
                              }`}
                            >
                              • {rubric.description} ({rubric.points} pts)
                              {rubric.add && ' [+]'}
                              {rubric.subtract && ' [-]'}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">No manual feedback available.</p>
              )}
            </div>
          </>
        )}
      </div>
      <div>
        <UploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          assignmentName={assignmentName ?? ''}
          assignmentId={parseInt(assignmentId ?? '0')}
          courseId={courseId ?? ''}
        />

        
      </div>
    </div>
  );
}
