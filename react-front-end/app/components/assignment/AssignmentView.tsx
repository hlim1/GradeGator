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

interface Rubric {
  description: string;
  points: number;
  add: boolean;
  subtract: boolean;
};

interface Question {
  title: string;
  points: number;
  rubrics: Rubric[];
};

export default function AssignmentView({ assignment }: AssignmentViewProps) {
  //Submission states
  const [courseId, setCourseId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'submissions' | 'settings' | 'autograder' | 'outline'>('submissions');
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

  // Outline states
  const [questions, setQuestions] = useState<Question[]>(assignment.questions || []);
  console.log(questions);
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
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setIsLoading(false);
      }
    };

      fetchSubmissions();
    }, [assignment.id]);

  const filteredSubmissions = submissions.filter(submission =>
    submission.student_detail?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleAddQuestion = async (assignment: Assignment) => {
    try {
      // Remove the deleted assignment from the state
      setAssignments(prev => prev.filter(a => a.id !== assignment.id));
      setAssignmentToDelete(null);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment. Please try again.');
    }
  };

  const renderContent = () => {
    if (activeTab === 'outline' && !is_manually_graded) {
      return <div className="p-4 text-gray-600">Manual grading is disabled for this assignment.</div>;
    }
    switch (activeTab) {
      case 'submissions':
        return (
          <div className="pt-12">
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
          </div>
        );
      case 'settings':
        return (
          <div className="py-4 max-w-xl">
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
                  // If manually graded was turned OFF, delete the outline
                  if (!is_manually_graded) {
                    await apiFunctions.updateAssignmentOutline(assignment.id, { outline: [] });
                    setQuestions([]); // Reset frontend state
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
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>
            </form>
          </div>
        );
      case 'autograder':
          return (
            <div className="py-4 max-w-xl">
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
                <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" onChange={(e) => setRubricFile(e.target.files?.[0] || null)} />
                <button
                  type="submit"
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Upload
                </button>
              </form>
          </div>
        );
      case 'outline':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              Create questions and assign points. Then add rubric items for grading criteria.
            </p>

            <div className="border rounded p-4 bg-white shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Questions</h3>
              <div>
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="border p-4 bg-gray-100 rounded">
                    <input
                      className="font-bold text-lg text-gray-800 mb-2 w-full"
                      placeholder="Question title"
                      value={q.title}
                      onChange={e => {
                        const newQs = [...questions];
                        newQs[qIdx].title = e.target.value;
                        setQuestions(newQs);
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Points"
                      className="w-1/3 border px-2 py-1 mb-2"
                      value={q.points}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        const newQs = [...questions];
                        newQs[qIdx].points = isNaN(val) ? 0 : val;
                        setQuestions(newQs);
                      }}
                    />

                    <h4 className="text-md font-medium mt-2">Rubrics</h4>
                    {q.rubrics.map((r, rIdx) => (
                      <div key={rIdx} className="border border-gray-400 rounded p-2 ml-4 mb-2">
                        <input
                          className="border px-2 py-1 w-full mb-1"
                          placeholder="Rubric description"
                          value={r.description}
                          onChange={e => {
                            const newQs = [...questions];
                            newQs[qIdx].rubrics[rIdx].description = e.target.value;
                            setQuestions(newQs);
                          }}
                        />
                        <input
                          type="number"
                          className="border w-1/4 mb-1 px-2 py-1"
                          placeholder="Points"
                          value={r.points}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const newQs = [...questions];

                            const totalOtherRubrics = newQs[qIdx].rubrics.reduce((sum, rub, idx) => {
                              return idx === rIdx ? sum : sum + rub.points;
                            }, 0);

                            const maxAllowed = newQs[qIdx].points - totalOtherRubrics;

                            // Clamp to max allowed
                            newQs[qIdx].rubrics[rIdx].points = isNaN(val) ? 0 : Math.min(val, maxAllowed);

                            setQuestions(newQs);
                          }}
                        />
                        <div className="flex gap-4 mb-2">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={r.add}
                              onChange={e => {
                                const newQs = [...questions];
                                newQs[qIdx].rubrics[rIdx].add = e.target.checked;
                                if (e.target.checked) newQs[qIdx].rubrics[rIdx].subtract = false;
                                setQuestions(newQs);
                              }}
                            />
                            Add
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={r.subtract}
                              onChange={e => {
                                const newQs = [...questions];
                                newQs[qIdx].rubrics[rIdx].subtract = e.target.checked;
                                if (e.target.checked) newQs[qIdx].rubrics[rIdx].add = false;
                                setQuestions(newQs);
                              }}
                            />
                            Subtract
                          </label>
                          <button
                            className="text-red-600 text-sm"
                            onClick={() => {
                              const newQs = [...questions];
                              newQs[qIdx].rubrics.splice(rIdx, 1);
                              setQuestions(newQs);
                            }}
                          >
                            Delete Rubric
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      className="text-blue-600 mt-2"
                      onClick={() => {
                        const newQs = [...questions];
                        newQs[qIdx].rubrics.push({ description: '', points: 0, add: false, subtract: false });
                        setQuestions(newQs);
                      }}
                    >
                      + Add Rubric
                    </button>

                    <button
                      className="text-red-600 mt-2 ml-4"
                      onClick={() => {
                        const newQs = [...questions];
                        newQs.splice(qIdx, 1);
                        setQuestions(newQs);
                      }}
                    >
                      Delete Question
                    </button>
                  </div>
                ))}

                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  onClick={() => {
                    setQuestions(prev => [...prev, { title: '', points: 0, rubrics: [] }]);
                  }}
                >
                  + Add Question
                </button>

                <button
                  onClick={async () => {
                    try {
                      await apiFunctions.updateAssignmentOutline(assignment.id, { outline: questions });
                      alert('Outline saved!');
                    } catch (err) {
                      console.error('Failed to save outline:', err);
                      alert('Failed to save outline.');
                    }
                  }}
                  className="mt-2 mx-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Outline
                </button>
              </div>
            </div>
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
        {activeTab === 'outline' && !is_manually_graded ? (
           <div className="mb-8 flex flex-col">
              <h1 className="text-3xl font-bold text-gray-800">{assignment.name}</h1>
              <div className="py-12 text-gray-500">This assignment is not manually graded.</div>
           </div>
        ) : (
          <>
            {/* Only show search bar in submissions tab */}
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800">{assignment.name}</h1>
              {activeTab === 'submissions' && (
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
          </>
        )}
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