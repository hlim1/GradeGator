'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiFunctions, Submission } from '../../../../../lib/api';

interface SubmissionWithDetails extends Submission {
  studentName?: string;
  status: 'graded' | 'pending';
}

export default function AssignmentSubmissionsPage() {
  const params = useParams();
  const courseId = params.courseId;
  const assignmentId = params.assignmentId;
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissionsWithDetails = async () => {
      try {
        // Fetch submissions for this assignment
        const submissionsData = await apiFunctions.getAssignmentSubmissions(Number(assignmentId));
        
        if (submissionsData.length === 0) {
          setSubmissions([]);
          setError('No submissions found for this assignment.');
          setLoading(false);
          return;
        }
        
        // Fetch student details for each submission
        const submissionsWithDetails = await Promise.all(
          submissionsData.map(async (submission) => {
            try {
              const studentDetails = await apiFunctions.getStudentDetails(submission.student);
              return {
                ...submission,
                studentName: `${studentDetails.first_name} ${studentDetails.last_name}`,
                status: 'pending' as const
              };
            } catch (error) {
              console.error(`Error fetching student details for ID ${submission.student}:`, error);
              return {
                ...submission,
                studentName: `Student ${submission.student}`,
                status: 'pending' as const
              };
            }
          })
        );

        setSubmissions(submissionsWithDetails);
      } catch (err) {
        setError('Failed to fetch submissions');
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchSubmissionsWithDetails();
    }
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading submissions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Assignment Submissions</h1>
            <div className="text-gray-600">
              {error === 'No submissions found for this assignment.' ? (
                <>
                  <p>There are no submissions for this assignment yet.</p>
                  <p className="mt-2">Submissions will appear here once students start submitting their work.</p>
                </>
              ) : (
                <div className="text-red-500">{error}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-800">Assignment Submissions</h1>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {submission.studentName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(submission.submission_time).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${submission.status === 'graded' ? 'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.submission_file.split('/').pop()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        onClick={() => window.open(submission.submission_file, '_blank')}
                      >
                        View
                      </button>
                      {submission.status !== 'graded' && (
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => {/* TODO: Implement grading functionality */}}
                        >
                          Grade
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 