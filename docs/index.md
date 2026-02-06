# Structural Integrity Platform (Substrate)

**Substrate Platform** is a governance layer over modern software delivery — powered by a live knowledge graph and an internal integration marketplace.

AI has massively accelerated code creation but often at the cost of architectural consistency, security guarantees, and shared understanding. This platform restores control, visibility, and confidence by governing AI-generated code and preserving architectural intent.

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

For more deployment options (HTTPS, Minimal, K8s), see the **[Deployment Guide](deployment/docker.md)**.

## 📚 Documentation

The documentation is organized as follows:

### 🏗️ Architecture
- **[Architecture Overview](architecture/overview.md)**: High-level system design and components.
- **[Technical Implementation Spec](architecture/technical-spec.md)**: Deep dive into the GraphRAG pipeline and tech stack choices.

### 🚀 Product
- **[Product Requirements](product/requirements.md)**: Detailed feature requirements and user flows.
- **[Gap Analysis](product/gap-analysis.md)**: Current implementation status vs. vision.
- **[FAQ](product/faq.md)**: Frequently asked questions.

### 💻 Development
- **[Frontend Guide](development/frontend.md)**: Component library, state management, and visualization details.
- **[Contributing](development/contributing.md)**: Guidelines for contributors.
- **[Roadmap](development/roadmap.md)**: Future development plans.

### ⚙️ Deployment
- **[Docker Setup](deployment/docker.md)**: Full Docker deployment guide.
- **[Kubernetes Guide](deployment/kubernetes.md)**: K8s manifests and specifications.

## 📄 License

This project is licensed under the terms of the [LICENSE](../LICENSE) file.