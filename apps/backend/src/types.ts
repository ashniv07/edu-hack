export interface ExecutionTracebackFrame {
	filePath?: string;
	line: number;
	column: number;
	functionName?: string;
	sourceLine?: string;
	caretLine?: string;
	raw: string;
}

export interface ExecutionRootCause {
	exceptionType: string;
	message: string;
	filePath?: string;
	line: number;
	column: number;
	raw: string;
}

export interface BackendExecutionPayload {
	file: {
		filePath: string;
		fileName: string;
		directoryPath: string;
		language: string;
		workspacePath?: string;
	};
	source: string;
	stage: 'runtime';
	success: boolean;
	runtime: {
		success: boolean;
		command: string;
		exitCode: number | null;
		stdout: string;
		stderr: string;
		timedOut: boolean;
		toolMissing: boolean;
		rootCause?: ExecutionRootCause;
		stackFrames: ExecutionTracebackFrame[];
	};
}

export interface TutorResponse {
	title: string;
	summary: string;
	status: 'success' | 'warning' | 'error';
	primaryIssue?: ExecutionRootCause;
	guidedSteps: string[];
	observations: string[];
	stackFrames: ExecutionTracebackFrame[];
	stdout: string;
	stderr: string;
	nextAction: string;
}
