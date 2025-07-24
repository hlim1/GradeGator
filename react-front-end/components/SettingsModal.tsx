'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { apiFunctions } from "@/lib/api";

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user_data");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setName(parsed.username || "");
      setPreferredName(parsed.preferred_name || "");
    }
  }, [open]);

  const handleSaveChanges = async () => {
    setError(null);
    setSuccess(false);

    if (newPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userId = JSON.parse(localStorage.getItem("user_data") || "{}").id;
      const payload: any = {
        name,
        preferred_name: preferredName,
      };

      if (newPassword) {
        payload.password = newPassword;
      }

      const response = await apiFunctions.updateUserSettings(userId, payload);
      sessionStorage.setItem("userData", JSON.stringify(response.user));
      localStorage.setItem("user_data", JSON.stringify(response.user));
      setSuccess(true);
    } catch (err: any) {
      console.error("Failed to update settings", err);
      setError("Failed to update settings.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Account Settings</DialogTitle>
        </DialogHeader>

        {/* Name Section */}
        <div className="space-y-2">
          <Label className="text-sm">Update Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Preferred Name Section */}
        <div className="space-y-2">
          <Label className="text-sm">Update Preferred Name</Label>
          <Input value={preferredName} onChange={(e) => setPreferredName(e.target.value)} />
        </div>

        {/* Password Section */}
        <div className="space-y-2">
          <Label className="text-sm">Update Password</Label>
          <Input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
          />
          <Input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
          />
          <button
            type="button"
            className="text-xs text-gray-500 mt-1 hover:underline"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide Passwords" : "Show Passwords"}
          </button>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Changes saved successfully!</div>}

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSaveChanges}
            className="bg-black text-white hover:bg-gray-800 px-4 py-2"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
