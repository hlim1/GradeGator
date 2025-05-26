import React from 'react';
import { Course, apiFunctions } from '@/lib/api';
import CourseDetailClient from './CourseDetailClient';

interface PageProps {
  params: { courseId: string };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await Promise.resolve(params);
  const courseIdNumber = Number(courseId);

  if (isNaN(courseIdNumber)) {
    throw new Error(`Invalid course ID: ${courseId}`);
  }

  try {
    const course = await apiFunctions.getCourse(courseIdNumber);
    return <CourseDetailClient course={course} assignmentData={null} />;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw new Error('Failed to fetch course data');
  }
}
