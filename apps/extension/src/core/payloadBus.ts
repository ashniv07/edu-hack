import * as vscode from 'vscode';
import type { ExecutionPayload } from './types';

const payloadEmitter = new vscode.EventEmitter<ExecutionPayload>();
let latestPayload: ExecutionPayload | undefined;

export const onPayload = payloadEmitter.event;

export function getLatestPayload(): ExecutionPayload | undefined {
	return latestPayload;
}

export function sendPayload(payload: ExecutionPayload, outputChannel: vscode.OutputChannel): void {
	latestPayload = payload;
	payloadEmitter.fire(payload);
	outputChannel.appendLine('Payload ready for downstream modules:');
	outputChannel.appendLine(JSON.stringify(payload, null, 2));
}
