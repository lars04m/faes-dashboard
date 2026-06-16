/**
 * Pure helpers for the Versions module.
 * Lookup, list-card sync, and building Review/Publish/Rejection screen data.
 */
import type {
  Instruction,
  InstructionStatus,
  PreviewStep,
  PublishConfirmDetails,
  PublishData,
  RejectionData,
  ReviewData,
  StatusFilter,
  VersionEntry,
  VersionHistory,
  VersionsDataState,
} from './types';
import {
  DEFAULT_PREVIEW_STEPS,
  DEFAULT_PUBLISH_DATA,
  DEFAULT_REJECTION_DATA,
  DEFAULT_REVIEW_DATA,
  PREVIEW_STEPS_BY_ENTRY,
  PUBLISH_DATA_BY_ENTRY,
  REVIEW_DATA_BY_ENTRY,
} from './mockData';

export function emptyVersionHistory(): VersionHistory {
  return { totalVersions: 0, entries: [], archivedEntries: [] };
}

export function getVersionHistory(
  instructionId: string,
  versionHistoryByInstruction: Record<string, VersionHistory>,
): VersionHistory {
  return versionHistoryByInstruction[instructionId] ?? emptyVersionHistory();
}

/** Find an active or archived entry within one instruction's history. */
export function findEntryInHistory(
  history: VersionHistory,
  entryId: string,
): VersionEntry | undefined {
  return (
    history.entries.find((entry) => entry.id === entryId) ??
    history.archivedEntries.find((entry) => entry.id === entryId)
  );
}

export function findVersionEntry(
  instructionId: string,
  entryId: string,
  versionHistoryByInstruction: Record<string, VersionHistory>,
): VersionEntry | undefined {
  return findEntryInHistory(getVersionHistory(instructionId, versionHistoryByInstruction), entryId);
}

/** Find which instruction owns a version entry (used for publish "replacing" label). */
export function findInstructionIdForEntry(
  entryId: string,
  versionHistoryByInstruction: Record<string, VersionHistory>,
): string | undefined {
  return Object.entries(versionHistoryByInstruction).find(
    ([, history]) => findEntryInHistory(history, entryId) !== undefined,
  )?.[0];
}

/** Current live version for an instruction, if one exists. */
export function getLiveVersionForInstruction(
  instructionId: string,
  versionHistoryByInstruction: Record<string, VersionHistory>,
): string | undefined {
  const liveEntry = getVersionHistory(instructionId, versionHistoryByInstruction).entries.find(
    (entry) => entry.status === 'live',
  );
  return liveEntry?.version;
}

/** Keep the instruction list card in sync after history changes. */
export function deriveInstructionFromHistory(
  instruction: Instruction,
  history: VersionHistory,
): Instruction {
  const liveEntry = history.entries.find((entry) => entry.status === 'live');
  const readyEntry = history.entries.find((entry) => entry.status === 'ready-to-publish');
  const draftEntry = history.entries.find((entry) => entry.status === 'draft');
  const rejectedEntry = history.entries.find((entry) => entry.status === 'rejected');

  let status: InstructionStatus;
  let primary: VersionEntry | undefined;

  // Priority: live > ready-to-publish (shown as "review" on list) > draft > rejected
  if (liveEntry) {
    status = 'live';
    primary = liveEntry;
  } else if (readyEntry) {
    status = 'review';
    primary = readyEntry;
  } else if (draftEntry) {
    status = 'draft';
    primary = draftEntry;
  } else if (rejectedEntry) {
    // Rejected drafts still appear under the DRAFT section on the main list
    status = 'draft';
    primary = rejectedEntry;
  } else {
    return instruction;
  }

  return {
    ...instruction,
    status,
    version: primary.version,
    author: primary.author,
    updatedAt: primary.updatedAt,
    authorInitials: primary.authorInitials,
  };
}

