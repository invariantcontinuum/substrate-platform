/**
 * Lens Button Component
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LensButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
  className?: string;
}

export const LensButton: React.FC<LensButtonProps> = ({ label, active, onClick, color, className }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all",
      active
        ? `bg-slate-800 border-b-2 shadow-inner ${color}`
        : 'text-slate-500 hover:text-slate-300',
      className
    )}
  >
    {label}
  </button>
);
