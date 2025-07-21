'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    const fetchData = async () => {
      if (!currentSubmission) return;

      // Step 2: Get the full assignment object
      const res = await apiFunctions.getAssignment(assignmentId);
      setAssignment(res);

      const grade = await apiFunctions.getGradingResults(currentSubmission.id);
      setGradingResults(grade);

      if (res?.assignment) {
        // Extract rubric from assignment.questions
        const questionRubrics = res.assignment.questions.flatMap((q: any) =>
          (q.rubric ?? []).map((r: any) => ({
            title: q.title,
            points: r.points,
            rubrics: r.rubrics
          }))
        );
        setRubric(questionRubrics);
      }

      if (grade?.feedback) {
        try {
          const outer = JSON.parse(grade.feedback);
          setParsedFeedback(outer?.output ?? outer); // fallback if there's no output
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

    fetchData();
  }, [assignmentId, currentSubmission]);

  useEffect(() => {
    async function fetchData() {
      const subs = await apiFunctions.getSubmissions(assignmentId);
      const assign = await apiFunctions.getAssignment(assignmentId);

      setSubmissionQueue(subs);
      if (subs.length > 0) {
        setCurrentSubmission(subs[0]);
      }


      setAssignment(assign);
    }
    fetchData();
  }, [assignmentId]);

  function handleNextSubmission() {
    const newQueue = [...submissionQueue];
    newQueue.shift(); // remove current
    const next = newQueue[0] || null;

    setSubmissionQueue(newQueue);
    setCurrentSubmission(next);

    // Clear rubric selections for next student
    setRubricSelections({});
  }

  function computeManualGrade(): number {
    const totalPoints = Object.values(rubricSelections).filter(v => v).length;
    return totalPoints;
  }

  if (!assignment) return <div>Loading...</div>;

  return (
    <div className="flex">
      {currentSubmission ? (
        <div>
          <h2>Grading: {currentSubmission.student_detail?.name}</h2>
          <SubmissionFeedback
            rubric={rubric}
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
