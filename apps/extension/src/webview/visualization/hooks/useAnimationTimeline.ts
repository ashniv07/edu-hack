import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { MemoryOperation, AnimationTimeline, AnimationStep } from '../types';
import {
  createAnimationTimeline,
  getStepDuration,
} from '../utils/animationChoreographer';
import { ANIMATION } from '../constants';

interface UseAnimationTimelineOptions {
  autoPlay?: boolean;
  loop?: boolean;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

interface UseAnimationTimelineResult {
  timeline: AnimationTimeline;
  currentStep: AnimationStep | null;
  isPlaying: boolean;
  isAtStart: boolean;
  isAtEnd: boolean;
  progress: number; // 0-100
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
}

export function useAnimationTimeline(
  operations: MemoryOperation[],
  options: UseAnimationTimelineOptions = {}
): UseAnimationTimelineResult {
  const { autoPlay = false, loop = false, onStepChange, onComplete } = options;

  // Create animation steps from operations
  const steps = useMemo(() => createAnimationTimeline(operations), [operations]);

  const [timeline, setTimeline] = useState<AnimationTimeline>(() => ({
    steps,
    currentStepIndex: 0,
    isPlaying: autoPlay,
    speed: ANIMATION.defaultSpeed,
  }));

  const timeoutRef = useRef<number | null>(null);
  const previousStepRef = useRef(0);

  // Update steps when operations change
  useEffect(() => {
    setTimeline((prev) => ({
      ...prev,
      steps,
      currentStepIndex: Math.min(prev.currentStepIndex, steps.length - 1),
    }));
  }, [steps]);

  // Notify on step change
  useEffect(() => {
    if (timeline.currentStepIndex !== previousStepRef.current) {
      previousStepRef.current = timeline.currentStepIndex;
      onStepChange?.(timeline.currentStepIndex);
    }
  }, [timeline.currentStepIndex, onStepChange]);

  // Auto-advance logic
  useEffect(() => {
    if (!timeline.isPlaying || steps.length === 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const currentStep = steps[timeline.currentStepIndex];
    if (!currentStep) return;

    const stepDuration = getStepDuration(currentStep);
    const adjustedDuration = (stepDuration + ANIMATION.stepDelay) / timeline.speed;

    timeoutRef.current = window.setTimeout(() => {
      setTimeline((prev) => {
        const nextIndex = prev.currentStepIndex + 1;

        // Check if we've reached the end
        if (nextIndex >= prev.steps.length) {
          if (loop) {
            return { ...prev, currentStepIndex: 0 };
          }
          onComplete?.();
          return { ...prev, isPlaying: false };
        }

        return { ...prev, currentStepIndex: nextIndex };
      });
    }, adjustedDuration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeline.isPlaying, timeline.currentStepIndex, timeline.speed, steps, loop, onComplete]);

  // Control functions
  const play = useCallback(() => {
    setTimeline((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  const pause = useCallback(() => {
    setTimeline((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlayback = useCallback(() => {
    setTimeline((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setTimeline((prev) => ({
      ...prev,
      currentStepIndex: Math.max(0, Math.min(step, prev.steps.length - 1)),
    }));
  }, []);

  const nextStep = useCallback(() => {
    setTimeline((prev) => {
      if (prev.currentStepIndex >= prev.steps.length - 1) return prev;
      return { ...prev, currentStepIndex: prev.currentStepIndex + 1 };
    });
  }, []);

  const prevStep = useCallback(() => {
    setTimeline((prev) => {
      if (prev.currentStepIndex <= 0) return prev;
      return { ...prev, currentStepIndex: prev.currentStepIndex - 1 };
    });
  }, []);

  const reset = useCallback(() => {
    setTimeline((prev) => ({
      ...prev,
      currentStepIndex: 0,
      isPlaying: false,
    }));
  }, []);

  const setSpeed = useCallback((speed: number) => {
    setTimeline((prev) => ({ ...prev, speed }));
  }, []);

  // Computed values
  const currentStep = steps[timeline.currentStepIndex] || null;
  const isAtStart = timeline.currentStepIndex === 0;
  const isAtEnd = timeline.currentStepIndex >= steps.length - 1;
  const progress = steps.length > 0
    ? (timeline.currentStepIndex / (steps.length - 1)) * 100
    : 0;

  return {
    timeline,
    currentStep,
    isPlaying: timeline.isPlaying,
    isAtStart,
    isAtEnd,
    progress,
    play,
    pause,
    togglePlayback,
    goToStep,
    nextStep,
    prevStep,
    reset,
    setSpeed,
  };
}
