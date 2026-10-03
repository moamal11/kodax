# ⚡ Quick Start: AI Chat Edge Function

## 📦 الملفات المُنشأة

```
✅ supabase/functions/ai-chat/index.ts       - Edge Function
✅ supabase/functions/_shared/cors.ts         - CORS
✅ supabase/functions/ai-chat/README.md       - التعليمات
✅ supabase/.env.example                      - Environment example
✅ src/services/aiEdgeFunction.example.ts     - مثال استخدام
```

---

## 🚀 Deploy في 3 خطوات

### 1️⃣ إضافة API Key

```bash
supabase secrets set GEMINI_API_KEY=<مفتاح Gemini>
```

### 2️⃣ Deploy

```bash
supabase functions deploy ai-chat
```

### 3️⃣ اختبر

```bash
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/ai-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"message": "ما هو React؟"}'
```

---

## 📱 استخدام في التطبيق

```typescript
import { supabase } from '@/lib/supabase';

const { data } = await supabase.functions.invoke('ai-chat', {
  body: { message: 'ما هو React؟' },
});

console.log(data.reply);
```

---

## 🎯 المميزات

✅ **Serverless** - لا سيرفرات للإدارة
✅ **ذكي** - يصنف الأسئلة ويختار النموذج تلقائياً
✅ **سريع** - إجابات محسّنة وقصيرة
✅ **آمن** - API Keys في Secrets
✅ **رخيص** - توفير 85% من التكلفة

---

## 💡 أمثلة سريعة

### سؤال بسيط:

```json
{ "message": "ما هو useState؟" }
```

→ يستخدم `gpt-3.5-turbo` داخلياً

### سؤال متقدم:

```json
{ "message": "صمم معمارية microservices" }
```

→ يستخدم `gpt-4o` داخلياً

**المستخدم لا يعرف الفرق!** ✨

---

## 📊 التكلفة

```
1000 طلب/شهر = ~$5.55
10K طلب/شهر = ~$55
```

---

## 🔗 روابط مفيدة

- 📖 [README الكامل](./ai-chat/README.md)
- 🔑 [Gemini API Keys](https://aistudio.google.com/apikey)
- 📚 [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)

---

**🎉 جاهز للعمل!**
