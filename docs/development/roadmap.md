# Development Roadmap

This roadmap outlines the phased implementation of the Structural Integrity Platform, aligned with the blueprint's recommendation: "Ship with the ingestion pipeline and governance policies first, then layer on GraphRAG community detection as the knowledge graph matures."

---

## Phase 1: Foundation - Ingestion + Governance (Months 0-3)

### Core Infrastructure (Weeks 1-2)

- [ ] **Project Setup**:
  - [ ] Initialize monorepo structure (Rust + Python + Go + React)
  - [ ] Docker Compose configuration for local development
  - [ ] CI/CD pipeline (GitHub Actions)
  - [ ] Development environment documentation

- [ ] **Data Layer**:
  - [ ] PostgreSQL schema (entities, policies, violations, audit_logs, event_outbox)
  - [ ] Neo4j schema (`:Component`, `:Service`, `:Team` nodes; `:DEPENDS_ON`, `:OWNS` edges)
  - [ ] Redis configuration (caching, session tokens)
  - [ ] Database migration system (Flyway/Liquibase for PostgreSQL)

### Rust Ingestion Pipeline (Weeks 3-6)

- [ ] **tree-sitter Integration**:
  - [ ] Parser initialization for top languages (Rust, Python, Go, TypeScript, Java)
  - [ ] AST extraction queries (functions, classes, imports, dependencies)
  - [ ] Incremental parsing with `notify` filesystem watcher

- [ ] **stack-graphs Integration**:
  - [ ] Cross-file reference resolution
  - [ ] Call graph construction
  - [ ] Import dependency graph

- [ ] **Pipeline Orchestration**:
  - [ ] File Watcher → Change Queue (bounded channels with backpressure)
  - [ ] Parser Pool (rayon parallel processing)
  - [ ] Entity Emitter (graph triples: `[source, relationship, target]`)
  - [ ] Output Sink (NATS JetStream integration)

- [ ] **Data Connectors**:
  - [ ] GitHub connector (repos, PRs, issues via GitHub Apps)
  - [ ] GitLab connector (projects, merge requests, issues)
  - [ ] File system connector (local monorepo support)

- [ ] **Testing**:
  - [ ] Unit tests for AST extraction (benchmark: 2,157 lines in ~6.5ms)
  - [ ] Integration tests with sample repositories
  - [ ] Performance benchmarks (target: 15/15 correctness on architectural queries)

### Go Governance Engine (Weeks 7-10)

- [ ] **OPA Integration**:
  - [ ] Embedded OPA SDK (`github.com/open-policy-agent/opa/v1/sdk`)
  - [ ] Prepared query caching (goroutine-safe)
  - [ ] Policy loader (read Rego files from `policies/` directory)

- [ ] **Core Policies** (Pre-built Library):
  - [ ] Circular dependency detection (using `graph.reachable`)
  - [ ] Layer violation detection (presentation → domain → infrastructure → data)
  - [ ] Cross-boundary access enforcement (no direct DB access from presentation)
  - [ ] Dependency version constraints (banned libraries, minimum versions)
  - [ ] Team ownership rules (every component must have an owner)

- [ ] **HTTP API** (`go-chi/chi`):
  - [ ] `POST /api/governance/evaluate` - Evaluate policies against graph state
  - [ ] `GET /api/policies` - List active policies
  - [ ] `POST /api/policies` - Create/update policy
  - [ ] `GET /api/violations` - Query violations with filters

- [ ] **Event Consumption**:
  - [ ] NATS JetStream subscriber (consume ingestion events)
  - [ ] PostgreSQL event sync (update `event_outbox` table)
  - [ ] Circuit breaking (`sony/gobreaker`)
  - [ ] Rate limiting (`golang.org/x/time/rate`)

- [ ] **Observability**:
  - [ ] Structured logging (JSON format)
  - [ ] Prometheus metrics (policy evaluation latency, violation counts)
  - [ ] Distributed tracing (OpenTelemetry)

### CI/CD Integration (Weeks 11-12)

- [ ] **GitHub Actions Integration**:
  - [ ] `setup-opa@v2` action
  - [ ] Extract architecture state from Neo4j
  - [ ] Run `opa test` on policy changes
  - [ ] Evaluate policies with `--fail-defined` to block merges

- [ ] **Pre-commit Hooks**:
  - [ ] Local policy validation before push
  - [ ] AST extraction for changed files
  - [ ] Fast-fail on critical violations

- [ ] **Documentation**:
  - [ ] Policy authoring guide
  - [ ] CI/CD integration examples (GitHub, GitLab, Jenkins)
  - [ ] Troubleshooting guide

