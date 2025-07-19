'use client';

import { useState, useEffect } from 'react';
import { apiFunctions } from '@/lib/api';
import UserEditModal from '@/components/UserEditModal';
import AddUserModal from '@/components/AddUserModal';
import { Button } from '@/components/ui/button';

export default function RosterPage({ courseId }: { courseId: string }) {
  const [roster, setRoster] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState<number | null>(null);
  const [loggedInUserRole, setLoggedInUserRole] = useState<'TA' | 'instructor' | 'owner' | null>(null);
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

        const loggedId = Number(sessionStorage.getItem('user_id'));
        setLoggedInUserId(loggedId);
        const loggedUser = flat.find((u) => u.user_id === loggedId || u.user === loggedId);
        if (loggedUser) {
          setLoggedInUserRole(loggedUser.role);
        }

        const course = await apiFunctions.getCourse(Number(courseId));
        setCourseCode(course.code);
      } catch (err) {
        console.error('Failed to fetch roster:', err);
      }
    };

    fetchRoster();
  }, [courseId]);

  const openModal = (user: any) => {
    if (loggedInUserRole === 'TA') return;
    if (user.role === 'owner') return;
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  return (
    <div className="relative">
      {courseCode && (
        <h2 className="text-2xl font-bold text-gray-800 mb-4"> Course Code: <span className="text-green-600">{courseCode}</span></h2>
      )}
      <h1 className="text-xl font-bold mb-4">Roster</h1>
      {roster.length === 0 ? (
        <p className="text-gray-500">No students or instructors found.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((user) => (
              <tr
                key={`roster-${user.role}-${user.user_id || user.student_id || user.instructor_id}`}
                className={`cursor-pointer hover:bg-gray-100 ${
                  loggedInUserRole === 'TA' || (user.role === 'owner' && user.user_id === loggedInUserId)
                    ? 'opacity-60 cursor-default'
                    : ''
                }`}
                onClick={() => openModal(user)}
              >
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2 capitalize">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <UserEditModal
        user={selectedUser}
        courseId={courseId}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {loggedInUserRole !== 'TA' && (
        <div className="fixed bottom-6 right-6">
          <Button onClick={() => setIsAddUserModalOpen(true)}>+ Add User</Button>
        </div>
      )}

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        courseId={courseId}
      />
    </div>
  );
}
