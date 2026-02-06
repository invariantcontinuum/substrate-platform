/**
 * Header Component
 * Updated with data from API and proper theming
 */

import React from 'react';
import { Layers, Activity } from 'lucide-react';
import { useDriftSummary } from '@/hooks';
import { env } from '@/config/env';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  const { data: driftSummary } = useDriftSummary();

  const totalViolations = driftSummary?.totalViolations || 0;
  const criticalViolations = driftSummary?.bySeverity.Critical || 0;

  // Calculate drift percentage based on violations
  const driftPercent = totalViolations > 0 
    ? ((criticalViolations / totalViolations) * 100).toFixed(1)
    : '0.0';

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 p-4 flex items-center justify-between backdrop-blur-md z-20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
          <Layers size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-200">
            {env.VITE_APP_NAME}
          </h1>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
            Structural Integrity {env.VITE_APP_VERSION}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Active Users Indicator */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className="w-5 h-5 rounded-full bg-slate-600 border border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-200"
              >
                U{i}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-slate-400">4 Active Contributors</span>
        </div>

        {/* Drift Indicator */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full text-xs font-mono border",
          criticalViolations > 0 
            ? "text-red-400 border-red-500/20"
            : "text-emerald-400 border-emerald-500/20"
        )}>
          <Activity size={14} className={criticalViolations > 0 ? "animate-pulse" : ""} />
          LIVE DRIFT: {driftPercent}%
        </div>
      </div>
    </header>
  );
};
