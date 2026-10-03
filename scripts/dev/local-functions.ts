/**
 * خادم محلي للاختبار فقط: يشغّل منطق دالتي verify-challenge و ai-chat الحقيقي (core.ts)
 * بقاعدة بيانات في الذاكرة و Gemini وهمي بسيناريو ثابت. لا يتصل بـ Supabase أو Gemini.
 *   npx tsx scripts/dev/local-functions.ts   (المنفذ 54322)
 * سيناريو Gemini الوهمي:
 *   challenge-hint  → تعطل (502) لاختبار رسالة الخطأ
 *   challenge-fix   → كود صحيح لتحدي py-ch-beg-1
 *   challenge-solve → كود خاطئ (يجب أن تظهر شارة "لم يجتز")
 *   غير ذلك        → رد تجريبي يوضح أن المساعد استلم سياق المحادثة ومقتطفات المعرفة
 * الحصة والـcache في الذاكرة بنفس قواعد دوال القاعدة (ai_quota_reserve / ai_quota_release)،
 * و GET /rpc/ai_get_quota يعرضها للتطبيق (يمررها mock Supabase المحلي).
 */
import http from 'node:http';
import { handleVerify } from '../../supabase/functions/verify-challenge/core';
import { CHALLENGE_SPECS } from '../../supabase/functions/verify-challenge/challenges.generated';
import { handleChat } from '../../supabase/functions/ai-chat/core';
import { DEFAULT_LIVE_CONFIG } from '../../supabase/functions/ai-chat/kodax-facts';

const PORT = 54322;
const completed = new Set<string>();
const submissions: { u: string; at: number }[] = [];
const prompts: { mode: string; prompt: string }[] = [];

// ===== حصة الذكاء في الذاكرة (نفس قواعد migration 20261002030000) =====
const Q = DEFAULT_LIVE_CONFIG.ai_quota;
const aiUse = new Map<string, { used: number; ads: number }>();
const aiCache = new Map<string, string>();
function quotaState(u: string) {
  const s = aiUse.get(u) ?? { used: 0, ads: 0 };
  const bonuses = Math.min(Q.max_ad_bonuses_per_day, Math.floor(s.ads / Q.ads_per_bonus));
  const limit = Q.daily_limit + bonuses * Q.ad_bonus;
  return {
    used: s.used,
    limit,
    remaining: Math.max(0, limit - s.used),
    base_limit: Q.daily_limit,
    bonus: bonuses * Q.ad_bonus,
    ads: {
      watched: s.ads,
      per_bonus: Q.ads_per_bonus,
      bonus_amount: Q.ad_bonus,
      bonuses_earned: bonuses,
      max_bonuses: Q.max_ad_bonuses_per_day,
      progress: bonuses >= Q.max_ad_bonuses_per_day ? 0 : s.ads - bonuses * Q.ads_per_bonus,
      can_watch: bonuses < Q.max_ad_bonuses_per_day,
    },
  };
}

const userFromToken = (auth: string): string | null => {
  const t = auth.replace(/^Bearer\s+/i, '');
  try {
    return JSON.parse(Buffer.from(t.split('.')[1], 'base64url').toString()).sub ?? null;
  } catch {
    return null;
  }
};

const fakeGemini = (async (_url: string, init: any) => {
  const body = JSON.parse(init.body);
  const system: string = body.systemInstruction.parts[0].text;
  const user: string = body.contents.at(-1).parts[0].text;
  const mode = system.includes('وضع التلميح') ? 'challenge-hint' : user.includes('أصلح كود الطالب') || user.includes('هيكل الحل') ? 'challenge-fix' : user.includes('ساعد الطالب في حل') ? 'challenge-solve' : 'other';
  prompts.push({ mode, prompt: user });
  if (mode === 'challenge-hint') return new Response('{}', { status: 500 });
  if (mode === 'other') {
    const knowledge: string = body.systemInstruction.parts.find((p: any) => p.text.startsWith('معرفة Kodax:'))?.text ?? '';
    const firstRef = knowledge.match(/^\[([^\]]+)\]/m)?.[1];
    const turns = body.contents.length - 1;
    const text = [
      '**[رد تجريبي محلي — ليس من Gemini]**',
      turns > 0 ? `استلمت ${turns} رسالة سابقة من المحادثة.` : 'هذه أول رسالة في المحادثة.',
      firstRef ? `أقرب مقتطف من معرفة Kodax: ${firstRef}` : 'لم يُرفق مقتطف من معرفة Kodax.',
      '',
      '## مثال تنسيق',
      '- نقطة أولى مع `inline code`',
      '- نقطة ثانية **مهمة**',
      '',
      '```python',
      'for i in range(3):',
      '    print("مرحبا", i)  # تعليق عربي',
      '```',
    ].join('\n');
    return new Response(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text }] } }], usageMetadata: { totalTokenCount: 42 } }), { status: 200 });
  }
  const content =
    mode === 'challenge-fix'
      ? 'المشكلة: لا يوجد فحص للقسمة على صفر.\n```python\ndef calculator(a, b, operation):\n    if operation == "+":\n        return a + b\n    if operation == "-":\n        return a - b\n    if operation == "*":\n        return a * b\n    if operation == "/":\n        if b == 0:\n            return "لا يمكن القسمة على صفر"\n        return a / b\n    return "عملية غير صالحة"\n```'
      : mode === 'challenge-solve'
        ? 'الحل:\n```python\ndef calculator(a, b, operation):\n    return a + b\n```'
        : 'شرح تجريبي من Gemini وهمي.';
  return new Response(
    JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: content }] } }], usageMetadata: { totalTokenCount: 10 } }),
    { status: 200 }
  );
}) as unknown as typeof fetch;

