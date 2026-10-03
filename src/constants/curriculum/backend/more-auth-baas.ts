/**
 * توسيع backend-auth و backend-supabase و backend-firebase.
 * الفجوة: لا حماية للحسابات من التخمين (تحديد المعدل، القفل)، ولا مصادقة ثنائية، ولا مشاريع ختامية
 * تجمع المفاهيم. TOTP يُتحقق منه مقابل متجه الاختبار الرسمي في RFC 6238؛ سياسات Supabase تُنفَّذ على
 * PostgreSQL (PGlite) بمخطط auth بديل مبسّط في أداة الفحص.
 */
import type { NewLesson } from '../types';
import { md } from '../md';

export const AUTH_NEW_LESSONS: NewLesson[] = [
  {
    id: 'auth-rate-limit-mfa',
    title: 'حماية الحسابات: تحديد المعدل و MFA',
    description: 'هجمات التخمين وحشو بيانات الاعتماد، خوارزميات تحديد المعدل، القفل التدريجي دون حرمان المستخدم، والمصادقة الثنائية بـ TOTP ورموز الاسترداد',
    language: 'javascript',
    xpReward: 190,
    content: md`
# حماية الحسابات: تحديد المعدل والمصادقة الثنائية

كلمة المرور المخزنة بأمان (درس التجزئة) لا تحمي من مهاجم يجربها **عبر نموذج الدخول نفسه**. هذا الدرس يغطي طبقتين: إبطاء المحاولات، وعامل ثانٍ لا تكفيه كلمة المرور.

## الهجمات
| الهجوم | الوصف | ما يوقفه |
|---|---|---|
| **التخمين** (Brute force) | آلاف كلمات المرور لحساب واحد | تحديد المعدل لكل حساب، القفل التدريجي |
| **رش كلمات المرور** (Password spraying) | كلمة شائعة واحدة ("123456") على آلاف الحسابات | تحديد المعدل لكل IP، رفض كلمات المرور الشائعة/المسرّبة |
| **حشو بيانات الاعتماد** (Credential stuffing) | بريد وكلمة مرور مسرّبان من موقع آخر | MFA، فحص كلمات المرور المسرّبة، كشف الأنماط الآلية |

## خوارزميات تحديد المعدل
| الخوارزمية | الفكرة | ملاحظات |
|---|---|---|
| **نافذة ثابتة** | 5 محاولات لكل دقيقة تبدأ عند :00 | بسيطة؛ تسمح بـ 10 محاولات حول حد النافذة |
| **نافذة منزلقة** | آخر 60 ثانية دائماً | أدق |
| **دلو الرموز** (Token bucket) | الدلو يمتلئ بمعدل ثابت وكل طلب يأخذ رمزاً | يسمح بدفعات قصيرة مع معدل متوسط محدد |
المثال الكامل ينفذ دلو الرموز.

## ماذا نحدّ؟
- **لكل حساب** (بريد): يحمي من التخمين على حساب واحد مهما تغيرت عناوين IP.
- **لكل IP**: يحمي من الرش — لكن انتبه: مستخدمو شبكة جامعة أو مزود جوال يتشاركون IP واحداً.
- **عام** على المسارات الحساسة: التسجيل، استعادة كلمة المرور، إرسال رموز SMS (مكلفة!).
- الاستجابة: \`429 Too Many Requests\` مع ترويسة \`Retry-After\`.

## أين يُخزَّن العداد؟
في الذاكرة يعمل لخادم واحد فقط؛ مع عدة نسخ خلف موزع حمل، يحتاج كل منها رؤية نفس العداد ← **Redis** (أو قاعدة البيانات). مكتبة \`express-rate-limit\` تدعم مخازن خارجية.

## القفل: بحذر
قفل الحساب نهائياً بعد 5 محاولات يعطي المهاجم سلاحاً: يقفل حسابات الآخرين عمداً (حرمان من الخدمة). الأفضل:
- **تأخير متزايد** (1ث، 2ث، 4ث…) أو قفل **مؤقت** قصير.
- أو طلب CAPTCHA بعد عدة محاولات فاشلة.
- إشعار المستخدم بالبريد عند محاولات مشبوهة، وإتاحة فك القفل عبر رابط.
- رسالة موحدة دائماً ("بيانات غير صحيحة") حتى لا يُكشف وجود الحساب.

## المصادقة الثنائية بـ TOTP
تطبيقات مثل Google Authenticator تولّد رمزاً من 6 أرقام يتغير كل 30 ثانية. الخادم والهاتف يتشاركان **سراً** عند التفعيل (رمز QR)، وكلاهما يحسب:
\`\`\`text
الخطوة الزمنية T = floor(الوقت بالثواني / 30)
الرمز = آخر 6 أرقام من HMAC-SHA1(السر، T) بعد "الاقتطاع الديناميكي"   (RFC 6238 فوق RFC 4226)
\`\`\`
- اقبل نافذة ±1 خطوة لتعويض فروق الساعة.
- امنع **إعادة استخدام** نفس الرمز خلال صلاحيته (سجّل آخر خطوة استُخدمت).
- طبّق تحديد المعدل على إدخال رمز MFA أيضاً (مليون احتمال فقط).
- خزّن السر **مشفّراً** في قاعدة البيانات (لا تجزئة: الخادم يحتاجه لحساب الرموز).
المثال الكامل ينفذ TOTP بـ \`node:crypto\` ويتحقق منه مقابل متجه الاختبار الرسمي في RFC 6238.

## رموز الاسترداد
عند تفعيل MFA أعطِ المستخدم 8–10 رموز لمرة واحدة لحالة فقدان الهاتف. **خزّن تجزئتها** (مثل كلمات المرور)، واحذف كل رمز عند استخدامه.

## أقوى من TOTP
- **Passkeys / WebAuthn**: مفتاح خاص على الجهاز، مقاوم للتصيد تماماً (الموقع المزيف لا يحصل على توقيع صالح). الاتجاه الحالي للصناعة.
- **SMS**: أفضل من لا شيء، لكنه عرضة لهجمات نقل الشريحة (SIM swap).

## تمرين
أضف للمثال الكامل "تأخيراً متزايداً" لكل بريد بعد كل محاولة فاشلة، ورموز استرداد: ولّد 8 رموز، خزّن تجزئتها، واجعل استخدام الرمز مرة واحدة فقط.
`,
    codeExample: `const crypto = require("node:crypto");
const assert = require("node:assert/strict");

// ===== 1) TOTP (RFC 6238) بـ node:crypto =====
function hotp(secret, counter, digits = 6, algorithm = "sha1") {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac(algorithm, secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;                      // الاقتطاع الديناميكي
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits;
  return String(code).padStart(digits, "0");
}

function totp(secret, timeSeconds = Date.now() / 1000, { step = 30, digits = 6, algorithm = "sha1" } = {}) {
  return hotp(secret, Math.floor(timeSeconds / step), digits, algorithm);
}

// تحقق بنافذة ±1 خطوة، ومنع إعادة استخدام نفس الخطوة
function verifyTotp(secret, code, lastUsedStep, now = Date.now() / 1000) {
  const current = Math.floor(now / 30);
  for (const step of [current - 1, current, current + 1]) {
    if (step <= lastUsedStep) continue;                               // رمز استُخدم من قبل
    const expected = hotp(secret, step);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(code).padStart(6, "0")))) return { ok: true, step };
  }
  return { ok: false };
}

// متجه الاختبار الرسمي من RFC 6238 (السر "12345678901234567890"، 8 أرقام، SHA1)
const rfcSecret = Buffer.from("12345678901234567890");
assert.equal(totp(rfcSecret, 59, { digits: 8 }), "94287082");
assert.equal(totp(rfcSecret, 1111111109, { digits: 8 }), "07081804");
assert.equal(totp(rfcSecret, 20000000000, { digits: 8 }), "65353130");
console.log("✅ TOTP يطابق متجهات RFC 6238");

const userSecret = crypto.randomBytes(20);                             // يُخزَّن مشفّراً لا مجزّأً
const now = 1_790_000_000;
const code = totp(userSecret, now);
const first = verifyTotp(userSecret, code, -1, now);
const replay = verifyTotp(userSecret, code, first.step, now);
console.log("الرمز:", code, "| أول استخدام:", first.ok, "| إعادة الاستخدام:", replay.ok);

// ===== 2) تحديد المعدل بدلو الرموز (لكل مفتاح: بريد أو IP) =====
function createLimiter({ capacity, refillPerSecond }) {
  const buckets = new Map();                                          // في الإنتاج: Redis
  return function take(key, nowMs = Date.now()) {
    const b = buckets.get(key) ?? { tokens: capacity, updated: nowMs };
    b.tokens = Math.min(capacity, b.tokens + ((nowMs - b.updated) / 1000) * refillPerSecond);
    b.updated = nowMs;
    if (b.tokens < 1) {
      buckets.set(key, b);
      return { allowed: false, retryAfterSeconds: Math.ceil((1 - b.tokens) / refillPerSecond) };
    }
    b.tokens -= 1;
    buckets.set(key, b);
    return { allowed: true };
  };
}

// 5 محاولات دفعة واحدة، ثم محاولة كل 12 ثانية (5 في الدقيقة)
const loginLimiter = createLimiter({ capacity: 5, refillPerSecond: 5 / 60 });
const t0 = 1_000_000;
const results = Array.from({ length: 7 }, (_, i) => loginLimiter("sara@example.com", t0 + i * 100));
console.log("المحاولات السبع الأولى:", results.map((r) => (r.allowed ? "✓" : \`429 بعد \${r.retryAfterSeconds}ث\`)).join(" "));
console.log("بعد 12 ثانية:", loginLimiter("sara@example.com", t0 + 12_700).allowed ? "✓" : "429");`,
    quiz: {
      question: 'لماذا لا يُنصح بقفل الحساب نهائياً بعد 5 محاولات دخول فاشلة؟',
      options: [
        'لأن 5 محاولات قليلة جداً للمهاجم',
        'لأن المهاجم يستطيع قفل حسابات الآخرين عمداً (حرمان من الخدمة)؛ التأخير المتزايد أو القفل المؤقت أفضل',
        'لأن القفل لا يمكن برمجته',
        'لأن المستخدمين لا يخطئون في كلمات المرور',
      ],
      correctAnswer: 1,
      explanation: 'القفل النهائي يحوّل الحماية إلى أداة هجوم؛ المطلوب إبطاء التخمين لا حرمان المالك.',
    },
  },
  {
    id: 'auth-project',
    title: 'مشروع: نظام مصادقة كامل',
    description: 'مشروع ختامي يجمع الدورة: تسجيل بتحقق البريد، دخول بجلسة/رموز وتدوير، استعادة كلمة المرور، MFA، تحديد المعدل، حماية المسارات، وقائمة اختبارات أمنية',
    language: 'javascript',
    xpReward: 280,
    content: md`
# مشروع: نظام مصادقة كامل

ستبني وحدة مصادقة قابلة لإعادة الاستخدام في أي API. معيار النجاح ليس "يعمل" بل "يصمد أمام قائمة الهجمات" في آخر الدرس.

## التدفقات
\`\`\`text
التسجيل:    بريد + كلمة مرور ← تجزئة (Argon2id/bcrypt) ← حساب غير موثّق ← رابط تحقق (رمز لمرة واحدة)
الدخول:     تحديد معدل ← تحقق ← (MFA إن مفعّل) ← رمز وصول 15د + رمز تجديد في cookie HttpOnly
التجديد:    تدوير الرمز + كشف إعادة الاستخدام (درس Refresh Tokens)
الاستعادة:  رسالة موحدة ← رمز عشوائي (تجزئته في القاعدة، صلاحية 30د) ← كلمة جديدة ← إلغاء كل الجلسات
الخروج:     حذف عائلة رمز التجديد + مسح الـ cookie
\`\`\`

## الجداول
\`\`\`sql
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_verified_at TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mfa_secret_encrypted TEXT,
  mfa_last_step BIGINT NOT NULL DEFAULT -1,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);
-- رموز لمرة واحدة: التحقق من البريد واستعادة كلمة المرور (التجزئة فقط)
CREATE TABLE one_time_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify_email', 'reset_password')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);
CREATE TABLE refresh_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);
CREATE INDEX refresh_tokens_family_idx ON refresh_tokens(family_id);
\`\`\`

## قرارات تستحق الانتباه
| القرار | السبب |
|---|---|
| رسائل موحدة في الدخول والاستعادة | لا تكشف وجود الحساب (User Enumeration) |
| تجزئة الرموز لمرة واحدة ورموز التجديد | تسريب القاعدة لا يعطي رموزاً صالحة |
| \`password_changed_at\` في فحص الرموز | تغيير كلمة المرور يُبطل رموز الوصول القديمة |
| \`mfa_last_step\` | منع إعادة استخدام رمز TOTP |
| الدور من القاعدة لا من الطلب | منع رفع الصلاحيات |
| حد للمعدل على الدخول والاستعادة والتسجيل وإعادة إرسال البريد | منع التخمين وإساءة إرسال الرسائل |

## قائمة الهجمات (اختبارات يجب أن تنجح)
- [ ] 20 محاولة دخول خاطئة متتالية ← 429 مع Retry-After.
- [ ] "بريد غير موجود" و"كلمة مرور خاطئة" ← نفس الرسالة **ونفس الزمن تقريباً** (جزّئ كلمة مرور وهمية عند عدم وجود البريد).
- [ ] استخدام رابط الاستعادة مرتين ← المرة الثانية تفشل؛ رابط منتهٍ ← يفشل.
- [ ] بعد تغيير كلمة المرور ← رمز الوصول القديم وكل رموز التجديد مرفوضة.
- [ ] إعادة استخدام رمز تجديد قديم ← إلغاء العائلة كلها.
- [ ] رمز TOTP مستخدم ← مرفوض حتى داخل نافذته.
- [ ] \`POST /register\` بحقل \`role: "admin"\` ← يُتجاهل.
- [ ] لا يظهر \`password_hash\` أو الأسرار في أي استجابة أو سجل.
- [ ] ملفات تعريف الارتباط: HttpOnly و Secure و SameSite.

## بعد المشروع
قارن ما بنيته بخدمة جاهزة (Supabase Auth، Auth.js، Clerk): كل بند في القائمة يجب أن تجده هناك. القرار الصحيح لكثير من المشاريع هو استخدام خدمة مُختبرة — وأنت الآن تعرف كيف تقيّمها وتستخدمها بشكل صحيح.
`,
    codeExample: `// auth.routes.js — مسارات الدخول والاستعادة بمبادئ المشروع (npm install express argon2 zod)
import crypto from "node:crypto";
import express from "express";
import argon2 from "argon2";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { rateLimit } from "../lib/rateLimit.js";      // دلو رموز على Redis (درس حماية الحسابات)
import { issueSession } from "./sessions.js";          // رمز وصول + تجديد بالتدوير (درس Refresh Tokens)
import { sendEmail } from "../lib/mailer.js";

export const authRouter = express.Router();
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const credentials = z.object({ email: z.string().email().toLowerCase(), password: z.string().min(8).max(200) });

// تجزئة وهمية: يستغرق الرفض نفس الزمن سواء وُجد البريد أم لا
const DUMMY_HASH = await argon2.hash("dummy-password-for-timing");

authRouter.post("/register", rateLimit({ key: (req) => req.ip, capacity: 5, perMinute: 5 }), async (req, res) => {
  const { email, password } = credentials.parse(req.body);   // role وغيره يُتجاهل: لا يدخل المخطط
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  const { rows } = await pool.query(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING id",
    [email, hash]
  );
  if (rows[0]) await sendVerification(rows[0].id, email);
  // نفس الاستجابة في الحالتين: لا نكشف أن البريد مسجل مسبقاً
  res.status(202).json({ message: "إن كان البريد صالحاً ستصلك رسالة تأكيد" });
});

authRouter.post("/login", rateLimit({ key: (req) => \`login:\${String(req.body?.email).toLowerCase()}\`, capacity: 5, perMinute: 5 }), async (req, res) => {
  const { email, password } = credentials.parse(req.body);
  const { rows: [user] } = await pool.query("SELECT id, password_hash, email_verified_at, role FROM users WHERE email = $1", [email]);
  const valid = await argon2.verify(user?.password_hash ?? DUMMY_HASH, password);
  if (!user || !valid) return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
  if (!user.email_verified_at) return res.status(403).json({ error: "أكّد بريدك أولاً" });
  await issueSession(res, user);      // يضع cookie التجديد ويعيد رمز الوصول
});

authRouter.post("/password/forgot", rateLimit({ key: (req) => req.ip, capacity: 3, perMinute: 1 }), async (req, res) => {
  const email = z.string().email().toLowerCase().parse(req.body?.email);
  const { rows: [user] } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (user) {
    const token = crypto.randomBytes(32).toString("base64url");
    await pool.query(
      "INSERT INTO one_time_tokens (token_hash, user_id, purpose, expires_at) VALUES ($1, $2, 'reset_password', NOW() + interval '30 minutes')",
      [sha256(token), user.id]
    );
    await sendEmail(email, "استعادة كلمة المرور", \`\${process.env.APP_URL}/reset?token=\${token}\`);
  }
  res.status(202).json({ message: "إن كان الحساب موجوداً ستصلك رسالة" });
});

authRouter.post("/password/reset", rateLimit({ key: (req) => req.ip, capacity: 5, perMinute: 5 }), async (req, res) => {
  const { token, password } = z.object({ token: z.string().min(20), password: z.string().min(8).max(200) }).parse(req.body);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // يُستهلك الرمز ذرياً: مرة واحدة وقبل انتهاء صلاحيته
    const { rows: [t] } = await client.query(
      \`UPDATE one_time_tokens SET used_at = NOW()
       WHERE token_hash = $1 AND purpose = 'reset_password' AND used_at IS NULL AND expires_at > NOW()
       RETURNING user_id\`,
      [sha256(token)]
    );
    if (!t) { await client.query("ROLLBACK"); return res.status(400).json({ error: "الرابط غير صالح أو منتهٍ" }); }
    const hash = await argon2.hash(password, { type: argon2.argon2id });
    await client.query("UPDATE users SET password_hash = $1, password_changed_at = NOW() WHERE id = $2", [hash, t.user_id]);
    await client.query("DELETE FROM refresh_tokens WHERE user_id = $1", [t.user_id]);   // إلغاء كل الجلسات
    await client.query("COMMIT");
    res.json({ message: "تم تغيير كلمة المرور؛ سجّل الدخول من جديد" });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

async function sendVerification(userId, email) {
  const token = crypto.randomBytes(32).toString("base64url");
  await pool.query(
    "INSERT INTO one_time_tokens (token_hash, user_id, purpose, expires_at) VALUES ($1, $2, 'verify_email', NOW() + interval '24 hours')",
    [sha256(token), userId]
  );
  await sendEmail(email, "تأكيد البريد", \`\${process.env.APP_URL}/verify?token=\${token}\`);
}`,
    quiz: {
      question: 'لماذا يُحسب argon2.verify على "تجزئة وهمية" حتى عندما لا يوجد البريد؟',
      options: [
        'لتسريع الدخول',
        'كي يستغرق الرفض نفس الزمن تقريباً في الحالتين، فلا يكشف فرق التوقيت أن البريد مسجل',
        'لأن argon2 يتطلب ذلك',
        'لإنشاء حساب تلقائياً',
      ],
      correctAnswer: 1,
      explanation: 'الرد السريع لبريد غير موجود والبطيء لموجود يكشف الحسابات عبر التوقيت.',
    },
  },
];

