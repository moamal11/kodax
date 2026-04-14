# 🔧 إعداد OpenAI API للنظام الذكي

## 📋 الخطوات السريعة

### 1️⃣ الحصول على API Key

1. **اذهب إلى OpenAI Platform:**
   https://platform.openai.com/api-keys

2. **سجل دخول أو أنشئ حساب**

3. **انقر على "Create new secret key"**

4. **انسخ الـ API Key** (ستظهر مرة واحدة فقط!)
   - يبدأ بـ `sk-proj-...` أو `sk-...`
   - احتفظ به في مكان آمن

### 2️⃣ إضافة API Key في التطبيق

افتح ملف `.env` في جذر المشروع وعدّل السطر التالي:

```env
EXPO_PUBLIC_AI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
```

**⚠️ مهم:** استبدل `YOUR_ACTUAL_KEY_HERE` بالـ API Key الحقيقي الخاص بك!

### 3️⃣ إعادة تشغيل التطبيق

```bash
# أوقف الخادم الحالي (Ctrl+C)
# ثم شغّل من جديد
npm start
```

**⚠️ ملاحظة:** يجب إعادة تشغيل التطبيق بعد تعديل ملف `.env`!

---

## ✅ التحقق من التشغيل

بعد إعادة التشغيل، راقب console logs عند إرسال رسالة:

```
🔍 AI API Check: { configured: true, ... }
🎯 Question classified as: simple using model: gpt-3.5-turbo
🚀 Sending request to OpenAI API...
📥 Response status: 200 OK
✅ Received response from OpenAI
📊 Response metrics: { tokens: 150, ... }
```

### ✅ **إذا رأيت:** `configured: true` و `200 OK` → الإعداد صحيح!

### ❌ **إذا رأيت:** `No valid API configuration found` → راجع الخطوات

---

## 🐛 حل المشاكل الشائعة

### المشكلة 1: "No valid API configuration found"

**السبب:** ملف `.env` غير مُعد بشكل صحيح

**الحل:**

```bash
# 1. تأكد أن الملف اسمه .env (بدون امتداد .txt)
# 2. تأكد أن API Key موجود في السطر:
EXPO_PUBLIC_AI_API_KEY=sk-proj-...

# 3. أعد تشغيل التطبيق
npm start
```

---

### المشكلة 2: "401 Authentication failed"

**السبب:** API Key خطأ أو منتهي

**الحل:**

1. تأكد أنك نسخت API Key بشكل كامل
2. تحقق أنه لا يوجد مسافات قبله أو بعده
3. أنشئ API Key جديد من OpenAI Platform

---

### المشكلة 3: "429 Rate limit exceeded"

**السبب:** تجاوزت عدد الطلبات المسموح

**الحل:**

1. انتظر دقيقة وحاول مرة أخرى
2. راجع حدود الاستخدام في حسابك على OpenAI
3. فعّل Billing إذا كنت على الخطة المجانية

---

### المشكلة 4: "Insufficient quota"

**السبب:** رصيدك في OpenAI انتهى

**الحل:**

1. اذهب إلى: https://platform.openai.com/account/billing
2. أضف رصيد (Credit) لحسابك
3. الحد الأدنى: $5

---

## 💰 التكاليف المتوقعة

النظام الذكي يختار النموذج المناسب تلقائياً للتوفير:

```
📊 توقعات التكلفة (1000 سؤال/شهر):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
700 سؤال بسيط    (gpt-3.5-turbo) → $1.05
250 سؤال متوسط    (gpt-4o-mini)   → $1.50
50 سؤال متقدم     (gpt-4o)        → $1.50
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              الإجمالي: ~$4/شهر
```

---

## 🔐 الأمان

### ✅ **نصائح الأمان:**

1. **لا تشارك API Key أبداً**
   - لا ترفعه على GitHub
   - لا تنشره في Discord/Twitter
   - احذف `.env` من Git

2. **أضف `.env` إلى `.gitignore`:**

   ```bash
   # في ملف .gitignore
   .env
   .env.local
   ```

3. **حدد Limits في OpenAI:**
   - اذهب إلى: https://platform.openai.com/account/limits
   - ضع حد شهري للإنفاق (مثلاً $10)

4. **راقب الاستخدام:**
   ```sql
   -- في Supabase SQL Editor
   SELECT
     DATE(timestamp) as date,
     COUNT(*) as requests,
     SUM(tokens_used) as tokens,
     ROUND(SUM(estimated_cost_usd)::NUMERIC, 2) as cost
   FROM ai_usage_tracking
   WHERE timestamp >= NOW() - INTERVAL '30 days'
   GROUP BY DATE(timestamp)
   ORDER BY date DESC;
   ```

---

## 🚀 وضع الإنتاج (Production)

عند نشر التطبيق، استخدم Expo Secrets:

```bash
# إضافة API Key كـ Secret
eas secret:create --scope project --name AI_API_KEY --value sk-proj-...

# في app.json أو app.config.js
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_AI_API_KEY": process.env.AI_API_KEY
    }
  }
}
```

---

## 📚 روابط مفيدة

- 🔑 **OpenAI API Keys:** https://platform.openai.com/api-keys
- 💳 **Billing & Usage:** https://platform.openai.com/account/usage
- 📖 **API Documentation:** https://platform.openai.com/docs
- 💰 **Pricing:** https://openai.com/api/pricing
- 🆘 **Support:** https://help.openai.com

---

## ❓ أسئلة شائعة

### **س: هل يجب أن أدفع لاستخدام OpenAI؟**

ج: نعم، OpenAI API مدفوع. الحد الأدنى $5. لكن التطبيق يعمل بوضع المحاكاة إذا لم يكن API مُعد.

### **س: ما هو الفرق بين API Key و Organization ID؟**

ج: API Key يبدأ بـ `sk-...` وهو المطلوب فقط. Organization ID اختياري.

### **س: هل يمكن استخدام API أخرى غير OpenAI؟**

ج: نعم! أي API متوافق مع OpenAI format (مثل Azure OpenAI أو Local LLMs)

### **س: كيف أتتبع التكاليف؟**

ج: راجع ملف `supabase/ai_usage_tracking.sql` لإنشاء جدول التتبع.

---

## 🎉 تم!

الآن نظام الـ AI جاهز للعمل مع OpenAI الحقيقي! 🚀

إذا واجهت أي مشكلة، راجع console logs أو اطلب المساعدة من الفريق.

**Happy Coding! 💻✨**
