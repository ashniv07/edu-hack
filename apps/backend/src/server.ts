import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';
import { analyzeExecution } from './index.js';
import type { BackendExecutionPayload } from './types.js';

const DEFAULT_PORT = 3001;
const MAX_BODY_BYTES = 1024 * 1024;

export function startServer(port = getPort()): void {
	const server = createServer(async (request, response) => {
		setCorsHeaders(response);

		if (request.method === 'OPTIONS') {
			response.writeHead(204);
			response.end();
			return;
		}

		if (request.method === 'GET' && request.url === '/health') {
			writeJson(response, 200, { ok: true, service: 'hackyay-ai-tutor-backend' });
			return;
		}

		if (request.method === 'POST' && request.url === '/analyze') {
			await handleAnalyze(request, response);
			return;
		}

		writeJson(response, 404, { error: 'Not found' });
	});

	server.listen(port, () => {
		console.log(`AI Tutor backend listening on http://localhost:${port}`);
	});
}

async function handleAnalyze(request: IncomingMessage, response: ServerResponse): Promise<void> {
	try {
		const body = await readJsonBody(request);
		if (!isExecutionPayload(body)) {
			writeJson(response, 400, { error: 'Invalid execution payload.' });
			return;
		}

		const result = await analyzeExecution(body);
		writeJson(response, 200, result);
	} catch (error) {
		writeJson(response, 500, {
			error: error instanceof Error ? error.message : 'Unknown backend error.',
		});
	}
}

function readJsonBody(request: IncomingMessage): Promise<unknown> {
	return new Promise((resolve, reject) => {
		let raw = '';

		request.on('data', (chunk: Buffer | string) => {
			raw += chunk.toString();
			if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
				reject(new Error('Request body is too large.'));
				request.destroy();
			}
		});

		request.on('end', () => {
			try {
				resolve(JSON.parse(raw || '{}'));
			} catch {
				reject(new Error('Request body must be valid JSON.'));
			}
		});

		request.on('error', reject);
	});
}

function isExecutionPayload(value: unknown): value is BackendExecutionPayload {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const candidate = value as Partial<BackendExecutionPayload>;
	return Boolean(
		candidate.file
		&& typeof candidate.file.fileName === 'string'
		&& typeof candidate.file.filePath === 'string'
		&& typeof candidate.file.directoryPath === 'string'
		&& typeof candidate.file.language === 'string'
		&& candidate.stage === 'runtime'
		&& typeof candidate.source === 'string'
		&& candidate.runtime
		&& typeof candidate.runtime.command === 'string'
		&& typeof candidate.runtime.stdout === 'string'
		&& typeof candidate.runtime.stderr === 'string'
		&& Array.isArray(candidate.runtime.stackFrames),
	);
}

function writeJson(response: ServerResponse, statusCode: number, body: unknown): void {
	response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
	response.end(JSON.stringify(body));
}

function setCorsHeaders(response: ServerResponse): void {
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Headers', 'content-type');
	response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

function getPort(): number {
	const value = Number(process.env.PORT ?? process.env.BACKEND_PORT);
	return Number.isInteger(value) && value > 0 ? value : DEFAULT_PORT;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	startServer();
}
