import type { BackendExecutionPayload, TutorResponse } from './types.js';
import { runTutorOrchestrator } from './graph/orchestrator.js';

export async function analyzeExecution(payload: BackendExecutionPayload): Promise<TutorResponse> {
	return runTutorOrchestrator(payload);
}
