/**
 * Teams Service
 * Handles team CRUD operations within organizations
 * Following SOLID principles - Single Responsibility for team operations
 */

import { BaseService } from './base';
import type { User } from '@/types';

// Team types
export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  lead: User | null;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'lead' | 'member';
  joinedAt: string;
  user: User;
}

// Request types
export interface CreateTeamRequest {
  name: string;
  description?: string;
  color?: string;
  leadUserId?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  color?: string;
  leadUserId?: string | null;
}

export interface AddTeamMemberRequest {
  userId: string;
  role?: 'lead' | 'member';
}

export interface ListTeamsParams {
  organizationId: string;
}

/**
 * Teams Service - Handles team operations
 */
class TeamsService extends BaseService {
  protected readonly basePath = '/organizations';

  // List teams for an organization
  listTeams(organizationId: string) {
    return this.get<Team[]>(`/${organizationId}/teams`);
  }

  // Get team details
  getTeam(organizationId: string, teamId: string) {
    return this.get<Team>(`/${organizationId}/teams/${teamId}`);
  }

  // Create team
  createTeam(organizationId: string, request: CreateTeamRequest) {
    return this.post<Team>(`/${organizationId}/teams`, request);
  }

  // Update team
  updateTeam(organizationId: string, teamId: string, request: UpdateTeamRequest) {
    return this.patch<Team>(`/${organizationId}/teams/${teamId}`, request);
  }

  // Delete team
  deleteTeam(organizationId: string, teamId: string) {
    return this.del<void>(`/${organizationId}/teams/${teamId}`);
  }

  // List team members
  listTeamMembers(organizationId: string, teamId: string) {
    return this.get<TeamMember[]>(`/${organizationId}/teams/${teamId}/members`);
  }

  // Add team member
  addTeamMember(organizationId: string, teamId: string, request: AddTeamMemberRequest) {
    return this.post<TeamMember>(`/${organizationId}/teams/${teamId}/members`, request);
  }

  // Remove team member
  removeTeamMember(organizationId: string, teamId: string, userId: string) {
    return this.del<void>(`/${organizationId}/teams/${teamId}/members/${userId}`);
  }
}

// Export singleton instance
export const teamsService = new TeamsService();
