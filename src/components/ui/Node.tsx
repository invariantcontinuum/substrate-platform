import React from 'react';
import { cn } from '@/lib/utils';

// Static color map derived from lens configuration
// This avoids the dependency on @/data/* and keeps styling self-contained
const COLOR_MAP: Record<string, string> = {
  blue: 'border-blue-500/80 bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3),inset_0_0_20px_rgba(59,130,246,0.1)]',
  purple: 'border-purple-500/80 bg-purple-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3),inset_0_0_20px_rgba(168,85,247,0.1)]',
  red: 'border-red-500/80 bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3),inset_0_0_20px_rgba(239,68,68,0.1)]',
  slate: 'border-slate-600/80 bg-slate-700/40 text-slate-400 opacity-50 shadow-[0_0_15px_rgba(100,116,139,0.2)]',
};

interface NodeProps {
  icon: React.ReactNode;
  label: string;
  color: 'blue' | 'purple' | 'red' | 'slate';
  className?: string;
  style?: React.CSSProperties;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export const Node: React.FC<NodeProps> = ({ icon, label, color, className, style, onMouseDown }) => {
  return (
    <div
      style={style}
      onMouseDown={onMouseDown}
      className={cn(
        "w-[80px] h-[80px] rounded-full border-2 flex flex-col items-center justify-center gap-1 transition-all duration-500 cursor-move",
        COLOR_MAP[color] || COLOR_MAP.slate,
        className
      )}>
      <div className="relative drop-shadow-[0_0_8px_currentColor]">
        {icon}
      </div>
      <span className="text-[9px] font-mono font-bold select-none text-center">{label}</span>
    </div>
  );
};
