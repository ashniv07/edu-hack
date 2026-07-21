import { summarizeContext } from './context.js';
import { fallbackVisualizationPlan } from './fallbacks.js';
import { requestStructuredJson } from './openaiClient.js';
import { visualizationPlanSchema } from './schemas.js';
import type {
	AgentResult,
	ErrorAnalysisResult,
	TeachingAgentContext,
	VisualizationPlanResult,
} from './types.js';

const SYSTEM_PROMPT = [
	'You are a visualization planning agent for a programming tutor.',
	'You decide what visualization should be shown, but you never draw UI.',
	'Return deterministic rendering instructions as JSON.',
].join(' ');

export async function runVisualizationPlannerAgent(
	context: TeachingAgentContext,
	errorAnalysis: ErrorAnalysisResult,
): Promise<AgentResult<VisualizationPlanResult>> {
	const fallback = fallbackVisualizationPlan(context, errorAnalysis);
	const result = await requestStructuredJson<VisualizationPlanResult>(
		SYSTEM_PROMPT,
		[
			'Choose the best visualization plan for this learner.',
			`Error analysis: ${JSON.stringify(errorAnalysis, null, 2)}`,
			summarizeContext(context),
		].join('\n\n'),
		visualizationPlanSchema,
	);

	return {
		value: normalizeVisualizationPlan(result, fallback),
		mode: result ? 'openai' : 'fallback',
	};
}

function normalizeVisualizationPlan(
	result: VisualizationPlanResult | undefined,
	fallback: VisualizationPlanResult,
): VisualizationPlanResult {
	if (!result) {
		return fallback;
	}

	return {
		type: result.type ?? fallback.type,
		title: result.title || fallback.title,
		description: result.description || fallback.description,
		highlight: result.highlight?.length ? result.highlight.slice(0, 8) : fallback.highlight,
		interactive: result.interactive ?? fallback.interactive,
		focusLine: result.focusLine ?? fallback.focusLine,
		steps: result.steps?.length ? result.steps.slice(0, 6) : fallback.steps,
	};
}
