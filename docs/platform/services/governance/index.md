# Governance Service

## Overview

The Governance Service enforces architectural policies in real-time using Open Policy Agent (OPA). It continuously evaluates code changes, dependency relationships, and infrastructure configurations against declarative Rego policies, blocking violations before they reach production.

## Responsibilities

1. **Policy Management**: Store, version, and distribute Rego policies
2. **Graph Synchronization**: Keep OPA's data store in sync with Neo4j
3. **Real-time Evaluation**: Sub-millisecond policy evaluation on changes
4. **Violation Tracking**: Record and classify policy violations
5. **CI/CD Integration**: Provide gates for deployment pipelines

## Technology Stack

| Component | Library | Version | Purpose |
|-----------|---------|---------|---------|
| Runtime | Go | 1.23+ | Service implementation |
| Policy Engine | OPA SDK | 1.0+ | Embedded policy evaluation |
| HTTP | chi | 5.1+ | REST API routing |
| Events | nats.go | 1.37+ | Event consumption |
| Database | pgx | 5.7+ | PostgreSQL driver |
| Resilience | gobreaker | 0.5+ | Circuit breaking |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GOVERNANCE SERVICE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      HTTP API (chi)                              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │/evaluate │  │/policies │  │/violations│  │ /sync    │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                     │
│         ┌─────────────────────────┼─────────────────────────┐          │
│         ▼                         ▼                         ▼          │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│  │  Policy Store   │    │   OPA Engine    │    │  Violation      │    │
│  │  (PostgreSQL)   │    │   (Embedded)    │    │  Tracker        │    │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    │
│                                   │                                     │
│                    ┌──────────────┴──────────────┐                      │
│                    ▼                             ▼                      │
│         ┌─────────────────────┐      ┌─────────────────────┐           │
│         │   Graph Sync        │      │   Event Consumer    │           │
│         │   (Neo4j → OPA)     │      │   (NATS)            │           │
│         └─────────────────────┘      └─────────────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                    │                             │
         ┌──────────┴──────────┐       ┌─────────┴─────────┐
         ▼                     ▼       ▼                   ▼
  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
  │ PostgreSQL  │       │   Neo4j     │       │    NATS     │
  └─────────────┘       └─────────────┘       └─────────────┘
```

## Core Components

### Embedded OPA Engine

```go
package governance

import (
    "context"
    "github.com/open-policy-agent/opa/v1/sdk"
    "github.com/open-policy-agent/opa/v1/ast"
)

type PolicyEngine struct {
    opa    *sdk.OPA
    config *sdk.Config
}

func NewPolicyEngine(ctx context.Context, policyDir string) (*PolicyEngine, error) {
    config := sdk.Config{
        ID: "substrate-governance",
        Config: map[string]interface{}{
            "bundles": map[string]interface{}{
                "substrate": map[string]interface{}{
                    "resource": policyDir,
                    "polling": map[string]interface{}{
                        "min_delay_seconds": 10,
                        "max_delay_seconds": 30,
                    },
                },
            },
            "decision_logs": map[string]interface{}{
                "console": true,
            },
        },
    }
    
    opa, err := sdk.New(ctx, sdk.Options{Config: &config})
    if err != nil {
        return nil, fmt.Errorf("failed to create OPA instance: %w", err)
    }
    
    return &PolicyEngine{opa: opa, config: &config}, nil
}

func (e *PolicyEngine) Evaluate(ctx context.Context, input map[string]interface{}) (*EvaluationResult, error) {
    result, err := e.opa.Decision(ctx, sdk.DecisionOptions{
        Path:  "architecture/validation",
        Input: input,
    })
    if err != nil {
        return nil, fmt.Errorf("policy evaluation failed: %w", err)
    }
    
    return parseEvaluationResult(result)
}

func (e *PolicyEngine) UpdateData(ctx context.Context, path string, data interface{}) error {
    return e.opa.SetData(ctx, path, data)
}
```

### Graph Data Synchronization

```go
type GraphSyncer struct {
    neo4j  neo4j.DriverWithContext
    engine *PolicyEngine
    logger *slog.Logger
}

