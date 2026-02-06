/**
 * Audit Bubble Component
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface AuditBubbleProps {
  title: string;
  desc: string;
  highlight?: boolean;
  onClick?: () => void;
}

export const AuditBubble: React.FC<AuditBubbleProps> = ({ title, desc, highlight, onClick }) => (
  <button 
    onClick={onClick} 
    className={cn(
      "flex-shrink-0 w-48 p-3 rounded-xl border text-left transition-all hover:scale-[1.02]",
      highlight ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-800/50 border-slate-700'
    )}
  >
    <h5 className={cn("text-[10px] font-bold uppercase mb-1", highlight ? 'text-amber-400' : 'text-slate-400')}>{title}</h5>
    <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">{desc}</p>
  </button>
);
