/**
 * مناهج تطوير التطبيقات: rn-basics، rn-advanced، flutter-basics، flutter-advanced.
 *
 * كان:
 *  - درسان يتيمان (rn-state-001، rn-navigation-001) مربوطان بدورة react-native-basics غير الموجودة
 *    فلا يظهران لأحد؛ موضوعاهما مكرران جزئياً مع rn-state-005 و rn-navigation-007.
 *  - درس التخزين يستورد AsyncStorage من '@/lib/platformStorage' — مسار داخلي من كود تطبيق Kodax
 *    نفسه، لن يعمل في مشروع المتعلم.
 *  - كتل JSX متتالية بلا مكوّن يحتويها، وكائن أنماط عارٍ، وأمثلة "قبل/بعد" تعيد تعريف نفس الاسم،
 *    و return ( // ... ) فارغ — كلها لا تُترجم إن نُسخت؛ ملفات Redux متعددة في كتلة واحدة.
 *  - flutter-basics: درسان بنفس الترتيب 1، ودرس "فهم الـ Widgets" بعيد عن "Widgets الأساسية".
 *  - مثال Flutter يضبط primarySwatch مع Material 3 (لا أثر لها عملياً؛ الصحيح ColorScheme.fromSeed).
 *  - flutter-advanced: أربعة دروس (المعمارية، Dio، التعريب، الأداء) بشرح من 10–20 سطراً، وترتيب
 *    يضع Riverpod قبل المعمارية.
 * التحقق: JSX يُفحص صياغته بـ esbuild؛ Dart غير متاح في بيئة الفحص فأمثلة Flutter غير مُتحقق منها آلياً.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';

const F = '```';

export const RN_BASICS_PLAN: CoursePlan = {
  courseId: 'rn-basics',
  adopt: ['rn-state-001', 'rn-navigation-001'],
  sections: [
    { title: 'البداية', lessons: ['rn-intro-001', 'rn-setup-002', 'rn-components-003', 'rn-styling-004'] },
    { title: 'المكونات والحالة', lessons: ['rn-props-006', 'rn-state-005', 'rn-state-001', 'rn-hooks-008'] },
    { title: 'التنقل', lessons: ['rn-navigation-007', 'rn-navigation-001'] },
    { title: 'البيانات', lessons: ['rn-api-009', 'rn-storage-010'] },
  ],
  patches: {
    'rn-state-001': {
      title: 'تطبيق عملي: useState و useReducer و Context معاً',
      description: 'مثال متكامل يجمع أدوات الحالة الثلاث في تطبيق واحد، ومتى تختار كلاً منها',
      xpReward: 150,
      content: md`
# تطبيق عملي: useState و useReducer و Context معاً

درست \`useState\` في الدرس السابق. التطبيقات الحقيقية تحتاج ثلاث أدوات بحسب **حجم الحالة** و**من يحتاجها**. المثال الكامل يجمعها في شاشة واحدة: عداد، وقائمة مهام، وسمة (فاتح/داكن) مشتركة.

## 1. useState: حالة بسيطة محلية
\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <Button title={\`العداد: \${count}\`} onPress={() => setCount((c) => c + 1)} />;
}
\`\`\`
- استخدم **التحديث الوظيفي** \`setCount(c => c + 1)\` عندما تعتمد القيمة الجديدة على القديمة: التحديثات تُجمع ولا تُطبق فوراً، و \`setCount(count + 1)\` مرتين متتاليتين يزيد واحداً فقط.
- لا تعدّل الحالة مباشرة (\`todos.push(...)\`): أنشئ نسخة جديدة (\`[...todos, item]\`) وإلا لن يعيد React الرسم.

## 2. useReducer: حالة لها "أفعال" كثيرة
عندما تتغير الحالة بطرق متعددة (إضافة، تبديل، حذف، تعديل، مسح الكل)، تتوزع \`setState\` في كل مكان ويصعب تتبعها. \`useReducer\` يجمع **كل** قواعد التغيير في دالة واحدة نقية:
\`\`\`jsx
function todoReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, { id: \`\${Date.now()}-\${Math.random().toString(36).slice(2)}\`, text: action.text, done: false }];
    case "TOGGLE":
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case "DELETE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}
// const [todos, dispatch] = useReducer(todoReducer, []);
// dispatch({ type: "ADD", text: "تعلم React Native" });
\`\`\`
- المكوّن يصف **ماذا حدث** (\`dispatch({ type: "TOGGLE", id })\`) والمخفِّض يقرر **كيف تتغير الحالة**.
- المخفِّض دالة نقية: لا طلبات شبكة ولا تعديل للحالة القديمة — فيسهل اختباره بلا واجهة.
- المعرّف يجب أن يكون فريداً: \`Date.now()\` وحده يتكرر لعنصرين يُضافان في نفس الملّي ثانية.

## 3. Context: حالة يحتاجها كثيرون
السمة، والمستخدم المسجل، واللغة — تحتاجها شاشات كثيرة متباعدة. تمريرها props عبر خمسة مستويات (prop drilling) مرهق. Context يجعلها متاحة لأي مكوّن تحت المزوّد:
\`\`\`jsx
const ThemeContext = createContext(null);

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  const value = useMemo(() => ({ dark, toggle: () => setDark((d) => !d) }), [dark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme يجب أن يُستخدم داخل ThemeProvider");
  return ctx;
}
\`\`\`
- غلّف القيمة بـ \`useMemo\`: كائن جديد في كل رسم يجعل **كل** المستهلكين يعيدون الرسم.
- الخطاف المخصص \`useTheme\` يعطي رسالة واضحة إن نُسي المزوّد.
- Context ليس مكاناً لكل الحالة: أي تغيير فيه يعيد رسم كل من يستهلكه. ضع فيه ما يتغير نادراً ويحتاجه الجميع.

## أيها أختار؟
| الحالة | الأداة |
|---|---|
| قيمة بسيطة في مكوّن واحد (نص حقل، مفتوح/مغلق) | \`useState\` |
| حالة بأفعال متعددة ومنطق انتقال (سلة، نموذج متعدد الخطوات) | \`useReducer\` |
| بيانات عامة نادرة التغير (السمة، المستخدم، اللغة) | Context (غالباً مع useReducer أو useState داخل المزوّد) |
| حالة كبيرة مشتركة متغيرة كثيراً | مكتبة: Zustand أو Redux Toolkit (دورة React Native المتقدم) |
| بيانات من الخادم (قوائم، تفاصيل) | مكتبة جلب مع تخزين مؤقت: TanStack Query |

## أخطاء شائعة
- وضع كل شيء في Context واحد ضخم فيبطؤ التطبيق كله.
- نسخ props إلى state (\`useState(props.value)\`) ثم استغراب عدم تحديثها.
- حالة مشتقة مخزنة: إن أمكن حسابها من حالة أخرى (\`remaining = todos.filter(...)\`) فاحسبها أثناء الرسم ولا تخزنها.

## تمرين
أضف إلى المثال الكامل فعلين للمخفِّض: \`EDIT\` لتعديل نص مهمة و \`CLEAR_DONE\` لحذف المنجزة. ثم انقل قائمة المهام إلى Context ليعرض شريط علوي عدد المهام المتبقية دون تمرير props.
`,
    },
    'rn-navigation-001': {
      title: 'تطبيق عملي: Stack و Tabs في تطبيق واحد',
      description: 'تطبيق متجر صغير يجمع التنقل المكدس والتبويبات السفلية وتمرير البيانات بين الشاشات',
    },
  },
  codeFixes: {
    'rn-state-001': [['{ id: Date.now(), text: action.text, done: false }', '{ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text: action.text, done: false }']],
  },
  contentFixes: {
    'rn-navigation-001': [['\nexpo install react-native-screens', '\nnpx expo install react-native-screens']],
    'rn-components-003': [
      [
        "import { Text } from 'react-native';\n\n<Text style={{ fontSize: 24, color: '#333' }}>\n  مرحباً بك!\n</Text>\n\n// نص متعدد الأسطر\n<Text numberOfLines={2} ellipsizeMode=\"tail\">\n  نص طويل جداً سيتم قطعه...\n</Text>",
        "import { Text } from 'react-native';\n\nfunction Texts() {\n  return (\n    <>\n      <Text style={{ fontSize: 24, color: '#333' }}>\n        مرحباً بك!\n      </Text>\n\n      {/* نص متعدد الأسطر */}\n      <Text numberOfLines={2} ellipsizeMode=\"tail\">\n        نص طويل جداً سيتم قطعه...\n      </Text>\n    </>\n  );\n}",
      ],
      [
        "import { Image } from 'react-native';\n\n// صورة محلية\n<Image \n  source={require('./assets/logo.png')}\n  style={{ width: 100, height: 100 }}\n/>\n\n// صورة من الإنترنت\n<Image \n  source={{ uri: 'https://example.com/image.jpg' }}\n  style={{ width: 200, height: 200 }}\n  resizeMode=\"cover\"\n/>",
        "import { Image } from 'react-native';\n\nfunction Images() {\n  return (\n    <>\n      {/* صورة محلية */}\n      <Image\n        source={require('./assets/logo.png')}\n        style={{ width: 100, height: 100 }}\n      />\n\n      {/* صورة من الإنترنت: الأبعاد إلزامية */}\n      <Image\n        source={{ uri: 'https://example.com/image.jpg' }}\n        style={{ width: 200, height: 200 }}\n        resizeMode=\"cover\"\n      />\n    </>\n  );\n}",
      ],
    ],
    'rn-styling-004': [
      ["{\n  // ألوان\n  backgroundColor: '#3b82f6',", "const cardStyle = {\n  // ألوان\n  backgroundColor: '#3b82f6',"],
      ['  // ظلال Android\n  elevation: 5,\n}', '  // ظلال Android\n  elevation: 5,\n};'],
    ],
    'rn-props-006': [
      [
        "// استخدام بدون props\n<Button />\n\n// استخدام مع props مخصصة\n<Button title=\"إرسال\" color=\"#10b981\" />",
        "function Actions() {\n  return (\n    <>\n      {/* استخدام بدون props: القيم الافتراضية */}\n      <Button />\n      {/* استخدام مع props مخصصة */}\n      <Button title=\"إرسال\" color=\"#10b981\" />\n    </>\n  );\n}",
      ],
    ],
    'rn-navigation-007': [
      ["// التنقل لشاشة\nnavigation.navigate('ScreenName');", "// داخل أي شاشة: navigation يصل كـ prop (أو من الخطاف useNavigation())\nfunction NavigationExamples({ navigation }) {\n// التنقل لشاشة\nnavigation.navigate('ScreenName');"],
      ["navigation.reset({\n  index: 0,\n  routes: [{ name: 'Home' }],\n});", "navigation.reset({\n  index: 0,\n  routes: [{ name: 'Home' }],\n});\n}"],
    ],
    'rn-storage-010': [
      ["import AsyncStorage from '@/lib/platformStorage';", "// npx expo install @react-native-async-storage/async-storage\nimport AsyncStorage from '@react-native-async-storage/async-storage';"],
      ["const userJSON = await AsyncStorage.getItem('user');\nconst user = userJSON ? JSON.parse(userJSON) : null;", "const userJSON = await AsyncStorage.getItem('user');\nconst savedUser = userJSON ? JSON.parse(userJSON) : null;"],
    ],
  },
};

