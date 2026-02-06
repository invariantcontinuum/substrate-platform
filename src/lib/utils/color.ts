/**
 * Color Utilities
 */

import { LensType } from '@/types';

/**
 * Get color for lens type
 */
export function getLensColor(lens: LensType): string {
  switch (lens) {
    case 'reality':
      return '#3b82f6'; // blue-500
    case 'intent':
      return '#a855f7'; // purple-500
    case 'drift':
      return '#ef4444'; // red-500
    default:
      return '#64748b'; // slate-500
  }
}

/**
 * Get Tailwind class for lens type
 */
export function getLensColorClass(lens: LensType): string {
  switch (lens) {
    case 'reality':
      return 'text-blue-500 bg-blue-500';
    case 'intent':
      return 'text-purple-500 bg-purple-500';
    case 'drift':
      return 'text-red-500 bg-red-500';
    default:
      return 'text-slate-500 bg-slate-500';
  }
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'Critical':
      return '#ef4444';
    case 'High':
      return '#f97316';
    case 'Medium':
      return '#eab308';
    case 'Low':
      return '#3b82f6';
    default:
      return '#64748b';
  }
}

/**
 * Hex to RGB conversion
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1] || '0', 16),
      g: parseInt(result[2] || '0', 16),
      b: parseInt(result[3] || '0', 16),
    }
    : null;
}

/**
 * Generate color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}
