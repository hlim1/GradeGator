import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Base URL for all API requests
const API_URL = 'http://localhost:8000/api';

// Create axios instance with credentials support
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is crucial for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

// Function to get access token safely
// const getAccessToken = () => {
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem('access_token');
//   }
//   return null;
// };

// Function to get CSRF token from cookie
function getCsrfToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const tokenCookieName = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === tokenCookieName) {
      return value;
    }
  }
  return null;
}

// Add request interceptor to include CSRF token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add CSRF token for mutations
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('CSRF token validation failed');
    }
    return Promise.reject(error);
  }
);

// Type definitions matching API schema
export interface Course {
  id: number;
  name: string;
  number: string;
  term: string;
  section: string;
  department: string;
  created_at: string;
  updated_at: string;
}

export interface CourseRequest {
  name: string;
  number: string;
  term: string;
  section: string;
  department: string;
}

export interface AuthStatus {
  is_authenticated: boolean;
  message?: string;
}

export interface Assignment {
  id: number;
  assignment_id: string;
  name: string;
  grade_method: 'POINTS';
  points: number;
  due_date: string;
  release_date: string;
  is_visible_to_students: boolean;
  created_at: string;
  updated_at: string;
  is_manually_graded: boolean;
  course: number;
}

export interface Submission {
  id: number;
  submission_file: string;
  student: number;
  assignment: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_student: boolean;
  is_instructor: boolean;
  student_id: string;
  instructor_id: string;
  preferred_name: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  username: string;
  first_name: string;
  last_name: string;
  preferred_name: string;
  is_student: boolean;
  is_instructor: boolean;
}

export interface Submission {
  id: number;
  submission_time: string;
  submission_file: string;
  student: number;
  assignment: number;
}

export interface SubmissionRequest {
  submission_file: File;
  student: number;
  assignment: number;
}

export interface LoginRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    username: string;
    email: string;
    is_student: boolean;
    is_instructor: boolean;
    student_id: string;
    instructor_id: string;
    preferred_name: string;
  };
  error?: [];
}

// API functions
export const apiFunctions = {
  // Check authentication status
  checkAuthStatus: async (): Promise<AuthStatus> => {
    const response = await api.get<AuthStatus>('/auth-status/');
    return response.data;
  },

  // Get all courses
  getCourses: async (): Promise<Course[]> => {
    const response = await api.get<Course[]>('/courses/');
    return response.data;
  },

  // Get a specific course
  getCourse: async (id: number): Promise<Course> => {
    const response = await api.get<Course>(`/courses/${id}/`);
    return response.data;
  },

  // Create a new course
  createCourse: async (courseData: CourseRequest): Promise<Course> => {
    const response = await api.post<Course>('/courses/', courseData);
    return response.data;
  },

  // Update a course
  updateCourse: async (id: number, courseData: Partial<CourseRequest>): Promise<Course> => {
    const response = await api.patch<Course>(`/courses/${id}/`, courseData);
    return response.data;
  },

  // Delete a course
  deleteCourse: async (id: number): Promise<void> => {
    await api.delete(`/courses/${id}/`);
  },

  // Assignment functions
  getAssignments: async (): Promise<Assignment[]> => {
    const response = await api.get<Assignment[]>('/assignments/');
    return response.data;
  },

  getAssignment: async (id: number): Promise<Assignment> => {
    const response = await api.get<Assignment>(`/assignments/${id}/`);
    return response.data;
  },

  createAssignment: async (assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Promise<Assignment> => {
    const response = await api.post<Assignment>('/assignments/', assignment);
    return response.data;
  },

  updateAssignment: async (id: number, assignment: Partial<Assignment>): Promise<Assignment> => {
    const response = await api.patch<Assignment>(`/assignments/${id}/`, assignment);
    return response.data;
  },

  deleteAssignment: async (id: number): Promise<void> => {
    await api.delete(`/assignments/${id}/`);
  },

  // Get assignments for a specific course
  getCourseAssignments: async (courseId: number): Promise<Assignment[]> => {
    const response = await api.get<Assignment[]>('/assignments/', {
      params: {
        course: courseId
      }
    });
    return response.data.filter(assignment => assignment.course === courseId);
  },

  // Get submissions
  getSubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<Submission[]>('/submissions/');
    return response.data;
  },

  // Get submissions for a specific assignment
  getAssignmentSubmissions: async (assignmentId: number): Promise<Submission[]> => {
    const response = await api.get<Submission[]>('/submissions/', {
      params: {
        assignment: assignmentId
      }
    });
    return response.data.filter(submission => submission.assignment === assignmentId);
  },

  // Get student details
  getStudentDetails: async (studentId: number): Promise<any> => {
    const response = await api.get(`/students/${studentId}/`);
    return response.data;
  },

  // Create a new submission
  createSubmission: async (data: SubmissionRequest): Promise<Submission> => {
    const formData = new FormData();
    formData.append('submission_file', data.submission_file);
    formData.append('student', data.student.toString());
    formData.append('assignment', data.assignment.toString());

    try {
      const response = await api.post<Submission>('/submissions/', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });
      return response.data;
    } catch (error) {
      console.error('Submission error:', error);
      throw error;
    }
  },

  // Upload submission file
  uploadSubmission: async (submissionData: { 
    submission_file: File,
    student: number,
    assignment: number 
  }): Promise<Submission> => {
    const formData = new FormData();
    formData.append('submission_file', submissionData.submission_file);
    formData.append('student', submissionData.student.toString());
    formData.append('assignment', submissionData.assignment.toString());

    const response = await api.post<Submission>('/upload/submission/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload rubric file
  uploadRubric: async (formData: FormData): Promise<any> => {
    // Don't set Content-Type header - let the browser set it with boundary
    const response = await api.post('/upload/rubric/', formData);
    return response.data;
  },

  // Register a new user
  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/register/', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: Partial<LoginRequest>): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login/', credentials);
    
    if (response.data.success && response.data.user) {
      // Store user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  },
};

export default api; 