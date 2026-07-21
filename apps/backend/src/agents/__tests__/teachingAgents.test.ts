import { describe, expect, it, vi } from 'vitest';
import { runTeachingAgents } from '../index.js';
import type { BackendExecutionPayload } from '../../types.js';

describe('runTeachingAgents', () => {
	it('creates fallback teaching insights for division by zero', async () => {
		vi.stubEnv('OPENAI_API_KEY', '');

		const payload: BackendExecutionPayload = {
			file: {
				filePath: 'C:/repo/DivideByZero.java',
				fileName: 'DivideByZero.java',
				directoryPath: 'C:/repo',
				language: 'java',
			},
			source: 'class DivideByZero { public static void main(String[] args) { System.out.println(1 / 0); } }',
			stage: 'runtime',
			success: false,
			runtime: {
				success: false,
				command: 'java DivideByZero.java',
				exitCode: 1,
				stdout: '',
				stderr: 'Exception in thread "main" java.lang.ArithmeticException: / by zero',
				timedOut: false,
				toolMissing: false,
				rootCause: {
					exceptionType: 'java.lang.ArithmeticException',
					message: '/ by zero',
					filePath: 'C:/repo/DivideByZero.java',
					line: 1,
					column: 82,
					raw: 'java.lang.ArithmeticException: / by zero',
				},
				stackFrames: [],
			},
		};

		const insights = await runTeachingAgents(payload);

		expect(insights.agentRun.mode).toBe('fallback');
		expect(insights.errorAnalysis.concept).toBe('division_by_zero');
		expect(insights.visualizationPlan.type).toBe('value_flow');
		expect(insights.tutorHint.hint).toContain('divisor');
		expect(insights.quiz?.correctAnswer).toBe('Whether the divisor can be zero');
	});

	it('selects analogy and quiz agents for null reference errors', async () => {
		vi.stubEnv('OPENAI_API_KEY', '');

		const payload: BackendExecutionPayload = {
			file: {
				filePath: 'C:/repo/NullDemo.java',
				fileName: 'NullDemo.java',
				directoryPath: 'C:/repo',
				language: 'java',
			},
			source: 'String name = null;\nSystem.out.println(name.length());',
			stage: 'runtime',
			success: false,
			runtime: {
				success: false,
				command: 'java NullDemo.java',
				exitCode: 1,
				stdout: '',
				stderr: 'java.lang.NullPointerException',
				timedOut: false,
				toolMissing: false,
				rootCause: {
					exceptionType: 'java.lang.NullPointerException',
					message: 'Cannot invoke length because name is null',
					filePath: 'C:/repo/NullDemo.java',
					line: 2,
					column: 25,
					raw: 'java.lang.NullPointerException',
				},
				stackFrames: [],
			},
		};

		const insights = await runTeachingAgents(payload);

		expect(insights.errorAnalysis.concept).toBe('null_pointer_dereference');
		expect(insights.agentRun.selectedAgents).toContain('analogy');
		expect(insights.agentRun.selectedAgents).toContain('quiz');
		expect(insights.analogy?.mapping.length).toBeGreaterThan(0);
	});
});
