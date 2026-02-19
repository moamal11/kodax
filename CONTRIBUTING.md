# المساهمة في Kodax

شكراً لاهتمامك بالمساهمة في Kodax! 🎉

## كيف تساهم؟

### 1. Fork المشروع
```bash
# انقر "Fork" في GitHub
```

### 2. Clone المشروع
```bash
git clone https://github.com/YOUR_USERNAME/kodax.git
cd kodax
```

### 3. إنشاء Branch جديد
```bash
git checkout -b feature/amazing-feature
```

### 4. قم بالتغييرات

### 5. Commit
```bash
git add .
git commit -m "✨ Add amazing feature"
```

### 6. Push
```bash
git push origin feature/amazing-feature
```

### 7. افتح Pull Request

## 📝 معايير الكود

### TypeScript
- استخدم TypeScript دائماً
- اكتب types واضحة
- تجنب `any`

### React Native
- استخدم Functional Components
- استخدم Hooks
- اكتب كود قابل لإعادة الاستخدام

### Styling
- استخدم NativeWind (Tailwind)
- اتبع design system الموجود
- Dark mode افتراضي

### Git Commits
استخدم Conventional Commits:
- `✨ feat:` - ميزة جديدة
- `🐛 fix:` - إصلاح bug
- `📝 docs:` - تحديث التوثيق
- `💄 style:` - تغييرات UI
- `♻️ refactor:` - إعادة هيكلة الكود
- `⚡️ perf:` - تحسين الأداء
- `✅ test:` - إضافة اختبارات

مثال:
```
✨ feat: Add AI tutor chat feature
🐛 fix: Fix XP animation glitch
📝 docs: Update README with setup instructions
```

## 🏗️ البنية

### المجلدات
```
app/          - صفحات التطبيق (Expo Router)
src/
  components/ - المكونات
  lib/        - دوال مساعدة
  types/      - TypeScript types
  constants/  - الثوابت
  hooks/      - Custom hooks
```

### التسمية
- Components: PascalCase (e.g., `GlassCard.tsx`)
- Functions: camelCase (e.g., `calculateLevel`)
- Constants: UPPER_SNAKE_CASE (e.g., `XP_PER_LESSON`)

## 🧪 الاختبار

قبل إرسال PR:
1. اختبر على الموبايل والويب
2. تأكد من عدم وجود أخطاء TypeScript
3. تأكد من عمل الـ animations
4. اختبر على أحجام شاشات مختلفة

## 🐛 الإبلاغ عن Bugs

افتح Issue جديد وضمّن:
- وصف واضح للمشكلة
- خطوات إعادة إنتاج المشكلة
- لقطات شاشة (إن أمكن)
- معلومات النظام (OS, Device, Browser)

## 💡 اقتراح ميزات

افتح Issue جديد وضمّن:
- وصف واضح للميزة
- لماذا هذه الميزة مفيدة؟
- mockups أو أمثلة (اختياري)

## 📋 Checklist للـ PR

قبل إرسال Pull Request، تأكد من:
- [ ] الكود يعمل على الموبايل والويب
- [ ] لا توجد أخطاء TypeScript
- [ ] الـ UI يتبع design system
- [ ] الكود موثق بالـ comments (عند الضرورة)
- [ ] commit messages واضحة
- [ ] اختبرت الميزة بشكل كامل

## 🎨 Design Guidelines

### الألوان
- Primary: `#7c3aed` (Purple)
- Secondary: `#3b82f6` (Blue)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)
- Error: `#ef4444` (Red)

### Typography
- العربية: System font
- الإنجليزية: Inter
- Code: Fira Code

### Spacing
استخدم مضاعفات 4:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Border Radius
- sm: 12px
- md: 16px
- lg: 20px
- xl: 24px

## 🌍 الترجمة

نرحب بالمساهمة في الترجمة:
- أضف ملفات اللغة في `src/i18n/`
- استخدم نفس هيكل الـ keys
- اختبر الترجمة في التطبيق

## 📞 التواصل

- Discord: [قريباً]
- Email: [قريباً]
- Twitter: [قريباً]

## 📄 الترخيص

بمساهمتك، توافق على أن يتم ترخيص مساهمتك تحت MIT License.

---

شكراً لمساهمتك! 💜
