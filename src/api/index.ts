/**
 * API Module - Clean Architecture Entry Point
 * 
 * Principles followed:
 * - SOLID: Single Responsibility for each layer
 * - DRY: Centralized exports, no duplication
 * - KISS: Simple, predictable API
 * - API-first: Real API with automatic mock fallback
 */

// Core client with fallback
export { apiClient } from './client';

// Services - Unified API layer
export {
  api,
  graphService,
  policiesService,
  driftService,
  searchService,
  syncService,
  healthService,
  uiService,
  memoryService,
} from './services';

// Service types
export type {
  GraphFilterParams,
  EdgeFilterParams,
  PolicyFilterParams,
  ViolationFilterParams,
  PolicyMetadata,
} from './services';

// Hooks - React Query integration
export {
  // Query keys for cache management
  queryKeys,
  // Graph hooks
  useNodes,
  useEdges,
  useFullGraph,
  useSubgraph,
  useCommunities,
  useGraphMetrics,
  // Policy hooks
  usePolicies,
  usePolicy,
  usePolicyTemplates,
  usePolicyMetadata,
  // Drift hooks
  useViolations,
  useViolation,
  useDriftSummary,
  useDriftTimeline,
  // Search hooks
  useSearch,
  useEvidence,
  useReasoning,
  // Sync hooks
  useSyncStatus,
  // Health hooks
  useHealthStatus,
  useDashboardMetrics,
  // UI hooks
  useLensConfig,
  useLegendItems,
  useAnalysisActions,
  useDriftActions,
  // Memory hooks
  useAuditItems,
  useAuditItem,
  // Mutations
  useResolveViolation,
  useTriggerSync,
  useCreatePolicy,
  useUpdatePolicy,
  useUpdatePolicyStatus,
  useUpdateEnforcementMode,
} from './hooks';

// Mock data (for testing and development)
export { mockData, mockProvider, initializeMockProvider } from './mock/data';
