import { runTeachingAgents } from '../agents/index.js';
import type { GraphState } from './graphState.js';

export async function agentAnalysisNode(
	state: Pick<GraphState, 'payload'>,
): Promise<Partial<GraphState>> {
	if (state.payload.success) {
		return { agentInsights: undefined };
	}

	const agentInsights = await runTeachingAgents(state.payload);
	return { agentInsights };
}
