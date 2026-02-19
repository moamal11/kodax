# 📋 دليل تنسيق الأكواد في ردود الذكاء الاصطناعي

## ✅ التحسينات المطبقة

### 1. تحسين AIMessageRenderer

- ✨ دعم أفضل لأسماء اللغات (js → javascript, py → python)
- 🎯 كشف ذكي محسّن للغات البرمجة
- 🧹 تنظيف أفضل للأكواد (إزالة المسافات الزائدة)
- 📏 معالجة محسّنة للأسطر الجديدة

### 2. تحسين System Prompts

- 📝 تعليمات واضحة للذكاء الاصطناعي حول كيفية كتابة الكود
- 🏷️ التأكيد على ضرورة تحديد اسم اللغة
- 📋 أمثلة واضحة في كل وضع

---

## 📝 الصيغة الصحيحة للأكواد

### ✅ صحيح - Code Blocks

```javascript
const greeting = () => {
  console.log('مرحباً بيك في Kodax!');
};
```

```python
def greet():
    print("مرحباً بيك في Kodax!")
    return True
```

```java
public class Greeting {
    public static void main(String[] args) {
        System.out.println("مرحباً بيك في Kodax!");
    }
}
```

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "مرحباً بيك في Kodax!" << endl;
    return 0;
}
```

### ✅ صحيح - Inline Code

استخدم `const` بدلاً من `var` في JavaScript.

في Python، استخدم `def` لتعريف الدوال.

---

## ❌ أخطاء شائعة يجب تجنبها

### ❌ خطأ 1: عدم تحديد اللغة

```
const x = 5;
console.log(x);
```

**المشكلة:** لا يوجد اسم لغة بعد الـ ```

### ❌ خطأ 2: مسافات زائدة

```javascript
const x = 5;
```

**المشكلة:** أسطر فارغة كثيرة في البداية والنهاية

### ❌ خطأ 3: استخدام backticks مفردة للأكواد الطويلة

`const greeting = () => { console.log('Hello'); };`

**المشكلة:** يجب استخدام ``` للأكواد متعددة الأسطر

---

## 🎯 كيف يعمل النظام الآن

### 1. **كشف اللغة التلقائي**

```typescript
// detectLanguage() يتعرف على:
- TypeScript: interface, type, enum, as
- JavaScript: const, let, var, function, =>
- Python: def, import, from, print, class
- Java: public class, static void
- C++: #include, std::, cout
- C#: using System, namespace
- HTML: <html>, <div>, <body>
- CSS: .class, #id, @media
- SQL: SELECT, INSERT, UPDATE
- JSON: {...}, [...]
```

### 2. **تطبيع أسماء اللغات**

```typescript
// اختصارات مدعومة:
'js' → 'javascript'
'ts' → 'typescript'
'py' → 'python'
'c++' → 'cpp'
'c#' → 'csharp'
'cs' → 'csharp'
'html' → 'markup'
'xml' → 'markup'
```

### 3. **تنظيف الكود التلقائي**

```typescript
// normalizeCode() ينظف:
- تحويل tabs إلى مسافات
- إزالة non-breaking spaces
- توحيد نهاية الأسطر (Windows/Unix)
- إزالة الأسطر الفارغة من البداية والنهاية
- تحديد الأسطر الفارغة المتتالية بسطرين فقط
```

### 4. **معالجة Inline Code**

```typescript
// يتعرف على الأكواد المضمنة:
استخدم `const` بدلاً من `var`
// الكود بين backticks مفردة يعرض بتنسيق مميز
```

---

## 🎨 التنسيق المرئي

### Code Block

- خلفية داكنة (#0f172a)
- أرقام أسطر
- Syntax highlighting ملون
- Border ناعم
- Scrollable للأكواد الطويلة

### Inline Code

- خلفية بنفسجي شفاف
- Border بنفسجي
- خط monospace
- Padding مريح

---

## 📋 أمثلة على الردود الصحيحة

### مثال 1: شرح كود

````markdown
زين، هاي دالة بسيطة تطبع رسالة:

```javascript
function greet(name) {
  console.log(`مرحبا ${name}!`);
}
```
````

💡 **نصيحة:** استخدم template literals `${}` بدل concatenation.

````

### مثال 2: إصلاح خطأ
```markdown
🐛 **الكود الخاطئ:**
```javascript
const sum = (a, b) => a + b
console.log(sum(5))
````

⚠️ **المشكلة:** ناقص parameter ثاني

✅ **الكود الصحيح:**

```javascript
const sum = (a, b) => a + b;
console.log(sum(5, 3)); // النتيجة: 8
```

````

### مثال 3: مقارنة تحسين
```markdown
❌ **قبل التحسين:**
```javascript
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}
````

✅ **بعد التحسين:**

```javascript
arr.forEach((item) => console.log(item));
```

🚀 **الفائدة:** أقصر وأوضح وأسهل للقراءة

````

---

## 🔧 للمطورين

### كيفية إضافة لغة جديدة

1. **أضف Pattern في detectLanguage:**
```typescript
if (/\b(keyword1|keyword2)\b/.test(trimmedCode)) {
  return 'newlanguage';
}
````

2. **أضف اختصارات في languageMap:**

```typescript
const languageMap: { [key: string]: string } = {
  nl: 'newlanguage',
};
```

3. **أضف دعم في prismLanguages.ts:**

```typescript
import 'prismjs/components/prism-newlanguage';
```

---

## ✨ ملخص التحسينات

| الميزة          | قبل    | بعد               |
| --------------- | ------ | ----------------- |
| كشف اللغة       | بسيط   | ذكي ودقيق         |
| معالجة النص     | أساسية | تنظيف كامل        |
| دعم الاختصارات  | لا     | نعم (js, py, etc) |
| معالجة المسافات | عادي   | محسّن             |
| Inline Code     | بسيط   | محسّن بـ border   |
| System Prompts  | عامة   | واضحة ومفصلة      |

---

## 🎯 نصائح للذكاء الاصطناعي

عند الرد على المستخدم:

1. ✅ **دائماً حدد اسم اللغة:**
   - `javascript بدلاً من `
   - `python بدلاً من `
2. ✅ **استخدم Inline code للكلمات القصيرة:**
   - استخدم `const` بدلاً من `var`
3. ✅ **نظّف الكود قبل الإرسال:**
   - لا تضع أسطر فارغة كثيرة
   - احذف المسافات الزائدة
4. ✅ **استخدم Emojis للوضوح:**
   - 💡 للنصائح
   - ⚠️ للتحذيرات
   - ✅ للصحيح
   - ❌ للخاطئ
   - 🐛 للأخطاء
   - 🚀 للتحسينات

---

## 🎉 النتيجة النهائية

الآن، جميع أكواد الذكاء الاصطناعي تظهر بشكل:

- ✨ منسق وجميل
- 🎨 ملون حسب اللغة
- 📏 مرتب بأرقام أسطر
- 📋 سهل النسخ
- 🔍 واضح وسهل القراءة

---

**تم بواسطة:** Kodax AI Team  
**التاريخ:** 2026-02-08  
**الإصدار:** 2.0
