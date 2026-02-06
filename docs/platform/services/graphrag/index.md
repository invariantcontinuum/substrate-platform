# GraphRAG Service

## Overview

The GraphRAG Service implements Microsoft's Graph Retrieval-Augmented Generation architecture to power Substrate's semantic querying capabilities. It combines knowledge graph traversal with vector similarity search to answer complex architectural questions with full traceability.

## Responsibilities

1. **Document Indexing**: Process documents through the 7-phase GraphRAG pipeline
2. **Community Detection**: Apply Hierarchical Leiden algorithm for entity clustering
3. **Summarization**: Generate LLM-powered community summaries at multiple granularities
4. **Query Processing**: Execute Local, Global, and DRIFT search strategies
5. **Hybrid Retrieval**: Combine Neo4j graph traversal with Qdrant vector search

## Technology Stack

| Component | Library | Version | Purpose |
|-----------|---------|---------|---------|
| Framework | FastAPI | 0.115+ | REST API |
| GraphRAG | graphrag | 1.0+ | Microsoft GraphRAG SDK |
| Workflow | Prefect | 3.0+ | Pipeline orchestration |
| LLM | vLLM | 0.6+ | Local inference |
| Graph DB | neo4j | 5.26+ | Python driver |
| Vector DB | qdrant-client | 1.12+ | Qdrant client |
| Embeddings | sentence-transformers | 3.3+ | Text embeddings |
| Tasks | Celery | 5.4+ | Async task queue |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GRAPHRAG SERVICE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      FastAPI Application                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │  /index  │  │  /query  │  │ /status  │  │ /health  │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                     │
│                    ┌──────────────┴──────────────┐                      │
│                    ▼                             ▼                      │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐      │
│  │     Indexing Pipeline       │  │      Query Engine           │      │
│  │  ┌───────────────────────┐  │  │  ┌───────────────────────┐  │      │
│  │  │ 1. Text Chunking      │  │  │  │ Local Search          │  │      │
│  │  │ 2. Graph Extraction   │  │  │  │ (Entity Traversal)    │  │      │
│  │  │ 3. Community Detection│  │  │  └───────────────────────┘  │      │
│  │  │ 4. Summarization      │  │  │  ┌───────────────────────┐  │      │
│  │  │ 5. Embedding          │  │  │  │ Global Search         │  │      │
│  │  └───────────────────────┘  │  │  │ (Map-Reduce)          │  │      │
│  └─────────────────────────────┘  │  └───────────────────────┘  │      │
│                                   │  ┌───────────────────────┐  │      │
│                                   │  │ DRIFT Search          │  │      │
│                                   │  │ (Hybrid)              │  │      │
│                                   │  └───────────────────────┘  │      │
│                                   └─────────────────────────────┘      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Background Workers (Celery)                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │   │
│  │  │ Index Worker │  │ Embed Worker │  │ Summarize    │          │   │
│  │  │              │  │              │  │ Worker       │          │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                    │                             │
         ┌──────────┴──────────┐       ┌─────────┴─────────┐
         ▼                     ▼       ▼                   ▼
  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
  │   Neo4j     │       │   Qdrant    │       │    vLLM     │
  │  (Graph)    │       │  (Vector)   │       │   (LLM)     │
  └─────────────┘       └─────────────┘       └─────────────┘
```

## GraphRAG Indexing Pipeline

The indexing pipeline follows Microsoft's 7-phase architecture:

### Phase 1: Text Chunking

```python
from graphrag.index.text_splitting import TokenTextSplitter

class TextChunker:
    def __init__(self, chunk_size: int = 1200, overlap: int = 100):
        self.splitter = TokenTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=overlap,
            encoding_name="cl100k_base"  # GPT-4 tokenizer
        )
    
    def chunk_documents(self, documents: list[Document]) -> list[TextUnit]:
        text_units = []
        for doc in documents:
            chunks = self.splitter.split_text(doc.content)
            for i, chunk in enumerate(chunks):
                text_units.append(TextUnit(
                    id=f"{doc.id}_chunk_{i}",
                    document_id=doc.id,
                    text=chunk,
                    n_tokens=len(self.splitter.encode(chunk)),
                    metadata={
                        "source": doc.source,
                        "path": doc.path,
                        "chunk_index": i,
                    }
                ))
        return text_units
```

### Phase 2: Graph Extraction

```python
from graphrag.index.graph.extractors import GraphExtractor

