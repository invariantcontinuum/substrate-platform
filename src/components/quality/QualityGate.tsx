/**
 * QualityGate Component
 * Implements quality-aware UI patterns from qualityawareui.txt
 * Disables features when:
 * 1. Project setup is not complete (status === 'setup')
 * 2. Data quality/integrity is degraded (integrityScore < threshold)
 */

import React from 'react';
import {
  AlertTriangle,
  Lock,
  RefreshCw,
  Activity,
  AlertCircle,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentProject } from '@/stores';

// ============================================================================
// Types
// ============================================================================

export interface QualityMetrics {
  integrityScore: number; // 0-100
  density?: number; // Edge/Node ratio (0-1)
  freshness?: number; // Weighted timestamp age (0-1)
  validation?: number; // % of nodes with linked Docs/Jira (0-1)
  humanCheck?: number; // % of nodes verified by human (0-1)
}

export interface QualityGateProps {
  children: React.ReactNode;
  metrics?: QualityMetrics;
  requiredSetup?: boolean;
  minIntegrity?: number; // Minimum integrity score to enable (default: 30)
  degradedThreshold?: number; // Threshold for degraded warning (default: 50)
  onImproveQuality?: () => void;
  onCompleteSetup?: () => void;
  featureName?: string;
  featureIcon?: React.ElementType;
  className?: string;
}

export type QualityStatus = 'locked' | 'degraded' | 'optimal';

// ============================================================================
// Helper Functions
// ============================================================================

export function getQualityStatus(
  metrics: QualityMetrics | undefined,
  minIntegrity: number,
  degradedThreshold: number
): QualityStatus {
  if (!metrics) return 'optimal';
  if (metrics.integrityScore < minIntegrity) return 'locked';
  if (metrics.integrityScore < degradedThreshold) return 'degraded';
  return 'optimal';
}

// ============================================================================
// Metric Ring Component (from qualityawareui.txt)
// ============================================================================

const MetricRing: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[9px] uppercase font-bold tracking-tighter">
      <span className="text-slate-500">{label}</span>
      <span className={color}>{Math.round(value * 100)}%</span>
    </div>
    <div className="h-1 bg-slate-800 rounded-full">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color.replace('text', 'bg')}`}
        style={{ width: `${value * 100}%` }}
      />
    </div>
  </div>
);

// ============================================================================
// Integrity Score Header
// ============================================================================

export const IntegrityScoreHeader: React.FC<{
  metrics: QualityMetrics;
  className?: string;
}> = ({ metrics, className }) => {
  const isDegraded = metrics.integrityScore < 50;
  const isLocked = metrics.integrityScore < 30;

  return (
    <div className={cn(
      "flex items-center gap-6 p-4 border-b border-slate-800 bg-slate-900/50",
      className
    )}>
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Substrate Integrity</span>
          {isDegraded && <AlertCircle size={12} className="text-amber-500 animate-pulse" />}
        </div>
        <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 relative">
          <div
            className={cn(
              "h-full transition-all duration-1000",
              isDegraded
                ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
            )}
            style={{ width: `${metrics.integrityScore}%` }}
          />
        </div>
      </div>
      <div className="text-2xl font-mono font-bold tabular-nums">
        {metrics.integrityScore}<span className="text-sm text-slate-500">%</span>
      </div>
      {(isLocked || isDegraded) && (
        <div className={cn(
          "text-[10px] font-mono flex items-center gap-1 border px-2 py-0.5 rounded",
          isLocked
            ? "text-red-500 border-red-500/30 bg-red-500/5"
            : "text-amber-500 border-amber-500/30 bg-amber-500/5"
        )}>
          {isLocked ? 'LOCKED' : 'DEGRADED'}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Setup Required Overlay
// ============================================================================

const SetupRequiredOverlay: React.FC<{
  featureName: string;
  featureIcon: React.ElementType;
  onCompleteSetup?: () => void;
}> = ({ featureName, featureIcon: Icon, onCompleteSetup }) => (
  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-8">
    <div className="max-w-md w-full text-center">
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
        <div className="relative w-20 h-20 bg-slate-900 border-2 border-slate-700 rounded-2xl flex items-center justify-center">
          <Icon size={32} className="text-slate-500" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center border-2 border-slate-900">
            <Lock size={12} className="text-slate-900" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">{featureName} Locked</h2>
      <p className="text-slate-400 mb-8 leading-relaxed">
        Complete your project setup to unlock the {featureName}. 
        Connect data sources and configure policies to build your knowledge fabric.
      </p>

      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-left space-y-3 mb-6">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase">
          <AlertTriangle size={14} /> Setup Required:
        </div>
        <ul className="text-xs text-slate-500 space-y-2 ml-6 list-disc">
          <li>Connect at least one data source (GitHub, Jira, etc.)</li>
          <li>Configure initial governance policies</li>
          <li>Run first sync to populate knowledge graph</li>
        </ul>
      </div>

      {onCompleteSetup && (
        <button
          onClick={onCompleteSetup}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          Complete Setup
        </button>
      )}
    </div>
  </div>
);

// ============================================================================
// Low Fidelity Overlay (Degraded Mode)
// ============================================================================

const LowFidelityOverlay: React.FC<{
  featureName: string;
  metrics: QualityMetrics;
  onImproveQuality?: () => void;
}> = ({ featureName, metrics, onImproveQuality }) => (
  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-40 flex items-center justify-center pointer-events-none">
    <div className="bg-slate-900/90 border border-slate-700 p-6 rounded-2xl flex flex-col items-center gap-3 shadow-2xl animate-in fade-in zoom-in duration-500 pointer-events-auto max-w-md mx-4">
      <AlertTriangle className="text-amber-500" size={32} />
      <div className="text-center">
        <h3 className="text-lg font-bold text-white">Low Fidelity {featureName}</h3>
        <p className="text-sm text-slate-400 mt-2">
          Substrate integrity is at {metrics.integrityScore}%. The knowledge base is fragmented. 
          Sync intent and reality to improve accuracy.
        </p>
      </div>

      {/* Quality Metrics */}
      <div className="w-full space-y-3 mt-2 pt-4 border-t border-slate-800">
        {metrics.density !== undefined && (
          <MetricRing label="Graph Density" value={metrics.density} color="text-blue-400" />
        )}
        {metrics.freshness !== undefined && (
          <MetricRing label="Data Freshness" value={metrics.freshness} color="text-emerald-400" />
        )}
        {metrics.validation !== undefined && (
          <MetricRing label="Validation Coverage" value={metrics.validation} color="text-purple-400" />
        )}
      </div>

      {onImproveQuality && (
        <button
          onClick={onImproveQuality}
          className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold uppercase transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} />
          Improve Fidelity Now
        </button>
      )}
    </div>
  </div>
);

// ============================================================================
// Locked Overlay (Critical Quality)
// ============================================================================

const LockedOverlay: React.FC<{
  featureName: string;
  metrics: QualityMetrics;
  minIntegrity: number;
  onImproveQuality?: () => void;
}> = ({ featureName, metrics, minIntegrity, onImproveQuality }) => (
  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-8">
    <div className="max-w-md w-full text-center">
      <Lock size={64} className="text-slate-600 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-white mb-4">{featureName} Unavailable</h2>
      <p className="text-slate-400 mb-8 leading-relaxed">
        You cannot use {featureName} with a low-fidelity substrate. 
        Automated reasoning requires at least{' '}
        <span className="text-white font-bold">{minIntegrity}% Integrity</span> to prevent hallucinations.
      </p>

      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-left space-y-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-red-400 font-bold uppercase">
          <AlertTriangle size={14} /> Critical Quality Issues:
        </div>

        {/* Progress bar showing current vs required */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] text-slate-500 font-mono uppercase">
            <span>Required Integrity: {minIntegrity}%</span>
            <span>Current: {metrics.integrityScore}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${metrics.integrityScore}%` }} />
          </div>
        </div>

        <ul className="text-xs text-slate-500 space-y-1 ml-6 list-disc">
          {metrics.density !== undefined && metrics.density < 0.5 && (
            <li>Incomplete Dependency Graph (Density: {Math.round(metrics.density * 100)}%)</li>
          )}
          {metrics.freshness !== undefined && metrics.freshness < 0.5 && (
            <li>Stale Data Sources (Freshness: {Math.round(metrics.freshness * 100)}%)</li>
          )}
          {metrics.validation !== undefined && metrics.validation < 0.3 && (
            <li>Insufficient Documentation Links</li>
          )}
          <li>Outdated or Missing Connectors</li>
        </ul>
      </div>

      {onImproveQuality && (
        <button
          onClick={onImproveQuality}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
        >
          <Activity size={16} />
          Run Sync to Improve Quality
        </button>
      )}
    </div>
  </div>
);

