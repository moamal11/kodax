# اختبار الحل الجذري لـ Google OAuth 🧪

---

## الاختبار الأول: Fresh OAuth (الحالة الأساسية)

### الخطوات:
1. **أغلق التطبيق تماماً** (swipe up من recent apps)
2. **امسح بيانات التطبيق** (اختياري لـ 100% نظاف):
   - Settings → Apps → Kodax → Storage → Clear Data
3. **افتح التطبيق من الصفر**
4. اضغط **"دخول مع Google"**
5. سجّل دخول بحسابك
6. **لاحظ**: يجب أن ترى البيانات مباشرة:
   - ✅ Profile يظهر (الاسم، الصور)
   - ✅ النقاط تظهر
   - ✅ التطبيق responsive (لا تحميل عالق)

### النتيجة المتوقعة:
```
[PASS] البيانات تحمّل فوراً (بدون app restart)
[PASS] الصفحات ليست فارغة
[PASS] الـ logs تظهر:
  [SessionHydration] Starting hydration...
  [SessionHydration] Session verified...
  [SessionHydration] ✅ Hydration complete
  [AppProvider] Loading all data for user...
```

### النتيجة المتوقعة الفاشلة:
```
[FAIL] البيانات فارغة بعد OAuth
[FAIL] تحتاج لـ Close/Reopen التطبيق
[FAIL] Logs تظهر أخطاء
```

---

## الاختبار الثاني: في شبكة بطيئة (Slow 3G)

### الهدف:
اختبار الـ retry logic عندما تكون الشبكة بطيئة

### الخطوات:
1. Developer Settings → Network Throttling → Slow 3G
2. كرر الاختبار الأول
3. لاحظ الوقت:
   - متوقع: 5-8 ثواني (بدل فوري)
   - لا تقلق من التأخير — لكن لا تكون فارغة

### النتيجة المتوقعة:
```
[PASS] في شبكة بطيئة، ينتظر لكن يحمّل ✅
[PASS] لا يفشل أو يعيد load بلا داع
[PASS] Logs تظهر retry attempts:
  [AppProvider] Profile not found, retrying in 300ms
  [AppProvider] Retrying in 600ms
  [AppProvider] Profile loaded successfully
```

---

## الاختبار الثالث: حالة الـ Session غير المستقرة

### الهدف:
اختبار أن SessionHydration يتعامل مع getSession() delays

### الخطوات:
1. اضغط Google Login
2. لاحظ الـ console logs
3. تحقق من:
   - عدد مرات retry: 1-5 operations
   - الـ timing: يجب أن يكون معقول

### النتيجة المتوقعة:
```
[PASS] Session verification يحاول عدة مرات
[PASS] عند النجاح، يستمر
[PASS] عند الفشل بعد max attempts، يستمر anyway
       (graceful degradation)
```

---

## الاختبار الرابع: Deep Link Integration

### الهدف:
التأكد من أن deep link handler يصل مع SessionHydration بنجاح

### الخطوات (iOS):
```bash
# من الـ terminal
xcrun simctl openurl booted "kodax://auth/success#access_token=..."
```

### الخطوات (Android):
```bash
# من الـ terminal
adb shell am start -a android.intent.action.VIEW \
  -d "kodax://auth/success#access_token=..."
```

### النتيجة المتوقعة:
```
[PASS] Deep link يُمسك صحيح
[PASS] Session يُنشأ
[PASS] SessionHydration يتولى من هنالك
[PASS] Data يحمّل
```

---

## الاختبار الخامس: Concurrent OAuth + Other Requests

### الهدف:
تأكد من أن concurrent requests لا تسبب race conditions

### الخطوات:
1. أثناء OAuth flow، اضغط على tabs (لكن لا تنجح)
2. تحقق من عدم حدوث crashes

### النتيجة المتوقعة:
```
[PASS] لا توجد crashes
[PASS] SessionHydration يحمي من race conditions
[PASS] الـ query parameters معزول
```

---

## الاختبار السادس: Logout + Login المتكرر

### الهدف:
التأكد من أن الحل يعمل مع logout/login cycles

### الخطوات:
1. سجّل دخول بحساب
2. اذهب الى Profile
3. اضغط Logout
4. أعد تسجيل الدخول
5. أعد المحاولة 5 مرات

### النتيجة المتوقعة:
```
[PASS] كل مرة يحمّل البيانات صحيح
[PASS] لا توجد بيانات عالقة من حساب قديم
[PASS] SessionHydration reset صحيح
```

