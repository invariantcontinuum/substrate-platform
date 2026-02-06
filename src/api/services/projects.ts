/**
 * Projects Service
 * Handles project CRUD operations and member management
 * Following SOLID principles - Single Responsibility for project operations
 */

import { BaseService } from './base';
import type {
  Project,
  ProjectSettings,
  ProjectStats,
  User,
} from '@/types';

// Extended project type
export interface ProjectWithDetails extends Project {
  stats: ProjectStats;
}

// Project member type
export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'owner' | 'admin' | 'engineer' | 'security' | 'product' | 'readonly';
  permissions: string[];
  joinedAt: string;
  invitedBy: string | null;
  user: User;
}

// Request types
export interface CreateProjectRequest {
  name: string;
  organizationId: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
}

export interface AddProjectMemberRequest {
  email: string;
  role: 'admin' | 'engineer' | 'security' | 'product' | 'readonly';
}

export interface UpdateProjectMemberRequest {
  role: 'owner' | 'admin' | 'engineer' | 'security' | 'product' | 'readonly';
}

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  organizationId?: string;
  status?: 'active' | 'archived' | 'setup';
}

export interface ProjectListResponse {
  data: ProjectWithDetails[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Projects Service - Handles project operations
 */
class ProjectsService extends BaseService {
  protected readonly basePath = '/projects';

  // List projects for current user
  listProjects(params?: ListProjectsParams) {
    return this.get<ProjectListResponse>('', params as Record<string, string | undefined>);
  }

  // Get project by ID
  getProject(projectId: string) {
    return this.get<ProjectWithDetails>(`/${projectId}`);
  }

  // Create project
  createProject(request: CreateProjectRequest) {
    return this.post<Project>('', request);
  }

  // Update project
  updateProject(projectId: string, request: UpdateProjectRequest) {
    return this.patch<Project>(`/${projectId}`, request);
  }

  // Delete project
  deleteProject(projectId: string) {
    return this.del<void>(`/${projectId}`);
  }

  // Archive project (soft delete)
  archiveProject(projectId: string) {
    return this.post<Project>(`/${projectId}/archive`, {});
  }

  // Restore archived project
  restoreProject(projectId: string) {
    return this.post<Project>(`/${projectId}/restore`, {});
  }

  // List project members
  listMembers(projectId: string) {
    return this.get<ProjectMember[]>(`/${projectId}/members`);
  }

  // Add member to project
  addMember(projectId: string, request: AddProjectMemberRequest) {
    return this.post<ProjectMember>(`/${projectId}/members`, request);
  }

  // Update project member role
  updateMember(projectId: string, userId: string, request: UpdateProjectMemberRequest) {
    return this.patch<ProjectMember>(`/${projectId}/members/${userId}`, request);
  }

  // Remove member from project
  removeMember(projectId: string, userId: string) {
    return this.del<void>(`/${projectId}/members/${userId}`);
  }
}

// Export singleton instance
export const projectsService = new ProjectsService();
