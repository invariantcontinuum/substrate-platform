# Structural Integrity Platform (Substrate)

**Substrate Platform** is a governance layer over modern software delivery — powered by a live knowledge graph and an internal integration marketplace.

AI has massively accelerated code creation but often at the cost of architectural consistency, security guarantees, and shared understanding. This platform restores control, visibility, and confidence by governing AI-generated code and preserving architectural intent.

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=invariantcontinuum_substrate-platform) [![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=invariantcontinuum_substrate-platform)](https://sonarcloud.io/summary/new_code?id=invariantcontinuum_substrate-platform)

## 📊 API Specification Status (v2.0 Transition)

The following report compares the legacy (`openapi.yaml`), refactored (`new_openapi.yaml`), and target (`latest_openapi.yaml`) specifications.

### Executive Summary

| Metric | `openapi.yaml` (Legacy) | `new_openapi.yaml` (Refactor) | `latest_openapi.yaml` (Target) |
| :--- | :--- | :--- | :--- |
| **Version** | `1.0.0` | `1.0.0` | `2.0.0` |
| **Scope** | Monolith (Core + Management) | Core Services Only | **Full Platform** (Core + Mgmt + Auth) |
| **Multi-Tenancy** | Basic | **❌ Removed** | **✅ Advanced** (Subdomains, RBAC) |
| **Doc Alignment** | Partial | Low (Missing key features) | **High** (Matches Architecture Spec) |
| **Status** | Deprecated | Incomplete/Service-Specific | **Production Ready** |

### Detailed Comparison

#### 1. Management & Multi-Tenancy (Critical)
The documentation explicitly highlights "**Multi-Tenant & RBAC**" as a core feature for "Executives, Architects, Security, and Engineers" (`docs/index.md`).

*   **`openapi.yaml`**: Contains basic CRUD endpoints for `/organizations`, `/teams`, and `/projects`.
*   **`new_openapi.yaml`**: **CRITICAL REGRESSION.** These endpoints have been completely removed. This file appears to be a "Core Service" contract (Knowledge Fabric + Governance) stripped of the management layer. It strictly fails to support the documented multi-tenancy requirement if used as the primary entry point.
*   **`latest_openapi.yaml`**: Restores and enhances these endpoints. It introduces a `tenant` server variable (`https://{tenant}.api.substrate.io/v1`), aligning perfectly with the SaaS architecture described in the docs.

#### 2. Authentication & Security
*   **`openapi.yaml` / `new_openapi.yaml`**: Minimal definition (`BearerAuth`, `ApiKeyAuth`).
*   **`latest_openapi.yaml`**: Adds comprehensive identity management:
    *   **SSO Strings**: `/auth/login/sso`, `/auth/callback` (Okta, Azure AD, Google).
    *   **MFA**: `/auth/mfa/setup`, `/auth/mfa/verify`.
    *   **User Profiles**: `/auth/me` with role parameters.

#### 3. Core Functional Parity
All three files maintain consistency on the core "Structural Integrity" features described in `docs/architecture/overview.md`:
*   **Knowledge Fabric**: `/entities`, `/relationships` (Graph traversal).
*   **GraphRAG**: `/graphrag/query`, `/graphrag/index` (Semantic search).
*   **Governance**: `/policies`, `/violations` (OPA enforcement).
*   **Metrics**: `/metrics/drift`, `/metrics/dora` (Health scoring).

`new_openapi.yaml` is effectively just this core layer, whereas `latest_openapi.yaml` wraps this core layer in the necessary enterprise management shell.

### Recommendations

1.  **Adopt `latest_openapi.yaml`**: This file is the true implementation of the vision outlined in `docs/`. It consolidates the Core Logic (from `new_openapi.yaml`) with the Management Layer (from `openapi.yaml`) and adds necessary Security features (SSO/MFA).
2.  **Retain `new_openapi.yaml` as Internal Schema**: You may keep `new_openapi.yaml` if you need a strict definition of the *internal* service API (excluding auth/management), but it should not be exposed to frontend clients.
3.  **Archive `openapi.yaml`**: It is obsolete. Its functionality has been fully superseded by `latest_openapi.yaml`.

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