func (s *GraphSyncer) SyncDependencies(ctx context.Context) error {
    session := s.neo4j.NewSession(ctx, neo4j.SessionConfig{})
    defer session.Close(ctx)
    
    // Extract dependency graph from Neo4j
    result, err := session.Run(ctx, `
        MATCH (a:Component)-[:DEPENDS_ON]->(b:Component)
        RETURN a.name AS source, collect(b.name) AS targets
    `, nil)
    if err != nil {
        return fmt.Errorf("failed to query dependencies: %w", err)
    }
    
    dependencies := make(map[string][]string)
    for result.Next(ctx) {
        record := result.Record()
        source, _ := record.Get("source")
        targets, _ := record.Get("targets")
        
        targetStrings := make([]string, 0)
        for _, t := range targets.([]interface{}) {
            targetStrings = append(targetStrings, t.(string))
        }
        dependencies[source.(string)] = targetStrings
    }
    
    // Push to OPA data store
    if err := s.engine.UpdateData(ctx, "architecture/dependencies", dependencies); err != nil {
        return fmt.Errorf("failed to update OPA data: %w", err)
    }
    
    s.logger.Info("synced dependencies to OPA", "count", len(dependencies))
    return nil
}

func (s *GraphSyncer) SyncComponentLayers(ctx context.Context) error {
    session := s.neo4j.NewSession(ctx, neo4j.SessionConfig{})
    defer session.Close(ctx)
    
    result, err := session.Run(ctx, `
        MATCH (c:Component)
        WHERE c.layer IS NOT NULL
        RETURN c.name AS name, c.layer AS layer
    `, nil)
    if err != nil {
        return err
    }
    
    layers := make(map[string]string)
    for result.Next(ctx) {
        record := result.Record()
        name, _ := record.Get("name")
        layer, _ := record.Get("layer")
        layers[name.(string)] = layer.(string)
    }
    
    return s.engine.UpdateData(ctx, "architecture/component_layers", layers)
}

func (s *GraphSyncer) SyncTeamOwnership(ctx context.Context) error {
    session := s.neo4j.NewSession(ctx, neo4j.SessionConfig{})
    defer session.Close(ctx)
    
    result, err := session.Run(ctx, `
        MATCH (t:Team)-[:OWNS]->(c:Component)
        RETURN c.name AS component, t.name AS team
    `, nil)
    if err != nil {
        return err
    }
    
    ownership := make(map[string]string)
    for result.Next(ctx) {
        record := result.Record()
        component, _ := record.Get("component")
        team, _ := record.Get("team")
        ownership[component.(string)] = team.(string)
    }
    
    return s.engine.UpdateData(ctx, "architecture/ownership", ownership)
}

// Run periodic sync with configurable interval
func (s *GraphSyncer) StartPeriodicSync(ctx context.Context, interval time.Duration) {
    ticker := time.NewTicker(interval)
    defer ticker.Stop()
    
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            if err := s.SyncAll(ctx); err != nil {
                s.logger.Error("sync failed", "error", err)
            }
        }
    }
}
```

### Rego Policy Library

```rego
# policies/architecture/circular.rego
package architecture.circular

import rego.v1

# Detect circular dependencies using graph.reachable
circular_dependency contains cycle if {
    some component
    data.architecture.dependencies[component]
    some neighbor in data.architecture.dependencies[component]
    reachable := graph.reachable(data.architecture.dependencies, {neighbor})
    component in reachable
    cycle := {
        "component": component,
        "via": neighbor,
        "severity": "critical",
        "message": sprintf("Circular dependency: '%s' -> '%s' -> ... -> '%s'", [component, neighbor, component])
    }
}

# policies/architecture/layers.rego
package architecture.layers

import rego.v1

# Layer ordering (higher number = higher layer)
layer_order := {
    "presentation": 4,
    "application": 3,
    "domain": 2,
    "infrastructure": 1,
    "data": 0
}

# Detect layer violations (lower layer depending on higher layer)
layer_violation contains violation if {
    some source, targets in data.architecture.dependencies
    some target in targets
    source_layer := data.architecture.component_layers[source]
    target_layer := data.architecture.component_layers[target]
    layer_order[source_layer] < layer_order[target_layer]
    violation := {
        "source": source,
        "target": target,
        "source_layer": source_layer,
        "target_layer": target_layer,
        "severity": "high",
        "message": sprintf("Layer violation: '%s' (%s) depends on '%s' (%s)", [source, source_layer, target, target_layer])
    }
}

# policies/architecture/gateway.rego
package architecture.gateway

import rego.v1

# All external API calls must go through the API gateway
gateway_bypass contains violation if {
    some source, targets in data.architecture.dependencies
    some target in targets
    data.architecture.component_types[source] == "service"
    data.architecture.component_types[target] == "external_api"
    not path_through_gateway(source, target)
    violation := {
        "source": source,
        "target": target,
        "severity": "high",
        "message": sprintf("Service '%s' calls external API '%s' without going through API gateway", [source, target])
    }
}

