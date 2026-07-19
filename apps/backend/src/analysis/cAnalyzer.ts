import { Language, Parser, type Node } from 'web-tree-sitter';
import { fileURLToPath } from 'node:url';
import type { LanguageAnalyzer } from './languageAnalyzer.js';
import type { CodeAnalysisResult, CompilerOutput, MemoryOperation, MemoryPointer, MemoryVariable } from './types.js';

/** Override with C_TREE_SITTER_WASM_PATH when grammars are hosted elsewhere. */
export const C_TREE_SITTER_WASM_PATH = process.env.C_TREE_SITTER_WASM_PATH
	?? fileURLToPath(import.meta.resolve('@repomix/tree-sitter-wasms/out/tree-sitter-c.wasm'));

let cLanguage: Promise<Language> | undefined;

async function getCLanguage(): Promise<Language> {
	cLanguage ??= (async () => {
		await Parser.init();
		return Language.load(C_TREE_SITTER_WASM_PATH);
	})();
	return cLanguage;
}

function walk(node: Node, visit: (current: Node) => void): void {
	visit(node);
	for (const child of node.children) walk(child, visit);
}

export class CAnalyzer implements LanguageAnalyzer {
	readonly language = 'c';

	async analyze(source: string, compilerOutput: CompilerOutput): Promise<CodeAnalysisResult> {
		const language = await getCLanguage();
		const parser = new Parser();
		parser.setLanguage(language);
		const tree = parser.parse(source);
		if (!tree) throw new Error('Unable to parse C source.');

		const variables: MemoryVariable[] = [];
		const pointers: MemoryPointer[] = [];
		const operations: MemoryOperation[] = [];
		const pointerByName = new Map<string, MemoryPointer>();
		const addPointer = (name: string, type: string, line: number, initialized: boolean, state: MemoryPointer['state']) => {
			if (pointerByName.has(name)) return;
			const pointer = { id: name, pointsTo: null, state } as MemoryPointer;
			pointerByName.set(name, pointer);
			pointers.push(pointer);
			variables.push({ id: name, name, type, region: 'stack', declaredLine: line, initialized });
			operations.push({ line, kind: 'declare', target: name });
		};

		walk(tree.rootNode, (node) => {
			const line = node.startPosition.row + 1;
			const text = node.text;
			if (node.type === 'declaration') {
				const match = text.match(/([\w\s]+\*)\s*([A-Za-z_]\w*)\s*(?:=\s*([^;]+))?/);
				if (match) {
					const [, type, name, initializer] = match;
					addPointer(name, type.trim(), line, Boolean(initializer), initializer?.includes('malloc') ? 'valid' : 'null');
					if (initializer?.includes('malloc')) operations.push({ line, kind: 'assign', target: name });
				}
			}
			if (node.type === 'call_expression' && /^free\s*\(/.test(text)) {
				const name = text.match(/^free\s*\(\s*([A-Za-z_]\w*)/)?.[1];
				if (name && pointerByName.has(name)) {
					pointerByName.get(name)!.state = 'dangling';
					operations.push({ line, kind: 'free', target: name });
				}
			}
			if (node.type === 'assignment_expression') {
				const name = text.match(/^\s*([A-Za-z_]\w*)\s*=/)?.[1];
				if (name && pointerByName.has(name)) {
					pointerByName.get(name)!.state = /\bNULL\b|\b0\b/.test(text) ? 'null' : 'valid';
					operations.push({ line, kind: 'assign', target: name });
				}
			}
			if (node.type === 'pointer_expression' || node.type === 'unary_expression') {
				const name = text.match(/^\*\s*([A-Za-z_]\w*)$/)?.[1];
				if (name) {
					const pointer = pointerByName.get(name);
					if (pointer) pointer.dereferencedAtLine ??= line;
					operations.push({ line, kind: 'dereference', target: name });
				}
			}
		});
		tree.delete(); parser.delete();
		operations.sort((a, b) => a.line - b.line);
		const firstUse = operations.find((operation) => operation.kind === 'dereference');
		const target = firstUse?.target;
		const pointer = target ? pointerByName.get(target) : undefined;
		const signal = compilerOutput.signal?.replace(/^SIG/, '');
		const concept = signal === 'SEGV' && pointer?.state === 'dangling' ? 'dangling_pointer'
			: signal === 'SEGV' && (pointer?.state === 'null' || pointer?.state === 'uninitialized') ? 'null_pointer_dereference'
			: target && !pointer ? 'uninitialized_pointer' : 'unknown_runtime_error';
		return { concept, confidence: concept === 'unknown_runtime_error' ? 0.35 : 0.99, errorLine: compilerOutput.line, memoryModel: { variables, pointers, operations } };
	}
}

export const cAnalyzer = new CAnalyzer();
