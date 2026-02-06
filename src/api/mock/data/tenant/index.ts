/**
 * Tenant Mock Data
 * Mock data for Organizations, Projects, Users, Teams, and Activity
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

// JSON imports
import usersData from './users.json';
import organizationsData from './organizations.json';
import projectsData from './projects.json';
import projectMembersData from './project-members.json';
import organizationMembersData from './organization-members.json';
import activityData from './activity.json';
import summariesData from './summaries.json';
import teamsData from './teams.json';

// Extended team type
export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  leadId: string | null;
}

// ============================================================================
// Mock Users
// ============================================================================

export const mockCurrentUser: User = usersData[0] as unknown as User;
export const mockUsers: User[] = usersData as unknown as User[];

// ============================================================================
// Mock Organizations
// ============================================================================

export const mockOrganizations: Organization[] = organizationsData as unknown as Organization[];

// ============================================================================
// Mock Projects
// ============================================================================

export const mockProjects: Project[] = projectsData as unknown as Project[];

// ============================================================================
// Mock Members
// ============================================================================

export const mockProjectMembers: ProjectMember[] = projectMembersData as unknown as ProjectMember[];

export const mockOrganizationMembers: OrganizationMember[] = organizationMembersData as unknown as OrganizationMember[];

// ============================================================================
// Mock Teams
// ============================================================================

export const mockTeams: Team[] = teamsData as Team[];

// ============================================================================
// Mock Activity
// ============================================================================

export const mockActivity: ProjectActivity[] = activityData as unknown as ProjectActivity[];

// ============================================================================
// Mock Dashboard Data
// ============================================================================

export const mockExecutiveSummary: ExecutiveSummary = summariesData.executive as unknown as ExecutiveSummary;
export const mockArchitectSummary: ArchitectSummary = summariesData.architect as unknown as ArchitectSummary;
export const mockSecuritySummary: SecuritySummary = summariesData.security as unknown as SecuritySummary;

export const mockProjectDashboard: ProjectDashboard = {
  project: mockProjects[0]!,
  view: 'engineer',
  executive: mockExecutiveSummary,
  architect: mockArchitectSummary,
  security: mockSecuritySummary,
  recentActivity: mockActivity,
  widgets: [],
};
