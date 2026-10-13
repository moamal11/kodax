import { executeCode, type CodeExecutionResult } from './codeExecution';
import { codeWithPromptInput, definesPrompt, needsNodeInputRuntime, promptFromInput } from './editorInput';

/** Shared execution contract for the published snippet page, including stdin. */
export async function executeSnippet(language: string, code: string, input: string): Promise<CodeExecutionResult> {
  if ((language === 'javascript' || language === 'react') && !needsNodeInputRuntime(code)) {
    const output: string[] = [];
    const format = (...args: unknown[]) => args.map(x => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join(' ');
    const consoleProxy = {
      log: (...args: unknown[]) => output.push(format(...args)),
      info: (...args: unknown[]) => output.push(format(...args)),
      warn: (...args: unknown[]) => output.push('تحذير: ' + format(...args)),
      error: (...args: unknown[]) => output.push('خطأ: ' + format(...args)),
    };
    try {
      const source = code.replace(/console\.(log|error|warn|info)/g, '__c.$1');
      const value = definesPrompt(code) ? new Function('__c', source)(consoleProxy)
        : new Function('__c', 'prompt', source)(consoleProxy, promptFromInput(input));
      if (value !== undefined && !output.length) output.push('→ ' + String(value));
      return { success: true, output: output.join('\n') };
    } catch (e) {
      return { success: false, output: output.join('\n'), error: e instanceof Error ? e.message : String(e) };
    }
  }
  return executeCode({ language, code: ['javascript', 'typescript'].includes(language) ? codeWithPromptInput(code, input, language) : code, input });
}
