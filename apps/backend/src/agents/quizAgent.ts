import { summarizeContext } from './context.js';
import { fallbackQuiz } from './fallbacks.js';
import { requestStructuredJson } from './openaiClient.js';
import { quizSchema } from './schemas.js';
import type { AgentResult, ErrorAnalysisResult, QuizResult, TeachingAgentContext } from './types.js';

const SYSTEM_PROMPT = [
	'You are a quiz agent for a programming tutor.',
	'Create one multiple-choice check that tests the concept, not memorization.',
	'Return only JSON matching the schema.',
].join(' ');

export async function runQuizAgent(
	context: TeachingAgentContext,
	errorAnalysis: ErrorAnalysisResult,
): Promise<AgentResult<QuizResult>> {
	const fallback = fallbackQuiz(errorAnalysis);
	const result = await requestStructuredJson<QuizResult>(
		SYSTEM_PROMPT,
		[
			'Create one quiz question for this learner.',
			`Error analysis: ${JSON.stringify(errorAnalysis, null, 2)}`,
			summarizeContext(context),
		].join('\n\n'),
		quizSchema,
	);

	return {
		value: {
			question: result?.question || fallback.question,
			choices: result?.choices?.length ? result.choices.slice(0, 4) : fallback.choices,
			correctAnswer: result?.correctAnswer || fallback.correctAnswer,
			explanation: result?.explanation || fallback.explanation,
		},
		mode: result ? 'openai' : 'fallback',
	};
}
