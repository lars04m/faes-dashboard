import React from 'react';
import { Layers, Plus, BookOpen, X, AlertTriangle, Trash2 } from 'lucide-react';
import type { Step, Module } from './types';

interface Props {
  isLibraryOpen: boolean;
  selectedModule: Module | null;
  selectedModuleId: string | null;
  effectiveSteps: Step[];
  selectedStepId: string | null;
  libraryShared: Module[];
  libraryFromOthers: Module[];
  sharedModuleWarning: boolean;
  moduleUsageCount: (id: string) => number;
  stepHasFlag: (step: Step) => boolean;
  hasLocalOverride: (stepId: string) => boolean;
  onSelectStep: (id: string) => void;
  onAddStep: () => void;
  onDeleteStep: (stepId: string, e: React.MouseEvent) => void;
  onToggleModuleStatus: (moduleId: string, e: React.MouseEvent) => void;
  onAddFromLibrary: (id: string) => void;
  onAddModuleCopy: (id: string) => void;
  onCloseLibrary: () => void;
  onDismissWarning: () => void;
}

export const StepsPanel: React.FC<Props> = ({
  isLibraryOpen,
  selectedModule,
  selectedModuleId,
  effectiveSteps,
  selectedStepId,
  libraryShared,
  libraryFromOthers,
  sharedModuleWarning,
  moduleUsageCount,
  stepHasFlag,
  hasLocalOverride,
  onSelectStep,
  onAddStep,
  onDeleteStep,
  onToggleModuleStatus,
  onAddFromLibrary,
  onAddModuleCopy,
  onCloseLibrary,
  onDismissWarning,
}) => {
  if (isLibraryOpen) {
    return <LibraryPanel
      libraryShared={libraryShared}
      libraryFromOthers={libraryFromOthers}
      moduleUsageCount={moduleUsageCount}
      onAddFromLibrary={onAddFromLibrary}
      onAddModuleCopy={onAddModuleCopy}
      onClose={onCloseLibrary}
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
          {selectedModule.isShared && (
            <span className="badge badge-info badge-sm">Shared</span>
          )}
        </div>
        <span
          className={`badge ${selectedModule.status === 'live' ? 'badge-success' : 'badge-muted'} badge-clickable`}
          onClick={e => onToggleModuleStatus(selectedModuleId!, e)}
          title="Click to toggle status"
        >
          {selectedModule.status === 'live' ? 'Live' : 'Draft'}
        </span>
      </div>

      {sharedModuleWarning && (
        <div className="ib-warning-banner">
          <AlertTriangle size={14} />
          <span>Cannot add steps to a shared module. Create a custom module instead.</span>
          <button className="ib-warning-dismiss" onClick={onDismissWarning}><X size={13} /></button>
        </div>
      )}

      {effectiveSteps.length === 0 ? (
        <div className="panel-empty-state">
          <Plus size={28} strokeWidth={1.2} />
          <p>No steps yet</p>
          {!selectedModule.isShared && (
            <button className="btn-primary" style={{ marginTop: '0.5rem' }} onClick={onAddStep}>
              Add First Step
            </button>
          )}
        </div>
      ) : (
        <table className="steps-table">
          <thead>
            <tr>
              <th style={{ width: '44px' }}>№</th>
              <th>Name</th>
              <th style={{ width: '100px' }}>Type</th>
              {!selectedModule.isShared && <th style={{ width: '40px' }} />}
            </tr>
          </thead>
          <tbody>
            {effectiveSteps.map((step, idx) => {
              const hasFlag = stepHasFlag(step);
              const hasOverride = hasLocalOverride(step.id);
              const descText = step.action || step.caption || '—';
              const hasImages = step.images?.some(img => img.url) || !!step.imageUrl;
              const typeLabel = hasImages ? 'Visual' : step.stepType === 'markdown' ? 'Rich text' : 'Text';
              return (
                <tr
                  key={step.id}
                  className={selectedStepId === step.id ? 'active' : ''}
                  onClick={() => onSelectStep(step.id)}
                >
                  <td><span className="sheet-step-num">{idx + 1}</span></td>
                  <td>
                    <div className="steps-table-name-cell">
                      {hasFlag && <AlertTriangle size={12} color="var(--brand-orange)" style={{ flexShrink: 0 }} />}
                      {hasOverride && <span className="badge-custom-dot" title="Local override" style={{ flexShrink: 0 }} />}
                      {step.name
                        ? <span className="steps-table-desc steps-table-named">{step.name}</span>
                        : <span className="steps-table-desc">{descText}</span>
                      }
                    </div>
                  </td>
                  <td><span className={`step-type-chip ${step.stepType}`}>{typeLabel}</span></td>
                  {!selectedModule.isShared && (
                    <td>
                      <div className="step-row-actions">
                        <button className="step-action-btn delete" onClick={e => onDeleteStep(step.id, e)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            <tr
              className={`step-add-row ${selectedModule.isShared ? 'step-add-row-disabled' : ''}`}
              onClick={onAddStep}
            >
              <td colSpan={4}>
                <span className="step-add-row-label">
                  <Plus size={13} /> Add step
                </span>
                {selectedModule.isShared && (
                  <span className="step-add-shared-hint">— custom modules only</span>
                )}
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
  onAddFromLibrary: (id: string) => void;
  onAddModuleCopy: (id: string) => void;
  onClose: () => void;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({
  libraryShared,
  libraryFromOthers,
  moduleUsageCount,
  onAddFromLibrary,
  onAddModuleCopy,
  onClose,
}) => {
  const bothEmpty = libraryShared.length === 0 && libraryFromOthers.length === 0;
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
      <div className="library-scroll">
        {bothEmpty && (
          <div className="ib-empty-state library-empty">
            <p>All available modules are already added.</p>
          </div>
        )}
        {libraryShared.length > 0 && (
          <>
            <div className="library-section-header">Standard Modules</div>
            {libraryShared.map(mod => {
              const count = moduleUsageCount(mod.id);
              return (
                <div key={mod.id} className="library-module-card">
                  <div className="library-module-top">
                    <span className="library-module-name">{mod.name}</span>
                    <span className="badge badge-info badge-sm">Shared</span>
                  </div>
                  <p className="library-module-desc">{mod.description}</p>
                  <div className="library-module-footer">
                    <span className="library-usage-count">Used in {count} product{count !== 1 ? 's' : ''}</span>
                    <button className="btn-primary library-action-btn" onClick={() => onAddFromLibrary(mod.id)}>
                      + Add
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
        {libraryFromOthers.length > 0 && (
          <>
            <div className="library-section-header">From Other Products</div>
            {libraryFromOthers.map(mod => {
              const count = moduleUsageCount(mod.id);
              return (
                <div key={mod.id} className="library-module-card">
                  <div className="library-module-top">
                    <span className="library-module-name">{mod.name}</span>
                  </div>
                  <p className="library-module-desc">{mod.description}</p>
                  <div className="library-module-footer">
                    <span className="library-usage-count">
                      {count > 0 ? `Used in ${count} product${count !== 1 ? 's' : ''}` : 'No other products'}
                    </span>
                    <button
                      className="btn-secondary library-action-btn"
                      onClick={() => onAddModuleCopy(mod.id)}
                      title="Creates a copy specific to this product"
                    >
                      + Copy
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
