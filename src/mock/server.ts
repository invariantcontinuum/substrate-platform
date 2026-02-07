import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '../api/mock/data');

const loadData = (filename: string) => {
    try {
        const path = join(DATA_DIR, filename);
        return JSON.parse(readFileSync(path, 'utf-8'));
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return [];
    }
};

const server = createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const pathname = url.pathname;

    console.log(`${req.method} ${pathname}`);

    if (pathname === '/api/v1/knowledge-graph/nodes') {
        const entities = loadData('entities.json');
        // Simple filter support
        const type = url.searchParams.get('type');
        const filtered = type ? entities.filter((e: any) => e.type === type) : entities;

        // Convert to GraphNode format if needed (mock data is already close)
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filtered));
        return;
    }

    if (pathname === '/api/v1/knowledge-graph/edges') {
        const relationships = loadData('relationships.json');
        const type = url.searchParams.get('type');
        const filtered = type ? relationships.filter((r: any) => r.type === type) : relationships;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(filtered));
        return;
    }

    if (pathname === '/api/v1/policies') {
        const policies = loadData('policies.json');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(policies));
        return;
    }

    // Verification Queue Mock
    if (pathname === '/api/v1/knowledge-graph/verification-queue') {
        const queue = [
            {
                id: "verify-1",
                title: "New Dependency Detected",
                desc: "Service 'Auth' is now calling 'User DB' directly. Is this intentional?",
                highlight: true,
                confidence: 0.85,
                entityId: "rel-1"
            },
            {
                id: "verify-2",
                title: "Policy Violation",
                desc: "Circular dependency detected between Service A and Service B.",
                highlight: false,
                confidence: 0.95,
                entityId: "pol-1"
            }
        ];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(queue));
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Mock API Server running at http://localhost:${PORT}`);
});
