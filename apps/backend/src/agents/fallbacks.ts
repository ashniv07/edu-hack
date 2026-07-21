import type {
	AnalogyResult,
	ErrorAnalysisResult,
	QuizResult,
	TeachingAgentContext,
	TutorHintResult,
	VisualizationPlanResult,
} from './types.js';

export function inferConcept(context: TeachingAgentContext): string {
	const exceptionType = context.exceptionType ?? '';
	const errorText = context.errorText;

	if (/ArithmeticException|ZeroDivisionError|division by zero|\/ by zero/i.test(`${exceptionType}\n${errorText}`)) {
		return 'division_by_zero';
	}

	if (/NullPointerException|AttributeError|NoneType|null pointer|null_pointer/i.test(`${exceptionType}\n${errorText}`)) {
		return 'null_pointer_dereference';
	}

	if (/IndexError|ArrayIndexOutOfBoundsException|index out of bounds/i.test(`${exceptionType}\n${errorText}`)) {
		return 'index_out_of_bounds';
	}

	if (/ConcurrentModificationException/i.test(`${exceptionType}\n${errorText}`)) {
		return 'concurrent_modification';
	}

	if (/timeout|timed out/i.test(errorText) || context.payload.runtime.timedOut) {
		return 'non_terminating_execution';
	}

	return 'runtime_error';
}

export function fallbackErrorAnalysis(context: TeachingAgentContext): ErrorAnalysisResult {
	const concept = inferConcept(context);
	const byConcept: Record<string, Omit<ErrorAnalysisResult, 'concept' | 'evidence' | 'confidence'>> = {
		division_by_zero: {
			difficulty: 'beginner',
			misconception: 'The student may assume the divisor is always non-zero without validating the value at runtime.',
			learningObjective: 'Check divisor values before division and add a guard for zero.',
			needsAnalogy: false,
			needsQuiz: true,
		},
		null_pointer_dereference: {
			difficulty: 'beginner',
			misconception: 'The student may think a reference or pointer automatically points to a usable object.',
			learningObjective: 'Confirm that a reference points to valid memory before dereferencing it.',
			needsAnalogy: true,
			needsQuiz: true,
		},
		index_out_of_bounds: {
			difficulty: 'beginner',
			misconception: 'The student may be using a position without comparing it to the collection length.',
			learningObjective: 'Relate valid indexes to collection size and check bounds before access.',
			needsAnalogy: false,
			needsQuiz: true,
		},
		concurrent_modification: {
			difficulty: 'intermediate',
			misconception: 'The student may not realize that changing a collection while iterating can invalidate the iterator.',
			learningObjective: 'Use safe iteration patterns when removing or adding collection items.',
			needsAnalogy: true,
			needsQuiz: true,
		},
		non_terminating_execution: {
			difficulty: 'intermediate',
			misconception: 'The student may expect a loop or recursive call to stop without proving progress toward a base case.',
			learningObjective: 'Identify the condition that changes on every iteration and reaches termination.',
			needsAnalogy: true,
			needsQuiz: false,
		},
		runtime_error: {
			difficulty: 'beginner',
			misconception: 'The student may be focusing on the symptom instead of the value or call path that caused it.',
			learningObjective: 'Use the stack trace and failing line to isolate the first invalid assumption.',
			needsAnalogy: false,
			needsQuiz: false,
		},
	};
	const template = byConcept[concept] ?? byConcept.runtime_error;

	return {
		concept,
		...template,
		confidence: concept === 'runtime_error' ? 0.45 : 0.86,
		evidence: [
			context.exceptionType ? `Exception: ${context.exceptionType}` : 'No specific exception type was parsed.',
			`Failing line: ${context.errorLine}`,
			context.errorText ? `Runtime output mentions: ${context.errorText.split(/\r?\n/).at(-1)}` : 'No stderr text was captured.',
		],
	};
}