---

## Phase 2: GraphRAG Intelligence Layer (Months 4-6)

### Python GraphRAG Pipeline (Weeks 13-18)

- [ ] **FastAPI Service**:
  - [ ] HTTP/REST API endpoints
  - [ ] Bearer token authentication
  - [ ] Rate limiting (per-user quotas)
  - [ ] OpenAPI/Swagger documentation

- [ ] **GraphRAG 7-Phase Indexing**:
  - [ ] **Phase 1**: Text chunking (300-600 tokens for code, configurable overlap)
  - [ ] **Phase 2**: Graph extraction (LLM-powered entity/relationship extraction)
    - [ ] Custom entity types: `Service`, `API`, `Module`, `Component`, `Team`, `Function`, `Class`
    - [ ] Custom relationships: `depends_on`, `calls`, `imports`, `owns`, `implements`
  - [ ] **Phase 3**: Graph augmentation (Hierarchical Leiden Algorithm via `graspologic`)
  - [ ] **Phase 4**: Community summarization (LLM-generated cluster reports)
  - [ ] **Phase 5**: Document linking (provenance tracking)
  - [ ] **Phase 6**: Node2Vec + UMAP embeddings (visualization)
  - [ ] **Phase 7**: Text embeddings (vector search via Qdrant)

- [ ] **LLM Integration** (`vLLM` v0.6.x):
  - [ ] OpenAI-compatible endpoint
  - [ ] Model: gpt-4o-mini (cost optimization: ~$0.01 per pass)
  - [ ] LLM response caching (keyed by `(chunk_hash, model_version, prompt_version)`)
  - [ ] Exponential backoff with jitter (`tenacity`)
  - [ ] Circuit breaking (`pybreaker`)

- [ ] **Qdrant Vector Store**:
  - [ ] Three collections: `entity_embeddings`, `text_unit_embeddings`, `community_report_embeddings`
  - [ ] Custom GraphRAG vector store implementation (`graphrag/vector_stores/factory.py`)
  - [ ] Hybrid query pattern: Qdrant seed → Neo4j expansion → LLM generation

- [ ] **Workflow Orchestration** (Prefect v3.x):
  - [ ] Incremental indexing (track file hashes/timestamps in PostgreSQL)
  - [ ] Per-service re-indexing (avoid full corpus re-indexing)
  - [ ] Retry logic, caching, observability

- [ ] **Query Strategies**:
  - [ ] **Local Search**: Entity similarity → graph neighborhood traversal
  - [ ] **Global Search**: Map-reduce across community reports
  - [ ] **DRIFT Search**: Primer (community summaries) → Follow-up (local entities) → Output (ranked hierarchy)

### Neo4j Integration (Weeks 19-20)

- [ ] **GraphRAG → Neo4j Export**:
  - [ ] Cypher `LOAD CSV` for parquet output
  - [ ] OR `neo4j-graphrag-python` package's `SimpleKGPipeline`
  - [ ] Data model:
    - Entities → typed nodes (`:Service`, `:API`, etc.)
    - Relationships → typed edges
    - Communities → `:Community` nodes
    - TextUnits → `:TextUnit` nodes

- [ ] **Query Optimization**:
  - [ ] Index creation (entity IDs, relationship types)
  - [ ] Query profiling (target: <5ms for 1-5 hop traversals)

### Staleness Detection (Weeks 21-22)

- [ ] **Exponential Decay Model**:
  - [ ] `Freshness(t) = e^(-λ × Δt)` implementation
  - [ ] Decay rates: Architectural docs (λ=0.01), API docs (λ=0.05), Deployment guides (λ=0.1)

- [ ] **Composite Staleness Score**:
  - [ ] Time decay: 25%
  - [ ] Code drift: 30% (tracked files changed, doc unchanged)
  - [ ] Link rot: 15% (broken URLs via HTTP HEAD requests)
  - [ ] Reference validity: 20% (check if referenced APIs/classes still exist)
  - [ ] Inverse view frequency: 10%

- [ ] **Smart Notifications**:
  - [ ] Dashboard flag at score > 0.5
  - [ ] Slack DM to document owner at day 3
  - [ ] Team channel escalation at day 7
  - [ ] Engineering manager report at day 14
  - [ ] Deprecation/archival suggestion at day 30

- [ ] **Fatigue Prevention**:
  - [ ] Batching into daily/weekly digests
  - [ ] Cap of 3 push notifications/hour/user
  - [ ] User-configurable notification preferences

