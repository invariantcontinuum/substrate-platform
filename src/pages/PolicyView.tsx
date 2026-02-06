/**
 * Policy View Page
 * Fixed imports - now uses API hooks instead of direct data imports
 */

import React, { useState, useMemo } from 'react';
import { ShieldCheck, Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { PolicyModal } from '@/components/modals/PolicyModal';
import { usePolicies, usePolicyMetadata } from '@/hooks';
import { cn } from '@/lib/utils';

export const PolicyView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');

  // Use API hooks to fetch data
  const { data: policies, isLoading: policiesLoading } = usePolicies();
  const { data: metadata, isLoading: metadataLoading } = usePolicyMetadata();

  const filteredPolicies = useMemo(() => {
    if (!policies) return [];
    return policies.filter(p =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.package?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [policies, searchQuery]);

  const handleCreate = () => {
    setSelectedPolicy(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (policy: any) => {
    setSelectedPolicy(policy);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSave = (policy: any) => {
    // In a real app, this would trigger a mutation
    console.log('Save policy:', policy);
  };

  const handleDelete = (id: string) => {
    // In a real app, this would trigger a mutation
    console.log('Delete policy:', id);
  };

  const isLoading = policiesLoading || metadataLoading;

  if (isLoading) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 mt-4">Loading policies...</p>
      </div>
    );
  }

  const statusConfig = metadata?.statusConfig || {};
  const severityLevels = metadata?.severityLevels || {};

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3">
            Active Governance
            <span className="text-xs px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 font-normal uppercase tracking-widest">Policy Engine</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage OPA Rego policies for architectural invariant enforcement.</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
        >
          <Plus size={16} /> New Policy
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search policies by name or package..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-600 transition-all"
          />
        </div>
        <button className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
          <Filter size={16} />
        </button>
      </div>

      {/* Policies List */}
      <div className="grid gap-3 overflow-y-auto pb-6">
        {filteredPolicies.map(policy => {
          const status = statusConfig[policy.status];
          const severity = severityLevels[policy.severity];

          return (
            <div
              key={policy.id}
              className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center gap-6 hover:bg-slate-800/40 transition-all group"
            >
              <div className={cn("p-2 rounded-lg bg-slate-800/50", status?.color === 'emerald' ? 'text-emerald-400' : 'text-slate-400')}>
                <ShieldCheck size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-sm font-bold text-slate-200 truncate">{policy.name}</h3>
                  <span className="text-xs font-mono text-slate-500">{policy.package}</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{policy.description}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:block text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Rules</div>
                  <div className="text-xs text-slate-300 font-mono">{policy.rules}</div>
                </div>
                <div className="hidden md:block text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-0.5">Violations</div>
                  <div className={cn("text-xs font-mono font-bold", policy.violations > 0 ? "text-red-400" : "text-slate-300")}>
                    {policy.violations}
                  </div>
                </div>

                <div className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase border",
                  `bg-${severity?.color}-500/10 text-${severity?.color}-400 border-${severity?.color}-500/30`
                )}>
                  {policy.severity}
                </div>

                <div className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase border flex items-center gap-1.5",
                  `bg-${status?.color}-500/10 text-${status?.color}-400 border-${status?.color}-500/30`
                )}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-${status?.color}-400`} />
                  {policy.status}
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                  <button
                    onClick={() => handleEdit(policy)}
                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(policy.id)}
                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <PolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        policy={selectedPolicy}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PolicyView;
