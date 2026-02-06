# Substrate Platform Overview

## Executive Summary

Substrate is an architectural governance platform that continuously monitors the alignment between documented intent (ADRs, policies, Jira tickets) and actual implementation (codebase, infrastructure, runtime traces). It detects architectural drift before it becomes technical debt.

## Core Concepts

### Reality
The actual state of the system derived from:
- Abstract Syntax Trees (AST) parsed from source code
- Infrastructure-as-Code (Terraform, Kubernetes manifests)
- Runtime traces and service meshes
- Database schemas and migrations

### Intent
The desired state documented in:
- Architecture Decision Records (ADRs)
- OPA/Rego policies
- Jira epics, stories, and requirements
- Confluence documentation
- API contracts and OpenAPI specs

### Drift
The measurable gap between Reality and Intent, quantified through:
- Coupling metrics (Instability Index, LCOM4)
- Conformance scores (Reflexion Model)
- Documentation freshness decay
- Policy violation counts

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUBSTRATE PLATFORM                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND (React 19)                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │Knowledge │ │  Active  │ │ GraphRAG │ │ Quality  │ │  Market  │  │   │
│  │  │ Fabric   │ │Governance│ │  Studio  │ │ Metrics  │ │  place   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                            │   │
│  │  │Institutio│ │ Settings │ │ Terminal │                            │   │
│  │  │nal Memory│ │          │ │   Logs   │                            │   │
│  │  └──────────┘ └──────────┘ └──────────┘                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          API GATEWAY (Go)                            │   │
│  │              Authentication │ Rate Limiting │ Request Routing        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│         ┌──────────────────────────┼──────────────────────────┐            │
│         ▼                          ▼                          ▼            │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐        │
│  │  Ingestion  │          │  GraphRAG   │          │ Governance  │        │
│  │  Service    │          │  Service    │          │  Service    │        │
│  │   (Rust)    │          │  (Python)   │          │    (Go)     │        │
│  └─────────────┘          └─────────────┘          └─────────────┘        │
│         │                          │                          │            │
│         │    ┌─────────────────────┼─────────────────────┐    │            │
│         │    │                     │                     │    │            │
│         ▼    ▼                     ▼                     ▼    ▼            │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────────┐        │
│  │ PostgreSQL  │◄────────►│   Neo4j     │◄────────►│   Qdrant    │        │
│  │   (Write)   │          │  (Graph)    │          │  (Vector)   │        │
│  └─────────────┘          └─────────────┘          └─────────────┘        │
│         │                                                                  │
│         ▼                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    EVENT BUS (NATS JetStream)                        │   │
│  │         entity.created │ policy.evaluated │ drift.detected           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL DATA SOURCES                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │  GitHub  │ │   Jira   │ │Confluence│ │  Slack   │ │ Custom   │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture (CQRS Pattern)

Substrate implements Command Query Responsibility Segregation (CQRS) with event sourcing:

### Write Path
1. **Connectors** extract data from external sources (GitHub, Jira, etc.)
2. **Ingestion Service** parses and normalizes entities
3. **PostgreSQL** stores canonical entities (source of truth)
4. **Outbox Pattern** ensures atomic event publication
5. **NATS JetStream** distributes events to subscribers

### Read Path
1. **Event consumers** project data to read-optimized stores
2. **Neo4j** maintains the knowledge graph for traversal queries
3. **Qdrant** stores vector embeddings for semantic search
4. **GraphRAG Service** combines both for hybrid queries

### Synchronization
```
PostgreSQL (Write) ──► Outbox Table ──► NATS ──┬──► Neo4j Projector
                                               ├──► Qdrant Projector
                                               └──► Cache Invalidator
```

---

## Multimodal Database Integration

### PostgreSQL (Relational - Source of Truth)
- **Role**: Canonical storage, transactional consistency, audit trail
- **Data**: Entities, relationships, sync state, user data, policies
- **Access**: Write operations, complex joins, ACID transactions

### Neo4j (Graph - Knowledge Fabric)
- **Role**: Dependency traversal, impact analysis, pattern detection
- **Data**: Services, components, teams, dependencies, ownership
- **Access**: Multi-hop queries, path finding, community detection

### Qdrant (Vector - Semantic Search)
- **Role**: Similarity search, embedding storage, semantic retrieval
- **Data**: Code embeddings, documentation embeddings, community reports
- **Access**: k-NN search, filtered vector queries, hybrid search

### Integration Pattern
```python
# Hybrid Query Example: Find similar code that violates policies

# 1. Semantic search in Qdrant
similar_code = qdrant.search(
    collection="code_embeddings",
    query_vector=embed(user_query),
    limit=50
)

# 2. Graph traversal in Neo4j
violations = neo4j.run("""
    MATCH (c:Component)-[:DEPENDS_ON*1..3]->(d:Component)
    WHERE c.id IN $component_ids
    AND (c)-[:VIOLATES]->(:Policy)
    RETURN c, d, relationships(c, d)
""", component_ids=[r.id for r in similar_code])

# 3. Enrich with PostgreSQL metadata
enriched = postgres.query("""
    SELECT e.*, t.name as team_name, o.email as owner_email
    FROM entities e
    JOIN teams t ON e.team_id = t.id
    JOIN users o ON e.owner_id = o.id
    WHERE e.id = ANY($1)
""", [v.id for v in violations])
```

---

## Human-in-the-Loop Integration

