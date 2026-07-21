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

export interface BackendTutorResponse extends TutorInsight {
	codeAnalysis?: CodeAnalysisResult;
	agentInsights?: TeachingAgentInsights;
}

export interface TutorPanelState {
	payload?: ExecutionPayload;
	insight?: TutorInsight;
	codeAnalysis?: CodeAnalysisResult;
	agentInsights?: TeachingAgentInsights;
}
