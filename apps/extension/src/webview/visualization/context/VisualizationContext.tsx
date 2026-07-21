import { createContext, useContext, useReducer, useMemo, type ReactNode } from 'react';
import type {
  VisualizationState,
  VisualizationAction,
  MemoryModel,
  ViewMode,
  MemoryRegionLayout,
  VisualMemoryPointer,
  TimelineState,
} from '../types';
import { transformToVisualLayout, transformToVisualPointers } from '../utils/transformers';

// ===== INITIAL STATE =====

const createInitialState = (memoryModel: MemoryModel, errorLine?: number, concept?: string): VisualizationState => {
  const layout = transformToVisualLayout(memoryModel, 0);
  const pointers = transformToVisualPointers(memoryModel.pointers, layout);

  return {
    viewMode: 'visualization',
    memoryModel,
    memoryLayout: layout,
    pointers,
    timeline: {
      currentStep: 0,
      totalSteps: memoryModel.operations.length,
      isPlaying: false,
      playbackSpeed: 1,
    },
    currentOperation: memoryModel.operations[0] || null,
    errorLine,
    concept,
  };
};

const defaultState: VisualizationState = {
  viewMode: 'visualization',
  memoryModel: { variables: [], pointers: [], operations: [] },
  memoryLayout: {
    stack: { variables: [], bounds: { x: 0, y: 0, width: 0, height: 0 } },
    heap: { variables: [], bounds: { x: 0, y: 0, width: 0, height: 0 } },
  },
  pointers: [],
  timeline: {
    currentStep: 0,
    totalSteps: 0,
    isPlaying: false,
    playbackSpeed: 1,
  },
  currentOperation: null,
};

// ===== REDUCER =====

function visualizationReducer(state: VisualizationState, action: VisualizationAction): VisualizationState {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SET_MEMORY_MODEL': {
      const layout = transformToVisualLayout(action.payload, state.timeline.currentStep);
      const pointers = transformToVisualPointers(action.payload.pointers, layout);
      return {
        ...state,
        memoryModel: action.payload,
        memoryLayout: layout,
        pointers,
        timeline: {
          ...state.timeline,
          totalSteps: action.payload.operations.length,
        },
      };
    }

    case 'SET_TIMELINE_STEP': {
      const step = Math.max(0, Math.min(action.payload, state.timeline.totalSteps - 1));
      const layout = transformToVisualLayout(state.memoryModel, step);
      const pointers = transformToVisualPointers(state.memoryModel.pointers, layout);
      return {
        ...state,
        memoryLayout: layout,
        pointers,
        timeline: { ...state.timeline, currentStep: step },
        currentOperation: state.memoryModel.operations[step] || null,
      };
    }

    case 'TOGGLE_PLAYBACK':
      return {
        ...state,
        timeline: { ...state.timeline, isPlaying: !state.timeline.isPlaying },
      };

    case 'SET_PLAYBACK_SPEED':
      return {
        ...state,
        timeline: { ...state.timeline, playbackSpeed: action.payload },
      };

    case 'NEXT_STEP': {
      if (state.timeline.currentStep >= state.timeline.totalSteps - 1) {
        return { ...state, timeline: { ...state.timeline, isPlaying: false } };
      }
      const nextStep = state.timeline.currentStep + 1;
      const layout = transformToVisualLayout(state.memoryModel, nextStep);
      const pointers = transformToVisualPointers(state.memoryModel.pointers, layout);
      return {
        ...state,
        memoryLayout: layout,
        pointers,
        timeline: { ...state.timeline, currentStep: nextStep },
        currentOperation: state.memoryModel.operations[nextStep] || null,
      };
    }

    case 'PREV_STEP': {
      if (state.timeline.currentStep <= 0) return state;
      const prevStep = state.timeline.currentStep - 1;
      const layout = transformToVisualLayout(state.memoryModel, prevStep);
      const pointers = transformToVisualPointers(state.memoryModel.pointers, layout);
      return {
        ...state,
        memoryLayout: layout,
        pointers,
        timeline: { ...state.timeline, currentStep: prevStep },
        currentOperation: state.memoryModel.operations[prevStep] || null,
      };
    }

    case 'RESET_TIMELINE': {
      const layout = transformToVisualLayout(state.memoryModel, 0);
      const pointers = transformToVisualPointers(state.memoryModel.pointers, layout);
      return {
        ...state,
        memoryLayout: layout,
        pointers,
        timeline: { ...state.timeline, currentStep: 0, isPlaying: false },
        currentOperation: state.memoryModel.operations[0] || null,
      };
    }

    case 'HIGHLIGHT_VARIABLE': {
      const updatedStack = state.memoryLayout.stack.variables.map((v) => ({
        ...v,
        isHighlighted: v.id === action.payload,
      }));
      const updatedHeap = state.memoryLayout.heap.variables.map((v) => ({
        ...v,
        isHighlighted: v.id === action.payload,
      }));
      return {
        ...state,
        memoryLayout: {
          stack: { ...state.memoryLayout.stack, variables: updatedStack },
          heap: { ...state.memoryLayout.heap, variables: updatedHeap },
        },
      };
    }

    case 'CLEAR_HIGHLIGHTS': {
      const updatedStack = state.memoryLayout.stack.variables.map((v) => ({
        ...v,
        isHighlighted: false,
      }));
      const updatedHeap = state.memoryLayout.heap.variables.map((v) => ({
        ...v,
        isHighlighted: false,
      }));
      return {
        ...state,
        memoryLayout: {
          stack: { ...state.memoryLayout.stack, variables: updatedStack },
          heap: { ...state.memoryLayout.heap, variables: updatedHeap },
        },
      };
    }

    case 'SET_ERROR_LINE':
      return { ...state, errorLine: action.payload };

    default:
      return state;
  }
}

