/**
 * Unified API Services
 * Clean, DRY service layer following SOLID principles
 * API-first with automatic fallback to mock data
 */

import type {
  GraphNode,
  GraphEdge,
  GraphData,
  GraphMetrics,
  Community,
  SubgraphRequest,
  Policy,
  PolicyCreate,
  PolicyTemplate,
  PolicyEvaluationResult,
  PolicyStatus,
  EnforcementMode,
  DriftViolation,
  DriftSummary,
  DriftTimelinePoint,
  ViolationResolution,
  SearchRequest,
  SearchResponse,
  EvidenceItem,
  ReasoningResult,
  SyncRequest,
  SyncJob,
  HealthStatus,
  DashboardMetrics,
  LensConfig,
  LegendItemConfig,
  AnalysisAction,
  AuditItem,
} from '@/types';

// Re-export base class
export { BaseService } from './base';

// Re-export domain services
export {
  organizationService,
  projectService,
  dashboardService,
  userService,
} from './tenant';

export {
  connectorMarketplaceService,
  installedConnectorService,
  connectorCredentialService,
} from './connector';

// Import services for local use
import {
  organizationService,
  projectService,
  dashboardService,
  userService,
} from './tenant';

import {
  connectorMarketplaceService,
  installedConnectorService,
  connectorCredentialService,
} from './connector';

// Import new services
import { authService, userService as authUserService } from './auth';
import { organizationsService } from './organizations';
import { projectsService } from './projects';
import { teamsService } from './teams';

// Re-export new services
export { authService, userService as authUserService } from './auth';
export { organizationsService } from './organizations';
export { projectsService } from './projects';
export { teamsService } from './teams';

// ============================================================================
// Parameter Types
// ============================================================================

export interface GraphFilterParams {
  type?: string;
  lens?: string;
  query?: string;
  [key: string]: string | undefined;
}

export interface EdgeFilterParams {
  from?: string;
  to?: string;
  lens?: string;
  [key: string]: string | undefined;
}

export interface PolicyFilterParams {
  status?: PolicyStatus;
  severity?: string;
  [key: string]: string | undefined;
}

export interface ViolationFilterParams {
  status?: 'open' | 'resolved' | 'false_positive' | 'investigating';
  severity?: string;
  [key: string]: string | undefined;
}

export interface PolicyMetadata {
  statusConfig: Record<string, { color: string; icon: string; description: string }>;
  severityLevels: Record<string, { color: string; value: number }>;
  enforcementModes: Record<string, string>;
}

// ============================================================================
// Legacy Domain Services - Import from respective files for backward compatibility
// ============================================================================

// Import from legacy service files for backward compatibility
import { BaseService } from './base';

class GraphService extends BaseService {
  protected readonly basePath = '/graph';

  getNodes(params?: GraphFilterParams) {
    return this.get<GraphNode[]>('/nodes', params);
  }

  getEdges(params?: EdgeFilterParams) {
    return this.get<GraphEdge[]>('/edges', params);
  }

  async getFullGraph() {
    const [nodesRes, edgesRes] = await Promise.all([
      this.getNodes(),
      this.getEdges(),
    ]);
    return { data: { nodes: nodesRes.data, edges: edgesRes.data } as GraphData };
  }

  extractSubgraph(request: SubgraphRequest) {
    return this.post<GraphData>('/subgraph', request);
  }

  getCommunities() {
    return this.get<Community[]>('/communities');
  }

  getMetrics() {
    return this.get<GraphMetrics>('/metrics');
  }
}

class PoliciesService extends BaseService {
  protected readonly basePath = '/policies';

  getAll(params?: PolicyFilterParams) {
    return this.get<Policy[]>('', params);
  }

  getById(id: string) {
    return this.get<Policy>(`/${id}`);
  }

  create(policy: PolicyCreate) {
    return this.post<Policy>('', policy);
  }

  update(id: string, policy: Partial<PolicyCreate>) {
    return this.put<Policy>(`/${id}`, policy);
  }

  delete(id: string) {
    return this.del<void>(`/${id}`);
  }

