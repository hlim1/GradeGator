"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Course } from '@/lib/api';
import CourseInstructorView from '@/app/components/instructor/CourseInstructorView';
import CourseStudentView from '@/app/components/student/CourseStudentView';

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

interface CourseDetailClientProps {
  course: Course;
  assignmentData: AssignmentData | null;
}

export default function CourseDetailClient({ course, assignmentData }: CourseDetailClientProps) {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {role === 'instructor' ? (
        <CourseInstructorView course={course} assignmentData={assignmentData} />
      ) : (
        <CourseStudentView course={course} assignmentData={assignmentData} />
      )}
    </div>
  );
}
