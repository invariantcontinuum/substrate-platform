/**
 * Environment Configuration
 * Centralized access to all environment variables with type safety
 * Following Single Responsibility Principle - this module only handles env config
 */

import { z } from 'zod';

// Environment schema validation
const envSchema = z.object({
  // App Settings
  VITE_APP_NAME: z.string().default('Structural Integrity Platform'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_APP_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_APP_DESCRIPTION: z.string().default('Multi-modal knowledge graph platform for architectural governance'),

  // API Configuration
  VITE_API_BASE_URL: z.string().default('/api'),
  VITE_API_TIMEOUT: z.coerce.number().default(30000),
  VITE_API_VERSION: z.string().default('v1'),
  VITE_ENABLE_MOCK_API: z.coerce.boolean().default(true),
  VITE_MOCK_API_DELAY: z.coerce.number().default(500),

  // Graph Visualization
  VITE_DEFAULT_GRAPH_LAYOUT: z.enum(['forceatlas2', 'dagre', 'circle', 'grid']).default('forceatlas2'),
  VITE_GRAPH_MAX_NODES: z.coerce.number().default(1000),
  VITE_GRAPH_ENABLE_WEBGL: z.coerce.boolean().default(true),
  VITE_GRAPH_NODE_SIZE: z.coerce.number().default(8),
  VITE_GRAPH_EDGE_WIDTH: z.coerce.number().default(1),

  // LLM Configuration
  VITE_LLM_PROVIDER: z.enum(['openai', 'anthropic', 'azure', 'ollama', 'custom']).default('ollama'),
  VITE_LLM_BASE_URL: z.string().default('http://localhost:11434'),
  VITE_LLM_DEFAULT_MODEL: z.string().default('codellama:13b'),
  VITE_LLM_MAX_TOKENS: z.coerce.number().default(2048),
  VITE_LLM_TEMPERATURE: z.coerce.number().default(0.3),

  // Authentication
  VITE_AUTH_PROVIDER: z.enum(['none', 'oauth', 'saml', 'ldap']).default('none'),
  VITE_OAUTH_CLIENT_ID: z.string().optional(),
  VITE_OAUTH_AUTHORITY: z.string().optional(),
  VITE_OAUTH_REDIRECT_URI: z.string().default('http://localhost:5173/callback'),
  VITE_OAUTH_SCOPES: z.string().default('openid profile email'),

  // Feature Flags
  VITE_FEATURE_WEBSOCKET: z.coerce.boolean().default(false),
  VITE_FEATURE_GRAPH_DIFF: z.coerce.boolean().default(true),
  VITE_FEATURE_POLICY_EDITOR: z.coerce.boolean().default(true),
  VITE_FEATURE_RAG_SEARCH: z.coerce.boolean().default(true),
  VITE_FEATURE_DRIFT_REMEDIATION: z.coerce.boolean().default(true),

  // Data Source Connectors
  VITE_GITHUB_ENABLED: z.coerce.boolean().default(true),
  VITE_JIRA_ENABLED: z.coerce.boolean().default(true),
  VITE_CONFLUENCE_ENABLED: z.coerce.boolean().default(true),
  VITE_SLACK_ENABLED: z.coerce.boolean().default(false),
  VITE_SYNC_INTERVAL_MINUTES: z.coerce.number().default(15),

  // Analytics
  VITE_ENABLE_ERROR_TRACKING: z.coerce.boolean().default(false),
  VITE_ANALYTICS_PROVIDER: z.enum(['none', 'posthog', 'amplitude', 'segment']).default('none'),
  VITE_ANALYTICS_API_KEY: z.string().optional(),

  // Development
  VITE_ENABLE_REACT_QUERY_DEVTOOLS: z.coerce.boolean().default(true),
  VITE_ENABLE_ZUSTAND_DEVTOOLS: z.coerce.boolean().default(true),
  VITE_MOCK_SCENARIO: z.enum(['default', 'drift-heavy', 'clean', 'empty']).default('default'),
});

// Parse and validate environment variables
const parseEnv = (): z.infer<typeof envSchema> => {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    // Return defaults for development
    return envSchema.parse({});
  }
};

export const env = parseEnv();

// Derived configuration objects for specific domains
export const apiConfig = {
  baseURL: env.VITE_API_BASE_URL,
  timeout: env.VITE_API_TIMEOUT,
  version: env.VITE_API_VERSION,
  enableMock: env.VITE_ENABLE_MOCK_API,
  mockDelay: env.VITE_MOCK_API_DELAY,
} as const;

export const graphConfig = {
  defaultLayout: env.VITE_DEFAULT_GRAPH_LAYOUT,
  maxNodes: env.VITE_GRAPH_MAX_NODES,
  enableWebGL: env.VITE_GRAPH_ENABLE_WEBGL,
  nodeSize: env.VITE_GRAPH_NODE_SIZE,
  edgeWidth: env.VITE_GRAPH_EDGE_WIDTH,
} as const;

export const llmConfig = {
  provider: env.VITE_LLM_PROVIDER,
  baseUrl: env.VITE_LLM_BASE_URL,
  defaultModel: env.VITE_LLM_DEFAULT_MODEL,
  maxTokens: env.VITE_LLM_MAX_TOKENS,
  temperature: env.VITE_LLM_TEMPERATURE,
} as const;

export const featureFlags = {
  websocket: env.VITE_FEATURE_WEBSOCKET,
  graphDiff: env.VITE_FEATURE_GRAPH_DIFF,
  policyEditor: env.VITE_FEATURE_POLICY_EDITOR,
  ragSearch: env.VITE_FEATURE_RAG_SEARCH,
  driftRemediation: env.VITE_FEATURE_DRIFT_REMEDIATION,
} as const;

export const connectorConfig = {
  github: env.VITE_GITHUB_ENABLED,
  jira: env.VITE_JIRA_ENABLED,
  confluence: env.VITE_CONFLUENCE_ENABLED,
  slack: env.VITE_SLACK_ENABLED,
  syncIntervalMinutes: env.VITE_SYNC_INTERVAL_MINUTES,
} as const;

export const isDevelopment = env.VITE_APP_ENVIRONMENT === 'development';
export const isProduction = env.VITE_APP_ENVIRONMENT === 'production';
export const isStaging = env.VITE_APP_ENVIRONMENT === 'staging';
