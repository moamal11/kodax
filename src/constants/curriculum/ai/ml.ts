/**
 * منهج ai-ml-basics — أساسيات تعلم الآلة.
 *
 * كان: 12 درساً بشرح من 10–20 سطراً (جداول أسماء بلا "لماذا")؛ مثال تحضير البيانات يقرأ
 * data.csv غير موجود، ويستخدم df['age'].fillna(..., inplace=True) الذي لا يعدّل df في pandas 3
 * (Copy-on-Write)؛ الانحدار الخطي يحسب R² على عينة اختبار واحدة (غير معرّف رياضياً: nan)؛
 * KNN يجرّب K=7 على 6 عينات تدريب فقط فيتوقف بخطأ؛ تقسيمات بلا random_state ولا stratify
 * على بيانات صغيرة جداً فتتغير النتائج كل تشغيل؛ "تقييم النماذج" يأتي بعد كل الخوارزميات؛
 * لا ذكر لتسرب البيانات (data leakage) ولا لـ Pipeline؛ معادلات موسومة كـ Python.
 */
import type { CoursePlan } from '../types';
import { md } from '../md';

export const AI_ML_PLAN: CoursePlan = {
  courseId: 'ai-ml-basics',
  course: {
    description:
      'تعلم الآلة عملياً بـ scikit-learn: تحضير البيانات، الانحدار الخطي واللوجستي، التقييم الصحيح و Overfitting، الأشجار والغابات العشوائية و KNN و SVM، التجميع بـ K-Means، و Pipelines لمنع تسرب البيانات — مع مشروع كامل.',
  },
  sections: [
    { title: 'الأساسيات', lessons: ['ml-1', 'ml-2'] },
    { title: 'النماذج الخطية والتقييم', lessons: ['ml-3', 'ml-4', 'ml-10', 'ml-11'] },
    { title: 'خوارزميات التصنيف', lessons: ['ml-5', 'ml-6', 'ml-7', 'ml-8'] },
    { title: 'التعلم بدون إشراف', lessons: ['ml-9'] },
    { title: 'سير العمل والمشروع', lessons: ['ml-pipelines', 'ml-12'] },
  ],
  codeFixes: {
    'ml-5': [['X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25)', 'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)']],
    'ml-6': [['X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)', 'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)']],
    'ml-8': [
      ['n_redundant=0, n_clusters_per_class=1)', 'n_redundant=0, n_clusters_per_class=1, random_state=42)'],
      ['X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)', 'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)'],
    ],
    'ml-10': [['X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)', 'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)']],
    'ml-11': [['X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)', 'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)']],
  },
  patches: {
    'ml-1': {
      description: 'ما تعلم الآلة ومتى نستخدمه، أنواعه الثلاثة، المصطلحات الأساسية، ودورة حياة مشروع ML',
      content: md`
# مقدمة في تعلم الآلة

في البرمجة التقليدية تكتب **القواعد** بنفسك. في تعلم الآلة تعطي الحاسوب **أمثلة**، ويستنتج هو القاعدة.
\`\`\`text
البرمجة التقليدية:  القواعد + البيانات  ← النتائج
تعلم الآلة:        البيانات + النتائج  ← القواعد (النموذج)
\`\`\`
مثال: كشف الرسائل المزعجة. محاولة كتابة قواعد يدوية ("إذا احتوت كلمة مجاني...") تفشل سريعاً. أما بآلاف الرسائل المصنفة سابقاً، فيتعلم النموذج الأنماط بنفسه ويتكيف معها.

## متى نستخدمه؟ ومتى لا؟
| مناسب | غير مناسب |
|---|---|
| القواعد معقدة أو غير معروفة (التعرف على الصور، التنبؤ بالأسعار) | القاعدة بسيطة وواضحة (حساب الضريبة) |
| توجد بيانات كافية وممثلة | لا توجد بيانات، أو البيانات منحازة |
| الخطأ أحياناً مقبول | كل خطأ كارثي ولا يمكن تفسيره |

## الأنواع الثلاثة
| النوع | البيانات | المهمة | أمثلة |
|---|---|---|---|
| **بإشراف** (Supervised) | مدخلات **مع** الإجابات (labels) | **انحدار** (قيمة رقمية) أو **تصنيف** (فئة) | سعر منزل، رسالة مزعجة أم لا |
| **بدون إشراف** (Unsupervised) | مدخلات **بلا** إجابات | اكتشاف بنية: تجميع، تقليل أبعاد | تقسيم العملاء لمجموعات |
| **تعزيزي** (Reinforcement) | مكافآت من التجربة | تعلم سلوك | الألعاب، الروبوتات |

هذه الدورة تركز على التعلم بإشراف وبدون إشراف بمكتبة **scikit-learn**.

## المصطلحات
| المصطلح | المعنى | في الكود |
|---|---|---|
| عينة (sample) | صف واحد: منزل، طالب، رسالة | صف في \`X\` |
| ميزات (features) | خصائص العينة المدخلة | أعمدة \`X\` |
| الهدف (target/label) | ما نريد التنبؤ به | \`y\` |
| التدريب (fit) | تعلم النموذج من البيانات | \`model.fit(X, y)\` |
| التنبؤ (predict) | تطبيق النموذج على بيانات جديدة | \`model.predict(X_new)\` |

اصطلاحاً \`X\` مصفوفة ثنائية الأبعاد (عينات × ميزات) حتى لو كانت ميزة واحدة: \`[[1], [2], [3]]\`، و \`y\` مصفوفة أحادية البعد.

## واجهة scikit-learn الموحّدة
كل النماذج تقريباً تُستخدم بنفس الخطوات — تعلّمها مرة واحدة:
\`\`\`python
from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1], [2], [3], [4], [5]])   # ساعات الدراسة
y = np.array([52, 61, 69, 81, 88])        # الدرجة

model = LinearRegression()   # 1) اختر النموذج
model.fit(X, y)              # 2) درّب
print(model.predict([[6]]))  # 3) تنبأ لبيانات جديدة
\`\`\`

## دورة حياة مشروع ML
1. **فهم المشكلة**: ماذا نتنبأ؟ كيف نقيس النجاح؟
2. **جمع البيانات واستكشافها**.
3. **تحضير البيانات**: قيم ناقصة، نصوص إلى أرقام، تقييس.
4. **تقسيم البيانات**: تدريب واختبار — **قبل** أي شيء يتعلم من البيانات.
5. **التدريب** وتجربة عدة نماذج.
6. **التقييم** على بيانات لم يرها النموذج.
7. **النشر والمراقبة**: البيانات تتغير مع الزمن.

أغلب الوقت في المشاريع الحقيقية يذهب للخطوات 2–3، لا للخوارزمية.

## تمرين
لكل مشكلة حدد النوع (انحدار، تصنيف، تجميع): التنبؤ بدرجة الحرارة غداً، تصنيف صورة كقطة أو كلب، تقسيم مقالات لمواضيع دون تصنيف مسبق، توقع إن كان العميل سيلغي اشتراكه.
`,
    },
    'ml-2': {
      description: 'استكشاف البيانات، معالجة القيم الناقصة، تحويل الفئات (One-Hot)، التقييس، والتقسيم الصحيح دون تسرب بيانات',
      content: md`
# تحضير البيانات

"قمامة تدخل، قمامة تخرج". أفضل خوارزمية لن تنقذ بيانات سيئة. هذا الدرس يغطي الخطوات التي تسبق أي تدريب.

## 1. الاستكشاف أولاً
\`\`\`python
import pandas as pd

df = pd.DataFrame({
    "age": [25, 32, None, 41, 29, 35],
    "city": ["بغداد", "البصرة", "بغداد", "أربيل", None, "البصرة"],
    "income": [700, 1200, 900, 1500, 800, 1100],
    "purchased": [0, 1, 0, 1, 0, 1],
})
print(df.head())
print(df.isna().sum())        # كم قيمة ناقصة في كل عمود
print(df.describe())          # إحصائيات الأعمدة الرقمية
print(df["purchased"].value_counts())   # هل الفئات متوازنة؟
\`\`\`
ابحث عن: قيم ناقصة، قيم شاذة (عمر 250؟)، أعمدة نصية، وعدم توازن الفئات.

## 2. القيم الناقصة
| الطريقة | متى |
|---|---|
| حذف الصفوف \`dropna()\` | النقص قليل جداً وعشوائي |
| التعويض بالمتوسط/الوسيط | أعمدة رقمية (الوسيط أفضل مع القيم الشاذة) |
| التعويض بالأكثر تكراراً | أعمدة فئوية |
| عمود "كان ناقصاً" | عندما يكون النقص نفسه معلومة |

\`\`\`python
import pandas as pd

df = pd.DataFrame({"age": [25, None, 41], "city": ["بغداد", None, "أربيل"]})
df["age"] = df["age"].fillna(df["age"].median())      # أسند النتيجة صراحةً
df["city"] = df["city"].fillna("غير معروف")
print(df)
\`\`\`
⚠️ \`df["age"].fillna(..., inplace=True)\` **لا يعدّل** df في pandas الحديثة (Copy-on-Write) — أسند النتيجة دائماً كما أعلاه.

## 3. النصوص إلى أرقام
النماذج تفهم الأرقام فقط. لعمود مثل المدينة:
- **One-Hot Encoding**: عمود لكل مدينة بقيمة 0 أو 1. الصحيح للفئات **بلا ترتيب**.
- **ترميز ترتيبي**: صغير=0، متوسط=1، كبير=2 — فقط عندما يوجد ترتيب حقيقي.

\`\`\`python
import pandas as pd

df = pd.DataFrame({"city": ["بغداد", "البصرة", "أربيل", "بغداد"]})
print(pd.get_dummies(df, columns=["city"], dtype=int))
\`\`\`
⚠️ تحويل المدن إلى 0 و 1 و 2 (LabelEncoder) يوهم النموذج أن "أربيل > البصرة > بغداد" — علاقة غير موجودة. \`LabelEncoder\` مخصص للهدف \`y\` لا للميزات.

## 4. التقييس (Scaling)
الدخل بالآلاف والعمر بالعشرات: النماذج التي تعتمد على المسافات (KNN، SVM) أو على الانحدار التدريجي ستهتم بالدخل فقط لأن أرقامه أكبر.
| الأداة | الناتج |
|---|---|
| \`StandardScaler\` | متوسط 0 وانحراف معياري 1 (الأكثر استخداماً) |
| \`MinMaxScaler\` | بين 0 و 1 |

الأشجار (Decision Tree، Random Forest) **لا تحتاج** تقييساً.

## 5. التقسيم ومنع تسرب البيانات
\`\`\`python
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np

X = np.array([[25, 700], [32, 1200], [41, 1500], [29, 800], [35, 1100], [50, 2000], [23, 600], [38, 1300]])
y = np.array([0, 1, 1, 0, 1, 1, 0, 1])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)   # fit على التدريب فقط
X_test_s = scaler.transform(X_test)         # transform فقط على الاختبار
print(X_train_s.mean(axis=0).round(2))
\`\`\`
- **قسّم أولاً**، ثم تعلّم أي شيء (المتوسط، المقياس) من **التدريب فقط**. حساب المتوسط على كل البيانات ثم التقسيم يسرّب معلومات من الاختبار إلى التدريب، فتبدو النتائج أفضل مما ستكون في الواقع. هذا اسمه **تسرب البيانات** (data leakage)، وهو من أشهر أخطاء المبتدئين والمحترفين.
- \`random_state\`: يجعل التقسيم قابلاً للتكرار.
- \`stratify=y\`: يحافظ على نسبة الفئات نفسها في التدريب والاختبار.

في درس Pipelines ستتعلم طريقة تجعل منع التسرب تلقائياً.

## تمرين
أضف للبيانات أعلاه عمود "المستوى التعليمي" (ثانوي، بكالوريوس، ماجستير). أي ترميز يناسبه؟ عوّض القيم الناقصة، وحوّل المدينة بـ One-Hot، وقسّم ثم قيّس بالترتيب الصحيح.
`,
      codeExample: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# بيانات صغيرة مكتوبة هنا (في مشروع حقيقي: pd.read_csv("data.csv"))
df = pd.DataFrame({
    "age":       [25, 32, None, 41, 29, 35, 52, 23, 38, None, 45, 30],
    "city":      ["بغداد", "البصرة", "بغداد", "أربيل", None, "البصرة", "بغداد", "أربيل", "البصرة", "بغداد", "أربيل", "بغداد"],
    "income":    [700, 1200, 900, 1500, 800, 1100, 2100, 600, 1300, 950, 1700, 850],
    "purchased": [0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0],
})

print("القيم الناقصة:\\n", df.isna().sum(), "\\n")

# 1) القيم الناقصة — نسند النتيجة (inplace على عمود لا يعمل في pandas الحديثة)
df["age"] = df["age"].fillna(df["age"].median())
df["city"] = df["city"].fillna("غير معروف")

# 2) One-Hot للمدينة (فئات بلا ترتيب)
df = pd.get_dummies(df, columns=["city"], dtype=int)

X = df.drop(columns="purchased")
y = df["purchased"]

# 3) التقسيم أولاً — مع الحفاظ على نسبة الفئات
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

# 4) التقييس: fit على التدريب فقط
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

print("الأعمدة:", list(X.columns))
print(f"التدريب: {len(X_train)} عينة، الاختبار: {len(X_test)} عينة")
print("متوسط ميزات التدريب بعد التقييس:", X_train_s.mean(axis=0).round(2))`,
    },
    'ml-3': {
      description: 'الانحدار الخطي: المعادلة، كيف يجد النموذج أفضل خط (المربعات الصغرى)، الانحدار المتعدد، ومقاييس MAE و RMSE و R²',
      content: md`
# الانحدار الخطي (Linear Regression)

أبسط نموذج للتنبؤ بقيمة **رقمية**: السعر، الدرجة، المبيعات. ومع بساطته، هو خط الأساس الذي يجب أن تتفوق عليه أي خوارزمية أعقد.

## الفكرة
نبحث عن خط يمر "بأقرب ما يمكن" من النقاط:
\`\`\`text
ŷ = w·x + b
ŷ : التنبؤ
w : الميل (كم يزيد ŷ عندما يزيد x بواحد)
b : القاطع (قيمة ŷ عندما x = 0)
\`\`\`
ومع عدة ميزات (المساحة، عدد الغرف، العمر): ŷ = w₁x₁ + w₂x₂ + w₃x₃ + b. كل وزن يقول تأثير ميزته **مع ثبات الأخرى**.

## كيف يجد أفضل خط؟
لكل نقطة **خطأ** = الفعلي − التنبؤ. نريد خطاً يجعل **مجموع مربعات الأخطاء** أصغر ما يمكن (طريقة المربعات الصغرى). التربيع يجعل الأخطاء الكبيرة مكلفة جداً ويمنع الموجب والسالب من إلغاء بعضهما.

\`\`\`python
import numpy as np

x = np.array([50, 80, 100, 120, 150], dtype=float)      # المساحة
y = np.array([155, 236, 305, 352, 458], dtype=float)    # السعر بالألف

# الحل المباشر للميل والقاطع
w = ((x - x.mean()) * (y - y.mean())).sum() / ((x - x.mean()) ** 2).sum()
b = y.mean() - w * x.mean()
print(f"ŷ = {w:.2f}·x + {b:.2f}")
print("تنبؤ لمساحة 130:", round(w * 130 + b, 1))
\`\`\`
هذا ما تفعله \`LinearRegression\` داخلياً (بشكل عام لأي عدد ميزات).

## مقاييس التقييم
| المقياس | المعنى | ملاحظة |
|---|---|---|
| **MAE** | متوسط الخطأ المطلق | بنفس وحدة الهدف: "نخطئ بـ 12 ألفاً في المتوسط" — سهل الشرح |
| **RMSE** | جذر متوسط مربع الخطأ | بنفس الوحدة، ويعاقب الأخطاء الكبيرة أكثر |
| **R²** | نسبة التباين الذي يفسره النموذج | 1 مثالي، 0 = ليس أفضل من التنبؤ بالمتوسط دائماً، وقد يكون **سالباً** |

⚠️ R² يحتاج **عدة** عينات اختبار؛ على عينة واحدة غير معرّف. ولا تقيّم على بيانات التدريب: النموذج رآها.

## افتراضات يجب أن تعرفها
- العلاقة **خطية** تقريباً. إن كانت منحنية، أضف ميزات (x²) أو استخدم نموذجاً آخر.
- حساس **للقيم الشاذة**: منزل واحد بسعر خاطئ (صفر زائد) يميل الخط كله.
- **لا يستقرئ** بأمان خارج مدى بيانات التدريب: تنبؤ لمساحة 1000م² وقد تدربت على 50–150 مجرد تخمين.

## تمرين
شغّل المثال الكامل، ثم أضف منزلاً شاذاً (مساحة 90 وسعر 900) لبيانات التدريب ولاحظ كيف يتغير الميل و MAE. جرّب بعدها \`HuberRegressor\` (أقل حساسية للشواذ).
`,
      codeExample: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(42)

# بيانات مصطنعة واقعية: السعر (بالألف) ≈ 3 × المساحة + 20 + ضوضاء
area = rng.uniform(50, 200, size=60)
price = 3 * area + 20 + rng.normal(0, 25, size=60)
X = area.reshape(-1, 1)   # X يجب أن يكون ثنائي الأبعاد

X_train, X_test, y_train, y_test = train_test_split(X, price, test_size=0.25, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)
print(f"الميل: {model.coef_[0]:.2f} ألف لكل م²، القاطع: {model.intercept_:.1f}")

y_pred = model.predict(X_test)   # التقييم على بيانات لم يرها النموذج
print(f"MAE : {mean_absolute_error(y_test, y_pred):.1f} ألف")
print(f"RMSE: {np.sqrt(mean_squared_error(y_test, y_pred)):.1f} ألف")
print(f"R²  : {r2_score(y_test, y_pred):.3f}  (على {len(y_test)} عينة اختبار)")

for a in [80, 130]:
    print(f"منزل {a}م² ← {model.predict([[a]])[0]:.0f} ألف")`,
    },
    'ml-4': {
      description: 'الانحدار اللوجستي للتصنيف: دالة sigmoid والاحتمالات، حد القرار، والتصنيف متعدد الفئات',
      content: md`
# الانحدار اللوجستي (Logistic Regression)

رغم اسمه، هو نموذج **تصنيف**: ناجح أم راسب، مزعج أم لا، سيشتري أم لا. ويعطي **احتمالاً** لا مجرد فئة.

## لماذا لا نستخدم الانحدار الخطي للتصنيف؟
الخط المستقيم يعطي قيماً مثل −0.4 أو 1.7 — لا معنى لها كاحتمال. نحتاج دالة تضغط أي رقم إلى ما بين 0 و 1.

## دالة Sigmoid
\`\`\`text
σ(z) = 1 / (1 + e^(−z))      حيث z = w·x + b
z كبير موجب ← σ قريبة من 1
z = 0       ← σ = 0.5
z كبير سالب ← σ قريبة من 0
\`\`\`
\`\`\`python
import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

for z in [-6, -2, 0, 2, 6]:
    print(z, round(float(sigmoid(z)), 3))
\`\`\`

## من الاحتمال إلى قرار
الافتراضي: احتمال ≥ 0.5 ← الفئة 1. لكن **حد القرار قابل للتعديل** حسب كلفة الخطأ:
- كشف مرض خطير: خفّض الحد (0.3) لتلتقط حالات أكثر حتى مع إنذارات كاذبة أكثر.
- حظر حساب بتهمة احتيال: ارفع الحد (0.9) لتجنب ظلم المستخدمين.

\`\`\`python
from sklearn.linear_model import LogisticRegression
import numpy as np

X = np.array([[1], [2], [3], [4], [5], [6], [7], [8]])   # ساعات الدراسة
y = np.array([0, 0, 0, 1, 0, 1, 1, 1])                   # نجاح؟
model = LogisticRegression().fit(X, y)

proba = model.predict_proba([[4.5]])[0, 1]
print(f"احتمال النجاح: {proba:.2f}")
print("القرار عند حد 0.5:", int(proba >= 0.5), "| عند حد 0.7:", int(proba >= 0.7))
\`\`\`

## كيف يتعلم؟
لا توجد صيغة مباشرة كما في الانحدار الخطي. النموذج يقلل دالة خسارة اسمها **Log Loss** (Cross-Entropy) تعاقب بشدة التنبؤ الواثق الخاطئ (احتمال 0.99 لفئة خاطئة)، ويصل للأوزان بالتحسين التكراري.

## أكثر من فئتين
\`LogisticRegression\` في scikit-learn يدعم تعدد الفئات مباشرة (يستخدم softmax): أعطه \`y\` بثلاث فئات وسيعيد \`predict_proba\` ثلاثة احتمالات مجموعها 1.

## نقاط قوته
- سريع، وقابل للتفسير: إشارة الوزن تقول هل الميزة تزيد الاحتمال أم تنقصه.
- خط أساس ممتاز لأي مشكلة تصنيف. ابدأ به قبل النماذج المعقدة.
- يستفيد من التقييس، ويطبق Regularization افتراضياً (المعامل \`C\`؛ أصغر = تنظيم أقوى).

## تمرين
في المثال الكامل غيّر حد القرار من 0.5 إلى 0.3 ثم 0.7، ولاحظ كيف تتغير الدقة و Recall (ستفهمهما بالتفصيل في درس التقييم).
`,
      codeExample: `import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, recall_score

rng = np.random.default_rng(0)

# 200 طالب: ساعات الدراسة ونسبة الحضور ← نجاح؟
hours = rng.uniform(0, 10, 200)
attendance = rng.uniform(40, 100, 200)
score = 0.8 * hours + 0.06 * attendance + rng.normal(0, 1.2, 200)
y = (score > 7).astype(int)
X = np.column_stack([hours, attendance])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

model = LogisticRegression()
model.fit(X_train, y_train)

print("الأوزان:", model.coef_.round(3), "— كلاهما موجب: يزيد احتمال النجاح")
proba = model.predict_proba(X_test)[:, 1]

for threshold in [0.3, 0.5, 0.7]:
    pred = (proba >= threshold).astype(int)
    print(f"حد {threshold}: الدقة {accuracy_score(y_test, pred):.2f}، Recall {recall_score(y_test, pred):.2f}")

student = [[5, 85]]
print(f"طالب يدرس 5 ساعات وحضوره 85%: احتمال النجاح {model.predict_proba(student)[0, 1]:.2f}")`,
    },
    'ml-10': {
      description: 'تقييم نماذج التصنيف: مصفوفة الالتباس، Precision و Recall و F1، لماذا تخدع الدقة مع الفئات غير المتوازنة، و Cross-Validation',
      content: md`
# تقييم النماذج

"دقة 99%" قد تعني نموذجاً عديم الفائدة. تخيّل كشف احتيال حيث 1% فقط من العمليات احتيالية: نموذج يقول "سليمة" لكل شيء دقته 99% ولم يكشف احتيالاً واحداً!

## مصفوفة الالتباس (Confusion Matrix)
\`\`\`text
                    التنبؤ: سلبي       التنبؤ: إيجابي
الفعلي: سلبي        TN (صحيح سلبي)     FP (إنذار كاذب)
الفعلي: إيجابي      FN (حالة فائتة)     TP (صحيح إيجابي)
\`\`\`

## المقاييس
| المقياس | الصيغة | السؤال الذي يجيبه |
|---|---|---|
| Accuracy | (TP+TN) / الكل | كم نسبة التنبؤات الصحيحة؟ |
| **Precision** | TP / (TP+FP) | عندما يقول "إيجابي"، كم مرة يصيب؟ |
| **Recall** | TP / (TP+FN) | من كل الحالات الإيجابية الحقيقية، كم التقط؟ |
| **F1** | المتوسط التوافقي للاثنين | توازن بين Precision و Recall |

## أيهما أهم؟ حسب كلفة الخطأ
| المشكلة | الخطأ الأسوأ | ركّز على |
|---|---|---|
| كشف مرض خطير | FN: مريض لم نكتشفه | **Recall** |
| فلتر الرسائل المزعجة | FP: رسالة مهمة ذهبت للمزعج | **Precision** |
| كشف الاحتيال | الاثنان مكلفان | F1، ثم ضبط الحد |

\`\`\`python
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, accuracy_score

y_true = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1]
y_pred = [0, 0, 0, 0, 0, 0, 0, 1, 1, 0]
print(confusion_matrix(y_true, y_pred))
print("Accuracy", accuracy_score(y_true, y_pred), "Precision", precision_score(y_true, y_pred),
      "Recall", recall_score(y_true, y_pred), "F1", f1_score(y_true, y_pred))
\`\`\`

## انتبه: أي فئة هي "الإيجابية"؟
المقاييس تُحسب افتراضياً للفئة 1. في بيانات سرطان الثدي في المثال الكامل، الفئة 1 = **حميد** والفئة 0 = **خبيث** — والحالة المهمة طبياً هي الخبيث. لذلك نحسب Recall للفئة 0 أيضاً (\`pos_label=0\`). اقرأ وصف البيانات دائماً.

## Cross-Validation: تقييم أكثر ثباتاً
تقسيم واحد قد يكون محظوظاً أو سيئ الحظ. في **k-fold** نقسم البيانات إلى k أجزاء، وندرب k مرات، كل مرة نختبر على جزء مختلف، ثم نأخذ المتوسط والانحراف:
\`\`\`text
الدورة 1: [اختبار][تدريب][تدريب][تدريب][تدريب]
الدورة 2: [تدريب][اختبار][تدريب][تدريب][تدريب]
...                                         ← 5 نتائج، نحسب المتوسط
\`\`\`
للتصنيف، scikit-learn يستخدم **StratifiedKFold** تلقائياً (يحافظ على نسبة الفئات).

## القاعدة الذهبية: مجموعة الاختبار مقدسة
استخدم التدريب و Cross-Validation لاختيار النموذج وضبطه، ولا تنظر لنتيجة الاختبار إلا **مرة واحدة في النهاية**. إذا عدّلت النموذج بناءً على نتيجة الاختبار، أصبح الاختبار جزءاً من التدريب ولم يعد يقيس الأداء الحقيقي.

## تمرين
في المثال الكامل احسب Recall للفئة الخبيثة (\`pos_label=0\`)، ثم استخدم \`predict_proba\` وخفّض حد القرار للفئة الخبيثة. كم حالة خبيثة إضافية التقطت؟ وكم إنذاراً كاذباً أضفت؟
`,
    },
    'ml-11': {
      description: 'Underfitting و Overfitting، منحنى التحيز والتباين، وكيف تكشفه وتعالجه: بيانات أكثر، نموذج أبسط، Regularization (Ridge و Lasso)',
      content: md`
# Overfitting و Regularization

## مشكلتان متعاكستان
| | Underfitting (نقص التعلم) | Overfitting (الحفظ) |
|---|---|---|
| ما يحدث | النموذج أبسط من الأنماط الحقيقية | النموذج يحفظ التدريب بما فيه الضوضاء |
| أداء التدريب | ضعيف | ممتاز (قد يكون مثالياً) |
| أداء الاختبار | ضعيف | ضعيف |
| تشبيه | طالب لم يذاكر | طالب حفظ أسئلة السنة الماضية حرفياً |

**العلامة الأوضح لـ Overfitting**: فجوة كبيرة بين أداء التدريب وأداء الاختبار.

## التحيز والتباين (Bias–Variance)
- **تحيز عالٍ**: افتراضات مبسطة جداً (خط مستقيم لبيانات منحنية) ← Underfitting.
- **تباين عالٍ**: النموذج يتغير كثيراً مع أي تغيير صغير في البيانات ← Overfitting.
زيادة تعقيد النموذج تقلل التحيز وتزيد التباين. نبحث عن النقطة المتوازنة. المثال الكامل يرسم ثلاث درجات من كثيرات الحدود: الدرجة 1 (نقص)، 4 (مناسبة)، 15 (حفظ).

## العلاج
| المشكلة | الحلول |
|---|---|
| Underfitting | نموذج أعقد، ميزات أفضل، تنظيم أقل |
| Overfitting | **بيانات أكثر**، نموذج أبسط، ميزات أقل، **Regularization**، إيقاف مبكر (في الشبكات العصبية)، Cross-Validation لاختيار التعقيد |

## Regularization: عقوبة على الأوزان الكبيرة
النموذج الذي يحفظ الضوضاء غالباً يستخدم أوزاناً ضخمة متذبذبة. التنظيم يضيف إلى الخسارة عقوبة على حجم الأوزان:
\`\`\`text
الخسارة الكلية = خطأ التنبؤ + α × حجم الأوزان
Ridge (L2): α × Σ w²     ← يصغّر كل الأوزان، نادراً ما يجعلها صفراً
Lasso (L1): α × Σ |w|    ← يجعل بعض الأوزان صفراً تماماً = اختيار ميزات تلقائي
\`\`\`
\`α\` (\`alpha\`) يتحكم بالقوة: 0 = بلا تنظيم، كبير جداً = Underfitting. اختره بـ Cross-Validation، و**قيّس الميزات** قبل التنظيم (وإلا عوقبت الميزات ذات الأرقام الصغيرة ظلماً).

\`\`\`python
import numpy as np
from sklearn.linear_model import Lasso, Ridge

rng = np.random.default_rng(1)
X = rng.normal(size=(100, 10))
y = 3 * X[:, 0] - 2 * X[:, 1] + rng.normal(0, 0.5, 100)   # ميزتان فقط مفيدتان من عشر

print("Ridge:", Ridge(alpha=1.0).fit(X, y).coef_.round(2))
print("Lasso:", Lasso(alpha=0.1).fit(X, y).coef_.round(2))   # لاحظ الأصفار
\`\`\`

## منحنى التعلم: هل تفيد بيانات أكثر؟
ارسم أداء التدريب والتحقق مع زيادة حجم البيانات (\`learning_curve\` في scikit-learn):
- الفجوة كبيرة والمنحنيان يقتربان ← بيانات أكثر ستفيد (Overfitting).
- المنحنيان منخفضان ومتقاربان ← بيانات أكثر لن تفيد؛ تحتاج نموذجاً أو ميزات أفضل (Underfitting).

## تمرين
في المثال الكامل جرّب قيم alpha مختلفة لـ Ridge على الدرجة 15 (0.001، 0.1، 10) ولاحظ متى يتحسن الاختبار ومتى يسوء. ثم استخدم \`RidgeCV\` ليختار alpha تلقائياً.
`,
    },
    'ml-5': {
      description: 'أشجار القرار: كيف تختار الأسئلة (Gini و Entropy)، قراءة الشجرة وتفسيرها، أهمية الميزات، والتحكم في العمق لمنع الحفظ',
      content: md`
# أشجار القرار (Decision Trees)

شجرة القرار تعمل مثل لعبة "20 سؤالاً": سلسلة أسئلة نعم/لا تقود إلى قرار.
\`\`\`text
                الدخل ≥ 45000؟
               /              \\
            لا                 نعم
            /                    \\
    العمر ≥ 30؟              قرض سابق؟
     /      \\                 /       \\
   رفض    موافقة          موافقة     موافقة
\`\`\`

## كيف تختار السؤال؟
في كل عقدة تجرّب الشجرة كل ميزة وكل نقطة تقسيم، وتختار السؤال الذي يجعل المجموعتين الناتجتين **أنقى** ما يمكن (أغلبها من فئة واحدة). مقاييس النقاء:
- **Gini**: احتمال أن تخطئ لو اخترت عينة عشوائية وصنفتها عشوائياً حسب نسب العقدة. 0 = نقية تماماً.
- **Entropy**: مقدار "الفوضى" بمفهوم نظرية المعلومات.
عملياً يعطيان نتائج متقاربة.

\`\`\`python
def gini(counts):
    total = sum(counts)
    return 1 - sum((c / total) ** 2 for c in counts)

print(gini([10, 0]))   # 0.0 — نقية
print(gini([5, 5]))    # 0.5 — أسوأ حالة لفئتين
print(gini([8, 2]))    # 0.32
\`\`\`

## المميزات
- **قابلة للتفسير**: يمكنك طباعة القواعد وشرح القرار لإنسان (\`export_text\`).
- **لا تحتاج تقييساً** وتتعامل مع العلاقات غير الخطية.
- **أهمية الميزات** (\`feature_importances_\`): كم ساهمت كل ميزة في تحسين النقاء.

## العيب الكبير: الحفظ
شجرة بلا قيود تستمر في التقسيم حتى تصبح كل ورقة عينة واحدة — دقة 100% على التدريب وأداء سيئ على الجديد. أدوات التحكم:
| المعامل | الأثر |
|---|---|
| \`max_depth\` | أقصى عمق |
| \`min_samples_leaf\` | أقل عدد عينات في الورقة |
| \`min_samples_split\` | أقل عدد عينات لتقسيم عقدة |
| \`ccp_alpha\` | تقليم بعد البناء |

\`\`\`python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
for depth in [1, 3, None]:
    t = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_tr, y_tr)
    print(depth, "تدريب", round(t.score(X_tr, y_tr), 2), "اختبار", round(t.score(X_te, y_te), 2))

print(export_text(DecisionTreeClassifier(max_depth=2, random_state=0).fit(X_tr, y_tr),
                  feature_names=["sepal_len", "sepal_wid", "petal_len", "petal_wid"]))
\`\`\`
وعيب آخر: **عدم الاستقرار** — تغيير بسيط في البيانات قد يغيّر الشجرة كلها. الحل في الدرس التالي: الغابات.

## تمرين
في المثال الكامل اطبع القواعد بـ \`export_text\` واشرح بكلماتك لماذا رُفض أحد الطلبات. ثم أزل \`max_depth\` وقارن دقة التدريب والاختبار.
`,
    },
    'ml-6': {
      description: 'الغابات العشوائية: لماذا يتفوق "حكم الجماعة"، Bagging واختيار الميزات العشوائي، أهم المعاملات، و Gradient Boosting باختصار',
      content: md`
# الغابات العشوائية (Random Forest)

شجرة واحدة متقلبة وتميل للحفظ. لكن **مئات** الأشجار المختلفة تصوّت معاً تعطي قراراً أكثر ثباتاً ودقة — مثل سؤال 100 شخص بدل شخص واحد.

## مصدرا العشوائية
1. **Bagging** (Bootstrap Aggregating): كل شجرة تتدرب على عينة عشوائية **مع الإرجاع** من بيانات التدريب (بعض العينات تتكرر وبعضها يُستبعد).
2. **ميزات عشوائية**: عند كل تقسيم، تختار الشجرة من **مجموعة جزئية عشوائية** من الميزات فقط (\`max_features\`).

النتيجة: أشجار **مختلفة** عن بعضها. أخطاؤها لا تتكرر بنفس الشكل، فتلغي بعضها عند التصويت (للتصنيف) أو المتوسط (للانحدار). العشوائية الثانية مهمة: بدونها ستختار كل الأشجار نفس الميزة القوية أولاً وتصبح متشابهة.

## المعاملات المهمة
| المعامل | المعنى | ملاحظة |
|---|---|---|
| \`n_estimators\` | عدد الأشجار | أكثر = أثبت (مع تناقص الفائدة)، ولا يسبب Overfitting، لكنه أبطأ |
| \`max_depth\` | عمق كل شجرة | |
| \`max_features\` | عدد الميزات المرشحة لكل تقسيم | \`"sqrt"\` افتراضي للتصنيف |
| \`n_jobs=-1\` | استخدام كل أنوية المعالج | الأشجار تتدرب بالتوازي |
| \`oob_score=True\` | تقييم مجاني على العينات المستبعدة من كل شجرة | تقدير قريب من Cross-Validation |

\`\`\`python
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier

X, y = load_breast_cancer(return_X_y=True)
forest = RandomForestClassifier(n_estimators=200, oob_score=True, random_state=0, n_jobs=-1)
forest.fit(X, y)
print(f"دقة Out-of-Bag: {forest.oob_score_:.3f}")
\`\`\`

## أهمية الميزات: بحذر
\`feature_importances_\` مفيدة للفهم، لكنها منحازة للميزات الرقمية ذات القيم الكثيرة، وتتوزع بين الميزات المترابطة. للتفسير الأدق استخدم \`permutation_importance\` على بيانات الاختبار.

## Gradient Boosting: الفكرة المعاكسة
بدل أشجار مستقلة بالتوازي، يبني **أشجاراً صغيرة متتالية**: كل شجرة تحاول تصحيح أخطاء ما قبلها. غالباً أدق من الغابة على البيانات الجدولية، لكنه يحتاج ضبطاً أدق (\`learning_rate\`، عدد الأشجار) وقد يحفظ. في scikit-learn: \`HistGradientBoostingClassifier\` (سريع)، وخارجها مكتبات XGBoost و LightGBM المشهورة في المسابقات.

## متى تختار الغابة العشوائية؟
- بيانات جدولية (صفوف وأعمدة) بأي حجم متوسط.
- تريد نتيجة قوية **دون ضبط كثير** — الإعدادات الافتراضية جيدة جداً.
- لا تحتاج تقييساً ولا تتأثر كثيراً بالقيم الشاذة.

## تمرين
في المثال الكامل قارن شجرة واحدة، وغابة بـ 10 أشجار، وغابة بـ 300 شجرة باستخدام \`cross_val_score\` (المتوسط والانحراف المعياري). أيها أكثر ثباتاً؟
`,
    },
    'ml-7': {
      description: 'أقرب الجيران: التصنيف بالتشابه، أهمية التقييس، اختيار K، ومشاكل البيانات الكبيرة والأبعاد الكثيرة',
      content: md`
# أقرب الجيران (K-Nearest Neighbors)

أبسط فكرة في تعلم الآلة: **قل لي من جيرانك، أقل لك من أنت**. لتصنيف نقطة جديدة، ابحث عن أقرب K نقاط في بيانات التدريب، وخذ الفئة الأكثر بينها.

## لا تدريب حقيقي
\`fit\` في KNN مجرد **حفظ** للبيانات. كل العمل يحدث عند \`predict\`: حساب المسافة لكل نقاط التدريب. لذلك التدريب فوري، والتنبؤ بطيء مع البيانات الكبيرة.

## المسافة
\`\`\`python
import numpy as np

a = np.array([170, 65])   # الطول سم، الوزن كغ
b = np.array([160, 70])
print("إقليدية:", np.sqrt(((a - b) ** 2).sum()))
print("مانهاتن:", np.abs(a - b).sum())
\`\`\`

## التقييس إلزامي
إذا كانت ميزة بالآلاف (الدخل) وأخرى بالعشرات (العمر)، فالمسافة يحددها الدخل وحده تقريباً. **قيّس دائماً قبل KNN** (\`StandardScaler\`)، مع fit على التدريب فقط.

## اختيار K
| K | السلوك |
|---|---|
| صغير (1) | حساس للضوضاء: نقطة شاذة واحدة تغيّر القرار ← Overfitting |
| كبير جداً | يتجاهل الأنماط المحلية، ويميل للفئة الأكثر عدداً ← Underfitting |

- اختر K بـ Cross-Validation، لا بالتجربة على الاختبار.
- مع فئتين يُفضل K **فردي** لتجنب التعادل.
- K لا يمكن أن يتجاوز عدد عينات التدريب (المثال الأصلي كان يجرب 7 جيران على 6 عينات فيتوقف بخطأ).
- \`weights="distance"\`: الجيران الأقرب صوتهم أعلى.

\`\`\`python
from sklearn.datasets import load_wine
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_wine(return_X_y=True)
for k in [1, 5, 15]:
    raw = cross_val_score(KNeighborsClassifier(n_neighbors=k), X, y, cv=5).mean()
    scaled = cross_val_score(make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k)), X, y, cv=5).mean()
    print(f"K={k}: بلا تقييس {raw:.2f} | مع تقييس {scaled:.2f}")
\`\`\`
لاحظ الفرق الكبير الذي يصنعه التقييس. (\`make_pipeline\` يضمن أن المقياس يتعلم من جزء التدريب فقط في كل دورة — تفاصيله في درس Pipelines.)

## لعنة الأبعاد
مع مئات الميزات تصبح كل النقاط "بعيدة" عن بعضها بشكل متقارب، فيفقد مفهوم "الأقرب" معناه. KNN يعمل أفضل مع ميزات قليلة نسبياً ومفيدة.

## استخداماته
خط أساس سريع، أنظمة توصية بسيطة ("منتجات مشابهة")، وملء القيم الناقصة (\`KNNImputer\`).

## تمرين
في المثال الكامل استبدل حلقة K بـ \`GridSearchCV\` على قيم K من 1 إلى 15 مع خيار weights، واطبع أفضل إعداد.
`,
      codeExample: `import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(7)

# مجموعتان من العملاء: العمر والدخل الشهري (بالدولار) — مقياسان مختلفان جداً
young = np.column_stack([rng.normal(24, 3, 60), rng.normal(600, 150, 60)])
mature = np.column_stack([rng.normal(45, 6, 60), rng.normal(1400, 300, 60)])
X = np.vstack([young, mature])
y = np.array([0] * 60 + [1] * 60)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
print(f"عينات التدريب: {len(X_train)} — K يجب أن يكون أصغر من هذا العدد")

# اختيار K بـ Cross-Validation على التدريب فقط
for k in [1, 3, 5, 7, 15]:
    pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))
    score = cross_val_score(pipe, X_train, y_train, cv=5).mean()
    print(f"K={k:2d}: دقة CV = {score:.2%}")

best = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5))
best.fit(X_train, y_train)
print(f"\\nدقة الاختبار النهائية (K=5): {best.score(X_test, y_test):.2%}")

new_customer = [[30, 900]]
print(f"عميل عمره 30 ودخله 900 ← الفئة {best.predict(new_customer)[0]}")`,
    },
    'ml-8': {
      description: 'آلات المتجهات الداعمة: الهامش الأقصى، المتجهات الداعمة، المعامل C، و Kernel Trick للحدود غير الخطية',
      content: md`
# آلات المتجهات الداعمة (SVM)

من بين كل الخطوط التي تفصل فئتين، أيها الأفضل؟ SVM يختار الخط الذي يترك **أوسع شارع** بين الفئتين.

## الهامش الأقصى
\`\`\`text
   ○  ○        |   ●  ●
 ○   ○     ·   |   ·    ●  ●
   ○       ·   |   ·  ●
           ←هامش→
\`\`\`
- **الهامش** (margin): المسافة بين الخط وأقرب النقاط من الفئتين.
- **المتجهات الداعمة** (support vectors): هذه النقاط الأقرب. هي وحدها التي تحدد الخط؛ حذف أي نقطة أخرى لا يغيّر شيئاً.
- الهامش الأوسع = تعميم أفضل على البيانات الجديدة.

## البيانات ليست مثالية: المعامل C
في الواقع تتداخل الفئات. SVM يسمح ببعض الأخطاء، و \`C\` يتحكم في التوازن:
| C | السلوك |
|---|---|
| صغير | هامش واسع ويتسامح مع الأخطاء ← تعميم أفضل، قد يصل لـ Underfitting |
| كبير | يحاول تصنيف كل نقطة تدريب صحيحاً ← هامش ضيق، خطر Overfitting |

## Kernel Trick: حدود منحنية
ماذا لو كانت فئة في دائرة داخل الأخرى؟ لا خط مستقيم يفصلهما. الحيلة: تحويل البيانات إلى بعد أعلى حيث يصبح الفصل خطياً — دون حساب التحويل فعلياً.
| النواة | الشكل |
|---|---|
| \`linear\` | خط/مستوى — سريع، جيد للبيانات النصية عالية الأبعاد |
| \`rbf\` (الافتراضي) | حدود مرنة منحنية — معامل \`gamma\` يحدد مدى تأثير كل نقطة |
| \`poly\` | حدود متعددة الحدود |

\`\`\`python
from sklearn.datasets import make_circles
from sklearn.model_selection import cross_val_score
from sklearn.svm import SVC

X, y = make_circles(n_samples=300, noise=0.1, factor=0.4, random_state=0)
for kernel in ["linear", "rbf"]:
    print(kernel, round(cross_val_score(SVC(kernel=kernel), X, y, cv=5).mean(), 2))
\`\`\`
النواة الخطية تفشل (قرابة 50%) والـ rbf تنجح — لأن الحد الحقيقي دائرة.

## ملاحظات عملية
- **التقييس ضروري** (مسافات وهوامش).
- اضبط \`C\` و \`gamma\` معاً بـ \`GridSearchCV\` على مقياس لوغاريتمي (0.01، 0.1، 1، 10، 100).
- بطيء مع مئات الآلاف من العينات؛ هناك \`LinearSVC\` الأسرع للحالة الخطية.
- لا يعطي احتمالات افتراضياً؛ \`probability=True\` يضيفها بكلفة تدريب إضافية.

## تمرين
في المثال الكامل استبدل حلقتي kernel و C بـ \`GridSearchCV\` على C و gamma، واطبع أفضل معاملات ودقتها.
`,
    },
    'ml-9': {
      description: 'التجميع بـ K-Means: الخوارزمية خطوة بخطوة، اختيار K بالكوع و Silhouette، التقييس، وحدود الطريقة',
      content: md`
# التجميع بـ K-Means

في التعلم بدون إشراف لا توجد إجابات. نريد أن يكتشف النموذج **مجموعات طبيعية** في البيانات: شرائح العملاء، أنواع المقالات، أنماط الاستخدام.

## الخوارزمية
1. اختر K مراكز عشوائية.
2. **التعيين**: كل نقطة تنضم لأقرب مركز.
3. **التحديث**: كل مركز ينتقل إلى متوسط نقاط مجموعته.
4. كرر 2 و 3 حتى تتوقف المراكز عن الحركة.

\`\`\`python
import numpy as np

rng = np.random.default_rng(0)
X = np.vstack([rng.normal([0, 0], 0.5, (20, 2)), rng.normal([4, 4], 0.5, (20, 2))])
centers = X[[0, 25]].copy()                       # بداية: نقطتان من البيانات

for step in range(5):
    dists = np.linalg.norm(X[:, None, :] - centers[None, :, :], axis=2)
    labels = dists.argmin(axis=1)                 # التعيين
    centers = np.array([X[labels == k].mean(axis=0) for k in range(2)])   # التحديث
    print(step, centers.round(2).tolist())
\`\`\`
هذا هو K-Means كاملاً في عشرة أسطر. \`KMeans\` في scikit-learn يضيف بداية ذكية (k-means++) وتكرارات متعددة من بدايات مختلفة (\`n_init\`) ويأخذ الأفضل.

## اختيار K
لا توجد إجابة "صحيحة"، لكن هناك أدوات:
- **طريقة الكوع**: ارسم **inertia** (مجموع مربعات المسافات للمراكز) مقابل K. تنخفض دائماً، لكن ابحث عن النقطة التي يتوقف بعدها الانخفاض الكبير.
- **Silhouette**: لكل نقطة، كم هي قريبة من مجموعتها مقارنة بالمجموعة التالية (من −1 إلى 1، أعلى أفضل). أوضح من الكوع غالباً.
- **المعنى العملي**: 4 شرائح عملاء يستطيع فريق التسويق التعامل معها قد تكون أفضل من 9 "أمثل رياضياً".

\`\`\`python
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
from sklearn.metrics import silhouette_score

X, _ = make_blobs(n_samples=300, centers=4, random_state=3)
for k in range(2, 7):
    labels = KMeans(n_clusters=k, n_init=10, random_state=0).fit_predict(X)
    print(k, round(silhouette_score(X, labels), 3))
\`\`\`

## تحذيرات
- **قيّس الميزات** أولاً: المسافة تعتمد على المقاييس.
- K-Means يفترض مجموعات **كروية ومتقاربة الحجم**. مع أشكال متعرجة أو كثافات مختلفة يفشل — جرّب **DBSCAN** (يكتشف عدد المجموعات بنفسه ويحدد النقاط الشاذة).
- أرقام المجموعات (0، 1، 2) **بلا معنى** بحد ذاتها؛ افهم كل مجموعة بحساب متوسط ميزاتها.

## تمرين
في المثال الكامل استبدل الرسم بحساب Silhouette لقيم K من 2 إلى 8. هل يتفق مع الكوع؟ ثم اطبع متوسط الميزات لكل مجموعة وأعطها اسماً وصفياً.
`,
    },
    'ml-12': {
      description: 'مشروع كامل للتنبؤ بأسعار المنازل: الاستكشاف، Pipeline، مقارنة النماذج بـ Cross-Validation، الضبط، والتقييم النهائي مرة واحدة',
      content: md`
# مشروع: التنبؤ بأسعار المنازل

المشروع يجمع الدورة كلها على بيانات حقيقية (California Housing، تُحمَّل تلقائياً من scikit-learn عند أول تشغيل وتحتاج اتصالاً بالإنترنت). الهدف: متوسط سعر المنزل في الحي (بمئات آلاف الدولارات).

## الخطوات وما يجب أن تفكر فيه
1. **الاستكشاف**: الأبعاد، التوزيعات، القيم الشاذة. هل هناك قيم مقطوعة عند حد أعلى؟ (في هذه البيانات الأسعار مقطوعة عند 5.0.)
2. **التقسيم**: اختبار 20% **يُعزل فوراً** ولا يُلمس حتى النهاية.
3. **خط الأساس**: ما خطأ التنبؤ بالمتوسط دائماً؟ أي نموذج يجب أن يتفوق عليه بوضوح.
4. **المقارنة**: عدة نماذج داخل Pipelines، بـ Cross-Validation على التدريب فقط.
5. **الضبط**: \`GridSearchCV\` أو \`RandomizedSearchCV\` للنموذج الأفضل.
6. **التقييم النهائي**: على الاختبار **مرة واحدة**، بمقياس مفهوم (MAE بالدولار).
7. **التحليل**: أين يخطئ النموذج أكثر؟ ما الميزات الأهم؟

## قرارات مهمة في الكود
| القرار | السبب |
|---|---|
| Pipeline يحتوي التقييس | يمنع تسرب البيانات داخل Cross-Validation |
| مقارنة R² و MAE | R² للمقارنة، MAE لشرح الخطأ بوحدة مفهومة |
| \`random_state\` ثابت | نتائج قابلة للتكرار والمقارنة |
| مقارنة Train و CV | فجوة كبيرة = Overfitting (لاحظها في الغابة العشوائية) |

## أفضل الممارسات
- ابدأ بالبسيط، ثم زد التعقيد فقط إن تحسنت النتائج فعلاً على CV.
- وثّق كل تجربة: الإعدادات والنتيجة.
- احفظ النموذج النهائي مع Pipeline كاملاً (\`joblib.dump\`) — لا تنسَ المقياس.

## تحسينات مقترحة
1. ميزات جديدة: عدد الغرف لكل أسرة، نسبة غرف النوم.
2. \`HistGradientBoostingRegressor\` مع \`RandomizedSearchCV\`.
3. تحليل الأخطاء: ارسم الخطأ مقابل السعر الحقيقي — هل يخطئ النموذج أكثر في الأحياء الغالية؟
4. استخدم \`permutation_importance\` لتفسير النموذج.

بعد هذه الدورة: **التعلم العميق** للصور والنصوص والبيانات غير الجدولية.
`,
    },
  },
  newLessons: [
    {
      id: 'ml-pipelines',
      title: 'Pipelines ومنع تسرب البيانات',
      description: 'اجمع التحضير والنموذج في كائن واحد: Pipeline و ColumnTransformer، الضبط بـ GridSearchCV، وحفظ النموذج كاملاً',
      language: 'python',
      xpReward: 200,
      content: md`
# Pipelines ومنع تسرب البيانات

في الدروس السابقة كتبت خطوات التحضير يدوياً: عوّض القيم الناقصة، رمّز، قيّس، ثم درّب. هذا يسبب ثلاث مشاكل في المشاريع الحقيقية:
1. **تسرب البيانات** داخل Cross-Validation: إذا قيّست كل بيانات التدريب ثم قسمتها لـ folds، فالمقياس "رأى" بيانات التحقق.
2. **نسيان خطوة** عند التنبؤ على بيانات جديدة في الإنتاج.
3. **كود متشعب** يصعب ضبطه وحفظه.

**Pipeline** يحل الثلاث: سلسلة خطوات تُعامل كنموذج واحد له \`fit\` و \`predict\`.

## Pipeline بسيط
\`\`\`python
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
pipe = Pipeline([
    ("scale", StandardScaler()),
    ("model", LogisticRegression(max_iter=1000)),
])
print(cross_val_score(pipe, X, y, cv=5).mean().round(3))
\`\`\`
في كل fold يتعلم المقياس من جزء التدريب فقط، تلقائياً. \`make_pipeline(StandardScaler(), LogisticRegression())\` اختصار يسمي الخطوات بنفسه.

## أعمدة بأنواع مختلفة: ColumnTransformer
البيانات الحقيقية فيها أعمدة رقمية (تحتاج تعويضاً وتقييساً) وأعمدة فئوية (تحتاج تعويضاً و One-Hot):
\`\`\`python
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

numeric = ["age", "income"]
categorical = ["city"]

preprocess = ColumnTransformer([
    ("num", make_pipeline(SimpleImputer(strategy="median"), StandardScaler()), numeric),
    ("cat", make_pipeline(SimpleImputer(strategy="most_frequent"), OneHotEncoder(handle_unknown="ignore")), categorical),
])

df = pd.DataFrame({"age": [25, None, 40], "income": [700, 1200, None], "city": ["بغداد", "البصرة", None]})
print(preprocess.fit_transform(df))
\`\`\`
\`handle_unknown="ignore"\`: مدينة جديدة لم تظهر في التدريب لا توقف النظام في الإنتاج.

## الضبط عبر Pipeline
معاملات أي خطوة تُكتب بصيغة \`اسم_الخطوة__المعامل\`:
\`\`\`python
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = load_breast_cancer(return_X_y=True)
pipe = Pipeline([("scale", StandardScaler()), ("svm", SVC())])
grid = GridSearchCV(pipe, {"svm__C": [0.1, 1, 10], "svm__gamma": ["scale", 0.01]}, cv=5)
grid.fit(X, y)
print(grid.best_params_, round(grid.best_score_, 3))
\`\`\`

## الحفظ والتحميل
\`\`\`python
import joblib
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier

X, y = load_iris(return_X_y=True)
model = RandomForestClassifier(random_state=0).fit(X, y)
joblib.dump(model, "model.joblib")        # احفظ الـ Pipeline كاملاً لا النموذج وحده
loaded = joblib.load("model.joblib")
print(loaded.predict(X[:3]))
\`\`\`
⚠️ ملفات joblib و pickle **تنفّذ كوداً عند التحميل**: لا تحمّل ملف نموذج من مصدر لا تثق به.

## صور أخرى لتسرب البيانات
- ميزة تحتوي الإجابة بشكل غير مباشر (مثل "تاريخ إلغاء الاشتراك" عند التنبؤ بالإلغاء).
- بيانات زمنية مقسمة عشوائياً: النموذج يتعلم من المستقبل ليتنبأ بالماضي. استخدم \`TimeSeriesSplit\`.
- صفوف مكررة تظهر في التدريب والاختبار معاً.

إذا كانت النتيجة "أجمل من أن تُصدق"، فابحث عن تسرب أولاً.

## تمرين
أعد كتابة مثال درس تحضير البيانات كـ Pipeline مع ColumnTransformer و LogisticRegression، وقيّمه بـ cross_val_score، ثم احفظه وحمّله وتنبأ لعميل جديد من مدينة لم تظهر في التدريب.
`,
      codeExample: `import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

rng = np.random.default_rng(42)
n = 300
df = pd.DataFrame({
    "age": rng.integers(18, 65, n).astype(float),
    "income": rng.normal(1000, 300, n).round(),
    "city": rng.choice(["بغداد", "البصرة", "أربيل", "النجف"], n),
})
# الهدف يعتمد على الدخل والعمر والمدينة (مع ضوضاء)
logit = 0.004 * (df["income"] - 1000) + 0.03 * (df["age"] - 40) + (df["city"] == "أربيل") * 0.8
df["purchased"] = (logit + rng.normal(0, 0.8, n) > 0).astype(int)

# قيم ناقصة واقعية
df.loc[rng.choice(n, 20, replace=False), "age"] = np.nan
df.loc[rng.choice(n, 15, replace=False), "city"] = None

X = df.drop(columns="purchased")
y = df["purchased"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

preprocess = ColumnTransformer([
    ("num", make_pipeline(SimpleImputer(strategy="median"), StandardScaler()), ["age", "income"]),
    ("cat", make_pipeline(SimpleImputer(strategy="most_frequent"), OneHotEncoder(handle_unknown="ignore")), ["city"]),
])

pipe = Pipeline([("prep", preprocess), ("model", LogisticRegression(max_iter=1000))])

# الضبط بـ Cross-Validation على التدريب فقط — بلا تسرب
grid = GridSearchCV(pipe, {"model__C": [0.01, 0.1, 1, 10]}, cv=5)
grid.fit(X_train, y_train)
print("أفضل C:", grid.best_params_["model__C"], "| دقة CV:", round(grid.best_score_, 3))

# التقييم النهائي مرة واحدة
print("دقة الاختبار:", round(grid.score(X_test, y_test), 3))

# عميل من مدينة لم تظهر في التدريب: handle_unknown يمنع التوقف
new = pd.DataFrame({"age": [33.0], "income": [1250.0], "city": ["الموصل"]})
print("احتمال الشراء لعميل جديد:", round(grid.predict_proba(new)[0, 1], 2))`,
      quiz: {
        question: 'لماذا يُعدّ تقييس كل بيانات التدريب ثم استخدام cross_val_score تسرباً للبيانات؟',
        options: [
          'لأن التقييس يغيّر الهدف y',
          'لأن المقياس تعلّم المتوسط والانحراف من بيانات التحقق في كل fold، فتبدو النتيجة أفضل من الواقع',
          'لأن cross_val_score لا يقبل بيانات مقيّسة',
          'لا يوجد تسرب في هذه الحالة',
        ],
        correctAnswer: 1,
        explanation: 'Pipeline يجعل التقييس يتعلم من جزء التدريب فقط داخل كل fold تلقائياً.',
      },
    },
  ],
};
