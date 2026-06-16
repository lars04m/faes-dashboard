export type StepType = 'text' | 'visual' | 'video' | 'markdown';

export interface CheckItem {
  id: string;
  type: 'checkbox' | 'measurement' | 'text' | 'qa';
  label: string;
  options?: string[];
}

export interface Annotation {
  id: string;
  type: 'rect' | 'circle' | 'arrow';
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export interface StepImage {
  id: string;
  url: string;
  caption: string;
  annotations: Annotation[];
}

export interface Step {
  id: string;
  name?: string;
  stepType: StepType;
  action: string;
  imageUrl: string | null;
  caption: string;
  checkType: 'none' | 'checkbox' | 'measurement';
  checks?: CheckItem[];
  annotations?: Annotation[];
  images?: StepImage[];
  isLocalOverride?: boolean;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'live';
  isShared: boolean;
  steps: Step[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  moduleIds: string[];
}

// overrides[productId][moduleId][stepId] = Partial<Step>
export type OverrideMap = Record<string, Record<string, Record<string, Partial<Step>>>>;

export type View = 'products' | 'product-detail' | 'step-editor';
