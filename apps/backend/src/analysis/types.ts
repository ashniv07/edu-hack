// Memory model types
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

// Visualization types for different error categories
export type VisualizationType =
	| 'memory_layout'      // Stack/heap visualization
	| 'array_access'       // Array with index highlighting
	| 'dict_access'        // Dictionary with key highlighting
	| 'type_flow'          // Type transformation/mismatch
	| 'call_stack'         // Function call stack (recursion)
	| 'scope_chain'        // Variable scope visualization
	| 'arithmetic'         // Math operation visualization
	| 'object_structure';  // Object attributes

// Array visualization for IndexError
export interface ArrayVisualization {
	name: string;
	elements: { index: number; value: string; highlighted?: boolean }[];
	accessIndex: number;
	validRange: { start: number; end: number };
	errorMessage: string;
}

// Dictionary visualization for KeyError
export interface DictVisualization {
	name: string;
	entries: { key: string; value: string; highlighted?: boolean }[];
	accessedKey: string;
	availableKeys: string[];
	errorMessage: string;
}

// Type flow visualization for TypeError
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

// Call stack visualization for RecursionError
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

// Scope visualization for NameError
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

// Arithmetic visualization for ZeroDivisionError
export interface ArithmeticVisualization {
	expression: string;
	operands: { name: string; value: string; isZero?: boolean }[];
	operator: string;
	errorMessage: string;
}

// Object structure visualization for AttributeError
export interface ObjectVisualization {
	objectName: string;
	objectType: string;
	attributes: { name: string; type: string; value?: string }[];
	accessedAttribute: string;
	isNone: boolean;
	errorMessage: string;
}

// Union type for all visualizations
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
	visualization: DynamicVisualization;
}

export interface CompilerOutput {
	raw: string;
	line: number;
	column: number;
	signal?: string;
	exceptionType?: string;
}
