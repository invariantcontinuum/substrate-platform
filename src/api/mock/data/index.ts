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
  Community,
  User,
  UserPreferences,
  NotificationPreferences,
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

// Tenant and Connector mock data
import {
  mockCurrentUser,
  mockUsers,
  mockOrganizations,
  mockProjects,
  mockProjectMembers,
  mockOrganizationMembers,
  mockTeams,
  mockActivity,
  mockExecutiveSummary,
  mockArchitectSummary,
  mockSecuritySummary,
  mockProjectDashboard,
  type Team,
} from './tenant';

import {
  mockConnectorDefinitions,
  mockInstalledConnectors,
  mockConnectorTemplates,
  getMockMarketplaceItems,
} from './connector';

// ============================================================================
// In-Memory State for CRUD Operations
// ============================================================================

// Mutable state for CRUD operations
let currentUser: User | null = mockCurrentUser;
let users = [...mockUsers];
let organizations = [...mockOrganizations];
let projects = [...mockProjects];
let teams = [...mockTeams];
let isAuthenticated = false;

// Session storage
const sessions = new Map<string, { device: string; browser: string; createdAt: string }>();

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

interface MemoryData {
  stats: {
    personaDepth: { level: number; label: string; progress: number };
    knowledgeSaved: { adrCount: number; label: string };
    systemConfidence: { percentage: number; trend: string };
  };
  auditItems: AuditItem[];
}

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

export async function mockProvider(endpoint: string, method: string, body?: unknown): Promise<unknown> {
  // Parse endpoint to determine data source
  const cleanPath = endpoint.replace(/^\//, '').split('?')[0] || '';
  const segments = cleanPath.split('/').filter(Boolean);
  const resource = segments[0];
  const id = segments[1];

  switch (resource) {
    case 'auth':
      return handleAuthRequest(segments.slice(1), method, body);

    case 'users':
      return handleUsersRequest(segments.slice(1), method, body);

    case 'graph':
      return handleGraphRequest(segments.slice(1));

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

    case 'ui-config':
      return handleUIConfigRequest(segments.slice(1));

    case 'memory':
      return handleMemoryRequest(segments.slice(1), id);

    case 'search':
      return handleSearchRequest(segments.slice(1));

    case 'organizations':
      return handleOrganizationRequest(segments.slice(1), id, method, body);

    case 'projects':
      return handleProjectRequest(segments.slice(1), id, method, body);

    case 'dashboard':
      return handleDashboardRequest(segments.slice(1));

    case 'connectors':
      return handleConnectorRequest(segments.slice(1), id);

    case 'entities':
      return handleEntitiesRequest(segments.slice(1), id);

    case 'graphrag':
      return handleGraphRAGRequest(segments.slice(1), method);

    case 'settings':
      return handleSettingsRequest(segments.slice(1));

    case 'cms':
      return handleCMSRequest(segments.slice(1));

    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
}

// ============================================================================
// Authentication Handlers
// ============================================================================

function handleAuthRequest(segments: string[], method: string, body?: unknown): unknown {
  const action = segments[0];

  switch (action) {
    case 'register': {
      if (method !== 'POST') throw new Error('Method not allowed');
      const { email, password, name, organizationName } = body as { email: string; password: string; name: string; organizationName?: string };
      
      // Check if email exists
      if (users.find(u => u.email === email)) {
        throw new Error('Email already exists');
      }

      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
          theme: 'dark',
          defaultView: 'engineer',
          notifications: {
            driftAlerts: 'digest',
            policyViolations: 'digest',
            connectorSync: true,
            emailDigest: 'weekly',
          },
        },
      };

      users.push(newUser);
      currentUser = newUser;
      isAuthenticated = true;

      // Create organization if provided
      if (organizationName) {
        const newOrg = {
          id: `org-${Date.now()}`,
          name: organizationName,
          slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
          plan: 'free',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          settings: {
            allowPublicProjects: false,
            requireApprovalForConnectors: false,
            defaultProjectRole: 'owner',
            ssoEnabled: false,
            auditLogRetentionDays: 30,
          },
          limits: {
            maxProjects: 3,
            maxUsers: 1,
            maxConnectorsPerProject: 3,
            storageGB: 10,
          },
        };
        organizations.push(newOrg as typeof organizations[0]);
      }

      return {
        user: newUser,
        tokens: {
          accessToken: `mock-access-token-${newUser.id}`,
          refreshToken: `mock-refresh-token-${newUser.id}`,
          expiresIn: 3600,
          tokenType: 'Bearer',
        },
      };
    }

    case 'login': {
      if (method !== 'POST') throw new Error('Method not allowed');
      const { email, password } = body as { email: string; password: string };
      
      // Simple mock authentication - accept any password for demo users
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      currentUser = user;
      isAuthenticated = true;

      return {
        user,
        tokens: {
          accessToken: `mock-access-token-${user.id}`,
          refreshToken: `mock-refresh-token-${user.id}`,
          expiresIn: 3600,
          tokenType: 'Bearer',
        },
      };
    }

    case 'logout': {
      if (method !== 'POST') throw new Error('Method not allowed');
      isAuthenticated = false;
      currentUser = null;
      return null;
    }

    case 'refresh': {
      if (method !== 'POST') throw new Error('Method not allowed');
      const { refreshToken } = body as { refreshToken: string };
      
      if (!refreshToken.includes('mock-refresh-token')) {
        throw new Error('Invalid refresh token');
      }

      return {
        accessToken: `mock-access-token-refreshed-${Date.now()}`,
        expiresIn: 3600,
        tokenType: 'Bearer',
      };
    }

    case 'forgot-password':
    case 'reset-password':
    case 'verify-email':
      // Mock success for password/verification flows
      return null;

    default:
      throw new Error(`Unknown auth endpoint: ${action}`);
  }
}

