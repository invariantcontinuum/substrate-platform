/**
 * React Query Hooks
 * DRY, reusable hooks following SOLID principles
 * API-first with automatic fallback to mock data
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../services';
import type {
  GraphFilterParams,
  EdgeFilterParams,
  PolicyFilterParams,
  ViolationFilterParams,
} from '../services';
import type {
  SubgraphRequest,
  ViolationResolution,
  SyncRequest,
  SearchRequest,
  PolicyCreate,
  PolicyStatus,
  EnforcementMode,
  GraphNode,
  GraphEdge,
  GraphData,
  GraphMetrics,
  Community,
  Policy,
  PolicyTemplate,
  DriftViolation,
  DriftSummary,
  DriftTimelinePoint,
  SearchResponse,
  EvidenceItem,
  ReasoningResult,
  SyncJob,
  HealthStatus,
  DashboardMetrics,
  LensConfig,
  LegendItemConfig,
  AnalysisAction,
  AuditItem,
} from '@/types';

// ============================================================================
// Query Keys - Centralized key management following DRY
// ============================================================================

export const queryKeys = {
  // Graph
  graph: {
    all: ['graph'] as const,
    nodes: (params?: GraphFilterParams) => ['graph', 'nodes', params] as const,
    edges: (params?: EdgeFilterParams) => ['graph', 'edges', params] as const,
    full: () => ['graph', 'full'] as const,
    subgraph: (request: SubgraphRequest) => ['graph', 'subgraph', request] as const,
    communities: () => ['graph', 'communities'] as const,
    metrics: () => ['graph', 'metrics'] as const,
  },
  // Policies
  policies: {
    all: ['policies'] as const,
    list: (params?: PolicyFilterParams) => ['policies', 'list', params] as const,
    detail: (id: string) => ['policies', 'detail', id] as const,
    templates: () => ['policies', 'templates'] as const,
    metadata: () => ['policies', 'metadata'] as const,
  },
  // Drift
  drift: {
    all: ['drift'] as const,
    violations: (params?: ViolationFilterParams) => ['drift', 'violations', params] as const,
    violation: (id: string) => ['drift', 'violation', id] as const,
    summary: () => ['drift', 'summary'] as const,
    timeline: (from: string, to: string) => ['drift', 'timeline', from, to] as const,
  },
  // Search
  search: {
    all: ['search'] as const,
    results: (request: SearchRequest) => ['search', 'results', request] as const,
    evidence: (resultId: string) => ['search', 'evidence', resultId] as const,
    reasoning: () => ['search', 'reasoning'] as const,
  },
  // Sync
  sync: {
    all: ['sync'] as const,
    status: (id: string) => ['sync', 'status', id] as const,
  },
  // Health
  health: {
    all: ['health'] as const,
    status: () => ['health', 'status'] as const,
    dashboard: () => ['health', 'dashboard'] as const,
  },
  // UI
  ui: {
    all: ['ui'] as const,
    lens: () => ['ui', 'lens'] as const,
    legend: () => ['ui', 'legend'] as const,
    actions: () => ['ui', 'actions'] as const,
    driftActions: () => ['ui', 'driftActions'] as const,
  },
  // Memory
  memory: {
    all: ['memory'] as const,
    audit: () => ['memory', 'audit'] as const,
    auditItem: (id: string) => ['memory', 'audit', id] as const,
  },
} as const;

// ============================================================================
// Graph Hooks
// ============================================================================

export function useNodes(params?: GraphFilterParams, options?: UseQueryOptions<GraphNode[]>) {
  return useQuery<GraphNode[]>({
    queryKey: queryKeys.graph.nodes(params),
    queryFn: async () => {
      const response = await api.graph.getNodes(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useEdges(params?: EdgeFilterParams, options?: UseQueryOptions<GraphEdge[]>) {
  return useQuery<GraphEdge[]>({
    queryKey: queryKeys.graph.edges(params),
    queryFn: async () => {
      const response = await api.graph.getEdges(params);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useFullGraph(options?: UseQueryOptions<GraphData>) {
  return useQuery<GraphData>({
    queryKey: queryKeys.graph.full(),
    queryFn: async () => {
      const response = await api.graph.getFullGraph();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useSubgraph(request: SubgraphRequest, enabled = true, options?: UseQueryOptions<GraphData>) {
  return useQuery<GraphData>({
    queryKey: queryKeys.graph.subgraph(request),
    queryFn: async () => {
      const response = await api.graph.extractSubgraph(request);
      return response.data;
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useCommunities(options?: UseQueryOptions<Community[]>) {
  return useQuery<Community[]>({
    queryKey: queryKeys.graph.communities(),
    queryFn: async () => {
      const response = await api.graph.getCommunities();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useGraphMetrics(options?: UseQueryOptions<GraphMetrics>) {
  return useQuery<GraphMetrics>({
    queryKey: queryKeys.graph.metrics(),
    queryFn: async () => {
      const response = await api.graph.getMetrics();
      return response.data;
    },
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Policy Hooks
// ============================================================================

export function usePolicies(params?: PolicyFilterParams, options?: UseQueryOptions<Policy[]>) {
  return useQuery<Policy[]>({
    queryKey: queryKeys.policies.list(params),
    queryFn: async () => {
      const response = await api.policies.getAll(params);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function usePolicy(id: string, enabled = true, options?: UseQueryOptions<Policy>) {
  return useQuery<Policy>({
    queryKey: queryKeys.policies.detail(id),
    queryFn: async () => {
      const response = await api.policies.getById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function usePolicyTemplates(options?: UseQueryOptions<PolicyTemplate[]>) {
  return useQuery<PolicyTemplate[]>({
    queryKey: queryKeys.policies.templates(),
    queryFn: async () => {
      const response = await api.policies.getTemplates();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function usePolicyMetadata(options?: UseQueryOptions<import('../services').PolicyMetadata>) {
  return useQuery<import('../services').PolicyMetadata>({
    queryKey: queryKeys.policies.metadata(),
    queryFn: async () => {
      const response = await api.policies.getMetadata();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Drift Hooks
// ============================================================================

export function useViolations(params?: ViolationFilterParams, options?: UseQueryOptions<DriftViolation[]>) {
  return useQuery<DriftViolation[]>({
    queryKey: queryKeys.drift.violations(params),
    queryFn: async () => {
      const response = await api.drift.getViolations(params);
      return response.data;
    },
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

export function useViolation(id: string, enabled = true, options?: UseQueryOptions<DriftViolation>) {
  return useQuery<DriftViolation>({
    queryKey: queryKeys.drift.violation(id),
    queryFn: async () => {
      const response = await api.drift.getViolationById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useDriftSummary(options?: UseQueryOptions<DriftSummary>) {
  return useQuery<DriftSummary>({
    queryKey: queryKeys.drift.summary(),
    queryFn: async () => {
      const response = await api.drift.getSummary();
      return response.data;
    },
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useDriftTimeline(from: string, to: string, enabled = true, options?: UseQueryOptions<DriftTimelinePoint[]>) {
  return useQuery<DriftTimelinePoint[]>({
    queryKey: queryKeys.drift.timeline(from, to),
    queryFn: async () => {
      const response = await api.drift.getTimeline(from, to);
      return response.data;
    },
    enabled: enabled && !!from && !!to,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Search Hooks
// ============================================================================

export function useSearch(request: SearchRequest, enabled = true, options?: UseQueryOptions<SearchResponse>) {
  return useQuery<SearchResponse>({
    queryKey: queryKeys.search.results(request),
    queryFn: async () => {
      const response = await api.search.search(request);
      return response.data;
    },
    enabled: enabled && !!request.query,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useEvidence(resultId: string, enabled = true, options?: UseQueryOptions<EvidenceItem[]>) {
  return useQuery<EvidenceItem[]>({
    queryKey: queryKeys.search.evidence(resultId),
    queryFn: async () => {
      const response = await api.search.getEvidence(resultId);
      return response.data;
    },
    enabled: enabled && !!resultId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useReasoning(options?: UseQueryOptions<ReasoningResult[]>) {
  return useQuery<ReasoningResult[]>({
    queryKey: queryKeys.search.reasoning(),
    queryFn: async () => {
      const response = await api.search.getReasoning();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Sync Hooks
// ============================================================================

export function useSyncStatus(id: string, enabled = true, options?: UseQueryOptions<SyncJob>) {
  return useQuery<SyncJob>({
    queryKey: queryKeys.sync.status(id),
    queryFn: async () => {
      const response = await api.sync.getStatus(id);
      return response.data;
    },
    enabled: enabled && !!id,
    refetchInterval: enabled ? 2000 : false,
    staleTime: 0,
    ...options,
  });
}

// ============================================================================
// Health Hooks
// ============================================================================

export function useHealthStatus(options?: UseQueryOptions<HealthStatus>) {
  return useQuery<HealthStatus>({
    queryKey: queryKeys.health.status(),
    queryFn: async () => {
      const response = await api.health.check();
      return response.data;
    },
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useDashboardMetrics(options?: UseQueryOptions<DashboardMetrics>) {
  return useQuery<DashboardMetrics>({
    queryKey: queryKeys.health.dashboard(),
    queryFn: async () => {
      const response = await api.health.getDashboardMetrics();
      return response.data;
    },
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// UI Hooks
// ============================================================================

export function useLensConfig(options?: UseQueryOptions<Record<string, LensConfig>>) {
  return useQuery<Record<string, LensConfig>>({
    queryKey: queryKeys.ui.lens(),
    queryFn: async () => {
      const response = await api.ui.getLensConfig();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useLegendItems(options?: UseQueryOptions<LegendItemConfig[]>) {
  return useQuery<LegendItemConfig[]>({
    queryKey: queryKeys.ui.legend(),
    queryFn: async () => {
      const response = await api.ui.getLegendItems();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useAnalysisActions(options?: UseQueryOptions<Record<string, AnalysisAction[]>>) {
  return useQuery<Record<string, AnalysisAction[]>>({
    queryKey: queryKeys.ui.actions(),
    queryFn: async () => {
      const response = await api.ui.getAnalysisActions();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useDriftActions(options?: UseQueryOptions<AnalysisAction[]>) {
  return useQuery<AnalysisAction[]>({
    queryKey: queryKeys.ui.driftActions(),
    queryFn: async () => {
      const response = await api.ui.getDriftActions();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}



/**
 * Hook to get drift analysis for the current context
 * Returns the first active drift violation for display
 */