---

## Phase 3: Advanced Frontend (Months 7-9)

### Technology Migration (Weeks 23-24)

- [ ] **New Stack Setup**:
  - [ ] Vite 6 + React 19 project initialization
  - [ ] shadcn/ui + Radix UI + Tailwind CSS 4.x installation
  - [ ] TanStack Router configuration (file-based routing)
  - [ ] Zustand 5.x for client state
  - [ ] TanStack Query 5.x for server state
  - [ ] Zod 3.x for validation

- [ ] **Component Library**:
  - [ ] Dark mode theme system (built-in with shadcn/ui)
  - [ ] Accessible form components (Radix UI primitives)
  - [ ] Loading states, skeletons, error boundaries

### Graph Visualization (Weeks 25-28)

- [ ] **Sigma.js Integration** (v3.0.2):
  - [ ] `@react-sigma/core` wrapper component
  - [ ] WebGL rendering for 100K+ nodes at 60fps
  - [ ] ForceAtlas2 layout with Web Worker offload
  - [ ] Custom node renderers (health indicators, traffic light coloring)
  - [ ] Reducers for dynamic filtering

- [ ] **Cytoscape.js Integration** (v3.x):
  - [ ] `react-cytoscapejs` wrapper component
  - [ ] Layout algorithms: Dagre (DAG flows), CoSE-Bilkent (compound graphs), Hierarchical
  - [ ] Compound nodes (group services by team/domain)
  - [ ] Edge styling (thickness by traffic, color by health status)
  - [ ] CSS-like selectors for styling

- [ ] **Diff Visualization**:
  - [ ] Overlay two graph states
  - [ ] Color coding: Green (additions), Red (removals), Yellow (modifications)
  - [ ] Sigma.js reducer-based implementation

- [ ] **Performance Optimization**:
  - [ ] Hybrid rendering: WebGL (overview) → Canvas (mid-range) → SVG (export)
  - [ ] Lazy loading for heavy graph components
  - [ ] `@tanstack/react-virtual` for long service lists
  - [ ] Web Worker for layout computation

### Dashboard Implementation (Weeks 29-32)

- [ ] **Card-Based KPI Layout**:
  - [ ] **Top Row**: Total Services, Compliance %, Active Drift Alerts, Deployment Frequency
  - [ ] **Trend Charts** (Recharts 2.x): Time-series over sprints
  - [ ] **Heatmaps** (Nivo): Dependency risk matrices
  - [ ] **Radar Charts** (Nivo): Team comparisons

- [ ] **Key Views**:
  - [ ] Architecture Health Overview (composite score A-F with traffic light)
  - [ ] Drift Detection Alerts (real-time WebSocket updates)
  - [ ] Team Ownership Matrices (who owns what)
  - [ ] Service Catalog (Backstage-inspired entity model)
  - [ ] Dependency Risk Heatmap (coupling × instability)

- [ ] **Real-time Updates**:
  - [ ] TanStack Query polling (`refetchInterval: 30000`)
  - [ ] WebSocket integration via Zustand for live alerts
  - [ ] Optimistic mutations for policy updates

### Settings & Configuration (Weeks 33-34)

- [ ] **LLM Configuration**:
  - [ ] Provider selector (OpenAI, Anthropic, Azure OpenAI, Ollama, Custom)
  - [ ] Masked API key input with show/hide toggle
  - [ ] Model selection dropdown (validated via backend)
  - [ ] Parameter sliders (temperature, max tokens)
  - [ ] "Test Connection" button (latency + model availability display)

- [ ] **Data Source Connectors**:
  - [ ] OAuth 2.0 popup flows (GitHub, Jira, Confluence)
  - [ ] Connection status indicators (Connected/Disconnected/Error/Syncing)
  - [ ] Sync scheduling dropdowns (15min, 30min, 1hr, 4hr, daily)
  - [ ] Repository selection interface (multi-select for GitHub repos)

- [ ] **User Preferences**:
  - [ ] Notification settings (email, Slack, push)
  - [ ] Theme toggle (dark/light mode)
  - [ ] Language selection (i18n preparation)

---

## Phase 4: Enterprise Features (Months 10-12)

### Multi-Tenancy & RBAC (Weeks 35-38)

- [ ] **Tenant Isolation**:
  - [ ] PostgreSQL row-level security (RLS)
  - [ ] Neo4j subgraph filtering by tenant ID
  - [ ] Qdrant collection-per-tenant or metadata filtering

