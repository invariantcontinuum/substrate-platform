# Frontend Implementation Guide

## Overview

The frontend serves as the visualization and interaction layer for the Structural Integrity Platform, providing graph

 visualization, governance dashboards, and knowledge exploration interfaces.

## Technology Stack (From Blueprint)

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Build** | Vite | 6.x | Native ESM, fast HMR |
| **UI Framework** | React | 19 | Hooks, Suspense, transitions |
| **Components** | shadcn/ui + Radix UI + Tailwind CSS | 4.x | Accessible, composable, dark mode; used by OpenAI and Adobe |
| **Client State** | Zustand | 5.x | ~3KB, no Provider needed, middleware for persistence |
| **Server State** | TanStack Query | 5.x | Caching, background refetching, optimistic mutations |
| **Routing** | TanStack Router | - | File-based, type-safe, automatic code splitting |
| **Validation** | Zod | 3.x | TypeScript-first runtime validation |
| **Graph (Exploration)** | Sigma.js | 3.0.2 | WebGL performance for 100K+ nodes at 60fps |
| **Graph (Architecture)** | Cytoscape.js | 3.x | Rich layout algorithms (Dagre, hierarchical) |
| **Charts** | Recharts + Nivo | 2.x | 9M+ weekly downloads, composable React API |
| **Utilities** | @tanstack/react-virtual | - | Virtualization for long lists |

---

## Project Structure

```
src/
├── routes/                      # TanStack Router pages
│   ├── index.tsx               # Dashboard home
│   ├── graph/                  # Graph visualization routes
│   │   ├── explorer.tsx        # WebGL exploration view
│   │   └── architecture.tsx    # Architecture diagram view
│   ├── governance/             # Policy & drift management
│   │   ├── policies.tsx        # Policy builder
│   │   ├── violations.tsx      # Drift detection alerts
│   │   └── enforcement.tsx     # Graduated enforcement settings
│   ├── knowledge/              # GraphRAG knowledge interface
│   │   ├── search.tsx          # Semantic search
│   │   ├── communities.tsx     # Community summaries
│   │   └── documents.tsx       # Documentation browser
│   └── settings/               # Configuration
│       ├── llm.tsx             # LLM provider settings
│       ├── connectors.tsx      # Data source configuration
│       └── profile.tsx         # User preferences
│
├── components/                  # Feature-based organization
│   ├── graph/                  # Graph visualization components
│   │   ├── SigmaGraph.tsx      # WebGL exploration (Sigma.js)
│   │   ├── ArchitectureDiagram.tsx  # Cytoscape architecture view
│   │   ├── GraphControls.tsx   # Zoom, pan, layout controls
│   │   ├── NodeDetails.tsx     # Entity information panel
│   │   └── DiffVisualization.tsx    # Graph diff view
│   │
│   ├── dashboard/              # Dashboard widgets
│   │   ├── HealthScoreCard.tsx    # Composite health score (A-F)
│   │   ├── DriftAlertsCard.tsx    # Active drift violations
│   │   ├── MetricsTrendChart.tsx  # Time-series trends (Recharts)
│   │   ├── DependencyHeatmap.tsx  # Risk matrix (Nivo)
│   │   └── ServiceCatalog.tsx     # Backstage-inspired entity catalog
│   │
│   ├── governance/             # Policy management components
│   │   ├── PolicyBuilder.tsx       # Visual Rego policy editor
│   │   ├── ViolationCard.tsx       # Drift violation display
│   │   ├── EnforcementToggle.tsx   # Observe/Advise/Enforce selector
│   │   └── PolicyEffectiveness.tsx # False positive tracking
│   │
│   ├── knowledge/              # GraphRAG interfaces
│   │   ├── SemanticSearch.tsx      # Natural language query
│   │   ├── CommunityCard.tsx       # Leiden community summaries
│   │   ├── DocumentTimeline.tsx    # Staleness indicators
│   │   └── EntityResolution.tsx    # Cross-source identity matching
│   │
│   ├── settings/               # Configuration interfaces
│   │   ├── LLMConfiguration.tsx    # Provider/model selection
│   │   ├── ConnectorList.tsx       # Data source management
│   │   ├── OAuth Popup.tsx          # OAuth 2.0 flows
│   │   └── TestConnection.tsx      # Connection validation
│   │
│   └── layout/                 # Application shell
│       ├── Header.tsx          # Top navigation
│       ├── Sidebar.tsx         # Main navigation
│       ├── ThemeToggle.tsx     # Dark/light mode
│       └── Breadcrumbs.tsx     # Route navigation
│
├── hooks/
│   ├── queries/                # TanStack Query data fetching
│   │   ├── useGraphData.ts
│   │   ├── useViolations.ts
│   │   ├── usePolicies.ts
│   │   ├── useCommunities.ts
│   │   └── useMetrics.ts
│   │
│   ├── mutations/              # TanStack Query mutations
│   │   ├── usePolicyUpdate.ts
│   │   ├── useConnectorSync.ts
│   │   └── useViolationAck.ts
│   │
│   └── useWebWorker.ts         # ForceAtlas2 layout offload
│
├── stores/                     # Zustand state management
│   ├── authStore.ts            # Authentication state
│   ├── themeStore.ts           # Dark mode persistence
│   ├── graphStore.ts           # Graph filter/layout state
│   └── settingsStore.ts        # User preferences
│
├── lib/                        # Utilities and helpers
│   ├── api/                    # API client configuration
│   ├── formatters/             # Data formatting utilities
│   ├── validators/             # Zod schemas
│   └── constants.ts            # Application constants
│
└── types/                      # TypeScript definitions
    ├── graph.ts                # Graph entities/edges
    ├── policy.ts               # Governance types
    ├── metrics.ts              # Quality metrics
    └── api.ts                  # API response types
```

