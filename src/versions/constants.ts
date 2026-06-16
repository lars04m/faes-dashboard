/**
 * Display constants: section order, badge labels, and filter pills.
 * Kept separate from mock data so UI config is easy to scan.
 */
import type { InstructionStatus, StatusFilter, VersionHistoryStatus } from './types';

/** Display order for status groups on the instruction list. */
export const STATUS_ORDER: InstructionStatus[] = ['live', 'review', 'draft'];

/** Display order for groups on the version history page. */
export const VERSION_HISTORY_ORDER: VersionHistoryStatus[] = [
  'live',
  'ready-to-publish',
  'draft',
  'rejected',
];

/** Badge and accent styling for each instruction list status. */
export const STATUS_CONFIG: Record<
  InstructionStatus,
  {
    label: string;
    sectionLabel: string;
    badgeLabel: string;
    accentColor: string;
    badgeClass: string;
  }
> = {
  live: {
    label: 'Live',
    sectionLabel: 'LIVE',
    badgeLabel: 'Live',
    accentColor: 'var(--color-success)',
    badgeClass: 'instruction-badge-live',
  },
  review: {
    label: 'Review',
    sectionLabel: 'REVIEW',
    badgeLabel: 'Ready to publish',
    accentColor: 'var(--color-info)',
    badgeClass: 'instruction-badge-review',
  },
  draft: {
    label: 'Draft',
    sectionLabel: 'DRAFT',
    badgeLabel: 'Draft',
    accentColor: 'var(--text-muted)',
    badgeClass: 'instruction-badge-draft',
  },
};

/** Badge, accent, and action button for each version history status. */
export const VERSION_HISTORY_CONFIG: Record<
  VersionHistoryStatus,
  {
    sectionLabel: string;
    accentColor: string;
    avatarClass: string;
    badgeLabel: string;
    badgeClass: string;
    actionLabel?: string;
  }
> = {
  live: {
    sectionLabel: 'LIVE',
    accentColor: 'var(--color-success)',
    avatarClass: 'version-avatar-live',
    badgeLabel: 'Live',
    badgeClass: 'instruction-badge-live',
  },
  'ready-to-publish': {
    sectionLabel: 'READY TO PUBLISH',
    accentColor: 'var(--color-info)',
    avatarClass: 'version-avatar-ready',
    badgeLabel: 'Approved',
    badgeClass: 'version-badge-approved',
    actionLabel: 'Publish',
  },
  draft: {
    sectionLabel: 'DRAFT',
    accentColor: 'var(--text-muted)',
    avatarClass: 'version-avatar-draft',
    badgeLabel: 'In progress',
    badgeClass: 'version-badge-progress',
    actionLabel: 'Review',
  },
  rejected: {
    sectionLabel: 'REJECTED',
    accentColor: 'var(--color-danger)',
    avatarClass: 'version-avatar-rejected',
    badgeLabel: 'Rejected',
    badgeClass: 'version-badge-rejected',
  },
};

/** Status filter pills on the instruction list toolbar. */
export const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'review', label: 'Review' },
  { value: 'draft', label: 'Draft' },
];

export const REJECTION_REASON_OPTIONS = [
  'Technically incorrect',
  'Incomplete',
  'Unclear',
  'Other',
] as const;
