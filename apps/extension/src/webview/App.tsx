import React from 'react';
import type { TutorPanelState } from './types';

interface AppProps {
	initialState: TutorPanelState;
}

export function App({ initialState }: AppProps) {
	const { insight, payload } = initialState;

	if (!payload || !insight) {
		return (
			<div style={styles.page}>
				<div style={styles.heroCard}>
					<p style={styles.eyebrow}>AI Tutor</p>
					<h1 style={styles.title}>No run data yet</h1>
					<p style={styles.summary}>
						Run a Python file with the AI Tutor command and this view will show the captured
						error, traceback, and guided debugging notes.
					</p>
				</div>
			</div>
		);
	}

	const accent = insight.status === 'success' ? '#0d7a5f' : insight.status === 'warning' ? '#c77d1f' : '#b42318';

	return (
		<div style={styles.page}>
			<div style={{ ...styles.heroCard, borderColor: accent }}>
				<p style={styles.eyebrow}>AI Tutor</p>
				<h1 style={styles.title}>{insight.title}</h1>
				<p style={styles.summary}>{insight.summary}</p>
				<div style={styles.metaRow}>
					<span style={{ ...styles.badge, backgroundColor: `${accent}1a`, color: accent }}>
						{payload.file.language.toUpperCase()}
					</span>
					<span style={styles.metaText}>{payload.file.fileName}</span>
					<span style={styles.metaText}>Exit code: {payload.runtime.exitCode ?? 'unknown'}</span>
				</div>
			</div>

			<div style={styles.grid}>
				<section style={styles.card}>
					<h2 style={styles.sectionTitle}>Primary Issue</h2>
					{insight.primaryIssue ? (
						<>
							<p style={styles.issueTitle}>
								{insight.primaryIssue.exceptionType}: {insight.primaryIssue.message}
							</p>
							<p style={styles.detailText}>
								Line {insight.primaryIssue.line}, column {insight.primaryIssue.column}
							</p>
						</>
					) : (
						<p style={styles.detailText}>No primary runtime issue was captured for this run.</p>
					)}
				</section>

				<section style={styles.card}>
					<h2 style={styles.sectionTitle}>Next Action</h2>
					<p style={styles.detailText}>{insight.nextAction}</p>
				</section>

				<section style={styles.card}>
					<h2 style={styles.sectionTitle}>Guided Steps</h2>
					<ol style={styles.list}>
						{insight.guidedSteps.map((step) => (
							<li key={step} style={styles.listItem}>
								{step}
							</li>
						))}
					</ol>
				</section>

				<section style={styles.card}>
					<h2 style={styles.sectionTitle}>Observations</h2>
					<ul style={styles.list}>
						{insight.observations.map((observation) => (
							<li key={observation} style={styles.listItem}>
								{observation}
							</li>
						))}
					</ul>
				</section>
			</div>

			<section style={styles.card}>
				<h2 style={styles.sectionTitle}>Traceback Frames</h2>
				<div style={styles.stackList}>
					{insight.stackFrames.map((frame, index) => (
						<div key={`${frame.filePath}-${frame.line}-${index}`} style={styles.stackFrame}>
							<p style={styles.stackLabel}>
								Frame {index + 1}
								{frame.functionName ? ` - ${frame.functionName}` : ''}
							</p>
							<p style={styles.detailText}>
								{frame.filePath} : line {frame.line}, column {frame.column}
							</p>
							{frame.sourceLine ? <code style={styles.codeInline}>{frame.sourceLine}</code> : null}
						</div>
					))}
				</div>
			</section>

			<div style={styles.grid}>
				<section style={styles.card}>
					<h2 style={styles.sectionTitle}>Stdout</h2>
					<pre style={styles.pre}>{payload.runtime.stdout || 'No stdout captured.'}</pre>
				</section>

				<section style={styles.card}>
					<h2 style={styles.sectionTitle}>Stderr</h2>
					<pre style={styles.pre}>{payload.runtime.stderr || 'No stderr captured.'}</pre>
				</section>
			</div>
		</div>
	);
}

const styles: Record<string, React.CSSProperties> = {
	page: {
		background: 'linear-gradient(180deg, #f6f8fb 0%, #eef3f8 100%)',
		color: '#132238',
		fontFamily: '"Segoe UI", sans-serif',
		minHeight: '100vh',
		padding: '24px',
	},
	heroCard: {
		background: 'rgba(255, 255, 255, 0.92)',
		border: '1px solid #d6dfeb',
		borderRadius: '20px',
		boxShadow: '0 20px 45px rgba(18, 38, 63, 0.08)',
		marginBottom: '20px',
		padding: '24px',
	},
	eyebrow: {
		color: '#5a6b85',
		fontSize: '12px',
		fontWeight: 700,
		letterSpacing: '0.14em',
		margin: 0,
		textTransform: 'uppercase',
	},
	title: {
		fontSize: '32px',
		lineHeight: 1.1,
		margin: '10px 0 12px',
	},
	summary: {
		color: '#34445c',
		fontSize: '15px',
		lineHeight: 1.6,
		margin: 0,
	},
	metaRow: {
		alignItems: 'center',
		display: 'flex',
		flexWrap: 'wrap',
		gap: '10px',
		marginTop: '18px',
	},
	badge: {
		borderRadius: '999px',
		fontSize: '12px',
		fontWeight: 700,
		padding: '6px 10px',
	},
	metaText: {
		color: '#5a6b85',
		fontSize: '13px',
	},
	grid: {
		display: 'grid',
		gap: '16px',
		gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
		marginBottom: '16px',
	},
	card: {
		background: 'rgba(255, 255, 255, 0.92)',
		border: '1px solid #d6dfeb',
		borderRadius: '18px',
		boxShadow: '0 14px 30px rgba(18, 38, 63, 0.06)',
		padding: '20px',
	},
	sectionTitle: {
		fontSize: '15px',
		margin: '0 0 12px',
	},
	issueTitle: {
		fontSize: '18px',
		fontWeight: 700,
		margin: '0 0 8px',
	},
	detailText: {
		color: '#42556f',
		fontSize: '14px',
		lineHeight: 1.6,
		margin: 0,
	},
	list: {
		margin: 0,
		paddingLeft: '18px',
	},
	listItem: {
		color: '#42556f',
		lineHeight: 1.6,
		marginBottom: '8px',
	},
	stackList: {
		display: 'grid',
		gap: '12px',
	},
	stackFrame: {
		background: '#f8fafc',
		border: '1px solid #e2e8f0',
		borderRadius: '14px',
		padding: '14px',
	},
	stackLabel: {
		fontSize: '14px',
		fontWeight: 700,
		margin: '0 0 6px',
	},
	codeInline: {
		background: '#eef4fb',
		borderRadius: '8px',
		color: '#1f3a5f',
		display: 'block',
		fontFamily: '"Cascadia Code", monospace',
		fontSize: '12px',
		marginTop: '8px',
		padding: '8px 10px',
		whiteSpace: 'pre-wrap',
	},
	pre: {
		background: '#0f172a',
		borderRadius: '14px',
		color: '#d8e7ff',
		fontFamily: '"Cascadia Code", monospace',
		fontSize: '12px',
		margin: 0,
		minHeight: '140px',
		overflowX: 'auto',
		padding: '14px',
		whiteSpace: 'pre-wrap',
	},
};
