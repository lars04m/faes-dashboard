import React, { useMemo, useState } from 'react';
import { ChevronRight, FileText, Search } from 'lucide-react';
import { FILTER_OPTIONS, STATUS_CONFIG, STATUS_ORDER } from '../constants';
import { LIST_SECTION_ICONS } from '../icons';
import { matchesFilter, matchesSearch } from '../helpers';
import type { Instruction, InstructionStatus, StatusFilter } from '../types';

export interface InstructionCardProps {
  instruction: Instruction;
  onSelect: (instructionId: string) => void;
}

/** Clickable card for one work instruction on the main list. */
export const InstructionCard: React.FC<InstructionCardProps> = ({ instruction, onSelect }) => {
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

export interface StatusSectionProps {
  status: InstructionStatus;
  instructions: Instruction[];
  onSelectInstruction: (instructionId: string) => void;
}

export const StatusSection: React.FC<StatusSectionProps> = ({
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

export interface InstructionListViewProps {
  instructions: Instruction[];
  onSelectInstruction: (instructionId: string) => void;
}

/** Main list with search, status filters, and grouped instruction cards. */
export const InstructionListView: React.FC<InstructionListViewProps> = ({
  instructions,
  onSelectInstruction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredInstructions = useMemo(
    () =>
      instructions.filter(
        (instruction) =>
          matchesSearch(instruction, searchTerm) &&
          matchesFilter(instruction, statusFilter),
      ),
    [instructions, searchTerm, statusFilter],
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
