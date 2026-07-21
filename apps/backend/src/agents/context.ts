import type { BackendExecutionPayload } from '../types.js';
import type { TeachingAgentContext } from './types.js';

export function buildTeachingAgentContext(payload: BackendExecutionPayload): TeachingAgentContext {
	const rootCause = payload.runtime.rootCause;
	const primaryFrame = payload.runtime.stackFrames[payload.runtime.stackFrames.length - 1];

	return {
		payload,
		language: payload.file.language.toLowerCase(),
		source: payload.source,
		errorText: [payload.runtime.stderr, rootCause?.raw].filter(Boolean).join('\n').trim(),
		exceptionType: rootCause?.exceptionType,
		errorLine: rootCause?.line ?? primaryFrame?.line ?? 1,
		errorColumn: rootCause?.column ?? primaryFrame?.column ?? 1,
	};
}

export function summarizeContext(context: TeachingAgentContext): string {
	const payload = context.payload;
	const stackFrames = payload.runtime.stackFrames
		.map((frame) => `${frame.filePath ?? payload.file.fileName}:${frame.line} ${frame.functionName ?? ''}`.trim())
		.join('\n');

	return JSON.stringify(
		{
			language: context.language,
			fileName: payload.file.fileName,
			success: payload.success,
			exceptionType: context.exceptionType,
			errorLine: context.errorLine,
			errorColumn: context.errorColumn,
			stdout: payload.runtime.stdout,
			stderr: payload.runtime.stderr,
			stackFrames,
			source: context.source,
		},
		null,
		2,
	);
}
