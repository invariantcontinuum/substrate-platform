/**
 * Connector Mock Data
 * Mock data for Connector Marketplace and Installed Connectors
 */

import type {
  ConnectorDefinition,
  ConnectorMarketplaceItem,
  InstalledConnector,
  ConnectorTemplate,
} from '@/types';

// ============================================================================
// Mock Connector Definitions (Marketplace)
// ============================================================================

export const mockConnectorDefinitions: ConnectorDefinition[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sync repositories, pull requests, issues, and code metadata from GitHub',
    category: 'vcs',
    version: '2.1.0',
    icon: 'GitBranch',
    publisher: {
      name: 'Substrate',
      verified: true,
    },
    capabilities: [
      {
        type: 'entities',
        entityTypes: ['Repository', 'PullRequest', 'Issue', 'Commit', 'Branch'],
        description: 'Sync GitHub repositories and code metadata',
      },
      {
        type: 'relationships',
        entityTypes: ['depends_on', 'references', 'merged_from'],
        description: 'Map code dependencies and relationships',
      },
    ],
    auth: {
      type: 'token',
      required: true,
      scopes: ['repo', 'read:org'],
      configSchema: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            title: 'Personal Access Token',
            description: 'GitHub personal access token with repo scope',
            format: 'password',
            sensitive: true,
          },
        },
        required: ['token'],
      },
    },
    configSchema: {
      type: 'object',
      properties: {
        organizations: {
          type: 'array',
          title: 'Organizations',
          description: 'GitHub organizations to sync',
          items: {
            type: 'string',
          },
        },
        repositories: {
          type: 'array',
          title: 'Repositories',
          description: 'Specific repositories to sync (leave empty for all)',
          items: {
            type: 'string',
          },
        },
        includeForks: {
          type: 'boolean',
          title: 'Include Forks',
          description: 'Include forked repositories',
          default: false,
        },
        includeArchived: {
          type: 'boolean',
          title: 'Include Archived',
          description: 'Include archived repositories',
          default: false,
        },
      },
    },
    sync: {
      supportsRealtime: true,
      supportsWebhook: true,
      defaultIntervalMinutes: 15,
      minIntervalMinutes: 5,
      maxIntervalMinutes: 1440,
    },
    tags: ['vcs', 'git', 'source-control', 'popular'],
    documentationUrl: 'https://docs.substrate.io/connectors/github',
    installCount: 1250,
    rating: 4.8,
    reviewCount: 142,
    changelog: [
      {
        version: '2.1.0',
        date: '2024-06-01',
        changes: ['Added webhook support for real-time sync', 'Improved rate limit handling'],
        breaking: false,
      },
      {
        version: '2.0.0',
        date: '2024-03-15',
        changes: ['New entity model', 'Updated auth flow'],
        breaking: true,
      },
    ],
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Sync tickets, epics, sprints, and project metadata from Jira',
    category: 'its',
    version: '1.5.2',
    icon: 'Ticket',
    publisher: {
      name: 'Substrate',
      verified: true,
    },
    capabilities: [
      {
        type: 'entities',
        entityTypes: ['Ticket', 'Epic', 'Sprint', 'Project'],
        description: 'Sync Jira issues and project structure',
      },
      {
        type: 'relationships',
        entityTypes: ['blocks', 'is_blocked_by', 'relates_to'],
        description: 'Map issue dependencies and relationships',
      },
    ],
    auth: {
      type: 'basic',
      required: true,
      configSchema: {
        type: 'object',
        properties: {
          baseUrl: {
            type: 'string',
            title: 'Jira Base URL',
            description: 'Your Jira instance URL',
            format: 'uri',
            placeholder: 'https://yourcompany.atlassian.net',
          },
          email: {
            type: 'string',
            title: 'Email',
            description: 'Jira account email',
            format: 'email',
          },
          apiToken: {
            type: 'string',
            title: 'API Token',
            description: 'Jira API token',
            format: 'password',
            sensitive: true,
          },
        },
        required: ['baseUrl', 'email', 'apiToken'],
      },
    },
    configSchema: {
      type: 'object',
      properties: {
        projects: {
          type: 'array',
          title: 'Projects',
          description: 'Jira project keys to sync',
          items: { type: 'string' },
        },
        issueTypes: {
          type: 'array',
          title: 'Issue Types',
          description: 'Issue types to sync',
          default: ['Story', 'Bug', 'Task', 'Epic'],
          items: { type: 'string' },
        },
      },
    },
    sync: {
      supportsRealtime: false,
      supportsWebhook: true,
      defaultIntervalMinutes: 30,
      minIntervalMinutes: 15,
      maxIntervalMinutes: 1440,
    },
    tags: ['its', 'project-management', 'agile', 'popular'],
    documentationUrl: 'https://docs.substrate.io/connectors/jira',
    installCount: 890,
    rating: 4.5,
    reviewCount: 78,
    changelog: [
      {
        version: '1.5.2',
        date: '2024-05-20',
        changes: ['Fixed sprint sync issue'],
        breaking: false,
      },
    ],
  },
  {
    id: 'confluence',
    name: 'Confluence',
    description: 'Sync documentation, architecture decision records, and knowledge base',
    category: 'docs',
    version: '1.2.0',
    icon: 'FileText',
    publisher: {
      name: 'Substrate',
      verified: true,
    },
    capabilities: [
      {
        type: 'entities',
        entityTypes: ['Page', 'Space', 'Attachment'],
        description: 'Sync Confluence pages and spaces',
      },
    ],
    auth: {
      type: 'basic',
      required: true,
      configSchema: {
        type: 'object',
        properties: {
          baseUrl: {
            type: 'string',
            title: 'Confluence Base URL',
            format: 'uri',
          },
          email: {
            type: 'string',
            title: 'Email',
            format: 'email',
          },
          apiToken: {
            type: 'string',
            title: 'API Token',
            format: 'password',
            sensitive: true,
          },
        },
        required: ['baseUrl', 'email', 'apiToken'],
      },
    },
    configSchema: {
      type: 'object',
      properties: {
        spaces: {
          type: 'array',
          title: 'Spaces',
          description: 'Confluence space keys to sync',
          items: { type: 'string' },
        },
        includeAttachments: {
          type: 'boolean',
          title: 'Include Attachments',
          default: false,
        },
      },
    },
    sync: {
      supportsRealtime: false,
      supportsWebhook: false,
      defaultIntervalMinutes: 60,
      minIntervalMinutes: 30,
      maxIntervalMinutes: 1440,
    },
    tags: ['docs', 'documentation', 'adr', 'wiki'],
    installCount: 456,
    rating: 4.3,
    reviewCount: 34,
    changelog: [],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Capture architectural decisions and discussions from Slack channels',
    category: 'comm',
    version: '1.0.0',
    icon: 'MessageSquare',
    publisher: {
      name: 'Substrate',
      verified: true,
    },
    capabilities: [
      {
        type: 'events',
        entityTypes: ['Decision', 'Discussion'],
        description: 'Capture decisions and discussions',
      },
    ],
    auth: {
      type: 'oauth2',
      required: true,
      scopes: ['channels:read', 'groups:read'],
      configSchema: {
        type: 'object',
        properties: {
          workspace: {
            type: 'string',
            title: 'Workspace',
            description: 'Slack workspace name',
          },
        },
        required: ['workspace'],
      },
    },
    configSchema: {
      type: 'object',
      properties: {
        channels: {
          type: 'array',
          title: 'Channels',
          description: 'Channels to monitor for decisions',
          items: { type: 'string' },
        },
      },
    },
    sync: {
      supportsRealtime: true,
      supportsWebhook: true,
      defaultIntervalMinutes: 5,
      minIntervalMinutes: 1,
      maxIntervalMinutes: 60,
    },
    tags: ['comm', 'messaging', 'decisions', 'realtime'],
    installCount: 234,
    rating: 4.0,
    reviewCount: 18,
    changelog: [],
  },
  {
    id: 'sonarqube',
    name: 'SonarQube',
    description: 'Import code quality metrics, vulnerabilities, and technical debt analysis',
    category: 'security',
    version: '1.3.0',
    icon: 'Shield',
    publisher: {
      name: 'Substrate',
      verified: true,
    },
    capabilities: [
      {
        type: 'metrics',
        entityTypes: ['CodeQuality', 'Vulnerability', 'TechnicalDebt'],
        description: 'Sync code quality and security metrics',
      },
    ],
    auth: {
      type: 'token',
      required: true,
      configSchema: {
        type: 'object',
        properties: {
          baseUrl: {
            type: 'string',
            title: 'SonarQube URL',
            format: 'uri',
            placeholder: 'https://sonarqube.company.com',
          },
          token: {
            type: 'string',
            title: 'Token',
            format: 'password',
            sensitive: true,
          },
        },
        required: ['baseUrl', 'token'],
      },
    },
    configSchema: {
      type: 'object',
      properties: {
        projects: {
          type: 'array',
          title: 'Projects',
          description: 'SonarQube project keys',
          items: { type: 'string' },
        },
        minSeverity: {
          type: 'string',
          title: 'Minimum Severity',
          enum: ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'],
          default: 'MAJOR',
        },
      },
    },
    sync: {
      supportsRealtime: false,
      supportsWebhook: true,
      defaultIntervalMinutes: 60,
      minIntervalMinutes: 30,
      maxIntervalMinutes: 1440,
    },
    tags: ['security', 'code-quality', 'sast', 'compliance'],
    installCount: 567,
    rating: 4.6,
    reviewCount: 45,
    changelog: [],
  },
];

