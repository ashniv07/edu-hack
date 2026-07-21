import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CodePreviewProps {
	code: string;
	errorLine?: number;
	highlightLines?: number[];
	currentStep?: number;
	language?: string;
}

export function CodePreview({
	code,
	errorLine,
	highlightLines = [],
	currentStep,
	language = 'python',
}: CodePreviewProps) {
	const lines = useMemo(() => code.split('\n'), [code]);

	const getLineStyle = (lineNum: number): React.CSSProperties => {
		const isError = lineNum === errorLine;
		const isHighlighted = highlightLines.includes(lineNum);
		const isCurrent = lineNum === currentStep;

		if (isError) {
			return {
				background: 'rgba(239, 68, 68, 0.15)',
				borderLeft: '3px solid #ef4444',
			};
		}
		if (isCurrent) {
			return {
				background: 'rgba(59, 130, 246, 0.15)',
				borderLeft: '3px solid #3b82f6',
			};
		}
		if (isHighlighted) {
			return {
				background: 'rgba(245, 158, 11, 0.1)',
				borderLeft: '3px solid #f59e0b',
			};
		}
		return {
			borderLeft: '3px solid transparent',
		};
	};

	const styles: Record<string, React.CSSProperties> = {
		container: {
			background: '#0f172a',
			borderRadius: '12px',
			overflow: 'hidden',
			fontFamily: '"Fira Code", "Cascadia Code", monospace',
			fontSize: '13px',
			lineHeight: 1.6,
		},
		header: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			padding: '10px 16px',
			background: '#1e293b',
			borderBottom: '1px solid #334155',
		},
		headerLeft: {
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
		},
		dot: {
			width: '10px',
			height: '10px',
			borderRadius: '50%',
		},
		fileName: {
			color: '#94a3b8',
			fontSize: '12px',
			marginLeft: '8px',
		},
		languageBadge: {
			padding: '2px 8px',
			borderRadius: '4px',
			background: '#334155',
			color: '#94a3b8',
			fontSize: '10px',
			textTransform: 'uppercase' as const,
			fontWeight: 600,
		},
		codeArea: {
			padding: '16px 0',
			overflowX: 'auto',
			maxHeight: '400px',
			overflowY: 'auto',
		},
		line: {
			display: 'flex',
			padding: '2px 16px 2px 12px',
			transition: 'background 0.2s ease',
		},
		lineNumber: {
			color: '#475569',
			minWidth: '40px',
			textAlign: 'right' as const,
			paddingRight: '16px',
			userSelect: 'none' as const,
		},
		lineContent: {
			color: '#e2e8f0',
			flex: 1,
			whiteSpace: 'pre' as const,
		},
		errorIndicator: {
			position: 'absolute' as const,
			right: '16px',
			display: 'flex',
			alignItems: 'center',
			gap: '4px',
			color: '#ef4444',
			fontSize: '11px',
			fontWeight: 600,
		},
		legend: {
			display: 'flex',
			gap: '16px',
			padding: '10px 16px',
			background: '#1e293b',
			borderTop: '1px solid #334155',
		},
		legendItem: {
			display: 'flex',
			alignItems: 'center',
			gap: '6px',
			fontSize: '11px',
			color: '#94a3b8',
		},
		legendDot: {
			width: '8px',
			height: '8px',
			borderRadius: '2px',
		},
	};

	// Simple syntax highlighting
	const highlightSyntax = (line: string): React.ReactNode => {
		// Keywords
		const keywords = /\b(def|class|if|else|elif|for|while|return|import|from|try|except|finally|with|as|raise|pass|break|continue|and|or|not|in|is|None|True|False|lambda|yield|global|nonlocal|assert|del)\b/g;
		// Strings
		const strings = /(["'])(?:(?=(\\?))\2.)*?\1/g;
		// Numbers
		const numbers = /\b(\d+\.?\d*)\b/g;
		// Comments
		const comments = /(#.*$)/g;
		// Functions
		const functions = /\b([a-zA-Z_]\w*)\s*(?=\()/g;

		let result = line;

		// Replace comments first (highest priority)
		result = result.replace(comments, '<span style="color:#6b7280;font-style:italic">$1</span>');
		// Strings
		result = result.replace(strings, '<span style="color:#22c55e">$&</span>');
		// Keywords
		result = result.replace(keywords, '<span style="color:#c084fc;font-weight:500">$1</span>');
		// Functions
		result = result.replace(functions, '<span style="color:#60a5fa">$1</span>');
		// Numbers
		result = result.replace(numbers, '<span style="color:#f59e0b">$1</span>');

		return <span dangerouslySetInnerHTML={{ __html: result }} />;
	};

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<div style={styles.headerLeft}>
					<div style={{ ...styles.dot, background: '#ef4444' }} />
					<div style={{ ...styles.dot, background: '#f59e0b' }} />
					<div style={{ ...styles.dot, background: '#22c55e' }} />
					<span style={styles.fileName}>source.{language}</span>
				</div>
				<span style={styles.languageBadge}>{language}</span>
			</div>

			<div style={styles.codeArea}>
				{lines.map((line, idx) => {
					const lineNum = idx + 1;
					const isError = lineNum === errorLine;

					return (
						<motion.div
							key={idx}
							style={{ ...styles.line, ...getLineStyle(lineNum), position: 'relative' }}
							initial={isError ? { x: -10, opacity: 0 } : {}}
							animate={isError ? { x: 0, opacity: 1 } : {}}
							transition={{ delay: idx * 0.02 }}
						>
							<span style={{
								...styles.lineNumber,
								color: isError ? '#ef4444' : lineNum === currentStep ? '#3b82f6' : '#475569',
								fontWeight: isError || lineNum === currentStep ? 600 : 400,
							}}>
								{lineNum}
							</span>
							<span style={styles.lineContent}>
								{highlightSyntax(line)}
							</span>
							{isError && (
								<motion.span
									style={styles.errorIndicator}
									initial={{ opacity: 0, x: 10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.3 }}
								>
									← Error here
								</motion.span>
							)}
						</motion.div>
					);
				})}
			</div>

			<div style={styles.legend}>
				<div style={styles.legendItem}>
					<div style={{ ...styles.legendDot, background: '#ef4444' }} />
					<span>Error Line</span>
				</div>
				<div style={styles.legendItem}>
					<div style={{ ...styles.legendDot, background: '#3b82f6' }} />
					<span>Current Step</span>
				</div>
				<div style={styles.legendItem}>
					<div style={{ ...styles.legendDot, background: '#f59e0b' }} />
					<span>Related Code</span>
				</div>
			</div>
		</div>
	);
}
