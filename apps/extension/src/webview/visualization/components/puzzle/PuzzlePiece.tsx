import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PuzzlePiece as PuzzlePieceType } from '../../types';
import { COLORS } from '../../constants';

interface PuzzlePieceProps {
  piece: PuzzlePieceType;
  disabled?: boolean;
}

export function PuzzlePiece({ piece, disabled = false }: PuzzlePieceProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled || piece.isPlaced) return;

    setIsDragging(true);
    e.dataTransfer.setData('text/plain', piece.id);
    e.dataTransfer.effectAllowed = 'move';

    // Create a custom drag image
    const dragImage = document.createElement('div');
    dragImage.textContent = piece.label;
    dragImage.style.cssText = `
      padding: 8px 16px;
      background: ${COLORS.puzzle.piece};
      border: 2px solid ${COLORS.puzzle.pieceBorder};
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 20);

    // Remove the element after drag starts
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      padding: '10px 16px',
      background: piece.isPlaced ? COLORS.puzzle.slot : COLORS.puzzle.piece,
      border: `2px solid ${piece.isPlaced ? COLORS.ui.border : COLORS.puzzle.pieceBorder}`,
      borderRadius: '8px',
      cursor: disabled || piece.isPlaced ? 'not-allowed' : 'grab',
      opacity: disabled || piece.isPlaced ? 0.5 : 1,
      userSelect: 'none',
      transition: 'all 0.2s ease',
      boxShadow: isDragging
        ? '0 8px 20px rgba(0,0,0,0.2)'
        : '0 2px 4px rgba(0,0,0,0.08)',
    },
    label: {
      fontFamily: '"Cascadia Code", monospace',
      fontSize: '12px',
      fontWeight: 600,
      color: COLORS.ui.text,
    },
    description: {
      fontSize: '10px',
      color: COLORS.ui.textSecondary,
      textAlign: 'center',
    },
  };

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: piece.isPlaced ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 1.05 : 1,
      }}
      whileHover={
        !disabled && !piece.isPlaced
          ? { scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }
          : {}
      }
      whileTap={!disabled && !piece.isPlaced ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
    >
      <div
        draggable={!disabled && !piece.isPlaced}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
      >
        <span style={styles.label}>{piece.label}</span>
        {piece.description && <span style={styles.description}>{piece.description}</span>}
      </div>
    </motion.div>
  );
}
