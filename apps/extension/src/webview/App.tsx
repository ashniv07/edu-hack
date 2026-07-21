import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TutorPanelState } from './types';
import { MemoryVisualization } from './visualization';
import { CodePreview } from './components/CodePreview';
import { StepDebugger } from './components/StepDebugger';
import { ProgressiveHints, generateHints } from './components/ProgressiveHints';
import { RetryChallenge } from './components/RetryChallenge';
import { AdaptivePuzzle } from './components/AdaptivePuzzle';
import { EducatorDashboard } from './components/EducatorDashboard';
import { theme, createStyles } from './styles/theme';

interface AppProps {
	initialState: TutorPanelState;
}

type TabId = 'overview' | 'debugger' | 'visualization' | 'hints' | 'practice' | 'dashboard';

export function App({ initialState }: AppProps) {
	const { insight, payload, codeAnalysis, agentInsights } = initialState;
	const analysisData = codeAnalysis;
	const [activeTab, setActiveTab] = useState<TabId>('overview');

	if (!payload || !insight) {
		return (
			<div style={styles.emptyPage}>
				<motion.div
					style={styles.emptyCard}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div style={styles.emptyIcon}>🎓</div>
					<h1 style={styles.emptyTitle}>AI Tutor</h1>
					<p style={styles.emptyText}>
						Run a Python or Java file to get AI-powered debugging help with interactive visualizations.
					</p>
					<div style={styles.emptySteps}>
						<div style={styles.emptyStep}>
							<span style={styles.stepNumber}>1</span>
							<span>Open a .py or .java file</span>
						</div>
						<div style={styles.emptyStep}>
							<span style={styles.stepNumber}>2</span>
							<span>Run "AI Tutor: Run Current File"</span>
						</div>
						<div style={styles.emptyStep}>
							<span style={styles.stepNumber}>3</span>
							<span>Learn from interactive visualizations</span>
						</div>
					</div>
				</motion.div>
			</div>
		);
	}

	const statusColor = insight.status === 'success' ? theme.colors.success[500]
		: insight.status === 'warning' ? theme.colors.warning[500]
		: theme.colors.error[500];

	// Generate debug steps from operations
	const debugSteps = analysisData?.memoryModel?.operations.map((op, idx) => ({
		line: op.line,
		description: `${op.kind.charAt(0).toUpperCase() + op.kind.slice(1)} "${op.target}"`,
		variables: analysisData.memoryModel.variables
			.filter(v => v.declaredLine <= op.line)
			.map(v => ({
				name: v.name,
				value: v.value || (v.initialized ? '...' : 'undefined'),
				type: v.type,
				changed: op.target === v.name,
			})),
		isError: op.line === analysisData.errorLine,
		errorMessage: op.line === analysisData.errorLine ? insight.primaryIssue?.message : undefined,
	})) || [];

	// Generate hints
	const hints = generateHints(
		analysisData?.concept || 'unknown',
		insight.primaryIssue?.message || ''
	);

	const [showRetryChallenge, setShowRetryChallenge] = useState(false);
	const [hintsViewed, setHintsViewed] = useState(false);

	const tabs: { id: TabId; label: string; icon: string }[] = [
		{ id: 'overview', label: 'Overview', icon: '📋' },
		{ id: 'debugger', label: 'Debugger', icon: '🔍' },
		{ id: 'visualization', label: 'Visualization', icon: '📊' },
		{ id: 'hints', label: 'Hints', icon: '💡' },
		{ id: 'practice', label: 'Practice', icon: '🎯' },
		{ id: 'dashboard', label: 'Dashboard', icon: '📈' },
	];

	return (
		<div style={styles.page}>
			{/* Header */}
			<motion.header
				style={styles.header}
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<div style={styles.headerContent}>
					<div style={styles.headerLeft}>
						<div style={{ ...styles.statusDot, background: statusColor }} />
						<div>
							<h1 style={styles.headerTitle}>{insight.title}</h1>
							<p style={styles.headerSubtitle}>{payload.file.fileName}</p>
						</div>
					</div>
					<div style={styles.headerRight}>
						<span style={{ ...createStyles.badge(insight.status === 'success' ? 'success' : 'error') }}>
							{payload.file.language.toUpperCase()}
						</span>
						{analysisData?.concept && (
							<span style={createStyles.badge('primary')}>
								{analysisData.concept.replace(/_/g, ' ')}
							</span>
						)}
					</div>
				</div>

				{/* Tab Navigation */}
				<nav style={styles.tabNav}>
					{tabs.map((tab) => (
						<motion.button
							key={tab.id}
							style={{
								...styles.tab,
								...(activeTab === tab.id ? styles.tabActive : {}),
							}}
							onClick={() => setActiveTab(tab.id)}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<span>{tab.icon}</span>
							<span>{tab.label}</span>
						</motion.button>
					))}
				</nav>
			</motion.header>

			{/* Main Content */}
			<main style={styles.main}>
				<AnimatePresence mode="wait">
					{activeTab === 'overview' && (
						<motion.div
							key="overview"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							style={styles.tabContent}
						>
							{/* Summary Card */}
							<div style={{ ...createStyles.card('elevated'), marginBottom: theme.spacing[5] }}>
								<p style={createStyles.text('body')}>{insight.summary}</p>
							</div>

							{/* Error Details */}
							{insight.primaryIssue && (
								<div style={styles.errorCard}>
									<div style={styles.errorHeader}>
										<span style={styles.errorIcon}>⚠️</span>
										<span style={styles.errorType}>{insight.primaryIssue.exceptionType}</span>
									</div>
									<p style={styles.errorMessage}>{insight.primaryIssue.message}</p>
									<div style={styles.errorLocation}>
										Line {insight.primaryIssue.line}, Column {insight.primaryIssue.column}
									</div>
								</div>
							)}

							{/* Code Preview */}
							{payload.source && (
								<div style={{ marginTop: theme.spacing[5] }}>
									<h3 style={styles.sectionTitle}>📝 Source Code</h3>
									<CodePreview
										code={payload.source}
										errorLine={analysisData?.errorLine}
										language={payload.file.language}
									/>
								</div>
							)}

							{/* Guided Steps */}
							<div style={{ marginTop: theme.spacing[5] }}>
								<h3 style={styles.sectionTitle}>🎯 Guided Steps</h3>
								<div style={styles.stepsList}>
									{insight.guidedSteps.map((step, idx) => (
										<motion.div
											key={idx}
											style={styles.guidedStep}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: idx * 0.1 }}
										>
											<span style={styles.guidedStepNumber}>{idx + 1}</span>
											<span style={styles.guidedStepText}>{step}</span>
										</motion.div>
									))}
								</div>
							</div>

							{/* Agent Insights */}
							{agentInsights && (
								<div style={{ marginTop: theme.spacing[5] }}>
									<h3 style={styles.sectionTitle}>🤖 AI Analysis</h3>
									<div style={styles.insightsGrid}>
										<div style={createStyles.card()}>
											<div style={styles.insightLabel}>Learning Concept</div>
											<div style={styles.insightValue}>
												{agentInsights.errorAnalysis.concept.replace(/_/g, ' ')}
											</div>
										</div>
										<div style={createStyles.card()}>
											<div style={styles.insightLabel}>Confidence</div>
											<div style={styles.insightValue}>
												{Math.round(agentInsights.errorAnalysis.confidence * 100)}%
											</div>
										</div>
										<div style={createStyles.card()}>
											<div style={styles.insightLabel}>Difficulty</div>
											<div style={styles.insightValue}>
												{agentInsights.errorAnalysis.difficulty}
											</div>
										</div>
										<div style={createStyles.card()}>
											<div style={styles.insightLabel}>Mode</div>
											<div style={styles.insightValue}>
												{agentInsights.agentRun.mode}
											</div>
										</div>
									</div>
									{agentInsights.errorAnalysis.misconception && (
										<div style={{ ...createStyles.card(), marginTop: theme.spacing[3] }}>
											<div style={styles.insightLabel}>Common Misconception</div>
											<p style={createStyles.text('body')}>
												{agentInsights.errorAnalysis.misconception}
											</p>
										</div>
									)}
								</div>
							)}
						</motion.div>
					)}

					{activeTab === 'debugger' && (
						<motion.div
							key="debugger"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							style={styles.tabContent}
						>
							{debugSteps.length > 0 ? (
								<StepDebugger
									code={payload.source}
									steps={debugSteps}
									errorLine={analysisData?.errorLine}
								/>
							) : (
								<div style={styles.emptyState}>
									<span style={{ fontSize: '48px' }}>🔍</span>
									<p>No debug steps available for this code.</p>
								</div>
							)}
						</motion.div>
					)}

					{activeTab === 'visualization' && (
						<motion.div
							key="visualization"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							style={styles.tabContent}
						>
							{analysisData && (analysisData.memoryModel || analysisData.visualization) ? (
								<MemoryVisualization
									memoryModel={analysisData.memoryModel}
									errorLine={analysisData.errorLine}
									concept={analysisData.concept}
									visualization={analysisData.visualization}
								/>
							) : (
								<div style={styles.emptyState}>
									<span style={{ fontSize: '48px' }}>📊</span>
									<p>No visualization data available.</p>
								</div>
							)}
						</motion.div>
					)}

					{activeTab === 'hints' && (
						<motion.div
							key="hints"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							style={styles.tabContent}
						>
							<ProgressiveHints
								hints={hints}
								concept={analysisData?.concept}
								onHintViewed={() => setHintsViewed(true)}
							/>

							{/* Quiz Section */}
							{agentInsights?.quiz && (
								<div style={{ marginTop: theme.spacing[5] }}>
									<h3 style={styles.sectionTitle}>🧠 Check Your Understanding</h3>
									<div style={createStyles.card('elevated')}>
										<p style={{ ...createStyles.text('subtitle'), marginBottom: theme.spacing[4] }}>
											{agentInsights.quiz.question}
										</p>
										<div style={styles.quizOptions}>
											{agentInsights.quiz.choices.map((choice, idx) => (
												<motion.button
													key={idx}
													style={styles.quizOption}
													whileHover={{ scale: 1.02, borderColor: theme.colors.primary[500] }}
													whileTap={{ scale: 0.98 }}
												>
													<span style={styles.quizOptionLetter}>
														{String.fromCharCode(65 + idx)}
													</span>
													<span>{choice}</span>
												</motion.button>
											))}
										</div>
									</div>
								</div>
							)}

							{/* Analogy Section */}
							{agentInsights?.analogy && (
								<div style={{ marginTop: theme.spacing[5] }}>
									<h3 style={styles.sectionTitle}>💭 Think of it Like...</h3>
									<div style={{
										...createStyles.card(),
										background: `linear-gradient(135deg, ${theme.colors.secondary[900]}40, ${theme.colors.primary[900]}40)`,
										border: `1px solid ${theme.colors.secondary[700]}40`,
									}}>
										<p style={{ ...createStyles.text('body'), fontSize: '15px' }}>
											{agentInsights.analogy.analogy}
										</p>
									</div>
								</div>
							)}

							{/* Retry Challenge Prompt */}
							{hintsViewed && !showRetryChallenge && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									style={{ marginTop: theme.spacing[5] }}
								>
									<div style={styles.challengePrompt}>
										<span style={{ fontSize: '24px' }}>🎯</span>
										<div>
											<h4 style={styles.challengeTitle}>Ready to Test Your Understanding?</h4>
											<p style={styles.challengeText}>
												Now that you've reviewed the hints, try our interactive challenge!
											</p>
										</div>
										<motion.button
											style={styles.challengeButton}
											onClick={() => setShowRetryChallenge(true)}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											Start Challenge
										</motion.button>
									</div>
								</motion.div>
							)}

							{/* Retry Challenge Component */}
							{showRetryChallenge && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									style={{ marginTop: theme.spacing[5] }}
								>
									<RetryChallenge
										errorType={insight.primaryIssue?.exceptionType || 'Error'}
										errorLine={analysisData?.errorLine || 1}
										originalCode={payload.source}
										onRetryComplete={(success, attempts) => {
											console.log(`Challenge completed: ${success ? 'Success' : 'Failed'} in ${attempts} attempts`);
										}}
										onSkip={() => setShowRetryChallenge(false)}
									/>
								</motion.div>
							)}
						</motion.div>
					)}

					{activeTab === 'practice' && (
						<motion.div
							key="practice"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							style={styles.tabContent}
						>
							<h3 style={styles.sectionTitle}>🎮 Interactive Practice</h3>
							<p style={{ ...createStyles.text('body'), marginBottom: theme.spacing[4] }}>
								Reinforce your understanding with adaptive puzzles tailored to your skill level.
							</p>

							<AdaptivePuzzle
								concept={analysisData?.concept || 'debugging'}
								errorType={insight.primaryIssue?.exceptionType || 'Error'}
								codeContext={payload.source}
								onComplete={(result) => {
									console.log('Puzzle result:', result);
								}}
							/>

							{/* Practice Tips */}
							<div style={{ marginTop: theme.spacing[6] }}>
								<h4 style={styles.sectionTitle}>💡 Learning Tips</h4>
								<div style={styles.tipsGrid}>
									<div style={styles.tipCard}>
										<span style={styles.tipIcon}>🔄</span>
										<div>
											<h5 style={styles.tipTitle}>Practice Regularly</h5>
											<p style={styles.tipText}>
												Complete puzzles after each error to reinforce concepts.
											</p>
										</div>
									</div>
									<div style={styles.tipCard}>
										<span style={styles.tipIcon}>📈</span>
										<div>
											<h5 style={styles.tipTitle}>Track Progress</h5>
											<p style={styles.tipText}>
												Your skill level adapts based on your performance.
											</p>
										</div>
									</div>
									<div style={styles.tipCard}>
										<span style={styles.tipIcon}>🎯</span>
										<div>
											<h5 style={styles.tipTitle}>Focus on Weak Areas</h5>
											<p style={styles.tipText}>
												The system identifies concepts you need to practice more.
											</p>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					)}

					{activeTab === 'dashboard' && (
						<motion.div
							key="dashboard"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							style={styles.tabContent}
						>
							<EducatorDashboard isDemo={true} />
						</motion.div>
					)}
				</AnimatePresence>
			</main>

			{/* Footer */}
			<footer style={styles.footer}>
				<div style={styles.footerContent}>
					<span style={styles.footerText}>
						Exit code: {payload.runtime.exitCode ?? 'unknown'}
					</span>
					<span style={styles.footerDivider}>•</span>
					<span style={styles.footerText}>
						{payload.runtime.stackFrames.length} stack frame(s)
					</span>
				</div>
			</footer>
		</div>
	);
}

