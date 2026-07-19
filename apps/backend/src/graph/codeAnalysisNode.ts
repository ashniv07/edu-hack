import { analyzeCode } from '../analysis/index.js';
import type { GraphState } from './graphState.js';

/** Deterministic graph node: enriches state with structural code analysis only. */
export async function codeAnalysisNode(
	state: Pick<GraphState, 'language' | 'source' | 'compilerOutput'>,
): Promise<Partial<GraphState>> {
	const codeAnalysis = await analyzeCode(state.language, state.source, state.compilerOutput);
	return { codeAnalysis };
}
