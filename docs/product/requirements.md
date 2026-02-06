# Structural Integrity Platform (Substrate) - Product Requirements

## Overview

**Substrate Platform** is a governance layer over modern software delivery — powered by a live knowledge graph and an internal integration marketplace.

AI has massively accelerated code creation but often at the cost of architectural consistency, security guarantees, and shared understanding. This platform restores control, visibility, and confidence creating a system that:
- **Governs AI-generated code**
- **Preserves architectural intent**
- **Captures tribal knowledge**
- **Produces auditable, provable evidence of correctness, security, and compliance**

Think of this platform as: *"GitHub + Snyk + Jira + Architecture Governance + Institutional Memory — powered by a live knowledge graph."*

---

## Core Problem Solved

The accelerated velocity of AI development has destroyed:
- Architectural consistency
- Security guarantees
- Shared system understanding

This platform solves these issues by:
- Governing AI-generated code.
- Enforcing architectural and security policies.
- Capturing institutional knowledge.
- Producing provable, auditable evidence.

---

## Key Capabilities

The system is graph-native and supports:
- **Knowledge Graph**: A unified graph of code, systems, data flows, and decisions.
- **Architecture-Aware Code Analysis**: Deep understanding of system structure.
- **Policy-as-Code Enforcement**: Governance for architecture, security, and compliance.
- **Continuous Compliance Validation**: Automated checks against standards.
- **Evidence-Backed Alerts**: High-signal, low-noise alerts based on impact and blast radius analysis.
- **Living Documentation**: Documentation generated from reality, not static files.
- **Role-Based Dashboards**: Consolidating data into views relevant for specific personas.

---

## Roles & Permissions

This is a multi-tenant, role-based system.

### Access Model
-   **Organization**: Top-level entity containing projects.
-   **Project**: Contains installed connectors, users, policies, and knowledge graph data.
-   **Users**: Belong to organizations and have roles within projects.

### Roles
Role definitions are data-driven. Feature access is permission-based.
-   **Owner**: Can invite users, assign roles, grant feature-level access.
-   **Admin**
-   **Engineer**
-   **Security**
-   **Product**
-   **Read-only / Executive**

### Personas
The platform serves multiple personas without duplicating logic:
*   **Engineering Leadership**: Needs visibility into architectural health and audit-ready evidence.
*   **Staff / Principal Engineers**: Needs architecture enforcement and drift protection.
*   **Security & AppSec**: Needs detection of architectural flaws and boundary verification.
*   **Product & Engineering Management**: Needs traceability and visibility into technical debt.
*   **Enterprise Leadership**: Needs independent validation and risk transparency.

---

## User Flow

1.  **Sign Up / Log In**: User authenticates.
2.  **Project Creation**:
    *   Set Project name & description.
    *   Select data connectors from the Internal Marketplace.
    *   Provide minimal required configuration for connectors.
3.  **Dashboard**: User lands on the project-scoped dashboard.

**Note**: No dashboard exists without a project context.

---

## Internal Marketplace: Data Connectors

Connectors are treated as modular products, not hard-coded integrations. Use a "Stripe-style integrations" approach.

### Principles
-   **Modular & Versioned**: Connectors are composable.
-   **Project-Scoped Installation**: Installed per project.
-   **API-Configured**: Managed via generic configuration APIs.
-   **Permission-Governed**: Access controlled by roles.

### Contracts
Every connector must:
1.  Expose a standard contract (metadata, auth requirements, capabilities).
2.  Be configured through a generic configuration API.
3.  Emit data/events in a normalized format.

**Rule**: No connector-specific logic in the UI.

---

## Dashboard Requirements

The dashboard is the default landing page per project.

-   **Data-Driven & Role-Aware**: Adapts content based on user role.
-   **Insight-Focused**: Surfaces insights, trends, risks, and confidence levels (not just raw data).
-   **Drill-Down Capable**: From Executive Summary -> Architectural State -> Policy Violations -> Code-Level Evidence.
-   **Avoid**: Static diagrams, manual documentation, UI-only business rules.
