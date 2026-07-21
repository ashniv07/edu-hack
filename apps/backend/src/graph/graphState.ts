import { Annotation } from '@langchain/langgraph';
import type { CodeAnalysisResult, CompilerOutput } from '../analysis/types.js';
import type { BackendExecutionPayload, TeachingAgentInsights, TutorResponse } from '../types.js';

export const GraphStateAnnotation = Annotation.Root({
	payload: Annotation<BackendExecutionPayload>,
	language: Annotation<string>,
	source: Annotation<string>,
	compilerOutput: Annotation<CompilerOutput>,
	codeAnalysis: Annotation<CodeAnalysisResult | undefined>,
	agentInsights: Annotation<TeachingAgentInsights | undefined>,
	mergedResult: Annotation<TutorResponse | undefined>,
});

export type GraphState = typeof GraphStateAnnotation.State;
