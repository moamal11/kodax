/**
 * منهجا backend-supabase و backend-firebase.
 *
 * كان (Supabase): 6 دروس بشرح من 5–10 أسطر؛ أمثلة "ورقة غش" تعيد تعريف const { data, error }
 * عشرات المرات وتستخدم await خارج دالة (لا تعمل إن نُسخت)؛ سياسات RLS بلا تفعيل RLS على الجدول
 * وبلا WITH CHECK في سياسة التحديث؛ رفع React Native يمرر كائن {uri,type,name} لا تقبله
 * supabase-js؛ Edge Functions بـ serve القديمة بدل Deno.serve، ودالة بريد تقبل أي مستلم وأي HTML
 * بلا تحقق من المستخدم (منصة إرسال مزعج مفتوحة)؛ دالة get_user_stats تقارن user_id = user_id
 * (المعامل يحجب العمود فيُحسب كل التعليقات)؛ لا شرح للفرق بين مفتاح anon و service_role.
 * كان (Firebase): 5 دروس قصيرة؛ قواعد Firestore تسمح لأي مستخدم مسجل بإنشاء وثيقة مستخدم آخر،
 * وتحديث المنشور لا يمنع تغيير authorId، وقاعدة Storage العامة تسمح بأي حجم ونوع.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';
import { SUPABASE_PROJECT, FIREBASE_PROJECT } from './more-auth-baas';

export const BACKEND_SUPABASE_PLAN: CoursePlan = {
  courseId: 'backend-supabase',
  course: {
    description:
      'ابنِ خلفية كاملة بـ Supabase: PostgreSQL والعميل supabase-js v2، المصادقة، أمان مستوى الصفوف (RLS) ومفاتيح anon و service_role، الوقت الحقيقي، التخزين، Edge Functions، والاستعلامات المتقدمة و RPC — مع مشروع ملاحظات للفرق.',
  },
  sections: [
    { title: 'الأساسيات', lessons: ['supa-1', 'supa-2', 'supa-6'] },
    { title: 'الميزات', lessons: ['supa-3', 'supa-4', 'supa-5'] },
    { title: 'المشروع', lessons: ['supa-project'] },
  ],
  newLessons: [SUPABASE_PROJECT],
  patches: {
    'supa-1': {
      description: 'ما Supabase: PostgreSQL مُدار مع API تلقائي، إنشاء العميل، عمليات CRUD بـ supabase-js v2، ومعالجة { data, error }',
      content: md`
# مقدمة في Supabase

Supabase منصة "خلفية جاهزة" مبنية على **PostgreSQL**: قاعدة بيانات حقيقية، و API يُولَّد تلقائياً من جداولك، ومصادقة، وتخزين ملفات، ووقت حقيقي، ودوال خادم (Edge Functions). كل ما تعلمته في دورة SQL ينطبق هنا مباشرة.

## العميل
\`\`\`javascript
// npm install @supabase/supabase-js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
\`\`\`
أنشئ عميلاً **واحداً** وصدّره، واستورده في بقية الملفات.

## مفتاحان مختلفان جداً
| المفتاح | أين | الصلاحية |
|---|---|---|
| **anon / publishable** | في الواجهة (علني بطبيعته) | ما تسمح به سياسات RLS فقط |
| **service_role / secret** | الخادم فقط (Edge Functions، خادمك) | **يتجاوز RLS كاملاً** |
مفتاح anon يُرى في كود الواجهة ولا مشكلة في ذلك — **بشرط** تفعيل RLS على كل جدول (الدرس التالي). أما service_role في الواجهة فيعني أن أي زائر يملك قاعدة بياناتك كلها.

## الاستعلامات
كل استدعاء يعيد \`{ data, error }\` — **لا يرمي استثناء**، فافحص error دائماً:
\`\`\`javascript
import { supabase } from "./supabaseClient.js";

export async function listRecentProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price")
    .eq("in_stock", true)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}
\`\`\`
| العملية | الدالة |
|---|---|
| قراءة | \`.select("أعمدة")\` مع فلاتر \`.eq\` \`.gt\` \`.ilike\` \`.in\`... |
| إضافة | \`.insert({...}).select()\` — بدون \`.select()\` لا تُعاد الصفوف المضافة |
| تعديل | \`.update({...}).eq("id", id)\` |
| حذف | \`.delete().eq("id", id)\` |
| إضافة أو تعديل | \`.upsert({...})\` |

⚠️ \`update\` و \`delete\` بلا فلتر: supabase-js يرفضها افتراضياً لحمايتك، لكن انتبه دائماً للشرط — والصفوف التي لا تسمح RLS بتعديلها تُتجاهل بصمت (لا خطأ، 0 صفوف).

## الأنواع مع TypeScript
\`npx supabase gen types typescript\` يولّد أنواعاً من مخطط قاعدتك، فيعرف المحرر أسماء الأعمدة وأنواعها ويكتشف الأخطاء قبل التشغيل.

## تمرين
أنشئ مشروع Supabase مجانياً، وجدول \`todos\` (id، title، done، created_at)، ثم اكتب دوال \`listTodos\` و \`addTodo\` و \`toggleTodo\` و \`deleteTodo\` تفحص error في كل منها.
`,
      codeExample: `// supabaseClient.js — عميل واحد للتطبيق كله
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY   // مفتاح anon فقط في الواجهة — لا service_role أبداً
);

// todos.js — كل عملية في دالتها، وكل نتيجة تُفحص
export async function listTodos() {
  const { data, error } = await supabase
    .from("todos")
    .select("id, title, done, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addTodo(title) {
  const { data, error } = await supabase
    .from("todos")
    .insert({ title: title.trim() })
    .select()          // بدونها لا يُعاد الصف المضاف
    .single();
  if (error) throw error;
  return data;
}

export async function toggleTodo(id, done) {
  const { data, error } = await supabase.from("todos").update({ done }).eq("id", id).select();
  if (error) throw error;
  if (data.length === 0) throw new Error("لم يُعدَّل شيء — غير موجود أو تمنعه سياسات RLS");
  return data[0];
}

export async function deleteTodo(id) {
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw error;
}`,
    },
    'supa-2': {
      description: 'المصادقة في Supabase: التسجيل والدخول و OAuth، الجلسة والمستخدم الحالي، onAuthStateChange، وأمان مستوى الصفوف (RLS) خطوة بخطوة',
      content: md`
# المصادقة و RLS في Supabase

## التسجيل والدخول
\`\`\`javascript
import { supabase } from "./supabaseClient.js";

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;          // قد يحتاج تأكيد البريد قبل أن تصبح الجلسة فعالة
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}
\`\`\`
- \`signInWithOAuth({ provider: "google" })\`: الدخول بمزود خارجي (يُضبط في لوحة Supabase).
- \`signInWithOtp({ email })\`: رابط سحري بلا كلمة مرور.
- \`signOut()\`: الخروج.

## المستخدم الحالي
| الدالة | متى |
|---|---|
| \`supabase.auth.getSession()\` | قراءة الجلسة المحفوظة محلياً (سريع) — للواجهة |
| \`supabase.auth.getUser()\` | يتحقق من الرمز **مع خادم Supabase** — استخدمه على الخادم قبل الوثوق بالهوية |
| \`onAuthStateChange(cb)\` | الاستماع للدخول والخروج وتجديد الرمز — حدّث واجهتك منه |

\`onAuthStateChange\` يعيد اشتراكاً: ألغه عند تفكيك المكوّن (\`data.subscription.unsubscribe()\`).

## RLS: أهم شيء في Supabase
لأن الواجهة تتصل بقاعدة البيانات مباشرة بمفتاح anon العلني، **سياسات أمان مستوى الصفوف (Row Level Security)** هي ما يمنع مستخدماً من قراءة بيانات غيره أو حذفها.

\`\`\`sql
-- 1) فعّل RLS — بدونه يقرأ ويكتب أي شخص يملك مفتاح anon كل الجدول
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 2) سياسة لكل عملية
CREATE POLICY "read own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);
\`\`\`
| الجزء | المعنى |
|---|---|
| \`USING\` | أي الصفوف **الموجودة** يمكن رؤيتها/تعديلها/حذفها |
| \`WITH CHECK\` | هل **القيم الجديدة** مسموحة (عند الإدراج والتحديث) |
| \`auth.uid()\` | معرّف المستخدم من الرمز المرسل |

بدون \`WITH CHECK\` في سياسة التحديث، يستطيع المستخدم تعديل صفه وتغيير \`user_id\` إلى مستخدم آخر.

## قواعد ذهبية
- RLS مفعّل على **كل** جدول في مخطط public — Supabase يحذرك في لوحة Security Advisor.
- مع RLS مفعّل وبلا سياسات = لا شيء مسموح (رفض افتراضي). أضف السياسات تدريجياً.
- \`user_id\` افتراضيه \`auth.uid()\` (\`DEFAULT auth.uid()\`) ولا تثق بقيمة يرسلها العميل.
- اختبر السياسات من حسابين مختلفين: هل يرى المستخدم ب بيانات المستخدم أ؟

## تمرين
فعّل RLS على جدول todos من الدرس السابق مع السياسات الأربع، وأضف عمود \`user_id uuid DEFAULT auth.uid()\`. سجّل الدخول بحسابين تجريبيين وتحقق أن كلاً منهما يرى مهامه فقط.
`,
      codeExample: `// auth.js — المصادقة مع supabase-js v2
import { supabase } from "./supabaseClient.js";

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;     // رسالة موحدة للمستخدم: "بيانات الدخول غير صحيحة"
  return data.session;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/auth/callback" },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// الاستماع لتغيّر الجلسة — أعد الدالة لإلغاء الاشتراك عند تفكيك المكوّن
export function watchAuth(onChange) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    onChange(event, session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}

/* ===== في SQL Editor =====
ALTER TABLE todos ADD COLUMN user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own"   ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own" ON todos FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own" ON todos FOR DELETE USING (auth.uid() = user_id);
*/`,
    },
    'supa-6': {
      description: 'استعلامات متقدمة: الفلاتر المركبة، العلاقات المتداخلة في select، الترقيم بـ range والعد، ودوال RPC في PostgreSQL مع الأمان',
      content: md`
