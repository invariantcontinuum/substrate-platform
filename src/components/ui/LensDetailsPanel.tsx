import React from 'react';
import { useLensConfig } from '@/hooks';
import { LensType } from '@/types';

interface LensDetailsPanelProps {
  lensType: LensType;
  onOpenDriftResolver?: () => void;
  onOpenAnalyze?: () => void;
}

export const LensDetailsPanel: React.FC<LensDetailsPanelProps> = ({ lensType, onOpenDriftResolver, onOpenAnalyze }) => {
  const { data: lensConfig } = useLensConfig();
  const config = lensConfig?.[lensType];
  const isDrift = lensType === 'drift';

  if (!config) {
    return null;
  }

  return (
    <div className="absolute bottom-6 right-6 p-5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl w-72 shadow-2xl">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${config.bgColor}`} />
        <h3 className="text-xs font-bold uppercase tracking-wider">{lensType} LENS ANALYSIS</h3>
      </div>

      <div className="space-y-3">
        {isDrift ? (
          <DriftContent config={config} onOpenResolver={onOpenDriftResolver} />
        ) : (
          <AnalyzeContent config={config} onOpenAnalyze={onOpenAnalyze} />
        )}
      </div>
    </div>
  );
};

interface DriftContentProps {
  config: {
    bgColor: string;
    violation?: {
      between: string[];
      policy: string;
    };
  };
  onOpenResolver?: () => void;
}

const DriftContent: React.FC<DriftContentProps> = ({ config, onOpenResolver }) => {
  if (!config.violation) {
    return (
      <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
        <p className="text-[11px] text-green-400 font-medium">
          No drift detected. All dependencies are properly documented.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
        <p className="text-[11px] text-red-400 font-medium">
          Found 1 undocumented dependency between{' '}
          <span className="underline">{config.violation.between[0]}</span> and{' '}
          <span className="underline">{config.violation.between[1]}</span>.
        </p>
        <p className="text-[9px] text-slate-500 mt-2 italic font-mono uppercase">
          VIOLATES POLICY: {config.violation.policy}
        </p>
      </div>
      <button
        onClick={onOpenResolver}
        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase transition-all shadow-lg shadow-red-900/20"
      >
        Open Drift Resolver
      </button>
    </>
  );
};

const COLOR_CLASSES: Record<string, string> = {
  blue: 'text-blue-400',
  purple: 'text-purple-400'
};

interface AnalyzeContentProps {
  config: {
    accentColor: string;
    metrics?: {
      entities: number;
      score: string;
    };
  };
  onOpenAnalyze?: () => void;
}

const AnalyzeContent: React.FC<AnalyzeContentProps> = ({ config, onOpenAnalyze }) => (
  <>
    <div className="flex justify-between text-[11px]">
      <span className="text-slate-500">Nodes in View</span>
      <span>{config.metrics?.entities ?? 0} Entities</span>
    </div>
    <div className="flex justify-between text-[11px]">
      <span className="text-slate-500">Knowledge Depth</span>
      <span className={COLOR_CLASSES[config.accentColor as string] || COLOR_CLASSES.blue}>High ({config.metrics?.score ?? 'N/A'})</span>
    </div>
    <hr className="border-slate-800" />
    <button
      onClick={onOpenAnalyze}
      className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold uppercase transition-all"
    >
      Analyze Subgraph
    </button>
  </>
);