/** Re-derive the list card for one instruction after its history mutates. */
export function syncInstructionInState(
  state: VersionsDataState,
  instructionId: string,
): VersionsDataState {
  const history = state.versionHistoryByInstruction[instructionId];
  if (!history) return state;

  return {
    ...state,
    instructions: state.instructions.map((instruction) =>
      instruction.id === instructionId
        ? deriveInstructionFromHistory(instruction, history)
        : instruction,
    ),
  };
}

/** Preview steps for a version entry; falls back to the default T8 diff. */
export function getPreviewStepsForEntry(entry: VersionEntry): PreviewStep[] {
  return PREVIEW_STEPS_BY_ENTRY[entry.id] ?? DEFAULT_PREVIEW_STEPS;
}

/** Build read-only version details from an entry. */
export function getReadOnlyVersionDetails(entry: VersionEntry): {
  author: string;
  version: string;
  date: string;
  comment: string;
  previewSteps: PreviewStep[];
} {
  const publishData = PUBLISH_DATA_BY_ENTRY[entry.id];
  const reviewData = REVIEW_DATA_BY_ENTRY[entry.id];

  return {
    author: entry.author,
    version: entry.version,
    date: entry.updatedAt,
    comment:
      publishData?.comment ??
      reviewData?.comment ??
      `Archived ${entry.version}: ${entry.description}`,
    previewSteps: getPreviewStepsForEntry(entry),
  };
}

/** Build review screen content from mock overrides or entry metadata. */
export function getReviewData(entry: VersionEntry): ReviewData {
  const data =
    REVIEW_DATA_BY_ENTRY[entry.id] ?? {
      ...DEFAULT_REVIEW_DATA,
      author: entry.author,
      version: entry.version,
      date: entry.updatedAt,
    };

  return {
    ...data,
    // Review screen always starts with an empty notes field
    comment: '',
    previewSteps: data.previewSteps ?? getPreviewStepsForEntry(entry),
  };
}

/** Build publish screen content; uses saved review notes when available. */
export function getPublishData(
  entry: VersionEntry,
  reviewComment?: string,
): PublishData {
  const data =
    PUBLISH_DATA_BY_ENTRY[entry.id] ?? {
      ...DEFAULT_PUBLISH_DATA,
      author: entry.author,
      version: entry.version,
      date: entry.updatedAt,
    };

  return {
    ...data,
    comment: reviewComment ?? data.comment,
    previewSteps: data.previewSteps ?? getPreviewStepsForEntry(entry),
  };
}

/** Summary shown in the "Publish vX?" confirmation modal. */
export function getPublishConfirmDetails(
  entry: VersionEntry,
  publishData: PublishData,
  versionHistoryByInstruction: Record<string, VersionHistory>,
): PublishConfirmDetails {
  const instructionId = findInstructionIdForEntry(entry.id, versionHistoryByInstruction);
  const replacingVersion =
    (instructionId && getLiveVersionForInstruction(instructionId, versionHistoryByInstruction)) ??
    'v3.2';

  return {
    publishingVersion: entry.version,
    publisherName: entry.author.split(' ')[0] ?? entry.author,
    replacingVersion,
    approvedBy: 'Stefan',
    approvedDate: 'June 3rd',
    affectedOperators: publishData.operatorsOnShift.map((operator) => operator.name),
  };
}

/** Build rejection screen content; feedback text comes from the reject modal. */
export function getRejectionData(entry: VersionEntry): RejectionData {
  return {
    ...DEFAULT_REJECTION_DATA,
    author: entry.author,
    version: entry.version,
    date: entry.updatedAt,
    previewSteps: getPreviewStepsForEntry(entry),
  };
}

/** True when the instruction matches the search box text. */
export function matchesSearch(instruction: Instruction, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const searchableText = [
    instruction.title,
    instruction.version,
    instruction.description,
    instruction.author,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

/** True when the instruction matches the selected status filter pill. */
export function matchesFilter(instruction: Instruction, filter: StatusFilter): boolean {
  return filter === 'all' || instruction.status === filter;
}