- [ ] **Role-Based Access Control**:
  - [ ] Roles: Admin, Architect, Developer, Viewer
  - [ ] Permissions: Create policies, view violations, acknowledge violations, configure connectors
  - [ ] Team-based ownership (cross-team dependency approval workflows)

### Authentication & SSO (Weeks 39-40)

- [ ] **OAuth 2.0 / OIDC**:
  - [ ] GitHub, Google, Okta, Azure AD providers
  - [ ] JWT token validation
  - [ ] Session management (Redis-backed)

- [ ] **SAML 2.0** (Enterprise Tier):
  - [ ] SAML assertion parsing
  - [ ] IdP metadata configuration
  - [ ] Just-In-Time (JIT) provisioning

### Audit Logging (Week 41)

- [ ] **Immutable Audit Trail**:
  - [ ] PostgreSQL `audit_logs` table (who, what, when, where)
  - [ ] Log entries: Policy creation/update, violation acknowledgment, connector configuration
  - [ ] Searchable audit log UI (filterable by user, action, date range)

### Advanced Connectors (Weeks 42-44)

- [ ] **Jira Connector**:
  - [ ] REST API v3 integration (`/rest/api/3/search/jql`)
  - [ ] Extract: issues, epics, sprints, components, issue links
  - [ ] Sequential pagination with `nextPageToken`

- [ ] **Confluence Connector**:
  - [ ] CQL search (`type=page AND space=ARCH AND lastModified >= "..."`)
  - [ ] Confluence Storage Format parsing (strip `ac:` macros)
  - [ ] Pagination (50 results/page max with body expansion)

- [ ] **Slack Connector**:
  - [ ] Socket Mode (Bolt framework)
  - [ ] Events: `message`, `reaction_added`, `file_shared`
  - [ ] Filter by designated "knowledge" channels

- [ ] **Hybrid Sync Strategy**:
  - [ ] Webhooks for real-time event capture
  - [ ] Reconciliation polling (every 15-60 minutes)
  - [ ] Full polling backfill on initial setup

### Entity Resolution (Weeks 45-46)

- [ ] **Three-Layer Resolution**:
  - [ ] Deterministic matching (email/SSO ID/username mapping)
  - [ ] Probabilistic matching (Fellegi-Sunter model via Splink v4.x)
  - [ ] ML-based matching (active learning)

- [ ] **Canonical Entity Model**:
  - [ ] Store all identifiers (GitHub username, Jira account ID, Slack user ID, Confluence author)
  - [ ] Resolution confidence scores
  - [ ] Entity evolution tracking (handle name changes, role changes)

### DORA Metrics Integration (Week 47)

- [ ] **GitLab Integration**:
  - [ ] Native DORA API (`/api/v4/projects/{id}/dora/metrics`)

- [ ] **GitHub Integration**:
  - [ ] Workflow Runs API for deployment frequency, lead time
  - [ ] Pull Request API for change failure rate
  - [ ] Issue API for MTTR

- [ ] **Apache DevLake** (Optional):
  - [ ] Multi-platform DORA metric collection
  - [ ] Unified data model

### Compliance Prep (Week 48)

- [ ] **SOC 2 Type II Preparation**:
  - [ ] Security policy documentation
  - [ ] Access control reviews
  - [ ] Incident response plan
  - [ ] Vendor risk management

- [ ] **GDPR Compliance**:
  - [ ] Data processing agreements (DPAs)
  - [ ] Right to erasure (user data deletion)
  - [ ] Data portability (export user data)

---

## Phase 5: Scale & Optimization (Months 13-18)

### Kubernetes Migration (Months 13-14)

- [ ] **Helm Charts**:
  - [ ] PostgreSQL, Neo4j, Qdrant, Redis StatefulSets
  - [ ] Rust ingestion, Python GraphRAG, Go governance Deployments
  - [ ] NATS JetStream → Kafka migration (if throughput > 200K msg/s)

- [ ] **Horizontal Scaling**:
  - [ ] Ingestion pipeline: Scale parser pool replicas
  - [ ] GraphRAG: Celery worker auto-scaling
  - [ ] Governance: Stateless OPA service replicas

### Debezium CDC (Months 15-16)

- [ ] **PostgreSQL Configuration**:
  - [ ] `wal_level = logical`
  - [ ] `max_replication_slots = 4`
  - [ ] `REPLICA IDENTITY FULL` on tracked tables

- [ ] **Kafka Connect**:
  - [ ] Debezium PostgreSQL connector
  - [ ] Stream WAL changes to Kafka topics
  - [ ] Custom consumers for Neo4j/Qdrant updates