# Custom entity types for software architecture
ENTITY_TYPES = [
    "Service", "API", "Module", "Database", "Component",
    "Team", "Repository", "Package", "Function", "Class",
    "Interface", "Endpoint", "Queue", "Cache", "Policy"
]

RELATIONSHIP_TYPES = [
    "depends_on", "calls", "imports", "owns", "maintains",
    "reads_from", "writes_to", "deploys_to", "implements",
    "exposes", "documents", "violates", "requires"
]

class ArchitectureGraphExtractor:
    def __init__(self, llm_client: LLMClient):
        self.extractor = GraphExtractor(
            llm_client=llm_client,
            entity_types=ENTITY_TYPES,
            relationship_types=RELATIONSHIP_TYPES,
            extraction_prompt=ARCHITECTURE_EXTRACTION_PROMPT,
        )
    
    async def extract(self, text_units: list[TextUnit]) -> ExtractedGraph:
        entities = []
        relationships = []
        
        for unit in text_units:
            result = await self.extractor.extract(
                text=unit.text,
                metadata={"text_unit_id": unit.id}
            )
            
            for entity in result.entities:
                entities.append(ExtractedEntity(
                    id=generate_entity_id(entity.name, entity.type),
                    name=entity.name,
                    type=entity.type,
                    description=entity.description,
                    source_text_unit_ids=[unit.id],
                ))
            
            for rel in result.relationships:
                relationships.append(ExtractedRelationship(
                    source=rel.source,
                    target=rel.target,
                    type=rel.type,
                    description=rel.description,
                    weight=rel.weight,
                    source_text_unit_ids=[unit.id],
                ))
        
        return ExtractedGraph(
            entities=deduplicate_entities(entities),
            relationships=deduplicate_relationships(relationships),
        )
```

### Phase 3: Hierarchical Leiden Community Detection

```python
import graspologic as gc
import networkx as nx

class CommunityDetector:
    def __init__(self, max_levels: int = 3, resolution: float = 1.0):
        self.max_levels = max_levels
        self.resolution = resolution
    
    def detect_communities(self, graph: ExtractedGraph) -> HierarchicalCommunities:
        # Build NetworkX graph
        G = nx.Graph()
        for entity in graph.entities:
            G.add_node(entity.id, **entity.model_dump())
        for rel in graph.relationships:
            G.add_edge(rel.source, rel.target, weight=rel.weight)
        
        # Apply Hierarchical Leiden
        communities_by_level = {}
        current_graph = G
        
        for level in range(self.max_levels):
            partition = gc.partition.leiden(
                current_graph,
                resolution=self.resolution * (2 ** level),
                random_state=42,
            )
            
            communities_by_level[level] = []
            community_map = {}
            
            for node, community_id in partition.items():
                if community_id not in community_map:
                    community_map[community_id] = Community(
                        id=f"community_{level}_{community_id}",
                        level=level,
                        member_ids=[],
                    )
                community_map[community_id].member_ids.append(node)
            
            communities_by_level[level] = list(community_map.values())
            
            # Create meta-graph for next level
            current_graph = self._create_meta_graph(G, partition)
            
            if len(current_graph.nodes) <= 1:
                break
        
        return HierarchicalCommunities(
            levels=communities_by_level,
            total_communities=sum(len(c) for c in communities_by_level.values()),
        )
    
    def _create_meta_graph(self, G: nx.Graph, partition: dict) -> nx.Graph:
        meta = nx.Graph()
        for node, community in partition.items():
            if community not in meta:
                meta.add_node(community)
            for neighbor in G.neighbors(node):
                neighbor_community = partition[neighbor]
                if neighbor_community != community:
                    if meta.has_edge(community, neighbor_community):
                        meta[community][neighbor_community]["weight"] += 1
                    else:
                        meta.add_edge(community, neighbor_community, weight=1)
        return meta