---

## Core Components

### Graph Visualization

#### Sigma.js (Exploration View)

**Use Case**: Large-scale graph exploration (100K+ nodes)

**Key Features**:
- **WebGL rendering**: 60fps at 100K+ edges
- **Web Worker layout**: ForceAtlas2 computation offload
- **Built on graphology**: Rich graph algorithms
- **Custom reducers**: Dynamic styling for filtering

**Implementation Pattern**:
```typescript
import { SigmaContainer, useLoadGraph, useRegisterEvents } from '@react-sigma/core';
import '@react-sigma/core/lib/react-sigma.min.css';

export function SigmaGraph({ nodes, edges }: GraphData) {
  const loadGraph = useLoadGraph();
  
  useEffect(() => {
    const graph = new Graph();
    nodes.forEach(node => graph.addNode(node.id, node));
    edges.forEach(edge => graph.addEdge(edge.source, edge.target, edge));
    loadGraph(graph);
  }, [nodes, edges, loadGraph]);
  
  // Custom node renderer for health indicators
  const nodeReducer = (node, data) => ({
    ...data,
    color: getHealthColor(data.healthStatus), // traffic light coloring
    size: data.importance * 10
  });
  
  return <SigmaContainer style={{ height: '100vh' }} />;
}
```

**Performance**: Switches between rendering layers based on zoom:
- **Overview zoom**: WebGL (Sigma.js)
- **Mid-range**: Canvas with labels
- **Export**: SVG for high-quality diagrams

#### Cytoscape.js (Architecture Diagrams)

**Use Case**: Structured architecture views with rich layouts

**Layout Algorithms**:
- **Dagre**: Directed acyclic dependency flows
- **CoSE-Bilkent**: Compound graphs with nested domain groups
- **Hierarchical**: Org charts, team structures
- **Breadthfirst**: Tree-like structures

**Implementation Pattern**:
```typescript
import CytoscapeComponent from 'react-cytoscapejs';

export function ArchitectureDiagram({ services, dependencies }: ArchData) {
  const elements = [
    ...services.map(s => ({ data: { id: s.id, label: s.name, team: s.team } })),
    ...dependencies.map(d => ({ data: { source: d.from, target: d.to, weight: d.traffic } }))
  ];
  
  const stylesheet = [
    {
      selector: 'node',
      style: {
        'background-color': 'data(healthColor)',
        'label': 'data(label)'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 'data(weight)',
        'line-color': 'data(healthStatus)' // red=error, green=healthy
      }
    }
  ];
  
  return (
    <CytoscapeComponent
      elements={elements}
      stylesheet={stylesheet}
      layout={{ name: 'dagre', rankDir: 'TB' }}
    />
  );
}
```

**Compound Nodes**: Group services by team or bounded context

**Edge Styling**: Thickness by traffic volume, color by health status

#### Diff Visualization

**Implementation**: Overlay two graph states with color coding
- **Green**: Additions
- **Red**: Removals
- **Yellow**: Modifications

