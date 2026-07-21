import React from 'react';
import { motion } from 'framer-motion';
import type { DictVisualization } from '../../../../tutor/types';

interface DictAccessVizProps {
	data: DictVisualization;
}

export function DictAccessViz({ data }: DictAccessVizProps) {
	const { name, entries, accessedKey, availableKeys, errorMessage } = data;

	const styles: Record<string, React.CSSProperties> = {
		container: {
			display: 'flex',
			flexDirection: 'column',
			gap: '20px',
		},
		dictName: {
			fontSize: '14px',
			color: '#94a3b8',
			fontFamily: 'monospace',
		},
		dictContainer: {
			display: 'flex',
			flexDirection: 'column',
			gap: '8px',
			background: 'rgba(139, 92, 246, 0.1)',
			border: '1px solid rgba(139, 92, 246, 0.3)',
			borderRadius: '12px',
			padding: '16px',
		},
		entry: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
			padding: '8px 12px',
			borderRadius: '6px',
			fontFamily: 'monospace',
			fontSize: '13px',
		},
		key: {
			color: '#a78bfa',
			fontWeight: 600,
		},
		colon: {
			color: '#64748b',
		},
		value: {
			color: '#22c55e',
		},
		missingEntry: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
			padding: '8px 12px',
			borderRadius: '6px',
			background: 'rgba(239, 68, 68, 0.1)',
			border: '1px dashed #ef4444',
		},
		missingKey: {
			color: '#ef4444',
			fontWeight: 600,
		},
		missingValue: {
			color: '#ef4444',
			fontStyle: 'italic',
		},
		accessSection: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
			marginTop: '8px',
		},
		accessLabel: {
			fontSize: '12px',
			color: '#94a3b8',
		},
		accessCode: {
			fontFamily: 'monospace',
			fontSize: '14px',
			padding: '6px 12px',
			borderRadius: '6px',
			background: 'rgba(239, 68, 68, 0.2)',
			color: '#ef4444',
		},
		availableKeys: {
			marginTop: '12px',
		},
		keysLabel: {
			fontSize: '12px',
			color: '#94a3b8',
			marginBottom: '8px',
		},
		keysList: {
			display: 'flex',
			gap: '8px',
			flexWrap: 'wrap',
		},
		keyTag: {
			padding: '4px 10px',
			borderRadius: '4px',
			fontSize: '12px',
			fontFamily: 'monospace',
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

	return (
		<div style={styles.container}>
			<div style={styles.dictName}>{name} =</div>

			<div style={styles.dictContainer}>
				{entries.map((entry, idx) => (
					<motion.div
						key={entry.key}
						style={{
							...styles.entry,
							background: 'rgba(139, 92, 246, 0.05)',
						}}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: idx * 0.1 }}
					>
						<span style={styles.key}>"{entry.key}"</span>
						<span style={styles.colon}>:</span>
						<span style={styles.value}>{entry.value}</span>
					</motion.div>
				))}

				<motion.div
					style={styles.missingEntry}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: entries.length * 0.1 }}
				>
					<span style={styles.missingKey}>"{accessedKey}"</span>
					<span style={styles.colon}>:</span>
					<motion.span
						style={styles.missingValue}
						animate={{ opacity: [1, 0.5, 1] }}
						transition={{ repeat: Infinity, duration: 1.5 }}
					>
						??? (Key not found!)
					</motion.span>
				</motion.div>
			</div>

			<div style={styles.accessSection}>
				<span style={styles.accessLabel}>Tried to access:</span>
				<span style={styles.accessCode}>{name}["{accessedKey}"]</span>
			</div>

			<div style={styles.availableKeys}>
				<div style={styles.keysLabel}>Available keys:</div>
				<div style={styles.keysList}>
					{availableKeys.map((key) => (
						<motion.span
							key={key}
							style={{
								...styles.keyTag,
								background: 'rgba(34, 197, 94, 0.2)',
								color: '#22c55e',
							}}
							whileHover={{ scale: 1.05 }}
						>
							"{key}"
						</motion.span>
					))}
				</div>
			</div>

			<div style={styles.errorBox}>
				<p style={styles.errorText}>⚠️ {errorMessage}</p>
			</div>
		</div>
	);
}
