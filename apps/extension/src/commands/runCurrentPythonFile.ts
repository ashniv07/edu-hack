import * as vscode from 'vscode';
import { clearDiagnostics, createDiagnosticCollection, showDiagnostics } from '../core/diagnostics';
import { getOutputChannel } from '../core/outputChannel';
import { sendPayload } from '../core/payloadBus';
import { runJavaFile } from '../core/pythonRunner';
import type { ExecutionPayload } from '../core/types';
import { openTutorPanel } from '../ui/tutorPanel';
import { getActiveJavaFile } from '../utils/activeFile';

export async function runCurrentJavaFile(): Promise<void> {
	const outputChannel = getOutputChannel();
	const diagnosticCollection = createDiagnosticCollection();
	const activeFile = await getActiveJavaFile();

	if (!activeFile) {
		return;
	}

	const { document, fileInfo, source } = activeFile;
	clearDiagnostics(diagnosticCollection, document.uri);

	outputChannel.appendLine('');
	outputChannel.appendLine(`Running AI Tutor pipeline for ${fileInfo.fileName}`);

	const runtimeResult = await runJavaFile({
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
		vscode.window.showErrorMessage(
			'AI Tutor could not find Java. Install a JDK or set hackyayAiTutor.javaPath in Settings.',
		);
		return;
	}

	if (runtimeResult.success) {
		await openTutorPanel({ payload });
		vscode.window.showInformationMessage('Java program ran successfully.');
		return;
	}

	if (runtimeResult.timedOut) {
		await openTutorPanel({ payload });
		vscode.window.showWarningMessage('Java program timed out. AI Tutor captured the failure details.');
		return;
	}

	await openTutorPanel({ payload });
	vscode.window.showWarningMessage('Java program failed. Review the AI Tutor view and the Problems panel.');
}
