/**
 * Tenant React Query Hooks
 * DRY, reusable hooks for multi-tenant operations
 * Following SOLID principles with single responsibility per hook
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  organizationService,
  projectService,
  dashboardService,
  userService,
} from '../services';
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
import type {
  OrganizationCreateParams,
  OrganizationUpdateParams,
  ProjectCreateParams,
  ProjectUpdateParams,
  MemberInviteParams,
  MemberUpdateParams,
  ActivityFilters,
} from '../services/tenant';

// ============================================================================
// Query Keys - Centralized key management following DRY
// ============================================================================

export const tenantQueryKeys = {
  // Organizations
  organizations: {
    all: ['organizations'] as const,
    list: () => ['organizations', 'list'] as const,
    detail: (id: string) => ['organizations', 'detail', id] as const,
    bySlug: (slug: string) => ['organizations', 'slug', slug] as const,
    members: (orgId: string) => ['organizations', 'members', orgId] as const,
  },
  // Projects
  projects: {
    all: ['projects'] as const,
    list: (orgId?: string) => ['projects', 'list', orgId] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    members: (projectId: string) => ['projects', 'members', projectId] as const,
    currentMember: (projectId: string) => ['projects', 'members', 'me', projectId] as const,
    invitations: (projectId: string) => ['projects', 'invitations', projectId] as const,
    activity: (projectId: string, filters?: ActivityFilters) => 
      ['projects', 'activity', projectId, filters] as const,
  },
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    project: (projectId: string, view?: DashboardView) => 
      ['dashboard', 'project', projectId, view] as const,
    executive: (projectId: string) => ['dashboard', 'executive', projectId] as const,
    architect: (projectId: string) => ['dashboard', 'architect', projectId] as const,
    security: (projectId: string) => ['dashboard', 'security', projectId] as const,
  },
  // User
  user: {
    current: ['user', 'me'] as const,
    organizations: ['user', 'organizations'] as const,
    projects: ['user', 'projects'] as const,
    invitations: ['user', 'invitations'] as const,
  },
} as const;

// ============================================================================
// Organization Hooks
// ============================================================================

export function useOrganizations(options?: UseQueryOptions<Organization[]>) {
  return useQuery<Organization[]>({
    queryKey: tenantQueryKeys.organizations.list(),
    queryFn: async () => {
      const response = await organizationService.getAll();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useOrganization(id: string, enabled = true, options?: UseQueryOptions<Organization>) {
  return useQuery<Organization>({
    queryKey: tenantQueryKeys.organizations.detail(id),
    queryFn: async () => {
      const response = await organizationService.getById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useOrganizationBySlug(slug: string, enabled = true, options?: UseQueryOptions<Organization>) {
  return useQuery<Organization>({
    queryKey: tenantQueryKeys.organizations.bySlug(slug),
    queryFn: async () => {
      const response = await organizationService.getBySlug(slug);
      return response.data;
    },
    enabled: enabled && !!slug,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useOrganizationMembers(orgId: string, enabled = true, options?: UseQueryOptions<OrganizationMember[]>) {
  return useQuery<OrganizationMember[]>({
    queryKey: tenantQueryKeys.organizations.members(orgId),
    queryFn: async () => {
      const response = await organizationService.getMembers(orgId);
      return response.data;
    },
    enabled: enabled && !!orgId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Project Hooks
// ============================================================================

export function useProjects(orgId?: string, options?: UseQueryOptions<Project[]>) {
  return useQuery<Project[]>({
    queryKey: tenantQueryKeys.projects.list(orgId),
    queryFn: async () => {
      const response = await projectService.getAll(orgId);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useProject(id: string, enabled = true, options?: UseQueryOptions<Project>) {
  return useQuery<Project>({
    queryKey: tenantQueryKeys.projects.detail(id),
    queryFn: async () => {
      const response = await projectService.getById(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useProjectMembers(projectId: string, enabled = true, options?: UseQueryOptions<ProjectMember[]>) {
  return useQuery<ProjectMember[]>({
    queryKey: tenantQueryKeys.projects.members(projectId),
    queryFn: async () => {
      const response = await projectService.getMembers(projectId);
      return response.data;
    },
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useCurrentProjectMember(projectId: string, enabled = true, options?: UseQueryOptions<ProjectMember>) {
  return useQuery<ProjectMember>({
    queryKey: tenantQueryKeys.projects.currentMember(projectId),
    queryFn: async () => {
      const response = await projectService.getCurrentMember(projectId);
      return response.data;
    },
    enabled: enabled && !!projectId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useProjectInvitations(projectId: string, enabled = true, options?: UseQueryOptions<ProjectInvitation[]>) {
  return useQuery<ProjectInvitation[]>({
    queryKey: tenantQueryKeys.projects.invitations(projectId),
    queryFn: async () => {
      const response = await projectService.getInvitations(projectId);
      return response.data;
    },
    enabled: enabled && !!projectId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

export function useProjectActivity(
  projectId: string, 
  filters?: ActivityFilters,
  enabled = true, 
  options?: UseQueryOptions<ProjectActivity[]>
) {
  return useQuery<ProjectActivity[]>({
    queryKey: tenantQueryKeys.projects.activity(projectId, filters),
    queryFn: async () => {
      const response = await projectService.getActivity(projectId, filters);
      return response.data;
    },
    enabled: enabled && !!projectId,
    staleTime: 30 * 1000,
    ...options,
  });
}

// ============================================================================
// Dashboard Hooks
// ============================================================================

export function useProjectDashboard(
  projectId: string,
  view?: DashboardView,
  enabled = true,
  options?: UseQueryOptions<ProjectDashboard>
) {
  return useQuery<ProjectDashboard>({
    queryKey: tenantQueryKeys.dashboard.project(projectId, view),
    queryFn: async () => {
      const response = await dashboardService.getDashboard(projectId, view);
      return response.data;
    },
    enabled: enabled && !!projectId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

export function useExecutiveSummary(projectId: string, enabled = true, options?: UseQueryOptions<ExecutiveSummary>) {
  return useQuery<ExecutiveSummary>({
    queryKey: tenantQueryKeys.dashboard.executive(projectId),
    queryFn: async () => {
      const response = await dashboardService.getExecutiveSummary(projectId);
      return response.data;
    },
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useArchitectSummary(projectId: string, enabled = true, options?: UseQueryOptions<ArchitectSummary>) {
  return useQuery<ArchitectSummary>({
    queryKey: tenantQueryKeys.dashboard.architect(projectId),
    queryFn: async () => {
      const response = await dashboardService.getArchitectSummary(projectId);
      return response.data;
    },
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useSecuritySummary(projectId: string, enabled = true, options?: UseQueryOptions<SecuritySummary>) {
  return useQuery<SecuritySummary>({
    queryKey: tenantQueryKeys.dashboard.security(projectId),
    queryFn: async () => {
      const response = await dashboardService.getSecuritySummary(projectId);
      return response.data;
    },
    enabled: enabled && !!projectId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// User Hooks
// ============================================================================

export function useCurrentUser(options?: UseQueryOptions<User>) {
  return useQuery<User>({
    queryKey: tenantQueryKeys.user.current,
    queryFn: async () => {
      const response = await userService.getCurrentUser();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useUserOrganizations(options?: UseQueryOptions<Organization[]>) {
  return useQuery<Organization[]>({
    queryKey: tenantQueryKeys.user.organizations,
    queryFn: async () => {
      const response = await userService.getMyOrganizations();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useUserProjects(options?: UseQueryOptions<Project[]>) {
  return useQuery<Project[]>({
    queryKey: tenantQueryKeys.user.projects,
    queryFn: async () => {
      const response = await userService.getMyProjects();
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useUserInvitations(options?: UseQueryOptions<ProjectInvitation[]>) {
  return useQuery<ProjectInvitation[]>({
    queryKey: tenantQueryKeys.user.invitations,
    queryFn: async () => {
      const response = await userService.getMyInvitations();
      return response.data;
    },
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: OrganizationCreateParams) => {
      const response = await organizationService.create(params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.organizations.all });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, params }: { id: string; params: OrganizationUpdateParams }) => {
      const response = await organizationService.update(id, params);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.organizations.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.organizations.all });
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: ProjectCreateParams) => {
      const response = await projectService.create(params);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.projects.list(variables.organizationId) });
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.user.projects });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, params }: { id: string; params: ProjectUpdateParams }) => {
      const response = await projectService.update(id, params);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.projects.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.projects.all });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await projectService.archive(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.projects.detail(id) });
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.projects.all });
    },
  });
}

export function useInviteProjectMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, params }: { projectId: string; params: MemberInviteParams }) => {
      const response = await projectService.inviteMember(projectId, params);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.projects.invitations(variables.projectId) });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, memberId, role }: { projectId: string; memberId: string; role: UserRole }) => {
      const response = await projectService.updateMemberRole(projectId, memberId, role);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.projects.members(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.projects.currentMember(variables.projectId) });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, memberId }: { projectId: string; memberId: string }) => {
      await projectService.removeMember(projectId, memberId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.projects.members(variables.projectId) });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await userService.acceptInvitation(invitationId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.user.invitations });
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.user.projects });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invitationId: string) => {
      await userService.declineInvitation(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.user.invitations });
    },
  });
}

export function useSetDashboardView() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, view }: { projectId: string; view: DashboardView }) => {
      await dashboardService.setDashboardView(projectId, view);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.dashboard.project(variables.projectId) });
    },
  });
}