// ===== CONTEXT =====

interface VisualizationContextValue {
  state: VisualizationState;
  dispatch: React.Dispatch<VisualizationAction>;
  // Convenience methods
  setViewMode: (mode: ViewMode) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  togglePlayback: () => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
  highlightVariable: (id: string) => void;
  clearHighlights: () => void;
}

const VisualizationContext = createContext<VisualizationContextValue | null>(null);

// ===== PROVIDER =====

interface VisualizationProviderProps {
  memoryModel: MemoryModel;
  errorLine?: number;
  concept?: string;
  children: ReactNode;
}

export function VisualizationProvider({
  memoryModel,
  errorLine,
  concept,
  children,
}: VisualizationProviderProps) {
  const [state, dispatch] = useReducer(
    visualizationReducer,
    { memoryModel, errorLine, concept },
    ({ memoryModel, errorLine, concept }) => createInitialState(memoryModel, errorLine, concept)
  );

  const value = useMemo<VisualizationContextValue>(
    () => ({
      state,
      dispatch,
      setViewMode: (mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode }),
      goToStep: (step) => dispatch({ type: 'SET_TIMELINE_STEP', payload: step }),
      nextStep: () => dispatch({ type: 'NEXT_STEP' }),
      prevStep: () => dispatch({ type: 'PREV_STEP' }),
      togglePlayback: () => dispatch({ type: 'TOGGLE_PLAYBACK' }),
      setSpeed: (speed) => dispatch({ type: 'SET_PLAYBACK_SPEED', payload: speed }),
      reset: () => dispatch({ type: 'RESET_TIMELINE' }),
      highlightVariable: (id) => dispatch({ type: 'HIGHLIGHT_VARIABLE', payload: id }),
      clearHighlights: () => dispatch({ type: 'CLEAR_HIGHLIGHTS' }),
    }),
    [state, dispatch]
  );

  return (
    <VisualizationContext.Provider value={value}>
      {children}
    </VisualizationContext.Provider>
  );
}

// ===== HOOK =====

export function useVisualization(): VisualizationContextValue {
  const context = useContext(VisualizationContext);
  if (!context) {
    throw new Error('useVisualization must be used within a VisualizationProvider');
  }
  return context;
}
