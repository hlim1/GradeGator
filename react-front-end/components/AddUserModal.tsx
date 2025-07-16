// components/AddUserModal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { apiFunctions } from '@/lib/api';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

export default function AddUserModal({ isOpen, onClose, courseId }: AddUserModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'instructor' | 'TA'>('instructor');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    console.log("Calling correct endpoint: /api/users/by-email");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`http://18.188.140.218:8000/api/users/by-email/?email=${email}`);
      if (!res.ok) {
        setError('User not found.');
        return;
      }

      const user = await res.json();
      await apiFunctions.addUserCourse(user.id, courseId, role);
      onClose(); // Auto-close modal
      setEmail('');
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User by Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div>
            <Label>Role</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'student' | 'instructor' | 'TA')}
              className="w-full p-2 border rounded"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="TA">TA</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button onClick={handleAddUser} disabled={loading}>
            {loading ? 'Adding...' : 'Add User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
