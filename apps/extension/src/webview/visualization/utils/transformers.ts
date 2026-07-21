import type {
  MemoryModel,
  MemoryVariable,
  MemoryPointer,
  MemoryOperation,
  VisualMemoryVariable,
  VisualMemoryPointer,
  MemoryRegionLayout,
  MemoryBlockNode,
  PointerEdge,
  Position,
  Bounds,
  AnimationState,
} from '../types';
import { LAYOUT, COLORS } from '../constants';

// ===== LAYOUT CALCULATION =====

function calculateStackPosition(index: number): Position {
  return {
    x: LAYOUT.STACK_X + LAYOUT.REGION_PADDING,
    y: LAYOUT.BASE_Y + index * (LAYOUT.BLOCK_HEIGHT + LAYOUT.BLOCK_SPACING),
  };
}

function calculateHeapPosition(index: number): Position {
  // Heap uses a 2-column layout for visual distinction
  const col = index % 2;
  const row = Math.floor(index / 2);
  return {
    x: LAYOUT.HEAP_X + LAYOUT.REGION_PADDING + col * (LAYOUT.BLOCK_WIDTH + LAYOUT.BLOCK_SPACING),
    y: LAYOUT.BASE_Y + row * (LAYOUT.BLOCK_HEIGHT + LAYOUT.BLOCK_SPACING),
  };
}

function calculateRegionBounds(region: 'stack' | 'heap', variableCount: number): Bounds {
  const baseX = region === 'stack' ? LAYOUT.STACK_X : LAYOUT.HEAP_X;
  const height = Math.max(
    LAYOUT.REGION_MIN_HEIGHT,
    LAYOUT.BASE_Y + Math.ceil(variableCount / (region === 'heap' ? 2 : 1)) * (LAYOUT.BLOCK_HEIGHT + LAYOUT.BLOCK_SPACING) + LAYOUT.REGION_PADDING
  );

  return {
    x: baseX,
    y: 0,
    width: LAYOUT.REGION_WIDTH,
    height,
  };
}

// ===== ANIMATION STATE CALCULATION =====

function getAnimationState(
  variable: MemoryVariable,
  operations: MemoryOperation[],
  currentStep: number
): AnimationState {
  // Find operations affecting this variable up to current step
  const relevantOps = operations
    .slice(0, currentStep + 1)
    .filter((op) => op.target === variable.id);

  if (relevantOps.length === 0) return 'idle';

  const lastOp = relevantOps[relevantOps.length - 1];
  const isCurrentOp = operations[currentStep]?.target === variable.id;

  if (isCurrentOp) {
    if (lastOp.kind === 'declare') return 'entering';
    if (lastOp.kind === 'free') return 'exiting';
    return 'active';
  }

  // Check if freed
  const hasBeenFreed = relevantOps.some((op) => op.kind === 'free');
  if (hasBeenFreed) return 'exiting';

  return 'idle';
}

// ===== VISIBILITY CHECK =====

function isVariableVisible(
  variable: MemoryVariable,
  operations: MemoryOperation[],
  currentStep: number
): boolean {
  // Variable is visible if it has been declared by current step
  const declareOp = operations
    .slice(0, currentStep + 1)
    .find((op) => op.target === variable.id && op.kind === 'declare');

  return declareOp !== undefined;
}

// ===== MAIN TRANSFORM FUNCTIONS =====

export function transformToVisualLayout(
  memoryModel: MemoryModel,
  currentStep: number
): MemoryRegionLayout {
  const { variables, operations } = memoryModel;

  // Filter and transform stack variables
  const stackVariables = variables
    .filter((v) => v.region === 'stack')
    .filter((v) => isVariableVisible(v, operations, currentStep))
    .map((v, index): VisualMemoryVariable => ({
      ...v,
      position: calculateStackPosition(index),
      width: LAYOUT.BLOCK_WIDTH,
      height: LAYOUT.BLOCK_HEIGHT,
      isHighlighted: false,
      animationState: getAnimationState(v, operations, currentStep),
    }));

  // Filter and transform heap variables
  const heapVariables = variables
    .filter((v) => v.region === 'heap')
    .filter((v) => isVariableVisible(v, operations, currentStep))
    .map((v, index): VisualMemoryVariable => ({
      ...v,
      position: calculateHeapPosition(index),
      width: LAYOUT.BLOCK_WIDTH,
      height: LAYOUT.BLOCK_HEIGHT,
      isHighlighted: false,
      animationState: getAnimationState(v, operations, currentStep),
    }));

  return {
    stack: {
      variables: stackVariables,
      bounds: calculateRegionBounds('stack', stackVariables.length),
    },
    heap: {
      variables: heapVariables,
      bounds: calculateRegionBounds('heap', heapVariables.length),
    },
  };
}

