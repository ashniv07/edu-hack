import * as vscode from 'vscode';
import { parseJavaStackTrace } from './diagnostics';
import { getOutputChannel } from './outputChannel';
import { executeProcess } from './process';
import type { FileInfo, RuntimeResult } from './types';

interface RunJavaFileOptions {
	fileInfo: FileInfo;
	outputChannel?: vscode.OutputChannel;
}

export async function runJavaFile(options: RunJavaFileOptions): Promise<RuntimeResult> {
	const { fileInfo } = options;
	const outputChannel = options.outputChannel ?? getOutputChannel();
	const config = vscode.workspace.getConfiguration('hackyayAiTutor');
	const javaPath = config.get<string>('javaPath', 'java');
	const timeoutMs = config.get<number>('runtimeTimeoutMs', 5000);

	const processResult = await executeProcess({
		command: javaPath,
		args: [fileInfo.filePath],
		cwd: fileInfo.directoryPath,
		timeoutMs,
	});

	outputChannel.appendLine(`Runtime command: ${processResult.command}`);
	appendProcessLogs(outputChannel, 'Runtime stdout', processResult.stdout);
	appendProcessLogs(outputChannel, 'Runtime stderr', processResult.stderr);
	const parsedTraceback = parseJavaStackTrace(processResult.stderr);

	return {
		success: processResult.exitCode === 0 && !processResult.timedOut && !processResult.toolMissing,
		command: processResult.command,
		exitCode: processResult.exitCode,
		stdout: processResult.stdout,
		stderr: processResult.stderr,
		timedOut: processResult.timedOut,
		toolMissing: processResult.toolMissing,
		primaryDiagnostic: parsedTraceback.primaryDiagnostic,
		rootCause: parsedTraceback.rootCause,
		stackFrames: parsedTraceback.stackFrames,
	};
}

function appendProcessLogs(outputChannel: vscode.OutputChannel, label: string, value: string): void {
	if (!value.trim()) {
		return;
	}

	outputChannel.appendLine(`${label}:`);
	outputChannel.appendLine(value.trimEnd());
}
