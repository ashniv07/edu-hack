import type { BackendExecutionPayload, TutorResponse } from '../types.js';
import type { GraphState } from './graphState.js';

export function mergeTutorResponseNode(
	state: Pick<GraphState, 'payload' | 'codeAnalysis' | 'agentInsights'>,
): Partial<GraphState> {
	return {
		mergedResult: buildTutorResponse(state.payload, state.agentInsights, state.codeAnalysis),
	};
}

export function buildTutorResponse(
	payload: BackendExecutionPayload,
	agentInsights: GraphState['agentInsights'],
	codeAnalysis: GraphState['codeAnalysis'],
): TutorResponse {
	const issue = payload.runtime.rootCause;
	const success = payload.success;
	const concept = agentInsights?.errorAnalysis.concept ?? codeAnalysis?.concept;

	return {
		title: success ? 'Run completed successfully' : 'Runtime issue detected',
		summary: success
			? 'The program completed without a captured runtime error. Use this run as a baseline before trying edge cases.'
			: buildFailureSummary(payload, concept),
		status: success ? 'success' : payload.runtime.timedOut ? 'warning' : 'error',
		primaryIssue: issue,
		guidedSteps: agentInsights?.tutorHint.guidedSteps ?? [
			'Compare the output with the behavior you expected.',
			'Try one edge case and observe whether the output changes.',
			'Keep this successful run as a known-good reference.',
		],
		observations: [
			`File: ${payload.file.fileName}`,
			`Language: ${payload.file.language}`,
			`Exit code: ${payload.runtime.exitCode ?? 'unknown'}`,
			...(concept ? [`Concept: ${concept}`] : []),
			...(agentInsights ? [
				`Confidence: ${Math.round(agentInsights.errorAnalysis.confidence * 100)}%`,
				`Agents: ${agentInsights.agentRun.selectedAgents.join(', ')}`,
			] : []),
		],
		stackFrames: payload.runtime.stackFrames,
		stdout: payload.runtime.stdout,
		stderr: payload.runtime.stderr,
		nextAction: agentInsights?.tutorHint.nextAction
			?? 'Try another input or change one assumption at a time so you can see exactly what changes.',
		codeAnalysis,
		agentInsights,
	};
}

function buildFailureSummary(payload: BackendExecutionPayload, concept?: string): string {
	const issue = payload.runtime.rootCause;
	const issueLabel = issue ? `${issue.exceptionType}: ${issue.message}` : 'a runtime failure';
	const conceptLabel = concept ? ` The teaching focus is ${concept.replace(/_/g, ' ')}.` : '';
	return `Your program stopped with ${issueLabel}.${conceptLabel} Start at the failing line, then trace backward to the value or reference that made the operation unsafe.`;
}
