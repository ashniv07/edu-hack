import { analyzeExecution } from './index.js';
import type { BackendExecutionPayload } from './types.js';

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
console.log(JSON.stringify(response, null, 2));
