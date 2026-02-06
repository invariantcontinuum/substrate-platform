# Ingestion Service

## Overview

The Ingestion Service is Substrate's high-performance data extraction engine written in Rust. It continuously monitors external data sources, parses content into structured entities, and emits normalized events for downstream processing.

## Responsibilities

1. **Source Connectivity**: Connect to GitHub, Jira, Confluence, Slack via webhooks and polling
2. **Code Parsing**: Extract AST and dependency graphs using tree-sitter and stack-graphs
3. **Entity Extraction**: Transform raw data into normalized entity/relationship models
4. **Event Emission**: Publish changes to NATS JetStream with exactly-once semantics
5. **State Management**: Track sync cursors and incremental change detection

## Technology Stack

| Component | Library | Version | Purpose |
|-----------|---------|---------|---------|
| Runtime | Tokio | 1.40+ | Async runtime |
| HTTP | Reqwest | 0.12+ | API client |
| Parsing | tree-sitter | 0.24+ | Language-agnostic AST |
| Resolution | stack-graphs | 0.14+ | Cross-file name binding |
| Database | SQLx | 0.8+ | PostgreSQL driver |
| Events | async-nats | 0.37+ | NATS JetStream client |
| Parallelism | Rayon | 1.10+ | Data parallelism |
| File Watch | Notify | 7.0+ | Filesystem events |
| Serialization | Serde | 1.0+ | JSON/MessagePack |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INGESTION SERVICE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   GitHub    │  │    Jira     │  │ Confluence  │  │   Slack     │   │
│  │  Connector  │  │  Connector  │  │  Connector  │  │  Connector  │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
│         │                │                │                │           │
│         └────────────────┴────────────────┴────────────────┘           │
│                                   │                                     │
│                                   ▼                                     │
│                    ┌─────────────────────────────┐                      │
│                    │      Change Queue           │                      │
│                    │   (Crossbeam Channel)       │                      │
│                    └─────────────────────────────┘                      │
│                                   │                                     │
│                    ┌──────────────┴──────────────┐                      │
│                    ▼                             ▼                      │
│         ┌─────────────────────┐      ┌─────────────────────┐           │
│         │   Code Parser       │      │   Document Parser   │           │
│         │  (tree-sitter +     │      │   (LLM Entity       │           │
│         │   stack-graphs)     │      │    Extraction)      │           │
│         └─────────────────────┘      └─────────────────────┘           │
│                    │                             │                      │
│                    └──────────────┬──────────────┘                      │
│                                   ▼                                     │
│                    ┌─────────────────────────────┐                      │
│                    │    Entity Resolution        │                      │
│                    │  (Deterministic + Splink)   │                      │
│                    └─────────────────────────────┘                      │
│                                   │                                     │
│                    ┌──────────────┴──────────────┐                      │
│                    ▼                             ▼                      │
│         ┌─────────────────────┐      ┌─────────────────────┐           │
│         │    PostgreSQL       │      │   NATS JetStream    │           │
│         │   (Outbox Table)    │      │   (Event Stream)    │           │
│         └─────────────────────┘      └─────────────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### Connector Interface

All connectors implement a standard trait:

```rust
#[async_trait]
pub trait Connector: Send + Sync {
    /// Returns connector metadata
    fn spec(&self) -> ConnectorSpec;
    
    /// Validates credentials and connectivity
    async fn check(&self, config: &ConnectorConfig) -> Result<ConnectionStatus>;
    
    /// Discovers available streams/resources
    async fn discover(&self, config: &ConnectorConfig) -> Result<Vec<Stream>>;
    
    /// Reads data from a stream with cursor-based pagination
    async fn read(
        &self,
        config: &ConnectorConfig,
        stream: &Stream,
        cursor: Option<&Cursor>,
    ) -> Result<ReadOutput>;
}

pub struct ReadOutput {
    pub records: Vec<RawRecord>,
    pub next_cursor: Option<Cursor>,
    pub state_checkpoint: StateCheckpoint,
}
```

