/**
 * md`...` — كتابة محتوى الدروس بأمان داخل TypeScript.
 *
 * يحافظ على الشرطة المائلة كما كُتبت تماماً (مثل "\n" داخل أمثلة Python)،
 * بعكس القوالب العادية التي كانت تُسقط \s و \d وغيرها بصمت.
 * لكتابة علامة ` داخل المحتوى اكتب \`   ولكتابة ${ (قوالب JavaScript) اكتب \${
 */
export function md(strings: TemplateStringsArray, ...values: unknown[]): string {
  let out = strings.raw[0];
  for (let i = 0; i < values.length; i++) out += String(values[i]) + strings.raw[i + 1];
  return out
    .replace(/\\`/g, '`')
    .replace(/\\\$\{/g, '${')
    .replace(/^\n/, '')
    .replace(/\s+$/, '\n');
}
