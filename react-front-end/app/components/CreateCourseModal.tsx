import { useState } from 'react';
import Modal from './Modal';
import { apiFunctions, Course } from '@/lib/api';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated?: () => void;
}

interface CourseFormData extends Omit<Course, 'id' | 'created_at' | 'updated_at'> {
  year: string;
}

export default function CreateCourseModal({ isOpen, onClose, onCourseCreated }: CreateCourseModalProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    number: '',
    term: 'Spring',
    year: '2025',
    section: '',
    department: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const courseData = {
        ...formData,
        term: `${formData.term} ${formData.year}`
      };
      await apiFunctions.createCourse(courseData);
      onClose();
      if (onCourseCreated) {
        onCourseCreated();
      }
    } catch (err) {
      setError('Failed to create course. Please try again.');
      console.error('Error creating course:', err);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Course">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Course Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Course Number</label>
          <input
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Term</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              name="term"
              value={formData.term}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            >
              <option value="Spring">Spring</option>
              <option value="Fall">Fall</option>
            </select>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Section</label>
          <input
            type="text"
            name="section"
            value={formData.section}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
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
            {isSubmitting ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>
    </Modal>
  );
} 