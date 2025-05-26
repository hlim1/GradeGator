import api from './api';

/**
 * Fetch all courses
 * @returns {Promise<Array>} An array of course objects
 */
export const getCourses = async () => {
  try {
    const response = await api.get('/courses/');
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
 * @returns {Promise<Object>} The course data
 */
export const getCourse = async (id) => {
  try {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new course
 * @param {Object} courseData - The course data to create
 * @returns {Promise<Object>} The created course
 */
export const createCourse = async (courseData) => {
  try {
    const response = await api.post('/courses/', courseData);
    return response.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

/**
 * Update an existing course
 * @param {number|string} id - The course ID
 * @param {Object} courseData - The updated course data
 * @returns {Promise<Object>} The updated course
 */
export const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(`/courses/${id}/`, courseData);
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
export const deleteCourse = async (id) => {
  try {
    await api.delete(`/courses/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error deleting course ${id}:`, error);
    throw error;
  }
};