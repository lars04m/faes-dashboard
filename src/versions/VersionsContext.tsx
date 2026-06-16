import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  RejectionSubmission,
  VersionsDataState,
  VersionHistory,
} from './types';
import { createInitialVersionsData } from './mockData';
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
}

const VersionsContext = createContext<VersionsContextValue | null>(null);

export function VersionsProvider({ children }: { children: ReactNode }) {
  const [versionsData, setVersionsData] = useState<VersionsDataState>(
    createInitialVersionsData,
  );
  const [builderSelection, setBuilderSelection] = useState<BuilderSelection | null>(
    null,
  );
  const [rejectionSubmissions, setRejectionSubmissions] = useState<
    Record<string, RejectionSubmission>
  >({});

  const updateInstructionHistory = useCallback(
    (instructionId: string, updater: (history: VersionHistory) => VersionHistory) => {
      setVersionsData((prev) => {
        const current = prev.versionHistoryByInstruction[instructionId];
        if (!current) return prev;

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
    }),
    [
      versionsData,
      updateInstructionHistory,
      pendingReviewCount,
      builderSelection,
      rejectionSubmissions,
      setRejectionSubmissionForEntry,
      getRejectionSubmission,
    ],
  );

  return (
    <VersionsContext.Provider value={value}>{children}</VersionsContext.Provider>
  );
}

export function useVersionsContext(): VersionsContextValue {
  const context = useContext(VersionsContext);
  if (!context) {
    throw new Error('useVersionsContext must be used within VersionsProvider');
  }
  return context;
}
