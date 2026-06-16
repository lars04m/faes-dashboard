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
import stepVisualImage from '../assets/image-1.png';
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

type PreviewStepType = 'normal' | 'removed' | 'added' | 'visual';

interface PreviewStep {
  type: PreviewStepType;
  title: string;
  content: string;
  badge?: string;
}

interface ReviewData {
  author: string;
  version: string;
  date: string;
  comment: string;
  checklist: string[];
  previewSteps: PreviewStep[];
}

interface OperatorOnShift {
  id: string;
  name: string;
  initials: string;
  assignment: string;
}

interface PublishData {
  author: string;
  version: string;
  date: string;
  comment: string;
  previewSteps: PreviewStep[];
  operatorsOnShift: OperatorOnShift[];
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

const DEFAULT_OPERATORS_ON_SHIFT: OperatorOnShift[] = [
  {
    id: 'op-1',
    name: 'Stefan Witlox',
    initials: 'SW',
    assignment: 'Triage T-8',
  },
  {
    id: 'op-2',
    name: 'Tim Kuijpers',
    initials: 'TK',
    assignment: 'Triage T-8',
  },
];

const DEFAULT_PREVIEW_STEPS: PreviewStep[] = [
  { type: 'normal', title: 'Step 1', content: 'Put on gloves' },
  { type: 'normal', title: 'Step 2', content: 'Tilt the product this way' },
  {
    type: 'removed',
    title: 'Step 3 - REMOVED',
    content: 'Tighten bolt X',
  },
  {
    type: 'added',
    title: 'Step 3 - ADDED',
    content: 'Tighten bolt Y 4x',
  },
  {
    type: 'visual',
    title: 'Step 3 - Visual',
    content: 'Image of 4x Y\'s placement',
    badge: 'Visual',
  },
];

const DEFAULT_REVIEW_DATA: ReviewData = {
  author: 'Jane Larsen',
  version: 'v3.3',
  date: 'June 1st',
  comment:
    'I added visuals for step 4 and replaced the text with more active wording.',
  checklist: [
    'Technically accurate and safe to follow',
    'Clear and correct visuals',
    'Simple language and contains active wording',
  ],
  previewSteps: DEFAULT_PREVIEW_STEPS,
};

const DEFAULT_PUBLISH_DATA: PublishData = {
  author: 'Jane Larsen',
  version: 'v3.3',
  date: 'June 1st',
  comment:
    'I added visuals for step 4 and replaced the text with more active wording.',
  previewSteps: DEFAULT_PREVIEW_STEPS,
  operatorsOnShift: DEFAULT_OPERATORS_ON_SHIFT,
};

const REVIEW_DATA_BY_ENTRY: Record<string, ReviewData> = {
  'v-1-draft': DEFAULT_REVIEW_DATA,
  'v-4-draft': {
    ...DEFAULT_REVIEW_DATA,
    author: 'Sara Willems',
    version: 'v0.9',
  },
};

const PUBLISH_DATA_BY_ENTRY: Record<string, PublishData> = {
  'v-1-ready': DEFAULT_PUBLISH_DATA,
  'v-3-ready': {
    ...DEFAULT_PUBLISH_DATA,
    author: 'Marc Bakker',
    version: 'v1.2',
  },
};

function getReviewData(entry: VersionEntry): ReviewData {
  return (
    REVIEW_DATA_BY_ENTRY[entry.id] ?? {
      ...DEFAULT_REVIEW_DATA,
      author: entry.author,
      version: entry.version,
      date: entry.updatedAt,
    }
  );
}

function getPublishData(entry: VersionEntry): PublishData {
  return (
    PUBLISH_DATA_BY_ENTRY[entry.id] ?? {
      ...DEFAULT_PUBLISH_DATA,
      author: entry.author,
      version: entry.version,
      date: entry.updatedAt,
    }
  );
}

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
  onReview?: (entryId: string) => void;
  onPublish?: (entryId: string) => void;
}

const VersionEntryCard: React.FC<VersionEntryCardProps> = ({
  entry,
  onReview,
  onPublish,
}) => {
  const config = VERSION_HISTORY_CONFIG[entry.status];
  const hasAction = Boolean(config.actionLabel);
  const isReviewAction = entry.status === 'draft' && config.actionLabel === 'Review';
  const isPublishAction =
    entry.status === 'ready-to-publish' && config.actionLabel === 'Publish';

  const handleAction = () => {
    if (isReviewAction) onReview?.(entry.id);
    if (isPublishAction) onPublish?.(entry.id);
  };

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
            <button type="button" className="version-action-btn" onClick={handleAction}>
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
  onReview?: (entryId: string) => void;
  onPublish?: (entryId: string) => void;
}

