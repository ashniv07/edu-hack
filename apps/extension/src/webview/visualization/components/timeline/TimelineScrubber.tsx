import { motion } from 'framer-motion';
import type { MemoryOperation, AnimationStep } from '../../types';
import { PlaybackControls } from './PlaybackControls';
import { COLORS, OPERATION_LABELS, OPERATION_ICONS } from '../../constants';

interface TimelineScrubberProps {
  steps: AnimationStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  onStepChange: (step: number) => void;
  onPlayPause: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function TimelineScrubber({
  steps,
  currentStepIndex,
  isPlaying,
  speed,
  onStepChange,
  onPlayPause,
  onPrevStep,
  onNextStep,
  onReset,
  onSpeedChange,
}: TimelineScrubberProps) {
  const currentStep = steps[currentStepIndex];

  const styles: Record<string, React.CSSProperties> = {
    container: {
      background: COLORS.ui.background,
      border: `1px solid ${COLORS.ui.border}`,
      borderRadius: '12px',
      padding: '16px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    },
    title: {
      fontSize: '12px',
      fontWeight: 600,
      color: COLORS.ui.textSecondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    stepInfo: {
      fontSize: '11px',
      color: COLORS.ui.textMuted,
    },
    sliderContainer: {
      marginBottom: '16px',
    },
    slider: {
      width: '100%',
      height: '6px',
      appearance: 'none' as const,
      background: COLORS.ui.border,
      borderRadius: '3px',
      outline: 'none',
      cursor: 'pointer',
    },
    operationMarkers: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '8px',
      padding: '0 2px',
    },
    marker: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'transform 0.1s ease',
    },
    markerDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      border: '2px solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '8px',
      fontWeight: 700,
    },
    markerLabel: {
      fontSize: '9px',
      marginTop: '4px',
      color: COLORS.ui.textMuted,
      textAlign: 'center' as const,
      maxWidth: '60px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    currentOperation: {
      background: COLORS.ui.backgroundSecondary,
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '16px',
    },
    operationHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '4px',
    },
    operationIcon: {
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      background: COLORS.status.info,
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 700,
    },
    operationName: {
      fontSize: '13px',
      fontWeight: 600,
      color: COLORS.ui.text,
    },
    operationDescription: {
      fontSize: '11px',
      color: COLORS.ui.textSecondary,
      marginLeft: '32px',
    },
  };

  const getOperationColor = (kind: MemoryOperation['kind']): string => {
    const colors: Record<MemoryOperation['kind'], string> = {
      declare: COLORS.status.success,
      assign: COLORS.status.info,
      free: COLORS.status.error,
      dereference: COLORS.status.warning,
      move: '#8b5cf6',
      borrow: '#06b6d4',
    };
    return colors[kind] || COLORS.ui.textMuted;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Timeline</span>
        <span style={styles.stepInfo}>
          Step {currentStepIndex + 1} of {steps.length}
        </span>
      </div>

      {/* Current operation display */}
      {currentStep && (
        <div style={styles.currentOperation}>
          <div style={styles.operationHeader}>
            <div
              style={{
                ...styles.operationIcon,
                background: getOperationColor(currentStep.operation.kind),
              }}
            >
              {OPERATION_ICONS[currentStep.operation.kind]}
            </div>
            <span style={styles.operationName}>
              {OPERATION_LABELS[currentStep.operation.kind]} - Line {currentStep.operation.line}
            </span>
          </div>
          <div style={styles.operationDescription}>{currentStep.description}</div>
        </div>
      )}

      {/* Slider */}
      <div style={styles.sliderContainer}>
        <input
          type="range"
          min={0}
          max={Math.max(0, steps.length - 1)}
          value={currentStepIndex}
          onChange={(e) => onStepChange(parseInt(e.target.value, 10))}
          style={styles.slider}
        />

        {/* Operation markers */}
        {steps.length <= 10 && (
          <div style={styles.operationMarkers}>
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                style={styles.marker}
                onClick={() => onStepChange(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  style={{
                    ...styles.markerDot,
                    borderColor: getOperationColor(step.operation.kind),
                    background: index === currentStepIndex ? getOperationColor(step.operation.kind) : 'transparent',
                    color: index === currentStepIndex ? '#ffffff' : getOperationColor(step.operation.kind),
                  }}
                >
                  {OPERATION_ICONS[step.operation.kind]}
                </div>
                <span style={styles.markerLabel}>{step.operation.target}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Playback controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        isAtStart={currentStepIndex === 0}
        isAtEnd={currentStepIndex >= steps.length - 1}
        speed={speed}
        onPlayPause={onPlayPause}
        onPrevStep={onPrevStep}
        onNextStep={onNextStep}
        onReset={onReset}
        onSpeedChange={onSpeedChange}
      />
    </div>
  );
}
