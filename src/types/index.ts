
/**
 * Core Type Definitions
 * Centralized type definitions following DRY principle
 */

import { LucideIcon } from 'lucide-react';

// ============================================================================
// Base Types
// ============================================================================

export type LensType = 'reality' | 'intent' | 'drift';
export type SyncType = 'reality' | 'intent' | 'full';
export type EntityType =
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

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type PolicyStatus = 'Enforced' | 'Warning' | 'Draft' | 'Disabled';
export type EnforcementMode = 'Strict' | 'Warn' | 'DryRun';
export type ViolationType = 'jira' | 'doc' | 'pr' | 'owner' | 'dependency' | 'policy';
export type EvidenceType = 'adr' | 'source' | 'policy' | 'graph' | 'pr' | 'jira';
export type SearchMode = 'local' | 'global' | 'drift';

// ============================================================================
// Graph Types
// ============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface NodeColors {
  reality: string;
  intent: string;
  drift: string;
}

export interface NodeMetrics {
  coupling?: {
    afferent: number;
    efferent: number;
    instability: number;
  };
  cohesion?: number;
  complexity?: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  position: Position;
  colors: NodeColors;
  icon: string;
  altIcon?: string;
  metadata?: {
    description?: string;
    owner?: string;
    team?: string;
    repository?: string;
    language?: string;
    linesOfCode?: number;
    engine?: string;
    region?: string;
    classification?: string;
    [key: string]: unknown;
  };
  metrics?: NodeMetrics;
}

export interface GraphEdge {
  id?: string;
  from: string;
  to: string;
  type?: string;
  color: string;
  width: number;
  dashed?: string;
  animate?: boolean;
  isViolation?: boolean;
  lens?: LensType[];
  always?: boolean;
  opacityInDrift?: number;
  metadata?: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface SubgraphRequest {
  nodeIds: string[];
  depth?: number;
  includeMetadata?: boolean;
}

export interface Community {
  id: string;
  level: number;
  nodeCount: number;
  density: number;
  summary: string;
  nodes: string[];
}

export interface GraphMetrics {
  totalNodes: number;
  totalEdges: number;
  communities: number;
  avgClustering: number;
  conformanceScore: number;
  couplingMetrics: {
    avgAfferent: number;
    avgEfferent: number;
    avgInstability: number;
  };
  healthScore: {
    overall: number;
    architectural: number;
    documentation: number;
    codeQuality: number;
  };
}

// ============================================================================
// Policy Types
// ============================================================================

export interface PolicyMetadata {
  author: string;
  created: string;
  updated: string;
  tags: string[];
}

export interface PolicyEnforcement {
  mode: EnforcementMode;
  scope: string[];
  autoRemediate: boolean;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  package: string;
  status: PolicyStatus;
  severity: SeverityLevel;
  rules: number;
  violations: number;
  rego?: string;
  regoKey?: string;
  metadata: PolicyMetadata;
  enforcement: PolicyEnforcement;
}

export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  rego: string;
}

export type PolicyCreate = Omit<Policy, 'id' | 'violations' | 'metadata'> & {
  metadata?: Partial<PolicyMetadata>;
};

export interface PolicyEvaluationResult {
  allowed: boolean;
  violations: string[];
  details?: Record<string, unknown>;
}

// ============================================================================
// Drift Types
// ============================================================================

