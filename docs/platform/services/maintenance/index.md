# Proactive Maintenance Service

## Overview

The Proactive Maintenance Service continuously monitors the knowledge base for staleness, outdated references, and documentation drift. It employs embedding-based duplicate detection, automated freshness scoring, and human-in-the-loop workflows to keep institutional knowledge accurate and current.

## Responsibilities

1. **Staleness Detection**: Calculate freshness scores using time decay and code correlation
2. **Duplicate Detection**: Identify semantically similar documents for consolidation
3. **Link Validation**: Check for broken references and dead links
4. **Smart Notifications**: Alert stakeholders without causing fatigue
5. **Human Review Queue**: Route uncertain items for human verification

## Technology Stack

| Component | Library | Version | Purpose |
|-----------|---------|---------|---------|
| Framework | FastAPI | 0.115+ | REST API |
| Scheduler | APScheduler | 3.10+ | Job scheduling |
| Clustering | HDBSCAN | 0.8+ | Document clustering |
| Embeddings | sentence-transformers | 3.3+ | Semantic similarity |
| HTTP | httpx | 0.27+ | Async HTTP client |
| Tasks | Celery | 5.4+ | Background workers |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROACTIVE MAINTENANCE SERVICE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Scheduled Jobs (APScheduler)                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │Freshness │  │Duplicate │  │  Link    │  │  Code    │        │   │
│  │  │  Scan    │  │Detection │  │Validator │  │Correlator│        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                     │
│                                   ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Analysis Engines                              │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │               Staleness Calculator                         │  │   │
│  │  │  Time Decay (25%) + Code Drift (30%) + Link Rot (15%)     │  │   │
│  │  │  + Reference Validity (20%) + View Frequency (10%)         │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │               Similarity Detector                          │  │   │
│  │  │  Embedding + HDBSCAN Clustering + Pairwise Comparison     │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                     │
│         ┌─────────────────────────┼─────────────────────────────┐      │
│         ▼                         ▼                             ▼      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│  │ Notification    │    │  Review Queue   │    │  Auto Actions   │    │
│  │ Engine          │    │  (Human-in-     │    │  (High          │    │
│  │ (Smart Alerts)  │    │   the-Loop)     │    │   Confidence)   │    │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### Staleness Calculator

The staleness score combines multiple signals to determine document health:

```python
from dataclasses import dataclass
from datetime import datetime, timedelta
import math

@dataclass
class StalenessWeights:
    time_decay: float = 0.25
    code_drift: float = 0.30
    link_rot: float = 0.15
    reference_validity: float = 0.20
    view_frequency: float = 0.10

class StalenessCalculator:
    def __init__(self, db_pool, neo4j_driver, weights: StalenessWeights = None):
        self.db = db_pool
        self.neo4j = neo4j_driver
        self.weights = weights or StalenessWeights()
    
    async def calculate_staleness(self, document_id: str) -> StalenessReport:
        doc = await self.db.fetchrow(
            "SELECT * FROM documents WHERE id = $1", document_id
        )
        
        # Component 1: Time decay with document-type-specific half-lives
        time_score = self._calculate_time_decay(
            last_updated=doc["updated_at"],
            doc_type=doc["type"]
        )
        
        # Component 2: Code drift - has related code changed?
        code_score = await self._calculate_code_drift(document_id)
        
        # Component 3: Link rot - are referenced URLs still valid?
        link_score = await self._calculate_link_rot(document_id)
        
        # Component 4: Reference validity - do code references still exist?
        ref_score = await self._calculate_reference_validity(document_id)
        
        # Component 5: View frequency - inverse of recent views
        view_score = await self._calculate_view_decay(document_id)
        
        # Weighted composite score
        composite = (
            self.weights.time_decay * time_score +
            self.weights.code_drift * code_score +
            self.weights.link_rot * link_score +
            self.weights.reference_validity * ref_score +
            self.weights.view_frequency * view_score
        )
        
        return StalenessReport(
            document_id=document_id,
            composite_score=composite,
            components={
                "time_decay": time_score,
                "code_drift": code_score,
                "link_rot": link_score,
                "reference_validity": ref_score,
                "view_frequency": view_score,
            },
            recommended_action=self._recommend_action(composite),
            calculated_at=datetime.utcnow(),
        )
    
    def _calculate_time_decay(
        self,
        last_updated: datetime,
        doc_type: str
    ) -> float:
        """
        Exponential decay: Freshness(t) = e^(-λ × Δt)
        
        λ values by document type:
        - Architecture docs: 0.01 (70-day half-life)
        - API docs: 0.05 (14-day half-life)
        - Deployment guides: 0.1 (7-day half-life)
        - Meeting notes: 0.2 (3.5-day half-life)
        """
        decay_rates = {
            "architecture": 0.01,
            "adr": 0.01,
            "api": 0.05,
            "deployment": 0.1,
            "runbook": 0.1,
            "meeting": 0.2,
            "default": 0.03,
        }
        
        lambda_rate = decay_rates.get(doc_type, decay_rates["default"])
        days_since_update = (datetime.utcnow() - last_updated).days
        
        freshness = math.exp(-lambda_rate * days_since_update)
        return 1 - freshness  # Convert to staleness
    
    async def _calculate_code_drift(self, document_id: str) -> float:
        """Check if code referenced by document has changed since last update."""
        with self.neo4j.session() as session:
            result = session.run("""
                MATCH (d:Document {id: $doc_id})-[:REFERENCES]->(c:Component)
                WHERE c.updated_at > d.updated_at
                RETURN count(c) AS changed_count,
                       count(*) AS total_count
            """, doc_id=document_id)
            
            record = result.single()
            if record["total_count"] == 0:
                return 0.0
            
            return record["changed_count"] / record["total_count"]
    
    async def _calculate_link_rot(self, document_id: str) -> float:
        """Check external URLs for 404s and redirects."""
        links = await self.db.fetch(
            "SELECT url, last_checked, status FROM document_links WHERE document_id = $1",
            document_id
        )
        
        if not links:
            return 0.0
        
        broken = sum(1 for link in links if link["status"] in (404, 410, 500))
        return broken / len(links)
    
    async def _calculate_reference_validity(self, document_id: str) -> float:
        """Check if code symbols mentioned in document still exist."""
        refs = await self.db.fetch(
            "SELECT symbol, resolved FROM document_code_refs WHERE document_id = $1",
            document_id
        )
        
        if not refs:
            return 0.0
        
        invalid = sum(1 for ref in refs if not ref["resolved"])
        return invalid / len(refs)
    
    async def _calculate_view_decay(self, document_id: str) -> float:
        """Documents with fewer recent views are more likely stale."""
        views = await self.db.fetchval("""
            SELECT COUNT(*) FROM document_views
            WHERE document_id = $1 AND viewed_at > NOW() - INTERVAL '30 days'
        """, document_id)
        
        # Normalize: 0 views = 1.0 staleness, 10+ views = 0.0
        return max(0, 1 - (views / 10))
    
    def _recommend_action(self, score: float) -> str:
        if score >= 0.8:
            return "archive_or_update"
        elif score >= 0.6:
            return "review_urgently"
        elif score >= 0.4:
            return "schedule_review"
        elif score >= 0.2:
            return "monitor"
        return "healthy"
```

### Duplicate Detector

