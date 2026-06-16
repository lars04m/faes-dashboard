import React, { useMemo, useState } from 'react';
import {
  Search,
  ChevronRight,
  Bell,
  MessageCircle,
  Pencil,
  FileText,
} from 'lucide-react';
import './Versions.css';

type InstructionStatus = 'live' | 'review' | 'draft';
type StatusFilter = 'all' | InstructionStatus;

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

const STATUS_ORDER: InstructionStatus[] = ['live', 'review', 'draft'];

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
  },
  {
    id: 'wi-2',
    title: 'Product T28',
    version: 'v3.3',
    author: 'Jane Larsen',
    updatedAt: 'June 1st',
    status: 'live',
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

const SECTION_ICONS: Record<InstructionStatus, React.ElementType> = {
  live: Bell,
  review: MessageCircle,
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

interface InstructionCardProps {
  instruction: Instruction;
}

const InstructionCard: React.FC<InstructionCardProps> = ({ instruction }) => {
  const config = STATUS_CONFIG[instruction.status];
  const isLive = instruction.status === 'live';

  return (
    <button type="button" className="instruction-card">
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
}

const StatusSection: React.FC<StatusSectionProps> = ({ status, instructions }) => {
  if (instructions.length === 0) return null;

  const SectionIcon = SECTION_ICONS[status];
  const config = STATUS_CONFIG[status];

  return (
    <section className="instruction-section">
      <header className="instruction-section-header">
        <SectionIcon size={14} aria-hidden="true" />
        <span>{config.sectionLabel}</span>
      </header>

      <div className="instruction-list">
        {instructions.map((instruction) => (
          <InstructionCard key={instruction.id} instruction={instruction} />
        ))}
      </div>
    </section>
  );
};

export const Versions: React.FC = () => {
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
    <div className="dashboard-container">
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
            />
          ))
        ) : (
          <div className="instruction-empty glass-card">
            No instructions found matching your search or filters.
          </div>
        )}
      </div>
    </div>
  );
};
