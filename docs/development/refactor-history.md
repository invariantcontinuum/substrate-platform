# Refactor Summary - API-First Architecture with Mock Fallback

## Overview
This refactor implements a clean, SOLID, DRY architecture with an API-first approach that automatically falls back to mock data when the real API is unavailable.

## Principles Applied

### SOLID Principles
- **Single Responsibility**: Each module has one reason to change
  - `ApiClient` handles HTTP only
  - Services handle domain logic only
  - Hooks handle React Query integration only
  - Mock provider handles mock data only

- **Open/Closed**: New services can be added without modifying existing code
- **Liskov Substitution**: Mock and real APIs are interchangeable
- **Interface Segregation**: Small, focused interfaces for each domain
- **Dependency Inversion**: Code depends on abstractions, not implementations

### DRY (Don't Repeat Yourself)
- Single barrel export for all API operations
- Reusable query key factory
- Base service class with common HTTP methods
- Consolidated mock data registry

### KISS (Keep It Simple, Stupid)
- Predictable file structure
- Consistent naming conventions
- Minimal boilerplate
- Clear separation of concerns

## New Architecture

```
src/
├── api/
│   ├── index.ts           # Barrel export - single entry point
│   ├── setup.ts           # Initialize API with mock provider
│   ├── client.ts          # API client with fallback logic
│   ├── services/
│   │   └── index.ts       # All services (DRY - uses BaseService)
│   ├── hooks/
│   │   └── index.ts       # All React Query hooks (typed)
│   └── mock/
│       └── data/
│           ├── index.ts   # Mock data registry & provider
│           ├── graph/     # Graph-related mock data
│           ├── policies/  # Policy mock data
│           ├── drift/     # Drift violation mock data
│           ├── health/    # Health check mock data
│           ├── sync/      # Sync job mock data
│           ├── ui/        # UI config mock data
│           ├── memory/    # Memory/audit mock data
│           ├── search/    # Search evidence mock data
│           └── *.yaml     # YAML files alongside JSON
├── hooks/
│   └── index.ts           # Re-exports from api/hooks
├── types/
│   └── index.ts           # All TypeScript types
└── ...
```

## Key Features

### 1. API-First with Automatic Fallback
```typescript
// The client tries real API first, falls back to mock on failure
const response = await api.graph.getNodes();
// If API fails and VITE_ENABLE_MOCK_API=true, returns mock data
```

### 2. Centralized Mock Data
- JSON and YAML files organized by domain
- Single `MockDataRegistry` for access
- Smart `mockProvider` maps endpoints to data

### 3. Type-Safe Hooks
All hooks are fully typed:
```typescript
const { data: policies } = usePolicies(); // Policy[] | undefined
const { data: graph } = useFullGraph();   // GraphData | undefined
```

### 4. DRY Service Layer
```typescript
// BaseService provides common HTTP methods
class GraphService extends BaseService {
  getNodes() { return this.get('/nodes'); }
  getEdges() { return this.get('/edges'); }
}
```

## Usage Examples

### Basic Query
```typescript
import { usePolicies, useFullGraph } from '@/api';

function MyComponent() {
  const { data: policies, isLoading } = usePolicies();
  const { data: graph } = useFullGraph();
  
  if (isLoading) return <Loading />;
  return <div>{policies?.map(p => p.name)}</div>;
}
```

### Mutation
```typescript
import { useResolveViolation } from '@/api';

function ViolationCard({ id }: { id: string }) {
  const resolve = useResolveViolation();
  
  const handleResolve = () => {
    resolve.mutate({ 
      id, 
      resolution: { strategy: 'update_intent', reason: 'Fixed' }
    });
  };
  
  return <button onClick={handleResolve}>Resolve</button>;
}
```

### Direct API Access (if needed)
```typescript
import { api } from '@/api';

// Direct service access
const response = await api.policies.getAll();
const policies = response.data;
```

## Migration Guide

### Old → New
```typescript
// Old way (multiple imports)
import { usePolicies } from '@/hooks/queries/usePolicyQueries';
import { api } from '@/services/api/unified';

// New way (single import)
import { usePolicies, api } from '@/api';
```

### Environment Variables
Mock behavior is controlled by:
- `VITE_ENABLE_MOCK_API=true` - Enable mock fallback
- `VITE_MOCK_API_DELAY=500` - Mock response delay

## Files Removed
- `src/services/` - Old service layer
- `src/data/` - Old scattered data files
- `src/mock/` - Old mock structure
- `src/hooks/queries/` - Old query hooks
- `src/hooks/mutations/` - Old mutation hooks

## Files Added/Modified
- `src/api/` - New consolidated API module
- `src/hooks/index.ts` - Now re-exports from API
- `src/main.tsx` - Added `setupApi()` call
- `src/types/index.ts` - Added missing `AuditItem` type

## Build Verification
```bash
npm run build
# ✓ TypeScript compilation successful
# ✓ Vite build successful

## Docker & Build Optimization (2026-02-06)

### Overview
Refactored the Docker orchestration and build process to improve developer experience, reduce configuration redundancy, and fix critical build-time failures.

### Improvements
- **YAML Anchors in Compose**: Simplified `docker-compose.yml` by abstracting base platform configurations into anchors, reducing the file size and complexity.
- **Lockfile Synchronization**: Synchronized `package-lock.json` with `package.json` to ensure deterministic builds using `npm ci` in Docker.
- **Build Context Fixes**: Adjusted `.dockerignore` to include essential Vite and Tailwind configuration files that were previously ignored, causing build failures.
- **Nginx Resilience**: Commented out upstream dependencies (backend) in Nginx templates to allow the frontend prototype to start successfully in a standalone Docker environment.
- **Simplified Profiles**: Streamlined Docker Compose profiles for easier switching between `http`, `https`, and `monitoring` modes.

### Key Commands Updated
- `docker compose --profile http up -d` - Default development mode.
- `docker compose --profile monitoring up -d` - Full stack with Prometheus and Grafana.

### Verified Build
```bash
docker compose build --no-cache
# ✓ Multi-stage build successful
# ✓ Nginx configuration valid
# ✓ Container health checks passing
```
