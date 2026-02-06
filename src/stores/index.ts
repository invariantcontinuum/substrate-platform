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
  useCurrentUser,
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
