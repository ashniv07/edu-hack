// ===== LAYOUT CONSTANTS =====

export const LAYOUT = {
  // Canvas dimensions
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 500,
  CANVAS_PADDING: 20,

  // Memory regions
  STACK_X: 50,
  HEAP_X: 450,
  REGION_WIDTH: 300,
  REGION_MIN_HEIGHT: 200,
  REGION_PADDING: 16,
  REGION_GAP: 100,

  // Variable blocks
  BLOCK_WIDTH: 140,
  BLOCK_HEIGHT: 60,
  BLOCK_SPACING: 16,
  BLOCK_PADDING: 12,
  BLOCK_BORDER_RADIUS: 8,

  // Base positions
  BASE_Y: 60,

  // React Flow
  NODE_WIDTH: 160,
  NODE_HEIGHT: 80,
  NODE_GAP: 100,
} as const;

// ===== COLOR PALETTE =====

export const COLORS = {
  // Memory regions
  stack: {
    background: '#eff6ff',
    border: '#3b82f6',
    text: '#1e40af',
    label: '#60a5fa',
  },
  heap: {
    background: '#f5f3ff',
    border: '#8b5cf6',
    text: '#5b21b6',
    label: '#a78bfa',
  },

  // Pointer states
  pointerStates: {
    valid: '#22c55e',
    null: '#9ca3af',
    dangling: '#ef4444',
    uninitialized: '#f59e0b',
  },

  // Status colors
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // UI elements
  ui: {
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    text: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    highlight: '#fef3c7',
    highlightBorder: '#fbbf24',
  },

  // Animation highlights
  animation: {
    enter: '#22c55e',
    exit: '#ef4444',
    active: '#3b82f6',
    pulse: '#fbbf24',
  },

  // Puzzle
  puzzle: {
    slot: '#f1f5f9',
    slotActive: '#e0f2fe',
    slotCorrect: '#dcfce7',
    slotIncorrect: '#fee2e2',
    piece: '#ffffff',
    pieceBorder: '#3b82f6',
  },
} as const;

// ===== ANIMATION PRESETS =====

export const ANIMATION = {
  // Durations (ms)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },

  // Easing functions (for framer-motion)
  easing: {
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: { type: 'spring', stiffness: 300, damping: 30 },
  },

  // Playback speeds
  speeds: [0.5, 1, 1.5, 2] as const,
  defaultSpeed: 1,

  // Auto-advance delay (ms)
  stepDelay: 1500,
} as const;

// ===== POINTER ARROW STYLES =====

export const ARROW = {
  strokeWidth: 2,
  strokeWidthHighlighted: 3,
  dashArray: {
    solid: 'none',
    dashed: '8,4',
    dotted: '2,4',
  },
  markerSize: 8,
  curvature: 0.3,
} as const;

// ===== PUZZLE SETTINGS =====

export const PUZZLE = {
  // Difficulty multipliers for scoring
  difficultyMultiplier: {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2,
  },

  // Hint penalties
  hintPenalty: 10, // points deducted per hint used

  // Timing
  defaultTimeLimit: 120, // seconds

  // Feedback delays
  feedbackDelay: 300,
  celebrationDelay: 500,
} as const;

// ===== POINTER STATE LABELS =====

export const POINTER_STATE_LABELS: Record<string, string> = {
  valid: 'Valid',
  null: 'NULL',
  dangling: 'Dangling',
  uninitialized: 'Uninitialized',
} as const;

// ===== OPERATION KIND LABELS =====

export const OPERATION_LABELS: Record<string, string> = {
  declare: 'Declare',
  assign: 'Assign',
  free: 'Free',
  dereference: 'Dereference',
  move: 'Move',
  borrow: 'Borrow',
} as const;

// ===== OPERATION ICONS (Unicode) =====

export const OPERATION_ICONS: Record<string, string> = {
  declare: '+',
  assign: '=',
  free: 'x',
  dereference: '*',
  move: '>',
  borrow: '&',
} as const;

// ===== CONCEPT DESCRIPTIONS =====

export const CONCEPT_DESCRIPTIONS: Record<string, string> = {
  null_pointer_dereference: 'Attempting to access memory through a null pointer',
  dangling_pointer: 'Accessing memory that has already been freed',
  uninitialized_pointer: 'Using a pointer before it has been assigned a value',
  index_out_of_bounds: 'Accessing an array element outside its valid range',
  none_attribute_access: 'Calling a method on a None/null value',
  concurrent_modification: 'Modifying a collection while iterating over it',
} as const;