  evaluate(id: string, input: unknown) {
    return this.post<PolicyEvaluationResult>(`/${id}/evaluate`, { input });
  }

  getTemplates() {
    return this.get<PolicyTemplate[]>('/templates');
  }

  updateStatus(id: string, status: PolicyStatus) {
    return this.patch<Policy>(`/${id}`, { status });
  }

  updateEnforcementMode(id: string, mode: EnforcementMode) {
    return this.patch<Policy>(`/${id}`, { enforcement: { mode } });
  }

  getMetadata() {
    return this.get<PolicyMetadata>('/metadata');
  }
}

class DriftService extends BaseService {
  protected readonly basePath = '/drift';

  getViolations(params?: ViolationFilterParams) {
    return this.get<DriftViolation[]>('/violations', params);
  }

  getViolationById(id: string) {
    return this.get<DriftViolation>(`/violations/${id}`);
  }

  resolveViolation(id: string, resolution: ViolationResolution) {
    return this.post<DriftViolation>(`/violations/${id}/resolve`, resolution);
  }

  getSummary() {
    return this.get<DriftSummary>('/summary');
  }

  getTimeline(from: string, to: string) {
    return this.get<DriftTimelinePoint[]>('/timeline', { from, to });
  }
}

class SearchService extends BaseService {
  protected readonly basePath = '/search';

  search(request: SearchRequest) {
    return this.post<SearchResponse>('', request);
  }

  getEvidence(resultId: string) {
    return this.get<EvidenceItem[]>('/evidence', { resultId });
  }

  getReasoning() {
    return this.get<ReasoningResult[]>('/reasoning');
  }
}

class SyncService extends BaseService {
  protected readonly basePath = '/sync';

  trigger(request: SyncRequest) {
    return this.post<SyncJob>('', request);
  }

  getStatus(id: string) {
    return this.get<SyncJob>(`/${id}`);
  }
}

class HealthService extends BaseService {
  protected readonly basePath = '/health';

  check() {
    return this.get<HealthStatus>('');
  }

  getDashboardMetrics() {
    return this.get<DashboardMetrics>('/dashboard');
  }
}

/**
 * UI Config Service
 * Following OpenAPI spec paths: /ui-config/*
 */
class UIConfigService extends BaseService {
  protected readonly basePath = '/ui-config';

  getLensConfig() {
    return this.get<Record<string, LensConfig>>('/lens');
  }

  getLegendItems() {
    return this.get<LegendItemConfig[]>('/legend');
  }

  getAnalysisActions() {
    return this.get<Record<string, AnalysisAction[]>>('/actions/analysis');
  }

  getDriftActions() {
    return this.get<AnalysisAction[]>('/actions/drift');
  }

  getPreferenceOptions() {
    return this.get<{
      data: {
        themes: Array<{ value: string; label: string; icon: string }>;
        languages: Array<{ value: string; label: string }>;
        timezones: Array<{ value: string; label: string }>;
        notificationFrequencies: Array<{ value: string; label: string }>;
        dashboardViews: Array<{ value: string; label: string; description: string; icon: string }>;
      };
    }>('/preferences');
  }

  getDashboardViews(projectId?: string) {
    return this.get<{
      data: Array<{
        id: string;
        label: string;
        description: string;
        icon: string;
        requiredPermission: string | null;
        isDefault: boolean;
      }>;
    }>('/dashboard-views', projectId ? { projectId } : undefined);
  }
}

/**
 * Settings Service
 * Following OpenAPI spec paths: /settings/*
 */
export interface DefaultSettings {
  llm: {
    provider: string;
    baseUrl: string;
    model: string;
    temperature: number;
    maxTokens: number;
    providers: Array<{ id: string; name: string; requiresApiKey: boolean }>;
  };
  api: {
    baseUrl: string;
    timeout: number;
    enableMock: boolean;
    retryAttempts: number;
  };
  graph: {
    defaultLayout: string;
    maxNodes: number;
    layouts: Array<{ id: string; name: string }>;
  };
  features: {
    driftDetection: boolean;
    policyEngine: boolean;
    ragSearch: boolean;
    memoryInterface: boolean;
  };
}