path_through_gateway(source, target) if {
    some gateway in data.architecture.gateways
    reachable_from_source := graph.reachable(data.architecture.dependencies, {source})
    gateway in reachable_from_source
    reachable_from_gateway := graph.reachable(data.architecture.dependencies, {gateway})
    target in reachable_from_gateway
}

# policies/architecture/boundaries.rego
package architecture.boundaries

import rego.v1

# Services can only call other services within same bounded context
# or through explicitly allowed cross-context dependencies
boundary_violation contains violation if {
    some source, targets in data.architecture.dependencies
    some target in targets
    source_context := data.architecture.bounded_contexts[source]
    target_context := data.architecture.bounded_contexts[target]
    source_context != target_context
    not allowed_cross_context(source, target)
    violation := {
        "source": source,
        "target": target,
        "source_context": source_context,
        "target_context": target_context,
        "severity": "medium",
        "message": sprintf("Cross-boundary call: '%s' (%s) -> '%s' (%s) not in allowed list", [source, source_context, target, target_context])
    }
}

allowed_cross_context(source, target) if {
    allowed := data.architecture.allowed_cross_context_calls
    some rule in allowed
    rule.source == source
    rule.target == target
}

# policies/architecture/database.rego
package architecture.database

import rego.v1

# Only repository/DAO components can access databases directly
database_access_violation contains violation if {
    some source, targets in data.architecture.dependencies
    some target in targets
    data.architecture.component_types[target] == "database"
    not endswith(source, "Repository")
    not endswith(source, "DAO")
    not data.architecture.allowed_database_access[source]
    violation := {
        "source": source,
        "target": target,
        "severity": "high",
        "message": sprintf("Direct database access: '%s' accesses '%s' but is not a Repository/DAO", [source, target])
    }
}

# policies/architecture/ownership.rego
package architecture.ownership

import rego.v1

# Cross-team dependencies require explicit approval
cross_team_dependency contains violation if {
    some source, targets in data.architecture.dependencies
    some target in targets
    source_team := data.architecture.ownership[source]
    target_team := data.architecture.ownership[target]
    source_team != target_team
    not approved_cross_team(source, target)
    violation := {
        "source": source,
        "target": target,
        "source_team": source_team,
        "target_team": target_team,
        "severity": "low",
        "message": sprintf("Unapproved cross-team dependency: '%s' (%s) -> '%s' (%s)", [source, source_team, target, target_team])
    }
}

approved_cross_team(source, target) if {
    some approval in data.architecture.cross_team_approvals
    approval.source == source
    approval.target == target
    time.parse_rfc3339_ns(approval.expires_at) > time.now_ns()
}
```

### Violation Tracker

```go
type ViolationTracker struct {
    db     *pgxpool.Pool
    nats   *nats.Conn
    logger *slog.Logger
}

type Violation struct {
    ID          uuid.UUID         `json:"id"`
    PolicyID    string            `json:"policy_id"`
    Severity    Severity          `json:"severity"`
    Source      string            `json:"source"`
    Target      string            `json:"target,omitempty"`
    Message     string            `json:"message"`
    Context     map[string]string `json:"context,omitempty"`
    DetectedAt  time.Time         `json:"detected_at"`
    ResolvedAt  *time.Time        `json:"resolved_at,omitempty"`
    AcknowledgedBy *string        `json:"acknowledged_by,omitempty"`
}

type Severity string

const (
    SeverityCritical Severity = "critical"
    SeverityHigh     Severity = "high"
    SeverityMedium   Severity = "medium"
    SeverityLow      Severity = "low"
)

func (t *ViolationTracker) RecordViolation(ctx context.Context, v *Violation) error {
    v.ID = uuid.New()
    v.DetectedAt = time.Now()
    
    _, err := t.db.Exec(ctx, `
        INSERT INTO violations (id, policy_id, severity, source, target, message, context, detected_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (policy_id, source, target) WHERE resolved_at IS NULL
        DO UPDATE SET detected_at = $8
    `, v.ID, v.PolicyID, v.Severity, v.Source, v.Target, v.Message, v.Context, v.DetectedAt)
    
    if err != nil {
        return fmt.Errorf("failed to record violation: %w", err)
    }
    
    // Publish violation event
    event := ViolationEvent{
        Type:      "violation.detected",
        Violation: v,
    }
    eventBytes, _ := json.Marshal(event)
    t.nats.Publish("substrate.violations", eventBytes)
    
    return nil
}

