'use client'

import { use } from 'react';
import GradingPageClient from './GradingPageClient';

export default function GradingPage({ params }: { params: Promise<{ courseId: string; assignmentId: string }> }) {
  const resolvedParams = use(params);  // unwrap the params promise
  console.log('Received params:', resolvedParams);
  const { assignmentId } = resolvedParams;

  return <GradingPageClient assignmentId={assignmentId} />;
}
