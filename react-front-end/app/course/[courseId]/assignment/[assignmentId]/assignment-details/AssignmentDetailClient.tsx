'use client';

import { Assignment } from '@/lib/api';
import AssignmentView from '@/app/components/assignment/AssignmentView';

interface Props {
  assignment: Assignment;
}

export default function AssignmentDetailClient({ assignment }: Props) {
  return <AssignmentView assignment={assignment} />;
}
