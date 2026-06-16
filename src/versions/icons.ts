import type { ElementType } from 'react';
import {
  Bell,
  CheckCircle2,
  MessageCircle,
  Pencil,
} from 'lucide-react';
import type { InstructionStatus, VersionHistoryStatus } from './types';

export const LIST_SECTION_ICONS: Record<InstructionStatus, ElementType> = {
  live: Bell,
  review: MessageCircle,
  draft: Pencil,
};

export const HISTORY_SECTION_ICONS: Record<VersionHistoryStatus, ElementType> = {
  live: Bell,
  'ready-to-publish': CheckCircle2,
  draft: Pencil,
  rejected: MessageCircle,
};
