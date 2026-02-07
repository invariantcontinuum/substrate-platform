take some time to read the 
docs
  entirely, this app is the frontend for the substrate, the core services are not implemented and for now out
 of scope, the aim is to develop till production ready the frontend with a complete openapi spec yaml supported by the mock data to accelerate the development of core services later. for now focus is only th
e frontend in its current shape. while developing must use SOLID, DRY, KISS and Api First approach, with no hardcoded data, everywhere it must be coming from the api with fallback to the mock data

We at Invariant Continuum are introducing The Structural Integrity Platform with its substrate frontend and the substrate core backend services with the unified multimodal knowledge base consisting of database like postgresql, qdrant and neo4j, these all should inherently be generic.  Similarly it must be possible to wrap the substrate easily into any name and branding to target different markets and industries b2b project teams which use AI Agents or Robots  or have high velocity of incidents where its crucial to keep a check on drift between intent and operations/reality. the  substrate frontend gives data insights to right person at the right time, monitoring drift occuring in the data ingested from various sources/dataconnectors via the platforms marketplace. the  substrate frontend enables users to connect their daily work tools, configure policies, create the project wait for the first large scan to pass  and then can see the knowledge fabric, examine Substrate Verification Queue in 
MemoryInterface.tsx
  log their daily work related stuff to nourish institutional Memory, 
KnowledgeFabric.tsx
  is currently displaying the graph which only has service api and db entitiy types it should be  entity_types: [Service, API, Module, Database, Component, Team, 
               Repository, Package, Function, Class, Interface, 
               Endpoint, Queue, Cache]
Custom Relationship Types:


depends_on, calls, imports, owns, maintains, reads_from, 
writes_to, deploys_to, implements, exposes
and enhance these lists so that the bare minium knowledge base for a software development team would be created, ingesting from data connectors like jira and github is a minium, optional data connectors for generic git repo, gitlab, confluence, slack, ms teams, whatsapp, google workspace, telegram, discord, and other relevant tools for agile safe agile scrum project teams. similarly research what basic policies must be made default and they must be present in the project once its created to see the value of the system at bare minimum, and after the project is created and data is ingested automatically new policies are suggested to the users depending upon the completeness,quality, monitoring and research report made by some llm in the substrate platfrom similarly thereis a need to mock llm responses for now so update the api and mock data accordingly and the user need to enter two models always, a chat model and an embedding model
the substrate-platform will be assisted with GenAI agents that are used to:
embed text blobs into vector databases (semantic search)
construct or preserve the relations between those text blobs (knowledge graph)
reconcile the reality-intent gap (drift detection)
enforce architectural invariants (policy-as-code)
generate actionable insights (graph reasoning)
provide explainable governance (evidence linking)
adapt to existing tools (integration layer)
learn and evolve (organizational memory)

aim is to move toward realisation of this substrate-frontend aliging with the vision and goals, therefore i need you to provide me an updated version of the docs from 
docs
 and some markdown files where phase by phase the  implementation instructions  for substrate-frontend are written for later implementation. 
# Structural Integrity Platform (Substrate)
Here is the comparison report between the current 
openapi.yaml
 and the 
new_openapi.yaml
.

Comparison Report: API Specification Analysis
1. Overview

Current Spec (
openapi.yaml
): Built on OpenAPI 3.0.3. It contains a mix of legacy endpoints and recent additions. While functional, the structure has become cluttered over time, with scattered domain logic.
New Spec (
new_openapi.yaml
): Built on OpenAPI 3.1.0. It features a modern, modular architecture organized by clear functional domains (Knowledge Fabric, GraphRAG, Governance, etc.). The schema definitions are more precise and comprehensive.
2. Key Differences & Improvements

Feature Area	
openapi.yaml
 (Current)	
new_openapi.yaml
 (New)	Verdict
OpenAPI Version	3.0.3	3.1.0 (Supports newer schema features)	New is better
Organization	Flat structure, mixed tags	Cleanly grouped by domain (Knowledge Fabric, GraphRAG, etc.)	New is better
GraphRAG	Basic endpoints added recently	Comprehensive: Full indexing pipeline, community detection, local/global search types	New is better
Governance	Basic evaluation endpoints	Complete: Policy CRUD, extended violation tracking, severity levels	New is better
Connectors	Minimal listing	Full CRUD: Config schemas, connection testing, sync triggering, status checks	New is better
Metrics	Basic health check	Advanced: DORA metrics, architectural drift, compliance scores, documentation health	New is better
Maintenance	Basic checks	Workflow: Staleness reports, duplicate detection, human-in-the-loop review queue	New is better
Settings	UI preferences only	System: LLM provider config (OpenAI/Anthropic), notification channels	New is better
Management	Has Orgs, Teams, Projects	MISSING Organization, Team, and Project management endpoints	Current has gap
3. Detailed Analysis of 
new_openapi.yaml

