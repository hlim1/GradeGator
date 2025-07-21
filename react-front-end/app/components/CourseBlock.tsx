'use client';

import { useState } from 'react';
import { apiFunctions } from '../../lib/api';
import { TrashIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface CourseBlockProps {
  courseId: number;
  courseNumber: string;
  courseName: string;
  section: string;
  semester: string;
  userRole: 'owner' | 'instructor' | 'TA' | 'student' | null;
}

export default function CourseBlock({
  courseId,
  courseName,
  courseNumber,
  section,
  semester,
  userRole,
}: CourseBlockProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await apiFunctions.deleteCourse(courseId);
      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Something went wrong.');
    } finally {
      setShowConfirm(false);
    }
  };

  const handleLeave = async () => {
    alert('Leave course logic is not implemented yet.');
    setShowConfirm(false);
  };

  const renderConfirmDialog = () => {
    const isOwner = userRole === 'owner';
    return (
      <div className="absolute inset-0 z-10 bg-black bg-opacity-30 rounded-xl flex items-center justify-center">
        <div
          className="bg-white p-4 rounded-lg shadow-md text-center space-y-3 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <p>
            {isOwner
              ? 'Are you sure you want to delete this course? This action cannot be undone.'
              : 'Are you sure you want to leave this course?'}
          </p>
          <div className="flex justify-center gap-4">
            <button
              className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(false);
              }}
            >
              Cancel
            </button>
            <button
              className={`px-3 py-1 rounded text-white ${
                isOwner ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
              onClick={async (e) => {
                e.stopPropagation();
                isOwner ? await handleDelete() : await handleLeave();
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative p-4 bg-gray-100 border border-black rounded-xl shadow-md">
      {showConfirm && renderConfirmDialog()}

      <h3 className="font-bold text-lg">{courseName}</h3>
      <p className="text-gray-700">
        {courseNumber}
        {section ? ` — ${section}` : ''}
      </p>
      <p className="text-sm text-gray-500">{semester}</p>

      {userRole === 'owner' ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirm(true);
          }}
          className="absolute bottom-2 right-2 z-20 p-1 text-red-600 hover:text-red-800"
          aria-label="Delete Course"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      ) : userRole ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirm(true);
          }}
          className="absolute bottom-2 right-2 z-20 p-1 text-red-600 hover:text-red-800"
          aria-label="Leave Course"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
        </button>
      ) : null}
    </div>
  );
}
