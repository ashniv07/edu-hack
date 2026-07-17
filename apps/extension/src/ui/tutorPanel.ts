import * as vscode from 'vscode';
import type { ExecutionPayload } from '../core/types';
import { buildTutorPanelState } from '../tutor/buildTutorPanelState';
import type { TutorPanelState } from '../tutor/types';

interface OpenTutorPanelOptions {
	context?: vscode.ExtensionContext;
	payload?: ExecutionPayload;
}

let panel: vscode.WebviewPanel | undefined;
let extensionUri: vscode.Uri | undefined;

export async function openTutorPanel(options: OpenTutorPanelOptions): Promise<void> {
	if (options.context) {
		extensionUri = options.context.extensionUri;
	}

	if (!extensionUri) {
		vscode.window.showErrorMessage('AI Tutor panel is not ready yet. Run the extension command again.');
		return;
	}

	const state = buildTutorPanelState(options.payload);

	if (!panel) {
		panel = vscode.window.createWebviewPanel('aiTutorPanel', 'AI Tutor', vscode.ViewColumn.Beside, {
			enableScripts: true,
			retainContextWhenHidden: true,
		});

		panel.onDidDispose(() => {
			panel = undefined;
		});
	}

	panel.title = state.insight?.primaryIssue?.exceptionType
		? `AI Tutor: ${state.insight.primaryIssue.exceptionType}`
		: 'AI Tutor';
	panel.webview.html = getWebviewHtml(panel.webview, extensionUri, state);
	panel.reveal(vscode.ViewColumn.Beside, false);
}

function getWebviewHtml(webview: vscode.Webview, currentExtensionUri: vscode.Uri, state: TutorPanelState): string {
	const scriptUri = webview.asWebviewUri(
		vscode.Uri.joinPath(currentExtensionUri, 'apps', 'extension', 'dist', 'webview.js'),
	);
	const nonce = getNonce();
	const serializedState = JSON.stringify(state).replace(/</g, '\\u003c');

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta
		http-equiv="Content-Security-Policy"
		content="default-src 'none'; img-src ${webview.cspSource} https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';"
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>AI Tutor</title>
</head>
<body>
	<div id="root"></div>
	<script nonce="${nonce}">
		window.__AI_TUTOR_STATE__ = ${serializedState};
	</script>
	<script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

function getNonce(): string {
	const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let nonce = '';

	for (let index = 0; index < 32; index += 1) {
		nonce += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
	}

	return nonce;
}
