/**
 * Stores Barrel Export
 * Following DRY principle - single entry point for all stores
 */

export { useAppStore, useActiveTab, useActiveLens, useIsSyncing, useLogs, useSidebarOpen, useTheme } from './appStore';
export {
  useGraphStore,
  useGraphTransform,
  useSelectedNodes,
  useIsNodeSelected,
  useNodePosition,
} from './graphStore';
export {
  useProjectStore,
  useCurrentProject,
  useCurrentOrganization,
  useCurrentMember,
  useCurrentUser as useProjectCurrentUser,
  useProjectLoading,
  useContextPanelOpen,
  useDashboardView,
  useOrganizations,
  useProjects,
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
  useUserRole,
  useIsOwner,
  useIsAdmin,
  useCanManageProject,
  useEffectiveDashboardView,
  checkPermission,
  checkAnyPermission,
} from './projectStore';

// Auth Store
export {
  useAuthStore,
  useAuthUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  useUserPreferences,
  useIsEmailVerified,
} from './authStore';

// Types
export type { AuthTokens, LoginCredentials, RegisterCredentials } from './authStore';
