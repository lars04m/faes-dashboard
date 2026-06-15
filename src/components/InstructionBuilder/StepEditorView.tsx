import React from 'react';
import {
  ArrowLeft, Plus, X, Image as ImageIcon, Undo2,
} from 'lucide-react';
import type { Step, Module, Product, Annotation, CheckItem, StepImage } from './types';
import { ANNOTATION_COLORS, ANNOTATION_TOOLS } from './constants';

interface Props {
  stepFormDraft: Partial<Step>;
  activeStepTab: 'instruction' | 'visual' | 'check';
  effectiveSteps: Step[];
  selectedStepId: string | null;
  selectedModule: Module | null;
  selectedProduct: Product | null;
  activeTool: 'select' | 'rect' | 'circle' | 'arrow';
  activeColor: string;
  activeImageIdx: number;
  hasLocalOverride: (stepId: string) => boolean;
  onTabChange: (tab: 'instruction' | 'visual' | 'check') => void;
  onFieldChange: (patch: Partial<Step>) => void;
  onDone: () => void;
  onToolChange: (tool: 'select' | 'rect' | 'circle' | 'arrow') => void;
  onColorChange: (color: string) => void;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, idx: number) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (idx: number) => void;
  getPreviewAnnotation: () => Annotation | undefined;
  onAddCheckItem: (type: CheckItem['type']) => void;
  onUpdateCheckItem: (id: string, label: string) => void;
  onDeleteCheckItem: (id: string) => void;
  onUpdateQaOption: (id: string, oi: number, val: string) => void;
  onAddQaOption: (id: string) => void;
  onDeleteQaOption: (id: string, oi: number) => void;
  onAddImage: () => void;
  onRemoveImage: (idx: number) => void;
  onUpdateImage: (idx: number, patch: Partial<StepImage>) => void;
  onActiveImageChange: (idx: number) => void;
  onUndoAnnotation: (imageIdx: number) => void;
  onClearAnnotations: (imageIdx: number) => void;
}

// ── AnnotationSvg ────────────────────────────────────────────────────────────

interface AnnotationSvgProps {
  annotations: Annotation[];
  previewAnnotation?: Annotation;
}

const AnnotationSvg: React.FC<AnnotationSvgProps> = ({ annotations, previewAnnotation }) => {
  const allAnns = previewAnnotation ? [...annotations, previewAnnotation] : annotations;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="image-canvas-svg">
      <defs>
        {ANNOTATION_COLORS.map(c => (
          <marker key={c} id={`arrow-${c.replace('#', '')}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill={c} />
          </marker>
        ))}
      </defs>
      {allAnns.map(ann => {
        if (ann.type === 'rect') return (
          <rect key={ann.id} x={ann.x} y={ann.y} width={ann.w} height={ann.h} stroke={ann.color} strokeWidth="0.8" fill="none" />
        );
        if (ann.type === 'circle') return (
          <ellipse key={ann.id} cx={ann.x + ann.w / 2} cy={ann.y + ann.h / 2} rx={Math.abs(ann.w / 2)} ry={Math.abs(ann.h / 2)} stroke={ann.color} strokeWidth="0.8" fill="none" />
        );
        if (ann.type === 'arrow') return (
          <line key={ann.id} x1={ann.x} y1={ann.y} x2={ann.x + ann.w} y2={ann.y + ann.h} stroke={ann.color} strokeWidth="0.8" markerEnd={`url(#arrow-${ann.color.replace('#', '')})`} />
        );
        return null;
      })}
    </svg>
  );
};

// ── StepEditorView ───────────────────────────────────────────────────────────

