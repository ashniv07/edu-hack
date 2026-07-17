import * as vscode from 'vscode';
import { clearDiagnostics, createDiagnosticCollection, showDiagnostics } from '../core/diagnostics';
import { getOutputChannel } from '../core/outputChannel';
import { sendPayload } from '../core/payloadBus';
import { runPythonFile } from '../core/pythonRunner';
import type { ExecutionPayload } from '../core/types';
import { openTutorPanel } from '../ui/tutorPanel';
import { getActivePythonFile } from '../utils/activeFile';

export async function runCurrentPythonFile(context: vscode.ExtensionContext): Promise<void> {
	const outputChannel = getOutputChannel();
	const diagnosticCollection = createDiagnosticCollection();
	const activeFile = await getActivePythonFile();

	if (!activeFile) {
		return;
	}

	const { document, fileInfo, source } = activeFile;
	clearDiagnostics(diagnosticCollection, document.uri);

	outputChannel.appendLine('');
	outputChannel.appendLine(`Running AI Tutor pipeline for ${fileInfo.fileName}`);

	const runtimeResult = await runPythonFile({
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
			'AI Tutor could not find Python. Install Python or set hackyayAiTutor.pythonPath in Settings.',
		);
		return;
	}

	if (runtimeResult.success) {
		await openTutorPanel({ context, payload });
		vscode.window.showInformationMessage('Python program ran successfully.');
		return;
	}

	if (runtimeResult.timedOut) {
		await openTutorPanel({ context, payload });
		vscode.window.showWarningMessage('Python program timed out. AI Tutor captured the failure details.');
		return;
	}

	await openTutorPanel({ context, payload });
	vscode.window.showWarningMessage('Python program failed. Review the AI Tutor panel and the Problems panel.');
}
