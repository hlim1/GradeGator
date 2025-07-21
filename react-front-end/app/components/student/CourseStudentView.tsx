'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Course, Assignment, apiFunctions } from '@/lib/api';
import { FaSearch } from 'react-icons/fa';
//import UploadModal from '@/app/components/UploadModal';
import CourseSidebarStudent from '@/app/components/student/CourseSidebarStudent';
import { format } from 'date-fns';
import Files from '../Files';

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

interface CourseStudentViewProps {
  course: Course;
  assignmentData: AssignmentData | null;
}

export default function CourseStudentView({ course, assignmentData }: CourseStudentViewProps) {
  const [activeTab, setActiveTab] = useState<'assignments' | 'gradebook' | 'files'>('assignments');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("studentIdForFeedback")) {
      sessionStorage.removeItem("studentIdForFeedback");
    }

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

  useEffect(() => {
    if (assignmentData) {
      const newAssignment: Assignment = {
        id: Date.now(),
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
        course: course.id,
      };
      setAssignments((prev) => [...prev, newAssignment]);
    }
  }, [assignmentData, course.id]);

  const getStatusBadge = (assignment: Assignment) => {
    if (!assignment.is_visible_to_students) return null;

    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
        Not Submitted
      </span>
    );
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    if (assignment.is_visible_to_students) {
      sessionStorage.setItem('assignmentName', assignment.name);
      router.push(`/course/${course.id}/assignment/${assignment.id}/submitted-feedback`);
    }
  };

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'assignments':
        return (
          <>
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{course.name}</h1>
                <p className="text-gray-600 mt-2">{course.term}</p>
              </div>
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
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="grid grid-cols-5 gap-4 p-4 border-b bg-gray-50">
                <div className="font-semibold text-gray-600">ASSIGNMENT NAME</div>
                <div className="font-semibold text-gray-600">STATUS</div>
                <div className="font-semibold text-gray-600">CREATED</div>
                <div className="font-semibold text-gray-600">SCORING</div>
                <div className="font-semibold text-gray-600">DEADLINE</div>
              </div>

              {isLoading ? (
                <div className="p-4 text-center text-gray-600">Loading assignments...</div>
              ) : filteredAssignments.length === 0 ? (
                <div className="p-4 text-center text-gray-600">No assignments found</div>
              ) : (
                filteredAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className={`grid grid-cols-5 gap-4 p-4 border-b ${
                      assignment.is_visible_to_students ? 'hover:bg-gray-50' : 'opacity-50'
                    }`}
                  >
                    <div className="text-gray-800">
                      <span
                        onClick={() => handleAssignmentClick(assignment)}
                        className={"cursor-pointer underline text-blue-500 hover:text-blue-700"}
                      >
                        {assignment.name}
                      </span>
                      {!assignment.is_visible_to_students && (
                        <span className="ml-2 text-sm text-gray-500">(Not yet visible)</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      {getStatusBadge(assignment)}
                    </div>
                    <div className="text-gray-600">
                      {format(new Date(assignment.created_at), 'MMM d, yyyy')}
                    </div>
                    <div className="text-gray-600">
                      {assignment.grade_method} • {assignment.points} points
                    </div>
                    <div className="text-gray-600">
                      {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                ))
              )}
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
      case 'files':
        return <Files />;
    }
  };

  return (
    <div className="flex flex-1">
      <CourseSidebarStudent activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8">{renderContent()}</main>
    </div>
  );
}