// ============================================================================
// Users Handlers
// ============================================================================

function handleUsersRequest(segments: string[], method: string, body?: unknown): unknown {
  const subResource = segments[0];

  if (subResource === 'me') {
    const nextSegment = segments[1];

    switch (nextSegment) {
      case undefined:
        // GET /users/me
        if (method === 'GET') {
          if (!currentUser) throw new Error('Unauthorized');
          return currentUser;
        }
        // PATCH /users/me
        if (method === 'PATCH') {
          if (!currentUser) throw new Error('Unauthorized');
          const updates = body as Partial<User>;
          currentUser = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
          return currentUser;
        }
        break;

      case 'password':
        // PUT /users/me/password
        if (method === 'PUT') {
          // Mock password change - always succeeds
          return null;
        }
        break;

      case 'preferences':
        // GET /users/me/preferences
        if (method === 'GET') {
          if (!currentUser) throw new Error('Unauthorized');
          return currentUser.preferences;
        }
        // PUT /users/me/preferences
        if (method === 'PUT') {
          if (!currentUser) throw new Error('Unauthorized');
          const prefsUpdate = body as Partial<UserPreferences>;
          currentUser.preferences = { 
            ...currentUser.preferences, 
            ...prefsUpdate,
            theme: prefsUpdate.theme || currentUser.preferences?.theme || 'dark',
            defaultView: prefsUpdate.defaultView || currentUser.preferences?.defaultView || 'engineer',
            notifications: { 
              ...currentUser.preferences?.notifications,
              ...prefsUpdate.notifications 
            } as NotificationPreferences
          };
          return currentUser.preferences;
        }
        break;

      case 'sessions':
        // GET /users/me/sessions
        if (method === 'GET') {
          return Array.from(sessions.entries()).map(([id, session]) => ({
            id,
            ...session,
            isCurrent: id === 'current',
          }));
        }
        break;

      case 'organizations':
        // GET /users/me/organizations
        if (method === 'GET') {
          return organizations.map(org => ({
            ...org,
            stats: {
              totalProjects: projects.filter(p => p.organizationId === org.id).length,
              totalMembers: mockOrganizationMembers.filter(m => m.organizationId === org.id).length,
              totalTeams: teams.filter(t => t.organizationId === org.id).length,
            },
          }));
        }
        break;

      case 'projects':
        // GET /users/me/projects
        if (method === 'GET') {
          return projects;
        }
        break;

      case 'invitations':
        // GET /users/me/invitations
        if (method === 'GET') {
          return [];
        }
        break;

      default:
        // /users/me/sessions/{sessionId}
        if (segments[1] === 'sessions' && segments[2]) {
          if (method === 'DELETE') {
            sessions.delete(segments[2]);
            return null;
          }
        }
        // Default - return current user
        if (!currentUser) throw new Error('Unauthorized');
        return currentUser;
    }
  }

  if (!currentUser) throw new Error('Unauthorized');
  return currentUser;
}

