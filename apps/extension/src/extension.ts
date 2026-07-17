import * as vscode from 'vscode';
import { runCurrentPythonFile } from './commands/runCurrentPythonFile';
import { getOutputChannel } from './core/outputChannel';
import { getLatestPayload } from './core/payloadBus';
import { openTutorPanel } from './ui/tutorPanel';

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = getOutputChannel();
	outputChannel.appendLine('AI Tutor extension activated.');

	const runCurrentPythonFileCommand = vscode.commands.registerCommand(
		'hackyay-ai-tutor.runCurrentPythonFile',
		() => runCurrentPythonFile(context),
	);
	const openTutorPanelCommand = vscode.commands.registerCommand(
		'hackyay-ai-tutor.openTutorPanel',
		() => openTutorPanel({ context, payload: getLatestPayload() }),
	);

	context.subscriptions.push(runCurrentPythonFileCommand, openTutorPanelCommand, outputChannel);
}

export function deactivate() {}
