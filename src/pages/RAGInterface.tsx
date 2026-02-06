/**
 * RAG Interface Page
 * Fixed imports - now uses API hooks instead of direct data imports
 * Quality-aware: Disabled when setup incomplete or data quality is low
 */

import React, { useState, useMemo } from 'react';
import { Search, Brain, Layers, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { EvidenceModal } from '@/components/modals/EvidenceModal';
import { useReasoning, useEvidence } from '@/hooks';
import { ReasoningResult } from '@/types';
import { cn } from '@/lib/utils';
import { QualityGate, QualityMetrics } from '@/components/quality/QualityGate';

interface RAGInterfaceProps {
  metrics?: QualityMetrics;
  onCompleteSetup?: () => void;
}

export const RAGInterface: React.FC<RAGInterfaceProps> = ({
  metrics,
  onCompleteSetup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<ReasoningResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use API hooks to fetch data
  const { data: reasoningResults, isLoading } = useReasoning();
  const { data: evidenceItems } = useEvidence(selectedResult?.id || '', isModalOpen);

  const filteredResults = useMemo(() => {
    if (!reasoningResults) return [];
    return reasoningResults.filter((r: ReasoningResult) =>
      r.query?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reasoningResults, searchQuery]);

  const handleResultClick = (result: ReasoningResult) => {
    setSelectedResult(result);
    setIsModalOpen(true);
  };

  const getEvidenceForResult = (result: ReasoningResult | null) => {
    if (!result || !evidenceItems) return [];
    return evidenceItems.filter((item: any) => result.evidenceIds?.includes(item.id)) || [];
  };

  if (isLoading) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 mt-4">Loading reasoning results...</p>
      </div>
    );
  }

  // Determine if degraded based on metrics
  const isDegraded = metrics && metrics.integrityScore < 50;
  const isLocked = metrics && metrics.integrityScore < 30;

  return (
    <QualityGate
      featureName="GraphRAG Studio"
      featureIcon={Sparkles}
      metrics={metrics}
      minIntegrity={30}
      degradedThreshold={50}
      onCompleteSetup={onCompleteSetup}
      className="h-full"
    >
    <div className={cn(
      "p-8 h-full flex flex-col transition-all duration-500",
      isDegraded && !isLocked && "opacity-40 grayscale"
    )}>
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className={cn(
          "inline-flex items-center justify-center p-3 rounded-2xl mb-4 transition-all",
          isDegraded ? "bg-amber-500/10" : "bg-blue-600/10"
        )}>
          {isDegraded ? (
            <Lock size={32} className="text-amber-500" />
          ) : (
            <Brain size={32} className="text-blue-400" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">GraphRAG Studio</h2>
        <p className="text-slate-400 text-sm">Semantic reasoning engine powered by SurrealDB and Graph Neural Networks.</p>

        {/* Integrity Score Display when degraded */}
        {metrics && isDegraded && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[10px] text-amber-500 font-bold uppercase">Reasoning Engine Integrity</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-1000" 
                  style={{ width: `${metrics.integrityScore}%` }} 
                />
              </div>
              <span className="text-lg font-mono font-bold text-amber-500">{metrics.integrityScore}%</span>
            </div>
          </div>
        )}

        <div className="mt-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder={isDegraded ? "Reasoning engine degraded..." : "Ask a question about your architecture..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isDegraded}
            className={cn(
              "w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all shadow-xl shadow-black/20",
              isDegraded && "opacity-50 cursor-not-allowed border-amber-500/30"
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8">
        {filteredResults.map((result: ReasoningResult) => (
          <div
            key={result.id}
            onClick={() => handleResultClick(result)}
            className="group bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 rounded-2xl p-6 cursor-pointer transition-all hover:bg-slate-800/60 hover:shadow-lg hover:shadow-blue-900/10 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl border-b border-l border-slate-800 bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider
              ${result.severity === 'high' ? 'text-red-400' : 'text-amber-400'}
            `}>
              {result.severity} Priority
            </div>

            <div className="flex items-center gap-2 mb-4 text-slate-500">
              <Layers size={16} />
              <span className="text-xs font-mono">{result.services?.length || 0} Services Affected</span>
            </div>

            <h3 className="text-sm font-bold text-slate-200 mb-2 line-clamp-2">{result.query}</h3>
            <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">{result.summary}</p>

            <div className="flex items-center text-blue-400 text-xs font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
              View Analysis <ArrowRight size={14} className="ml-1" />
            </div>
          </div>
        ))}

        {/* Placeholder for empty state */}
        {filteredResults.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            No analysis results found matching your query.
          </div>
        )}
      </div>

      <EvidenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={selectedResult}
        evidenceItems={getEvidenceForResult(selectedResult)}
      />
    </div>
    </QualityGate>
  );
};

export default RAGInterface;
