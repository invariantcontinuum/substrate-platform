# Structural Integrity Platform: System Architecture

## Overview

The Structural Integrity Platform is a polyglot, event-driven system that treats software architecture as a living knowledge graph, enforcing architectural intent through policy-as-code evaluated against that graph in real time.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│            STRUCTURAL INTEGRITY PLATFORM                          │
│         (Multi-Modal Knowledge Graph + Policy Engine)             │
└──────────────────────────────────────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
┌──────▼───────┐     ┌───────▼────────┐    ┌───────▼──────┐
│ Ingestion    │     │ GraphRAG       │    │ Governance   │
│ Pipeline     │     │ Engine         │    │ Engine       │
│ (Rust)       │     │ (Python)       │    │ (Go)         │
└──────┬───────┘     └───────┬────────┘    └───────┬──────┘
       │                     │                      │
       └──────────────┬──────┴──────────────────────┘
                      │
         ┌────────────▼─────────────┐
         │   Multi-Modal Storage    │
         │  PostgreSQL  │  Neo4j    │
         │  Qdrant      │  Redis    │
         └──────────────────────────┘
```

---

## Core Services

### 1. Ingestion Pipeline (Rust)
**Responsibility**: Real-time code analysis and entity extraction.

**Technology Stack**:
- **tree-sitter** v0.24.x: Incremental parsing (2,157 lines in ~6.5ms)
- **stack-graphs**: Cross-file reference resolution
- **notify** v6.x: Filesystem watching
- **rayon**: Parallel parsing
- **tokio**: Async I/O orchestration

**Capabilities**:
- Multi-language AST extraction (150+ supported languages)
- Deterministic code structure graphs
- Import/dependency graph construction
- 15/15 correctness on architectural queries (benchmark-proven)

**Pipeline Flow**:
```
File Watcher → Change Queue → Parser Pool (tree-sitter + stack-graphs)
            → Entity Emitter → Output Sink (NATS/Kafka)
```

### 2. GraphRAG Intelligence Engine (Python)
**Responsibility**: Semantic reasoning with LLM-powered graph generation.

**Technology Stack**:
- **FastAPI** v0.115.x: HTTP/REST API layer
- **Celery** v5.4.x + Redis: Async task processing
- **vLLM** v0.6.x: High-throughput LLM inference with PagedAttention
- **Prefect** v3.x: Workflow orchestration

**Capabilities**:
- Microsoft GraphRAG 7-phase indexing pipeline
- Hierarchical Leiden Algorithm for community detection (via `graspologic`)
- Three query strategies:
  - **Local Search**: Targeted queries ("What depends on auth service?")
  - **Global Search**: Holistic queries ("What are systemic risks?")
  - **DRIFT Search**: Combined breadth + depth reasoning

**GraphRAG Pipeline**:
1. **Text chunking**: 300-600 tokens for code, configurable overlap
2. **Graph extraction**: LLM-powered entity/relationship extraction
3. **Graph augmentation**: Multi-level community detection
4. **Community summarization**: LLM-generated cluster reports
5. **Document linking**: Provenance tracking
6. **Node2Vec + UMAP**: Visualization embeddings
7. **Text embeddings**: Vector search enablement

**Custom Entity Types**:
```yaml
entity_types: [Service, API, Module, Database, Component, Team, 
               Repository, Package, Function, Class, Interface, 
               Endpoint, Queue, Cache]
```

**Custom Relationship Types**:
```
depends_on, calls, imports, owns, maintains, reads_from, 
writes_to, deploys_to, implements, exposes
```

### 3. Governance Engine (Go)
**Responsibility**: Real-time policy evaluation and enforcement.

**Technology Stack**:
- **OPA SDK** (embedded): Sub-millisecond policy evaluation
- **go-chi/chi**: HTTP routing
- **nats.go**: Event consumption
- **sony/gobreaker**: Circuit breaking
- **golang.org/x/time/rate**: Rate limiting

**Capabilities**:
- `graph.reachable` built-in for transitive closure (O(V + E))
- Circular dependency detection
- Layer violation checking
- Cross-boundary access enforcement
- Graduated enforcement (Observe → Advise → Enforce)
- Real-time evaluation (<100ms per policy)

**Example Policy Patterns**:

**Circular Dependency Detection**:
```rego
package architecture.circular
import rego.v1

