import { Language, Parser, type Node } from 'web-tree-sitter';
import { fileURLToPath } from 'node:url';
import type { LanguageAnalyzer } from './languageAnalyzer.js';
import type { CodeAnalysisResult, CompilerOutput, MemoryOperation, MemoryPointer, MemoryVariable } from './types.js';

/** Override with PYTHON_TREE_SITTER_WASM_PATH when grammars are hosted elsewhere. */
export const PYTHON_TREE_SITTER_WASM_PATH = process.env.PYTHON_TREE_SITTER_WASM_PATH
	?? fileURLToPath(import.meta.resolve('@vscode/tree-sitter-wasm/wasm/tree-sitter-python.wasm'));
let pythonLanguage: Promise<Language> | undefined;

async function getPythonLanguage(): Promise<Language> {
	pythonLanguage ??= (async () => { await Parser.init(); return Language.load(PYTHON_TREE_SITTER_WASM_PATH); })();
	return pythonLanguage;
}

function walk(node: Node, visit: (current: Node) => void): void {
	visit(node);
	for (const child of node.children) walk(child, visit);
}

export class PythonAnalyzer implements LanguageAnalyzer {
	readonly language = 'python';

	async analyze(source: string, compilerOutput: CompilerOutput): Promise<CodeAnalysisResult> {
		const language = await getPythonLanguage();
		const parser = new Parser(); parser.setLanguage(language);
		const tree = parser.parse(source); if (!tree) throw new Error('Unable to parse Python source.');
		const variables: MemoryVariable[] = [];
		const pointers: MemoryPointer[] = [];
		const operations: MemoryOperation[] = [];
		const pointerByName = new Map<string, MemoryPointer>();
		walk(tree.rootNode, (node) => {
			const line = node.startPosition.row + 1;
			const text = node.text;
			if (node.type === 'assignment') {
				const match = text.match(/^\s*([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/);
				if (!match) return;
				const [, name, value] = match;
				const pointer = pointerByName.get(name);
				if (value.trim() === 'None' && !pointer) {
					const created: MemoryPointer = { id: name, pointsTo: null, state: 'null' };
					pointerByName.set(name, created); pointers.push(created);
					variables.push({ id: name, name, type: 'NoneType', region: 'stack', declaredLine: line, initialized: true });
					operations.push({ line, kind: 'declare', target: name });
				} else if (pointer && value.trim() !== 'None') {
					pointer.state = 'valid'; operations.push({ line, kind: 'assign', target: name });
				}
			}
			if (node.type === 'attribute') {
				const name = text.match(/^\s*([A-Za-z_]\w*)\s*\./)?.[1];
				if (name) {
					const pointer = pointerByName.get(name); if (pointer) pointer.dereferencedAtLine ??= line;
					operations.push({ line, kind: 'dereference', target: name });
				}
			}
			if (node.type === 'subscript' && compilerOutput.exceptionType === 'IndexError') {
				const name = text.match(/^\s*([A-Za-z_]\w*)\s*\[/)?.[1];
				if (name && !pointerByName.has(name)) {
					const created: MemoryPointer = { id: name, pointsTo: null, state: 'valid' };
					pointerByName.set(name, created); pointers.push(created);
				}
			}
		});
		tree.delete(); parser.delete(); operations.sort((a, b) => a.line - b.line);
		const dereference = operations.find((operation) => operation.kind === 'dereference' && operation.line === compilerOutput.line)
			?? operations.find((operation) => operation.kind === 'dereference');
		const state = dereference ? pointerByName.get(dereference.target)?.state : undefined;
		const concept = compilerOutput.exceptionType === 'IndexError' ? 'index_out_of_bounds'
			: compilerOutput.exceptionType === 'AttributeError' && state === 'null' ? 'none_attribute_access'
			: compilerOutput.exceptionType === 'TypeError' && /NoneType/.test(compilerOutput.raw) ? 'none_attribute_access'
			: 'unknown_runtime_error';
		return { concept, confidence: concept === 'unknown_runtime_error' ? 0.35 : 0.99, errorLine: compilerOutput.line, memoryModel: { variables, pointers, operations } };
	}
}

export const pythonAnalyzer = new PythonAnalyzer();