export const RN_ADVANCED_PLAN: CoursePlan = {
  courseId: 'rn-advanced',
  sections: [
    { title: 'الواجهة التفاعلية', lessons: ['rn-forms-002', 'rn-animations-001'] },
    { title: 'المعمارية والأداء', lessons: ['rn-state-management-003', 'rn-performance-004'] },
    { title: 'الجهاز', lessons: ['rn-native-features-005'] },
  ],
  contentFixes: {
    'rn-forms-002': [['  return (\n    // ... النموذج\n  );', '  return null; // الحقول مع Controller في المثال التالي']],
    'rn-state-management-003': [
      ['\n// store/index.js\n', `\n${F}\n\n${F}javascript\n// store/index.js\n`],
      ['\n// App.js\nimport { Provider }', `\n${F}\n\n${F}javascript\n// App.js\nimport { Provider }`],
      ['\n// الاستخدام\nimport { useSelector, useDispatch }', `\n${F}\n\n${F}javascript\n// الاستخدام في شاشة\nimport { useSelector, useDispatch }`],
      ['    dispatch(fetchUser(1));\n  }, []);', '    dispatch(fetchUser(1));\n  }, [dispatch]);'],
    ],
    'rn-performance-004': [
      ['// ❌ يُعاد رسمه في كل مرة\nconst ExpensiveComponent = ', '// ❌ يُعاد رسمه في كل مرة\nconst SlowList = '],
      ['// ✅ يُعاد رسمه فقط عند تغير props\nconst ExpensiveComponent = React.memo(', '// ✅ يُعاد رسمه فقط عند تغير props\nconst MemoList = React.memo('],
      ['// مع مقارنة مخصصة\nconst ExpensiveComponent = React.memo(', '// مع مقارنة مخصصة\nconst MemoListByLength = React.memo('],
      ['  // ❌ يُحسب في كل render\n  const filteredItems = ', '  // ❌ يُحسب في كل render\n  const filteredSlow = '],
      ['  // ❌ دالة جديدة في كل render\n  const handlePress = ', '  // ❌ دالة جديدة في كل render\n  const handlePressSlow = '],
      [
        "// ❌ سيء - inline styles\n<View style={{ backgroundColor: 'red', padding: 10 }}>\n\n// ✅ جيد - StyleSheet\n<View style={styles.container}>\n\n// ❌ سيء - inline functions\n<TouchableOpacity onPress={() => handlePress(item)}>\n\n// ✅ جيد\nconst handleItemPress = useCallback(() => handlePress(item), [item]);\n<TouchableOpacity onPress={handleItemPress}>\n\n// ❌ سيء - anonymous component\n{items.map(item => <View>{item.name}</View>)}\n\n// ✅ جيد - مكون منفصل\n{items.map(item => <ListItem key={item.id} item={item} />)}",
        "function Row({ item, items, handlePress }) {\n  // ✅ دالة ثابتة بدل دالة جديدة في كل رسم\n  const handleItemPress = useCallback(() => handlePress(item), [item, handlePress]);\n\n  return (\n    <>\n      {/* ❌ سيء: كائن أنماط جديد في كل رسم */}\n      <View style={{ backgroundColor: 'red', padding: 10 }} />\n      {/* ✅ جيد: StyleSheet */}\n      <View style={styles.container} />\n\n      {/* ❌ سيء: دالة سهمية جديدة في كل رسم */}\n      <TouchableOpacity onPress={() => handlePress(item)} />\n      {/* ✅ جيد */}\n      <TouchableOpacity onPress={handleItemPress} />\n\n      {/* ❌ سيء: بلا key ومكوّن مضمّن */}\n      {items.map((i) => <View>{i.name}</View>)}\n      {/* ✅ جيد: مكوّن منفصل مع key */}\n      {items.map((i) => <ListItem key={i.id} item={i} />)}\n    </>\n  );\n}",
      ],
      ['  <FlatList ... />', '  <FlatList data={items} renderItem={renderItem} />'],
    ],
  },
};

