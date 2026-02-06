# API Refactor Summary

## Overview

This document summarizes the changes made to consolidate the API-first approach with automatic fallback to mock data, following SOLID, DRY, and KISS principles.

## Changes Made

### 1. OpenAPI Specification Placement
- **File**: `src/api/openapi.yaml` (copied from `docs/openapi.yaml`)
- **Purpose**: Single source of truth for API contracts
- **Alignment**: Mock data and services now match the OpenAPI spec paths exactly

### 2. Mock Data Provider Updates
- **File**: `src/api/mock/data/index.ts`
- **Changes**:
  - Added `handleUIConfigRequest()` to handle `/ui-config/*` endpoints per OpenAPI spec
  - Added `/memory/stats` endpoint for memory statistics
  - Updated `/ui/actions` routing to support both `/ui/actions/analysis` and `/ui/actions/drift`

### 3. Mock Data Enhancements
- **File**: `src/api/mock/data/memory/audit.json`
- **Added**: `stats` object with:
  - `personaDepth`: Level, label, and progress
  - `knowledgeSaved`: ADR count and display label
  - `systemConfidence`: Percentage and trend

### 4. Service Layer Updates
- **File**: `src/api/services/index.ts`
- **Changes**:
  - Created new `UIConfigService` using `/ui-config/*` paths (OpenAPI compliant)
  - Deprecated old `UIService` (kept for backward compatibility)
  - Added `MemoryStats` interface
  - Added `getStats()` method to `MemoryService`

### 5. Hook Enhancements
- **File**: `src/api/hooks/index.ts`
- **New Hooks**:
  - `useDriftAnalysis()` - Returns active drift violation for display
  - `useMemoryStats()` - Returns memory layer statistics
- **Consolidated imports** - All type imports from `@/types` moved to top of file

### 6. Type Safety Improvements
- **New File**: `src/api/types.ts`
- **Contents**:
  - Request types matching OpenAPI spec (SubgraphRequest, PolicyCreate, etc.)
  - Query parameter types (GraphNodesParams, PoliciesParams, etc.)
  - Response wrapper types (ApiResponse<T>)
  - API endpoint type definitions (ApiEndpoints interface)
  - Helper types for type-safe API clients

- **New File**: `src/api/hooks/types.ts`
- **Contents**:
  - Hook-specific types like `DriftAnalysis`

### 7. Component Refactoring

#### MemoryInterface (`src/pages/MemoryInterface.tsx`)
**Before**: Hardcoded stats values
```tsx
<MemoryStat label="Persona Depth" value="Lvl 4 (Expert)" />
<MemoryStat label="Knowledge Saved" value="12 ADRs worth" />
<MemoryStat label="System Confidence" value="94.2%" />
```

**After**: API-driven with loading states
```tsx
const { data: memoryStats, isLoading: statsLoading } = useMemoryStats();
// ... conditional rendering with skeleton loaders
```

#### KnowledgeFabric (`src/pages/KnowledgeFabric.tsx`)
**Before**: Hardcoded drift violation message
```tsx
<p>Found 1 undocumented dependency between DB_ORDERS and SHADOW_TRACKER</p>
<p>VIOLATES POLICY: ADR-022</p>
```

**After**: API-driven drift analysis
```tsx
const { data: driftAnalysis, isLoading: driftLoading } = useDriftAnalysis();
// ... conditional rendering based on actual violation data
```

### 8. Export Consolidation
- **File**: `src/api/index.ts`
- **Added Exports**:
  - New services: `uiConfigService`
  - New hooks: `useDriftAnalysis`, `useMemoryStats`
  - New types: All API types from `src/api/types.ts`

## API-First with Fallback Flow

```
┌─────────────────┐
│   Component     │
│  (uses hooks)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   React Query   │
│    useQuery     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Services     │
│  (api.* calls)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ApiClient     │
│   request()     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌─────────┐
│Real   │ │ Fallback│
│API    │ │  Mock   │
└───────┘ └─────────┘
```

## Key Principles Applied

### SOLID
- **Single Responsibility**: Each service handles one domain, each hook handles one query
- **Open/Closed**: New endpoints can be added without modifying existing code
- **Liskov Substitution**: Mock provider implements same interface as real API
- **Interface Segregation**: Separate types for requests, responses, and parameters
- **Dependency Inversion**: Components depend on hooks (abstraction), not concrete implementations

### DRY
- Centralized query keys in `queryKeys` object
- Single mock data registry in `MockDataRegistry`
- Type definitions reused across services and hooks
- API response wrapper type used consistently

### KISS
- Simple fallback: API fails → use mock
- Clear naming: `useDriftAnalysis` vs `useViolations`
- Predictable structure: `data`, `isLoading`, `error` from all hooks

## File Structure

```
src/api/
├── openapi.yaml          # OpenAPI specification (source of truth)
├── types.ts              # TypeScript types from OpenAPI
├── client.ts             # ApiClient with fallback logic
├── setup.ts              # API initialization
├── index.ts              # Barrel exports
├── hooks/
│   ├── index.ts          # All React Query hooks
│   ├── types.ts          # Hook-specific types
│   ├── tenant.ts         # Tenant-related hooks
│   └── connector.ts      # Connector-related hooks
├── services/
│   ├── index.ts          # All API services
│   ├── base.ts           # BaseService class
│   ├── tenant.ts         # Tenant services
│   └── connector.ts      # Connector services
└── mock/
    └── data/
        ├── index.ts      # Mock provider & registry
        ├── graph/
        ├── policies/
        ├── drift/
        ├── health/
        ├── sync/
        ├── ui/
        ├── memory/
        ├── search/
        ├── tenant/
        └── connector/
```

## Environment Configuration

Mock fallback behavior controlled by environment variables:

```env
VITE_ENABLE_MOCK_API=true        # Enable mock fallback
VITE_MOCK_API_DELAY=500          # Simulate network delay (ms)
VITE_API_BASE_URL=/api           # Real API base URL
```

## Testing the Fallback

1. Set `VITE_ENABLE_MOCK_API=true` in `.env`
2. Start the dev server: `npm run dev`
3. Open browser console to see fallback messages
4. Temporarily break an API endpoint to see fallback in action

## Migration Guide

### For New Endpoints

1. Add endpoint to `src/api/openapi.yaml`
2. Add types to `src/api/types.ts`
3. Add service method in `src/api/services/`
4. Add mock data handler in `src/api/mock/data/index.ts`
5. Add hook in `src/api/hooks/index.ts`
6. Export from `src/api/index.ts`

### For Components

Replace hardcoded data with hooks:
```tsx
// Before
const stats = { value: 42 };

// After
const { data: stats, isLoading } = useStats();
if (isLoading) return <Skeleton />;
```
