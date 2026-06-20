import React, { useState } from 'react';
import { ChevronRight, Package, Plus, Image as ImageIcon, X } from 'lucide-react';
import type { Product } from './types';

interface Props {
  filteredProducts: Product[];
  searchTerm: string;
  addProductDialogOpen: boolean;
  onSearchChange: (value: string) => void;
  onSelectProduct: (id: string) => void;
  onAddProduct: () => void;
  onConfirmAddProduct: (name: string) => void;
  onCancelAddProduct: () => void;
  embedded?: boolean;
}

export const ProductsView: React.FC<Props> = ({
  filteredProducts,
  searchTerm,
  addProductDialogOpen,
  onSearchChange,
  onSelectProduct,
  onAddProduct,
  onConfirmAddProduct,
  onCancelAddProduct,
  embedded = false,
}) => {
  const [newProductName, setNewProductName] = useState('');

  const handleConfirm = () => {
    onConfirmAddProduct(newProductName);
    setNewProductName('');
  };

  const handleCancel = () => {
    setNewProductName('');
    onCancelAddProduct();
  };

  return (
    <div className={embedded ? "ib-embedded-container" : "dashboard-container"}>
      {embedded ? (
        <div className="ib-embedded-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-navy)' }}>Select Product to Edit Instructions</span>
          <div className="ib-search-wrap" style={{ margin: 0, width: '180px' }}>
            <input
              type="text"
              className="form-input ib-search-input"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', height: '30px' }}
              placeholder="Search…"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Instruction Builder</h1>
            <p className="dashboard-subtitle">All Products</p>
          </div>
          <div className="ib-search-wrap">
            <input
              type="text"
              className="form-input ib-search-input"
              placeholder="Search…"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="ib-empty-state">
          <Package size={36} />
          <p>No products found</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => {
            const configCount = product.configurations.length;
            return (
              <div key={product.id} className="product-card" onClick={() => onSelectProduct(product.id)}>
                <div className="product-card-image">
                  <ImageIcon size={32} strokeWidth={1.2} />
                </div>
                <div className="product-card-body">
                  <div className="product-card-name">{product.name}</div>
                  <div className="product-card-desc">{product.description}</div>
                </div>
                <div className="product-card-footer">
                  <span className="product-card-meta">{configCount} configuration{configCount !== 1 ? 's' : ''}</span>
                  <ChevronRight size={15} className="product-card-arrow" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!embedded && (
        <button className="ib-fab" onClick={onAddProduct} title="Add product">
          <Plus size={22} />
        </button>
      )}

      {addProductDialogOpen && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <span className="modal-title">New Product</span>
              <X className="modal-close" size={18} onClick={handleCancel} style={{ cursor: 'pointer' }} />
            </div>
            <div className="modal-body">
              <label className="form-label">Product name</label>
              <input
                className="form-input"
                autoFocus
                value={newProductName}
                placeholder="e.g. AXK Color Multi"
                onChange={e => setNewProductName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirm();
                  if (e.key === 'Escape') handleCancel();
                }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
              <button className="btn-primary" onClick={handleConfirm} disabled={!newProductName.trim()}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
