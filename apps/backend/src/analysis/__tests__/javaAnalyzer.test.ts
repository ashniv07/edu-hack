import { describe, expect, it } from 'vitest';
import { javaAnalyzer } from '../javaAnalyzer.js';

describe('JavaAnalyzer', () => {
	it('classifies method access on null', async () => {
		const result = await javaAnalyzer.analyze('String s = null;\nSystem.out.println(s.length());', {
			raw: 'java.lang.NullPointerException', line: 2, column: 26, exceptionType: 'NullPointerException',
		});
		expect(result.concept).toBe('null_pointer_dereference');
		expect(result.memoryModel.pointers[0]?.state).toBe('null');
		expect(result.errorLine).toBe(2);
	});
});
