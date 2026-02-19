# دليل إعداد تسجيل الدخول بجوجل Google OAuth

هذا الدليل يشرح خطوات إعداد Google Sign-In في تطبيق Kodax.

---

## 📋 المتطلبات المسبقة

✅ حساب على [Google Cloud Console](https://console.cloud.google.com)  
✅ حساب Supabase مع مشروع نشط  
✅ التطبيق مُعد باستخدام Expo

---

## 🔧 الخطوات المطلوبة

### 1️⃣ إعداد Google Cloud Console

#### أ) إنشاء مشروع جديد

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. انقر على **Select a project** → **New Project**
3. أدخل اسم المشروع: `Kodax` (أو أي اسم تريده)
4. انقر على **Create**

#### ب) تفعيل Google+ API

1. من القائمة الجانبية، اذهب إلى **APIs & Services** → **Library**
2. ابحث عن `Google+ API`
3. انقر على **Enable**

#### ج) إنشاء OAuth 2.0 Client ID

1. اذهب إلى **APIs & Services** → **Credentials**
2. انقر على **Create Credentials** → **OAuth client ID**
3. إذا طُلب منك، قم بإعداد OAuth consent screen:
   - User Type: **External**
   - App name: `Kodax`
   - User support email: بريدك الإلكتروني
   - Developer contact: بريدك الإلكتروني
   - انقر **Save and Continue**

4. الآن عُد لإنشاء OAuth Client ID:

   **للويب Web Application:**
   - Application type: **Web application**
   - Name: `Kodax Web`
   - Authorized JavaScript origins:
     ```
     http://localhost:8081
     https://yourdomain.com
     ```
   - Authorized redirect URIs:
     ```
     https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
     ```
   - انقر **Create**
   - **احفظ Client ID و Client Secret** ستحتاجهما لاحقاً

   **للأندرويد Android Application:**
   - Application type: **Android**
   - Name: `Kodax Android`
   - Package name: احصل عليه من `app.json` → `android.package` (مثال: `com.kodax.app`)
   - SHA-1 certificate fingerprint: احصل عليه بتشغيل:

     ```bash
     # للتطوير
     cd android
     ./gradlew signingReport

     # أو باستخدام keytool
     keytool -keystore ~/.android/debug.keystore -list -v
     ```

   - انقر **Create**

   **للـ iOS iOS Application:**
   - Application type: **iOS**
   - Name: `Kodax iOS`
   - Bundle ID: احصل عليه من `app.json` → `ios.bundleIdentifier` (مثال: `com.kodax.app`)
   - انقر **Create**

---

### 2️⃣ إعداد Supabase Dashboard

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر مشروعك
3. من القائمة الجانبية: **Authentication** → **Providers**
4. ابحث عن **Google** وفعّله
5. أدخل المعلومات:
   - **Client ID**: الـ Client ID من Google Console (Web Application)
   - **Client Secret**: الـ Client Secret من Google Console
   - **Authorized redirect URIs**: يجب أن يكون:
     ```
     https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
     ```
6. انقر **Save**

---

### 3️⃣ إعداد Deep Linking في التطبيق (للموبايل)

أضف في `app.json`:

```json
{
  "expo": {
    "scheme": "kodax",
    "android": {
      "package": "com.kodax.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "kodax",
              "host": "auth",
              "pathPrefix": "/callback"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "bundleIdentifier": "com.kodax.app",
      "associatedDomains": ["applinks:kodax.app"]
    }
  }
}
```

---

### 4️⃣ إعداد @react-native-google-signin (للموبايل - اختياري)

إذا كنت تريد Native Google Sign-In بدون WebBrowser:

```bash
npx expo install @react-native-google-signin/google-signin
```

ثم في `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
        }
      ]
    ]
  }
}
```

---

## ✅ اختبار التكامل

### على الويب:

1. شغّل التطبيق: `npm start` → اضغط `w` للويب
2. اذهب لصفحة تسجيل الدخول
3. اضغط زر "الدخول بواسطة Google"
4. يجب أن تُفتح نافذة Google OAuth
5. بعد الموافقة، يجب أن تعود للتطبيق وتسجل دخولك تلقائياً

### على الموبايل:

1. شغّل التطبيق: `npm start` → اضغط `a` للأندرويد أو `i` للـ iOS
2. اذهب لصفحة تسجيل الدخول
3. اضغط زر "الدخول بواسطة Google"
4. يجب أن يُفتح المتصفح مع صفحة Google OAuth
5. بعد الموافقة، يجب أن يعود للتطبيق

---

## 🐛 حل المشاكل الشائعة

### ❌ "redirect_uri_mismatch"

**الحل:** تأكد من أن:

- الـ redirect URI في Google Console يطابق **بالضبط** الـ URL في Supabase
- الـ URL في Supabase: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### ❌ "OAuth client not found"

**الحل:** تأكد من:

- تفعيل Google Provider في Supabase
- إدخال Client ID و Client Secret بشكل صحيح
- عدم وجود مسافات زائدة في البداية أو النهاية

### ❌ التطبيق لا يعود بعد المصادقة (موبايل)

**الحل:** تأكد من:

- إعداد الـ `scheme` في `app.json`
- إعداد الـ `intentFilters` (أندرويد) أو `associatedDomains` (iOS)
- إعادة build التطبيق بعد تعديل `app.json`

### ❌ "This app is not verified"

**الحل:**

- في مرحلة التطوير، اضغط "Advanced" → "Go to Kodax (unsafe)"
- للإنتاج، يجب إكمال OAuth Consent Screen Verification في Google Console

---

## 📱 Redirect URIs المطلوبة

حسب البيئة:

| البيئة               | Redirect URI                                            |
| -------------------- | ------------------------------------------------------- |
| **Supabase**         | `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` |
| **Expo Development** | `exp://192.168.x.x:8081` (تلقائي)                       |
| **Expo Go**          | `https://auth.expo.io/@your-username/kodax`             |
| **Standalone App**   | `kodax://auth/callback`                                 |
| **Web (localhost)**  | `http://localhost:8081/auth/callback`                   |
| **Web (production)** | `https://yourdomain.com/auth/callback`                  |

---

## 🔐 أمان الإنتاج

⚠️ **مهم للإنتاج:**

1. **لا تشارك Client Secret أبداً**
2. قم بتحديد Authorized domains في Google Console
3. فعّل Email verification في Supabase
4. استخدم HTTPS فقط في الإنتاج
5. راجع OAuth Consent Screen وأكمل التحقق
6. أضف Privacy Policy و Terms of Service

---

## 📚 مصادر إضافية

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)

---

## ✨ الملفات المعدّلة

تم تعديل الملفات التالية لإضافة Google OAuth:

1. **`app/(auth)/login.tsx`**
   - إضافة دالة `handleGoogleSignIn` الفعلية
   - إضافة imports للـ WebBrowser و AuthSession
   - معالجة OAuth flow للويب والموبايل

2. **`app/auth/callback.tsx`** (جديد)
   - صفحة callback للتعامل مع redirect بعد المصادقة
   - استخراج tokens من URL params
   - إنشاء session في Supabase

---

🎉 **مبروك!** تطبيقك الآن يدعم تسجيل الدخول بجوجل!
