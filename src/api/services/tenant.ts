/**
 * Tenant Services
 * API services for Organizations, Projects, Members, and RBAC
 * Following DRY principle - single abstraction per concern
 */

import { BaseService } from './base';
import type {
  Organization,
  OrganizationMember,
  Project,
  ProjectMember,
  ProjectInvitation,
  ProjectActivity,
  User,
  UserRole,
  DashboardView,
  ProjectDashboard,
  ExecutiveSummary,
  ArchitectSummary,
  SecuritySummary,
} from '@/types';

// ============================================================================
// Parameter Types
// ============================================================================

export interface OrganizationCreateParams {
  name: string;
  slug?: string;
  description?: string;
}

export interface OrganizationUpdateParams {
  name?: string;
  description?: string;
  settings?: Partial<Organization['settings']>;
}

export interface ProjectCreateParams {
  name: string;
  slug?: string;
  description?: string;
  organizationId: string;
}

export interface ProjectUpdateParams {
  name?: string;
  description?: string;
  status?: Project['status'];
  settings?: Partial<Project['settings']>;
}

export interface MemberInviteParams {
  email: string;
  role: UserRole;
}

export interface MemberUpdateParams {
  role?: UserRole;
  permissions?: string[];
}

export interface ActivityFilters {
  type?: string;
  severity?: string;
  from?: string;
  to?: string;
  limit?: number;
}

// ============================================================================
// Base Service Extension
// ============================================================================

abstract class TenantBaseService extends BaseService {
  protected buildProjectPath(projectId: string, path: string): string {
    return `/projects/${projectId}${path}`;
  }
  
  protected buildOrgPath(orgId: string, path: string): string {
    return `/organizations/${orgId}${path}`;
  }
}

// ============================================================================
// Organization Service
// ============================================================================

class OrganizationService extends TenantBaseService {
  protected readonly basePath = '/organizations';

  // CRUD Operations
  getAll(): Promise<{ data: Organization[] }> {
    return this.get('');
  }

  getById(id: string): Promise<{ data: Organization }> {
    return this.get(`/${id}`);
  }

  getBySlug(slug: string): Promise<{ data: Organization }> {
    return this.get(`/slug/${slug}`);
  }

  create(params: OrganizationCreateParams): Promise<{ data: Organization }> {
    return this.post('', params);
  }

  update(id: string, params: OrganizationUpdateParams): Promise<{ data: Organization }> {
    return this.patch(`/${id}`, params);
  }

  delete(id: string): Promise<{ data: void }> {
    return this.del(`/${id}`);
  }

  // Members
  getMembers(orgId: string): Promise<{ data: OrganizationMember[] }> {
    return this.get(this.buildOrgPath(orgId, '/members'));
  }

  inviteMember(orgId: string, params: MemberInviteParams): Promise<{ data: OrganizationMember }> {
    return this.post(this.buildOrgPath(orgId, '/members'), params);
  }

  removeMember(orgId: string, memberId: string): Promise<{ data: void }> {
    return this.del(this.buildOrgPath(orgId, `/members/${memberId}`));
  }

  updateMemberRole(orgId: string, memberId: string, role: UserRole): Promise<{ data: OrganizationMember }> {
    return this.patch(this.buildOrgPath(orgId, `/members/${memberId}`), { role });
  }
}

// ============================================================================
// Project Service
// ============================================================================

class ProjectService extends TenantBaseService {
  protected readonly basePath = '/projects';

  // CRUD Operations
  getAll(orgId?: string): Promise<{ data: Project[] }> {
    const params = orgId ? { organizationId: orgId } : undefined;
    return this.get('', params);
  }

  getById(id: string): Promise<{ data: Project }> {
    return this.get(`/${id}`);
  }

  create(params: ProjectCreateParams): Promise<{ data: Project }> {
    return this.post('', params);
  }

  update(id: string, params: ProjectUpdateParams): Promise<{ data: Project }> {
    return this.patch(`/${id}`, params);
  }

  delete(id: string): Promise<{ data: void }> {
    return this.del(`/${id}`);
  }

