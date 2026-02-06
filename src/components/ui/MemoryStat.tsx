/**
 * Memory Stat Component
 */

import React from 'react';

interface MemoryStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export const MemoryStat: React.FC<MemoryStatProps> = ({ icon, label, value }) => (
  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
    <div className="p-2 bg-slate-950 rounded-lg">{icon}</div>
    <div>
      <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
      <p className="text-sm font-bold text-slate-200">{value}</p>
    </div>
  </div>
);