export function transformToVisualPointers(
  pointers: MemoryPointer[],
  layout: MemoryRegionLayout
): VisualMemoryPointer[] {
  const allVariables = [...layout.stack.variables, ...layout.heap.variables];

  return pointers.map((pointer): VisualMemoryPointer => {
    const sourceVar = allVariables.find((v) => v.id === pointer.id);
    const targetVar = pointer.pointsTo
      ? allVariables.find((v) => v.id === pointer.pointsTo)
      : null;

    // Calculate positions (center of the blocks)
    const sourcePosition: Position = sourceVar
      ? {
          x: sourceVar.position.x + sourceVar.width,
          y: sourceVar.position.y + sourceVar.height / 2,
        }
      : { x: 0, y: 0 };

    const targetPosition: Position | null = targetVar
      ? {
          x: targetVar.position.x,
          y: targetVar.position.y + targetVar.height / 2,
        }
      : null;

    return {
      ...pointer,
      sourcePosition,
      targetPosition,
      isHighlighted: false,
      animationState: pointer.state === 'dangling' ? 'error' : 'idle',
    };
  });
}

// ===== REACT FLOW TRANSFORMS =====

export function transformToReactFlowNodes(
  layout: MemoryRegionLayout,
  errorLine?: number
): MemoryBlockNode[] {
  const nodes: MemoryBlockNode[] = [];

  // Stack variables
  layout.stack.variables.forEach((variable) => {
    nodes.push({
      id: variable.id,
      type: 'stackVariable',
      position: variable.position,
      data: {
        variable,
        isError: errorLine !== undefined && variable.declaredLine === errorLine,
      },
    });
  });

  // Heap variables
  layout.heap.variables.forEach((variable) => {
    nodes.push({
      id: variable.id,
      type: 'heapVariable',
      position: variable.position,
      data: {
        variable,
        isError: errorLine !== undefined && variable.declaredLine === errorLine,
      },
    });
  });

  return nodes;
}

export function transformToReactFlowEdges(
  pointers: VisualMemoryPointer[]
): PointerEdge[] {
  return pointers
    .filter((p) => p.pointsTo !== null)
    .map((pointer): PointerEdge => ({
      id: `edge-${pointer.id}`,
      source: pointer.id,
      target: pointer.pointsTo!,
      type: 'pointer',
      data: {
        pointer,
        state: pointer.state,
        isAnimating: pointer.state === 'dangling',
      },
      animated: pointer.state === 'dangling',
    }));
}

// ===== UTILITY FUNCTIONS =====

export function getPointerColor(state: MemoryPointer['state']): string {
  return COLORS.pointerStates[state];
}

export function getOperationAtStep(
  operations: MemoryOperation[],
  step: number
): MemoryOperation | null {
  return operations[step] || null;
}

export function getVariablesAffectedByOperation(
  operation: MemoryOperation,
  variables: MemoryVariable[]
): MemoryVariable[] {
  return variables.filter((v) => v.id === operation.target);
}

// ===== CENTER CALCULATION FOR ARROWS =====

export function getVariableCenter(variable: VisualMemoryVariable): Position {
  return {
    x: variable.position.x + variable.width / 2,
    y: variable.position.y + variable.height / 2,
  };
}

export function getVariableEdge(
  variable: VisualMemoryVariable,
  side: 'left' | 'right' | 'top' | 'bottom'
): Position {
  switch (side) {
    case 'left':
      return { x: variable.position.x, y: variable.position.y + variable.height / 2 };
    case 'right':
      return { x: variable.position.x + variable.width, y: variable.position.y + variable.height / 2 };
    case 'top':
      return { x: variable.position.x + variable.width / 2, y: variable.position.y };
    case 'bottom':
      return { x: variable.position.x + variable.width / 2, y: variable.position.y + variable.height };
  }
}
