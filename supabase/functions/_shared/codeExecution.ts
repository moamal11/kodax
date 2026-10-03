// ⚠️ ملف مولّد بواسطة scripts/build-verify-function.ts — لا تعدّله يدوياً
/**
 * Code Execution Service
 *
 * Uses Wandbox API (free, no key needed) as primary engine.
 * Kotlin uses Kotlin Playground API.
 * JS/TS/React are executed client-side (see handleRun in add.tsx).
 */

export interface CodeExecutionRequest {
  language: string;
  code: string;
  input?: string;
  userId?: string;
}

export interface CodeExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
  memory?: number;
  /** فشل الاتصال بخادم التنفيذ أو انتهت مهلته (ليس خطأ في كود المستخدم) */
  serviceError?: boolean;
  timedOut?: boolean;
  /** رفض Wandbox اسم المترجم (أُزيل أو تغيّر إصداره) */
  compilerRejected?: boolean;
  logs?: Array<{
    type: 'log' | 'error' | 'warn';
    message: string;
    timestamp: Date;
  }>;
}

// ===== Wandbox compiler mapping =====
// https://wandbox.org/api/list.json
const WANDBOX_COMPILERS: Record<string, string> = {
  python: 'cpython-3.12.7',
  javascript: 'nodejs-20.17.0',
  java: 'openjdk-jdk-22+36',
  cpp: 'gcc-head',
  c: 'gcc-head-c',
  csharp: 'mono-6.12.0.199',
  php: 'php-8.3.12',
  ruby: 'ruby-3.4.9',
  go: 'go-1.23.2',
  rust: 'rust-1.82.0',
  swift: 'swift-6.0.1',
  // dart: غير متوفر على Wandbox — تحديات Dart تُتحقق بنيوياً في challengeValidator
  lua: 'lua-5.4.7',
  perl: 'perl-5.42.0',
  r: 'r-4.4.1',
  scala: 'scala-3.5.1',
  bash: 'bash',
  haskell: 'ghc-9.10.1',
  elixir: 'elixir-1.17.3',
  sql: 'sqlite-3.46.1',
  typescript: 'typescript-5.6.2',
};

// File extension lookup
const FILE_EXT: Record<string, string> = {
  python: 'py',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  csharp: 'cs',
  php: 'php',
  ruby: 'rb',
  go: 'go',
  rust: 'rs',
  swift: 'swift',
  kotlin: 'kt',
  dart: 'dart',
  lua: 'lua',
  perl: 'pl',
  r: 'r',
  scala: 'scala',
  bash: 'sh',
  haskell: 'hs',
  elixir: 'exs',
  sql: 'sql',
  typescript: 'ts',
  javascript: 'js',
  react: 'jsx',
};

// عائلة كل مترجم على Wandbox — تُستخدم إذا اختفى الإصدار المحدد أعلاه
// (حدث فعلاً: أُزيل nodejs-20.11.1 فكانت كل تشغيلات JavaScript تفشل).
const COMPILER_FAMILY: Record<string, string> = {
  python: 'cpython-3.',
  javascript: 'nodejs-',
  java: 'openjdk-jdk-',
  cpp: 'gcc-',
  typescript: 'typescript-',
  sql: 'sqlite-',
  ruby: 'ruby-',
  php: 'php-',
  go: 'go-',
  rust: 'rust-',
};

let resolvedCompilers: Record<string, string> | null = null;

async function resolveCompilerFromList(lang: string): Promise<string | null> {
  if (!COMPILER_FAMILY[lang]) return null;
  try {
    if (!resolvedCompilers) {
      const res = await fetch('https://wandbox.org/api/list.json');
      if (!res.ok) return null;
      const list: Array<{ name: string }> = await res.json();
      const found: Record<string, string> = {};
      for (const [l, prefix] of Object.entries(COMPILER_FAMILY)) {
        const names = list
          .map((c) => c.name)
          .filter((n) => n.startsWith(prefix) && !n.includes('head'))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        if (names.length) found[l] = names[names.length - 1];
      }
      resolvedCompilers = found;
    }
    return resolvedCompilers[lang] ?? null;
  } catch {
    return null;
  }
}