### OPA Policy Data Sync (Month 17)

- [ ] **OPAL Integration** (Open Policy Administration Layer):
  - [ ] Real-time event-driven policy data synchronization
  - [ ] Neo4j → OPA sync on graph changes
  - [ ] Target latency: <100ms policy evaluation

### Observability & Monitoring (Month 18)

- [ ] **Metrics**:
  - [ ] Prometheus exporters (ingestion throughput, policy latency, LLM API costs)
  - [ ] Grafana dashboards (system health, SLA tracking)

- [ ] **Logging**:
  - [ ] Centralized logging (ELK stack or Loki)
  - [ ] Structured JSON logs with correlation IDs

- [ ] **Tracing**:
  - [ ] OpenTelemetry distributed tracing
  - [ ] Trace ingestion → GraphRAG → governance → response path

---

## Beyond (Months 18+)

### Advanced Features

- [ ] **Natural Language to Rego Translation**:
  - [ ] LLM-assisted policy authoring (human review + automated `opa test`)
  - [ ] LACE framework integration (if production-ready)

- [ ] **Architecture Health Scoring**:
  - [ ] Composite score: Architectural conformance (0.25) + Documentation health (0.15) + Intent-reality alignment (0.20) + DORA (0.15) + Technical debt (0.15) + Knowledge graph quality (0.10)
  - [ ] Letter ratings: A (≥0.9), B (≥0.75), C (≥0.6), D (≥0.4), F (<0.4)

- [ ] **Human-in-the-Loop Enrichment**:
  - [ ] Confidence thresholds: >0.9 auto-add, 0.7-0.9 queue for review, <0.7 discard
  - [ ] PR-triggered prompts for doc reviews
  - [ ] Acceptance rate feedback loop for model tuning

- [ ] **Embedding-Based Duplicate Detection**:
  - [ ] Cosine similarity on document embeddings
  - [ ] Thresholds: >0.95 auto-flag merge, 0.85-0.95 suggest consolidation, 0.70-0.85 cross-link
  - [ ] HDBSCAN clustering for topic consolidation

### Enterprise Scaling

- [ ] **Multi-Cluster Kubernetes**:
  - [ ] Kafka with multiple topic partitions
  - [ ] Neo4j Fabric for federation
  - [ ] Qdrant distributed mode

- [ ] **Enterprise OPA** (Styra DAS):
  - [ ] Policy lifecycle management
  - [ ] Impact analysis for policy changes
  - [ ] 10× less memory, 40% less CPU vs open-source OPA

### Industry-Specific Solutions

- [ ] **FinTech**: PCI DSS compliance, payment flow validation
- [ ] **Healthcare**: HIPAA compliance, PHI access auditing
- [ ] **Government**: FedRAMP Moderate, ITAR controls

---

## Success Criteria

### Phase 1 (Months 0-3)
- ✅ Rust ingestion pipeline processes 2,157 lines in <10ms
- ✅ OPA policies evaluate in <100ms
- ✅ CI/CD integration blocks PRs on violations
- ✅ 5 pre-built policies (circular deps, layer violations, etc.)

### Phase 2 (Months 4-6)
- ✅ GraphRAG indexing completes 100K-line codebase in <10 minutes
- ✅ Local/Global search returns results in <3 seconds
- ✅ Staleness detection flags 80%+ of outdated docs (precision >85%)
- ✅ LLM costs <$50 per full re-index

### Phase 3 (Months 7-9)
- ✅ Sigma.js renders 10K+ nodes at 60fps
- ✅ Dashboard loads in <2 seconds
- ✅ Real-time drift alerts arrive in <5 seconds
- ✅ Dark mode + responsive design works on mobile

### Phase 4 (Months 10-12)
- ✅ Multi-tenant isolation validated (penetration testing)
- ✅ SAML SSO functional with 3+ IdPs
- ✅ Audit log captures 100% of sensitive actions
- ✅ SOC 2 Type I audit initiated

### Phase 5 (Months 13-18)
- ✅ Kubernetes deployment supports 100+ devs
- ✅ Debezium CDC <1s latency PostgreSQL → Neo4j
- ✅ System handles 1M+ graph nodes, 10M+ edges
- ✅ 99.9% uptime SLA achieved

---

## Notes

- **Iterative Delivery**: Each phase ships a working increment; no "big bang" release
- **Dogfooding**: Use the platform to govern its own development (meta-governance)
- **Community Feedback**: Open-source components first for early feedback
- **Documentation**: Keep `blueprint.md` as the source of truth; update as architecture evolves
