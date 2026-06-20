import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import './InstructionBuilder.css';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  closestCenter,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

const collisionDetection: CollisionDetection = (args) => {
  // Prefer pointer-based detection so cross-panel drops (step → module) work
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  // Fall back to rect intersection, then closest center for within-list sorting
  const rectHits = rectIntersection(args);
  if (rectHits.length > 0) return rectHits;
  return closestCenter(args);
};

import { useInstructionBuilder } from './useInstructionBuilder';
import { ProductsView } from './ProductsView';
import { ConfigurationsView } from './ConfigurationsView';
import { ModuleSidebar } from './ModuleSidebar';
import { StepsPanel } from './StepsPanel';
import { StepEditorView } from './StepEditorView';
import { PreviewPanel } from './PreviewPanel';
import type { Step, Module, Product } from './types';

type DragItem =
  | { type: 'module'; id: string; label: string }
  | { type: 'step'; id: string; label: string };

interface InstructionBuilderProps {
  embedded?: boolean;
  onInstructionChange?: (info: {
    selectedProduct: Product | null;
    selectedModule: Module | null;
    originalSteps: Step[];
    editedSteps: Step[];
  } | null) => void;
  initialProductId?: string;
  initialConfigurationId?: string;
  initialModuleId?: string;
  initialStepId?: string;
}

