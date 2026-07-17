import * as vscode from 'vscode';
import type { DiagnosticItem, DiagnosticSeverityLabel, RootCause, TracebackFrame } from './types';

let diagnosticCollection: vscode.DiagnosticCollection | undefined;

const PYTHON_FRAME_PATTERN = /^\s*File "(.+?)", line (\d+)(?:, in (.+))?$/;
const PYTHON_EXCEPTION_PATTERN = /^([A-Za-z_][\w.]*(?:Error|Exception|Warning)):\s+(.*)$/;

export interface ParsedPythonTraceback {
	primaryDiagnostic?: DiagnosticItem;
	rootCause?: RootCause;
	stackFrames: TracebackFrame[];
}

export function createDiagnosticCollection(): vscode.DiagnosticCollection {
	if (!diagnosticCollection) {
		diagnosticCollection = vscode.languages.createDiagnosticCollection('hackyay-ai-tutor');
	}

	return diagnosticCollection;
}

export function clearDiagnostics(collection: vscode.DiagnosticCollection, uri: vscode.Uri): void {
	collection.delete(uri);
}

export function showDiagnostics(
	collection: vscode.DiagnosticCollection,
	uri: vscode.Uri,
	items: DiagnosticItem[],
): void {
	const diagnostics = items
		.filter((item) => !item.filePath || normalizePath(item.filePath) === normalizePath(uri.fsPath))
		.map((item) => {
			const lineIndex = Math.max(item.line - 1, 0);
			const columnIndex = Math.max(item.column - 1, 0);
			const range = new vscode.Range(lineIndex, columnIndex, lineIndex, columnIndex + 1);
			const diagnostic = new vscode.Diagnostic(range, item.message, toVscodeSeverity(item.severity));
			if (item.code) {
				diagnostic.code = item.code;
			}

			return diagnostic;
		});

	collection.set(uri, diagnostics);
}

export function parseCompilerDiagnostics(output: string): DiagnosticItem[] {
	const parsed = parsePythonTraceback(output);
	return parsed.primaryDiagnostic ? [parsed.primaryDiagnostic] : [];
}

export function parsePythonDiagnostics(output: string): DiagnosticItem[] {
	const parsed = parsePythonTraceback(output);
	return parsed.primaryDiagnostic ? [parsed.primaryDiagnostic] : [];
}

export function parsePythonTraceback(output: string): ParsedPythonTraceback {
	const lines = output.split(/\r?\n/);
	const stackFrames: TracebackFrame[] = [];

	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index]?.trimEnd() ?? '';
		const frameMatch = line.match(PYTHON_FRAME_PATTERN);
		if (!frameMatch) {
			continue;
		}

		const [, filePath, lineValue, functionName] = frameMatch;
		const sourceLine = lines[index + 1] ?? '';
		const caretLine = lines[index + 2] ?? '';

		stackFrames.push({
			filePath,
			line: Number(lineValue),
			column: getCaretColumn(caretLine, sourceLine),
			functionName,
			sourceLine: sourceLine.trim() || undefined,
			caretLine: caretLine.trim() || undefined,
			raw: [line, sourceLine, caretLine].filter(Boolean).join('\n'),
		});
	}

	let lastLine: string | undefined;
	for (let index = lines.length - 1; index >= 0; index -= 1) {
		const candidate = lines[index];
		if (candidate && PYTHON_EXCEPTION_PATTERN.test(candidate.trim())) {
			lastLine = candidate;
			break;
		}
	}

	if (!lastLine) {
		return { stackFrames };
	}

	const exceptionMatch = lastLine.trim().match(PYTHON_EXCEPTION_PATTERN);
	if (!exceptionMatch) {
		return { stackFrames };
	}

	let deepestFrame: TracebackFrame | undefined;
	for (let index = stackFrames.length - 1; index >= 0; index -= 1) {
		const candidate = stackFrames[index];
		if (candidate) {
			deepestFrame = candidate;
			break;
		}
	}

	if (!deepestFrame) {
		return { stackFrames };
	}

	const [exceptionType, exceptionMessage] = [exceptionMatch[1], exceptionMatch[2]];
	const rootCause: RootCause = {
		exceptionType,
		message: exceptionMessage,
		filePath: deepestFrame.filePath,
		line: deepestFrame.line,
		column: deepestFrame.column,
		raw: [deepestFrame.raw, lastLine.trim()].filter(Boolean).join('\n'),
	};

	const primaryDiagnostic: DiagnosticItem = {
		filePath: deepestFrame.filePath,
		line: deepestFrame.line,
		column: deepestFrame.column,
		severity: 'error',
		message: `${exceptionType}: ${exceptionMessage}`,
		raw: rootCause.raw,
	};

	return {
		primaryDiagnostic,
		rootCause,
		stackFrames,
	};
}

function toVscodeSeverity(severity: DiagnosticSeverityLabel): vscode.DiagnosticSeverity {
	switch (severity) {
		case 'warning':
			return vscode.DiagnosticSeverity.Warning;
		case 'info':
			return vscode.DiagnosticSeverity.Information;
		default:
			return vscode.DiagnosticSeverity.Error;
	}
}

function getCaretColumn(caretLine: string, sourceLine: string): number {
	const caretIndex = caretLine.indexOf('^');
	if (caretIndex >= 0) {
		return caretIndex + 1;
	}

	const trimmedSource = sourceLine.trimStart();
	const leadingWhitespace = sourceLine.length - trimmedSource.length;
	return leadingWhitespace + 1;
}

function normalizePath(value: string): string {
	return value.replace(/\\/g, '/').toLowerCase();
}
