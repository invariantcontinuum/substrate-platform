# Structural Integrity Platform: comprehensive implementation blueprint

**The Structural Integrity Platform can be built as a polyglot, event-driven system using Rust for code ingestion, Python for GraphRAG/ML pipelines, Go for real-time governance, and React for visualization—unified by a multi-modal knowledge base spanning PostgreSQL, Neo4j, and Qdrant.** This report synthesizes deep technical research across all seven architecture domains into concrete implementation guidance.

> **Note on Implementation Status**: This specification outlines the target architecture for the production platform. The current codebase represents a high-fidelity frontend prototype that implements the visualization and interaction models described here, powered by comprehensive mock datasets.


---

## GraphRAG indexing pipeline adapted for code and documentation

Microsoft's GraphRAG transforms unstructured text into a hierarchical knowledge graph through **seven distinct indexing phases**, each configurable for a software architecture corpus.

**Phase 1 — Text chunking** splits input into TextUnits. The default is **300 tokens** with **100-token overlap**, but Microsoft reports success with **1,200-token chunks** using a single "glean" step. For code files, 300–600 tokens work best to preserve function-level boundaries. Configuration lives in `settings.yaml` under `chunks.size` and `chunks.overlap`. Short documents like Slack messages can use many-to-many mapping instead of the default one-to-many.

**Phase 2 — Graph extraction** sends each TextUnit to an LLM that extracts entities (with title, type, description) and relationships (source, target, description). For the Structural Integrity Platform, replace the default entity types (`organization, person, geo, event`) with software-specific types:

```yaml
entity_extraction:
  entity_types: [Service, API, Module, Database, Component, Team, Repository, Package, Function, Class, Interface, Endpoint, Queue, Cache]
  max_gleanings: 1
```

Custom relationship types should include `depends_on`, `calls`, `imports`, `owns`, `maintains`, `reads_from`, `writes_to`, `deploys_to`, `implements`, and `exposes`. The extraction prompt must be rewritten with domain-specific few-shot examples and explicit relationship definitions. GraphRAG's `prompt-tune` CLI auto-generates tuned prompts from sample data.

**Phase 3 — Graph augmentation** applies the **Hierarchical Leiden Algorithm** (via the `graspologic` Python library) to detect communities at multiple resolution levels. Level 0 is the finest granularity; higher levels are broader. Each node belongs to exactly one community per level. **Phase 4 — Community summarization** generates LLM-written reports for each community, producing executive overviews of component clusters. These reports become the backbone of Global Search. **Phase 5** links documents to TextUnits for provenance, **Phase 6** optionally generates Node2Vec + UMAP embeddings for visualization, and **Phase 7** generates text embeddings for vector search.

**Adapting for multi-modal sources** requires normalizing diverse inputs to text before ingestion. Source code should be pre-processed through tree-sitter to extract AST structure, docstrings, and imports as structured text. Jira tickets export as JSON with title/description/status/labels. Slack messages group by thread. A **dual-graph strategy** yields the best results: deterministic AST-derived graphs for code structure (achieving **15/15 correctness** on architectural queries in research benchmarks) combined with LLM-generated graphs for documentation and tickets.

### Query strategies and when to use each

**Local Search** identifies entities related to a query via vector similarity on entity embeddings, then traverses connected entities, relationships, and community reports within a graph neighborhood. Use for targeted questions like "What depends on the auth service?" Fast, cheap, focused on graph locality.

**Global Search** uses a map-reduce pattern across all community reports at a specified hierarchy level. Each report chunk generates importance-rated intermediate responses, which are then aggregated. Use for holistic questions like "What are the systemic risks in our architecture?" Expensive but comprehensive.

**DRIFT Search** (Dynamic Reasoning and Inference with Flexible Traversal) combines both approaches in three phases: a primer phase comparing the query against top-K community summaries, a follow-up phase drilling into specific entities via local search, and an output phase combining everything into a ranked hierarchy. Use for questions requiring both breadth and depth, like "How does the payment service's reliability compare to our overall system patterns?"

