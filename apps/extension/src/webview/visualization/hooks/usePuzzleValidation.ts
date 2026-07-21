import { useCallback } from 'react';
import type {
  PuzzleDefinition,
  PuzzleAttempt,
  PuzzleValidationResult,
  PuzzleFeedback,
} from '../types';
import { PUZZLE } from '../constants';
import { getDifficultyMultiplier } from '../utils/puzzleGenerator';

interface UsePuzzleValidationResult {
  validate: (puzzle: PuzzleDefinition, attempt: PuzzleAttempt) => PuzzleValidationResult;
  calculateScore: (result: PuzzleValidationResult, puzzle: PuzzleDefinition, hintsUsed: number) => number;
}

export function usePuzzleValidation(): UsePuzzleValidationResult {
  const validate = useCallback(
    (puzzle: PuzzleDefinition, attempt: PuzzleAttempt): PuzzleValidationResult => {
      const feedback: PuzzleFeedback[] = [];
      let correctCount = 0;

      for (const slot of puzzle.slots) {
        const userAnswer = attempt.answers[slot.id];
        const isCorrect = userAnswer === slot.correctAnswer;

        if (isCorrect) {
          correctCount++;
        }

        feedback.push({
          slotId: slot.id,
          isCorrect,
          message: isCorrect
            ? getCorrectMessage(puzzle.type)
            : getIncorrectMessage(puzzle.type, slot.correctAnswer),
          hint: isCorrect ? undefined : getHintForSlot(puzzle, slot.id),
        });
      }

      const totalCount = puzzle.slots.length;
      const baseScore = Math.round((correctCount / totalCount) * 100);

      return {
        isCorrect: correctCount === totalCount,
        correctCount,
        totalCount,
        feedback,
        score: baseScore,
      };
    },
    []
  );

  const calculateScore = useCallback(
    (
      result: PuzzleValidationResult,
      puzzle: PuzzleDefinition,
      hintsUsed: number
    ): number => {
      // Base score from correct answers
      let score = result.score;

      // Apply difficulty multiplier
      score *= getDifficultyMultiplier(puzzle.difficulty);

      // Deduct points for hints used
      score -= hintsUsed * PUZZLE.hintPenalty;

      // Ensure score is between 0 and 100
      return Math.max(0, Math.min(100, Math.round(score)));
    },
    []
  );

  return { validate, calculateScore };
}

// ===== HELPER FUNCTIONS =====

function getCorrectMessage(type: string): string {
  const messages: Record<string, string[]> = {
    'pointer-matching': [
      'Correct! You identified the pointer state.',
      'Well done! That pointer state is right.',
      'Excellent! You understand this pointer.',
    ],
    'operation-sequencing': [
      'Correct order!',
      'Right sequence!',
      'That operation is in the right place.',
    ],
    'memory-layout': [
      'Correct region!',
      'Right memory area!',
      'That variable belongs there.',
    ],
  };

  const typeMessages = messages[type] || ['Correct!'];
  return typeMessages[Math.floor(Math.random() * typeMessages.length)];
}

function getIncorrectMessage(type: string, correctAnswer: string): string {
  const messages: Record<string, string> = {
    'pointer-matching': `Not quite. The correct state is "${correctAnswer}".`,
    'operation-sequencing': 'This operation should be in a different position.',
    'memory-layout': `This variable belongs in the ${correctAnswer} region.`,
  };

  return messages[type] || `Incorrect. Expected: ${correctAnswer}`;
}

function getHintForSlot(puzzle: PuzzleDefinition, slotId: string): string | undefined {
  // Find the index of this slot's position in the puzzle
  const slotIndex = puzzle.slots.findIndex((s) => s.id === slotId);

  // Return a relevant hint if available
  if (slotIndex >= 0 && slotIndex < puzzle.hints.length) {
    return puzzle.hints[slotIndex];
  }

  // Fallback to the last hint
  return puzzle.hints[puzzle.hints.length - 1];
}

/**
 * Generates encouraging feedback based on score
 */
export function getScoreFeedback(score: number): { emoji: string; message: string } {
  if (score === 100) {
    return { emoji: '🎉', message: 'Perfect! You nailed it!' };
  }
  if (score >= 80) {
    return { emoji: '🌟', message: 'Great job! Almost perfect!' };
  }
  if (score >= 60) {
    return { emoji: '👍', message: 'Good effort! Keep learning!' };
  }
  if (score >= 40) {
    return { emoji: '💪', message: 'You\'re getting there!' };
  }
  return { emoji: '📚', message: 'Review the hints and try again!' };
}

/**
 * Formats time spent on puzzle
 */
export function formatTimeSpent(startTime: number, endTime: number): string {
  const seconds = Math.round((endTime - startTime) / 1000);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
