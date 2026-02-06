/**
 * Tenant Mock Data
 * Mock data for Organizations, Projects, Users, and Activity
 */

import type {
  Organization,
  Project,
  User,
  ProjectMember,
  OrganizationMember,
  ProjectActivity,
  ProjectDashboard,
  ExecutiveSummary,
  ArchitectSummary,
  SecuritySummary,
} from '@/types';

// ============================================================================
// Mock Users
// ============================================================================

export const mockCurrentUser: User = {
  id: 'user-1',
  email: 'john.doe@acme-corp.com',
  name: 'John Doe',
  avatar: undefined,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-06-01T14:30:00Z',
  preferences: {
    theme: 'dark',
    defaultView: 'engineer',
    notifications: {
      driftAlerts: 'immediate',
      policyViolations: 'digest',
      connectorSync: true,
      emailDigest: 'weekly',
    },
  },
};

// ============================================================================
// Mock Organizations
// ============================================================================

export const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    description: 'Primary organization for Acme Corporation',
    plan: 'enterprise',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    settings: {
      allowPublicProjects: false,
      requireApprovalForConnectors: true,
      defaultProjectRole: 'engineer',
      ssoEnabled: true,
      auditLogRetentionDays: 365,
    },
    limits: {
      maxProjects: 50,
      maxUsers: 100,
      maxConnectorsPerProject: 10,
      storageGB: 500,
    },
  },
  {
    id: 'org-2',
    name: 'Personal Workspace',
    slug: 'personal',
    description: 'Personal projects and experiments',
    plan: 'free',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    settings: {
      allowPublicProjects: true,
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
  },
];

// ============================================================================
// Mock Projects
// ============================================================================

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    organizationId: 'org-1',
    name: 'Payment Platform',
    slug: 'payment-platform',
    description: 'Core payment processing system with PCI compliance',
    status: 'active',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-06-15T08:30:00Z',
    settings: {
      visibility: 'private',
      defaultBranch: 'main',
      autoSyncEnabled: true,
      syncIntervalMinutes: 15,
      alertThresholds: {
        criticalViolations: 1,
        highViolations: 5,
        driftPercentage: 10,
      },
    },
    stats: {
      totalNodes: 247,
      totalEdges: 892,
      policiesCount: 12,
      activeViolations: 3,
      lastSyncAt: '2024-06-15T08:30:00Z',
      healthScore: 87,
    },
  },
  {
    id: 'proj-2',
    organizationId: 'org-1',
    name: 'Customer Portal',
    slug: 'customer-portal',
    description: 'Customer-facing web portal and mobile API',
    status: 'active',
    createdAt: '2024-02-10T14:00:00Z',
    updatedAt: '2024-06-14T16:45:00Z',
    settings: {
      visibility: 'organization',
      defaultBranch: 'main',
      autoSyncEnabled: true,
      syncIntervalMinutes: 30,
      alertThresholds: {
        criticalViolations: 2,
        highViolations: 10,
        driftPercentage: 15,
      },
    },
    stats: {
      totalNodes: 156,
      totalEdges: 423,
      policiesCount: 8,
      activeViolations: 0,
      lastSyncAt: '2024-06-14T16:45:00Z',
      healthScore: 94,
    },
  },
  {
    id: 'proj-3',
    organizationId: 'org-1',
    name: 'Data Pipeline',
    slug: 'data-pipeline',
    description: 'ETL pipeline for analytics and reporting',
    status: 'setup',
    createdAt: '2024-06-10T09:00:00Z',
    updatedAt: '2024-06-10T09:00:00Z',
    settings: {
      visibility: 'private',
      defaultBranch: 'main',
      autoSyncEnabled: false,
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
      healthScore: 0,
    },
  },
  {
    id: 'proj-4',
    organizationId: 'org-2',
    name: 'My Side Project',
    slug: 'side-project',
    description: 'Personal learning and experimentation',
    status: 'active',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-06-01T12:00:00Z',
    settings: {
      visibility: 'private',
      defaultBranch: 'main',
      autoSyncEnabled: true,
      syncIntervalMinutes: 60,
      alertThresholds: {
        criticalViolations: 5,
        highViolations: 20,
        driftPercentage: 30,
      },
    },
    stats: {
      totalNodes: 42,
      totalEdges: 89,
      policiesCount: 3,
      activeViolations: 1,
      lastSyncAt: '2024-06-01T12:00:00Z',
      healthScore: 76,
    },
  },
];

// ============================================================================
// Mock Members
// ============================================================================

export const mockProjectMembers: ProjectMember[] = [
  {
    id: 'member-1',
    userId: 'user-1',
    projectId: 'proj-1',
    role: 'owner',
    joinedAt: '2024-01-20T10:00:00Z',
    invitedBy: undefined,
    permissions: [],
  },
  {
    id: 'member-2',
    userId: 'user-2',
    projectId: 'proj-1',
    role: 'engineer',
    joinedAt: '2024-02-01T09:00:00Z',
    invitedBy: 'user-1',
    permissions: [],
  },
  {
    id: 'member-3',
    userId: 'user-3',
    projectId: 'proj-1',
    role: 'security',
    joinedAt: '2024-02-15T11:00:00Z',
    invitedBy: 'user-1',
    permissions: [],
  },
];

