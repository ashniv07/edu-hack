import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CodePreview } from './CodePreview';

interface Variable {
	name: string;
	value: string;
	type: string;
	changed?: boolean;
}

interface DebugStep {
	line: number;
	description: string;
	variables: Variable[];
	output?: string;
	isError?: boolean;
	errorMessage?: string;
}

interface StepDebuggerProps {
	code: string;
	steps: DebugStep[];
	errorLine?: number;
	onComplete?: () => void;
}

export function StepDebugger({ code, steps, errorLine, onComplete }: StepDebuggerProps) {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [playbackSpeed, setPlaybackSpeed] = useState(1);

	const currentStep = steps[currentStepIndex];
	const isAtStart = currentStepIndex === 0;
	const isAtEnd = currentStepIndex >= steps.length - 1;
	const progress = ((currentStepIndex + 1) / steps.length) * 100;

	const nextStep = useCallback(() => {
		if (!isAtEnd) {
			setCurrentStepIndex((prev) => prev + 1);
		} else {
			setIsPlaying(false);
			onComplete?.();
		}
	}, [isAtEnd, onComplete]);

	const prevStep = useCallback(() => {
		if (!isAtStart) {
			setCurrentStepIndex((prev) => prev - 1);
		}
	}, [isAtStart]);

	const reset = useCallback(() => {
		setCurrentStepIndex(0);
		setIsPlaying(false);
	}, []);

	const togglePlay = useCallback(() => {
		if (isAtEnd) {
			setCurrentStepIndex(0);
		}
		setIsPlaying((prev) => !prev);
	}, [isAtEnd]);

	// Auto-advance when playing
	React.useEffect(() => {
		if (!isPlaying) return;

		const interval = setInterval(() => {
			nextStep();
		}, 2000 / playbackSpeed);

		return () => clearInterval(interval);
	}, [isPlaying, playbackSpeed, nextStep]);

	const styles: Record<string, React.CSSProperties> = {
		container: {
			display: 'flex',
			flexDirection: 'column',
			gap: '20px',
		},
		header: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		title: {
			fontSize: '16px',
			fontWeight: 600,
			color: '#e2e8f0',
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
		},
		stepBadge: {
			padding: '4px 10px',
			borderRadius: '12px',
			background: 'rgba(59, 130, 246, 0.2)',
			color: '#3b82f6',
			fontSize: '12px',
			fontWeight: 600,
		},
		mainContent: {
			display: 'grid',
			gridTemplateColumns: '1fr 300px',
			gap: '20px',
		},
		codeSection: {
			flex: 1,
		},
		sidebar: {
			display: 'flex',
			flexDirection: 'column',
			gap: '16px',
		},
		panel: {
			background: '#1e293b',
			borderRadius: '12px',
			overflow: 'hidden',
		},
		panelHeader: {
			padding: '12px 16px',
			background: '#334155',
			fontSize: '12px',
			fontWeight: 600,
			color: '#94a3b8',
			textTransform: 'uppercase' as const,
			letterSpacing: '0.05em',
		},
		panelBody: {
			padding: '12px 16px',
		},
		variableList: {
			display: 'flex',
			flexDirection: 'column',
			gap: '8px',
		},
		variable: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			padding: '8px 12px',
			borderRadius: '8px',
			fontFamily: 'monospace',
			fontSize: '12px',
		},
		varName: {
			color: '#a78bfa',
			fontWeight: 600,
		},
		varValue: {
			color: '#22c55e',
		},
		varType: {
			color: '#64748b',
			fontSize: '10px',
		},
		descriptionBox: {
			padding: '16px',
			background: 'rgba(59, 130, 246, 0.1)',
			border: '1px solid rgba(59, 130, 246, 0.2)',
			borderRadius: '8px',
		},
		descriptionText: {
			color: '#93c5fd',
			fontSize: '13px',
			lineHeight: 1.6,
			margin: 0,
		},
		errorBox: {
			padding: '16px',
			background: 'rgba(239, 68, 68, 0.1)',
			border: '1px solid rgba(239, 68, 68, 0.2)',
			borderRadius: '8px',
		},
		errorText: {
			color: '#fca5a5',
			fontSize: '13px',
			lineHeight: 1.6,
			margin: 0,
		},
		outputBox: {
			background: '#0f172a',
			borderRadius: '8px',
			padding: '12px',
			fontFamily: 'monospace',
			fontSize: '12px',
			color: '#94a3b8',
			maxHeight: '100px',
			overflowY: 'auto',
		},
		controls: {
			display: 'flex',
			alignItems: 'center',
			gap: '12px',
			padding: '16px',
			background: '#1e293b',
			borderRadius: '12px',
		},
		progressContainer: {
			flex: 1,
			display: 'flex',
			flexDirection: 'column',
			gap: '8px',
		},
		progressBar: {
			height: '6px',
			background: '#334155',
			borderRadius: '3px',
			overflow: 'hidden',
		},
		progressFill: {
			height: '100%',
			background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
			borderRadius: '3px',
			transition: 'width 0.3s ease',
		},
		progressText: {
			fontSize: '11px',
			color: '#64748b',
			display: 'flex',
			justifyContent: 'space-between',
		},
		button: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: '36px',
			height: '36px',
			border: 'none',
			borderRadius: '8px',
			cursor: 'pointer',
			fontSize: '16px',
			transition: 'all 0.2s ease',
		},
		playButton: {
			width: '44px',
			height: '44px',
			background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
			color: '#ffffff',
			fontSize: '18px',
		},
		speedButton: {
			padding: '4px 10px',
			width: 'auto',
			fontSize: '11px',
			fontWeight: 600,
		},
	};

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<div style={styles.title}>
					<span>🔍</span>
					<span>Step-by-Step Debugger</span>
				</div>
				<span style={styles.stepBadge}>
					Step {currentStepIndex + 1} of {steps.length}
				</span>
			</div>

			<div style={styles.mainContent}>
				<div style={styles.codeSection}>
					<CodePreview
						code={code}
						errorLine={errorLine}
						currentStep={currentStep?.line}
						highlightLines={currentStep?.line ? [currentStep.line] : []}
					/>
				</div>

				<div style={styles.sidebar}>
					{/* Current Step Description */}
					<AnimatePresence mode="wait">
						<motion.div
							key={currentStepIndex}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							style={currentStep?.isError ? styles.errorBox : styles.descriptionBox}
						>
							<p style={currentStep?.isError ? styles.errorText : styles.descriptionText}>
								{currentStep?.isError ? '❌ ' : '📍 '}
								{currentStep?.description}
							</p>
							{currentStep?.errorMessage && (
								<p style={{ ...styles.errorText, marginTop: '8px', fontFamily: 'monospace' }}>
									{currentStep.errorMessage}
								</p>
							)}
						</motion.div>
					</AnimatePresence>

					{/* Variables Panel */}
					<div style={styles.panel}>
						<div style={styles.panelHeader}>📦 Variables</div>
						<div style={styles.panelBody}>
							<div style={styles.variableList}>
								<AnimatePresence>
									{currentStep?.variables.map((v, idx) => (
										<motion.div
											key={v.name}
											style={{
												...styles.variable,
												background: v.changed
													? 'rgba(245, 158, 11, 0.15)'
													: 'rgba(148, 163, 184, 0.05)',
												border: v.changed
													? '1px solid rgba(245, 158, 11, 0.3)'
													: '1px solid transparent',
											}}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: idx * 0.05 }}
										>
											<div>
												<span style={styles.varName}>{v.name}</span>
												<span style={styles.varType}> ({v.type})</span>
											</div>
											<span style={styles.varValue}>{v.value}</span>
										</motion.div>
									))}
								</AnimatePresence>
								{(!currentStep?.variables || currentStep.variables.length === 0) && (
									<div style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', padding: '12px' }}>
										No variables yet
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Output Panel */}
					{currentStep?.output && (
						<div style={styles.panel}>
							<div style={styles.panelHeader}>📤 Output</div>
							<div style={styles.panelBody}>
								<div style={styles.outputBox}>
									{currentStep.output}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Controls */}
			<div style={styles.controls}>
				<motion.button
					style={{ ...styles.button, background: '#334155', color: '#94a3b8' }}
					onClick={reset}
					whileHover={{ scale: 1.05, background: '#475569' }}
					whileTap={{ scale: 0.95 }}
					disabled={isAtStart}
				>
					↺
				</motion.button>

				<motion.button
					style={{ ...styles.button, background: '#334155', color: isAtStart ? '#475569' : '#94a3b8' }}
					onClick={prevStep}
					whileHover={!isAtStart ? { scale: 1.05, background: '#475569' } : {}}
					whileTap={!isAtStart ? { scale: 0.95 } : {}}
					disabled={isAtStart}
				>
					◀
				</motion.button>

				<motion.button
					style={{ ...styles.button, ...styles.playButton }}
					onClick={togglePlay}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					{isPlaying ? '⏸' : '▶'}
				</motion.button>

				<motion.button
					style={{ ...styles.button, background: '#334155', color: isAtEnd ? '#475569' : '#94a3b8' }}
					onClick={nextStep}
					whileHover={!isAtEnd ? { scale: 1.05, background: '#475569' } : {}}
					whileTap={!isAtEnd ? { scale: 0.95 } : {}}
					disabled={isAtEnd}
				>
					▶
				</motion.button>

				<div style={styles.progressContainer}>
					<div style={styles.progressBar}>
						<motion.div
							style={{ ...styles.progressFill, width: `${progress}%` }}
							initial={{ width: 0 }}
							animate={{ width: `${progress}%` }}
						/>
					</div>
					<div style={styles.progressText}>
						<span>Line {currentStep?.line || 1}</span>
						<span>{Math.round(progress)}% complete</span>
					</div>
				</div>

				<div style={{ display: 'flex', gap: '4px' }}>
					{[0.5, 1, 2].map((speed) => (
						<motion.button
							key={speed}
							style={{
								...styles.button,
								...styles.speedButton,
								background: playbackSpeed === speed ? '#3b82f6' : '#334155',
								color: playbackSpeed === speed ? '#ffffff' : '#94a3b8',
							}}
							onClick={() => setPlaybackSpeed(speed)}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							{speed}x
						</motion.button>
					))}
				</div>
			</div>
		</div>
	);
}