### Code Parser Pipeline

```rust
pub struct CodeParser {
    languages: HashMap<String, tree_sitter::Language>,
    stack_graph_languages: HashMap<String, StackGraphLanguage>,
}

impl CodeParser {
    pub fn parse_file(&self, path: &Path, content: &str) -> Result<ParsedFile> {
        // 1. Detect language from extension
        let lang = self.detect_language(path)?;
        
        // 2. Parse AST with tree-sitter
        let tree = self.parse_ast(lang, content)?;
        
        // 3. Build partial stack-graph for name resolution
        let partial_graph = self.build_stack_graph(lang, path, &tree)?;
        
        // 4. Extract entities from AST
        let entities = self.extract_entities(&tree, path)?;
        
        Ok(ParsedFile {
            path: path.to_owned(),
            hash: blake3::hash(content.as_bytes()),
            entities,
            partial_graph,
            parse_time: Instant::now(),
        })
    }
    
    pub fn resolve_references(
        &self,
        files: &[ParsedFile],
    ) -> Result<Vec<ResolvedReference>> {
        // Merge partial stack-graphs
        let mut combined = StackGraph::new();
        for file in files {
            combined.merge(&file.partial_graph)?;
        }
        
        // Resolve all references to definitions
        let mut references = Vec::new();
        for file in files {
            for reference in &file.entities.references {
                if let Some(definition) = combined.resolve(reference)? {
                    references.push(ResolvedReference {
                        from_file: file.path.clone(),
                        from_symbol: reference.clone(),
                        to_file: definition.file.clone(),
                        to_symbol: definition.symbol.clone(),
                        confidence: 1.0, // Stack-graphs are deterministic
                    });
                }
            }
        }
        
        Ok(references)
    }
}
```

### Entity Extraction

```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    pub id: Uuid,
    pub external_id: String,
    pub source: DataSource,
    pub entity_type: EntityType,
    pub name: String,
    pub qualified_name: Option<String>,
    pub properties: HashMap<String, Value>,
    pub embeddings: Option<Vec<f32>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EntityType {
    // Code entities
    Repository,
    Module,
    Class,
    Function,
    Interface,
    Endpoint,
    
    // Infrastructure entities
    Service,
    Database,
    Queue,
    Cache,
    
    // Documentation entities
    Document,
    Section,
    ADR,
    
    // Project entities
    Epic,
    Story,
    Task,
    
    // Organization entities
    Team,
    User,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relationship {
    pub id: Uuid,
    pub source_id: Uuid,
    pub target_id: Uuid,
    pub relationship_type: RelationshipType,
    pub properties: HashMap<String, Value>,
    pub confidence: f32,
    pub evidence: Vec<Evidence>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RelationshipType {
    // Code relationships
    DependsOn,
    Imports,
    Calls,
    Implements,
    Extends,
    
    // Ownership relationships
    Owns,
    Maintains,
    
    // Documentation relationships
    Documents,
    References,
    
    // Data relationships
    ReadsFrom,
    WritesTo,
    
    // Deployment relationships
    DeploysTo,
    RunsOn,
}
```

### Outbox Pattern Implementation

