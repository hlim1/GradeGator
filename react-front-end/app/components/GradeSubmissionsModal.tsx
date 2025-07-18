import React, { useState, useEffect } from 'react';
import { apiFunctions } from '@/lib/api';
import Modal from './Modal'; // your reusable modal component

interface Rubric {
  id: number;
  description: string;
  points: number;
}

interface Question {
  id: number;
  title: string;
  rubrics: Rubric[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: number;
  gradeId: number;
  questions: Question[];
}

interface Props {
  onSubmit: (rubricStates: {
    [qIndex: number]: { [rIndex: number]: boolean };
  }) => Promise<void>;
}

const GradeAllModal: React.FC<Props> = ({ isOpen, onClose, assignmentId, gradeId, questions }) => {
  const [rubricStates, setRubricStates] = useState<{
    [qIndex: number]: {
      [rIndex: number]: boolean;
    };
  }>({});

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      const initialState: typeof rubricStates = {};
      questions.forEach((question, qIndex) => {
        initialState[qIndex] = {};
        question.rubrics.forEach((_, rIndex) => {
          initialState[qIndex][rIndex] = false;
        });
      });
      setRubricStates(initialState);
    }
  }, [isOpen, questions]);

  const toggleRubricAward = (qIndex: number, rIndex: number) => {
    setRubricStates(prev => ({
      ...prev,
      [qIndex]: {
        ...prev[qIndex],
        [rIndex]: !prev[qIndex]?.[rIndex],
      },
    }));
  };

  const handleSubmit = async () => {
    const question_scores = questions.map((question, qIndex) => {
      const selectedRubricIds = question.rubrics
        .map((rubric, rIndex) => (rubricStates[qIndex]?.[rIndex] ? rubric.id : null))
        .filter((id): id is number => id !== null);

      return {
        question: question.id,
        rubric_scores: selectedRubricIds,
      };
    });

    try {
      await apiFunctions.updateManualFeedbackScores(gradeId, { question_scores });
      onClose();
    } catch (error) {
      console.error('Error submitting grades:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Grade All Questions">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {questions.map((question, qIndex) => (
          <div key={question.id}>
            <h3 className="font-bold text-lg mb-2">{question.title}</h3>
            {question.rubrics.map((rubric, rIndex) => (
              <label key={rubric.id} className="flex items-center justify-between px-4 py-2 border rounded mb-2">
                <span>{rubric.description} ({rubric.points} pts)</span>
                <input
                  type="checkbox"
                  checked={rubricStates[qIndex]?.[rIndex] || false}
                  onChange={() => toggleRubricAward(qIndex, rIndex)}
                />
              </label>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Grades
        </button>
      </div>
    </Modal>
  );
};

export default GradeAllModal;