const VersionHistorySection: React.FC<VersionHistorySectionProps> = ({
  status,
  entries,
  onReview,
  onPublish,
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
          />
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
  onReview: (entryId: string) => void;
  onPublish: (entryId: string) => void;
}

const VersionHistoryView: React.FC<VersionHistoryViewProps> = ({
  instruction,
  onBack,
  onReview,
  onPublish,
}) => {
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
            onReview={onReview}
            onPublish={onPublish}
          />
        ))}

        <ArchivedSection archivedVersions={history.archivedVersions} />
      </div>
    </>
  );
};

interface PreviewStepCardProps {
  step: PreviewStep;
}

const PreviewStepCard: React.FC<PreviewStepCardProps> = ({ step }) => {
  if (step.type === 'visual') {
    return (
      <article className="review-step-card review-step-visual">
        <div className="review-step-header">
          <h3 className="review-step-title">{step.title}</h3>
          {step.badge && <span className="review-step-badge">{step.badge}</span>}
        </div>
        <p className="review-step-content">{step.content}</p>
        <img
          className="review-visual-image"
          src={stepVisualImage}
          alt="Assembly diagram showing 4x E020425 cylinder placement"
        />
      </article>
    );
  }

  return (
    <article className={`review-step-card review-step-${step.type}`}>
      <h3 className="review-step-title">{step.title}</h3>
      <p className="review-step-content">{step.content}</p>
    </article>
  );
};

interface VersionDetailsCardProps {
  author: string;
  version: string;
  date: string;
  comment: string;
}

const VersionDetailsCard: React.FC<VersionDetailsCardProps> = ({
  author,
  version,
  date,
  comment,
}) => (
  <section className="review-details-card glass-card">
    <header className="review-section-header">
      <span>VERSION DETAILS</span>
    </header>

    <dl className="review-meta-grid">
      <div className="review-meta-item">
        <dt>AUTHOR</dt>
        <dd>{author}</dd>
      </div>
      <div className="review-meta-item">
        <dt>VERSION</dt>
        <dd>{version}</dd>
      </div>
      <div className="review-meta-item">
        <dt>DATE</dt>
        <dd>{date}</dd>
      </div>
    </dl>

    <textarea
      className="review-comment"
      readOnly
      value={comment}
      aria-label="Author comment"
    />
  </section>
);

interface PreviewPanelProps {
  previewSteps: PreviewStep[];
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ previewSteps }) => (
  <section className="review-preview glass-card">
    <header className="review-section-header">
      <span>PREVIEW</span>
      <div className="review-legend">
        <span className="review-legend-item">
          <span className="review-legend-dot review-legend-dot--removed" />
          REMOVED
        </span>
        <span className="review-legend-item">
          <span className="review-legend-dot review-legend-dot--added" />
          ADDED
        </span>
      </div>
    </header>

    <div className="review-steps">
      {previewSteps.map((step, index) => (
        <PreviewStepCard key={`${step.title}-${index}`} step={step} />
      ))}
    </div>
  </section>
);

interface OperatorImpactSectionProps {
  operators: OperatorOnShift[];
}