```python
from sentence_transformers import SentenceTransformer
import hdbscan
import numpy as np
from scipy.spatial.distance import cosine

class DuplicateDetector:
    def __init__(self, qdrant_client, model_name: str = "all-MiniLM-L6-v2"):
        self.qdrant = qdrant_client
        self.model = SentenceTransformer(model_name)
        
        # Similarity thresholds
        self.auto_merge_threshold = 0.95  # Nearly identical
        self.suggest_merge_threshold = 0.85  # Very similar
        self.suggest_link_threshold = 0.70  # Related content
    
    async def find_duplicates(self, corpus_id: str) -> DuplicateReport:
        """Find duplicate and near-duplicate documents in a corpus."""
        
        # Fetch all documents in corpus
        documents = await self.db.fetch("""
            SELECT id, title, content, type FROM documents
            WHERE corpus_id = $1 AND archived_at IS NULL
        """, corpus_id)
        
        if len(documents) < 2:
            return DuplicateReport(clusters=[], pairs=[])
        
        # Generate embeddings
        texts = [f"{d['title']}\n{d['content'][:2000]}" for d in documents]
        embeddings = self.model.encode(texts, normalize_embeddings=True)
        
        # Cluster similar documents
        clusterer = hdbscan.HDBSCAN(
            min_cluster_size=2,
            min_samples=1,
            metric='euclidean',
            cluster_selection_epsilon=0.3,
        )
        cluster_labels = clusterer.fit_predict(embeddings)
        
        # Analyze clusters for duplicates
        clusters = []
        for cluster_id in set(cluster_labels):
            if cluster_id == -1:  # Noise points
                continue
            
            member_indices = np.where(cluster_labels == cluster_id)[0]
            member_docs = [documents[i] for i in member_indices]
            
            # Calculate pairwise similarities within cluster
            cluster_embeddings = embeddings[member_indices]
            similarities = self._pairwise_similarities(cluster_embeddings)
            
            clusters.append(DuplicateCluster(
                cluster_id=cluster_id,
                documents=member_docs,
                avg_similarity=float(np.mean(similarities)),
                recommended_action=self._recommend_cluster_action(similarities),
            ))
        
        # Find high-similarity pairs not in clusters
        pairs = await self._find_similar_pairs(documents, embeddings, cluster_labels)
        
        return DuplicateReport(
            corpus_id=corpus_id,
            clusters=clusters,
            pairs=pairs,
            total_documents=len(documents),
            potential_duplicates=sum(len(c.documents) for c in clusters),
        )
    
    def _pairwise_similarities(self, embeddings: np.ndarray) -> np.ndarray:
        """Calculate all pairwise cosine similarities."""
        n = len(embeddings)
        similarities = []
        for i in range(n):
            for j in range(i + 1, n):
                sim = 1 - cosine(embeddings[i], embeddings[j])
                similarities.append(sim)
        return np.array(similarities)
    
    def _recommend_cluster_action(self, similarities: np.ndarray) -> str:
        avg_sim = np.mean(similarities)
        
        if avg_sim >= self.auto_merge_threshold:
            return "auto_merge"
        elif avg_sim >= self.suggest_merge_threshold:
            return "suggest_merge"
        elif avg_sim >= self.suggest_link_threshold:
            return "suggest_link"
        return "review"
    
    async def _find_similar_pairs(
        self,
        documents: list,
        embeddings: np.ndarray,
        cluster_labels: np.ndarray
    ) -> list:
        """Find similar document pairs not already in clusters."""
        pairs = []
        n = len(documents)
        
        for i in range(n):
            if cluster_labels[i] != -1:
                continue  # Skip clustered documents
            
            for j in range(i + 1, n):
                if cluster_labels[j] != -1:
                    continue
                
                similarity = 1 - cosine(embeddings[i], embeddings[j])
                
                if similarity >= self.suggest_link_threshold:
                    pairs.append(SimilarPair(
                        doc_a=documents[i],
                        doc_b=documents[j],
                        similarity=similarity,
                        recommended_action=self._recommend_pair_action(similarity),
                    ))
        
        return sorted(pairs, key=lambda p: p.similarity, reverse=True)
    
    def _recommend_pair_action(self, similarity: float) -> str:
        if similarity >= self.auto_merge_threshold:
            return "auto_merge"
        elif similarity >= self.suggest_merge_threshold:
            return "suggest_merge"
        return "suggest_link"
```

### Link Validator

```python
import httpx
from urllib.parse import urlparse
import asyncio

class LinkValidator:
    def __init__(self, db_pool, max_concurrent: int = 10):
        self.db = db_pool
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.timeout = httpx.Timeout(10.0, connect=5.0)
    
    async def validate_document_links(self, document_id: str) -> LinkValidationReport:
        """Validate all external links in a document."""
        links = await self.db.fetch("""
            SELECT id, url, anchor_text FROM document_links
            WHERE document_id = $1
        """, document_id)
        
        results = await asyncio.gather(*[
            self._validate_link(link) for link in links
        ])
        
        # Update database
        for result in results:
            await self.db.execute("""
                UPDATE document_links
                SET status = $2, last_checked = NOW(), redirect_url = $3
                WHERE id = $1
            """, result.link_id, result.status, result.redirect_url)
        
        broken = [r for r in results if r.status >= 400]
        redirected = [r for r in results if 300 <= r.status < 400]
        
        return LinkValidationReport(
            document_id=document_id,
            total_links=len(links),
            broken_links=broken,
            redirected_links=redirected,
            healthy_links=len(links) - len(broken) - len(redirected),
        )
    
    async def _validate_link(self, link: dict) -> LinkResult:
        async with self.semaphore:
            try:
                async with httpx.AsyncClient(
                    timeout=self.timeout,
                    follow_redirects=False
                ) as client:
                    response = await client.head(link["url"])
                    
                    redirect_url = None
                    if 300 <= response.status_code < 400:
                        redirect_url = response.headers.get("location")
                    
                    return LinkResult(
                        link_id=link["id"],
                        url=link["url"],
                        status=response.status_code,
                        redirect_url=redirect_url,
                    )
            except httpx.TimeoutException:
                return LinkResult(link_id=link["id"], url=link["url"], status=408)
            except Exception:
                return LinkResult(link_id=link["id"], url=link["url"], status=0)
```