```rust
pub struct OutboxPublisher {
    pool: PgPool,
    nats: async_nats::Client,
}

impl OutboxPublisher {
    /// Atomically writes entity and outbox event in single transaction
    pub async fn publish_entity(&self, entity: &Entity) -> Result<()> {
        let mut tx = self.pool.begin().await?;
        
        // Insert/update entity
        sqlx::query!(
            r#"
            INSERT INTO entities (id, external_id, source, entity_type, name, properties, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT (external_id, source) DO UPDATE SET
                name = EXCLUDED.name,
                properties = EXCLUDED.properties,
                updated_at = NOW()
            "#,
            entity.id,
            entity.external_id,
            entity.source as _,
            entity.entity_type as _,
            entity.name,
            serde_json::to_value(&entity.properties)?,
        )
        .execute(&mut *tx)
        .await?;
        
        // Insert outbox event
        let event = EntityEvent::Created(entity.clone());
        sqlx::query!(
            r#"
            INSERT INTO event_outbox (id, event_type, payload, created_at)
            VALUES ($1, $2, $3, NOW())
            "#,
            Uuid::new_v4(),
            "entity.created",
            serde_json::to_value(&event)?,
        )
        .execute(&mut *tx)
        .await?;
        
        tx.commit().await?;
        Ok(())
    }
    
    /// Background task that polls outbox and publishes to NATS
    pub async fn run_dispatcher(&self) -> Result<()> {
        let jetstream = async_nats::jetstream::new(self.nats.clone());
        
        loop {
            // Fetch unpublished events
            let events = sqlx::query_as!(
                OutboxEvent,
                r#"
                SELECT id, event_type, payload, created_at
                FROM event_outbox
                WHERE published_at IS NULL
                ORDER BY created_at
                LIMIT 100
                FOR UPDATE SKIP LOCKED
                "#
            )
            .fetch_all(&self.pool)
            .await?;
            
            for event in events {
                // Publish to NATS JetStream
                jetstream
                    .publish(
                        format!("substrate.{}", event.event_type),
                        event.payload.to_string().into(),
                    )
                    .await?
                    .await?;
                
                // Mark as published
                sqlx::query!(
                    "UPDATE event_outbox SET published_at = NOW() WHERE id = $1",
                    event.id
                )
                .execute(&self.pool)
                .await?;
            }
            
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
    }
}
```

## Connector Implementations

### GitHub Connector

```rust
pub struct GitHubConnector {
    client: Octocrab,
    app_id: AppId,
    private_key: SecretString,
}

impl GitHubConnector {
    async fn sync_repository(&self, repo: &Repository) -> Result<Vec<Entity>> {
        let mut entities = Vec::new();
        
        // 1. Fetch repository metadata
        entities.push(Entity {
            entity_type: EntityType::Repository,
            external_id: format!("github:repo:{}", repo.id),
            name: repo.full_name.clone(),
            properties: hashmap! {
                "url" => repo.html_url.to_string(),
                "default_branch" => repo.default_branch.clone(),
                "language" => repo.language.clone().unwrap_or_default(),
            },
            ..Default::default()
        });
        
        // 2. Fetch file tree recursively
        let tree = self.client
            .repos(&repo.owner.login, &repo.name)
            .get_content()
            .path("")
            .r#ref(&repo.default_branch)
            .send()
            .await?;
        
        // 3. Parse code files
        for item in tree.items {
            if self.is_code_file(&item.path) {
                let content = self.fetch_file_content(&repo, &item.path).await?;
                let parsed = self.code_parser.parse_file(&item.path, &content)?;
                entities.extend(parsed.entities);
            }
        }
        
        // 4. Fetch CODEOWNERS for ownership mapping
        if let Ok(codeowners) = self.fetch_codeowners(&repo).await {
            entities.extend(self.parse_codeowners(&repo, &codeowners)?);
        }
        
        Ok(entities)
    }
    
    async fn handle_webhook(&self, event: WebhookEvent) -> Result<Vec<Entity>> {
        match event {
            WebhookEvent::Push(push) => {
                // Only re-parse changed files
                let mut entities = Vec::new();
                for commit in push.commits {
                    for file in commit.added.iter().chain(&commit.modified) {
                        if self.is_code_file(file) {
                            let content = self.fetch_file_content(&push.repository, file).await?;
                            let parsed = self.code_parser.parse_file(file, &content)?;
                            entities.extend(parsed.entities);
                        }
                    }
                }
                Ok(entities)
            }
            WebhookEvent::PullRequest(pr) => {
                // Extract PR metadata and changed files
                self.sync_pull_request(&pr).await
            }
            _ => Ok(vec![]),
        }
    }
}
```

### Jira Connector

