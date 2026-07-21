import * as vscode from 'vscode';
import { getLatestPayload } from '../core/payloadBus';

/**
 * ErrorCodeLensProvider - Inline Editor Annotations
 *
 * Shows contextual hints and actions directly in the editor:
 * - Error indicators on problematic lines
 * - Quick hints without opening sidebar
 * - "Fix it" suggestions
 * - "Learn more" links
 */
export class ErrorCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

  private errorData: ErrorAnnotation | null = null;

  constructor() {}

  /**
   * Update error annotations when new analysis is received
   */
  public updateError(data: ErrorAnnotation) {
    this.errorData = data;
    this._onDidChangeCodeLenses.fire();
  }

  /**
   * Clear all annotations
   */
  public clearErrors() {
    this.errorData = null;
    this._onDidChangeCodeLenses.fire();
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    if (!this.errorData) {
      return [];
    }

    // Only show for the file that has the error
    if (document.uri.fsPath !== this.errorData.filePath) {
      return [];
    }

    const codeLenses: vscode.CodeLens[] = [];
    const errorLine = this.errorData.errorLine - 1; // VS Code is 0-indexed

    if (errorLine >= 0 && errorLine < document.lineCount) {
      const range = new vscode.Range(errorLine, 0, errorLine, 0);

      // Error type indicator
      codeLenses.push(
        new vscode.CodeLens(range, {
          title: `$(error) ${this.errorData.errorType}: ${this.errorData.shortMessage}`,
          command: 'hackyay-ai-tutor.openTutorPanel',
          tooltip: 'Click to see detailed analysis',
        })
      );

      // Quick hint (first hint level)
      if (this.errorData.quickHint) {
        codeLenses.push(
          new vscode.CodeLens(range, {
            title: `$(lightbulb) Hint: ${this.errorData.quickHint}`,
            command: 'hackyay-ai-tutor.showHint',
            arguments: [1],
            tooltip: 'Click for more detailed hints',
          })
        );
      }

      // Suggested fix action
      if (this.errorData.suggestedFix) {
        codeLenses.push(
          new vscode.CodeLens(range, {
            title: `$(tools) Try: ${this.errorData.suggestedFix}`,
            command: 'hackyay-ai-tutor.applySuggestedFix',
            arguments: [this.errorData],
            tooltip: 'Apply suggested fix',
          })
        );
      }

      // Learn more about this error
      codeLenses.push(
        new vscode.CodeLens(range, {
          title: `$(book) Learn about ${this.errorData.concept}`,
          command: 'hackyay-ai-tutor.openVisualization',
          tooltip: 'Open interactive visualization',
        })
      );
    }

    return codeLenses;
  }
}

/**
 * Error decoration provider - highlights error lines with gutter icons
 */
export class ErrorDecorationProvider {
  private errorDecorationType: vscode.TextEditorDecorationType;
  private warningDecorationType: vscode.TextEditorDecorationType;

  constructor() {
    this.errorDecorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      isWholeLine: true,
      gutterIconPath: vscode.Uri.parse('data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#ef4444"/><text x="8" y="12" text-anchor="middle" fill="white" font-size="10" font-weight="bold">!</text></svg>'
      )),
      gutterIconSize: 'contain',
      overviewRulerColor: '#ef4444',
      overviewRulerLane: vscode.OverviewRulerLane.Right,
    });

    this.warningDecorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      isWholeLine: true,
      gutterIconPath: vscode.Uri.parse('data:image/svg+xml,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><polygon points="8,2 15,14 1,14" fill="#f59e0b"/><text x="8" y="12" text-anchor="middle" fill="black" font-size="8" font-weight="bold">!</text></svg>'
      )),
      gutterIconSize: 'contain',
    });
  }

  /**
   * Apply error decorations to the active editor
   */
  public applyDecorations(editor: vscode.TextEditor, errorLine: number) {
    const line = errorLine - 1; // Convert to 0-indexed

    if (line >= 0 && line < editor.document.lineCount) {
      const range = new vscode.Range(line, 0, line, editor.document.lineAt(line).text.length);

      editor.setDecorations(this.errorDecorationType, [
        {
          range,
          hoverMessage: new vscode.MarkdownString(
            '**AI Tutor detected an error here**\n\n' +
            'Click the CodeLens above for hints and visualization.'
          ),
        },
      ]);
    }
  }

  /**
   * Clear all decorations
   */
  public clearDecorations(editor: vscode.TextEditor) {
    editor.setDecorations(this.errorDecorationType, []);
    editor.setDecorations(this.warningDecorationType, []);
  }

  public dispose() {
    this.errorDecorationType.dispose();
    this.warningDecorationType.dispose();
  }
}

