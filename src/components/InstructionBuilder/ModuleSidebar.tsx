import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Layers, Plus, BookOpen, MoreVertical, Pencil, Copy, Trash2, GripVertical, Upload } from 'lucide-react';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Module } from './types';

interface Props {
  productModules: Module[];
  selectedModuleId: string | null;
  renamingModuleId: string | null;
  renameValue: string;
  openMenuModuleId: string | null;
  draggingStepId: string | null;
  onSelectModule: (id: string) => void;
  onOpenMenuChange: (id: string | null) => void;
  onRenameValueChange: (value: string) => void;
  onStartRename: (id: string, name: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onAddCustomModule: () => void;
  onOpenLibrary: () => void;
  onRemoveModule: (id: string) => void;
  onDuplicateModule: (id: string) => void;
  onPublishToLibrary: (id: string) => void;
}

interface ItemProps {
  mod: Module;
  idx: number;
  selectedModuleId: string | null;
  renamingModuleId: string | null;
  renameValue: string;
  openMenuModuleId: string | null;
  draggingStepId: string | null;
  onSelectModule: (id: string) => void;
  onOpenMenuChange: (id: string | null) => void;
  onRenameValueChange: (value: string) => void;
  onStartRename: (id: string, name: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onRemoveModule: (id: string) => void;
  onDuplicateModule: (id: string) => void;
  onPublishToLibrary: (id: string) => void;
}

const SortableModuleItem: React.FC<ItemProps> = ({
  mod, idx, selectedModuleId, renamingModuleId, renameValue, openMenuModuleId,
  draggingStepId,
  onSelectModule, onOpenMenuChange, onRenameValueChange, onStartRename,
  onCommitRename, onCancelRename, onRemoveModule, onDuplicateModule, onPublishToLibrary,
}) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging, isOver,
  } = useSortable({ id: mod.id, data: { type: 'module', moduleId: mod.id } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isDropTarget = isOver && !!draggingStepId;

  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (openMenuModuleId !== mod.id) {
      const rect = menuBtnRef.current?.getBoundingClientRect();
      if (rect) setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    onOpenMenuChange(openMenuModuleId === mod.id ? null : mod.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'module-sidebar-item',
        selectedModuleId === mod.id ? 'active' : '',
        isDropTarget ? 'is-drop-target' : '',
      ].filter(Boolean).join(' ')}
      onClick={() => onSelectModule(mod.id)}
    >
      <div
        className="drag-handle"
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
        title="Drag to reorder"
      >
        <GripVertical size={13} />
      </div>

      <span className="module-sidebar-num">{idx + 1}.</span>

      {renamingModuleId === mod.id ? (
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
        <span className="module-sidebar-name">{mod.name}</span>
      )}

      {renamingModuleId !== mod.id && (
        <div className="module-sidebar-menu-wrap" onClick={e => e.stopPropagation()}>
          <button
            ref={menuBtnRef}
            className="module-sidebar-menu-btn"
            onClick={handleMenuToggle}
            title="More actions"
          >
            <MoreVertical size={14} />
          </button>
          {openMenuModuleId === mod.id && menuPos && ReactDOM.createPortal(
            <div
              className="module-card-dropdown"
              style={{ position: 'fixed', top: menuPos.top, right: menuPos.right }}
              onClick={e => e.stopPropagation()}
            >
              <button className="module-card-dropdown-item" onClick={() => onStartRename(mod.id, mod.name)}>
                <Pencil size={13} /> Rename
              </button>
              <button className="module-card-dropdown-item" onClick={() => { onDuplicateModule(mod.id); onOpenMenuChange(null); }}>
                <Copy size={13} /> Duplicate
              </button>
              <button className="module-card-dropdown-item" onClick={() => { onPublishToLibrary(mod.id); onOpenMenuChange(null); }}>
                <Upload size={13} /> Publish to Library
              </button>
              <button className="module-card-dropdown-item danger" onClick={() => { onRemoveModule(mod.id); onOpenMenuChange(null); }}>
                <Trash2 size={13} /> Remove
              </button>
            </div>,
            document.body
          )}
        </div>
      )}
    </div>
  );
};

export const ModuleSidebar: React.FC<Props> = ({
  productModules,
  selectedModuleId,
  renamingModuleId,
  renameValue,
  openMenuModuleId,
  draggingStepId,
  onSelectModule,
  onOpenMenuChange,
  onRenameValueChange,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onAddCustomModule,
  onOpenLibrary,
  onRemoveModule,
  onDuplicateModule,
  onPublishToLibrary,
}) => (
  <div className="module-sidebar glass-card">
    <div className="module-sidebar-list">
      {productModules.length === 0 ? (
        <div className="panel-empty-state" style={{ padding: '2rem 1rem' }}>
          <Layers size={24} strokeWidth={1.2} />
          <p>No modules yet</p>
        </div>
      ) : (
        <SortableContext items={productModules.map(m => m.id)} strategy={verticalListSortingStrategy}>
          {productModules.map((mod, idx) => (
            <SortableModuleItem
              key={mod.id}
              mod={mod}
              idx={idx}
              selectedModuleId={selectedModuleId}
              renamingModuleId={renamingModuleId}
              renameValue={renameValue}
              openMenuModuleId={openMenuModuleId}
              draggingStepId={draggingStepId}
              onSelectModule={onSelectModule}
              onOpenMenuChange={onOpenMenuChange}
              onRenameValueChange={onRenameValueChange}
              onStartRename={onStartRename}
              onCommitRename={onCommitRename}
              onCancelRename={onCancelRename}
              onRemoveModule={onRemoveModule}
              onDuplicateModule={onDuplicateModule}
              onPublishToLibrary={onPublishToLibrary}
            />
          ))}
        </SortableContext>
      )}
    </div>
    <div className="module-sidebar-actions">
      <button className="btn-primary module-sidebar-btn" onClick={onAddCustomModule}>
        <Plus size={14} /> Add Module
      </button>
      <button className="btn-secondary module-sidebar-btn" onClick={onOpenLibrary}>
        <BookOpen size={14} /> Browse / Reuse
      </button>
    </div>
  </div>
);
