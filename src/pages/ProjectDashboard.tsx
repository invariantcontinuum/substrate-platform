/**
 * Project Dashboard Page
 * Multi-tenant, role-aware project landing page
 * 
 * Design Principles:
 * - API-first: All data from APIs, no hardcoded business logic
 * - Role-aware: Different views for different personas
 * - Insight-driven: Shows insights, not raw data
 * - Drill-down: Executive → Architect → Code-level evidence
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  Plus,
  ChevronDown,
  Building2,
  FolderKanban,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Zap,
  Target,
  FileText,
  GitBranch,
  Lock,
  BarChart3,
  ArrowRight,
  Sparkles,
  Filter,
  Loader2,
} from 'lucide-react';
import { ProjectSetup } from './ProjectSetup';
import { cn } from '@/lib/utils';
import {
  useCurrentProject,
  useCurrentOrganization,
  useCurrentMember,
  useDashboardView,
  useProjectStore,
  useHasPermission,
  useEffectiveDashboardView,
} from '@/stores';
import {
  useProjectDashboard,
  useExecutiveSummary,
  useArchitectSummary,
  useSecuritySummary,
  useProjectActivity,
  useInstalledConnectors,
} from '@/hooks';
import { useDashboardViews } from '@/api/hooks';
import { ROLE_DEFINITIONS } from '@/types';
import type { DashboardView, Permission, ProjectActivity } from '@/types';

// ============================================================================
// Icon Mapping (API returns icon name as string - map to Lucide icons)
// ============================================================================

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Settings,
  Building2,
  FolderKanban,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Zap,
  Target,
  FileText,
  GitBranch,
  Lock,
  BarChart3,
  ArrowRight,
  Sparkles,
  Filter,
  Plus,
  ChevronDown,
};

const getIconComponent = (iconName: string): React.ElementType => {
  return ICON_MAP[iconName] || LayoutDashboard;
};

// ============================================================================
// View Selector Component
// ============================================================================

interface ViewSelectorProps {
  projectId: string;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ projectId }) => {
  const currentView = useDashboardView();
  const setDashboardView = useProjectStore((state) => state.setDashboardView);
  const currentMember = useCurrentMember();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch dashboard views from API
  const { data: dashboardViews, isLoading } = useDashboardViews(projectId);

  // Filter views based on user permissions
  const availableViews = useMemo(() => {
    if (!dashboardViews) return [];
    if (!currentMember) return dashboardViews;

    const memberPerms = currentMember.permissions?.length > 0
      ? currentMember.permissions
      : ROLE_DEFINITIONS[currentMember.role].permissions;

    return dashboardViews.filter((view) => {
      if (!view.requiredPermission) return true;
      return memberPerms.includes(view.requiredPermission as Permission);
    });
  }, [dashboardViews, currentMember]);

  // Get default view (isDefault flag or first available)
  const defaultView = useMemo(() => {
    return availableViews.find((v) => v.isDefault) || availableViews[0];
  }, [availableViews]);

  // Get current view config
  const currentConfig = useMemo(() => {
    const viewId = currentView || defaultView?.id;
    return availableViews.find((v) => v.id === viewId) || defaultView;
  }, [currentView, defaultView, availableViews]);

  const CurrentIcon = currentConfig ? getIconComponent(currentConfig.icon) : LayoutDashboard;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-400">
        <Loader2 size={16} className="animate-spin" />
        <span className="font-medium">Loading views...</span>
      </div>
    );
  }

  // No views available
  if (availableViews.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 transition-colors"
      >
        <CurrentIcon size={16} className="text-blue-400" />
        <span className="font-medium">{currentConfig?.label || 'Select View'} View</span>
        <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-slate-800">
              <p className="text-xs font-medium text-slate-500 uppercase">Select Dashboard View</p>
            </div>
            <div className="p-2">
              {availableViews.map((view) => {
                const Icon = getIconComponent(view.icon);
                const isActive = currentView === view.id || (!currentView && view.isDefault);
                return (
                  <button
                    key={view.id}
                    onClick={() => {
                      setDashboardView(view.id as DashboardView);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                      isActive
                        ? "bg-blue-500/10 border border-blue-500/20"
                        : "hover:bg-slate-800"
                    )}
                  >
                    <Icon size={18} className={cn("mt-0.5", isActive ? "text-blue-400" : "text-slate-400")} />
                    <div>
                      <p className={cn("text-sm font-medium", isActive ? "text-blue-400" : "text-slate-200")}>
                        {view.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{view.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// Health Score Card
// ============================================================================

interface HealthScoreCardProps {
  score: number;
  trend: 'improving' | 'stable' | 'degrading';
  label: string;
  description?: string;
}

const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ score, trend, label, description }) => {
  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-emerald-400';
    if (s >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving': return <TrendingUp size={14} className="text-emerald-400" />;
      case 'degrading': return <TrendingUp size={14} className="text-red-400 rotate-180" />;
      default: return <Activity size={14} className="text-slate-400" />;
    }
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">{label}</h3>
        {getTrendIcon()}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-800"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn("transition-all duration-500", getScoreColor(score))}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-xl font-bold", getScoreColor(score))}>{score}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className={cn("text-2xl font-bold", getScoreColor(score))}>{score}%</p>
          {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Stats Grid
// ============================================================================

interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

const StatsGrid: React.FC<{ stats: StatItem[] }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-lg", stat.color)}>
                <Icon size={16} />
              </div>
              {stat.change !== undefined && (
                <span className={cn(
                  "text-xs font-medium",
                  stat.trend === 'up' ? 'text-emerald-400' :
                    stat.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                )}>
                  {stat.trend === 'up' ? '+' : ''}{stat.change}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-200">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// Activity Feed
// ============================================================================

const ActivityItem: React.FC<{ activity: ProjectActivity }> = ({ activity }) => {
  const getIcon = (type: string) => {
    if (type.includes('connector')) return <Zap size={14} className="text-blue-400" />;
    if (type.includes('policy') || type.includes('violation')) return <Shield size={14} className="text-amber-400" />;
    if (type.includes('drift')) return <AlertTriangle size={14} className="text-red-400" />;
    if (type.includes('member')) return <Users size={14} className="text-purple-400" />;
    return <Activity size={14} className="text-slate-400" />;
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
        {getIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate">{activity.type.replace(/\./g, ' ')}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          by {activity.actor.name} • {formatTime(activity.createdAt)}
        </p>
      </div>
      {activity.severity !== 'info' && (
        <div className={cn(
          "w-2 h-2 rounded-full shrink-0 mt-1",
          activity.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
        )} />
      )}
    </div>
  );
};

const ActivityFeed: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data: activities, isLoading } = useProjectActivity(projectId, { limit: 10 });

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-slate-400" />
          <h3 className="text-sm font-medium text-slate-300">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-slate-800 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <h3 className="text-sm font-medium text-slate-300">Recent Activity</h3>
        </div>
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          View All
        </button>
      </div>
      <div className="divide-y divide-slate-800/50">
        {activities?.slice(0, 6).map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Connectors Overview
// ============================================================================

const ConnectorsOverview: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data: connectors, isLoading } = useInstalledConnectors(projectId);
  const canManageConnectors = useHasPermission('connector:install');

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-slate-400" />
            <h3 className="text-sm font-medium text-slate-300">Data Connectors</h3>
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const activeCount = connectors?.filter(c => c.status === 'installed').length || 0;
  const errorCount = connectors?.filter(c => c.status === 'error').length || 0;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-blue-400" />
          <h3 className="text-sm font-medium text-slate-300">Data Connectors</h3>
          <span className="text-xs text-slate-500">({activeCount} active)</span>
        </div>
        {canManageConnectors && (
          <button className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
            <Plus size={14} className="text-slate-400" />
          </button>
        )}
      </div>
      <div className="divide-y divide-slate-800/50">
        {connectors?.slice(0, 4).map((connector) => (
          <div key={connector.id} className="flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-2 h-2 rounded-full",
                connector.status === 'installed' ? 'bg-emerald-500' :
                  connector.status === 'error' ? 'bg-red-500' :
                    connector.status === 'configuring' ? 'bg-amber-500' :
                      'bg-slate-500'
              )} />
              <div>
                <p className="text-sm text-slate-200">{connector.name}</p>
                <p className="text-xs text-slate-500">{connector.definition?.name || connector.definitionId}</p>
              </div>
            </div>
            {connector.status === 'error' && (
              <AlertTriangle size={14} className="text-red-400" />
            )}
          </div>
        ))}
        {(!connectors || connectors.length === 0) && (
          <div className="p-4 text-center">
            <p className="text-sm text-slate-500">No connectors installed</p>
            {canManageConnectors && (
              <button className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Browse Marketplace
              </button>
            )}
          </div>
        )}
      </div>
      {errorCount > 0 && (
        <div className="p-3 bg-red-500/5 border-t border-red-500/20">
          <p className="text-xs text-red-400 flex items-center gap-2">
            <AlertTriangle size={12} />
            {errorCount} connector{errorCount > 1 ? 's' : ''} need{errorCount === 1 ? 's' : ''} attention
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Violations Alert
// ============================================================================

const ViolationsAlert: React.FC<{ count: number; criticalCount: number }> = ({ count, criticalCount }) => {
  if (count === 0) return null;

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-xl border",
      criticalCount > 0
        ? "bg-red-500/5 border-red-500/20"
        : "bg-amber-500/5 border-amber-500/20"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center",
        criticalCount > 0 ? "bg-red-500/10" : "bg-amber-500/10"
      )}>
        <AlertTriangle size={20} className={criticalCount > 0 ? "text-red-400" : "text-amber-400"} />
      </div>
      <div className="flex-1">
        <p className={cn("font-medium", criticalCount > 0 ? "text-red-400" : "text-amber-400")}>
          {count} Policy Violation{count !== 1 ? 's' : ''} Detected
        </p>
        <p className="text-sm text-slate-500">
          {criticalCount > 0 ? `${criticalCount} critical, ` : ''}
          {count - criticalCount} require attention
        </p>
      </div>
      <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors">
        Review
      </button>
    </div>
  );
};

// ============================================================================
// Executive View
// ============================================================================

const ExecutiveView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data: summary, isLoading } = useExecutiveSummary(projectId);

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  const stats: StatItem[] = [
    {
      label: 'Health Score',
      value: `${summary.overallHealth?.score ?? 0}%`,
      change: summary.overallHealth?.trend === 'improving' ? 5 : summary.overallHealth?.trend === 'degrading' ? -3 : 0,
      trend: summary.overallHealth?.trend === 'improving' ? 'up' : summary.overallHealth?.trend === 'degrading' ? 'down' : 'neutral',
      icon: Activity,
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Active Violations',
      value: summary.criticalIssues?.length ?? 0,
      icon: AlertTriangle,
      color: (summary.criticalIssues?.length ?? 0) > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Compliance',
      value: `${summary.complianceStatus?.overall ?? 0}%`,
      icon: CheckCircle2,
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      label: 'Components',
      value: summary.keyMetrics?.find(m => m.label.includes('Component'))?.value || '0',
      icon: FolderKanban,
      color: 'bg-purple-500/10 text-purple-400',
    },
  ];

  return (
    <div className="space-y-6">
      {(summary.criticalIssues?.length ?? 0) > 0 && (
        <ViolationsAlert
          count={summary.criticalIssues?.length ?? 0}
          criticalCount={summary.criticalIssues?.filter(i => i.severity === 'critical').length ?? 0}
        />
      )}

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HealthScoreCard
            score={summary.overallHealth?.score ?? 0}
            trend={summary.overallHealth?.trend ?? 'stable'}
            label="Overall System Health"
            description={summary.overallHealth?.summary ?? 'No health data available'}
          />

          {(summary.criticalIssues?.length ?? 0) > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Critical Issues Requiring Attention</h3>
              <div className="space-y-3">
                {summary.criticalIssues?.slice(0, 3).map((issue) => (
                  <div key={issue.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <AlertTriangle size={16} className={cn(
                      "mt-0.5",
                      issue.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                    )} />
                    <div className="flex-1">
                      <p className="text-sm text-slate-200">{issue.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {issue.type} • {issue.affectedComponents} component{issue.affectedComponents !== 1 ? 's' : ''} affected
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-slate-600" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ConnectorsOverview projectId={projectId} />
          <ActivityFeed projectId={projectId} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Architect View
// ============================================================================

const ArchitectView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data: summary, isLoading } = useArchitectSummary(projectId);


  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  const stats: StatItem[] = [
    {
      label: 'Modularity Score',
      value: `${summary.modularityScore ?? 0}%`,
      icon: LayoutDashboard,
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      label: 'Internal Dependencies',
      value: summary.dependencies?.internal ?? 0,
      icon: GitBranch,
      color: 'bg-purple-500/10 text-purple-400',
    },
    {
      label: 'Deprecated APIs',
      value: summary.dependencies?.deprecated ?? 0,
      icon: AlertTriangle,
      color: (summary.dependencies?.deprecated ?? 0) > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Documentation',
      value: `${summary.documentationCoverage ?? 0}%`,
      icon: FileText,
      color: 'bg-emerald-500/10 text-emerald-400',
    },
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4">System Health Metrics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <p className="text-2xl font-bold text-slate-200">{(summary.systemHealth?.coupling ?? 0).toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">Avg Coupling</p>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <p className="text-2xl font-bold text-slate-200">{(summary.systemHealth?.cohesion ?? 0).toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">Cohesion</p>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <p className="text-2xl font-bold text-slate-200">{(summary.systemHealth?.complexity ?? 0).toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-1">Complexity</p>
              </div>
            </div>
          </div>

          {(summary.topViolations?.length ?? 0) > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Top Architecture Violations</h3>
              <div className="space-y-3">
                {summary.topViolations?.map((violation) => (
                  <div key={violation.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <AlertTriangle size={16} className={cn(
                      "mt-0.5",
                      violation.severity === 'Critical' ? 'text-red-400' :
                        violation.severity === 'High' ? 'text-amber-400' : 'text-blue-400'
                    )} />
                    <div className="flex-1">
                      <p className="text-sm text-slate-200">{violation.policy}</p>
                      <p className="text-xs text-slate-500 mt-1">{violation.description}</p>
                      <p className="text-xs text-slate-600 mt-1">{violation.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ActivityFeed projectId={projectId} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Security View
// ============================================================================

const SecurityView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data: summary, isLoading } = useSecuritySummary(projectId);

  if (isLoading || !summary) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  const stats: StatItem[] = [
    {
      label: 'Security Score',
      value: `${summary.securityScore ?? 0}%`,
      icon: Shield,
      color: (summary.securityScore ?? 0) >= 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400',
    },
    {
      label: 'Critical Vulns',
      value: summary.vulnerabilities?.critical ?? 0,
      icon: AlertTriangle,
      color: (summary.vulnerabilities?.critical ?? 0) > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'PII Boundaries',
      value: summary.dataFlowBoundaries?.withPii ?? 0,
      icon: Lock,
      color: 'bg-purple-500/10 text-purple-400',
    },
    {
      label: 'AI Code Audited',
      value: `${summary.aiGeneratedCode?.auditedPercentage ?? 0}%`,
      icon: Sparkles,
      color: (summary.aiGeneratedCode?.auditedPercentage ?? 0) >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Vulnerability Distribution</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <p className="text-2xl font-bold text-red-400">{summary.vulnerabilities?.critical ?? 0}</p>
                <p className="text-xs text-slate-500 mt-1">Critical</p>
              </div>
              <div className="text-center p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <p className="text-2xl font-bold text-amber-400">{summary.vulnerabilities?.high ?? 0}</p>
                <p className="text-xs text-slate-500 mt-1">High</p>
              </div>
              <div className="text-center p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">{summary.vulnerabilities?.medium ?? 0}</p>
                <p className="text-xs text-slate-500 mt-1">Medium</p>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                <p className="text-2xl font-bold text-slate-400">{summary.vulnerabilities?.low ?? 0}</p>
                <p className="text-xs text-slate-500 mt-1">Low</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Data Flow Boundaries</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Cross-Region</span>
                  <span className="text-lg font-bold text-slate-200">{summary.dataFlowBoundaries?.crossRegion ?? 0}</span>
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Non-Compliant</span>
                  <span className="text-lg font-bold text-red-400">{summary.dataFlowBoundaries?.nonCompliant ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          {(summary.complianceGaps?.length ?? 0) > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-300 mb-4">Compliance Gaps</h3>
              <div className="space-y-3">
                {summary.complianceGaps?.map((gap, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-200">{gap.framework}</span>
                      <span className="text-sm text-amber-400">{gap.gap} items</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {gap.items.map((item, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-400">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ActivityFeed projectId={projectId} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Engineer View (Default)
// ============================================================================

const EngineerView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { data: dashboard, isLoading } = useProjectDashboard(projectId);

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-slate-900/50 border border-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  const stats: StatItem[] = [
    {
      label: 'Total Nodes',
      value: dashboard.project?.stats?.totalNodes ?? 0,
      icon: GitBranch,
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      label: 'Active Policies',
      value: dashboard.project?.stats?.policiesCount ?? 0,
      icon: Shield,
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Violations',
      value: dashboard.project?.stats?.activeViolations ?? 0,
      icon: AlertTriangle,
      color: (dashboard.project?.stats?.activeViolations ?? 0) > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Health Score',
      value: `${dashboard.project?.stats?.healthScore ?? 0}%`,
      icon: Activity,
      color: 'bg-purple-500/10 text-purple-400',
    },
  ];

  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HealthScoreCard
            score={dashboard.project?.stats?.healthScore ?? 0}
            trend="stable"
            label="Project Health"
            description="Overall system health based on policy compliance and drift detection"
          />

          <ConnectorsOverview projectId={projectId} />
        </div>

        <div className="space-y-6">
          <ActivityFeed projectId={projectId} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Project Dashboard Component
// ============================================================================

export const ProjectDashboard: React.FC = () => {
  const project = useCurrentProject();
  const organization = useCurrentOrganization();
  const effectiveView = useEffectiveDashboardView();
  const canManageProject = useHasPermission('project:write');

  // Set page title
  useEffect(() => {
    if (project) {
      document.title = `${project.name} - Substrate Platform`;
    }
  }, [project]);

  if (!project || !organization) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center">
          <FolderKanban size={48} className="text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-300 mb-2">No Project Selected</h2>
          <p className="text-slate-500 mb-4">Select a project from the sidebar to view the dashboard</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (effectiveView) {
      case 'executive':
        return <ExecutiveView projectId={project.id} />;
      case 'architect':
        return <ArchitectView projectId={project.id} />;
      case 'security':
        return <SecurityView projectId={project.id} />;
      case 'engineer':
      default:
        return <EngineerView projectId={project.id} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <Building2 size={14} />
              <span>{organization.name}</span>
              <span className="text-slate-700">/</span>
              <FolderKanban size={14} />
              <span className="text-slate-300">{project.name}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-200">Project Dashboard</h1>
          </div>
          {project.status === 'setup' && (
            <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-400">
              Setup
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ViewSelector projectId={project.id} />

          {canManageProject && (
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white transition-colors">
              <Settings size={14} />
              Settings
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {project.status === 'setup' ? (
          <ProjectSetup
            projectId={project.id}
            projectName={project.name}
            onSetupComplete={() => {
              // The setup wizard will update the project status
              // This callback is called after successful completion
            }}
          />
        ) : (
          <div className="p-6">{renderView()}</div>
        )}
      </div>
    </div>
  );
};

export default ProjectDashboard;
