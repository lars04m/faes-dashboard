import { ArrowUpRight, Square, Circle as CircleIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ANNOTATION_COLORS = ['#ef7d00', '#ef4444', '#10b981', '#3b82f6', '#f59e0b'] as const;

export const ANNOTATION_TOOLS: { tool: 'arrow' | 'rect' | 'circle'; Icon: LucideIcon; label: string }[] = [
  { tool: 'arrow', Icon: ArrowUpRight, label: 'Arrows' },
  { tool: 'rect',  Icon: Square,       label: 'Rectangle' },
  { tool: 'circle', Icon: CircleIcon,  label: 'Circle' },
];
