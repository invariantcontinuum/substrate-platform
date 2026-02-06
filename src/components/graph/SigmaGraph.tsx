/**
 * Sigma.js Graph Component
 * WebGL-based graph visualization for large graphs
 * Note: Simplified implementation - using Cytoscape as primary renderer
 */

import React, { useEffect, useRef } from 'react';
import { Sigma } from 'sigma';
import Graph from 'graphology';
import { LensType, GraphNode, GraphEdge } from '@/types';
import { getLensColor } from '@/lib/utils';
import { graphConfig } from '@/config/env';

interface SigmaGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  activeLens: LensType;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

export const SigmaGraph: React.FC<SigmaGraphProps> = ({
  nodes,
  edges,
  activeLens,
  onNodeClick,
  onNodeHover,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);

  // Initialize Sigma
  useEffect(() => {
    if (!containerRef.current) return;

    // Create graphology graph
    const graph = new Graph();
    graphRef.current = graph;

    // Create Sigma instance
    const sigma = new Sigma(graph, containerRef.current, {
      renderLabels: true,
      labelSize: 12,
      labelWeight: 'bold',
      labelColor: { color: '#94a3b8' },
      defaultNodeType: 'circle',
      defaultEdgeType: 'line',
      allowInvalidContainer: true,
    });

    sigmaRef.current = sigma;

    // Event handlers
    sigma.on('clickNode', ({ node }) => {
      onNodeClick?.(node);
    });

    sigma.on('enterNode', ({ node }) => {
      onNodeHover?.(node);
    });

    sigma.on('leaveNode', () => {
      onNodeHover?.(null);
    });

    return () => {
      sigma.kill();
      sigmaRef.current = null;
      graphRef.current = null;
    };
  }, [onNodeClick, onNodeHover]);

  // Update graph data when props change
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    // Clear existing data
    graph.clear();

    // Add nodes
    nodes.forEach((node) => {
      const color = getLensColor(node.colors[activeLens] as LensType);
      
      graph.addNode(node.id, {
        label: node.label,
        x: node.position.x,
        y: node.position.y,
        size: graphConfig.nodeSize,
        color,
        type: node.type,
        ...node.metadata,
      });
    });

    // Add edges
    edges.forEach((edge, index) => {
      const edgeId = edge.id || `edge-${index}`;
      
      // Check visibility for current lens
      const isVisible = edge.always || edge.lens?.includes(activeLens);
      if (!isVisible) return;

      // Check if both nodes exist
      if (!graph.hasNode(edge.from) || !graph.hasNode(edge.to)) return;

      graph.addEdge(edge.from, edge.to, {
        id: edgeId,
        color: edge.color,
        size: edge.width || graphConfig.edgeWidth,
        type: edge.dashed ? 'dashed' : 'line',
        ...edge.metadata,
      });
    });

    // Refresh Sigma
    sigmaRef.current?.refresh();
  }, [nodes, edges, activeLens]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
};

export default SigmaGraph;
