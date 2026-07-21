import React from 'react';
import { motion } from 'framer-motion';
import type { ArrayVisualization } from '../../../../tutor/types';

interface ArrayAccessVizProps {
	data: ArrayVisualization;
}

export function ArrayAccessViz({ data }: ArrayAccessVizProps) {
	const { name, elements, accessIndex, validRange, errorMessage } = data;
	const isOutOfBounds = accessIndex < 0 || accessIndex > validRange.end;

	const styles: Record<string, React.CSSProperties> = {
		container: {
			display: 'flex',
			flexDirection: 'column',
			gap: '20px',
		},
		arrayName: {
			fontSize: '14px',
			color: '#94a3b8',
			fontFamily: 'monospace',
		},
		arrayContainer: {
			display: 'flex',
			alignItems: 'center',
			gap: '4px',
			flexWrap: 'wrap',
		},
		bracket: {
			fontSize: '24px',
			color: '#64748b',
			fontWeight: 300,
		},
		element: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '4px',
		},
		elementBox: {
			width: '50px',
			height: '50px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: '8px',
			fontSize: '14px',
			fontFamily: 'monospace',
			fontWeight: 600,
		},
		index: {
			fontSize: '10px',
			color: '#64748b',
		},
		accessPointer: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			marginTop: '10px',
		},
		arrow: {
			fontSize: '20px',
			color: '#ef4444',
		},
		accessLabel: {
			fontSize: '11px',
			padding: '4px 8px',
			borderRadius: '4px',
			fontFamily: 'monospace',
		},
		errorBox: {
			background: 'rgba(239, 68, 68, 0.1)',
			border: '1px solid rgba(239, 68, 68, 0.3)',
			borderRadius: '8px',
			padding: '12px 16px',
			marginTop: '16px',
		},
		errorText: {
			color: '#ef4444',
			fontSize: '13px',
			margin: 0,
		},
		rangeInfo: {
			display: 'flex',
			gap: '20px',
			marginTop: '12px',
		},
		rangeItem: {
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
		},
		rangeLabel: {
			fontSize: '12px',
			color: '#94a3b8',
		},
		rangeValue: {
			fontSize: '12px',
			fontFamily: 'monospace',
			padding: '2px 6px',
			borderRadius: '4px',
		},
	};

	return (
		<div style={styles.container}>
			<div style={styles.arrayName}>{name} =</div>

			<div style={styles.arrayContainer}>
				<span style={styles.bracket}>[</span>
				{elements.map((el, idx) => (
					<motion.div
						key={idx}
						style={styles.element}
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: idx * 0.1 }}
					>
						<motion.div
							style={{
								...styles.elementBox,
								background: el.highlighted ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
								border: `2px solid ${el.highlighted ? '#22c55e' : '#3b82f6'}`,
								color: el.highlighted ? '#22c55e' : '#3b82f6',
							}}
							whileHover={{ scale: 1.05 }}
						>
							{el.value}
						</motion.div>
						<span style={styles.index}>[{el.index}]</span>
					</motion.div>
				))}
				{isOutOfBounds && (
					<motion.div
						style={styles.element}
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: elements.length * 0.1 }}
					>
						<motion.div
							style={{
								...styles.elementBox,
								background: 'rgba(239, 68, 68, 0.2)',
								border: '2px dashed #ef4444',
								color: '#ef4444',
							}}
							animate={{ opacity: [1, 0.5, 1] }}
							transition={{ repeat: Infinity, duration: 1.5 }}
						>
							?
						</motion.div>
						<span style={{ ...styles.index, color: '#ef4444' }}>[{accessIndex}]</span>
					</motion.div>
				)}
				<span style={styles.bracket}>]</span>
			</div>

			<div style={styles.accessPointer}>
				<motion.div
					style={styles.arrow}
					animate={{ y: [0, 5, 0] }}
					transition={{ repeat: Infinity, duration: 1 }}
				>
					↓
				</motion.div>
				<span
					style={{
						...styles.accessLabel,
						background: isOutOfBounds ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
						color: isOutOfBounds ? '#ef4444' : '#22c55e',
					}}
				>
					{name}[{accessIndex}]
				</span>
			</div>

			<div style={styles.rangeInfo}>
				<div style={styles.rangeItem}>
					<span style={styles.rangeLabel}>Valid range:</span>
					<span style={{ ...styles.rangeValue, background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
						{validRange.start} to {validRange.end}
					</span>
				</div>
				<div style={styles.rangeItem}>
					<span style={styles.rangeLabel}>Accessed:</span>
					<span style={{ ...styles.rangeValue, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
						{accessIndex}
					</span>
				</div>
			</div>

			<div style={styles.errorBox}>
				<p style={styles.errorText}>⚠️ {errorMessage}</p>
			</div>
		</div>
	);
}
