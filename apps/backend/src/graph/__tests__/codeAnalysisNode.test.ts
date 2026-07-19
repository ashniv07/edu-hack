import { END, START, StateGraph } from '@langchain/langgraph';
import { describe, expect, it } from 'vitest';
import { codeAnalysisNode } from '../codeAnalysisNode.js';
import { GraphStateAnnotation } from '../graphState.js';

describe('codeAnalysisNode', () => {
	it('merges C null-pointer analysis into graph state', async () => {
		const graph = new StateGraph(GraphStateAnnotation)
			.addNode('runCodeAnalysis', codeAnalysisNode)
			.addEdge(START, 'runCodeAnalysis')
			.addEdge('runCodeAnalysis', END)
			.compile();

		const state = await graph.invoke({
			language: 'c',
			source: 'int *p;\nprintf("%d", *p);',
			compilerOutput: { raw: 'Segmentation fault', line: 2, column: 15, signal: 'SEGV' },
		});

		expect(state.codeAnalysis?.concept).toBe('null_pointer_dereference');
	});
});
