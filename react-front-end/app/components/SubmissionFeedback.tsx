import React from 'react';

interface RubricEntry {
  category: string;
  comment: string;
  points: number;
}

interface SubmittedFile {
  filename: string;
  code_text: string;
}

interface ParsedFeedback {
  [key: string]: any; // You can make this stricter if you know the structure
}

interface Props {
  rubric: RubricEntry[];
  parsedFeedback: ParsedFeedback | null;
  submittedFiles: SubmittedFile[];
  gradingResults: any;
}

export default function SubmissionFeedback({
  rubric,
  parsedFeedback,
  submittedFiles,
  gradingResults,
}: Props) {
  return (
    <div className="p-4 w-full overflow-auto">
      <h2 className="text-2xl font-bold mb-4">Grading Feedback</h2>

      {/* Score Summary */}
      {gradingResults?.score !== undefined && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Score</h3>
          <p>{gradingResults.score} / {gradingResults.max_score ?? '??'}</p>
        </div>
      )}

      {/* Rubric */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Rubric</h3>
        <ul className="list-disc ml-6">
          {rubric.map((entry, idx) => (
            <li key={idx}>
              <strong>{entry.category}</strong>: {entry.comment} ({entry.points} pts)
            </li>
          ))}
        </ul>
      </div>

      {/* Parsed Feedback (from stdout or test results) */}
      {parsedFeedback && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Parsed Feedback</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm">
            {JSON.stringify(parsedFeedback, null, 2)}
          </pre>
        </div>
      )}

      {/* Submitted Code */}
      <div>
        <h3 className="text-lg font-semibold">Submitted Files</h3>
        {submittedFiles.map((file, idx) => (
          <div key={idx} className="mb-4">
            <h4 className="font-semibold">{file.filename}</h4>
            <pre className="bg-gray-800 text-white p-2 rounded overflow-auto text-sm max-h-96">
              {file.code_text}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