```

### Phase 4: Community Summarization

```python
class CommunitySummarizer:
    def __init__(self, llm_client: LLMClient):
        self.llm = llm_client
    
    async def summarize_communities(
        self,
        communities: HierarchicalCommunities,
        entities: list[ExtractedEntity],
        relationships: list[ExtractedRelationship],
    ) -> list[CommunitySummary]:
        summaries = []
        entity_map = {e.id: e for e in entities}
        
        for level, level_communities in communities.levels.items():
            for community in level_communities:
                # Gather community content
                member_entities = [entity_map[mid] for mid in community.member_ids if mid in entity_map]
                member_relationships = [
                    r for r in relationships
                    if r.source in community.member_ids or r.target in community.member_ids
                ]
                
                # Generate summary using LLM
                prompt = self._build_summary_prompt(
                    community, member_entities, member_relationships, level
                )
                
                response = await self.llm.generate(
                    prompt=prompt,
                    max_tokens=1000,
                    temperature=0.0,
                )
                
                summaries.append(CommunitySummary(
                    community_id=community.id,
                    level=level,
                    title=self._extract_title(response),
                    summary=response,
                    key_entities=[e.name for e in member_entities[:10]],
                    entity_count=len(member_entities),
                    relationship_count=len(member_relationships),
                ))
        
        return summaries
    
    def _build_summary_prompt(
        self,
        community: Community,
        entities: list[ExtractedEntity],
        relationships: list[ExtractedRelationship],
        level: int,
    ) -> str:
        granularity = ["detailed", "moderate", "high-level"][min(level, 2)]
        
        return f"""Summarize the following software architecture community at a {granularity} level.

ENTITIES:
{self._format_entities(entities)}

RELATIONSHIPS:
{self._format_relationships(relationships)}

Provide:
1. A descriptive title for this community (max 10 words)
2. A summary of its purpose and key responsibilities
3. Key architectural patterns or concerns
4. Notable dependencies or integrations

Format as structured text with clear sections."""
```

### Phase 5: Embedding Generation

```python
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

class EmbeddingGenerator:
    def __init__(
        self,
        model_name: str = "BAAI/bge-large-en-v1.5",
        qdrant_url: str = "http://localhost:6333",
    ):
        self.model = SentenceTransformer(model_name)
        self.qdrant = QdrantClient(url=qdrant_url)
        self.dimension = self.model.get_sentence_embedding_dimension()
    
    def setup_collections(self):
        collections = [
            ("entity_embeddings", self.dimension),
            ("text_unit_embeddings", self.dimension),
            ("community_report_embeddings", self.dimension),
        ]
        
        for name, dim in collections:
            self.qdrant.recreate_collection(
                collection_name=name,
                vectors_config=VectorParams(
                    size=dim,
                    distance=Distance.COSINE,
                ),
            )
    
    async def embed_entities(self, entities: list[ExtractedEntity]):
        texts = [f"{e.name}: {e.description}" for e in entities]
        embeddings = self.model.encode(texts, normalize_embeddings=True)
        
        points = [
            PointStruct(
                id=hash(e.id) % (2**63),
                vector=embedding.tolist(),
                payload={
                    "entity_id": e.id,
                    "name": e.name,
                    "type": e.type,
                    "description": e.description,
                },
            )
            for e, embedding in zip(entities, embeddings)
        ]
        
        self.qdrant.upsert(collection_name="entity_embeddings", points=points)
    
    async def embed_text_units(self, text_units: list[TextUnit]):
        embeddings = self.model.encode(
            [u.text for u in text_units],
            normalize_embeddings=True,
        )
        
        points = [
            PointStruct(
                id=hash(u.id) % (2**63),
                vector=embedding.tolist(),
                payload={
                    "text_unit_id": u.id,
                    "document_id": u.document_id,
                    "text": u.text[:500],  # Truncate for storage
                    "metadata": u.metadata,
                },
            )
            for u, embedding in zip(text_units, embeddings)
        ]
        
        self.qdrant.upsert(collection_name="text_unit_embeddings", points=points)
    
    async def embed_community_reports(self, summaries: list[CommunitySummary]):
        texts = [f"{s.title}\n{s.summary}" for s in summaries]
        embeddings = self.model.encode(texts, normalize_embeddings=True)
        
        points = [
            PointStruct(
                id=hash(s.community_id) % (2**63),
                vector=embedding.tolist(),
                payload={
                    "community_id": s.community_id,
                    "level": s.level,
                    "title": s.title,
                    "summary": s.summary[:1000],
                    "key_entities": s.key_entities,
                },
            )
            for s, embedding in zip(summaries, embeddings)
        ]
        
        self.qdrant.upsert(collection_name="community_report_embeddings", points=points)