export const StepEditorView: React.FC<Props> = ({
  stepFormDraft,
  activeStepTab,
  effectiveSteps,
  selectedStepId,
  selectedModule,
  selectedProduct,
  activeTool,
  activeColor,
  activeImageIdx,
  hasLocalOverride,
  onTabChange,
  onFieldChange,
  onDone,
  onToolChange,
  onColorChange,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  getPreviewAnnotation,
  onAddCheckItem,
  onUpdateCheckItem,
  onDeleteCheckItem,
  onUpdateQaOption,
  onAddQaOption,
  onDeleteQaOption,
  onAddImage,
  onRemoveImage,
  onUpdateImage,
  onActiveImageChange,
  onUndoAnnotation,
  onClearAnnotations,
}) => {
  const stepIdx = effectiveSteps.findIndex(s => s.id === selectedStepId);
  const setField = (patch: Partial<Step>) => onFieldChange(patch);

  const hasInstruction = (stepFormDraft.action ?? '').trim().length > 0;
  const checks = stepFormDraft.checks ?? [];
  const images = stepFormDraft.images ?? [];
  const hasVisual = images.some(img => img.url || img.annotations.length > 0);

  return (
    <div className="visual-editor-view">
      {/* Top bar */}
      <div className="visual-editor-topbar">
        <button className="ib-back-btn" onClick={onDone} style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={15} /> {selectedModule?.name}
        </button>
        <div className="visual-editor-topbar-title">
          {selectedProduct?.name} / {selectedModule?.name} / Step {stepIdx + 1}
        </div>
        <button className="btn-primary step-editor-done-btn" onClick={onDone}>
          Done
        </button>
      </div>

      {/* Step name */}
      <div className="step-name-row">
        <input
          className="step-name-input"
          value={stepFormDraft.name ?? ''}
          placeholder={`Step ${stepIdx + 1} — optional title`}
          onChange={e => setField({ name: e.target.value || undefined })}
        />
      </div>

      {/* Tab bar */}
      <div className="step-editor-tabbar">
        {(['instruction', 'visual', 'check'] as const).map(tab => (
          <button
            key={tab}
            className={`step-editor-tab ${activeStepTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab === 'instruction' && <>{hasInstruction && <span className="step-tab-dot" />}Instruction</>}
            {tab === 'visual' && <>{hasVisual && <span className="step-tab-dot" />}Visual</>}
            {tab === 'check' && <>{checks.length > 0 && <span className="step-tab-dot" />}Check</>}
          </button>
        ))}
        {selectedModule?.isShared && !hasLocalOverride(selectedStepId ?? '') && (
          <span className="badge badge-info step-editor-override-badge">Shared — editing creates override</span>
        )}
        {hasLocalOverride(selectedStepId ?? '') && (
          <span className="badge badge-override step-editor-override-badge">Custom override</span>
        )}
      </div>

      {/* Main body */}
      <div className="step-editor-main">
        <div className="step-editor-form-panel">

          {/* ── Instruction tab ── */}
          {activeStepTab === 'instruction' && (
            <div className="step-tab-content">
              <textarea
                className="form-input step-instruction-textarea"
                value={stepFormDraft.action ?? ''}
                placeholder="What should the operator do? e.g. Wipe down all outer surfaces with a lint-free cloth…"
                onChange={e => setField({ action: e.target.value })}
                autoFocus
              />
            </div>
          )}

          {/* ── Visual tab ── */}
          {activeStepTab === 'visual' && (
            <div className="step-tab-content">
              <div className="step-visual-annotation-toolbar">
                <button
                  className="step-ann-tool-btn"
                  onClick={() => onUndoAnnotation(activeImageIdx)}
                  title="Undo last annotation"
                >
                  <Undo2 size={16} />
                  <span>Undo</span>
                </button>
                <div className="visual-tool-sep" />
                {ANNOTATION_TOOLS.map(({ tool, Icon, label }) => (
                  <button
                    key={tool}
                    className={`step-ann-tool-btn ${activeTool === tool ? 'active' : ''}`}
                    onClick={() => onToolChange(activeTool === tool ? 'select' : tool)}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                ))}
                <div className="visual-tool-sep" />
                <div className="step-ann-color-group">
                  {ANNOTATION_COLORS.map(c => (
                    <button
                      key={c}
                      className={`visual-color-swatch ${activeColor === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => onColorChange(c)}
                      title={c}
                    />
                  ))}
                </div>
                <div className="visual-tool-sep" />
                <button
                  className="step-ann-tool-btn"
                  onClick={() => onClearAnnotations(activeImageIdx)}
                  title="Clear all annotations"
                >
                  <X size={16} />
                  <span>Clear</span>
                </button>
              </div>

              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className={`step-image-card ${activeImageIdx === idx ? 'active' : ''}`}
                  onClick={() => onActiveImageChange(idx)}
                >
                  <div className="step-image-card-label">
                    Image {idx + 1}
                    {images.length > 1 && (
                      <button
                        className="step-image-delete-btn"
                        onClick={e => { e.stopPropagation(); onRemoveImage(idx); }}
                        title="Remove this image"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <div
                    className="step-visual-canvas"
                    data-tool={activeTool}
                    onPointerDown={e => onPointerDown(e, idx)}
                    onPointerMove={onPointerMove}
                    onPointerUp={() => onPointerUp(idx)}
                  >
                    {img.url ? (
                      <>
                        <img src={img.url} alt={`Step visual ${idx + 1}`} className="step-visual-img" draggable={false} style={{ pointerEvents: 'none' }} />
                        <AnnotationSvg
                          annotations={img.annotations}
                          previewAnnotation={idx === activeImageIdx ? getPreviewAnnotation() : undefined}
                        />
                      </>
                    ) : (
                      <div className="step-visual-empty">
                        <ImageIcon size={32} strokeWidth={1} className="step-visual-empty-icon" />
                        <p>No image — add a URL below</p>
                      </div>
                    )}
                  </div>
                  <input
                    className="form-input"
                    value={img.url}
                    placeholder="Image URL (https://…)"
                    onClick={e => e.stopPropagation()}
                    onChange={e => onUpdateImage(idx, { url: e.target.value })}
                  />
                  <input
                    className="form-input"
                    value={img.caption}
                    placeholder="Image caption (optional)"
                    onClick={e => e.stopPropagation()}
                    onChange={e => onUpdateImage(idx, { caption: e.target.value })}
                  />
                </div>
              ))}

              <button className="step-add-image-btn" onClick={e => { e.stopPropagation(); onAddImage(); }}>
                <Plus size={13} /> Add image
              </button>
            </div>
          )}

          {/* ── Check tab ── */}
          {activeStepTab === 'check' && (
            <div className="step-tab-content">
              <p className="step-tab-hint">Add verifications the operator must complete before moving to the next step.</p>

              <div className="step-check-add-row">
                <button className="step-check-add-btn" onClick={() => onAddCheckItem('checkbox')}>
                  <Plus size={13} /> Checkbox
                </button>
                <button className="step-check-add-btn" onClick={() => onAddCheckItem('measurement')}>
                  <Plus size={13} /> Measurement
                </button>
                <button className="step-check-add-btn" onClick={() => onAddCheckItem('text')}>
                  <Plus size={13} /> Text input
                </button>
                <button className="step-check-add-btn" onClick={() => onAddCheckItem('qa')}>
                  <Plus size={13} /> Question
                </button>
              </div>

              {checks.length === 0 ? (
                <div className="step-check-empty">
                  No verifications added. The step will be considered complete when the operator moves on.
                </div>
              ) : (
                <div className="step-check-list">
                  {checks.map(item => (
                    item.type === 'qa' ? (
                      <div key={item.id} className="step-check-item step-check-item-qa-wrap">
                        <div className="step-check-item-type step-check-item-type-qa">Q</div>
                        <div className="step-check-item-body">
                          <input
                            className="form-input step-check-item-label"
                            value={item.label}
                            placeholder="e.g. What is the condition of the outer seal?"
                            onChange={e => onUpdateCheckItem(item.id, e.target.value)}
                          />
                          <div className="step-qa-options">
                            {(item.options ?? []).map((opt, oi) => (
                              <div key={oi} className="step-qa-option-row">
                                <span className="step-qa-bullet">◦</span>
                                <input
                                  className="form-input step-qa-option-input"
                                  value={opt}
                                  placeholder={`Answer option ${oi + 1}`}
                                  onChange={e => onUpdateQaOption(item.id, oi, e.target.value)}
                                />
                                {(item.options ?? []).length > 2 && (
                                  <button className="step-qa-option-delete" onClick={() => onDeleteQaOption(item.id, oi)}>
                                    <X size={11} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button className="step-qa-add-option" onClick={() => onAddQaOption(item.id)}>
                              <Plus size={11} /> Add option
                            </button>
                          </div>
                          <span className="step-check-item-badge">Question</span>
                        </div>
                        <button className="step-check-item-delete" onClick={() => onDeleteCheckItem(item.id)}>
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div key={item.id} className="step-check-item">
                        <div className={`step-check-item-type step-check-item-type-${item.type}`}>
                          {item.type === 'checkbox' && '☐'}
                          {item.type === 'measurement' && '#'}
                          {item.type === 'text' && 'Aa'}
                        </div>
                        <div className="step-check-item-body">
                          <input
                            className="form-input step-check-item-label"
                            value={item.label}
                            placeholder={
                              item.type === 'checkbox' ? 'e.g. Confirm outer packaging is undamaged'
                              : item.type === 'measurement' ? 'e.g. Weight (g)'
                              : 'e.g. Note any damage found'
                            }
                            onChange={e => onUpdateCheckItem(item.id, e.target.value)}
                          />
                          <span className="step-check-item-badge">
                            {item.type === 'checkbox' ? 'Checkbox' : item.type === 'measurement' ? 'Measurement' : 'Text input'}
                          </span>
                        </div>
                        <button className="step-check-item-delete" onClick={() => onDeleteCheckItem(item.id)}>
                          <X size={13} />
                        </button>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
