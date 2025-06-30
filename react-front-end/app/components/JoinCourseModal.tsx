import { useState } from 'react';
import Modal from './Modal';
import { apiFunctions, Course } from '@/lib/api';

interface JoinCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated?: () => void;
}

//interface CourseFormData extends Omit<Course, 'id' | 'created_at' | 'updated_at'> {
//  year: string;
//}

export default function CreateCourseModal({ isOpen, onClose, onCourseJoined }: JoinCourseModalProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    code: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const courseData = formData.code;
      const response = await apiFunctions.joinCourse(courseData);
      if (response) {
        const userId = sessionStorage.getItem('userId');
        apiFunctions.addUserCourse(userId);
        };
      }
      onClose();
      if (onCourseJoined) {
        onCourseJoined();
      }
    } catch (err) {
      setError('Failed to join a course. Please try again.');
      console.error('Error joining a course:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join a Course">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Course Code</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Joining...' : 'Join Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
} 