circular_dependency contains cycle if {
    some component
    data.architecture.dependencies[component]
    some neighbor in data.architecture.dependencies[component]
    reachable := graph.reachable(data.architecture.dependencies, {neighbor})
    component in reachable
    cycle := {"component": component, "via": neighbor,
      "msg": sprintf("Circular: '%s' -> '%s' -> ... -> '%s'", 
                     [component, neighbor, component])}
}
```

**Layer Violation Detection**:
```rego
package architecture.layers
import rego.v1

layer_order := {"presentation": 4, "application": 3, 
                "domain": 2, "infrastructure": 1, "data": 0}

layer_violation contains violation if {
    some source, targets in data.architecture.dependencies
    some target in targets
    layer_order[data.architecture.component_layers[source]] < 
      layer_order[data.architecture.component_layers[target]]
    violation := {"source": source, "target": target,
      "msg": sprintf("Layer violation: '%s' (%s) depends on '%s' (%s)",
        [source, data.architecture.component_layers[source], 
         target, data.architecture.component_layers[target]])}
}
```

---

## Data & Storage Layer

The platform uses a **CQRS architecture**: PostgreSQL is the write model and source of truth; Neo4j and Qdrant are read-optimized projections built from events.

### Storage Breakdown

1. **PostgreSQL** (Write Model - Source of Truth)
   - Entity metadata, timestamps, file hashes
   - User accounts, policies, violations
   - Audit logs, event outbox
   - **Outbox Pattern** ensures atomic event publication

2. **Neo4j** (Read Model - Graph Traversal)
   - Entities as typed nodes (`:Service`, `:API`, `:Module`)
   - Relationships as typed edges
   - Communities as `:Community` nodes
   - TextUnits as `:TextUnit` nodes
   - Sub-5ms traversal queries (1-5 hops)

3. **Qdrant** (Read Model - Vector Search)
   - Three collections:
     - `entity_embeddings`
     - `text_unit_embeddings`
     - `community_report_embeddings`
   - **Hybrid query pattern**: Qdrant seed → Neo4j expansion → LLM generation
   - 20-25% accuracy uplift over pure vector search
   - 1-2 second query latency

4. **Redis** (Caching & Task Queue)
   - LLM response caching
   - Celery task queue
   - Session tokens
   - Rate limit buckets

5. **MinIO** (Object Storage)
   - Large files, backups
   - Vector index snapshots

### Dual-Graph Strategy

The platform's core innovation combines two complementary approaches:

1. **Deterministic AST-derived graphs** (Rust ingestion):
   - Precise code structure
   - Import/dependency resolution
   - 15/15 correctness on architectural queries

2. **LLM-generated graphs** (Python GraphRAG):
   - Documentation semantics
   - Ticket relationships
   - Team/ownership context
   - Community detection

This dual strategy delivers higher accuracy than either approach alone.

---

## Event-Driven Synchronization

### Event Bus

**Small deployments (5-20 devs)**: NATS JetStream
- Single ~10MB binary
- Sub-millisecond latency
- ~200K msg/s persistent throughput

**Growth/Enterprise (20+ devs)**: Apache Kafka
- Multiple topic partitions
- Debezium CDC integration
- Kafka Connect ecosystem

### Event Flow (CQRS + Outbox Pattern)

```
1. Write to PostgreSQL + event_outbox (single transaction)
2. Dispatcher publishes events to NATS/Kafka
3. Consumers update read models:
   - Neo4j: Cypher MERGE statements
   - Qdrant: Vector upserts (after embedding generation)
   - OPA: Policy data synchronization
