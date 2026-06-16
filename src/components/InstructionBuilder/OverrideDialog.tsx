import React from 'react';
import { X } from 'lucide-react';
import type { Product } from './types';

interface Props {
  selectedProduct: Product | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const OverrideDialog: React.FC<Props> = ({ selectedProduct, onCancel, onConfirm }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
      <div className="modal-header">
        <span className="modal-title">Editing a Shared Module</span>
        <X className="modal-close" size={18} onClick={onCancel} style={{ cursor: 'pointer' }} />
      </div>
      <div className="modal-body">
        <p className="override-dialog-body">
          This step belongs to a shared module used across multiple products.
          Editing it here will create a <strong>local override</strong> for{' '}
          <strong>{selectedProduct?.name}</strong> only — the shared source will not change.
        </p>
      </div>
      <div className="modal-footer">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={onConfirm}>Create Local Override</button>
      </div>
    </div>
  </div>
);
