"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFunctions } from '@/lib/api';

const NextPage: React.FC = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instructorId, setInstructorId] = useState<number | null>(null);

  // Load assignment data and instructor ID from sessionStorage
  useEffect(() => {
    const storedData = sessionStorage.getItem("assignmentData");
    const storedInstructorId = sessionStorage.getItem("instructorId");
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setAssignmentData(parsedData);
      console.log("Loaded assignment data:", parsedData); // Debug log
    }
    
    if (storedInstructorId) {
      setInstructorId(parseInt(storedInstructorId, 10));
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // Validate file type
      if (!file.name.endsWith('.zip')) {
        setErrorMessage("Please select a ZIP file.");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size exceeds 10MB limit.");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a file before uploading.");
      return;
    }

    if (!instructorId) {
      setErrorMessage("Instructor ID not found. Please try logging in again.");
      return;
    }

    if (!assignmentData?.assignmentId) {
      setErrorMessage("Assignment ID not found. Please try creating the assignment first.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    
    try {
      const formData = new FormData();
      // Make sure to use exact field names from the schema
      formData.append('rubric_file', selectedFile);
      formData.append('instructor', instructorId.toString());
      formData.append('assignment', assignmentData.assignmentId.toString());

      // Log the form data for debugging
      console.log("Form data entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await apiFunctions.uploadRubric(formData);
      console.log("Upload response:", response);
      
      // Navigate back to the course page on success
      if (assignmentData.courseId) {
        router.push(`/course/${assignmentData.courseId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Error uploading rubric:", error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.error || 
                         "Failed to upload rubric. Please try again.";
      setErrorMessage(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Upload Rubric</h1>
      <p className="mb-4">Upload a grading rubric associated with this assignment.</p>

      <div className="mb-4">
        <input
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 border rounded-lg cursor-pointer"
          disabled={isUploading}
        />
        <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}

      {selectedFile && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">Selected file: {selectedFile.name}</p>
          <p className="text-sm text-green-600">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      {isUploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1 text-center">
            {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => router.back()}
          className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          disabled={isUploading}
        >
          Back
        </button>

        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Rubric'}
        </button>
      </div>
    </div>
  );
};

export default NextPage;

