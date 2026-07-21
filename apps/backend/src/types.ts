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
	agentInsights?: TeachingAgentInsights;
}

export interface TeachingAgentInsights {
	errorAnalysis: {
		concept: string;
		difficulty: 'beginner' | 'intermediate' | 'advanced';
		misconception: string;
		learningObjective: string;
		confidence: number;
		evidence: string[];
		needsAnalogy: boolean;
		needsQuiz: boolean;
	};
	visualizationPlan: {
		type: 'value_flow' | 'memory_map' | 'traceback_stack' | 'loop_timeline';
		title: string;
		description: string;
		highlight: string[];
		interactive: boolean;
		focusLine?: number;
		steps: string[];
	};
	tutorHint: {
		hint: string;
		nextAction: string;
		guidedSteps: string[];
		revealLevel: 'hint' | 'guided' | 'explain';
	};
	analogy?: {
		analogy: string;
		mapping: string[];
		caution: string;
	};
	quiz?: {
		question: string;
		choices: string[];
		correctAnswer: string;
		explanation: string;
	};
	agentRun: {
		mode: 'openai' | 'fallback';
		selectedAgents: string[];
	};
}
