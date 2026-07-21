import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PuzzleSlot as PuzzleSlotType, PuzzleFeedback } from '../../types';
import { COLORS } from '../../constants';

interface PuzzleSlotProps {
  slot: PuzzleSlotType;
  placedPieceLabel?: string;
  feedback?: PuzzleFeedback;
  disabled?: boolean;
  onDrop: (pieceId: string) => void;
  onRemove: () => void;
}

export function PuzzleSlot({
  slot,
  placedPieceLabel,
  feedback,
  disabled = false,
  onDrop,
  onRemove,
}: PuzzleSlotProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);

    if (disabled) return;

    const pieceId = e.dataTransfer.getData('text/plain');
    if (pieceId) {
      onDrop(pieceId);
    }
  };

  const handleClick = () => {
    if (slot.currentValue && !disabled) {
      onRemove();
    }
  };

  // Determine border color based on state
  const getBorderColor = () => {
    if (feedback) {
      return feedback.isCorrect ? COLORS.status.success : COLORS.status.error;
    }
    if (isOver) return COLORS.puzzle.pieceBorder;
    if (slot.currentValue) return COLORS.ui.borderHover;
    return COLORS.ui.border;
  };

  // Determine background color based on state
  const getBackgroundColor = () => {
    if (feedback) {
      return feedback.isCorrect ? COLORS.puzzle.slotCorrect : COLORS.puzzle.slotIncorrect;
    }
    if (isOver) return COLORS.puzzle.slotActive;
    return COLORS.puzzle.slot;
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    label: {
      fontSize: '11px',
      fontWeight: 600,
      color: COLORS.ui.textSecondary,
      marginBottom: '4px',
    },
    slot: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '120px',
      minHeight: '50px',
      padding: '12px 16px',
      background: getBackgroundColor(),
      border: `2px dashed ${getBorderColor()}`,
      borderRadius: '8px',
      cursor: slot.currentValue && !disabled ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
    },
    placeholder: {
      fontSize: '11px',
      color: COLORS.ui.textMuted,
      fontStyle: 'italic',
    },
    placedValue: {
      fontFamily: '"Cascadia Code", monospace',
      fontSize: '12px',
      fontWeight: 600,
      color: COLORS.ui.text,
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    removeButton: {
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      background: COLORS.ui.textMuted,
      color: '#ffffff',
      border: 'none',
      cursor: 'pointer',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    feedbackIcon: {
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.container}>
      <span style={styles.label}>{slot.label}</span>
      <motion.div
        style={styles.slot}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        animate={{
          scale: isOver ? 1.02 : 1,
          borderStyle: isOver ? 'solid' : 'dashed',
        }}
        transition={{ duration: 0.15 }}
      >
        {slot.currentValue ? (
          <div style={styles.placedValue}>
            {feedback && (
              <span style={styles.feedbackIcon}>
                {feedback.isCorrect ? '✓' : '✗'}
              </span>
            )}
            <span>{placedPieceLabel || slot.currentValue}</span>
            {!disabled && !feedback && (
              <button
                style={styles.removeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                title="Remove"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <span style={styles.placeholder}>Drop here</span>
        )}
      </motion.div>
    </div>
  );
}
