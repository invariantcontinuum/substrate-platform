# Structural Integrity Platform (Substrate)

**Substrate Platform** is a governance layer over modern software delivery — powered by a live knowledge graph and an internal integration marketplace.

AI has massively accelerated code creation but often at the cost of architectural consistency, security guarantees, and shared understanding. This platform restores control, visibility, and confidence by governing AI-generated code and preserving architectural intent.

## Core Concepts

### 1. Unified Multimodal Knowledge Base
Substrate aggregates data into a single, queryable fabric using three specialized databases:
-   **PostgreSQL**: Relational data (User management, Policies, Audit logs).
-   **Neo4j**: Graph data (Service dependencies, Code ownership, API calls).
-   **Qdrant**: Vector embeddings (Semantic search for code, docs, and tickets).

### 2. Reality vs. Intent
-   **Reality**: The actual state of your system (derived from Code, Infrastructure, Runtime logs).
-   **Intent**: The desired state (derived from Architecture Decision Records, Jira Epics, Policies).
-   **Drift**: The gap between Reality and Intent. Substrate's primary goal is to minimize this drift.

### 3. Knowledge Fabric
The interactive visualization layer that allows architects and developers to explore the system.
-   **Entity Types**:
    -   `Service`, `API`, `Module`, `Database`, `Component`
    -   `Team`, `Repository`, `Package`
    -   `Function`, `Class`, `Interface`, `Endpoint`
    -   `Queue`, `Cache`
-   **Relationship Types**:
    -   `depends_on`, `calls`, `imports`
    -   `owns`, `maintains`
    -   `reads_from`, `writes_to`
    -   `deploys_to`, `implements`, `exposes`

## System Architecture (Frontend Focus)

Since the core backend services are complex, the current implementation focuses on a **production-ready frontend** driven by a strict **OpenAPI Specification**.

-   **API First**: All data is fetched from well-defined API endpoints.
-   **Mock Data Layer**: During development, specialized tooling serves rich, realistic JSON data to simulate the "Unified Multimodal Knowledge Base".
-   **GenAI Integration**: The platform is designed to be assisted by GenAI agents for tasks like:
    -   Embedding text blobs (Semantic Search).
    -   Constructing knowledge graphs.
    -   Reconciling drift (Intent vs Reality).
    -   Providing explainable governance.

## Key Features

-   **🌐 Knowledge Fabric**: WebGL-powered graph exploration.
-   **🛡️ Governance Hub**: Define and enforce policies.
-   **🧠 Institutional Memory**: "MemoryInterface" for logging daily work and capturing context.
-   **🔍 Lens Analysis**: Switch views between "Reality", "Intent", and "Drift".

## Roadmap

For a detailed phase-by-phase implementation guide, see the [Frontend Roadmap](./substrate-frontend-roadmap.md).