export const SUPABASE_PROJECT: NewLesson = {
  id: 'supa-project',
  title: 'مشروع: تطبيق ملاحظات للفرق بـ Supabase',
  description: 'مشروع ختامي: فرق وأعضاء بأدوار، ملاحظات بسياسات RLS مبنية على العضوية، مرفقات في Storage، تحديثات لحظية، ودالة Edge للدعوات — مع اختبار السياسات',
  language: 'sql',
  xpReward: 260,
  content: md`
# مشروع: تطبيق ملاحظات للفرق بـ Supabase

تطبيق تتشارك فيه فرق صغيرة ملاحظاتها. التحدي الحقيقي ليس الواجهة بل **الصلاحيات**: كل عضو يرى ملاحظات فرقه فقط، والمالك وحده يدير الأعضاء — وكل ذلك تفرضه قاعدة البيانات نفسها لأن الواجهة تتصل بها مباشرة بمفتاح علني.

## الجداول والأدوار
\`\`\`text
teams ──< team_members (role: owner | editor | viewer) >── auth.users
teams ──< notes (author_id) ──< attachments (في Storage: team-files/{team_id}/...)
\`\`\`

## المبدأ: دالة مساعدة للعضوية
سياسات كثيرة تسأل نفس السؤال: "هل المستخدم عضو في هذا الفريق؟ بأي دور؟". دالة واحدة \`SECURITY DEFINER\` تجيب، فتتجنب تكرار المنطق وتتجنب حلقة RLS على جدول الأعضاء نفسه:
\`\`\`sql
CREATE TABLE teams (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL);
CREATE TABLE team_members (
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  PRIMARY KEY (team_id, user_id)
);

CREATE FUNCTION public.team_role(p_team uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.team_members WHERE team_id = p_team AND user_id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.team_role(uuid) FROM anon;
\`\`\`
\`SET search_path = ''\` وأسماء الجداول الكاملة (\`public.team_members\`) يمنعان استغلال \`search_path\` في دوال \`SECURITY DEFINER\`.

## سياسات الملاحظات
| العملية | من يُسمح له |
|---|---|
| قراءة | أي عضو في الفريق |
| إنشاء | owner و editor، و \`author_id\` = المستخدم نفسه |
| تعديل | owner، أو editor على ملاحظاته فقط |
| حذف | owner فقط |
المثال الكامل يكتب الجداول والسياسات كاملة، ويُنفَّذ على PostgreSQL.

## Storage بنفس المنطق
المسار \`team-files/{team_id}/{note_id}/file.pdf\`، والسياسة تتحقق من العضوية عبر أول جزء من المسار:
\`\`\`sql
CREATE POLICY "members read team files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'team-files' AND public.team_role(((storage.foldername(name))[1])::uuid) IS NOT NULL);
\`\`\`
(تُنفَّذ في مشروع Supabase حقيقي حيث يوجد مخطط storage.)

## اللحظية
الواجهة تشترك في \`postgres_changes\` على \`notes\` بفلتر \`team_id=eq.<id>\` — و Realtime يحترم RLS، فلا يستقبل غير الأعضاء شيئاً.

## الدعوات: Edge Function
إضافة عضو بالبريد تحتاج البحث عن مستخدم بالبريد — وهذا لا يجوز من الواجهة (كشف قائمة المستخدمين). دالة Edge:
1. تتحقق أن المستدعي **owner** في الفريق (بعميل يحمل رمزه، عبر \`team_role\`).
2. بمفتاح service_role: تبحث عن المستخدم أو ترسل دعوة (\`auth.admin.inviteUserByEmail\`).
3. تضيف صف العضوية، وتحد عدد الدعوات لكل فريق يومياً.

## اختبار السياسات
لا تكتفِ بالتجربة من الواجهة. في SQL Editor أو بأداة pgTAP: انتحل مستخدماً (\`set local role authenticated; set local request.jwt.claim.sub = '...'\`) ونفّذ الاستعلامات المتوقع رفضها. المثال الكامل ينتهي بهذه الاختبارات.

## قائمة الإنجاز
- [ ] RLS مفعّل على كل الجداول، ولا جدول بلا سياسات مقصودة.
- [ ] viewer لا يُنشئ، و editor لا يعدّل ملاحظات غيره ولا يحذف، وغير العضو لا يرى شيئاً.
- [ ] لا مفتاح service_role في الواجهة.
- [ ] دالة الدعوة تتحقق من الدور وتحد المعدل.
- [ ] الأنواع مولّدة لـ TypeScript (\`supabase gen types\`).
`,
  codeExample: `-- ===== الجداول =====
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE team_members (
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  body text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notes_team_idx ON notes(team_id, updated_at DESC);

-- ===== دالة العضوية (تتجنب حلقة RLS على team_members) =====
CREATE FUNCTION public.team_role(p_team uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT role FROM public.team_members WHERE team_id = p_team AND user_id = auth.uid();
$$;
REVOKE EXECUTE ON FUNCTION public.team_role(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.team_role(uuid) TO authenticated;

-- ===== RLS =====
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members see team" ON teams FOR SELECT TO authenticated USING (public.team_role(id) IS NOT NULL);
CREATE POLICY "members see members" ON team_members FOR SELECT TO authenticated USING (public.team_role(team_id) IS NOT NULL);
CREATE POLICY "owner manages members" ON team_members FOR ALL TO authenticated
  USING (public.team_role(team_id) = 'owner') WITH CHECK (public.team_role(team_id) = 'owner');

CREATE POLICY "members read notes" ON notes FOR SELECT TO authenticated USING (public.team_role(team_id) IS NOT NULL);
CREATE POLICY "editors create notes" ON notes FOR INSERT TO authenticated
  WITH CHECK (public.team_role(team_id) IN ('owner', 'editor') AND author_id = auth.uid());
CREATE POLICY "edit own or owner" ON notes FOR UPDATE TO authenticated
  USING (public.team_role(team_id) = 'owner' OR (public.team_role(team_id) = 'editor' AND author_id = auth.uid()))
  WITH CHECK (public.team_role(team_id) IN ('owner', 'editor'));
CREATE POLICY "owner deletes" ON notes FOR DELETE TO authenticated USING (public.team_role(team_id) = 'owner');

GRANT SELECT, INSERT, UPDATE, DELETE ON teams, team_members, notes TO authenticated;

-- ===== اختبار السياسات: بيانات ثم انتحال مستخدمين =====
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-00000000000a', 'owner@example.com'),
  ('00000000-0000-0000-0000-00000000000b', 'viewer@example.com'),
  ('00000000-0000-0000-0000-00000000000c', 'stranger@example.com');
INSERT INTO teams (id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'فريق Kodax');
INSERT INTO team_members VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-00000000000a', 'owner'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-00000000000b', 'viewer');
INSERT INTO notes (team_id, author_id, title) VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-00000000000a', 'خطة الإطلاق');

-- الغريب لا يرى شيئاً
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000c', true);
DO $$ BEGIN
  IF (SELECT count(*) FROM notes) <> 0 THEN RAISE EXCEPTION 'تسريب: الغريب يرى الملاحظات'; END IF;
END $$;
COMMIT;

-- المشاهد يقرأ ولا يُنشئ
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', true);
DO $$ BEGIN
  IF (SELECT count(*) FROM notes) <> 1 THEN RAISE EXCEPTION 'المشاهد يجب أن يرى ملاحظة واحدة'; END IF;
  BEGIN
    INSERT INTO notes (team_id, title) VALUES ('11111111-1111-1111-1111-111111111111', 'محاولة');
    RAISE EXCEPTION 'خطأ: المشاهد استطاع الإنشاء';
  EXCEPTION WHEN insufficient_privilege THEN NULL;   -- رفض RLS متوقع
  END;
END $$;
COMMIT;`,
  quiz: {
    question: 'لماذا تُستخدم دالة SECURITY DEFINER (team_role) بدل استعلام team_members مباشرة داخل كل سياسة؟',
    options: [
      'لأنها أسرع دائماً',
      'لتوحيد منطق العضوية، وتجنب حلقة RLS عندما تستعلم سياسة team_members عن team_members نفسه',
      'لأن السياسات لا تقبل استعلامات فرعية',
      'لتجاوز RLS لكل المستخدمين',
    ],
    correctAnswer: 1,
    explanation: 'مع SET search_path = \'\' وأسماء كاملة وسحب الصلاحية من anon، تبقى آمنة وتمنع التكرار اللانهائي.',
  },
};

