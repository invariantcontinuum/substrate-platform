/**
 * Multi-Tenant Type Definitions
 * Core types for the Users → Organizations → Projects hierarchy
 * Following DRY, KISS, and extensibility principles
 */

import { LucideIcon } from 'lucide-react';
import { ConnectorConfig } from './connector';

// ============================================================================
// Role-Based Access Control (RBAC)
// ============================================================================

export type UserRole = 'owner' | 'admin' | 'engineer' | 'security' | 'product' | 'readonly';

export type Permission =
  // Project management
  | 'project:read'
  | 'project:write'
  | 'project:delete'
  | 'project:invite'
  // Connector management
  | 'connector:read'
  | 'connector:install'
  | 'connector:configure'
  | 'connector:remove'
  // Policy management
  | 'policy:read'
  | 'policy:write'
  | 'policy:enforce'
  // Graph/Knowledge Fabric
  | 'graph:read'
  | 'graph:explore'
  | 'graph:analyze'
  // Drift and violations
  | 'drift:read'
  | 'drift:resolve'
  // User management
  | 'user:read'
  | 'user:manage'
  // Reports and insights
  | 'insights:read'
  | 'insights:executive'
  | 'insights:technical';

export interface RoleDefinition {
  id: UserRole;
  name: string;
  description: string;
  permissions: Permission[];
  level: number; // Higher = more permissions
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  defaultView: 'executive' | 'architect' | 'security' | 'engineer';
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  driftAlerts: 'immediate' | 'digest' | 'none';
  policyViolations: 'immediate' | 'digest' | 'none';
  connectorSync: boolean;
  emailDigest: 'daily' | 'weekly' | 'none';
}

// ============================================================================
// Organization Types
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  plan: 'free' | 'team' | 'enterprise';
  createdAt: string;
  updatedAt: string;
  settings: OrganizationSettings;
  limits: OrganizationLimits;
}

export interface OrganizationSettings {
  allowPublicProjects: boolean;
  requireApprovalForConnectors: boolean;
  defaultProjectRole: UserRole;
  ssoEnabled: boolean;
  auditLogRetentionDays: number;
}

export interface OrganizationLimits {
  maxProjects: number;
  maxUsers: number;
  maxConnectorsPerProject: number;
  storageGB: number;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  joinedAt: string;
  invitedBy?: string;
  user?: User;
}

// ============================================================================
// Project Types
// ============================================================================

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'archived' | 'setup';
  createdAt: string;
  updatedAt: string;
  settings: ProjectSettings;
  stats: ProjectStats;
}

export interface ProjectSettings {
  visibility: 'private' | 'organization';
  defaultBranch: string;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  alertThresholds: AlertThresholds;
}

export interface AlertThresholds {
  criticalViolations: number;
  highViolations: number;
  driftPercentage: number;
}

export interface ProjectStats {
  totalNodes: number;
  totalEdges: number;
  policiesCount: number;
  activeViolations: number;
  lastSyncAt?: string;
  healthScore: number;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: UserRole;
  joinedAt: string;
  invitedBy?: string;
  permissions: Permission[]; // Computed effective permissions
  user?: User;
}

// ============================================================================
// Project Context (for frontend state management)
// ============================================================================

export interface ProjectContext {
  organization: Organization | null;
  project: Project | null;
  member: ProjectMember | null;
  permissions: Permission[];
  isLoading: boolean;
}

// ============================================================================
// Project Activity
// ============================================================================

export type ActivityType =
  | 'project.created'
  | 'project.updated'
  | 'project.archived'
  | 'member.invited'
  | 'member.joined'
  | 'member.role_changed'
  | 'member.removed'
  | 'connector.installed'
  | 'connector.configured'
  | 'connector.removed'
  | 'connector.synced'
  | 'policy.created'
  | 'policy.updated'
  | 'policy.deleted'
  | 'policy.violation_detected'
  | 'policy.violation_resolved'
  | 'drift.detected'
  | 'drift.resolved'
  | 'graph.synced'
  | 'insight.generated';

export interface ProjectActivity {
  id: string;
  projectId: string;
  organizationId: string;
  type: ActivityType;
  actor: {
    userId: string;
    name: string;
    avatar?: string;
  };
  target?: {
    type: string;
    id: string;
    name: string;
  };
  metadata?: Record<string, unknown>;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

// ============================================================================
// Dashboard Types (Role-Aware)
// ============================================================================

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  description?: string;
  config: Record<string, unknown>;
  requiredPermissions: Permission[];
  defaultPosition: { x: number; y: number; w: number; h: number };
}

export interface ExecutiveSummary {
  overallHealth: {
    score: number;
    trend: 'improving' | 'stable' | 'degrading';
    summary: string;
  };
  keyMetrics: {
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  }[];
  criticalIssues: {
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium';
    type: string;
    affectedComponents: number;
  }[];
  complianceStatus: {
    overall: number;
    byFramework: Record<string, number>;
    lastAudited: string;
  };
}

