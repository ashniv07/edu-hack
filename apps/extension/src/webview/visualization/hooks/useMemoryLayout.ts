import { useMemo } from 'react';
import type {
  MemoryModel,
  MemoryRegionLayout,
  MemoryBlockNode,
  PointerEdge,
  VisualMemoryPointer,
} from '../types';
import {
  transformToVisualLayout,
  transformToVisualPointers,
  transformToReactFlowNodes,
  transformToReactFlowEdges,
} from '../utils/transformers';

interface UseMemoryLayoutResult {
  layout: MemoryRegionLayout;
  pointers: VisualMemoryPointer[];
  nodes: MemoryBlockNode[];
  edges: PointerEdge[];
}

export function useMemoryLayout(
  memoryModel: MemoryModel,
  currentStep: number,
  errorLine?: number
): UseMemoryLayoutResult {
  // Compute visual layout based on current step
  const layout = useMemo(() => {
    return transformToVisualLayout(memoryModel, currentStep);
  }, [memoryModel, currentStep]);

  // Compute visual pointers
  const pointers = useMemo(() => {
    return transformToVisualPointers(memoryModel.pointers, layout);
  }, [memoryModel.pointers, layout]);

  // Compute React Flow nodes
  const nodes = useMemo(() => {
    return transformToReactFlowNodes(layout, errorLine);
  }, [layout, errorLine]);

  // Compute React Flow edges
  const edges = useMemo(() => {
    return transformToReactFlowEdges(pointers);
  }, [pointers]);

  return { layout, pointers, nodes, edges };
}
