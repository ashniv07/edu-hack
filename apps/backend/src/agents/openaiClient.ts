import type { JsonSchemaDefinition } from './types.js';
import { loadBackendEnv } from './env.js';

interface ResponseOutputText {
	type: 'output_text';
	text: string;
}

interface ResponseOutputMessage {
	type: 'message';
	content?: ResponseOutputText[];
}

interface ResponseBody {
	output_text?: string;
	output?: ResponseOutputMessage[];
}

export async function requestStructuredJson<T>(
	systemPrompt: string,
	userPrompt: string,
	jsonSchema: JsonSchemaDefinition,
): Promise<T | undefined> {
	loadBackendEnv();
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		return undefined;
	}

	const model = process.env.OPENAI_MODEL ?? 'gpt-5.5';

	try {
		const response = await fetch('https://api.openai.com/v1/responses', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model,
				input: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userPrompt },
				],
				text: {
					format: {
						type: 'json_schema',
						name: jsonSchema.name,
						schema: jsonSchema.schema,
						strict: true,
					},
				},
			}),
		});

		if (!response.ok) {
			return undefined;
		}

		const body = (await response.json()) as ResponseBody;
		const text = body.output_text ?? body.output
			?.flatMap((item) => item.content ?? [])
			.find((item) => item.type === 'output_text')
			?.text;

		if (!text) {
			return undefined;
		}

		return JSON.parse(text) as T;
	} catch {
		return undefined;
	}
}