export interface SuggestedAction {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface DriftViolation {
  id: string;
  type: ViolationType;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: 'open' | 'resolved' | 'false_positive' | 'investigating';
  highlight: boolean;
  between?: string[];
  policy?: string;
  details?: {
    issue?: string;
    impact?: string;
    detectedAt?: string;
    detectedBy?: string;
    location?: {
      file?: string;
      line?: number;
      function?: string;
    };
    [key: string]: unknown;
  };
  suggestedActions: SuggestedAction[];
  createdAt?: string;
  resolvedAt?: string;
}

export interface DriftSummary {
  totalViolations: number;
  bySeverity: Record<SeverityLevel, number>;
  byType: Record<string, number>;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface DriftTimelinePoint {
  date: string;
  newViolations: number;
  resolvedViolations: number;
  totalOpen: number;
}

export interface ViolationResolution {
  strategy: 'update_intent' | 'refactor_reality' | 'false_positive';
  reason: string;
  ticketId?: string;
}

// ============================================================================
// Search Types
// ============================================================================

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  label: string;
  title: string;
  description: string;
  content: string;
  source: string;
  language?: string;
  line?: number;
  confidence: number;
}

export interface ReasoningResult {
  id: string;
  query: string;
  summary: string;
  analysis: string;
  services: string[];
  severity: string;
  evidenceIds: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
  score: number;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export interface SearchRequest {
  query: string;
  mode?: SearchMode;
  filters?: {
    entityTypes?: string[];
    dateRange?: {
      from?: string;
      to?: string;
    };
  };
  limit?: number;
}

export interface SearchResponse {
  query: string;
  mode: SearchMode;
  results: SearchResult[];
  total: number;
  took: number;
}

// ============================================================================
// Sync Types
// ============================================================================

export interface SyncRequest {
  type: SyncType;
  sources?: string[];
  options?: {
    incremental?: boolean;
    force?: boolean;
  };
}

export interface SyncJob {
  id: string;
  type: SyncType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  stats?: {
    entitiesProcessed: number;
    entitiesCreated: number;
    entitiesUpdated: number;
  };
}

// ============================================================================
// Health & System Types
// ============================================================================

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  responseTime: number;
  message?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  checks: HealthCheck[];
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardMetrics {
  systemHealth: HealthStatus;
  graphMetrics: GraphMetrics;
  driftSummary: DriftSummary;
  policyStats: {
    total: number;
    enforced: number;
    violations: number;
  };
  recentActivity: ActivityItem[];
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface LensConfig {
  label: string;
  color: string;
  bgColor: string;
  accentColor: string;
  description: string;
  summary: string;
  metrics?: {
    entities: number;
    score: string;
    scoreLabel: string;
    subCount: number;
    subLabel: string;
  };
  violation?: {
    policy: string;
    between: string[];
    description: string;
  };
}

export interface LegendItemConfig {
  id: string;
  color: string;
  label: string;
  dashed?: boolean;
  lenses: LensType[];
}

export interface AnalysisAction {
  id: string;
  icon: string;
  label: string;
  description: string;
  color: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Memory/Audit Types
// ============================================================================

export interface AuditItem {
  id: string;
  type: 'jira' | 'doc' | 'pr' | 'owner';
  title: string;
  desc: string;
  highlight: boolean;
  details: {
    issue?: string;
    summary?: string;
    problem: string;
    impact?: string;
    document?: string;
    title?: string;
    lastUpdated?: string;
    driftMetrics?: {
      filesCompliant: number;
      filesDrifted: number;
      complianceRate: string;
    };
    pr?: string;
    author?: string;
    conflicts?: Array<{
      policy: string;
      section: string;
      prApproach: string;
      standardApproach: string;
    }>;
    component?: string;
    previousOwner?: string;
    domain?: string;
    riskLevel?: string;
    pendingItems?: {
      criticalBugs: number;
      openPRs: number;
      untriagedIssues: number;
    };
    suggestedActions: Array<{
      id: string;
      label: string;
      icon: string;
      description: string;
    }>;
  };
}

// ============================================================================
// Log Types
// ============================================================================

export interface LogEntry {
  time: string;
  msg: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
  metadata?: Record<string, unknown>;
}

// ============================================================================
// LLM Types
// ============================================================================

export interface LLMModel {
  id: string;
  name: string;
  contextWindow?: number;
  maxOutput?: number;
  dimensions?: number;
  maxInput?: number;
  supportsFunctions?: boolean;
  supportsVision?: boolean;
}

export interface LLMProvider {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  baseUrl: string;
  models: LLMModel[];
}

export interface LLMSettings {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// ============================================================================
// Re-exports from feature modules
// ============================================================================

export * from './tenant';
export * from './connector';
