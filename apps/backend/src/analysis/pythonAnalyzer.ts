import { Language, Parser, type Node } from 'web-tree-sitter';
import { fileURLToPath } from 'node:url';
import type { LanguageAnalyzer } from './languageAnalyzer.js';
import type {
	CodeAnalysisResult,
	CompilerOutput,
	MemoryOperation,
	MemoryPointer,
	MemoryVariable,
	DynamicVisualization,
	ArrayVisualization,
	DictVisualization,
	TypeFlowVisualization,
	CallStackVisualization,
	ScopeVisualization,
	ArithmeticVisualization,
	ObjectVisualization,
} from './types.js';

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

function isHeapAllocation(value: string): boolean {
	const trimmed = value.trim();
	return (
		trimmed.startsWith('[') ||
		trimmed.startsWith('{') ||
		trimmed.startsWith('(') ||
		/^[A-Z][a-zA-Z0-9_]*\(/.test(trimmed)
	);
}

function inferType(value: string): string {
	const trimmed = value.trim();
	if (trimmed === 'None') return 'NoneType';
	if (trimmed === 'True' || trimmed === 'False') return 'bool';
	if (/^-?\d+$/.test(trimmed)) return 'int';
	if (/^-?\d+\.\d+$/.test(trimmed)) return 'float';
	if (/^["']/.test(trimmed)) return 'str';
	if (trimmed.startsWith('[')) return 'list';
	if (trimmed.startsWith('{') && trimmed.includes(':')) return 'dict';
	if (trimmed.startsWith('{')) return 'set';
	if (trimmed.startsWith('(')) return 'tuple';
	return 'object';
}

// Parse list literal to extract elements
function parseListLiteral(value: string): string[] {
	const trimmed = value.trim();
	if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return [];
	const inner = trimmed.slice(1, -1).trim();
	if (!inner) return [];
	// Simple split by comma (doesn't handle nested structures perfectly)
	return inner.split(',').map(s => s.trim());
}

// Parse dict literal to extract key-value pairs
function parseDictLiteral(value: string): { key: string; value: string }[] {
	const trimmed = value.trim();
	if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return [];
	const inner = trimmed.slice(1, -1).trim();
	if (!inner) return [];
	const entries: { key: string; value: string }[] = [];
	// Simple parsing (doesn't handle nested structures perfectly)
	const pairs = inner.split(',');
	for (const pair of pairs) {
		const colonIdx = pair.indexOf(':');
		if (colonIdx > 0) {
			entries.push({
				key: pair.slice(0, colonIdx).trim().replace(/^["']|["']$/g, ''),
				value: pair.slice(colonIdx + 1).trim(),
			});
		}
	}
	return entries;
}

export class PythonAnalyzer implements LanguageAnalyzer {
	readonly language = 'python';

	async analyze(source: string, compilerOutput: CompilerOutput): Promise<CodeAnalysisResult> {
		const language = await getPythonLanguage();
		const parser = new Parser();
		parser.setLanguage(language);
		const tree = parser.parse(source);
		if (!tree) throw new Error('Unable to parse Python source.');

		const variables: MemoryVariable[] = [];
		const pointers: MemoryPointer[] = [];
		const operations: MemoryOperation[] = [];
		const variableByName = new Map<string, MemoryVariable>();
		const variableValues = new Map<string, string>();
		const pointerByName = new Map<string, MemoryPointer>();
		const functionCalls: { name: string; args: string; line: number }[] = [];
		const functionDefs: { name: string; line: number; params: string[] }[] = [];
		const subscriptAccesses: { name: string; index: string; line: number }[] = [];
		const attributeAccesses: { object: string; attr: string; line: number }[] = [];
		const binaryOps: { left: string; op: string; right: string; line: number }[] = [];

		walk(tree.rootNode, (node) => {
			const line = node.startPosition.row + 1;
			const text = node.text;

			// Track function definitions
			if (node.type === 'function_definition') {
				const nameNode = node.childForFieldName('name');
				const paramsNode = node.childForFieldName('parameters');
				if (nameNode) {
					const params: string[] = [];
					if (paramsNode) {
						walk(paramsNode, (p) => {
							if (p.type === 'identifier') params.push(p.text);
						});
					}
					functionDefs.push({ name: nameNode.text, line, params });
				}
			}

			// Track function calls
			if (node.type === 'call') {
				const funcNode = node.childForFieldName('function');
				const argsNode = node.childForFieldName('arguments');
				if (funcNode) {
					functionCalls.push({
						name: funcNode.text,
						args: argsNode?.text ?? '()',
						line,
					});
				}
			}

			// Track binary operations
			if (node.type === 'binary_operator') {
				const left = node.children[0];
				const op = node.children[1];
				const right = node.children[2];
				if (left && op && right) {
					binaryOps.push({
						left: left.text,
						op: op.text,
						right: right.text,
						line,
					});
				}
			}

			// Handle assignments
			if (node.type === 'assignment') {
				const match = text.match(/^\s*([A-Za-z_]\w*)\s*=\s*([\s\S]+)$/);
				if (!match) return;
				const [, name, value] = match;
				const trimmedValue = value.trim();
				variableValues.set(name, trimmedValue);
				const existingVar = variableByName.get(name);

				if (!existingVar) {
					const isHeap = isHeapAllocation(trimmedValue);
					const varType = inferType(trimmedValue);
					const isNone = trimmedValue === 'None';

					const variable: MemoryVariable = {
						id: name,
						name,
						type: varType,
						value: trimmedValue,
						region: isHeap ? 'heap' : 'stack',
						declaredLine: line,
						initialized: !isNone,
					};
					variables.push(variable);
					variableByName.set(name, variable);
					operations.push({ line, kind: 'declare', target: name });

					if (isNone || isHeap) {
						const pointer: MemoryPointer = {
							id: name,
							pointsTo: isNone ? null : `heap_${name}`,
							state: isNone ? 'null' : 'valid',
						};
						pointers.push(pointer);
						pointerByName.set(name, pointer);

						if (isHeap) {
							variables.push({
								id: `heap_${name}`,
								name: `*${name}`,
								type: varType,
								value: trimmedValue,
								region: 'heap',
								declaredLine: line,
								initialized: true,
							});
						}
					}
				} else {
					operations.push({ line, kind: 'assign', target: name });
					existingVar.value = trimmedValue;
					const pointer = pointerByName.get(name);
					if (pointer) {
						pointer.state = trimmedValue === 'None' ? 'null' : 'valid';
						pointer.pointsTo = trimmedValue === 'None' ? null : pointer.pointsTo;
					}
					existingVar.initialized = trimmedValue !== 'None';
				}
			}

			// Handle attribute access
			if (node.type === 'attribute') {
				const match = text.match(/^\s*([A-Za-z_]\w*)\s*\.([A-Za-z_]\w*)/);
				if (match) {
					const [, obj, attr] = match;
					attributeAccesses.push({ object: obj, attr, line });
					const pointer = pointerByName.get(obj);
					if (pointer) pointer.dereferencedAtLine ??= line;
					operations.push({ line, kind: 'dereference', target: obj });
				}
			}

			// Handle subscript access
			if (node.type === 'subscript') {
				const match = text.match(/^\s*([A-Za-z_]\w*)\s*\[(.+)\]/);
				if (match) {
					const [, name, index] = match;
					subscriptAccesses.push({ name, index: index.trim(), line });
					operations.push({ line, kind: 'dereference', target: name });
					if (!pointerByName.has(name)) {
						pointers.push({ id: name, pointsTo: `heap_${name}`, state: 'valid' });
						pointerByName.set(name, pointers[pointers.length - 1]);
					}
				}
			}

			// Handle del statements
			if (node.type === 'delete_statement') {
				const match = text.match(/^\s*del\s+([A-Za-z_]\w*)/);
				if (match) {
					operations.push({ line, kind: 'free', target: match[1] });
					const pointer = pointerByName.get(match[1]);
					if (pointer) pointer.state = 'dangling';
				}
			}
		});

		tree.delete();
		parser.delete();
		operations.sort((a, b) => a.line - b.line);

		// Determine concept and build visualization
		const { concept, confidence, visualization } = this.buildVisualization(
			compilerOutput,
			variables,
			variableValues,
			subscriptAccesses,
			attributeAccesses,
			functionCalls,
			functionDefs,
			binaryOps,
			{ variables, pointers, operations }
		);

		return {
			concept,
			confidence,
			errorLine: compilerOutput.line,
			memoryModel: { variables, pointers, operations },
			visualization,
		};
	}

	private buildVisualization(
		compilerOutput: CompilerOutput,
		variables: MemoryVariable[],
		variableValues: Map<string, string>,
		subscriptAccesses: { name: string; index: string; line: number }[],
		attributeAccesses: { object: string; attr: string; line: number }[],
		functionCalls: { name: string; args: string; line: number }[],
		functionDefs: { name: string; line: number; params: string[] }[],
		binaryOps: { left: string; op: string; right: string; line: number }[],
		memoryModel: { variables: MemoryVariable[]; pointers: MemoryPointer[]; operations: MemoryOperation[] }
	): { concept: string; confidence: number; visualization: DynamicVisualization } {
		const errorType = compilerOutput.exceptionType;
		const errorLine = compilerOutput.line;
		const errorRaw = compilerOutput.raw;

		// IndexError - Array access visualization
		if (errorType === 'IndexError') {
			const access = subscriptAccesses.find(a => a.line === errorLine) ?? subscriptAccesses[0];
			const varValue = access ? variableValues.get(access.name) : undefined;
			const elements = varValue ? parseListLiteral(varValue) : [];
			const accessIndex = access ? parseInt(access.index, 10) : -1;

			const arrayViz: ArrayVisualization = {
				name: access?.name ?? 'unknown',
				elements: elements.map((val, idx) => ({
					index: idx,
					value: val,
					highlighted: idx === accessIndex,
				})),
				accessIndex: isNaN(accessIndex) ? -1 : accessIndex,
				validRange: { start: 0, end: elements.length - 1 },
				errorMessage: `Index ${accessIndex} is out of range. Valid indices: 0 to ${elements.length - 1}`,
			};

			return {
				concept: 'index_out_of_bounds',
				confidence: 0.99,
				visualization: { type: 'array_access', data: arrayViz },
			};
		}

		// KeyError - Dictionary access visualization
		if (errorType === 'KeyError') {
			const keyMatch = errorRaw.match(/KeyError:\s*['"]?([^'"]+)['"]?/);
			const accessedKey = keyMatch?.[1] ?? 'unknown';

			// Find the dict variable
			let dictName = 'unknown';
			let dictEntries: { key: string; value: string }[] = [];

			for (const [name, value] of variableValues) {
				if (value.startsWith('{') && value.includes(':')) {
					dictName = name;
					dictEntries = parseDictLiteral(value);
					break;
				}
			}

			const dictViz: DictVisualization = {
				name: dictName,
				entries: dictEntries.map(e => ({ ...e, highlighted: false })),
				accessedKey,
				availableKeys: dictEntries.map(e => e.key),
				errorMessage: `Key "${accessedKey}" not found. Available keys: ${dictEntries.map(e => `"${e.key}"`).join(', ')}`,
			};

			return {
				concept: 'key_not_found',
				confidence: 0.99,
				visualization: { type: 'dict_access', data: dictViz },
			};
		}

		// TypeError - Type flow visualization
		if (errorType === 'TypeError') {
			const typeMatch = errorRaw.match(/unsupported operand type\(s\) for (.+): '(\w+)' and '(\w+)'/);
			const noneMatch = errorRaw.match(/'NoneType'/);

			const op = binaryOps.find(b => b.line === errorLine) ?? binaryOps[0];

			const typeViz: TypeFlowVisualization = {
				operations: op ? [{
					line: op.line,
					expression: `${op.left} ${op.op} ${op.right}`,
					leftType: inferType(variableValues.get(op.left) ?? op.left),
					rightType: inferType(variableValues.get(op.right) ?? op.right),
					operator: op.op,
					isError: true,
				}] : [],
				expectedType: typeMatch ? 'compatible types' : 'not NoneType',
				actualType: typeMatch ? `${typeMatch[2]} and ${typeMatch[3]}` : 'NoneType',
				errorMessage: noneMatch
					? 'Cannot perform operation on None value'
					: `Type mismatch: cannot use "${op?.op ?? 'operator'}" with incompatible types`,
			};

			return {
				concept: noneMatch ? 'none_type_error' : 'type_mismatch',
				confidence: 0.95,
				visualization: { type: 'type_flow', data: typeViz },
			};
		}

		// RecursionError - Call stack visualization
		if (errorType === 'RecursionError') {
			const funcDef = functionDefs[0];
			const recursiveCalls = functionCalls.filter(c => c.name === funcDef?.name);

			const frames = [];
			const maxFrames = Math.min(10, recursiveCalls.length || 5);
			for (let i = 0; i < maxFrames; i++) {
				frames.push({
					functionName: funcDef?.name ?? 'unknown',
					args: recursiveCalls[i]?.args ?? '(...)',
					line: recursiveCalls[i]?.line ?? funcDef?.line ?? errorLine,
					depth: i + 1,
				});
			}

			const callStackViz: CallStackVisualization = {
				frames,
				maxDepth: 1000,
				repeatingPattern: funcDef?.name ?? 'function',
				errorMessage: `Maximum recursion depth exceeded. "${funcDef?.name ?? 'Function'}" calls itself without a base case.`,
			};

			return {
				concept: 'infinite_recursion',
				confidence: 0.99,
				visualization: { type: 'call_stack', data: callStackViz },
			};
		}

		// NameError - Scope visualization
		if (errorType === 'NameError') {
			const nameMatch = errorRaw.match(/name '(\w+)' is not defined/);
			const undefinedName = nameMatch?.[1] ?? 'unknown';

			const localVars = variables.filter(v => v.region === 'stack');
			const suggestions = variables
				.map(v => v.name)
				.filter(n => n.toLowerCase().includes(undefinedName.toLowerCase().slice(0, 2)));

			const scopeViz: ScopeVisualization = {
				scopes: [
					{
						name: 'Local',
						type: 'local',
						variables: localVars.map(v => ({ name: v.name, value: v.value ?? 'undefined' })),
					},
					{
						name: 'Global',
						type: 'global',
						variables: [],
					},
				],
				undefinedName,
				suggestions: suggestions.length > 0 ? suggestions : ['Check spelling', 'Define variable before use'],
				errorMessage: `Variable "${undefinedName}" is not defined. Did you mean: ${suggestions.join(', ') || 'N/A'}?`,
			};

			return {
				concept: 'undefined_variable',
				confidence: 0.99,
				visualization: { type: 'scope_chain', data: scopeViz },
			};
		}

		// ZeroDivisionError - Arithmetic visualization
		if (errorType === 'ZeroDivisionError') {
			const op = binaryOps.find(b => (b.op === '/' || b.op === '//' || b.op === '%') && b.line === errorLine)
				?? binaryOps.find(b => b.op === '/' || b.op === '//' || b.op === '%');

			const arithmeticViz: ArithmeticVisualization = {
				expression: op ? `${op.left} ${op.op} ${op.right}` : 'x / 0',
				operands: op ? [
					{ name: op.left, value: variableValues.get(op.left) ?? op.left, isZero: false },
					{ name: op.right, value: variableValues.get(op.right) ?? op.right, isZero: true },
				] : [
					{ name: 'dividend', value: '?', isZero: false },
					{ name: 'divisor', value: '0', isZero: true },
				],
				operator: op?.op ?? '/',
				errorMessage: 'Division by zero is undefined. The divisor must be non-zero.',
			};

			return {
				concept: 'division_by_zero',
				confidence: 0.99,
				visualization: { type: 'arithmetic', data: arithmeticViz },
			};
		}

		// AttributeError - Object structure visualization
		if (errorType === 'AttributeError') {
			const attrMatch = errorRaw.match(/'(\w+)' object has no attribute '(\w+)'/)
				?? errorRaw.match(/has no attribute '(\w+)'/);
			const noneMatch = errorRaw.match(/'NoneType'/);

			const access = attributeAccesses.find(a => a.line === errorLine) ?? attributeAccesses[0];
			const objVar = access ? variables.find(v => v.name === access.object) : undefined;

			const objectViz: ObjectVisualization = {
				objectName: access?.object ?? 'unknown',
				objectType: noneMatch ? 'NoneType' : (objVar?.type ?? attrMatch?.[1] ?? 'object'),
				attributes: objVar && objVar.value
					? parseDictLiteral(objVar.value).map(e => ({ name: e.key, type: 'unknown', value: e.value }))
					: [],
				accessedAttribute: access?.attr ?? attrMatch?.[2] ?? attrMatch?.[1] ?? 'unknown',
				isNone: !!noneMatch,
				errorMessage: noneMatch
					? `Cannot access attribute on None. "${access?.object ?? 'Variable'}" is None.`
					: `Object has no attribute "${access?.attr ?? 'unknown'}".`,
			};

			return {
				concept: noneMatch ? 'none_attribute_access' : 'attribute_error',
				confidence: 0.95,
				visualization: { type: 'object_structure', data: objectViz },
			};
		}

		// Default: memory layout visualization
		return {
			concept: 'unknown_runtime_error',
			confidence: 0.35,
			visualization: { type: 'memory_layout', data: memoryModel },
		};
	}
}

export const pythonAnalyzer = new PythonAnalyzer();
