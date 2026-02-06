/**
 * Project Context Store
 * Multi-tenant state management for Users → Organizations → Projects
 * Following DRY principle - single source of truth for project context
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { env, isDevelopment } from '@/config/env';
import type {
  Project,
  Organization,
  ProjectMember,
  User,
  Permission,
  DashboardView,
  UserRole,
} from '@/types';
import { ROLE_DEFINITIONS } from '@/types';

// ============================================================================
// State Types
// ============================================================================

interface ProjectState {
  // Current Context
  currentOrganization: Organization | null;
  currentProject: Project | null;
  currentMember: ProjectMember | null;
  currentUser: User | null;
  
  // Available contexts
  organizations: Organization[];
  projects: Project[];
  
  // UI State
  isLoading: boolean;
  isContextPanelOpen: boolean;
  dashboardView: DashboardView;
  
  // Actions
  setCurrentOrganization: (org: Organization | null) => void;
  setCurrentProject: (project: Project | null) => void;
  setCurrentMember: (member: ProjectMember | null) => void;
  setCurrentUser: (user: User | null) => void;
  setOrganizations: (orgs: Organization[]) => void;
  setProjects: (projects: Project[]) => void;
  setLoading: (loading: boolean) => void;
  toggleContextPanel: () => void;
  setContextPanelOpen: (open: boolean) => void;
  setDashboardView: (view: DashboardView) => void;
  
  // Helper actions
  switchProject: (projectId: string) => void;
  switchOrganization: (orgId: string) => void;
  
  // Reset
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState = {
  currentOrganization: null as Organization | null,
  currentProject: null as Project | null,
  currentMember: null as ProjectMember | null,
  currentUser: null as User | null,
  organizations: [] as Organization[],
  projects: [] as Project[],
  isLoading: false,
  isContextPanelOpen: false,
  dashboardView: 'engineer' as DashboardView,
};

// ============================================================================
// Store Creation
// ============================================================================

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Setters
        setCurrentOrganization: (org) => 
          set({ currentOrganization: org }, false, 'setCurrentOrganization'),
        
        setCurrentProject: (project) => 
          set({ currentProject: project }, false, 'setCurrentProject'),
        
        setCurrentMember: (member) => 
          set({ currentMember: member }, false, 'setCurrentMember'),
        
        setCurrentUser: (user) => 
          set({ currentUser: user }, false, 'setCurrentUser'),
        
        setOrganizations: (orgs) => 
          set({ organizations: orgs }, false, 'setOrganizations'),
        
        setProjects: (projects) => 
          set({ projects }, false, 'setProjects'),
        
        setLoading: (loading) => 
          set({ isLoading: loading }, false, 'setLoading'),
        
        toggleContextPanel: () =>
          set(
            (state) => ({ isContextPanelOpen: !state.isContextPanelOpen }),
            false,
            'toggleContextPanel'
          ),
        
        setContextPanelOpen: (open) =>
          set({ isContextPanelOpen: open }, false, 'setContextPanelOpen'),
        
        setDashboardView: (view) =>
          set({ dashboardView: view }, false, 'setDashboardView'),

        // Helper actions
        switchProject: (projectId) => {
          const project = get().projects.find(p => p.id === projectId);
          if (project) {
            set({ 
              currentProject: project,
              isContextPanelOpen: false,
            }, false, 'switchProject');
          }
        },
        
        switchOrganization: (orgId) => {
          const org = get().organizations.find(o => o.id === orgId);
          if (org) {
            set({ 
              currentOrganization: org,
              currentProject: null, // Reset project when switching orgs
              isContextPanelOpen: false,
            }, false, 'switchOrganization');
          }
        },

        // Reset
        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'project-store',
        partialize: (state) => ({
          currentOrganization: state.currentOrganization,
          currentProject: state.currentProject,
          dashboardView: state.dashboardView,
        }),
      }
    ),
    { name: 'ProjectStore', enabled: isDevelopment && env.VITE_ENABLE_ZUSTAND_DEVTOOLS }
  )
);

// ============================================================================
// Computed Selectors
// ============================================================================

export const useCurrentProject = () => useProjectStore((state) => state.currentProject);
export const useCurrentOrganization = () => useProjectStore((state) => state.currentOrganization);
export const useCurrentMember = () => useProjectStore((state) => state.currentMember);
export const useCurrentUser = () => useProjectStore((state) => state.currentUser);
export const useProjectLoading = () => useProjectStore((state) => state.isLoading);
export const useContextPanelOpen = () => useProjectStore((state) => state.isContextPanelOpen);
export const useDashboardView = () => useProjectStore((state) => state.dashboardView);
export const useOrganizations = () => useProjectStore((state) => state.organizations);
export const useProjects = () => useProjectStore((state) => state.projects);

// ============================================================================
// Permission Selectors
// ============================================================================

export const useHasPermission = (permission: Permission) => 
  useProjectStore((state) => {
    if (!state.currentMember) return false;
    const perms = state.currentMember.permissions?.length > 0 
      ? state.currentMember.permissions 
      : ROLE_DEFINITIONS[state.currentMember.role].permissions;
    return perms.includes(permission);
  });

export const useHasAnyPermission = (permissions: Permission[]) =>
  useProjectStore((state) => {
    if (!state.currentMember) return false;
    const perms = state.currentMember.permissions?.length > 0 
      ? state.currentMember.permissions 
      : ROLE_DEFINITIONS[state.currentMember.role].permissions;
    return permissions.some(p => perms.includes(p));
  });

export const useHasAllPermissions = (permissions: Permission[]) =>
  useProjectStore((state) => {
    if (!state.currentMember) return false;
    const perms = state.currentMember.permissions?.length > 0 
      ? state.currentMember.permissions 
      : ROLE_DEFINITIONS[state.currentMember.role].permissions;
    return permissions.every(p => perms.includes(p));
  });

export const useUserRole = () => 
  useProjectStore((state) => state.currentMember?.role ?? null);

export const useIsOwner = () => 
  useProjectStore((state) => state.currentMember?.role === 'owner');

export const useIsAdmin = () => 
  useProjectStore((state) => ['owner', 'admin'].includes(state.currentMember?.role ?? ''));

export const useCanManageProject = () =>
  useProjectStore((state) => {
    const role = state.currentMember?.role;
    return role === 'owner' || role === 'admin';
  });

// ============================================================================
// View-Aware Selectors
// ============================================================================

export const useEffectiveDashboardView = (): DashboardView =>
  useProjectStore((state) => {
    // If explicitly set, use that
    if (state.dashboardView) return state.dashboardView;
    
    // Otherwise derive from role
    const role = state.currentMember?.role;
    switch (role) {
      case 'owner':
      case 'admin':
        return 'executive';
      case 'security':
        return 'security';
      case 'product':
        return 'product';
      case 'readonly':
        return 'executive';
      case 'engineer':
      default:
        return 'engineer';
    }
  });

// ============================================================================
// Helper Functions (non-hook)
// ============================================================================

export function checkPermission(
  member: ProjectMember | null | undefined,
  permission: Permission
): boolean {
  if (!member) return false;
  const perms = member.permissions?.length > 0 
    ? member.permissions 
    : ROLE_DEFINITIONS[member.role].permissions;
  return perms.includes(permission);
}

export function checkAnyPermission(
  member: ProjectMember | null | undefined,
  permissions: Permission[]
): boolean {
  if (!member) return false;
  return permissions.some(p => checkPermission(member, p));
}
