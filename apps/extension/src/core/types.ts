export type DiagnosticSeverityLabel = 'error' | 'warning' | 'info';

export interface FileInfo {
	filePath: string;
	fileName: string;
	directoryPath: string;
	language: 'java';
	workspacePath?: string;
}

export interface DiagnosticItem {
	filePath?: string;
	line: number;
	column: number;
	severity: DiagnosticSeverityLabel;
	message: string;
	code?: string;
	raw: string;
}

export interface TracebackFrame {
	filePath?: string;
	line: number;
	column: number;
	functionName?: string;
	sourceLine?: string;
	caretLine?: string;
	raw: string;
}

export interface RootCause {
	exceptionType: string;
	message: string;
	filePath?: string;
	line: number;
	column: number;
	raw: string;
}

export interface RuntimeResult {
	success: boolean;
	command: string;
	exitCode: number | null;
	stdout: string;
	stderr: string;
	timedOut: boolean;
	toolMissing: boolean;
	primaryDiagnostic?: DiagnosticItem;
	rootCause?: RootCause;
	stackFrames: TracebackFrame[];
}

export interface ExecutionPayload {
	file: FileInfo;
	source: string;
	stage: 'runtime';
	success: boolean;
	runtime: RuntimeResult;
}

export interface ProcessExecutionResult {
	command: string;
	exitCode: number | null;
	stdout: string;
	stderr: string;
	timedOut: boolean;
	toolMissing: boolean;
}
