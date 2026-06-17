export type StepType = 'text' | 'visual' | 'video' | 'markdown';

export interface CheckItem {
  id: string;
  type: 'checkbox' | 'measurement' | 'text' | 'qa';
  title?: string;
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
}

export interface Module {
  id: string;
  name: string;
  description: string;
  isShared: boolean;
  steps: Step[];
}

export interface Configuration {
  id: string;
  name: string;
  description: string;
  moduleIds: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  moduleIds: string[];
  configurations: Configuration[];
}

export type View = 'products' | 'configurations' | 'product-detail' | 'step-editor';
