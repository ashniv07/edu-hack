import * as vscode from 'vscode';
import { analyzeWithBackend } from '../core/backendClient';
import { clearDiagnostics, createDiagnosticCollection, showDiagnostics } from '../core/diagnostics';
import { getOutputChannel } from '../core/outputChannel';
import { sendPayload } from '../core/payloadBus';
import { runSourceFile } from '../core/pythonRunner';
import type { ExecutionPayload } from '../core/types';
import { openTutorPanel } from '../ui/tutorPanel';
import { getActiveSourceFile } from '../utils/activeFile';

export async function runCurrentSourceFile(): Promise<void> {
	const outputChannel = getOutputChannel();
	const diagnosticCollection = createDiagnosticCollection();
	const activeFile = await getActiveSourceFile();

	if (!activeFile) {
		return;
	}

	const { document, fileInfo, source } = activeFile;
	const language = fileInfo.language;
	const languageLabel = language === 'python' ? 'Python' : 'Java';

	clearDiagnostics(diagnosticCollection, document.uri);

	outputChannel.appendLine('');
	outputChannel.appendLine(`Running AI Tutor pipeline for ${fileInfo.fileName}`);

	const runtimeResult = await runSourceFile({
		fileInfo,
		outputChannel,
	});

	if (runtimeResult.primaryDiagnostic) {
		showDiagnostics(diagnosticCollection, document.uri, [runtimeResult.primaryDiagnostic]);
	}

	const payload: ExecutionPayload = {
		file: fileInfo,
		source,
		stage: 'runtime',
		success: runtimeResult.success,
		runtime: runtimeResult,
	};

	sendPayload(payload, outputChannel);

	if (runtimeResult.toolMissing) {
		const toolName = language === 'python' ? 'Python' : 'Java';
		const settingName = language === 'python' ? 'pythonPath' : 'javaPath';
		vscode.window.showErrorMessage(
			`AI Tutor could not find ${toolName}. Install ${toolName} or set hackyayAiTutor.${settingName} in Settings.`,
		);
		return;
	}

	const backendResponse = await analyzeWithBackend({ payload, outputChannel });

	if (runtimeResult.success) {
		await openTutorPanel({ payload, backendResponse });
		vscode.window.showInformationMessage(`${languageLabel} program ran successfully.`);
		return;
	}

	if (runtimeResult.timedOut) {
		await openTutorPanel({ payload, backendResponse });
		vscode.window.showWarningMessage(`${languageLabel} program timed out. AI Tutor captured the failure details.`);
		return;
	}

	await openTutorPanel({ payload, backendResponse });
	vscode.window.showWarningMessage(`${languageLabel} program failed. Review the AI Tutor view and the Problems panel.`);
}

// Keep old function name for backwards compatibility
export const runCurrentJavaFile = runCurrentSourceFile;
