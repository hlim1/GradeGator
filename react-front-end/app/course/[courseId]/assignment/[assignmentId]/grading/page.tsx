import GradingPageClient from './GradingPageClient';

export default function GradingPage({ params }: { params: { courseId: string; assignmentId: string } }) {
  return <GradingPageClient assignmentId={params.assignmentId} />;
}