### Integration with Neo4j and Qdrant

Three paths exist for Neo4j integration. The most production-ready is **exporting GraphRAG parquet output to Neo4j** via Cypher `LOAD CSV` or the `neo4j-graphrag-python` package's `SimpleKGPipeline`. The data model maps entities to `:Entity` nodes (or typed labels like `:Service`, `:API`), relationships to typed edges, communities to `:Community` nodes, and TextUnits to `:TextUnit` nodes.

For Qdrant, implement a custom vector store via GraphRAG's factory pattern at `graphrag/vector_stores/factory.py`, registering a `QdrantVectorStore` class. Three collections are needed: `entity_embeddings`, `text_unit_embeddings`, and `community_report_embeddings`. The **hybrid query pattern** starts with Qdrant vector search to find seed entities, then expands via Neo4j graph traversal to connected entities and communities, then combines contexts for LLM generation. Production deployments report **20–25% accuracy uplift** over pure vector solutions and **1–2 second query latency**.

**Token optimization** uses gpt-4o-mini for extraction (reducing costs to ~$0.01 per processing pass for a 45K-word corpus), built-in LLM caching (identical requests return cached results), and incremental per-service re-indexing rather than full corpus re-indexing. GraphRAG currently requires full re-indexing for updates, so partitioning the corpus by service or team and re-indexing only changed partitions is essential.

---

## Quality metrics and scoring for architectural governance

The platform needs a layered metrics framework combining code-level, architecture-level, documentation, delivery, and knowledge graph quality dimensions into a composite health score.

### Architectural drift and conformance

**Coupling** is measured through afferent coupling (Ca: components depending on you), efferent coupling (Ce: components you depend on), and the **Instability Index**: `I = Ce / (Ca + Ce)`, ranging from 0.0 (maximally stable) to 1.0 (maximally unstable). The **Distance from Main Sequence** formula `D = |A + I - 1|` (where A = abstractness) identifies components in the "zone of pain" (concrete and stable, hard to change) or "zone of uselessness" (abstract and unstable).

**Cohesion** uses LCOM4, which counts connected components in a method-attribute graph. LCOM4 = 1 means perfect cohesion; LCOM4 > 1 suggests the class should be split. **Relational cohesion** `H = (R + 1) / N` (internal relationships divided by types) should be ≥1.5.

**Architecture conformance checking** uses the **Reflexion Model** approach: compare an intended architecture model (allowed dependencies) with the actual extracted architecture via a mapping. Dependencies classify as convergence (exists in both), divergence (exists in actual but not intended—a violation), or absence (intended but not actual). The conformance score is:

```
ConformanceScore = convergences / (convergences + divergences + absences)
```

The **Normalized Cumulative Component Dependency (NCCD)** from Lakos metrics compares system CCD against a balanced binary tree. NCCD > 1.0 indicates worse-than-average modularity. Tools like ArchUnit, jQAssistant (which stores code in Neo4j for Cypher-based rule checking), and Sonargraph implement these checks.

### Documentation freshness and technical debt

**Exponential decay** models documentation staleness: `Freshness(t) = e^(-λ × Δt)`, where λ varies by document type—**0.01 for architectural docs** (~70-day half-life), **0.05 for API docs** (~14-day half-life), **0.1 for deployment guides** (~7-day half-life). A composite staleness score combines time decay (25%), code drift (30%), link rot (15%), reference validity (20%), and view frequency (10%). Research shows **28.9% of popular GitHub projects** contain at least one outdated code reference in documentation, and references typically remain outdated for years.

**Technical debt quantification** follows the SQALE methodology: sum all remediation costs per violation type. SonarQube's Technical Debt Ratio = `Remediation_Cost / (Lines_of_Code × 30_minutes)`. An 'A' rating means ≤5% debt ratio. Architectural debt—improper boundaries, layer violations, missing abstractions—is not captured by code-level tools but accounts for an estimated **80% of all technical debt** (Gartner projection for 2027). The platform should quantify architectural debt as `Σ(violation_type × estimated_remediation_cost)`.

