import { motion } from 'framer-motion';
import type { PuzzleValidationResult } from '../../types';
import { COLORS } from '../../constants';
import { getScoreFeedback } from '../../hooks/usePuzzleValidation';

interface PuzzleFeedbackProps {
  validation: PuzzleValidationResult;
  hintsUsed: number;
  timeSpent?: string;
  onTryAgain: () => void;
  onNextPuzzle?: () => void;
}

export function PuzzleFeedback({
  validation,
  hintsUsed,
  timeSpent,
  onTryAgain,
  onNextPuzzle,
}: PuzzleFeedbackProps) {
  const { emoji, message } = getScoreFeedback(validation.score);
  const isPerfect = validation.isCorrect;

  const styles: Record<string, React.CSSProperties> = {
    container: {
      background: isPerfect ? '#ecfdf5' : '#fef3c7',
      border: `1px solid ${isPerfect ? COLORS.status.success : COLORS.status.warning}`,
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px',
    },
    emoji: {
      fontSize: '48px',
    },
    message: {
      fontSize: '16px',
      fontWeight: 600,
      color: isPerfect ? COLORS.status.success : '#92400e',
    },
    stats: {
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      marginBottom: '16px',
    },
    stat: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 700,
      color: COLORS.ui.text,
    },
    statLabel: {
      fontSize: '11px',
      color: COLORS.ui.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    progressBar: {
      width: '100%',
      height: '8px',
      background: COLORS.ui.border,
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '16px',
    },
    progressFill: {
      height: '100%',
      borderRadius: '4px',
    },
    feedbackList: {
      textAlign: 'left',
      marginBottom: '16px',
    },
    feedbackItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '6px',
      marginBottom: '4px',
      fontSize: '12px',
    },
    feedbackCorrect: {
      background: '#dcfce7',
      color: '#166534',
    },
    feedbackIncorrect: {
      background: '#fee2e2',
      color: '#991b1b',
    },
    feedbackIcon: {
      fontSize: '14px',
      flexShrink: 0,
    },
    feedbackText: {
      flex: 1,
    },
    hint: {
      fontSize: '11px',
      color: COLORS.ui.textSecondary,
      fontStyle: 'italic',
      marginTop: '4px',
    },
    actions: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
    },
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      fontWeight: 600,
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    primaryButton: {
      background: isPerfect ? COLORS.status.success : COLORS.status.info,
      color: '#ffffff',
    },
    secondaryButton: {
      background: COLORS.ui.background,
      border: `1px solid ${COLORS.ui.border}`,
      color: COLORS.ui.text,
    },
  };

  const progressColor = validation.score >= 80
    ? COLORS.status.success
    : validation.score >= 50
    ? COLORS.status.warning
    : COLORS.status.error;

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={styles.header}>
        <motion.span
          style={styles.emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
        >
          {emoji}
        </motion.span>
        <span style={styles.message}>{message}</span>
      </div>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{validation.score}%</span>
          <span style={styles.statLabel}>Score</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>
            {validation.correctCount}/{validation.totalCount}
          </span>
          <span style={styles.statLabel}>Correct</span>
        </div>
        {timeSpent && (
          <div style={styles.stat}>
            <span style={styles.statValue}>{timeSpent}</span>
            <span style={styles.statLabel}>Time</span>
          </div>
        )}
        {hintsUsed > 0 && (
          <div style={styles.stat}>
            <span style={styles.statValue}>{hintsUsed}</span>
            <span style={styles.statLabel}>Hints</span>
          </div>
        )}
      </div>

      <div style={styles.progressBar}>
        <motion.div
          style={{
            ...styles.progressFill,
            background: progressColor,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${validation.score}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      {/* Show feedback for incorrect answers */}
      {!validation.isCorrect && (
        <div style={styles.feedbackList}>
          {validation.feedback
            .filter((f) => !f.isCorrect)
            .map((feedback) => (
              <div
                key={feedback.slotId}
                style={{ ...styles.feedbackItem, ...styles.feedbackIncorrect }}
              >
                <span style={styles.feedbackIcon}>✗</span>
                <div style={styles.feedbackText}>
                  {feedback.message}
                  {feedback.hint && <div style={styles.hint}>{feedback.hint}</div>}
                </div>
              </div>
            ))}
        </div>
      )}

      <div style={styles.actions}>
        <motion.button
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={onTryAgain}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Try Again
        </motion.button>
        {isPerfect && onNextPuzzle && (
          <motion.button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={onNextPuzzle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Next Puzzle
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
