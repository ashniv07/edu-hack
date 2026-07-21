import { motion } from 'framer-motion';
import type { VisualMemoryVariable } from '../../types';
import { VariableBlock } from '../shared/VariableBlock';
import { COLORS } from '../../constants';

interface StackPanelProps {
  variables: VisualMemoryVariable[];
  highlightedId?: string;
  errorLine?: number;
  onVariableClick?: (id: string) => void;
}

export function StackPanel({
  variables,
  highlightedId,
  errorLine,
  onVariableClick,
}: StackPanelProps) {
  const styles: Record<string, React.CSSProperties> = {
    panel: {
      flex: 1,
      background: COLORS.stack.background,
      border: `2px solid ${COLORS.stack.border}`,
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
      borderBottom: `1px solid ${COLORS.stack.border}40`,
    },
    title: {
      fontSize: '14px',
      fontWeight: 700,
      color: COLORS.stack.text,
      letterSpacing: '0.1em',
      margin: 0,
    },
    badge: {
      fontSize: '10px',
      padding: '4px 8px',
      borderRadius: '12px',
      background: `${COLORS.stack.border}20`,
      color: COLORS.stack.text,
      fontWeight: 600,
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flex: 1,
    },
    empty: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      color: COLORS.ui.textMuted,
      fontSize: '12px',
      fontStyle: 'italic',
    },
    pointer: {
      marginTop: 'auto',
      paddingTop: '12px',
      borderTop: `1px dashed ${COLORS.stack.border}40`,
      textAlign: 'center',
      fontSize: '10px',
      color: COLORS.ui.textMuted,
    },
  };

  return (
    <motion.div
      style={styles.panel}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={styles.header}>
        <h3 style={styles.title}>STACK</h3>
        <span style={styles.badge}>{variables.length} vars</span>
      </div>

      <div style={styles.container}>
        {variables.length === 0 ? (
          <div style={styles.empty}>No stack variables</div>
        ) : (
          // Stack grows upward visually (newest at top)
          [...variables].reverse().map((variable) => (
            <VariableBlock
              key={variable.id}
              variable={variable}
              isHighlighted={variable.id === highlightedId}
              isError={errorLine !== undefined && variable.declaredLine === errorLine}
              onClick={onVariableClick ? () => onVariableClick(variable.id) : undefined}
            />
          ))
        )}
      </div>

      <div style={styles.pointer}>
        Stack Pointer (SP) ↑
      </div>
    </motion.div>
  );
}
