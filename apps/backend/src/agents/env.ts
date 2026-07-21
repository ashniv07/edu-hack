import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

let loaded = false;

export function loadBackendEnv(): void {
	if (loaded) {
		return;
	}

	loaded = true;
	for (const filePath of getEnvPaths()) {
		loadEnvFile(filePath);
	}
}

function getEnvPaths(): string[] {
	const cwd = process.cwd();
	return [
		join(cwd, '.env'),
		join(cwd, 'apps', 'backend', '.env'),
	];
}

function loadEnvFile(filePath: string): void {
	if (!existsSync(filePath)) {
		return;
	}

	const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) {
			continue;
		}

		const separatorIndex = trimmed.indexOf('=');
		if (separatorIndex <= 0) {
			continue;
		}

		const key = trimmed.slice(0, separatorIndex).trim();
		const value = unwrapValue(trimmed.slice(separatorIndex + 1).trim());
		if (!process.env[key] && value && value !== 'paste_your_key_here' && value !== 'your_api_key_here') {
			process.env[key] = value;
		}
	}
}

function unwrapValue(value: string): string {
	if (
		(value.startsWith('"') && value.endsWith('"'))
		|| (value.startsWith("'") && value.endsWith("'"))
	) {
		return value.slice(1, -1);
	}

	return value;
}
