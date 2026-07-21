import * as vscode from 'vscode';
import type { FileInfo } from '../core/types';

interface ActiveSourceFile {
	document: vscode.TextDocument;
	fileInfo: FileInfo;
	source: string;
}

const SUPPORTED_LANGUAGES = ['python', 'java'] as const;
const SUPPORTED_EXTENSIONS = ['.py', '.java'] as const;

function getLanguageFromDocument(document: vscode.TextDocument): 'python' | 'java' | null {
	if (document.languageId === 'python' || document.fileName.endsWith('.py')) {
		return 'python';
	}
	if (document.languageId === 'java' || document.fileName.endsWith('.java')) {
		return 'java';
	}
	return null;
}

function isSupportedFile(document: vscode.TextDocument): boolean {
	return getLanguageFromDocument(document) !== null;
}

export async function getActiveSourceFile(): Promise<ActiveSourceFile | undefined> {
	const editor = getPreferredEditor();
	if (!editor) {
		vscode.window.showErrorMessage('Open a Python or Java file before running AI Tutor.');
		return undefined;
	}

	const { document } = editor;
	if (document.isUntitled) {
		vscode.window.showErrorMessage('Save the file before running AI Tutor.');
		return undefined;
	}

	const language = getLanguageFromDocument(document);
	if (!language) {
		vscode.window.showErrorMessage('AI Tutor supports Python (.py) and Java (.java) files.');
		return undefined;
	}

	if (document.isDirty) {
		const saved = await document.save();
		if (!saved) {
			vscode.window.showWarningMessage('Save the file to run the latest source.');
			return undefined;
		}
	}

	const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
	const fileInfo: FileInfo = {
		filePath: document.uri.fsPath,
		fileName: document.fileName.split(/[\\/]/).pop() ?? document.fileName,
		directoryPath: document.uri.fsPath.replace(/[\\/][^\\/]+$/, ''),
		language,
		workspacePath: workspaceFolder?.uri.fsPath,
	};

	return {
		document,
		fileInfo,
		source: document.getText(),
	};
}

// Keep old function name for backwards compatibility
export const getActiveJavaFile = getActiveSourceFile;

function getPreferredEditor(): vscode.TextEditor | undefined {
	const activeEditor = vscode.window.activeTextEditor;
	if (activeEditor && isSupportedFile(activeEditor.document)) {
		return activeEditor;
	}

	return vscode.window.visibleTextEditors.find((editor) => isSupportedFile(editor.document));
}
