import React from 'react';

interface RubricItem {
  description: string;
  points: number;
  add: boolean;
  subtract: boolean;
}

interface Question {
  title: string;
  points: number;
  rubrics?: RubricItem[];
}

interface QuestionScore {
  score: number;
  rubrics?: {
    [rubricIndex: string]: {
      awarded: boolean;
    };
  };
}

interface RubricEntry {
  name: string;
  max_score: number;
}

interface TestResult {
  testName: string;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
}

interface SubmittedFile {
  filename: string;
  code_text: string;
}

interface ParsedFeedback {
  testResults?: TestResult[];
}

interface Props {
  rubric: RubricEntry[];
  parsedFeedback: ParsedFeedback | null;
  submittedFiles: SubmittedFile[];
  gradingResults: {
    score?: number;
    max_score?: number;
    question_scores?: Record<string, QuestionScore>;
  } | null;
  assignment?: {
    is_manually_graded?: boolean;
    questions?: Question[];
  };
}

export default function SubmissionFeedback({
  rubric,
  parsedFeedback,
  submittedFiles,
  gradingResults,
  assignment,
}: Props) {
  const totalEarned = rubric.reduce((sum, entry, i) => {
    const test = parsedFeedback?.testResults?.[i];
    return test?.passed ? sum + entry.max_score : sum;
  }, 0);

  const totalMax = rubric.reduce((sum, entry) => sum + entry.max_score, 0);

  return (
    <div className="mb-4 border rounded-lg p-4 w-full overflow-auto">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Autograder Results</h2>

      {rubric.length > 0 ? (
        <>
          <div className="text-right font-semibold mb-2">Score</div>
          {rubric.map((entry, i) => {
            const test = parsedFeedback?.testResults?.[i];
            const earned = test?.passed ? entry.max_score : 0;
            return (
              <div key={i} className="flex justify-between text-sm text-gray-800 mb-2">
                <div>
                  <span className={test?.passed ? 'flex flex-col text-green-700' : 'text-red-700'}>
                    <div>
                      <strong>{test?.testName ?? entry.name}</strong>{' '}
                      {test?.passed ? '✔️' : '❌'}
                    </div>
                    {test?.input ? `with ${test.input}` : ''} → {test?.actualOutput ?? '?'} (expected: {test?.expectedOutput ?? '?'})
                  </span>
                </div>
                <div className="ml-8 font-medium">
                  {earned} / {entry.max_score}
                </div>
              </div>
            );
          })}
          <div className="mt-4 font-semibold text-right">
            Total: {gradingResults?.score ?? totalEarned} / {gradingResults?.max_score ?? totalMax}
          </div>
        </>
      ) : (
        <p className="text-gray-600 italic">No autograder results available.</p>
      )}

      {/* Manual Rubric Section */}
      {assignment?.is_manually_graded && assignment.questions?.length ? (
        <div className="mt-6 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Manual Feedback</h2>
          {assignment.questions.map((question, index) => {
            const questionGrade = gradingResults?.question_scores?.[index.toString()];
            return (
              <div key={index} className="mb-4">
                <p className="font-medium text-gray-800">
                  {question.title} - [{question.points} pts]
                </p>

                {questionGrade?.score !== undefined && (
                  <p className="ml-2 text-sm text-blue-600">
                    Score Given: {questionGrade.score} / {question.points}
                  </p>
                )}

                {question.rubrics?.map((rubric, i) => {
                  const rubricGrade = questionGrade?.rubrics?.[i.toString()];
                  const isAwarded = rubricGrade?.awarded;

                  return (
                    <div
                      key={i}
                      className={`ml-4 text-sm ${
                        isAwarded === true
                          ? 'text-green-700 font-semibold'
                          : isAwarded === false
                          ? 'text-red-500 line-through'
                          : 'text-gray-600'
                      }`}
                    >
                      • {rubric.description} ({rubric.points} pts)
                      {rubric.add && ' [+]'}
                      {rubric.subtract && ' [-]'}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 text-sm text-gray-500 italic">No manual feedback available.</div>
      )}

      {/* Submitted Code Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Submitted Files</h3>
        {submittedFiles.length > 0 ? (
          submittedFiles.map((file, idx) => (
            <div key={idx} className="mb-4">
              <h4 className="font-semibold">{file.filename}</h4>
              <pre className="bg-gray-800 text-white p-2 rounded overflow-auto text-sm max-h-96 whitespace-pre-wrap">
                {file.code_text}
              </pre>
            </div>
          ))
        ) : (
          <p className="text-gray-600 italic">No submitted files available.</p>
        )}
      </div>
    </div>
  );
}
