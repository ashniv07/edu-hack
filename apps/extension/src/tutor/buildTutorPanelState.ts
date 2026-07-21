import type { ExecutionPayload } from '../core/types';
import type { BackendTutorResponse, TutorInsight, TutorPanelState } from './types';

export function buildTutorPanelState(
	payload?: ExecutionPayload,
	backendResponse?: BackendTutorResponse,
): TutorPanelState {
	if (!payload) {
		return {};
	}

	if (backendResponse) {
		return {
			payload,
			insight: {
				title: backendResponse.title,
				summary: backendResponse.summary,
				status: backendResponse.status,
				primaryIssue: backendResponse.primaryIssue,
				guidedSteps: backendResponse.guidedSteps,
				observations: backendResponse.observations,
				stackFrames: backendResponse.stackFrames,
				stdout: backendResponse.stdout,
				stderr: backendResponse.stderr,
				nextAction: backendResponse.nextAction,
			},
			codeAnalysis: backendResponse.codeAnalysis,
			agentInsights: backendResponse.agentInsights,
		};
	}

	return {
		payload,
		insight: buildInsight(payload),
	};
}

function buildInsight(payload: ExecutionPayload): TutorInsight {
	if (payload.success) {
		return {
			title: 'Run completed successfully',
			summary: 'Your program finished without a Java runtime error. Use this run as a baseline before you test trickier inputs or edge cases.',
			status: 'success',
			primaryIssue: payload.runtime.rootCause,
			guidedSteps: [
				'Compare the output with what you expected the program to do.',
				'Keep this successful run in mind when you investigate later failures.',
				'Try a different input or test case to see where the behavior changes.',
			],
			observations: buildObservations(payload),
			stackFrames: payload.runtime.stackFrames,
			stdout: payload.runtime.stdout,
			stderr: payload.runtime.stderr,
			nextAction: 'Try another input or change one assumption at a time so you can see exactly what changes.',
		};
	}

	const issue = payload.runtime.rootCause;
	const issueLabel = issue ? `${issue.exceptionType}: ${issue.message}` : 'a Java runtime failure';

	return {
		title: 'Runtime issue detected',
		summary: `Your program stopped with ${issueLabel}. Start with the failing line, then trace upward through the call stack to understand how execution reached that point.`,
		status: payload.runtime.timedOut ? 'warning' : 'error',
		primaryIssue: issue,
		guidedSteps: buildGuidedSteps(payload),
		observations: buildObservations(payload),
		stackFrames: payload.runtime.stackFrames,
		stdout: payload.runtime.stdout,
		stderr: payload.runtime.stderr,
		nextAction: 'Begin with the deepest frame below, then work upward to find which earlier value or decision led to the failure.',
	};
}

function buildGuidedSteps(payload: ExecutionPayload): string[] {
	const issue = payload.runtime.rootCause;
	const steps = [
		'Start at the deepest stack frame. That is usually where the actual failure happened.',
		'Inspect the values or assumptions used on the failing line.',
		'Move one frame upward to identify who called that function and what input was passed in.',
	];

	if (issue?.exceptionType === 'java.lang.ArithmeticException') {
		steps.push('Check why the divisor became zero and whether you should validate or guard before dividing.');
	}

	if (payload.runtime.timedOut) {
		steps.push('Look for loops, waits, or recursion that may never complete under this input.');
	}

	return steps;
}

function buildObservations(payload: ExecutionPayload): string[] {
	const observations = [
		`File: ${payload.file.fileName}`,
		`Exit code: ${payload.runtime.exitCode ?? 'unknown'}`,
	];

	if (payload.runtime.rootCause) {
		observations.push(
			`Primary issue at line ${payload.runtime.rootCause.line}, column ${payload.runtime.rootCause.column}`,
		);
	}

	if (payload.runtime.stackFrames.length > 0) {
		observations.push(`Captured ${payload.runtime.stackFrames.length} traceback frame(s).`);
	}

	return observations;
}
