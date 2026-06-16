import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useVersionsContext } from '../versions/VersionsContext';
import { findVersionEntry } from '../versions/helpers';
import { appRoutes, versionHistoryPath } from '../versions/routes';
import './InstructionBuilder.css';

export const InstructionBuilder: React.FC = () => {
  const { instructionId, entryId } = useParams<{
    instructionId?: string;
    entryId?: string;
  }>();
  const { builderSelection, versionsData } = useVersionsContext();
  const { instructions, versionHistoryByInstruction } = versionsData;

  const instruction = useMemo(
    () => instructions.find((item) => item.id === instructionId),
    [instructions, instructionId],
  );

  const entry = useMemo(() => {
    if (!instructionId || !entryId) return undefined;
    return findVersionEntry(instructionId, entryId, versionHistoryByInstruction);
  }, [instructionId, entryId, versionHistoryByInstruction]);

  const selection =
    builderSelection ??
    (instruction && entry
      ? {
          instructionId: instruction.id,
          instructionTitle: instruction.title,
          entryId: entry.id,
          version: entry.version,
          wasRejected: entry.status === 'rejected',
        }
      : null);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">All Instructions</h1>
          {selection ? (
            <p className="dashboard-subtitle">
              Editing {selection.instructionTitle} &bull; {selection.version}
            </p>
          ) : (
            <p className="dashboard-subtitle">Select an instruction to edit</p>
          )}
        </div>
        {selection && (
          <Link className="version-back-btn" to={versionHistoryPath(selection.instructionId)}>
            Back to version history
          </Link>
        )}
      </header>

      {selection?.wasRejected && (
        <div className="builder-rejection-banner glass-card" role="status">
          <strong>Rejected draft</strong>
          <p>
            This version was sent back for revision. Update the instruction in the builder,
            then submit it again from the Versions page.
          </p>
        </div>
      )}

      {selection ? (
        <div className="builder-context-card glass-card">
          <dl className="builder-context-grid">
            <div>
              <dt>Instruction</dt>
              <dd>{selection.instructionTitle}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{selection.version}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{selection.wasRejected ? 'Rejected — needs revision' : 'Draft'}</dd>
            </div>
          </dl>
          <p className="builder-context-note">
            Builder canvas placeholder — wire your step editor here for{' '}
            <strong>{selection.instructionTitle}</strong> ({selection.version}).
          </p>
        </div>
      ) : (
        <div className="builder-empty glass-card">
          <p>
            Open the{' '}
            <Link to={appRoutes.versions}>Versions</Link> page and use{' '}
            <strong>Go to builder</strong> on a rejection, or navigate to{' '}
            <code>/all-instructions/wi-4/v-4-draft</code> directly.
          </p>
        </div>
      )}
    </div>
  );
};
