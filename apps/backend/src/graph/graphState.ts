import { Annotation } from '@langchain/langgraph';
import type { CodeAnalysisResult, CompilerOutput } from '../analysis/types.js';

export const GraphStateAnnotation = Annotation.Root({
	language: Annotation<string>,
	source: Annotation<string>,
	compilerOutput: Annotation<CompilerOutput>,
	codeAnalysis: Annotation<CodeAnalysisResult | undefined>,
	errorAnalysis: Annotation<unknown | undefined>,
	visualizationPlan: Annotation<unknown | undefined>,
	tutorHint: Annotation<unknown | undefined>,
	mergedResult: Annotation<unknown | undefined>,
});

export type GraphState = typeof GraphStateAnnotation.State;
