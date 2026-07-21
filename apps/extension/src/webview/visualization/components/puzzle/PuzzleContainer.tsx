import { motion } from 'framer-motion';
import { usePuzzle } from '../../context/PuzzleContext';
import { usePuzzleValidation, formatTimeSpent } from '../../hooks/usePuzzleValidation';
import { PuzzlePiece } from './PuzzlePiece';
import { PuzzleSlot } from './PuzzleSlot';
import { PuzzleFeedback } from './PuzzleFeedback';
import { COLORS } from '../../constants';

interface PuzzleContainerProps {
  onComplete?: (score: number) => void;
}

export function PuzzleContainer({ onComplete }: PuzzleContainerProps) {
  const {
    state,
    placePiece,
    removePiece,
    submit,
    validate,
    reset,
    showHint,
    isComplete,
    currentHint,
    availablePieces,
  } = usePuzzle();

  const { validate: runValidation, calculateScore } = usePuzzleValidation();
  const { definition, attempt, validation, isSubmitted, currentHintIndex } = state;

  if (!definition) {
    return (
      <div style={styles.emptyState}>
        <span style={styles.emptyIcon}>🧩</span>
        <span style={styles.emptyText}>No puzzle loaded</span>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!attempt) return;

    submit();
    const result = runValidation(definition, attempt);
    const finalScore = calculateScore(result, definition, currentHintIndex + 1);
    validate({ ...result, score: finalScore });

    if (result.isCorrect) {
      onComplete?.(finalScore);
    }
  };

  const handleTryAgain = () => {
    reset();
  };

  // Find the label for a placed piece
  const getPieceLabelForSlot = (slotId: string): string | undefined => {
    const slot = definition.slots.find((s) => s.id === slotId);
    if (!slot?.currentValue) return undefined;

    const piece = definition.pieces.find((p) => p.value === slot.currentValue);
    return piece?.label;
  };

  // Get feedback for a specific slot
  const getFeedbackForSlot = (slotId: string) => {
    return validation?.feedback.find((f) => f.slotId === slotId);
  };

  const timeSpent = attempt?.endTime
    ? formatTimeSpent(attempt.startTime, attempt.endTime)
    : undefined;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{definition.title}</h3>
          <p style={styles.description}>{definition.description}</p>
        </div>
        <span style={styles.difficultyBadge}>{definition.difficulty}</span>
      </div>

      {/* Validation feedback (shown after submission) */}
      {isSubmitted && validation && (
        <PuzzleFeedback
          validation={validation}
          hintsUsed={currentHintIndex + 1}
          timeSpent={timeSpent}
          onTryAgain={handleTryAgain}
        />
      )}

      {/* Puzzle area (hidden when showing feedback) */}
      {!isSubmitted && (
        <>
          {/* Slots area */}
          <div style={styles.puzzleArea}>
            <div style={styles.slotsSection}>
              <h4 style={styles.sectionTitle}>Match to:</h4>
              <div style={styles.slotsGrid}>
                {definition.slots.map((slot) => (
                  <PuzzleSlot
                    key={slot.id}
                    slot={slot}
                    placedPieceLabel={getPieceLabelForSlot(slot.id)}
                    feedback={getFeedbackForSlot(slot.id)}
                    disabled={isSubmitted}
                    onDrop={(pieceId) => placePiece(slot.id, pieceId)}
                    onRemove={() => removePiece(slot.id)}
                  />
                ))}
              </div>
            </div>

            {/* Pieces area */}
            <div style={styles.piecesSection}>
              <h4 style={styles.sectionTitle}>Available pieces:</h4>
              <div style={styles.piecesGrid}>
                {availablePieces.map((piece) => (
                  <PuzzlePiece
                    key={piece.id}
                    piece={piece}
                    disabled={isSubmitted}
                  />
                ))}
                {availablePieces.length === 0 && (
                  <span style={styles.allPlaced}>All pieces placed!</span>
                )}
              </div>
            </div>
          </div>

          {/* Hint section */}
          {currentHint && (
            <motion.div
              style={styles.hintBox}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span style={styles.hintLabel}>Hint {currentHintIndex + 1}:</span>
              <span style={styles.hintText}>{currentHint}</span>
            </motion.div>
          )}

          {/* Controls */}
          <div style={styles.controls}>
            <motion.button
              style={{ ...styles.button, ...styles.hintButton }}
              onClick={showHint}
              disabled={currentHintIndex >= definition.hints.length - 1}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              💡 Hint ({currentHintIndex + 1}/{definition.hints.length})
            </motion.button>

            <motion.button
              style={{ ...styles.button, ...styles.resetButton }}
              onClick={reset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ↺ Reset
            </motion.button>

            <motion.button
              style={{
                ...styles.button,
                ...styles.submitButton,
                opacity: isComplete ? 1 : 0.5,
              }}
              onClick={handleSubmit}
              disabled={!isComplete}
              whileHover={isComplete ? { scale: 1.02 } : {}}
              whileTap={isComplete ? { scale: 0.98 } : {}}
            >
              ✓ Check Answers
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: COLORS.ui.background,
    border: `1px solid ${COLORS.ui.border}`,
    borderRadius: '12px',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${COLORS.ui.border}`,
  },
  title: {
    fontSize: '16px',
    fontWeight: 700,
    color: COLORS.ui.text,
    margin: '0 0 4px 0',
  },
  description: {
    fontSize: '12px',
    color: COLORS.ui.textSecondary,
    margin: 0,
  },
  difficultyBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    background: COLORS.status.info + '20',
    color: COLORS.status.info,
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  puzzleArea: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '20px',
  },
  slotsSection: {},
  piecesSection: {},
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: COLORS.ui.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
  },
  slotsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  piecesGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  allPlaced: {
    fontSize: '11px',
    color: COLORS.status.success,
    fontStyle: 'italic',
  },
  hintBox: {
    background: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
  },
  hintLabel: {
    fontWeight: 600,
    fontSize: '11px',
    color: '#92400e',
    marginRight: '8px',
  },
  hintText: {
    fontSize: '12px',
    color: '#78350f',
  },
  controls: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  button: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 600,
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  hintButton: {
    background: COLORS.ui.backgroundSecondary,
    border: `1px solid ${COLORS.ui.border}`,
    color: COLORS.ui.textSecondary,
  },
  resetButton: {
    background: COLORS.ui.backgroundSecondary,
    border: `1px solid ${COLORS.ui.border}`,
    color: COLORS.ui.text,
  },
  submitButton: {
    background: COLORS.status.success,
    color: '#ffffff',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: COLORS.ui.textMuted,
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '13px',
  },
};