**DORA metrics** integrate via CI/CD pipeline APIs. GitLab provides a native DORA API (`/api/v4/projects/{id}/dora/metrics`). GitHub Actions data comes from the Workflow Runs API. Elite performers deploy **on-demand (multiple/day)** with **< 1 hour lead time**, **0–5% change failure rate**, and **< 1 hour MTTR**. Apache DevLake provides open-source DORA metric collection across multiple CI/CD systems.

### Composite platform health score

All dimensions normalize to 0–1 and combine with configurable weights:

| Dimension | Suggested weight | Primary inputs |
|-----------|-----------------|----------------|
| Architectural conformance | 0.25 | Reflexion model alignment, layer violations, coupling/cohesion |
| Documentation health | 0.15 | Coverage × Freshness |
| Intent-reality alignment | 0.20 | Convergence ratio, weighted violations |
| Delivery performance (DORA) | 0.15 | Normalized four key metrics |
| Technical debt | 0.15 | Inverted SQALE ratio |
| Knowledge graph quality | 0.10 | Completeness × Freshness × Accuracy |

Final scores map to letter ratings: A (≥0.9), B (≥0.75), C (≥0.6), D (≥0.4), F (<0.4).

---

## OPA/Rego patterns for knowledge graph governance

OPA's `graph.reachable` built-in function computes transitive closure over a directed graph, handling cycles safely. Its signature is `output := graph.reachable(graph, initial)` where `graph` is an adjacency list and `initial` is a starting set. Complexity is **O(V + E)** per call, and it terminates safely on cyclic graphs.

### Core policy patterns with complete Rego examples

**Circular dependency detection** checks whether a component can reach itself through its neighbors:

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
      "msg": sprintf("Circular: '%s' -> '%s' -> ... -> '%s'", [component, neighbor, component])}
}
```

**Layer violation detection** assigns numeric levels to layers and flags lower layers depending on higher ones:

```rego
package architecture.layers
import rego.v1

layer_order := {"presentation": 4, "application": 3, "domain": 2, "infrastructure": 1, "data": 0}

