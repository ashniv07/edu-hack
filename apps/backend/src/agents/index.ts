import type { BackendExecutionPayload, TeachingAgentInsights } from '../types.js';
import { buildTeachingAgentContext } from './context.js';
import { runAnalogyAgent } from './analogyAgent.js';
import { runErrorAnalysisAgent } from './errorAnalysisAgent.js';
import { runQuizAgent } from './quizAgent.js';
import { runTutorHintAgent } from './tutorHintAgent.js';
import { runVisualizationPlannerAgent } from './visualizationPlannerAgent.js';
import type { AgentRunMode } from './types.js';

export async function runTeachingAgents(payload: BackendExecutionPayload): Promise<TeachingAgentInsights> {
	const context = buildTeachingAgentContext(payload);
	const selectedAgents = ['errorAnalysis', 'visualizationPlanner', 'tutorHint'];
	const errorAnalysis = await runErrorAnalysisAgent(context);

	const [visualizationPlan, tutorHint] = await Promise.all([
		runVisualizationPlannerAgent(context, errorAnalysis.value),
		runTutorHintAgent(context, errorAnalysis.value),
	]);

	const optionalRuns = await Promise.all([
		errorAnalysis.value.needsAnalogy ? runAnalogyAgent(context, errorAnalysis.value) : Promise.resolve(undefined),
		errorAnalysis.value.needsQuiz ? runQuizAgent(context, errorAnalysis.value) : Promise.resolve(undefined),
	]);
	const [analogy, quiz] = optionalRuns;

	if (analogy) {
		selectedAgents.push('analogy');
	}

	if (quiz) {
		selectedAgents.push('quiz');
	}

	const modes: AgentRunMode[] = [
		errorAnalysis.mode,
		visualizationPlan.mode,
		tutorHint.mode,
		analogy?.mode,
		quiz?.mode,
	].filter((mode): mode is AgentRunMode => Boolean(mode));

	return {
		errorAnalysis: errorAnalysis.value,
		visualizationPlan: visualizationPlan.value,
		tutorHint: tutorHint.value,
		analogy: analogy?.value,
		quiz: quiz?.value,
		agentRun: {
			mode: modes.every((mode) => mode === 'openai') ? 'openai' : 'fallback',
			selectedAgents,
		},
	};
}

export { runAnalogyAgent } from './analogyAgent.js';
export { runErrorAnalysisAgent } from './errorAnalysisAgent.js';
export { runQuizAgent } from './quizAgent.js';
export { runTutorHintAgent } from './tutorHintAgent.js';
export { runVisualizationPlannerAgent } from './visualizationPlannerAgent.js';
export type {
	AnalogyResult,
	ErrorAnalysisResult,
	QuizResult,
	TeachingAgentContext,
	TutorHintResult,
	VisualizationPlanResult,
} from './types.js';
