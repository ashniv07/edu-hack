import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react';
import type {
  PuzzleState,
  PuzzleAction,
  PuzzleDefinition,
  PuzzleValidationResult,
} from '../types';

// ===== INITIAL STATE =====

const initialPuzzleState: PuzzleState = {
  definition: null,
  attempt: null,
  validation: null,
  isSubmitted: false,
  showHints: false,
  currentHintIndex: -1,
};

// ===== REDUCER =====

function puzzleReducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
  switch (action.type) {
    case 'SET_PUZZLE':
      return {
        ...initialPuzzleState,
        definition: action.payload,
        attempt: {
          puzzleId: action.payload.id,
          answers: {},
          startTime: Date.now(),
        },
      };

    case 'PLACE_PIECE': {
      if (!state.definition || !state.attempt) return state;

      const { slotId, pieceId } = action.payload;
      const piece = state.definition.pieces.find((p) => p.id === pieceId);
      if (!piece) return state;

      // Update the slot's current value
      const updatedSlots = state.definition.slots.map((slot) =>
        slot.id === slotId ? { ...slot, currentValue: piece.value } : slot
      );

      // Update the piece's placement status
      const updatedPieces = state.definition.pieces.map((p) => {
        if (p.id === pieceId) {
          return { ...p, isPlaced: true, placedInSlotId: slotId };
        }
        // If this piece was in the slot before, remove it
        if (p.placedInSlotId === slotId) {
          return { ...p, isPlaced: false, placedInSlotId: undefined };
        }
        return p;
      });

      return {
        ...state,
        definition: {
          ...state.definition,
          slots: updatedSlots,
          pieces: updatedPieces,
        },
        attempt: {
          ...state.attempt,
          answers: {
            ...state.attempt.answers,
            [slotId]: piece.value,
          },
        },
        // Clear validation when user makes changes
        validation: null,
        isSubmitted: false,
      };
    }

    case 'REMOVE_PIECE': {
      if (!state.definition || !state.attempt) return state;

      const { slotId } = action.payload;

      // Clear the slot
      const updatedSlots = state.definition.slots.map((slot) =>
        slot.id === slotId ? { ...slot, currentValue: null } : slot
      );

      // Unplace the piece that was in this slot
      const updatedPieces = state.definition.pieces.map((p) =>
        p.placedInSlotId === slotId
          ? { ...p, isPlaced: false, placedInSlotId: undefined }
          : p
      );

      // Remove from answers
      const { [slotId]: _, ...remainingAnswers } = state.attempt.answers;

      return {
        ...state,
        definition: {
          ...state.definition,
          slots: updatedSlots,
          pieces: updatedPieces,
        },
        attempt: {
          ...state.attempt,
          answers: remainingAnswers,
        },
        validation: null,
        isSubmitted: false,
      };
    }

    case 'SUBMIT_PUZZLE':
      if (!state.attempt) return state;
      return {
        ...state,
        attempt: {
          ...state.attempt,
          endTime: Date.now(),
        },
        isSubmitted: true,
      };

    case 'VALIDATE_PUZZLE':
      return {
        ...state,
        validation: action.payload,
      };

    case 'RESET_PUZZLE':
      if (!state.definition) return state;
      return {
        ...state,
        definition: {
          ...state.definition,
          slots: state.definition.slots.map((slot) => ({
            ...slot,
            currentValue: null,
          })),
          pieces: state.definition.pieces.map((piece) => ({
            ...piece,
            isPlaced: false,
            placedInSlotId: undefined,
          })),
        },
        attempt: {
          puzzleId: state.definition.id,
          answers: {},
          startTime: Date.now(),
        },
        validation: null,
        isSubmitted: false,
        showHints: false,
        currentHintIndex: -1,
      };

    case 'SHOW_HINT':
      if (!state.definition) return state;
      const nextHintIndex = Math.min(
        state.currentHintIndex + 1,
        state.definition.hints.length - 1
      );
      return {
        ...state,
        showHints: true,
        currentHintIndex: nextHintIndex,
      };

    case 'HIDE_HINTS':
      return {
        ...state,
        showHints: false,
      };

    default:
      return state;
  }
}

// ===== CONTEXT =====

interface PuzzleContextValue {
  state: PuzzleState;
  dispatch: React.Dispatch<PuzzleAction>;
  // Convenience methods
  setPuzzle: (puzzle: PuzzleDefinition) => void;
  placePiece: (slotId: string, pieceId: string) => void;
  removePiece: (slotId: string) => void;
  submit: () => void;
  validate: (result: PuzzleValidationResult) => void;
  reset: () => void;
  showHint: () => void;
  hideHints: () => void;
  // Computed values
  isComplete: boolean;
  currentHint: string | null;
  availablePieces: PuzzleDefinition['pieces'];
}

const PuzzleContext = createContext<PuzzleContextValue | null>(null);

// ===== PROVIDER =====

interface PuzzleProviderProps {
  children: ReactNode;
  initialPuzzle?: PuzzleDefinition;
}

export function PuzzleProvider({ children, initialPuzzle }: PuzzleProviderProps) {
  const [state, dispatch] = useReducer(puzzleReducer, {
    ...initialPuzzleState,
    definition: initialPuzzle || null,
    attempt: initialPuzzle
      ? { puzzleId: initialPuzzle.id, answers: {}, startTime: Date.now() }
      : null,
  });

  const value = useMemo<PuzzleContextValue>(() => {
    const availablePieces = state.definition?.pieces.filter((p) => !p.isPlaced) || [];
    const allSlotsFilled =
      state.definition?.slots.every((slot) => slot.currentValue !== null) ?? false;
    const currentHint =
      state.showHints && state.definition && state.currentHintIndex >= 0
        ? state.definition.hints[state.currentHintIndex]
        : null;

    return {
      state,
      dispatch,
      setPuzzle: (puzzle) => dispatch({ type: 'SET_PUZZLE', payload: puzzle }),
      placePiece: (slotId, pieceId) =>
        dispatch({ type: 'PLACE_PIECE', payload: { slotId, pieceId } }),
      removePiece: (slotId) => dispatch({ type: 'REMOVE_PIECE', payload: { slotId } }),
      submit: () => dispatch({ type: 'SUBMIT_PUZZLE' }),
      validate: (result) => dispatch({ type: 'VALIDATE_PUZZLE', payload: result }),
      reset: () => dispatch({ type: 'RESET_PUZZLE' }),
      showHint: () => dispatch({ type: 'SHOW_HINT' }),
      hideHints: () => dispatch({ type: 'HIDE_HINTS' }),
      isComplete: allSlotsFilled,
      currentHint,
      availablePieces: availablePieces as any,
    };
  }, [state, dispatch]);

  return <PuzzleContext.Provider value={value}>{children}</PuzzleContext.Provider>;
}

// ===== HOOK =====

export function usePuzzle(): PuzzleContextValue {
  const context = useContext(PuzzleContext);
  if (!context) {
    throw new Error('usePuzzle must be used within a PuzzleProvider');
  }
  return context;
}
