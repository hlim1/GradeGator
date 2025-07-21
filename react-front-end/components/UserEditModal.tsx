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
  const [role, setRole] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPreferredName(user.preferred_name || '');
      setRole(user.role || '');
    }
  }, [user]);

  const handleRoleChange = async () => {
    try {
      console.log("Changing role for", user.user_id, "to", role);
      await apiFunctions.changeUserRole(courseId, user.user_id, role);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Role update failed:", err);
    }
  };

  const handleNameUpdate = async () => {
    try {
      console.log("Updating name for", user.user_id);
      await apiFunctions.updateCourseUserName(courseId, user.user_id, name, preferredName);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Name update failed:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user name or role in this course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Preferred Name</Label>
            <Input
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
            />
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
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleNameUpdate}>Update Name</Button>
          <Button onClick={handleRoleChange}>Update Role</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