### Smart Notification Engine

```python
from dataclasses import dataclass
from datetime import datetime, timedelta
from collections import defaultdict

@dataclass
class NotificationPolicy:
    dashboard_threshold: float = 0.5
    slack_owner_day: int = 3
    slack_team_day: int = 7
    email_manager_day: int = 14
    archive_suggestion_day: int = 30
    max_push_per_hour: int = 3
    digest_enabled: bool = True
    digest_frequency: str = "daily"  # daily, weekly

class SmartNotificationEngine:
    def __init__(self, db_pool, slack_client, email_client, policy: NotificationPolicy = None):
        self.db = db_pool
        self.slack = slack_client
        self.email = email_client
        self.policy = policy or NotificationPolicy()
        self._notification_counts = defaultdict(list)
    
    async def process_staleness_alert(self, report: StalenessReport):
        """Route staleness alert based on severity and time."""
        doc = await self.db.fetchrow(
            "SELECT * FROM documents WHERE id = $1", report.document_id
        )
        
        days_stale = (datetime.utcnow() - doc["updated_at"]).days
        
        # Tier 1: Dashboard flag
        if report.composite_score > self.policy.dashboard_threshold:
            await self._flag_on_dashboard(report)
        
        # Tier 2: Notify owner
        if days_stale >= self.policy.slack_owner_day:
            if await self._can_send_push(doc["owner_id"]):
                await self._notify_owner(doc, report)
        
        # Tier 3: Notify team
        if days_stale >= self.policy.slack_team_day:
            await self._notify_team(doc, report)
        
        # Tier 4: Escalate to manager
        if days_stale >= self.policy.email_manager_day:
            await self._escalate_to_manager(doc, report)
        
        # Tier 5: Suggest archival
        if days_stale >= self.policy.archive_suggestion_day:
            await self._suggest_archive(doc, report)
    
    async def _can_send_push(self, user_id: str) -> bool:
        """Rate limit push notifications to prevent fatigue."""
        now = datetime.utcnow()
        hour_ago = now - timedelta(hours=1)
        
        # Clean old entries
        self._notification_counts[user_id] = [
            t for t in self._notification_counts[user_id]
            if t > hour_ago
        ]
        
        if len(self._notification_counts[user_id]) >= self.policy.max_push_per_hour:
            return False
        
        self._notification_counts[user_id].append(now)
        return True
    
    async def _notify_owner(self, doc: dict, report: StalenessReport):
        owner = await self.db.fetchrow(
            "SELECT * FROM users WHERE id = $1", doc["owner_id"]
        )
        
        message = self._build_staleness_message(doc, report, "owner")
        
        if owner.get("slack_id"):
            await self.slack.send_dm(owner["slack_id"], message)
        
        await self._record_notification(doc["id"], owner["id"], "slack_dm")
    
    async def _notify_team(self, doc: dict, report: StalenessReport):
        team = await self.db.fetchrow(
            "SELECT * FROM teams WHERE id = $1", doc["team_id"]
        )
        
        if team.get("slack_channel"):
            message = self._build_staleness_message(doc, report, "team")
            await self.slack.send_channel(team["slack_channel"], message)
    
    async def send_daily_digest(self, user_id: str):
        """Send aggregated daily digest instead of individual notifications."""
        pending = await self.db.fetch("""
            SELECT d.*, sr.composite_score, sr.recommended_action
            FROM documents d
            JOIN staleness_reports sr ON d.id = sr.document_id
            WHERE d.owner_id = $1
            AND sr.composite_score > $2
            AND sr.calculated_at > NOW() - INTERVAL '24 hours'
            ORDER BY sr.composite_score DESC
        """, user_id, self.policy.dashboard_threshold)
        
        if not pending:
            return
        
        user = await self.db.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
        
        digest = self._build_digest(pending)
        
        if user.get("email"):
            await self.email.send(
                to=user["email"],
                subject=f"Substrate: {len(pending)} documents need attention",
                body=digest,
            )
    
    def _build_staleness_message(
        self,
        doc: dict,
        report: StalenessReport,
        audience: str
    ) -> str:
        emoji = "🔴" if report.composite_score > 0.7 else "🟡"
        
        message = f"""
{emoji} *Document needs attention*

*{doc['title']}*
Staleness score: {report.composite_score:.0%}

Key factors:
"""
        
        for component, score in sorted(
            report.components.items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]:
            message += f"• {component.replace('_', ' ').title()}: {score:.0%}\n"
        
        message += f"\n*Recommended action*: {report.recommended_action.replace('_', ' ').title()}"
        message += f"\n\n<{doc['url']}|View document>"
        
        return message
```

