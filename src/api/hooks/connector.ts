/**
 * Connector Marketplace React Query Hooks
 * DRY, reusable hooks for connector operations
 * Config over code - generic APIs, no connector-specific logic
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  connectorMarketplaceService,
  installedConnectorService,
  connectorCredentialService,
} from '../services';
import type {
  ConnectorDefinition,
  ConnectorMarketplaceItem,
  ConnectorMarketplaceFilters,
  InstalledConnector,
  ConnectorInstallRequest,
  ConnectorSyncJob,
  ConnectorHealth,
  ConnectorTemplate,
} from '@/types';

// ============================================================================
// Query Keys
// ============================================================================

export const connectorQueryKeys = {
  // Marketplace
  marketplace: {
    all: ['connectors', 'marketplace'] as const,
    list: (filters?: ConnectorMarketplaceFilters) => ['connectors', 'marketplace', 'list', filters] as const,
    detail: (id: string) => ['connectors', 'marketplace', 'detail', id] as const,
    templates: (id: string) => ['connectors', 'marketplace', 'templates', id] as const,
    categories: ['connectors', 'marketplace', 'categories'] as const,
  },
  // Installed
  installed: {
    all: ['connectors', 'installed'] as const,
    list: (projectId: string) => ['connectors', 'installed', 'list', projectId] as const,
    detail: (id: string) => ['connectors', 'installed', 'detail', id] as const,
    health: (id: string) => ['connectors', 'installed', 'health', id] as const,
    syncHistory: (id: string, limit?: number) => ['connectors', 'installed', 'sync', id, limit] as const,
    syncJob: (connectorId: string, jobId: string) => ['connectors', 'installed', 'sync', connectorId, 'job', jobId] as const,
  },
} as const;

// ============================================================================
// Marketplace Hooks
// ============================================================================

export function useConnectorMarketplace(
  filters?: ConnectorMarketplaceFilters,
  options?: UseQueryOptions<ConnectorMarketplaceItem[]>
) {
  return useQuery<ConnectorMarketplaceItem[]>({
    queryKey: connectorQueryKeys.marketplace.list(filters),
    queryFn: async () => {
      const response = await connectorMarketplaceService.getAvailable(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useConnectorDefinition(
  connectorId: string,
  enabled = true,
  options?: UseQueryOptions<ConnectorDefinition>
) {
  return useQuery<ConnectorDefinition>({
    queryKey: connectorQueryKeys.marketplace.detail(connectorId),
    queryFn: async () => {
      const response = await connectorMarketplaceService.getDefinition(connectorId);
      return response.data;
    },
    enabled: enabled && !!connectorId,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useConnectorCategories(options?: UseQueryOptions<Array<{ id: string; name: string; description: string; icon: string }>>) {
  return useQuery({
    queryKey: connectorQueryKeys.marketplace.categories,
    queryFn: async () => {
      const response = await connectorMarketplaceService.getCategories();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

export function useConnectorTemplates(
  connectorId: string,
  enabled = true,
  options?: UseQueryOptions<ConnectorTemplate[]>
) {
  return useQuery<ConnectorTemplate[]>({
    queryKey: connectorQueryKeys.marketplace.templates(connectorId),
    queryFn: async () => {
      const response = await connectorMarketplaceService.getTemplates(connectorId);
      return response.data;
    },
    enabled: enabled && !!connectorId,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

// ============================================================================
// Installed Connector Hooks
// ============================================================================

export function useInstalledConnectors(
  projectId: string,
  enabled = true,
  options?: UseQueryOptions<InstalledConnector[]>
) {
  return useQuery<InstalledConnector[]>({
    queryKey: connectorQueryKeys.installed.list(projectId),
    queryFn: async () => {
      const response = await installedConnectorService.getInstalled(projectId);
      return response.data;
    },
    enabled: enabled && !!projectId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

export function useInstalledConnector(
  connectorId: string,
  enabled = true,
  options?: UseQueryOptions<InstalledConnector>
) {
  return useQuery<InstalledConnector>({
    queryKey: connectorQueryKeys.installed.detail(connectorId),
    queryFn: async () => {
      const response = await installedConnectorService.getById(connectorId);
      return response.data;
    },
    enabled: enabled && !!connectorId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

export function useConnectorHealth(
  connectorId: string,
  enabled = true,
  options?: UseQueryOptions<ConnectorHealth>
) {
  return useQuery<ConnectorHealth>({
    queryKey: connectorQueryKeys.installed.health(connectorId),
    queryFn: async () => {
      const response = await installedConnectorService.getHealth(connectorId);
      return response.data;
    },
    enabled: enabled && !!connectorId,
    staleTime: 30 * 1000,
    refetchInterval: enabled ? 30000 : false,
    ...options,
  });
}

export function useConnectorSyncHistory(
  connectorId: string,
  limit?: number,
  enabled = true,
  options?: UseQueryOptions<ConnectorSyncJob[]>
) {
  return useQuery<ConnectorSyncJob[]>({
    queryKey: connectorQueryKeys.installed.syncHistory(connectorId, limit),
    queryFn: async () => {
      const response = await installedConnectorService.getSyncHistory(connectorId, limit);
      return response.data;
    },
    enabled: enabled && !!connectorId,
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useConnectorSyncJob(
  connectorId: string,
  jobId: string,
  enabled = true,
  options?: UseQueryOptions<ConnectorSyncJob>
) {
  return useQuery<ConnectorSyncJob>({
    queryKey: connectorQueryKeys.installed.syncJob(connectorId, jobId),
    queryFn: async () => {
      const response = await installedConnectorService.getSyncJob(connectorId, jobId);
      return response.data;
    },
    enabled: enabled && !!connectorId && !!jobId,
    refetchInterval: enabled ? 2000 : false,
    staleTime: 0,
    ...options,
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useInstallConnector() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ projectId, request }: { projectId: string; request: ConnectorInstallRequest }) => {
      const response = await installedConnectorService.install(projectId, request);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: connectorQueryKeys.installed.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: connectorQueryKeys.marketplace.all });
    },
  });
}

export function useRemoveConnector() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ connectorId, projectId }: { connectorId: string; projectId: string }) => {
      await installedConnectorService.remove(connectorId);
      return { connectorId, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: connectorQueryKeys.installed.list(data.projectId) });
      queryClient.invalidateQueries({ queryKey: connectorQueryKeys.marketplace.all });
    },
  });
}

export function useUpdateConnectorConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ connectorId, config }: { connectorId: string; config: Record<string, unknown> }) => {
      const response = await installedConnectorService.updateConfig(connectorId, config);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: connectorQueryKeys.installed.detail(variables.connectorId) });
    },
  });
}

export function useUpdateConnectorSyncConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ connectorId, syncConfig }: { connectorId: string; syncConfig: Record<string, unknown> }) => {
      const response = await installedConnectorService.updateSyncConfig(connectorId, syncConfig);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: connectorQueryKeys.installed.detail(variables.connectorId) });
    },
  });
}

export function useTestConnectorConnection() {
  return useMutation({
    mutationFn: async (connectorId: string) => {
      const response = await installedConnectorService.testConnection(connectorId);
      return response.data;
    },
  });
}

export function useTriggerConnectorSync() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      connectorId, 
      options 
    }: { 
      connectorId: string; 
      options?: { full?: boolean; entityTypes?: string[] } 
    }) => {
      const response = await installedConnectorService.triggerSync(connectorId, options);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: connectorQueryKeys.installed.syncHistory(variables.connectorId) });
    },
  });
}

export function useUpdateConnectorVersion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ connectorId, version }: { connectorId: string; version: string }) => {
      const response = await installedConnectorService.updateVersion(connectorId, version);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: connectorQueryKeys.installed.detail(variables.connectorId) });
    },
  });
}

export function useValidateCredentials() {
  return useMutation({
    mutationFn: async ({ 
      connectorId, 
      credentials 
    }: { 
      connectorId: string; 
      credentials: Record<string, string> 
    }) => {
      const response = await connectorCredentialService.validateCredentials(connectorId, credentials);
      return response.data;
    },
  });
}

export function useStoreCredentials() {
  return useMutation({
    mutationFn: async ({ 
      connectorId, 
      credentials 
    }: { 
      connectorId: string; 
      credentials: Record<string, string> 
    }) => {
      const response = await connectorCredentialService.storeCredentials(connectorId, credentials);
      return response.data;
    },
  });
}
