import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { MemoryBlockNodeData, MemoryPointer } from '../../../types';
import { COLORS, POINTER_STATE_LABELS } from '../../../constants';

function PointerNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as MemoryBlockNodeData;
  const { variable, isError } = nodeData;

  // Find pointer state from variable animationState or inference
  const getPointerState = (): MemoryPointer['state'] => {
    if (variable.animationState === 'exiting') return 'dangling';
    if (variable.animationState === 'error') return 'dangling';
    if (!variable.initialized) return 'uninitialized';
    return 'valid';
  };
  const pointerState = getPointerState();

  const stateColors: Record<MemoryPointer['state'], { bg: string; border: string; text: string }> = {
    valid: { bg: '#dcfce7', border: COLORS.pointerStates.valid, text: '#166534' },
    null: { bg: '#f3f4f6', border: COLORS.pointerStates.null, text: '#4b5563' },
    dangling: { bg: '#fee2e2', border: COLORS.pointerStates.dangling, text: '#991b1b' },
    uninitialized: { bg: '#fef3c7', border: COLORS.pointerStates.uninitialized, text: '#92400e' },
  };

  const colors = stateColors[pointerState];

  const styles: Record<string, React.CSSProperties> = {
    container: {
      background: isError ? '#fee2e2' : colors.bg,
      border: `2px solid ${isError ? COLORS.status.error : colors.border}`,
      borderRadius: '10px',
      padding: '12px 16px',
      minWidth: '140px',
      boxShadow: selected
        ? `0 0 0 2px ${colors.border}`
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    name: {
      fontWeight: 700,
      fontFamily: '"Cascadia Code", monospace',
      fontSize: '13px',
      color: colors.text,
    },
    pointerIcon: {
      fontSize: '14px',
    },
    details: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '10px',
    },
    type: {
      color: COLORS.ui.textSecondary,
      fontFamily: '"Cascadia Code", monospace',
    },
    stateContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '8px',
      padding: '4px 8px',
      background: 'rgba(0,0,0,0.05)',
      borderRadius: '4px',
    },
    stateIndicator: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: colors.border,
    },
    stateLabel: {
      fontSize: '10px',
      fontWeight: 600,
      color: colors.text,
    },
  };

  return (
    <motion.div
      style={styles.container}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        boxShadow: pointerState === 'dangling'
          ? [
              '0 0 0 0 rgba(239, 68, 68, 0)',
              '0 0 0 4px rgba(239, 68, 68, 0.3)',
              '0 0 0 0 rgba(239, 68, 68, 0)',
            ]
          : undefined,
      }}
      transition={{
        duration: 0.3,
        boxShadow: { duration: 1, repeat: Infinity },
      }}
      whileHover={{ scale: 1.02 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: colors.border }}
      />

      <div style={styles.header}>
        <span style={styles.name}>{variable.name}</span>
        <span style={styles.pointerIcon}>*</span>
      </div>

      <div style={styles.details}>
        <span style={styles.type}>{variable.type}</span>
        <span style={{ color: COLORS.ui.textMuted }}>L{variable.declaredLine}</span>
      </div>

      <div style={styles.stateContainer}>
        <div style={styles.stateIndicator} />
        <span style={styles.stateLabel}>{POINTER_STATE_LABELS[pointerState]}</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: colors.border }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="pointer-out"
        style={{ background: colors.border }}
      />
    </motion.div>
  );
}

export const PointerNode = memo(PointerNodeComponent);
