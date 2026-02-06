/**
 * Header Component
 * Multi-tenant aware header with context selector and drift indicators
 */

import React from 'react';
import { Layers, Activity, AlertTriangle, Bell, ArrowLeft } from 'lucide-react';
import { useDriftSummary } from '@/hooks';
import { useCurrentProject, useProjectStore } from '@/stores';
import { env } from '@/config/env';
import { cn } from '@/lib/utils';
import { ContextSelector } from './ContextSelector';

interface HeaderProps {
  onBackToProjects?: () => void;
  showBackButton?: boolean;
  onNavigateToProjects?: () => void;
  onNavigateToAccount?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onBackToProjects, 
  showBackButton = false,
  onNavigateToProjects,
  onNavigateToAccount,
  onLogout,
}) => {
  const { data: driftSummary } = useDriftSummary();
  const currentProject = useCurrentProject();

  const totalViolations = driftSummary?.totalViolations || 0;
  const criticalViolations = driftSummary?.bySeverity.Critical || 0;

  // Calculate drift percentage based on violations
  const driftPercent = totalViolations > 0 
    ? ((criticalViolations / totalViolations) * 100).toFixed(1)
    : '0.0';

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 px-4 py-3 flex items-center justify-between backdrop-blur-md z-20">
      {/* Left: Logo, Back Button and Context Selector */}
      <div className="flex items-center gap-4">
        {showBackButton && onBackToProjects && (
          <button
            onClick={onBackToProjects}
            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Back to projects"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline text-sm font-medium">Projects</span>
          </button>
        )}
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
            <Layers size={20} className="text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold tracking-tight text-slate-200">
              {env.VITE_APP_NAME}
            </h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
              {env.VITE_APP_VERSION}
            </p>
          </div>
        </div>

        {/* Context Selector - shows when we have org/project data */}
        <div className="h-8 w-px bg-slate-800 hidden md:block" />
        <ContextSelector 
          onNavigateToProjects={onNavigateToProjects}
          onNavigateToAccount={onNavigateToAccount}
          onLogout={onLogout}
        />
      </div>

      {/* Right: Indicators and Actions */}
      <div className="flex items-center gap-3">
        {/* Project Status Badge */}
        {currentProject && (
          <div className={cn(
            "hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border",
            currentProject.status === 'active'
              ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
              : currentProject.status === 'setup'
              ? "bg-amber-500/5 text-amber-400 border-amber-500/20"
              : "bg-slate-800/50 text-slate-400 border-slate-700"
          )}>
            {currentProject.status === 'active' ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </>
            ) : currentProject.status === 'setup' ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Setup
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Archived
              </>
            )}
          </div>
        )}

        {/* Violations Indicator */}
        {totalViolations > 0 && (
          <button className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
            criticalViolations > 0
              ? "bg-red-500/5 text-red-400 border-red-500/20 hover:bg-red-500/10"
              : "bg-amber-500/5 text-amber-400 border-amber-500/20 hover:bg-amber-500/10"
          )}>
            <AlertTriangle size={14} />
            <span className="hidden sm:inline">{totalViolations} Violation{totalViolations !== 1 ? 's' : ''}</span>
            <span className="sm:hidden">{totalViolations}</span>
          </button>
        )}

        {/* Drift Indicator */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-mono border",
          criticalViolations > 0 
            ? "text-red-400 border-red-500/20"
            : "text-emerald-400 border-emerald-500/20"
        )}>
          <Activity size={14} className={criticalViolations > 0 ? "animate-pulse" : ""} />
          <span className="hidden sm:inline">DRIFT: {driftPercent}%</span>
          <span className="sm:hidden">{driftPercent}%</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <Bell size={18} className="text-slate-400" />
          {totalViolations > 0 && (
            <span className={cn(
              "absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center",
              criticalViolations > 0 ? "bg-red-500 text-white" : "bg-amber-500 text-white"
            )}>
              {Math.min(totalViolations, 9)}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
