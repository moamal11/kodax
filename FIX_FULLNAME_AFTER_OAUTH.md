# حل مشكلة اسم المستخدم بعد Google OAuth

## 🔴 المشكلة

عند تسجيل الدخول عبر Google:
- ✅ **أول مرة (فوراً)**: يظهر **البريد الإلكتروني** (fallback)
- ❌ **بعد الانتقال للرئيسية**: الترحيب يقول "مرحباً أحمد**@gmail.com**" (خطأ)
- ✅ **بعد logout/login مرة أخرى**: يظهر **الاسم الصحيح** (مثل "أحمد محمود")

---

## 🔍 السبب الجذري

### الكود القديم:
```typescript
// SIGNED_IN event في AuthContext
await ensureProfile(newSession.user);  // ينشئ profile في DB
fetchFullName(newSession.user.id);     // ❌ يحاول قراءة الاسم فوراً
```

### المشكلة بالتفصيل:
```
Timeline:
t=0 ── SIGNED_IN event fires
t=+5ms ── ensureProfile() يبدأ تنفيذ INSERT في SQL
t=+50ms ── fetchFullName() يبدأ SELECT من DB
        ├─ profile لم ينتهي من الإدراج بعد
        ├─ SELECT returns NULL
        ❌ fullName = "user@gmail.com" (fallback)
t=+100ms ── ensureProfile() ينتهي من INSERT
        └─ profile موجود الآن لكن الاسم تم تحديده بـ fallback

بعد logout/login المرة الثانية:
t=0 ── SIGNED_IN event fires
t=+50ms ── profile موجود بالفعل
t=+100ms ── fetchFullName() يقرأ من DB
        └─ ✅ يجد الاسم الصحيح
```

---

## ✅ الحل

### الجزء 1: فقط استخدم الاسم من Google metadata

Google يعطيك الاسم مباشرة في `user.user_metadata.full_name`:

```typescript
// بدل الانتظار للـ DB، استخدم metadata مباشرة 🚀
if (metadata) {
  const metadataFullName = 
    metadata.full_name || 
    metadata.name || 
    metadata.display_name || '';
  
  if (metadataFullName) {
    setFullName(metadataFullName);  // ✅ فوراً!
    return;
  }
}
```

### الجزء 2: انتظر ensureProfile أن ينتهي قبل فقط

```typescript
// BEFORE (خطأ):
await ensureProfile(newSession.user);
fetchFullName(newSession.user.id);  // ❌ لم ننتظر

// AFTER (صحيح):
await ensureProfile(newSession.user);  // انتظر
fetchFullName(newSession.user.id, 4, metadata);  // مع metadata
```

### الجزء 3: Retry logic للـ fallback

إذا metadata لم تكن متوفرة (حالة نادرة)، أعد المحاولة:

```typescript
if (retries > 0 && !data) {
  const delay = (4 - retries + 1) * 200;  // 200, 400, 600, 800ms
  await new Promise(r => setTimeout(r, delay));
  return fetchFullName(userId, retries - 1);
}
```

---

## 📊 الفرق

### قبل:
```
Google OAuth completes
  ↓
ensureProfile() starts
  ↓
fetchFullName() fires immediately (❌ before ensureProfile completes)
  ↓
Profile not found in DB
  ↓
Uses fallback: user@gmail.com ❌
  ↓
UI shows email
```

### بعد:
```
Google OAuth completes
  ↓
ensureProfile() starts
  ↓
✅ Wait for ensureProfile() to complete
  ↓
fetchFullName() with metadata
  ↓
✅ Try metadata first: "أحمد محمود"
  ↓
UI shows correct name ✅
```

---

## 🔧 التعديلات في الكود

### في `src/contexts/AuthContext.tsx`:

**1. دالة `fetchFullName()` الجديدة:**
```typescript
const fetchFullName = useCallback(
  async (
    userId: string,
    retries: number = 4,
    metadata?: Record<string, any>  // ← جديد
  ) => {
    // أولاً: حاول metadata
    if (metadata) {
      const metadataFullName = metadata.full_name || metadata.name || '';
      if (metadataFullName) {
        setFullName(metadataFullName);
        return;  // ✅ نجح من metadata
      }
    }
    
    // ثم: حاول DB مع retry
    // ...
  },
  []
);
```

**2. في SIGNED_IN event:**
```typescript
await ensureProfile(newSession.user);  // ← await الآن
fetchFullName(
  newSession.user.id,
  4,
  newSession.user.user_metadata  // ← pass metadata
);
```

---

## ✨ النتائج

| المرحلة | قبل | بعد |
|--------|-----|-----|
| فوراً بعد OAuth | ❌ user@gmail.com | ✅ أحمد محمود |
| عند الانتقال للرئيسية | ❌ بريد خطأ | ✅ اسم صحيح |
| بعد logout/login | ✅ اسم صحيح | ✅ اسم صحيح |

---

## 🔐 الضمانات

```
✅ Google metadata متوفرة دائماً (من OAuth response)
✅ Retry logic إذا حدثت مشكلة نادرة
✅ No hardcoded values
✅ Fallback لـ email إذا فشل كل شيء
✅ Consistent behavior على جميع المنصات
```

---

## 📝 ملاحظات

- الحل **بسيط وفعال**: استخدم data متوفرة من Google
- **لا complexity** إضافية: فقط retry logic
- **Compatible** مع الحل السابق (SessionHydrationProvider)
- **Performance**: Metadata يظهر فوراً (0ms latency)

