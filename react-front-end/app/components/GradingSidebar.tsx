'use client';
import React from 'react';

interface GradingSidebarProps {
  onClose: () => void;
}

export default function GradingSidebar({ onClose }: GradingSidebarProps) {
  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Grading Panel</h2>
        <button onClick={onClose} className="text-gray-600 hover:text-red-600">✖</button>
      </div>

      {/* Example content: You can pull in rubric, point input, comments, etc. */}
      <div>
        <p className="text-gray-600 mb-2">This is where grading controls go (e.g., question scores, comments).</p>
        {/* Dynamically render rubric items here if needed */}
      </div>
    </div>
  );
}
