import * as vscode from 'vscode';
import type { FileInfo } from '../core/types';

interface ActiveJavaFile {
	document: vscode.TextDocument;
	fileInfo: FileInfo;
	source: string;
}

export async function getActiveJavaFile(): Promise<ActiveJavaFile | undefined> {
	const editor = getPreferredJavaEditor();
	if (!editor) {
		vscode.window.showErrorMessage('Open a Java file before running AI Tutor.');
		return undefined;
	}

	const { document } = editor;
	if (document.isUntitled) {
		vscode.window.showErrorMessage('Save the Java file before running AI Tutor.');
		return undefined;
	}

	if (document.languageId !== 'java' && !document.fileName.endsWith('.java')) {
		vscode.window.showErrorMessage('AI Tutor currently supports .java files only.');
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
		language: 'java',
		workspacePath: workspaceFolder?.uri.fsPath,
	};

	return {
		document,
		fileInfo,
		source: document.getText(),
	};
}

function getPreferredJavaEditor(): vscode.TextEditor | undefined {
	const activeEditor = vscode.window.activeTextEditor;
	if (activeEditor) {
		return activeEditor;
	}

	return vscode.window.visibleTextEditors.find((editor) => {
		const { document } = editor;
		return document.languageId === 'java' || document.fileName.endsWith('.java');
	});
}
