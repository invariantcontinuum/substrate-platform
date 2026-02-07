# Substrate Platform Frontend - Implementation Roadmap

This document outlines the phase-by-phase implementation plan to evolve the Substrate Platform frontend into a production-ready state, following SOLID, DRY, KISS, and API-First principles.

## Phase 1: Foundation & API Definition (Current Focus)
**Goal:** Establish the ground truth for data and communication.
- [ ] **OpenAPI Specification**: Define the full contract for the Unified Multimodal Knowledge Base.
    - Define schemas for all 14 Entity Types and 10 Relationship Types.
    - Define endpoints for Graph traversal, Policy management, and Drift detection.
- [ ] **Mock Data Layer**: Create rich, realistic JSON datasets.
    - `entities.json`: Populate with realistic software artifacts (e.g., "Auth Service", "User DB", "Checkout API").
    - `relationships.json`: Define the complex web of interactions (e.g., "Auth Service" *writes_to* "User DB").
- [ ] **Service Layer Refactor**: Ensure the frontend client (Axios/Fetch) is fully typed against the OpenAPI spec.

## Phase 2: Knowledge Fabric Evolution
**Goal:** Visualize the "Structural Integrity" of the ecosystem.
- [ ] **Enhanced Graph Rendering**:
    - Update `KnowledgeFabric.tsx` to support distinct visual styles for all 14 entity types.
    - Implement filtering by Entity Type (e.g., "Show only Databases and Services").
- [ ] **Lens Implementation**:
    - **Reality Lens**: Show what *reads_from/writes_to* actually exist (from telemetry/logs - mocked for now).
    - **Intent Lens**: Show what *depends_on* relationships are declared in code/docs.
    - **Drift Lens**: Highlight edges that exist in Reality but not Intent (and vice versa).

## Phase 3: Governance & Policy Engine
**Goal:** Enforce architectural invariants.
- [ ] **Policy Dashboard**:
    - Display default policies (e.g., "No circular dependencies", "All APIs must be documented").
    - Show compliance status for each policy.
- [ ] **Drift Resolution Flow**:
    - In `MemoryInterface.tsx`, allow users to "Accept Drift" (update Intent) or "Reject Drift" (fix Reality).
    - Mock the LLM reasoning that suggests *why* the drift occurred.

## Phase 4: Data Connectors & Integrations
**Goal:** Simulate the ingestion of data from external tools.
- [ ] **Connector Configuration UI**:
    - Interface to toggle "Jira", "GitHub", "Slack" connectors.
- [ ] **Ingestion Simulation**:
    - Visual feedback when a connector is "syncing".
    - Update graph data dynamically based on "ingested" data (mocked updates).

## Phase 5: Production Readiness
**Goal:** Polish and Optimization.
- [ ] **Performance**: Optimize graph rendering for large datasets (1000+ nodes).
- [ ] **Accessibility**: Ensure all dashboards and interactive elements are a11y compliant.
- [ ] **Theming**: Refine the "Premium" aesthetic (Glassmorphism, fluid animations).
