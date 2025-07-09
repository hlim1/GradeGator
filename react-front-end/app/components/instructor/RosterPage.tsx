'use client';

import React, { useEffect, useState } from 'react';
import { apiFunctions, Course } from '@/lib/api';
import { useParams } from 'next/navigation';

interface RosterUser {
  id: number | string;
  name: string;
  preferred_name: string | null;
  email: string;
  role: 'Student' | 'Instructor';
}

export default function RosterPage() {
  const { courseId } = useParams();
  const [roster, setRoster] = useState<RosterUser[]>([]);

  useEffect(() => {
    const fetchRoster = async () => {
      if (!courseId) return;
      try {
        const course: Course = await apiFunctions.getCourse(Number(courseId));
        const studentList = await Promise.all(
          course.students.map(async (studentId) => {
            const student = await apiFunctions.getStudentDetails(studentId);
            return {
              id: student.id ?? student.user?.id ?? student.user?.email ?? Math.random().toString(),
              name: student.name,
              preferred_name: student.preferred_name,
              email: student.user?.email || 'N/A',
              role: 'Student',
            };
          })
        );

        const instructorList = await Promise.all(
          course.instructors.map(async (instructorId) => {
            const instructor = await apiFunctions.getInstructorDetails(instructorId);
            return {
              id: instructor.id ?? instructor.user?.id ?? instructor.user?.email ?? Math.random().toString(),
              name: instructor.name,
              preferred_name: instructor.preferred_name,
              email: instructor.user?.email || 'N/A',
              role: 'Instructor',
            };
          })
        );

        setRoster([...instructorList, ...studentList]);
      } catch (err) {
        console.error('Error fetching roster:', err);
      }
    };

    fetchRoster();
  }, [courseId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Class Roster</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Preferred Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {roster.map((user) => (
              <tr key={`${user.role}-${user.id}`}>
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.preferred_name || '-'}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {roster.length === 0 && (
          <p className="text-sm text-gray-500 mt-4">No students or instructors found.</p>
        )}
      </div>
    </div>
  );
}
