/**
 * Challenge Validator Service - Strict Rewrite
 * Validates challenge solutions with strict, accurate logic
 * Supports: Python, JavaScript, TypeScript, HTML, CSS, React, Java, C++, Dart
 *
 * PRINCIPLES:
 * 1. No incorrect code passes (syntax or logic errors)
 * 2. Validation via actual execution when possible
 * 3. Description MUST match success criteria exactly
 * 4. No hidden conditions or weak validation
 */

import { executeCode } from './codeExecution';

export interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

export interface ValidationResult {
  passed: boolean;
  message: string;
  actualOutput?: string;
  expectedOutput?: string;
  error?: string;
}

export interface ChallengeValidationResult {
  allPassed: boolean;
  results: ValidationResult[];
  totalTests: number;
  passedTests: number;
}

// ====================================================================
// =================== UTILITY FUNCTIONS ==============================
// ====================================================================

function stripComments(code: string): string {
  let result = code;
  result = result.replace(/#.*$/gm, '');
  result = result.replace(/"""[\s\S]*?"""/g, '');
  result = result.replace(/'''[\s\S]*?'''/g, '');
  result = result.replace(/\/\/.*$/gm, '');
  result = result.replace(/\/\*[\s\S]*?\*\//g, '');
  return result;
}

function extractExecutableCode(code: string, language: string): string {
  let cleaned = stripComments(code);
  const placeholders = [
    /اكتب.*هنا/gi,
    /write.*here/gi,
    /your.*code.*here/gi,
    /TODO/gi,
    /FIXME/gi,
  ];
  for (const p of placeholders) cleaned = cleaned.replace(p, '');
  cleaned = cleaned
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)
    .join('\n');
  if (language.toLowerCase() === 'python')
    cleaned = cleaned.replace(/^\s*pass\s*$/gm, '');
  if (['javascript', 'typescript'].includes(language.toLowerCase()))
    cleaned = cleaned.replace(/^\s*return\s*;?\s*$/gm, '');
  return cleaned.trim();
}

// ====================================================================
// =================== CODE DETECTION =================================
// ====================================================================

function hasUserWrittenCode(
  userCode: string,
  starterCode: string,
  language: string
): boolean {
  const lang = language.toLowerCase();
  const userExec = extractExecutableCode(userCode, language);
  const starterExec = extractExecutableCode(starterCode, language);

  if (lang === 'css') {
    const userProps = userExec.match(/[\w-]+\s*:\s*[^;{}]+;/g) || [];
    const starterProps = starterExec.match(/[\w-]+\s*:\s*[^;{}]+;/g) || [];
    return userProps.length > starterProps.length;
  }

  if (lang === 'html') {
    const userTags = userExec.match(/<\w+[^>]*>/g) || [];
    const starterTags = starterExec.match(/<\w+[^>]*>/g) || [];
    return userTags.length > starterTags.length;
  }

  if (lang === 'react') {
    const lengthDiff = userExec.length - starterExec.length;
    return (
      lengthDiff >= 10 &&
      (/<\w+/.test(userExec) || /useState|useEffect|return\s*\(/.test(userExec))
    );
  }

  // For executable languages; user must add at least 10 chars of real logic
  if (userExec.length - starterExec.length < 10) return false;

  // Must contain at least 2 logic patterns
  const patterns =
    lang === 'python'
      ? [
          /\bif\b/,
          /\bfor\b/,
          /\bwhile\b/,
          /\breturn\b/,
          /\bdef\b/,
          /\bclass\b/,
          /[+\-*/=<>]/,
          /\blen\(/,
          /\brange\(/,
          /\bprint\(/,
          /\bappend\b/,
          /\bin\b/,
          /\band\b/,
          /\bor\b/,
        ]
      : [
          /\bif\b/,
          /\bfor\b/,
          /\bwhile\b/,
          /\breturn\b/,
          /\bfunction\b/,
          /\bconst\b/,
          /\blet\b/,
          /[+\-*/=<>]/,
          /\.length/,
          /\.push\b/,
          /\.map\b/,
          /\.filter\b/,
          /=>/,
          /\bclass\b/,
        ];

  let count = 0;
  for (const p of patterns) {
    if (p.test(userExec)) count++;
  }
  return count >= 2;
}

function isInputFunctionCall(input: string): boolean {
  if (!input?.trim()) return false;
  return /^\w+\s*\([\s\S]*\)\s*$/.test(input.trim());
}

function hasCallableFunction(code: string, language: string): boolean {
  if (language === 'python') return /def\s+\w+\s*\(/.test(code);
  return (
    /function\s+\w+\s*\(/.test(code) ||
    /const\s+\w+\s*=\s*(?:function|\(|async)/.test(code) ||
    /=>\s*/.test(code)
  );
}

function detectClassPattern(
  code: string,
  language: string
): {
  isClass: boolean;
  className?: string;
  hasInsert?: boolean;
  hasInorder?: boolean;
} {
  if (language !== 'python') return { isClass: false };
  const classMatches = [...code.matchAll(/class\s+(\w+)/g)];
  if (classMatches.length === 0) return { isClass: false };
  const hasInsert = /def\s+insert\s*\(/.test(code);
  const hasInorder = /def\s+inorder\s*\(/.test(code);
  if (hasInsert && hasInorder) {
    const insertIdx = code.indexOf('def insert');
    let className = classMatches[classMatches.length - 1][1];
    for (const match of classMatches) {
      if (match.index !== undefined && match.index < insertIdx)
        className = match[1];
    }
    return { isClass: true, className, hasInsert: true, hasInorder: true };
  }
  return { isClass: classMatches.length > 0, className: classMatches[0][1] };
}

function getFunctionName(code: string, language: string): string {
  let match;
  if (language === 'python') match = code.match(/def\s+(\w+)\s*\(/);
  else
    match =
      code.match(/function\s+(\w+)\s*\(/) ||
      code.match(/const\s+(\w+)\s*=\s*(?:function|\(|async)/);
  return match ? match[1] : 'solution';
}

// ====================================================================
// =================== OUTPUT COMPARISON (STRICT) =====================
// ====================================================================

function normalizeOutput(output: string): string {
  let n = output.trim();
  n = n.replace(/\r\n/g, '\n').replace(/\n+/g, '\n');
  n = n.replace(/\[\s+/g, '[').replace(/\s+\]/g, ']');
  n = n.replace(/\{\s+/g, '{').replace(/\s+\}/g, '}');
  n = n.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  n = n.replace(/,\s*/g, ', ');
  n = n.replace(/:\s*/g, ': ');
  n = n.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
  n = n.replace(/\bNone\b/g, 'null').replace(/\bundefined\b/g, 'null');
  n = n.replace(/'/g, '"');
  return n;
}

function deepNormalize(output: string): string {
  let n = normalizeOutput(output);
  n = n.replace(/["']/g, '');
  n = n.toLowerCase();
  n = n.replace(/\s/g, '');
  return n;
}

/**
 * STRICT output comparison:
 * 1. Normalized exact match
 * 2. Numeric match (tolerance 0.01)
 * 3. Last-line match (test wrappers print result last)
 * 4. Deep normalized match (quote/case/space tolerant)
 *
 * NEVER does substring or partial matching ('3' will NOT match '13')
 */
function compareOutputs(actual: string, expected: string): boolean {
  const normA = normalizeOutput(actual);
  const normE = normalizeOutput(expected);

  // 1. Direct normalized match
  if (normA === normE) return true;

  // 2. Numeric
  const numA = parseFloat(normA);
  const numE = parseFloat(normE);
  if (
    !isNaN(numA) &&
    !isNaN(numE) &&
    normA.replace(/[0-9.\-e+]/gi, '').trim() === '' &&
    normE.replace(/[0-9.\-e+]/gi, '').trim() === ''
  ) {
    return Math.abs(numA - numE) < 0.01;
  }

  // 3. Multi-line: ONLY last line (where test wrapper prints result)
  const lines = normA.split('\n').filter((l) => l.trim());
  if (lines.length > 1) {
    const lastLine = lines[lines.length - 1].trim();
    if (lastLine === normE) return true;
    if (deepNormalize(lastLine) === deepNormalize(expected)) return true;
  }

  // 4. Deep normalization (handles Python/JS quote+bool differences)
  if (deepNormalize(actual) === deepNormalize(expected)) return true;

  // 5. Last line deep (final fallback for multi-line)
  if (lines.length > 1) {
    if (deepNormalize(lines[lines.length - 1]) === deepNormalize(expected))
      return true;
  }

  return false;
}

// ====================================================================
// =================== TEST WRAPPERS ==================================
// ====================================================================

function createPythonWrapper(userCode: string, input: string): string {
  if (!input) return userCode;

  const classInfo = detectClassPattern(userCode, 'python');
  if (classInfo.isClass && classInfo.hasInsert && classInfo.hasInorder) {
    return `${userCode}\n\ntry:\n    _tree = ${classInfo.className}()\n    for _val in ${input}:\n        _tree.insert(_val)\n    result = _tree.inorder()\n    print(result)\nexcept Exception as e:\n    print(f"Error: {e}")`;
  }

  if (isInputFunctionCall(input)) {
    return `${userCode}\n\ntry:\n    result = ${input}\n    print(result)\nexcept Exception as e:\n    print(f"Error: {e}")`;
  }

  if (!hasCallableFunction(userCode, 'python')) return userCode;

  const funcName = getFunctionName(userCode, 'python');
  return `${userCode}\n\ntry:\n    result = ${funcName}(${input})\n    print(result)\nexcept Exception as e:\n    print(f"Error: {e}")`;
}

function createJSWrapper(userCode: string, input: string): string {
  if (!input) return userCode;

  if (isInputFunctionCall(input)) {
    return `${userCode}\n\ntry {\n    const __result = ${input};\n    if (typeof __result === 'function') console.log('function');\n    else if (typeof __result === 'object' && __result !== null) console.log(JSON.stringify(__result));\n    else console.log(__result);\n} catch (e) {\n    console.log("Error: " + e.message);\n}`;
  }

  if (!hasCallableFunction(userCode, 'javascript')) return userCode;

  const funcName = getFunctionName(userCode, 'javascript');
  return `${userCode}\n\ntry {\n    const __result = ${funcName}(${input});\n    if (typeof __result === 'function') console.log('function');\n    else if (typeof __result === 'object' && __result !== null) console.log(JSON.stringify(__result));\n    else console.log(__result);\n} catch (e) {\n    console.log("Error: " + e.message);\n}`;
}

function createTestWrapper(
  language: string,
  userCode: string,
  testCase: TestCase
): string {
  const input = testCase.input?.trim() || '';
  switch (language.toLowerCase()) {
    case 'python':
      return createPythonWrapper(userCode, input);
    case 'javascript':
    case 'typescript':
    case 'js':
    case 'ts':
      return createJSWrapper(userCode, input);
    case 'java':
      return wrapJavaCode(userCode, testCase);
    case 'cpp':
    case 'c++':
      return wrapCppCode(userCode, testCase);
    default:
      return userCode;
  }
}

function wrapJavaCode(userCode: string, testCase: TestCase): string {
  const classMatch = userCode.match(/class\s+\w+\s*\{([\s\S]*)\}/);
  const methodContent = classMatch ? classMatch[1] : userCode;

  // Auto-detect the method name (skip main)
  const methodNames = [
    ...methodContent.matchAll(
      /(?:public|private|static|\s)+\s+\w+\s+(\w+)\s*\(/g
    ),
  ]
    .map((m) => m[1])
    .filter((name) => name !== 'main');
  const methodName = methodNames.length > 0 ? methodNames[0] : '';

  const input = testCase.input?.trim() || '';

  // If no non-main method found and code already has main(), just run as-is
  // (Hello World pattern: the code itself prints the output)
  if (!methodName && /void\s+main\s*\(/.test(methodContent)) {
    // Replace class name with Main for Wandbox
    return userCode.replace(/class\s+\w+/, 'class Main');
  }

  const actualMethod = methodName || 'solution';

  // Check if input is a function call already
  if (isInputFunctionCall(input)) {
    return `public class Main {\n    ${methodContent}\n    public static void main(String[] args) {\n        try {\n            System.out.println(${input});\n        } catch (Exception e) {\n            System.out.println("Error: " + e.getMessage());\n        }\n    }\n}`;
  }

  // Check for void methods (print-based)
  const voidMatch = methodContent.match(
    new RegExp(`void\\s+${actualMethod}\\s*\\(`)
  );
  if (voidMatch) {
    return `public class Main {\n    ${methodContent}\n    public static void main(String[] args) {\n        try {\n            ${actualMethod}(${input});\n        } catch (Exception e) {\n            System.out.println("Error: " + e.getMessage());\n        }\n    }\n}`;
  }

  return `public class Main {\n    ${methodContent}\n    public static void main(String[] args) {\n        try {\n            System.out.println(${actualMethod}(${input}));\n        } catch (Exception e) {\n            System.out.println("Error: " + e.getMessage());\n        }\n    }\n}`;
}

function wrapCppCode(userCode: string, testCase: TestCase): string {
  const input = testCase.input?.trim() || '';

  // Auto-detect function name from user code (skip main)
  const funcMatches = [
    ...userCode.matchAll(
      /(?:int|void|string|bool|double|float|long|auto|vector<[^>]+>)\s+(\w+)\s*\(/g
    ),
  ]
    .map((m) => m[1])
    .filter((name) => name !== 'main');
  const funcName = funcMatches.length > 0 ? funcMatches[0] : 'solution';

  // Check if it's a void function (print-based)
  const isVoid = new RegExp(`void\\s+${funcName}\\s*\\(`).test(userCode);

  const headers = `#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\n#include <map>\n#include <set>\n#include <queue>\n#include <stack>\n#include <cmath>\n#include <sstream>\n#include <numeric>\nusing namespace std;\n\n`;

  if (isVoid) {
    return `${headers}${userCode}\n\nint main() {\n    try {\n        ${funcName}(${input});\n    } catch (exception& e) {\n        cout << "Error: " << e.what() << endl;\n    }\n    return 0;\n}`;
  }

  // Check if input is a function call
  if (isInputFunctionCall(input)) {
    return `${headers}${userCode}\n\nint main() {\n    try {\n        auto result = ${input};\n        cout << result << endl;\n    } catch (exception& e) {\n        cout << "Error: " << e.what() << endl;\n    }\n    return 0;\n}`;
  }

  return `${headers}${userCode}\n\nint main() {\n    try {\n        auto result = ${funcName}(${input});\n        cout << result << endl;\n    } catch (exception& e) {\n        cout << "Error: " << e.what() << endl;\n    }\n    return 0;\n}`;
}

// ====================================================================
// =================== VALIDATION LOGIC ===============================
// ====================================================================

function validateCodeStructure(
  userCode: string,
  starterCode: string,
  language: string
): ValidationResult[] {
  const results: ValidationResult[] = [];
  const executableCode = extractExecutableCode(userCode, language);
  const lang = language.toLowerCase();

  if (executableCode.length < 5) {
    results.push({
      passed: false,
      message: '❌ الكود قصير جدا - يرجى كتابة حل كامل',
    });
    return results;
  }

  const starterHasFunc =
    lang === 'python'
      ? /def\s+\w+\s*\(/.test(starterCode)
      : /function\s+\w+\s*\(/.test(starterCode) ||
        /const\s+\w+\s*=\s*function/.test(starterCode);

  if (!starterHasFunc) return results;

  const classInfo = detectClassPattern(executableCode, lang);
  if (classInfo.isClass) return results;

  if (lang === 'python') {
    if (!/def\s+\w+\s*\(/.test(executableCode)) {
      results.push({ passed: false, message: '❌ يجب تعريف دالة (function)' });
    }
    if (!/return\s+\S/.test(executableCode)) {
      results.push({
        passed: false,
        message: '❌ لا توجد جملة return - تأكد من إرجاع النتيجة',
      });
    }
  } else if (lang === 'javascript' || lang === 'typescript') {
    if (
      !/function\s+\w+\s*\(/.test(executableCode) &&
      !/=>\s*/.test(executableCode) &&
      !/const\s+\w+\s*=\s*function/.test(executableCode)
    ) {
      results.push({ passed: false, message: '❌ يجب تعريف دالة (function)' });
    }
    if (
      !/return\s+\S/.test(executableCode) &&
      !/=>\s*[^{]/.test(executableCode)
    ) {
      results.push({
        passed: false,
        message: '❌ لا توجد جملة return - تأكد من إرجاع النتيجة',
      });
    }
  }

  return results;
}

async function validateTestCase(
  userCode: string,
  language: string,
  testCase: TestCase
): Promise<ValidationResult> {
  try {
    const testCode = createTestWrapper(language, userCode, testCase);
    const result = await executeCode({
      language: language.toLowerCase(),
      code: testCode,
    });
    const actualOutput = result.output?.trim() || '';
    const errorOutput = result.error?.trim() || '';

    // If code produced output, check it FIRST (even with stderr warnings)
    if (actualOutput) {
      // Check if the output contains "Error:" which means the try/catch caught a runtime error
      if (
        actualOutput.startsWith('Error:') &&
        !testCase.expectedOutput.startsWith('Error:')
      ) {
        return {
          passed: false,
          message: `❌ ${testCase.description}: خطأ في التنفيذ`,
          error: actualOutput,
          actualOutput,
          expectedOutput: testCase.expectedOutput,
        };
      }

      const passed = compareOutputs(actualOutput, testCase.expectedOutput);
      if (passed) {
        return {
          passed: true,
          message: `✅ ${testCase.description}: نجح`,
          actualOutput,
          expectedOutput: testCase.expectedOutput,
        };
      }
    }

    // If execution failed with error and NO output at all
    if (!result.success && errorOutput && !actualOutput) {
      // Check for syntax errors specifically
      const isSyntaxError =
        /SyntaxError|IndentationError|ParseError|TypeError|ReferenceError|NameError/.test(
          errorOutput
        );
      return {
        passed: false,
        message: `❌ ${testCase.description}: ${isSyntaxError ? 'خطأ في بنية الكود' : 'خطأ في التنفيذ'}`,
        error: errorOutput.slice(0, 500),
        actualOutput: actualOutput || undefined,
        expectedOutput: testCase.expectedOutput,
      };
    }

    // Code ran but output doesn't match
    return {
      passed: false,
      message: `❌ ${testCase.description}: النتيجة غير صحيحة`,
      actualOutput: actualOutput || '(لا يوجد مخرجات)',
      expectedOutput: testCase.expectedOutput,
    };
  } catch (error) {
    return {
      passed: false,
      message: `❌ ${testCase.description}: خطأ في التنفيذ`,
      error: error instanceof Error ? error.message : 'Unknown error',
      expectedOutput: testCase.expectedOutput,
    };
  }
}

// ====================================================================
// =================== CSS / REACT / HTML VALIDATION ==================
// ====================================================================

function countMatches(text: string, regex: RegExp): number {
  return (text.match(regex) || []).length;
}

interface StructuralReq {
  check: (code: string) => boolean;
  message: string;
}

function getHTMLRequirements(starterCode: string): StructuralReq[] {
  const s = starterCode.toLowerCase();
  const reqs: StructuralReq[] = [];

  // FORM
  if (
    s.includes('<form') &&
    (s.includes('email') ||
      s.includes('password') ||
      s.includes('البريد') ||
      s.includes('كلمة المرور'))
  ) {
    reqs.push({
      check: (c) => /<form[^>]*>/i.test(c),
      message: 'أضف عنصر <form>',
    });
    reqs.push({
      check: (c) => /<input[^>]*type\s*=\s*["']email["'][^>]*>/i.test(c),
      message: 'أضف حقل <input type="email">',
    });
    reqs.push({
      check: (c) => /<input[^>]*type\s*=\s*["']password["'][^>]*>/i.test(c),
      message: 'أضف حقل <input type="password">',
    });
    reqs.push({
      check: (c) =>
        /<button[^>]*type\s*=\s*["']submit["']/i.test(c) ||
        /<input[^>]*type\s*=\s*["']submit["']/i.test(c),
      message: 'أضف زر إرسال submit',
    });
    reqs.push({
      check: (c) => /required/i.test(c),
      message: 'أضف خاصية required للحقول المطلوبة',
    });
    return reqs;
  }

  // SEMANTIC
  if (
    (s.includes('class="header"') ||
      s.includes('class="nav"') ||
      s.includes('class="footer"')) &&
    (s.includes('دلالية') || s.includes('semantic'))
  ) {
    reqs.push({
      check: (c) => /<header[^>]*>/i.test(c),
      message: 'استبدل div بعنصر <header>',
    });
    reqs.push({
      check: (c) => /<nav[^>]*>/i.test(c),
      message: 'استبدل div بعنصر <nav>',
    });
    reqs.push({
      check: (c) => /<main[^>]*>/i.test(c),
      message: 'استبدل div بعنصر <main>',
    });
    reqs.push({
      check: (c) => /<footer[^>]*>/i.test(c),
      message: 'أضف عنصر <footer>',
    });
    return reqs;
  }

  // TABLE
  if (
    s.includes('<table') &&
    (s.includes('thead') || s.includes('رأس الجدول'))
  ) {
    reqs.push({
      check: (c) => /<thead[^>]*>/i.test(c),
      message: 'أضف <thead>',
    });
    reqs.push({
      check: (c) => /<tbody[^>]*>/i.test(c),
      message: 'أضف <tbody>',
    });
    reqs.push({
      check: (c) => /<tfoot[^>]*>/i.test(c),
      message: 'أضف <tfoot>',
    });
    reqs.push({
      check: (c) => countMatches(c, /<th[^>]*>/gi) >= 3,
      message: 'أضف 3 عناوين أعمدة <th>',
    });
    reqs.push({
      check: (c) => countMatches(c, /<td[^>]*>/gi) >= 9,
      message: 'أضف بيانات 3 طلاب على الأقل',
    });
    return reqs;
  }

  // MEDIA
  if (
    s.includes('فيديو') ||
    s.includes('صوت') ||
    s.includes('وسائط') ||
    (s.includes('video') && s.includes('audio'))
  ) {
    reqs.push({
      check: (c) => /<video[^>]*>/i.test(c),
      message: 'أضف عنصر <video>',
    });
    reqs.push({
      check: (c) => /controls/i.test(c),
      message: 'أضف خاصية controls',
    });
    reqs.push({
      check: (c) => /<audio[^>]*>/i.test(c),
      message: 'أضف عنصر <audio>',
    });
    reqs.push({
      check: (c) => countMatches(c, /<source[^>]*>/gi) >= 2,
      message: 'أضف عناصر <source>',
    });
    return reqs;
  }

  // NAV/DROPDOWN
  if (s.includes('<nav') && (s.includes('منسدلة') || s.includes('dropdown'))) {
    reqs.push({ check: (c) => /<nav[^>]*>/i.test(c), message: 'أضف <nav>' });
    reqs.push({
      check: (c) => countMatches(c, /<ul[^>]*>/gi) >= 2,
      message: 'أضف قائمتين <ul>',
    });
    reqs.push({
      check: (c) => countMatches(c, /<a[^>]*href/gi) >= 3,
      message: 'أضف 3 روابط على الأقل',
    });
    return reqs;
  }

  // FAQ/DETAILS
  if (
    s.includes('details') ||
    s.includes('summary') ||
    s.includes('أسئلة شائعة') ||
    s.includes('faq')
  ) {
    reqs.push({
      check: (c) => countMatches(c, /<details[^>]*>/gi) >= 3,
      message: 'أضف 3 عناصر <details>',
    });
    reqs.push({
      check: (c) => countMatches(c, /<summary[^>]*>/gi) >= 3,
      message: 'أضف 3 عناصر <summary>',
    });
    reqs.push({
      check: (c) => /<details[^>]*\bopen\b[^>]*>/i.test(c),
      message: 'اجعل سؤالا مفتوحا بخاصية open',
    });
    return reqs;
  }

  // GENERIC: require adding meaningful content
  reqs.push({
    check: (c) => {
      const added =
        countMatches(c, /<\w+[^>]*>/g) -
        countMatches(starterCode, /<\w+[^>]*>/g);
      return added >= 3;
    },
    message: 'أضف 3 عناصر HTML جديدة على الأقل',
  });
  return reqs;
}

function validateHTMLChallenge(
  userCode: string,
  starterCode: string,
  testCases: TestCase[]
): ChallengeValidationResult {
  const results: ValidationResult[] = [];
  const userExec = extractExecutableCode(userCode, 'html');
  const requirements = getHTMLRequirements(starterCode);

  let passedReqs = 0;
  const failedMsgs: string[] = [];
  for (const req of requirements) {
    if (req.check(userExec)) passedReqs++;
    else failedMsgs.push(`❌ ${req.message}`);
  }

  if (failedMsgs.length > 0) {
    for (const msg of failedMsgs) results.push({ passed: false, message: msg });
    if (passedReqs > 0)
      results.push({
        passed: true,
        message: `✅ ${passedReqs}/${requirements.length} متطلبات محققة`,
      });
    return {
      allPassed: false,
      results,
      totalTests: requirements.length,
      passedTests: passedReqs,
    };
  }

  for (const tc of testCases)
    results.push({
      passed: true,
      message: `✅ ${tc.description}: نجح`,
      expectedOutput: tc.expectedOutput,
    });
  return {
    allPassed: true,
    results,
    totalTests: testCases.length,
    passedTests: testCases.length,
  };
}

function validateCSSChallenge(
  userCode: string,
  starterCode: string,
  testCases: TestCase[]
): ChallengeValidationResult {
  const results: ValidationResult[] = [];
  const userExec = extractExecutableCode(userCode, 'css');
  const starterExec = extractExecutableCode(starterCode, 'css');

  const userDecls = userExec.match(/[\w-]+\s*:\s*[^;{}]+;/g) || [];
  const starterDecls = starterExec.match(/[\w-]+\s*:\s*[^;{}]+;/g) || [];
  const added = userDecls.length - starterDecls.length;

  if (added < 2) {
    for (const tc of testCases)
      results.push({
        passed: false,
        message: `❌ ${tc.description}: أضف المزيد من خصائص CSS (أضفت ${Math.max(0, added)} فقط)`,
        expectedOutput: tc.expectedOutput,
      });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  const openB = (userExec.match(/{/g) || []).length;
  const closeB = (userExec.match(/}/g) || []).length;
  if (openB !== closeB) {
    for (const tc of testCases)
      results.push({
        passed: false,
        message: `❌ ${tc.description}: خطأ في بناء الكود - تأكد من إغلاق {}`,
        expectedOutput: tc.expectedOutput,
      });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  const sLower = starterCode.toLowerCase();
  const errors: string[] = [];
  if (
    (sLower.includes('flex') || sLower.includes('flexbox')) &&
    !/display\s*:\s*flex/i.test(userExec)
  )
    errors.push('❌ استخدم display: flex');
  if (sLower.includes('grid') && !/display\s*:\s*grid/i.test(userExec))
    errors.push('❌ استخدم display: grid');
  if (sLower.includes('@media') && !/@media/i.test(userExec))
    errors.push('❌ استخدم @media للتصميم المتجاوب');
  if (
    (sLower.includes('animation') || sLower.includes('@keyframes')) &&
    !/animation|@keyframes|transition/i.test(userExec)
  )
    errors.push('❌ أضف animations أو transitions');

  if (errors.length > 0) {
    for (const e of errors) results.push({ passed: false, message: e });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  for (const tc of testCases)
    results.push({
      passed: true,
      message: `✅ ${tc.description}: نجح`,
      expectedOutput: tc.expectedOutput,
    });
  return {
    allPassed: true,
    results,
    totalTests: testCases.length,
    passedTests: testCases.length,
  };
}

function validateReactChallenge(
  userCode: string,
  starterCode: string,
  testCases: TestCase[]
): ChallengeValidationResult {
  const results: ValidationResult[] = [];
  const userExec = extractExecutableCode(userCode, 'react');
  const starterExec = extractExecutableCode(starterCode, 'react');

  if (userExec.length - starterExec.length < 10) {
    for (const tc of testCases)
      results.push({
        passed: false,
        message: `❌ ${tc.description}: أضف المزيد من الكود`,
        expectedOutput: tc.expectedOutput,
      });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  if (!/<\w+/.test(userExec)) {
    for (const tc of testCases)
      results.push({
        passed: false,
        message: `❌ ${tc.description}: يجب أن يحتوي على عناصر JSX`,
        expectedOutput: tc.expectedOutput,
      });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  if (!/return\s*\(/.test(userExec) && !/return\s*</.test(userExec)) {
    for (const tc of testCases)
      results.push({
        passed: false,
        message: `❌ ${tc.description}: يجب أن يرجع JSX (return)`,
        expectedOutput: tc.expectedOutput,
      });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  const errors: string[] = [];
  if (/useState/i.test(starterCode) && !/useState/.test(userExec))
    errors.push('❌ استخدم useState لإدارة الحالة');
  if (/useEffect/i.test(starterCode) && !/useEffect/.test(userExec))
    errors.push('❌ استخدم useEffect');
  if (
    /onClick|onChange|onSubmit/i.test(starterCode) &&
    !/onClick|onChange|onSubmit/.test(userExec)
  )
    errors.push('❌ أضف معالج أحداث');

  if (errors.length > 0) {
    for (const e of errors) results.push({ passed: false, message: e });
    return {
      allPassed: false,
      results,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  for (const tc of testCases)
    results.push({
      passed: true,
      message: `✅ ${tc.description}: نجح`,
      expectedOutput: tc.expectedOutput,
    });
  return {
    allPassed: true,
    results,
    totalTests: testCases.length,
    passedTests: testCases.length,
  };
}

// ====================================================================
// =================== MAIN VALIDATION ================================
// ====================================================================

export async function validateChallenge(
  userCode: string,
  starterCode: string,
  language: string,
  testCases: TestCase[]
): Promise<ChallengeValidationResult> {
  const lang = language.toLowerCase();

  // Step 1: meaningful code check
  if (!hasUserWrittenCode(userCode, starterCode, language)) {
    return {
      allPassed: false,
      results: [
        {
          passed: false,
          message: '❌ يرجى كتابة كود الحل - التعليقات وحدها لا تكفي',
        },
      ],
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  // Step 2: structural languages
  if (lang === 'css')
    return validateCSSChallenge(userCode, starterCode, testCases);
  if (lang === 'html')
    return validateHTMLChallenge(userCode, starterCode, testCases);
  if (lang === 'react')
    return validateReactChallenge(userCode, starterCode, testCases);

  // Step 3: structure check
  const structResults = validateCodeStructure(userCode, starterCode, language);
  const criticalErrors = structResults.filter(
    (r) => !r.passed && r.message.includes('❌')
  );
  if (criticalErrors.length > 0) {
    return {
      allPassed: false,
      results: structResults,
      totalTests: testCases.length,
      passedTests: 0,
    };
  }

  // Step 4: execute ALL test cases
  const results: ValidationResult[] = [];
  for (const tc of testCases) {
    const result = await validateTestCase(userCode, language, tc);
    results.push(result);
  }

  const passedTests = results.filter((r) => r.passed).length;
  return {
    allPassed: passedTests === testCases.length,
    results,
    totalTests: testCases.length,
    passedTests,
  };
}

export function quickValidate(
  userCode: string,
  starterCode: string,
  language: string
): { valid: boolean; message: string } {
  if (!hasUserWrittenCode(userCode, starterCode, language)) {
    return {
      valid: false,
      message: 'يرجى كتابة كود الحل - التعليقات وحدها لا تكفي',
    };
  }

  const lang = language.toLowerCase();
  if (lang === 'css' || lang === 'react' || lang === 'html') {
    return { valid: true, message: 'الكود جاهز للتشغيل' };
  }

  const structResults = validateCodeStructure(userCode, starterCode, language);
  const failed = structResults.find(
    (r) => !r.passed && r.message.includes('❌')
  );
  if (failed)
    return {
      valid: false,
      message: failed.message.replace(/[❌⚠️✅]/g, '').trim(),
    };

  return { valid: true, message: 'الكود جاهز للتشغيل' };
}
