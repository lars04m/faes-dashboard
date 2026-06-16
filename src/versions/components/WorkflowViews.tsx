/**
 * Review, Publish, Rejection workflow screens and their shared building blocks.
 * Layout: scrollable preview (left) + fixed sidebar (right).
 */
import React, { useMemo, useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import stepVisualImage from '../../assets/image-1.png';
import type {
  OperatorOnShift,
  PreviewStep,
  PublishConfirmDetails,
  RejectionFeedback,
  RejectionSubmission,
  VersionEntry,
  VersionHistory,
} from '../types';
import {
  getPublishConfirmDetails,
  getPublishData,
  getReadOnlyVersionDetails,
  getRejectionData,
  getReviewData,
} from '../helpers';
import { REJECTION_REASON_OPTIONS } from '../constants';

export interface PreviewStepCardProps {
  step: PreviewStep;
}

/** One step in the left-hand preview (normal, added, removed, or visual). */
export const PreviewStepCard: React.FC<PreviewStepCardProps> = ({ step }) => {
  if (step.type === 'visual') {
    return (
      <article className="review-step-card review-step-visual">
        <div className="review-step-header">
          <h3 className="review-step-title">{step.title}</h3>
          {step.badge && <span className="review-step-badge">{step.badge}</span>}
        </div>
        <p className="review-step-content">{step.content}</p>
        <img
          className="review-visual-image"
          src={stepVisualImage}
          alt="Assembly diagram showing 4x E020425 cylinder placement"
        />
      </article>
    );
  }

  return (
    <article className={`review-step-card review-step-${step.type}`}>
      <h3 className="review-step-title">{step.title}</h3>
      <p className="review-step-content">{step.content}</p>
    </article>
  );
};

export interface VersionDetailsCardProps {
  author: string;
  version: string;
  date: string;
  comment: string;
  commentEditable?: boolean;
  commentPlaceholder?: string;
  onCommentChange?: (value: string) => void;
}

/** Author, version, date, and comment shown in the right sidebar. */
export const VersionDetailsCard: React.FC<VersionDetailsCardProps> = ({
  author,
  version,
  date,
  comment,
  commentEditable = false,
  commentPlaceholder = 'Add review notes…',
  onCommentChange,
}) => (
  <section className="review-details-card glass-card">
    <header className="review-section-header">
      <span>VERSION DETAILS</span>
    </header>

    <dl className="review-meta-grid">
      <div className="review-meta-item">
        <dt>AUTHOR</dt>
        <dd>{author}</dd>
      </div>
      <div className="review-meta-item">
        <dt>VERSION</dt>
        <dd>{version}</dd>
      </div>
      <div className="review-meta-item">
        <dt>DATE</dt>
        <dd>{date}</dd>
      </div>
    </dl>

    <textarea
      className={`review-comment${commentEditable ? ' review-comment--editable' : ''}`}
      readOnly={!commentEditable}
      value={comment}
      placeholder={commentEditable ? commentPlaceholder : undefined}
      onChange={
        commentEditable && onCommentChange
          ? (event) => onCommentChange(event.target.value)
          : undefined
      }
      aria-label={commentEditable ? 'Review notes' : 'Review notes from approval'}
    />
  </section>
);

export interface PreviewPanelProps {
  previewSteps: PreviewStep[];
}

/** Scrollable left column showing step-by-step instruction changes. */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({ previewSteps }) => (
  <section className="review-preview glass-card">
    <header className="review-section-header">
      <span>PREVIEW</span>
      <div className="review-legend">
        <span className="review-legend-item">
          <span className="review-legend-dot review-legend-dot--removed" />
          REMOVED
        </span>
        <span className="review-legend-item">
          <span className="review-legend-dot review-legend-dot--added" />
          ADDED
        </span>
      </div>
    </header>

    <div className="review-steps">
      {previewSteps.map((step, index) => (
        <PreviewStepCard key={`${step.title}-${index}`} step={step} />
      ))}
    </div>
  </section>
);

export interface WorkflowActionBarProps {
  children: React.ReactNode;
}

/** Full-width Reject / Approve (or Publish) buttons aligned to the right sidebar. */
export const WorkflowActionBar: React.FC<WorkflowActionBarProps> = ({ children }) => (
  <div className="workflow-sidebar-actions">{children}</div>
);

export interface OperatorImpactSectionProps {
  operators: OperatorOnShift[];
}

/** Publish screen sidebar: notify toggle and list of operators on shift. */
export const OperatorImpactSection: React.FC<OperatorImpactSectionProps> = ({ operators }) => {
  const [notifyOperators, setNotifyOperators] = useState(true);
  const operatorCount = operators.length;

  return (
    <section className="publish-operator-card glass-card">
      <header className="review-section-header">
        <span>OPERATOR IMPACT - {operatorCount} ON SHIFT</span>
      </header>

      <div className="publish-notify-panel">
        <div className="publish-notify-copy">
          <p className="publish-notify-title">Notify operators on publish</p>
          <p className="publish-notify-subtitle">
            Send an update to all operators on shift
          </p>
        </div>
        <button
          type="button"
          className={`publish-toggle${notifyOperators ? ' active' : ''}`}
          role="switch"
          aria-checked={notifyOperators}
          aria-label="Notify operators on publish"
          onClick={() => setNotifyOperators((prev) => !prev)}
        >
          <span className="publish-toggle-thumb" />
        </button>
      </div>

      <ul className="publish-operator-list">
        {operators.map((operator) => (
          <li key={operator.id} className="publish-operator-item">
            <div className="publish-operator-profile">
              <span className="publish-operator-avatar">{operator.initials}</span>
              <div>
                <p className="publish-operator-name">{operator.name}</p>
                <p className="publish-operator-assignment">{operator.assignment}</p>
              </div>
            </div>
            {notifyOperators && (
              <span className="publish-operator-badge">Will be notified</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export interface RejectionFeedbackSectionProps {
  feedback: RejectionFeedback;
}

/** Rejection screen sidebar: reviewer info, reason tags, and feedback text. */
export const RejectionFeedbackSection: React.FC<RejectionFeedbackSectionProps> = ({
  feedback,
}) => (
  <section className="rejection-feedback-card glass-card">
    <header className="review-section-header">
      <span>REJECTION FEEDBACK</span>
    </header>

    <div className="rejection-reviewer">
      <span className="rejection-reviewer-avatar">{feedback.reviewerInitials}</span>
      <div>
        <p className="rejection-reviewer-name">{feedback.reviewerName}</p>
        <p className="rejection-reviewer-meta">
          {feedback.date} &bull; {feedback.role}
        </p>
      </div>
    </div>

    <div className="rejection-tags">
      {feedback.tags.map((tag) => (
        <span key={tag} className="rejection-tag">
          {tag}
        </span>
      ))}
    </div>

    <textarea
      className="rejection-feedback-text"
      readOnly
      value={feedback.feedback}
      aria-label="Rejection feedback"
    />
  </section>
);

// --- Modals (reject confirmation, publish confirmation) ---

export interface RejectModalProps {
  version: string;
  authorName: string;
  onClose: () => void;
  onSubmit: (submission: RejectionSubmission) => void;
}

/** Collect rejection reasons before opening the Rejection screen. */
export const RejectModal: React.FC<RejectModalProps> = ({
  version,
  authorName,
  onClose,
  onSubmit,
}) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [notifyAuthor, setNotifyAuthor] = useState(true);

  const authorFirstName = authorName.split(' ')[0] ?? authorName;

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((item) => item !== reason)
        : [...prev, reason],
    );
  };

  const isSubmitEnabled =
    selectedReasons.length > 0 && additionalDetails.trim().length > 0;

  const handleSubmit = () => {
    if (!isSubmitEnabled) return;

    onSubmit({
      reasons: selectedReasons,
      additionalDetails: additionalDetails.trim(),
      notifyAuthor,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content reject-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
      >
        <header className="modal-header">
          <h2 id="reject-modal-title" className="modal-title">
            Reject {version}?
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="modal-body reject-modal-body">
          <p className="reject-modal-subtitle">
            The author will be notified and your feedback will be attached to this version
          </p>

          <div className="reject-modal-field">
            <label className="reject-modal-label">Reason</label>
            <div className="reject-reason-chips">
              {REJECTION_REASON_OPTIONS.map((reason) => {
                const isSelected = selectedReasons.includes(reason);

                return (
                  <button
                    key={reason}
                    type="button"
                    className={`reject-reason-chip${isSelected ? ' selected' : ''}`}
                    onClick={() => toggleReason(reason)}
                    aria-pressed={isSelected}
                  >
                    {reason}
                    {isSelected && <X size={12} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="reject-modal-field">
            <label className="reject-modal-label" htmlFor="reject-additional-details">
              Additional details
            </label>
            <textarea
              id="reject-additional-details"
              className="reject-modal-textarea"
              placeholder="I added visuals for step 4 and replaced the text with more active wording."
              value={additionalDetails}
              onChange={(event) => setAdditionalDetails(event.target.value)}
            />
          </div>

          <div className="reject-notify-panel">
            <div className="reject-notify-copy">
              <p className="reject-notify-title">Notify {authorFirstName} directly</p>
              <p className="reject-notify-subtitle">Send rejection feedback to author</p>
            </div>
            <button
              type="button"
              className={`publish-toggle${notifyAuthor ? ' active' : ''}`}
              role="switch"
              aria-checked={notifyAuthor}
              aria-label={`Notify ${authorFirstName} directly`}
              onClick={() => setNotifyAuthor((prev) => !prev)}
            >
              <span className="publish-toggle-thumb" />
            </button>
          </div>
        </div>

        <footer className="modal-footer reject-modal-footer">
          <button type="button" className="reject-modal-btn reject-modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="reject-modal-btn reject-modal-btn-submit"
            disabled={!isSubmitEnabled}
            onClick={handleSubmit}
          >
            Send rejection
          </button>
        </footer>
      </div>
    </div>
  );
};

export interface PublishConfirmModalProps {
  details: PublishConfirmDetails;
  onClose: () => void;
  onConfirm: () => void;
}

/** Final confirmation before a version goes live. */
export const PublishConfirmModal: React.FC<PublishConfirmModalProps> = ({
  details,
  onClose,
  onConfirm,
}) => {
  const [notifyOperators, setNotifyOperators] = useState(true);
  const operatorCount = details.affectedOperators.length;
  const operatorLabel = operatorCount === 1 ? 'operator effected' : 'operators effected';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content publish-confirm-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-confirm-title"
      >
        <header className="modal-header">
          <h2 id="publish-confirm-title" className="modal-title">
            Publish {details.publishingVersion}?
          </h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="modal-body publish-confirm-body">
          <p className="publish-confirm-subtitle">
            This will immediately replace {details.replacingVersion} and make{' '}
            {details.publishingVersion} the live instruction!
          </p>

          <dl className="publish-confirm-rows">
            <div className="publish-confirm-row">
              <dt>Publishing</dt>
              <dd>
                {details.publishingVersion} &bull; {details.publisherName}
              </dd>
            </div>
            <div className="publish-confirm-row">
              <dt>Replacing</dt>
              <dd>
                <span className="publish-confirm-live-tag">
                  {details.replacingVersion} (live)
                </span>
              </dd>
            </div>
            <div className="publish-confirm-row">
              <dt>Approved by</dt>
              <dd>
                {details.approvedBy} &bull; {details.approvedDate}
              </dd>
            </div>
          </dl>

          <div className="publish-confirm-operators-section">
            <p className="publish-confirm-operators-label">
              {operatorCount} {operatorLabel}
            </p>
            <div className="publish-confirm-operator-tags">
              {details.affectedOperators.map((name) => (
                <span key={name} className="publish-confirm-operator-tag">
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div className="publish-confirm-notify-bar">
            <span className="publish-confirm-notify-text">Notify operators on publish</span>
            <button
              type="button"
              className={`publish-confirm-toggle${notifyOperators ? ' active' : ''}`}
              role="switch"
              aria-checked={notifyOperators}
              aria-label="Notify operators on publish"
              onClick={() => setNotifyOperators((prev) => !prev)}
            >
              <span className="publish-confirm-toggle-thumb" />
            </button>
          </div>
        </div>

        <footer className="modal-footer publish-confirm-footer">
          <button
            type="button"
            className="publish-confirm-btn publish-confirm-btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="publish-confirm-btn publish-confirm-btn-submit"
            onClick={onConfirm}
          >
            Publish {details.publishingVersion}
          </button>
        </footer>
      </div>
    </div>
  );
};

// --- Workflow screens (Review, Publish, Rejection) ---

export interface ReviewViewProps {
  entry: VersionEntry;
  onBack: () => void;
  onOpenRejectModal: () => void;
  onApprove: (reviewComment: string) => void;
}

/** Review a draft: checklist and review notes must be complete before Approve. */
export const ReviewView: React.FC<ReviewViewProps> = ({
  entry,
  onBack,
  onOpenRejectModal,
  onApprove,
}) => {
  const reviewData = getReviewData(entry);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [reviewComment, setReviewComment] = useState('');

  const toggleChecklistItem = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const isChecklistComplete = useMemo(
    () => reviewData.checklist.every((_, index) => checkedItems[index] === true),
    [reviewData.checklist, checkedItems],
  );

  const isApproveEnabled = isChecklistComplete && reviewComment.trim().length > 0;

  return (
    <div className="review-page">
      <header className="review-header">
        <div className="review-header-left">
          <button type="button" className="version-back-btn" onClick={onBack}>
            <ChevronLeft size={16} aria-hidden="true" />
            Version History
          </button>
          <p className="version-history-breadcrumb">
            /{reviewData.version} - Review
          </p>
        </div>
        <span className="instruction-badge version-badge-progress">In progress</span>
      </header>

      <div className="review-layout">
        <PreviewPanel previewSteps={reviewData.previewSteps} />

        <aside className="review-sidebar">
          <div className="review-sidebar-content">
            <VersionDetailsCard
              author={reviewData.author}
              version={reviewData.version}
              date={reviewData.date}
              comment={reviewComment}
              commentEditable
              onCommentChange={setReviewComment}
            />

            <section className="review-checklist-card glass-card">
              <header className="review-section-header">
                <span>CHECKLIST</span>
              </header>

              <ul className="review-checklist">
                {reviewData.checklist.map((item, index) => (
                  <li key={item}>
                    <label className="review-checklist-item">
                      <input
                        type="checkbox"
                        checked={checkedItems[index] ?? false}
                        onChange={() => toggleChecklistItem(index)}
                      />
                      <span className="review-checkbox" aria-hidden="true" />
                      {item}
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <WorkflowActionBar>
            <button
              type="button"
              className="review-btn review-btn-reject"
              onClick={onOpenRejectModal}
            >
              Reject
            </button>
            <button
              type="button"
              className="review-btn review-btn-approve"
              disabled={!isApproveEnabled}
              onClick={() => onApprove(reviewComment.trim())}
            >
              Approve {reviewData.version}
            </button>
          </WorkflowActionBar>
        </aside>
      </div>
    </div>
  );
};

export interface PublishViewProps {
  entry: VersionEntry;
  reviewComment?: string;
  versionHistoryByInstruction: Record<string, VersionHistory>;
  onBack: () => void;
  onOpenRejectModal: () => void;
  onPublishConfirm: () => void;
}

/** Publish an approved version; opens a confirm modal before going live. */
export const PublishView: React.FC<PublishViewProps> = ({
  entry,
  reviewComment,
  versionHistoryByInstruction,
  onBack,
  onOpenRejectModal,
  onPublishConfirm,
}) => {
  const publishData = getPublishData(entry, reviewComment);
  const publishConfirmDetails = getPublishConfirmDetails(
    entry,
    publishData,
    versionHistoryByInstruction,
  );
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const handlePublishConfirm = () => {
    setIsPublishModalOpen(false);
    onPublishConfirm();
  };

  return (
    <div className="review-page">
      <header className="review-header">
        <div className="review-header-left">
          <button type="button" className="version-back-btn" onClick={onBack}>
            <ChevronLeft size={16} aria-hidden="true" />
            Version History
          </button>
          <p className="version-history-breadcrumb">
            /{publishData.version} - Publish
          </p>
        </div>
        <span className="instruction-badge version-badge-approved">Approved</span>
      </header>

      <div className="review-layout">
        <PreviewPanel previewSteps={publishData.previewSteps} />

        <aside className="review-sidebar">
          <div className="review-sidebar-content">
            <VersionDetailsCard
              author={publishData.author}
              version={publishData.version}
              date={publishData.date}
              comment={publishData.comment}
            />

            <OperatorImpactSection operators={publishData.operatorsOnShift} />
          </div>

          <WorkflowActionBar>
            <button
              type="button"
              className="review-btn review-btn-reject"
              onClick={onOpenRejectModal}
            >
              Reject
            </button>
            <button
              type="button"
              className="review-btn review-btn-approve"
              onClick={() => setIsPublishModalOpen(true)}
            >
              Publish {publishData.version}
            </button>
          </WorkflowActionBar>
        </aside>
      </div>

      {isPublishModalOpen && (
        <PublishConfirmModal
          details={publishConfirmDetails}
          onClose={() => setIsPublishModalOpen(false)}
          onConfirm={handlePublishConfirm}
        />
      )}
    </div>
  );
};

export interface RejectionViewProps {
  entry: VersionEntry;
  submission: RejectionSubmission;
  onBack: () => void;
  onViewHistory: () => void;
  onGoToBuilder: () => void;
}

/** Shown after sending a rejection; displays feedback from the reject modal. */
export const RejectionView: React.FC<RejectionViewProps> = ({
  entry,
  submission,
  onBack,
  onViewHistory,
  onGoToBuilder,
}) => {
  const rejectionData = getRejectionData(entry);
  const rejectionFeedback: RejectionFeedback = {
    ...rejectionData.rejectionFeedback,
    tags: submission.reasons,
    feedback: submission.additionalDetails,
  };

  return (
    <div className="review-page">
      <header className="review-header">
        <div className="review-header-left">
          <button type="button" className="version-back-btn" onClick={onBack}>
            <ChevronLeft size={16} aria-hidden="true" />
            Version History
          </button>
          <p className="version-history-breadcrumb">
            /{rejectionData.version} - Rejection
          </p>
        </div>
        <span className="instruction-badge rejection-status-badge">Rejected</span>
      </header>

      <div className="review-layout">
        <PreviewPanel previewSteps={rejectionData.previewSteps} />

        <aside className="review-sidebar">
          <div className="review-sidebar-content">
            <VersionDetailsCard
              author={rejectionData.author}
              version={rejectionData.version}
              date={rejectionData.date}
              comment={rejectionData.comment}
            />

            <RejectionFeedbackSection feedback={rejectionFeedback} />
          </div>

          <WorkflowActionBar>
            <button
              type="button"
              className="rejection-btn rejection-btn-secondary"
              onClick={onViewHistory}
            >
              View history
            </button>
            <button
              type="button"
              className="rejection-btn rejection-btn-primary"
              onClick={onGoToBuilder}
            >
              Go to builder
            </button>
          </WorkflowActionBar>
        </aside>
      </div>
    </div>
  );
};

export type ReadOnlyViewMode = 'live' | 'archived';

export interface ReadOnlyVersionViewProps {
  entry: VersionEntry;
  viewMode: ReadOnlyViewMode;
  onBack: () => void;
}

/** Read-only preview for live or archived versions (no workflow actions). */
export const ReadOnlyVersionView: React.FC<ReadOnlyVersionViewProps> = ({
  entry,
  viewMode,
  onBack,
}) => {
  const details = getReadOnlyVersionDetails(entry);
  const isLive = viewMode === 'live';

  return (
    <div className="review-page">
      <header className="review-header">
        <div className="review-header-left">
          <button type="button" className="version-back-btn" onClick={onBack}>
            <ChevronLeft size={16} aria-hidden="true" />
            Version History
          </button>
          <p className="version-history-breadcrumb">
            /{entry.version} - {isLive ? 'Live' : 'Archived'}
          </p>
        </div>
        <span
          className={`instruction-badge ${
            isLive ? 'instruction-badge-live' : 'version-badge-archived'
          }`}
        >
          {isLive ? 'Live' : 'Archived'}
        </span>
      </header>

      <div className="review-layout">
        <PreviewPanel previewSteps={details.previewSteps} />

        <aside className="review-sidebar">
          <div className="review-sidebar-content">
            <VersionDetailsCard
              author={details.author}
              version={details.version}
              date={details.date}
              comment={details.comment}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};