// ============================================================================
// Main QualityGate Component
// ============================================================================

export const QualityGate: React.FC<QualityGateProps> = ({
  children,
  metrics,
  requiredSetup = true,
  minIntegrity = 30,
  degradedThreshold = 50,
  onImproveQuality,
  onCompleteSetup,
  featureName = 'Feature',
  featureIcon: FeatureIcon = Database,
  className,
}) => {
  const currentProject = useCurrentProject();

  // Check if setup is required
  const isSetupIncomplete = requiredSetup && currentProject?.status === 'setup';

  // Determine quality status
  const qualityStatus = getQualityStatus(metrics, minIntegrity, degradedThreshold);
  const isLocked = qualityStatus === 'locked';
  const isDegraded = qualityStatus === 'degraded';
  const isFuzzy = metrics && metrics.integrityScore < 40;

  // Apply visual degradation to content
  const contentClassName = cn(
    "relative h-full",
    isFuzzy && !isLocked && "grayscale-[0.3] contrast-[0.9]",
    className
  );

  return (
    <div className={contentClassName}>
      {/* Show setup overlay first if setup incomplete */}
      {isSetupIncomplete && (
        <SetupRequiredOverlay
          featureName={featureName}
          featureIcon={FeatureIcon}
          onCompleteSetup={onCompleteSetup}
        />
      )}

      {/* Show locked overlay if integrity too low */}
      {!isSetupIncomplete && isLocked && metrics && (
        <LockedOverlay
          featureName={featureName}
          metrics={metrics}
          minIntegrity={minIntegrity}
          onImproveQuality={onImproveQuality}
        />
      )}

      {/* Show degraded overlay if quality is low but not locked */}
      {!isSetupIncomplete && !isLocked && isDegraded && metrics && (
        <LowFidelityOverlay
          featureName={featureName}
          metrics={metrics}
          onImproveQuality={onImproveQuality}
        />
      )}

      {/* Render children with optional degradation effects */}
      <div className={cn("h-full", isFuzzy && !isLocked && "blur-[0.5px]")}>
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// Quality Badge (for nav items, tabs, etc.)
// ============================================================================

export const QualityBadge: React.FC<{
  status: QualityStatus;
  className?: string;
}> = ({ status, className }) => {
  if (status === 'optimal') return null;

  return (
    <div
      className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === 'degraded' && "bg-amber-500 animate-pulse",
        status === 'locked' && "bg-red-500",
        className
      )}
      title={status === 'degraded' ? 'Degraded Performance' : 'Feature Locked'}
    />
  );
};

export default QualityGate;
