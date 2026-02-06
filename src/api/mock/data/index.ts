/**
 * Mock Data Provider
 * Centralized mock data following DRY and Single Responsibility principles
 * JSON and YAML data are kept together for each domain
 */

import type {
  GraphNode,
  GraphEdge,
  Policy,
  PolicyTemplate,
  DriftViolation,
  DriftSummary,
  DriftTimelinePoint,
  HealthStatus,
  DashboardMetrics,
  SyncJob,
  LensConfig,
  LegendItemConfig,
  AnalysisAction,
  EvidenceItem,
  ReasoningResult,
  AuditItem,
  GraphMetrics,
  Community,
} from '@/types';

// Domain-specific data imports
import graphData from './graph/nodes-edges.json';
import policiesData from './policies/policies.json';
import driftData from './drift/violations.json';
import healthData from './health/status.json';
import syncData from './sync/jobs.json';
import uiData from './ui/config.json';
import memoryData from './memory/audit.json';
import searchData from './search/evidence.json';

// ============================================================================
// Type Definitions
// ============================================================================

interface GraphData { nodes: GraphNode[]; edges: GraphEdge[]; }

interface PoliciesData {
  policies: Policy[];
  regoTemplates: Record<string, string>;
  severityLevels: Record<string, { color: string; value: number }>;
  statusConfig: Record<string, { color: string; icon: string; description: string }>;
  enforcementModes: Record<string, string>;
}

interface DriftData {
  violations: DriftViolation[];
  summary: DriftSummary;
  timeline: DriftTimelinePoint[];
}

interface HealthData {
  healthStatus: HealthStatus;
  dashboardMetrics: DashboardMetrics;
}

interface SyncData { jobs: SyncJob[]; }

interface UIData {
  lensConfig: Record<string, LensConfig>;
  legendItems: LegendItemConfig[];
  analysisActions: Record<string, AnalysisAction[]>;
  driftActions: AnalysisAction[];
}

interface MemoryData { auditItems: AuditItem[]; }

interface SearchData {
  evidenceItems: EvidenceItem[];
  reasoningResults: ReasoningResult[];
  evidenceTypes: Record<string, unknown>;
}

// ============================================================================
// Data Registry - Single source of truth for all mock data
// ============================================================================

class MockDataRegistry {
  private cache = new Map<string, unknown>();

  // Graph domain
  get graph(): GraphData {
    return this.getOrLoad('graph', () => graphData as GraphData);
  }

  // Policies domain
  get policies(): PoliciesData {
    return this.getOrLoad('policies', () => policiesData as PoliciesData);
  }

  // Drift domain
  get drift(): DriftData {
    return this.getOrLoad('drift', () => driftData as DriftData);
  }

  // Health domain
  get health(): HealthData {
    return this.getOrLoad('health', () => healthData as HealthData);
  }

  // Sync domain
  get sync(): SyncData {
    return this.getOrLoad('sync', () => syncData as SyncData);
  }

  // UI domain
  get ui(): UIData {
    return this.getOrLoad('ui', () => uiData as UIData);
  }

  // Memory domain
  get memory(): MemoryData {
    return this.getOrLoad('memory', () => memoryData as MemoryData);
  }

  // Search domain
  get search(): SearchData {
    return this.getOrLoad('search', () => searchData as SearchData);
  }

