import React, { useState } from 'react';
import { Search, X, Filter, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import './BugReports.css';

interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'unassigned' | 'low' | 'medium' | 'high' | 'critical';
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
    severity: 'high',
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
    severity: 'unassigned', // Untagged
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
    severity: 'unassigned', // Untagged
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
    severity: 'low',
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
    severity: 'unassigned', // Untagged
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
    severity: 'low',
    status: 'resolved',
    reportedBy: 'Emma Stone',
    reportedDate: '2026-06-08',
    steps: [
      'Navigate to Settings drawer.',
      'Inspect avatar image source url path.'
    ]
  }
];

const severityWeight = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  unassigned: 0
};

export const BugReports: React.FC = () => {
  const [bugs, setBugs] = useState<BugReport[]>(initialBugs);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);

  // Split view/overlay state for Review Page
  const [showReviewPage, setShowReviewPage] = useState<BugReport | null>(null);

  // Slideshow State
  const [slideIndex, setSlideIndex] = useState(0);

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Untagged Bugs list (where severity is unassigned)
  const untaggedBugs = bugs.filter(b => b.severity === 'unassigned');
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

  const handleAssignSeverity = (bugId: string, severity: BugReport['severity']) => {
    setBugs(prev => prev.map(b => 
      b.id === bugId ? { ...b, severity } : b
    ));

    // Keep active details in sync
    if (selectedBug && selectedBug.id === bugId) {
      setSelectedBug(prev => prev ? { ...prev, severity } : null);
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
    setToast({
      message: `Changes for ${bugId} approved and merged successfully`,
      type: 'success'
    });
    setTimeout(() => setToast(null), 3500);
  };

  // Filter logic
  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          bug.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bug.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || bug.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Sort logic (Primary: Severity weight, Secondary: Date reported newest first)
  const sortedBugs = [...filteredBugs].sort((a, b) => {
    const weightA = severityWeight[a.severity];
    const weightB = severityWeight[b.severity];
    
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    
    return new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime();
  });

  const getSeverityBadge = (severity: BugReport['severity']) => {
    switch (severity) {
      case 'critical': 
        return <span className="severity-indicator critical"><span className="dot" />Critical</span>;
      case 'high': 
        return <span className="severity-indicator high"><span className="dot" />High</span>;
      case 'medium': 
        return <span className="severity-indicator medium"><span className="dot" />Medium</span>;
      case 'low': 
        return <span className="severity-indicator low"><span className="dot" />Low</span>;
      case 'unassigned':
        return <span className="severity-indicator unassigned"><span className="dot" />Untagged</span>;
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
      {showReviewPage ? (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
          <div className="dashboard-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <span style={{ color: 'var(--brand-orange)', fontSize: '0.85rem', fontWeight: 600 }}>INSTRUCTION MERGE REQUEST</span>
              <h1 className="dashboard-title" style={{ fontSize: '1.5rem', marginTop: '0.15rem' }}>Review Changes: {showReviewPage.id}</h1>
              <p className="dashboard-subtitle">Comparing proposed instruction updates for box assembly manuals.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowReviewPage(null)}
              >
                Back
              </button>
              <button 
                className="btn-success" 
                onClick={() => handleApproveMerge(showReviewPage.id)}
              >
                Approve & Merge
              </button>
            </div>
          </div>

          {/* GitHub-like split diff viewer */}
          <div className="diff-container" style={{ flex: 1 }}>
            
            {/* Left Column: Old Version */}
            <div className="diff-column">
              <div className="diff-column-header">
                Previous Version (v2.4.0)
              </div>
              <div className="diff-content">
                <div className="diff-line">
                  <span className="diff-line-number">1</span>
                  <span className="diff-sign"> </span>
                  <span className="diff-text">Clean the packaging workstation of any debris, dust, or foreign objects.</span>
                </div>
                
                <div className="diff-line">
                  <span className="diff-line-number">2</span>
                  <span className="diff-sign"> </span>
                  <span className="diff-text">Peel the protective backing film from the four self-adhesive foam corners.</span>
                </div>
                
                <div className="diff-line removed">
                  <span className="diff-line-number">3</span>
                  <span className="diff-sign">-</span>
                  <span className="diff-text">Carefully lift the product by the handle straps. Align it with the corner blocks and drop it down quickly to seat.</span>
                </div>
                
                <div className="diff-line empty-placeholder">
                  <span className="diff-line-number"> </span>
                  <span className="diff-sign"> </span>
                  <span className="diff-text" style={{ color: '#cbd5e1' }}> </span>
                </div>
                
                <div className="diff-line">
                  <span className="diff-line-number">4</span>
                  <span className="diff-sign"> </span>
                  <span className="diff-text">Fold the top box flaps shut. Apply two layers of heavy-duty fiber packaging tape across the center seam.</span>
                </div>
              </div>
            </div>

            {/* Right Column: Proposed Version */}
            <div className="diff-column">
              <div className="diff-column-header" style={{ color: 'var(--color-success)', borderBottomColor: 'rgba(16, 185, 129, 0.15)' }}>
                Proposed Version (v2.4.1-rc1)
              </div>
              <div className="diff-content">
                <div className="diff-line">
                  <span className="diff-line-number">1</span>
                  <span className="diff-sign"> </span>
                  <span className="diff-text">Clean the packaging workstation of any debris, dust, or foreign objects.</span>
                </div>
                
                <div className="diff-line">
                  <span className="diff-line-number">2</span>
                  <span className="diff-sign"> </span>
                  <span className="diff-text">Peel the protective backing film from the four self-adhesive foam corners.</span>
                </div>
                
                <div className="diff-line empty-placeholder">
                  <span className="diff-line-number"> </span>
                  <span className="diff-sign"> </span>
                  <span className="diff-text" style={{ color: '#cbd5e1' }}> </span>
                </div>
                
                <div className="diff-line added">
                  <span className="diff-line-number">3</span>
                  <span className="diff-sign">+</span>
                  <span className="diff-text">Carefully hoist the heavy equipment core. Align the base corners with the foam channels and gently lower the unit until it seats flush.</span>
                </div>
                
                <div className="diff-line">
                  <span className="diff-line-number">4</span>
                  <span className="diff-sign"> </span>
                  <span className="diff-text">Fold the top box flaps shut. Apply two layers of heavy-duty fiber packaging tape across the center seam.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Standard View (Table or Details split view) */
        <>
          {/* Untagged Bugs Banner & Slideshow */}
          {!selectedBug && totalUntagged > 0 && activeSlideBug && (
            <div className="untagged-banner">
              <div className="banner-header">
                <AlertTriangle size={18} />
                <span>Classification Required: {totalUntagged} bug{totalUntagged > 1 ? 's lack' : ' lacks'} severity tagging in the dashboard</span>
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
                  <span className="tag-editor-label">Assign Severity Tag:</span>
                  <div className="quick-tags">
                    <button className="quick-tag-btn" onClick={() => handleAssignSeverity(activeSlideBug.id, 'low')}>Low</button>
                    <button className="quick-tag-btn" onClick={() => handleAssignSeverity(activeSlideBug.id, 'medium')}>Medium</button>
                    <button className="quick-tag-btn" onClick={() => handleAssignSeverity(activeSlideBug.id, 'high')}>High</button>
                    <button className="quick-tag-btn" onClick={() => handleAssignSeverity(activeSlideBug.id, 'critical')}>Critical</button>
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
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                  >
                    <option value="all">All Severities</option>
                    <option value="unassigned">Untagged</option>
                    <option value="critical">Critical</option>
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
                  Sorted by Severity & Date
                </div>
              </div>
            </div>
          )}

          {/* Main Content: Split View or Full-page Table View */}
          {selectedBug ? (
            <div className="split-view-container" style={{ height: 'calc(100vh - 150px)', marginTop: '0' }}>
              {/* Column 1: Expanded Middle (Instruction editing placeholder) */}
              <div className="split-middle-empty" style={{ flex: 1 }}>
                <span>Instruction editing space (TBD)</span>
              </div>

              {/* Column 2: Bug Details on Right */}
              <div className="split-right-details">
                <div className="details-header">
                  <div>
                    <span style={{ color: 'var(--brand-orange)', fontSize: '0.8rem', fontWeight: 600 }}>{selectedBug.id}</span>
                    <h2 style={{ fontSize: '1rem', color: 'var(--brand-navy)', marginTop: '0.15rem', lineHeight: '1.2' }}>{selectedBug.title}</h2>
                  </div>
                  <X className="modal-close" onClick={() => setSelectedBug(null)} style={{ cursor: 'pointer', flexShrink: 0, marginLeft: '0.5rem' }} />
                </div>

                <div className="details-scroll">
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Reported By</span>
                    <span className="modal-detail-value">{selectedBug.reportedBy}</span>
                  </div>
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Reported Date</span>
                    <span className="modal-detail-value">{selectedBug.reportedDate}</span>
                  </div>
                  <div className="modal-detail-row">
                    <span className="modal-detail-label">Severity</span>
                    <select 
                      className="select-filter" 
                      value={selectedBug.severity} 
                      style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.825rem' }}
                      onChange={(e) => handleAssignSeverity(selectedBug.id, e.target.value as BugReport['severity'])}
                    >
                      <option value="unassigned">Untagged</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
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

                  <div className="modal-steps-box">
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--brand-navy)' }}>Steps to Reproduce:</div>
                    <ol className="modal-steps-list">
                      {selectedBug.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
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
                      <th>Severity</th>
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
                          <td>{getSeverityBadge(bug.severity)}</td>
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
