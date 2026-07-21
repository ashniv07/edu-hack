import type {
  MemoryModel,
  PuzzleDefinition,
  PuzzleSlot,
  PuzzlePiece,
  PuzzleType,
} from '../types';
import { POINTER_STATE_LABELS, CONCEPT_DESCRIPTIONS } from '../constants';

/**
 * Generates a puzzle based on the memory model and concept
 */
export function generatePuzzle(
  memoryModel: MemoryModel,
  concept: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): PuzzleDefinition {
  switch (concept) {
    case 'dangling_pointer':
      return generatePointerMatchingPuzzle(memoryModel, concept, difficulty);
    case 'null_pointer_dereference':
      return generatePointerMatchingPuzzle(memoryModel, concept, difficulty);
    case 'uninitialized_pointer':
      return generatePointerMatchingPuzzle(memoryModel, concept, difficulty);
    default:
      // For other concepts, generate operation sequencing puzzle
      if (memoryModel.operations.length > 2) {
        return generateOperationSequencingPuzzle(memoryModel, concept, difficulty);
      }
      return generateMemoryLayoutPuzzle(memoryModel, concept, difficulty);
  }
}

/**
 * Generates a pointer-matching puzzle where students match pointers to their states
 */
function generatePointerMatchingPuzzle(
  memoryModel: MemoryModel,
  concept: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): PuzzleDefinition {
  const { pointers, operations } = memoryModel;

  // Create slots for each pointer
  const slots: PuzzleSlot[] = pointers.map((p, index) => ({
    id: `slot-${p.id}`,
    label: p.id,
    acceptedTypes: ['pointer-state'],
    correctAnswer: p.state,
    currentValue: null,
    position: { x: 50, y: 80 + index * 70 },
  }));

  // Create pieces for each possible state
  const stateValues = ['valid', 'null', 'dangling', 'uninitialized'];
  const pieces: PuzzlePiece[] = stateValues.map((state, index) => ({
    id: `piece-${state}`,
    type: 'pointer-state',
    label: POINTER_STATE_LABELS[state],
    value: state,
    description: getStateDescription(state),
    position: { x: 300, y: 60 + index * 60 },
    isDragging: false,
    isPlaced: false,
  }));

  // Generate hints based on concept and operations
  const hints = generateHints(concept, operations, pointers);

  return {
    id: `puzzle-pointer-${Date.now()}`,
    type: 'pointer-matching',
    title: 'Match Pointer States',
    description: 'Drag each pointer state to its correct pointer variable after all operations have executed.',
    difficulty,
    concept,
    slots,
    pieces,
    hints,
  };
}

/**
 * Generates an operation sequencing puzzle where students order operations
 */
function generateOperationSequencingPuzzle(
  memoryModel: MemoryModel,
  concept: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): PuzzleDefinition {
  const { operations } = memoryModel;

  // Create numbered slots for each position
  const slots: PuzzleSlot[] = operations.map((op, index) => ({
    id: `slot-${index}`,
    label: `Step ${index + 1}`,
    acceptedTypes: ['operation'],
    correctAnswer: `op-${index}`,
    currentValue: null,
    position: { x: 50, y: 60 + index * 60 },
  }));

  // Shuffle operations and create pieces
  const shuffledIndices = shuffleArray([...Array(operations.length).keys()]);
  const pieces: PuzzlePiece[] = shuffledIndices.map((originalIndex, shuffledIndex) => {
    const op = operations[originalIndex];
    return {
      id: `op-${originalIndex}`,
      type: 'operation',
      label: `${op.kind}(${op.target})`,
      value: `op-${originalIndex}`,
      description: `Line ${op.line}`,
      position: { x: 300, y: 60 + shuffledIndex * 60 },
      isDragging: false,
      isPlaced: false,
    };
  });

  return {
    id: `puzzle-sequence-${Date.now()}`,
    type: 'operation-sequencing',
    title: 'Order the Operations',
    description: 'Arrange the memory operations in the correct execution order.',
    difficulty,
    concept,
    slots,
    pieces,
    hints: [
      'Operations execute in line number order',
      'Look at the line numbers shown on each operation',
      'Declaration happens before assignment',
    ],
  };
}

/**
 * Generates a memory layout puzzle where students place variables in correct regions
 */
function generateMemoryLayoutPuzzle(
  memoryModel: MemoryModel,
  concept: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): PuzzleDefinition {
  const { variables } = memoryModel;

  // Create slots for stack and heap regions
  const slots: PuzzleSlot[] = [
    {
      id: 'slot-stack',
      label: 'Stack Region',
      acceptedTypes: ['variable'],
      correctAnswer: 'stack',
      currentValue: null,
      position: { x: 50, y: 100 },
    },
    {
      id: 'slot-heap',
      label: 'Heap Region',
      acceptedTypes: ['variable'],
      correctAnswer: 'heap',
      currentValue: null,
      position: { x: 250, y: 100 },
    },
  ];

  // Create pieces for each variable
  const pieces: PuzzlePiece[] = variables.map((v, index) => ({
    id: `var-${v.id}`,
    type: 'variable',
    label: `${v.name}: ${v.type}`,
    value: v.region,
    description: `Declared at line ${v.declaredLine}`,
    position: { x: 150, y: 250 + index * 50 },
    isDragging: false,
    isPlaced: false,
  }));

  return {
    id: `puzzle-layout-${Date.now()}`,
    type: 'memory-layout',
    title: 'Organize Memory Regions',
    description: 'Drag each variable to its correct memory region.',
    difficulty,
    concept,
    slots,
    pieces,
    hints: [
      'Local variables and function parameters go on the stack',
      'malloc() and new allocate memory on the heap',
      'Pointers themselves live on the stack, but may point to heap memory',
    ],
  };
}

// ===== HELPER FUNCTIONS =====

function getStateDescription(state: string): string {
  const descriptions: Record<string, string> = {
    valid: 'Points to valid, allocated memory',
    null: 'Explicitly set to NULL/null/None',
    dangling: 'Points to memory that has been freed',
    uninitialized: 'Declared but not yet assigned a value',
  };
  return descriptions[state] || '';
}

function generateHints(
  concept: string,
  operations: MemoryModel['operations'],
  pointers: MemoryModel['pointers']
): string[] {
  const hints: string[] = [];

  // Add concept-specific hint
  if (CONCEPT_DESCRIPTIONS[concept]) {
    hints.push(CONCEPT_DESCRIPTIONS[concept]);
  }

  // Add operation-based hints
  const hasFree = operations.some((op) => op.kind === 'free');
  if (hasFree) {
    hints.push('After free() is called, the pointer becomes dangling');
  }

  const hasDereference = operations.some((op) => op.kind === 'dereference');
  if (hasDereference) {
    const derefOp = operations.find((op) => op.kind === 'dereference');
    hints.push(`Look at line ${derefOp?.line} where the dereference occurs`);
  }

  // Add pointer state hints
  const danglingPointer = pointers.find((p) => p.state === 'dangling');
  if (danglingPointer) {
    hints.push(`Pointer "${danglingPointer.id}" points to freed memory`);
  }

  const nullPointer = pointers.find((p) => p.state === 'null');
  if (nullPointer) {
    hints.push(`Pointer "${nullPointer.id}" is explicitly set to null`);
  }

  return hints;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates a puzzle ID
 */
export function generatePuzzleId(type: PuzzleType): string {
  return `puzzle-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Calculates difficulty multiplier for scoring
 */
export function getDifficultyMultiplier(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): number {
  const multipliers = {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2,
  };
  return multipliers[difficulty];
}
