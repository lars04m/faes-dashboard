import React, { useMemo, useState } from 'react';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Bell,
  MessageCircle,
  Pencil,
  FileText,
  CheckCircle2,
  Archive,
} from 'lucide-react';
import './Versions.css';

type InstructionStatus = 'live' | 'review' | 'draft';
type StatusFilter = 'all' | InstructionStatus;
type VersionHistoryStatus = 'live' | 'ready-to-publish' | 'draft';

interface Instruction {
  id: string;
  title: string;
  version?: string;
  description?: string;
  author: string;
  updatedAt: string;
  status: InstructionStatus;
  authorInitials?: string;
}

interface VersionEntry {
  id: string;
  version: string;
  description: string;
  author: string;
  authorInitials: string;
  updatedAt: string;
  status: VersionHistoryStatus;
}

interface VersionHistory {
  totalVersions: number;
  entries: VersionEntry[];
  archivedVersions: string[];
}

const STATUS_ORDER: InstructionStatus[] = ['live', 'review', 'draft'];

const VERSION_HISTORY_ORDER: VersionHistoryStatus[] = [
  'live',
  'ready-to-publish',
  'draft',
];

const STATUS_CONFIG: Record<
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

const VERSION_HISTORY_CONFIG: Record<
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
};

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'review', label: 'Review' },
  { value: 'draft', label: 'Draft' },
];

const INSTRUCTIONS: Instruction[] = [
  {
    id: 'wi-1',
    title: 'Product T8',
    version: 'v3.3',
    author: 'Jane Larsen',
    updatedAt: 'June 1st',
    status: 'live',
    authorInitials: 'JL',
  },
  {
    id: 'wi-2',
    title: 'Product T28',
    version: 'v3.3',
    author: 'Jane Larsen',
    updatedAt: 'June 1st',
    status: 'live',
    authorInitials: 'JL',
  },
  {
    id: 'wi-3',
    title: 'T10',
    description: 'Added safety note on step 4',
    author: 'Marc Bakker',
    authorInitials: 'MB',
    updatedAt: 'June 1st',
    status: 'review',
  },
  {
    id: 'wi-4',
    title: 'T93',
    description: 'Added safety note on step 4',
    author: 'Sara Willems',
    authorInitials: 'SW',
    updatedAt: 'June 1st',
    status: 'draft',
  },
];

const VERSION_HISTORY_BY_INSTRUCTION: Record<string, VersionHistory> = {
  'wi-1': {
    totalVersions: 5,
    entries: [
      {
        id: 'v-1-live',
        version: 'v3.3',
        description: 'Added safety note on step 4',
        author: 'Jane Larsen',
        authorInitials: 'JL',
        updatedAt: 'June 1st',
        status: 'live',
      },
      {
        id: 'v-1-ready',
        version: 'v3.3',
        description: 'Added safety note on step 4',
        author: 'Marc Bakker',
        authorInitials: 'MB',
        updatedAt: 'June 1st',
        status: 'ready-to-publish',
      },
      {
        id: 'v-1-draft',
        version: 'v3.3',
        description: 'Added safety note on step 4',
        author: 'Sara Willems',
        authorInitials: 'SW',
        updatedAt: 'June 1st',
        status: 'draft',
      },
    ],
    archivedVersions: ['v3.1', 'v3.2'],
  },
  'wi-2': {
    totalVersions: 3,
    entries: [
      {
        id: 'v-2-live',
        version: 'v3.3',
        description: 'Updated assembly sequence for T28',
        author: 'Jane Larsen',
        authorInitials: 'JL',
        updatedAt: 'June 1st',
        status: 'live',
      },
    ],
    archivedVersions: ['v3.0', 'v3.1'],
  },
  'wi-3': {
    totalVersions: 2,
    entries: [
      {
        id: 'v-3-ready',
        version: 'v1.2',
        description: 'Added safety note on step 4',
        author: 'Marc Bakker',
        authorInitials: 'MB',
        updatedAt: 'June 1st',
        status: 'ready-to-publish',
      },
    ],
    archivedVersions: ['v1.0'],
  },
  'wi-4': {
    totalVersions: 1,
    entries: [
      {
        id: 'v-4-draft',
        version: 'v0.9',
        description: 'Added safety note on step 4',
        author: 'Sara Willems',
        authorInitials: 'SW',
        updatedAt: 'June 1st',
        status: 'draft',
      },
    ],
    archivedVersions: [],
  },
};

