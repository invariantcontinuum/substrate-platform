/**
 * API Types generated from OpenAPI Specification
 * Following DRY principle - single source of truth for API types
 * 
 * This file contains types that match the OpenAPI spec in src/api/openapi.yaml
 * Keep in sync with the spec when making changes.
 */

import type {
  GraphNode,
  GraphEdge,
  GraphData,
  GraphMetrics,
  Community,
  Policy,
  PolicyTemplate,
  PolicyEvaluationResult,
  PolicyMetadata,
  DriftViolation,
  DriftSummary,
  DriftTimelinePoint,
  ViolationResolution,
  SearchResult,
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

// Re-export all types from core types for convenience
export type {
  GraphNode,
  GraphEdge,
  GraphData,
  GraphMetrics,
  Community,
  Policy,
  PolicyTemplate,
  PolicyEvaluationResult,
  PolicyMetadata,
  DriftViolation,
  DriftSummary,
  DriftTimelinePoint,
  ViolationResolution,
  EvidenceItem,
  ReasoningResult,
  SyncJob,
  HealthStatus,
  DashboardMetrics,
  LensConfig,
  LegendItemConfig,
  AnalysisAction,
  AuditItem,
};

// ============================================================================
// Request Types from OpenAPI Spec
// ============================================================================

/**
 * Subgraph extraction request
 * POST /graph/subgraph
 */
export interface SubgraphRequest {
  nodeIds: string[];
  depth?: number;
  includeMetadata?: boolean;
}

/**
 * Policy creation request
 * POST /policies
 */
export interface PolicyCreate {
  name: string;
  description: string;
  package: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  rego?: string;
  metadata?: Record<string, unknown>;
  enforcement?: {
    mode: string;
    scope: string[];
    autoRemediate: boolean;
  };
}

/**
 * Policy evaluation input
 * POST /policies/{id}/evaluate
 */
export interface PolicyEvaluateRequest {
  input: Record<string, unknown>;
}

/**
 * Search request
 * POST /search
 */
export interface SearchRequest {
  query: string;
  mode?: 'local' | 'global' | 'drift';
  filters?: {
    entityTypes?: string[];
    dateRange?: {
      from?: string;
      to?: string;
    };
  };
  limit?: number;
}

/**
 * Search response type
 * Separate from SearchResult to avoid naming conflict
 */
export interface SearchResponseData {
  query: string;
  mode: 'local' | 'global' | 'drift';
  results: SearchResult[];
  total: number;
  took: number;
}

/**
 * Sync trigger request
 * POST /sync
 */
export interface SyncRequest {
  type: 'reality' | 'intent' | 'full';
  sources?: string[];
  options?: {
    incremental?: boolean;
    force?: boolean;
  };
}

// ============================================================================
// Query Parameter Types from OpenAPI Spec
// ============================================================================

/**
 * Graph nodes filter parameters
 * GET /graph/nodes
 */
export interface GraphNodesParams {
  type?: 
    | 'Service'
    | 'API'
    | 'Module'
    | 'Database'
    | 'Component'
    | 'Team'
    | 'Repository'
    | 'Package'
    | 'Function'
    | 'Class'
    | 'Interface'
    | 'Endpoint'
    | 'Queue'
    | 'Cache';
  lens?: 'reality' | 'intent' | 'drift';
  query?: string;
}

/**
 * Graph edges filter parameters
 * GET /graph/edges
 */
export interface GraphEdgesParams {
  from?: string;
  to?: string;
  lens?: 'reality' | 'intent' | 'drift';
}

/**
 * Policies filter parameters
 * GET /policies
 */
export interface PoliciesParams {
  status?: 'Enforced' | 'Warning' | 'Draft' | 'Disabled';
  severity?: 'Critical' | 'High' | 'Medium' | 'Low';
}

/**
 * Drift violations filter parameters
 * GET /drift/violations
 */
export interface ViolationsParams {
  status?: 'open' | 'resolved' | 'false_positive' | 'investigating';
  severity?: 'Critical' | 'High' | 'Medium' | 'Low';
}

/**
 * Drift timeline parameters
 * GET /drift/timeline
 */
export interface TimelineParams {
  from: string;
  to: string;
}

/**
 * Evidence query parameters
 * GET /search/evidence
 */
export interface EvidenceParams {
  resultId: string;
}

// ============================================================================
// Response Wrapper Types
// ============================================================================

/**
 * Standard API response wrapper
 * All API responses follow this structure
 */
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Specific Response Types from OpenAPI Spec
// ============================================================================

export type NodesResponse = ApiResponse<GraphNode[]>;
export type EdgesResponse = ApiResponse<GraphEdge[]>;
export type GraphDataResponse = ApiResponse<GraphData>;
export type CommunitiesResponse = ApiResponse<Community[]>;
export type GraphMetricsResponse = ApiResponse<GraphMetrics>;

export type PoliciesResponse = ApiResponse<Policy[]>;
export type PolicyResponse = ApiResponse<Policy>;
export type PolicyTemplatesResponse = ApiResponse<PolicyTemplate[]>;
export type PolicyMetadataResponse = ApiResponse<PolicyMetadata>;
export type PolicyEvaluationResponse = ApiResponse<PolicyEvaluationResult>;

export type ViolationsResponse = ApiResponse<DriftViolation[]>;
export type ViolationResponse = ApiResponse<DriftViolation>;
export type DriftSummaryResponse = ApiResponse<DriftSummary>;
export type DriftTimelineResponse = ApiResponse<DriftTimelinePoint[]>;
export type ViolationResolutionResponse = ApiResponse<DriftViolation>;

export type SearchResponseWrapper = ApiResponse<SearchResponseData>;
export type EvidenceResponse = ApiResponse<EvidenceItem[]>;
export type ReasoningResponse = ApiResponse<ReasoningResult[]>;

export type SyncJobResponse = ApiResponse<SyncJob>;

export type HealthStatusResponse = ApiResponse<HealthStatus>;
export type DashboardMetricsResponse = ApiResponse<DashboardMetrics>;

export type LensConfigResponse = ApiResponse<Record<string, LensConfig>>;
export type LegendItemsResponse = ApiResponse<LegendItemConfig[]>;
export type AnalysisActionsResponse = ApiResponse<Record<string, AnalysisAction[]>>;
export type DriftActionsResponse = ApiResponse<AnalysisAction[]>;

export type AuditItemsResponse = ApiResponse<AuditItem[]>;
export type AuditItemResponse = ApiResponse<AuditItem>;

// ============================================================================
// API Endpoint Type Definitions
// ============================================================================

/**
 * Type definitions for all API endpoints
 * Used for type-safe API client implementations
 */
export interface ApiEndpoints {
  // Graph endpoints
  'GET /graph/nodes': { params: GraphNodesParams; response: NodesResponse };
  'GET /graph/edges': { params: GraphEdgesParams; response: EdgesResponse };
  'POST /graph/subgraph': { body: SubgraphRequest; response: GraphDataResponse };
  'GET /graph/communities': { response: CommunitiesResponse };
  'GET /graph/metrics': { response: GraphMetricsResponse };

  // Policy endpoints
  'GET /policies': { params: PoliciesParams; response: PoliciesResponse };
  'POST /policies': { body: PolicyCreate; response: PolicyResponse };
  'GET /policies/:id': { response: PolicyResponse };
  'PUT /policies/:id': { body: PolicyCreate; response: PolicyResponse };
  'DELETE /policies/:id': { response: ApiResponse<void> };
  'POST /policies/:id/evaluate': { body: PolicyEvaluateRequest; response: PolicyEvaluationResponse };
  'GET /policies/templates': { response: PolicyTemplatesResponse };
  'GET /policies/metadata': { response: PolicyMetadataResponse };

  // Drift endpoints
  'GET /drift/violations': { params: ViolationsParams; response: ViolationsResponse };
  'GET /drift/violations/:id': { response: ViolationResponse };
  'POST /drift/violations/:id/resolve': { body: ViolationResolution; response: ViolationResolutionResponse };
  'GET /drift/summary': { response: DriftSummaryResponse };
  'GET /drift/timeline': { params: TimelineParams; response: DriftTimelineResponse };

  // Search endpoints
  'POST /search': { body: SearchRequest; response: SearchResponseWrapper };
  'GET /search/evidence': { params: EvidenceParams; response: EvidenceResponse };
  'GET /search/reasoning': { response: ReasoningResponse };

  // Sync endpoints
  'POST /sync': { body: SyncRequest; response: SyncJobResponse };
  'GET /sync/:id/status': { response: SyncJobResponse };

  // Health endpoints
  'GET /health': { response: HealthStatusResponse };
  'GET /health/metrics/dashboard': { response: DashboardMetricsResponse };

  // UI config endpoints
  'GET /ui-config/lens': { response: LensConfigResponse };
  'GET /ui-config/legend': { response: LegendItemsResponse };
  'GET /ui-config/actions/analysis': { response: AnalysisActionsResponse };
  'GET /ui-config/actions/drift': { response: DriftActionsResponse };

  // Memory endpoints
  'GET /memory/audit': { response: AuditItemsResponse };
  'GET /memory/audit/:id': { response: AuditItemResponse };
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Extract path parameters from an endpoint path
 */
export type PathParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${string}/:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & PathParams<`/${Rest}`>
  : T extends `${string}/:${infer Param}`
  ? { [K in Param]: string }
  : Record<string, never>;

/**
 * Type for API endpoint paths
 */
export type EndpointPath = keyof ApiEndpoints;

/**
 * Type for API request config
 */
export interface ApiRequestConfig<T extends EndpointPath = EndpointPath> {
  endpoint: T;
  params?: T extends keyof ApiEndpoints ? ApiEndpoints[T] extends { params: infer P } ? P : never : never;
  body?: T extends keyof ApiEndpoints ? ApiEndpoints[T] extends { body: infer B } ? B : never : never;
  headers?: Record<string, string>;
}
