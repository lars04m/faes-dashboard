import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ActionToast, type ActionToastState, type ActionToastVariant } from './components/ActionToast';
import { InstructionListView } from './components/InstructionListView';
import { VersionHistoryView } from './components/VersionHistoryView';
import {
  PublishView,
  ReadOnlyVersionView,
  RejectModal,
  RejectionView,
  ReviewView,
  type ReadOnlyViewMode,
} from './components/WorkflowViews';
import {
  emptyVersionHistory,
  findVersionEntry,
  getVersionHistory,
} from './helpers';
import { useVersionsNavigation } from './hooks/useVersionsNavigation';
import { parseVersionsPath } from './routes';
import type { RejectionSubmission } from './types';
import { useVersionsContext } from './VersionsContext';
import './Versions.css';

/** Versions section — URL-driven screen routing with shared app state. */
export const VersionsPage: React.FC = () => {
  const location = useLocation();
  const {
    versionsData,
    updateInstructionHistory,
    setBuilderSelection,
    setRejectionSubmissionForEntry,
    getRejectionSubmission,
  } = useVersionsContext();
  const navigation = useVersionsNavigation();

  const { instructionId, action, entryId } = parseVersionsPath(location.pathname);
  const { instructions, versionHistoryByInstruction } = versionsData;

  const [rejectModalEntryId, setRejectModalEntryId] = useState<string | null>(null);
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

  const selectedInstruction = useMemo(
    () => instructions.find((instruction) => instruction.id === instructionId),
    [instructions, instructionId],
  );

  const selectedEntry = useMemo(() => {
    if (!instructionId || !entryId) return undefined;
    return findVersionEntry(instructionId, entryId, versionHistoryByInstruction);
  }, [instructionId, entryId, versionHistoryByInstruction]);

  const rejectModalEntry = useMemo(() => {
    if (!instructionId || !rejectModalEntryId) return undefined;
    return findVersionEntry(instructionId, rejectModalEntryId, versionHistoryByInstruction);
  }, [instructionId, rejectModalEntryId, versionHistoryByInstruction]);

  const readOnlyViewMode = useMemo((): ReadOnlyViewMode => {
    if (!instructionId || !entryId) return 'live';
    const history = getVersionHistory(instructionId, versionHistoryByInstruction);
    return history.archivedEntries.some((entry) => entry.id === entryId)
      ? 'archived'
      : 'live';
  }, [instructionId, entryId, versionHistoryByInstruction]);

  const selectedInstructionHistory = useMemo(() => {
    if (!instructionId) return emptyVersionHistory();
    return getVersionHistory(instructionId, versionHistoryByInstruction);
  }, [instructionId, versionHistoryByInstruction]);

  const rejectionSubmission = entryId ? getRejectionSubmission(entryId) : undefined;

  const isWorkflowView = Boolean(
    selectedInstruction &&
      action &&
      selectedEntry &&
      ['review', 'publish', 'rejection', 'view'].includes(action),
  );

  // Unknown instruction in URL → back to list.
  if (instructionId && !selectedInstruction) {
    return <Navigate to="/versions" replace />;
  }

  // Workflow URL with missing entry → back to history.
  if (instructionId && action && entryId && !selectedEntry) {
    return <Navigate to={`/versions/${instructionId}`} replace />;
  }

  // Rejection screen requires submission data from the reject modal.
  if (instructionId && action === 'rejection' && entryId && !getRejectionSubmission(entryId)) {
    return <Navigate to={`/versions/${instructionId}`} replace />;
  }

  const handleOpenRejectModal = (modalEntryId: string) => {
    setRejectModalEntryId(modalEntryId);
  };

  const handleCloseRejectModal = () => {
    setRejectModalEntryId(null);
  };

  const handleSendRejection = (submission: RejectionSubmission) => {
    if (!instructionId || !rejectModalEntryId || !rejectModalEntry) return;

    updateInstructionHistory(instructionId, (history) => ({
      ...history,
      entries: history.entries.map((entry) =>
        entry.id === rejectModalEntryId ? { ...entry, status: 'rejected' } : entry,
      ),
    }));

    setRejectionSubmissionForEntry(rejectModalEntryId, submission);
    setRejectModalEntryId(null);
    navigation.goToRejection(instructionId, rejectModalEntryId);
    showActionToast(
      `Rejection sent for ${rejectModalEntry.version}. The author has been notified.`,
      'danger',
    );
  };

  const handlePublishConfirm = () => {
    if (!instructionId || !entryId || !selectedEntry) return;

    const publishingEntryId = entryId;
    const { version } = selectedEntry;

    updateInstructionHistory(instructionId, (history) => {
      const liveEntry = history.entries.find((entry) => entry.status === 'live');
      let entries = history.entries.map((entry) =>
        entry.id === publishingEntryId ? { ...entry, status: 'live' as const } : entry,
      );
      let archivedEntries = [...history.archivedEntries];

      if (liveEntry && liveEntry.id !== publishingEntryId) {
        entries = entries.filter((entry) => entry.id !== liveEntry.id);
        archivedEntries = [liveEntry, ...archivedEntries];
      }

      return { ...history, entries, archivedEntries };
    });

    navigation.goToHistory(instructionId);
    showActionToast(`${version} is now live and replaced the previous version.`);
  };

  const handleApproveReview = () => {
    if (!instructionId || !entryId || !selectedEntry) return;

    updateInstructionHistory(instructionId, (history) => ({
      ...history,
      entries: history.entries.map((entry) =>
        entry.id === entryId ? { ...entry, status: 'ready-to-publish' } : entry,
      ),
    }));

    navigation.goToHistory(instructionId);
    showActionToast(`${selectedEntry.version} approved and is ready to publish.`);
  };

  const handleGoToBuilder = () => {
    if (!instructionId || !entryId || !selectedInstruction || !selectedEntry) return;

    setBuilderSelection({
      instructionId,
      instructionTitle: selectedInstruction.title,
      entryId,
      version: selectedEntry.version,
      wasRejected: selectedEntry.status === 'rejected',
    });
    navigation.goToBuilder(instructionId, entryId);
  };

  const renderContent = () => {
    if (selectedInstruction && action === 'rejection' && selectedEntry && rejectionSubmission) {
      return (
        <RejectionView
          entry={selectedEntry}
          submission={rejectionSubmission}
          onBack={() => navigation.goToHistory(instructionId!)}
          onViewHistory={() => navigation.goToHistory(instructionId!)}
          onGoToBuilder={handleGoToBuilder}
        />
      );
    }

    if (selectedInstruction && action === 'publish' && selectedEntry) {
      return (
        <>
          <PublishView
            entry={selectedEntry}
            versionHistoryByInstruction={versionHistoryByInstruction}
            onBack={() => navigation.goToHistory(instructionId!)}
            onOpenRejectModal={() => handleOpenRejectModal(selectedEntry.id)}
            onPublishConfirm={handlePublishConfirm}
          />
          {rejectModalEntry && (
            <RejectModal
              version={rejectModalEntry.version}
              authorName={rejectModalEntry.author}
              onClose={handleCloseRejectModal}
              onSubmit={handleSendRejection}
            />
          )}
        </>
      );
    }

    if (selectedInstruction && action === 'review' && selectedEntry) {
      return (
        <>
          <ReviewView
            entry={selectedEntry}
            onBack={() => navigation.goToHistory(instructionId!)}
            onOpenRejectModal={() => handleOpenRejectModal(selectedEntry.id)}
            onApprove={handleApproveReview}
          />
          {rejectModalEntry && (
            <RejectModal
              version={rejectModalEntry.version}
              authorName={rejectModalEntry.author}
              onClose={handleCloseRejectModal}
              onSubmit={handleSendRejection}
            />
          )}
        </>
      );
    }

    if (selectedInstruction && action === 'view' && selectedEntry) {
      return (
        <ReadOnlyVersionView
          entry={selectedEntry}
          viewMode={readOnlyViewMode}
          onBack={() => navigation.goToHistory(instructionId!)}
        />
      );
    }

    if (selectedInstruction) {
      return (
        <VersionHistoryView
          instruction={selectedInstruction}
          history={selectedInstructionHistory}
          onBack={navigation.goToList}
          onReview={(id) => navigation.goToReview(instructionId!, id)}
          onPublish={(id) => navigation.goToPublish(instructionId!, id)}
          onViewEntry={(id) => navigation.goToReadOnlyView(instructionId!, id)}
        />
      );
    }

    return (
      <InstructionListView
        instructions={instructions}
        onSelectInstruction={navigation.goToHistory}
      />
    );
  };

  return (
    <>
      <div
        className={`dashboard-container${isWorkflowView ? ' dashboard-container--review' : ''}`}
      >
        {renderContent()}
      </div>

      {actionToast && (
        <ActionToast toast={actionToast} onDismiss={dismissActionToast} />
      )}
    </>
  );
};