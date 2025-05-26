import { useState } from 'react';
import { apiFunctions } from '../../lib/api';

interface CourseBlockProps {
  courseId: number;
  courseNumber: string;
  courseName: string;
  section: string;
  semester: string;
}

export default function CourseBlock({
  courseId,
  courseName,
  courseNumber,
  section,
  semester,
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

  return (
    <div className="relative p-4 bg-blue-100 rounded-xl shadow-md">
      {/* Delete Confirmation Overlay */}
      {showConfirm && (
        <div className="absolute inset-0 z-10 bg-black bg-opacity-30 rounded-xl flex items-center justify-center">
          <div
            className="bg-white p-4 rounded-lg shadow-md text-center space-y-3 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <p>Are you sure you want to delete this course?</p>
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
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={async (e) => {
                  e.stopPropagation();
                  await handleDelete();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Info */}
      <h3 className="font-bold text-lg">{courseName}</h3>
      <p className="text-gray-700">{courseNumber}{section ? ` — ${section}` : ''}</p>
      <p className="text-sm text-gray-400">{semester}</p>

      {/* Delete Button */}
      {!showConfirm && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirm(true);
          }}
          className="absolute bottom-2 right-2 text-black text-sm hover:text-red-600 z-20"
          aria-label="Delete Course"
        >
          🗑️
        </button>
      )}
    </div>
  );
}
