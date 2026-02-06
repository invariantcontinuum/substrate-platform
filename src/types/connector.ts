/**
 * Connector Marketplace Type Definitions
 * First-class primitive for data connectors
 * Config over code - generic APIs, no connector-specific logic
 */

// ============================================================================
// Base Connector Types
// ============================================================================

export type ConnectorCategory =
  | 'vcs'           // Version Control (GitHub, GitLab, Bitbucket)
  | 'its'           // Issue Tracking (Jira, Linear, GitHub Issues)
  | 'docs'          // Documentation (Confluence, Notion, Wiki)
  | 'comm'          // Communication (Slack, Teams, Discord)
  | 'cicd'          // CI/CD (Jenkins, GitHub Actions, CircleCI)
  | 'observability' // Monitoring (Datadog, New Relic, Grafana)
  | 'security'      // Security (Snyk, SonarQube, Checkmarx)
  | 'cloud'         // Cloud Provider (AWS, GCP, Azure)
  | 'database'      // Database (PostgreSQL, MongoDB, Redis)
  | 'custom';       // Custom connectors

export type ConnectorStatus = 
  | 'available'     // Not installed, can be installed
  | 'installing'    // Installation in progress
  | 'installed'     // Successfully installed
  | 'configuring'   // Needs configuration
  | 'error'         // Installation/config error
  | 'updating'      // Update in progress
  | 'deprecated';   // Deprecated, should migrate

export type ConnectorAuthType =
  | 'oauth2'
  | 'token'
  | 'basic'
  | 'api_key'
  | 'none'
  | 'mTLS';

// ============================================================================
// Connector Definition (Marketplace Item)
// ============================================================================

export interface ConnectorDefinition {
  id: string;
  name: string;
  description: string;
  category: ConnectorCategory;
  version: string;
  icon: string;
  publisher: {
    name: string;
    verified: boolean;
  };
  
  // Capabilities - what this connector can ingest
  capabilities: ConnectorCapability[];
  
  // Authentication schema
  auth: {
    type: ConnectorAuthType;
    required: boolean;
    scopes?: string[];
    configSchema: ConfigSchema; // JSON Schema for auth config
  };
  
  // Configuration schema - generic, no connector-specific types
  configSchema: ConfigSchema;
  
  // Sync configuration
  sync: {
    supportsRealtime: boolean;
    supportsWebhook: boolean;
    defaultIntervalMinutes: number;
    minIntervalMinutes: number;
    maxIntervalMinutes: number;
  };
  
  // Metadata
  tags: string[];
  documentationUrl?: string;
  supportUrl?: string;
  
  // Stats
  installCount: number;
  rating?: number;
  reviewCount?: number;
  
  // Versioning
  changelog: ConnectorChangelogEntry[];
  deprecated?: boolean;
  replacedBy?: string;
}

export interface ConnectorCapability {
  type: 'entities' | 'relationships' | 'events' | 'metrics' | 'logs';
  entityTypes: string[]; // e.g., ['Repository', 'PullRequest', 'Issue']
  description: string;
}

export interface ConfigSchema {
  type: 'object';
  properties: Record<string, ConfigProperty>;
  required?: string[];
}

export interface ConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  title: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  format?: string; // e.g., 'uri', 'email', 'password'
  items?: ConfigProperty; // for arrays
  sensitive?: boolean; // mask in UI
  placeholder?: string;
}

export interface ConnectorChangelogEntry {
  version: string;
  date: string;
  changes: string[];
  breaking: boolean;
}

// ============================================================================
// Installed Connector (Project-Specific)
// ============================================================================

export interface InstalledConnector {
  id: string;
  projectId: string;
  definitionId: string;
  definition?: ConnectorDefinition;
  
  // Instance configuration
  name: string; // User-defined name for this instance
  config: ConnectorConfig;
  auth: ConnectorAuth;
  
  // Status
  status: ConnectorStatus;
  statusMessage?: string;
  
  // Sync settings
  syncConfig: SyncConfig;
  
  // Statistics
  stats?: ConnectorStats;
  
  // Timestamps
  installedAt: string;
  installedBy: string;
  updatedAt: string;
  lastSyncedAt?: string;
  lastSyncJobId?: string;
}

export interface ConnectorConfig {
  // Generic key-value configuration based on configSchema
  [key: string]: unknown;
}

