import { summarizeContext } from './context.js';
import { fallbackAnalogy } from './fallbacks.js';
import { requestStructuredJson } from './openaiClient.js';
import { analogySchema } from './schemas.js';
import type { AgentResult, AnalogyResult, ErrorAnalysisResult, TeachingAgentContext } from './types.js';

const SYSTEM_PROMPT = [
	'You are an analogy agent for an educational programming tutor.',
	'Use a simple everyday analogy to explain the concept, then map it back to code.',
	'Keep the analogy accurate and short.',
].join(' ');

export async function runAnalogyAgent(
	context: TeachingAgentContext,
	errorAnalysis: ErrorAnalysisResult,
): Promise<AgentResult<AnalogyResult>> {
	const fallback = fallbackAnalogy(errorAnalysis);
	const result = await requestStructuredJson<AnalogyResult>(
		SYSTEM_PROMPT,
		[
			'Create an analogy for this programming concept.',
			`Error analysis: ${JSON.stringify(errorAnalysis, null, 2)}`,
			summarizeContext(context),
		].join('\n\n'),
		analogySchema,
	);

	return {
		value: {
			analogy: result?.analogy || fallback.analogy,
			mapping: result?.mapping?.length ? result.mapping.slice(0, 5) : fallback.mapping,
			caution: result?.caution || fallback.caution,
		},
		mode: result ? 'openai' : 'fallback',
	};
}
