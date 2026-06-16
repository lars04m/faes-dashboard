import React, { useMemo, useState } from 'react';
import { Archive, ChevronLeft, ChevronRight } from 'lucide-react';
import { VERSION_HISTORY_CONFIG, VERSION_HISTORY_ORDER } from '../constants';
import { HISTORY_SECTION_ICONS } from '../icons';
import type { Instruction, VersionEntry, VersionHistory, VersionHistoryStatus } from '../types';

export interface VersionEntryCardProps {
  entry: VersionEntry;
  onReview?: (entryId: string) => void;
  onPublish?: (entryId: string) => void;
  onView?: (entryId: string) => void;
}

export const VersionEntryCard: React.FC<VersionEntryCardProps> = ({
  entry,
  onReview,
  onPublish,
  onView,
}) => {
  const config = VERSION_HISTORY_CONFIG[entry.status];
  const hasAction = Boolean(config.actionLabel);
  const isReviewAction = entry.status === 'draft' && config.actionLabel === 'Review';
  const isPublishAction =
    entry.status === 'ready-to-publish' && config.actionLabel === 'Publish';
  const isViewable = entry.status === 'live' && Boolean(onView);

  const handleAction = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isReviewAction) onReview?.(entry.id);
    if (isPublishAction) onPublish?.(entry.id);
  };

  const handleView = () => {
    if (isViewable) onView?.(entry.id);
  };

  return (
    <article
      className={`version-entry-card${isViewable ? ' version-entry-card--clickable' : ''}`}
      onClick={isViewable ? handleView : undefined}
      onKeyDown={
        isViewable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleView();
              }
            }
          : undefined
      }
      role={isViewable ? 'button' : undefined}
      tabIndex={isViewable ? 0 : undefined}
    >
      <span
        className="instruction-accent"
        style={{ backgroundColor: config.accentColor }}
        aria-hidden="true"
      />

      <div className="version-entry-body">
        <div className={`version-avatar ${config.avatarClass}`}>
          {entry.authorInitials}
        </div>

        <div className="version-entry-details">
          <p className="version-entry-summary">
            <span className="version-entry-version">{entry.version}</span>
            <span className="version-entry-description">{entry.description}</span>
          </p>
          <p className="version-entry-meta">
            {entry.author} &bull; {entry.updatedAt}
          </p>
        </div>

        <div className="version-entry-actions">
          <span className={`instruction-badge ${config.badgeClass}`}>
            {config.badgeLabel}
          </span>
          {hasAction && (
            <button type="button" className="version-action-btn" onClick={handleAction}>
              {config.actionLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export interface VersionHistorySectionProps {
  status: VersionHistoryStatus;
  entries: VersionEntry[];
  onReview?: (entryId: string) => void;
  onPublish?: (entryId: string) => void;
  onView?: (entryId: string) => void;
}

export const VersionHistorySection: React.FC<VersionHistorySectionProps> = ({
  status,
  entries,
  onReview,
  onPublish,
  onView,
}) => {
  if (entries.length === 0) return null;

  const SectionIcon = HISTORY_SECTION_ICONS[status];
  const config = VERSION_HISTORY_CONFIG[status];

  return (
    <section className="instruction-section">
      <header className="instruction-section-header">
        <SectionIcon size={14} aria-hidden="true" />
        <span>{config.sectionLabel}</span>
      </header>

      <div className="instruction-list">
        {entries.map((entry) => (
          <VersionEntryCard
            key={entry.id}
            entry={entry}
            onReview={onReview}
            onPublish={onPublish}
            onView={onView}
          />
        ))}
      </div>
    </section>
  );
};

export interface ArchivedSectionProps {
  archivedEntries: VersionEntry[];
  onViewEntry: (entryId: string) => void;
}

export const ArchivedSection: React.FC<ArchivedSectionProps> = ({
  archivedEntries,
  onViewEntry,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (archivedEntries.length === 0) return null;

  const versionLabel =
    archivedEntries.length === 1 ? 'older version' : 'older versions';

  return (
    <section className="instruction-section">
      <header className="instruction-section-header">
        <Archive size={14} aria-hidden="true" />
        <span>ARCHIVED</span>
      </header>

      <button
        type="button"
        className="version-archived-panel"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
      >
        <div className="version-archived-content">
          <div className="version-archived-tags">
            {archivedEntries.map((entry) => (
              <span key={entry.id} className="version-archived-tag">
                {entry.version}
              </span>
            ))}
          </div>
          <p className="version-archived-label">
            {archivedEntries.length} {versionLabel} &bull; tap to expand
          </p>
        </div>
        <ChevronRight className="instruction-chevron" size={18} aria-hidden="true" />
      </button>

      {isExpanded && (
        <ul className="version-archived-list">
          {archivedEntries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                className="version-archived-list-item"
                onClick={() => onViewEntry(entry.id)}
              >
                <span className="version-archived-list-version">{entry.version}</span>
                <span className="version-archived-list-description">{entry.description}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export interface VersionHistoryViewProps {
  instruction: Instruction;
  history: VersionHistory;
  onBack: () => void;
  onReview: (entryId: string) => void;
  onPublish: (entryId: string) => void;
  onViewEntry: (entryId: string) => void;
}

/** All versions for one instruction, grouped by status with Review/Publish actions. */
export const VersionHistoryView: React.FC<VersionHistoryViewProps> = ({
  instruction,
  history,
  onBack,
  onReview,
  onPublish,
  onViewEntry,
}) => {
  const groupedEntries = useMemo(() => {
    const groups = VERSION_HISTORY_ORDER.reduce(
      (acc, status) => {
        acc[status] = history.entries.filter((entry) => entry.status === status);
        return acc;
      },
      {} as Record<VersionHistoryStatus, VersionEntry[]>,
    );

    return VERSION_HISTORY_ORDER.map((status) => ({
      status,
      entries: groups[status],
    })).filter((group) => group.entries.length > 0);
  }, [history.entries]);

  const versionCountLabel =
    history.totalVersions === 1 ? '1 version' : `${history.totalVersions} versions`;

  return (
    <>
      <header className="version-history-header">
        <button type="button" className="version-back-btn" onClick={onBack}>
          <ChevronLeft size={16} aria-hidden="true" />
          Version History
        </button>
        <p className="version-history-breadcrumb">
          /Work Instruction: {instruction.title} - {versionCountLabel}
        </p>
      </header>

      <div className="instruction-groups">
        {groupedEntries.map((group) => (
          <VersionHistorySection
            key={group.status}
            status={group.status}
            entries={group.entries}
            onReview={onReview}
            onPublish={onPublish}
            onView={onViewEntry}
          />
        ))}

        <ArchivedSection
          archivedEntries={history.archivedEntries}
          onViewEntry={onViewEntry}
        />
      </div>
    </>
  );
};
