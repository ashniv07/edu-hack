import type { CodeAnalysisResult, CompilerOutput } from './types.js';

export interface LanguageAnalyzer {
	language: string;
	analyze(source: string, compilerOutput: CompilerOutput): Promise<CodeAnalysisResult>;
}

const analyzers = new Map<string, LanguageAnalyzer>();

export function registerAnalyzer(analyzer: LanguageAnalyzer): void {
	analyzers.set(analyzer.language.toLowerCase(), analyzer);
}

export function getAnalyzer(language: string): LanguageAnalyzer | undefined {
	return analyzers.get(language.toLowerCase());
}