### Human Review Queue

```python
class ReviewQueue:
    def __init__(self, db_pool, notification_engine):
        self.db = db_pool
        self.notifications = notification_engine
    
    async def add_to_queue(
        self,
        item_type: str,
        item_id: str,
        reason: str,
        confidence: float,
        suggested_action: str,
        assignee_id: str = None,
    ):
        """Add item to human review queue."""
        
        # Auto-approve high confidence items
        if confidence > 0.9 and suggested_action in ("merge", "archive", "link"):
            await self._auto_execute(item_type, item_id, suggested_action)
            return
        
        # Queue for human review
        review_id = await self.db.fetchval("""
            INSERT INTO review_queue (
                item_type, item_id, reason, confidence,
                suggested_action, assignee_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING id
        """, item_type, item_id, reason, confidence, suggested_action, assignee_id)
        
        # Notify assignee
        if assignee_id:
            await self.notifications.notify_review_assignment(review_id, assignee_id)
        
        return review_id
    
    async def process_review(
        self,
        review_id: str,
        reviewer_id: str,
        decision: str,  # approve, reject, modify
        modifications: dict = None,
    ):
        """Process human review decision."""
        review = await self.db.fetchrow(
            "SELECT * FROM review_queue WHERE id = $1", review_id
        )
        
        if decision == "approve":
            await self._execute_action(
                review["item_type"],
                review["item_id"],
                review["suggested_action"],
            )
        elif decision == "modify" and modifications:
            await self._execute_action(
                review["item_type"],
                review["item_id"],
                modifications.get("action", review["suggested_action"]),
                modifications,
            )
        
        # Record decision for ML feedback
        await self.db.execute("""
            UPDATE review_queue
            SET reviewed_at = NOW(),
                reviewer_id = $2,
                decision = $3,
                modifications = $4
            WHERE id = $1
        """, review_id, reviewer_id, decision, modifications)
        
        # Feed back to improve confidence thresholds
        await self._record_feedback(review, decision)
    
    async def _record_feedback(self, review: dict, decision: str):
        """Track review outcomes to improve auto-approval thresholds."""
        await self.db.execute("""
            INSERT INTO review_feedback (
                item_type, suggested_action, confidence,
                human_decision, created_at
            ) VALUES ($1, $2, $3, $4, NOW())
        """, review["item_type"], review["suggested_action"],
            review["confidence"], decision)
    
    async def get_pending_reviews(
        self,
        assignee_id: str = None,
        item_type: str = None,
        limit: int = 20,
    ) -> list:
        """Get pending reviews, optionally filtered."""
        query = """
            SELECT rq.*, d.title as document_title
            FROM review_queue rq
            LEFT JOIN documents d ON rq.item_id = d.id
            WHERE rq.reviewed_at IS NULL
        """
        params = []
        
        if assignee_id:
            params.append(assignee_id)
            query += f" AND rq.assignee_id = ${len(params)}"
        
        if item_type:
            params.append(item_type)
            query += f" AND rq.item_type = ${len(params)}"
        
        query += f" ORDER BY rq.confidence ASC LIMIT {limit}"
        
        return await self.db.fetch(query, *params)
```

## Scheduled Jobs

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

def setup_scheduler(app):
    scheduler = AsyncIOScheduler()
    
    # Staleness scan - daily at 2 AM
    scheduler.add_job(
        run_staleness_scan,
        CronTrigger(hour=2, minute=0),
        id="staleness_scan",
        name="Daily staleness scan",
    )
    
    # Duplicate detection - weekly on Sunday
    scheduler.add_job(
        run_duplicate_detection,
        CronTrigger(day_of_week="sun", hour=3, minute=0),
        id="duplicate_detection",
        name="Weekly duplicate detection",
    )
    
    # Link validation - daily at 4 AM
    scheduler.add_job(
        run_link_validation,
        CronTrigger(hour=4, minute=0),
        id="link_validation",
        name="Daily link validation",
    )
    
    # Daily digest - 9 AM in user's timezone
    scheduler.add_job(
        send_daily_digests,
        CronTrigger(hour=9, minute=0),
        id="daily_digest",
        name="Send daily digests",
    )
    
    scheduler.start()
    return scheduler

