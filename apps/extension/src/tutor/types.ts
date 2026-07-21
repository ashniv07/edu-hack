import type { ExecutionPayload, RootCause, TracebackFrame } from '../core/types';

// Memory model types for visualization
export interface MemoryVariable {
	id: string;
	name: string;
	type: string;
	region: 'stack' | 'heap';
	declaredLine: number;
	initialized: boolean;
}

export interface MemoryPointer {
	id: string;
	pointsTo: string | null;
	state: 'null' | 'dangling' | 'valid' | 'uninitialized';
	dereferencedAtLine?: number;
}

export interface MemoryOperation {
	line: number;
	kind: 'declare' | 'assign' | 'free' | 'dereference' | 'move' | 'borrow';
	target: string;
}

export interface MemoryModel {
	variables: MemoryVariable[];
	pointers: MemoryPointer[];
	operations: MemoryOperation[];
}

export interface CodeAnalysisResult {
	concept: string;
	confidence: number;
	errorLine: number;
	memoryModel: MemoryModel;
}

export interface TutorInsight {
	title: string;
	summary: string;
	status: 'success' | 'warning' | 'error';
	primaryIssue?: RootCause;
	guidedSteps: string[];
	observations: string[];
	stackFrames: TracebackFrame[];
	stdout: string;
	stderr: string;
	nextAction: string;
}

export interface TutorPanelState {
	payload?: ExecutionPayload;
	insight?: TutorInsight;
	codeAnalysis?: CodeAnalysisResult;
}
