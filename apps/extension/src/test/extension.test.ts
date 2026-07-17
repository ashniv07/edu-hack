import * as assert from 'assert';
import { buildTutorPanelState } from '../tutor/buildTutorPanelState';
import type { ExecutionPayload } from '../core/types';

suite('AI Tutor Panel State', () => {
	test('builds a runtime failure insight from the payload', () => {
		const payload: ExecutionPayload = {
			file: {
				filePath: 'C:/repo/apps/extension/samples/divide-by-zero.py',
				fileName: 'divide-by-zero.py',
				directoryPath: 'C:/repo/apps/extension/samples',
				language: 'python',
				workspacePath: 'C:/repo',
			},
			source: 'print(1 / 0)\n',
			stage: 'runtime',
			success: false,
			runtime: {
				success: false,
				command: 'python divide-by-zero.py',
				exitCode: 1,
				stdout: '',
				stderr: 'ZeroDivisionError: division by zero',
				timedOut: false,
				toolMissing: false,
				primaryDiagnostic: {
					filePath: 'C:/repo/apps/extension/samples/divide-by-zero.py',
					line: 1,
					column: 9,
					severity: 'error',
					message: 'ZeroDivisionError: division by zero',
					raw: 'ZeroDivisionError: division by zero',
				},
				rootCause: {
					exceptionType: 'ZeroDivisionError',
					message: 'division by zero',
					filePath: 'C:/repo/apps/extension/samples/divide-by-zero.py',
					line: 1,
					column: 9,
					raw: 'ZeroDivisionError: division by zero',
				},
				stackFrames: [
					{
						filePath: 'C:/repo/apps/extension/samples/divide-by-zero.py',
						line: 1,
						column: 9,
						functionName: '<module>',
						sourceLine: 'print(1 / 0)',
						caretLine: '~~~~~~~^~~',
						raw: 'frame',
					},
				],
			},
		};

		const state = buildTutorPanelState(payload);

		assert.ok(state.insight);
		assert.strictEqual(state.insight?.title, 'Runtime issue detected');
		assert.strictEqual(state.insight?.primaryIssue?.exceptionType, 'ZeroDivisionError');
		assert.strictEqual(state.insight?.stackFrames.length, 1);
	});
});
