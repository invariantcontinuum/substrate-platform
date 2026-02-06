/**
 * Cytoscape.js Graph Component
 * For architecture diagrams with rich layout algorithms
 */

import React, { useEffect, useRef, useCallback } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { LensType, GraphNode, GraphEdge } from '@/types';
import { getLensColor } from '@/lib/utils';
import { graphConfig } from '@/config/env';

// Register dagre layout
cytoscape.use(dagre);

interface CytoscapeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  activeLens: LensType;
  layout?: 'dagre' | 'cose' | 'circle' | 'grid' | 'breadthfirst';
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({
  nodes,
  edges,
  activeLens,
  layout = 'dagre',
  onNodeClick,
  onNodeHover,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            'shape': 'ellipse',
            'background-color': 'data(color)',
            'label': 'data(label)',
            'width': graphConfig.nodeSize * 3,
            'height': graphConfig.nodeSize * 3,
            'font-size': '11px',
            'font-weight': 'bold',
            'color': '#cbd5e1',
            'text-background-color': '#0f172a',
            'text-background-opacity': 0.7,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'border-width': 2,
            'border-color': 'data(color)',
            'border-opacity': 0.6,
            'background-opacity': 0.25,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 'data(width)',
            'line-color': 'data(color)',
            'target-arrow-color': 'data(color)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'line-opacity': 0.6,
          },
        },
        {
          selector: '.highlighted',
          style: {
            'border-width': 3,
            'border-color': '#ffffff',
            'border-opacity': 0.9,
            'background-opacity': 0.5,
          },
        },
      ],
      minZoom: 0.5,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;

    // Event handlers
    cy.on('tap', 'node', (evt) => {
      onNodeClick?.(evt.target.id());
    });

    cy.on('mouseover', 'node', (evt) => {
      onNodeHover?.(evt.target.id());
      evt.target.addClass('highlighted');
    });

    cy.on('mouseout', 'node', (evt) => {
      onNodeHover?.(null);
      evt.target.removeClass('highlighted');
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [onNodeClick, onNodeHover]);

  // Update elements when props change
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Build elements
    const elements: cytoscape.ElementDefinition[] = [
      // Nodes
      ...nodes.map((node) => {
        const color = getLensColor(node.colors[activeLens] as LensType);
        
        return {
          data: {
            id: node.id,
            label: node.label,
            color,
            type: node.type,
            ...node.metadata,
          },
          position: {
            x: node.position.x * 10, // Scale up for better visibility
            y: node.position.y * 10,
          },
        };
      }),
      
      // Edges
      ...edges
        .filter((edge) => {
          // Check visibility for current lens
          if (edge.always) return true;
          if (edge.lens?.includes(activeLens)) return true;
          return false;
        })
        .map((edge, index) => ({
          data: {
            id: edge.id || `edge-${index}`,
            source: edge.from,
            target: edge.to,
            color: edge.color,
            width: edge.width || graphConfig.edgeWidth,
            style: edge.dashed ? 'dashed' : 'solid',
            ...edge.metadata,
          },
        })),
    ];

    // Update graph
    cy.elements().remove();
    cy.add(elements);

    // Run layout
    const layoutConfig: cytoscape.LayoutOptions = {
      name: layout,
      padding: 20,
      animate: true,
      animationDuration: 500,
    };

    if (layout === 'dagre') {
      Object.assign(layoutConfig, {
        rankDir: 'TB',
        nodeSep: 50,
        edgeSep: 20,
        rankSep: 80,
      });
    }

    cy.layout(layoutConfig).run();

    // Fit to viewport
    cy.fit(undefined, 20);
  }, [nodes, edges, activeLens, layout]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
};

export default CytoscapeGraph;
