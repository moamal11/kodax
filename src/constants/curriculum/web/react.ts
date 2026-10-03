/**
 * منهج web-react-intro — مقدمة React.
 *
 * كان: 15 درساً بمحتوى جيد عموماً، لكن: لا درس للعرض الشرطي والقوائم والمفاتيح (key) رغم
 * استخدامها في كل مثال، ويُستخدم key={i} دون شرح خطره؛ onKeyPress المهمل؛ يوصي بـ
 * Create React App المتوقف رسمياً؛ هيكل مشروع Vite يضع index.html داخل public (خطأ: في
 * Vite يكون في الجذر)؛ درس الاختبار يثبّت Testing Library بلا مشغّل اختبارات ويستخدم jest.fn()
 * في مشروع Vite؛ أمثلة JSX تعيد تعريف نفس الاسم أو تضع <Route> كجمل منفصلة (لا تُترجم).
 */
import type { CoursePlan } from '../types';
import { md } from '../md';

const F = '```';

export const WEB_REACT_PLAN: CoursePlan = {
  courseId: 'web-react-intro',
  course: {
    description:
      'ابنِ واجهات تفاعلية بـ React الحديثة: JSX والمكونات و Props، الحالة والأحداث والقوائم، useEffect و Hooks، التوجيه بـ React Router، Context و Zustand، النماذج، معالجة الأخطاء والاختبار والأداء — مع مشروع متكامل.',
  },
  sections: [
    { title: 'الأساسيات', lessons: ['react-1', 'react-2', 'react-3', 'react-lists'] },
    { title: 'التأثيرات والـ Hooks', lessons: ['react-4', 'react-5', 'react-8'] },
    { title: 'الصفحات والحالة العامة', lessons: ['react-6', 'react-7', 'react-14'] },
    { title: 'النماذج والجودة', lessons: ['react-9', 'react-10', 'react-13'] },
    { title: 'الأداء', lessons: ['react-11', 'react-12'] },
    { title: 'المشروع', lessons: ['react-15'] },
  ],
  contentFixes: {
    'react-1': [
      [
        `### باستخدام Create React App\n${F}bash\nnpx create-react-app my-app\ncd my-app\nnpm start\n${F}`,
        '> ⚠️ ستجد في الشروحات القديمة الأمر create-react-app. هذه الأداة **متوقفة رسمياً** منذ 2025 ولم تعد تُحدَّث؛ استخدم Vite (أعلاه) أو إطاراً مثل Next.js.',
      ],
      [
        `${F}\nmy-app/\n├── node_modules/\n├── public/\n│   └── index.html\n├── src/`,
        `${F}text\nmy-app/\n├── node_modules/\n├── public/            ← ملفات ثابتة تُنسخ كما هي (أيقونات، صور)\n├── index.html         ← في Vite يكون في الجذر وليس داخل public\n├── src/`,
      ],
      [
        "// يتحول إلى:\nconst element = React.createElement('h1', null, 'مرحباً!');",
        "// يتحول إلى (تقريباً):\nconst sameElement = React.createElement('h1', null, 'مرحباً!');",
      ],
    ],
    'react-2': [
      ['// أو Arrow Function\nconst Button = () => {', '// أو Arrow Function\nconst ButtonArrow = () => {'],
      ['// اختصار (بدون return)\nconst Button = () =>', '// اختصار (بدون return)\nconst ButtonShort = () =>'],
      [
        '// استخدام\n<Button />\n<Button text="إرسال" color="green" />\n<Button text="حذف" color="red" size="small" />',
        '// استخدام\nfunction Toolbar() {\n  return (\n    <>\n      <Button />\n      <Button text="إرسال" color="green" />\n      <Button text="حذف" color="red" size="small" />\n    </>\n  );\n}',
      ],
      [`${F}\nsrc/\n├──`, `${F}text\nsrc/\n├──`],
    ],
    'react-3': [['onKeyPress={(e) => e.key === "Enter" && addTodo()}', 'onKeyDown={(e) => e.key === "Enter" && addTodo()}']],
    'react-6': [
      ["import { useParams, useSearchParams } from 'react-router-dom';", "import { Routes, Route, useParams, useSearchParams } from 'react-router-dom';"],
      [
        '// Route\n<Route path="/users/:userId" element={<UserProfile />} />\n<Route path="/products/:category/:id" element={<Product />} />',
        '// المسارات (داخل <Routes>)\nconst routes = (\n  <Routes>\n    <Route path="/users/:userId" element={<UserProfile />} />\n    <Route path="/products/:category/:id" element={<Product />} />\n  </Routes>\n);',
      ],
      ["import { Outlet } from 'react-router-dom';", "import { Routes, Route, Link, Outlet } from 'react-router-dom';"],
      [
        '// Routes\n<Route path="/dashboard" element={<Dashboard />}>\n  <Route index element={<DashboardHome />} />\n  <Route path="profile" element={<Profile />} />\n  <Route path="settings" element={<Settings />} />\n</Route>\n\n// الروابط\n<Link to="/dashboard">الرئيسية</Link>\n<Link to="/dashboard/profile">الملف الشخصي</Link>\n<Link to="/dashboard/settings">الإعدادات</Link>',
        '// المسارات المتداخلة\nconst routes = (\n  <Routes>\n    <Route path="/dashboard" element={<Dashboard />}>\n      <Route index element={<DashboardHome />} />\n      <Route path="profile" element={<Profile />} />\n      <Route path="settings" element={<Settings />} />\n    </Route>\n  </Routes>\n);\n\n// الروابط\nfunction DashboardNav() {\n  return (\n    <nav>\n      <Link to="/dashboard">الرئيسية</Link>\n      <Link to="/dashboard/profile">الملف الشخصي</Link>\n      <Link to="/dashboard/settings">الإعدادات</Link>\n    </nav>\n  );\n}',
      ],
    ],
    'react-13': [
      [
        `## Jest + React Testing Library\n\n${F}bash\nnpm install --save-dev @testing-library/react @testing-library/jest-dom\n${F}`,
        `## Vitest + React Testing Library\n\nفي مشروع Vite نستخدم **Vitest** مشغّلاً للاختبارات (واجهته شبه مطابقة لـ Jest)، و **jsdom** لمحاكاة المتصفح، و **Testing Library** لاختبار المكونات كما يستخدمها المستخدم:\n\n${F}bash\nnpm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom\n${F}\n\n${F}javascript\n// vite.config.js\nimport { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  test: {\n    environment: 'jsdom',\n    globals: true,               // test و expect و vi بلا استيراد\n    setupFiles: './src/setupTests.js',\n  },\n});\n${F}\n\n${F}javascript\n// src/setupTests.js — يضيف toBeInTheDocument وأخواتها\nimport '@testing-library/jest-dom/vitest';\n${F}\n\nأضف إلى package.json: \`"test": "vitest"\` ثم شغّل \`npm test\`. (في مشروع يستخدم Jest تكون الأسماء نفسها مع jest.fn بدل vi.fn.)`,
      ],
      ['  const handleClick = jest.fn();', '  const handleClick = vi.fn();'],
      ["  global.fetch = jest.fn(() => Promise.reject(new Error('Failed')));", "  global.fetch = vi.fn(() => Promise.reject(new Error('Failed')));"],
    ],
    'react-15': [[`${F}\nsrc/\n├── components/`, `${F}text\nsrc/\n├── components/`]],
  },
  newLessons: [
    {
      id: 'react-lists',
      title: 'الأحداث والعرض الشرطي والقوائم',
      description: 'التعامل مع الأحداث، إظهار عناصر حسب شرط (&& و ?: والإرجاع المبكر)، عرض القوائم بـ map، ولماذا key مهم ولماذا لا نستخدم الفهرس',
      language: 'jsx',
      xpReward: 150,
      content: md`
# الأحداث والعرض الشرطي والقوائم

ثلاث مهارات تستخدمها في كل مكوّن تقريباً: الاستجابة لما يفعله المستخدم، وإظهار أشياء حسب الحالة، وعرض قوائم من البيانات.

## الأحداث
\`\`\`jsx
function LikeButton() {
  function handleClick(event) {
    console.log("نقرة على", event.currentTarget);
  }

  return <button type="button" onClick={handleClick}>أعجبني</button>;
}
\`\`\`
- أسماء الأحداث **camelCase**: \`onClick\`، \`onChange\`، \`onSubmit\`، \`onKeyDown\`.
- مرّر **الدالة** نفسها لا نتيجة استدعائها:
  - ✅ \`onClick={handleClick}\`
  - ❌ \`onClick={handleClick()}\` — تُستدعى أثناء الرسم فوراً (وغالباً تسبب حلقة إعادة رسم لا نهائية إن غيّرت الحالة).
- لتمرير معامل استخدم دالة سهمية: \`onClick={() => remove(item.id)}\`.

### منع السلوك الافتراضي
\`\`\`jsx
function SearchForm({ onSearch }) {
  function handleSubmit(e) {
    e.preventDefault();                 // بدونها يعيد المتصفح تحميل الصفحة
    const query = new FormData(e.currentTarget).get("q");
    onSearch(query);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="q" aria-label="بحث" />
      <button type="submit">بحث</button>
    </form>
  );
}
\`\`\`
استخدم \`onSubmit\` على النموذج بدل \`onClick\` على الزر: يعمل مع زر Enter أيضاً.

## العرض الشرطي
### 1) if مع إرجاع مبكر
\`\`\`jsx
function Profile({ user, loading }) {
  if (loading) return <p>جارٍ التحميل…</p>;
  if (!user) return <p>سجّل الدخول أولاً</p>;
  return <h2>مرحباً {user.name}</h2>;
}
\`\`\`
### 2) العامل الثلاثي داخل JSX
\`\`\`jsx
function Status({ online }) {
  return <span>{online ? "متصل 🟢" : "غير متصل"}</span>;
}
\`\`\`
### 3) && لإظهار شيء أو لا شيء
\`\`\`jsx
function Inbox({ messages }) {
  return (
    <div>
      {messages.length > 0 && <p>لديك {messages.length} رسائل</p>}
    </div>
  );
}
\`\`\`
⚠️ **فخ الصفر**: \`{messages.length && <p>...</p>}\` يطبع **0** على الشاشة عندما تكون القائمة فارغة، لأن React يعرض الأرقام. اجعل الطرف الأيسر منطقياً دائماً: \`messages.length > 0 &&\`.

## القوائم بـ map
\`\`\`jsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
\`\`\`
\`map\` تحوّل مصفوفة **بيانات** إلى مصفوفة **عناصر**. ولتصفية قبل العرض: \`todos.filter(t => !t.done).map(...)\`.

## لماذا key؟
عندما تتغير القائمة (إضافة، حذف، إعادة ترتيب)، يستخدم React المفتاح ليعرف **أي عنصر هو أي عنصر** بين الرسم السابق والجديد، فيحدّث فقط ما تغيّر ويحافظ على حالة كل عنصر (نص مكتوب في حقل، تركيز، حركة).

قواعد المفتاح:
- **فريد بين الإخوة** (ليس في الصفحة كلها).
- **ثابت**: نفس العنصر يحمل نفس المفتاح في كل رسم.
- يأتي من **البيانات**: \`id\` من قاعدة البيانات أو \`crypto.randomUUID()\` عند الإنشاء.

### لماذا لا \`key={index}\`؟
إذا حذفت العنصر الأول، يصبح فهرس كل العناصر التالية مختلفاً، فيظن React أن العنصر 0 ما زال موجوداً **وغيّر محتواه** — فتنتقل الحالة الداخلية (نص حقل، مربع اختيار محدد) إلى العنصر الخطأ. الفهرس مقبول فقط لقائمة **ثابتة لا تتغير أبداً** ولا تحتوي حالة.

ولا تولّد المفتاح أثناء الرسم (\`key={Math.random()}\`): مفتاح جديد كل مرة يعني أن React يهدم كل العناصر ويبنيها من جديد.

## التفاف عدة عناصر: Fragment
المكوّن يعيد عنصراً جذرياً واحداً. لتجنب \`div\` إضافي:
\`\`\`jsx
import { Fragment } from "react";

function Glossary({ items }) {
  return (
    <dl>
      {items.map((item) => (
        <Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.meaning}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
\`\`\`
\`<>...</>\` اختصار لـ Fragment، لكنه لا يقبل key — في القوائم استخدم \`<Fragment key>\`.

## تمرين
ابنِ قائمة جهات اتصال: حقل بحث يصفّي الأسماء أثناء الكتابة، رسالة "لا نتائج" عندما تكون القائمة المصفّاة فارغة، وزر حذف لكل جهة يستخدم \`id\` مفتاحاً. جرّب تغيير المفتاح إلى الفهرس، واكتب في حقل داخل العنصر الأول ثم احذفه — لاحظ أين انتقل النص.
`,
      codeExample: `import { useState } from "react";

const INITIAL = [
  { id: "c1", name: "سارة", phone: "0770 111 2222" },
  { id: "c2", name: "عمر", phone: "0780 333 4444" },
  { id: "c3", name: "ليلى", phone: "0750 555 6666" },
];

export default function Contacts() {
  const [contacts, setContacts] = useState(INITIAL);
  const [query, setQuery] = useState("");

  const visible = contacts.filter((c) => c.name.includes(query.trim()));

  function remove(id) {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  function handleAdd(e) {
    e.preventDefault();
    const name = new FormData(e.currentTarget).get("name").trim();
    if (!name) return;
    setContacts((prev) => [...prev, { id: crypto.randomUUID(), name, phone: "—" }]);
    e.currentTarget.reset();
  }

  return (
    <section>
      <h2>جهات الاتصال ({contacts.length})</h2>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ابحث بالاسم"
        aria-label="ابحث بالاسم"
      />

      {visible.length === 0 ? (
        <p>لا توجد نتائج لـ "{query}"</p>
      ) : (
        <ul>
          {visible.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong> — <span dir="ltr">{c.phone}</span>
              <button type="button" onClick={() => remove(c.id)} aria-label={\`حذف \${c.name}\`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd}>
        <input name="name" aria-label="اسم جديد" placeholder="اسم جديد" />
        <button type="submit">إضافة</button>
      </form>
    </section>
  );
}`,
      quiz: {
        question: 'لماذا يُعدّ key={index} خطراً في قائمة يمكن حذف عناصرها؟',
        options: [
          'لأن الفهرس ليس رقماً',
          'لأن الفهارس تتغير بعد الحذف فيربط React الحالة الداخلية بالعنصر الخطأ',
          'لأنه أبطأ في الرسم فقط',
          'لأن React يمنع استخدام الأرقام كمفاتيح',
        ],
        correctAnswer: 1,
        explanation: 'المفتاح يجب أن يكون ثابتاً لنفس العنصر؛ الفهرس يتغير عند الحذف أو الترتيب.',
      },
    },
  ],
};
