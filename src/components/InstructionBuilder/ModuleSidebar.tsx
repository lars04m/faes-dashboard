import React from 'react';
import { Layers, Plus, BookOpen, MoreVertical, Pencil, Copy, Trash2 } from 'lucide-react';
import type { Module } from './types';

interface Props {
  productModules: Module[];
  selectedModuleId: string | null;
  renamingModuleId: string | null;
  renameValue: string;
  openMenuModuleId: string | null;
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
}

export const ModuleSidebar: React.FC<Props> = ({
  productModules,
  selectedModuleId,
  renamingModuleId,
  renameValue,
  openMenuModuleId,
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
}) => (
  <div className="module-sidebar glass-card">
    <div className="module-sidebar-list">
      {productModules.length === 0 ? (
        <div className="panel-empty-state" style={{ padding: '2rem 1rem' }}>
          <Layers size={24} strokeWidth={1.2} />
          <p>No modules yet</p>
        </div>
      ) : (
        productModules.map((mod, idx) => (
          <div
            key={mod.id}
            className={`module-sidebar-item ${selectedModuleId === mod.id ? 'active' : ''}`}
            onClick={() => onSelectModule(mod.id)}
          >
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
              <>
                <div className="module-sidebar-dots">
                  {mod.isShared && <span className="mod-status-dot shared" title="Shared module" />}
                  <span className={`mod-status-dot ${mod.status}`} title={mod.status === 'live' ? 'Live' : 'Draft'} />
                </div>
                <div className="module-sidebar-menu-wrap" onClick={e => e.stopPropagation()}>
                  <button
                    className="module-sidebar-menu-btn"
                    onClick={e => {
                      e.stopPropagation();
                      onOpenMenuChange(openMenuModuleId === mod.id ? null : mod.id);
                    }}
                    title="More actions"
                  >
                    <MoreVertical size={14} />
                  </button>
                  {openMenuModuleId === mod.id && (
                    <div className="module-card-dropdown">
                      <button className="module-card-dropdown-item" onClick={() => onStartRename(mod.id, mod.name)}>
                        <Pencil size={13} /> Rename
                      </button>
                      <button className="module-card-dropdown-item" onClick={() => { onDuplicateModule(mod.id); onOpenMenuChange(null); }}>
                        <Copy size={13} /> Duplicate
                      </button>
                      <button className="module-card-dropdown-item danger" onClick={() => { onRemoveModule(mod.id); onOpenMenuChange(null); }}>
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))
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