layer_violation contains violation if {
    some source, targets in data.architecture.dependencies
    some target in targets
    layer_order[data.architecture.component_layers[source]] < layer_order[data.architecture.component_layers[target]]
    violation := {"source": source, "target": target,
      "msg": sprintf("Layer violation: '%s' (%s) depends on '%s' (%s)",
        [source, data.architecture.component_layers[source], target, data.architecture.component_layers[target]])}
}
```

Additional policies enforce **API gateway compliance** (external clients must route through the gateway), **service boundary enforcement** (cross-context access only through public APIs), **database access restrictions** (no direct DB access from presentation/application layers), **dependency version constraints** (banned dependencies and minimum versions), and **team ownership rules** (every component must have an owner; cross-team dependencies require approval).

### Syncing Neo4j state to OPA

OPA does not query Neo4j directly. The recommended architecture uses a sync service that extracts graph snapshots via Cypher queries and pushes them to OPA's Data API:

```python
# Extract from Neo4j, push to OPA
result = session.run("MATCH (a:Component)-[:DEPENDS_ON]->(b:Component) RETURN a.name AS source, collect(b.name) AS targets")
requests.put(f"{opa_url}/v1/data/architecture/dependencies", json=dependencies)
```

Three sync strategies apply: **Bundle API** for CI/CD-cycle updates (OPA polls a bundle server every 10–30 seconds), **Push via Data API** for dynamic updates after graph changes, and **OPAL** (Open Policy Administration Layer) for production real-time event-driven synchronization. For latency-sensitive paths, OPA evaluates policies in **sub-millisecond** for indexed rules and **1–5ms** for typical policies. Enterprise OPA from Styra uses **10× less memory** and **40% less CPU** than open-source OPA.

### CI/CD integration as structural gatekeeper

GitHub Actions integration uses the `open-policy-agent/setup-opa@v2` action to install OPA, extract architecture state from Neo4j, run policy tests via `opa test`, and evaluate policies with `--fail-defined` to block merges on violations. **Conftest** wraps OPA for testing configuration files (Kubernetes manifests, Terraform, Dockerfiles) against policies. Pre-commit hooks catch violations locally before push. OPA **Gatekeeper** acts as a Kubernetes admission controller for deployment-time enforcement.

**Natural language to Rego translation** is not yet production-ready but emerging. The LACE framework achieved **100% correctness** in verified policy generation using LLMs. For now, LLMs serve best as authoring assistants with mandatory human review and automated `opa test` validation of generated policies.

---

## Polyglot backend architecture with event-driven synchronization

### Rust ingestion with tree-sitter and stack-graphs

**tree-sitter** (crate `tree-sitter` v0.24.x) is an incremental parsing framework that generates concrete syntax trees from grammar definitions. It parses a 2,157-line Rust file in **~6.5ms** and performs incremental re-parses in sub-millisecond time after edits. Over **150 language grammars** are available. From Rust, use tree-sitter queries (S-expression patterns) to extract functions, classes, imports, and dependencies:

```rust
let mut parser = Parser::new();
parser.set_language(&tree_sitter_rust::LANGUAGE.into()).unwrap();
let tree = parser.parse(source_code, None).unwrap();
// Use TreeCursor to walk AST or queries to match patterns like:
// (function_item name: (identifier) @fn_name)
```

**stack-graphs** (GitHub's framework for code navigation) build on tree-sitter to resolve references to definitions across files without requiring a full build. While the GitHub repository has been archived, the crates remain functional. Stack-graphs produce Push Symbol Nodes (references) and Pop Symbol Nodes (definitions), enabling construction of call graphs, import dependency graphs, and type hierarchies.

The **ingestion pipeline** uses `notify` (v6.x) for filesystem watching, `rayon` for CPU-bound parallel parsing, and `tokio` for async I/O orchestration. Bounded channels (`crossbeam-channel`) provide backpressure between stages. The pipeline flows: File Watcher → Change Queue → Parser Pool (tree-sitter + stack-graphs) → Entity Emitter (graph triples) → Output Sink (NATS/Kafka).

### Python ML and GraphRAG services

**FastAPI** (v0.115.x) serves as the HTTP/REST API layer, with **Celery** (v5.4.x) and Redis for async task processing of long-running ML operations. LLM inference goes through **vLLM** (v0.6.x) with PagedAttention for high-throughput serving, exposed as an OpenAI-compatible endpoint. Pipeline orchestration uses **Prefect** (v3.x) for workflow management with built-in retry, caching, and observability. Error handling for LLM calls uses `tenacity` for exponential backoff with jitter and `pybreaker` for circuit breaking.

Incremental indexing tracks file hashes and timestamps in PostgreSQL. On change detection, only affected TextUnits are re-extracted. LLM extraction results are cached keyed by `(chunk_hash, model_version, prompt_version)` to avoid redundant API calls.

### Go governance microservices

Go services embed OPA as a library via `github.com/open-policy-agent/opa/v1/sdk`, achieving **sub-millisecond policy evaluation** with zero serialization overhead. Prepared queries are goroutine-safe and cache evaluation plans. The service uses `go-chi/chi` for HTTP routing, `nats.go` for event consumption, `sony/gobreaker` for circuit breaking, and `golang.org/x/time/rate` for rate limiting. Go's goroutine model maps naturally to concurrent webhook processing.

### Event-driven synchronization and CQRS

**NATS with JetStream** is recommended for initial deployment—a single **~10MB binary** supporting pub/sub, request-reply, and streaming with sub-millisecond latency and ~200K msg/s persistent throughput. Migrate to **Apache Kafka** when throughput exceeds 200K msg/s sustained or when the Kafka Connect ecosystem (especially Debezium) is needed.

The platform follows **CQRS**: PostgreSQL is the write model and source of truth; Neo4j and Qdrant are read-optimized projections built from events. The **Outbox Pattern** ensures atomicity—write to a PostgreSQL `event_outbox` table in the same transaction as entity updates, then a dispatcher publishes to the event bus.

**Debezium** captures PostgreSQL WAL changes via logical replication and streams them to Kafka topics. Custom consumers transform CDC events into Neo4j Cypher MERGE statements and Qdrant vector upserts (after generating embeddings via the Python service). Key PostgreSQL configuration: `wal_level = logical`, `max_replication_slots = 4`, and `REPLICA IDENTITY FULL` on tracked tables.

### Entity resolution across data sources

The same developer appears as a GitHub username, Jira account ID, Slack user ID, and Confluence author. A **three-layer resolution strategy** handles this: deterministic matching (email/SSO ID/username mapping), probabilistic matching via the **Fellegi-Sunter model** (computing match weights per attribute), and ML-based matching with active learning. **Splink** (v4.x, Python) implements Fellegi-Sunter with EM parameter estimation and multiple SQL backends. A canonical entity model stores all identifiers with resolution confidence scores and supports entity evolution over time.

---

## Data connector architecture and knowledge freshness

### Connector SDK design following Airbyte patterns

The connector framework should adopt a **three-tier development approach** inspired by Airbyte: no-code YAML configuration for common REST APIs, low-code YAML with custom functions for moderate complexity, and a full Python SDK for complex sources. Each connector runs in its own **Docker container** for isolation, communicates via a standard protocol (SPEC → CHECK → DISCOVER → READ), and is versioned independently.

Key design principles from production connector platforms:

- **Backstage-style extension points** for plugin extensibility, where modules register capabilities via typed interfaces
- **Incremental sync** via cursor fields and state checkpoints (Airbyte's `AirbyteStateMessage` pattern)
- **Credential management** through an external secrets store (Vault, AWS Secrets Manager)—never stored in connector code
- **Rate limit budgets** allocated across connectors using token bucket algorithms

### Source-specific ingestion patterns

**GitHub** ingestion should use **GitHub Apps** (5,000–15,000 req/hr based on org size) over OAuth Apps. Webhooks handle real-time updates for push, PR, and issue events; **conditional requests** with ETag headers avoid counting 304 responses against rate limits. For monorepos, the Git Trees API (`/git/trees/{sha}?recursive=1`) enables efficient traversal.

**Jira** uses REST API v3 with the new `/rest/api/3/search/jql` endpoint. Pagination has shifted to sequential `nextPageToken`-based (no parallel page fetches), with `maxResults` up to 5,000 for smaller datasets. Extract issues, epics, sprints, components, and issue links—mapping components to services/modules in the knowledge graph.

**Confluence** uses CQL for searching (`type=page AND space=ARCH AND lastModified >= "2025-01-01"`). Body content returns in Confluence Storage Format (XHTML with `ac:` macros) requiring tag stripping for clean text. With body expansion, pagination limits to **50 results per page**.

**Slack** uses Socket Mode (no public endpoint required, works behind firewalls) via the Bolt framework. Subscribe to `message`, `reaction_added`, and `file_shared` events. Filter by channel type for privacy, and consider ingesting only from designated "knowledge" channels.

The recommended **hybrid strategy**: webhooks for real-time event capture, periodic reconciliation polling (every 15–60 minutes) to catch missed events, and full polling-based backfill on initial setup.

### Automated staleness detection and knowledge enrichment

A **composite staleness score** combines five signals with weighted contributions: time-based exponential decay (25%), code drift where related code changed but docs didn't (30%), link rot from broken URLs (15%), reference validity checking whether referenced APIs/classes still exist (20%), and inverse view frequency (10%). Research confirms that **82.3% of popular GitHub projects** have contained outdated code references at some point.

**Smart notifications** route through severity tiers: dashboard flag at score > 0.5, Slack message to the document owner at day 3, team channel escalation at day 7, engineering manager report at day 14, and deprecation/archival suggestion at day 30. **Notification fatigue prevention** uses batching into daily/weekly digests, a cap of 3 push notifications per hour per user, priority tiering, and user-configurable preferences.

**Embedding-based duplicate detection** uses cosine similarity on document embeddings (via `all-MiniLM-L6-v2` for self-hosted or `text-embedding-3-small` for OpenAI). Thresholds: > 0.95 triggers auto-flagging for merge, 0.85–0.95 suggests consolidation for human review, 0.70–0.85 suggests cross-linking. **HDBSCAN clustering** on embeddings identifies topic clusters for consolidation suggestions. For scale beyond 100K documents, use FAISS or Qdrant for approximate nearest neighbor search.

**Human-in-the-loop enrichment** uses confidence thresholds: > 0.9 auto-adds graph relationships, 0.7–0.9 queues for review, < 0.7 discards. PR-triggered prompts ask authors to review related docs when code changes touch documented components. Acceptance rates feed back into extraction model tuning.

---

## Frontend dashboard with graph visualization and governance UX

### Graph visualization: Sigma.js for exploration, Cytoscape.js for architecture

**Sigma.js** (v3.0.2) with `@react-sigma/core` is recommended as the primary graph visualization library. It uses **WebGL rendering** and handles **100K+ edges** at 60fps with default styles. Built on `graphology` for data manipulation and algorithms. ForceAtlas2 layout computation offloads to a Web Worker via `graphology-layout-forceatlas2/worker`. Custom node renderers display service health indicators (traffic light coloring), and `reducers` enable dynamic appearance changes for filtering.

**Cytoscape.js** (v3.x) with `react-cytoscapejs` serves architecture diagram views. It has the **richest layout ecosystem**: Dagre for directed acyclic dependency flows, CoSE-Bilkent for compound graphs with nested domain groups, hierarchical for org charts, and breadthfirst for tree-like structures. Compound nodes group services by team or bounded context. Use CSS-like selectors for styling edges by health status (red = error, green = healthy) and thickness by traffic volume.

Performance benchmarks show **SVG falls below 30fps at 10K elements** during pan/zoom, Canvas hits limits at ~10K elements with complex interactions, and **WebGL holds steady past 100K elements**. The recommended hybrid approach: WebGL (Sigma.js) at overview zoom levels, Canvas for mid-range with labels, and SVG export for high-quality architecture diagrams.

**Diff visualization** overlays two graph states with color-coded additions (green), removals (red), and modifications (yellow). Sigma.js supports this via dynamic style updates through reducers.

### Dashboard design for engineering leadership

The dashboard follows a **card-based KPI layout** with drill-down navigation: top row shows total services, compliance percentage, active drift alerts, and deployment frequency. Below, time-series trend charts (via **Recharts** v2.x, chosen for its 9M+ weekly npm downloads and composable React API) track metrics over sprints. **Nivo** supplements with heatmaps for dependency risk matrices and radar charts for team comparisons.

Key dashboard views include an architecture health overview with traffic-light scoring, drift detection alerts with trend lines, team-based ownership matrices, a service catalog with health indicators (inspired by Backstage's entity model), and a dependency risk heatmap. Real-time updates use **TanStack Query** (v5.x) with `refetchInterval` for polling and WebSocket integration via Zustand for live drift detection alerts.

### Settings UI and LLM configuration

LLM configuration presents a provider selector (OpenAI, Anthropic, Azure OpenAI, Ollama, custom endpoint) with API key management using masked input with show/hide toggle, model selection dropdown, and parameter sliders for temperature and max tokens. A "Test Connection" button validates through the backend proxy and displays latency and model availability. **API keys must be stored server-side only**—never in frontend environment variables, which embed into build output.

Data source connector configuration uses OAuth 2.0 popup flows for GitHub/Jira/Confluence, with connection status indicators (Connected/Disconnected/Error/Syncing), sync scheduling dropdowns, and repository selection interfaces.

### React/Vite technical stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Build | **Vite 6.x** | Native ESM, fast HMR |
| UI framework | **React 19** | Hooks, Suspense, transitions |
| Components | **shadcn/ui** + Radix UI + Tailwind CSS 4.x | Accessible, composable, dark mode built-in; used by OpenAI and Adobe |
| State (client) | **Zustand 5.x** | ~3KB, no Provider needed, middleware for persistence and devtools |
| State (server) | **TanStack Query 5.x** | Caching, background refetching, optimistic mutations |
| Routing | **TanStack Router** | File-based, type-safe, automatic code splitting |
| Validation | **Zod 3.x** | TypeScript-first runtime validation |
| Graph (exploration) | **Sigma.js 3.0.2** + `@react-sigma/core` | WebGL performance for 1000+ node graphs |
| Graph (architecture) | **Cytoscape.js 3.x** + `react-cytoscapejs` | Rich layout algorithms (Dagre, hierarchical) |
| Charts | **Recharts 2.x** + Nivo for specialized views | Largest community, composable React API |

The project uses feature-based file organization: `routes/` for TanStack Router pages, `components/` split by domain (graph/, dashboard/, settings/, layout/), `stores/` for Zustand stores, `hooks/queries/` and `hooks/mutations/` for TanStack Query hooks, and `lib/` for utilities. Performance optimization includes lazy loading for heavy graph components, `@tanstack/react-virtual` for long service lists, and Web Workers for ForceAtlas2 layout computation.

---

## Deployment architecture and scaling path

The platform targets Docker and Kubernetes with a clear scaling path:

- **Small team (5–20 devs)**: Docker Compose with all services; NATS JetStream for events; single PostgreSQL, Neo4j, and Qdrant instances; gpt-4o-mini for GraphRAG indexing to control costs
- **Growth (20–100 devs)**: Kubernetes with Helm charts; migrate to Kafka for CDC integration with Debezium; Neo4j clustering; Qdrant sharding; dedicated GPU node for vLLM
- **Enterprise (100+ devs)**: Multi-cluster Kubernetes; Kafka with multiple topic partitions; Neo4j Fabric for federation; Qdrant distributed mode; Enterprise OPA (Styra DAS) for policy lifecycle management; OPAL for real-time policy data synchronization

The **Outbox Pattern** with Debezium CDC provides the atomic consistency guarantee between PostgreSQL writes and event publication across all scale levels. Event schema versioning with backward compatibility (Protobuf for inter-service communication) ensures smooth upgrades.

## Conclusion

Three architectural decisions define this platform's success. First, the **dual-graph strategy**—deterministic AST-derived graphs for code structure combined with LLM-generated graphs for documentation and tickets—delivers higher accuracy than either approach alone. Second, **CQRS with PostgreSQL as the write-side source of truth** and Neo4j/Qdrant as read-optimized projections eliminates the consistency challenges of multi-model databases. Third, **OPA's `graph.reachable` function** enables expressing complex architectural policies (circular dependencies, transitive layer violations, cross-boundary access) in 10–20 lines of Rego, evaluated in sub-millisecond time.

The cost model is favorable for small teams: GraphRAG indexing with gpt-4o-mini costs **~$5–50 per full re-index** depending on corpus size, and incremental per-service re-indexing keeps ongoing costs minimal. NATS JetStream adds near-zero operational overhead as a single binary. The primary technical risks are GraphRAG's current lack of true incremental indexing (mitigated by corpus partitioning) and stack-graphs' archived status (mitigated by the codebase remaining functional and forkable). The platform should ship with the ingestion pipeline and governance policies first, then layer on GraphRAG community detection and DRIFT search as the knowledge graph matures.