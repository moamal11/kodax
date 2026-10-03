/**
 * منهج ai-basics — مقدمة في الذكاء الاصطناعي.
 *
 * كان: 5 دروس بشرح جيد الطول، لكن: مخططات ومعادلات بلا وسم لغة تُعرض كـ Python؛ أمثلة
 * scikit-learn تستخدم X_train و X و y_true دون تعريفها (لا تعمل منسوخة)؛ مثال "سير العمل"
 * يقرأ data.csv غير موجود؛ معادلة العصبون مكتوبة ككود Python يستدعي دالة غير معرّفة.
 * المحتوى سليم المفاهيم فلم يُعد كتابته؛ جُعلت الأمثلة مستقلة بذاتها.
 */
import type { CoursePlan } from '../types';

const DATA_CLS = 'from sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\nX, y = make_classification(n_samples=200, n_features=5, random_state=0)\nX_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0)\n\n';
const DATA_REG = 'from sklearn.datasets import make_regression\nfrom sklearn.model_selection import train_test_split\nX, y = make_regression(n_samples=200, n_features=3, noise=10, random_state=0)\nX_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0)\n\n';

export const AI_BASICS_PLAN: CoursePlan = {
  courseId: 'ai-basics',
  sections: [
    { title: 'المفاهيم', lessons: ['ai-1', 'ai-2'] },
    { title: 'المجالات', lessons: ['ai-3', 'ai-4'] },
    { title: 'التطبيق', lessons: ['ai-5'] },
  ],
  fenceLangs: {
    'ai-1': { 1: 'text' },
    'ai-2': { 1: 'text', 2: 'text' },
    'ai-4': { 1: 'text', 2: 'text' },
  },
  contentFixes: {
    'ai-2': [
      ['from sklearn.ensemble import RandomForestClassifier\n\nclf = RandomForestClassifier()', DATA_CLS + 'from sklearn.ensemble import RandomForestClassifier\n\nclf = RandomForestClassifier(random_state=0)'],
      ['from sklearn.linear_model import LinearRegression\n\nreg = LinearRegression()', DATA_REG + 'from sklearn.linear_model import LinearRegression\n\nreg = LinearRegression()'],
      ['from sklearn.cluster import KMeans\n\nkmeans = KMeans(n_clusters=3)', 'from sklearn.datasets import make_blobs\nX, _ = make_blobs(n_samples=150, centers=3, random_state=0)\n\nfrom sklearn.cluster import KMeans\n\nkmeans = KMeans(n_clusters=3, n_init=10, random_state=0)'],
      ['from sklearn.decomposition import PCA\n\npca = PCA(n_components=2)', 'from sklearn.datasets import load_iris\nX = load_iris().data   # 4 ميزات\n\nfrom sklearn.decomposition import PCA\n\npca = PCA(n_components=2)   # إلى ميزتين'],
      [
        "import pandas as pd\ndata = pd.read_csv('data.csv')",
        "import numpy as np\nimport pandas as pd\n# في مشروع حقيقي: data = pd.read_csv('data.csv') — هنا بيانات مولّدة ليعمل المثال\nrng = np.random.default_rng(0)\ndata = pd.DataFrame({'age': rng.integers(-1, 70, 300), 'income': rng.normal(1000, 300, 300)})\ndata['target'] = (data['income'] + rng.normal(0, 200, 300) > 1000).astype(int)\ndata.loc[::25, 'income'] = None   # قيم ناقصة",
      ],
      ['grid_search = GridSearchCV(model, params)\ngrid_search.fit(X_train, y_train)', 'grid_search = GridSearchCV(model, params, cv=3)\ngrid_search.fit(X_train, y_train)\nprint("أفضل المعاملات:", grid_search.best_params_)'],
      [
        '    confusion_matrix\n)\n\nprint(f"Accuracy: {accuracy_score(y_true, y_pred)}")',
        '    confusion_matrix\n)\n\ny_true = [1, 0, 1, 1, 0, 1, 0, 0]   # الإجابات الصحيحة\ny_pred = [1, 0, 0, 1, 0, 1, 1, 0]   # تنبؤات النموذج\n\nprint(f"Accuracy: {accuracy_score(y_true, y_pred)}")',
      ],
      [
        '    r2_score\n)\n\nprint(f"MAE: {mean_absolute_error(y_true, y_pred)}")',
        '    r2_score\n)\n\ny_true = [250, 300, 180, 420]   # الأسعار الحقيقية\ny_pred = [240, 320, 200, 400]   # تنبؤات النموذج\n\nprint(f"MAE: {mean_absolute_error(y_true, y_pred)}")',
      ],
    ],
  },
};
