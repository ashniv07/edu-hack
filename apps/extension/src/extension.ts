import * as vscode from 'vscode';
import { runCurrentPythonFile } from './commands/runCurrentPythonFile';
import { getOutputChannel } from './core/outputChannel';
import { getLatestPayload } from './core/payloadBus';
import { openTutorPanel, registerTutorPanel } from './ui/tutorPanel';

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = getOutputChannel();
	outputChannel.appendLine('AI Tutor extension activated.');
	registerTutorPanel(context);

	const runCurrentPythonFileCommand = vscode.commands.registerCommand(
		'hackyay-ai-tutor.runCurrentPythonFile',
		() => runCurrentPythonFile(),
	);
	const openTutorPanelCommand = vscode.commands.registerCommand(
		'hackyay-ai-tutor.openTutorPanel',
		() => openTutorPanel({ payload: getLatestPayload() }),
	);

	context.subscriptions.push(runCurrentPythonFileCommand, openTutorPanelCommand, outputChannel);
}

export function deactivate() {}