export const FIREBASE_PROJECT: NewLesson = {
  id: 'firebase-project',
  title: 'مشروع: تطبيق دردشة بـ Firebase',
  description: 'مشروع ختامي: غرف دردشة بأعضاء، رسائل لحظية بـ onSnapshot مع ترقيم، نمذجة Firestore حسب الشاشات، قواعد أمان للعضوية والتحقق من الرسائل، ورفع صور مقيد',
  language: 'javascript',
  xpReward: 240,
  content: md`
# مشروع: تطبيق دردشة بـ Firebase

الدردشة مثال مثالي لـ Firebase: بيانات لحظية، وصول مباشر من الواجهة، وقواعد أمان هي الخادم الوحيد.

## النمذجة حسب الشاشات
| الشاشة | ما تقرأه | التصميم |
|---|---|---|
| قائمة غرفي | الغرف التي أنا عضو فيها + آخر رسالة | \`rooms/{roomId}\` فيها \`members: [uid...]\` و \`lastMessage\` منسوخة — استعلام واحد \`where("members", "array-contains", uid)\` |
| غرفة | آخر 50 رسالة ثم الأقدم عند التمرير | مجموعة فرعية \`rooms/{roomId}/messages\` مرتبة بـ \`createdAt\` |
| ملف عضو | الاسم والصورة | \`users/{uid}\` |
\`lastMessage\` نسخة مقصودة: قائمة الغرف تعرضها دون قراءة رسائل كل غرفة (كل قراءة مدفوعة).

## الرسائل اللحظية بترقيم
- اشترك في **آخر 50** فقط: \`query(messages, orderBy("createdAt", "desc"), limit(50))\` مع \`onSnapshot\`.
- عند التمرير للأعلى: \`getDocs\` (لا اشتراك) بـ \`startAfter(أقدم_رسالة)\`.
- \`serverTimestamp()\` للوقت — لا وقت جهاز المستخدم (قد يكون خاطئاً أو مزوراً).
- ألغِ الاشتراك عند مغادرة الغرفة.

## كتابة رسالة + تحديث الغرفة
\`writeBatch\`: إضافة الرسالة وتحديث \`lastMessage\` في الغرفة كعملية واحدة.

## القواعد
\`\`\`text
match /rooms/{roomId} {
  allow read: if request.auth.uid in resource.data.members;
  allow create: if request.auth.uid in request.resource.data.members
                && request.resource.data.members.size() <= 50;
  allow update: if request.auth.uid in resource.data.members
                && request.resource.data.members == resource.data.members   // تغيير الأعضاء عبر دالة خادم فقط
                && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['lastMessage']);

  match /messages/{messageId} {
    allow read: if request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.members;
    allow create: if request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.members
                  && request.resource.data.senderId == request.auth.uid
                  && request.resource.data.text is string
                  && request.resource.data.text.size() > 0
                  && request.resource.data.text.size() <= 2000
                  && request.resource.data.createdAt == request.time
                  && request.resource.data.keys().hasOnly(['senderId', 'text', 'createdAt', 'imagePath']);
    allow update, delete: if false;   // لا تعديل للرسائل في هذا الإصدار
  }
}
\`\`\`
لاحظ:
- \`get(...)\` يقرأ وثيقة الغرفة داخل القاعدة لفحص العضوية (يُحتسب قراءة).
- \`createdAt == request.time\` يجبر استخدام \`serverTimestamp()\`.
- \`senderId == request.auth.uid\` يمنع انتحال المرسل.
- تغيير الأعضاء من الواجهة ممنوع؛ يتم عبر Cloud Function تتحقق من الصلاحية.

## الصور
Storage: \`chat-images/{roomId}/{uid}/{file}\` بحد 5MB وصور فقط، والقراءة للأعضاء (Storage Rules تستطيع قراءة Firestore بـ \`firestore.get\`).

## الإشعارات
Cloud Function على \`onDocumentCreated("rooms/{roomId}/messages/{id}")\` ترسل إشعار FCM للأعضاء الآخرين — منطق خادم لا يجوز وضعه في الواجهة.

## قائمة الإنجاز
- [ ] غير العضو لا يقرأ رسائل غرفة ولا يكتب فيها (اختبار بالمحاكي).
- [ ] لا يمكن إرسال رسالة باسم مستخدم آخر أو بوقت مزور.
- [ ] الاشتراك في آخر 50 فقط، والأقدم بترقيم.
- [ ] الاشتراكات تُلغى عند مغادرة الشاشة.
- [ ] الفهارس المركبة المطلوبة منشأة (\`firestore.indexes.json\`).
`,
  codeExample: `// chat.js — طبقة بيانات الدردشة بـ Firebase SDK v9+ (npm install firebase)
import {
  collection, doc, getDocs, limit, onSnapshot, orderBy, query,
  serverTimestamp, startAfter, where, writeBatch,
} from "firebase/firestore";
import { db, auth } from "./firebase.js";

const PAGE = 50;

// قائمة غرفي: استعلام واحد، و lastMessage منسوخة في وثيقة الغرفة
export function watchMyRooms(onChange) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("سجّل الدخول أولاً");
  const q = query(collection(db, "rooms"), where("members", "array-contains", uid), orderBy("lastMessage.createdAt", "desc"), limit(30));
  return onSnapshot(q, (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// آخر 50 رسالة لحظياً — يعيد دالة الإلغاء
export function watchLatestMessages(roomId, onChange, onError) {
  const q = query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "desc"), limit(PAGE));
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse(), snap.docs.at(-1) ?? null),
    onError   // permission-denied إن لم يكن عضواً
  );
}

// الأقدم عند التمرير: قراءة مرة واحدة بلا اشتراك
export async function loadOlder(roomId, oldestSnapshot) {
  const q = query(collection(db, "rooms", roomId, "messages"), orderBy("createdAt", "desc"), startAfter(oldestSnapshot), limit(PAGE));
  const snap = await getDocs(q);
  return { messages: snap.docs.map((d) => ({ id: d.id, ...d.data() })).reverse(), oldest: snap.docs.at(-1) ?? null };
}

// إرسال: الرسالة وتحديث lastMessage كعملية واحدة
export async function sendMessage(roomId, text) {
  const uid = auth.currentUser?.uid;
  const clean = String(text).trim();
  if (!uid) throw new Error("سجّل الدخول أولاً");
  if (!clean || clean.length > 2000) throw new Error("الرسالة بين 1 و 2000 حرف");

  const batch = writeBatch(db);
  const messageRef = doc(collection(db, "rooms", roomId, "messages"));
  batch.set(messageRef, { senderId: uid, text: clean, createdAt: serverTimestamp() });   // القواعد تفرض request.time
  batch.update(doc(db, "rooms", roomId), {
    lastMessage: { text: clean.slice(0, 100), senderId: uid, createdAt: serverTimestamp() },
  });
  await batch.commit();
  return messageRef.id;
}`,
  quiz: {
    question: 'ما فائدة شرط request.resource.data.createdAt == request.time في قواعد الرسائل؟',
    options: [
      'يسرّع كتابة الرسائل',
      'يجبر العميل على استخدام serverTimestamp() فلا يستطيع تزوير وقت الرسالة',
      'يحذف الرسائل القديمة',
      'يسمح بتعديل الرسائل لاحقاً',
    ],
    correctAnswer: 1,
    explanation: 'وقت جهاز المستخدم قابل للتلاعب؛ مقارنة الحقل بوقت الخادم تمنع رسائل "من الماضي" أو "المستقبل".',
  },
};