export interface ConnectorAuth {
  type: ConnectorAuthType;
  // Store only metadata, actual credentials in secure vault
  credentialId: string;
  scopes?: string[];
  connectedAccount?: string; // e.g., GitHub username
  expiresAt?: string;
}

export interface SyncConfig {
  enabled: boolean;
  intervalMinutes: number;
  realtimeEnabled: boolean;
  webhookConfigured: boolean;
  entityTypes: string[]; // Which entity types to sync
  filters?: Record<string, unknown>; // Entity filters
}

export interface ConnectorStats {
  entitiesTotal: number;
  entitiesByType: Record<string, number>;
  relationshipsTotal: number;
  syncAttempts: number;
  syncFailures: number;
  lastSyncDuration: number;
  avgSyncDuration: number;
}

// ============================================================================
// Connector Installation Request
// ============================================================================

export interface ConnectorInstallRequest {
  definitionId: string;
  name: string;
  config: ConnectorConfig;
  auth: ConnectorAuthConfig;
  syncConfig?: Partial<SyncConfig>;
}

export interface ConnectorAuthConfig {
  type: ConnectorAuthType;
  credentials: Record<string, string>; // Actual credentials (sent to vault)
}

// ============================================================================
// Connector Sync Job
// ============================================================================

export interface ConnectorSyncJob {
  id: string;
  connectorId: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  trigger: 'scheduled' | 'manual' | 'webhook';
  triggeredBy?: string;
  
  // Progress
  progress: {
    phase: string;
    percent: number;
    entitiesProcessed: number;
    entitiesTotal: number;
  };
  
  // Results
  results?: {
    entitiesCreated: number;
    entitiesUpdated: number;
    entitiesDeleted: number;
    relationshipsCreated: number;
    errors: SyncError[];
  };
  
  // Errors
  error?: string;
}

export interface SyncError {
  code: string;
  message: string;
  entityType?: string;
  entityId?: string;
  retryable: boolean;
}

// ============================================================================
// Connector Health
// ============================================================================

export interface ConnectorHealth {
  connectorId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheckAt: string;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    responseTime?: number;
  }[];
}

// ============================================================================
// Marketplace Types
// ============================================================================

export interface ConnectorMarketplaceFilters {
  category?: ConnectorCategory;
  search?: string;
  verifiedOnly?: boolean;
  installed?: boolean;
}

export interface ConnectorMarketplaceItem extends ConnectorDefinition {
  installed?: boolean;
  installedVersion?: string;
  installStatus?: ConnectorStatus;
}

// ============================================================================
// Pre-built Connector Templates (for common configurations)
// ============================================================================

export interface ConnectorTemplate {
  id: string;
  name: string;
  description: string;
  connectorId: string;
  config: ConnectorConfig;
  syncConfig: Partial<SyncConfig>;
  tags: string[];
}

// ============================================================================
// Category Definitions (for UI)
// ============================================================================

export const CONNECTOR_CATEGORIES: Record<ConnectorCategory, { 
  label: string; 
  description: string;
  icon: string;
}> = {
  vcs: {
    label: 'Version Control',
    description: 'Git repositories, pull requests, commits',
    icon: 'GitBranch',
  },
  its: {
    label: 'Issue Tracking',
    description: 'Tickets, epics, sprints',
    icon: 'Ticket',
  },
  docs: {
    label: 'Documentation',
    description: 'Wikis, docs, knowledge base',
    icon: 'FileText',
  },
  comm: {
    label: 'Communication',
    description: 'Slack, teams, discussions',
    icon: 'MessageSquare',
  },
  cicd: {
    label: 'CI/CD',
    description: 'Build pipelines, deployments',
    icon: 'Workflow',
  },
  observability: {
    label: 'Observability',
    description: 'Monitoring, logs, traces',
    icon: 'Activity',
  },
  security: {
    label: 'Security',
    description: 'Vulnerability scanning, compliance',
    icon: 'Shield',
  },
  cloud: {
    label: 'Cloud Provider',
    description: 'AWS, GCP, Azure resources',
    icon: 'Cloud',
  },
  database: {
    label: 'Database',
    description: 'Schema, migrations, queries',
    icon: 'Database',
  },
  custom: {
    label: 'Custom',
    description: 'User-defined connectors',
    icon: 'Puzzle',
  },
};