http
  .createServer(async (req, res) => {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    };
    if (req.method === 'OPTIONS') return res.writeHead(204, cors).end();
    // حالة الحصة وجلسات إعلان الذكاء (يمررها mock Supabase من /rest/v1/rpc/...)
    if (req.url?.startsWith('/rpc/')) {
      const u = userFromToken(String(req.headers.authorization ?? ''));
      const fn = req.url.slice(5);
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
      if (!u) return res.end(JSON.stringify({ success: false, code: 'not_authenticated' }));
      if (fn === 'ai_get_quota') return res.end(JSON.stringify({ success: true, ...quotaState(u) }));
      // محاكاة إعلان مكتمل (للاختبار فقط): زيادة عدد إعلانات الذكاء المعتمدة
      if (fn === 'debug_ai_ad') {
        const s = aiUse.get(u) ?? { used: 0, ads: 0 };
        if (quotaState(u).ads.can_watch) s.ads++;
        aiUse.set(u, s);
        return res.end(JSON.stringify({ success: true, quota: quotaState(u) }));
      }
      return res.end('null');
    }
    if (req.method === 'GET' && req.url === '/debug/prompts') {
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(prompts));
    }
    let raw = '';
    for await (const c of req) raw += c;
    const body = raw ? JSON.parse(raw) : {};
    const auth = String(req.headers.authorization ?? '');
    const uid = userFromToken(auth);
    let r: { status: number; body: unknown };
    if (req.url?.endsWith('/verify-challenge')) {
      r = await handleVerify(
        {
          specs: CHALLENGE_SPECS,
          getUserId: async () => uid,
          // محلياً: كل التحديات مفتوحة (القفل الحقيقي في challenge_access_check على السيرفر)
          checkAccess: async () => ({ allowed: true, required_course_id: null }),
          countRecentSubmissions: async (u, since) => submissions.filter((s) => s.u === u && s.at >= Date.parse(since)).length,
          recordSubmission: async (a) => {
            submissions.push({ u: a.userId, at: Date.now() });
            if (!a.allPassed) return { recorded: false, first_time: false, xp_awarded: 0 };
            const k = `${a.userId}:${a.challengeId}`;
            const first = !completed.has(k);
            completed.add(k);
            return { recorded: true, first_time: first, xp_awarded: first ? CHALLENGE_SPECS[a.challengeId].points : 0 };
          },
          rewardCoins: async () => ({ success: true, reward: 5 }),
        },
        auth.replace(/^Bearer\s+/i, ''),
        body
      );
    } else if (req.url?.endsWith('/ai-chat')) {
      r = await handleChat(
        {
          getUser: async () => (uid ? { id: uid } : null),
          reserveQuota: async (u) => {
            const st = quotaState(u);
            if (st.remaining <= 0) return { allowed: false, code: 'quota_exceeded', quota: st };
            const s = aiUse.get(u) ?? { used: 0, ads: 0 };
            s.used++;
            aiUse.set(u, s);
            return { allowed: true, quota: quotaState(u) };
          },
          releaseQuota: async (u) => {
            const s = aiUse.get(u);
            if (s) s.used = Math.max(0, s.used - 1);
            return quotaState(u);
          },
          getUserSnapshot: async (u) => ({
            xp: 0, level: 1, streak: 0, coins: 0, unlockedCourses: [], completedLessons: 0, completedChallenges: 0, quota: quotaState(u),
          }),
          cacheGet: async (k) => aiCache.get(k) ?? null,
          cachePut: async (k, v) => {
            aiCache.set(k, v);
          },
          apiKey: 'local-fake',
          fetchImpl: fakeGemini,
        },
        body
      );
    } else {
      r = { status: 404, body: { error: 'not_found' } };
    }
    res.writeHead(r.status, { ...cors, 'Content-Type': 'application/json' });
    res.end(JSON.stringify(r.body));
  })
  .listen(PORT, () => console.log(`[local-functions] listening on ${PORT}`));
