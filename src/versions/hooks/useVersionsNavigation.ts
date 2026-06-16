import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  appRoutes,
  builderPath,
  versionHistoryPath,
  versionWorkflowPath,
  type VersionsWorkflowAction,
} from '../routes';

/** Navigate between Versions screens using shareable URLs. */
export function useVersionsNavigation() {
  const navigate = useNavigate();

  const goToList = useCallback(() => {
    navigate(appRoutes.versions);
  }, [navigate]);

  const goToHistory = useCallback(
    (instructionId: string) => {
      navigate(versionHistoryPath(instructionId));
    },
    [navigate],
  );

  const goToWorkflow = useCallback(
    (
      instructionId: string,
      action: VersionsWorkflowAction,
      entryId: string,
    ) => {
      navigate(versionWorkflowPath(instructionId, action, entryId));
    },
    [navigate],
  );

  const goToReview = useCallback(
    (instructionId: string, entryId: string) => {
      goToWorkflow(instructionId, 'review', entryId);
    },
    [goToWorkflow],
  );

  const goToPublish = useCallback(
    (instructionId: string, entryId: string) => {
      goToWorkflow(instructionId, 'publish', entryId);
    },
    [goToWorkflow],
  );

  const goToRejection = useCallback(
    (instructionId: string, entryId: string) => {
      goToWorkflow(instructionId, 'rejection', entryId);
    },
    [goToWorkflow],
  );

  const goToReadOnlyView = useCallback(
    (instructionId: string, entryId: string) => {
      goToWorkflow(instructionId, 'view', entryId);
    },
    [goToWorkflow],
  );

  const goToBuilder = useCallback(
    (instructionId: string, entryId?: string) => {
      navigate(builderPath(instructionId, entryId));
    },
    [navigate],
  );

  return {
    goToList,
    goToHistory,
    goToReview,
    goToPublish,
    goToRejection,
    goToReadOnlyView,
    goToBuilder,
  };
}
