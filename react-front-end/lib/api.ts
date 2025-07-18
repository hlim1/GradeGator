import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://18.188.140.218:8000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

function getCsrfToken(): string | null {
  if (typeof window === 'undefined') return null;
  const tokenCookieName = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === tokenCookieName) return value;
  }
  return null;
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken) config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('CSRF token validation failed');
    }
    return Promise.reject(error);
  }
);

// TYPES

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

export interface User {
  id: number;
  username: string;
  email: string;
  preferred_name: string;
  student_profile?: {
    id: number;
    student_id: string;
    name: string;
    preferred_name: string;
  } | null;
  instructor_profile?: {
    id: number;
    instructor_id: string;
    name: string;
    preferred_name: string;
    department: string;
  } | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  preferred_name?: string;
}

export interface Submission {
  id: number;
  submission_time: string;
  submission_file: string;
  student: number;
  assignment: number;
}

interface Grading {
  id: number;
  score: number | null;
  feedback: string | null;
  grading_time: string;
  is_finalized: boolean;
  submission: number;
  graded_by: number | null;
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
  user?: User;
  error?: [];
}

// API FUNCTIONS

export const apiFunctions = {
  checkAuthStatus: async (): Promise<AuthStatus> => {
    const response = await api.get<AuthStatus>('/auth-status/');
    return response.data;
  },

  getCourses: async (): Promise<Course[]> => {
    const response = await api.get<Course[]>('/courses/');
    return response.data;
  },

  getCoursesByUserId: async (userId: number): Promise<Course[]> => {
    const response = await api.get<Course[]>(`/courses/by_user/?user_id=${userId}`);
    return response.data;
  },

  getCourse: async (id: number): Promise<Course> => {
    const response = await api.get<Course>(`/courses/${id}/`);
    return response.data;
  },

  createCourse: async (courseData: CourseRequest): Promise<Course> => {
    const response = await api.post<Course>('/courses/', courseData);
    return response.data;
  },

  checkCourse: async (courseCode: string): Promise<Course> => {
    const response = await api.get<Course>('/courses/by-code/', {
      params: { code: courseCode }
    });
    return response.data;
  },

  updateCourse: async (id: number, courseData: Partial<CourseRequest>): Promise<Course> => {
    const response = await api.patch<Course>(`/courses/${id}/`, courseData);
    return response.data;
  },

  addUserCourse: async (userId: number, courseId: number, role: string): Promise<any> => {
    const response = await api.post(`/courses/${courseId}/add_user/`, {
      user_id: userId,
      role: role
    });
    return response.data;
  },

  deleteCourse: async (id: number): Promise<void> => {
    await api.delete(`/courses/${id}/`);
  },

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

  getCourseAssignments: async (courseId: number): Promise<Assignment[]> => {
    const response = await api.get<Assignment[]>('/assignments/', {
      params: {
        course: courseId
      }
    });
    return response.data.filter(assignment => assignment.course === courseId);
  },

  updateManualFeedbackScores: async (gradeId: number, data: any) => {
    const response = await api.patch(`/api/grades/${gradeId}/update_scores/`, {
      params: {
        question_scores: data
      }
    });
  },

  getSubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<Submission[]>('/submissions/');
    return response.data;
  },

  updateAssignmentOutline: async (id: number, data: { outline: Question[] }): Promise<Assignment> => {
    const response = await api.post<Assignment>(`/assignments/${id}/outline/`, data);
    return response.data;
  },

  getAssignmentSubmissions: async (assignmentId: number): Promise<Submission[]> => {
    const response = await api.get<Submission[]>('/submissions/', {
      params: {
        assignment: assignmentId
      }
    });
    return response.data;
  },

  getGradingResults: async (submissionId: number): Promise<Grading> => {
    const response = await api.get<Grading>('/grades/', {
      params: {
        submission: submissionId
      }
    });
    return response.data;
  },

  getSubmissionId: async (assignmentId: number, studentId: number): Promise<Submission> => {
    const response = await api.get<Submission>('/submissions/', {
      params: {
        assignment: assignmentId,
        student: studentId,
      }
    });
    return response.data.id;
  },

  getStudentDetails: async (studentId: number): Promise<any> => {
    const response = await api.get(`/students/${studentId}/`);
    return response.data;
  },

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

  uploadSubmission: async (submissionData: {
    submission_file: File,
    student: number,
    assignment: number
  }): Promise<Submission> => {
    const formData = new FormData();
    formData.append('files', submissionData.submission_file);
    formData.append('student', submissionData.student.toString());
    formData.append('assignment', submissionData.assignment.toString());
    const response = await api.post<Submission>('/upload/submission/', formData);
    return response.data;
  },

  uploadRubric: async (formData: FormData): Promise<any> => {
    const response = await api.post('/upload/rubric/', formData);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/register/', userData);
    return response.data;
  },

  login: async (credentials: Partial<LoginRequest>): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login/', credentials);

    if (response.data.success && response.data.user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
    }

    return response.data;
  },

  getCourseRoster: async (courseId: number): Promise<{ students: any[]; instructors: any[] }> => {
    const response = await api.get(`/courses/${courseId}/roster/`);
    return response.data;
  },

  changeUserRole: async (courseId: string, userId: number, requestedRole: string) => {
    const res = await api.post(`/courses/${courseId}/change-role/`, {
      user_id: userId,
      requested_role: requestedRole,
    });
    return res.data;
  },

  getInstructorDetails: async (instructorId: number): Promise<any> => {
    const response = await api.get(`/instructors/${instructorId}/`);
    return response.data;
  },
};
export default api;