---

## الاختبار السابع: Network Error Recovery

### الهدف:
اختبار كيفية تعامل retry logic مع network errors

### الخطوات:
1. قيّد الشبكة (Wi-Fi off)
2. اضغط Google Login
3. بعد 2 ثانية، شغّل الشبكة
4. لاحظ إذا يحاول من جديد

### النتيجة المتوقعة:
```
[PASS] Retry logic يعيد المحاولة
[PASS] عند عودة الشبكة، يستمر
[PASS] Data يحمّل في النهاية
```

---

## Debugging الـ Logs

### في Chrome DevTools (React Native Debugger):

```javascript
// Search for:
"[SessionHydration]"     // جميع logs من SessionHydration
"[AppProvider]"          // جميع logs من AppProvider
"[Auth]"                 // جميع logs من AuthContext

// الترتيب المتوقع:
1. [SessionHydration] Starting hydration...
2. [SessionHydration] Session not yet available...  (retries)
3. [SessionHydration] Session verified...
4. [SessionHydration] ✅ Hydration complete
5. [AppProvider] Loading all data for user...
6. [AppProvider] Profile loaded successfully
7. ✅ Data rendered
```

---

## Performance Profiling

### Expected Timings:

```
OAuth initiate → t=0ms
└─ OAuth flow                 → 1500-3000ms (depends on Google)
└─ deepLinkAuthService        → 100ms (setSession)
└─ onAuthStateChange fires    → 50-100ms
└─ AuthContext updates        → 0-50ms
└─ SessionHydration starts    → 0-50ms
   ├─ Buffer (wait 300ms)     → 300ms
   ├─ Verify (retry loop)     → 100-600ms
   ├─ Flush (AsyncStorage)    → 200ms
   └─ safeUserId available    → +500-1100ms
└─ AppProvider detects changed userId
   ├─ loadProfile()           → 100-500ms (DB query)
   ├─ loadLeaderboard()       → 100-500ms (DB query)
   └─ Data rendered           → 0-100ms
   
Total: 2500-4500ms (depends on network)
```

### Expected vs Actual:

| Metric | Expected | Actual | Status |
|--------|----------|--------|--------|
| OAuth → safeUserId | < 1.5s | ? | 🔍 |
| loadProfile | < 500ms | ? | 🔍 |
| Data visible | < 2s | ? | 🔍 |

---

## قائمة الفحص

قبل deployment، تأكد من:

- [ ] SessionHydrationProvider imports صحيح
- [ ] HydratedInnerLayout يستخدم safeUserId
- [ ] AppProvider يستقبل safeUserId (لا user?.id)
- [ ] PointsProvider يستخدم safeUserId
- [ ] SubscriptionProvider يستخدم safeUserId
- [ ] لا توجد أخطاء في console
- [ ] Logs تظهر بالترتيب الصحيح
- [ ] Test OAuth fresh login يعمل
- [ ] Test logout/login cycle يعمل
- [ ] Test في شبكة بطيئة يعمل

---

## إذا فشل الاختبار 🔴

### أعراض شائعة:

#### ❌ البيانات فارغة بعد OAuth
```
السبب المحتمل: safeUserId لم يُمرر بشكل صحيح
الحل: تأكد من:
- _layout.tsx يستخدم useSessionHydration()
- AppProvider يستقبل {safeUserId}
- HydratedInnerLayout موجود
```

#### ❌ SessionHydration stuck في "waiting"
```
السبب المحتمل: getSession() لم تُرجع أي شيء
الحل:
- تأكد من Session محفوظ صحيح في AsyncStorage
- تحقق من network connection
- increase retries من 5 الى 10
```

#### ❌ Infinite retry loop
```
السبب المحتمل: loadProfile retries forever
الحل:
- تأكد من profile موجود في database
- قيّم checkMandatoryData() — قد تحتاج update
- check RLS policies في Supabase
```

---

## الخطوات التالية بعد النجاح ✅

1. **Build APK/IPA للموبايل**:
   ```bash
   eas build --platform android
   eas build --platform ios
   ```

2. **Test على maintainers**:
   - iOS real device
   - Android real device
   - عبر شبكات مختلفة (Wi-Fi, 4G, 3G)

3. **Monitor في production**:
   - اتفرج على error logs
   - track SessionHydration timing
   - احسب success rate

4. **Document للمستقبل**:
   - نسخ هذا الملف لـ wiki
   - أضف notes عن platform-specific issues
   - update CI/CD pipeline

