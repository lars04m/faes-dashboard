import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Layers, Plus, BookOpen, X, MoreHorizontal, MoreVertical, GripVertical, Pencil, Copy, Trash2 } from 'lucide-react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Step, Module } from './types';

// ── SortableStepRow ──────────────────────────────────────────────────────────

interface RowProps {
  step: Step;
  idx: number;
  moduleId: string;
  isSelected: boolean;
  isRenaming: boolean;
  renameValue: string;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  menuOpen: boolean;
  descText: string;
  onSelect: () => void;
  onRenameChange: (val: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onStartRename: (e: React.MouseEvent) => void;
  onToggleMenu: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onMenuEdit: (e: React.MouseEvent) => void;
}

const SortableStepRow: React.FC<RowProps> = ({
  step, idx, moduleId, isSelected, isRenaming, renameValue, renameInputRef,
  menuOpen, descText,
  onSelect, onRenameChange, onCommitRename, onCancelRename, onStartRename,
  onToggleMenu, onDelete, onDuplicate, onMenuEdit,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
    data: { type: 'step', stepId: step.id, fromModuleId: moduleId },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={isSelected ? 'active' : ''}
      onClick={() => { if (!isRenaming) onSelect(); }}
    >
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <div
            className="drag-handle"
            {...attributes}
            {...listeners}
            onClick={e => e.stopPropagation()}
            title="Drag to reorder or move to another module"
          >
            <GripVertical size={13} />
          </div>
          <span className="sheet-step-num">{idx + 1}</span>
        </div>
      </td>
      <td>
        <div className="steps-table-name-cell">
          {isRenaming ? (
            <input
              ref={renameInputRef}
              className="step-rename-input"
              value={renameValue}
              placeholder={step.name || descText}
              onClick={e => e.stopPropagation()}
              onChange={e => onRenameChange(e.target.value)}
              onBlur={onCommitRename}
              onKeyDown={e => {
                if (e.key === 'Enter') onCommitRename();
                if (e.key === 'Escape') onCancelRename();
              }}
            />
          ) : step.name ? (
            <span className="steps-table-desc steps-table-named">{step.name}</span>
          ) : (
            <span className="steps-table-desc">{descText}</span>
          )}
        </div>
      </td>
      <td>
        <div className="step-row-actions" style={{ position: 'relative' }}>
          <button
            className="step-action-btn"
            title="More options"
            onClick={onToggleMenu}
          >
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="module-card-dropdown step-menu-dropdown" onClick={e => e.stopPropagation()}>
              <button className="module-card-dropdown-item" onClick={onMenuEdit}>Edit</button>
              <button className="module-card-dropdown-item" onClick={onStartRename}>Rename</button>
              <button className="module-card-dropdown-item" onClick={onDuplicate}>Duplicate</button>
              <button className="module-card-dropdown-item danger" onClick={onDelete}>Remove</button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

interface Props {
  isLibraryOpen: boolean;
  selectedModule: Module | null;
  selectedModuleId: string | null;
  effectiveSteps: Step[];
  selectedStepId: string | null;
  libraryShared: Module[];
  libraryFromOthers: Module[];
  moduleUsageCount: (id: string) => number;
  onSelectStep: (id: string) => void;
  onAddStep: () => void;
  onDeleteStep: (stepId: string, e: React.MouseEvent) => void;
  onRenameStep: (stepId: string, name: string) => void;
  onDuplicateStep: (stepId: string) => void;
  onAddModule: (id: string) => void;
  onCloseLibrary: () => void;
  renamingModuleId: string | null;
  moduleRenameValue: string;
  onModuleRenameValueChange: (value: string) => void;
  onStartRename: (id: string, name: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onDuplicateModule: (id: string) => void;
  onDeleteModule: (id: string) => void;
}

export const StepsPanel: React.FC<Props> = ({
  isLibraryOpen,
  selectedModule,
  selectedModuleId,
  effectiveSteps,
  selectedStepId,
  libraryShared,
  libraryFromOthers,
  moduleUsageCount,
  onSelectStep,
  onAddStep,
  onDeleteStep,
  onRenameStep,
  onDuplicateStep,
  onAddModule,
  onCloseLibrary,
  renamingModuleId,
  moduleRenameValue,
  onModuleRenameValueChange,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onDuplicateModule,
  onDeleteModule,
}) => {
  const [openMenuStepId, setOpenMenuStepId] = useState<string | null>(null);
  const [renamingStepId, setRenamingStepId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingStepId && renameInputRef.current) renameInputRef.current.focus();
  }, [renamingStepId]);

  const startRename = (step: Step, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuStepId(null);
    setRenamingStepId(step.id);
    setRenameValue(step.name ?? '');
  };

  const commitRename = (stepId: string) => {
    onRenameStep(stepId, renameValue);
    setRenamingStepId(null);
  };
  if (isLibraryOpen) {
    return <LibraryPanel
      libraryShared={libraryShared}
      libraryFromOthers={libraryFromOthers}
      moduleUsageCount={moduleUsageCount}
      onAddModule={onAddModule}
      onClose={onCloseLibrary}
      renamingModuleId={renamingModuleId}
      moduleRenameValue={moduleRenameValue}
      onModuleRenameValueChange={onModuleRenameValueChange}
      onStartRename={onStartRename}
      onCommitRename={onCommitRename}
      onCancelRename={onCancelRename}
      onDuplicateModule={onDuplicateModule}
      onDeleteModule={onDeleteModule}
    />;
  }

  if (!selectedModule) {
    return (
      <div className="glass-card steps-content-panel">
        <div className="panel-empty-state">
          <Layers size={36} strokeWidth={1.2} />
          <p>Select a module to view and edit its steps</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card steps-content-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <span className="panel-title">{selectedModule.name}</span>
        </div>
      </div>

      {effectiveSteps.length === 0 ? (
        <div className="panel-empty-state">
          <Plus size={28} strokeWidth={1.2} />
          <p>No steps yet</p>
          <button className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={onAddStep}>
            Add First Step
          </button>
        </div>
      ) : (
        <table className="steps-table" onClick={() => setOpenMenuStepId(null)}>
          <thead>
            <tr>
              <th style={{ width: '56px' }}>№</th>
              <th>Name</th>
              <th style={{ width: '40px' }} />
            </tr>
          </thead>
          <tbody>
            <SortableContext items={effectiveSteps.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {effectiveSteps.map((step, idx) => {
                const descText = step.action || step.caption || '—';
                const isRenaming = renamingStepId === step.id;
                const menuOpen = openMenuStepId === step.id;
                return (
                  <SortableStepRow
                    key={step.id}
                    step={step}
                    idx={idx}
                    moduleId={selectedModuleId!}
                    isSelected={selectedStepId === step.id}
                    isRenaming={isRenaming}
                    renameValue={renameValue}
                    renameInputRef={renameInputRef}
                    menuOpen={menuOpen}
                    descText={descText}
                    onSelect={() => onSelectStep(step.id)}
                    onRenameChange={setRenameValue}
                    onCommitRename={() => commitRename(step.id)}
                    onCancelRename={() => setRenamingStepId(null)}
                    onStartRename={e => startRename(step, e)}
                    onToggleMenu={e => { e.stopPropagation(); setOpenMenuStepId(menuOpen ? null : step.id); }}
                    onDelete={e => { setOpenMenuStepId(null); onDeleteStep(step.id, e); }}
                    onDuplicate={e => { e.stopPropagation(); setOpenMenuStepId(null); onDuplicateStep(step.id); }}
                    onMenuEdit={e => { e.stopPropagation(); setOpenMenuStepId(null); onSelectStep(step.id); }}
                  />
                );
              })}
            </SortableContext>
            <tr className="step-add-row" onClick={onAddStep}>
              <td colSpan={3}>
                <span className="step-add-row-label">
                  <Plus size={13} /> Add step
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

// ── Library panel ────────────────────────────────────────────────────────────

interface LibraryPanelProps {
  libraryShared: Module[];
  libraryFromOthers: Module[];
  moduleUsageCount: (id: string) => number;
  onAddModule: (id: string) => void;
  onClose: () => void;
  renamingModuleId: string | null;
  moduleRenameValue: string;
  onModuleRenameValueChange: (value: string) => void;
  onStartRename: (id: string, name: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onDuplicateModule: (id: string) => void;
  onDeleteModule: (id: string) => void;
}

interface LibraryModuleCardProps {
  mod: Module;
  count: number;
  isRenaming: boolean;
  renameValue: string;
  menuOpen: boolean;
  onRenameValueChange: (value: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onToggleMenu: (e: React.MouseEvent) => void;
  onCloseMenu: () => void;
  onStartRename: (id: string, name: string) => void;
  onDuplicateModule: (id: string) => void;
  onDeleteModule: (id: string) => void;
  onAddModule: (id: string) => void;
}

const LibraryModuleCard: React.FC<LibraryModuleCardProps> = ({
  mod, count, isRenaming, renameValue, menuOpen,
  onRenameValueChange, onCommitRename, onCancelRename,
  onToggleMenu, onCloseMenu, onStartRename, onDuplicateModule, onDeleteModule,
  onAddModule,
}) => {
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!menuOpen) {
      const rect = menuBtnRef.current?.getBoundingClientRect();
      if (rect) setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    onToggleMenu(e);
  };

  return (
    <div className="library-module-card">
      <div className="library-module-top">
        {isRenaming ? (
          <input
            className="form-input module-sidebar-rename-input"
            value={renameValue}
            autoFocus
            onChange={e => onRenameValueChange(e.target.value)}
            onBlur={onCommitRename}
            onKeyDown={e => {
              if (e.key === 'Enter') onCommitRename();
              if (e.key === 'Escape') onCancelRename();
            }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="library-module-name">{mod.name}</span>
        )}
        {!isRenaming && (
          <div className="library-module-menu-wrap" onClick={e => e.stopPropagation()}>
            <button
              ref={menuBtnRef}
              className="module-sidebar-menu-btn"
              onClick={handleMenuToggle}
              title="More actions"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && menuPos && ReactDOM.createPortal(
              <div
                className="module-card-dropdown"
                style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
                onClick={e => e.stopPropagation()}
              >
                <button className="module-card-dropdown-item" onClick={() => { onStartRename(mod.id, mod.name); onCloseMenu(); }}>
                  <Pencil size={13} /> Rename
                </button>
                <button className="module-card-dropdown-item" onClick={() => { onDuplicateModule(mod.id); onCloseMenu(); }}>
                  <Copy size={13} /> Duplicate
                </button>
                <button className="module-card-dropdown-item danger" onClick={() => { onDeleteModule(mod.id); onCloseMenu(); }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>,
              document.body
            )}
          </div>
        )}
      </div>
      <p className="library-module-desc">{mod.description}</p>
      <div className="library-module-footer">
        <span className="library-usage-count">
          {mod.isShared
            ? `Used in ${count} product${count !== 1 ? 's' : ''}`
            : count > 0
              ? `Used in ${count} product${count !== 1 ? 's' : ''}`
              : 'No other products'}
        </span>
        <button className="btn-primary library-action-btn" onClick={() => onAddModule(mod.id)}>
          + Add
        </button>
      </div>
    </div>
  );
};

const LibraryPanel: React.FC<LibraryPanelProps> = ({
  libraryShared,
  libraryFromOthers,
  moduleUsageCount,
  onAddModule,
  onClose,
  renamingModuleId,
  moduleRenameValue,
  onModuleRenameValueChange,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onDuplicateModule,
  onDeleteModule,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuModId, setOpenMenuModId] = useState<string | null>(null);
  const allModules = [...libraryShared, ...libraryFromOthers];
  const filteredModules = allModules.filter(mod =>
    mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="library-panel glass-card">
      <div className="panel-header">
        <span className="panel-title">
          <BookOpen size={14} className="panel-title-icon" />
          Browse Modules
        </span>
        <button className="btn-secondary library-close-btn" onClick={onClose}>
          <X size={13} /> Close
        </button>
      </div>
      <div className="library-search">
        <input
          type="text"
          className="form-input ib-search-input"
          placeholder="Search…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="library-scroll" onClick={() => setOpenMenuModId(null)}>
        {allModules.length === 0 && (
          <div className="ib-empty-state library-empty">
            <p>All available modules are already added.</p>
          </div>
        )}
        {allModules.length > 0 && filteredModules.length === 0 && (
          <div className="ib-empty-state library-empty">
            <p>No modules found</p>
          </div>
        )}
        {filteredModules.map(mod => (
          <LibraryModuleCard
            key={mod.id}
            mod={mod}
            count={moduleUsageCount(mod.id)}
            isRenaming={renamingModuleId === mod.id}
            renameValue={moduleRenameValue}
            menuOpen={openMenuModId === mod.id}
            onRenameValueChange={onModuleRenameValueChange}
            onCommitRename={onCommitRename}
            onCancelRename={onCancelRename}
            onToggleMenu={() => setOpenMenuModId(openMenuModId === mod.id ? null : mod.id)}
            onCloseMenu={() => setOpenMenuModId(null)}
            onStartRename={onStartRename}
            onDuplicateModule={onDuplicateModule}
            onDeleteModule={onDeleteModule}
            onAddModule={onAddModule}
          />
        ))}
      </div>
    </div>
  );
};
