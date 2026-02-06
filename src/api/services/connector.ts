/**
 * Connector Marketplace Services
 * API services for connector discovery, installation, and management
 * Config over code - generic APIs, no connector-specific logic
 */

import { BaseService } from './base';
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
// Marketplace Service
// ============================================================================

class ConnectorMarketplaceService extends BaseService {
  protected readonly basePath = '/connectors/marketplace';

  /**
   * Get available connectors from the marketplace
   */
  getAvailable(filters?: ConnectorMarketplaceFilters): Promise<{ data: ConnectorMarketplaceItem[] }> {
    return this.get('', filters);
  }

  /**
   * Get a specific connector definition
   */
  getDefinition(connectorId: string): Promise<{ data: ConnectorDefinition }> {
    return this.get(`/${connectorId}`);
  }

  /**
   * Get connector categories
   */
  getCategories(): Promise<{ data: Array<{ id: string; name: string; description: string; icon: string }> }> {
    return this.get('/categories');
  }

  /**
   * Search connectors
   */
  search(query: string, filters?: ConnectorMarketplaceFilters): Promise<{ data: ConnectorMarketplaceItem[] }> {
    return this.get('/search', { q: query, ...filters });
  }

  /**
   * Get templates for a connector
   */
  getTemplates(connectorId: string): Promise<{ data: ConnectorTemplate[] }> {
    return this.get(`/${connectorId}/templates`);
  }
}

// ============================================================================
// Installed Connector Service
// ============================================================================

class InstalledConnectorService extends BaseService {
  protected readonly basePath = '/connectors';

  /**
   * Get all installed connectors for a project
   */
  getInstalled(projectId: string): Promise<{ data: InstalledConnector[] }> {
    return this.get('', { projectId });
  }

  /**
   * Get a specific installed connector
   */
  getById(connectorId: string): Promise<{ data: InstalledConnector }> {
    return this.get(`/${connectorId}`);
  }

  /**
   * Install a connector to a project
   */
  install(projectId: string, request: ConnectorInstallRequest): Promise<{ data: InstalledConnector }> {
    return this.post('/install', { projectId, ...request });
  }

  /**
   * Update an installed connector's configuration
   */
  updateConfig(connectorId: string, config: Record<string, unknown>): Promise<{ data: InstalledConnector }> {
    return this.patch(`/${connectorId}/config`, config);
  }

  /**
   * Update sync configuration
   */
  updateSyncConfig(connectorId: string, syncConfig: Record<string, unknown>): Promise<{ data: InstalledConnector }> {
    return this.patch(`/${connectorId}/sync`, syncConfig);
  }

  /**
   * Remove an installed connector
   */
  remove(connectorId: string): Promise<{ data: void }> {
    return this.del(`/${connectorId}`);
  }

  /**
   * Test connector connection
   */
  testConnection(connectorId: string): Promise<{ data: { success: boolean; message?: string } }> {
    return this.post(`/${connectorId}/test`);
  }

  /**
   * Get connector health status
   */
  getHealth(connectorId: string): Promise<{ data: ConnectorHealth }> {
    return this.get(`/${connectorId}/health`);
  }

  /**
   * Trigger a manual sync
   */
  triggerSync(connectorId: string, options?: { full?: boolean; entityTypes?: string[] }): Promise<{ data: ConnectorSyncJob }> {
    return this.post(`/${connectorId}/sync`, options);
  }

  /**
   * Get sync history
   */
  getSyncHistory(connectorId: string, limit?: number): Promise<{ data: ConnectorSyncJob[] }> {
    return this.get(`/${connectorId}/sync/history`, { limit });
  }

  /**
   * Get sync job details
   */
  getSyncJob(connectorId: string, jobId: string): Promise<{ data: ConnectorSyncJob }> {
    return this.get(`/${connectorId}/sync/${jobId}`);
  }

  /**
   * Update an installed connector to a new version
   */
  updateVersion(connectorId: string, version: string): Promise<{ data: InstalledConnector }> {
    return this.post(`/${connectorId}/update`, { version });
  }
}

// ============================================================================
// Connector Credential Service
// ============================================================================

class ConnectorCredentialService extends BaseService {
  protected readonly basePath = '/connectors/credentials';

  /**
   * Store new credentials
   */
  storeCredentials(connectorId: string, credentials: Record<string, string>): Promise<{ data: { credentialId: string } }> {
    return this.post('', { connectorId, credentials });
  }

  /**
   * Update existing credentials
   */
  updateCredentials(credentialId: string, credentials: Record<string, string>): Promise<{ data: void }> {
    return this.patch(`/${credentialId}`, { credentials });
  }

  /**
   * Delete credentials
   */
  deleteCredentials(credentialId: string): Promise<{ data: void }> {
    return this.del(`/${credentialId}`);
  }

  /**
   * Validate credentials without storing
   */
  validateCredentials(connectorId: string, credentials: Record<string, string>): Promise<{ data: { valid: boolean; message?: string } }> {
    return this.post('/validate', { connectorId, credentials });
  }
}

// ============================================================================
// Service Exports
// ============================================================================

export const connectorMarketplaceService = new ConnectorMarketplaceService();
export const installedConnectorService = new InstalledConnectorService();
export const connectorCredentialService = new ConnectorCredentialService();