Sigma.js supports this via dynamic style updates through reducers.

---

### Dashboard Design

#### Card-Based KPI Layout

**Top Row** (Key Metrics):
- Total Services
- Compliance Percentage (traffic light)
- Active Drift Alerts
- Deployment Frequency (DORA)

**Below** (Trends):
- Time-series charts via **Recharts** (composable React API)
- Heatmaps via **Nivo** (dependency risk matrices)
- Radar charts for team comparisons

**Key Views**:
1. **Architecture Health Overview**: Traffic-light scoring (A-F)
2. **Drift Detection Alerts**: Trend lines over sprints
3. **Team Ownership Matrices**: Who owns what
4. **Service Catalog**: Backstage-inspired entity model
5. **Dependency Risk Heatmap**: Coupling/instability matrix

**Real-time Updates**:
```typescript
import { useQuery } from '@tanstack/react-query';

function DashboardMetrics() {
  const { data, isRefetching } = useQuery({
    queryKey: ['metrics', 'dashboard'],
    queryFn: fetchDashboardMetrics,
    refetchInterval: 30000, // Poll every 30s
  });
  
  // WebSocket integration for live alerts
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/drift-alerts');
    ws.onmessage = (event) => {
      const alert = JSON.parse(event.data);
      useDriftStore.getState().addAlert(alert);
    };
    return () => ws.close();
  }, []);
  
  return <MetricsGrid data={data} />;
}
```

---

### Settings UI & LLM Configuration

#### LLM Configuration

**Provider Selector**:
- OpenAI
- Anthropic
- Azure OpenAI
- Ollama (self-hosted)
- Custom endpoint

**Configuration Fields**:
```typescript
interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'azure' | 'ollama' | 'custom';
  apiKey: string;        // Masked input with show/hide
  model: string;         // Dropdown of available models
  temperature: number;   // Slider 0.0-2.0
  maxTokens: number;    // Slider with presets
  endpoint?: string;     // For custom providers
}
```

**Test Connection Button**:
- Validates through backend proxy
- Displays latency and model availability
- **Security**: API keys stored server-side only, NEVER in frontend env vars

#### Data Source Connector Configuration

**OAuth 2.0 Popup Flows**:
```typescript
function ConnectorOAuth({ provider }: { provider: 'github' | 'jira' | 'confluence' }) {
  const openOAuthPopup = () => {
    const popup = window.open(
      `/api/auth/${provider}/authorize`,
      'oauth',
      'width=500,height=600'
    );
    
    window.addEventListener('message', (event) => {
      if (event.data.type === 'oauth-success') {
        queryClient.invalidateQueries(['connectors']);
        popup?.close();
      }
    });
  };
  
  return <Button onClick={openOAuthPopup}>Connect {provider}</Button>;
}
```

**Connection Status Indicators**:
- Connected (green checkmark)
- Disconnected (gray dot)
- Error (red X with tooltip)
- Syncing (animated spinner)

**Sync Scheduling**: Dropdown for polling intervals (15min, 30min, 1hr, 4hr, daily)

**Repository Selection**: Multi-select for GitHub repos to ingest

---

## Performance Optimization

### Lazy Loading

```typescript
// Heavy graph components loaded on demand
const SigmaGraph = lazy(() => import('./components/graph/SigmaGraph'));
const ArchitectureDiagram = lazy(() => import('./components/graph/ArchitectureDiagram'));

function GraphExplorer() {
  return (
    <Suspense fallback={<GraphSkeleton />}>
      <SigmaGraph data={graphData} />
    </Suspense>
  );
}
```

### Virtualization

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function ServiceList({ services }: { services: Service[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: services.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <ServiceCard key={virtualRow.index} service={services[virtualRow.index]} />
        ))}
      </div>
    </div>
  );
}
```

### Web Worker for Layout Computation

```typescript
// hooks/useWebWorker.ts
export function useForceAtlas2Layout(graph: Graph) {
  const workerRef = useRef<Worker>();
  
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('graphology-layout-forceatlas2/worker', import.meta.url)
    );
    
    workerRef.current.postMessage({ graph: graph.export() });
    
    workerRef.current.onmessage = (event) => {
      graph.import(event.data.positions);
    };
    
    return () => workerRef.current?.terminate();
  }, [graph]);
}
```

---

## State Management Patterns

### Zustand (Client State)

```typescript
// stores/graphStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GraphState {
  layout: 'force' | 'dagre' | 'hierarchical';
  filters: {
    teams: string[];
    healthStatus: ('healthy' | 'warning' | 'critical')[];
  };
  setLayout: (layout: GraphState['layout']) => void;
  toggleTeamFilter: (team: string) => void;
}