```

## Query Engine

### Local Search (Entity-Centric)

```python
class LocalSearchEngine:
    def __init__(self, neo4j_driver, qdrant_client, llm_client):
        self.neo4j = neo4j_driver
        self.qdrant = qdrant_client
        self.llm = llm_client
    
    async def search(self, query: str, max_hops: int = 2) -> SearchResult:
        # 1. Find relevant entities via vector search
        query_embedding = self.embed(query)
        similar_entities = self.qdrant.search(
            collection_name="entity_embeddings",
            query_vector=query_embedding,
            limit=20,
        )
        
        # 2. Expand via graph traversal
        entity_ids = [e.payload["entity_id"] for e in similar_entities]
        
        with self.neo4j.session() as session:
            result = session.run("""
                MATCH (e:Entity)
                WHERE e.id IN $entity_ids
                CALL apoc.path.subgraphAll(e, {
                    maxLevel: $max_hops,
                    relationshipFilter: "DEPENDS_ON|CALLS|IMPORTS|OWNS"
                })
                YIELD nodes, relationships
                RETURN nodes, relationships
            """, entity_ids=entity_ids, max_hops=max_hops)
            
            subgraph = self._parse_subgraph(result)
        
        # 3. Retrieve supporting text units
        text_units = await self._get_text_units(subgraph.node_ids)
        
        # 4. Generate answer with context
        context = self._build_context(subgraph, text_units)
        
        answer = await self.llm.generate(
            prompt=f"""Based on the following architectural context, answer the question.

CONTEXT:
{context}

QUESTION: {query}

Provide a detailed answer with specific references to entities and relationships.
Include evidence from the source documents.""",
            max_tokens=2000,
        )
        
        return SearchResult(
            answer=answer,
            entities=subgraph.nodes,
            relationships=subgraph.relationships,
            sources=text_units,
            search_type="local",
        )
```

### Global Search (Map-Reduce)

```python
class GlobalSearchEngine:
    def __init__(self, qdrant_client, llm_client):
        self.qdrant = qdrant_client
        self.llm = llm_client
    
    async def search(
        self,
        query: str,
        community_level: int = 1,
        map_limit: int = 10,
    ) -> SearchResult:
        # 1. Find relevant community reports
        query_embedding = self.embed(query)
        relevant_communities = self.qdrant.search(
            collection_name="community_report_embeddings",
            query_vector=query_embedding,
            query_filter=Filter(
                must=[FieldCondition(key="level", match=MatchValue(value=community_level))]
            ),
            limit=map_limit,
        )
        
        # 2. Map phase: Generate partial answers from each community
        partial_answers = []
        for community in relevant_communities:
            partial = await self.llm.generate(
                prompt=f"""Based on this community summary, provide relevant information for the question.

COMMUNITY: {community.payload['title']}
SUMMARY: {community.payload['summary']}

QUESTION: {query}

If this community is not relevant, respond with "NOT_RELEVANT".
Otherwise, provide specific findings with importance scores (0-100).""",
                max_tokens=500,
            )
            
            if "NOT_RELEVANT" not in partial:
                partial_answers.append({
                    "community": community.payload['title'],
                    "content": partial,
                    "score": community.score,
                })
        
        # 3. Reduce phase: Synthesize final answer
        if not partial_answers:
            return SearchResult(
                answer="No relevant information found in the knowledge graph.",
                entities=[],
                relationships=[],
                sources=[],
                search_type="global",
            )
        
        final_answer = await self.llm.generate(
            prompt=f"""Synthesize these findings into a comprehensive answer.

QUESTION: {query}

FINDINGS:
{self._format_findings(partial_answers)}

Provide a well-structured answer that:
1. Addresses the question directly
2. Synthesizes information from multiple communities
3. Highlights any contradictions or uncertainties
4. Cites specific communities as sources""",
            max_tokens=2000,
        )
        
        return SearchResult(
            answer=final_answer,
            entities=[],
            relationships=[],
            sources=[{"community": p["community"], "content": p["content"]} for p in partial_answers],
            search_type="global",
        )
