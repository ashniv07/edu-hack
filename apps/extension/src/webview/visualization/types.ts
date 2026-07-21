// ===== RE-EXPORT BACKEND TYPES =====
// These match the backend analysis types for consistency

export interface MemoryVariable {
  id: string;
  name: string;
  type: string;
  region: 'stack' | 'heap';
  declaredLine: number;
  initialized: boolean;
}

export interface MemoryPointer {
  id: string;
  pointsTo: string | null;
  state: 'null' | 'dangling' | 'valid' | 'uninitialized';
  dereferencedAtLine?: number;
}

export interface MemoryOperation {
  line: number;
  kind: 'declare' | 'assign' | 'free' | 'dereference' | 'move' | 'borrow';
  target: string;
}

export interface MemoryModel {
  variables: MemoryVariable[];
  pointers: MemoryPointer[];
  operations: MemoryOperation[];
}

export interface CodeAnalysisResult {
  concept: string;
  confidence: number;
  errorLine: number;
  memoryModel: MemoryModel;
}

// ===== POSITION & LAYOUT =====

export interface Position {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ===== VISUAL MEMORY TYPES =====

export type AnimationState = 'entering' | 'exiting' | 'active' | 'idle' | 'error';

export interface VisualMemoryVariable extends MemoryVariable {
  position: Position;
  width: number;
  height: number;
  isHighlighted: boolean;
  highlightColor?: string;
  animationState: AnimationState;
  value?: string | number | null;
}

export interface VisualMemoryPointer extends MemoryPointer {
  sourcePosition: Position;
  targetPosition: Position | null;
  isHighlighted: boolean;
  animationState: AnimationState;
}

export interface MemoryRegionLayout {
  stack: {
    variables: VisualMemoryVariable[];
    bounds: Bounds;
  };
  heap: {
    variables: VisualMemoryVariable[];
    bounds: Bounds;
  };
}

// ===== TIMELINE STATE =====

export interface TimelineState {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.5, 1, 1.5, 2
}

// ===== REACT FLOW TYPES =====

export type MemoryBlockNodeType = 'stackVariable' | 'heapVariable' | 'pointerVariable';

export interface MemoryBlockNodeData {
  variable: VisualMemoryVariable;
  isError: boolean;
  operationKind?: MemoryOperation['kind'];
}

export interface PointerEdgeData {
  pointer: VisualMemoryPointer;
  state: MemoryPointer['state'];
  isAnimating: boolean;
}

export interface MemoryBlockNode {
  id: string;
  type: MemoryBlockNodeType;
  position: Position;
  data: MemoryBlockNodeData;
  draggable?: boolean;
}

export interface PointerEdge {
  id: string;
  source: string;
  target: string;
  type: 'pointer';
  data: PointerEdgeData;
  animated?: boolean;
}

// ===== PUZZLE TYPES =====

export type PuzzleType =
  | 'pointer-matching'      // Match pointers to their states
  | 'memory-layout'         // Arrange variables in correct regions
  | 'operation-sequencing'  // Order operations correctly
  | 'error-identification'  // Find the bug
  | 'value-prediction';     // Predict variable values

export interface PuzzleSlot {
  id: string;
  label: string;
  acceptedTypes: string[];
  correctAnswer: string;
  currentValue: string | null;
  position: Position;
}

export interface PuzzlePiece {
  id: string;
  type: string;
  label: string;
  value: string;
  description?: string;
  position: Position;
  isDragging: boolean;
  isPlaced: boolean;
  placedInSlotId?: string;
}

export interface PuzzleDefinition {
  id: string;
  type: PuzzleType;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  concept: string;
  codeSnippet?: string;
  slots: PuzzleSlot[];
  pieces: PuzzlePiece[];
  hints: string[];
  timeLimit?: number;
}

export interface PuzzleAttempt {
  puzzleId: string;
  answers: Record<string, string>; // slotId -> pieceValue
  startTime: number;
  endTime?: number;
}

export interface PuzzleFeedback {
  slotId: string;
  isCorrect: boolean;
  message: string;
  hint?: string;
}

export interface PuzzleValidationResult {
  isCorrect: boolean;
  correctCount: number;
  totalCount: number;
  feedback: PuzzleFeedback[];
  score: number; // 0-100
}

export interface PuzzleState {
  definition: PuzzleDefinition | null;
  attempt: PuzzleAttempt | null;
  validation: PuzzleValidationResult | null;
  isSubmitted: boolean;
  showHints: boolean;
  currentHintIndex: number;
}

// ===== ANIMATION TYPES =====

export type AnimationType =
  | 'declare'
  | 'assign'
  | 'free'
  | 'dereference'
  | 'move'
  | 'borrow'
  | 'highlight'
  | 'fade-in'
  | 'fade-out'
  | 'connect'
  | 'disconnect'
  | 'pulse-error';

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';

export interface AnimationConfig {
  type: AnimationType;
  duration: number; // milliseconds
  delay: number;
  easing: EasingType;
  targetIds: string[];
}

export interface AnimationStep {
  id: string;
  operation: MemoryOperation;
  animations: AnimationConfig[];
  description: string;
}

export interface AnimationTimeline {
  steps: AnimationStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
}

// ===== VIEW MODE =====

export type ViewMode = 'visualization' | 'puzzle' | 'timeline';

// ===== MAIN VISUALIZATION STATE =====

export interface VisualizationState {
  viewMode: ViewMode;
  memoryModel: MemoryModel;
  memoryLayout: MemoryRegionLayout;
  pointers: VisualMemoryPointer[];
  timeline: TimelineState;
  currentOperation: MemoryOperation | null;
  errorLine?: number;
  concept?: string;
}

// ===== CONTEXT ACTION TYPES =====

export type VisualizationAction =
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_MEMORY_MODEL'; payload: MemoryModel }
  | { type: 'SET_TIMELINE_STEP'; payload: number }
  | { type: 'TOGGLE_PLAYBACK' }
  | { type: 'SET_PLAYBACK_SPEED'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET_TIMELINE' }
  | { type: 'HIGHLIGHT_VARIABLE'; payload: string }
  | { type: 'CLEAR_HIGHLIGHTS' }
  | { type: 'SET_ERROR_LINE'; payload: number };

export type PuzzleAction =
  | { type: 'SET_PUZZLE'; payload: PuzzleDefinition }
  | { type: 'PLACE_PIECE'; payload: { slotId: string; pieceId: string } }
  | { type: 'REMOVE_PIECE'; payload: { slotId: string } }
  | { type: 'SUBMIT_PUZZLE' }
  | { type: 'VALIDATE_PUZZLE'; payload: PuzzleValidationResult }
  | { type: 'RESET_PUZZLE' }
  | { type: 'SHOW_HINT' }
  | { type: 'HIDE_HINTS' };

// ===== COMPONENT PROPS =====

export interface MemoryVisualizationProps {
  memoryModel: MemoryModel;
  errorLine?: number;
  concept?: string;
  initialViewMode?: ViewMode;
}

export interface VariableBlockProps {
  variable: VisualMemoryVariable;
  isHighlighted?: boolean;
  isError?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export interface PointerArrowProps {
  pointer: VisualMemoryPointer;
  containerBounds: Bounds;
}

export interface TimelineScrubberProps {
  timeline: TimelineState;
  operations: MemoryOperation[];
  onStepChange: (step: number) => void;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
}