export interface ArchitectSummary {
  systemHealth: {
    coupling: number;
    cohesion: number;
    complexity: number;
  };
  topViolations: {
    id: string;
    policy: string;
    description: string;
    severity: string;
    location: string;
  }[];
  dependencies: {
    internal: number;
    external: number;
    deprecated: number;
  };
  modularityScore: number;
  documentationCoverage: number;
}

export interface SecuritySummary {
  securityScore: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  dataFlowBoundaries: {
    total: number;
    withPii: number;
    crossRegion: number;
    nonCompliant: number;
  };
  aiGeneratedCode: {
    totalFiles: number;
    auditedPercentage: number;
    highRiskFiles: number;
  };
  complianceGaps: {
    framework: string;
    gap: number;
    items: string[];
  }[];
}

export type DashboardView = 'executive' | 'architect' | 'security' | 'engineer' | 'product';

export interface ProjectDashboard {
  project: Project;
  view: DashboardView;
  executive?: ExecutiveSummary;
  architect?: ArchitectSummary;
  security?: SecuritySummary;
  recentActivity: ProjectActivity[];
  widgets: DashboardWidget[];
}

// ============================================================================
// Invitation Types
// ============================================================================

export interface ProjectInvitation {
  id: string;
  projectId: string;
  organizationId: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
}

// ============================================================================
// Role Definitions (Static Configuration)
// ============================================================================

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  owner: {
    id: 'owner',
    name: 'Owner',
    description: 'Full control over the project',
    level: 100,
    permissions: [
      'project:read', 'project:write', 'project:delete', 'project:invite',
      'connector:read', 'connector:install', 'connector:configure', 'connector:remove',
      'policy:read', 'policy:write', 'policy:enforce',
      'graph:read', 'graph:explore', 'graph:analyze',
      'drift:read', 'drift:resolve',
      'user:read', 'user:manage',
      'insights:read', 'insights:executive', 'insights:technical',
    ],
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    description: 'Can manage project settings and members',
    level: 80,
    permissions: [
      'project:read', 'project:write', 'project:invite',
      'connector:read', 'connector:install', 'connector:configure', 'connector:remove',
      'policy:read', 'policy:write', 'policy:enforce',
      'graph:read', 'graph:explore', 'graph:analyze',
      'drift:read', 'drift:resolve',
      'user:read', 'user:manage',
      'insights:read', 'insights:executive', 'insights:technical',
    ],
  },
  engineer: {
    id: 'engineer',
    name: 'Engineer',
    description: 'Can view and analyze, limited configuration access',
    level: 60,
    permissions: [
      'project:read',
      'connector:read', 'connector:configure',
      'policy:read',
      'graph:read', 'graph:explore', 'graph:analyze',
      'drift:read', 'drift:resolve',
      'user:read',
      'insights:read', 'insights:technical',
    ],
  },
  security: {
    id: 'security',
    name: 'Security',
    description: 'Security-focused access with policy management',
    level: 60,
    permissions: [
      'project:read',
      'connector:read',
      'policy:read', 'policy:write', 'policy:enforce',
      'graph:read', 'graph:explore', 'graph:analyze',
      'drift:read', 'drift:resolve',
      'user:read',
      'insights:read', 'insights:executive', 'insights:technical',
    ],
  },
  product: {
    id: 'product',
    name: 'Product',
    description: 'Read-only access with executive insights',
    level: 40,
    permissions: [
      'project:read',
      'connector:read',
      'policy:read',
      'graph:read', 'graph:explore',
      'drift:read',
      'user:read',
      'insights:read', 'insights:executive',
    ],
  },
  readonly: {
    id: 'readonly',
    name: 'Read-only',
    description: 'View-only access to project data',
    level: 20,
    permissions: [
      'project:read',
      'connector:read',
      'policy:read',
      'graph:read',
      'drift:read',
      'insights:read',
    ],
  },
};

// ============================================================================
// Permission Helpers
// ============================================================================

export function hasPermission(member: ProjectMember | null, permission: Permission): boolean {
  if (!member) return false;
  return member.permissions.includes(permission) || 
         ROLE_DEFINITIONS[member.role].permissions.includes(permission);
}

export function hasAnyPermission(member: ProjectMember | null, permissions: Permission[]): boolean {
  if (!member) return false;
  return permissions.some(p => hasPermission(member, p));
}

export function hasAllPermissions(member: ProjectMember | null, permissions: Permission[]): boolean {
  if (!member) return false;
  return permissions.every(p => hasPermission(member, p));
}

export function getEffectivePermissions(role: UserRole, customPermissions?: Permission[]): Permission[] {
  const basePermissions = ROLE_DEFINITIONS[role].permissions;
  if (!customPermissions) return basePermissions;
  
  // Merge base and custom, removing duplicates
  return [...new Set([...basePermissions, ...customPermissions])];
}
