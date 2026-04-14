# 🤖 دليل AI Tutor الذكي - Kodax

## نظرة عامة

تم تطوير AI Tutor ذكي ومتفاعل لمنصة Kodax بميزات متقدمة:

## ✨ الميزات الرئيسية

### 1️⃣ تنسيق الأكواد تلقائياً

- **Syntax Highlighting**: تلوين تلقائي للأكواد حسب اللغة
- **أرقام الأسطر**: عرض أرقام الأسطر بجانب الكود
- **زر النسخ**: نسخ الكود بضغطة واحدة
- **دعم متعدد اللغات**: JavaScript, TypeScript, Python, Java, C++, CSS, HTML, SQL

#### مثال الاستخدام في الردود:

```javascript
const greeting = () => {
  console.log('مرحباً بك في Kodax!');
};
```

### 2️⃣ ذاكرة سياقية للمستخدم

يتذكر النظام:

- ✅ الدروس والتحديات المنجزة
- ✅ اللغات المفضلة للمستخدم
- ✅ الأكواد السابقة
- ✅ مستوى المستخدم (مبتدئ / متوسط / متقدم)
- ✅ تقدم المستخدم في المنصة

#### التفعيل:

```typescript
// يتم تفعيلها تلقائياً في ai.tsx
contextMemoryService.setUser(userId);
```

### 3️⃣ اللهجة العراقية

كل الردود باللهجة العراقية:

- "شلون" بدلاً من "كيف"
- "هواية" للتعبير عن الكثرة
- "شنو" بدلاً من "ماذا"
- "زين" للموافقة
- "ماكو مشكلة" بدلاً من "لا مشكلة"

#### مثال رد:

```
شلون الحال صديقي! 👋
شنو تريد تتعلم اليوم؟ عندي هواية أمثلة زينة إلك!
```

### 4️⃣ زر "شرح بالذكاء" في التحديات

#### للمشتركين:

- شرح مفصل للتحدي
- Hints ذكية خطوة بخطوة
- أمثلة عملية
- خطوات الحل

#### لغير المشتركين:

- رسالة تشجيع للاشتراك
- بدون كشف أي hints أو حلول

#### الاستخدام:

```tsx
<ExplainWithAI
  challengeId={challenge.id}
  challengeTitle={challenge.title}
  challengeDescription={challenge.description}
  starterCode={challenge.starterCode}
  language={challenge.language}
  isSubscribed={isSubscribed}
  onSubscribePress={openSubscriptionModal}
/>
```

### 5️⃣ أوضاع الدردشة المحسّنة

#### الأوضاع المتاحة:

1. **محادثة عامة** (general)
   - للأسئلة العامة
   - باللهجة العراقية
   - ودود ومباشر

2. **شرح الكود** (explain)
   - شرح خطوة بخطوة
   - أمثلة بسيطة
   - استخدام 💡 للنصائح

3. **إصلاح الأخطاء** (fix)
   - تشخيص سريع
   - شرح السبب
   - الحل الصحيح
   - استخدام 🐛 و ✅

4. **تحسين الأداء** (optimize)
   - 2-3 تحسينات عملية
   - شرح الفائدة
   - الكود المحسّن
   - استخدام 🚀 و ⚡

5. **تحدي برمجي** (challenge)
   - تحديات مناسبة
   - hints ذكية
   - تشجيع
   - استخدام 🏆 و 💪

6. **شرح تحدي** (challenge-explain) - جديد!
   - شرح مفصل للتحدي
   - خطوات التفكير
   - أمثلة صغيرة
   - hints بدون الحل الكامل

## 📦 المكونات الجديدة

### AIMessageRenderer

مكون لعرض الرسائل مع تنسيق الأكواد تلقائياً

```tsx
<AIMessageRenderer content={message.content} isUser={false} />
```

**الميزات:**

- كشف تلقائي للأكواد في النص
- دعم code blocks (```)
- دعم inline code (`)
- syntax highlighting تلقائي
- كشف ذكي للغة البرمجة

### ExplainWithAI

مكون زر الشرح بالذكاء للتحديات

```tsx
<ExplainWithAI
  challengeId="challenge-1"
  challengeTitle="مجموع رقمين"
  challengeDescription="اكتب دالة..."
  starterCode="function sum(a, b) {...}"
  language="javascript"
  isSubscribed={true}
  onSubscribePress={() => {}}
/>
```

**الميزات:**

- فحص الاشتراك تلقائياً
- مودال جميل للشرح
- تأثيرات حركية
- loading state
- نصائح إضافية

### ContextMemoryService

خدمة الذاكرة السياقية

