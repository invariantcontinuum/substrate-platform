# Platform Services

The Substrate Platform is composed of several specialized microservices, each responsible for a specific domain of the architectural governance lifecycle.

## Core Services

### [Ingestion Service](./ingestion/index.md)
**Language**: Rust
**Responsibility**: Parsing source code, extracting entities and relationships from various sources (GitHub, Jira, etc.), and normalizing them into the Knowledge Fabric.

### [GraphRAG Service](./graphrag/index.md)
**Language**: Python
**Responsibility**: Managing the semantic knowledge graph, performing community detection, and executing hybrid vector/graph queries for architectural reasoning.

### [Governance Service](./governance/index.md)
**Language**: Go
**Responsibility**: Real-time policy evaluation using Open Policy Agent (OPA), managing the policy library, and tracking architectural violations.

### [Maintenance Service](./maintenance/index.md)
**Language**: Python (FastAPI)
**Responsibility**: Proactive health monitoring of the knowledge base, detecting staleness and document drift, and managing human-in-the-loop review workflows.

## Infrastructure
All services communicate via a shared event bus (NATS JetStream) and persist data to a multimodal database stack:
- **PostgreSQL**: Relational state and transactional consistency.
- **Neo4j**: Graph relationships and dependency traversal.
- **Qdrant**: Vector embeddings and semantic search.
