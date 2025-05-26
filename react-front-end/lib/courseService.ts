import api from './api';

interface Course {
  id: number;
  name: string;
  code: string;
  description?: string;
  // Add other course properties as needed
}

/**
 * Fetch all courses
 * @returns {Promise<Course[]>} An array of course objects
 */
export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await api.get<Course[]>('/courses/');
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    // Return an empty array rather than throwing, to prevent component crashes
    return [];
  }
};

/**
 * Fetch a specific course by ID
 * @param {number|string} id - The course ID
 * @returns {Promise<Course>} The course data
 */
export const getCourse = async (id: number | string): Promise<Course> => {
  try {
    const response = await api.get<Course>(`/courses/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new course
 * @param {Omit<Course, 'id'>} courseData - The course data to create
 * @returns {Promise<Course>} The created course
 */
export const createCourse = async (courseData: Omit<Course, 'id'>): Promise<Course> => {
  try {
    const response = await api.post<Course>('/courses/', courseData);
    return response.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

/**
 * Update an existing course
 * @param {number|string} id - The course ID
 * @param {Partial<Course>} courseData - The updated course data
 * @returns {Promise<Course>} The updated course
 */
export const updateCourse = async (id: number | string, courseData: Partial<Course>): Promise<Course> => {
  try {
    const response = await api.put<Course>(`/courses/${id}/`, courseData);
    return response.data;
  } catch (error) {
    console.error(`Error updating course ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a course
 * @param {number|string} id - The course ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deleteCourse = async (id: number | string): Promise<boolean> => {
  try {
    await api.delete(`/courses/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting course ${id}:`, error);
    throw error;
  }
}; 