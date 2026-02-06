# Structural Integrity Platform (Substrate)

**Substrate Platform** is a governance layer over modern software delivery — powered by a live knowledge graph and an internal integration marketplace.

AI has massively accelerated code creation but often at the cost of architectural consistency, security guarantees, and shared understanding. This platform restores control, visibility, and confidence by governing AI-generated code and preserving architectural intent.

## 📚 Documentation

The documentation is organized as follows:

### 🏗️ Architecture
- **[Architecture Overview](architecture/overview.md)**: High-level system design and components.
- **[Technical Implementation Spec](architecture/technical-spec.md)**: Deep dive into the GraphRAG pipeline, Rust ingestion, and tech stack choices.

### 🚀 Product
- **[Product Requirements](product/requirements.md)**: Detailed feature requirements, user flows, and personas.
- **[Strategy & Market](product/strategy.md)**: Deployment models, pricing, and go-to-market strategy.
- **[Gap Analysis](product/gap-analysis.md)**: Current implementation status vs. vision.
- **[FAQ](product/faq.md)**: Frequently asked questions.

### 💻 Development
- **[Frontend Guide](development/frontend.md)**: Frontend architecture, component library, and state management.
- **[Contributing](development/contributing.md)**: Guidelines for contributors.
- **[Roadmap](development/roadmap.md)**: Future development plans.
- **[Refactor History](development/refactor-history.md)**: Summary of past refactoring efforts.

### ⚙️ Deployment
- **[Docker Setup](deployment/docker.md)**: Full Docker deployment guide.
- **[Kubernetes Guide](deployment/kubernetes.md)**: Deployment manifests and specificaitons.
- **[Docker Cheatsheet](deployment/docker-cheatsheet.md)**: Quick reference commands.

## 🚀 Quick Start

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

### 🐳 Quick Start with Docker

1.  **Start in HTTP mode**
    ```bash
    docker compose --profile http up -d
    ```

2.  **Access the application**
    Open [http://localhost:8080](http://localhost:8080)

For detailed setup instructions, see the [Contributing Guide](development/contributing.md).

## 📄 License
See [LICENSE](../LICENSE) file.