Substrate maintains human oversight at critical decision points:

### Confidence-Based Routing
| Confidence Score | Action |
|------------------|--------|
| > 0.9 | Auto-apply (create relationship, tag entity) |
| 0.7 - 0.9 | Queue for human review with AI recommendation |
| < 0.7 | Discard or request more context |

### Review Workflows

#### Knowledge Enrichment
1. GraphRAG extracts potential relationship from documentation
2. System calculates confidence based on supporting evidence
3. If confidence < 0.9, creates review task assigned to relevant team
4. Human approves, modifies, or rejects
5. Feedback improves future extraction accuracy

#### Policy Violation Triage
1. OPA evaluates code change against policies
2. Violations categorized by severity (Critical, High, Medium, Low)
3. Critical violations block merge automatically
4. High violations require team lead approval
5. Medium/Low violations logged for sprint planning

#### Documentation Staleness
1. System detects document hasn't been updated in 30+ days
2. Checks if related code has changed
3. Notifies document owner with specific drift details
4. Owner confirms still accurate or updates content
5. Confirmation resets freshness timer

### Feedback Loops
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   AI/ML     │────►│   Human     │────►│  Training   │
│  Suggestion │     │   Review    │     │   Update    │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                       │
       └───────────────────────────────────────┘
```

---

## Service Responsibilities

### [Ingestion Service (Rust)](./services/ingestion/index.md)
- Parse source code via tree-sitter and stack-graphs
- Extract entities and relationships from multiple sources
- Handle rate limiting and backpressure
- Emit normalized events to NATS

### [GraphRAG Service (Python)](./services/graphrag/index.md)
- Index documents using Microsoft GraphRAG pipeline
- Perform Leiden community detection
- Generate community summaries via LLM
- Execute Local, Global, and DRIFT queries

### [Governance Service (Go)](./services/governance/index.md)
- Embed OPA for sub-millisecond policy evaluation
- Sync graph state from Neo4j to OPA data store
- Evaluate policies on entity changes
- Emit violation events and block deployments

### [Proactive Maintenance Service (Python)](./services/maintenance/index.md)
- Monitor knowledge base for staleness and drift
- Embedding-based duplicate detection
- Automated freshness scoring
- Human-in-the-loop review workflows

### API Gateway (Go)
- Authenticate requests (JWT, API keys)
- Route to appropriate backend service
- Aggregate responses for frontend
- Rate limit and circuit break

### Connector Marketplace
- Plugin architecture for data source connectors
- Standardized interface: SPEC → CHECK → DISCOVER → READ
- Credential management via HashiCorp Vault
- Independent versioning and deployment

---

## Deployment Configurations

### Small Team (5-20 developers)
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    volumes: [postgres_data:/var/lib/postgresql/data]
  
  neo4j:
    image: neo4j:5-community
    volumes: [neo4j_data:/data]
  
  qdrant:
    image: qdrant/qdrant:v1.12
    volumes: [qdrant_data:/qdrant/storage]
  
  nats:
    image: nats:2.10-alpine
    command: ["-js"]
  
  ingestion:
    image: substrate/ingestion:latest
    depends_on: [postgres, nats]
  
  graphrag:
    image: substrate/graphrag:latest
    depends_on: [neo4j, qdrant]
  
  governance:
    image: substrate/governance:latest
    depends_on: [postgres, neo4j, nats]
  
  gateway:
    image: substrate/gateway:latest
    ports: ["8080:8080"]
  
  frontend:
    image: substrate/frontend:latest
    ports: ["3000:80"]
```

### Growth (20-100 developers)
- Kubernetes with Helm charts
- Neo4j clustering (3 nodes)
- Qdrant sharding
- Kafka replacing NATS for higher throughput
- Dedicated GPU node for vLLM inference

### Enterprise (100+ developers)
- Multi-cluster Kubernetes
- Neo4j Fabric for federation
- Qdrant distributed mode
- Enterprise OPA (Styra DAS)
- OPAL for real-time policy sync

---

## Security Model

### Authentication
- OIDC/SAML integration for SSO
- JWT tokens with short expiry (15 min)
- Refresh token rotation
- API keys for service-to-service

### Authorization (RBAC)
| Role | Permissions |
|------|-------------|
| Viewer | Read dashboards, view metrics |
| Developer | + Create queries, view code details |
| Team Lead | + Approve violations, manage team settings |
| Architect | + Define policies, configure governance |
| Admin | + Manage users, configure integrations |

### Data Protection
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- API keys stored in HashiCorp Vault
- Audit logging for all data access

---

## Integration Points

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Substrate Policy Check
  uses: substrate/policy-check@v1
  with:
    api_key: ${{ secrets.SUBSTRATE_API_KEY }}
    fail_on: critical,high
```

### IDE Extensions
- VS Code extension for real-time drift warnings
- IntelliJ plugin for policy violation hints

### Notification Channels
- Slack/Teams for alerts
- Email digests for documentation staleness
- PagerDuty for critical violations

---

## Metrics and Observability

### Platform Health
- Service latency (p50, p95, p99)
- Event processing lag
- Database connection pools
- Memory and CPU utilization

### Business Metrics
- Drift score trends
- Policy compliance rate
- Documentation freshness
- DORA metrics (if CI/CD integrated)

### Dashboards
- Grafana for infrastructure metrics
- Built-in dashboards for architectural health
- Custom query builder for ad-hoc analysis