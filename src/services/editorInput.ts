/** A hint only: stdin is always configurable even if a program is not recognized. */
export function needsEditorInput(code: string): boolean {
  return /\b(?:input|prompt|scanf|getchar|fgets|getline|readLine|nextInt|nextDouble|nextFloat|nextLong|nextLine|nextBoolean|next|readlines|readline|question)\s*\(|\bcin\s*>>|\b(?:stdin|STDIN|gets)\b|readFileSync\s*\(\s*(?:0|['"]\/dev\/stdin)/.test(code);
}
export function needsNodeInputRuntime(code: string): boolean {
  return /\b(?:require\s*\(\s*['"](?:node:)?(?:fs|readline)|import\b[^;\n]*['"](?:node:)?(?:fs|readline)|process\.stdin)/.test(code);
}
export function promptFromInput(input: string): () => string | null {
  const lines = input ? input.split(/\r\n|\n|\r/) : [];
  if (/(?:\r\n|\n|\r)$/.test(input)) lines.pop();
  let index = 0;
  return () => index < lines.length ? lines[index++] : null;
}
export function definesPrompt(code: string): boolean {
  return /\b(?:function\s+prompt\b|(?:const|let|var)\s+prompt\b)/.test(code);
}
/** Node/TypeScript do not have browser prompt(); provide it from submitted lines. */
export function codeWithPromptInput(code: string, input: string, language = 'javascript'): string {
  if (!/\bprompt\s*\(/.test(code) || definesPrompt(code)) return code;
  const values: string[] = [];
  const read = promptFromInput(input);
  let value: string | null;
  while ((value = read()) !== null) values.push(value);
  // A TypeScript module keeps our prompt local instead of colliding with lib.dom.
  return `${language === 'typescript' ? 'export {};\n' : ''}const prompt = ((lines) => { let index=0; return (...args) => index<lines.length ? lines[index++] : null; })(${JSON.stringify(values)});\n${code}`;
}
