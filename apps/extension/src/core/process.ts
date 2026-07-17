import { spawn } from 'node:child_process';
import type { ProcessExecutionResult } from './types';

interface ExecuteProcessOptions {
	command: string;
	args: string[];
	cwd: string;
	timeoutMs?: number;
}

export async function executeProcess(options: ExecuteProcessOptions): Promise<ProcessExecutionResult> {
	const { command, args, cwd, timeoutMs } = options;
	const formattedCommand = formatCommand(command, args);

	return new Promise<ProcessExecutionResult>((resolve) => {
		const child = spawn(command, args, {
			cwd,
			windowsHide: true,
		});

		let stdout = '';
		let stderr = '';
		let resolved = false;
		let timedOut = false;
		let toolMissing = false;
		let timeoutHandle: NodeJS.Timeout | undefined;

		const finish = (exitCode: number | null) => {
			if (resolved) {
				return;
			}

			resolved = true;
			if (timeoutHandle) {
				clearTimeout(timeoutHandle);
			}

			resolve({
				command: formattedCommand,
				exitCode,
				stdout,
				stderr,
				timedOut,
				toolMissing,
			});
		};

		child.stdout.on('data', (chunk: Buffer | string) => {
			stdout += chunk.toString();
		});

		child.stderr.on('data', (chunk: Buffer | string) => {
			stderr += chunk.toString();
		});

		child.on('error', (error: NodeJS.ErrnoException) => {
			toolMissing = error.code === 'ENOENT';
			stderr += error.message;
			finish(null);
		});

		child.on('close', (exitCode) => {
			finish(exitCode);
		});

		if (timeoutMs && timeoutMs > 0) {
			timeoutHandle = setTimeout(() => {
				timedOut = true;
				child.kill();
			}, timeoutMs);
		}
	});
}

function formatCommand(command: string, args: string[]): string {
	return [command, ...args.map(quoteIfNeeded)].join(' ');
}

function quoteIfNeeded(value: string): string {
	return /\s/.test(value) ? `"${value}"` : value;
}