  private getOrLoad<T>(key: string, loader: () => T): T {
    if (!this.cache.has(key)) {
      this.cache.set(key, loader());
    }
    return this.cache.get(key) as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const mockData = new MockDataRegistry();

// ============================================================================
// Smart Mock Provider - Maps endpoints to data
// ============================================================================

export async function mockProvider(endpoint: string, method: string): Promise<unknown> {
  // Parse endpoint to determine data source
  const cleanPath = endpoint.replace(/^\//, '').split('?')[0] || '';
  const segments = cleanPath.split('/').filter(Boolean);
  const resource = segments[0];
  const id = segments[1];

  switch (resource) {
    case 'graph':
      return handleGraphRequest(segments.slice(1), id);
    
    case 'policies':
      return handlePoliciesRequest(segments.slice(1), id);
    
    case 'drift':
      return handleDriftRequest(segments.slice(1), id);
    
    case 'health':
      return handleHealthRequest(segments.slice(1));
    
    case 'sync':
      return handleSyncRequest(segments.slice(1), id, method);
    
    case 'ui':
      return handleUIRequest(segments.slice(1));
    
    case 'memory':
      return handleMemoryRequest(segments.slice(1), id);
    
    case 'search':
      return handleSearchRequest(segments.slice(1));

    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
}

// ============================================================================
// Domain Handlers - Each follows Single Responsibility Principle
// ============================================================================

function handleGraphRequest(segments: string[], id?: string): unknown {
  const subResource = segments[0];

  switch (subResource) {
    case 'nodes':
      return mockData.graph.nodes;
    
    case 'edges':
      return mockData.graph.edges;
    
    case 'communities':
      return getCommunities();
    
    case 'metrics':
      return mockData.health.dashboardMetrics.graphMetrics;
    
    case 'subgraph':
      // Subgraph extraction would be handled by POST body
      return mockData.graph;
    
    default:
      // Return full graph
      return mockData.graph;
  }
}

function handlePoliciesRequest(segments: string[], id?: string): unknown {
  const subResource = segments[0];

  if (id) {
    const policy = mockData.policies.policies.find(p => p.id === id);
    if (!policy) throw new Error(`Policy not found: ${id}`);
    return policy;
  }

  switch (subResource) {
    case 'templates':
      return getPolicyTemplates();
    
    case 'metadata':
      return {
        statusConfig: mockData.policies.statusConfig,
        severityLevels: mockData.policies.severityLevels,
        enforcementModes: mockData.policies.enforcementModes,
      };
    
    default:
      return mockData.policies.policies;
  }
}

function handleDriftRequest(segments: string[], id?: string): unknown {
  const subResource = segments[0];

  switch (subResource) {
    case 'violations':
      if (id) {
        const violation = mockData.drift.violations.find(v => v.id === id);
        if (!violation) throw new Error(`Violation not found: ${id}`);
        return violation;
      }
      return mockData.drift.violations;
    
    case 'summary':
      return mockData.drift.summary;
    
    case 'timeline':
      return mockData.drift.timeline;
    
    default:
      return {
        violations: mockData.drift.violations,
        summary: mockData.drift.summary,
        timeline: mockData.drift.timeline,
      };
  }
}

function handleHealthRequest(segments: string[]): unknown {
  const subResource = segments[0];

  switch (subResource) {
    case 'dashboard':
      return mockData.health.dashboardMetrics;
    
    default:
      return mockData.health.healthStatus;
  }
}

function handleSyncRequest(segments: string[], id?: string, method?: string): unknown {
  if (id) {
    const job = mockData.sync.jobs.find(j => j.id === id);
    if (!job) {
      // Return a running job mock
      return {
        id,
        type: 'reality',
        status: 'running',
        progress: 45,
        startedAt: new Date().toISOString(),
      };
    }
    return job;
  }

  if (method === 'POST') {
    // Create new sync job
    return {
      id: `sync-${Date.now()}`,
      type: 'reality',
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
    };
  }

  return mockData.sync.jobs;
}

function handleUIRequest(segments: string[]): unknown {
  const subResource = segments[0];

  switch (subResource) {
    case 'lens':
      return mockData.ui.lensConfig;
    
    case 'legend':
      return mockData.ui.legendItems;
    
    case 'actions':
      return mockData.ui.analysisActions;
    
    case 'drift-actions':
      return mockData.ui.driftActions;
    
    default:
      return mockData.ui;
  }
}

function handleMemoryRequest(segments: string[], id?: string): unknown {
  const subResource = segments[0];

  if (subResource === 'audit') {
    if (id) {
      const item = mockData.memory.auditItems.find(a => a.id === id);
      if (!item) throw new Error(`Audit item not found: ${id}`);
      return item;
    }
    return mockData.memory.auditItems;
  }

  return mockData.memory.auditItems;
}

function handleSearchRequest(segments: string[]): unknown {
  const subResource = segments[0];

  switch (subResource) {
    case 'evidence':
      return mockData.search.evidenceItems;
    
    case 'reasoning':
      return mockData.search.reasoningResults;
    
    default:
      // Search POST - return all nodes as results
      return {
        query: '',
        mode: 'drift',
        results: mockData.graph.nodes.slice(0, 10).map(n => ({
          id: `search-${n.id}`,
          title: n.label,
          description: n.metadata?.description || '',
          type: n.type,
          score: 0.9,
          entityId: n.id,
        })),
        total: mockData.graph.nodes.length,
        took: 50,
      };
  }
}

// ============================================================================
// Computed Data Helpers
// ============================================================================

function getCommunities(): Community[] {
  // Generate communities from graph structure
  return [
    { 
      id: 'c-1', 
      level: 0, 
      nodeCount: 4, 
      density: 0.75, 
      summary: 'Core API and authentication services', 
      nodes: ['core_api', 'auth_svc', 'db_users', 'notification_svc'] 
    },
    { 
      id: 'c-2', 
      level: 0, 
      nodeCount: 3, 
      density: 0.67, 
      summary: 'Payment processing components', 
      nodes: ['payment_gw', 'db_orders', 'policy_gdpr'] 
    },
    { 
      id: 'c-3', 
      level: 0, 
      nodeCount: 2, 
      density: 0.5, 
      summary: 'Analytics and tracking (drift detected)', 
      nodes: ['shadow_tracker', 'db_orders'] 
    },
  ];
}

function getPolicyTemplates(): PolicyTemplate[] {
  return Object.entries(mockData.policies.regoTemplates || {}).map(
    ([id, rego]) => ({
      id,
      name: id
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase()),
      description: `Template for ${id}`,
      category: 'architecture',
      rego,
    })
  );
}

// Initialize the mock provider
export function initializeMockProvider(): void {
  const { apiClient } = require('../client');
  apiClient.setMockProvider(mockProvider);
}
