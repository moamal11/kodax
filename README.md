# Kodax - منصة تعليم البرمجة بالذكاء الاصطناعي

منصة تعليمية متقدمة لتعلم البرمجة باستخدام الذكاء الاصطناعي، مصممة خصيصاً للسوق العراقي والعالمي.

## 🚀 المميزات

- **تطبيق موبايل + ويب** بنفس الكود باستخدام React Native Web
- **AI Tutor ذكي** يساعد في التعلم والتصحيح
- **Gamification قوي** مع XP، Levels، وBadges
- **محرر أكواد متقدم** مع إمكانية النشر
- **تحديات يومية وأسبوعية**
- **تصنيف حسب المحافظة**
- **تصميم Glass UI** مع Dark Mode

## 🛠️ التقنيات المستخدمة

### Frontend
- **Expo SDK** - بيئة التطوير
- **React Native** - للموبايل
- **React Native Web** - للويب
- **TypeScript** - للنوع الآمن
- **NativeWind** - Tailwind CSS للـ React Native
- **Reanimated 3** - للأنيميشن
- **Expo Router** - للتنقل

### Backend
- **Supabase** - Database, Auth, Storage
- **Next.js** (قريباً) - للـ SSR والـ API Routes

### AI
- **GPT-5.2** (قريباً) - الذكاء الاصطناعي

## 📦 التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- npm أو yarn
- Expo CLI

### خطوات التشغيل

1. **استنساخ المشروع**
```bash
git clone <repository-url>
cd kodax
```

2. **تثبيت الحزم**
```bash
npm install
```

3. **إعداد Environment Variables**
```bash
cp .env.example .env
# قم بتعديل ملف .env وأضف مفاتيح Supabase الخاصة بك
```

4. **تشغيل المشروع**
```bash
# للموبايل والويب معاً
npm start

# للويب فقط
npm run web

# للأندرويد
npm run android

# للـ iOS (يتطلب macOS)
npm run ios
```

## 📁 هيكل المشروع

```
kodax/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # صفحات التطبيق الرئيسية
│   │   ├── index.tsx      # الصفحة الرئيسية
│   │   ├── learn.tsx      # صفحة التعليم
│   │   ├── ai.tsx         # صفحة الذكاء
│   │   ├── code.tsx       # صفحة الأكواد
│   │   └── profile.tsx    # صفحة البروفايل
│   ├── (auth)/            # صفحات المصادقة
│   └── _layout.tsx        # Layout الرئيسي
├── src/
│   ├── components/        # المكونات
│   │   ├── ui/           # مكونات الواجهة
│   │   └── gamification/ # مكونات الـ Gamification
│   ├── lib/              # الدوال المساعدة
│   ├── types/            # TypeScript types
│   ├── constants/        # الثوابت
│   └── hooks/            # Custom hooks
├── assets/               # الصور والملفات
└── package.json
```

## 🎨 التصميم

- **Dark Mode** افتراضي
- **Glass UI** مع Blur Effects
- **Micro-interactions** في كل مكان
- **Custom Components** - لا Material UI
- **Animations** باستخدام Reanimated 3

## 🎮 نظام الـ Gamification

### XP System
- كل درس: 100 XP
- تحدي عادي: 250 XP
- تحدي يومي: 500 XP

### Levels
- المستوى = floor(sqrt(XP / 100))
- كل level يفتح مميزات جديدة

### Badges
- شارات مختلفة للإنجازات
- Animation خاص عند الحصول على شارة

## 🗄️ قاعدة البيانات (Supabase)

### الجداول الرئيسية
- `users` - معلومات المستخدمين
- `profiles` - الملفات الشخصية
- `lessons` - الدروس
- `challenges` - التحديات
- `user_progress` - تقدم المستخدمين
- `code_snippets` - الأكواد المنشورة
- `leaderboards` - التصنيف

## 🔐 المصادقة (Auth)

- Email + Password
- Google OAuth
- نفس الحساب يشتغل على الموبايل والويب

## 🚧 قيد التطوير

- [ ] محرر الأكواد (Monaco Editor)
- [ ] تكامل AI (GPT-5.2)
- [ ] نظام الدفع (اشتراكات)
- [ ] Admin Panel
- [ ] Next.js للويب
- [ ] Push Notifications
- [ ] Social Features (متابعة، تعليقات)

## 📱 الدعم

- iOS
- Android
- Web (PWA)

## 👥 المساهمة

المشروع مفتوح للمساهمات! يرجى فتح Issue أو Pull Request.

## 📄 الترخيص

MIT License

## 📞 التواصل

لأي استفسارات أو اقتراحات، يرجى التواصل معنا.

---

**صُنع بـ ❤️ في العراق**