# الاستعلامات المتقدمة و RPC

## فلاتر مركبة
\`\`\`javascript
import { supabase } from "./supabaseClient.js";

export async function searchProducts({ term, min, max }) {
  let query = supabase.from("products").select("id, name, price, category");
  if (term) query = query.ilike("name", \`%\${term}%\`);
  if (min !== undefined) query = query.gte("price", min);
  if (max !== undefined) query = query.lte("price", max);
  const { data, error } = await query.order("price");
  if (error) throw error;
  return data;
}
\`\`\`
بناء الاستعلام تدريجياً حسب الفلاتر الموجودة نمط شائع. \`.or("price.lt.50,featured.eq.true")\` لشروط "أو"، و \`.in("category", [...])\` لقائمة. ⚠️ لا تلصق مدخلات المستخدم داخل نص \`.or(...)\` بلا تحقق — صيغته نصية ويمكن التلاعب بها.

## العلاقات المتداخلة
بالمفاتيح الأجنبية، يجلب \`select\` الجداول المرتبطة في طلب واحد:
\`\`\`javascript
import { supabase } from "./supabaseClient.js";

export async function getPost(postId) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, author:profiles(id, name), comments(id, content, created_at)")
    .eq("id", postId)
    .single();
  if (error) throw error;
  return data;
}
\`\`\`
\`author:profiles(...)\` اسم مستعار للعلاقة. RLS تُطبق على **كل** جدول مرتبط أيضاً.

## الترقيم والعد
\`\`\`javascript
import { supabase } from "./supabaseClient.js";

export async function page(n, size = 20) {
  const from = (n - 1) * size;
  const { data, count, error } = await supabase
    .from("products")
    .select("id, name", { count: "exact" })
    .range(from, from + size - 1);          // شامل للطرفين
  if (error) throw error;
  return { data, total: count };
}
\`\`\`

## RPC: دوال PostgreSQL
للمنطق الذي يحتاج عدة عمليات في معاملة واحدة، أو حسابات معقدة، اكتب دالة SQL واستدعها بـ \`supabase.rpc("name", args)\`:
\`\`\`sql
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS json
LANGUAGE sql STABLE
SECURITY INVOKER          -- تعمل بصلاحيات المستدعي: RLS تُطبق
AS $$
  SELECT json_build_object(
    'posts',    (SELECT count(*) FROM posts    WHERE author_id = p_user_id),
    'comments', (SELECT count(*) FROM comments WHERE user_id   = p_user_id)
  );
$$;
\`\`\`
⚠️ لاحظ اسم المعامل \`p_user_id\`: لو سُمّي \`user_id\` لكان الشرط \`WHERE user_id = user_id\` يقارن العمود بنفسه (صحيح دائماً) ويعدّ **كل** التعليقات — خطأ موجود في النسخة السابقة من هذا الدرس. استخدم بادئة للمعاملات.

## SECURITY DEFINER بحذر
دالة \`SECURITY DEFINER\` تعمل بصلاحيات منشئها و**تتجاوز RLS**. استخدمها فقط عند الحاجة، مع: فحص \`auth.uid()\` داخلها، و \`SET search_path = ''\`، وأسماء جداول كاملة (\`public.posts\`)، وسحب صلاحية التنفيذ من \`anon\` إن لم تكن للعموم.

## تمرين
اكتب دالة RPC \`place_order(p_items jsonb)\` تتحقق من المخزون وتنقصه وتنشئ الطلب في معاملة واحدة، وتستخدم \`auth.uid()\` كمالك للطلب بدل قيمة من العميل.
`,
      codeExample: `import { supabase } from "./supabaseClient.js";

// فلاتر اختيارية تُبنى تدريجياً
export async function searchProducts({ term, minPrice, maxPrice, categories } = {}) {
  let query = supabase.from("products").select("id, name, price, category", { count: "exact" });
  if (term) query = query.ilike("name", \`%\${term}%\`);
  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);
  if (categories?.length) query = query.in("category", categories);

  const { data, count, error } = await query.order("price").range(0, 19);
  if (error) throw error;
  return { data, total: count };
}

// منشور مع كاتبه وتعليقاته في طلب واحد
export async function getPostWithComments(postId) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, content, author:profiles(id, name, avatar_url), comments(id, content, created_at, user:profiles(name))")
    .eq("id", postId)
    .single();
  if (error) throw error;
  return data;
}

// استدعاء دالة PostgreSQL
export async function getMyStats(userId) {
  const { data, error } = await supabase.rpc("get_user_stats", { p_user_id: userId });
  if (error) throw error;
  return data;   // { posts: 3, comments: 12 }
}

/* ===== الدالة في SQL Editor — بادئة p_ تمنع حجب اسم العمود =====
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS json LANGUAGE sql STABLE SECURITY INVOKER AS $$
  SELECT json_build_object(
    'posts',    (SELECT count(*) FROM posts    WHERE author_id = p_user_id),
    'comments', (SELECT count(*) FROM comments WHERE user_id   = p_user_id)
  );
$$;
*/`,
    },
    'supa-3': {
      description: 'الوقت الحقيقي: الاشتراك في تغييرات الجداول (postgres_changes)، الفلترة، Broadcast و Presence، RLS مع الوقت الحقيقي، وإلغاء الاشتراك',
      content: md`
# الاشتراكات في الوقت الحقيقي (Realtime)

بدل أن يسأل التطبيق الخادم كل ثانية "هل هناك جديد؟"، يفتح **اتصالاً دائماً** (WebSocket) ويستقبل التغييرات لحظة حدوثها: رسائل الدردشة، الإشعارات، لوحات المتابعة، التحرير المشترك.

## ثلاثة أنواع
| النوع | ما ينقله | مثال |
|---|---|---|
| **Postgres Changes** | تغييرات الجداول (INSERT/UPDATE/DELETE) | رسالة جديدة حُفظت في قاعدة البيانات |
| **Broadcast** | رسائل بين العملاء دون حفظ | "فلان يكتب الآن..."، مؤشر الفأرة في تحرير مشترك |
| **Presence** | من متصل الآن | قائمة المتصلين في غرفة |

## تغييرات الجداول
\`\`\`javascript
import { supabase } from "./supabaseClient.js";

export function subscribeToRoom(roomId, onMessage) {
  const channel = supabase
    .channel(\`room-\${roomId}\`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: \`room_id=eq.\${roomId}\` },
      (payload) => onMessage(payload.new)
    )
    .subscribe();
  return () => supabase.removeChannel(channel);   // استدعها عند مغادرة الغرفة
}
\`\`\`
- فعّل الجدول للوقت الحقيقي أولاً: Database ← Publications ← \`supabase_realtime\` (أو \`ALTER PUBLICATION supabase_realtime ADD TABLE messages;\`).
- \`filter\` يقلل البيانات المرسلة (ويقلل الاستهلاك).
- \`payload.new\` الصف الجديد، و \`payload.old\` القديم (لـ UPDATE و DELETE؛ يحتاج \`REPLICA IDENTITY FULL\` للحصول على كل أعمدته).

## الأمان
تغييرات الجداول **تحترم RLS**: المشترك يستقبل فقط الصفوف التي تسمح له سياسات SELECT برؤيتها. بدون RLS، أي شخص يستطيع الاستماع لكل التغييرات. قنوات Broadcast و Presence الخاصة تُحمى بتفعيل خيار القنوات الخاصة وسياسات على \`realtime.messages\`.

## إلغاء الاشتراك
اشتراك لا يُلغى = تسرب اتصالات وذاكرة، وأحداث مكررة عند العودة للشاشة. في React:
\`\`\`javascript
// useEffect(() => subscribeToRoom(roomId, addMessage), [roomId]);
// الدالة المُعادة من subscribeToRoom تُستدعى تلقائياً عند التفكيك أو تغيير الغرفة
const cleanupPattern = "useEffect(() => subscribe(...), [deps])";
console.log(cleanupPattern);
\`\`\`

## نمط شائع: الجلب ثم الاشتراك
1. اجلب آخر 50 رسالة بـ \`select\`.
2. اشترك في INSERT الجديدة وأضفها للقائمة.
3. احذر التكرار: رسالة أُرسلت بين الخطوتين قد تصل مرتين — ميّزها بالمعرّف.

## تمرين
ابنِ غرفة دردشة: جلب آخر الرسائل، الاشتراك في الجديدة، مؤشر "يكتب الآن" بـ Broadcast، وقائمة المتصلين بـ Presence. تأكد من إلغاء الاشتراكات عند مغادرة الصفحة.
`,
    },
    'supa-4': {
      description: 'تخزين الملفات: الحاويات العامة والخاصة، سياسات Storage، الرفع من الويب و React Native بشكل صحيح، الروابط العامة والموقّعة، وتحويل الصور',
      content: md`
# التخزين (Storage)

Supabase Storage لتخزين الصور والملفات، مع صلاحيات تُدار بسياسات RLS مثل الجداول.

## الحاويات (Buckets)
| النوع | الوصول للقراءة | الاستخدام |
|---|---|---|
| **عامة** | أي شخص يعرف الرابط | صور المنتجات، الصور الشخصية العامة |
| **خاصة** | روابط موقّعة مؤقتة فقط | فواتير، مستندات، ملفات المستخدم الخاصة |
حدد لكل حاوية **الحد الأقصى للحجم** و **أنواع الملفات المسموحة** في إعداداتها.

## السياسات
الكتابة تحتاج سياسات حتى في الحاوية العامة. نمط شائع: كل مستخدم يكتب في مجلد باسم معرّفه فقط:
\`\`\`sql
CREATE POLICY "users upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
\`\`\`

## الرفع من المتصفح
\`\`\`javascript
import { supabase } from "./supabaseClient.js";

export async function uploadAvatar(userId, file) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = \`\${userId}/avatar.\${ext}\`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
  if (error) throw error;
  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}
\`\`\`

## الرفع من React Native
supabase-js لا يقبل كائناً بشكل \`{ uri, type, name }\` (ذلك أسلوب FormData). اقرأ الملف كبيانات ثنائية أولاً:
\`\`\`javascript
// const response = await fetch(localUri);          // يعمل مع روابط file:// في Expo
// const bytes = await response.arrayBuffer();
// await supabase.storage.from("avatars").upload(path, bytes, { contentType: "image/jpeg", upsert: true });
const steps = ["fetch(uri)", "arrayBuffer()", "upload(path, bytes, { contentType })"];
console.log(steps.join(" ← "));
\`\`\`
(في بعض إصدارات React Native تُقرأ الصورة بـ base64 من expo-file-system ثم تُحوّل لـ ArrayBuffer.)

## الروابط
| الدالة | الاستخدام |
|---|---|
| \`getPublicUrl(path)\` | حاوية عامة — رابط دائم (لا يحتاج await) |
| \`createSignedUrl(path, 60)\` | حاوية خاصة — رابط ينتهي بعد 60 ثانية |
| \`download(path)\` | تحميل كـ Blob |
| \`getPublicUrl(path, { transform: { width: 200 } })\` | صورة مصغرة (ميزة تحويل الصور في الخطط المدفوعة) |

## نصائح
- لا تستخدم أسماء الملفات الأصلية من المستخدم في المسار؛ ولّد اسماً أو استخدم مسارات ثابتة.
- خزّن **المسار** في قاعدة البيانات لا الرابط العام (يمكن توليده، ويتغير إن نقلت الحاوية).
- عند حذف السجل من قاعدة البيانات احذف الملف أيضاً (أو بدالة خادم) — وإلا تتراكم ملفات يتيمة.

## تمرين
أنشئ حاوية خاصة \`documents\` بحد 5MB لملفات PDF فقط، مع سياسة رفع وقراءة لمجلد المستخدم، ودالة تعرض قائمة ملفات المستخدم مع رابط موقّع لكل منها صالح لدقيقتين.
`,
      codeExample: `import { supabase } from "./supabaseClient.js";

const AVATARS = "avatars";      // حاوية عامة: حد 2MB، أنواع: image/png, image/jpeg, image/webp
const DOCUMENTS = "documents";  // حاوية خاصة: روابط موقّعة فقط

// ===== من المتصفح: <input type="file"> =====
export async function uploadAvatar(userId, file) {
  if (!file.type.startsWith("image/")) throw new Error("صورة فقط");
  const path = \`\${userId}/avatar\`;            // مسار ثابت بمعرّف المستخدم — لا اسم الملف الأصلي
  const { error } = await supabase.storage
    .from(AVATARS)
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
  if (error) throw error;
  const { data } = supabase.storage.from(AVATARS).getPublicUrl(path);
  return \`\${data.publicUrl}?v=\${Date.now()}\`;   // تجاوز التخزين المؤقت بعد الاستبدال
}

// ===== من React Native / Expo: نقرأ الملف كبيانات ثنائية =====
export async function uploadAvatarFromUri(userId, localUri, mimeType = "image/jpeg") {
  const response = await fetch(localUri);
  const bytes = await response.arrayBuffer();
  const { error } = await supabase.storage
    .from(AVATARS)
    .upload(\`\${userId}/avatar\`, bytes, { contentType: mimeType, upsert: true });
  if (error) throw error;
}

// ===== ملفات خاصة: قائمة مع روابط موقّعة مؤقتة =====
export async function listMyDocuments(userId) {
  const { data: files, error } = await supabase.storage
    .from(DOCUMENTS)
    .list(userId, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw error;

  const paths = files.map((f) => \`\${userId}/\${f.name}\`);
  if (paths.length === 0) return [];
  const { data: signed, error: signError } = await supabase.storage
    .from(DOCUMENTS)
    .createSignedUrls(paths, 120);   // دقيقتان
  if (signError) throw signError;
  return signed.map((s, i) => ({ name: files[i].name, url: s.signedUrl }));
}

export async function deleteDocument(userId, name) {
  const { error } = await supabase.storage.from(DOCUMENTS).remove([\`\${userId}/\${name}\`]);
  if (error) throw error;
}`,
    },
    'supa-5': {
      description: 'Edge Functions: دوال خادم بـ Deno.serve، التحقق من المستخدم، متى تستخدم service_role، CORS، الأسرار، ومنع إساءة الاستخدام',
      content: md`
# Edge Functions

بعض المنطق **لا يجوز** أن يعمل في الواجهة: استدعاء API بمفتاح سري (الدفع، الذكاء الاصطناعي، البريد)، أو عمليات تحتاج صلاحيات كاملة، أو منطق يجب ألا يتلاعب به المستخدم. Edge Functions دوال TypeScript تعمل على خوادم Supabase (بيئة **Deno**).

## أبسط دالة
\`\`\`typescript
// supabase/functions/hello/index.ts
Deno.serve(async (req) => {
  const { name } = await req.json().catch(() => ({ name: "زائر" }));
  return Response.json({ message: \`مرحباً \${name}\` });
});
\`\`\`
\`Deno.serve\` هي الطريقة الحالية (الشروحات القديمة تستورد \`serve\` من deno.land/std — لم يعد ذلك لازماً).

## الأوامر
\`\`\`bash
npx supabase functions new hello
npx supabase functions serve hello            # محلياً
npx supabase secrets set RESEND_API_KEY=...   # الأسرار — لا تكتبها في الكود
npx supabase functions deploy hello
\`\`\`
\`SUPABASE_URL\` و \`SUPABASE_ANON_KEY\` و \`SUPABASE_SERVICE_ROLE_KEY\` متاحة تلقائياً بـ \`Deno.env.get\`.

## الهوية أولاً
افتراضياً تتطلب الدوال رمز JWT صالحاً. داخل الدالة، اعرف **من** المستخدم قبل أي عمل:
\`\`\`typescript
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return Response.json({ error: "غير مصرح" }, { status: 401 });
  const { data } = await supabase.from("todos").select("*");   // RLS تُطبق بهوية المستخدم
  return Response.json({ user: user.id, todos: data });
});
\`\`\`
- **عميل بمفتاح anon + رمز المستخدم**: RLS تُطبق — الخيار الافتراضي.
- **عميل بـ service_role**: يتجاوز RLS — فقط لعمليات إدارية محددة **بعد** التحقق بنفسك من هوية المستخدم وصلاحيته.

## منع إساءة الاستخدام
دالة ترسل بريداً لأي عنوان وأي محتوى يحددهما الطلب = منصة إرسال رسائل مزعجة وتصيد باسم نطاقك. القواعد:
- تحقق من المستخدم وصلاحيته.
- حدد المستلم من بياناتك (بريد المستخدم نفسه، أو قائمة ثابتة)، لا من الطلب.
- قوالب محتوى ثابتة؛ لا HTML حر من العميل.
- حد للطلبات لكل مستخدم.

## CORS
إذا استُدعيت الدالة من المتصفح بنطاق مختلف، أجب على طلب \`OPTIONS\` وأضف ترويسات \`Access-Control-Allow-*\` بنطاقك تحديداً. \`supabase.functions.invoke()\` من التطبيق يضيف الرمز تلقائياً.

## تمرين
اكتب دالة \`contact-support\` تسمح للمستخدم المسجل بإرسال رسالة للدعم فقط: المستلم ثابت في الأسرار، والنص يُحفظ في جدول ويُرسل كنص عادي (لا HTML)، مع حد 5 رسائل يومياً لكل مستخدم.
`,
      codeExample: `// supabase/functions/contact-support/index.ts
// ينشر بـ: npx supabase functions deploy contact-support
// الأسرار: npx supabase secrets set RESEND_API_KEY=... SUPPORT_EMAIL=support@example.com
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGIN = "https://app.example.com";
const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return Response.json({ error: "POST فقط" }, { status: 405, headers: cors });

  // 1) من المستخدم؟ عميل بمفتاح anon ورمز المستخدم ← RLS تُطبق
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "سجّل الدخول أولاً" }, { status: 401, headers: cors });

  // 2) التحقق من المدخلات
  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (message.length < 10 || message.length > 2000) {
    return Response.json({ error: "الرسالة بين 10 و 2000 حرف" }, { status: 400, headers: cors });
  }

  // 3) حد يومي: سياسة RLS تسمح للمستخدم بقراءة رسائله فقط
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase.from("support_messages").select("id", { count: "exact", head: true }).gte("created_at", since);
  if ((count ?? 0) >= 5) return Response.json({ error: "تجاوزت الحد اليومي" }, { status: 429, headers: cors });

  const { error: insertError } = await supabase.from("support_messages").insert({ message });   // user_id = auth.uid() افتراضياً
  if (insertError) return Response.json({ error: "تعذر الحفظ" }, { status: 500, headers: cors });

  // 4) المستلم ثابت من الأسرار، والمحتوى نص عادي — لا مستلم ولا HTML من الطلب
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: \`Bearer \${Deno.env.get("RESEND_API_KEY")}\`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Kodax <noreply@example.com>",
      to: Deno.env.get("SUPPORT_EMAIL"),
      subject: \`رسالة دعم من \${user.email}\`,
      text: message,
    }),
  });
  if (!res.ok) return Response.json({ error: "تعذر الإرسال" }, { status: 502, headers: cors });

  return Response.json({ ok: true }, { headers: cors });
});`,
    },
  },
};