```

### Debezium CDC (Change Data Capture)

For Kafka deployments:
- Captures PostgreSQL WAL via logical replication
- Streams to Kafka topics
- Zero code changes needed

**PostgreSQL Configuration**:
```sql
wal_level = logical
max_replication_slots = 4
REPLICA IDENTITY FULL -- on tracked tables
```

### OPA Data Synchronization

Three strategies:
1. **Bundle API**: CI/CD-cycle updates (OPA polls every 10-30s)
2. **Push via Data API**: Dynamic updates after graph changes
3. **OPAL**: Real-time event-driven sync (production recommended)

---

## Quality Metrics Framework

### Architectural Drift & Conformance

**Coupling Metrics**:
- **Afferent Coupling (Ca)**: Components depending on you
- **Efferent Coupling (Ce)**: Components you depend on
- **Instability Index**: `I = Ce / (Ca + Ce)` (0.0 = stable, 1.0 = unstable)
- **Distance from Main Sequence**: `D = |A + I - 1|`
  - Zone of Pain: Concrete + Stable (hard to change)
  - Zone of Uselessness: Abstract + Unstable

**Cohesion Metrics**:
- **LCOM4**: Connected components in method-attribute graph (target: 1)
- **Relational Cohesion**: `H = (R + 1) / N` (target: ≥1.5)

**Conformance Checking (Reflexion Model)**:
```
ConformanceScore = convergences / (convergences + divergences + absences)
```

**Normalized Cumulative Component Dependency (NCCD)**:
- Compares system CCD vs. balanced binary tree
- NCCD > 1.0 indicates worse-than-average modularity

### Documentation Freshness

**Exponential Decay Model**:
```
Freshness(t) = e^(-λ × Δt)
```

**Decay Rates (λ)**:
- Architectural docs: 0.01 (~70-day half-life)
- API docs: 0.05 (~14-day half-life)
- Deployment guides: 0.1 (~7-day half-life)

**Composite Staleness Score**:
- Time decay: 25%
- Code drift: 30%
- Link rot: 15%
- Reference validity: 20%
- View frequency (inverse): 10%

Research shows **28.9% of popular GitHub projects** contain outdated code references.

### Technical Debt Quantification

**SQALE Methodology**:
```
Technical Debt Ratio = Remediation_Cost / (Lines_of_Code × 30_minutes)
```

**Ratings**:
- A: ≤5% debt ratio
- B: ≤10%
- C: ≤20%
- D: ≤50%
- F: >50%

**Note**: Architectural debt (improper boundaries, layer violations) accounts for ~80% of technical debt but is often missed by code-level tools.

### DORA Metrics Integration

**Elite Performers**:
- Deployment Frequency: On-demand (multiple/day)
- Lead Time for Changes: <1 hour
- Change Failure Rate: 0-5%
- Mean Time to Restore (MTTR): <1 hour

**Integration**:
- GitLab: Native DORA API (`/api/v4/projects/{id}/dora/metrics`)
- GitHub: Workflow Runs API
- Multi-platform: Apache DevLake

### Composite Platform Health Score

| Dimension | Weight | Primary Inputs |
|-----------|--------|----------------|
| Architectural conformance | 0.25 | Reflexion alignment, coupling/cohesion |
| Documentation health | 0.15 | Coverage × Freshness |
| Intent-reality alignment | 0.20 | Convergence ratio, violations |
| Delivery performance (DORA) | 0.15 | Normalized four key metrics |
| Technical debt | 0.15 | Inverted SQALE ratio |
| Knowledge graph quality | 0.10 | Completeness × Freshness × Accuracy |

**Final Ratings**:
- A: ≥0.9
- B: ≥0.75
- C: ≥0.6
- D: ≥0.4
- F: <0.4

---

## Data Connector Architecture

### Connector SDK (Airbyte-inspired)

**Three-tier approach**:
1. **No-code YAML**: Common REST APIs
2. **Low-code YAML + custom functions**: Moderate complexity
3. **Full Python SDK**: Complex sources

**Key Patterns**:
- Docker container isolation
- Standard protocol: SPEC → CHECK → DISCOVER → READ
- Independent versioning
- **Incremental sync** via cursor fields and state checkpoints
- Credential management via external secrets store (Vault, AWS Secrets Manager)
- Token bucket rate limiting

### Source-Specific Patterns

**GitHub**:
- Use GitHub Apps (5,000-15,000 req/hr)
- Webhooks for real-time updates (push, PR, issue events)
- Conditional requests with ETag (304 responses don't count)
- Git Trees API for monorepo traversal: `/git/trees/{sha}?recursive=1`

**Jira**:
- REST API v3: `/rest/api/3/search/jql`
- Sequential pagination with `nextPageToken`
- `maxResults` up to 5,000 for smaller datasets
- Extract: issues, epics, sprints, components, issue links

**Confluence**:
- CQL search: `type=page AND space=ARCH AND lastModified >= "2025-01-01"`
- Confluence Storage Format (XHTML with `ac:` macros)
- **50 results per page** max with body expansion

**Slack**:
- Socket Mode (works behind firewalls)
- Bolt framework
- Events: `message`, `reaction_added`, `file_shared`
- Filter by channel type for privacy

**Hybrid Strategy**:
- Webhooks: Real-time event capture
- Reconciliation polling: Every 15-60 minutes (catch missed events)
- Full polling backfill: Initial setup

---

## Entity Resolution Across Data Sources

The same person appears as:
- GitHub username
- Jira account ID
- Slack user ID
- Confluence author

**Three-layer resolution**:
1. **Deterministic matching**: Email/SSO ID/username mapping
2. **Probabilistic matching**: Fellegi-Sunter model (via **Splink** v4.x)
3. **ML-based matching**: Active learning

**Canonical Entity Model**:
- Stores all identifiers
- Resolution confidence scores
- Supports entity evolution over time

---

## Deployment Architecture

### Resource Requirements by Scale

**Small Team (5-20 devs)**: Docker Compose
- All services in containers
- NATS JetStream for events
- Single PostgreSQL, Neo4j, Qdrant instances
- gpt-4o-mini for GraphRAG indexing (~$5-50 per full re-index)

**Growth (20-100 devs)**: Kubernetes + Helm
- Migrate to Kafka + Debezium for CDC
- Neo4j clustering
- Qdrant sharding
- Dedicated GPU node for vLLM

**Enterprise (100+ devs)**: Multi-cluster Kubernetes
- Kafka with multiple topic partitions
- Neo4j Fabric for federation
- Qdrant distributed mode
- Enterprise OPA (Styra DAS)
- OPAL for real-time policy synchronization

---

## Integration Points

### CI/CD Integration

**GitHub Actions**:
```yaml
- uses: open-policy-agent/setup-opa@v2
- run: opa test policies/
- run: opa eval --fail-defined "data.architecture.violations"
```

**Conftest**: Test configuration files against policies
**Pre-commit hooks**: Local validation before push
**OPA Gatekeeper**: Kubernetes admission controller

### Natural Language to Rego

**Status**: Emerging, not production-ready
**LACE framework**: 100% correctness in verified policy generation
**Current best practice**: LLM authoring assistants + human review + automated `opa test`

---

## Cost Model & Technical Risks

### Cost Model (Small Team)

**GraphRAG Indexing**:
- gpt-4o-mini: ~$0.01 per processing pass (45K-word corpus)
- Full re-index: ~$5-50 depending on corpus size
- Incremental per-service re-indexing: minimal ongoing costs
- Built-in LLM caching reduces redundant API calls

**Infrastructure**:
- NATS JetStream: Single binary, near-zero overhead
- Self-hosted option: Full control, no per-seat fees

### Technical Risks

1. **GraphRAG incremental indexing**: Currently requires full re-index
   - **Mitigation**: Corpus partitioning by service/team, re-index only changed partitions

2. **stack-graphs archived status**: GitHub repository archived
   - **Mitigation**: Crates remain functional and forkable

3. **OPA-Neo4j sync latency**: Not real-time by default
   - **Mitigation**: OPAL for event-driven sync, <100ms policy evaluation

---

## Implementation Priority

**Phase 1**: Ingestion + Governance
- Rust ingestion pipeline
- OPA policy evaluation
- PostgreSQL + Neo4j foundation
- Basic CI/CD integration

**Phase 2**: GraphRAG Layer
- Python GraphRAG indexing
- Qdrant vector search
- Community detection
- Local/Global search

**Phase 3**: Advanced Features
- DRIFT search
- Entity resolution
- Staleness detection
- Human-in-the-loop enrichment

Ship with ingestion pipeline and governance policies first, then layer on GraphRAG community detection as the knowledge graph matures.
