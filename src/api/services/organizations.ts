/**
 * Organizations Service
 * Handles organization CRUD operations and member management
 * Following SOLID principles - Single Responsibility for organization operations
 */

import { BaseService } from './base';
import type {
  Organization,
  OrganizationSettings,
  OrganizationLimits,
  User,
} from '@/types';

// Extended organization type with stats
export interface OrganizationWithStats extends Organization {
  stats: {
    totalProjects: number;
    totalMembers: number;
    totalTeams: number;
  };
}

// Organization member type
export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'engineer' | 'security' | 'product' | 'readonly';
  joinedAt: string;
  invitedBy: string | null;
  user: User;
}

// Request types
export interface CreateOrganizationRequest {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  avatar?: string | null;
  settings?: Partial<OrganizationSettings>;
}

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'engineer' | 'security' | 'product' | 'readonly';
  message?: string;
}

export interface UpdateMemberRoleRequest {
  role: 'owner' | 'admin' | 'engineer' | 'security' | 'product' | 'readonly';
}

export interface ListOrganizationsParams {
  page?: number;
  limit?: number;
}

export interface OrganizationListResponse {
  data: OrganizationWithStats[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Organizations Service - Handles organization operations
 */
class OrganizationsService extends BaseService {
  protected readonly basePath = '/organizations';

  // List organizations for current user
  listOrganizations(params?: ListOrganizationsParams) {
    return this.get<OrganizationListResponse>('', params as Record<string, string | undefined>);
  }

  // Get organization by ID
  getOrganization(orgId: string) {
    return this.get<OrganizationWithStats>(`/${orgId}`);
  }

  // Create organization
  createOrganization(request: CreateOrganizationRequest) {
    return this.post<Organization>('', request);
  }

  // Update organization
  updateOrganization(orgId: string, request: UpdateOrganizationRequest) {
    return this.patch<Organization>(`/${orgId}`, request);
  }

  // Delete organization
  deleteOrganization(orgId: string) {
    return this.del<void>(`/${orgId}`);
  }

  // List organization members
  listMembers(orgId: string, params?: { page?: number; limit?: number }) {
    return this.get<OrganizationMember[]>(`/${orgId}/members`, params);
  }

  // Invite member to organization
  inviteMember(orgId: string, request: InviteMemberRequest) {
    return this.post<void>(`/${orgId}/members`, request);
  }

  // Update member role
  updateMemberRole(orgId: string, userId: string, request: UpdateMemberRoleRequest) {
    return this.patch<void>(`/${orgId}/members/${userId}`, request);
  }

  // Remove member from organization
  removeMember(orgId: string, userId: string) {
    return this.del<void>(`/${orgId}/members/${userId}`);
  }
}

// Export singleton instance
export const organizationsService = new OrganizationsService();