```

### DRIFT Search (Hybrid)

```python
class DRIFTSearchEngine:
    """Dynamic Reasoning with Flexible Traversal - combines global context with local precision."""
    
    def __init__(self, local_engine: LocalSearchEngine, global_engine: GlobalSearchEngine):
        self.local = local_engine
        self.global_ = global_engine
    
    async def search(self, query: str) -> SearchResult:
        # Phase 1: Primer - Get global context
        primer_result = await self.global_.search(
            query=query,
            community_level=2,  # High-level overview
            map_limit=5,
        )
        
        # Phase 2: Identify follow-up queries
        follow_ups = await self._generate_follow_ups(query, primer_result)
        
        # Phase 3: Local refinement for each follow-up
        local_results = []
        for follow_up in follow_ups:
            result = await self.local.search(
                query=follow_up,
                max_hops=2,
            )
            local_results.append(result)
        
        # Phase 4: Synthesize hierarchical output
        final_answer = await self._synthesize(query, primer_result, local_results)
        
        # Combine all entities and relationships
        all_entities = []
        all_relationships = []
        all_sources = primer_result.sources.copy()
        
        for result in local_results:
            all_entities.extend(result.entities)
            all_relationships.extend(result.relationships)
            all_sources.extend(result.sources)
        
        return SearchResult(
            answer=final_answer,
            entities=deduplicate(all_entities),
            relationships=deduplicate(all_relationships),
            sources=all_sources,
            search_type="drift",
        )
    
    async def _generate_follow_ups(
        self,
        original_query: str,
        primer: SearchResult,
    ) -> list[str]:
        response = await self.llm.generate(
            prompt=f"""Given this question and initial findings, generate 2-3 specific follow-up queries.

ORIGINAL QUESTION: {original_query}

INITIAL FINDINGS:
{primer.answer}

Generate follow-up queries that:
1. Drill into specific entities or relationships mentioned
2. Clarify ambiguous points
3. Explore related architectural concerns

Return as JSON array of strings.""",
            max_tokens=300,
        )
        
        return json.loads(response)
```

## Neo4j Integration

```python
from neo4j import GraphDatabase
from neo4j_graphrag.llm import LLMInterface
from neo4j_graphrag.generation import GraphRAG

class Neo4jGraphStore:
    def __init__(self, uri: str, user: str, password: str):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
    
    def store_extracted_graph(self, graph: ExtractedGraph):
        with self.driver.session() as session:
            # Create entities
            for entity in graph.entities:
                session.run("""
                    MERGE (e:Entity {id: $id})
                    SET e.name = $name,
                        e.type = $type,
                        e.description = $description,
                        e.updated_at = datetime()
                """, **entity.model_dump())
            
            # Create relationships
            for rel in graph.relationships:
                session.run("""
                    MATCH (source:Entity {id: $source})
                    MATCH (target:Entity {id: $target})
                    MERGE (source)-[r:RELATES_TO {type: $type}]->(target)
                    SET r.description = $description,
                        r.weight = $weight,
                        r.updated_at = datetime()
                """, **rel.model_dump())
    
    def store_communities(self, communities: HierarchicalCommunities):
        with self.driver.session() as session:
            for level, level_communities in communities.levels.items():
                for community in level_communities:
                    session.run("""
                        MERGE (c:Community {id: $id})
                        SET c.level = $level
                        WITH c
                        UNWIND $member_ids AS member_id
                        MATCH (e:Entity {id: member_id})
                        MERGE (e)-[:BELONGS_TO]->(c)
                    """, id=community.id, level=level, member_ids=community.member_ids)
    
    def get_entity_context(self, entity_id: str, max_hops: int = 2) -> dict:
        with self.driver.session() as session:
            result = session.run("""
                MATCH (e:Entity {id: $entity_id})
                CALL apoc.path.subgraphAll(e, {maxLevel: $max_hops})
                YIELD nodes, relationships
                RETURN 
                    [n IN nodes | {id: n.id, name: n.name, type: n.type}] AS entities,
                    [r IN relationships | {
                        source: startNode(r).id,
                        target: endNode(r).id,
                        type: r.type
                    }] AS relationships
            """, entity_id=entity_id, max_hops=max_hops)
            
            record = result.single()
            return {
                "entities": record["entities"],
                "relationships": record["relationships"],
            }
```

## API Endpoints

```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel

app = FastAPI(title="Substrate GraphRAG Service")

class IndexRequest(BaseModel):
    corpus_id: str
    documents: list[Document]
    force_reindex: bool = False

class QueryRequest(BaseModel):
    query: str
    search_type: Literal["local", "global", "drift"] = "drift"
    max_hops: int = 2
    community_level: int = 1

