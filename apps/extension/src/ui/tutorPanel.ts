import * as vscode from 'vscode';
import type { ExecutionPayload } from '../core/types';
import { buildTutorPanelState } from '../tutor/buildTutorPanelState';
import type { TutorPanelState } from '../tutor/types';

const TUTOR_CONTAINER_ID = 'ai-tutor';
const TUTOR_VIEW_ID = 'aiTutorView';

let tutorSidebarProvider: TutorSidebarProvider | undefined;

export function registerTutorPanel(context: vscode.ExtensionContext): void {
	if (tutorSidebarProvider) {
		return;
	}

	tutorSidebarProvider = new TutorSidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(TUTOR_VIEW_ID, tutorSidebarProvider, {
			webviewOptions: {
				retainContextWhenHidden: true,
			},
		}),
	);
}

export async function openTutorPanel(options: { payload?: ExecutionPayload } = {}): Promise<void> {
	if (!tutorSidebarProvider) {
		vscode.window.showErrorMessage('AI Tutor view is not ready yet. Reload the extension and try again.');
		return;
	}

	await tutorSidebarProvider.show(options.payload);
}

class TutorSidebarProvider implements vscode.WebviewViewProvider {
	private readonly extensionUri: vscode.Uri;
	private state: TutorPanelState = {};
	private view: vscode.WebviewView | undefined;

	constructor(extensionUri: vscode.Uri) {
		this.extensionUri = extensionUri;
	}

	async show(payload?: ExecutionPayload): Promise<void> {
		this.state = buildTutorPanelState(payload);
		await vscode.commands.executeCommand(`workbench.view.extension.${TUTOR_CONTAINER_ID}`);

		try {
			await vscode.commands.executeCommand(`${TUTOR_VIEW_ID}.focus`);
		} catch {
			// Focusing the view is best-effort; the sidebar container reveal matters most.
		}

		this.render();
	}

	resolveWebviewView(view: vscode.WebviewView): void {
		this.view = view;
		view.title = 'AI Tutor';
		view.webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'apps', 'extension', 'dist')],
		};

		this.render();
	}

	private render(): void {
		if (!this.view) {
			return;
		}

		this.view.title = this.state.insight?.primaryIssue?.exceptionType
			? `AI Tutor: ${this.state.insight.primaryIssue.exceptionType}`
			: 'AI Tutor';
		this.view.webview.html = getWebviewHtml(this.view.webview, this.extensionUri, this.state);
	}
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