async def run_staleness_scan():
    """Scan all active documents for staleness."""
    calculator = StalenessCalculator(db_pool, neo4j_driver)
    notification_engine = SmartNotificationEngine(db_pool, slack, email)
    
    documents = await db_pool.fetch("""
        SELECT id FROM documents
        WHERE archived_at IS NULL
        AND last_staleness_check < NOW() - INTERVAL '24 hours'
    """)
    
    for doc in documents:
        report = await calculator.calculate_staleness(doc["id"])
        
        # Store report
        await db_pool.execute("""
            INSERT INTO staleness_reports (document_id, composite_score, components, calculated_at)
            VALUES ($1, $2, $3, NOW())
        """, doc["id"], report.composite_score, report.components)
        
        # Process alerts
        await notification_engine.process_staleness_alert(report)
```

## API Endpoints

```python
@app.get("/documents/{doc_id}/staleness")
async def get_staleness(doc_id: str):
    """Get current staleness report for a document."""
    calculator = StalenessCalculator(db_pool, neo4j_driver)
    return await calculator.calculate_staleness(doc_id)

@app.get("/corpus/{corpus_id}/duplicates")
async def get_duplicates(corpus_id: str):
    """Find duplicate documents in a corpus."""
    detector = DuplicateDetector(qdrant_client)
    return await detector.find_duplicates(corpus_id)

@app.post("/documents/{doc_id}/validate-links")
async def validate_links(doc_id: str):
    """Validate all links in a document."""
    validator = LinkValidator(db_pool)
    return await validator.validate_document_links(doc_id)

@app.get("/reviews/pending")
async def get_pending_reviews(
    assignee_id: str = None,
    item_type: str = None,
    limit: int = 20,
):
    """Get pending human review items."""
    queue = ReviewQueue(db_pool, notification_engine)
    return await queue.get_pending_reviews(assignee_id, item_type, limit)

@app.post("/reviews/{review_id}/decide")
async def submit_review_decision(
    review_id: str,
    decision: ReviewDecision,
    current_user: User = Depends(get_current_user),
):
    """Submit human review decision."""
    queue = ReviewQueue(db_pool, notification_engine)
    await queue.process_review(
        review_id,
        current_user.id,
        decision.decision,
        decision.modifications,
    )
    return {"status": "processed"}
```

## Configuration

```yaml
# config/maintenance.yaml

service:
  name: substrate-maintenance
  port: 8085

database:
  url: postgres://substrate:password@localhost:5432/substrate

staleness:
  weights:
    time_decay: 0.25
    code_drift: 0.30
    link_rot: 0.15
    reference_validity: 0.20
    view_frequency: 0.10
  half_lives:
    architecture: 70  # days
    api: 14
    deployment: 7
    meeting: 3

duplicates:
  model: all-MiniLM-L6-v2
  auto_merge_threshold: 0.95
  suggest_merge_threshold: 0.85
  suggest_link_threshold: 0.70

notifications:
  dashboard_threshold: 0.5
  slack_owner_day: 3
  slack_team_day: 7
  email_manager_day: 14
  max_push_per_hour: 3
  digest_frequency: daily

scheduler:
  staleness_scan: "0 2 * * *"  # 2 AM daily
  duplicate_detection: "0 3 * * 0"  # 3 AM Sunday
  link_validation: "0 4 * * *"  # 4 AM daily
  daily_digest: "0 9 * * *"  # 9 AM daily
```

## Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `maintenance_staleness_score` | Histogram | Distribution of staleness scores |
| `maintenance_documents_flagged` | Counter | Documents flagged by threshold |
| `maintenance_duplicates_detected` | Counter | Duplicate clusters found |
| `maintenance_links_validated` | Counter | Links checked |
| `maintenance_links_broken` | Counter | Broken links found |
| `maintenance_reviews_pending` | Gauge | Items in review queue |
| `maintenance_reviews_processed` | Counter | Reviews completed |
| `maintenance_notifications_sent` | Counter | Notifications by channel |