const OperatorImpactSection: React.FC<OperatorImpactSectionProps> = ({ operators }) => {
  const [notifyOperators, setNotifyOperators] = useState(true);
  const operatorCount = operators.length;

  return (
    <section className="publish-operator-card glass-card">
      <header className="review-section-header">
        <span>OPERATOR IMPACT - {operatorCount} ON SHIFT</span>
      </header>

      <div className="publish-notify-panel">
        <div className="publish-notify-copy">
          <p className="publish-notify-title">Notify operators on publish</p>
          <p className="publish-notify-subtitle">
            Send an update to all operators on shift
          </p>
        </div>
        <button
          type="button"
          className={`publish-toggle${notifyOperators ? ' active' : ''}`}
          role="switch"
          aria-checked={notifyOperators}
          aria-label="Notify operators on publish"
          onClick={() => setNotifyOperators((prev) => !prev)}
        >
          <span className="publish-toggle-thumb" />
        </button>
      </div>

      <ul className="publish-operator-list">
        {operators.map((operator) => (
          <li key={operator.id} className="publish-operator-item">
            <div className="publish-operator-profile">
              <span className="publish-operator-avatar">{operator.initials}</span>
              <div>
                <p className="publish-operator-name">{operator.name}</p>
                <p className="publish-operator-assignment">{operator.assignment}</p>
              </div>
            </div>
            {notifyOperators && (
              <span className="publish-operator-badge">Will be notified</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

interface ReviewViewProps {
  entry: VersionEntry;
  onBack: () => void;
}

const ReviewView: React.FC<ReviewViewProps> = ({ entry, onBack }) => {
  const reviewData = getReviewData(entry);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleChecklistItem = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const isApproveEnabled = useMemo(
    () => reviewData.checklist.every((_, index) => checkedItems[index] === true),
    [reviewData.checklist, checkedItems],
  );

  return (
    <div className="review-page">
      <header className="review-header">
        <div className="review-header-left">
          <button type="button" className="version-back-btn" onClick={onBack}>
            <ChevronLeft size={16} aria-hidden="true" />
            Version History
          </button>
          <p className="version-history-breadcrumb">
            /{reviewData.version} - Review
          </p>
        </div>
        <span className="instruction-badge version-badge-progress">In progress</span>
      </header>

      <div className="review-layout">
        <PreviewPanel previewSteps={reviewData.previewSteps} />

        <aside className="review-sidebar">
          <VersionDetailsCard
            author={reviewData.author}
            version={reviewData.version}
            date={reviewData.date}
            comment={reviewData.comment}
          />

          <section className="review-checklist-card glass-card">
            <header className="review-section-header">
              <span>CHECKLIST</span>
            </header>

            <ul className="review-checklist">
              {reviewData.checklist.map((item, index) => (
                <li key={item}>
                  <label className="review-checklist-item">
                    <input
                      type="checkbox"
                      checked={checkedItems[index] ?? false}
                      onChange={() => toggleChecklistItem(index)}
                    />
                    <span className="review-checkbox" aria-hidden="true" />
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <div className="review-actions">
        <button type="button" className="review-btn review-btn-reject">
          Reject
        </button>
        <button
          type="button"
          className="review-btn review-btn-approve"
          disabled={!isApproveEnabled}
        >
          Approve {reviewData.version}
        </button>
      </div>
    </div>
  );
};

interface PublishViewProps {
  entry: VersionEntry;
  onBack: () => void;
}

const PublishView: React.FC<PublishViewProps> = ({ entry, onBack }) => {
  const publishData = getPublishData(entry);

  return (
    <div className="review-page">
      <header className="review-header">
        <div className="review-header-left">
          <button type="button" className="version-back-btn" onClick={onBack}>
            <ChevronLeft size={16} aria-hidden="true" />
            Version History
          </button>
          <p className="version-history-breadcrumb">
            /{publishData.version} - Publish
          </p>
        </div>
        <span className="instruction-badge version-badge-approved">Approved</span>
      </header>

      <div className="review-layout">
        <PreviewPanel previewSteps={publishData.previewSteps} />

        <aside className="review-sidebar">
          <VersionDetailsCard
            author={publishData.author}
            version={publishData.version}
            date={publishData.date}
            comment={publishData.comment}
          />

          <OperatorImpactSection operators={publishData.operatorsOnShift} />
        </aside>
      </div>

      <div className="review-actions">
        <button type="button" className="review-btn review-btn-reject">
          Cancel
        </button>
        <button type="button" className="review-btn review-btn-approve">
          Publish {publishData.version}
        </button>
      </div>
    </div>
  );
};

function findVersionEntry(instructionId: string, entryId: string): VersionEntry | undefined {
  return getVersionHistory(instructionId).entries.find((entry) => entry.id === entryId);
}

export const Versions: React.FC = () => {
  const [selectedInstructionId, setSelectedInstructionId] = useState<string | null>(
    null,
  );
  const [selectedReviewEntryId, setSelectedReviewEntryId] = useState<string | null>(
    null,
  );
  const [selectedPublishEntryId, setSelectedPublishEntryId] = useState<string | null>(
    null,
  );

  const selectedInstruction = useMemo(
    () => INSTRUCTIONS.find((instruction) => instruction.id === selectedInstructionId),
    [selectedInstructionId],
  );

  const selectedReviewEntry = useMemo(() => {
    if (!selectedInstructionId || !selectedReviewEntryId) return undefined;
    return findVersionEntry(selectedInstructionId, selectedReviewEntryId);
  }, [selectedInstructionId, selectedReviewEntryId]);

  const selectedPublishEntry = useMemo(() => {
    if (!selectedInstructionId || !selectedPublishEntryId) return undefined;
    return findVersionEntry(selectedInstructionId, selectedPublishEntryId);
  }, [selectedInstructionId, selectedPublishEntryId]);

  const isWorkflowView = Boolean(
    selectedInstruction && (selectedReviewEntry || selectedPublishEntry),
  );

  const handleBackFromHistory = () => {
    setSelectedInstructionId(null);
    setSelectedReviewEntryId(null);
    setSelectedPublishEntryId(null);
  };

  const handleBackFromReview = () => {
    setSelectedReviewEntryId(null);
  };

  const handleBackFromPublish = () => {
    setSelectedPublishEntryId(null);
  };

  return (
    <div
      className={`dashboard-container${isWorkflowView ? ' dashboard-container--review' : ''}`}
    >
      {selectedInstruction && selectedPublishEntry ? (
        <PublishView entry={selectedPublishEntry} onBack={handleBackFromPublish} />
      ) : selectedInstruction && selectedReviewEntry ? (
        <ReviewView entry={selectedReviewEntry} onBack={handleBackFromReview} />
      ) : selectedInstruction ? (
        <VersionHistoryView
          instruction={selectedInstruction}
          onBack={handleBackFromHistory}
          onReview={setSelectedReviewEntryId}
          onPublish={setSelectedPublishEntryId}
        />
      ) : (
        <InstructionListView onSelectInstruction={setSelectedInstructionId} />
      )}
    </div>
  );
};