class SettingsService extends BaseService {
  protected readonly basePath = '/settings';

  getDefaults() {
    return this.get<{ data: DefaultSettings }>('/defaults');
  }
}

/**
 * CMS Service
 * Following OpenAPI spec paths: /cms/*
 */
export interface LandingContent {
  features: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  pricingTiers: Array<{
    id: string;
    name: string;
    description: string;
    price: number | null;
    priceUnit: string | null;
    popular: boolean;
    features: string[];
    cta: {
      text: string;
      href: string;
      variant: 'primary' | 'secondary';
    };
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  trustBadges: {
    companies: string[];
    certifications: string[];
  };
}

class CMSService extends BaseService {
  protected readonly basePath = '/cms';

  getLandingContent() {
    return this.get<{ data: LandingContent }>('/landing');
  }
}

/**
 * @deprecated Use UIConfigService instead. Kept for backward compatibility.
 */
class UIService extends BaseService {
  protected readonly basePath = '/ui';

  getLensConfig() {
    return this.get<Record<string, LensConfig>>('/lens');
  }

  getLegendItems() {
    return this.get<LegendItemConfig[]>('/legend');
  }

  getAnalysisActions() {
    return this.get<Record<string, AnalysisAction[]>>('/actions');
  }

  getDriftActions() {
    return this.get<AnalysisAction[]>('/drift-actions');
  }
}

export interface MemoryStats {
  personaDepth: { level: number; label: string; progress: number };
  knowledgeSaved: { adrCount: number; label: string };
  systemConfidence: { percentage: number; trend: string };
}

class MemoryService extends BaseService {
  protected readonly basePath = '/memory';

  getAuditItems() {
    return this.get<AuditItem[]>('/audit');
  }

  getAuditItemById(id: string) {
    return this.get<AuditItem>(`/audit/${id}`);
  }
  
  getStats() {
    return this.get<MemoryStats>('/stats');
  }
}

// ============================================================================
// Service Exports - Singleton instances
// ============================================================================

export const graphService = new GraphService();
export const policiesService = new PoliciesService();
export const driftService = new DriftService();
export const searchService = new SearchService();
export const syncService = new SyncService();
export const healthService = new HealthService();
export const uiService = new UIService();
export const uiConfigService = new UIConfigService();
export const memoryService = new MemoryService();
export const settingsService = new SettingsService();
export const cmsService = new CMSService();

// ============================================================================
// Unified API Export - Single entry point following Facade pattern
// ============================================================================

// Define the API interface to avoid exposing protected members
export interface Api {
  auth: typeof authService;
  user: typeof authUserService;
  organizations: typeof organizationsService;
  projects: typeof projectsService;
  teams: typeof teamsService;
  graph: typeof graphService;
  policies: typeof policiesService;
  drift: typeof driftService;
  search: typeof searchService;
  sync: typeof syncService;
  health: typeof healthService;
  ui: typeof uiConfigService;
  uiLegacy: typeof uiService;
  memory: typeof memoryService;
  settings: typeof settingsService;
  cms: typeof cmsService;
  organization: typeof organizationService;
  project: typeof projectService;
  dashboard: typeof dashboardService;
  tenantUser: typeof userService;
  connector: {
    marketplace: typeof connectorMarketplaceService;
    installed: typeof installedConnectorService;
    credential: typeof connectorCredentialService;
  };
}

export const api: Api = {
  // New services
  auth: authService,
  user: authUserService,
  organizations: organizationsService,
  projects: projectsService,
  teams: teamsService,
  
  // Legacy services
  graph: graphService,
  policies: policiesService,
  drift: driftService,
  search: searchService,
  sync: syncService,
  health: healthService,
  ui: uiConfigService,
  uiLegacy: uiService,
  memory: memoryService,
  settings: settingsService,
  cms: cmsService,
  
  // Legacy tenant services
  organization: organizationService,
  project: projectService,
  dashboard: dashboardService,
  tenantUser: userService,
  connector: {
    marketplace: connectorMarketplaceService,
    installed: installedConnectorService,
    credential: connectorCredentialService,
  },
};