```typescript
// تفعيل للمستخدم
contextMemoryService.setUser(userId);

// الحصول على السياق
const context = await contextMemoryService.getUserContext();

// الحصول على prompt مخصص
const customPrompt = await contextMemoryService.getContextualPrompt();

// تحديث بعد إنجاز تحدي
await contextMemoryService.updateChallengeCompletion(challengeId);

// إضافة كود جديد
await contextMemoryService.addRecentCode(code, language);
```

## 🎨 تنسيق الردود

### Code Blocks

استخدم ```language في الردود:

````
```javascript
const greeting = () => {
  console.log('مرحباً!');
};
```
````

### Inline Code

استخدم `` لكود صغير:

```
استخدم دالة `console.log()` للطباعة
```

### Emojis للتفاعل

- 💡 للنصائح والأفكار
- ✅ للأشياء الصحيحة
- ⚠️ للتحذيرات
- 🐛 للأخطاء
- 🚀 للتحسينات
- ⚡ للأداء
- 🏆 للتحديات
- 💪 للتشجيع
- 🎯 للأهداف

## 🔧 الإعداد والتكامل

### 1. في صفحة AI (ai.tsx)

```typescript
// إضافة import
import { contextMemoryService } from '@/services/contextMemoryService';
import { AIMessageRenderer } from '@/components/ai/AIMessageRenderer';

// تفعيل السياق
useEffect(() => {
  if (userId && isPremium) {
    contextMemoryService.setUser(userId);
  }
}, [userId, isPremium]);

// استخدام المكون
<AIMessageRenderer
  content={message.content}
  isUser={message.role === 'user'}
/>
```

### 2. في صفحة التحديات (challenge/[id].tsx)

```typescript
// إضافة import
import { useSubscription } from '@/contexts/SubscriptionContext';
import { ExplainWithAI } from '@/components/ai';

// استخدام المكون
<ExplainWithAI
  challengeId={challenge.id}
  challengeTitle={challenge.title}
  challengeDescription={challenge.description}
  starterCode={challenge.starterCode}
  language={challenge.language}
  isSubscribed={isSubscribed}
  onSubscribePress={openSubscriptionModal}
/>
```

### 3. في Edge Function (supabase/functions/ai-chat)

```typescript
// دعم الوضع الجديد
if (mode === 'challenge-explain') {
  const { title, description, starterCode, language } = context;

  prompt = `شرح هذا التحدي بالتفصيل:
العنوان: ${title}
الوصف: ${description}
اللغة: ${language}
الكود الأولي: ${starterCode}

اشرح شلون يحل المستخدم هذا التحدي خطوة بخطوة، مع hints ذكية، بدون إعطاء الحل الكامل.`;
}
```

## 🎯 أفضل الممارسات

### للردود:

1. احكي باللهجة العراقية دائماً
2. استخدم code blocks لكل كود
3. أضف emojis للتفاعل
4. خلي الشرح بسيط ومباشر
5. استخدم أمثلة عملية

### للأكواد:

1. حدد اللغة دائماً في code block
2. أضف تعليقات بالعربية
3. استخدم أسماء متغيرات واضحة
4. اجعل الأمثلة قصيرة ومفيدة

### للسياق:

1. حدّث السياق بعد كل إنجاز
2. استخدم السياق لتخصيص الردود
3. تذكر مستوى المستخدم
4. راجع اللغات المفضلة

## 📊 الإحصائيات والمراقبة

### تتبع الاستخدام:

- عدد الرسائل اليومية
- عدد التوكنات المستخدمة
- نسبة الاستخدام
- إحصائيات لكل وضع

### حدود الاستخدام:

- فحص تلقائي قبل كل رسالة
- تحذير عند 90%
- منع عند 100%
- إعادة تعيين يومية

## 🚀 التحديثات المستقبلية

### قريباً:

- [ ] شرح صوتي بالذكاء الاصطناعي
- [ ] اقتراحات كود تلقائية
- [ ] تصحيح أخطاء تلقائي أثناء الكتابة
- [ ] مساعد شخصي لكل مستخدم
- [ ] تحديات مخصصة حسب المستوى

## 📝 ملاحظات هامة

1. **الاشتراك مطلوب** لميزات AI المتقدمة
2. **حدود يومية** للاستخدام المجاني
3. **الأكواد تُحفظ** في السياق
4. **الخصوصية محفوظة** - لا مشاركة للبيانات
5. **التحديثات مستمرة** بناءً على feedback

## 🆘 الدعم والمساعدة

إذا واجهت أي مشكلة:

1. تحقق من حالة الاشتراك
2. راجع حدود الاستخدام
3. تأكد من الاتصال بالإنترنت
4. راجع سجل الأخطاء (console)

---

**تم التطوير بحب ❤️ لمنصة Kodax**

**آخر تحديث:** 7 فبراير 2026
