// Main component
export { MemoryVisualization } from './components/MemoryVisualization';

// Types
export type {
  MemoryModel,
  MemoryVariable,
  MemoryPointer,
  MemoryOperation,
  CodeAnalysisResult,
  MemoryVisualizationProps,
  ViewMode,
  PuzzleDefinition,
  PuzzleValidationResult,
  AnimationStep,
  AnimationTimeline,
} from './types';

// Contexts
export { VisualizationProvider, useVisualization } from './context/VisualizationContext';
export { PuzzleProvider, usePuzzle } from './context/PuzzleContext';

// Hooks
export { useMemoryLayout } from './hooks/useMemoryLayout';
export { useAnimationTimeline } from './hooks/useAnimationTimeline';
export { usePuzzleValidation } from './hooks/usePuzzleValidation';

// Utilities
export { generatePuzzle } from './utils/puzzleGenerator';
export {
  transformToVisualLayout,
  transformToReactFlowNodes,
  transformToReactFlowEdges,
} from './utils/transformers';
export { createAnimationTimeline } from './utils/animationChoreographer';

// Constants
export { COLORS, LAYOUT, ANIMATION, PUZZLE } from './constants';
