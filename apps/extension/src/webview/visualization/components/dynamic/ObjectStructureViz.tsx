import React from 'react';
import { motion } from 'framer-motion';
import type { ObjectVisualization } from '../../../../tutor/types';

interface ObjectStructureVizProps {
	data: ObjectVisualization;
}

export function ObjectStructureViz({ data }: ObjectStructureVizProps) {
	const { objectName, objectType, attributes, accessedAttribute, isNone, errorMessage } = data;

	const styles: Record<string, React.CSSProperties> = {
		container: {
			display: 'flex',
			flexDirection: 'column',
			gap: '20px',
		},
		objectContainer: {
			display: 'flex',
			gap: '24px',
			alignItems: 'flex-start',
		},
		variableBox: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '8px',
		},
		variableLabel: {
			fontSize: '12px',
			color: '#94a3b8',
		},
		variableValue: {
			padding: '16px 24px',
			borderRadius: '12px',
			fontFamily: 'monospace',
			fontSize: '16px',
			fontWeight: 600,
		},
		arrow: {
			display: 'flex',
			alignItems: 'center',
			fontSize: '24px',
			color: '#64748b',
			paddingTop: '30px',
		},
		objectBox: {
			flex: 1,
			borderRadius: '16px',
			overflow: 'hidden',
		},
		objectHeader: {
			padding: '12px 16px',
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
		},
		objectIcon: {
			fontSize: '18px',
		},
		objectTitle: {
			fontSize: '14px',
			fontWeight: 600,
		},
		objectBody: {
			padding: '12px',
			display: 'flex',
			flexDirection: 'column',
			gap: '6px',
		},
		attribute: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
			padding: '8px 12px',
			borderRadius: '8px',
			fontFamily: 'monospace',
			fontSize: '13px',
		},
		attrName: {
			color: '#a78bfa',
		},
		attrType: {
			color: '#64748b',
			fontSize: '11px',
		},
		attrValue: {
			marginLeft: 'auto',
			color: '#22c55e',
		},
		noneBox: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			padding: '32px',
			background: 'rgba(239, 68, 68, 0.1)',
			border: '2px dashed #ef4444',
			borderRadius: '16px',
		},
		noneIcon: {
			fontSize: '48px',
			marginBottom: '12px',
		},
		noneText: {
			color: '#ef4444',
			fontSize: '18px',
			fontWeight: 700,
			fontFamily: 'monospace',
		},
		noneSubtext: {
			color: '#f87171',
			fontSize: '12px',
			marginTop: '4px',
		},
		accessSection: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
			padding: '16px',
			background: 'rgba(239, 68, 68, 0.1)',
			borderRadius: '12px',
		},
		accessIcon: {
			fontSize: '20px',
		},
		accessText: {
			fontSize: '14px',
			color: '#f87171',
		},
		accessCode: {
			fontFamily: 'monospace',
			fontWeight: 600,
			background: 'rgba(239, 68, 68, 0.2)',
			padding: '4px 8px',
			borderRadius: '4px',
			color: '#ef4444',
		},
		missingAttr: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
			padding: '8px 12px',
			borderRadius: '8px',
			background: 'rgba(239, 68, 68, 0.1)',
			border: '1px dashed #ef4444',
		},
		missingLabel: {
			color: '#ef4444',
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
			<div style={styles.objectContainer}>
				<motion.div
					style={styles.variableBox}
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
				>
					<span style={styles.variableLabel}>Variable</span>
					<div
						style={{
							...styles.variableValue,
							background: isNone ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
							border: `2px solid ${isNone ? '#ef4444' : '#3b82f6'}`,
							color: isNone ? '#ef4444' : '#3b82f6',
						}}
					>
						{objectName}
					</div>
				</motion.div>

				<motion.div
					style={styles.arrow}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					→
				</motion.div>

				{isNone ? (
					<motion.div
						style={styles.noneBox}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.3 }}
					>
						<motion.span
							style={styles.noneIcon}
							animate={{ opacity: [1, 0.5, 1] }}
							transition={{ repeat: Infinity, duration: 1.5 }}
						>
							🚫
						</motion.span>
						<span style={styles.noneText}>None</span>
						<span style={styles.noneSubtext}>No object here!</span>
					</motion.div>
				) : (
					<motion.div
						style={{
							...styles.objectBox,
							background: 'rgba(139, 92, 246, 0.1)',
							border: '1px solid rgba(139, 92, 246, 0.3)',
						}}
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.3 }}
					>
						<div
							style={{
								...styles.objectHeader,
								background: 'rgba(139, 92, 246, 0.2)',
							}}
						>
							<span style={styles.objectIcon}>📦</span>
							<span style={{ ...styles.objectTitle, color: '#a78bfa' }}>
								{objectType}
							</span>
						</div>
						<div style={styles.objectBody}>
							{attributes.length > 0 ? (
								attributes.map((attr, idx) => (
									<motion.div
										key={attr.name}
										style={{
											...styles.attribute,
											background: 'rgba(139, 92, 246, 0.05)',
										}}
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.4 + idx * 0.1 }}
									>
										<span style={styles.attrName}>.{attr.name}</span>
										<span style={styles.attrType}>({attr.type})</span>
										{attr.value && <span style={styles.attrValue}>{attr.value}</span>}
									</motion.div>
								))
							) : (
								<span style={{ color: '#64748b', fontStyle: 'italic' }}>
									No attributes found
								</span>
							)}

							<motion.div
								style={styles.missingAttr}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.5 + attributes.length * 0.1 }}
							>
								<motion.span
									animate={{ scale: [1, 1.2, 1] }}
									transition={{ repeat: Infinity, duration: 1 }}
								>
									❌
								</motion.span>
								<span style={styles.missingLabel}>.{accessedAttribute}</span>
								<span style={{ color: '#ef4444', fontSize: '11px' }}>
									(does not exist!)
								</span>
							</motion.div>
						</div>
					</motion.div>
				)}
			</div>

			<div style={styles.accessSection}>
				<motion.span
					style={styles.accessIcon}
					animate={{ x: [0, 5, 0] }}
					transition={{ repeat: Infinity, duration: 1 }}
				>
					👆
				</motion.span>
				<span style={styles.accessText}>
					Tried to access:{' '}
					<span style={styles.accessCode}>
						{objectName}.{accessedAttribute}
					</span>
				</span>
			</div>

			<div style={styles.errorBox}>
				<p style={styles.errorText}>⚠️ {errorMessage}</p>
			</div>
		</div>
	);
}
