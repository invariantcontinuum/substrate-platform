/**
 * Connector Mock Data
 * Mock data for Connector Marketplace and Installed Connectors
 */

import type {
  ConnectorDefinition,
  ConnectorMarketplaceItem,
  InstalledConnector,
  ConnectorTemplate,
} from '@/types';

import definitionsData from './definitions.json';
import installedData from './installed.json';
import templatesData from './templates.json';

// ============================================================================
// Mock Connector Definitions (Marketplace)
// ============================================================================

export const mockConnectorDefinitions: ConnectorDefinition[] = definitionsData as unknown as ConnectorDefinition[];

// ============================================================================
// Mock Installed Connectors
// ============================================================================

const rawInstalledConnectors = installedData as any[];

// Hydrate installed connectors with definitions
export const mockInstalledConnectors: InstalledConnector[] = rawInstalledConnectors.map(conn => {
  const definition = mockConnectorDefinitions.find(d => d.id === conn.definitionId);
  return {
    ...conn,
    definition,
  };
}) as InstalledConnector[];

// ============================================================================
// Mock Connector Templates
// ============================================================================

export const mockConnectorTemplates: ConnectorTemplate[] = templatesData as unknown as ConnectorTemplate[];

// ============================================================================
// Helpers
// ============================================================================

export function getMockMarketplaceItems(projectId?: string): ConnectorMarketplaceItem[] {
  const installedIds = new Set(
    mockInstalledConnectors
      .filter(c => !projectId || c.projectId === projectId)
      .map(c => c.definitionId)
  );

  return mockConnectorDefinitions.map(def => ({
    ...def,
    installed: installedIds.has(def.id),
    installedVersion: mockInstalledConnectors.find(c => c.definitionId === def.id)?.definition?.version,
    installStatus: mockInstalledConnectors.find(c => c.definitionId === def.id)?.status, // Type cast or logic might be needed if status is strictly "installed" | "error" etc. but find returns undefined.
  }));
}