```rust
pub struct JiraConnector {
    client: reqwest::Client,
    base_url: Url,
    api_token: SecretString,
}

impl JiraConnector {
    async fn sync_project(&self, project_key: &str, cursor: Option<&Cursor>) -> Result<ReadOutput> {
        let start_at = cursor.map(|c| c.offset).unwrap_or(0);
        
        let response: JiraSearchResponse = self.client
            .get(self.base_url.join("/rest/api/3/search")?)
            .query(&[
                ("jql", format!("project = {} ORDER BY updated DESC", project_key)),
                ("startAt", start_at.to_string()),
                ("maxResults", "100".to_string()),
                ("expand", "changelog,names".to_string()),
            ])
            .bearer_auth(self.api_token.expose_secret())
            .send()
            .await?
            .json()
            .await?;
        
        let mut entities = Vec::new();
        
        for issue in response.issues {
            // Map Jira issue to Entity
            entities.push(Entity {
                entity_type: match issue.fields.issuetype.name.as_str() {
                    "Epic" => EntityType::Epic,
                    "Story" => EntityType::Story,
                    _ => EntityType::Task,
                },
                external_id: format!("jira:issue:{}", issue.key),
                name: issue.fields.summary.clone(),
                properties: hashmap! {
                    "key" => issue.key.clone(),
                    "status" => issue.fields.status.name.clone(),
                    "priority" => issue.fields.priority.name.clone(),
                    "assignee" => issue.fields.assignee.map(|a| a.display_name).unwrap_or_default(),
                    "labels" => issue.fields.labels.join(","),
                    "description" => issue.fields.description.unwrap_or_default(),
                },
                ..Default::default()
            });
            
            // Extract issue links as relationships
            for link in issue.fields.issuelinks {
                entities.push(self.create_link_relationship(&issue.key, &link)?);
            }
        }
        
        let next_cursor = if response.start_at + response.max_results < response.total {
            Some(Cursor { offset: response.start_at + response.max_results })
        } else {
            None
        };
        
        Ok(ReadOutput {
            records: entities.into_iter().map(RawRecord::Entity).collect(),
            next_cursor,
            state_checkpoint: StateCheckpoint {
                last_sync: Utc::now(),
                cursor: next_cursor.clone(),
            },
        })
    }
}
```

## Entity Resolution

Substrate uses a three-layer entity resolution strategy:

```rust
pub struct EntityResolver {
    deterministic_rules: Vec<DeterministicRule>,
    splink_model: Option<SplinkModel>,
}

impl EntityResolver {
    pub fn resolve(&self, entities: &[Entity]) -> Result<Vec<ResolvedEntity>> {
        let mut resolved = Vec::new();
        let mut canonical_map: HashMap<String, Uuid> = HashMap::new();
        
        for entity in entities {
            // Layer 1: Deterministic matching (email, SSO ID, username)
            if let Some(canonical_id) = self.deterministic_match(&entity, &canonical_map) {
                resolved.push(ResolvedEntity {
                    entity: entity.clone(),
                    canonical_id,
                    resolution_method: ResolutionMethod::Deterministic,
                    confidence: 1.0,
                });
                continue;
            }
            
            // Layer 2: Probabilistic matching (Fellegi-Sunter via Splink)
            if let Some(ref model) = self.splink_model {
                if let Some((canonical_id, confidence)) = model.find_match(&entity, &resolved) {
                    if confidence > 0.85 {
                        resolved.push(ResolvedEntity {
                            entity: entity.clone(),
                            canonical_id,
                            resolution_method: ResolutionMethod::Probabilistic,
                            confidence,
                        });
                        continue;
                    }
                }
            }
            
            // Layer 3: Create new canonical entity
            let canonical_id = Uuid::new_v4();
            canonical_map.insert(entity.external_id.clone(), canonical_id);
            resolved.push(ResolvedEntity {
                entity: entity.clone(),
                canonical_id,
                resolution_method: ResolutionMethod::NewCanonical,
                confidence: 1.0,
            });
        }
        
        Ok(resolved)
    }
    
    fn deterministic_match(
        &self,
        entity: &Entity,
        canonical_map: &HashMap<String, Uuid>,
    ) -> Option<Uuid> {
        for rule in &self.deterministic_rules {
            if let Some(key) = rule.extract_key(entity) {
                if let Some(&canonical_id) = canonical_map.get(&key) {
                    return Some(canonical_id);
                }
            }
        }
        None
    }
}
```

