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
			localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist')],
		};

		this.render();
	}

	private render(): void {
		if (!this.view) {
			return;
		}

		this.view.title = this.state.insight?.primaryIssue?.exceptionType ?? 'Overview';
		this.view.webview.html = getWebviewHtml(this.view.webview, this.extensionUri, this.state);
	}
}

function getWebviewHtml(webview: vscode.Webview, currentExtensionUri: vscode.Uri, state: TutorPanelState): string {
	const scriptUri = webview.asWebviewUri(
		vscode.Uri.joinPath(currentExtensionUri, 'dist', 'webview.js'),
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
	<style>
		/* React Flow required styles */
		.react-flow {
			width: 100%;
			height: 100%;
			position: relative;
			overflow: hidden;
		}
		.react-flow__renderer {
			width: 100%;
			height: 100%;
		}
		.react-flow__zoompane {
			width: 100%;
			height: 100%;
		}
		.react-flow__pane {
			cursor: grab;
		}
		.react-flow__pane.dragging {
			cursor: grabbing;
		}
		.react-flow__viewport {
			transform-origin: 0 0;
		}
		.react-flow__edges {
			pointer-events: none;
			overflow: visible;
			position: absolute;
			z-index: 2;
		}
		.react-flow__edge-path {
			stroke: #b1b1b7;
			stroke-width: 2;
			fill: none;
		}
		.react-flow__edge.animated path {
			stroke-dasharray: 5;
			animation: dashdraw 0.5s linear infinite;
		}
		@keyframes dashdraw {
			from { stroke-dashoffset: 10; }
			to { stroke-dashoffset: 0; }
		}
		.react-flow__nodes {
			pointer-events: none;
			transform-origin: 0 0;
		}
		.react-flow__node {
			pointer-events: all;
			cursor: pointer;
			position: absolute;
			user-select: none;
		}
		.react-flow__handle {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: #555;
			border: 2px solid #fff;
			position: absolute;
		}
		.react-flow__handle-top { top: -4px; left: 50%; transform: translateX(-50%); }
		.react-flow__handle-bottom { bottom: -4px; left: 50%; transform: translateX(-50%); }
		.react-flow__handle-left { left: -4px; top: 50%; transform: translateY(-50%); }
		.react-flow__handle-right { right: -4px; top: 50%; transform: translateY(-50%); }
		.react-flow__background {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}
		.react-flow__controls {
			position: absolute;
			left: 10px;
			bottom: 10px;
			z-index: 5;
			display: flex;
			flex-direction: column;
			gap: 4px;
		}
		.react-flow__controls-button {
			width: 26px;
			height: 26px;
			border: 1px solid #eee;
			border-radius: 4px;
			background: #fff;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.react-flow__minimap {
			position: absolute;
			right: 10px;
			bottom: 10px;
			z-index: 5;
		}
		.react-flow__attribution {
			display: none;
		}
	</style>
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
