import type { BackendExecutionPayload, TeachingAgentInsights } from '../types.js';

export type Difficulty = TeachingAgentInsights['errorAnalysis']['difficulty'];
export type VisualizationType = TeachingAgentInsights['visualizationPlan']['type'];
export type AgentRunMode = TeachingAgentInsights['agentRun']['mode'];

export interface TeachingAgentContext {
	payload: BackendExecutionPayload;
	language: string;
	source: string;
	errorText: string;
	exceptionType?: string;
	errorLine: number;
	errorColumn: number;
}

export type ErrorAnalysisResult = TeachingAgentInsights['errorAnalysis'];
export type VisualizationPlanResult = TeachingAgentInsights['visualizationPlan'];
export type TutorHintResult = TeachingAgentInsights['tutorHint'];
export type AnalogyResult = NonNullable<TeachingAgentInsights['analogy']>;
export type QuizResult = NonNullable<TeachingAgentInsights['quiz']>;

export interface AgentResult<T> {
	value: T;
	mode: AgentRunMode;
}

export interface JsonSchemaDefinition {
	name: string;
	schema: Record<string, unknown>;
}
