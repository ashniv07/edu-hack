import { memo } from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import type { PointerEdgeData } from '../../../types';
import { COLORS, ARROW } from '../../../constants';

function PointerEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}: EdgeProps) {
  const edgeData = data as unknown as PointerEdgeData;
  const { state, isAnimating } = edgeData;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const color = COLORS.pointerStates[state];
  const isDangling = state === 'dangling';
  const isNull = state === 'null';

  // Determine stroke dash array based on state
  const strokeDasharray = isDangling
    ? ARROW.dashArray.dashed
    : isNull
    ? ARROW.dashArray.dotted
    : ARROW.dashArray.solid;

  const styles: Record<string, React.CSSProperties> = {
    label: {
      position: 'absolute' as const,
      transform: 'translate(-50%, -50%)',
      fontSize: '9px',
      fontWeight: 700,
      padding: '2px 6px',
      borderRadius: '4px',
      background: color,
      color: '#ffffff',
      pointerEvents: 'none' as const,
    },
  };

  return (
    <>
      {/* Background path for better visibility */}
      <path
        d={edgePath}
        fill="none"
        stroke="#ffffff"
        strokeWidth={ARROW.strokeWidth + 2}
        strokeLinecap="round"
      />

      {/* Main path */}
      <motion.path
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={ARROW.strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        style={style}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: 1,
          strokeDashoffset: isDangling ? [0, -20] : 0,
        }}
        transition={{
          pathLength: { duration: 0.5, ease: 'easeOut' },
          opacity: { duration: 0.3 },
          strokeDashoffset: isDangling
            ? { duration: 1, repeat: Infinity, ease: 'linear' }
            : undefined,
        }}
      />

      {/* Arrowhead */}
      <motion.polygon
        points={`0,-${ARROW.markerSize / 2} ${ARROW.markerSize},0 0,${ARROW.markerSize / 2}`}
        fill={color}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.2 }}
        style={{
          transformOrigin: 'center',
          transform: `translate(${targetX - ARROW.markerSize}px, ${targetY}px) rotate(${Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI)}deg)`,
        }}
      />

      {/* State label for dangling pointers */}
      {isDangling && (
        <foreignObject
          x={labelX - 30}
          y={labelY - 12}
          width={60}
          height={24}
          style={{ overflow: 'visible' }}
        >
          <motion.div
            style={styles.label}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            DANGLING
          </motion.div>
        </foreignObject>
      )}

      {/* Interaction hint on hover */}
      {isAnimating && (
        <motion.circle
          cx={labelX}
          cy={labelY}
          r={6}
          fill={color}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </>
  );
}

export const PointerEdge = memo(PointerEdgeComponent);
