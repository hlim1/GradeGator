import api from './api';

// Match the API schema for User
export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  student: {
    id: number;
    student_id: string;
    name: string;
    preferred_name?: string;
    accommodations?: string;
    courses: number[];
  } | null;
  instructor: {
    id: number;
    instructor_id: string;
    name: string;
    preferred_name?: string;
    department: string;
    courses: number[];
  } | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

class AuthenticationError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = status;
  }
}

export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    await api.post('/api-auth/login/', credentials);
    
    // If login successful, get user data
    const response = await api.get<User>('/current-user/');
    return response.data;
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { data?: { detail?: string }, status?: number } };
      throw new AuthenticationError(
        apiError.response?.data?.detail || 'Invalid credentials',
        apiError.response?.status
      );
    }
    throw new AuthenticationError('Network error occurred while logging in');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/api-auth/logout/');
  } catch {
    throw new AuthenticationError('Error occurred while logging out');
  }
};

// export const getCurrentUser = async (): Promise<User | null> => {
//   try {
//     // const response = await api.get<User>('/current-user/');
//     return response.data;
//   } catch (error: unknown) {
//     if (error && typeof error === 'object' && 'response' in error) {
//       const apiError = error as { response?: { status?: number } };
//       if (apiError.response?.status === 401) {
//         return null; // Not authenticated
//       }
//     }
//     throw new AuthenticationError('Error fetching current user');
//   }
// };

// Check if the user is authenticated and is staff
// export const isAuthenticatedStaff = async (): Promise<boolean> => {
//   try {
//     const user = await getCurrentUser();
//     return user !== null && user.is_staff;
//   } catch {
//     return false;
//   }
// };

// // Check if user has instructor role
// export const isInstructor = async (): Promise<boolean> => {
//   try {
//     const user = await getCurrentUser();
//     return user !== null && user.instructor !== null;
//   } catch {
//     return false;
//   }
// };

// // Check if user has student role
// export const isStudent = async (): Promise<boolean> => {
//   try {
//     const user = await getCurrentUser();
//     return user !== null && user.student !== null;
//   } catch {
//     return false;
//   }
// }; 