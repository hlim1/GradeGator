'use client';

import React from 'react';

interface GradingSidebarProps {
  rubric: RubricEntry[];
  rubricSelections: Record<string, boolean>;
  onToggle: (item: string) => void;
}

export default function GradingSidebar({
  rubric,
  rubricSelections,
  onToggle,
}: GradingSidebarProps) {
  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Grading Panel</h2>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Rubric</h3>
        {rubric.map((item) => (
          <label key={item.description} className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={rubricSelections[item.description] || false}
              onChange={() => onToggle(item.description)}
            />
            <span>{item.description}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
