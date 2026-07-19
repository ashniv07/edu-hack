import * as assert from 'assert';
import { buildTutorPanelState } from '../tutor/buildTutorPanelState';
import type { ExecutionPayload } from '../core/types';

suite('AI Tutor Panel State', () => {
	test('builds a runtime failure insight from the payload', () => {
		const payload: ExecutionPayload = {
			file: {
				filePath: 'C:/repo/apps/extension/samples/DivideByZero.java',
				fileName: 'DivideByZero.java',
				directoryPath: 'C:/repo/apps/extension/samples',
				language: 'java',
				workspacePath: 'C:/repo',
			},
			source: 'System.out.println(1 / 0);\n',
			stage: 'runtime',
			success: false,
			runtime: {
				success: false,
				command: 'java DivideByZero.java',
				exitCode: 1,
				stdout: '',
				stderr: 'java.lang.ArithmeticException: / by zero',
				timedOut: false,
				toolMissing: false,
				primaryDiagnostic: {
					filePath: 'C:/repo/apps/extension/samples/DivideByZero.java',
					line: 1,
					column: 9,
					severity: 'error',
					message: 'java.lang.ArithmeticException: / by zero',
					raw: 'java.lang.ArithmeticException: / by zero',
				},
				rootCause: {
					exceptionType: 'java.lang.ArithmeticException',
					message: '/ by zero',
					filePath: 'C:/repo/apps/extension/samples/DivideByZero.java',
					line: 1,
					column: 9,
					raw: 'java.lang.ArithmeticException: / by zero',
				},
				stackFrames: [
					{
					filePath: 'C:/repo/apps/extension/samples/DivideByZero.java',
						line: 1,
						column: 9,
					functionName: 'DivideByZero.divideNumbers',
						raw: 'frame',
					},
				],
			},
		};

		const state = buildTutorPanelState(payload);

		assert.ok(state.insight);
		assert.strictEqual(state.insight?.title, 'Runtime issue detected');
		assert.strictEqual(state.insight?.primaryIssue?.exceptionType, 'java.lang.ArithmeticException');
		assert.strictEqual(state.insight?.stackFrames.length, 1);
	});
});
