/**
 * Terminal Logs Page
 * Fixed to use store instead of props
 */

import React from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogs } from '@/stores';

export const TerminalLogs: React.FC = () => {
  const logs = useLogs();

  return (
    <div className="p-8 h-full">
      <div className="bg-black border border-slate-800 rounded-xl h-full font-mono text-sm p-6 overflow-auto shadow-2xl custom-scrollbar">
        <div className="flex items-center gap-2 mb-4 text-slate-500 text-xs">
          <Activity size={14} /> SUBSTRATE_RUNTIME_OUTPUT.LOG
        </div>
        {logs?.map((log, i) => (
          <div key={i} className="mb-1 flex gap-4">
            <span className="text-slate-600">[{log.time}]</span>
            <span className={cn(
              log.msg?.includes('Complete') ? 'text-emerald-400' : 'text-slate-300'
            )}>
              {log.msg}
            </span>
          </div>
        ))}
        <div className="animate-pulse inline-block w-2 h-4 bg-blue-500 ml-1 mt-2" />
      </div>
    </div>
  );
};

export default TerminalLogs;
