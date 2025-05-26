'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireStaff?: boolean;
  requireInstructor?: boolean;
  requireStudent?: boolean;
}

export default function ProtectedRoute({
  children,
  requireStaff = false,
  requireInstructor = false,
  requireStudent = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, isStaff, isInstructor, isStudent } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (requireStaff && !isStaff) {
        router.push('/unauthorized');
        return;
      }

      if (requireInstructor && !isInstructor) {
        router.push('/unauthorized');
        return;
      }

      if (requireStudent && !isStudent) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isLoading, isAuthenticated, isStaff, isInstructor, isStudent, router, requireStaff, requireInstructor, requireStudent]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 