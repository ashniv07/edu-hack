import { Language, Parser, type Node } from 'web-tree-sitter';
import { fileURLToPath } from 'node:url';
import type { LanguageAnalyzer } from './languageAnalyzer.js';
import type { CodeAnalysisResult, CompilerOutput, MemoryOperation, MemoryPointer, MemoryVariable } from './types.js';

/** Override with JAVA_TREE_SITTER_WASM_PATH when grammars are hosted elsewhere. */
export const JAVA_TREE_SITTER_WASM_PATH = process.env.JAVA_TREE_SITTER_WASM_PATH
	?? fileURLToPath(import.meta.resolve('@vscode/tree-sitter-wasm/wasm/tree-sitter-java.wasm'));
let javaLanguage: Promise<Language> | undefined;

async function getJavaLanguage(): Promise<Language> {
	javaLanguage ??= (async () => { await Parser.init(); return Language.load(JAVA_TREE_SITTER_WASM_PATH); })();
	return javaLanguage;
}

function walk(node: Node, visit: (current: Node) => void): void {
	visit(node);
	for (const child of node.children) walk(child, visit);
}

export class JavaAnalyzer implements LanguageAnalyzer {
	readonly language = 'java';

	async analyze(source: string, compilerOutput: CompilerOutput): Promise<CodeAnalysisResult> {
		const language = await getJavaLanguage();
		const parser = new Parser(); parser.setLanguage(language);
		const tree = parser.parse(source); if (!tree) throw new Error('Unable to parse Java source.');
		const variables: MemoryVariable[] = [];
		const pointers: MemoryPointer[] = [];
		const operations: MemoryOperation[] = [];
		const pointerByName = new Map<string, MemoryPointer>();
		walk(tree.rootNode, (node) => {
			const line = node.startPosition.row + 1;
			const text = node.text;
			if (node.type === 'local_variable_declaration') {
				const match = text.match(/^\s*([\w<>\[\]]+)\s+([A-Za-z_]\w*)\s*=\s*null\s*;/);
				if (match) {
					const [, type, name] = match;
					const pointer: MemoryPointer = { id: name, pointsTo: null, state: 'null' };
					pointerByName.set(name, pointer); pointers.push(pointer);
					variables.push({ id: name, name, type, region: 'stack', declaredLine: line, initialized: true });
					operations.push({ line, kind: 'declare', target: name });
				}
			}
			if (node.type === 'assignment_expression') {
				const match = text.match(/^\s*([A-Za-z_]\w*)\s*=\s*(.+)$/);
				if (match && pointerByName.has(match[1]) && match[2].trim() !== 'null') {
					pointerByName.get(match[1])!.state = 'valid'; operations.push({ line, kind: 'assign', target: match[1] });
				}
			}
			if (node.type === 'method_invocation' || node.type === 'field_access') {
				for (const [name, pointer] of pointerByName) {
					if (new RegExp(`\\b${name}\\s*\\.`).test(text)
						&& !operations.some((operation) => operation.line === line && operation.kind === 'dereference' && operation.target === name)) {
						pointer.dereferencedAtLine ??= line;
						operations.push({ line, kind: 'dereference', target: name });
					}
				}
			}
		});
		tree.delete(); parser.delete(); operations.sort((a, b) => a.line - b.line);
		const dereference = operations.find((operation) => operation.kind === 'dereference' && operation.line === compilerOutput.line)
			?? operations.find((operation) => operation.kind === 'dereference');
		const state = dereference ? pointerByName.get(dereference.target)?.state : undefined;
		const concept = compilerOutput.exceptionType === 'ArrayIndexOutOfBoundsException' ? 'index_out_of_bounds'
			: compilerOutput.exceptionType === 'ConcurrentModificationException' ? 'concurrent_modification'
			: compilerOutput.exceptionType === 'NullPointerException' && state === 'null' ? 'null_pointer_dereference'
			: 'unknown_runtime_error';
		const memoryModel = { variables, pointers, operations };
		return {
			concept,
			confidence: concept === 'unknown_runtime_error' ? 0.35 : 0.99,
			errorLine: compilerOutput.line,
			memoryModel,
			visualization: { type: 'memory_layout' as const, data: memoryModel },
		};
	}
}

export const javaAnalyzer = new JavaAnalyzer();
