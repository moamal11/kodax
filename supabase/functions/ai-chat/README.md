# 🚀 Supabase Edge Function: AI Chat

## 📁 البنية

```
supabase/
  functions/
    _shared/
      cors.ts              # CORS headers مشتركة
    ai-chat/
      index.ts             # Edge Function الرئيسية
```

---

## 🔧 الإعداد

### 1️⃣ تثبيت Supabase CLI

```bash
npm install -g supabase
```

### 2️⃣ تسجيل الدخول

```bash
supabase login
```

### 3️⃣ ربط المشروع

```bash
n
```

### 4️⃣ إضافة API Key كـ Secret

```bash
supabase secrets set OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
```

### 5️⃣ Deploy

```bash
# Deploy الـ function
supabase functions deploy ai-chat

# أو deploy جميع Functions
supabase functions deploy
```

---

## 📡 الاستخدام

### **Endpoint URL:**

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-chat
```

### **Request:**

```bash
curl -X POST \
  https://krtulodnhmfuoxjqajwl.supabase.co/functions/v1/ai-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "message": "ما هو React؟",
    "userId": "user-123",
    "context": "مبتدئ في البرمجة"
  }'
```

### **Response:**

```json
{
  "reply": "React مكتبة JavaScript لبناء واجهات تفاعلية. يستخدم Components قابلة لإعادة الاستخدام.\n\nمثال:\nfunction App() {\n  return <h1>Hello World</h1>;\n}"
}
```

---

## 🧪 أمثلة الاستخدام

### **مثال 1: سؤال بسيط**

**Request:**

```json
{
  "message": "ما هو useState؟"
}
```

**Response:**

```json
{
  "reply": "useState هو Hook في React يسمح لك بإضافة state للمكونات.\n\nمثال:\nconst [count, setCount] = useState(0)\n\nيمكنك تغيير count باستخدام setCount(1)"
}
```

**النموذج المستخدم داخلياً:** `gpt-3.5-turbo` ✅

---

### **مثال 2: سؤال متقدم**

**Request:**

```json
{
  "message": "صمم معمارية microservices لتطبيق تعليمي يخدم 100K مستخدم",
  "context": "استخدم Supabase و React Native"
}
```

**Response:**

```json
{
  "reply": "**المعمارية المقترحة:**\n\n**1. Frontend:**\n- React Native + Expo\n- State: Zustand\n- Cache: React Query\n\n**2. Backend:**\n- Supabase (PostgreSQL + Edge Functions)\n- Realtime subscriptions\n- RLS للأمان\n\n**3. Services:**\n- Auth: Supabase Auth\n- Storage: Supabase Storage\n- AI: Edge Function منفصلة\n\n**4. Scalability:**\n- CDN للـ assets\n- Database indexes\n- Connection pooling\n- Read replicas عند 50K+ users\n\n**5. التكلفة المتوقعة:**\n~$200/شهر لـ 100K users"
}
```

**النموذج المستخدم داخلياً:** `gpt-4o` ✅

---

## 🔍 كيف يعمل التصنيف؟

النظام يصنف السؤال **داخلياً فقط** (المستخدم لا يعرف):

```javascript
// سؤال بسيط → gpt-3.5-turbo
- أقل من 100 كلمة
- لا يحتوي كلمات متقدمة
- أسئلة تعريفية

// سؤال متقدم → gpt-4o
- أكثر من 100 كلمة
- يحتوي: معمارية، security، design pattern، إلخ
- تحليل شامل أو مراجعة
```

---

## 🐛 استكشاف الأخطاء

### **خطأ: "Service configuration error"**

**السبب:** OPENAI_API_KEY غير مُعد

**الحل:**

```bash
supabase secrets set OPENAI_API_KEY=sk-proj-...
supabase functions deploy ai-chat
```

---

### **خطأ: "Method not allowed"**

**السبب:** تستخدم GET بدلاً من POST

**الحل:** استخدم POST فقط

---

### **خطأ: "Invalid message"**

**السبب:** لم ترسل `message` في الـ body

**الحل:**

```json
{
  "message": "سؤالك هنا"
}
```

---

## 📊 اختبار محلي

```bash
# شغّل locally
supabase functions serve ai-chat --env-file ./supabase/.env.local

# اختبر
curl -X POST \
  http://localhost:54321/functions/v1/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "ما هو React؟"}'
```

---

## 🔐 الأمان

### ✅ **ما تم تطبيقه:**

1. API Key في Secrets (ليس في الكود)
2. CORS headers محددة
3. Method validation
4. Input validation
5. Error handling نظيف

### ⚠️ **نصائح إضافية:**

1. أضف Rate Limiting
2. استخدم Supabase Auth للتحقق من المستخدمين
3. راقب Usage في OpenAI Dashboard

---

## 💰 التكلفة

```
توقعات لـ 1000 طلب/شهر:
━━━━━━━━━━━━━━━━━━━━━━━━
700 بسيط (gpt-3.5-turbo)  → $1.05
300 متقدم (gpt-4o)        → $4.50
━━━━━━━━━━━━━━━━━━━━━━━━
الإجمالي: ~$5.55/شهر
```

---

## 📚 الملفات

1. ✅ `supabase/functions/ai-chat/index.ts` - Edge Function
2. ✅ `supabase/functions/_shared/cors.ts` - CORS
3. ✅ هذا الملف - التعليمات

---

## 🎉 جاهز!

الـ Edge Function الآن جاهزة ومُحسّنة للعمل! 🚀

**Next Steps:**

1. Deploy: `supabase functions deploy ai-chat`
2. Test في التطبيق
3. راقب Logs: `supabase functions logs ai-chat`

**Happy Coding! 💻✨**
