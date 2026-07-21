import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MemoryVisualizationProps, ViewMode, PuzzleDefinition } from '../types';
import { VisualizationProvider, useVisualization } from '../context/VisualizationContext';
import { PuzzleProvider } from '../context/PuzzleContext';
import { useMemoryLayout } from '../hooks/useMemoryLayout';
import { useAnimationTimeline } from '../hooks/useAnimationTimeline';
import { MemoryLayoutView } from './layout/MemoryLayoutView';
import { VisualizationCanvas } from './canvas/VisualizationCanvas';
import { TimelineScrubber } from './timeline/TimelineScrubber';
import { PuzzleContainer } from './puzzle/PuzzleContainer';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { COLORS } from '../constants';

// Tab button component
function ViewModeTab({
  mode,
  label,
  icon,
  isActive,
  onClick,
}: {
  mode: ViewMode;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      style={{
        ...styles.tab,
        ...(isActive ? styles.tabActive : {}),
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span style={styles.tabIcon}>{icon}</span>
      <span>{label}</span>
    </motion.button>
  );
}

// Inner component that uses context
function MemoryVisualizationInner({ errorLine, concept }: { errorLine?: number; concept?: string }) {
  const { state, goToStep, setSpeed, reset } = useVisualization();
  const { memoryModel, memoryLayout, pointers, timeline, viewMode } = state;

  const { nodes, edges } = useMemoryLayout(memoryModel, timeline.currentStep, errorLine);

  const {
    timeline: animationTimeline,
    currentStep,
    isPlaying,
    togglePlayback,
    nextStep,
    prevStep,
    goToStep: animGoToStep,
    reset: animReset,
  } = useAnimationTimeline(memoryModel.operations, {
    onStepChange: goToStep,
  });

  // Sync step changes to animation timeline
  const handleStepChange = (step: number) => {
    goToStep(step);
    animGoToStep(step);
  };

  // Combined reset
  const handleReset = () => {
    reset();
    animReset();
  };

  // Generate puzzle from memory model
  const puzzle = useMemo<PuzzleDefinition | null>(() => {
    if (!concept || memoryModel.variables.length === 0) return null;
    return generatePuzzle(memoryModel, concept, 'beginner');
  }, [memoryModel, concept]);

  const [activeView, setActiveView] = useState<ViewMode>(viewMode);

  return (
    <div style={styles.container}>
      {/* View mode tabs */}
      <div style={styles.tabBar}>
        <ViewModeTab
          mode="visualization"
          label="Memory Layout"
          icon="📊"
          isActive={activeView === 'visualization'}
          onClick={() => setActiveView('visualization')}
        />
        <ViewModeTab
          mode="timeline"
          label="Timeline"
          icon="⏱️"
          isActive={activeView === 'timeline'}
          onClick={() => setActiveView('timeline')}
        />
        <ViewModeTab
          mode="puzzle"
          label="Challenge"
          icon="🧩"
          isActive={activeView === 'puzzle'}
          onClick={() => setActiveView('puzzle')}
        />
      </div>

      {/* Content area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={styles.content}
        >
          {activeView === 'visualization' && (
            <MemoryLayoutView
              layout={memoryLayout}
              pointers={pointers}
              errorLine={errorLine}
            />
          )}

          {activeView === 'timeline' && (
            <div style={styles.timelineView}>
              <VisualizationCanvas nodes={nodes} edges={edges} />
              <TimelineScrubber
                steps={animationTimeline.steps}
                currentStepIndex={animationTimeline.currentStepIndex}
                isPlaying={isPlaying}
                speed={animationTimeline.speed}
                onStepChange={handleStepChange}
                onPlayPause={togglePlayback}
                onPrevStep={prevStep}
                onNextStep={nextStep}
                onReset={handleReset}
                onSpeedChange={setSpeed}
              />
            </div>
          )}

          {activeView === 'puzzle' && puzzle && (
            <PuzzleProvider initialPuzzle={puzzle}>
              <PuzzleContainer />
            </PuzzleProvider>
          )}

          {activeView === 'puzzle' && !puzzle && (
            <div style={styles.noPuzzle}>
              <span style={styles.noPuzzleIcon}>🧩</span>
              <p style={styles.noPuzzleText}>
                No puzzle available for this error type.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Operation info bar (shown in visualization mode) */}
      {activeView === 'visualization' && currentStep && (
        <motion.div
          style={styles.operationBar}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span style={styles.operationLabel}>Current:</span>
          <span style={styles.operationText}>{currentStep.description}</span>
        </motion.div>
      )}
    </div>
  );
}

// Main exported component with providers
export function MemoryVisualization({
  memoryModel,
  errorLine,
  concept,
  initialViewMode = 'visualization',
}: MemoryVisualizationProps) {
  // Handle empty memory model
  if (!memoryModel || memoryModel.variables.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>📊</span>
        <p style={styles.emptyText}>No memory model available for visualization.</p>
        <p style={styles.emptySubtext}>
          Run code with a memory-related error to see the visualization.
        </p>
      </div>
    );
  }

  return (
    <VisualizationProvider memoryModel={memoryModel} errorLine={errorLine} concept={concept}>
      <MemoryVisualizationInner errorLine={errorLine} concept={concept} />
    </VisualizationProvider>
  );
}

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    padding: '4px',
    background: COLORS.ui.backgroundSecondary,
    borderRadius: '10px',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    background: 'transparent',
    color: COLORS.ui.textSecondary,
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: COLORS.ui.background,
    color: COLORS.ui.text,
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },
  tabIcon: {
    fontSize: '14px',
  },
  content: {
    minHeight: '300px',
  },
  timelineView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  operationBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: COLORS.ui.backgroundSecondary,
    borderRadius: '8px',
    fontSize: '12px',
  },
  operationLabel: {
    fontWeight: 600,
    color: COLORS.ui.textSecondary,
  },
  operationText: {
    color: COLORS.ui.text,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '14px',
    fontWeight: 600,
    color: COLORS.ui.text,
    margin: '0 0 4px 0',
  },
  emptySubtext: {
    fontSize: '12px',
    color: COLORS.ui.textSecondary,
    margin: 0,
  },
  noPuzzle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  noPuzzleIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  noPuzzleText: {
    fontSize: '13px',
    color: COLORS.ui.textMuted,
  },
};
