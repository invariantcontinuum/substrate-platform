/**
 * API Setup
 * Initialize API client with mock provider
 * Call this once during app initialization
 */

import { apiClient } from './client';
import { mockProvider } from './mock/data';

export function setupApi(): void {
  // Configure mock provider for fallback
  apiClient.setMockProvider(mockProvider);
  
  // Optional: Log fallback events in development
  if (import.meta.env.DEV) {
    console.info('[API] Initialized with mock fallback enabled');
  }
}