## Configuration

```toml
# config/ingestion.toml

[service]
name = "substrate-ingestion"
port = 8081
log_level = "info"

[database]
url = "postgres://substrate:password@localhost:5432/substrate"
max_connections = 20
min_connections = 5

[nats]
url = "nats://localhost:4222"
stream_name = "substrate-events"

[connectors.github]
enabled = true
app_id = 12345
private_key_path = "/secrets/github-app.pem"
webhook_secret = "${GITHUB_WEBHOOK_SECRET}"
sync_interval = "5m"

[connectors.jira]
enabled = true
base_url = "https://company.atlassian.net"
api_token = "${JIRA_API_TOKEN}"
sync_interval = "10m"
projects = ["ARCH", "PLATFORM", "INFRA"]

[connectors.confluence]
enabled = true
base_url = "https://company.atlassian.net/wiki"
api_token = "${CONFLUENCE_API_TOKEN}"
sync_interval = "30m"
spaces = ["ARCH", "ADR", "RUNBOOKS"]

[parsing]
languages = ["rust", "python", "go", "typescript", "java"]
max_file_size_kb = 1024
parallelism = 8

[resolution]
enable_probabilistic = true
splink_model_path = "/models/entity_resolution.pkl"
confidence_threshold = 0.85
```

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `ingestion_files_parsed_total` | Counter | Total files parsed by language |
| `ingestion_entities_extracted_total` | Counter | Entities extracted by type |
| `ingestion_parse_duration_seconds` | Histogram | File parse latency |
| `ingestion_connector_sync_duration_seconds` | Histogram | Full sync duration by connector |
| `ingestion_outbox_lag_seconds` | Gauge | Time since oldest unpublished event |
| `ingestion_queue_depth` | Gauge | Items waiting in change queue |

## Error Handling

```rust
#[derive(Debug, thiserror::Error)]
pub enum IngestionError {
    #[error("Connector error: {connector} - {message}")]
    Connector { connector: String, message: String },
    
    #[error("Parse error: {path} - {message}")]
    Parse { path: PathBuf, message: String },
    
    #[error("Resolution error: {message}")]
    Resolution { message: String },
    
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("NATS error: {0}")]
    Nats(#[from] async_nats::Error),
}

impl IngestionError {
    pub fn is_retryable(&self) -> bool {
        matches!(self, 
            Self::Connector { .. } | 
            Self::Database(_) | 
            Self::Nats(_)
        )
    }
}
```

## Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use testcontainers::{clients, images::postgres::Postgres};
    
    #[tokio::test]
    async fn test_github_sync() {
        let docker = clients::Cli::default();
        let pg = docker.run(Postgres::default());
        
        let connector = GitHubConnector::new_for_test();
        let result = connector.sync_repository(&test_repo()).await.unwrap();
        
        assert!(!result.is_empty());
        assert!(result.iter().any(|e| e.entity_type == EntityType::Repository));
    }
    
    #[tokio::test]
    async fn test_code_parser() {
        let parser = CodeParser::new(&["rust", "python"]).unwrap();
        
        let rust_code = r#"
            pub fn hello(name: &str) -> String {
                format!("Hello, {}!", name)
            }
        "#;
        
        let parsed = parser.parse_file(Path::new("test.rs"), rust_code).unwrap();
        
        assert_eq!(parsed.entities.len(), 1);
        assert_eq!(parsed.entities[0].entity_type, EntityType::Function);
        assert_eq!(parsed.entities[0].name, "hello");
    }
}
```