Knowledge Fabric: Introduces typed relationships (RelationshipType enum is exhaustive: depends_on, imports, calls, etc.) and graph traversal endpoints (/entities/{id}/context).
Quality Metrics: explicit schemas for 
HealthScore
, DriftMetrics, ComplianceMetrics, and DoraMetrics provide a standardized way to consume platform health data.
Connectors: The configSchema field in the Connector object allows for dynamic UI generation for different integration types (Jira vs GitHub).
Settings: dedicated endpoints for configuring the LLM provider (/settings/llm) allow the platform to be runtime-configurable.
4. Recommendation

The 
new_openapi.yaml
 represents a significant leap forward in maturity and capability definition. However, it lacks the multi-tenancy management features present in the current file.

Proposed Action Plan:

Adopt 
new_openapi.yaml
 as the new source of truth (
src/api/openapi.yaml
).
Migrate Management Endpoints: Port the Organization, Team, and 
Project
 CRUD operations from the old 
openapi.yaml
 into the new file under a Management tag to ensure multi-tenancy support is preserved.
Delete Legacy File: Once merged, archive/delete the old 
openapi.yaml
.
This approach gives you the best of both worlds: a modern, feature-rich API specification with the necessary tenant management capabilities preserved.
**Substrate Platform** is a governance layer over modern software delivery — powered by a live knowledge graph and an internal integration marketplace.

AI has massively accelerated code creation but often at the cost of architectural consistency, security guarantees, and shared understanding. This platform restores control, visibility, and confidence by governing AI-generated code and preserving architectural intent.

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=invariantcontinuum_substrate-platform) [![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=invariantcontinuum_substrate-platform)](https://sonarcloud.io/summary/new_code?id=invariantcontinuum_substrate-platform)

## ✨ Core Features

- **🌐 Knowledge Fabric**: Interactive exploration of your codebase's architectural relationships using WebGL-powered graphs.
- **🛡️ Governance Hub**: Define and enforce architectural policies like layer boundaries and circular dependency detection.
- **🔍 GraphRAG Studio**: AI-powered semantic search across code and documentation with reasoning steps and evidence.
- **🧠 Institutional Memory**: Track decisions, ADRs, and context to prevent architectural drift over time.
- **📊 Quality Dashboard**: Composite health scores (A-F) based on coupling, documentation freshness, and policy compliance.
- **🏢 Multi-Tenant & RBAC**: Scoped views for Executives, Architects, Security, and Engineers.

## 🎛️ Technology Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS 4, Zustand 5, Lucide Icons.
- **Visualization**: Sigma.js (WebGL), Cytoscape.js.
- **Infrastructure**: Docker, Nginx (with metrics/HTTPS support), GitHub Actions CI/CD.
- **Architecture**: SOLID, API-first design (currently utilizing rich mock datasets for prototype).

## 🚀 Quick Start

### Local Development

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/substrate-platform.git
    cd substrate-platform
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start development server**
    ```bash
    npm run dev
    ```

### 🐳 Run with Docker

The easiest way to see the platform in action with its full monitoring stack:

```bash
# Start in HTTP mode (Default)
docker compose --profile http up -d

# Access the application
# App: http://localhost:8080
# Grafana: http://localhost:3000 (admin/admin)
```

For more deployment options (HTTPS, Minimal, K8s), see the **[Deployment Guide](docs/deployment/docker.md)**.

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

### 🏗️ Architecture
- **[Architecture Overview](docs/architecture/overview.md)**: High-level system design and components.
- **[Technical Implementation Spec](docs/architecture/technical-spec.md)**: Deep dive into the GraphRAG pipeline and tech stack choices.

### 🚀 Product
- **[Product Requirements](docs/product/requirements.md)**: Detailed feature requirements and user flows.
- **[Gap Analysis](docs/product/gap-analysis.md)**: Current implementation status vs. vision.
- **[FAQ](docs/product/faq.md)**: Frequently asked questions.

### 💻 Development
- **[Frontend Guide](docs/development/frontend.md)**: Component library, state management, and visualization details.
- **[Contributing](docs/development/contributing.md)**: Guidelines for contributors.
- **[Roadmap](docs/development/roadmap.md)**: Future development plans.

### ⚙️ Deployment
- **[Docker Setup](docs/deployment/docker.md)**: Full Docker deployment guide.
- **[Kubernetes Guide](docs/deployment/kubernetes.md)**: K8s manifests and specifications.

## 📄 License

This project is licensed under the terms of the [LICENSE](LICENSE) file.