"use client";

import React, { useEffect, useState } from 'react';
import { Course } from '@/lib/api';
import CourseInstructorView from '@/app/components/instructor/CourseInstructorView';
import CourseStudentView from '@/app/components/student/CourseStudentView';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`http://18.188.140.218:8000/api/courses/${course.id}/user-role/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRole(res.data.role);
      } catch (error) {
        console.error("Error fetching role:", error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [course.id, router]);

  if (loading) return <div>Loading...</div>;
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
