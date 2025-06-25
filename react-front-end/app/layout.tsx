import './globals.css';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { UserProvider } from '@/app/contexts/UserContext';
import IdleLogoutWrapper from "@/app/components/IdleLogoutWrapper";

export const metadata = {
  title: 'Grade Gator',
  description: 'Dashboard for Instructors & Students',
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <UserProvider>
            <IdleLogoutWrapper />
            {children}
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