// ============================================================================
// Mock Installed Connectors
// ============================================================================

export const mockInstalledConnectors: InstalledConnector[] = [
  {
    id: 'conn-1',
    projectId: 'proj-1',
    definitionId: 'github',
    definition: mockConnectorDefinitions[0],
    name: 'Acme GitHub',
    config: {
      organizations: ['acme-corp'],
      repositories: [],
      includeForks: false,
      includeArchived: false,
    },
    auth: {
      type: 'token',
      credentialId: 'cred-1',
      connectedAccount: 'acme-corp',
    },
    status: 'installed',
    syncConfig: {
      enabled: true,
      intervalMinutes: 15,
      realtimeEnabled: true,
      webhookConfigured: true,
      entityTypes: ['Repository', 'PullRequest', 'Issue'],
    },
    stats: {
      entitiesTotal: 247,
      entitiesByType: {
        Repository: 12,
        PullRequest: 89,
        Issue: 146,
      },
      relationshipsTotal: 892,
      syncAttempts: 342,
      syncFailures: 3,
      lastSyncDuration: 45000,
      avgSyncDuration: 42000,
    },
    installedAt: '2024-01-20T10:00:00Z',
    installedBy: 'user-1',
    updatedAt: '2024-06-15T08:30:00Z',
    lastSyncedAt: '2024-06-15T08:30:00Z',
  },
  {
    id: 'conn-2',
    projectId: 'proj-1',
    definitionId: 'jira',
    definition: mockConnectorDefinitions[1],
    name: 'Acme Jira',
    config: {
      projects: ['PAY', 'WEB'],
      issueTypes: ['Story', 'Bug', 'Task', 'Epic'],
    },
    auth: {
      type: 'basic',
      credentialId: 'cred-2',
      connectedAccount: 'john.doe@acme-corp.com',
    },
    status: 'installed',
    syncConfig: {
      enabled: true,
      intervalMinutes: 30,
      realtimeEnabled: false,
      webhookConfigured: true,
      entityTypes: ['Ticket', 'Epic', 'Sprint'],
    },
    stats: {
      entitiesTotal: 523,
      entitiesByType: {
        Ticket: 412,
        Epic: 23,
        Sprint: 88,
      },
      relationshipsTotal: 289,
      syncAttempts: 156,
      syncFailures: 0,
      lastSyncDuration: 23000,
      avgSyncDuration: 25000,
    },
    installedAt: '2024-01-25T14:00:00Z',
    installedBy: 'user-1',
    updatedAt: '2024-06-14T16:00:00Z',
    lastSyncedAt: '2024-06-14T16:00:00Z',
  },
  {
    id: 'conn-3',
    projectId: 'proj-1',
    definitionId: 'sonarqube',
    definition: mockConnectorDefinitions[4],
    name: 'Acme SonarQube',
    config: {
      projects: ['payment-platform', 'customer-portal'],
      minSeverity: 'MAJOR',
    },
    auth: {
      type: 'token',
      credentialId: 'cred-3',
    },
    status: 'error',
    statusMessage: 'Connection timeout - unable to reach SonarQube server',
    syncConfig: {
      enabled: true,
      intervalMinutes: 60,
      realtimeEnabled: false,
      webhookConfigured: false,
      entityTypes: ['CodeQuality', 'Vulnerability'],
    },
    installedAt: '2024-02-01T09:00:00Z',
    installedBy: 'user-1',
    updatedAt: '2024-06-10T10:00:00Z',
    lastSyncedAt: '2024-06-10T10:00:00Z',
  },
];

