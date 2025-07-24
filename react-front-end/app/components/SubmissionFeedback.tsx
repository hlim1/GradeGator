import React from 'react';

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
  parsedFeedback: ParsedFeedback | null;
  submittedFiles: SubmittedFile[];
  gradingResults: {
    score?: number;
    max_score?: number;
  } | null;
}

export default function SubmissionFeedback({
  parsedFeedback,
  submittedFiles,
  gradingResults,
}: Props) {
  const totalEarned = gradingResults?.score ?? 0;
  const totalMax = gradingResults?.max_score ?? 0;

  return (
    <div className="mb-4 border rounded-lg p-4 w-full overflow-auto">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Autograder Results</h2>
      {parsedFeedback?.testResults?.length ? (
        <>
          <div className="text-right font-semibold mb-2">Score</div>
          {parsedFeedback.testResults.map((test, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-800 mb-2">
              <div>
                <span className={test.passed ? 'flex flex-col text-green-700' : 'text-red-700'}>
                  <div>
                    <strong>{test.testName}</strong> {test.passed ? '✔️' : '❌'}
                  </div>
                  {test.input ? `with ${test.input}` : ''} → {test.actualOutput ?? '?'} (expected: {test.expectedOutput ?? '?'})
                </span>
              </div>
            </div>
          ))}
          <div className="mt-4 font-semibold text-right">
            Total: {totalEarned} / {totalMax}
          </div>
        </>
      ) : (
        <p className="text-gray-600 italic">No autograder results available.</p>
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