// ============================================================================
// Domain Handlers - Each follows Single Responsibility Principle
// ============================================================================

function handleGraphRequest(segments: string[]): unknown {
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
      const actionType = segments[1];
      switch (actionType) {
        case 'analysis':
          return mockData.ui.analysisActions;
        case 'drift':
          return mockData.ui.driftActions;
        default:
          return mockData.ui.analysisActions;
      }

    default:
      return mockData.ui;
  }
}

// Handle ui-config endpoints from OpenAPI spec
function handleUIConfigRequest(segments: string[]): unknown {
  const subResource = segments[0];

  switch (subResource) {
    case 'lens':
      return mockData.ui.lensConfig;

    case 'legend':
      return mockData.ui.legendItems;

    case 'actions':
      const actionType = segments[1];
      switch (actionType) {
        case 'analysis':
          return mockData.ui.analysisActions;
        case 'drift':
          return mockData.ui.driftActions;
        default:
          return mockData.ui.analysisActions;
      }

    case 'preferences':
      return { data: getPreferenceOptions() };

    case 'dashboard-views':
      return { data: getDashboardViewConfigs() };

    default:
      return mockData.ui;
  }
}

function getPreferenceOptions() {
  return {
    themes: [
      { value: 'dark', label: 'Dark', icon: 'Moon' },
      { value: 'light', label: 'Light', icon: 'Sun' },
      { value: 'system', label: 'System', icon: 'Monitor' },
    ],
    languages: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
      { value: 'fr', label: 'Français' },
      { value: 'de', label: 'Deutsch' },
      { value: 'ja', label: '日本語' },
    ],
    timezones: [
      { value: 'UTC', label: 'UTC' },
      { value: 'America/New_York', label: 'Eastern Time (ET)' },
      { value: 'America/Chicago', label: 'Central Time (CT)' },
      { value: 'America/Denver', label: 'Mountain Time (MT)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
      { value: 'Europe/London', label: 'London (GMT)' },
      { value: 'Europe/Paris', label: 'Paris (CET)' },
      { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
      { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    ],
    notificationFrequencies: [
      { value: 'immediate', label: 'Immediate' },
      { value: 'digest', label: 'Daily Digest' },
      { value: 'weekly', label: 'Weekly Summary' },
      { value: 'none', label: 'None' },
    ],
    dashboardViews: [
      { value: 'engineer', label: 'Engineer', description: 'Code-level details and implementation', icon: 'Code' },
      { value: 'architect', label: 'Architect', description: 'System design and component relationships', icon: 'GitBranch' },
      { value: 'executive', label: 'Executive', description: 'High-level metrics and health scores', icon: 'BarChart3' },
      { value: 'security', label: 'Security', description: 'Security posture and compliance', icon: 'Shield' },
      { value: 'product', label: 'Product', description: 'Product management and roadmaps', icon: 'Target' },
    ],
  };
}

function getDashboardViewConfigs() {
  return [
    {
      id: 'executive',
      label: 'Executive',
      description: 'High-level metrics and health scores for leadership',
      icon: 'BarChart3',
      requiredPermission: null,
      isDefault: false,
    },
    {
      id: 'architect',
      label: 'Architect',
      description: 'System design and component relationships',
      icon: 'GitBranch',
      requiredPermission: null,
      isDefault: true,
    },
    {
      id: 'security',
      label: 'Security',
      description: 'Security posture and compliance overview',
      icon: 'Shield',
      requiredPermission: null,
      isDefault: false,
    },
    {
      id: 'engineer',
      label: 'Engineer',
      description: 'Code-level details and implementation',
      icon: 'Code',
      requiredPermission: null,
      isDefault: false,
    },
    {
      id: 'product',
      label: 'Product',
      description: 'Product management and roadmap alignment',
      icon: 'Target',
      requiredPermission: null,
      isDefault: false,
    },
  ];
}

function handleSettingsRequest(segments: string[]): unknown {
  const subResource = segments[0];

  if (subResource === 'defaults') {
    return { data: getDefaultSettings() };
  }

  throw new Error(`Unknown settings endpoint: ${subResource}`);
}

function getDefaultSettings() {
  return {
    llm: {
      provider: 'ollama',
      baseUrl: 'http://localhost:11434',
      model: 'codellama:13b',
      temperature: 0.7,
      maxTokens: 2048,
      providers: [
        { id: 'ollama', name: 'Ollama (Local)', requiresApiKey: false },
        { id: 'openai', name: 'OpenAI', requiresApiKey: true },
        { id: 'anthropic', name: 'Anthropic', requiresApiKey: true },
        { id: 'azure', name: 'Azure OpenAI', requiresApiKey: true },
        { id: 'custom', name: 'Custom Endpoint', requiresApiKey: false },
      ],
    },
    api: {
      baseUrl: '/api/v1',
      timeout: 30000,
      enableMock: true,
      retryAttempts: 3,
    },
    graph: {
      defaultLayout: 'dagre',
      maxNodes: 1000,
      layouts: [
        { id: 'dagre', name: 'Hierarchical (Dagre)' },
        { id: 'force', name: 'Force-Directed' },
        { id: 'circular', name: 'Circular' },
        { id: 'grid', name: 'Grid' },
        { id: 'concentric', name: 'Concentric' },
      ],
    },
    features: {
      driftDetection: true,
      policyEngine: true,
      ragSearch: true,
      memoryInterface: true,
    },
  };
}

function handleCMSRequest(segments: string[]): unknown {
  const subResource = segments[0];

  if (subResource === 'landing') {
    return { data: getLandingContent() };
  }

  throw new Error(`Unknown CMS endpoint: ${subResource}`);
}

function getLandingContent() {
  return {
    features: [
      {
        id: 'knowledge-graph',
        title: 'Knowledge Graph',
        description: 'Understand your architecture through an interconnected graph of code, documentation, and infrastructure.',
        icon: 'Network',
      },
      {
        id: 'drift-detection',
        title: 'Drift Detection',
        description: 'Automatically detect when implementation drifts from documented architecture and intent.',
        icon: 'AlertTriangle',
      },
      {
        id: 'policy-engine',
        title: 'Policy Engine',
        description: 'Enforce architectural policies as code with automatic validation and compliance reporting.',
        icon: 'Shield',
      },
      {
        id: 'rag-interface',
        title: 'RAG Interface',
        description: 'Ask questions about your architecture in natural language and get evidence-based answers.',
        icon: 'MessageSquare',
      },
      {
        id: 'team-alignment',
        title: 'Team Alignment',
        description: 'Map teams to code ownership and track alignment between organization and architecture.',
        icon: 'Users',
      },
      {
        id: 'multi-tenant',
        title: 'Multi-Tenant',
        description: 'Organize work across organizations and projects with role-based access control.',
        icon: 'Building2',
      },
    ],
    pricingTiers: [
      {
        id: 'free',
        name: 'Free',
        description: 'Perfect for individuals and small teams',
        price: null,
        priceUnit: null,
        popular: false,
        features: [
          'Up to 3 projects',
          '5 team members',
          'Basic drift detection',
          'Community support',
        ],
        cta: {
          text: 'Get Started',
          href: '/signup',
          variant: 'secondary',
        },
      },
      {
        id: 'team',
        name: 'Team',
        description: 'For growing engineering teams',
        price: 49,
        priceUnit: '/user/month',
        popular: true,
        features: [
          'Unlimited projects',
          'Unlimited team members',
          'Advanced drift detection',
          'Custom policies',
          'Priority support',
          'SSO integration',
        ],
        cta: {
          text: 'Start Free Trial',
          href: '/signup?plan=team',
          variant: 'primary',
        },
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        price: null,
        priceUnit: 'Custom pricing',
        popular: false,
        features: [
          'Everything in Team',
          'Self-hosted option',
          'Custom connectors',
          'Dedicated support',
          'SLA guarantees',
          'Audit logs',
        ],
        cta: {
          text: 'Contact Sales',
          href: '/contact',
          variant: 'secondary',
        },
      },
    ],
    faq: [
      {
        question: 'What is Substrate?',
        answer: 'Substrate is a multi-modal knowledge graph platform that helps engineering teams understand, govern, and maintain their software architecture.',
      },
      {
        question: 'How does drift detection work?',
        answer: 'Drift detection continuously compares your actual implementation (from code analysis) against your documented architecture (from ADRs, RFCs, etc.) and alerts you when they diverge.',
      },
      {
        question: 'Can I self-host Substrate?',
        answer: 'Yes! Our Enterprise plan includes a self-hosted option for organizations with strict data residency requirements.',
      },
      {
        question: 'What connectors are supported?',
        answer: 'We support GitHub, GitLab, Jira, Confluence, Slack, and many more. You can also build custom connectors using our SDK.',
      },
      {
        question: 'Is there a free trial?',
        answer: 'Yes, all paid plans include a 14-day free trial with no credit card required.',
      },
    ],
    trustBadges: {
      companies: ['Google', 'Microsoft', 'Amazon', 'Netflix', 'Spotify'],
      certifications: ['SOC 2', 'GDPR', 'ISO 27001'],
    },
  };
}

function handleMemoryRequest(segments: string[], id?: string): unknown {
  const subResource = segments[0];

  if (subResource === 'audit') {
    if (id) {
      const item = mockData.memory.auditItems.find(a => a.id === id);
      if (!item) throw new Error(`Audit item not found: ${id}`);
      return { data: item };
    }
    return { data: mockData.memory.auditItems };
  }

  if (subResource === 'stats') {
    return { data: mockData.memory.stats };
  }

  return {
    data: {
      stats: mockData.memory.stats,
      auditItems: mockData.memory.auditItems,
    },
  };
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

// ============================================================================
// Tenant Handlers (Updated with CRUD)
// ============================================================================

function handleOrganizationRequest(segments: string[], id?: string, method?: string, body?: unknown): unknown {
  if (id) {
    const orgIndex = organizations.findIndex(o => o.id === id);
    if (orgIndex === -1) throw new Error(`Organization not found: ${id}`);

    const subResource = segments[1];

    // Handle /organizations/{id}/members
    if (subResource === 'members') {
      const memberId = segments[2];
      
      if (memberId) {
        // Update or delete member
        if (method === 'PATCH') {
          return null; // Mock success
        }
        if (method === 'DELETE') {
          return null; // Mock success
        }
      }
      
      // List members or invite
      if (method === 'POST') {
        return null; // Mock invite success
      }
      return mockOrganizationMembers.filter(m => m.organizationId === id);
    }

    // Handle /organizations/{id}/teams
    if (subResource === 'teams') {
      const teamId = segments[2];
      
      if (teamId) {
        const teamIndex = teams.findIndex(t => t.id === teamId && t.organizationId === id);
        if (teamIndex === -1) throw new Error(`Team not found: ${teamId}`);
        
        const teamSubResource = segments[3];
        
        // Handle team members
        if (teamSubResource === 'members') {
          const teamMemberId = segments[4];
          if (teamMemberId && method === 'DELETE') {
            return null; // Mock remove success
          }
          if (method === 'POST') {
            return null; // Mock add success
          }
          // Return mock team members
          return [];
        }
        
        // GET, PATCH, DELETE team
        if (method === 'GET') {
          const team = teams[teamIndex]!;
          return {
            ...team,
            lead: team.leadId ? mockUsers.find(u => u.id === team.leadId) || null : null,
          };
        }
        if (method === 'PATCH') {
          const updates = body as Partial<Team>;
          const existingTeam = teams[teamIndex]!;
          teams[teamIndex] = { ...existingTeam, ...updates, updatedAt: new Date().toISOString() };
          return teams[teamIndex];
        }
        if (method === 'DELETE') {
          teams = teams.filter(t => t.id !== teamId);
          return null;
        }
      }
      
      // List teams or create
      if (method === 'POST') {
        const createReq = body as { name: string; description?: string; color?: string; leadUserId?: string };
        const newTeam: Team = {
          id: `team-${Date.now()}`,
          organizationId: id,
          name: createReq.name,
          description: createReq.description || null,
          color: createReq.color || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          memberCount: 0,
          leadId: createReq.leadUserId || null,
        };
        teams.push(newTeam);
        return newTeam;
      }
      
      // Return teams for this organization
      return teams
        .filter(t => t.organizationId === id)
        .map(t => ({
          ...t,
          lead: t.leadId ? mockUsers.find(u => u.id === t.leadId) || null : null,
        }));
    }

    // GET, PATCH, DELETE organization
    if (method === 'GET') {
      const org = organizations[orgIndex];
      return {
        ...org,
        stats: {
          totalProjects: projects.filter(p => p.organizationId === id).length,
          totalMembers: mockOrganizationMembers.filter(m => m.organizationId === id).length,
          totalTeams: teams.filter(t => t.organizationId === id).length,
        },
      };
    }
    if (method === 'PATCH') {
      const updates = body as Partial<typeof organizations[0]>;
      const existingOrg = organizations[orgIndex]!;
      organizations[orgIndex] = { ...existingOrg, ...updates, updatedAt: new Date().toISOString() };
      return organizations[orgIndex];
    }
    if (method === 'DELETE') {
      organizations = organizations.filter(o => o.id !== id);
      return null;
    }
  }

  // Create organization
  if (method === 'POST') {
    const createReq = body as { name: string; slug?: string; description?: string };
    const newOrg = {
      id: `org-${Date.now()}`,
      name: createReq.name,
      slug: createReq.slug || createReq.name.toLowerCase().replace(/\s+/g, '-'),
      description: createReq.description,
      plan: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        allowPublicProjects: false,
        requireApprovalForConnectors: false,
        defaultProjectRole: 'owner',
        ssoEnabled: false,
        auditLogRetentionDays: 30,
      },
      limits: {
        maxProjects: 3,
        maxUsers: 1,
        maxConnectorsPerProject: 3,
        storageGB: 10,
      },
    };
    organizations.push(newOrg as typeof organizations[0]);
    return newOrg;
  }

  // List organizations
  return {
    data: organizations.map(org => ({
      ...org,
      stats: {
        totalProjects: projects.filter(p => p.organizationId === org.id).length,
        totalMembers: mockOrganizationMembers.filter(m => m.organizationId === org.id).length,
        totalTeams: teams.filter(t => t.organizationId === org.id).length,
      },
    })),
    meta: {
      page: 1,
      perPage: organizations.length,
      total: organizations.length,
      totalPages: 1,
    },
  };
}

function handleProjectRequest(segments: string[], id?: string, method?: string, body?: unknown): unknown {
  if (id) {
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex === -1) throw new Error(`Project not found: ${id}`);

    const subResource = segments[1];

    switch (subResource) {
      case 'members': {
        const memberId = segments[2];
        {
          if (memberId) {
            if (method === 'PATCH') {
              return null; // Mock update success
            }
            if (method === 'DELETE') {
              return null; // Mock remove success
            }
          }
          if (method === 'POST') {
            return null; // Mock add success
          }
          return mockProjectMembers.filter(m => m.projectId === id);
        }
      }

      case 'invitations':
        return [];

      case 'activity':
        return mockActivity.filter(a => a.projectId === id);

      // Dashboard summaries
      case 'executive':
        return mockExecutiveSummary;

      case 'architect':
        return mockArchitectSummary;

      case 'security':
        return mockSecuritySummary;

      case 'archive':
        if (method === 'POST') {
          const existingProj = projects[projectIndex]!;
          projects[projectIndex] = { ...existingProj, status: 'archived' as const };
          return projects[projectIndex];
        }
        break;

      case 'restore':
        if (method === 'POST') {
          const existingProj = projects[projectIndex]!;
          projects[projectIndex] = { ...existingProj, status: 'active' as const };
          return projects[projectIndex];
        }
        break;

      default:
        // GET, PATCH, DELETE project
        if (method === 'GET') {
          return projects[projectIndex];
        }
        if (method === 'PATCH') {
          const updates = body as Partial<typeof projects[0]>;
          const existingProj = projects[projectIndex]!;
          projects[projectIndex] = { ...existingProj, ...updates, updatedAt: new Date().toISOString() };
          return projects[projectIndex];
        }
        if (method === 'DELETE') {
          projects = projects.filter(p => p.id !== id);
          return null;
        }
        return projects[projectIndex];
    }
  }

  // Create project
  if (method === 'POST') {
    const createReq = body as { name: string; organizationId: string; description?: string };
    const newProject = {
      id: `proj-${Date.now()}`,
      organizationId: createReq.organizationId,
      name: createReq.name,
      slug: createReq.name.toLowerCase().replace(/\s+/g, '-'),
      description: createReq.description,
      status: 'setup' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        visibility: 'private' as const,
        defaultBranch: 'main',
        autoSyncEnabled: true,
        syncIntervalMinutes: 60,
        alertThresholds: {
          criticalViolations: 1,
          highViolations: 5,
          driftPercentage: 10,
        },
      },
      stats: {
        totalNodes: 0,
        totalEdges: 0,
        policiesCount: 0,
        activeViolations: 0,
        healthScore: 100,
      },
    };
    projects.push(newProject);
    return newProject;
  }

  // List projects
  const params = new URLSearchParams(segments[0]?.includes('?') ? segments[0].split('?')[1] : '');
  const orgId = params.get('organizationId');
  const status = params.get('status');
  
  let filteredProjects = projects;
  if (orgId) {
    filteredProjects = filteredProjects.filter(p => p.organizationId === orgId);
  }
  if (status) {
    filteredProjects = filteredProjects.filter(p => p.status === status);
  }

  return {
    data: filteredProjects,
    meta: {
      page: 1,
      perPage: filteredProjects.length,
      total: filteredProjects.length,
      totalPages: 1,
    },
  };
}

