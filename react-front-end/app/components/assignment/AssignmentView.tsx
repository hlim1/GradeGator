'use client'

import React, { useState, useEffect } from 'react';
import { Assignment, Submission, apiFunctions } from '@/lib/api';
import { FaSearch, FaTrash } from 'react-icons/fa';
import AssignmentSettingsSidebar from './AssignmentSettingsSidebar';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface AssignmentViewProps {
  assignment: Assignment;
}

export default function AssignmentView({ assignment }: AssignmentViewProps) {
  //Submission states
  const [courseId, setCourseId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'submissions' | 'settings' | 'autograder' | 'outline'>('submissions');
  const [submissionStatus, setSubmissionStatus] = useState<'ungraded' | 'graded' | 'modified' | 'others'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmissions, setSelectedSubmissions] = useState<number[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

  // Settings states
  const [name, setName] = useState(assignment.name);
  const [grade_method, setGradeMethod] = useState(assignment.grade_method || 'points');
  const [points, setPoints] = useState(assignment.points || 0);
  const [due_date, setDueDate] = useState(assignment.due_date.slice(0, 16)); // "YYYY-MM-DDTHH:MM"
  const [release_date, setReleaseDate] = useState(assignment.release_date.slice(0, 16));
  const [is_visible_to_students, setVisible] = useState(assignment.is_visible_to_students);
  const [is_manually_graded, setManual] = useState(assignment.is_manually_graded);

  // Autograder states
  const [rubricFile, setRubricFile] = useState<File | null>(null);

  const router = useRouter();

  // Fetch assignment and courseId's from path window
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const parts = window.location.pathname.split('/');
    const courseNumber = parts[2];
    const userNumber = sessionStorage.getItem("userId");

    setUserId(userNumber);
    setCourseId(courseNumber);
    console.log("useEffect 1 triggered");
  }, []);

  useEffect(() => {
    console.log("useEffect 2 triggered");
    const fetchSubmissions = async () => {
      try {
        const data = await apiFunctions.getAssignmentSubmissions(assignment.id);
        console.log(data);
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignment.id]);
  
    const filteredSubmissions = submissions.filter(submission => {
    const matchesName = submission.student_detail?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = submission.status === submissionStatus || submissionStatus === 'all';
    return matchesName && matchesStatus;
  });
  
  const counts = {
    //should count the ones that have an unfinalized grade
    ungraded: submissions.filter(a => a.status.toLowerCase().includes('ungraded')).length,
    //should count the ones that have a a finalized grade
    graded: submissions.filter(a => a.status.toLowerCase().includes('graded')).length,
    //modified: count the ones with student accomidations
    modified: submissions.filter(a => a.status.toLowerCase().includes('modified')).length,
    //should count as non autograder activities for example
    others: submissions.filter(a => !a.status.toLowerCase().includes('graded') && !a.status.toLowerCase().includes('modified')).length,
  };

  const handleCheckboxChange = (submissionId: number) => {
    setSelectedSubmissions(prev =>
      prev.includes(submissionId)
        ? prev.filter(id => id !== submissionId)
        : [...prev, submissionId]
    );
  };

  /*
  const handleDeleteSubmission = async (assignment: Assignment) => {
    try {
      await apiFunctions.deleteAssignment(assignment.id);
      // Remove the deleted assignment from the state
      setAssignments(prev => prev.filter(a => a.id !== assignment.id));
      setAssignmentToDelete(null);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment. Please try again.');
    }
  };
  */

  const renderContent = () => {
    switch (activeTab) {
      case 'submissions':
        return (
          <>
            <div className="mb-6 flex gap-4 border-b">
              <button
                onClick={() => setSubmissionStatus('ungraded')}
                className={`px-4 py-2 relative ${
                  submissionStatus === 'ungraded' ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                Ungraded
                <span className="ml-1 text-sm text-gray-500">{counts.ungraded}</span>
                {submissionStatus === 'ungraded' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600" />
                )}
              </button>
              <button
                onClick={() => setSubmissionStatus('graded')}
                className={`px-4 py-2 relative ${
                  submissionStatus === 'graded' ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                Graded
                <span className="ml-1 text-sm text-gray-500">{counts.graded}</span>
                {submissionStatus === 'graded' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600" />
                )}
              </button>
              <button
                onClick={() => setSubmissionStatus('modified')}
                className={`px-4 py-2 relative ${
                  submissionStatus === 'modified' ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                Modified
                <span className="ml-1 text-sm text-gray-500">{counts.modified}</span>
                {submissionStatus === 'modified' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600" />
                )}
              </button>
              <button
                onClick={() => setSubmissionStatus('others')}
                className={`px-4 py-2 relative ${
                  submissionStatus === 'others' ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                Others
                <span className="ml-1 text-sm text-gray-500">{counts.others}</span>
                {submissionStatus === 'others' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600" />
                )}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="grid grid-cols-8 gap-4 p-4 border-b bg-gray-50">
                <div className="flex items-center">
                  <input
                   type="checkbox"
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    onChange={() => {
                      const allIds = filteredSubmissions.map(a => a.id);
                      setSelectedSubmissions(
                        selectedSubmissions.length === allIds.length ? [] : allIds
                      );
                    }}
                    checked={
                      selectedSubmissions.length === filteredSubmissions.length &&
                      filteredSubmissions.length > 0
                    }
                  />
                </div>
                <div className="font-semibold text-gray-600">NAME</div>
                <div className="font-semibold text-gray-600">STATUS</div>
                <div className="font-semibold text-gray-600">GRADED</div>
                <div className="font-semibold text-gray-600">STUDENT</div>
                <div className="font-semibold text-gray-600">ACTIONS</div>
              </div>

              {isLoading ? (
                <div className="p-4 text-center text-gray-600">Loading submissions...</div>
              ) : filteredSubmissions.length === 0 ? (
                <div className="p-4 text-center text-gray-600">No submissions found</div>
              ) : (
                filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="grid grid-cols-8 gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/course/${courseId}/assignment/${assignment.id}/submitted-feedback`)}
                  >
                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        checked={selectedSubmissions.includes(submission.id)}
                        onChange={() => handleCheckboxChange(submission.id)}
                      />
                    </div>
                    <div className="text-gray-800">{submission.student_detail?.name || 'Unknown Student'}</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        submission.status === 'graded'
                          ? 'bg-green-100 text-green-800'
                          : submission.status === 'ungraded'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      {format(new Date(assignment.created_at), 'MMM d, yyyy')}
                    </div>
                    <div className="text-gray-600">
                      {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-gray-600">{assignment.assignment_id}</div>
                    <div className="text-gray-600">
                      {assignment.is_visible_to_students ? 'Visible' : 'Hidden'}
                    </div>
                    <div className="text-gray-600" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setAssignmentToDelete(assignment)}
                        className="text-gray-500 hover:text-red-600 transition-colors"
                        aria-label="Delete Assignment"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        );
      case 'settings':
        return (
          <div className="p-4 max-w-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit Assignment Settings</h2>
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const updated = await apiFunctions.updateAssignment(assignment.id, {
                      name,
                      grade_method,
                      points,
                      due_date,
                      release_date,
                      is_visible_to_students,
                      is_manually_graded,
                    });
                    alert('Assignment updated!');
                  } catch (error) {
                    console.error(error);
                    alert('Update failed.');
                  }
                }}
              >
                <div>
                  <label className="block font-medium text-gray-700">Name</label>
                  <input
                    className="w-full border px-3 py-2 rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Grade Method</label>
                  <select
                    className="w-full border px-3 py-2 rounded"
                    value={grade_method}
                    onChange={(e) => setGradeMethod(e.target.value)}
                  >
                    <option value="points">Points Based</option>
                    <option value="pass_fail">Pass/Fail</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Points</label>
                  <input
                    type="number"
                    className="w-full border px-3 py-2 rounded"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Due Date</label>
                  <input
                    type="datetime-local"
                    className="w-full border px-3 py-2 rounded"
                    value={due_date}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700">Release Date</label>
                  <input
                    type="datetime-local"
                    className="w-full border px-3 py-2 rounded"
                    value={release_date}
                    onChange={(e) => setReleaseDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={is_visible_to_students}
                    onChange={(e) => setVisible(e.target.checked)}
                  />
                  <label className="text-gray-700">Visible to Students</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={is_manually_graded}
                    onChange={(e) => setManual(e.target.checked)}
                  />
                  <label className="text-gray-700">Manually Graded</label>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
            </form>
          </div>
        );
      case 'autograder':
          return (
            <div className="p-4 max-w-xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Grading Rubric</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!rubricFile) {
                    alert('Please select a file.');
                    return;
                  }
                  const formData = new FormData();

                  // Make sure to use exact field names from the schema
                  formData.append('rubric_file', rubricFile);
                  formData.append('instructor', userId.toString());
                  formData.append('assignment', assignment.id.toString());

                  try {
                    await apiFunctions.uploadRubric(formData);
                    alert('Rubric uploaded!');
                  } catch (err) {
                    console.error(err);
                    alert('Upload failed.');
                  }
                }}
              >
                <input type="file" onChange={(e) => setRubricFile(e.target.files?.[0] || null)} />
                <button
                  type="submit"
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Upload
                </button>
              </form>
          </div>
        );
      case 'outline':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-semibold text-gray-800">Course Documents</h2>
            <p className="text-gray-600 mt-2">Documents content coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-1">
      <AssignmentSettingsSidebar
        assignment={assignment}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{assignment.name}</h1>
          </div>
          {activeTab === 'assignments' && (
            <div className="w-96 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
        </div>

        {renderContent()}
      </main>

      {/* Delete Confirmation Modal */}
      {assignmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Delete Assignment</h3>
            <p className="mb-6">Are you sure you want to delete this assignment?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setAssignmentToDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAssignment(assignmentToDelete)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}