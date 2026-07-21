import React from 'react';
import { motion } from 'framer-motion';
import type { ScopeVisualization } from '../../../../tutor/types';

interface ScopeChainVizProps {
	data: ScopeVisualization;
}

export function ScopeChainViz({ data }: ScopeChainVizProps) {
	const { scopes, undefinedName, suggestions, errorMessage } = data;

	const styles: Record<string, React.CSSProperties> = {
		container: {
			display: 'flex',
			flexDirection: 'column',
			gap: '20px',
		},
		scopesContainer: {
			display: 'flex',
			flexDirection: 'column',
			gap: '12px',
		},
		scope: {
			borderRadius: '12px',
			overflow: 'hidden',
		},
		scopeHeader: {
			padding: '10px 16px',
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
			fontSize: '13px',
			fontWeight: 600,
		},
		scopeIcon: {
			fontSize: '14px',
		},
		scopeBody: {
			padding: '12px 16px',
			display: 'flex',
			flexDirection: 'column',
			gap: '8px',
		},
		variable: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
			padding: '6px 12px',
			borderRadius: '6px',
			fontFamily: 'monospace',
			fontSize: '12px',
		},
		varName: {
			fontWeight: 600,
		},
		varValue: {
			color: '#22c55e',
		},
		emptyScope: {
			color: '#64748b',
			fontStyle: 'italic',
			fontSize: '12px',
		},
		searchSection: {
			display: 'flex',
			flexDirection: 'column',
			gap: '12px',
			padding: '16px',
			background: 'rgba(239, 68, 68, 0.1)',
			border: '1px dashed #ef4444',
			borderRadius: '12px',
		},
		searchHeader: {
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
		},
		searchIcon: {
			fontSize: '20px',
		},
		searchText: {
			fontSize: '14px',
			color: '#ef4444',
		},
		searchName: {
			fontFamily: 'monospace',
			fontWeight: 700,
			background: 'rgba(239, 68, 68, 0.2)',
			padding: '2px 8px',
			borderRadius: '4px',
		},
		searchResult: {
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
			color: '#94a3b8',
			fontSize: '13px',
		},
		suggestionsSection: {
			display: 'flex',
			flexDirection: 'column',
			gap: '8px',
		},
		suggestionsLabel: {
			fontSize: '12px',
			color: '#94a3b8',
		},
		suggestionsList: {
			display: 'flex',
			gap: '8px',
			flexWrap: 'wrap',
		},
		suggestion: {
			padding: '6px 12px',
			borderRadius: '6px',
			fontSize: '12px',
			fontFamily: 'monospace',
			cursor: 'pointer',
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

	const getScopeColor = (type: string): { bg: string; border: string; text: string } => {
		switch (type) {
			case 'local': return { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#3b82f6' };
			case 'enclosing': return { bg: 'rgba(139, 92, 246, 0.1)', border: '#8b5cf6', text: '#8b5cf6' };
			case 'global': return { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', text: '#22c55e' };
			case 'builtin': return { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#f59e0b' };
			default: return { bg: 'rgba(100, 116, 139, 0.1)', border: '#64748b', text: '#64748b' };
		}
	};

	const getScopeIcon = (type: string): string => {
		switch (type) {
			case 'local': return '📍';
			case 'enclosing': return '📦';
			case 'global': return '🌍';
			case 'builtin': return '⚙️';
			default: return '📁';
		}
	};

	return (
		<div style={styles.container}>
			<div style={styles.scopesContainer}>
				{scopes.map((scope, idx) => {
					const colors = getScopeColor(scope.type);
					return (
						<motion.div
							key={scope.name}
							style={{
								...styles.scope,
								background: colors.bg,
								border: `1px solid ${colors.border}40`,
							}}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: idx * 0.15 }}
						>
							<div style={{ ...styles.scopeHeader, background: `${colors.border}20`, color: colors.text }}>
								<span style={styles.scopeIcon}>{getScopeIcon(scope.type)}</span>
								<span>{scope.name} Scope</span>
							</div>
							<div style={styles.scopeBody}>
								{scope.variables.length > 0 ? (
									scope.variables.map((v) => (
										<div
											key={v.name}
											style={{
												...styles.variable,
												background: `${colors.border}10`,
											}}
										>
											<span style={{ ...styles.varName, color: colors.text }}>{v.name}</span>
											<span style={{ color: '#64748b' }}>=</span>
											<span style={styles.varValue}>{v.value}</span>
										</div>
									))
								) : (
									<span style={styles.emptyScope}>No variables in this scope</span>
								)}
							</div>
						</motion.div>
					);
				})}
			</div>

			<motion.div
				style={styles.searchSection}
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: scopes.length * 0.15 }}
			>
				<div style={styles.searchHeader}>
					<motion.span
						style={styles.searchIcon}
						animate={{ rotate: [0, 15, -15, 0] }}
						transition={{ repeat: Infinity, duration: 2 }}
					>
						🔍
					</motion.span>
					<span style={styles.searchText}>
						Looking for: <span style={styles.searchName}>{undefinedName}</span>
					</span>
				</div>
				<div style={styles.searchResult}>
					<span>❌</span>
					<span>Not found in any scope!</span>
				</div>
			</motion.div>

			<div style={styles.suggestionsSection}>
				<span style={styles.suggestionsLabel}>💡 Suggestions:</span>
				<div style={styles.suggestionsList}>
					{suggestions.map((s, idx) => (
						<motion.span
							key={s}
							style={{
								...styles.suggestion,
								background: 'rgba(34, 197, 94, 0.1)',
								border: '1px solid rgba(34, 197, 94, 0.3)',
								color: '#22c55e',
							}}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: idx * 0.1 }}
							whileHover={{ scale: 1.05 }}
						>
							{s}
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