function handleDashboardRequest(segments: string[]): unknown {
  const projectId = segments[0];
  const subResource = segments[1];

  switch (subResource) {
    case 'executive':
      return mockExecutiveSummary;

    case 'architect':
      return mockArchitectSummary;

    case 'security':
      return mockSecuritySummary;

    default:
      // Return full dashboard
      return {
        ...mockProjectDashboard,
        project: projects.find(p => p.id === projectId) || projects[0],
      };
  }
}

// ============================================================================
// Connector Handlers
// ============================================================================

function handleConnectorRequest(segments: string[], id?: string): unknown {
  const subResource = segments[0];

  // Marketplace routes
  if (subResource === 'marketplace') {
    const marketplaceSub = segments[1];

    switch (marketplaceSub) {
      case 'categories':
        return [
          { id: 'vcs', name: 'Version Control', description: 'Git repositories, pull requests, commits', icon: 'GitBranch' },
          { id: 'its', name: 'Issue Tracking', description: 'Tickets, epics, sprints', icon: 'Ticket' },
          { id: 'docs', name: 'Documentation', description: 'Wikis, docs, knowledge base', icon: 'FileText' },
          { id: 'comm', name: 'Communication', description: 'Slack, teams, discussions', icon: 'MessageSquare' },
          { id: 'security', name: 'Security', description: 'Vulnerability scanning, compliance', icon: 'Shield' },
        ];

      case 'templates':
        return mockConnectorTemplates;

      default:
        // Return marketplace items
        if (marketplaceSub && marketplaceSub !== 'search') {
          const def = mockConnectorDefinitions.find(d => d.id === marketplaceSub);
          if (!def) throw new Error(`Connector not found: ${marketplaceSub}`);
          return def;
        }
        return getMockMarketplaceItems();
    }
  }

  // Installed connector routes
  if (id) {
    const connector = mockInstalledConnectors.find(c => c.id === id);
    if (!connector) throw new Error(`Connector not found: ${id}`);

    const connectorSub = segments[1];

    switch (connectorSub) {
      case 'health':
        return {
          connectorId: id,
          status: connector.status === 'error' ? 'unhealthy' : 'healthy',
          lastCheckAt: new Date().toISOString(),
          checks: [
            {
              name: 'Authentication',
              status: connector.status === 'error' ? 'fail' : 'pass',
              message: connector.statusMessage,
            },
            {
              name: 'API Connectivity',
              status: connector.status === 'error' ? 'fail' : 'pass',
              responseTime: 150,
            },
          ],
        };

      case 'sync':
        return {
          id: `sync-${Date.now()}`,
          connectorId: id,
          status: 'completed',
          startedAt: new Date(Date.now() - 30000).toISOString(),
          completedAt: new Date().toISOString(),
          progress: {
            phase: 'completed',
            percent: 100,
            entitiesProcessed: connector.stats?.entitiesTotal || 0,
            entitiesTotal: connector.stats?.entitiesTotal || 0,
          },
          results: {
            entitiesCreated: 0,
            entitiesUpdated: 0,
            entitiesDeleted: 0,
            relationshipsCreated: 0,
            errors: [],
          },
        };

      default:
        return connector;
    }
  }

  // List installed connectors
  return mockInstalledConnectors;
}

