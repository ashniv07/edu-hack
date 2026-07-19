import { cAnalyzer } from './cAnalyzer.js';
import { getAnalyzer, registerAnalyzer } from './languageAnalyzer.js';
import { javaAnalyzer } from './javaAnalyzer.js';
import { pythonAnalyzer } from './pythonAnalyzer.js';
import type { CodeAnalysisResult, CompilerOutput } from './types.js';

registerAnalyzer(cAnalyzer);
registerAnalyzer(pythonAnalyzer);
registerAnalyzer(javaAnalyzer);

export { getAnalyzer, registerAnalyzer, type LanguageAnalyzer } from './languageAnalyzer.js';
export type { CodeAnalysisResult, CompilerOutput } from './types.js';

export async function analyzeCode(
	language: string,
	source: string,
	compilerOutput: CompilerOutput,
): Promise<CodeAnalysisResult> {
	const analyzer = getAnalyzer(language);
	if (!analyzer) {
		throw new Error(`No code analyzer is registered for language "${language}".`);
	}
	return analyzer.analyze(source, compilerOutput);
}
