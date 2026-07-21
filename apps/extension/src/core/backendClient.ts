import * as vscode from 'vscode';
import type { BackendTutorResponse } from '../tutor/types';
import type { ExecutionPayload } from './types';

interface AnalyzeWithBackendOptions {
	payload: ExecutionPayload;
	outputChannel: vscode.OutputChannel;
}

export async function analyzeWithBackend(
	options: AnalyzeWithBackendOptions,
): Promise<BackendTutorResponse | undefined> {
	const backendUrl = getBackendUrl();
	const endpoint = `${backendUrl}/analyze`;

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(options.payload),
		});

		if (!response.ok) {
			options.outputChannel.appendLine(`Backend analysis failed with HTTP ${response.status}.`);
			return undefined;
		}

		const result = await response.json() as BackendTutorResponse;
		options.outputChannel.appendLine('Backend analysis response:');
		options.outputChannel.appendLine(JSON.stringify(result, null, 2));
		return result;
	} catch (error) {
		options.outputChannel.appendLine(
			`Backend analysis unavailable: ${error instanceof Error ? error.message : String(error)}`,
		);
		return undefined;
	}
}

function getBackendUrl(): string {
	const config = vscode.workspace.getConfiguration('hackyayAiTutor');
	return config.get<string>('backendUrl', 'http://localhost:3001').replace(/\/+$/, '');
}
