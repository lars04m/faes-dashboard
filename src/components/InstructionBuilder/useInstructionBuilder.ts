import { useState } from 'react';
import React from 'react';
import type { Step, Module, Product, Configuration, CheckItem, StepImage, Annotation, View, StepType } from './types';
import { initialModules, initialProducts } from './data';

export function useInstructionBuilder(options?: {
  initialProductId?: string | null;
  initialConfigurationId?: string | null;
  initialModuleId?: string | null;
  initialStepId?: string | null;
}) {
  const initProductId = options?.initialProductId ?? null;
  const initConfigurationId = options?.initialConfigurationId ?? null;
  const initModuleId = options?.initialModuleId ?? null;
  const initStepId = options?.initialStepId ?? null;

  // Find the initial module to extract the step form draft
  const initialModule = initModuleId ? initialModules.find(m => m.id === initModuleId) : null;
  const initialStep = (initialModule && initStepId) ? initialModule.steps.find(s => s.id === initStepId) : null;

  // Initialize stepFormDraft if initialStep is provided
  const getInitialStepFormDraft = (): Partial<Step> | null => {
    if (!initialStep) return null;
    const images: StepImage[] = initialStep.images
      ?? (initialStep.imageUrl
        ? [{ id: 'img-0', url: initialStep.imageUrl, caption: initialStep.caption ?? '', annotations: [] }]
        : []);
    
    let checks: CheckItem[] = [];
    if (initialStep.checks) {
      checks = initialStep.checks;
    } else if (initialStep.checkType && initialStep.checkType !== 'none') {
      const label = initialStep.checkType === 'checkbox' ? 'Confirm step is complete' : 'Enter measurement value';
      checks = [{ id: `ck-${Date.now()}`, type: initialStep.checkType as 'checkbox' | 'measurement', label }];
    }

    return { ...initialStep, images, checks };
  };

  // ── Core data ────────────────────────────────────────────────────────────────
  const [view, setView] = useState<View>(
    initialStep ? 'step-editor' : (initProductId ? 'product-detail' : 'products')
  );
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [modules, setModules] = useState<Module[]>(initialModules);

  // ── Navigation ───────────────────────────────────────────────────────────────
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initProductId);
  const [selectedConfigurationId, setSelectedConfigurationId] = useState<string | null>(initConfigurationId);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(initModuleId);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(initStepId);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<'editor' | 'preview'>('editor');
  const [openMenuModuleId, setOpenMenuModuleId] = useState<string | null>(null);
  const [renamingModuleId, setRenamingModuleId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);

  // ── Step editor state ────────────────────────────────────────────────────────
  const [stepFormDraft, setStepFormDraft] = useState<Partial<Step> | null>(getInitialStepFormDraft());
  const [activeStepTab, setActiveStepTab] = useState<'instruction' | 'visual' | 'check'>('instruction');
  const [activeTool, setActiveTool] = useState<'select' | 'rect' | 'circle' | 'arrow'>('select');
  const [activeColor, setActiveColor] = useState('#ef7d00');
  const [drawing, setDrawing] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  // Auto-commit draft edits back to modules list in real time to propagate changes to the parent
  React.useEffect(() => {
    if (initStepId && stepFormDraft && selectedModuleId) {
      setModules(prev => prev.map(m => m.id === selectedModuleId
        ? {
            ...m,
            steps: m.steps.map(s => s.id === initStepId ? { ...s, ...stepFormDraft } as Step : s)
          }
        : m
      ));
    }
  }, [stepFormDraft, initStepId, selectedModuleId]);

  // ── Derived state ────────────────────────────────────────────────────────────
  const selectedProduct = products.find(p => p.id === selectedProductId) ?? null;
  const selectedConfiguration: Configuration | null =
    selectedProduct?.configurations.find(c => c.id === selectedConfigurationId) ?? null;
  const selectedModule = modules.find(m => m.id === selectedModuleId) ?? null;

  const activeModuleIds: string[] = selectedConfiguration?.moduleIds ?? selectedProduct?.moduleIds ?? [];

  const productModules: Module[] = activeModuleIds
    .map(id => modules.find(m => m.id === id)).filter(Boolean) as Module[];

  const effectiveSteps: Step[] = selectedModule?.steps ?? [];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const libraryShared = modules.filter(m =>
    m.isShared && !activeModuleIds.includes(m.id)
  );
  const libraryFromOthers = modules.filter(m =>
    !m.isShared && !activeModuleIds.includes(m.id)
  );

  // ── Utility predicates ───────────────────────────────────────────────────────
  const moduleUsageCount = (moduleId: string) =>
    products.filter(p => p.moduleIds.includes(moduleId)).length;

  // ── Navigation handlers ──────────────────────────────────────────────────────
  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
    setSelectedConfigurationId(null);
    setSelectedModuleId(null);
    setSelectedStepId(null);
    setStepFormDraft(null);
    setSearchTerm('');
    setIsLibraryOpen(false);
    setView('configurations');
  };

  const handleSelectConfiguration = (id: string) => {
    setSelectedConfigurationId(id);
    setSelectedModuleId(null);
    setSelectedStepId(null);
    setStepFormDraft(null);
    setIsLibraryOpen(false);
    setView('product-detail');
  };

  const handleAddConfiguration = (name: string) => {
    if (!name.trim() || !selectedProductId) return;
    const newCfg: Configuration = {
      id: `cfg-${Date.now()}`,
      name: name.trim(),
      description: 'New configuration — add a description.',
      moduleIds: selectedProduct?.moduleIds ?? [],
    };
    setProducts(prev => prev.map(p => p.id === selectedProductId
      ? { ...p, configurations: [...p.configurations, newCfg] }
      : p
    ));
  };

  const handleBackFromConfigurations = () => {
    setSelectedProductId(null);
    setSelectedConfigurationId(null);
    setSelectedModuleId(null);
    setSelectedStepId(null);
    setStepFormDraft(null);
    setIsLibraryOpen(false);
    setSearchTerm('');
    setRightPanelMode('editor');
    setView('products');
  };

  const handleBackToConfigurations = () => {
    setSelectedModuleId(null);
    setSelectedStepId(null);
    setStepFormDraft(null);
    setIsLibraryOpen(false);
    setRightPanelMode('editor');
    setView('configurations');
  };

  const handleSelectModule = (id: string) => {
    setSelectedModuleId(id);
    setSelectedStepId(null);
    setStepFormDraft(null);
    setIsLibraryOpen(false);
    setRightPanelMode('editor');
    setOpenMenuModuleId(null);
  };

  const handleBack = () => {
    setSelectedProductId(null);
    setSelectedConfigurationId(null);
    setSelectedModuleId(null);
    setSelectedStepId(null);
    setStepFormDraft(null);
    setIsLibraryOpen(false);
    setSearchTerm('');
    setRightPanelMode('editor');
    setView('products');
  };

  // ── Step handlers ────────────────────────────────────────────────────────────
  const initChecks = (step: Step): CheckItem[] => {
    if (step.checks) return step.checks;
    if (!step.checkType || step.checkType === 'none') return [];
    const label = step.checkType === 'checkbox' ? 'Confirm step is complete' : 'Enter measurement value';
    return [{ id: `ck-${Date.now()}`, type: step.checkType as 'checkbox' | 'measurement', label }];
  };

  const handleSelectStep = (id: string) => {
    setSelectedStepId(id);
    const step = effectiveSteps.find(s => s.id === id);
    if (!step) return;
    const images: StepImage[] = step.images
      ?? (step.imageUrl
        ? [{ id: 'img-0', url: step.imageUrl, caption: step.caption ?? '', annotations: step.annotations ?? [] }]
        : []);
    setStepFormDraft({ ...step, images, checks: initChecks(step) });
    setActiveImageIdx(0);
    setActiveStepTab('instruction');
    setView('step-editor');
  };

  const handleAddStep = () => {
    if (!selectedModule || !selectedModuleId) return;
    const newStep: Step = {
      id: `step-${Date.now()}`,
      stepType: 'text',
      action: '',
      imageUrl: null,
      caption: '',
      checkType: 'none',
      checks: [],
      images: [],
    };
    setModules(prev => prev.map(m => m.id === selectedModuleId
      ? { ...m, steps: [...m.steps, newStep] }
      : m
    ));
    setSelectedStepId(newStep.id);
    setStepFormDraft({ ...newStep });
    setActiveImageIdx(0);
    setActiveStepTab('instruction');
    setView('step-editor');
  };

  const handleDeleteStep = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedModuleId) return;
    setModules(prev => prev.map(m => m.id === selectedModuleId
      ? { ...m, steps: m.steps.filter(s => s.id !== stepId) }
      : m
    ));
    if (selectedStepId === stepId) {
      setSelectedStepId(null);
      setStepFormDraft(null);
      if (view === 'step-editor') setView('product-detail');
    }
  };

  const handleRenameStep = (stepId: string, name: string) => {
    if (!selectedModuleId) return;
    const trimmed = name.trim() || undefined;
    setModules(prev => prev.map(m => m.id === selectedModuleId
      ? { ...m, steps: m.steps.map(s => s.id === stepId ? { ...s, name: trimmed } : s) }
      : m
    ));
  };

  const handleDuplicateStep = (stepId: string) => {
    if (!selectedModuleId) return;
    const step = selectedModule?.steps.find(s => s.id === stepId);
    if (!step) return;
    const copy: Step = {
      ...step,
      id: `step-${Date.now()}`,
      name: step.name ? `${step.name} (copy)` : undefined,
      images: step.images?.map(img => ({ ...img, id: `img-${Date.now()}-${Math.random()}`, annotations: [...img.annotations] })),
    };
    setModules(prev => prev.map(m => {
      if (m.id !== selectedModuleId) return m;
      const idx = m.steps.findIndex(s => s.id === stepId);
      const steps = [...m.steps];
      steps.splice(idx + 1, 0, copy);
      return { ...m, steps };
    }));
  };

  const commitStepForm = () => {
    if (!selectedStepId || !selectedModuleId || !stepFormDraft) return;
    const firstImg = (stepFormDraft.images ?? [])[0];
    const derivedType: StepType = (firstImg?.url || stepFormDraft.imageUrl) ? 'visual' : 'text';
    const firstCheck = (stepFormDraft.checks ?? [])[0];
    const legacyCheckType: Step['checkType'] =
      firstCheck?.type === 'checkbox' ? 'checkbox' :
      firstCheck?.type === 'measurement' ? 'measurement' : 'none';
    const draft = {
      ...stepFormDraft,
      stepType: derivedType,
      checkType: legacyCheckType,
      imageUrl: firstImg?.url || null,
      caption: firstImg?.caption ?? stepFormDraft.caption ?? '',
      annotations: firstImg?.annotations ?? stepFormDraft.annotations ?? [],
    };
    setModules(prev => prev.map(m => m.id === selectedModuleId
      ? { ...m, steps: m.steps.map(s => s.id === selectedStepId ? { ...s, ...draft } : s) }
      : m
    ));
    setSelectedStepId(null);
    setStepFormDraft(null);
    setView('product-detail');
  };

  const handleDoneStepEditor = () => {
    if (!selectedStepId || !selectedModuleId || !stepFormDraft) return;
    commitStepForm();
  };

  // ── Check item handlers ──────────────────────────────────────────────────────
  const handleAddCheckItem = (type: CheckItem['type']) => {
    const newItem: CheckItem = type === 'qa'
      ? { id: `ck-${Date.now()}`, type, title: '', label: '', options: ['', ''] }
      : { id: `ck-${Date.now()}`, type, title: '', label: '' };
    setStepFormDraft(prev => prev ? { ...prev, checks: [...(prev.checks ?? []), newItem] } : prev);
  };

  const handleUpdateCheckItem = (id: string, patch: Partial<Pick<CheckItem, 'label' | 'title'>>) => {
    setStepFormDraft(prev => prev ? {
      ...prev,
      checks: (prev.checks ?? []).map(c => c.id === id ? { ...c, ...patch } : c),
    } : prev);
  };

  const handleDeleteCheckItem = (id: string) => {
    setStepFormDraft(prev => prev ? {
      ...prev,
      checks: (prev.checks ?? []).filter(c => c.id !== id),
    } : prev);
  };

  const handleUpdateQaOption = (id: string, optIdx: number, value: string) =>
    setStepFormDraft(prev => prev ? {
      ...prev,
      checks: (prev.checks ?? []).map(c =>
        c.id === id ? { ...c, options: (c.options ?? []).map((o, i) => i === optIdx ? value : o) } : c
      ),
    } : prev);

  const handleAddQaOption = (id: string) =>
    setStepFormDraft(prev => prev ? {
      ...prev,
      checks: (prev.checks ?? []).map(c =>
        c.id === id ? { ...c, options: [...(c.options ?? []), ''] } : c
      ),
    } : prev);

  const handleDeleteQaOption = (id: string, optIdx: number) =>
    setStepFormDraft(prev => prev ? {
      ...prev,
      checks: (prev.checks ?? []).map(c =>
        c.id === id ? { ...c, options: (c.options ?? []).filter((_, i) => i !== optIdx) } : c
      ),
    } : prev);

  // ── Image helpers ────────────────────────────────────────────────────────────
  const addImage = () => {
    const newImg: StepImage = { id: `img-${Date.now()}`, url: '', caption: '', annotations: [] };
    setStepFormDraft(prev => prev ? { ...prev, images: [...(prev.images ?? []), newImg] } : prev);
    setActiveImageIdx((stepFormDraft?.images?.length ?? 0));
  };

  const removeImage = (idx: number) => {
    setStepFormDraft(prev => {
      if (!prev) return prev;
      const imgs = (prev.images ?? []).filter((_, i) => i !== idx);
      return { ...prev, images: imgs };
    });
    setActiveImageIdx(i => Math.max(0, i >= idx ? i - 1 : i));
  };

  const updateImage = (idx: number, patch: Partial<StepImage>) =>
    setStepFormDraft(prev => {
      if (!prev) return prev;
      const imgs = [...(prev.images ?? [])];
      imgs[idx] = { ...imgs[idx], ...patch };
      return { ...prev, images: imgs };
    });

  // ── Annotation helpers ───────────────────────────────────────────────────────
  const handleUndoAnnotation = (imageIdx: number) => {
    setStepFormDraft(prev => {
      if (!prev) return prev;
      const imgs = [...(prev.images ?? [])];
      if (!imgs[imageIdx]) return prev;
      imgs[imageIdx] = { ...imgs[imageIdx], annotations: imgs[imageIdx].annotations.slice(0, -1) };
      return { ...prev, images: imgs };
    });
  };

  const handleClearAnnotations = (imageIdx: number) => {
    setStepFormDraft(prev => {
      if (!prev) return prev;
      const imgs = [...(prev.images ?? [])];
      if (!imgs[imageIdx]) return prev;
      imgs[imageIdx] = { ...imgs[imageIdx], annotations: [] };
      return { ...prev, images: imgs };
    });
  };

  const getPointerPercent = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  };

  const handleAnnotationPointerDown = (e: React.PointerEvent<HTMLDivElement>, imageIdx: number) => {
    if (activeTool === 'select') return;
    setActiveImageIdx(imageIdx);
    const { x, y } = getPointerPercent(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrawing({ startX: x, startY: y, endX: x, endY: y });
  };

  const handleAnnotationPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drawing) return;
    const { x, y } = getPointerPercent(e);
    setDrawing(prev => prev ? { ...prev, endX: x, endY: y } : null);
  };

  const handleAnnotationPointerUp = (imageIdx: number) => {
    if (!drawing) return;
    const { startX, startY, endX, endY } = drawing;
    const w = endX - startX;
    const h = endY - startY;
    if (Math.abs(w) < 1 && Math.abs(h) < 1) { setDrawing(null); return; }
    const newAnn: Annotation = {
      id: `ann-${Date.now()}`,
      type: activeTool as 'rect' | 'circle' | 'arrow',
      x: activeTool === 'arrow' ? startX : Math.min(startX, endX),
      y: activeTool === 'arrow' ? startY : Math.min(startY, endY),
      w: activeTool === 'arrow' ? w : Math.abs(w),
      h: activeTool === 'arrow' ? h : Math.abs(h),
      color: activeColor,
    };
    setStepFormDraft(prev => {
      if (!prev) return prev;
      const imgs = [...(prev.images ?? [])];
      if (!imgs[imageIdx]) return prev;
      imgs[imageIdx] = { ...imgs[imageIdx], annotations: [...(imgs[imageIdx].annotations ?? []), newAnn] };
      return { ...prev, images: imgs };
    });
    setDrawing(null);
  };

  const getPreviewAnnotation = (): Annotation | undefined => {
    if (!drawing) return undefined;
    return {
      id: 'preview',
      type: activeTool as 'rect' | 'circle' | 'arrow',
      x: activeTool === 'arrow' ? drawing.startX : Math.min(drawing.startX, drawing.endX),
      y: activeTool === 'arrow' ? drawing.startY : Math.min(drawing.startY, drawing.endY),
      w: activeTool === 'arrow' ? drawing.endX - drawing.startX : Math.abs(drawing.endX - drawing.startX),
      h: activeTool === 'arrow' ? drawing.endY - drawing.startY : Math.abs(drawing.endY - drawing.startY),
      color: activeColor,
    };
  };

  // ── Module handlers ──────────────────────────────────────────────────────────
  const handleAddCustomModule = () => {
    if (!selectedProductId) return;
    const newModule: Module = {
      id: `custom-${Date.now()}`,
      name: 'New Module',
      description: 'Add a description for this module.',
      isShared: false,
      steps: [],
    };
    setModules(prev => [...prev, newModule]);
    if (selectedConfigurationId) {
      setProducts(prev => prev.map(p => p.id === selectedProductId
        ? { ...p, configurations: p.configurations.map(c => c.id === selectedConfigurationId
            ? { ...c, moduleIds: [...c.moduleIds, newModule.id] }
            : c) }
        : p
      ));
    } else {
      setProducts(prev => prev.map(p => p.id === selectedProductId
        ? { ...p, moduleIds: [...p.moduleIds, newModule.id] }
        : p
      ));
    }
    handleSelectModule(newModule.id);
  };

  const handleAddModuleFromLibrary = (moduleId: string) => {
    if (!selectedProductId) return;
    if (activeModuleIds.includes(moduleId)) return;
    if (selectedConfigurationId) {
      setProducts(prev => prev.map(p => p.id === selectedProductId
        ? { ...p, configurations: p.configurations.map(c => c.id === selectedConfigurationId
            ? { ...c, moduleIds: [...c.moduleIds, moduleId] }
            : c) }
        : p
      ));
    } else {
      setProducts(prev => prev.map(p => p.id === selectedProductId
        ? { ...p, moduleIds: [...p.moduleIds, moduleId] }
        : p
      ));
    }
    setIsLibraryOpen(false);
  };

  const handleRemoveModule = (moduleId: string) => {
    if (!selectedProductId) return;
    if (selectedConfigurationId) {
      setProducts(prev => prev.map(p => p.id === selectedProductId
        ? { ...p, configurations: p.configurations.map(c => c.id === selectedConfigurationId
            ? { ...c, moduleIds: c.moduleIds.filter(id => id !== moduleId) }
            : c) }
        : p
      ));
    } else {
      setProducts(prev => prev.map(p => p.id === selectedProductId
        ? { ...p, moduleIds: p.moduleIds.filter(id => id !== moduleId) }
        : p
      ));
    }
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null);
      setSelectedStepId(null);
      setStepFormDraft(null);
    }
  };

  const handlePublishToLibrary = (moduleId: string) => {
    setModules(prev =>
      prev.map(m => m.id === moduleId ? { ...m, isShared: true } : m)
    );
  };

  const handleDuplicateModule = (moduleId: string) => {
    if (!selectedProductId) return;
    const source = modules.find(m => m.id === moduleId);
    if (!source) return;
    const newId = `custom-${Date.now()}`;
    const duplicate: Module = {
      ...source,
      id: newId,
      name: `${source.name} [Copy]`,
      isShared: false,
      steps: source.steps.map(s => ({ ...s, id: `${s.id}-copy` })),
    };
    setModules(prev => [...prev, duplicate]);
    if (selectedConfigurationId) {
      setProducts(prev => prev.map(p => p.id === selectedProductId
        ? { ...p, configurations: p.configurations.map(c => c.id === selectedConfigurationId
            ? { ...c, moduleIds: [...c.moduleIds, newId] }
            : c) }
        : p
      ));
    } else {
      setProducts(prev => prev.map(p => p.id === selectedProductId
        ? { ...p, moduleIds: [...p.moduleIds, newId] }
        : p
      ));
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
    setProducts(prev => prev.map(p => ({
      ...p,
      moduleIds: p.moduleIds.filter(id => id !== moduleId),
      configurations: p.configurations.map(c => ({
        ...c,
        moduleIds: c.moduleIds.filter(id => id !== moduleId),
      })),
    })));
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null);
      setSelectedStepId(null);
      setStepFormDraft(null);
    }
  };

  const handleStartRename = (moduleId: string, currentName: string) => {
    setRenamingModuleId(moduleId);
    setRenameValue(currentName);
    setOpenMenuModuleId(null);
  };

  const handleCommitRename = () => {
    if (!renamingModuleId || !renameValue.trim()) { setRenamingModuleId(null); return; }
    setModules(prev => prev.map(m =>
      m.id === renamingModuleId ? { ...m, name: renameValue.trim() } : m
    ));
    setRenamingModuleId(null);
  };

  const handleCancelRename = () => setRenamingModuleId(null);

  const handleAddModuleCopy = (moduleId: string) => {
    if (!selectedProductId) return;
    const source = modules.find(m => m.id === moduleId);
    if (!source) return;
    const newId = `custom-${Date.now()}`;
    const copy: Module = {
      ...source,
      id: newId,
      isShared: false,
      steps: source.steps.map(s => ({ ...s, id: `${s.id}-cp` })),
    };
    setModules(prev => [...prev, copy]);
    if (selectedConfigurationId) {
      setProducts(prev => prev.map(p => p.id === selectedProductId
        ? { ...p, configurations: p.configurations.map(c => c.id === selectedConfigurationId
            ? { ...c, moduleIds: [...c.moduleIds, newId] }
            : c) }
        : p
      ));
    } else {
      setProducts(prev => prev.map(p => p.id === selectedProductId
        ? { ...p, moduleIds: [...p.moduleIds, newId] }
        : p
      ));
    }
    setIsLibraryOpen(false);
  };

  const handleAddLibraryModule = (moduleId: string) => {
    const source = modules.find(m => m.id === moduleId);
    if (!source) return;
    if (source.isShared) {
      handleAddModuleFromLibrary(moduleId);
    } else {
      handleAddModuleCopy(moduleId);
    }
  };

  // ── Drag-and-drop handlers ───────────────────────────────────────────────────
  const handleReorderModules = (newIds: string[]) => {
    if (selectedConfigurationId) {
      setProducts(prev => prev.map(p => p.id === selectedProductId
        ? { ...p, configurations: p.configurations.map(c => c.id === selectedConfigurationId
            ? { ...c, moduleIds: newIds } : c) }
        : p
      ));
    } else if (selectedProductId) {
      setProducts(prev => prev.map(p => p.id === selectedProductId
        ? { ...p, moduleIds: newIds } : p
      ));
    }
  };

  const handleReorderSteps = (moduleId: string, newSteps: Step[]) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, steps: newSteps } : m));
  };

  const handleMoveStep = (stepId: string, fromModuleId: string, toModuleId: string) => {
    const fromMod = modules.find(m => m.id === fromModuleId);
    const toMod = modules.find(m => m.id === toModuleId);
    if (!fromMod || !toMod) return;
    const step = fromMod.steps.find(s => s.id === stepId);
    if (!step) return;
    setModules(prev => prev.map(m => {
      if (m.id === fromModuleId) return { ...m, steps: m.steps.filter(s => s.id !== stepId) };
      if (m.id === toModuleId) return { ...m, steps: [...m.steps, step] };
      return m;
    }));
    if (selectedStepId === stepId) {
      setSelectedModuleId(toModuleId);
    }
  };

  // ── Product handlers ─────────────────────────────────────────────────────────
  const handleAddProduct = () => {
    setAddProductDialogOpen(true);
  };

  const handleConfirmAddProduct = (name: string) => {
    if (!name.trim()) return;
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      description: 'New product — add a description.',
      imageUrl: null,
      moduleIds: [],
      configurations: [],
    };
    setProducts(prev => [...prev, newProduct]);
    setAddProductDialogOpen(false);
    handleSelectProduct(newProduct.id);
  };

  return {
    // View
    view,
    // Data
    products, modules,
    // Navigation state
    selectedProductId, selectedConfigurationId, selectedModuleId, selectedStepId,
    // UI state
    searchTerm, setSearchTerm,
    isLibraryOpen, setIsLibraryOpen,
    rightPanelMode, setRightPanelMode,
    openMenuModuleId, setOpenMenuModuleId,
    renamingModuleId, renameValue, setRenameValue,
    addProductDialogOpen, setAddProductDialogOpen,
    // Step editor state
    stepFormDraft, setStepFormDraft,
    activeStepTab, setActiveStepTab,
    activeTool, setActiveTool,
    activeColor, setActiveColor,
    drawing,
    activeImageIdx, setActiveImageIdx,
    // Derived
    selectedProduct, selectedConfiguration, selectedModule,
    productModules, effectiveSteps,
    filteredProducts, libraryShared, libraryFromOthers,
    // Predicates
    moduleUsageCount,
    // Navigation handlers
    handleBack, handleSelectProduct, handleSelectConfiguration,
    handleAddConfiguration, handleBackFromConfigurations, handleBackToConfigurations, handleSelectModule,
    // Step handlers
    handleSelectStep, handleAddStep, handleDeleteStep, handleRenameStep, handleDuplicateStep,
    commitStepForm, handleDoneStepEditor,
    // Check item handlers
    handleAddCheckItem, handleUpdateCheckItem, handleDeleteCheckItem,
    handleUpdateQaOption, handleAddQaOption, handleDeleteQaOption,
    // Image helpers
    addImage, removeImage, updateImage,
    // Annotation helpers
    handleAnnotationPointerDown, handleAnnotationPointerMove, handleAnnotationPointerUp,
    handleUndoAnnotation, handleClearAnnotations,
    getPreviewAnnotation,
    // Module handlers
    handleAddCustomModule,
    handleAddModuleFromLibrary, handleAddLibraryModule, handleRemoveModule,
    handleDuplicateModule, handleDeleteModule, handleStartRename, handleCommitRename, handleCancelRename, handleAddModuleCopy,
    handlePublishToLibrary,
    handleReorderModules, handleReorderSteps, handleMoveStep,
    // Product handlers
    handleAddProduct, handleConfirmAddProduct,
  };
}

export type InstructionBuilderState = ReturnType<typeof useInstructionBuilder>;
