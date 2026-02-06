/**
 * Hook-specific types
 */

import type { DriftViolation } from '@/types';

export interface DriftAnalysis {
  hasViolation: boolean;
  violation?: DriftViolation;
  between?: string[];
  policy?: string;
  description?: string;
}