// ============================================================================
// Mock Connector Templates
// ============================================================================

export const mockConnectorTemplates: ConnectorTemplate[] = [
  {
    id: 'github-enterprise',
    name: 'Enterprise GitHub',
    description: 'Standard configuration for enterprise GitHub with all repositories',
    connectorId: 'github',
    config: {
      organizations: [],
      repositories: [],
      includeForks: false,
      includeArchived: true,
    },
    syncConfig: {
      intervalMinutes: 15,
      realtimeEnabled: true,
    },
    tags: ['enterprise', 'standard', 'all-repos'],
  },
  {
    id: 'github-selective',
    name: 'Selective Repositories',
    description: 'Sync only specific repositories for focused analysis',
    connectorId: 'github',
    config: {
      organizations: [],
      includeForks: false,
      includeArchived: false,
    },
    syncConfig: {
      intervalMinutes: 30,
      realtimeEnabled: false,
    },
    tags: ['selective', 'focused'],
  },
  {
    id: 'jira-agile',
    name: 'Agile Team',
    description: 'Configuration optimized for agile teams with sprints and epics',
    connectorId: 'jira',
    config: {
      issueTypes: ['Story', 'Bug', 'Task', 'Epic', 'Sub-task'],
    },
    syncConfig: {
      intervalMinutes: 15,
    },
    tags: ['agile', 'scrum', 'kanban'],
  },
];

// ============================================================================
// Helpers
// ============================================================================

export function getMockMarketplaceItems(projectId?: string): ConnectorMarketplaceItem[] {
  const installedIds = new Set(
    mockInstalledConnectors
      .filter(c => !projectId || c.projectId === projectId)
      .map(c => c.definitionId)
  );

  return mockConnectorDefinitions.map(def => ({
    ...def,
    installed: installedIds.has(def.id),
    installedVersion: mockInstalledConnectors.find(c => c.definitionId === def.id)?.definition?.version,
    installStatus: mockInstalledConnectors.find(c => c.definitionId === def.id)?.status,
  }));
}