func (t *ViolationTracker) ResolveViolations(ctx context.Context, policyID string, currentViolations []Violation) error {
    // Find violations that no longer exist
    currentKeys := make(map[string]bool)
    for _, v := range currentViolations {
        key := fmt.Sprintf("%s:%s:%s", v.PolicyID, v.Source, v.Target)
        currentKeys[key] = true
    }
    
    // Get active violations for this policy
    rows, err := t.db.Query(ctx, `
        SELECT id, source, target FROM violations
        WHERE policy_id = $1 AND resolved_at IS NULL
    `, policyID)
    if err != nil {
        return err
    }
    defer rows.Close()
    
    var toResolve []uuid.UUID
    for rows.Next() {
        var id uuid.UUID
        var source, target string
        rows.Scan(&id, &source, &target)
        
        key := fmt.Sprintf("%s:%s:%s", policyID, source, target)
        if !currentKeys[key] {
            toResolve = append(toResolve, id)
        }
    }
    
    if len(toResolve) > 0 {
        _, err = t.db.Exec(ctx, `
            UPDATE violations SET resolved_at = NOW() WHERE id = ANY($1)
        `, toResolve)
        
        t.logger.Info("resolved violations", "count", len(toResolve), "policy", policyID)
    }
    
    return err
}
```

### Event Consumer

```go
type EventConsumer struct {
    nats    *nats.Conn
    engine  *PolicyEngine
    tracker *ViolationTracker
    syncer  *GraphSyncer
    logger  *slog.Logger
}

func (c *EventConsumer) Start(ctx context.Context) error {
    js, err := c.nats.JetStream()
    if err != nil {
        return err
    }
    
    // Subscribe to entity changes
    sub, err := js.Subscribe("substrate.entity.*", func(msg *nats.Msg) {
        var event EntityEvent
        if err := json.Unmarshal(msg.Data, &event); err != nil {
            c.logger.Error("failed to unmarshal event", "error", err)
            msg.Nak()
            return
        }
        
        c.handleEntityEvent(ctx, &event)
        msg.Ack()
    }, nats.Durable("governance-consumer"))
    
    if err != nil {
        return fmt.Errorf("failed to subscribe: %w", err)
    }
    
    c.logger.Info("started event consumer")
    
    <-ctx.Done()
    sub.Unsubscribe()
    return nil
}

func (c *EventConsumer) handleEntityEvent(ctx context.Context, event *EntityEvent) {
    // Trigger graph sync if entity affects dependencies
    if event.Entity.Type == "Component" || event.Entity.Type == "Service" {
        if err := c.syncer.SyncDependencies(ctx); err != nil {
            c.logger.Error("sync failed", "error", err)
        }
    }
    
    // Evaluate policies for affected components
    input := map[string]interface{}{
        "entity":    event.Entity,
        "operation": event.Type,
    }
    
    result, err := c.engine.Evaluate(ctx, input)
    if err != nil {
        c.logger.Error("evaluation failed", "error", err)
        return
    }
    
    // Record any violations
    for _, violation := range result.Violations {
        if err := c.tracker.RecordViolation(ctx, violation); err != nil {
            c.logger.Error("failed to record violation", "error", err)
        }
    }
}
```

### HTTP API

```go
func NewRouter(engine *PolicyEngine, tracker *ViolationTracker, syncer *GraphSyncer) *chi.Mux {
    r := chi.NewRouter()
    
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    r.Use(middleware.Timeout(30 * time.Second))
    
    r.Post("/evaluate", handleEvaluate(engine, tracker))
    r.Get("/policies", handleListPolicies(engine))
    r.Post("/policies", handleCreatePolicy(engine))
    r.Get("/violations", handleListViolations(tracker))
    r.Post("/violations/{id}/acknowledge", handleAcknowledgeViolation(tracker))
    r.Post("/sync", handleTriggerSync(syncer))
    r.Get("/health", handleHealth())
    
    return r
}

func handleEvaluate(engine *PolicyEngine, tracker *ViolationTracker) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var req EvaluateRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
        
        result, err := engine.Evaluate(r.Context(), req.Input)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        
        // Record violations
        for _, v := range result.Violations {
            tracker.RecordViolation(r.Context(), v)
        }
        
        resp := EvaluateResponse{
            Allow:      len(result.Violations) == 0 || !result.HasBlockingViolation(),
            Violations: result.Violations,
            Warnings:   result.Warnings,
        }
        
        json.NewEncoder(w).Encode(resp)
    }
}

type EvaluateRequest struct {
    Input map[string]interface{} `json:"input"`
}