export const mockOrganizationMembers: OrganizationMember[] = [
  {
    id: 'org-member-1',
    userId: 'user-1',
    organizationId: 'org-1',
    role: 'owner',
    joinedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'org-member-2',
    userId: 'user-2',
    organizationId: 'org-1',
    role: 'admin',
    joinedAt: '2023-06-15T10:00:00Z',
  },
];

// ============================================================================
// Mock Activity
// ============================================================================

export const mockActivity: ProjectActivity[] = [
  {
    id: 'act-1',
    projectId: 'proj-1',
    organizationId: 'org-1',
    type: 'connector.synced',
    actor: {
      userId: 'user-1',
      name: 'John Doe',
    },
    target: {
      type: 'Connector',
      id: 'conn-1',
      name: 'GitHub',
    },
    severity: 'info',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
  },
  {
    id: 'act-2',
    projectId: 'proj-1',
    organizationId: 'org-1',
    type: 'policy.violation_detected',
    actor: {
      userId: 'system',
      name: 'System',
    },
    target: {
      type: 'Policy',
      id: 'policy-1',
      name: 'API Authentication Required',
    },
    metadata: {
      violationCount: 3,
    },
    severity: 'warning',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
  },
  {
    id: 'act-3',
    projectId: 'proj-1',
    organizationId: 'org-1',
    type: 'member.invited',
    actor: {
      userId: 'user-1',
      name: 'John Doe',
    },
    target: {
      type: 'User',
      id: 'user-4',
      name: 'Jane Smith',
    },
    severity: 'info',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'act-4',
    projectId: 'proj-1',
    organizationId: 'org-1',
    type: 'graph.synced',
    actor: {
      userId: 'system',
      name: 'System',
    },
    metadata: {
      entitiesProcessed: 247,
      relationshipsCreated: 892,
    },
    severity: 'info',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
  },
  {
    id: 'act-5',
    projectId: 'proj-1',
    organizationId: 'org-1',
    type: 'drift.detected',
    actor: {
      userId: 'system',
      name: 'System',
    },
    target: {
      type: 'Service',
      id: 'svc-1',
      name: 'payment-gateway',
    },
    severity: 'critical',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
  },
  {
    id: 'act-6',
    projectId: 'proj-1',
    organizationId: 'org-1',
    type: 'connector.installed',
    actor: {
      userId: 'user-1',
      name: 'John Doe',
    },
    target: {
      type: 'Connector',
      id: 'conn-2',
      name: 'Jira',
    },
    severity: 'info',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

// ============================================================================
// Mock Dashboard Data
// ============================================================================

export const mockExecutiveSummary: ExecutiveSummary = {
  overallHealth: {
    score: 87,
    trend: 'improving',
    summary: 'System health is improving with 3 new policies enforced this week',
  },
  keyMetrics: [
    { label: 'Components', value: 247, change: 12, trend: 'up' },
    { label: 'Dependencies', value: 892, change: 5, trend: 'up' },
    { label: 'Active Policies', value: 12, change: 3, trend: 'up' },
    { label: 'Tech Debt Items', value: 23, change: -8, trend: 'down' },
  ],
  criticalIssues: [
    {
      id: 'issue-1',
      title: 'Undocumented dependency between payment-service and external API',
      severity: 'high',
      type: 'architectural_drift',
      affectedComponents: 3,
    },
    {
      id: 'issue-2',
      title: 'PII data crossing region boundaries without encryption',
      severity: 'critical',
      type: 'security_compliance',
      affectedComponents: 1,
    },
  ],
  complianceStatus: {
    overall: 94,
    byFramework: {
      'SOC 2': 96,
      'PCI DSS': 91,
      'GDPR': 95,
    },
    lastAudited: '2024-06-01T00:00:00Z',
  },
};

export const mockArchitectSummary: ArchitectSummary = {
  systemHealth: {
    coupling: 0.32,
    cohesion: 0.78,
    complexity: 4.2,
  },
  topViolations: [
    {
      id: 'viol-1',
      policy: 'ADR-022: No direct database access from frontend',
      description: 'Frontend service accessing database directly instead of through API',
      severity: 'High',
      location: 'src/services/DatabaseClient.ts:45',
    },
    {
      id: 'viol-2',
      policy: 'ADR-015: All services must have health checks',
      description: 'Missing health check endpoint for notification-service',
      severity: 'Medium',
      location: 'services/notification/',
    },
  ],
  dependencies: {
    internal: 142,
    external: 28,
    deprecated: 3,
  },
  modularityScore: 78,
  documentationCoverage: 65,
};

export const mockSecuritySummary: SecuritySummary = {
  securityScore: 91,
  vulnerabilities: {
    critical: 0,
    high: 2,
    medium: 5,
    low: 12,
  },
  dataFlowBoundaries: {
    total: 24,
    withPii: 8,
    crossRegion: 3,
    nonCompliant: 1,
  },
  aiGeneratedCode: {
    totalFiles: 47,
    auditedPercentage: 68,
    highRiskFiles: 3,
  },
  complianceGaps: [
    {
      framework: 'PCI DSS',
      gap: 3,
      items: ['Requirement 3.4', 'Requirement 8.2', 'Requirement 10.1'],
    },
  ],
};

export const mockProjectDashboard: ProjectDashboard = {
  project: mockProjects[0]!,
  view: 'engineer',
  executive: mockExecutiveSummary,
  architect: mockArchitectSummary,
  security: mockSecuritySummary,
  recentActivity: mockActivity,
  widgets: [],
};
