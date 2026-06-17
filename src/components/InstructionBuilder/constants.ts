import { ArrowUpRight, Square, Circle as CircleIcon, Bold, Italic, Heading, List, ListOrdered, Link, Code } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ANNOTATION_COLORS = ['#ef7d00', '#ef4444', '#10b981', '#3b82f6', '#f59e0b'] as const;

export const ANNOTATION_TOOLS: { tool: 'arrow' | 'rect' | 'circle'; Icon: LucideIcon; label: string }[] = [
  { tool: 'arrow', Icon: ArrowUpRight, label: 'Arrows' },
  { tool: 'rect',  Icon: Square,       label: 'Rectangle' },
  { tool: 'circle', Icon: CircleIcon,  label: 'Circle' },
];

export type MarkdownAction = 'bold' | 'italic' | 'heading' | 'bullet' | 'ordered' | 'link' | 'code';

export const MARKDOWN_TOOLS: { action: MarkdownAction; Icon: LucideIcon; label: string }[] = [
  { action: 'bold', Icon: Bold, label: 'Bold' },
  { action: 'italic', Icon: Italic, label: 'Italic' },
  { action: 'code', Icon: Code, label: 'Code' },
  { action: 'heading', Icon: Heading, label: 'Heading' },
  { action: 'bullet', Icon: List, label: 'List' },
  { action: 'ordered', Icon: ListOrdered, label: 'Numbered' },
  { action: 'link', Icon: Link, label: 'Link' },
];
