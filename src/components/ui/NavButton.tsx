/**
 * Navigation Button Component
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isLoading?: boolean;
}

export const NavButton: React.FC<NavButtonProps> = ({
  active,
  onClick,
  icon,
  label,
  isLoading = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        "hover:translate-x-0.5",
        active
          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
        isLoading && "opacity-70 cursor-not-allowed"
      )}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        icon
      )}
      <span>{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
      )}
    </button>
  );
};
