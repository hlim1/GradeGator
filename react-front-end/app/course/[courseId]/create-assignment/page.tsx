"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFunctions } from "@/lib/api";

const CreateAssignment = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId; // Get courseId from route parameter
  
  const [assignmentName, setAssignmentName] = useState("");
  const [autoGraderPoints, setAutoGraderPoints] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lateDueDate, setLateDueDate] = useState("");
  const [enableAnonymous, setEnableAnonymous] = useState(false);
  const [enableManual, setEnableManual] = useState(false);
  const [allowLateSubmissions, setAllowLateSubmissions] = useState(false);
  const [enableGroup, setEnableGroup] = useState(false);
  const [rubric, setRubric] = useState<{ description: string; points: string }[]>([]);

  const addRubricItem = () => {
    setRubric([...rubric, { description: "", points: "" }]);
  };

  const updateRubricItem = (index: number, field: "description" | "points", value: string) => {
    const updatedRubric = rubric.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setRubric(updatedRubric);
  };

  const removeRubricItem = (index: number) => {
    setRubric(rubric.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    // Validate required fields
    if (!assignmentName.trim()) {
      alert("Please enter an assignment name");
      return;
    }
    if (!autoGraderPoints) {
      alert("Please enter autograder points");
      return;
    }
    if (!releaseDate) {
      alert("Please enter a release date");
      return;
    }
    if (!dueDate) {
      alert("Please enter a due date");
      return;
    }

    try {
      // Create a shorter unique assignment ID
      const shortId = Date.now().toString(36).slice(-6); // Convert timestamp to base36 and take last 6 chars
      
      // Create the assignment object according to the API schema
      const assignmentData = {
        assignment_id: `a${courseId}-${shortId}`,
        name: assignmentName,
        title: assignmentName,
        description: "Assignment created via web interface",
        questions: "No questions provided",
        grade_method: "POINTS" as const,
        scoring_breakdown: autoGraderPoints.toString(),
        timing: new Date(releaseDate).toISOString(),
        points: parseInt(autoGraderPoints, 10),
        due_date: new Date(dueDate).toISOString(),
        release_date: new Date(releaseDate).toISOString().split('T')[0], // Format as YYYY-MM-DD
        is_visible_to_students: true,
        is_manually_graded: enableManual,
        course: parseInt(courseId as string, 10)
      };

      // Log the data being sent in a readable format
      console.log("Sending assignment data:", JSON.stringify(assignmentData, null, 2));

      // Save to backend
      const savedAssignment = await apiFunctions.createAssignment(assignmentData);
      console.log("Assignment created:", savedAssignment);

      // Store additional data in sessionStorage for the autograder configuration
      const configData = {
        assignmentName,
        autoGraderPoints,
        releaseDate,
        dueDate,
        lateDueDate,
        enableAnonymous,
        enableManual,
        allowLateSubmissions,
        enableGroup,
        rubric,
        courseId,
        assignmentId: savedAssignment.id
      };
      
      sessionStorage.setItem("assignmentData", JSON.stringify(configData));
      router.push(`/course/${courseId}/configure-autograder`);
    } catch (error: any) {
      console.error("Error creating assignment:", error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        // Show detailed error message from server if available
        const errorMessage = error.response.data?.detail || 
                           Object.entries(error.response.data || {}).map(([key, value]) => 
                             `${key}: ${value}`
                           ).join('\n');
        
        alert(`Failed to create assignment:\n${errorMessage}`);
      } else if (error.request) {
        console.error("Error request:", error.request);
        alert("Network error - no response received from server");
      } else {
        console.error("Error message:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Create Assignment</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Assignment Name *</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="Name your assignment"
            value={assignmentName}
            onChange={(e) => setAssignmentName(e.target.value)}
          />
        </div>

        <div>
          <input
            type="checkbox"
            checked={enableAnonymous}
            onChange={() => setEnableAnonymous(!enableAnonymous)}
          />
          <label className="ml-2">Enable anonymous grading</label>
        </div>

        <div>
          <label className="block text-sm font-medium">Autograder Points *</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="e.g. 100"
            value={autoGraderPoints}
            onChange={(e) => setAutoGraderPoints(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Release Date *</label>
          <input
            type="datetime-local"
            className="w-full mt-1 p-2 border rounded-md"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Due Date *</label>
          <input
            type="datetime-local"
            className="w-full mt-1 p-2 border rounded-md"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div>
          <input
            type="checkbox"
            checked={allowLateSubmissions}
            onChange={() => setAllowLateSubmissions(!allowLateSubmissions)}
          />
          <label className="ml-2">Allow late submissions</label>
        </div>

        <div>
          <input
            type="checkbox"
            checked={enableManual}
            onChange={() => setEnableManual(!enableManual)}
          />
          <label className="ml-2">Enable manual grading</label>
        </div>

        {enableManual && (
          <div>
            <label className="block text-sm font-medium">Rubric</label>
            {rubric.map((item, index) => (
              <div key={index} className="flex space-x-2 mt-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateRubricItem(index, "description", e.target.value)}
                />
                <input
                  type="number"
                  className="w-24 p-2 border rounded-md"
                  placeholder="Points"
                  value={item.points}
                  onChange={(e) => updateRubricItem(index, "points", e.target.value)}
                />
                <button
                  onClick={() => removeRubricItem(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addRubricItem}
              className="mt-2 bg-green-600 text-white py-1 px-4 rounded-md hover:bg-green-700"
            >
              + Add Rubric Item
            </button>
          </div>
        )}

        <div>
          <input
            type="checkbox"
            checked={enableGroup}
            onChange={() => setEnableGroup(!enableGroup)}
          />
          <label className="ml-2">Enable group submission</label>
        </div>
      </div>

      <button 
        onClick={handleNext}
        className="mt-6 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
      >
        Next
      </button>
    </div>
  );
};

export default CreateAssignment;