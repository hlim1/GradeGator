import { apiFunctions } from '@/lib/api';
import AssignmentDetailClient from './AssignmentDetailClient';

interface PageProps {
  params: { assignmentId: string };
}

export default async function AssignmentDetailPage({ params }: PageProps) {
  const { assignmentId } = await Promise.resolve(params);
  const assignment = await apiFunctions.getAssignment(assignmentId);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AssignmentDetailClient assignment={assignment} />
    </div>
  );
}
