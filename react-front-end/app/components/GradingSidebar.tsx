'use client';

import React from 'react';

interface RubricItem {
  add: boolean;
  subtract: boolean;
  points: number;
  description: string;
}

interface QuestionRubric {
  title: string;
  points: number;
  rubrics: RubricItem[];
}

interface GradingSidebarProps {
  rubric: QuestionRubric[];
  rubricSelections: Record<string, boolean>;
  onToggle: (key: string) => void;
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

      {rubric.map((question, qIndex) => (
        <div key={qIndex} className="mb-4">
          <h3 className="text-md font-semibold text-gray-700 mb-2">{question.title}</h3>
          {question.rubrics.map((item, rIndex) => {
            const uniqueKey = `${qIndex}-${rIndex}-${item.description}`;
            return (
              <label key={uniqueKey} className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={rubricSelections[uniqueKey] || false}
                  onChange={() => onToggle(uniqueKey)}
                />
                <span>{item.description}</span>
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
}
