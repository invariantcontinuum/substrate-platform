/**
 * GraphNode Component
 * Standalone node display component matching qualityawareui.txt design
 * For use in sidebars, legends, detail panels, and tooltips
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export type NodeColor = 'blue' | 'purple' | 'red' | 'emerald' | 'amber' | 'slate';

export interface GraphNodeProps {
  icon: React.ReactNode;
  label: string;
  color: NodeColor;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  isDegraded?: boolean;
  onClick?: () => void;
  className?: string;
}

// ============================================================================
// Color Map (matching qualityawareui.txt)
// ============================================================================

const colorMap: Record<NodeColor, string> = {
  blue: 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  purple: 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
  red: 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
  emerald: 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.15)]',
  amber: 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  slate: 'border-slate-700 bg-slate-800 text-slate-500',
};

const activeColorMap: Record<NodeColor, string> = {
  blue: 'border-blue-400 bg-blue-500/20 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.3)]',
  purple: 'border-purple-400 bg-purple-500/20 text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.3)]',
  red: 'border-red-400 bg-red-500/20 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.3)]',
  emerald: 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_30px_rgba(34,197,94,0.3)]',
  amber: 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.3)]',
  slate: 'border-slate-600 bg-slate-700 text-slate-400',
};

const sizeMap = {
  sm: {
    container: 'p-2 rounded-xl min-w-[70px]',
    icon: 'w-5 h-5',
    label: 'text-[8px]',
  },
  md: {
    container: 'p-4 rounded-2xl min-w-[100px]',
    icon: 'w-6 h-6',
    label: 'text-[10px]',
  },
  lg: {
    container: 'p-6 rounded-3xl min-w-[140px]',
    icon: 'w-8 h-8',
    label: 'text-xs',
  },
};

// ============================================================================
// Main Component
// ============================================================================

export const GraphNode: React.FC<GraphNodeProps> = ({
  icon,
  label,
  color,
  size = 'md',
  isActive = false,
  isDegraded = false,
  onClick,
  className,
}) => {
  const sizeStyles = sizeMap[size];
  const colorStyles = isActive ? activeColorMap[color] : colorMap[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        // Base styles from qualityawareui.txt
        'border-2 flex flex-col items-center gap-2 transition-all duration-700 cursor-default select-none',
        sizeStyles.container,
        colorStyles,
        // Interactive states
        onClick && 'cursor-pointer hover:scale-105',
        // Degraded state
        isDegraded && 'opacity-50 grayscale-[0.5] border-slate-700 bg-slate-800 text-slate-600',
        className
      )}
    >
      <div className={cn('flex items-center justify-center', sizeStyles.icon)}>
        {icon}
      </div>
      <span className={cn('font-mono font-bold tracking-tight text-center leading-tight', sizeStyles.label)}>
        {label}
      </span>
    </div>
  );
};

// ============================================================================
// Node Preview (for legends and lists)
// ============================================================================

export interface NodePreviewProps {
  icon: React.ReactNode;
  label: string;
  color: NodeColor;
  subtitle?: string;
  isActive?: boolean;
  isDegraded?: boolean;
  onClick?: () => void;
  className?: string;
}

export const NodePreview: React.FC<NodePreviewProps> = ({
  icon,
  label,
  color,
  subtitle,
  isActive = false,
  isDegraded = false,
  onClick,
  className,
}) => {
  const colorStyles = isActive ? activeColorMap[color] : colorMap[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-500',
        colorStyles,
        onClick && 'cursor-pointer hover:scale-[1.02]',
        isDegraded && 'opacity-50 grayscale-[0.5]',
        className
      )}
    >
      <div className="w-10 h-10 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-mono font-bold tracking-tight uppercase">
          {label}
        </span>
        {subtitle && (
          <span className="text-[9px] text-slate-500 font-mono">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Node Legend Item (for graph legend)
// ============================================================================

export interface NodeLegendItemProps {
  color: NodeColor;
  label: string;
  dashed?: boolean;
}

export const NodeLegendItem: React.FC<NodeLegendItemProps> = ({
  color,
  label,
  dashed = false,
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    slate: 'bg-slate-600',
  };

  return (
    <div className="flex items-center gap-3">
      <div 
        className={cn(
          'w-6 h-[2px]',
          colorClasses[color],
          dashed && 'border-t-2 border-dashed bg-transparent'
        )} 
      />
      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};

export default GraphNode;
