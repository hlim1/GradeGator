'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiFunctions } from '@/lib/api';
import UserEditModal from '@/components/UserEditModal';

export default function RosterPage({ courseId }: { courseId: string }) {
  const [roster, setRoster] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const data = await apiFunctions.getCourseRoster(Number(courseId));
        const flat = [
          ...data.students.map((s: any) => ({ ...s, role: 'student' })),
          ...data.instructors.map((i: any) => ({
            ...i,
            role: i.name.toLowerCase().includes('ta') ? 'TA' : 'instructor',
          })),
        ];
        setRoster(flat);
      } catch (err) {
        console.error('Failed to fetch roster:', err);
      }
    };
    fetchRoster();
  }, [courseId]);

  const openModal = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  return (
    <div>
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
                key={user.user || user.user_id}
                className="hover:bg-gray-100 cursor-pointer"
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
    </div>
  );
}
