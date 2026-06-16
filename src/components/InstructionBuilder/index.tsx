import React from 'react';
import { ArrowLeft, Eye } from 'lucide-react';
import './InstructionBuilder.css';

import { useInstructionBuilder } from './useInstructionBuilder';
import { ProductsView } from './ProductsView';
import { ModuleSidebar } from './ModuleSidebar';
import { StepsPanel } from './StepsPanel';
import { StepEditorView } from './StepEditorView';
import { PreviewPanel } from './PreviewPanel';
import { OverrideDialog } from './OverrideDialog';

export const InstructionBuilder: React.FC = () => {
  const s = useInstructionBuilder();

  // ── Product editor view (thin layout shell) ──────────────────────────────────
  const renderProductEditorView = () => (
    <div className="dashboard-container" onClick={() => s.setOpenMenuModuleId(null)}>
      <div className="dashboard-header">
        <div>
          <button className="ib-back-btn" onClick={s.handleBack}>
            <ArrowLeft size={14} /> All Products
          </button>
          <div className="ib-breadcrumb">
            <span className="ib-breadcrumb-link" onClick={s.handleBack}>All Products</span>
            {s.selectedProduct && (
              <>
                <span className="ib-breadcrumb-sep">›</span>
                <span className="ib-breadcrumb-current">{s.selectedProduct.name}</span>
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

      <div className="product-editor-layout">
        <ModuleSidebar
          productModules={s.productModules}
          selectedModuleId={s.selectedModuleId}
          renamingModuleId={s.renamingModuleId}
          renameValue={s.renameValue}
          openMenuModuleId={s.openMenuModuleId}
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
        />

        {s.rightPanelMode === 'preview' ? (
          <PreviewPanel
            selectedModule={s.selectedModule}
            selectedProduct={s.selectedProduct}
            effectiveSteps={s.effectiveSteps}
            stepHasFlag={s.stepHasFlag}
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
            sharedModuleWarning={s.sharedModuleWarning}
            moduleUsageCount={s.moduleUsageCount}
            stepHasFlag={s.stepHasFlag}
            hasLocalOverride={s.hasLocalOverride}
            onSelectStep={s.handleSelectStep}
            onAddStep={s.handleAddStep}
            onDeleteStep={s.handleDeleteStep}
            onToggleModuleStatus={s.handleToggleModuleStatus}
            onAddFromLibrary={s.handleAddModuleFromLibrary}
            onAddModuleCopy={s.handleAddModuleCopy}
            onCloseLibrary={() => s.setIsLibraryOpen(false)}
            onDismissWarning={() => s.setSharedModuleWarning(false)}
          />
        )}
      </div>
    </div>
  );

  // ── Root render ──────────────────────────────────────────────────────────────
  return (
    <>
      {s.pendingStepSave && (
        <OverrideDialog
          selectedProduct={s.selectedProduct}
          onCancel={() => s.setPendingStepSave(false)}
          onConfirm={s.commitStepForm}
        />
      )}

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
          activeTool={s.activeTool}
          activeColor={s.activeColor}
          activeImageIdx={s.activeImageIdx}
          hasLocalOverride={s.hasLocalOverride}
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
        />
      )}
    </>
  );
};