type EvaluateResponse struct {
    Allow      bool         `json:"allow"`
    Violations []*Violation `json:"violations"`
    Warnings   []string     `json:"warnings"`
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/substrate-check.yml
name: Substrate Policy Check

on:
  pull_request:
    branches: [main]

jobs:
  policy-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Get changed files
        id: changed
        run: |
          echo "files=$(git diff --name-only origin/main...HEAD | jq -R -s -c 'split("\n")[:-1]')" >> $GITHUB_OUTPUT
      
      - name: Check policies
        uses: substrate/policy-check-action@v1
        with:
          api_url: ${{ secrets.SUBSTRATE_API_URL }}
          api_key: ${{ secrets.SUBSTRATE_API_KEY }}
          changed_files: ${{ steps.changed.outputs.files }}
          fail_on: critical,high
      
      - name: Comment on PR
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            const violations = JSON.parse(process.env.VIOLATIONS);
            let body = '## ⚠️ Substrate Policy Violations\n\n';
            for (const v of violations) {
              body += `### ${v.severity.toUpperCase()}: ${v.message}\n`;
              body += `- Source: \`${v.source}\`\n`;
              if (v.target) body += `- Target: \`${v.target}\`\n`;
              body += '\n';
            }
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: body
            });
```

### Terraform Integration

```hcl
# terraform/substrate-check.tf
data "external" "substrate_policy_check" {
  program = ["bash", "-c", <<-EOF
    curl -s -X POST "${var.substrate_api_url}/evaluate" \
      -H "Authorization: Bearer ${var.substrate_api_key}" \
      -H "Content-Type: application/json" \
      -d '{"input": ${jsonencode(local.terraform_plan_summary)}}'
  EOF
  ]
}

resource "null_resource" "policy_gate" {
  count = data.external.substrate_policy_check.result.allow == "false" ? 1 : 0
  
  provisioner "local-exec" {
    command = "echo 'Policy violations detected' && exit 1"
  }
}
```

## Configuration

```yaml
# config/governance.yaml

service:
  name: substrate-governance
  port: 8083
  
database:
  url: postgres://substrate:password@localhost:5432/substrate
  max_connections: 20

neo4j:
  uri: bolt://localhost:7687
  user: neo4j
  password: ${NEO4J_PASSWORD}

nats:
  url: nats://localhost:4222
  stream: substrate-events

opa:
  policy_dir: /policies
  bundle_polling_interval: 30s

sync:
  interval: 60s
  on_startup: true

enforcement:
  block_on_critical: true
  block_on_high: false
  
notifications:
  slack_webhook: ${SLACK_WEBHOOK_URL}
  email_recipients:
    - platform-team@company.com
```

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `governance_evaluations_total` | Counter | Total policy evaluations |
| `governance_evaluation_duration_seconds` | Histogram | Evaluation latency |
| `governance_violations_total` | Counter | Violations by severity |
| `governance_active_violations` | Gauge | Currently unresolved violations |
| `governance_sync_duration_seconds` | Histogram | Graph sync latency |
| `governance_policy_count` | Gauge | Number of loaded policies |

## Testing

```go
func TestCircularDependencyDetection(t *testing.T) {
    ctx := context.Background()
    
    engine, err := NewPolicyEngine(ctx, "testdata/policies")
    require.NoError(t, err)
    
    // Setup circular dependency: A -> B -> C -> A
    dependencies := map[string][]string{
        "ServiceA": {"ServiceB"},
        "ServiceB": {"ServiceC"},
        "ServiceC": {"ServiceA"},
    }
    
    err = engine.UpdateData(ctx, "architecture/dependencies", dependencies)
    require.NoError(t, err)
    
    result, err := engine.Evaluate(ctx, map[string]interface{}{})
    require.NoError(t, err)
    
    assert.Len(t, result.Violations, 3) // Each node in cycle detected
    assert.Equal(t, SeverityCritical, result.Violations[0].Severity)
}

func TestLayerViolation(t *testing.T) {
    ctx := context.Background()
    
    engine, err := NewPolicyEngine(ctx, "testdata/policies")
    require.NoError(t, err)
    
    // Infrastructure layer depending on presentation layer
    dependencies := map[string][]string{
        "DatabaseMigrator": {"UIController"},
    }
    layers := map[string]string{
        "DatabaseMigrator": "infrastructure",
        "UIController":     "presentation",
    }
    
    engine.UpdateData(ctx, "architecture/dependencies", dependencies)
    engine.UpdateData(ctx, "architecture/component_layers", layers)
    
    result, err := engine.Evaluate(ctx, map[string]interface{}{})
    require.NoError(t, err)
    
    assert.Len(t, result.Violations, 1)
    assert.Contains(t, result.Violations[0].Message, "Layer violation")
}
```