export const InstructionBuilder: React.FC<InstructionBuilderProps> = ({
  embedded = false,
  onInstructionChange,
  initialProductId,
  initialConfigurationId,
  initialModuleId,
  initialStepId,
}) => {
  const s = useInstructionBuilder({
    initialProductId,
    initialConfigurationId,
    initialModuleId,
    initialStepId,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const [dragItem, setDragItem] = useState<DragItem | null>(null);

  // Notify parent component about changes in selection or steps
  useEffect(() => {
    if (onInstructionChange) {
      if (s.selectedProduct && s.selectedModule) {
        onInstructionChange({
          selectedProduct: s.selectedProduct,
          selectedModule: s.selectedModule,
          originalSteps: s.originalSteps || [],
          editedSteps: s.effectiveSteps || [],
        });
      } else {
        onInstructionChange(null);
      }
    }
  }, [s.selectedProduct, s.selectedModule, s.effectiveSteps, s.originalSteps, onInstructionChange]);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (!data) return;
    if (data.type === 'module') {
      const mod = s.productModules.find(m => m.id === data.moduleId);
      setDragItem({ type: 'module', id: data.moduleId, label: mod?.name ?? '' });
    } else if (data.type === 'step') {
      const step = s.effectiveSteps.find(st => st.id === data.stepId);
      setDragItem({ type: 'step', id: data.stepId, label: step?.name || step?.action || step?.caption || 'Step' });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'module') {
      const ids = s.productModules.map(m => m.id);
      const oldIdx = ids.indexOf(active.id as string);
      const newIdx = ids.indexOf(over.id as string);
      if (oldIdx !== -1 && newIdx !== -1) {
        s.handleReorderModules(arrayMove(ids, oldIdx, newIdx));
      }
    } else if (activeData?.type === 'step') {
      const fromModuleId = activeData.fromModuleId as string;
      // Dropped on a module item in the sidebar → cross-module move
      if (overData?.type === 'module') {
        const toModuleId = overData.moduleId as string;
        if (fromModuleId !== toModuleId) {
          s.handleMoveStep(active.id as string, fromModuleId, toModuleId);
        }
      } else if (overData?.type === 'step') {
        const toModuleId = overData.fromModuleId as string;
        if (fromModuleId === toModuleId) {
          // Same module — reorder
          const stepIds = s.effectiveSteps.map(st => st.id);
          const oldIdx = stepIds.indexOf(active.id as string);
          const newIdx = stepIds.indexOf(over.id as string);
          if (oldIdx !== -1 && newIdx !== -1) {
            s.handleReorderSteps(fromModuleId, arrayMove(s.effectiveSteps, oldIdx, newIdx));
          }
        } else {
          // Different module — move
          s.handleMoveStep(active.id as string, fromModuleId, toModuleId);
        }
      }
    }
  };

  // ── Product editor view (thin layout shell) ──────────────────────────────────
  const renderProductEditorView = () => (
    <div className={embedded ? "ib-embedded-container" : "dashboard-container"} onClick={() => s.setOpenMenuModuleId(null)}>
      {embedded ? (
        <div className="ib-embedded-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <button className="ib-back-btn" onClick={s.handleBackToConfigurations} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
              <ArrowLeft size={12} /> Configurations
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '0.75rem', color: 'var(--brand-navy)' }}>
              {s.selectedProduct?.name} › {s.selectedConfiguration?.name} {s.selectedModule ? `› ${s.selectedModule.name}` : ''}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {s.selectedModule && s.rightPanelMode === 'editor' && !s.isLibraryOpen && (
              <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => s.setRightPanelMode('preview')}>
                <Eye size={12} /> Preview
              </button>
            )}
            {s.rightPanelMode === 'preview' && (
              <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => s.setRightPanelMode('editor')}>
                <ArrowLeft size={12} /> Steps
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="dashboard-header">
          <div>
            <button className="ib-back-btn" onClick={s.handleBackToConfigurations}>
              <ArrowLeft size={14} /> Configurations
            </button>
            <div className="ib-breadcrumb">
              <span className="ib-breadcrumb-link" onClick={s.handleBack}>All Products</span>
              {s.selectedProduct && (
                <>
                  <span className="ib-breadcrumb-sep">›</span>
                  <span className="ib-breadcrumb-link" onClick={s.handleBackToConfigurations}>
                    {s.selectedProduct.name}
                  </span>
                </>
              )}
              {s.selectedConfiguration && (
                <>
                  <span className="ib-breadcrumb-sep">›</span>
                  <span className="ib-breadcrumb-current">{s.selectedConfiguration.name}</span>
                </>
              )}
              {s.selectedModule && (
                <>
                  <span className="ib-breadcrumb-sep">›</span>
                  <span className="ib-breadcrumb-current">{s.selectedModule.name}</span>
                </>
              )}
            </div>
            <h1 className="dashboard-title">{s.selectedProduct?.name}</h1>
            {s.selectedConfiguration && (
              <p className="dashboard-subtitle">{s.selectedConfiguration.name}</p>
            )}
          </div>
          <div className="ib-header-actions">
            {s.selectedModule && s.rightPanelMode === 'editor' && !s.isLibraryOpen && (
              <button className="btn-secondary" onClick={() => s.setRightPanelMode('preview')}>
                <Eye size={14} /> Preview
              </button>
            )}
            {s.rightPanelMode === 'preview' && (
              <button className="btn-secondary" onClick={() => s.setRightPanelMode('editor')}>
                <ArrowLeft size={14} /> Steps
              </button>
            )}
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={collisionDetection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="product-editor-layout">
          <ModuleSidebar
            productModules={s.productModules}
            selectedModuleId={s.selectedModuleId}
            renamingModuleId={s.renamingModuleId}
            renameValue={s.renameValue}
            openMenuModuleId={s.openMenuModuleId}
            draggingStepId={dragItem?.type === 'step' ? dragItem.id : null}
            onSelectModule={s.handleSelectModule}
            onOpenMenuChange={s.setOpenMenuModuleId}
            onRenameValueChange={s.setRenameValue}
            onStartRename={s.handleStartRename}
            onCommitRename={s.handleCommitRename}
            onCancelRename={s.handleCancelRename}
            onAddCustomModule={s.handleAddCustomModule}
            onOpenLibrary={() => { s.setIsLibraryOpen(v => !v); s.setRightPanelMode('editor'); }}
            onRemoveModule={s.handleRemoveModule}
            onDuplicateModule={s.handleDuplicateModule}
            onPublishToLibrary={s.handlePublishToLibrary}
          />

          {s.rightPanelMode === 'preview' ? (
            <PreviewPanel
              selectedModule={s.selectedModule}
              selectedProduct={s.selectedProduct}
              effectiveSteps={s.effectiveSteps}
            />
          ) : (
            <StepsPanel
              isLibraryOpen={s.isLibraryOpen}
              selectedModule={s.selectedModule}
              selectedModuleId={s.selectedModuleId}
              effectiveSteps={s.effectiveSteps}
              selectedStepId={s.selectedStepId}
              libraryShared={s.libraryShared}
              libraryFromOthers={s.libraryFromOthers}
              moduleUsageCount={s.moduleUsageCount}
              onSelectStep={s.handleSelectStep}
              onAddStep={s.handleAddStep}
              onDeleteStep={s.handleDeleteStep}
              onRenameStep={s.handleRenameStep}
              onDuplicateStep={s.handleDuplicateStep}
              onAddModule={s.handleAddLibraryModule}
              onCloseLibrary={() => s.setIsLibraryOpen(false)}
              renamingModuleId={s.renamingModuleId}
              moduleRenameValue={s.renameValue}
              onModuleRenameValueChange={s.setRenameValue}
              onStartRename={s.handleStartRename}
              onCommitRename={s.handleCommitRename}
              onCancelRename={s.handleCancelRename}
              onDuplicateModule={s.handleDuplicateModule}
              onDeleteModule={s.handleDeleteModule}
            />
          )}
        </div>

        <DragOverlay>
          {dragItem?.type === 'module' && (
            <div className="drag-overlay-module">{dragItem.label}</div>
          )}
          {dragItem?.type === 'step' && (
            <div className="drag-overlay-step">{dragItem.label || '—'}</div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );

  // ── Root render ──────────────────────────────────────────────────────────────
  return (
    <>
      {s.view === 'products' && (
        <ProductsView
          filteredProducts={s.filteredProducts}
          searchTerm={s.searchTerm}
          addProductDialogOpen={s.addProductDialogOpen}
          onSearchChange={s.setSearchTerm}
          onSelectProduct={s.handleSelectProduct}
          onAddProduct={s.handleAddProduct}
          onConfirmAddProduct={s.handleConfirmAddProduct}
          onCancelAddProduct={() => s.setAddProductDialogOpen(false)}
          embedded={embedded}
        />
      )}

      {s.view === 'configurations' && s.selectedProduct && (
        <ConfigurationsView
          product={s.selectedProduct}
          onSelectConfiguration={s.handleSelectConfiguration}
          onAddConfiguration={s.handleAddConfiguration}
          onBack={s.handleBackFromConfigurations}
          embedded={embedded}
        />
      )}

      {s.view === 'product-detail' && renderProductEditorView()}

      {s.view === 'step-editor' && s.stepFormDraft && (
        <StepEditorView
          stepFormDraft={s.stepFormDraft}
          activeStepTab={s.activeStepTab}
          effectiveSteps={s.effectiveSteps}
          selectedStepId={s.selectedStepId}
          selectedModule={s.selectedModule}
          selectedProduct={s.selectedProduct}
          selectedConfiguration={s.selectedConfiguration}
          activeTool={s.activeTool}
          activeColor={s.activeColor}
          activeImageIdx={s.activeImageIdx}
          onTabChange={s.setActiveStepTab}
          onFieldChange={patch => s.setStepFormDraft(prev => prev ? { ...prev, ...patch } : prev)}
          onDone={s.handleDoneStepEditor}
          onToolChange={s.setActiveTool}
          onColorChange={s.setActiveColor}
          onPointerDown={s.handleAnnotationPointerDown}
          onPointerMove={s.handleAnnotationPointerMove}
          onPointerUp={s.handleAnnotationPointerUp}
          getPreviewAnnotation={s.getPreviewAnnotation}
          onAddCheckItem={s.handleAddCheckItem}
          onUpdateCheckItem={s.handleUpdateCheckItem}
          onDeleteCheckItem={s.handleDeleteCheckItem}
          onUpdateQaOption={s.handleUpdateQaOption}
          onAddQaOption={s.handleAddQaOption}
          onDeleteQaOption={s.handleDeleteQaOption}
          onAddImage={s.addImage}
          onRemoveImage={s.removeImage}
          onUpdateImage={s.updateImage}
          onActiveImageChange={s.setActiveImageIdx}
          onUndoAnnotation={s.handleUndoAnnotation}
          onClearAnnotations={s.handleClearAnnotations}
          embedded={embedded}
        />
      )}
    </>
  );
};
