import type { BackendExecutionPayload, TutorResponse } from './types.js';

export async function analyzeExecution(payload: BackendExecutionPayload): Promise<TutorResponse> {
	const issue = payload.runtime.rootCause;
	const success = payload.success;

	return {
		title: success ? 'Run completed successfully' : 'Runtime issue detected',
		summary: success
			? 'Replace this placeholder with a LangGraph flow that explains why the run succeeded or what concept to reinforce next.'
			: 'Replace this placeholder with a LangGraph flow that turns the captured runtime issue into a tutor response.',
		status: success ? 'success' : payload.runtime.timedOut ? 'warning' : 'error',
		primaryIssue: issue,
		guidedSteps: [
			'Send the payload through your LangGraph workflow.',
			'Return a stable tutor response that the extension webview can render.',
			'Keep this contract independent from VS Code so other clients can reuse it later.',
		],
		observations: [
			`File: ${payload.file.fileName}`,
			`Language: ${payload.file.language}`,
			`Exit code: ${payload.runtime.exitCode ?? 'unknown'}`,
		],
		stackFrames: payload.runtime.stackFrames,
		stdout: payload.runtime.stdout,
		stderr: payload.runtime.stderr,
		nextAction: 'Implement the real LangGraph analysis pipeline here.',
	};
}
