import { describe, expect, it, vi } from 'vitest';
import { analyzeExecution } from '../index.js';
import type { BackendExecutionPayload } from '../types.js';

describe('analyzeExecution', () => {
	it('merges Person 4 agent insights into the tutor response', async () => {
		vi.stubEnv('OPENAI_API_KEY', '');

		const payload: BackendExecutionPayload = {
			file: {
				filePath: 'C:/repo/main.py',
				fileName: 'main.py',
				directoryPath: 'C:/repo',
				language: 'python',
			},
			source: 'print(12 / 0)',
			stage: 'runtime',
			success: false,
			runtime: {
				success: false,
				command: 'python main.py',
				exitCode: 1,
				stdout: '',
				stderr: 'ZeroDivisionError: division by zero',
				timedOut: false,
				toolMissing: false,
				rootCause: {
					exceptionType: 'ZeroDivisionError',
					message: 'division by zero',
					filePath: 'C:/repo/main.py',
					line: 1,
					column: 10,
					raw: 'ZeroDivisionError: division by zero',
				},
				stackFrames: [],
			},
		};

		const response = await analyzeExecution(payload);

		expect(response.agentInsights?.errorAnalysis.concept).toBe('division_by_zero');
		expect(response.guidedSteps.length).toBeGreaterThan(0);
		expect(response.nextAction).toContain('line 1');
		expect(response.observations).toContain('Concept: division_by_zero');
	});
});
