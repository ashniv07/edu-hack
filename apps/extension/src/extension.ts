import * as vscode from 'vscode';
import { runCurrentJavaFile } from './commands/runCurrentPythonFile';
import { getOutputChannel } from './core/outputChannel';
import { getLatestPayload } from './core/payloadBus';
import { openTutorPanel, registerTutorPanel } from './ui/tutorPanel';
import {
	ErrorCodeLensProvider,
	ErrorDecorationProvider,
	ErrorHoverProvider,
	createErrorAnnotation,
} from './providers/errorCodeLensProvider';

// Global providers for error annotations
let codeLensProvider: ErrorCodeLensProvider;
let decorationProvider: ErrorDecorationProvider;
let hoverProvider: ErrorHoverProvider;

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = getOutputChannel();
	outputChannel.appendLine('AI Tutor extension activated.');
	registerTutorPanel(context);

	// Initialize inline annotation providers
	codeLensProvider = new ErrorCodeLensProvider();
	decorationProvider = new ErrorDecorationProvider();
	hoverProvider = new ErrorHoverProvider();

	// Register CodeLens provider for Python and Java files
	const codeLensDisposable = vscode.languages.registerCodeLensProvider(
		[{ language: 'python' }, { language: 'java' }],
		codeLensProvider
	);

	// Register Hover provider
	const hoverDisposable = vscode.languages.registerHoverProvider(
		[{ language: 'python' }, { language: 'java' }],
		hoverProvider
	);

	// Command: Run current file
	const runCurrentPythonFileCommand = vscode.commands.registerCommand(
		'hackyay-ai-tutor.runCurrentPythonFile',
		() => runCurrentJavaFile(),
	);

	// Command: Open tutor panel
	const openTutorPanelCommand = vscode.commands.registerCommand(
		'hackyay-ai-tutor.openTutorPanel',
		() => openTutorPanel({ payload: getLatestPayload() }),
	);

	// Command: Show hint (from CodeLens)
	const showHintCommand = vscode.commands.registerCommand(
		'hackyay-ai-tutor.showHint',
		(level: number) => {
			// Open tutor panel and scroll to hints section
			openTutorPanel({ payload: getLatestPayload() });
			vscode.window.showInformationMessage(`AI Tutor: Showing hint level ${level}`);
		}
	);

	// Command: Open visualization (from CodeLens)
	const openVisualizationCommand = vscode.commands.registerCommand(
		'hackyay-ai-tutor.openVisualization',
		() => {
			// Open tutor panel focused on visualization
			openTutorPanel({ payload: getLatestPayload() });
		}
	);

	// Command: Apply suggested fix (from CodeLens)
	const applySuggestedFixCommand = vscode.commands.registerCommand(
		'hackyay-ai-tutor.applySuggestedFix',
		async (errorAnnotation: any) => {
			// Show quick fix suggestions
			const selection = await vscode.window.showQuickPick(
				[
					{ label: 'View in AI Tutor', description: 'Get detailed explanation' },
					{ label: 'Learn concept', description: `Understand ${errorAnnotation.concept}` },
				],
				{ placeHolder: 'How would you like to fix this?' }
			);

			if (selection?.label === 'View in AI Tutor') {
				openTutorPanel({ payload: getLatestPayload() });
			}
		}
	);

	// Command: Clear error annotations
	const clearAnnotationsCommand = vscode.commands.registerCommand(
		'hackyay-ai-tutor.clearAnnotations',
		() => {
			codeLensProvider.clearErrors();
			hoverProvider.clearErrors();
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				decorationProvider.clearDecorations(editor);
			}
		}
	);

	context.subscriptions.push(
		runCurrentPythonFileCommand,
		openTutorPanelCommand,
		showHintCommand,
		openVisualizationCommand,
		applySuggestedFixCommand,
		clearAnnotationsCommand,
		codeLensDisposable,
		hoverDisposable,
		outputChannel
	);
}

/**
 * Update error annotations when an error is detected
 * Called from the tutor panel or file runner
 */
export function updateErrorAnnotations(
	filePath: string,
	errorType: string,
	errorLine: number,
	message: string
) {
	const annotation = createErrorAnnotation(filePath, errorType, errorLine, message);

	codeLensProvider.updateError(annotation);
	hoverProvider.updateError(annotation);

	// Apply decorations to the active editor
	const editor = vscode.window.activeTextEditor;
	if (editor && editor.document.uri.fsPath === filePath) {
		decorationProvider.applyDecorations(editor, errorLine);
	}
}

/**
 * Clear all error annotations
 */
export function clearErrorAnnotations() {
	codeLensProvider.clearErrors();
	hoverProvider.clearErrors();
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		decorationProvider.clearDecorations(editor);
	}
}

export function deactivate() {
	if (decorationProvider) {
		decorationProvider.dispose();
	}
}
