import { motion } from 'framer-motion';
import type { VariableBlockProps } from '../../types';
import { COLORS, ANIMATION } from '../../constants';

export function VariableBlock({
  variable,
  isHighlighted = false,
  isError = false,
  onClick,
  style,
}: VariableBlockProps) {
  const regionColors = variable.region === 'stack' ? COLORS.stack : COLORS.heap;

  const baseStyle: React.CSSProperties = {
    background: isError
      ? '#fee2e2'
      : isHighlighted
      ? COLORS.ui.highlight
      : COLORS.ui.background,
    border: `2px solid ${
      isError
        ? COLORS.status.error
        : isHighlighted
        ? COLORS.ui.highlightBorder
        : regionColors.border
    }`,
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    cursor: onClick ? 'pointer' : 'default',
    userSelect: 'none',
    minWidth: '120px',
    boxShadow: isHighlighted
      ? `0 0 0 3px ${COLORS.ui.highlightBorder}40`
      : '0 2px 4px rgba(0,0,0,0.05)',
    ...style,
  };

  const animationVariants = {
    entering: {
      opacity: [0, 1],
      scale: [0.8, 1],
      transition: { duration: ANIMATION.duration.normal / 1000 },
    },
    exiting: {
      opacity: 0.4,
      backgroundColor: '#f1f5f9',
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)',
    },
    active: {
      boxShadow: [
        '0 0 0 0 rgba(59, 130, 246, 0)',
        '0 0 0 4px rgba(59, 130, 246, 0.3)',
        '0 0 0 0 rgba(59, 130, 246, 0)',
      ],
      transition: { duration: 0.6, repeat: 1 },
    },
    error: {
      boxShadow: [
        '0 0 0 0 rgba(239, 68, 68, 0)',
        '0 0 0 4px rgba(239, 68, 68, 0.3)',
        '0 0 0 0 rgba(239, 68, 68, 0)',
      ],
      transition: { duration: 0.6, repeat: Infinity },
    },
    idle: {},
  };

  return (
    <motion.div
      style={baseStyle}
      onClick={onClick}
      initial="entering"
      animate={isError ? 'error' : variable.animationState}
      variants={animationVariants}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontWeight: 700,
            fontFamily: '"Cascadia Code", "Fira Code", monospace',
            fontSize: '13px',
            color: COLORS.ui.text,
          }}
        >
          {variable.name}
        </span>
        <span
          style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: regionColors.background,
            color: regionColors.text,
            fontWeight: 600,
          }}
        >
          {variable.region.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '11px',
            color: COLORS.ui.textSecondary,
            fontFamily: '"Cascadia Code", "Fira Code", monospace',
          }}
        >
          {variable.type}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '10px',
              color: variable.initialized ? COLORS.status.success : COLORS.status.warning,
            }}
          >
            {variable.initialized ? '✓ init' : '? uninit'}
          </span>
          <span style={{ fontSize: '10px', color: COLORS.ui.textMuted }}>
            L{variable.declaredLine}
          </span>
        </div>
      </div>

      {variable.value !== undefined && (
        <div
          style={{
            marginTop: '4px',
            padding: '4px 8px',
            background: '#f8fafc',
            borderRadius: '4px',
            fontFamily: '"Cascadia Code", "Fira Code", monospace',
            fontSize: '12px',
            color: COLORS.ui.text,
          }}
        >
          = {variable.value === null ? 'null' : String(variable.value)}
        </div>
      )}
    </motion.div>
  );
}