export function fallbackVisualizationPlan(
	context: TeachingAgentContext,
	errorAnalysis: ErrorAnalysisResult,
): VisualizationPlanResult {
	const concept = errorAnalysis.concept;
	const type = concept.includes('pointer') ? 'memory_map'
		: concept === 'non_terminating_execution' ? 'loop_timeline'
		: concept === 'division_by_zero' ? 'value_flow'
		: 'traceback_stack';

	return {
		type,
		title: type === 'memory_map' ? 'Memory reference map'
			: type === 'loop_timeline' ? 'Loop progress timeline'
			: type === 'value_flow' ? 'Value flow to the failing operation'
			: 'Traceback stack walkthrough',
		description: `Show how the program reaches ${errorAnalysis.concept} at line ${context.errorLine}.`,
		highlight: [
			`line:${context.errorLine}`,
			errorAnalysis.concept,
			context.exceptionType ?? 'runtime-error',
		],
		interactive: true,
		focusLine: context.errorLine,
		steps: [
			'Start from the last normal value before the failure.',
			'Move to the operation on the failing line.',
			'Highlight the invalid assumption that made the operation unsafe.',
		],
	};
}

export function fallbackTutorHint(
	context: TeachingAgentContext,
	errorAnalysis: ErrorAnalysisResult,
): TutorHintResult {
	const conceptHints: Record<string, string> = {
		division_by_zero: 'Before changing the formula, inspect the value used as the divisor on the failing line.',
		null_pointer_dereference: 'Find where this reference is assigned, then verify that it points to a real object before it is used.',
		index_out_of_bounds: 'Compare the index value with the valid range of the collection right before the access happens.',
		concurrent_modification: 'Look for a place where the collection changes while the loop is still using its iterator.',
		non_terminating_execution: 'Identify the variable that should move the loop toward stopping and check whether it changes every time.',
		runtime_error: 'Use the deepest stack frame first, then inspect the values used by that exact line.',
	};

	return {
		hint: conceptHints[errorAnalysis.concept] ?? conceptHints.runtime_error,
		nextAction: `Inspect line ${context.errorLine} and write down the value or reference that must be valid for it to work.`,
		guidedSteps: [
			'Read the deepest stack frame first.',
			'Name the exact operation that failed.',
			'Trace backward to where the input to that operation was created or changed.',
		],
		revealLevel: errorAnalysis.difficulty === 'advanced' ? 'guided' : 'hint',
	};
}

export function fallbackAnalogy(errorAnalysis: ErrorAnalysisResult): AnalogyResult {
	if (errorAnalysis.concept === 'null_pointer_dereference') {
		return {
			analogy: 'A reference is like an address written on a note. If the note is blank, going to that address cannot work.',
			mapping: ['Blank note = null reference', 'Going to the address = dereferencing', 'Real address = initialized object'],
			caution: 'The analogy explains validity, but real programs also have types and lifetimes.',
		};
	}

	return {
		analogy: 'Debugging a runtime error is like following a receipt backward from the failed checkout item to where it entered the cart.',
		mapping: ['Failed checkout item = runtime error', 'Receipt line = stack frame', 'Cart action = earlier assignment or call'],
		caution: 'The analogy is only a guide; the stack trace is the source of truth.',
	};
}

export function fallbackQuiz(errorAnalysis: ErrorAnalysisResult): QuizResult {
	if (errorAnalysis.concept === 'division_by_zero') {
		return {
			question: 'What should you check before performing division?',
			choices: ['Whether the divisor can be zero', 'Whether the file name is correct', 'Whether stdout is empty'],
			correctAnswer: 'Whether the divisor can be zero',
			explanation: 'Division fails when the divisor is zero, so the value must be validated or guarded.',
		};
	}

	if (errorAnalysis.concept === 'null_pointer_dereference') {
		return {
			question: 'What makes dereferencing a reference unsafe?',
			choices: ['It is null or not initialized', 'It has a short variable name', 'It appears in a print statement'],
			correctAnswer: 'It is null or not initialized',
			explanation: 'Dereferencing only works when the reference points to a valid object or memory location.',
		};
	}

	return {
		question: 'What is the best first debugging step after a runtime error?',
		choices: ['Inspect the failing line and its input values', 'Delete the stack trace', 'Change unrelated code'],
		correctAnswer: 'Inspect the failing line and its input values',
		explanation: 'The failing line and stack trace identify the operation and call path that need investigation.',
	};
}