// Styles
const styles: Record<string, React.CSSProperties> = {
	page: {
		minHeight: '100vh',
		background: theme.gradients.dark,
		color: theme.colors.neutral[100],
		fontFamily: theme.typography.fontFamily.sans,
		display: 'flex',
		flexDirection: 'column',
	},
	header: {
		background: theme.colors.neutral[900],
		borderBottom: `1px solid ${theme.colors.neutral[800]}`,
		position: 'sticky',
		top: 0,
		zIndex: theme.zIndex.dropdown,
	},
	headerContent: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: `${theme.spacing[4]} ${theme.spacing[5]}`,
	},
	headerLeft: {
		display: 'flex',
		alignItems: 'center',
		gap: theme.spacing[3],
	},
	statusDot: {
		width: '12px',
		height: '12px',
		borderRadius: theme.radius.full,
		boxShadow: '0 0 10px currentColor',
	},
	headerTitle: {
		fontSize: theme.typography.fontSize.lg,
		fontWeight: theme.typography.fontWeight.semibold,
		color: theme.colors.neutral[50],
		margin: 0,
	},
	headerSubtitle: {
		fontSize: theme.typography.fontSize.sm,
		color: theme.colors.neutral[400],
		margin: 0,
	},
	headerRight: {
		display: 'flex',
		gap: theme.spacing[2],
	},
	tabNav: {
		display: 'flex',
		gap: theme.spacing[1],
		padding: `0 ${theme.spacing[5]} ${theme.spacing[3]}`,
	},
	tab: {
		display: 'flex',
		alignItems: 'center',
		gap: theme.spacing[2],
		padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
		border: 'none',
		borderRadius: theme.radius.lg,
		background: 'transparent',
		color: theme.colors.neutral[400],
		fontSize: theme.typography.fontSize.sm,
		fontWeight: theme.typography.fontWeight.medium,
		cursor: 'pointer',
		transition: `all ${theme.animation.duration.fast}`,
	},
	tabActive: {
		background: theme.colors.neutral[800],
		color: theme.colors.neutral[50],
	},
	main: {
		flex: 1,
		padding: theme.spacing[5],
		overflowY: 'auto',
	},
	tabContent: {
		maxWidth: '1200px',
		margin: '0 auto',
	},
	sectionTitle: {
		fontSize: theme.typography.fontSize.base,
		fontWeight: theme.typography.fontWeight.semibold,
		color: theme.colors.neutral[200],
		marginBottom: theme.spacing[3],
		display: 'flex',
		alignItems: 'center',
		gap: theme.spacing[2],
	},
	errorCard: {
		background: `${theme.colors.error[900]}30`,
		border: `1px solid ${theme.colors.error[700]}50`,
		borderRadius: theme.radius.xl,
		padding: theme.spacing[5],
	},
	errorHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: theme.spacing[2],
		marginBottom: theme.spacing[2],
	},
	errorIcon: {
		fontSize: '20px',
	},
	errorType: {
		fontSize: theme.typography.fontSize.lg,
		fontWeight: theme.typography.fontWeight.semibold,
		color: theme.colors.error[400],
	},
	errorMessage: {
		fontSize: theme.typography.fontSize.base,
		color: theme.colors.error[300],
		margin: `0 0 ${theme.spacing[3]} 0`,
		fontFamily: theme.typography.fontFamily.mono,
	},
	errorLocation: {
		fontSize: theme.typography.fontSize.sm,
		color: theme.colors.error[500],
	},
	stepsList: {
		display: 'flex',
		flexDirection: 'column',
		gap: theme.spacing[2],
	},
	guidedStep: {
		display: 'flex',
		alignItems: 'flex-start',
		gap: theme.spacing[3],
		padding: theme.spacing[3],
		background: theme.colors.neutral[800],
		borderRadius: theme.radius.lg,
		border: `1px solid ${theme.colors.neutral[700]}`,
	},
	guidedStepNumber: {
		width: '24px',
		height: '24px',
		borderRadius: theme.radius.full,
		background: theme.gradients.primary,
		color: '#ffffff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: theme.typography.fontSize.sm,
		fontWeight: theme.typography.fontWeight.bold,
		flexShrink: 0,
	},
	guidedStepText: {
		fontSize: theme.typography.fontSize.base,
		color: theme.colors.neutral[300],
		lineHeight: theme.typography.lineHeight.relaxed,
	},
	insightsGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
		gap: theme.spacing[3],
	},
	insightLabel: {
		fontSize: theme.typography.fontSize.xs,
		color: theme.colors.neutral[500],
		textTransform: 'uppercase',
		letterSpacing: '0.05em',
		marginBottom: theme.spacing[1],
	},
	insightValue: {
		fontSize: theme.typography.fontSize.lg,
		fontWeight: theme.typography.fontWeight.semibold,
		color: theme.colors.neutral[100],
		textTransform: 'capitalize',
	},
	quizOptions: {
		display: 'flex',
		flexDirection: 'column',
		gap: theme.spacing[2],
	},
	quizOption: {
		display: 'flex',
		alignItems: 'center',
		gap: theme.spacing[3],
		padding: theme.spacing[3],
		background: theme.colors.neutral[900],
		border: `1px solid ${theme.colors.neutral[700]}`,
		borderRadius: theme.radius.lg,
		color: theme.colors.neutral[200],
		fontSize: theme.typography.fontSize.base,
		textAlign: 'left',
		cursor: 'pointer',
		transition: `all ${theme.animation.duration.fast}`,
	},
	quizOptionLetter: {
		width: '28px',
		height: '28px',
		borderRadius: theme.radius.md,
		background: theme.colors.neutral[800],
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontWeight: theme.typography.fontWeight.semibold,
		color: theme.colors.primary[400],
	},
	footer: {
		padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
		borderTop: `1px solid ${theme.colors.neutral[800]}`,
		background: theme.colors.neutral[900],
	},
	footerContent: {
		display: 'flex',
		alignItems: 'center',
		gap: theme.spacing[2],
	},
	footerText: {
		fontSize: theme.typography.fontSize.sm,
		color: theme.colors.neutral[500],
	},
	footerDivider: {
		color: theme.colors.neutral[700],
	},
	emptyPage: {
		minHeight: '100vh',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		background: theme.gradients.dark,
		padding: theme.spacing[5],
	},
	emptyCard: {
		...createStyles.card('elevated'),
		maxWidth: '400px',
		textAlign: 'center',
		padding: theme.spacing[8],
	},
	emptyIcon: {
		fontSize: '64px',
		marginBottom: theme.spacing[4],
	},
	emptyTitle: {
		fontSize: theme.typography.fontSize['2xl'],
		fontWeight: theme.typography.fontWeight.bold,
		color: theme.colors.neutral[50],
		margin: `0 0 ${theme.spacing[2]} 0`,
	},
	emptyText: {
		fontSize: theme.typography.fontSize.base,
		color: theme.colors.neutral[400],
		margin: `0 0 ${theme.spacing[6]} 0`,
		lineHeight: theme.typography.lineHeight.relaxed,
	},
	emptySteps: {
		display: 'flex',
		flexDirection: 'column',
		gap: theme.spacing[3],
		textAlign: 'left',
	},
	emptyStep: {
		display: 'flex',
		alignItems: 'center',
		gap: theme.spacing[3],
		color: theme.colors.neutral[300],
		fontSize: theme.typography.fontSize.sm,
	},
	stepNumber: {
		width: '24px',
		height: '24px',
		borderRadius: theme.radius.full,
		background: theme.colors.primary[600],
		color: '#ffffff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: theme.typography.fontSize.sm,
		fontWeight: theme.typography.fontWeight.bold,
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		padding: theme.spacing[12],
		color: theme.colors.neutral[500],
		textAlign: 'center',
	},
	challengePrompt: {
		display: 'flex',
		alignItems: 'center',
		gap: theme.spacing[4],
		padding: theme.spacing[4],
		background: `linear-gradient(135deg, ${theme.colors.primary[900]}40, ${theme.colors.secondary[900]}40)`,
		borderRadius: theme.radius.xl,
		border: `1px solid ${theme.colors.primary[700]}40`,
	},
	challengeTitle: {
		color: theme.colors.neutral[100],
		fontSize: theme.typography.fontSize.base,
		fontWeight: theme.typography.fontWeight.semibold,
		margin: 0,
	},
	challengeText: {
		color: theme.colors.neutral[400],
		fontSize: theme.typography.fontSize.sm,
		margin: 0,
	},
	challengeButton: {
		background: theme.gradients.primary,
		color: '#ffffff',
		border: 'none',
		borderRadius: theme.radius.lg,
		padding: `${theme.spacing[3]} ${theme.spacing[5]}`,
		fontSize: theme.typography.fontSize.sm,
		fontWeight: theme.typography.fontWeight.semibold,
		cursor: 'pointer',
		whiteSpace: 'nowrap',
	},
	tipsGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
		gap: theme.spacing[3],
	},
	tipCard: {
		display: 'flex',
		gap: theme.spacing[3],
		padding: theme.spacing[4],
		background: theme.colors.neutral[800],
		borderRadius: theme.radius.lg,
		border: `1px solid ${theme.colors.neutral[700]}`,
	},
	tipIcon: {
		fontSize: '24px',
		flexShrink: 0,
	},
	tipTitle: {
		color: theme.colors.neutral[100],
		fontSize: theme.typography.fontSize.sm,
		fontWeight: theme.typography.fontWeight.semibold,
		margin: `0 0 ${theme.spacing[1]} 0`,
	},
	tipText: {
		color: theme.colors.neutral[400],
		fontSize: theme.typography.fontSize.xs,
		margin: 0,
		lineHeight: theme.typography.lineHeight.relaxed,
	},
};
