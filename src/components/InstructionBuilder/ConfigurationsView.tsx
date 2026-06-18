import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Layers, Plus, X } from 'lucide-react';
import type { Product, Configuration } from './types';

interface Props {
  product: Product;
  onSelectConfiguration: (id: string) => void;
  onAddConfiguration: (name: string) => void;
  onBack: () => void;
  embedded?: boolean;
}

export const ConfigurationsView: React.FC<Props> = ({
  product,
  onSelectConfiguration,
  onAddConfiguration,
  onBack,
  embedded = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const filtered = product.configurations.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    if (!newName.trim()) return;
    onAddConfiguration(newName.trim());
    setNewName('');
    setDialogOpen(false);
  };

  const handleCancel = () => {
    setNewName('');
    setDialogOpen(false);
  };

  return (
    <div className={embedded ? "ib-embedded-container" : "dashboard-container"}>
      {embedded ? (
        <div className="ib-embedded-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button className="ib-back-btn" onClick={onBack} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
              <ArrowLeft size={12} /> Products
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '0.75rem', color: 'var(--brand-navy)' }}>
              {product.name} › Configurations
            </span>
          </div>
          <div className="ib-search-wrap" style={{ margin: 0, width: '150px' }}>
            <input
              type="text"
              className="form-input ib-search-input"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', height: '30px' }}
              placeholder="Search…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="dashboard-header">
          <div>
            <button className="ib-back-btn" onClick={onBack}>
              <ArrowLeft size={14} /> All Products
            </button>
            <div className="ib-breadcrumb">
              <span className="ib-breadcrumb-link" onClick={onBack}>All Products</span>
              <span className="ib-breadcrumb-sep">›</span>
              <span className="ib-breadcrumb-current">{product.name}</span>
            </div>
            <h1 className="dashboard-title">{product.name}</h1>
            <p className="dashboard-subtitle">Configurations</p>
          </div>
          <div className="ib-search-wrap">
            <input
              type="text"
              className="form-input ib-search-input"
              placeholder="Search…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="ib-empty-state">
          <Layers size={36} />
          <p>{product.configurations.length === 0 ? 'No configurations yet' : 'No configurations found'}</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((cfg: Configuration) => {
            const modCount = cfg.moduleIds.length;
            return (
              <div key={cfg.id} className="product-card" onClick={() => onSelectConfiguration(cfg.id)}>
                <div className="product-card-image">
                  <Layers size={32} strokeWidth={1.2} />
                </div>
                <div className="product-card-body">
                  <div className="product-card-name">{cfg.name}</div>
                  <div className="product-card-desc">{cfg.description}</div>
                </div>
                <div className="product-card-footer">
                  <span className="product-card-meta">{modCount} module{modCount !== 1 ? 's' : ''}</span>
                  <ChevronRight size={15} className="product-card-arrow" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="ib-fab" onClick={() => setDialogOpen(true)} title="Add configuration">
        <Plus size={22} />
      </button>

      {dialogOpen && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title">New Configuration</span>
              <X className="modal-close" size={18} onClick={handleCancel} style={{ cursor: 'pointer' }} />
            </div>
            <div className="modal-body">
              <label className="form-label">Configuration name</label>
              <input
                className="form-input"
                autoFocus
                value={newName}
                placeholder="e.g. Missing Layer"
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirm();
                  if (e.key === 'Escape') handleCancel();
                }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
              <button className="btn-primary" onClick={handleConfirm} disabled={!newName.trim()}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
