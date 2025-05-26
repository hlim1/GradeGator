'use client'

import React, { useState, useEffect } from 'react';
import { Course, Assignment, apiFunctions } from '@/lib/api';
import { FaSearch, FaTrash } from 'react-icons/fa';
import CourseSidebarInstructor from './CourseSidebarInstructor';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface AssignmentData {
  assignmentName: string;
  autoGraderPoints: string;
  releaseDate: string;
  dueDate: string;
  lateDueDate: string;
  enableAnonymous: boolean;
  enableManual: boolean;
  allowLateSubmissions: boolean;
  enableGroup: boolean;
  rubric: { description: string; points: string }[];
  courseId: string;
}

interface CourseInstructorViewProps {
  course: Course;
  assignmentData: AssignmentData | null;
}

export default function CourseInstructorView({ course, assignmentData }: CourseInstructorViewProps) {
  const [activeTab, setActiveTab] = useState<'assignments' | 'gradebook' | 'roster' | 'documents'>('assignments');
  const [assignmentType, setAssignmentType] = useState<'all' | 'homework' | 'quiz' | 'others'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignments, setSelectedAssignments] = useState<number[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await apiFunctions.getCourseAssignments(course.id);
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [course.id]);

  // If there's assignment data in sessionStorage, add it to the assignments list
  useEffect(() => {
    if (assignmentData) {
      const newAssignment: Assignment = {
        id: Date.now(), // Temporary ID
        assignment_id: `temp-${Date.now()}`,
        name: assignmentData.assignmentName,
        grade_method: 'POINTS',
        points: parseInt(assignmentData.autoGraderPoints, 10),
        due_date: assignmentData.dueDate,
        release_date: new Date(assignmentData.releaseDate).toISOString().split('T')[0],
        is_visible_to_students: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_manually_graded: false,
        course: course.id
      };
      setAssignments(prev => [...prev, newAssignment]);
    }
  }, [assignmentData, course.id]);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const counts = {
    all: assignments.length,
    homework: assignments.filter(a => a.name.toLowerCase().includes('homework')).length,
    quiz: assignments.filter(a => a.name.toLowerCase().includes('quiz')).length,
    others: assignments.filter(a => !a.name.toLowerCase().includes('homework') && !a.name.toLowerCase().includes('quiz')).length,
  };

  const handleCheckboxChange = (assignmentId: number) => {
    setSelectedAssignments(prev => 
      prev.includes(assignmentId)
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  const handleDeleteAssignment = async (assignment: Assignment) => {
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

  const renderContent = () => {
    switch (activeTab) {
      case 'assignments':
        return (
          <>
            <div className="mb-6 flex gap-4 border-b">
              <button
                onClick={() => setAssignmentType('all')}
                className={`px-4 py-2 relative ${
                  assignmentType === 'all' ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                All
                <span className="ml-1 text-sm text-gray-500">{counts.all}</span>
                {assignmentType === 'all' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600" />
                )}
              </button>
              <button
                onClick={() => setAssignmentType('homework')}
                className={`px-4 py-2 relative ${
                  assignmentType === 'homework' ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                Homework
                <span className="ml-1 text-sm text-gray-500">{counts.homework}</span>
                {assignmentType === 'homework' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600" />
                )}
              </button>
              <button
                onClick={() => setAssignmentType('quiz')}
                className={`px-4 py-2 relative ${
                  assignmentType === 'quiz' ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                Quiz
                <span className="ml-1 text-sm text-gray-500">{counts.quiz}</span>
                {assignmentType === 'quiz' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600" />
                )}
              </button>
              <button
                onClick={() => setAssignmentType('others')}
                className={`px-4 py-2 relative ${
                  assignmentType === 'others' ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                Others
                <span className="ml-1 text-sm text-gray-500">{counts.others}</span>
                {assignmentType === 'others' && (
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
                      const allIds = filteredAssignments.map(a => a.id);
                      setSelectedAssignments(
                        selectedAssignments.length === allIds.length ? [] : allIds
                      );
                    }}
                    checked={
                      selectedAssignments.length === filteredAssignments.length &&
                      filteredAssignments.length > 0
                    }
                  />
                </div>
                <div className="font-semibold text-gray-600">ASSIGNMENT NAME</div>
                <div className="font-semibold text-gray-600">STATUS</div>
                <div className="font-semibold text-gray-600">CREATED</div>
                <div className="font-semibold text-gray-600">DUE DATE</div>
                <div className="font-semibold text-gray-600">ID</div>
                <div className="font-semibold text-gray-600">VISIBILITY</div>
                <div className="font-semibold text-gray-600">ACTIONS</div>
              </div>

              {isLoading ? (
                <div className="p-4 text-center text-gray-600">Loading assignments...</div>
              ) : filteredAssignments.length === 0 ? (
                <div className="p-4 text-center text-gray-600">No assignments found</div>
              ) : (
                filteredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="grid grid-cols-8 gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/course/${course.id}/assignment/${assignment.id}/submissions`)}
                  >
                    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        checked={selectedAssignments.includes(assignment.id)}
                        onChange={() => handleCheckboxChange(assignment.id)}
                      />
                    </div>
                    <div className="text-gray-800">{assignment.name}</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        assignment.is_visible_to_students
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.is_visible_to_students ? 'Published' : 'Draft'}
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

            <div className="fixed bottom-4 right-4">
              <button
                onClick={() => router.push(`/course/${course.id}/create-assignment`)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors"
              >
                Create Assignment
              </button>
            </div>
          </>
        );
      case 'gradebook':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-semibold text-gray-800">Grade Book</h2>
            <p className="text-gray-600 mt-2">Grade book content coming soon...</p>
          </div>
        );
      case 'roster':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-semibold text-gray-800">Class Roster</h2>
            <p className="text-gray-600 mt-2">Roster content coming soon...</p>
          </div>
        );
      case 'documents':
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
      <CourseSidebarInstructor 
        course={course}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className="flex-1 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{course.name}</h1>
            <p className="text-gray-600 mt-2">{course.term}</p>
          </div>
          {activeTab === 'assignments' && (
            <div className="w-96 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search assignments..."
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