export const useGraphStore = create<GraphState>()(
  persist(
    (set) => ({
      layout: 'force',
      filters: { teams: [], healthStatus: [] },
      setLayout: (layout) => set({ layout }),
      toggleTeamFilter: (team) => set((state) => ({
        filters: {
          ...state.filters,
          teams: state.filters.teams.includes(team)
            ? state.filters.teams.filter(t => t !== team)
            : [...state.filters.teams, team]
        }
      })),
    }),
    { name: 'graph-settings' }
  )
);
```

### TanStack Query (Server State)

```typescript
// hooks/queries/useGraphData.ts
import { useQuery } from '@tanstack/react-query';

export function useGraphData() {
  return useQuery({
    queryKey: ['graph', 'full'],
    queryFn: async () => {
      const response = await fetch('/api/graph');
      if (!response.ok) throw new Error('Failed to fetch graph');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
```

---

## SEO & Accessibility

### SEO Best Practices

- **Title Tags**: Descriptive titles per route
- **Meta Descriptions**: Compelling summaries
- **Heading Structure**: Single `<h1>` per page, proper hierarchy
- **Semantic HTML**: HTML5 semantic elements
- **Unique IDs**: All interactive elements have descriptive IDs

### Accessibility (Radix UI + shadcn/ui)

- **ARIA attributes**: Built-in accessibility
- **Keyboard navigation**: Full keyboard support
- **Screen reader support**: Semantic markup
- **Focus management**: Visible focus indicators
- **Dark mode**: Built-in theme support

---

## Development Workflow

### File-based Routing (TanStack Router)

- Routes in `routes/` directory
- Automatic code splitting
- Type-safe navigation
- Lazy loading per route

### Validation with Zod

```typescript
import { z } from 'zod';

const PolicySchema = z.object({
  name: z.string().min(3).max(100),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  enforcement: z.enum(['observe', 'advise', 'enforce']),
  regoCode: z.string().min(10),
});

type Policy = z.infer<typeof PolicySchema>;
```

---

## Testing Strategy

- **Unit Tests**: Vitest for component/utility testing
- **Integration Tests**: React Testing Library
- **E2E Tests**: Playwright for critical user flows
- **Visual Regression**: Chromatic/Percy for UI snapshots

---

## Build & Deployment

### Vite Configuration

- **Development**: Fast HMR with native ESM
- **Production**: Optimized bundles with code splitting
- **Preview**: Test production build locally

### Environment Variables

**NEVER expose sensitive data in frontend env**:
```typescript
// ❌ WRONG - Embeds in build output
const API_KEY = import.meta.env.VITE_API_KEY;

// ✅ CORRECT - Stored server-side only
const response = await fetch('/api/llm/generate', {
  headers: { Authorization: 'Bearer <server-side-token>' }
});
```

---

## Migration from Current Stack

**Current**: React Native Web + MUI
**Target**: React 19 + shadcn/ui + Tailwind CSS

**Migration Path**:
1. Set up Vite 6 + React 19 project
2. Install shadcn/ui + Radix UI components
3. Migrate components one feature area at a time
4. Replace MUI components with shadcn/ui equivalents
5. Update routing to TanStack Router
6. Replace Context API with Zustand where appropriate
7. Introduce TanStack Query for server state
8. Add Sigma.js and Cytoscape.js for graph visualization

---

## Design Aesthetics (from Requirements)

- **Rich, vibrant colors**: Curated HSL palettes, no plain RGB
- **Modern typography**: Google Fonts (Inter, Roboto, Outfit)
- **Smooth gradients**: Subtle backgrounds
- **Micro-animations**: Hover effects, transitions
- **Dark mode first**: Premium feel with glassmorphism
- **Responsive**: Mobile-first, works on all screen sizes

---

## Summary

The frontend leverages modern React 19 features, WebGL-powered graph visualization, and shadcn/ui for accessible, beautiful components. Performance is optimized through lazy loading, virtualization, and Web Worker offloading. State management is split between Zustand (client) and TanStack Query (server), with Zod validation and TypeScript for type safety.

The goal: **WOW the user at first glance** with a premium, dynamic, and highly interactive experience.
