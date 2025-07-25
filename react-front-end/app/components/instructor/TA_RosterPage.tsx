'use client';

import { useEffect, useState } from 'react';
import { apiFunctions } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function TA_RosterPage() {
  const { courseId } = useParams();
  const [roster, setRoster] = useState<any[]>([]);
  const [courseCode, setCourseCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const data = await apiFunctions.getCourseRoster(Number(courseId));
        const flat = [
          ...data.students.map((s: any) => ({ ...s, role: 'student' })),
          ...data.instructors.map((i: any) => ({ ...i, role: 'instructor' })),
          ...data.tas.map((t: any) => ({ ...t, role: 'TA' })),
          ...data.owners.map((o: any) => ({ ...o, role: 'owner' })),
        ];
        setRoster(flat);

        const course = await apiFunctions.getCourse(Number(courseId));
        setCourseCode(course.code);
      } catch (err) {
        console.error('Failed to fetch TA roster:', err);
      }
    };

    fetchRoster();
  }, [courseId]);

  return (
    <div className="relative">
      {courseCode && (
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Course Code: <span className="text-green-600">{courseCode}</span>
        </h2>
      )}
      <h1 className="text-xl font-bold mb-4">Roster</h1>
      {roster.length === 0 ? (
        <p className="text-gray-500">No students or instructors found.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Preferred Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((user) => (
              <tr
                key={`ta-roster-${user.role}-${user.user_id || user.student_id || user.instructor_id}`}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.preferred_name || '-'}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2 capitalize">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