// ============================================================================
// Target API Handlers
// ============================================================================

function handleEntitiesRequest(segments: string[], id?: string): unknown {
  if (id) {
    const node = mockData.graph.nodes.find(n => n.id === id);
    if (!node) throw new Error(`Entity not found: ${id}`);

    return {
      id: node.id,
      name: node.label,
      type: node.type.toLowerCase(),
      metadata: node.metadata,
    };
  }

  // List all entities flattened from graph nodes
  const entities = mockData.graph.nodes.map(node => ({
    id: node.id,
    name: node.label,
    type: node.type.toLowerCase(),
    metadata: node.metadata,
  }));

  return {
    data: entities,
    total: entities.length,
    page: 1,
    limit: entities.length,
  };
}

function handleGraphRAGRequest(segments: string[], method: string): unknown {
  const subResource = segments[0];

  if (subResource === 'query' && method === 'POST') {
    return {
      answer: "Based on the analysis of the knowledge graph, I have identified potential discrepancies in the 'Checkout Service' module. It appears to have a direct dependency on 'Payment Gateway' which contradicts the architectural intent defined in ADR-001. This suggests a drift violation that should be addressed.",
      confidence: 0.89,
      sources: [
        {
          id: "ev-001",
          type: "graph",
          label: "Checkout -> Payment Dependency",
          confidence: 0.95
        },
        {
          id: "ev-002",
          type: "adr",
          label: "ADR-001: Payment Isolation",
          confidence: 0.99
        }
      ],
      suggestedFollowup: [
        "Show dependency graph for Checkout Service",
        "Generate drift report"
      ]
    };
  }

  throw new Error(`Unknown GraphRAG endpoint: ${subResource}`);
}

// ============================================================================
// State Management Helpers
// ============================================================================

export function getMockAuthState() {
  return {
    isAuthenticated,
    currentUser,
    users,
    organizations,
    projects,
    teams,
  };
}

export function setMockAuthState(state: {
  isAuthenticated?: boolean;
  currentUser?: User | null;
}) {
  if (state.isAuthenticated !== undefined) isAuthenticated = state.isAuthenticated;
  if (state.currentUser !== undefined) currentUser = state.currentUser;
}

export function resetMockData() {
  currentUser = mockCurrentUser;
  users = [...mockUsers];
  organizations = [...mockOrganizations];
  projects = [...mockProjects];
  teams = [...mockTeams];
  isAuthenticated = false;
  sessions.clear();
}

// Initialize the mock provider

// Note: This is called by the API setup module
export function initializeMockProvider(): void {
  // Dynamic import to avoid circular dependency
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { apiClient } = require('../client');
  apiClient.setMockProvider(mockProvider);
}
