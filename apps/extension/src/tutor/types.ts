import type { ExecutionPayload, RootCause, TracebackFrame } from '../core/types';

// Memory model types for visualization
export interface MemoryVariable {
	id: string;
	name: string;
	type: string;
	value?: string;
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

// Dynamic Visualization Types
export type VisualizationType =
	| 'memory_layout'
	| 'array_access'
	| 'dict_access'
	| 'type_flow'
	| 'call_stack'
	| 'scope_chain'
	| 'arithmetic'
	| 'object_structure';

export interface ArrayVisualization {
	name: string;
	elements: { index: number; value: string; highlighted?: boolean }[];
	accessIndex: number;
	validRange: { start: number; end: number };
	errorMessage: string;
}

export interface DictVisualization {
	name: string;
	entries: { key: string; value: string; highlighted?: boolean }[];
	accessedKey: string;
	availableKeys: string[];
	errorMessage: string;
}

export interface TypeFlowVisualization {
	operations: {
		line: number;
		expression: string;
		leftType: string;
		rightType: string;
		operator: string;
		resultType?: string;
		isError: boolean;
	}[];
	expectedType: string;
	actualType: string;
	errorMessage: string;
}

export interface CallStackVisualization {
	frames: {
		functionName: string;
		args: string;
		line: number;
		depth: number;
	}[];
	maxDepth: number;
	repeatingPattern?: string;
	errorMessage: string;
}

export interface ScopeVisualization {
	scopes: {
		name: string;
		type: 'global' | 'local' | 'enclosing' | 'builtin';
		variables: { name: string; value: string }[];
	}[];
	undefinedName: string;
	suggestions: string[];
	errorMessage: string;
}

export interface ArithmeticVisualization {
	expression: string;
	operands: { name: string; value: string; isZero?: boolean }[];
	operator: string;
	errorMessage: string;
}

export interface ObjectVisualization {
	objectName: string;
	objectType: string;
	attributes: { name: string; type: string; value?: string }[];
	accessedAttribute: string;
	isNone: boolean;
	errorMessage: string;
}

export type DynamicVisualization =
	| { type: 'memory_layout'; data: MemoryModel }
	| { type: 'array_access'; data: ArrayVisualization }
	| { type: 'dict_access'; data: DictVisualization }
	| { type: 'type_flow'; data: TypeFlowVisualization }
	| { type: 'call_stack'; data: CallStackVisualization }
	| { type: 'scope_chain'; data: ScopeVisualization }
	| { type: 'arithmetic'; data: ArithmeticVisualization }
	| { type: 'object_structure'; data: ObjectVisualization };

export interface CodeAnalysisResult {
	concept: string;
	confidence: number;
	errorLine: number;
	memoryModel: MemoryModel;
	visualization?: DynamicVisualization;
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
