import React from 'react';
import { motion } from 'framer-motion';
import type { CallStackVisualization } from '../../../../tutor/types';

interface CallStackVizProps {
	data: CallStackVisualization;
}

export function CallStackViz({ data }: CallStackVizProps) {
	const { frames, maxDepth, repeatingPattern, errorMessage } = data;

	const styles: Record<string, React.CSSProperties> = {
		container: {
			display: 'flex',
			flexDirection: 'column',
			gap: '16px',
		},
		stackContainer: {
			display: 'flex',
			flexDirection: 'column',
			gap: '4px',
			position: 'relative',
		},
		frame: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
			padding: '10px 16px',
			borderRadius: '8px',
			fontFamily: 'monospace',
			fontSize: '13px',
		},
		depth: {
			width: '32px',
			height: '32px',
			borderRadius: '50%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: '12px',
			fontWeight: 700,
			flexShrink: 0,
		},
		funcName: {
			fontWeight: 600,
		},
		args: {
			color: '#94a3b8',
		},
		line: {
			marginLeft: 'auto',
			color: '#64748b',
			fontSize: '11px',
		},
		ellipsis: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '4px',
			padding: '12px',
			color: '#64748b',
		},
		dot: {
			width: '6px',
			height: '6px',
			borderRadius: '50%',
			background: '#64748b',
		},
		infoSection: {
			display: 'flex',
			gap: '24px',
			padding: '16px',
			background: 'rgba(139, 92, 246, 0.1)',
			borderRadius: '8px',
		},
		infoItem: {
			display: 'flex',
			flexDirection: 'column',
			gap: '4px',
		},
		infoLabel: {
			fontSize: '11px',
			color: '#94a3b8',
			textTransform: 'uppercase' as const,
		},
		infoValue: {
			fontSize: '14px',
			fontWeight: 600,
			fontFamily: 'monospace',
		},
		patternBox: {
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
			padding: '12px 16px',
			background: 'rgba(245, 158, 11, 0.1)',
			border: '1px solid rgba(245, 158, 11, 0.3)',
			borderRadius: '8px',
		},
		patternIcon: {
			fontSize: '20px',
		},
		patternText: {
			color: '#f59e0b',
			fontSize: '13px',
		},
		errorBox: {
			background: 'rgba(239, 68, 68, 0.1)',
			border: '1px solid rgba(239, 68, 68, 0.3)',
			borderRadius: '8px',
			padding: '12px 16px',
		},
		errorText: {
			color: '#ef4444',
			fontSize: '13px',
			margin: 0,
		},
	};

	const getDepthColor = (depth: number): string => {
		const colors = ['#3b82f6', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'];
		return colors[Math.min(depth - 1, colors.length - 1)];
	};

	return (
		<div style={styles.container}>
			<div style={styles.stackContainer}>
				{frames.map((frame, idx) => (
					<motion.div
						key={idx}
						style={{
							...styles.frame,
							background: `${getDepthColor(frame.depth)}15`,
							border: `1px solid ${getDepthColor(frame.depth)}40`,
							marginLeft: `${Math.min(frame.depth * 8, 40)}px`,
						}}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: idx * 0.1 }}
					>
						<motion.div
							style={{
								...styles.depth,
								background: `${getDepthColor(frame.depth)}30`,
								color: getDepthColor(frame.depth),
							}}
							animate={idx === frames.length - 1 ? { scale: [1, 1.1, 1] } : {}}
							transition={{ repeat: Infinity, duration: 1 }}
						>
							{frame.depth}
						</motion.div>
						<span style={{ ...styles.funcName, color: getDepthColor(frame.depth) }}>
							{frame.functionName}
						</span>
						<span style={styles.args}>{frame.args}</span>
						<span style={styles.line}>line {frame.line}</span>
					</motion.div>
				))}

				<motion.div
					style={styles.ellipsis}
					animate={{ opacity: [0.5, 1, 0.5] }}
					transition={{ repeat: Infinity, duration: 1.5 }}
				>
					<div style={styles.dot} />
					<div style={styles.dot} />
					<div style={styles.dot} />
					<span style={{ fontSize: '12px', marginTop: '4px' }}>
						... {maxDepth - frames.length} more frames
					</span>
				</motion.div>
			</div>

			<div style={styles.infoSection}>
				<div style={styles.infoItem}>
					<span style={styles.infoLabel}>Stack Depth</span>
					<span style={{ ...styles.infoValue, color: '#ef4444' }}>{maxDepth}+</span>
				</div>
				<div style={styles.infoItem}>
					<span style={styles.infoLabel}>Repeating Function</span>
					<span style={{ ...styles.infoValue, color: '#a78bfa' }}>{repeatingPattern}()</span>
				</div>
			</div>

			{repeatingPattern && (
				<div style={styles.patternBox}>
					<span style={styles.patternIcon}>🔄</span>
					<span style={styles.patternText}>
						<strong>{repeatingPattern}()</strong> keeps calling itself without reaching a base case
					</span>
				</div>
			)}

			<div style={styles.errorBox}>
				<p style={styles.errorText}>⚠️ {errorMessage}</p>
			</div>
		</div>
	);
}
