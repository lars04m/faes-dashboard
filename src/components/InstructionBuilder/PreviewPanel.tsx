import React from 'react';
import { Layers, AlertTriangle } from 'lucide-react';
import faesLogo from '../../assets/faes-logo.png';
import type { Step, Module, Product } from './types';

interface Props {
  selectedModule: Module | null;
  selectedProduct: Product | null;
  effectiveSteps: Step[];
  stepHasFlag: (step: Step) => boolean;
}

export const PreviewPanel: React.FC<Props> = ({ selectedModule, selectedProduct, effectiveSteps, stepHasFlag }) => (
  <div className="glass-card steps-content-panel">
    <div className="panel-header">
      <span className="panel-title">Instruction Preview</span>
    </div>
    <div className="preview-scroll">
      {!selectedModule ? (
        <div className="sheet-empty-state">
          <Layers size={32} className="sheet-empty-icon" />
          <p>Select a module to preview</p>
        </div>
      ) : (
        <>
          <div className="sheet-header">
            <div className="sheet-brand">
              <img src={faesLogo} alt="FAES" className="sheet-logo" />
              <span className="sheet-brand-name">FAES</span>
            </div>
            <div>
              <div className="sheet-title">{selectedProduct?.name} — {selectedModule.name}</div>
              <div className="sheet-meta">{selectedModule.status.toUpperCase()} · {new Date().toLocaleDateString()}</div>
            </div>
          </div>
          {effectiveSteps.map((step, idx) => (
            <div key={step.id} className="sheet-step">
              <div className="sheet-step-title-row">
                <span className="sheet-step-num">{idx + 1}</span>
                {step.action
                  ? <span className="sheet-step-title">{step.action}</span>
                  : <span className="sheet-step-title sheet-step-title-empty">No action text</span>
                }
                {stepHasFlag(step) && <AlertTriangle size={12} color="var(--brand-orange)" className="sheet-step-flag" />}
              </div>
              {step.checkType !== 'none' && (
                <div className="sheet-step-addons">
                  <span className="sheet-badge sheet-badge-tool">
                    {step.checkType === 'checkbox' ? 'Checkbox' : 'Measurement'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  </div>
);