// ===== Main entry point =====
export async function executeCode(
  request: CodeExecutionRequest
): Promise<CodeExecutionResult> {
  const startTime = Date.now();
  const lang = request.language;

  try {
    // --- Kotlin: use Kotlin Playground API ---
    if (lang === 'kotlin') {
      return await executeKotlin(request, startTime);
    }

    // --- Wandbox languages ---
    let compiler = WANDBOX_COMPILERS[lang];

    // JavaScript fallback: try Node.js first, then TypeScript compiler
    if (!compiler && lang === 'js') {
      compiler =
        WANDBOX_COMPILERS['javascript'] || WANDBOX_COMPILERS['typescript'];
    }

    if (!compiler) {
      return {
        success: false,
        error: `⚠️ التشغيل المباشر لـ ${lang} غير متوفر حالياً.\nيمكنك نسخ الكود وتشغيله في بيئة خارجية.`,
        logs: [
          {
            type: 'error',
            message: `Unsupported language: ${lang}`,
            timestamp: new Date(),
          },
        ],
      };
    }

    const result = await executeWandbox(request, compiler, startTime);

    // إذا رفض Wandbox اسم المترجم (أُزيل أو تغيّر إصداره) نختار أحدث إصدار
    // من نفس العائلة. (سابقاً كان JavaScript يُعاد تشغيله بمترجم TypeScript،
    // فتظهر أخطاء tsc كأنها مخرجات البرنامج.)
    if (result.compilerRejected) {
      const family = lang === 'js' ? 'javascript' : lang;
      const fallback = await resolveCompilerFromList(family);
      if (fallback && fallback !== compiler) {
        return await executeWandbox(request, fallback, startTime);
      }
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? `خطأ غير متوقع: ${error.message}`
          : 'خطأ غير معروف في التنفيذ',
      logs: [
        {
          type: 'error',
          message: `Execution failed: ${error instanceof Error ? error.message : 'Unknown'}`,
          timestamp: new Date(),
        },
      ],
    };
  }
}

// ===== Wandbox execution =====
async function executeWandbox(
  request: CodeExecutionRequest,
  compiler: string,
  startTime: number
): Promise<CodeExecutionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: request.code,
        compiler,
        stdin: request.input || '',
        'compiler-option-raw': '',
        'runtime-option-raw': '',
        save: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let body = '';
      try {
        body = await response.text();
      } catch {}
      console.warn(
        `[CodeExec] Wandbox HTTP ${response.status}: ${body.slice(0, 200)}`
      );
      return {
        success: false,
        serviceError: true,
        // Wandbox يرد بـ 500 "Unknown compiler" عند إزالة إصدار المترجم
        compilerRejected: /unknown compiler/i.test(body),
        error: `خطأ من خادم التنفيذ (${response.status}):\n${body.slice(0, 300) || response.statusText || 'خطأ غير معروف'}`,
        logs: [
          {
            type: 'error',
            message: `Wandbox ${response.status}: ${body.slice(0, 200)}`,
            timestamp: new Date(),
          },
        ],
      };
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;
    const programOutput = data.program_output || '';
    const programError = data.program_error || '';
    const compilerError = data.compiler_error || '';
    const compilerOutput = data.compiler_output || '';
    const status = data.status;

    // مخرجات البرنامج فقط — رسائل المترجم (أخطاء/تحذيرات) ليست مخرجات
    // (كانت رسائل tsc/gcc تُعامل كمخرجات وتُقارن بالنتيجة المتوقعة)
    const output = programOutput;
    const errorText =
      [compilerError, programError].filter(Boolean).join('\n') ||
      (status !== '0' ? compilerOutput : '');
    // Only treat as error if exit status is non-zero OR there's a real error with no output
    // Warnings in stderr should NOT fail the execution if there is valid output
    const isRealError =
      status !== '0' || (errorText.length > 0 && !output.trim());
    const hasError = isRealError;

    const logs: Array<{
      type: 'log' | 'error' | 'warn';
      message: string;
      timestamp: Date;
    }> = [];

    if (output) {
      output.split('\n').forEach((line: string) => {
        if (line.trim()) {
          logs.push({ type: 'log', message: line, timestamp: new Date() });
        }
      });
    }
    if (errorText) {
      errorText.split('\n').forEach((line: string) => {
        if (line.trim()) {
          logs.push({ type: 'error', message: line, timestamp: new Date() });
        }
      });
    }

    return {
      success: !hasError,
      output: output || undefined,
      error: errorText || undefined,
      executionTime,
      logs,
    };
  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    if (fetchError.name === 'AbortError') {
      return {
        success: false,
        serviceError: true,
        timedOut: true,
        error:
          'انتهت مهلة الاتصال بخادم التنفيذ (20 ثانية).\nتأكد من اتصالك بالإنترنت وحاول مرة أخرى.',
        logs: [
          {
            type: 'error',
            message: 'Wandbox request timed out',
            timestamp: new Date(),
          },
        ],
      };
    }
    return {
      success: false,
      serviceError: true,
      error: `فشل الاتصال بخادم التنفيذ:\n${fetchError.message || 'تحقق من اتصال الإنترنت'}`,
      logs: [
        {
          type: 'error',
          message: `Fetch error: ${fetchError.message}`,
          timestamp: new Date(),
        },
      ],
    };
  }
}

