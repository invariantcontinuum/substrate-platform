/**
 * Knowledge Fabric Page
 * Refactored with new architecture
 */

import React, { useState, useCallback } from 'react';
import { Zap, Target } from 'lucide-react';
import { useAppStore, useActiveLens, useGraphStore } from '@/stores';
import { 
  useFullGraph, 
  useLensConfig, 
  useLegendItems,
  useDriftAnalysis,
} from '@/hooks';
import { LensType } from '@/types';
import { cn } from '@/lib/utils';

// Components
import { CytoscapeGraph, GraphLegend, GraphToolbar } from '@/components/graph';
import { LensButton } from '@/components/ui/LensButton';
import { DriftResolverModal } from '@/components/modals/DriftResolverModal';
import { AnalyzeSubgraphModal } from '@/components/modals/AnalyzeSubgraphModal';

interface KnowledgeFabricProps {
  onSync: (type: 'reality' | 'intent') => void;
  isSyncing?: boolean;
}

export const KnowledgeFabric: React.FC<KnowledgeFabricProps> = ({
  onSync,
  isSyncing = false,
}) => {
  const activeLens = useActiveLens();
  const setActiveLens = useAppStore((state) => state.setActiveLens);
  const { zoomIn, zoomOut, resetTransform } = useGraphStore();

  // Queries
  const { data: graphData, isLoading: graphLoading } = useFullGraph();
  const { data: lensConfig } = useLensConfig();
  const { data: legendItems } = useLegendItems();
  const { data: driftAnalysis, isLoading: driftLoading } = useDriftAnalysis();

  // Local state
  const [isDriftModalOpen, setIsDriftModalOpen] = useState(false);
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Get current lens config
  const currentLensConfig = lensConfig?.[activeLens];

  // Handle lens change
  const handleLensChange = useCallback((lens: LensType) => {
    setActiveLens(lens);
  }, [setActiveLens]);

  // Loading state
  if (graphLoading || !graphData) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  const nodes = graphData.nodes;
  const edges = graphData.edges;

  return (
    <div className="p-6 h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-200">
            Knowledge Fabric
            <span className="text-xs px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 font-normal uppercase tracking-widest">
              Visualizer
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Multi-modal mapping of Reality vs. Architectural Intent.
          </p>
        </div>

        <div className="flex flex-col gap-3 items-end">
          {/* Lens Selector */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <LensButton
              label="Reality"
              active={activeLens === 'reality'}
              onClick={() => handleLensChange('reality')}
              color="border-blue-500 text-blue-400"
            />
            <LensButton
              label="Intent"
              active={activeLens === 'intent'}
              onClick={() => handleLensChange('intent')}
              color="border-purple-500 text-purple-400"
            />
            <LensButton
              label="Drift"
              active={activeLens === 'drift'}
              onClick={() => handleLensChange('drift')}
              color="border-red-500 text-red-400"
            />
          </div>

          {/* Sync Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onSync('reality')}
              disabled={isSyncing}
              className={cn(
                "px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[10px] font-bold uppercase flex items-center gap-2 transition-all text-slate-200",
                isSyncing && "opacity-50 cursor-not-allowed"
              )}
            >
              <Zap size={12} />
              Sync Reality
            </button>
            <button
              onClick={() => onSync('intent')}
              disabled={isSyncing}
              className={cn(
                "px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[10px] font-bold uppercase flex items-center gap-2 transition-all text-slate-200",
                isSyncing && "opacity-50 cursor-not-allowed"
              )}
            >
              <Target size={12} />
              Sync Intent
            </button>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/40 relative overflow-hidden">
        {/* Graph Toolbar */}
        <GraphToolbar
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetTransform}
        />

        {/* Graph Visualization */}
        <div className="w-full h-full">
          <CytoscapeGraph
            nodes={nodes}
            edges={edges}
            activeLens={activeLens}
            layout="dagre"
            onNodeClick={setSelectedNode}
          />
        </div>

        {/* Legend */}
        {legendItems && (
          <GraphLegend items={legendItems} activeLens={activeLens} />
        )}

        {/* Lens Details Panel */}
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-[calc(100%-24px)] hover:translate-x-0 transition-transform duration-300 ease-in-out z-20 flex items-start group">
          {/* Hover Trigger/Tab */}
          <div className="w-6 h-32 bg-slate-900 border-l border-t border-b border-slate-700 rounded-l-lg flex items-center justify-center cursor-pointer shadow-xl relative z-30">
            <div className="transform -rotate-90 whitespace-nowrap text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                activeLens === 'reality' ? 'bg-blue-500' : 
                activeLens === 'intent' ? 'bg-purple-500' : 'bg-red-500'
              )} />
              Analysis
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-bl-2xl w-72 shadow-2xl h-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className={cn("w-2 h-2 rounded-full", 
                activeLens === 'reality' ? 'bg-blue-500' : 
                activeLens === 'intent' ? 'bg-purple-500' : 'bg-red-500'
              )} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {currentLensConfig?.label || activeLens} LENS ANALYSIS
              </h3>
            </div>

            <div className="space-y-3">
              {activeLens === 'drift' ? (
                <>
                  {driftLoading ? (
                    <div className="p-3 bg-slate-800 rounded-lg animate-pulse">
                      <div className="h-8 bg-slate-700 rounded" />
                    </div>
                  ) : driftAnalysis?.hasViolation ? (
                    <>
                      <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                        <p className="text-[11px] text-red-400 font-medium">
                          {driftAnalysis.between && driftAnalysis.between.length >= 2 ? (
                            <>
                              Found 1 undocumented dependency between{' '}
                              <span className="underline">{driftAnalysis.between[0]}</span> and{' '}
                              <span className="underline">{driftAnalysis.between[1]}</span>.
                            </>
                          ) : (
                            driftAnalysis.description || 'Drift detected in the system.'
                          )}
                        </p>
                        {driftAnalysis.policy && (
                          <p className="text-[9px] text-slate-500 mt-2 italic font-mono uppercase">
                            VIOLATES POLICY: {driftAnalysis.policy}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setIsDriftModalOpen(true)}
                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase transition-all shadow-lg shadow-red-900/20"
                      >
                        Open Drift Resolver
                      </button>
                    </>
                  ) : (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                      <p className="text-[11px] text-emerald-400 font-medium">
                        No drift detected. System is aligned with architectural intent.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Nodes in View</span>
                    <span className="text-slate-200">{currentLensConfig?.metrics?.entities || nodes.length} Entities</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">
                      {currentLensConfig?.metrics?.scoreLabel || 'Score'}
                    </span>
                    <span className={activeLens === 'reality' ? 'text-blue-400' : 'text-purple-400'}>
                      {currentLensConfig?.metrics?.score || 'N/A'}
                    </span>
                  </div>
                  <hr className="border-slate-800" />
                  <button
                    onClick={() => setIsAnalyzeModalOpen(true)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold uppercase transition-all text-slate-200"
                  >
                    Analyze Subgraph
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DriftResolverModal
        isOpen={isDriftModalOpen}
        onClose={() => setIsDriftModalOpen(false)}
      />
      <AnalyzeSubgraphModal
        isOpen={isAnalyzeModalOpen}
        onClose={() => setIsAnalyzeModalOpen(false)}
        lensType={activeLens}
      />
    </div>
  );
};

export default KnowledgeFabric;
