import { describe, expect, it } from 'vitest';
import { pythonAnalyzer } from '../pythonAnalyzer.js';

describe('PythonAnalyzer', () => {
	it('classifies attribute access on None', async () => {
		const result = await pythonAnalyzer.analyze('x = None\nprint(x.value)', {
			raw: "AttributeError: 'NoneType' object has no attribute 'value'", line: 2, column: 7, exceptionType: 'AttributeError',
		});
		expect(result.concept).toBe('none_attribute_access');
		expect(result.memoryModel.pointers[0]?.state).toBe('null');
		expect(result.errorLine).toBe(2);
	});
});
