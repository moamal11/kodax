/**
 * منطق إرسال الإشعارات من الطابور (notification_outbox) عبر Expo Push API — قابل للاختبار محلياً.
 *
 * 1) push_claim_batch: يحجز الرسائل المستحقة (SKIP LOCKED) مع رموز أجهزة المستخدم المفعّلة
 * 2) الإرسال لـ Expo على دفعات (100 رسالة) — ticket لكل رمز
 * 3) push_record_results: sent / إعادة محاولة بتأخير / failed بعد الحد، وتعطيل الرموز غير الصالحة
 * 4) الإيصالات: push_receipts_due → getReceipts → push_record_receipts (delivered/failed)
 */

export interface ClaimedMessage {
  id: number;
  kind: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  image?: string | null;
  tokens: string[];
}

export interface ExpoTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

export interface ExpoReceipt {
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: string };
}

export interface PushDeps {
  claim: (limit: number) => Promise<ClaimedMessage[]>;
  recordResults: (results: SendResult[]) => Promise<void>;
  receiptsDue: (limit: number) => Promise<Array<{ id: number; tickets: Array<{ id: string; token: string }> }>>;
  recordReceipts: (results: ReceiptResult[]) => Promise<void>;
  expoSend: (messages: ExpoMessage[]) => Promise<ExpoTicket[]>;
  expoReceipts: (ids: string[]) => Promise<Record<string, ExpoReceipt>>;
}

export interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  sound: 'default';
  channelId: string;
  priority: 'default' | 'high';
  richContent?: { image: string };
}

export interface SendResult {
  id: number;
  ok: boolean;
  skipped?: boolean;
  error?: string;
  tickets?: Array<{ id: string; token: string }>;
  invalid_tokens?: string[];
}

export interface ReceiptResult {
  id: number;
  delivered: boolean;
  error?: string;
  invalid_tokens?: string[];
}

const CHUNK = 100;
const ANDROID_CHANNEL: Record<string, string> = {
  message: 'messages',
  like: 'social',
  comment: 'social',
  follow: 'social',
  daily_goal: 'reminders',
  streak: 'reminders',
  admin: 'announcements',
  support: 'default',
  system: 'default',
};

export function buildMessages(m: ClaimedMessage): ExpoMessage[] {
  return m.tokens.map((to) => {
    const msg: ExpoMessage = {
      to,
      title: m.title,
      body: m.body,
      data: { ...m.data, kind: m.kind, outbox_id: m.id },
      sound: 'default',
      channelId: ANDROID_CHANNEL[m.kind] ?? 'default',
      priority: m.kind === 'message' ? 'high' : 'default',
    };
    if (m.image && /^https:\/\//.test(m.image)) msg.richContent = { image: m.image };
    return msg;
  });
}

/** دفعة واحدة من الطابور */
export async function processBatch(deps: PushDeps, limit = 200): Promise<{ claimed: number; sent: number; failed: number; skipped: number }> {
  const claimed = await deps.claim(limit);
  if (claimed.length === 0) return { claimed: 0, sent: 0, failed: 0, skipped: 0 };

  const results = new Map<number, SendResult>();
  const flat: Array<{ outboxId: number; msg: ExpoMessage }> = [];
  for (const m of claimed) {
    if (!m.tokens || m.tokens.length === 0) {
      results.set(m.id, { id: m.id, ok: false, skipped: true, error: 'no_enabled_device' });
      continue;
    }
    results.set(m.id, { id: m.id, ok: false, tickets: [], invalid_tokens: [] });
    for (const msg of buildMessages(m)) flat.push({ outboxId: m.id, msg });
  }

  for (let i = 0; i < flat.length; i += CHUNK) {
    const chunk = flat.slice(i, i + CHUNK);
    let tickets: ExpoTicket[] = [];
    let chunkError: string | null = null;
    try {
      tickets = await deps.expoSend(chunk.map((c) => c.msg));
    } catch (e) {
      chunkError = e instanceof Error ? e.message : String(e);
    }
    chunk.forEach((c, idx) => {
      const r = results.get(c.outboxId)!;
      const t = tickets[idx];
      if (chunkError || !t) {
        r.error = chunkError ?? 'missing_ticket';
        return;
      }
      if (t.status === 'ok' && t.id) {
        r.ok = true;
        r.tickets!.push({ id: t.id, token: c.msg.to });
      } else {
        if (t.details?.error === 'DeviceNotRegistered') r.invalid_tokens!.push(c.msg.to);
        r.error = t.details?.error ?? t.message ?? 'expo_error';
      }
    });
  }

  // رسالة كل رموزها غير صالحة: لا إعادة محاولة
  for (const r of results.values()) {
    if (!r.ok && !r.skipped && r.invalid_tokens && r.invalid_tokens.length > 0 &&
        claimed.find((m) => m.id === r.id)!.tokens.length === r.invalid_tokens.length) {
      r.skipped = true;
      r.error = 'DeviceNotRegistered';
    }
    if (r.ok) delete r.error;
  }

  const list = [...results.values()];
  await deps.recordResults(list);
  return {
    claimed: claimed.length,
    sent: list.filter((r) => r.ok).length,
    failed: list.filter((r) => !r.ok && !r.skipped).length,
    skipped: list.filter((r) => r.skipped).length,
  };
}

/** الإيصالات: delivered إذا وصل لجهاز واحد على الأقل */
export async function processReceipts(deps: PushDeps, limit = 300): Promise<{ checked: number; delivered: number }> {
  const due = await deps.receiptsDue(limit);
  if (due.length === 0) return { checked: 0, delivered: 0 };
  const ids = due.flatMap((d) => (d.tickets ?? []).map((t) => t.id));
  const receipts: Record<string, ExpoReceipt> = {};
  for (let i = 0; i < ids.length; i += 300) {
    Object.assign(receipts, await deps.expoReceipts(ids.slice(i, i + 300)));
  }
  const out: ReceiptResult[] = due.map((d) => {
    const invalid: string[] = [];
    let delivered = false;
    let error: string | undefined;
    for (const t of d.tickets ?? []) {
      const r = receipts[t.id];
      if (!r) continue; // لم يجهز بعد عند Expo — يُعدّ مُرسلاً بلا خطأ
      if (r.status === 'ok') delivered = true;
      else {
        error = r.details?.error ?? r.message ?? 'receipt_error';
        if (r.details?.error === 'DeviceNotRegistered') invalid.push(t.token);
      }
    }
    const anyReceipt = (d.tickets ?? []).some((t) => receipts[t.id]);
    return { id: d.id, delivered: delivered || !anyReceipt, error: delivered || !anyReceipt ? undefined : error, invalid_tokens: invalid };
  });
  await deps.recordReceipts(out);
  return { checked: out.length, delivered: out.filter((o) => o.delivered).length };
}
