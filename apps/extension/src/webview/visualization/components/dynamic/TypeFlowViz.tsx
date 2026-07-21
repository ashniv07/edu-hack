import React from 'react';
import { motion } from 'framer-motion';
import type { TypeFlowVisualization } from '../../../../tutor/types';

interface TypeFlowVizProps {
	data: TypeFlowVisualization;
}

export function TypeFlowViz({ data }: TypeFlowVizProps) {
	const { operations, expectedType, actualType, errorMessage } = data;

	const styles: Record<string, React.CSSProperties> = {
		container: {
			display: 'flex',
			flexDirection: 'column',
			gap: '24px',
		},
		operation: {
			display: 'flex',
			flexDirection: 'column',
			gap: '12px',
		},
		expression: {
			fontFamily: 'monospace',
			fontSize: '16px',
			color: '#e2e8f0',
			padding: '12px 16px',
			background: 'rgba(30, 41, 59, 0.5)',
			borderRadius: '8px',
		},
		typeFlow: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: '16px',
		},
		typeBox: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '6px',
		},
		typeLabel: {
			fontSize: '10px',
			color: '#64748b',
			textTransform: 'uppercase' as const,
		},
		typeBadge: {
			padding: '8px 16px',
			borderRadius: '8px',
			fontFamily: 'monospace',
			fontSize: '14px',
			fontWeight: 600,
		},
		operator: {
			fontSize: '24px',
			fontWeight: 700,
			padding: '8px 16px',
			borderRadius: '8px',
		},
		arrow: {
			fontSize: '20px',
			color: '#64748b',
		},
		resultBox: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '8px',
			padding: '16px',
			borderRadius: '8px',
			border: '2px dashed',
		},
		comparisonSection: {
			display: 'flex',
			gap: '24px',
			justifyContent: 'center',
		},
		comparisonItem: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '8px',
		},
		comparisonLabel: {
			fontSize: '11px',
			color: '#94a3b8',
			textTransform: 'uppercase' as const,
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

	const getTypeColor = (type: string, isError: boolean): string => {
		if (isError) return '#ef4444';
		if (type === 'int' || type === 'float') return '#3b82f6';
		if (type === 'str') return '#22c55e';
		if (type === 'bool') return '#f59e0b';
		if (type === 'NoneType') return '#ef4444';
		return '#a78bfa';
	};

	return (
		<div style={styles.container}>
			{operations.map((op, idx) => (
				<motion.div
					key={idx}
					style={styles.operation}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: idx * 0.2 }}
				>
					<div style={styles.expression}>
						Line {op.line}: <span style={{ color: '#f59e0b' }}>{op.expression}</span>
					</div>

					<div style={styles.typeFlow}>
						<div style={styles.typeBox}>
							<span style={styles.typeLabel}>Left operand</span>
							<motion.span
								style={{
									...styles.typeBadge,
									background: `${getTypeColor(op.leftType, op.isError)}20`,
									color: getTypeColor(op.leftType, op.isError),
									border: `1px solid ${getTypeColor(op.leftType, op.isError)}`,
								}}
								whileHover={{ scale: 1.05 }}
							>
								{op.leftType}
							</motion.span>
						</div>

						<motion.div
							style={{
								...styles.operator,
								background: op.isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
								color: op.isError ? '#ef4444' : '#94a3b8',
							}}
							animate={op.isError ? { scale: [1, 1.1, 1] } : {}}
							transition={{ repeat: Infinity, duration: 1.5 }}
						>
							{op.operator}
						</motion.div>

						<div style={styles.typeBox}>
							<span style={styles.typeLabel}>Right operand</span>
							<motion.span
								style={{
									...styles.typeBadge,
									background: `${getTypeColor(op.rightType, op.isError)}20`,
									color: getTypeColor(op.rightType, op.isError),
									border: `1px solid ${getTypeColor(op.rightType, op.isError)}`,
								}}
								whileHover={{ scale: 1.05 }}
							>
								{op.rightType}
							</motion.span>
						</div>

						<span style={styles.arrow}>→</span>

						<motion.div
							style={{
								...styles.resultBox,
								borderColor: op.isError ? '#ef4444' : '#22c55e',
								background: op.isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
							}}
							animate={op.isError ? { opacity: [1, 0.6, 1] } : {}}
							transition={{ repeat: Infinity, duration: 1 }}
						>
							<span style={{ fontSize: '20px' }}>{op.isError ? '❌' : '✓'}</span>
							<span style={{ fontSize: '12px', color: op.isError ? '#ef4444' : '#22c55e' }}>
								{op.isError ? 'Type Error!' : op.resultType ?? 'OK'}
							</span>
						</motion.div>
					</div>
				</motion.div>
			))}

			<div style={styles.comparisonSection}>
				<div style={styles.comparisonItem}>
					<span style={styles.comparisonLabel}>Expected</span>
					<span style={{ ...styles.typeBadge, background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>
						{expectedType}
					</span>
				</div>
				<div style={styles.comparisonItem}>
					<span style={styles.comparisonLabel}>Actual</span>
					<span style={{ ...styles.typeBadge, background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
						{actualType}
					</span>
				</div>
			</div>

			<div style={styles.errorBox}>
				<p style={styles.errorText}>⚠️ {errorMessage}</p>
			</div>
		</div>
	);
}
