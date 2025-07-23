'use client';

import { useEffect, useState } from 'react';
import { Submission, Assignment, apiFunctions } from '@/lib/api';
import SubmissionFeedback from '@/app/components/SubmissionFeedback';
import GradingSidebar from '@/app/components/GradingSidebar';

interface Props {
  assignmentId: string;
}

export default function GradingPageClient({ assignmentId }: Props) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [gradingResults, setGradingResults] = useState<any | null>(null);
  const [parsedFeedback, setParsedFeedback] = useState<ParsedFeedback | null>(null);
  const [rubric, setRubric] = useState<RubricEntry[]>([]);
  const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([]);
  const [submissionQueue, setSubmissionQueue] = useState<Submission[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null);
  const [rubricSelections, setRubricSelections] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. Initial load: get assignment and queue
  useEffect(() => {
    const fetchInitialData = async () => {
      const assign = await apiFunctions.getAssignment(assignmentId);
      setAssignment(assign);

      const subs = await apiFunctions.getSubmissions(assignmentId);

      if (subs.length > 0) {
        setCurrentIndex(0);
        setSubmissionQueue(subs);
      } else {
        setSubmissionQueue([]);
        setCurrentIndex(-1); // or something invalid to indicate no submissions
      }

      if (assign?.assignment) {
        const questionRubrics = assign.assignment.questions.flatMap((q: any) =>
          (q.rubric ?? []).map((r: any) => ({
            title: q.title,
            points: r.points,
            rubrics: r.rubrics
          }))
        );
        setRubric(questionRubrics);
      }
    };

    fetchInitialData();
  }, [assignmentId]);

  // 2. Whenever currentSubmission changes, fetch its grading info
  useEffect(() => {
    const fetchSubmissionData = async () => {
      if (!currentSubmission) {
        setGradingResults(null);
        setParsedFeedback(null);
        setSubmittedFiles([]);
        return;
      };

      const grade = await apiFunctions.getGradingResults(currentSubmission.id);
      setGradingResults(grade);

      if (grade?.feedback) {
        try {
          const outer = JSON.parse(grade.feedback);
          let parsed = null;

          if (typeof outer?.output === 'string') {
            try {
              // Try to find where the embedded JSON starts
              const startIndex = outer.output.indexOf('{');
              if (startIndex !== -1) {
                parsed = JSON.parse(outer.output.slice(startIndex));
              }
            } catch (e) {
              console.warn('Nested feedback parse failed', e);
            }
          }

          setParsedFeedback(parsed ?? outer);
        } catch (e) {
          console.warn('Failed to parse feedback', e);
          setParsedFeedback(null);
        }
      }

      if (grade?.submitted_files_json) {
        setSubmittedFiles(grade.submitted_files_json);
      } else if (grade?.submitted_code_text) {
        setSubmittedFiles([{ filename: 'Code.java', code_text: grade.submitted_code_text }]);
      } else {
        setSubmittedFiles([]);
      }
    };

    fetchSubmissionData();
  }, [currentSubmission]);

  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < submissionQueue.length) {
      setCurrentSubmission(submissionQueue[currentIndex]);
    } else {
      setCurrentSubmission(null);
    }
  }, [currentIndex, submissionQueue]);

  function handleNextSubmission() {
    setCurrentIndex((prev) => {
      if (prev + 1 < submissionQueue.length) {
        return prev + 1;
      } else {
        return prev; // don’t increment beyond last index
      }
    });
  }

  function computeManualGrade(): number {
    return Object.values(rubricSelections).filter(Boolean).length;
  }

  if (!assignment) return <div>Loading...</div>;

  return (
    <div className="flex">
      {currentSubmission ? (
        <div>
          <h2>Grading: {currentSubmission.student_detail?.name}</h2>
          <SubmissionFeedback
            parsedFeedback={parsedFeedback}
            submittedFiles={submittedFiles}
            gradingResults={gradingResults}
          />
          <GradingSidebar
            rubric={rubric}
            rubricSelections={rubricSelections}
            onToggle={(item) =>
              setRubricSelections(prev => ({
                ...prev,
                [item]: !prev[item]
              }))
            }
          />
          <button onClick={() => {
            const grade = computeManualGrade();
            console.log("Submitting grade", grade);
            handleNextSubmission();
          }}>
            Next Submission
          </button>
        </div>
      ) : (
        <h2>All submissions graded!</h2>
      )}
    </div>
  );
}
