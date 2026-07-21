import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { MemoryRegionLayout, VisualMemoryPointer, Position } from '../../types';
import { StackPanel } from './StackPanel';
import { HeapPanel } from './HeapPanel';
import { COLORS, ARROW } from '../../constants';

interface MemoryLayoutViewProps {
  layout: MemoryRegionLayout;
  pointers: VisualMemoryPointer[];
  errorLine?: number;
  onVariableClick?: (id: string) => void;
}

interface PointerArrowProps {
  pointer: VisualMemoryPointer;
  containerRef: React.RefObject<HTMLDivElement>;
}

function PointerArrow({ pointer, containerRef }: PointerArrowProps) {
  const [path, setPath] = useState<string>('');
  const [arrowPos, setArrowPos] = useState<{ x: number; y: number; angle: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current || !pointer.sourcePosition || !pointer.targetPosition) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Find source and target elements
    const sourceElement = container.querySelector(`[data-variable-id="${pointer.id}"]`);
    const targetElement = container.querySelector(`[data-variable-id="${pointer.pointsTo}"]`);

    if (!sourceElement || !targetElement) return;

    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    // Calculate positions relative to container
    const startX = sourceRect.right - containerRect.left;
    const startY = sourceRect.top + sourceRect.height / 2 - containerRect.top;
    const endX = targetRect.left - containerRect.left;
    const endY = targetRect.top + targetRect.height / 2 - containerRect.top;

    // Create bezier curve path
    const midX = (startX + endX) / 2;
    const controlOffset = Math.abs(endX - startX) * ARROW.curvature;

    const pathD = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
    setPath(pathD);

    // Calculate arrow head position and angle
    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
    setArrowPos({ x: endX, y: endY, angle });
  }, [pointer, containerRef]);

  if (!pointer.pointsTo || !path) return null;

  const color = COLORS.pointerStates[pointer.state];
  const isDangling = pointer.state === 'dangling';
  const isNull = pointer.state === 'null';

  return (
    <g>
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={pointer.isHighlighted ? ARROW.strokeWidthHighlighted : ARROW.strokeWidth}
        strokeDasharray={isDangling ? ARROW.dashArray.dashed : ARROW.dashArray.solid}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {arrowPos && (
        <motion.polygon
          points={`0,-${ARROW.markerSize / 2} ${ARROW.markerSize},0 0,${ARROW.markerSize / 2}`}
          fill={color}
          transform={`translate(${arrowPos.x - ARROW.markerSize}, ${arrowPos.y}) rotate(${arrowPos.angle})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
      )}
      {isDangling && arrowPos && (
        <motion.text
          x={(parseFloat(path.split(' ')[1]) + arrowPos.x) / 2}
          y={(parseFloat(path.split(' ')[2]) + arrowPos.y) / 2 - 10}
          fill={color}
          fontSize="10"
          fontWeight="bold"
          textAnchor="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          DANGLING
        </motion.text>
      )}
    </g>
  );
}

function NullPointerIndicator({ pointer }: { pointer: VisualMemoryPointer }) {
  if (pointer.state !== 'null' || pointer.pointsTo !== null) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        background: '#f1f5f9',
        borderRadius: '4px',
        fontSize: '10px',
        color: COLORS.pointerStates.null,
      }}
    >
      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{pointer.id}</span>
      <span>→</span>
      <span style={{ fontWeight: 700 }}>NULL</span>
    </div>
  );
}

export function MemoryLayoutView({
  layout,
  pointers,
  errorLine,
  onVariableClick,
}: MemoryLayoutViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightedId, setHighlightedId] = useState<string | undefined>();

  const handleVariableClick = (id: string) => {
    setHighlightedId((prev) => (prev === id ? undefined : id));
    onVariableClick?.(id);
  };

  // Find null pointers for the indicator section
  const nullPointers = pointers.filter((p) => p.state === 'null' && p.pointsTo === null);
  // Find pointers that have targets (for arrows)
  const connectedPointers = pointers.filter((p) => p.pointsTo !== null);

  const styles: Record<string, React.CSSProperties> = {
    container: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    panelsContainer: {
      position: 'relative',
      display: 'flex',
      gap: '80px',
    },
    svg: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'visible',
    },
    nullSection: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      padding: '12px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: `1px solid ${COLORS.ui.border}`,
    },
    nullTitle: {
      width: '100%',
      fontSize: '11px',
      fontWeight: 600,
      color: COLORS.ui.textSecondary,
      marginBottom: '4px',
    },
  };

  return (
    <div style={styles.container}>
      <div ref={containerRef} style={styles.panelsContainer}>
        <StackPanel
          variables={layout.stack.variables.map((v) => ({
            ...v,
            // Add data attribute for arrow positioning
          }))}
          highlightedId={highlightedId}
          errorLine={errorLine}
          onVariableClick={handleVariableClick}
        />

        <HeapPanel
          variables={layout.heap.variables}
          highlightedId={highlightedId}
          errorLine={errorLine}
          onVariableClick={handleVariableClick}
        />

        {/* SVG overlay for pointer arrows */}
        <svg style={styles.svg}>
          <defs>
            <marker
              id="arrowhead-valid"
              markerWidth={ARROW.markerSize}
              markerHeight={ARROW.markerSize}
              refX={ARROW.markerSize - 1}
              refY={ARROW.markerSize / 2}
              orient="auto"
            >
              <polygon
                points={`0 0, ${ARROW.markerSize} ${ARROW.markerSize / 2}, 0 ${ARROW.markerSize}`}
                fill={COLORS.pointerStates.valid}
              />
            </marker>
            <marker
              id="arrowhead-dangling"
              markerWidth={ARROW.markerSize}
              markerHeight={ARROW.markerSize}
              refX={ARROW.markerSize - 1}
              refY={ARROW.markerSize / 2}
              orient="auto"
            >
              <polygon
                points={`0 0, ${ARROW.markerSize} ${ARROW.markerSize / 2}, 0 ${ARROW.markerSize}`}
                fill={COLORS.pointerStates.dangling}
              />
            </marker>
          </defs>

          {connectedPointers.map((pointer) => (
            <PointerArrow
              key={pointer.id}
              pointer={pointer}
              containerRef={containerRef as React.RefObject<HTMLDivElement>}
            />
          ))}
        </svg>
      </div>

      {/* Null pointers section */}
      {nullPointers.length > 0 && (
        <div style={styles.nullSection}>
          <div style={styles.nullTitle}>Null Pointers</div>
          {nullPointers.map((pointer) => (
            <NullPointerIndicator key={pointer.id} pointer={pointer} />
          ))}
        </div>
      )}
    </div>
  );
}
