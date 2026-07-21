import { END, START, StateGraph } from '@langchain/langgraph';
import type { CompilerOutput } from '../analysis/types.js';
import type { BackendExecutionPayload, TutorResponse } from '../types.js';
import { agentAnalysisNode } from './agentAnalysisNode.js';
import { codeAnalysisNode } from './codeAnalysisNode.js';
import { GraphStateAnnotation } from './graphState.js';
import { mergeTutorResponseNode } from './mergeTutorResponseNode.js';

const graph = new StateGraph(GraphStateAnnotation)
	.addNode('runCodeAnalysis', codeAnalysisNode)
	.addNode('runAgentAnalysis', agentAnalysisNode)
	.addNode('mergeTutorResponseNode', mergeTutorResponseNode)
	.addEdge(START, 'runCodeAnalysis')
	.addEdge('runCodeAnalysis', 'runAgentAnalysis')
	.addEdge('runAgentAnalysis', 'mergeTutorResponseNode')
	.addEdge('mergeTutorResponseNode', END)
	.compile();

export async function runTutorOrchestrator(payload: BackendExecutionPayload): Promise<TutorResponse> {
	const state = await graph.invoke({
		payload,
		language: payload.file.language,
		source: payload.source,
		compilerOutput: toCompilerOutput(payload),
	});

	if (!state.mergedResult) {
		throw new Error('Tutor orchestrator did not produce a response.');
	}

	return state.mergedResult;
}

function toCompilerOutput(payload: BackendExecutionPayload): CompilerOutput {
	const rootCause = payload.runtime.rootCause;
	const stderr = payload.runtime.stderr;
	return {
		raw: stderr || rootCause?.raw || '',
		line: rootCause?.line ?? payload.runtime.stackFrames.at(-1)?.line ?? 1,
		column: rootCause?.column ?? payload.runtime.stackFrames.at(-1)?.column ?? 1,
		signal: /segmentation fault|sigsegv/i.test(stderr) ? 'SEGV' : undefined,
		exceptionType: rootCause?.exceptionType?.split('.').at(-1) ?? rootCause?.exceptionType,
	};
}
