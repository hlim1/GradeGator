'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState, useEffect } from "react";
import { apiFunctions } from "@/lib/api";

export default function UserEditModal({
  user,
  courseId,
  isOpen,
  onClose,
}: {
  user: any;
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPreferredName(user.preferred_name || '');
      setEmail(user.email || '');
      setRole(user.role || '');
    }
  }, [user]);

  const handleRoleChange = async () => {
    try {
      const apiRole = role === 'TA' ? 'instructor' : role;
      console.log("Changing role for", user.user, "to", apiRole);
      await apiFunctions.changeUserRole(courseId, user.user, apiRole);
      alert('Role updated');
    } catch (err) {
      console.error(err);
      alert('Failed to update role');
    }
  };

  const handleSave = async () => {
    await handleRoleChange();
    onClose();
    window.location.reload(); // Re-fetch roster data
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user details and role in this course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Preferred Name</Label>
            <Input value={preferredName} onChange={(e) => setPreferredName(e.target.value)} />
          </div>

          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <Label>Role</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded px-3 py-2"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="TA">TA</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
