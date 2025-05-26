'use client';

import React, { useEffect, useState } from 'react';
import CourseDetailClient from './CourseDetailClient';
import { Course } from '@/lib/api';

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

interface CourseDetailWrapperProps {
  course: Course;
}

export default function CourseDetailWrapper({ course }: CourseDetailWrapperProps) {
  const [assignmentData, setAssignmentData] = useState<AssignmentData | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('assignmentData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // Only use the data if it belongs to this course
        if (parsedData.courseId === course.id.toString()) {
          setAssignmentData(parsedData);
        }
      } catch (error) {
        console.error('Error parsing assignment data:', error);
      }
    }
  }, [course.id]);

  return <CourseDetailClient course={course} assignmentData={assignmentData} />;
} 