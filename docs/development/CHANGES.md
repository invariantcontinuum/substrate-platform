# API Refactoring Changes

## Summary
Consolidated API-first approach with automatic fallback to mock data. All changes follow SOLID, DRY, and KISS principles.

## New Files Created

### Core API Types
- `src/api/openapi.yaml` - OpenAPI specification (moved from docs/)
- `src/api/types.ts` - TypeScript types generated from OpenAPI spec
- `src/api/hooks/types.ts` - Hook-specific types

### Documentation
- `docs/development/api-refactor-summary.md` - Comprehensive refactoring documentation

## Modified Files

### Mock Data Layer
- `src/api/mock/data/index.ts`
  - Added `handleUIConfigRequest()` for `/ui-config/*` endpoints
  - Added `/memory/stats` endpoint handler
  - Added memory stats interface
  - Fixed switch case declarations

- `src/api/mock/data/memory/audit.json`
  - Added `stats` object with persona depth, knowledge saved, and system confidence

### Service Layer
- `src/api/services/index.ts`
  - Added `UIConfigService` with OpenAPI-compliant paths (`/ui-config/*`)
  - Added `MemoryStats` interface
  - Added `getStats()` method to `MemoryService`
  - Deprecated old `UIService` (backward compatibility maintained)

### Hook Layer
- `src/api/hooks/index.ts`
  - Added `useDriftAnalysis()` hook for drift detection display
  - Added `useMemoryStats()` hook for memory statistics
  - Consolidated type imports to prevent duplicates
  - Added proper exports

### Component Layer
- `src/pages/MemoryInterface.tsx`
  - Replaced hardcoded stats with `useMemoryStats()` hook
  - Added loading skeleton states
  - Maintained backward compatibility

- `src/pages/KnowledgeFabric.tsx`
  - Replaced hardcoded drift message with `useDriftAnalysis()` hook
  - Added conditional rendering based on actual violation data
  - Added loading and empty states

### Exports
- `src/api/index.ts`
  - Added new service exports (`uiConfigService`)
  - Added new hook exports (`useDriftAnalysis`, `useMemoryStats`)
  - Added comprehensive type exports from `src/api/types.ts`

## API Endpoints Now Supported

### Graph
- `GET /graph/nodes` - Filter by type, lens, query
- `GET /graph/edges` - Filter by from, to, lens
- `POST /graph/subgraph` - Extract subgraph
- `GET /graph/communities` - Get communities
- `GET /graph/metrics` - Get metrics

### Policies
- `GET /policies` - List with filters
- `POST /policies` - Create policy
- `GET /policies/:id` - Get policy
- `PUT /policies/:id` - Update policy
- `DELETE /policies/:id` - Delete policy
- `POST /policies/:id/evaluate` - Evaluate policy
- `GET /policies/templates` - Get templates
- `GET /policies/metadata` - Get metadata

### Drift
- `GET /drift/violations` - List violations
- `GET /drift/violations/:id` - Get violation
- `POST /drift/violations/:id/resolve` - Resolve violation
- `GET /drift/summary` - Get summary
- `GET /drift/timeline` - Get timeline

### Search
- `POST /search` - Search
- `GET /search/evidence` - Get evidence
- `GET /search/reasoning` - Get reasoning

### Sync
- `POST /sync` - Trigger sync
- `GET /sync/:id/status` - Get status

### Health
- `GET /health` - Health check
- `GET /health/metrics/dashboard` - Dashboard metrics

### UI Config (OpenAPI spec compliant)
- `GET /ui-config/lens` - Lens configuration
- `GET /ui-config/legend` - Legend items
- `GET /ui-config/actions/analysis` - Analysis actions
- `GET /ui-config/actions/drift` - Drift actions

### Memory
- `GET /memory/audit` - Audit items
- `GET /memory/audit/:id` - Audit item
- `GET /memory/stats` - Memory statistics (NEW)

## Fallback Behavior

The API client (`src/api/client.ts`) follows this priority:

1. **Try Real API** - Make request to `VITE_API_BASE_URL`
2. **Retry with backoff** - Configurable retry count
3. **Fallback to Mock** - If enabled and API fails, use mock data
4. **Return Error** - If mock fallback disabled, return error

## Configuration

Environment variables control the behavior:

```env
VITE_ENABLE_MOCK_API=true        # Enable mock fallback
VITE_MOCK_API_DELAY=500          # Simulate network delay
VITE_API_BASE_URL=/api           # Real API base URL
VITE_API_TIMEOUT=30000           # Request timeout
```

## Usage Examples

### Using Hooks
```tsx
// Before: Hardcoded data
const stats = { value: 42 };

// After: API with automatic fallback
const { data: stats, isLoading } = useMemoryStats();
if (isLoading) return <Skeleton />;
```

### Using Services Directly
```tsx
import { api } from '@/api';

// Automatic fallback to mock if API fails
const response = await api.memory.getStats();
console.log(response.data); // MemoryStats
```

### Type Safety
```tsx
import type { ApiResponse, DriftViolation } from '@/api';

const handleResponse = (response: ApiResponse<DriftViolation>) => {
  // Type-safe access to response.data
  console.log(response.data.id);
};
```

## Migration Notes

### For Components with Hardcoded Data
1. Identify the hardcoded values
2. Find or create corresponding hook in `src/api/hooks/index.ts`
3. Replace hardcoded values with hook usage
4. Add loading states
5. Test both API and fallback modes

### For New Endpoints
1. Add to OpenAPI spec: `src/api/openapi.yaml`
2. Add types: `src/api/types.ts`
3. Add service: `src/api/services/*.ts`
4. Add mock handler: `src/api/mock/data/index.ts`
5. Add hook: `src/api/hooks/index.ts`
6. Export: `src/api/index.ts`

## Testing

Run the build to verify everything compiles:
```bash
npm run build
```

Run lint to check for issues:
```bash
npm run lint
```

Run development server with mock enabled:
```bash
npm run dev
```
