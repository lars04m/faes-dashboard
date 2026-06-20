import React, { useState } from 'react';
import { Search, X, Filter, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import './BugReports.css';
import { InstructionBuilder } from './InstructionBuilder';
import type { Step } from './InstructionBuilder/types';

interface BugReport {
  id: string;
  title: string;
  description: string;
  priority: 'unassigned' | 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  reportedBy: string;
  reportedDate: string;
  steps: string[];
}

const initialBugs: BugReport[] = [
  {
    id: 'BUG-101',
    title: 'Dashboard layout breaking on 1024px screens',
    description: 'The grid elements overlap on medium-sized screens. The sidebar overlaps main content dashboard container panels.',
    priority: 'high',
    status: 'in-progress',
    reportedBy: 'Alice Smith',
    reportedDate: '2026-06-11',
    steps: [
      'Navigate to the main dashboard page.',
      'Resize the browser window to exactly 1024px wide.',
      'Observe the sidebar menu overlapping the right dashboard metrics card.'
    ]
  },
  {
    id: 'BUG-102',
    title: 'Instruction Builder cannot export PDF',
    description: 'Clicking the PDF export button in the builder freezes the browser tab. Likely a memory leak during HTML-to-Canvas rasterization.',
    priority: 'unassigned', // Untagged
    status: 'open',
    reportedBy: 'Bob Jones',
    reportedDate: '2026-06-12',
    steps: [
      'Go to the Instruction Builder.',
      'Create 8 steps with descriptions.',
      'Click the "Export Manual" or print icon.',
      'Observe the browser tab freezing completely.'
    ]
  },
  {
    id: 'BUG-103',
    title: 'Version tag mismatch on production deployment logs',
    description: 'The deployment logs report version tags as v2.3.9 even after the v2.4.0 rollout was verified.',
    priority: 'unassigned', // Untagged
    status: 'resolved',
    reportedBy: 'Charlie Green',
    reportedDate: '2026-06-09',
    steps: [
      'Navigate to the Versions page.',
      'View the deployment logs for production environment.',
      'Check current release tag showing v2.3.9 instead of expected v2.4.0.'
    ]
  },
  {
    id: 'BUG-104',
    title: 'Search bar inputs lagging on long queries',
    description: 'Keyboard input displays lag when searching through a large list of bug records without a proper debounce rate.',
    priority: 'low',
    status: 'in-progress',
    reportedBy: 'David Brown',
    reportedDate: '2026-06-10',
    steps: [
      'Go to Bug Reports tab.',
      'Type a query containing more than 40 characters rapidly into search box.',
      'Notice rendering delay on text characters.'
    ]
  },
  {
    id: 'BUG-105',
    title: 'API Gateway timeout on bulk requests',
    description: 'Gateway times out with HTTP 504 status when bulk operations request payload exceeds 50MB size limit.',
    priority: 'unassigned', // Untagged
    status: 'open',
    reportedBy: 'Lars Mombarg',
    reportedDate: '2026-06-12',
    steps: [
      'Send a bulk POST request to the config endpoint.',
      'Ensure payload size exceeds 50MB.',
      'Observe gateway response times out after 30 seconds.'
    ]
  },
  {
    id: 'BUG-106',
    title: 'Broken image links in user settings page',
    description: 'User avatar thumbnail elements point to relative fallback addresses instead of CDN buckets.',
    priority: 'low',
    status: 'resolved',
    reportedBy: 'Emma Stone',
    reportedDate: '2026-06-08',
    steps: [
      'Navigate to Settings drawer.',
      'Inspect avatar image source url path.'
    ]
  }
];

const priorityWeight = {
  high: 3,
  medium: 2,
  low: 1,
  unassigned: 0
};

const bugBuilderMapping: Record<string, {
  productId: string;
  configurationId: string;
  moduleId: string;
  stepId: string;
}> = {
  'BUG-101': { productId: 'p-2', configurationId: 'cfg-p2-1', moduleId: 'lm-5', stepId: 'lm-5-s2' },
  'BUG-102': { productId: 'p-1', configurationId: 'cfg-p1-1', moduleId: 'lm-1', stepId: 'lm-1-s1' },
  'BUG-103': { productId: 'p-3', configurationId: 'cfg-p3-1', moduleId: 'lm-4', stepId: 'lm-4-s1' },
  'BUG-104': { productId: 'p-2', configurationId: 'cfg-p2-2', moduleId: 'lm-6', stepId: 'lm-6-s1' },
  'BUG-105': { productId: 'p-5', configurationId: 'cfg-p5-1', moduleId: 'lm-3', stepId: 'lm-3-s1' },
  'BUG-106': { productId: 'p-3', configurationId: 'cfg-p3-2', moduleId: 'lm-2', stepId: 'lm-2-s3' },
};

// Default steps for the mock bug review
const defaultOldSteps: Step[] = [
  { id: 'diff-s1', stepType: 'text', action: 'Clean the packaging workstation of any debris, dust, or foreign objects.', checkType: 'none', checks: [], images: [], imageUrl: null, caption: '' },
  { id: 'diff-s2', stepType: 'text', action: 'Peel the protective backing film from the four self-adhesive foam corners.', checkType: 'none', checks: [], images: [], imageUrl: null, caption: '' },
  { id: 'diff-s3-old', stepType: 'text', action: 'Carefully lift the product by the handle straps. Align it with the corner blocks and drop it down quickly to seat.', checkType: 'none', checks: [], images: [], imageUrl: null, caption: '' },
  { id: 'diff-s4', stepType: 'text', action: 'Fold the top box flaps shut. Apply two layers of heavy-duty fiber packaging tape across the center seam.', checkType: 'none', checks: [], images: [], imageUrl: null, caption: '' },
];

const defaultNewSteps: Step[] = [
  { id: 'diff-s1', stepType: 'text', action: 'Clean the packaging workstation of any debris, dust, or foreign objects.', checkType: 'none', checks: [], images: [], imageUrl: null, caption: '' },
  { id: 'diff-s2', stepType: 'text', action: 'Peel the protective backing film from the four self-adhesive foam corners.', checkType: 'none', checks: [], images: [], imageUrl: null, caption: '' },
  { id: 'diff-s3-new', stepType: 'text', action: 'Carefully hoist the heavy equipment core. Align the base corners with the foam channels and gently lower the unit until it seats flush.', checkType: 'none', checks: [], images: [], imageUrl: null, caption: '' },
  { id: 'diff-s4', stepType: 'text', action: 'Fold the top box flaps shut. Apply two layers of heavy-duty fiber packaging tape across the center seam.', checkType: 'none', checks: [], images: [], imageUrl: null, caption: '' },
];

interface DiffItem {
  type: 'unchanged' | 'modified' | 'added' | 'removed';
  left?: Step;
  right?: Step;
}

function alignSteps(original: Step[], edited: Step[]): DiffItem[] {
  const diffItems: DiffItem[] = [];
  const originalMap = new Map(original.map(s => [s.id, s]));
  const editedMap = new Map(edited.map(s => [s.id, s]));
  
  let editedIdx = 0;
  
  for (const origStep of original) {
    if (!editedMap.has(origStep.id)) {
      diffItems.push({
        type: 'removed',
        left: origStep
      });
    } else {
      while (editedIdx < edited.length && edited[editedIdx].id !== origStep.id) {
        const curEdited = edited[editedIdx];
        if (!originalMap.has(curEdited.id)) {
          diffItems.push({
            type: 'added',
            right: curEdited
          });
        }
        editedIdx++;
      }
      
      const curEdited = edited[editedIdx];
      const isModified = origStep.action !== curEdited.action || origStep.checkType !== curEdited.checkType;
      diffItems.push({
        type: isModified ? 'modified' : 'unchanged',
        left: origStep,
        right: curEdited
      });
      editedIdx++;
    }
  }
  
  while (editedIdx < edited.length) {
    const curEdited = edited[editedIdx];
    if (!originalMap.has(curEdited.id)) {
      diffItems.push({
        type: 'added',
        right: curEdited
      });
    }
    editedIdx++;
  }
  
  return diffItems;
}

export const BugReports: React.FC = () => {
  const [bugs, setBugs] = useState<BugReport[]>(initialBugs);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);

  // Track the edited instruction state from the embedded builder
  const [editedInstructionInfo, setEditedInstructionInfo] = useState<{
    selectedProduct: { id: string; name: string } | null;
    selectedModule: { id: string; name: string } | null;
    originalSteps: Step[];
    editedSteps: Step[];
  } | null>(null);

  // Split view/overlay state for Review Page
  const [showReviewPage, setShowReviewPage] = useState<BugReport | null>(null);

  // Slideshow State
  const [slideIndex, setSlideIndex] = useState(0);

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Review Action Panel states
  const [actionPanelExpanded, setActionPanelExpanded] = useState(true);
  const [denyReason, setDenyReason] = useState('');
  const [denyError, setDenyError] = useState(false);

  // Untagged Bugs list (where priority is unassigned)
  const untaggedBugs = bugs.filter(b => b.priority === 'unassigned');
  const totalUntagged = untaggedBugs.length;

  // Safe navigation inside untagged bugs slideshow
  const activeSlideBug = totalUntagged > 0 
    ? untaggedBugs[Math.min(slideIndex, totalUntagged - 1)] 
    : null;

  const handleNextSlide = () => {
    if (slideIndex < totalUntagged - 1) {
      setSlideIndex(slideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  };

  const handleAssignPriority = (bugId: string, priority: BugReport['priority']) => {
    setBugs(prev => prev.map(b => 
      b.id === bugId ? { ...b, priority } : b
    ));

    // Keep active details in sync
    if (selectedBug && selectedBug.id === bugId) {
      setSelectedBug(prev => prev ? { ...prev, priority } : null);
    }

    // Adjust slide index if the tagged bug leaves the list
    if (totalUntagged <= 1) {
      setSlideIndex(0);
    } else if (slideIndex >= totalUntagged - 1) {
      setSlideIndex(totalUntagged - 2);
    }
  };

  const handleUpdateStatus = (bugId: string, newStatus: BugReport['status']) => {
    setBugs(bugs.map(b => b.id === bugId ? { ...b, status: newStatus } : b));
    if (selectedBug && selectedBug.id === bugId) {
      setSelectedBug({ ...selectedBug, status: newStatus });
    }
  };

  // Redirect & Notify Handlers
  const handleSaveDraft = (bugId: string) => {
    setSelectedBug(null);
    setEditedInstructionInfo(null);
    setToast({
      message: `Draft saved successfully for ${bugId}`,
      type: 'info'
    });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmitReview = () => {
    if (selectedBug) {
      // Redirect to the review page overlay
      setShowReviewPage(selectedBug);
    }
  };

  const handleApproveMerge = (bugId: string) => {
    setShowReviewPage(null);
    setSelectedBug(null);
    setEditedInstructionInfo(null);
    setToast({
      message: `Changes for ${bugId} approved and merged successfully`,
      type: 'success'
    });
    setTimeout(() => setToast(null), 3500);
    setDenyReason('');
    setDenyError(false);
  };

  const handleDenyMerge = (bugId: string) => {
    if (!denyReason.trim()) {
      setDenyError(true);
      return;
    }
    setShowReviewPage(null);
    setSelectedBug(null);
    setEditedInstructionInfo(null);
    setToast({
      message: `Changes for ${bugId} denied: "${denyReason.trim()}"`,
      type: 'info'
    });
    setTimeout(() => setToast(null), 4000);
    setDenyReason('');
    setDenyError(false);
  };

  // Filter logic
  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bug.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bug.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || bug.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Sort logic (Primary: Priority weight, Secondary: Date reported newest first)
  const sortedBugs = [...filteredBugs].sort((a, b) => {
    const weightA = priorityWeight[a.priority];
    const weightB = priorityWeight[b.priority];
    
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    
    return new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime();
  });

  const getPriorityBadge = (priority: BugReport['priority']) => {
    switch (priority) {
      case 'high': 
        return <span className="priority-indicator high"><span className="dot" />High</span>;
      case 'medium': 
        return <span className="priority-indicator medium"><span className="dot" />Medium</span>;
      case 'low': 
        return <span className="priority-indicator low"><span className="dot" />Low</span>;
      case 'unassigned':
        return <span className="priority-indicator unassigned"><span className="dot" />Untagged</span>;
    }
  };

  const getStatusBadge = (status: BugReport['status']) => {
    switch (status) {
      case 'open': 
        return <span className="status-indicator open"><span className="dot" />Open</span>;
      case 'in-progress': 
        return <span className="status-indicator progress"><span className="dot" />In Progress</span>;
      case 'resolved': 
        return <span className="status-indicator resolved"><span className="dot" />Resolved</span>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Title Header (Only show when not in Review View) */}
      {!showReviewPage && (
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Bug Reports</h1>
            <p className="dashboard-subtitle">Monitor system health, log active software issues, and track debugging workflows.</p>
          </div>
        </div>
      )}

      {/* Review Page View (Side-by-Side Instruction Diffs) */}
      {showReviewPage ? (() => {
        const originalSteps = editedInstructionInfo ? editedInstructionInfo.originalSteps : defaultOldSteps;
        const editedSteps = editedInstructionInfo ? editedInstructionInfo.editedSteps : defaultNewSteps;
        const diffItems = alignSteps(originalSteps, editedSteps);
        
        const moduleTitle = editedInstructionInfo
          ? `${editedInstructionInfo.selectedProduct?.name} — ${editedInstructionInfo.selectedModule?.name}`
          : 'Box Assembly Manual';
        const oldVersionLabel = editedInstructionInfo 
          ? `Original Version` 
          : 'Previous Version (v2.4.0)';
        const newVersionLabel = editedInstructionInfo 
          ? `Modified Version (Draft)` 
          : 'Proposed Version (v2.4.1-rc1)';

        return (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', position: 'relative' }}>
            <div className="dashboard-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <span style={{ color: 'var(--brand-orange)', fontSize: '0.85rem', fontWeight: 600 }}>INSTRUCTION MERGE REQUEST</span>
                <h1 className="dashboard-title" style={{ fontSize: '1.5rem', marginTop: '0.15rem' }}>Review Changes: {showReviewPage.id}</h1>
                <p className="dashboard-subtitle">Comparing proposed instruction updates for {moduleTitle}.</p>
              </div>
            </div>

            {/* Step Card-based side-by-side diff viewer */}
            <div className="diff-container" style={{ flex: 1 }}>
              
              {/* Left Column: Old Version */}
              <div className="diff-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="diff-column-header">
                  {oldVersionLabel}
                </div>
                <div className="diff-content" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                  {diffItems.map((item, idx) => {
                    if (item.type === 'added') {
                      return <div key={`empty-l-${idx}`} className="diff-step-placeholder" />;
                    }
                    const step = item.left!;
                    const stepClass = item.type === 'removed' ? 'diff-step-card removed' : (item.type === 'modified' ? 'diff-step-card modified-old' : 'diff-step-card');
                    return (
                      <div key={`left-${step.id}`} className={stepClass}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.8rem', opacity: 0.85 }}>
                          <span>{item.type === 'removed' ? '-' : ' '}</span>
                          <span>Step {idx + 1}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.4', marginTop: '0.25rem' }}>
                          {step.action || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No action text</span>}
                        </div>
                        {step.checkType && step.checkType !== 'none' && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <span className="sheet-badge sheet-badge-tool" style={{ fontSize: '0.7rem' }}>
                              {step.checkType === 'checkbox' ? 'Checkbox' : 'Measurement'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Proposed Version */}
              <div className="diff-column" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="diff-column-header" style={{
                  color: editedInstructionInfo ? 'var(--brand-navy)' : 'var(--color-success)',
                  borderBottomColor: editedInstructionInfo ? 'var(--border-color)' : 'rgba(16, 185, 129, 0.15)'
                }}>
                  {newVersionLabel}
                </div>
                <div className="diff-content" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                  {diffItems.map((item, idx) => {
                    if (item.type === 'removed') {
                      return <div key={`empty-r-${idx}`} className="diff-step-placeholder" />;
                    }
                    const step = item.right!;
                    const stepClass = item.type === 'added' ? 'diff-step-card added' : (item.type === 'modified' ? 'diff-step-card modified-new' : 'diff-step-card');
                    return (
                      <div key={`right-${step.id}`} className={stepClass}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.8rem', opacity: 0.85 }}>
                          <span>{item.type === 'added' ? '+' : ' '}</span>
                          <span>Step {idx + 1}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', lineHeight: '1.4', marginTop: '0.25rem' }}>
                          {step.action || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No action text</span>}
                        </div>
                        {step.checkType && step.checkType !== 'none' && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <span className="sheet-badge sheet-badge-tool" style={{ fontSize: '0.7rem' }}>
                              {step.checkType === 'checkbox' ? 'Checkbox' : 'Measurement'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Floating Action Panel in Bottom-Right */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: actionPanelExpanded ? '350px' : '160px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              padding: '0.75rem',
              zIndex: 1000,
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--brand-navy)' }}>Review Actions</span>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', height: '24px' }} 
                  onClick={() => setActionPanelExpanded(!actionPanelExpanded)}
                >
                  {actionPanelExpanded ? 'Minimize' : 'Expand'}
                </button>
              </div>

              {actionPanelExpanded && (
                <>
                  <div style={{ marginTop: '0.25rem' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.75rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                      <span>Reason for denying:</span>
                      {denyError && <span style={{ color: 'var(--color-danger)', fontWeight: 500 }}>* Required on deny</span>}
                    </label>
                    <textarea
                      className="form-input"
                      style={{ 
                        width: '100%', 
                        minHeight: '60px', 
                        fontSize: '0.8rem', 
                        padding: '0.4rem', 
                        borderRadius: '4px',
                        border: denyError ? '1px solid var(--color-danger)' : '1px solid var(--border-color)',
                        resize: 'none'
                      }}
                      placeholder="Enter reason..."
                      value={denyReason}
                      onChange={(e) => {
                        setDenyReason(e.target.value);
                        if (e.target.value.trim()) setDenyError(false);
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                    <button 
                      className="btn-danger" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem', backgroundColor: 'var(--color-danger)', color: 'white' }} 
                      onClick={() => handleDenyMerge(showReviewPage.id)}
                    >
                      Deny
                    </button>
                    <button 
                      className="btn-success" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }} 
                      onClick={() => handleApproveMerge(showReviewPage.id)}
                    >
                      Approve & Merge
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }} 
                      onClick={() => { setShowReviewPage(null); setDenyReason(''); setDenyError(false); }}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        );
      })() : (
        /* Standard View (Table or Details split view) */
        <>
          {/* Untagged Bugs Banner & Slideshow */}
          {!selectedBug && totalUntagged > 0 && activeSlideBug && (
            <div className="untagged-banner">
              <div className="banner-header">
                <AlertTriangle size={18} />
                <span>Classification Required: {totalUntagged} bug{totalUntagged > 1 ? 's lack' : ' lacks'} priority tagging in the dashboard</span>
              </div>

              <div className="slideshow-card">
                <div className="slideshow-meta">
                  <span style={{ fontWeight: 600, color: 'var(--brand-orange)' }}>{activeSlideBug.id}</span>
                  <div className="slideshow-nav">
                    <span style={{ marginRight: '0.5rem', fontSize: '0.85rem' }}>
                      {Math.min(slideIndex + 1, totalUntagged)} of {totalUntagged}
                    </span>
                    <button 
                      className="slideshow-btn" 
                      disabled={slideIndex === 0} 
                      onClick={handlePrevSlide}
                      title="Previous Untagged Bug"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      className="slideshow-btn" 
                      disabled={slideIndex >= totalUntagged - 1} 
                      onClick={handleNextSlide}
                      title="Next Untagged Bug"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="slideshow-title" style={{ cursor: 'pointer' }} onClick={() => setSelectedBug(activeSlideBug)}>
                    {activeSlideBug.title}
                  </div>
                  <p className="slideshow-desc" style={{ marginTop: '0.25rem' }}>{activeSlideBug.description}</p>
                </div>

                <div className="tagging-actions">
                  <span className="tag-editor-label">Assign Priority Tag:</span>
                  <div className="quick-tags">
                    <button className="quick-tag-btn" onClick={() => handleAssignPriority(activeSlideBug.id, 'low')}>Low</button>
                    <button className="quick-tag-btn" onClick={() => handleAssignPriority(activeSlideBug.id, 'medium')}>Medium</button>
                    <button className="quick-tag-btn" onClick={() => handleAssignPriority(activeSlideBug.id, 'high')}>High</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters (Only show when not in details view) */}
          {!selectedBug && (
            <div className="filter-bar glass-card" style={{ padding: '1rem 1.25rem' }}>
              <div className="search-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder="Search by ID, title, details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-controls">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Filter size={14} style={{ color: 'var(--text-secondary)' }} />
                  <select
                    className="select-filter"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="unassigned">Untagged</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <select
                  className="select-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '0 0.5rem', borderLeft: '1px solid var(--border-color)' }}>
                  Sorted by Priority & Date
                </div>
              </div>
            </div>
          )}

          {/* Main Content: Split View or Full-page Table View */}
          {selectedBug ? (
            <div className="split-view-container" style={{ height: 'calc(100vh - 150px)', marginTop: '0' }}>
              {/* Column 1: Instruction Builder workspace */}
              <div className="split-middle-editor" style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {(() => {
                  const mapping = bugBuilderMapping[selectedBug.id];
                  return (
                    <InstructionBuilder
                      key={selectedBug.id}
                      embedded={true}
                      onInstructionChange={setEditedInstructionInfo}
                      initialProductId={mapping?.productId}
                      initialConfigurationId={mapping?.configurationId}
                      initialModuleId={mapping?.moduleId}
                      initialStepId={mapping?.stepId}
                    />
                  );
                })()}
              </div>

              {/* Column 2: Bug Details on Right */}
              <div className="split-right-details">
                <div className="details-header">
                  <div>
                    <span style={{ color: 'var(--brand-orange)', fontSize: '0.8rem', fontWeight: 600 }}>{selectedBug.id}</span>
                    <h2 style={{ fontSize: '1rem', color: 'var(--brand-navy)', marginTop: '0.15rem', lineHeight: '1.2' }}>{selectedBug.title}</h2>
                  </div>
                  <X className="modal-close" onClick={() => { setSelectedBug(null); setEditedInstructionInfo(null); }} style={{ cursor: 'pointer', flexShrink: 0, marginLeft: '0.5rem' }} />
                </div>

                <div className="details-scroll">
                  {/* Linked Instruction Info Box */}
                  {editedInstructionInfo && (
                    <div style={{ backgroundColor: '#fff8f2', border: '1px solid #ffe8d6', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--brand-orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Linked Instruction</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-navy)', marginTop: '0.15rem' }}>
                        {editedInstructionInfo.selectedProduct?.name} › {editedInstructionInfo.selectedModule?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        {editedInstructionInfo.editedSteps.length} step(s) in draft
                      </div>
                    </div>
                  )}

                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Reported By</span>
                    <span className="modal-detail-value">{selectedBug.reportedBy}</span>
                  </div>
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Reported Date</span>
                    <span className="modal-detail-value">{selectedBug.reportedDate}</span>
                  </div>
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Priority</span>
                    <select 
                      className="select-filter" 
                      value={selectedBug.priority} 
                      style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.825rem' }}
                      onChange={(e) => handleAssignPriority(selectedBug.id, e.target.value as BugReport['priority'])}
                    >
                      <option value="unassigned">Untagged</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Status</span>
                    <select 
                      className="select-filter" 
                      value={selectedBug.status} 
                      style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.825rem' }}
                      onChange={(e) => handleUpdateStatus(selectedBug.id, e.target.value as BugReport['status'])}
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="modal-description-box">
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--brand-navy)' }}>Description</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedBug.description}</p>
                  </div>


                </div>

                <div className="details-footer">
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1 }} 
                    onClick={() => handleSaveDraft(selectedBug.id)}
                  >
                    Save draft
                  </button>
                  <button 
                    className="btn-success" 
                    style={{ flex: 1 }} 
                    onClick={handleSubmitReview}
                  >
                    Submit for review
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Regular Full-page Table View */
            <div className="glass-card bug-table-card">
              <div className="bug-table-container">
                <table className="bug-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Issue Summary</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Reported By</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBugs.length > 0 ? (
                      sortedBugs.map((bug) => (
                        <tr key={bug.id} className="bug-row" onClick={() => setSelectedBug(bug)}>
                          <td style={{ fontWeight: 600, color: 'var(--brand-orange)' }}>{bug.id}</td>
                          <td>
                            <div className="bug-summary">{bug.title}</div>
                            <div className="bug-desc-short">{bug.description}</div>
                          </td>
                          <td>{getPriorityBadge(bug.priority)}</td>
                          <td>{getStatusBadge(bug.status)}</td>
                          <td>{bug.reportedBy}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>{bug.reportedDate}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          No bug reports found matching filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Action Notification Toast Overlay */}
      {toast && (
        <div className={`deploy-toast ${toast.type === 'success' ? 'success-toast' : 'info-toast'}`}>
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
          ) : (
            <Info size={16} style={{ color: 'var(--color-info)', flexShrink: 0 }} />
          )}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--brand-navy)' }}>
              {toast.type === 'success' ? 'Changes Merged' : 'Draft Saved'}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              {toast.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
