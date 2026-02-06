/**
 * Graph State Store
 * Following Single Responsibility Principle - manages graph interaction state only
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { env, isDevelopment } from '@/config/env';
import { GraphNode, Position } from '@/types';

// ============================================================================
// State Types
// ============================================================================

interface TransformState {
  scale: number;
  offset: Position;
}

interface GraphState {
  // View State
  transform: TransformState;
  setTransform: (transform: TransformState) => void;
  resetTransform: () => void;

  // Zoom
  zoomIn: () => void;
  zoomOut: () => void;
  setScale: (scale: number) => void;

  // Pan
  setOffset: (offset: Position) => void;
  panBy: (delta: Position) => void;

  // Node Positions (for draggable nodes)
  nodePositions: Record<string, Position>;
  setNodePosition: (nodeId: string, position: Position) => void;
  setNodePositions: (positions: Record<string, Position>) => void;
  resetNodePositions: () => void;

  // Selection
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  selectNode: (nodeId: string, multi?: boolean) => void;
  deselectNode: (nodeId: string) => void;
  selectEdge: (edgeId: string) => void;
  deselectEdge: (edgeId: string) => void;
  clearSelection: () => void;

  // Hover
  hoveredNode: string | null;
  hoveredEdge: string | null;
  setHoveredNode: (nodeId: string | null) => void;
  setHoveredEdge: (edgeId: string | null) => void;

  // Dragging
  draggingNode: string | null;
  isDraggingCanvas: boolean;
  setDraggingNode: (nodeId: string | null) => void;
  setDraggingCanvas: (isDragging: boolean) => void;

  // Filters
  visibleNodeTypes: Set<string>;
  visibleEdgeTypes: Set<string>;
  toggleNodeType: (type: string) => void;
  toggleEdgeType: (type: string) => void;
  showAllTypes: () => void;
  hideAllTypes: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.2;

// ============================================================================
// Store Creation
// ============================================================================

export const useGraphStore = create<GraphState>()(
  devtools(
    (set, get) => ({
      // Transform
      transform: { scale: 1, offset: { x: 0, y: 0 } },
      setTransform: (transform) => set({ transform }, false, 'setTransform'),
      resetTransform: () => set({ transform: { scale: 1, offset: { x: 0, y: 0 } } }, false, 'resetTransform'),

      // Zoom
      zoomIn: () =>
        set(
          (state) => ({
            transform: {
              ...state.transform,
              scale: Math.min(state.transform.scale + ZOOM_STEP, MAX_SCALE),
            },
          }),
          false,
          'zoomIn'
        ),
      zoomOut: () =>
        set(
          (state) => ({
            transform: {
              ...state.transform,
              scale: Math.max(state.transform.scale - ZOOM_STEP, MIN_SCALE),
            },
          }),
          false,
          'zoomOut'
        ),
      setScale: (scale) =>
        set(
          (state) => ({
            transform: {
              ...state.transform,
              scale: Math.max(MIN_SCALE, Math.min(scale, MAX_SCALE)),
            },
          }),
          false,
          'setScale'
        ),

      // Pan
      setOffset: (offset) =>
        set(
          (state) => ({ transform: { ...state.transform, offset } }),
          false,
          'setOffset'
        ),
      panBy: (delta) =>
        set(
          (state) => ({
            transform: {
              ...state.transform,
              offset: {
                x: state.transform.offset.x + delta.x,
                y: state.transform.offset.y + delta.y,
              },
            },
          }),
          false,
          'panBy'
        ),

      // Node Positions
      nodePositions: {},
      setNodePosition: (nodeId, position) =>
        set(
          (state) => ({
            nodePositions: { ...state.nodePositions, [nodeId]: position },
          }),
          false,
          'setNodePosition'
        ),
      setNodePositions: (positions) => set({ nodePositions: positions }, false, 'setNodePositions'),
      resetNodePositions: () => set({ nodePositions: {} }, false, 'resetNodePositions'),

      // Selection
      selectedNodes: new Set(),
      selectedEdges: new Set(),
      selectNode: (nodeId, multi = false) =>
        set(
          (state) => ({
            selectedNodes: multi
              ? new Set([...state.selectedNodes, nodeId])
              : new Set([nodeId]),
          }),
          false,
          'selectNode'
        ),
      deselectNode: (nodeId) =>
        set(
          (state) => {
            const newSet = new Set(state.selectedNodes);
            newSet.delete(nodeId);
            return { selectedNodes: newSet };
          },
          false,
          'deselectNode'
        ),
      selectEdge: (edgeId) =>
        set(
          (state) => ({
            selectedEdges: new Set([...state.selectedEdges, edgeId]),
          }),
          false,
          'selectEdge'
        ),
      deselectEdge: (edgeId) =>
        set(
          (state) => {
            const newSet = new Set(state.selectedEdges);
            newSet.delete(edgeId);
            return { selectedEdges: newSet };
          },
          false,
          'deselectEdge'
        ),
      clearSelection: () =>
        set(
          { selectedNodes: new Set(), selectedEdges: new Set() },
          false,
          'clearSelection'
        ),

      // Hover
      hoveredNode: null,
      hoveredEdge: null,
      setHoveredNode: (nodeId) => set({ hoveredNode: nodeId }, false, 'setHoveredNode'),
      setHoveredEdge: (edgeId) => set({ hoveredEdge: edgeId }, false, 'setHoveredEdge'),

      // Dragging
      draggingNode: null,
      isDraggingCanvas: false,
      setDraggingNode: (nodeId) => set({ draggingNode: nodeId }, false, 'setDraggingNode'),
      setDraggingCanvas: (isDragging) => set({ isDraggingCanvas: isDragging }, false, 'setDraggingCanvas'),

      // Filters
      visibleNodeTypes: new Set([
        'Service', 'API', 'Module', 'Database', 'Component', 
        'Endpoint', 'Queue', 'Cache', 'Interface'
      ]),
      visibleEdgeTypes: new Set([
        'depends_on', 'calls', 'imports', 'owns', 
        'reads_from', 'writes_to', 'implements', 'exposes'
      ]),
      toggleNodeType: (type) =>
        set(
          (state) => {
            const newSet = new Set(state.visibleNodeTypes);
            if (newSet.has(type)) {
              newSet.delete(type);
            } else {
              newSet.add(type);
            }
            return { visibleNodeTypes: newSet };
          },
          false,
          'toggleNodeType'
        ),
      toggleEdgeType: (type) =>
        set(
          (state) => {
            const newSet = new Set(state.visibleEdgeTypes);
            if (newSet.has(type)) {
              newSet.delete(type);
            } else {
              newSet.add(type);
            }
            return { visibleEdgeTypes: newSet };
          },
          false,
          'toggleEdgeType'
        ),
      showAllTypes: () =>
        set(
          {
            visibleNodeTypes: new Set([
              'Service', 'API', 'Module', 'Database', 'Component',
              'Team', 'Repository', 'Package', 'Function', 'Class',
              'Interface', 'Endpoint', 'Queue', 'Cache'
            ]),
            visibleEdgeTypes: new Set([
              'depends_on', 'calls', 'imports', 'owns', 'maintains',
              'reads_from', 'writes_to', 'deploys_to', 'implements', 'exposes'
            ]),
          },
          false,
          'showAllTypes'
        ),
      hideAllTypes: () =>
        set(
          { visibleNodeTypes: new Set(), visibleEdgeTypes: new Set() },
          false,
          'hideAllTypes'
        ),
    }),
    { name: 'GraphStore', enabled: isDevelopment && env.VITE_ENABLE_ZUSTAND_DEVTOOLS }
  )
);

// ============================================================================
// Computed Selectors
// ============================================================================

export const useGraphTransform = () => useGraphStore((state) => state.transform);
export const useSelectedNodes = () => useGraphStore((state) => state.selectedNodes);
export const useIsNodeSelected = (nodeId: string) =>
  useGraphStore((state) => state.selectedNodes.has(nodeId));
export const useNodePosition = (nodeId: string) =>
  useGraphStore((state) => state.nodePositions[nodeId]);