export const FLUTTER_BASICS_PLAN: CoursePlan = {
  courseId: 'flutter-basics',
  sections: [
    { title: 'البداية', lessons: ['flutter-intro-001', 'flutter-setup-002', 'flutter-widgets-001', 'flutter-widgets-003'] },
    { title: 'بناء الواجهة', lessons: ['flutter-layout-004', 'flutter-stateful-005', 'flutter-navigation-006'] },
    { title: 'البيانات', lessons: ['flutter-async-007', 'flutter-http-008', 'flutter-storage-009', 'flutter-provider-010'] },
  ],
  patches: {
    'flutter-widgets-001': { title: 'شجرة الـ Widgets: Stateless و Stateful' },
  },
  codeFixes: {
    'flutter-widgets-001': [['primarySwatch: Colors.deepPurple,', 'colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple), // primarySwatch لا أثر لها عملياً مع Material 3']],
  },
};

export const FLUTTER_ADVANCED_PLAN: CoursePlan = {
  courseId: 'flutter-advanced',
  sections: [
    { title: 'المعمارية والحالة', lessons: ['flutter-architecture-004', 'flutter-riverpod-001'] },
    { title: 'الشبكة والجودة', lessons: ['flutter-dio-005', 'flutter-testing-003'] },
    { title: 'التجربة والإطلاق', lessons: ['flutter-animations-002', 'flutter-localization-006', 'flutter-performance-007'] },
  ],
  patches: {
    'flutter-architecture-004': {
      content: md`
# المعمارية النظيفة (Clean Architecture) في Flutter

تطبيق صغير يعمل جيداً بكل شيء داخل الـ Widgets. لكن عندما يكبر: شاشة تستدعي API مباشرة، وتحفظ في قاعدة بيانات، وتحسب الأسعار، وتعرض النتائج — يصبح أي تعديل مخيفاً ولا يمكن اختبار المنطق دون تشغيل الواجهة. المعمارية تحدد **من يعرف من**.

## الطبقات الثلاث وقاعدة الاعتماد
\`\`\`text
Presentation (Widgets + إدارة الحالة)
        │ تعتمد على
        ▼
Domain (الكيانات + حالات الاستخدام + واجهات المستودعات)   ← لا تعرف Flutter ولا HTTP
        ▲ تنفّذ واجهاتها
        │
Data (نماذج JSON + مصادر البيانات + تنفيذ المستودعات)
\`\`\`
**قاعدة الاعتماد**: الطبقات الخارجية تعتمد على الداخلية، لا العكس. Domain في المركز ولا يستورد شيئاً من Data أو Flutter؛ لذلك يمكن اختباره بـ Dart نقي وبسرعة.

## مكونات كل طبقة
| الطبقة | المكوّن | المثال |
|---|---|---|
| Domain | **Entity** | \`User\` — كائن العمل النقي |
| Domain | **Repository (واجهة)** | \`abstract class UserRepository\` — "ماذا" نحتاج دون "كيف" |
| Domain | **Use Case** | \`GetUser\` — عملية عمل واحدة |
| Data | **Model** | \`UserModel\` مع \`fromJson\`/\`toJson\` |
| Data | **Data Source** | \`UserRemoteDataSource\` (HTTP)، \`UserLocalDataSource\` (تخزين محلي) |
| Data | **Repository (تنفيذ)** | يقرر: من الشبكة أم من الذاكرة المحلية؟ ويحوّل الاستثناءات إلى أخطاء مفهومة |
| Presentation | الحالة | Riverpod/Bloc يستدعي Use Cases ويعرض النتيجة |

## الأخطاء كقيم: Either
المثال الكامل يعيد \`Either<Failure, User>\` (من حزمة **dartz** أو **fpdart**): إما فشل معروف النوع أو نتيجة — بدل رمي استثناءات تعبر الطبقات. الواجهة تُجبر على معالجة الحالتين:
\`\`\`dart
final result = await getUser('42');
result.fold(
  (failure) => showError(failure.message),
  (user) => showProfile(user),
);
\`\`\`
أضف إلى pubspec: \`dartz\` (أو \`fpdart\`)، وعرّف \`Failure\` في \`core/error\`.

## حقن الاعتماديات
المستودع يحتاج مصدر بيانات، وحالة الاستخدام تحتاج المستودع. بدل إنشائها داخل الـ Widgets، نسجّلها في مكان واحد (\`get_it\` أو Providers في Riverpod) ونمرر **الواجهات**. في الاختبارات نمرر تنفيذاً وهمياً.

## هل أحتاج كل هذا؟
لا دائماً. تطبيق من ثلاث شاشات لا يحتاج 15 مجلداً. ابدأ بفصل بسيط: **واجهة / منطق / بيانات**، وأضف الطبقات عندما يكبر التطبيق ويكثر المطورون. التنظيم **حسب الميزة** (\`features/auth\`، \`features/cart\`) أفضل من حسب النوع عند الكبر.

## تمرين
أضف إلى المثال حالة استخدام \`GetAllUsers\` واكتب لها اختباراً بـ Dart نقي يمرر مستودعاً وهمياً يعيد قائمة ثابتة — دون أي Widget.
`,
    },
    'flutter-dio-005': {
      content: md`
# Dio و HTTP المتقدم

حزمة \`http\` تكفي للطلبات البسيطة. **Dio** يضيف ما تحتاجه التطبيقات الحقيقية: إعدادات مشتركة، اعتراض الطلبات، إلغاؤها، رفع الملفات مع التقدم، ومعالجة أخطاء موحدة.

## الإعداد
\`\`\`yaml
dependencies:
  dio: ^5.4.0
\`\`\`
أنشئ **نسخة واحدة** من Dio للتطبيق (عبر حقن الاعتماديات) بإعدادات أساسية: \`baseUrl\`، مهلات الاتصال والاستقبال، والترويسات المشتركة. إنشاء Dio جديد لكل طلب يضيّع إعدادات الـ Interceptors.

## Interceptors: منطق مشترك لكل الطلبات
| النوع | الاستخدام النموذجي |
|---|---|
| \`onRequest\` | إضافة رمز الدخول \`Authorization: Bearer ...\`، اللغة |
| \`onResponse\` | تسجيل، تحويل موحد |
| \`onError\` | تجديد الرمز عند 401 ثم إعادة الطلب، تحويل الأخطاء لرسائل مفهومة |

⚠️ لا تطبع الترويسات أو أجسام الطلبات في سجلات الإنتاج: قد تحتوي رموز الدخول وكلمات المرور. فعّل المسجّل في وضع التطوير فقط (\`kDebugMode\`).

## أنواع الأخطاء (Dio 5)
| \`DioExceptionType\` | المعنى | رسالة للمستخدم |
|---|---|---|
| \`connectionTimeout\` / \`receiveTimeout\` | الشبكة بطيئة | "الاتصال بطيء، حاول مجدداً" |
| \`connectionError\` | لا إنترنت أو الخادم غير متاح | "تحقق من اتصالك" |
| \`badResponse\` | رد بحالة 4xx/5xx | حسب الحالة: 401 ← تسجيل دخول، 404 ← غير موجود |
| \`cancel\` | ألغينا الطلب بأنفسنا | لا شيء |

حوّل هذه الأنواع في طبقة Data إلى \`Failure\` خاصة بتطبيقك (درس المعمارية) — الواجهة لا يجب أن تعرف Dio.

## الإلغاء
\`CancelToken\` يلغي طلباً لم يعد مطلوباً (المستخدم غادر الشاشة، أو كتب حرفاً جديداً في البحث). يمنع تحديث حالة شاشة أُغلقت ويوفر البيانات.

## رفع الملفات مع التقدم
\`FormData\` و \`MultipartFile.fromFile\` مع \`onSendProgress: (sent, total) {...}\` لعرض شريط تقدم.

## إعادة المحاولة بحكمة
أعد المحاولة للأخطاء المؤقتة فقط (مهلة، 503) وبتأخير متزايد (1ث، 2ث، 4ث). **لا** تعِد تلقائياً طلبات غير آمنة التكرار مثل الدفع (POST) دون مفتاح منع التكرار.

## تمرين
أضف إلى المثال Interceptor يعيد المحاولة مرتين لأخطاء المهلة فقط، و CancelToken لحقل بحث يلغي الطلب السابق عند كل حرف جديد.
`,
    },
    'flutter-localization-006': {
      content: md`
# التعريب وتعدد اللغات

تطبيق عربي حقيقي يحتاج أكثر من ترجمة النصوص: الاتجاه من اليمين لليسار، صيغ الجمع العربية الست، وتنسيق التواريخ والأرقام والعملات.

## خياران رئيسيان
| الأداة | المزايا |
|---|---|
| **flutter_localizations + gen-l10n** (الرسمي) | ملفات ARB، توليد كود آمن الأنواع (\`AppLocalizations.of(context).welcome\`)، مدعوم من فريق Flutter |
| **easy_localization** (المثال الكامل) | ملفات JSON، إعداد أسرع، تبديل اللغة أثناء التشغيل بسهولة |

كلاهما يحتاج تفعيل \`flutter_localizations\` في MaterialApp (\`localizationsDelegates\` و \`supportedLocales\`) لتُترجم مكونات Material نفسها (أزرار الحوار، منتقي التاريخ).

## RTL: ما يحدث تلقائياً وما لا يحدث
عند اختيار لغة عربية، يضبط MaterialApp الاتجاه \`TextDirection.rtl\` تلقائياً:
- \`Row\` تبدأ من اليمين، و \`ListTile\` تعكس leading/trailing، وأيقونة الرجوع تنقلب.
- استخدم \`EdgeInsetsDirectional.only(start: 16)\` بدل \`EdgeInsets.only(left: 16)\`، و \`AlignmentDirectional.centerStart\` بدل \`Alignment.centerLeft\`، و \`PositionedDirectional\`.
- ما **لا** ينقلب تلقائياً: الصور والأيقونات الاتجاهية المخصصة (اعكسها شرطياً حسب \`Directionality.of(context)\`)، والرسوم البيانية.

## صيغ الجمع العربية
العربية لها ست فئات جمع: zero (0)، one (1)، two (2)، few (3–10)، many (11–99)، other (100 فأكثر وغيرها). لهذا يحتوي ملف ar.json في المثال على المفاتيح الست، بينما الإنجليزية تكفيها one و other:
\`\`\`text
0 ← لا توجد عناصر     1 ← عنصر واحد     2 ← عنصران
5 ← 5 عناصر          11 ← 11 عنصراً    100 ← 100 عنصر
\`\`\`
لا تبنِ الجمل بلصق الكلمات ("عدد" + n + "عناصر") — اترك صيغة الجمع لنظام الترجمة.

## التواريخ والأرقام
حزمة \`intl\`: \`DateFormat.yMMMMd('ar')\` يعطي "1 أكتوبر 2026"، و \`NumberFormat.currency(locale: 'ar_IQ', symbol: 'د.ع')\` للعملة. قرر بوعي: أرقام عربية مشرقية (٠١٢) أم غربية (012)؟ كثير من التطبيقات العربية تستخدم الغربية للوضوح.

## نصائح
- لا نصوص ثابتة داخل الـ Widgets: كل نص من ملفات الترجمة.
- مفاتيح وصفية (\`checkout_pay_button\`) لا (\`text1\`).
- اختبر كل شاشة بالعربية **والإنجليزية**: النصوص العربية والألمانية تختلف أطوالها وتكسر التخطيطات الضيقة.

## تمرين
أضف للمثال مفتاح \`days_left\` بصيغ الجمع العربية الست، واعرضه لـ 0 و 1 و 2 و 7 و 15 و 100 يوماً. ثم استبدل كل \`EdgeInsets.only(left/right)\` في تطبيقك بالنسخة الاتجاهية.
`,
    },
    'flutter-performance-007': {
      content: md`
# تحسين الأداء في Flutter

الهدف: **60 إطاراً في الثانية** (أو 120 على الشاشات الحديثة)، أي نحو 16 ملّي ثانية لبناء ورسم كل إطار. إذا تجاوزها إطار، يشعر المستخدم بـ"تقطيع" (jank).

## قِس قبل أن تحسّن
- شغّل في **وضع Profile** (\`flutter run --profile\`) على **جهاز حقيقي** — وضع Debug أبطأ بكثير ولا يمثل الواقع.
- **Flutter DevTools**: Performance (الإطارات البطيئة وسببها: بناء أم رسم)، وCPU Profiler، وMemory، وWidget rebuild counts.
- Performance Overlay يعرض مخططي خيط الواجهة وخيط الرسم مباشرة على الشاشة.

## 1. قلل إعادة البناء
- \`const\` للـ Widgets الثابتة: Flutter يعيد استخدامها ولا يبنيها مجدداً.
- **فصل الـ Widgets**: \`setState\` يعيد بناء الـ Widget كاملاً بما تحته. انقل الجزء المتغير إلى Widget صغير خاص به، فلا يُعاد بناء الأجزاء الثقيلة (المثال الكامل يقارن الحالتين).
- مع Provider/Riverpod استمع لأصغر جزء تحتاجه (\`select\`، \`Consumer\` في أدنى مستوى) بدل مراقبة كائن كبير في أعلى الشجرة.

## 2. القوائم الطويلة
- \`ListView.builder\` / \`GridView.builder\`: تبني العناصر **الظاهرة فقط**. \`ListView(children: [...])\` مع ألف عنصر يبنيها كلها.
- \`itemExtent\` أو \`prototypeItem\` عندما تتساوى الارتفاعات: حساب التمرير أسرع.
- تجنب القوائم المتداخلة مع \`shrinkWrap: true\` — تلغي البناء الكسول؛ استخدم \`CustomScrollView\` و Slivers.

## 3. الصور
- لا تعرض صورة 4000×3000 في مربع 100×100: حدد \`cacheWidth\`/\`cacheHeight\` لتُفك الصورة بحجم العرض.
- \`cached_network_image\` لتخزين صور الشبكة.

## 4. العمليات الثقيلة خارج خيط الواجهة
تحليل JSON ضخم أو معالجة صور في خيط الواجهة يجمّد الشاشة. انقلها إلى Isolate بـ \`Isolate.run(() => ...)\` (أو \`compute\`).

## 5. الرسم المكلف
- \`Opacity\` و \`ClipPath\` و الظلال الكثيرة مكلفة، خاصة داخل الحركات؛ لشفافية صورة استخدم لوناً بشفافية أو \`FadeTransition\`.
- \`RepaintBoundary\` حول جزء يتحرك كثيراً (مؤشر، رسم متحرك) يمنع إعادة رسم ما حوله.

## 6. حجم التطبيق وبدء التشغيل
- \`flutter build apk --analyze-size\` لمعرفة ما يضخم التطبيق.
- أجّل تحميل ما لا يلزم في الشاشة الأولى.

## أخطاء شائعة
- إنشاء كائنات مكلفة (Controllers، Streams، تنسيقات) داخل \`build()\` — تُعاد مع كل بناء؛ أنشئها في \`initState\` وتخلّص منها في \`dispose\`.
- نسيان \`dispose\` لـ AnimationController و TextEditingController — تسرب ذاكرة.
- مفاتيح (Keys) مفقودة في القوائم القابلة لإعادة الترتيب.

## تمرين
شغّل تطبيقك في وضع Profile وافتح DevTools، وابحث عن أكثر Widget يُعاد بناؤه. افصله أو اجعله const وقارن عدد مرات البناء قبل وبعد.
`,
    },
  },
};
