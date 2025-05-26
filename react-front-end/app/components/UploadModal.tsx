"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFunctions } from '@/lib/api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentName: string;
  assignmentId: number;
  courseId: number;
}

export default function UploadModal({ isOpen, onClose, assignmentName, assignmentId, courseId }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // Safely access localStorage on the client side
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!userId) {
      setError('You must be logged in to submit an assignment. Please log in and try again.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create submission request
      const submissionRequest = {
        submission_file: selectedFile,
        student: parseInt(userId),
        assignment: assignmentId
      };

      // Submit the file
      const response = await apiFunctions.createSubmission(submissionRequest);
      console.log('Upload response:', response);
      
      onClose();
      router.push(`/course/${courseId}/submitted-autograder`);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      console.error('Error details:', error);
      
      let errorMessage = 'Failed to upload file. ';
      if (error.response?.data?.detail) {
        errorMessage += error.response.data.detail;
      } else if (error.response?.data) {
        // If there are field-specific errors
        const fieldErrors = Object.entries(error.response.data)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        errorMessage += fieldErrors;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Show a message if user is not logged in
  useEffect(() => {
    if (isOpen && !userId) {
      setError('Please log in to submit an assignment.');
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Assignment</h2>
        <p className="text-gray-600 mb-4">Uploading for: {assignmentName}</p>

        <div className="border-2 rounded-lg p-6 text-center">
          {selectedFile ? (
            <div className="mb-4">
              <p className="text-green-600">Selected file: {selectedFile.name}</p>
              <button 
                onClick={() => setSelectedFile(null)}
                className="text-sm text-red-500 hover:text-red-700 mt-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-gray-600">Select a file to upload</p>
              <p className="text-sm text-gray-500 mt-1">Supported formats: PDF, TXT, ZIP</p>
            </div>
          )}
          
          <input
            type="file"
            accept=".pdf,.txt,.zip"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading || !userId}
            className={`px-4 py-2 rounded-lg ${
              !selectedFile || uploading || !userId
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}