export const BACKEND_FIREBASE_PLAN: CoursePlan = {
  courseId: 'backend-firebase',
  course: {
    description:
      'خلفية بلا خوادم بـ Firebase (SDK v9+ المعياري): Firestore ونمذجة البيانات، الاستعلامات والاستماع اللحظي، المصادقة، التخزين، وقواعد الأمان التي تحمي كل ذلك — مع مشروع تطبيق دردشة.',
  },
  sections: [
    { title: 'الأساسيات', lessons: ['firebase-1', 'firebase-2', 'firebase-3'] },
    { title: 'الملفات والأمان', lessons: ['firebase-4', 'firebase-5'] },
    { title: 'المشروع', lessons: ['firebase-project'] },
  ],
  newLessons: [FIREBASE_PROJECT],
  codeFixes: {
    'firebase-5': [
      ['      // الإنشاء: لأي مستخدم مسجل\n      allow create: if isAuthenticated();', '      // الإنشاء: المستخدم ينشئ وثيقته هو فقط، دون منح نفسه دوراً\n      allow create: if isOwner(userId) && !("role" in request.resource.data);'],
      ['      // التحديث: للمالك فقط\n      allow update: if isOwner(userId);', '      // التحديث: للمالك فقط، ولا يستطيع تغيير دوره\n      allow update: if isOwner(userId)\n                    && !request.resource.data.diff(resource.data).affectedKeys().hasAny(["role"]);'],
      [
        '      // التحديث: للمالك فقط\n      allow update: if isOwner(resource.data.authorId);',
        '      // التحديث: للمالك فقط، ولا يُنقل المنشور لمؤلف آخر\n      allow update: if isOwner(resource.data.authorId)\n                    && request.resource.data.authorId == resource.data.authorId;',
      ],
      [
        '    match /public/{allPaths=**} {\n      allow read;\n      allow write: if request.auth != null;',
        '    match /public/{allPaths=**} {\n      allow read;\n      // حتى الملفات العامة: حجم ونوع محددان\n      allow write: if request.auth != null\n                   && request.resource.size < 2 * 1024 * 1024\n                   && request.resource.contentType.matches("image/.*");',
      ],
    ],
  },
  patches: {
    'firebase-1': {
      description: 'ما Firebase وخدماته، الفرق بين Firestore وقاعدة SQL، تهيئة SDK v9 المعياري، ولماذا إعدادات المشروع ليست سراً',
      content: md`
# مقدمة في Firebase

Firebase منصة من Google تقدم خدمات خلفية جاهزة: **Firestore** (قاعدة مستندات)، **Authentication**، **Storage**، **Cloud Functions**، **Hosting**، والإشعارات والتحليلات. التطبيق يتصل بها مباشرة من الواجهة، والحماية تأتي من **قواعد الأمان** (الدرس الأخير).

## Firestore مقابل SQL
\`\`\`text
SQL:        جدول ← صفوف ← أعمدة ثابتة
Firestore:  مجموعة (collection) ← وثائق (documents) ← حقول مرنة، ويمكن أن تحتوي مجموعات فرعية
users/{uid}/orders/{orderId}
\`\`\`
| | SQL (PostgreSQL) | Firestore |
|---|---|---|
| المخطط | صارم | مرن (المسؤولية عليك) |
| الربط (JOIN) | ✅ | ❌ — تُكرَّر البيانات أو تُقرأ على مراحل |
| الاستعلامات | أي شرط تقريباً | محدودة وتحتاج فهارس لكل تركيبة شروط |
| الوقت الحقيقي | إضافي | مدمج |
| التسعير | حسب الخادم/الحجم | **لكل عملية قراءة وكتابة** — التصميم السيئ مكلف |

## SDK المعياري (v9 فما فوق)
\`\`\`javascript
// npm install firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "my-app.firebaseapp.com",
  projectId: "my-app",
  storageBucket: "my-app.appspot.com",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
\`\`\`
الصيغة المعيارية (دوال مستقلة تُستورد) تسمح لأدوات البناء بحذف ما لا تستخدمه. الشروحات القديمة تستخدم \`firebase.firestore().collection(...)\` (v8) — لا تخلط الأسلوبين.

## هل apiKey سر؟
**لا**: إعدادات Firebase للويب تعريفية وتصل للمتصفح بالضرورة. الحماية الحقيقية: **قواعد الأمان**، و **App Check**، وتقييد المفتاح بنطاقاتك في Google Cloud Console. لكن مفاتيح **حساب الخدمة** (Admin SDK) أسرار حقيقية للخادم فقط.

## نمذجة البيانات: صمم حسب الشاشات
في Firestore تسأل "ماذا تعرض الشاشة؟" ثم تصمم الوثائق لتُقرأ بأقل عدد قراءات — حتى لو كررت بعض البيانات (اسم الكاتب داخل المنشور مثلاً).

## تمرين
أنشئ مشروع Firebase، وفعّل Firestore في وضع الإنتاج (القواعد ترفض كل شيء افتراضياً)، واربط تطبيق ويب بالإعدادات أعلاه.
`,
    },
    'firebase-2': {
      description: 'عمليات Firestore: addDoc و setDoc و getDoc و updateDoc و deleteDoc، الاستعلامات والفهارس المركبة، الترقيم، والاستماع اللحظي بـ onSnapshot',
      content: md`
# عمليات Firestore (CRUD)

## الإنشاء
\`\`\`javascript
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";

export async function createPost(uid, title) {
  const ref = await addDoc(collection(db, "posts"), {   // معرّف تلقائي
    title,
    authorId: uid,
    createdAt: serverTimestamp(),                        // وقت الخادم لا جهاز المستخدم
  });
  return ref.id;
}

export async function createProfile(uid, name) {
  await setDoc(doc(db, "users", uid), { name }, { merge: true });   // معرّف محدد (uid)
}
\`\`\`
| الدالة | الفرق |
|---|---|
| \`addDoc\` | معرّف عشوائي تولده Firestore |
| \`setDoc\` | معرّف تحدده أنت؛ **يستبدل** الوثيقة كلها إلا مع \`{ merge: true }\` |
| \`updateDoc\` | يعدّل حقولاً محددة؛ يفشل إن لم توجد الوثيقة |

## القراءة
\`\`\`javascript
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "./firebase.js";

export async function getPost(id) {
  const snap = await getDoc(doc(db, "posts", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function latestPostsBy(uid) {
  const q = query(collection(db, "posts"), where("authorId", "==", uid), orderBy("createdAt", "desc"), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
\`\`\`
- استعلام يجمع \`where\` على حقل و \`orderBy\` على آخر يحتاج **فهرساً مركباً**؛ Firestore يعطيك رابط إنشائه في رسالة الخطأ.
- لا يوجد \`LIKE\` للبحث النصي؛ للبحث استخدم خدمة مخصصة (Algolia، Typesense) أو حقول بحث مجهزة مسبقاً.

## الترقيم
\`startAfter(lastDoc)\` مع \`limit\`: احتفظ بآخر وثيقة في الصفحة واطلب ما بعدها. لا يوجد offset رخيص (القفز يُحاسب كقراءات).

## التحديث والحذف
- \`updateDoc(ref, { likes: increment(1) })\` — زيادة ذرية.
- \`arrayUnion\` و \`arrayRemove\` للمصفوفات.
- \`deleteDoc(ref)\` — ⚠️ لا يحذف **المجموعات الفرعية** تحتها؛ تبقى يتيمة.

## الاستماع اللحظي
\`\`\`javascript
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "./firebase.js";

export function watchPosts(onChange) {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));   // يعيد دالة الإلغاء
}
\`\`\`
ألغِ المستمع عند مغادرة الشاشة. وكل وثيقة تتغير تُحسب قراءة لكل مستمع — راقب التكلفة.

## العمليات الجماعية
\`writeBatch\` (حتى 500 كتابة كوحدة واحدة) و \`runTransaction\` (قراءة ثم كتابة بأمان مع التزامن).

## تمرين
اكتب دوال منشورات مع: إنشاء، جلب صفحة من 10 بالترقيم بـ startAfter، إعجاب بـ increment، واستماع لحظي لعدد الإعجابات على منشور واحد.
`,
    },
    'firebase-3': {
      description: 'Firebase Authentication: البريد وكلمة المرور، Google، مراقبة حالة الدخول، التحقق من البريد واستعادة كلمة المرور، والتحقق من الرمز على الخادم',
      content: md`
# مصادقة Firebase

## البريد وكلمة المرور
\`createUserWithEmailAndPassword(auth, email, password)\` و \`signInWithEmailAndPassword(...)\` (المثال الكامل). بعد التسجيل أرسل رابط التحقق: \`sendEmailVerification(user)\`، واستعادة كلمة المرور بـ \`sendPasswordResetEmail(auth, email)\`.

## الدخول بـ Google
\`signInWithPopup(auth, new GoogleAuthProvider())\` على الحاسوب؛ وعلى الجوال أو المتصفحات التي تحظر النوافذ المنبثقة: \`signInWithRedirect\`. للتطبيقات الأصلية (React Native/Flutter) تُستخدم حزم المنصة.

## حالة الدخول
\`\`\`javascript
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase.js";

export function watchUser(cb) {
  return onAuthStateChanged(auth, (user) => cb(user));   // null عند الخروج؛ يعيد دالة الإلغاء
}
\`\`\`
\`auth.currentUser\` قد يكون \`null\` لحظة تحميل الصفحة حتى تُستعاد الجلسة — اعتمد على \`onAuthStateChanged\` لا على قراءة فورية.

## رسائل الأخطاء
أخطاء Firebase برموز مثل \`auth/invalid-credential\` و \`auth/email-already-in-use\` و \`auth/weak-password\` و \`auth/too-many-requests\`. حوّلها لرسائل عربية واضحة، ولا تكشف "البريد غير موجود" مقابل "كلمة المرور خاطئة" (Firebase الحديث يوحّدها إلى invalid-credential لهذا السبب).

## الهوية على الخادم
إذا كان لديك خادم أو Cloud Function، **لا تثق بـ uid يرسله العميل في الجسم**. أرسل رمز المعرّف (\`await user.getIdToken()\`) في ترويسة Authorization، وتحقق منه على الخادم بـ Admin SDK:
\`\`\`javascript
// import { getAuth } from "firebase-admin/auth";
// const decoded = await getAuth().verifyIdToken(token);   // يرمي إن كان مزوراً أو منتهياً
// const uid = decoded.uid;
const flow = ["user.getIdToken()", "Authorization: Bearer <token>", "admin.verifyIdToken(token)"];
console.log(flow.join(" ← "));
\`\`\`

## الأدوار
للمشرفين استخدم **Custom Claims** (\`setCustomUserClaims(uid, { admin: true })\` من Admin SDK)، فتظهر في الرمز وفي قواعد الأمان كـ \`request.auth.token.admin\`. لا تحفظ الدور في وثيقة يستطيع المستخدم تعديلها.

## تمرين
أضف للمثال الكامل: إرسال رابط التحقق بعد التسجيل، ومنع الوصول لصفحة "حسابي" حتى يصبح \`user.emailVerified\` صحيحاً، وترجمة خمسة رموز أخطاء شائعة إلى رسائل عربية.
`,
    },
    'firebase-4': {
      description: 'Firebase Storage: المراجع والمسارات، الرفع مع التقدم، روابط التنزيل، الحذف، البيانات الوصفية، وقواعد الحجم والنوع',
      content: md`
# تخزين Firebase (Storage)

Cloud Storage for Firebase يحفظ الصور والملفات، ويُحمى بقواعد أمان خاصة به (\`storage.rules\`).

## المسارات
\`\`\`text
users/
├── {uid}/
│   ├── avatar.jpg
│   └── documents/
│       └── invoice-2026-03.pdf
public/
└── banners/
\`\`\`
تنظيم المسار بمعرّف المستخدم يجعل قواعد الأمان بسيطة: "اكتب فقط تحت \`users/{uid}\` إذا كان uid هو أنت".

## الرفع
\`\`\`javascript
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "./firebase.js";

const storage = getStorage(app);

export async function uploadAvatar(uid, file) {
  const avatarRef = ref(storage, \`users/\${uid}/avatar.jpg\`);
  const snap = await uploadBytes(avatarRef, file, { contentType: file.type });
  return getDownloadURL(snap.ref);
}
\`\`\`
لملفات كبيرة مع شريط تقدم: \`uploadBytesResumable\` والاستماع لحدث \`state_changed\` (\`bytesTransferred / totalBytes\`) — في المثال الكامل.

## روابط التنزيل
\`getDownloadURL\` يعيد رابطاً فيه رمز وصول **دائم** حتى تلغيه يدوياً من لوحة التحكم. من يملك الرابط يرى الملف حتى لو منعته القواعد. للملفات الحساسة: لا توزع روابط التنزيل؛ اقرأ الملف عبر SDK بقواعد تتحقق من المستخدم، أو أنشئ روابط موقّعة قصيرة المدة من الخادم (Admin SDK).

## الحذف والبيانات الوصفية
\`deleteObject(ref)\` للحذف، و \`getMetadata\`/\`updateMetadata\` للنوع والحجم وبيانات مخصصة. احذف الملفات عند حذف السجل المرتبط بها لتجنب التكلفة والملفات اليتيمة.

## القواعد: الحجم والنوع دائماً
\`\`\`text
match /users/{uid}/{allPaths=**} {
  allow read: if request.auth != null && request.auth.uid == uid;
  allow write: if request.auth != null && request.auth.uid == uid
               && request.resource.size < 5 * 1024 * 1024
               && request.resource.contentType.matches('image/.*');
}
\`\`\`
بدون حد للحجم، يستطيع أي مستخدم ملء التخزين على حسابك المدفوع. ولاحظ: \`contentType\` يرسله العميل — القواعد تحد من الإساءة، أما التحقق الحقيقي من المحتوى فيحتاج دالة خادم تعالج الملف (مثل تصغير الصور وإعادة ترميزها).

## تمرين
أضف للمثال الكامل دالة تحذف الصورة القديمة قبل رفع الجديدة، وشريط تقدم نصي، ورسالة واضحة عندما ترفض القواعد ملفاً أكبر من 5MB (رمز الخطأ \`storage/unauthorized\`).
`,
    },
    'firebase-5': {
      language: 'text',
      description: 'قواعد أمان Firestore و Storage: الرفض الافتراضي، المصادقة والملكية، التحقق من البيانات، منع تصعيد الصلاحيات، والاختبار بالمحاكي',
      content: md`
# قواعد الأمان في Firebase

لأن التطبيق يتصل بـ Firestore و Storage **مباشرة من جهاز المستخدم**، فقواعد الأمان هي خادمك الوحيد: كل قراءة وكتابة تُقيَّم مقابلها. قواعد خاطئة = بيانات كل المستخدمين مكشوفة أو قابلة للتعديل.

## البنية
\`\`\`text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if <شرط>;
      allow create, update, delete: if <شرط>;
    }
  }
}
\`\`\`
- **الرفض افتراضي**: ما لم تسمح به قاعدة صراحةً فهو مرفوض.
- \`read\` = \`get\` + \`list\`، و \`write\` = \`create\` + \`update\` + \`delete\` — افصلها لتحكم أدق.
- القواعد **ليست فلاتر**: استعلام قد يعيد وثيقة غير مسموحة يُرفض بالكامل. يجب أن يتضمن الاستعلام نفس الشرط (\`where("authorId", "==", uid)\`).

## المتغيرات المتاحة
| المتغير | المعنى |
|---|---|
| \`request.auth\` | المستخدم (null إن لم يكن مسجلاً)؛ \`request.auth.uid\` و \`request.auth.token\` |
| \`resource.data\` | الوثيقة **الحالية** في قاعدة البيانات |
| \`request.resource.data\` | الوثيقة **بعد** الكتابة المطلوبة |

## الأنماط الأساسية
\`\`\`text
// الملكية
allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;

// الإنشاء باسم نفسك فقط
allow create: if request.auth != null && request.resource.data.authorId == request.auth.uid;

// التحقق من البيانات
allow create: if request.resource.data.title is string
              && request.resource.data.title.size() > 0
              && request.resource.data.title.size() <= 100
              && request.resource.data.keys().hasOnly(['title', 'body', 'authorId', 'createdAt']);
\`\`\`

## تصعيد الصلاحيات: أخطر الأخطاء
القواعد السابقة في هذا الدرس كانت تسمح بـ:
- **إنشاء وثيقة أي مستخدم** (\`allow create: if isAuthenticated()\` على \`users/{userId}\`) — فينشئ مهاجم ملفاً باسم غيره.
- **تعديل الحقول الحساسة** في وثيقته: مستخدم يضيف \`role: "admin"\` لنفسه.
- **نقل ملكية منشور** بتغيير \`authorId\` عند التحديث.
الإصلاح في المثال الكامل: الإنشاء للمالك فقط، ومنع الحقول الحساسة بـ \`diff(...).affectedKeys().hasAny([...])\`، والتأكد أن \`authorId\` لا يتغير. والأدوار تُحفظ في **Custom Claims** (\`request.auth.token.admin == true\`) لا في وثيقة يعدّلها المستخدم.

## Storage
نفس الفكرة مع \`request.resource.size\` و \`request.resource.contentType\`. ضع حداً للحجم والنوع حتى في المسارات "العامة".

## اختبر قواعدك
- **محاكي Firebase** (\`firebase emulators:start\`) ومكتبة \`@firebase/rules-unit-testing\`: اكتب اختبارات "يجب أن يُرفض" لكل محاولة مهاجم.
- **Rules Playground** في لوحة التحكم لتجربة طلب محدد.
- لا تنشر \`allow read, write: if true\` أبداً، ولا تترك "وضع الاختبار" (الذي يفتح كل شيء لمدة 30 يوماً) في مشروع حقيقي.

## تمرين
اكتب اختبارات بالمحاكي تتأكد أن: المستخدم أ لا يقرأ وثيقة المستخدم ب، ولا يستطيع إضافة \`role\` لنفسه، ولا يستطيع تغيير \`authorId\` لمنشوره، ولا رفع ملف 10MB.
`,
    },
  },
};
