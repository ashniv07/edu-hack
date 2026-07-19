import { describe, expect, it } from 'vitest';
import { cAnalyzer } from '../cAnalyzer.js';

describe('CAnalyzer', () => {
	it('classifies an uninitialized pointer dereference as a null pointer failure', async () => {
		const result = await cAnalyzer.analyze('int *p;\nprintf("%d", *p);', {
			raw: 'Segmentation fault', line: 2, column: 15, signal: 'SEGV',
		});
		expect(result.concept).toBe('null_pointer_dereference');
		expect(result.memoryModel.pointers[0]?.state).toBe('null');
		expect(result.errorLine).toBe(2);
		expect(result.memoryModel.operations[0]?.kind).toBe('declare');
		expect(result.memoryModel.operations[1]?.kind).toBe('dereference');
	});

	it('classifies a dereference after free as a dangling pointer', async () => {
		const result = await cAnalyzer.analyze('int *p = malloc(sizeof(int));\nfree(p);\nprintf("%d", *p);', {
			raw: 'Segmentation fault', line: 3, column: 15, signal: 'SEGV',
		});
		expect(result.concept).toBe('dangling_pointer');
		expect(result.memoryModel.pointers[0]?.state).toBe('dangling');
	});
});