@app.post("/index")
async def index_corpus(request: IndexRequest, background_tasks: BackgroundTasks):
    """Start indexing pipeline for a corpus."""
    task_id = str(uuid4())
    background_tasks.add_task(
        run_indexing_pipeline,
        task_id=task_id,
        corpus_id=request.corpus_id,
        documents=request.documents,
        force_reindex=request.force_reindex,
    )
    return {"task_id": task_id, "status": "started"}

@app.get("/index/{task_id}/status")
async def get_index_status(task_id: str):
    """Check indexing pipeline status."""
    status = await get_task_status(task_id)
    return status

@app.post("/query")
async def query_knowledge_graph(request: QueryRequest):
    """Execute a GraphRAG query."""
    engine = get_search_engine(request.search_type)
    result = await engine.search(
        query=request.query,
        max_hops=request.max_hops,
        community_level=request.community_level,
    )
    return result

@app.get("/entities/{entity_id}/context")
async def get_entity_context(entity_id: str, max_hops: int = 2):
    """Get entity with surrounding context from graph."""
    context = neo4j_store.get_entity_context(entity_id, max_hops)
    return context

@app.get("/communities")
async def list_communities(level: int = 0, limit: int = 20):
    """List communities at a specific level."""
    communities = await get_communities_at_level(level, limit)
    return communities
```

## Configuration

```yaml
# config/graphrag.yaml

service:
  name: substrate-graphrag
  port: 8082
  workers: 4

llm:
  provider: vllm  # or openai, anthropic
  model: meta-llama/Llama-3.1-8B-Instruct
  base_url: http://localhost:8000/v1
  api_key: ${VLLM_API_KEY}
  max_tokens: 4096
  temperature: 0.0

embedding:
  model: BAAI/bge-large-en-v1.5
  device: cuda  # or cpu
  batch_size: 32

neo4j:
  uri: bolt://localhost:7687
  user: neo4j
  password: ${NEO4J_PASSWORD}
  database: substrate

qdrant:
  url: http://localhost:6333
  api_key: ${QDRANT_API_KEY}

indexing:
  chunk_size: 1200
  chunk_overlap: 100
  community_levels: 3
  leiden_resolution: 1.0

celery:
  broker_url: redis://localhost:6379/0
  result_backend: redis://localhost:6379/1

cache:
  enabled: true
  ttl_seconds: 3600
  max_size_mb: 512
```

## Incremental Indexing

```python
class IncrementalIndexer:
    """Only re-index changed documents to minimize LLM costs."""
    
    def __init__(self, postgres_pool, full_indexer: FullIndexer):
        self.db = postgres_pool
        self.indexer = full_indexer
    
    async def index_changes(self, corpus_id: str, documents: list[Document]):
        # 1. Compute document hashes
        current_hashes = {doc.id: hash_document(doc) for doc in documents}
        
        # 2. Get previous hashes from database
        previous_hashes = await self.db.fetch_all("""
            SELECT document_id, content_hash
            FROM indexed_documents
            WHERE corpus_id = $1
        """, corpus_id)
        previous_map = {r["document_id"]: r["content_hash"] for r in previous_hashes}
        
        # 3. Identify changed documents
        changed = []
        for doc in documents:
            if doc.id not in previous_map or previous_map[doc.id] != current_hashes[doc.id]:
                changed.append(doc)
        
        if not changed:
            return {"status": "no_changes", "indexed_count": 0}
        
        # 4. Re-index only changed documents
        result = await self.indexer.index_documents(changed)
        
        # 5. Update hash records
        for doc in changed:
            await self.db.execute("""
                INSERT INTO indexed_documents (corpus_id, document_id, content_hash, indexed_at)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (corpus_id, document_id)
                DO UPDATE SET content_hash = $3, indexed_at = NOW()
            """, corpus_id, doc.id, current_hashes[doc.id])
        
        # 6. Recompute affected communities (incremental Leiden)
        await self._recompute_communities(corpus_id, [doc.id for doc in changed])
        
        return {
            "status": "indexed",
            "indexed_count": len(changed),
            "total_documents": len(documents),
        }
```

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `graphrag_index_duration_seconds` | Histogram | Full indexing pipeline duration |
| `graphrag_query_duration_seconds` | Histogram | Query latency by search type |
| `graphrag_llm_tokens_total` | Counter | LLM tokens consumed |
| `graphrag_entities_extracted_total` | Counter | Entities extracted |
| `graphrag_communities_detected` | Gauge | Communities per level |
| `graphrag_cache_hit_rate` | Gauge | Query cache hit rate |