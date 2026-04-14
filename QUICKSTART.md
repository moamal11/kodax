# دليل التشغيل السريع

## 🚀 البدء السريع

### 1. تثبيت الحزم
```bash
npm install
```

### 2. إعداد Environment Variables
```bash
# انسخ ملف .env.example
cp .env.example .env

# افتح .env وأضف قيمك
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. تشغيل المشروع

#### للتطوير (Expo Go)
```bash
npm start
```
ثم اختر:
- اضغط `w` للويب
- اضغط `a` للأندرويد
- اضغط `i` للـ iOS
- امسح QR code بتطبيق Expo Go

#### للويب فقط
```bash
npm run web
```

#### للأندرويد
```bash
npm run android
```

#### للـ iOS (يتطلب macOS)
```bash
npm run ios
```

## 📱 اختبار على الجوال

### Android
1. ثبت [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent) من Play Store
2. شغل `npm start`
3. امسح QR code باستخدام Expo Go

### iOS
1. ثبت [Expo Go](https://apps.apple.com/app/expo-go/id982107779) من App Store
2. شغل `npm start`
3. امسح QR code باستخدام الكاميرا

## 🌐 اختبار على الويب

```bash
npm run web
```
سيفتح المتصفح تلقائياً على `http://localhost:8081`

## 🔧 حل المشاكل

### مشكلة في تثبيت الحزم
```bash
# امسح node_modules
rm -rf node_modules

# امسح الـ cache
npm cache clean --force

# أعد التثبيت
npm install
```

### مشكلة في Metro bundler
```bash
# امسح الـ cache
npx expo start -c
```

### مشكلة في TypeScript
```bash
# تحقق من الأخطاء
npx tsc --noEmit
```

### مشكلة في imports
تأكد من استخدام aliases صحيحة:
- `@/components/*` للمكونات
- `@/lib/*` للدوال المساعدة
- `@/constants/*` للثوابت
- `@/types/*` للـ types

## 📦 Build للإنتاج

### Android APK
```bash
eas build --platform android --profile preview
```

### iOS IPA
```bash
eas build --platform ios --profile preview
```

### Web Build
```bash
npm run build:web
```

## 🧪 اختبار الميزات

### اختبار Animations
- افتح صفحة Home
- لاحظ Hero Card animations
- اضغط على الكروت لرؤية التفاعلات

### اختبار XP System
- في الكود، ابحث عن `XPBar` component
- غيّر قيمة XP لاختبار التحديث

### اختبار Glass UI
- افتح أي صفحة
- لاحظ تأثيرات الـ blur والـ glassmorphism
- جرب على خلفيات مختلفة

## 🎨 تخصيص الألوان

افتح [tailwind.config.js](tailwind.config.js) وغيّر الألوان:

```javascript
colors: {
  'kodax-purple': '#7c3aed', // غيّر هنا
  'kodax-blue': '#3b82f6',
  // ...
}
```

## 📝 إضافة صفحة جديدة

1. أنشئ ملف في `app/(tabs)/`:
```typescript
// app/(tabs)/new-page.tsx
export default function NewPage() {
  return (
    <View>
      <Text>صفحة جديدة</Text>
    </View>
  );
}
```

2. أضف tab في `app/(tabs)/_layout.tsx`:
```typescript
<Tabs.Screen
  name="new-page"
  options={{
    title: 'جديد',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="add" size={size} color={color} />
    ),
  }}
/>
```

## 🔌 إضافة Supabase

1. أكمل setup Supabase (راجع [supabase/SETUP.md](supabase/SETUP.md))
2. استخدم الـ client:

```typescript
import { supabase } from '@/lib/supabase';

// مثال: جلب البيانات
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .single();
```

## 🤖 إضافة AI

قريباً - سيتم إضافة integration مع GPT-5.2

## 📊 المراقبة

### Performance
استخدم React DevTools للمراقبة:
```bash
npm install -g react-devtools
react-devtools
```

### Network
افتح Network tab في Chrome DevTools لمراقبة API calls

## 🆘 الدعم

إذا واجهت أي مشاكل:
1. راجع [README.md](README.md)
2. تحقق من [Issues](https://github.com/your-repo/kodax/issues)
3. اسأل في المجتمع

---

**Happy Coding! 💜**
