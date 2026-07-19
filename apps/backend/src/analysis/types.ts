export interface CodeAnalysisResult {
	concept: string;
	confidence: number;
	errorLine: number;
	memoryModel: {
		variables: {
			id: string;
			name: string;
			type: string;
			region: 'stack' | 'heap';
			declaredLine: number;
			initialized: boolean;
		}[];
		pointers: {
			id: string;
			pointsTo: string | null;
			state: 'null' | 'dangling' | 'valid' | 'uninitialized';
			dereferencedAtLine?: number;
		}[];
		operations: {
			line: number;
			kind: 'declare' | 'assign' | 'free' | 'dereference' | 'move' | 'borrow';
			target: string;
		}[];
	};
}

export interface CompilerOutput {
	raw: string;
	line: number;
	column: number;
	signal?: string;
	exceptionType?: string;
}

export type MemoryOperation = CodeAnalysisResult['memoryModel']['operations'][number];
export type MemoryPointer = CodeAnalysisResult['memoryModel']['pointers'][number];
export type MemoryVariable = CodeAnalysisResult['memoryModel']['variables'][number];
