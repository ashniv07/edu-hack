import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
} from '@xyflow/react';

import { StackVariableNode } from './nodes/StackVariableNode';
import { HeapVariableNode } from './nodes/HeapVariableNode';
import { PointerNode } from './nodes/PointerNode';
import { PointerEdge } from './edges/PointerEdge';
import type { MemoryBlockNode, PointerEdge as PointerEdgeType } from '../../types';
import { COLORS } from '../../constants';

// Register custom node types
const nodeTypes: NodeTypes = {
  stackVariable: StackVariableNode,
  heapVariable: HeapVariableNode,
  pointerVariable: PointerNode,
};

// Register custom edge types
const edgeTypes: EdgeTypes = {
  pointer: PointerEdge,
};

interface VisualizationCanvasProps {
  nodes: MemoryBlockNode[];
  edges: PointerEdgeType[];
  onNodeClick?: (nodeId: string) => void;
}

export function VisualizationCanvas({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
}: VisualizationCanvasProps) {
  // Convert to React Flow format with proper types
  const flowNodes = useMemo(
    () =>
      initialNodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: { ...node.data } as Record<string, unknown>,
        draggable: node.draggable ?? false,
      })),
    [initialNodes]
  );

  const flowEdges = useMemo(
    () =>
      initialEdges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        data: { ...edge.data } as Record<string, unknown>,
        animated: edge.animated,
      })),
    [initialEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Update nodes/edges when props change
  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: { id: string }) => {
      onNodeClick?.(node.id);
    },
    [onNodeClick]
  );

  const styles: Record<string, React.CSSProperties> = {
    container: {
      width: '100%',
      height: '400px',
      background: '#fafafa',
      borderRadius: '12px',
      border: `1px solid ${COLORS.ui.border}`,
      overflow: 'hidden',
    },
  };

  return (
    <div style={styles.container}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick as any}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'pointer',
          animated: false,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="#e2e8f0"
        />
        <Controls
          showZoom
          showFitView
          showInteractive={false}
          style={{
            background: '#ffffff',
            border: `1px solid ${COLORS.ui.border}`,
            borderRadius: '8px',
          }}
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'stackVariable') return COLORS.stack.border;
            if (node.type === 'heapVariable') return COLORS.heap.border;
            return COLORS.ui.textMuted;
          }}
          style={{
            background: '#ffffff',
            border: `1px solid ${COLORS.ui.border}`,
            borderRadius: '8px',
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
