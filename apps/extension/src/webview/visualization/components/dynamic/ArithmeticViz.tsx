import React from 'react';
import { motion } from 'framer-motion';
import type { ArithmeticVisualization } from '../../../../tutor/types';

interface ArithmeticVizProps {
	data: ArithmeticVisualization;
}

export function ArithmeticViz({ data }: ArithmeticVizProps) {
	const { expression, operands, operator, errorMessage } = data;

	const styles: Record<string, React.CSSProperties> = {
		container: {
			display: 'flex',
			flexDirection: 'column',
			gap: '24px',
			alignItems: 'center',
		},
		expressionBox: {
			fontFamily: 'monospace',
			fontSize: '20px',
			padding: '16px 32px',
			background: 'rgba(30, 41, 59, 0.5)',
			borderRadius: '12px',
			color: '#e2e8f0',
		},
		visualSection: {
			display: 'flex',
			alignItems: 'center',
			gap: '24px',
		},
		operandBox: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '8px',
		},
		operandLabel: {
			fontSize: '11px',
			color: '#94a3b8',
			textTransform: 'uppercase' as const,
		},
		operandValue: {
			width: '80px',
			height: '80px',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: '12px',
			fontFamily: 'monospace',
			fontSize: '24px',
			fontWeight: 700,
		},
		operandName: {
			fontSize: '12px',
			marginTop: '4px',
		},
		operatorSymbol: {
			fontSize: '32px',
			fontWeight: 700,
			width: '60px',
			height: '60px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: '50%',
		},
		equals: {
			fontSize: '28px',
			color: '#64748b',
		},
		resultBox: {
			width: '100px',
			height: '100px',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: '16px',
			border: '3px dashed #ef4444',
			background: 'rgba(239, 68, 68, 0.1)',
		},
		resultIcon: {
			fontSize: '32px',
		},
		resultText: {
			fontSize: '12px',
			color: '#ef4444',
			fontWeight: 600,
		},
		explanationBox: {
			display: 'flex',
			flexDirection: 'column',
			gap: '12px',
			padding: '16px',
			background: 'rgba(245, 158, 11, 0.1)',
			border: '1px solid rgba(245, 158, 11, 0.3)',
			borderRadius: '12px',
			width: '100%',
		},
		explanationTitle: {
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
			fontSize: '14px',
			fontWeight: 600,
			color: '#f59e0b',
		},
		explanationText: {
			fontSize: '13px',
			color: '#fcd34d',
			lineHeight: 1.6,
		},
		mathSymbol: {
			fontFamily: 'serif',
			fontStyle: 'italic',
		},
		errorBox: {
			background: 'rgba(239, 68, 68, 0.1)',
			border: '1px solid rgba(239, 68, 68, 0.3)',
			borderRadius: '8px',
			padding: '12px 16px',
			width: '100%',
		},
		errorText: {
			color: '#ef4444',
			fontSize: '13px',
			margin: 0,
		},
	};

	return (
		<div style={styles.container}>
			<motion.div
				style={styles.expressionBox}
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				{expression}
			</motion.div>

			<div style={styles.visualSection}>
				{operands.map((op, idx) => (
					<React.Fragment key={op.name}>
						{idx > 0 && (
							<motion.div
								style={{
									...styles.operatorSymbol,
									background: 'rgba(239, 68, 68, 0.2)',
									color: '#ef4444',
								}}
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.3 }}
							>
								{operator}
							</motion.div>
						)}
						<motion.div
							style={styles.operandBox}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: idx * 0.2 }}
						>
							<span style={styles.operandLabel}>{idx === 0 ? 'Dividend' : 'Divisor'}</span>
							<motion.div
								style={{
									...styles.operandValue,
									background: op.isZero ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
									border: `2px solid ${op.isZero ? '#ef4444' : '#3b82f6'}`,
									color: op.isZero ? '#ef4444' : '#3b82f6',
								}}
								animate={op.isZero ? { scale: [1, 1.05, 1] } : {}}
								transition={{ repeat: Infinity, duration: 1.5 }}
							>
								{op.value}
								<span style={styles.operandName}>{op.name}</span>
							</motion.div>
						</motion.div>
					</React.Fragment>
				))}

				<motion.span
					style={styles.equals}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					=
				</motion.span>

				<motion.div
					style={styles.resultBox}
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.6 }}
				>
					<motion.span
						style={styles.resultIcon}
						animate={{ rotate: [0, 10, -10, 0] }}
						transition={{ repeat: Infinity, duration: 2 }}
					>
						💥
					</motion.span>
					<span style={styles.resultText}>UNDEFINED</span>
				</motion.div>
			</div>

			<div style={styles.explanationBox}>
				<div style={styles.explanationTitle}>
					<span>📚</span>
					<span>Why can't we divide by zero?</span>
				</div>
				<div style={styles.explanationText}>
					Division asks: "How many times does the divisor fit into the dividend?"
					<br /><br />
					If the divisor is <strong>0</strong>, we're asking: "How many times does 0 fit into a number?"
					<br />
					Since 0 × <span style={styles.mathSymbol}>anything</span> = 0, there's no number that works.
					<br /><br />
					<strong>Solution:</strong> Check if the divisor is zero before dividing!
				</div>
			</div>

			<div style={styles.errorBox}>
				<p style={styles.errorText}>⚠️ {errorMessage}</p>
			</div>
		</div>
	);
}