  // Archive/Restore
  archive(id: string): Promise<{ data: Project }> {
    return this.post(`/${id}/archive`);
  }

  restore(id: string): Promise<{ data: Project }> {
    return this.post(`/${id}/restore`);
  }

  // Members
  getMembers(projectId: string): Promise<{ data: ProjectMember[] }> {
    return this.get(this.buildProjectPath(projectId, '/members'));
  }

  getCurrentMember(projectId: string): Promise<{ data: ProjectMember }> {
    return this.get(this.buildProjectPath(projectId, '/members/me'));
  }

  inviteMember(projectId: string, params: MemberInviteParams): Promise<{ data: ProjectInvitation }> {
    return this.post(this.buildProjectPath(projectId, '/invitations'), params);
  }

  removeMember(projectId: string, memberId: string): Promise<{ data: void }> {
    return this.del(this.buildProjectPath(projectId, `/members/${memberId}`));
  }

  updateMemberRole(projectId: string, memberId: string, role: UserRole): Promise<{ data: ProjectMember }> {
    return this.patch(this.buildProjectPath(projectId, `/members/${memberId}`), { role });
  }

  // Invitations
  getInvitations(projectId: string): Promise<{ data: ProjectInvitation[] }> {
    return this.get(this.buildProjectPath(projectId, '/invitations'));
  }

  cancelInvitation(projectId: string, invitationId: string): Promise<{ data: void }> {
    return this.del(this.buildProjectPath(projectId, `/invitations/${invitationId}`));
  }

  // Activity
  getActivity(projectId: string, filters?: ActivityFilters): Promise<{ data: ProjectActivity[] }> {
    return this.get(this.buildProjectPath(projectId, '/activity'), filters as Record<string, string | undefined>);
  }
}

// ============================================================================
// Dashboard Service
// ============================================================================

class DashboardService extends TenantBaseService {
  protected readonly basePath = '/dashboard';

  getDashboard(projectId: string, view?: DashboardView): Promise<{ data: ProjectDashboard }> {
    const params = view ? { view } : undefined;
    return this.get(this.buildProjectPath(projectId, ''), params);
  }

  getExecutiveSummary(projectId: string): Promise<{ data: ExecutiveSummary }> {
    return this.get(this.buildProjectPath(projectId, '/executive'));
  }

  getArchitectSummary(projectId: string): Promise<{ data: ArchitectSummary }> {
    return this.get(this.buildProjectPath(projectId, '/architect'));
  }

  getSecuritySummary(projectId: string): Promise<{ data: SecuritySummary }> {
    return this.get(this.buildProjectPath(projectId, '/security'));
  }

  setDashboardView(projectId: string, view: DashboardView): Promise<{ data: void }> {
    return this.patch(this.buildProjectPath(projectId, '/view'), { view });
  }
}

// ============================================================================
// User Service
// ============================================================================

class UserService extends BaseService {
  protected readonly basePath = '/users';

  getCurrentUser(): Promise<{ data: User }> {
    return this.get('/me');
  }

  updateProfile(params: { name?: string; avatar?: string; preferences?: Record<string, unknown> }): Promise<{ data: User }> {
    return this.patch('/me', params);
  }

  getMyOrganizations(): Promise<{ data: Organization[] }> {
    return this.get('/me/organizations');
  }

  getMyProjects(): Promise<{ data: Project[] }> {
    return this.get('/me/projects');
  }

  getMyInvitations(): Promise<{ data: ProjectInvitation[] }> {
    return this.get('/me/invitations');
  }

  acceptInvitation(invitationId: string): Promise<{ data: ProjectMember }> {
    return this.post(`/me/invitations/${invitationId}/accept`);
  }

  declineInvitation(invitationId: string): Promise<{ data: void }> {
    return this.post(`/me/invitations/${invitationId}/decline`);
  }
}

// ============================================================================
// Service Exports
// ============================================================================

export const organizationService = new OrganizationService();
export const projectService = new ProjectService();
export const dashboardService = new DashboardService();
export const userService = new UserService();
