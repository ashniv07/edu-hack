import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { MemoryBlockNodeData } from '../../../types';
import { COLORS } from '../../../constants';

function HeapVariableNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as MemoryBlockNodeData;
  const { variable, isError } = nodeData;
  const isFreed = variable.animationState === 'exiting';

  const styles: Record<string, React.CSSProperties> = {
    container: {
      background: isFreed
        ? 'repeating-linear-gradient(45deg, #f5f3ff, #f5f3ff 5px, #ede9fe 5px, #ede9fe 10px)'
        : isError
        ? '#fee2e2'
        : COLORS.heap.background,
      border: `2px ${isFreed ? 'dashed' : 'solid'} ${isError ? COLORS.status.error : COLORS.heap.border}`,
      borderRadius: '10px',
      padding: '12px 16px',
      minWidth: '140px',
      opacity: isFreed ? 0.6 : 1,
      boxShadow: selected
        ? `0 0 0 2px ${COLORS.heap.border}`
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
      color: isFreed ? COLORS.ui.textMuted : COLORS.heap.text,
      textDecoration: isFreed ? 'line-through' : 'none',
    },
    badge: {
      fontSize: '9px',
      padding: '2px 6px',
      borderRadius: '4px',
      background: isFreed ? COLORS.ui.textMuted : COLORS.heap.border,
      color: '#ffffff',
      fontWeight: 600,
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
    status: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    address: {
      fontSize: '9px',
      color: COLORS.ui.textMuted,
      fontFamily: '"Cascadia Code", monospace',
      marginTop: '6px',
      padding: '2px 6px',
      background: 'rgba(0,0,0,0.05)',
      borderRadius: '4px',
    },
    freedLabel: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: COLORS.status.error,
      color: '#ffffff',
      fontSize: '10px',
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: '4px',
    },
  };

  return (
    <motion.div
      style={{ position: 'relative' }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: isFreed ? 0.6 : 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: isFreed ? 1 : 1.02 }}
    >
      <div style={styles.container}>
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: COLORS.heap.border }}
        />

        <div style={styles.header}>
          <span style={styles.name}>{variable.name}</span>
          <span style={styles.badge}>{isFreed ? 'FREED' : 'HEAP'}</span>
        </div>

        <div style={styles.details}>
          <span style={styles.type}>{variable.type}</span>
          <div style={styles.status}>
            <span style={{ color: COLORS.ui.textMuted }}>L{variable.declaredLine}</span>
          </div>
        </div>

        <div style={styles.address}>
          @ 0x{Math.abs(variable.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) * 1234).toString(16).slice(0, 4).toUpperCase()}
        </div>

        <Handle
          type="source"
          position={Position.Right}
          style={{ background: COLORS.heap.border }}
        />
      </div>

      {isFreed && (
        <motion.div
          style={styles.freedLabel}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          FREED
        </motion.div>
      )}
    </motion.div>
  );
}

export const HeapVariableNode = memo(HeapVariableNodeComponent);
