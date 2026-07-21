import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { MemoryBlockNodeData } from '../../../types';
import { COLORS } from '../../../constants';

function StackVariableNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as MemoryBlockNodeData;
  const { variable, isError } = nodeData;

  const styles: Record<string, React.CSSProperties> = {
    container: {
      background: isError ? '#fee2e2' : COLORS.stack.background,
      border: `2px solid ${isError ? COLORS.status.error : COLORS.stack.border}`,
      borderRadius: '10px',
      padding: '12px 16px',
      minWidth: '140px',
      boxShadow: selected
        ? `0 0 0 2px ${COLORS.stack.border}`
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
      color: COLORS.stack.text,
    },
    badge: {
      fontSize: '9px',
      padding: '2px 6px',
      borderRadius: '4px',
      background: COLORS.stack.border,
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
    initIndicator: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: variable.initialized ? COLORS.status.success : COLORS.status.warning,
    },
    line: {
      color: COLORS.ui.textMuted,
    },
  };

  return (
    <motion.div
      style={styles.container}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: COLORS.stack.border }}
      />

      <div style={styles.header}>
        <span style={styles.name}>{variable.name}</span>
        <span style={styles.badge}>STACK</span>
      </div>

      <div style={styles.details}>
        <span style={styles.type}>{variable.type}</span>
        <div style={styles.status}>
          <div style={styles.initIndicator} title={variable.initialized ? 'Initialized' : 'Uninitialized'} />
          <span style={styles.line}>L{variable.declaredLine}</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: COLORS.stack.border }}
      />
    </motion.div>
  );
}

export const StackVariableNode = memo(StackVariableNodeComponent);