export function useDriftAnalysis(options?: UseQueryOptions<DriftAnalysis>) {
  return useQuery<DriftAnalysis>({
    queryKey: ['drift', 'analysis'],
    queryFn: async () => {
      const response = await api.drift.getViolations({ status: 'open' });
      const violations = response.data;
      const openViolation = violations.find(v => v.highlight);
      
      if (openViolation) {
        return {
          hasViolation: true,
          violation: openViolation,
          between: openViolation.between || [],
          policy: openViolation.policy,
          description: openViolation.description,
        };
      }
      
      return { hasViolation: false };
    },
    staleTime: 30 * 1000,
    ...options,
  });
}

// ============================================================================
// Memory Hooks
// ============================================================================

import type { MemoryStats } from '../services';
import type { DriftAnalysis } from './types';

export function useAuditItems(options?: UseQueryOptions<AuditItem[]>) {
  return useQuery<AuditItem[]>({
    queryKey: queryKeys.memory.audit(),
    queryFn: async () => {
      const response = await api.memory.getAuditItems();
      return response.data;
    },
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

export function useAuditItem(id: string, enabled = true, options?: UseQueryOptions<AuditItem>) {
  return useQuery<AuditItem>({
    queryKey: queryKeys.memory.auditItem(id),
    queryFn: async () => {
      const response = await api.memory.getAuditItemById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useMemoryStats(options?: UseQueryOptions<MemoryStats>) {
  return useQuery<MemoryStats>({
    queryKey: ['memory', 'stats'],
    queryFn: async () => {
      const response = await api.memory.getStats();
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useResolveViolation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, resolution }: { id: string; resolution: ViolationResolution }) => {
      const response = await api.drift.resolveViolation(id, resolution);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drift.all });
    },
  });
}

export function useTriggerSync() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: SyncRequest) => {
      const response = await api.sync.trigger(request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sync.all });
    },
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (policy: PolicyCreate) => {
      const response = await api.policies.create(policy);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.all });
    },
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, policy }: { id: string; policy: Partial<PolicyCreate> }) => {
      const response = await api.policies.update(id, policy);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.all });
    },
  });
}

export function useUpdatePolicyStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PolicyStatus }) => {
      const response = await api.policies.updateStatus(id, status);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.all });
    },
  });
}

export function useUpdateEnforcementMode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, mode }: { id: string; mode: EnforcementMode }) => {
      const response = await api.policies.updateEnforcementMode(id, mode);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.all });
    },
  });
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Quick sync hook with loading state management
 * Convenience hook for simple sync operations
 */
export function useQuickSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const triggerSync = useTriggerSync();

  const sync = useCallback(async (type: 'reality' | 'intent') => {
    setIsSyncing(true);
    try {
      await triggerSync.mutateAsync({ type });
    } finally {
      setIsSyncing(false);
    }
  }, [triggerSync]);

  return {
    sync,
    isSyncing,
    error: triggerSync.error,
  };
}

// Re-export types for convenience
export type { DriftAnalysis };

// ============================================================================
// Re-exports from feature modules
// ============================================================================

export * from './tenant';
export * from './connector';