const LIST_SECTION_ICONS: Record<InstructionStatus, React.ElementType> = {
  live: Bell,
  review: MessageCircle,
  draft: Pencil,
};

const HISTORY_SECTION_ICONS: Record<VersionHistoryStatus, React.ElementType> = {
  live: Bell,
  'ready-to-publish': CheckCircle2,
  draft: Pencil,
};

function matchesSearch(instruction: Instruction, query: string): boolean {
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

function matchesFilter(instruction: Instruction, filter: StatusFilter): boolean {
  return filter === 'all' || instruction.status === filter;
}

function getVersionHistory(instructionId: string): VersionHistory {
  return (
    VERSION_HISTORY_BY_INSTRUCTION[instructionId] ?? {
      totalVersions: 1,
      entries: [],
      archivedVersions: [],
    }
  );
}

interface InstructionCardProps {
  instruction: Instruction;
  onSelect: (instructionId: string) => void;
}

const InstructionCard: React.FC<InstructionCardProps> = ({ instruction, onSelect }) => {
  const config = STATUS_CONFIG[instruction.status];
  const isLive = instruction.status === 'live';

  return (
    <button
      type="button"
      className="instruction-card"
      onClick={() => onSelect(instruction.id)}
    >
      <span
        className="instruction-accent"
        style={{ backgroundColor: config.accentColor }}
        aria-hidden="true"
      />

      <div className="instruction-card-body">
        {isLive ? (
          <div className="instruction-icon instruction-icon-live">
            <FileText size={18} />
          </div>
        ) : (
          <div className={`instruction-icon instruction-icon-${instruction.status}`}>
            {instruction.authorInitials}
          </div>
        )}

        <div className="instruction-details">
          <div className="instruction-title-row">
            <span className="instruction-title">{instruction.title}</span>
            {instruction.version && (
              <span className="instruction-version">{instruction.version}</span>
            )}
          </div>
          {instruction.description && (
            <p className="instruction-description">{instruction.description}</p>
          )}
          <p className="instruction-meta">
            {instruction.author} &bull; {instruction.updatedAt}
          </p>
        </div>

        <span className={`instruction-badge ${config.badgeClass}`}>
          {config.badgeLabel}
        </span>

        <ChevronRight className="instruction-chevron" size={18} aria-hidden="true" />
      </div>
    </button>
  );
};

interface StatusSectionProps {
  status: InstructionStatus;
  instructions: Instruction[];
  onSelectInstruction: (instructionId: string) => void;
}

const StatusSection: React.FC<StatusSectionProps> = ({
  status,
  instructions,
  onSelectInstruction,
}) => {
  if (instructions.length === 0) return null;

  const SectionIcon = LIST_SECTION_ICONS[status];
  const config = STATUS_CONFIG[status];

  return (
    <section className="instruction-section">
      <header className="instruction-section-header">
        <SectionIcon size={14} aria-hidden="true" />
        <span>{config.sectionLabel}</span>
      </header>

      <div className="instruction-list">
        {instructions.map((instruction) => (
          <InstructionCard
            key={instruction.id}
            instruction={instruction}
            onSelect={onSelectInstruction}
          />
        ))}
      </div>
    </section>
  );
};

interface VersionEntryCardProps {
  entry: VersionEntry;
}

const VersionEntryCard: React.FC<VersionEntryCardProps> = ({ entry }) => {
  const config = VERSION_HISTORY_CONFIG[entry.status];
  const hasAction = Boolean(config.actionLabel);

  return (
    <article className="version-entry-card">
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
            <button type="button" className="version-action-btn">
              {config.actionLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

interface VersionHistorySectionProps {
  status: VersionHistoryStatus;
  entries: VersionEntry[];
}

const VersionHistorySection: React.FC<VersionHistorySectionProps> = ({ status, entries }) => {
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
          <VersionEntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
};

interface ArchivedSectionProps {
  archivedVersions: string[];
}

const ArchivedSection: React.FC<ArchivedSectionProps> = ({ archivedVersions }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (archivedVersions.length === 0) return null;

  const versionLabel =
    archivedVersions.length === 1 ? 'older version' : 'older versions';

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
            {archivedVersions.map((version) => (
              <span key={version} className="version-archived-tag">
                {version}
              </span>
            ))}
          </div>
          <p className="version-archived-label">
            {archivedVersions.length} {versionLabel} &bull; tap to expand
          </p>
        </div>
        <ChevronRight className="instruction-chevron" size={18} aria-hidden="true" />
      </button>

      {isExpanded && (
        <ul className="version-archived-list">
          {archivedVersions.map((version) => (
            <li key={version} className="version-archived-list-item">
              {version}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

interface InstructionListViewProps {
  onSelectInstruction: (instructionId: string) => void;
}

const InstructionListView: React.FC<InstructionListViewProps> = ({
  onSelectInstruction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredInstructions = useMemo(
    () =>
      INSTRUCTIONS.filter(
        (instruction) =>
          matchesSearch(instruction, searchTerm) &&
          matchesFilter(instruction, statusFilter),
      ),
    [searchTerm, statusFilter],
  );

  const groupedInstructions = useMemo(() => {
    const groups = STATUS_ORDER.reduce(
      (acc, status) => {
        acc[status] = filteredInstructions.filter(
          (instruction) => instruction.status === status,
        );
        return acc;
      },
      {} as Record<InstructionStatus, Instruction[]>,
    );

    return STATUS_ORDER.map((status) => ({
      status,
      instructions: groups[status],
    })).filter((group) => group.instructions.length > 0);
  }, [filteredInstructions]);

  const instructionCount = filteredInstructions.length;
  const instructionLabel = instructionCount === 1 ? 'Instruction' : 'Instructions';

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Work Instruction Statuses</h1>
          <p className="dashboard-subtitle">
            {instructionCount} {instructionLabel}
          </p>
        </div>
      </header>

      <div className="instruction-toolbar glass-card">
        <div className="instruction-search-wrapper">
          <Search className="instruction-search-icon" size={16} aria-hidden="true" />
          <input
            type="search"
            className="form-input instruction-search-input"
            placeholder="Search Instructions...."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search instructions"
          />
        </div>

        <div className="instruction-filters" role="group" aria-label="Filter by status">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`instruction-filter-btn${
                statusFilter === option.value ? ' active' : ''
              }`}
              onClick={() => setStatusFilter(option.value)}
              aria-pressed={statusFilter === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="instruction-groups">
        {groupedInstructions.length > 0 ? (
          groupedInstructions.map((group) => (
            <StatusSection
              key={group.status}
              status={group.status}
              instructions={group.instructions}
              onSelectInstruction={onSelectInstruction}
            />
          ))
        ) : (
          <div className="instruction-empty glass-card">
            No instructions found matching your search or filters.
          </div>
        )}
      </div>
    </>
  );
};

interface VersionHistoryViewProps {
  instruction: Instruction;
  onBack: () => void;
}

const VersionHistoryView: React.FC<VersionHistoryViewProps> = ({ instruction, onBack }) => {
  const history = getVersionHistory(instruction.id);

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
          />
        ))}

        <ArchivedSection archivedVersions={history.archivedVersions} />
      </div>
    </>
  );
};

export const Versions: React.FC = () => {
  const [selectedInstructionId, setSelectedInstructionId] = useState<string | null>(
    null,
  );

  const selectedInstruction = useMemo(
    () => INSTRUCTIONS.find((instruction) => instruction.id === selectedInstructionId),
    [selectedInstructionId],
  );

  return (
    <div className="dashboard-container">
      {selectedInstruction ? (
        <VersionHistoryView
          instruction={selectedInstruction}
          onBack={() => setSelectedInstructionId(null)}
        />
      ) : (
        <InstructionListView onSelectInstruction={setSelectedInstructionId} />
      )}
    </div>
  );
};
