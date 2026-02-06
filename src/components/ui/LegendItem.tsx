import React from 'react';
import { cn } from '@/lib/utils';

interface LegendItemProps {
    color: string;
    label: string;
    dashed?: boolean;
    className?: string;
}

export const LegendItem: React.FC<LegendItemProps> = ({ color, label, dashed, className }) => (
    <div className={cn("flex items-center gap-3", className)}>
        <div className={cn(
            "w-8 h-[2px]",
            color,
            dashed ? 'border-t-2 border-dashed bg-transparent' : ''
        )} />
        <span className="text-[10px] text-slate-400 font-medium">{label}</span>
    </div>
);
