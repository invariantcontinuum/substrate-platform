/**
 * Footer Component
 */

import React from 'react';
import { useHealthStatus } from '@/hooks';
import { cn } from '@/lib/utils';

export const Footer: React.FC = () => {
  const { data: health } = useHealthStatus();

  const status = health?.status || 'unknown';
  const version = health?.version || 'unknown';

  const statusColors = {
    healthy: 'text-emerald-400',
    degraded: 'text-amber-400',
    unhealthy: 'text-red-400',
    unknown: 'text-slate-500',
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 px-4 py-2 flex items-center justify-between text-xs">
      <div className="flex items-center gap-4">
        <span className="text-slate-500">
          v{version}
        </span>
        <span className={cn("flex items-center gap-1.5", statusColors[status as keyof typeof statusColors])}>
          <span className="relative flex h-2 w-2">
            <span className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'
            )} />
            <span className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
            )} />
          </span>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <div className="flex items-center gap-4 text-slate-500">
        <span>Neo4j Connected</span>
        <span>Qdrant Ready</span>
        <span>OPA Active</span>
      </div>
    </footer>
  );
};

export default Footer;
