import * as vscode from 'vscode';
import { parseJavaStackTrace, parsePythonTraceback } from './diagnostics';
import { getOutputChannel } from './outputChannel';
import { executeProcess } from './process';
import type { FileInfo, RuntimeResult } from './types';

interface RunFileOptions {
	fileInfo: FileInfo;
	outputChannel?: vscode.OutputChannel;
}

export async function runSourceFile(options: RunFileOptions): Promise<RuntimeResult> {
	const { fileInfo } = options;

	if (fileInfo.language === 'python') {
		return runPythonFile(options);
	}
	return runJavaFile(options);
}

async function runPythonFile(options: RunFileOptions): Promise<RuntimeResult> {
	const { fileInfo } = options;
	const outputChannel = options.outputChannel ?? getOutputChannel();
	const config = vscode.workspace.getConfiguration('hackyayAiTutor');
	const pythonPath = config.get<string>('pythonPath', 'python3');
	const timeoutMs = config.get<number>('runtimeTimeoutMs', 5000);

	const processResult = await executeProcess({
		command: pythonPath,
		args: [fileInfo.filePath],
		cwd: fileInfo.directoryPath,
		timeoutMs,
	});

	outputChannel.appendLine(`Runtime command: ${processResult.command}`);
	appendProcessLogs(outputChannel, 'Runtime stdout', processResult.stdout);
	appendProcessLogs(outputChannel, 'Runtime stderr', processResult.stderr);
	const parsedTraceback = parsePythonTraceback(processResult.stderr);

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

export async function runJavaFile(options: RunFileOptions): Promise<RuntimeResult> {
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
