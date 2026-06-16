import React from 'react';
import { CircleCheck, MessageCircle, X } from 'lucide-react';

export type ActionToastVariant = 'success' | 'danger';

export interface ActionToastState {
  message: string;
  variant: ActionToastVariant;
}

interface ActionToastProps {
  toast: ActionToastState;
  onDismiss: () => void;
}

/** Bottom-right confirmation after approve, publish, or send rejection. */
export const ActionToast: React.FC<ActionToastProps> = ({ toast, onDismiss }) => {
  const Icon = toast.variant === 'success' ? CircleCheck : MessageCircle;

  return (
    <div
      className={`action-toast action-toast--${toast.variant}`}
      role="status"
      aria-live="polite"
    >
      <Icon className="action-toast-icon" size={18} aria-hidden="true" />
      <p className="action-toast-message">{toast.message}</p>
      <button
        type="button"
        className="action-toast-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};
