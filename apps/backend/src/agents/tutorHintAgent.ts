import { summarizeContext } from './context.js';
import { fallbackTutorHint } from './fallbacks.js';
import { requestStructuredJson } from './openaiClient.js';
import { tutorHintSchema } from './schemas.js';
import type { AgentResult, ErrorAnalysisResult, TeachingAgentContext, TutorHintResult } from './types.js';

const SYSTEM_PROMPT = [
	'You are a Socratic tutor for beginner programmers.',
	'Give a useful hint and next action without directly providing the final fixed code.',
	'Return only JSON matching the schema.',
].join(' ');

export async function runTutorHintAgent(
	context: TeachingAgentContext,
	errorAnalysis: ErrorAnalysisResult,
): Promise<AgentResult<TutorHintResult>> {
	const fallback = fallbackTutorHint(context, errorAnalysis);
	const result = await requestStructuredJson<TutorHintResult>(
		SYSTEM_PROMPT,
		[
			'Create a concise tutor hint for this learner.',
			`Error analysis: ${JSON.stringify(errorAnalysis, null, 2)}`,
			summarizeContext(context),
		].join('\n\n'),
		tutorHintSchema,
	);

	return {
		value: normalizeTutorHint(result, fallback),
		mode: result ? 'openai' : 'fallback',
	};
}

function normalizeTutorHint(result: TutorHintResult | undefined, fallback: TutorHintResult): TutorHintResult {
	if (!result) {
		return fallback;
	}

	return {
		hint: result.hint || fallback.hint,
		nextAction: result.nextAction || fallback.nextAction,
		guidedSteps: result.guidedSteps?.length ? result.guidedSteps.slice(0, 5) : fallback.guidedSteps,
		revealLevel: result.revealLevel ?? fallback.revealLevel,
	};
}
