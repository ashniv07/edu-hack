import * as vscode from 'vscode';
import type { FileInfo } from '../core/types';

interface ActivePythonFile {
	document: vscode.TextDocument;
	fileInfo: FileInfo;
	source: string;
}

export async function getActivePythonFile(): Promise<ActivePythonFile | undefined> {
	const editor = getPreferredPythonEditor();
	if (!editor) {
		vscode.window.showErrorMessage('Open a Python file before running AI Tutor.');
		return undefined;
	}

	const { document } = editor;
	if (document.isUntitled) {
		vscode.window.showErrorMessage('Save the Python file before running AI Tutor.');
		return undefined;
	}

	if (document.languageId !== 'python' && !document.fileName.endsWith('.py')) {
		vscode.window.showErrorMessage('AI Tutor currently supports .py files only.');
		return undefined;
	}

	if (document.isDirty) {
		const saved = await document.save();
		if (!saved) {
			vscode.window.showWarningMessage('Save the file to run the latest Python source.');
			return undefined;
		}
	}

	const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
	const fileInfo: FileInfo = {
		filePath: document.uri.fsPath,
		fileName: document.fileName.split(/[\\/]/).pop() ?? document.fileName,
		directoryPath: document.uri.fsPath.replace(/[\\/][^\\/]+$/, ''),
		language: 'python',
		workspacePath: workspaceFolder?.uri.fsPath,
	};

	return {
		document,
		fileInfo,
		source: document.getText(),
	};
}

function getPreferredPythonEditor(): vscode.TextEditor | undefined {
	const activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		return activeEditor;
	}

	return vscode.window.visibleTextEditors.find((editor) => {
		const { document } = editor;
		return document.languageId === 'python' || document.fileName.endsWith('.py');
	});
}
