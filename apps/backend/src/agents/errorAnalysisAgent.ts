import { summarizeContext } from './context.js';
import { fallbackErrorAnalysis } from './fallbacks.js';
import { requestStructuredJson } from './openaiClient.js';
import { errorAnalysisSchema } from './schemas.js';
import type { AgentResult, ErrorAnalysisResult, TeachingAgentContext } from './types.js';

const SYSTEM_PROMPT = [
	'You are an expert programming tutor and runtime-error analyst.',
	'Identify the learning concept behind the error.',
	'Return only structured JSON matching the schema.',
	'Do not reveal a full corrected solution.',
].join(' ');

export async function runErrorAnalysisAgent(context: TeachingAgentContext): Promise<AgentResult<ErrorAnalysisResult>> {
	const fallback = fallbackErrorAnalysis(context);
	const result = await requestStructuredJson<ErrorAnalysisResult>(
		SYSTEM_PROMPT,
		[
			'Analyze this runtime context.',
			'Focus on the concept being violated, the likely misconception, and what evidence supports it.',
			summarizeContext(context),
		].join('\n\n'),
		errorAnalysisSchema,
	);

	return {
		value: normalizeErrorAnalysis(result, fallback),
		mode: result ? 'openai' : 'fallback',
	};
}

function normalizeErrorAnalysis(
	result: ErrorAnalysisResult | undefined,
	fallback: ErrorAnalysisResult,
): ErrorAnalysisResult {
	if (!result) {
		return fallback;
	}

	return {
		concept: result.concept || fallback.concept,
		difficulty: result.difficulty ?? fallback.difficulty,
		misconception: result.misconception || fallback.misconception,
		learningObjective: result.learningObjective || fallback.learningObjective,
		confidence: clamp(result.confidence, 0, 1),
		evidence: result.evidence?.length ? result.evidence.slice(0, 5) : fallback.evidence,
		needsAnalogy: Boolean(result.needsAnalogy),
		needsQuiz: Boolean(result.needsQuiz),
	};
}

function clamp(value: number, minimum: number, maximum: number): number {
	return Math.max(minimum, Math.min(maximum, value));
}
