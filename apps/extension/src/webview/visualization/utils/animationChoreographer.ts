import type {
  MemoryOperation,
  AnimationStep,
  AnimationConfig,
  AnimationType,
} from '../types';
import { ANIMATION, OPERATION_LABELS } from '../constants';

// Animation presets for each operation type
const ANIMATION_PRESETS: Record<MemoryOperation['kind'], AnimationConfig[]> = {
  declare: [
    {
      type: 'fade-in',
      duration: ANIMATION.duration.normal,
      delay: 0,
      easing: 'ease-out',
      targetIds: [],
    },
    {
      type: 'highlight',
      duration: ANIMATION.duration.slow,
      delay: ANIMATION.duration.normal,
      easing: 'ease-in-out',
      targetIds: [],
    },
  ],
  assign: [
    {
      type: 'highlight',
      duration: ANIMATION.duration.fast,
      delay: 0,
      easing: 'ease-in',
      targetIds: [],
    },
    {
      type: 'assign',
      duration: ANIMATION.duration.normal,
      delay: ANIMATION.duration.fast,
      easing: 'spring',
      targetIds: [],
    },
  ],
  free: [
    {
      type: 'highlight',
      duration: ANIMATION.duration.fast,
      delay: 0,
      easing: 'ease-in',
      targetIds: [],
    },
    {
      type: 'disconnect',
      duration: ANIMATION.duration.normal,
      delay: ANIMATION.duration.fast,
      easing: 'ease-out',
      targetIds: [],
    },
    {
      type: 'fade-out',
      duration: ANIMATION.duration.slow,
      delay: ANIMATION.duration.fast + ANIMATION.duration.normal,
      easing: 'ease-in',
      targetIds: [],
    },
  ],
  dereference: [
    {
      type: 'highlight',
      duration: ANIMATION.duration.fast,
      delay: 0,
      easing: 'ease-in',
      targetIds: [],
    },
    {
      type: 'dereference',
      duration: ANIMATION.duration.normal,
      delay: ANIMATION.duration.fast,
      easing: 'ease-in-out',
      targetIds: [],
    },
  ],
  move: [
    {
      type: 'disconnect',
      duration: ANIMATION.duration.fast,
      delay: 0,
      easing: 'ease-in',
      targetIds: [],
    },
    {
      type: 'move',
      duration: ANIMATION.duration.slow,
      delay: ANIMATION.duration.fast,
      easing: 'spring',
      targetIds: [],
    },
    {
      type: 'connect',
      duration: ANIMATION.duration.normal,
      delay: ANIMATION.duration.fast + ANIMATION.duration.slow,
      easing: 'ease-out',
      targetIds: [],
    },
  ],
  borrow: [
    {
      type: 'highlight',
      duration: ANIMATION.duration.fast,
      delay: 0,
      easing: 'ease-in',
      targetIds: [],
    },
    {
      type: 'connect',
      duration: ANIMATION.duration.normal,
      delay: ANIMATION.duration.fast,
      easing: 'ease-out',
      targetIds: [],
    },
  ],
};

/**
 * Creates an animation timeline from a list of memory operations
 */
export function createAnimationTimeline(operations: MemoryOperation[]): AnimationStep[] {
  return operations.map((operation, index) => {
    const preset = ANIMATION_PRESETS[operation.kind];
    const animations = preset.map((config) => ({
      ...config,
      targetIds: [operation.target],
    }));

    return {
      id: `step-${index}`,
      operation,
      animations,
      description: getOperationDescription(operation),
    };
  });
}

/**
 * Generates a human-readable description for an operation
 */
export function getOperationDescription(operation: MemoryOperation): string {
  const action = OPERATION_LABELS[operation.kind] || operation.kind;
  return `${action} "${operation.target}" at line ${operation.line}`;
}

/**
 * Calculates the total duration of an animation step
 */
export function getStepDuration(step: AnimationStep): number {
  return step.animations.reduce(
    (max, anim) => Math.max(max, anim.delay + anim.duration),
    0
  );
}

/**
 * Calculates the total duration of the entire timeline
 */
export function getTimelineDuration(timeline: AnimationStep[]): number {
  return timeline.reduce((total, step) => total + getStepDuration(step), 0);
}

/**
 * Gets the animation config for a specific target at a given step
 */
export function getAnimationForTarget(
  step: AnimationStep,
  targetId: string
): AnimationConfig | undefined {
  return step.animations.find((anim) => anim.targetIds.includes(targetId));
}

/**
 * Determines if a variable should be visible at a given step
 */
export function isVariableVisibleAtStep(
  variableId: string,
  operations: MemoryOperation[],
  stepIndex: number
): boolean {
  const relevantOps = operations.slice(0, stepIndex + 1);
  const declareOp = relevantOps.find(
    (op) => op.target === variableId && op.kind === 'declare'
  );
  return declareOp !== undefined;
}

/**
 * Gets the current state of a pointer at a given step
 */
export function getPointerStateAtStep(
  pointerId: string,
  operations: MemoryOperation[],
  stepIndex: number
): 'valid' | 'null' | 'dangling' | 'uninitialized' {
  const relevantOps = operations.slice(0, stepIndex + 1).filter((op) => op.target === pointerId);

  if (relevantOps.length === 0) return 'uninitialized';

  const lastOp = relevantOps[relevantOps.length - 1];

  if (lastOp.kind === 'free') return 'dangling';
  if (lastOp.kind === 'assign') return 'valid';
  if (lastOp.kind === 'declare') return 'null';

  return 'valid';
}

/**
 * Creates a delay sequence for staggered animations
 */
export function createStaggeredDelays(
  count: number,
  baseDelay: number = 0,
  staggerAmount: number = 50
): number[] {
  return Array.from({ length: count }, (_, i) => baseDelay + i * staggerAmount);
}

/**
 * Maps operation kind to an appropriate icon
 */
export function getOperationIcon(kind: MemoryOperation['kind']): string {
  const icons: Record<MemoryOperation['kind'], string> = {
    declare: '+',
    assign: '=',
    free: 'x',
    dereference: '*',
    move: '>',
    borrow: '&',
  };
  return icons[kind] || '?';
}