// ===== Kotlin Playground API =====
async function executeKotlin(
  request: CodeExecutionRequest,
  startTime: number
): Promise<CodeExecutionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(
      'https://api.kotlinlang.org/api/2.0/compiler/run',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          args: '',
          confType: 'java',
          files: [
            {
              name: 'Main.kt',
              text: request.code,
              publicId: '',
            },
          ],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      let body = '';
      try {
        body = await response.text();
      } catch {}
      return {
        success: false,
        error: `خطأ من خادم Kotlin (${response.status}):\n${body.slice(0, 300) || 'خطأ غير معروف'}`,
        logs: [
          {
            type: 'error',
            message: `Kotlin API ${response.status}`,
            timestamp: new Date(),
          },
        ],
      };
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    // Parse Kotlin response: output is in data.text wrapped in <outStream> / <errStream> tags
    const raw = data.text || '';
    const outMatch = raw.match(/<outStream>([\s\S]*?)<\/outStream>/g);
    const errMatch = raw.match(/<errStream>([\s\S]*?)<\/errStream>/g);

    let output = '';
    if (outMatch) {
      output = outMatch
        .map((m: string) => m.replace(/<\/?outStream>/g, ''))
        .join('');
    }
    let errorText = '';
    if (errMatch) {
      errorText = errMatch
        .map((m: string) => m.replace(/<\/?errStream>/g, ''))
        .join('');
    }

    // Check for compilation errors
    if (data.exception) {
      errorText = data.exception + (errorText ? '\n' + errorText : '');
    }
    if (data.errors && Object.keys(data.errors).length > 0) {
      const errs = Object.values(data.errors).flat() as any[];
      if (errs.length > 0) {
        const errMsgs = errs
          .map(
            (e: any) =>
              `${e.severity}: ${e.message} (line ${e.interval?.start?.line || '?'})`
          )
          .join('\n');
        errorText = errMsgs + (errorText ? '\n' + errorText : '');
      }
    }

    const hasError = !!data.exception || errorText.length > 0;

    const logs: Array<{
      type: 'log' | 'error' | 'warn';
      message: string;
      timestamp: Date;
    }> = [];
    if (output) {
      output.split('\n').forEach((line) => {
        if (line.trim())
          logs.push({ type: 'log', message: line, timestamp: new Date() });
      });
    }
    if (errorText) {
      errorText.split('\n').forEach((line) => {
        if (line.trim())
          logs.push({ type: 'error', message: line, timestamp: new Date() });
      });
    }

    return {
      success: !hasError,
      output: output || undefined,
      error: errorText || undefined,
      executionTime,
      logs,
    };
  } catch (fetchError: any) {
    clearTimeout(timeoutId);
    if (fetchError.name === 'AbortError') {
      return {
        success: false,
        error: 'انتهت مهلة اتصال Kotlin (20 ثانية)',
        logs: [
          {
            type: 'error',
            message: 'Kotlin API timed out',
            timestamp: new Date(),
          },
        ],
      };
    }
    return {
      success: false,
      error: `فشل الاتصال بخادم Kotlin:\n${fetchError.message || 'تحقق من الإنترنت'}`,
      logs: [
        {
          type: 'error',
          message: `Fetch error: ${fetchError.message}`,
          timestamp: new Date(),
        },
      ],
    };
  }
}

// ===== Helpers =====
export function getFileExtension(language: string): string {
  return FILE_EXT[language] || 'txt';
}

/**
 * Simulate code execution for demo/offline mode
 */
export async function simulateExecution(
  request: CodeExecutionRequest
): Promise<CodeExecutionResult> {
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 1000)
  );
  return {
    success: true,
    output: `Hello from ${request.language}!\nCode executed successfully.`,
    executionTime: Math.random() * 500 + 100,
    logs: [
      {
        type: 'log',
        message: `[${request.language.toUpperCase()}] Execution started...`,
        timestamp: new Date(),
      },
      {
        type: 'log',
        message: `Hello from ${request.language}!`,
        timestamp: new Date(),
      },
      {
        type: 'log',
        message: 'Code executed successfully.',
        timestamp: new Date(),
      },
    ],
  };
}
