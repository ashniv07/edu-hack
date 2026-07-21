import type { JsonSchemaDefinition } from './types.js';

const stringArray = {
	type: 'array',
	items: { type: 'string' },
} as const;

export const errorAnalysisSchema: JsonSchemaDefinition = {
	name: 'error_analysis',
	schema: {
		type: 'object',
		additionalProperties: false,
		required: [
			'concept',
			'difficulty',
			'misconception',
			'learningObjective',
			'confidence',
			'evidence',
			'needsAnalogy',
			'needsQuiz',
		],
		properties: {
			concept: { type: 'string' },
			difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
			misconception: { type: 'string' },
			learningObjective: { type: 'string' },
			confidence: { type: 'number', minimum: 0, maximum: 1 },
			evidence: stringArray,
			needsAnalogy: { type: 'boolean' },
			needsQuiz: { type: 'boolean' },
		},
	},
};

export const visualizationPlanSchema: JsonSchemaDefinition = {
	name: 'visualization_plan',
	schema: {
		type: 'object',
		additionalProperties: false,
		required: ['type', 'title', 'description', 'highlight', 'interactive', 'focusLine', 'steps'],
		properties: {
			type: { type: 'string', enum: ['value_flow', 'memory_map', 'traceback_stack', 'loop_timeline'] },
			title: { type: 'string' },
			description: { type: 'string' },
			highlight: stringArray,
			interactive: { type: 'boolean' },
			focusLine: { type: 'number' },
			steps: stringArray,
		},
	},
};

export const tutorHintSchema: JsonSchemaDefinition = {
	name: 'tutor_hint',
	schema: {
		type: 'object',
		additionalProperties: false,
		required: ['hint', 'nextAction', 'guidedSteps', 'revealLevel'],
		properties: {
			hint: { type: 'string' },
			nextAction: { type: 'string' },
			guidedSteps: stringArray,
			revealLevel: { type: 'string', enum: ['hint', 'guided', 'explain'] },
		},
	},
};

export const analogySchema: JsonSchemaDefinition = {
	name: 'analogy',
	schema: {
		type: 'object',
		additionalProperties: false,
		required: ['analogy', 'mapping', 'caution'],
		properties: {
			analogy: { type: 'string' },
			mapping: stringArray,
			caution: { type: 'string' },
		},
	},
};

export const quizSchema: JsonSchemaDefinition = {
	name: 'quiz',
	schema: {
		type: 'object',
		additionalProperties: false,
		required: ['question', 'choices', 'correctAnswer', 'explanation'],
		properties: {
			question: { type: 'string' },
			choices: stringArray,
			correctAnswer: { type: 'string' },
			explanation: { type: 'string' },
		},
	},
};
