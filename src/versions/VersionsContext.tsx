/**
 * Shared app state for the Versions section and Instruction Builder.
 * Wraps the dashboard so toasts survive navigation to the builder.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  RejectionSubmission,
  VersionsDataState,
  VersionHistory,
} from './types';
import {
  ActionToast,
  type ActionToastState,
  type ActionToastVariant,
} from './components/ActionToast';
import { createInitialReviewComments, createInitialVersionsData } from './mockData';
import { syncInstructionInState } from './helpers';

/** Context passed to the Instruction Builder when editing a rejected draft. */
export interface BuilderSelection {
  instructionId: string;
  instructionTitle: string;
  entryId: string;
  version: string;
  wasRejected: boolean;
}

interface VersionsContextValue {
  versionsData: VersionsDataState;
  setVersionsData: React.Dispatch<React.SetStateAction<VersionsDataState>>;
  updateInstructionHistory: (
    instructionId: string,
    updater: (history: VersionHistory) => VersionHistory,
  ) => void;
  pendingReviewCount: number;
  builderSelection: BuilderSelection | null;
  setBuilderSelection: (selection: BuilderSelection | null) => void;
  rejectionSubmissions: Record<string, RejectionSubmission>;
  setRejectionSubmissionForEntry: (
    entryId: string,
    submission: RejectionSubmission,
  ) => void;
  getRejectionSubmission: (entryId: string) => RejectionSubmission | undefined;
  reviewCommentsByEntryId: Record<string, string>;
  setReviewComment: (entryId: string, comment: string) => void;
  getReviewComment: (entryId: string) => string | undefined;
  showActionToast: (message: string, variant?: ActionToastVariant) => void;
  dismissActionToast: () => void;
}

const VersionsContext = createContext<VersionsContextValue | null>(null);

export function VersionsProvider({ children }: { children: ReactNode }) {
  // Core data: instruction list + per-instruction version histories
  const [versionsData, setVersionsData] = useState<VersionsDataState>(
    createInitialVersionsData,
  );
  // Set when user opens a rejected draft in the Instruction Builder
  const [builderSelection, setBuilderSelection] = useState<BuilderSelection | null>(
    null,
  );
  // Reject-modal payload keyed by version entry id (shown on Rejection screen)
  const [rejectionSubmissions, setRejectionSubmissions] = useState<
    Record<string, RejectionSubmission>
  >({});
  // Review notes saved on Approve; pre-seeded for entries already approved in mock data
  const [reviewCommentsByEntryId, setReviewCommentsByEntryId] = useState<
    Record<string, string>
  >(createInitialReviewComments);
  // Global toast rendered at provider level so it persists across route changes
  const [actionToast, setActionToast] = useState<ActionToastState | null>(null);

  const showActionToast = useCallback(
    (message: string, variant: ActionToastVariant = 'success') => {
      setActionToast({ message, variant });
    },
    [],
  );

  const dismissActionToast = useCallback(() => {
    setActionToast(null);
  }, []);

  useEffect(() => {
    if (!actionToast) return;

    const timer = window.setTimeout(() => {
      setActionToast(null);
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [actionToast]);

  const updateInstructionHistory = useCallback(
    (instructionId: string, updater: (history: VersionHistory) => VersionHistory) => {
      setVersionsData((prev) => {
        const current = prev.versionHistoryByInstruction[instructionId];
        if (!current) return prev;

        // Shallow-copy arrays so updaters can mutate safely
        const nextHistory = updater({
          ...current,
          entries: [...current.entries],
          archivedEntries: [...current.archivedEntries],
        });

        const next: VersionsDataState = {
          ...prev,
          versionHistoryByInstruction: {
            ...prev.versionHistoryByInstruction,
            [instructionId]: nextHistory,
          },
        };

        return syncInstructionInState(next, instructionId);
      });
    },
    [],
  );

  // Sidebar badge: count draft entries awaiting review across all instructions
  const pendingReviewCount = useMemo(
    () =>
      Object.values(versionsData.versionHistoryByInstruction).reduce(
        (count, history) =>
          count + history.entries.filter((entry) => entry.status === 'draft').length,
        0,
      ),
    [versionsData.versionHistoryByInstruction],
  );

  const setRejectionSubmissionForEntry = useCallback(
    (entryId: string, submission: RejectionSubmission) => {
      setRejectionSubmissions((prev) => ({ ...prev, [entryId]: submission }));
    },
    [],
  );

  const getRejectionSubmission = useCallback(
    (entryId: string) => rejectionSubmissions[entryId],
    [rejectionSubmissions],
  );

  const setReviewComment = useCallback((entryId: string, comment: string) => {
    setReviewCommentsByEntryId((prev) => ({ ...prev, [entryId]: comment }));
  }, []);

  const getReviewComment = useCallback(
    (entryId: string) => reviewCommentsByEntryId[entryId],
    [reviewCommentsByEntryId],
  );

  const value = useMemo(
    (): VersionsContextValue => ({
      versionsData,
      setVersionsData,
      updateInstructionHistory,
      pendingReviewCount,
      builderSelection,
      setBuilderSelection,
      rejectionSubmissions,
      setRejectionSubmissionForEntry,
      getRejectionSubmission,
      reviewCommentsByEntryId,
      setReviewComment,
      getReviewComment,
      showActionToast,
      dismissActionToast,
    }),
    [
      versionsData,
      updateInstructionHistory,
      pendingReviewCount,
      builderSelection,
      rejectionSubmissions,
      setRejectionSubmissionForEntry,
      getRejectionSubmission,
      reviewCommentsByEntryId,
      setReviewComment,
      getReviewComment,
      showActionToast,
      dismissActionToast,
    ],
  );

  return (
    <VersionsContext.Provider value={value}>
      {children}
      {actionToast && (
        <ActionToast toast={actionToast} onDismiss={dismissActionToast} />
      )}
    </VersionsContext.Provider>
  );
}

export function useVersionsContext(): VersionsContextValue {
  const context = useContext(VersionsContext);
  if (!context) {
    throw new Error('useVersionsContext must be used within VersionsProvider');
  }
  return context;
}
