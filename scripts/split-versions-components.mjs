import fs from 'fs';
import path from 'path';

const src = fs.readFileSync('src/components/Versions.tsx', 'utf8');
const lines = src.split('\n');

function slice(start, end) {
  return lines.slice(start - 1, end).join('\n');
}

const root = 'src/versions/components';

const componentFiles = [
  {
    file: 'ActionToast.tsx',
    start: 1,
    end: 190,
    extraImports: `import React from 'react';\nimport { CircleCheck, MessageCircle, X } from 'lucide-react';\nimport type { ActionToastVariant } from '../types';\n\n`,
    stripUntil: '// --- Toast notification ---',
  },
];

// ActionToast only - lines 156-190 for the component + types 148-166
const actionToast = `import React from 'react';
import { CircleCheck, MessageCircle, X } from 'lucide-react';

export type ActionToastVariant = 'success' | 'danger';

export interface ActionToastState {
  message: string;
  variant: ActionToastVariant;
}

interface ActionToastProps {
  toast: ActionToastState;
  onDismiss: () => void;
}

/** Bottom-right confirmation after approve, publish, or send rejection. */
export const ActionToast: React.FC<ActionToastProps> = ({ toast, onDismiss }) => {
  const Icon = toast.variant === 'success' ? CircleCheck : MessageCircle;

  return (
    <div
      className={\`action-toast action-toast--\${toast.variant}\`}
      role="status"
      aria-live="polite"
    >
      <Icon className="action-toast-icon" size={18} aria-hidden="true" />
      <p className="action-toast-message">{toast.message}</p>
      <button
        type="button"
        className="action-toast-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};
`;

fs.writeFileSync(path.join(root, 'ActionToast.tsx'), actionToast);

const sharedImports = `import React, { useMemo, useState } from 'react';
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  X,
} from 'lucide-react';
import stepVisualImage from '../../assets/image-1.png';
import {
  FILTER_OPTIONS,
  STATUS_CONFIG,
  STATUS_ORDER,
  VERSION_HISTORY_CONFIG,
  VERSION_HISTORY_ORDER,
} from '../constants';
import { HISTORY_SECTION_ICONS, LIST_SECTION_ICONS } from '../icons';
import {
  getPublishConfirmDetails,
  getPublishData,
  getReadOnlyVersionDetails,
  getRejectionData,
  getReviewData,
  matchesFilter,
  matchesSearch,
} from '../helpers';
import type {
  Instruction,
  InstructionStatus,
  OperatorOnShift,
  PreviewStep,
  PublishConfirmDetails,
  RejectionFeedback,
  RejectionSubmission,
  StatusFilter,
  VersionEntry,
  VersionHistory,
  VersionHistoryStatus,
} from '../types';
import { REJECTION_REASON_OPTIONS } from '../constants';
`;

const instructionList = sharedImports + '\n' + slice(987, 1371).replace(/^const /gm, 'export const ').replace(/^interface /gm, 'export interface ');
fs.writeFileSync(path.join(root, 'InstructionListView.tsx'), instructionList.replace(
  'const InstructionListView',
  'export const InstructionListView',
));

const versionHistory = sharedImports + '\n' + slice(1081, 1443)
  .replace(/^const VersionEntryCard/gm, 'export const VersionEntryCard')
  .replace(/^const VersionHistorySection/gm, 'export const VersionHistorySection')
  .replace(/^const ArchivedSection/gm, 'export const ArchivedSection')
  .replace(/^interface VersionEntryCardProps/gm, 'export interface VersionEntryCardProps')
  .replace(/^interface VersionHistorySectionProps/gm, 'export interface VersionHistorySectionProps')
  .replace(/^interface ArchivedSectionProps/gm, 'export interface ArchivedSectionProps')
  + '\n' + slice(1375, 1443).replace(/^interface VersionHistoryViewProps/gm, 'export interface VersionHistoryViewProps').replace(/^const VersionHistoryView/gm, 'export const VersionHistoryView');

// Fix - version history file should include VersionHistoryView from 1375-1443 and cards from 1081-1268
const vhContent = sharedImports + '\n' + slice(1081, 1443)
  .replace(/^interface VersionEntryCardProps/gm, 'export interface VersionEntryCardProps')
  .replace(/^const VersionEntryCard/gm, 'export const VersionEntryCard')
  .replace(/^interface VersionHistorySectionProps/gm, 'export interface VersionHistorySectionProps')
  .replace(/^const VersionHistorySection/gm, 'export const VersionHistorySection')
  .replace(/^interface ArchivedSectionProps/gm, 'export interface ArchivedSectionProps')
  .replace(/^const ArchivedSection/gm, 'export const ArchivedSection')
  .replace(/^interface VersionHistoryViewProps/gm, 'export interface VersionHistoryViewProps')
  .replace(/^const VersionHistoryView/gm, 'export const VersionHistoryView');

fs.writeFileSync(path.join(root, 'VersionHistoryView.tsx'), vhContent);

const workflowImports = `import React, { useMemo, useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import stepVisualImage from '../../assets/image-1.png';
import type {
  OperatorOnShift,
  PreviewStep,
  PublishConfirmDetails,
  RejectionFeedback,
  RejectionSubmission,
  VersionEntry,
  VersionHistory,
} from '../types';
import {
  getPublishConfirmDetails,
  getPublishData,
  getReadOnlyVersionDetails,
  getRejectionData,
  getReviewData,
} from '../helpers';
import { REJECTION_REASON_OPTIONS } from '../constants';
`;

const workflow = workflowImports + '\n' + slice(1448, 2222)
  .replace(/^type ReadOnlyViewMode/gm, 'export type ReadOnlyViewMode')
  .replace(/^interface /gm, 'export interface ')
  .replace(/^const PreviewStepCard/gm, 'export const PreviewStepCard')
  .replace(/^const VersionDetailsCard/gm, 'export const VersionDetailsCard')
  .replace(/^const PreviewPanel/gm, 'export const PreviewPanel')
  .replace(/^const WorkflowActionBar/gm, 'export const WorkflowActionBar')
  .replace(/^const OperatorImpactSection/gm, 'export const OperatorImpactSection')
  .replace(/^const RejectionFeedbackSection/gm, 'export const RejectionFeedbackSection')
  .replace(/^const RejectModal/gm, 'export const RejectModal')
  .replace(/^const PublishConfirmModal/gm, 'export const PublishConfirmModal')
  .replace(/^const ReviewView/gm, 'export const ReviewView')
  .replace(/^const PublishView/gm, 'export const PublishView')
  .replace(/^const RejectionView/gm, 'export const RejectionView')
  .replace(/^const ReadOnlyVersionView/gm, 'export const ReadOnlyVersionView');

fs.writeFileSync(path.join(root, 'WorkflowViews.tsx'), workflow);

console.log('Component files written');