/**
 * Inline hint provider - shows hover hints on error lines
 */
export class ErrorHoverProvider implements vscode.HoverProvider {
  private errorData: ErrorAnnotation | null = null;

  public updateError(data: ErrorAnnotation) {
    this.errorData = data;
  }

  public clearErrors() {
    this.errorData = null;
  }

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Hover | null {
    if (!this.errorData) {
      return null;
    }

    if (document.uri.fsPath !== this.errorData.filePath) {
      return null;
    }

    const errorLine = this.errorData.errorLine - 1;
    if (position.line !== errorLine) {
      return null;
    }

    const markdown = new vscode.MarkdownString();
    markdown.isTrusted = true;
    markdown.supportHtml = true;

    markdown.appendMarkdown(`## $(error) ${this.errorData.errorType}\n\n`);
    markdown.appendMarkdown(`**Message:** ${this.errorData.shortMessage}\n\n`);

    if (this.errorData.quickHint) {
      markdown.appendMarkdown(`---\n\n`);
      markdown.appendMarkdown(`### $(lightbulb) Quick Hint\n\n`);
      markdown.appendMarkdown(`${this.errorData.quickHint}\n\n`);
    }

    if (this.errorData.concept) {
      markdown.appendMarkdown(`---\n\n`);
      markdown.appendMarkdown(`**Concept:** ${this.errorData.concept}\n\n`);
    }

    markdown.appendMarkdown(`---\n\n`);
    markdown.appendMarkdown(`[Open AI Tutor](command:hackyay-ai-tutor.openTutorPanel) | `);
    markdown.appendMarkdown(`[See Visualization](command:hackyay-ai-tutor.openVisualization)`);

    return new vscode.Hover(markdown);
  }
}

/**
 * Error annotation data structure
 */
export interface ErrorAnnotation {
  filePath: string;
  errorLine: number;
  errorType: string;
  shortMessage: string;
  fullMessage: string;
  quickHint?: string;
  suggestedFix?: string;
  concept?: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Create error annotation from execution payload
 */
export function createErrorAnnotation(
  filePath: string,
  errorType: string,
  errorLine: number,
  message: string
): ErrorAnnotation {
  const hints = getQuickHintForError(errorType);

  return {
    filePath,
    errorLine,
    errorType,
    shortMessage: truncateMessage(message, 60),
    fullMessage: message,
    quickHint: hints.hint,
    suggestedFix: hints.fix,
    concept: hints.concept,
    severity: 'error',
  };
}

/**
 * Get quick hints based on error type
 */
function getQuickHintForError(errorType: string): { hint?: string; fix?: string; concept?: string } {
  const hints: Record<string, { hint: string; fix: string; concept: string }> = {
    IndexError: {
      hint: 'Check if your index is within the valid range (0 to length-1)',
      fix: 'Add a bounds check before accessing',
      concept: 'Array Indexing',
    },
    KeyError: {
      hint: 'The key you\'re looking for doesn\'t exist in the dictionary',
      fix: 'Use .get() method or check with "in" operator',
      concept: 'Dictionary Access',
    },
    TypeError: {
      hint: 'You\'re trying to use incompatible types together',
      fix: 'Convert types before the operation',
      concept: 'Type Compatibility',
    },
    RecursionError: {
      hint: 'Your function calls itself forever without stopping',
      fix: 'Add a base case to stop recursion',
      concept: 'Recursion & Base Cases',
    },
    NameError: {
      hint: 'This variable hasn\'t been defined yet',
      fix: 'Define the variable before using it',
      concept: 'Variable Scope',
    },
    ZeroDivisionError: {
      hint: 'You\'re trying to divide by zero',
      fix: 'Check if divisor is zero before dividing',
      concept: 'Division Operations',
    },
    AttributeError: {
      hint: 'The object doesn\'t have this attribute (might be None)',
      fix: 'Check if object is not None before accessing',
      concept: 'Object Attributes & None',
    },
    NullPointerException: {
      hint: 'You\'re trying to use a null reference',
      fix: 'Check for null before using the object',
      concept: 'Null References',
    },
  };

  return hints[errorType] || {};
}

/**
 * Truncate message for CodeLens display
 */
function truncateMessage(message: string, maxLength: number): string {
  if (message.length <= maxLength) {
    return message;
  }
  return message.substring(0, maxLength - 3) + '...';
}
