// Version control domain types

export type InstructionStatus = 'live' | 'review' | 'draft';
export type StatusFilter = 'all' | InstructionStatus;
export type VersionHistoryStatus = 'live' | 'ready-to-publish' | 'draft' | 'rejected';

/** Summary row on the main instruction list. */
export interface Instruction {
  id: string;
  title: string;
  version?: string;
  description?: string;
  author: string;
  updatedAt: string;
  status: InstructionStatus;
  authorInitials?: string;
}

/** One version row inside an instruction's history (live, draft, etc.). */
export interface VersionEntry {
  id: string;
  version: string;
  description: string;
  author: string;
  authorInitials: string;
  updatedAt: string;
  status: VersionHistoryStatus;
}

/** All versions for a single work instruction, grouped by status. */
export interface VersionHistory {
  totalVersions: number;
  entries: VersionEntry[];
  /** Older versions that can be opened in read-only preview. */
  archivedEntries: VersionEntry[];
}

/** In-memory app state for instructions and their version histories. */
export interface VersionsDataState {
  instructions: Instruction[];
  versionHistoryByInstruction: Record<string, VersionHistory>;
}

export type PreviewStepType = 'normal' | 'removed' | 'added' | 'visual';

/** A single step shown in the Review/Publish/Rejection preview panel. */
export interface PreviewStep {
  type: PreviewStepType;
  title: string;
  content: string;
  badge?: string;
}

/** Content for the Review workflow screen (includes reviewer checklist). */
export interface ReviewData {
  author: string;
  version: string;
  date: string;
  comment: string;
  checklist: string[];
  previewSteps: PreviewStep[];
}

/** Operator listed in the Publish screen "operator impact" section. */
export interface OperatorOnShift {
  id: string;
  name: string;
  initials: string;
  assignment: string;
}

/** Content for the Publish workflow screen. */
export interface PublishData {
  author: string;
  version: string;
  date: string;
  comment: string;
  previewSteps: PreviewStep[];
  operatorsOnShift: OperatorOnShift[];
}

/** Fields shown in the "Publish vX?" confirmation modal. */
export interface PublishConfirmDetails {
  publishingVersion: string;
  publisherName: string;
  replacingVersion: string;
  approvedBy: string;
  approvedDate: string;
  affectedOperators: string[];
}

/** Reviewer info shown on the Rejection screen feedback card. */
export interface RejectionFeedback {
  reviewerName: string;
  reviewerInitials: string;
  date: string;
  role: string;
  tags: string[];
  feedback: string;
}

/** Content for the Rejection workflow screen. */
export interface RejectionData {
  author: string;
  version: string;
  date: string;
  comment: string;
  previewSteps: PreviewStep[];
  rejectionFeedback: RejectionFeedback;
}

/** Values collected in the Reject modal before opening the Rejection screen. */
export interface RejectionSubmission {
  reasons: string[];
  additionalDetails: string;
  notifyAuthor: boolean;
}
