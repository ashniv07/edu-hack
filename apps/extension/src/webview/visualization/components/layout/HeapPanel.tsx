import { motion } from 'framer-motion';
import type { VisualMemoryVariable } from '../../types';
import { VariableBlock } from '../shared/VariableBlock';
import { COLORS } from '../../constants';

interface HeapPanelProps {
  variables: VisualMemoryVariable[];
  highlightedId?: string;
  errorLine?: number;
  onVariableClick?: (id: string) => void;
}

export function HeapPanel({
  variables,
  highlightedId,
  errorLine,
  onVariableClick,
}: HeapPanelProps) {
  const styles: Record<string, React.CSSProperties> = {
    panel: {
      flex: 1,
      background: COLORS.heap.background,
      border: `2px solid ${COLORS.heap.border}`,
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '200px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: `1px solid ${COLORS.heap.border}40`,
    },
    title: {
      fontSize: '14px',
      fontWeight: 700,
      color: COLORS.heap.text,
      letterSpacing: '0.1em',
      margin: 0,
    },
    badge: {
      fontSize: '10px',
      padding: '4px 8px',
      borderRadius: '12px',
      background: `${COLORS.heap.border}20`,
      color: COLORS.heap.text,
      fontWeight: 600,
    },
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: '12px',
      flex: 1,
    },
    empty: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      gridColumn: '1 / -1',
      color: COLORS.ui.textMuted,
      fontSize: '12px',
      fontStyle: 'italic',
    },
    freedBlock: {
      background: 'repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 5px, #e2e8f0 5px, #e2e8f0 10px)',
      border: `2px dashed ${COLORS.ui.textMuted}`,
      borderRadius: '8px',
      padding: '10px 14px',
      opacity: 0.6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: COLORS.ui.textMuted,
      fontSize: '11px',
      fontStyle: 'italic',
    },
  };

  // Separate active and freed variables
  const activeVars = variables.filter((v) => v.animationState !== 'exiting');
  const freedVars = variables.filter((v) => v.animationState === 'exiting');

  return (
    <motion.div
      style={styles.panel}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={styles.header}>
        <h3 style={styles.title}>HEAP</h3>
        <span style={styles.badge}>
          {activeVars.length} active
          {freedVars.length > 0 && ` / ${freedVars.length} freed`}
        </span>
      </div>

      <div style={styles.container}>
        {variables.length === 0 ? (
          <div style={styles.empty}>No heap allocations</div>
        ) : (
          <>
            {activeVars.map((variable) => (
              <VariableBlock
                key={variable.id}
                variable={variable}
                isHighlighted={variable.id === highlightedId}
                isError={errorLine !== undefined && variable.declaredLine === errorLine}
                onClick={onVariableClick ? () => onVariableClick(variable.id) : undefined}
              />
            ))}
            {freedVars.map((variable) => (
              <motion.div
                key={`freed-${variable.id}`}
                style={styles.freedBlock}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                {variable.name} (freed)
              </motion.div>
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}
