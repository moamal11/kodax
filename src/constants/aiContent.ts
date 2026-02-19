/**
 * محتوى الذكاء الاصطناعي وتعلم الآلة - Kodax
 * دورة شاملة من الصفر إلى الاحتراف
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس AI الأساسية =====
export const AI_BEGINNER_LESSONS: Lesson[] = [
  {
    id: 'ai-1',
    courseId: 'ai-basics',
    title: 'مقدمة في الذكاء الاصطناعي',
    description: 'تعرف على عالم AI الرائع',
    content: `
# مقدمة في الذكاء الاصطناعي

الذكاء الاصطناعي (AI) هو **محاكاة الذكاء البشري** في الآلات.

## ما هو الذكاء الاصطناعي؟

AI يُمكّن الآلات من:
- **التعلم** من البيانات والتجارب
- **التفكير** واتخاذ القرارات
- **الفهم** اللغة والصور
- **التكيف** مع المواقف الجديدة

## تاريخ مختصر

| السنة | الحدث |
|-------|------|
| 1950 | اختبار تورنج |
| 1956 | ولادة مصطلح "الذكاء الاصطناعي" |
| 1997 | Deep Blue يهزم كاسباروف |
| 2011 | IBM Watson يفوز في Jeopardy |
| 2016 | AlphaGo يهزم بطل Go العالمي |
| 2022 | ChatGPT يُحدث ثورة |
| 2024 | GPT-4, Claude, Gemini... |

## أنواع الذكاء الاصطناعي

### 1. AI الضيق (Narrow AI)
- متخصص في مهمة واحدة
- معظم AI الحالي
- أمثلة: Siri, Alexa, توصيات Netflix

### 2. AI العام (AGI)
- ذكاء بشري المستوى
- لم يتحقق بعد
- يفكر ويتعلم كالإنسان

### 3. AI الفائق (ASI)
- يتفوق على الذكاء البشري
- نظري حالياً
- موضوع أبحاث ونقاشات

## فروع الذكاء الاصطناعي

\`\`\`
AI
├── Machine Learning (تعلم الآلة)
│   ├── Supervised Learning
│   ├── Unsupervised Learning
│   └── Reinforcement Learning
├── Deep Learning (التعلم العميق)
│   ├── CNN (للصور)
│   ├── RNN/LSTM (للتسلسلات)
│   └── Transformers (GPT, BERT)
├── NLP (معالجة اللغة)
│   ├── Text Classification
│   ├── Sentiment Analysis
│   └── Translation
├── Computer Vision (رؤية الحاسوب)
│   ├── Object Detection
│   ├── Face Recognition
│   └── Image Segmentation
└── Robotics (الروبوتات)
\`\`\`

## تطبيقات عملية

### الرعاية الصحية
- تشخيص الأمراض من الصور الطبية
- اكتشاف الأدوية
- التنبؤ بالأمراض

### التجارة
- التوصيات الشخصية
- Chatbots خدمة العملاء
- التسعير الديناميكي

### النقل
- السيارات ذاتية القيادة
- تحسين المسارات
- التنبؤ بحركة المرور

### التعليم
- التعلم الشخصي التكيفي
- تصحيح الامتحانات
- مساعدين تعليميين AI

## الأدوات والمكتبات

### Python (اللغة الأساسية)
\`\`\`python
# المكتبات الأساسية
import numpy as np      # الحسابات
import pandas as pd     # البيانات
import matplotlib.pyplot as plt  # الرسوم

# Machine Learning
from sklearn import *   # ML التقليدي

# Deep Learning
import tensorflow as tf
import torch           # PyTorch
import keras           # High-level API
\`\`\`

## نصائح للبدء

1. **تعلم Python أولاً** - أساس كل شيء
2. **افهم الرياضيات** - الإحصاء والجبر الخطي
3. **ابدأ بالـ ML التقليدي** قبل Deep Learning
4. **مارس على مشاريع حقيقية** - Kaggle
5. **ابقَ مُحدّثاً** - المجال يتطور بسرعة
`,
    codeExample: `# مثال بسيط على ML
import numpy as np
from sklearn.linear_model import LinearRegression

# بيانات التدريب
X = np.array([[1], [2], [3], [4], [5]])  # المدخلات
y = np.array([2, 4, 6, 8, 10])           # المخرجات

# إنشاء وتدريب النموذج
model = LinearRegression()
model.fit(X, y)

# التنبؤ
prediction = model.predict([[6]])
print(f"التنبؤ لـ 6: {prediction[0]}")  # 12

# معامل الميل والثابت
print(f"الميل: {model.coef_[0]}")       # 2
print(f"الثابت: {model.intercept_}")    # 0`,
    language: 'python',
    xpReward: 150,
    order: 1,
    quiz: {
      question: 'ما الفرق بين AI الضيق و AI العام؟',
      options: [
        'لا فرق',
        'AI الضيق متخصص بمهمة واحدة، AI العام يفكر كالإنسان',
        'AI العام أبطأ',
        'AI الضيق أذكى',
      ],
      correctAnswer: 1,
      explanation:
        'AI الضيق (مثل ChatGPT) متخصص بمهام محددة، بينما AI العام (النظري) يملك ذكاء شامل كالإنسان.',
    },
  },
  {
    id: 'ai-2',
    courseId: 'ai-basics',
    title: 'تعلم الآلة - المفاهيم الأساسية',
    description: 'فهم Machine Learning من الصفر',
    content: `
# تعلم الآلة (Machine Learning)

تعلم الآلة هو **تعليم الكمبيوتر من البيانات** بدلاً من برمجته صراحة.

## الفرق عن البرمجة التقليدية

### البرمجة التقليدية
\`\`\`
المدخلات + القواعد = المخرجات
\`\`\`

### تعلم الآلة
\`\`\`
المدخلات + المخرجات = القواعد (النموذج)
\`\`\`

## أنواع تعلم الآلة

### 1. التعلم بالإشراف (Supervised Learning)
البيانات تحتوي على **الإجابات الصحيحة** (Labels).

#### مشاكل التصنيف (Classification)
\`\`\`python
# هل هذا البريد spam أم لا؟
# هل الصورة قطة أم كلب؟
# هل المعاملة احتيالية؟

from sklearn.ensemble import RandomForestClassifier

clf = RandomForestClassifier()
clf.fit(X_train, y_train)  # التدريب
predictions = clf.predict(X_test)  # التنبؤ
\`\`\`

#### مشاكل الانحدار (Regression)
\`\`\`python
# ما سعر هذا المنزل؟
# كم ستكون درجة الحرارة غداً؟
# ما راتب هذا الموظف؟

from sklearn.linear_model import LinearRegression

reg = LinearRegression()
reg.fit(X_train, y_train)
predictions = reg.predict(X_test)
\`\`\`

### 2. التعلم بدون إشراف (Unsupervised Learning)
البيانات **بدون إجابات** - نبحث عن الأنماط.

#### التجميع (Clustering)
\`\`\`python
# تقسيم العملاء لمجموعات
# اكتشاف أنواع المنتجات

from sklearn.cluster import KMeans

kmeans = KMeans(n_clusters=3)
clusters = kmeans.fit_predict(X)
\`\`\`

#### تقليل الأبعاد (Dimensionality Reduction)
\`\`\`python
# تبسيط البيانات المعقدة

from sklearn.decomposition import PCA

pca = PCA(n_components=2)
X_reduced = pca.fit_transform(X)
\`\`\`

### 3. التعلم المعزز (Reinforcement Learning)
التعلم من **التجربة والخطأ** مع مكافآت.

\`\`\`python
# تعليم روبوت المشي
# تدريب AI على الألعاب
# تحسين التوصيات

# Agent يتفاعل مع Environment
# يحصل على Reward أو Penalty
# يتعلم تحسين قراراته
\`\`\`

## مصطلحات مهمة

| المصطلح | المعنى |
|---------|-------|
| Dataset | مجموعة البيانات |
| Features | الخصائص/المدخلات |
| Labels | الإجابات/المخرجات |
| Training | تدريب النموذج |
| Testing | اختبار النموذج |
| Overfitting | حفظ البيانات (سيء) |
| Underfitting | نموذج بسيط جداً |
| Accuracy | نسبة الإجابات الصحيحة |

## خطوات بناء نموذج ML

\`\`\`python
# 1. جمع البيانات
import pandas as pd
data = pd.read_csv('data.csv')

# 2. تنظيف البيانات
data.dropna(inplace=True)
data = data[data['age'] > 0]

# 3. تقسيم البيانات
from sklearn.model_selection import train_test_split
X = data.drop('target', axis=1)
y = data['target']
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 4. اختيار وتدريب النموذج
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier()
model.fit(X_train, y_train)

# 5. تقييم النموذج
from sklearn.metrics import accuracy_score
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"الدقة: {accuracy:.2%}")

# 6. تحسين النموذج (Hyperparameter Tuning)
from sklearn.model_selection import GridSearchCV
params = {'n_estimators': [100, 200], 'max_depth': [10, 20]}
grid_search = GridSearchCV(model, params)
grid_search.fit(X_train, y_train)
\`\`\`

## تقييم النموذج

### للتصنيف
\`\`\`python
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

print(f"Accuracy: {accuracy_score(y_true, y_pred)}")
print(f"Precision: {precision_score(y_true, y_pred)}")
print(f"Recall: {recall_score(y_true, y_pred)}")
print(f"F1: {f1_score(y_true, y_pred)}")
\`\`\`

### للانحدار
\`\`\`python
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

print(f"MAE: {mean_absolute_error(y_true, y_pred)}")
print(f"MSE: {mean_squared_error(y_true, y_pred)}")
print(f"R²: {r2_score(y_true, y_pred)}")
\`\`\`
`,
    codeExample: `# مثال كامل: تصنيف زهور Iris
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# 1. تحميل البيانات
iris = load_iris()
X, y = iris.data, iris.target

# 2. تقسيم البيانات
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 3. تدريب النموذج
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# 4. التنبؤ والتقييم
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"دقة النموذج: {accuracy:.2%}")
print("\\nتقرير التصنيف:")
print(classification_report(y_test, predictions, 
    target_names=iris.target_names))`,
    language: 'python',
    xpReward: 180,
    order: 2,
    quiz: {
      question: 'ما هو Supervised Learning؟',
      options: [
        'التعلم بدون بيانات',
        'التعلم من بيانات تحتوي على الإجابات الصحيحة',
        'التعلم من التجربة والخطأ',
        'التعلم التلقائي',
      ],
      correctAnswer: 1,
      explanation:
        'Supervised Learning يستخدم بيانات مُصنّفة (Labeled) تحتوي على المدخلات والإجابات الصحيحة للتدريب.',
    },
  },
  {
    id: 'ai-3',
    courseId: 'ai-basics',
    title: 'معالجة اللغة الطبيعية (NLP)',
    description: 'تعليم الآلة فهم اللغة البشرية',
    content: `
# معالجة اللغة الطبيعية (NLP)

NLP هو فرع من AI يُمكّن الآلات من **فهم وتوليد اللغة البشرية**.

## تطبيقات NLP

- **Chatbots** - مساعدين افتراضيين
- **الترجمة** - Google Translate
- **تحليل المشاعر** - معرفة رأي العملاء
- **تلخيص النصوص** - تلخيص المقالات
- **استخراج المعلومات** - من الوثائق
- **التعرف على الكلام** - Siri, Alexa

## خطوات معالجة النص

### 1. تنظيف النص (Text Cleaning)
\`\`\`python
import re

def clean_text(text):
    # تحويل لأحرف صغيرة
    text = text.lower()
    
    # إزالة HTML
    text = re.sub(r'<[^>]+>', '', text)
    
    # إزالة الروابط
    text = re.sub(r'http\\S+', '', text)
    
    # إزالة الأرقام
    text = re.sub(r'\\d+', '', text)
    
    # إزالة الرموز الخاصة
    text = re.sub(r'[^\\w\\s]', '', text)
    
    # إزالة المسافات الزائدة
    text = ' '.join(text.split())
    
    return text
\`\`\`

### 2. Tokenization (التقسيم)
\`\`\`python
from nltk.tokenize import word_tokenize, sent_tokenize

text = "مرحباً بالعالم. هذا درس NLP."

# تقسيم لجمل
sentences = sent_tokenize(text)
# ['مرحباً بالعالم.', 'هذا درس NLP.']

# تقسيم لكلمات
words = word_tokenize(text)
# ['مرحباً', 'بالعالم', '.', 'هذا', 'درس', 'NLP', '.']
\`\`\`

### 3. إزالة Stop Words
\`\`\`python
from nltk.corpus import stopwords

stop_words = set(stopwords.words('arabic'))
# {'من', 'في', 'على', 'إلى', 'هذا', ...}

filtered = [w for w in words if w not in stop_words]
\`\`\`

### 4. Stemming و Lemmatization
\`\`\`python
from nltk.stem import PorterStemmer, WordNetLemmatizer

# Stemming - قطع اللواحق
stemmer = PorterStemmer()
print(stemmer.stem("running"))  # run
print(stemmer.stem("better"))   # better (خطأ!)

# Lemmatization - الجذر الصحيح (أفضل)
lemmatizer = WordNetLemmatizer()
print(lemmatizer.lemmatize("better", pos='a'))  # good
print(lemmatizer.lemmatize("running", pos='v')) # run
\`\`\`

### 5. تحويل النص لأرقام (Vectorization)
\`\`\`python
from sklearn.feature_extraction.text import (
    CountVectorizer, 
    TfidfVectorizer
)

texts = ["أحب البرمجة", "البرمجة ممتعة"]

# Bag of Words
count_vec = CountVectorizer()
bow = count_vec.fit_transform(texts)

# TF-IDF (أفضل)
tfidf_vec = TfidfVectorizer()
tfidf = tfidf_vec.fit_transform(texts)
\`\`\`

## مشروع: تحليل المشاعر

\`\`\`python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report

# البيانات
data = pd.DataFrame({
    'text': [
        'هذا المنتج رائع جداً',
        'خدمة سيئة للغاية',
        'أنصح بالشراء',
        'لن أشتري مرة أخرى',
        'جودة عالية',
        'مضيعة للمال'
    ],
    'sentiment': [1, 0, 1, 0, 1, 0]  # 1=إيجابي، 0=سلبي
})

# التقسيم
X_train, X_test, y_train, y_test = train_test_split(
    data['text'], data['sentiment'], test_size=0.2
)

# TF-IDF
vectorizer = TfidfVectorizer()
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# التدريب
model = MultinomialNB()
model.fit(X_train_vec, y_train)

# التقييم
predictions = model.predict(X_test_vec)
print(classification_report(y_test, predictions))

# تجربة نص جديد
new_text = ["منتج ممتاز"]
new_vec = vectorizer.transform(new_text)
print(model.predict(new_vec))  # [1] = إيجابي
\`\`\`

## Word Embeddings

### Word2Vec
\`\`\`python
from gensim.models import Word2Vec

# تدريب النموذج
sentences = [["مرحباً", "بالعالم"], ["تعلم", "الآلة"]]
model = Word2Vec(sentences, vector_size=100, min_count=1)

# الحصول على vector
vector = model.wv["مرحباً"]

# الكلمات المشابهة
similar = model.wv.most_similar("تعلم")
\`\`\`

### استخدام Transformers (الأحدث)
\`\`\`python
from transformers import pipeline

# تحليل المشاعر
sentiment = pipeline("sentiment-analysis")
result = sentiment("I love this product!")
# [{'label': 'POSITIVE', 'score': 0.99}]

# الإجابة على الأسئلة
qa = pipeline("question-answering")
result = qa(
    question="What is AI?",
    context="AI is artificial intelligence..."
)

# توليد النصوص
generator = pipeline("text-generation")
result = generator("Once upon a time")
\`\`\`
`,
    codeExample: `# مشروع: تصنيف الأخبار
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score

# تحميل البيانات
categories = ['sci.med', 'sci.space', 'rec.sport.hockey']
train = fetch_20newsgroups(subset='train', categories=categories)
test = fetch_20newsgroups(subset='test', categories=categories)

# بناء Pipeline
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words='english')),
    ('clf', MultinomialNB())
])

# التدريب
pipeline.fit(train.data, train.target)

# التقييم
predictions = pipeline.predict(test.data)
accuracy = accuracy_score(test.target, predictions)
print(f"الدقة: {accuracy:.2%}")

# تجربة
new_text = ["NASA launched a new rocket to Mars"]
category = pipeline.predict(new_text)
print(f"الفئة: {train.target_names[category[0]]}")`,
    language: 'python',
    xpReward: 200,
    order: 3,
    quiz: {
      question: 'ما هو TF-IDF؟',
      options: [
        'نوع من الشبكات العصبية',
        'طريقة لتحويل النص لأرقام تُعطي وزناً للكلمات المهمة',
        'أداة لتنظيف النصوص',
        'لغة برمجة',
      ],
      correctAnswer: 1,
      explanation:
        'TF-IDF (Term Frequency-Inverse Document Frequency) تُعطي وزناً أعلى للكلمات المميزة وأقل للكلمات الشائعة.',
    },
  },
  {
    id: 'ai-4',
    courseId: 'ai-basics',
    title: 'التعلم العميق (Deep Learning)',
    description: 'الشبكات العصبية والتعلم العميق',
    content: `
# التعلم العميق (Deep Learning)

التعلم العميق هو **فرع من ML يستخدم الشبكات العصبية** متعددة الطبقات.

## ما هي الشبكة العصبية؟

الشبكة العصبية مستوحاة من **دماغ الإنسان**:
- **الخلايا العصبية** (Neurons) تستقبل وترسل إشارات
- **الوصلات** (Weights) تُحدد قوة الإشارة
- **الطبقات** (Layers) تُعالج المعلومات تدريجياً

\`\`\`
Input Layer → Hidden Layers → Output Layer
   (X)          (معالجة)         (y)
\`\`\`

## المكونات الأساسية

### 1. الخلية العصبية (Neuron)
\`\`\`python
# المعادلة البسيطة
output = activation(sum(inputs * weights) + bias)
\`\`\`

### 2. دوال التنشيط (Activation Functions)
\`\`\`python
# ReLU (الأكثر استخداماً)
def relu(x):
    return max(0, x)

# Sigmoid (للتصنيف الثنائي)
def sigmoid(x):
    return 1 / (1 + exp(-x))

# Softmax (للتصنيف المتعدد)
# يُحول لاحتمالات
\`\`\`

### 3. دالة الخسارة (Loss Function)
\`\`\`python
# للتصنيف
# Cross-Entropy Loss

# للانحدار
# Mean Squared Error (MSE)
\`\`\`

## بناء شبكة عصبية مع Keras

\`\`\`python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# بناء النموذج
model = keras.Sequential([
    # طبقة الإدخال
    layers.Dense(128, activation='relu', input_shape=(784,)),
    
    # طبقات مخفية
    layers.Dropout(0.2),  # لمنع Overfitting
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.2),
    
    # طبقة الإخراج
    layers.Dense(10, activation='softmax')
])

# تجميع النموذج
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# ملخص النموذج
model.summary()
\`\`\`

## تدريب النموذج

\`\`\`python
# تدريب
history = model.fit(
    X_train, y_train,
    epochs=10,
    batch_size=32,
    validation_split=0.2,
    callbacks=[
        keras.callbacks.EarlyStopping(patience=3)
    ]
)

# التقييم
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"دقة الاختبار: {test_acc:.2%}")

# التنبؤ
predictions = model.predict(X_new)
\`\`\`

## أنواع الشبكات العصبية

### 1. CNN - للصور
\`\`\`python
model = keras.Sequential([
    # Convolutional Layers
    layers.Conv2D(32, (3,3), activation='relu', input_shape=(28,28,1)),
    layers.MaxPooling2D((2,2)),
    layers.Conv2D(64, (3,3), activation='relu'),
    layers.MaxPooling2D((2,2)),
    
    # Flatten and Dense
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])
\`\`\`

### 2. RNN/LSTM - للتسلسلات
\`\`\`python
model = keras.Sequential([
    layers.Embedding(vocab_size, 64),
    layers.LSTM(128, return_sequences=True),
    layers.LSTM(64),
    layers.Dense(1, activation='sigmoid')
])
\`\`\`

### 3. Transformer - للNLP الحديث
\`\`\`python
# استخدام Hugging Face
from transformers import AutoModel, AutoTokenizer

model = AutoModel.from_pretrained("bert-base-uncased")
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
\`\`\`

## مشروع: تصنيف صور MNIST

\`\`\`python
import tensorflow as tf
from tensorflow import keras

# تحميل البيانات
(X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()

# تطبيع البيانات
X_train = X_train / 255.0
X_test = X_test / 255.0

# إضافة بُعد للقناة
X_train = X_train[..., tf.newaxis]
X_test = X_test[..., tf.newaxis]

# بناء النموذج
model = keras.Sequential([
    keras.layers.Conv2D(32, (3,3), activation='relu', input_shape=(28,28,1)),
    keras.layers.MaxPooling2D((2,2)),
    keras.layers.Conv2D(64, (3,3), activation='relu'),
    keras.layers.MaxPooling2D((2,2)),
    keras.layers.Flatten(),
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(10, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# التدريب
model.fit(X_train, y_train, epochs=5, validation_split=0.1)

# التقييم
model.evaluate(X_test, y_test)
\`\`\`

## نصائح للتعلم العميق

1. **ابدأ بسيطاً** - لا تُعقد النموذج من البداية
2. **راقب Overfitting** - استخدم Dropout و Early Stopping
3. **استخدم GPU** - التدريب أسرع بكثير
4. **جرب Transfer Learning** - نماذج مُدربة مسبقاً
5. **وثّق تجاربك** - TensorBoard, Weights & Biases
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# تحميل بيانات MNIST
(X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()

# التطبيع
X_train = X_train.reshape(-1, 28*28) / 255.0
X_test = X_test.reshape(-1, 28*28) / 255.0

# بناء شبكة عصبية بسيطة
model = keras.Sequential([
    layers.Dense(128, activation='relu', input_shape=(784,)),
    layers.Dropout(0.2),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# التدريب
print("جارٍ التدريب...")
history = model.fit(
    X_train, y_train,
    epochs=5,
    batch_size=32,
    validation_split=0.1,
    verbose=1
)

# التقييم
loss, accuracy = model.evaluate(X_test, y_test)
print(f"\\nدقة الاختبار: {accuracy:.2%}")`,
    language: 'python',
    xpReward: 250,
    order: 4,
    quiz: {
      question: 'ما وظيفة دالة التنشيط (Activation Function)؟',
      options: [
        'تخزين البيانات',
        'إضافة اللاخطية للشبكة مما يُمكنها من تعلم أنماط معقدة',
        'تسريع التدريب',
        'تقليل الأخطاء',
      ],
      correctAnswer: 1,
      explanation:
        'دوال التنشيط تُضيف اللاخطية، بدونها الشبكة ستكون مجرد دالة خطية مهما كان عدد الطبقات.',
    },
  },
  {
    id: 'ai-5',
    courseId: 'ai-basics',
    title: 'تطبيقات AI العملية',
    description: 'مشاريع وتطبيقات حقيقية للذكاء الاصطناعي',
    content: `
# تطبيقات AI العملية

## أين يُستخدم الذكاء الاصطناعي؟

### 1. 🏥 الرعاية الصحية
- **تشخيص الأمراض** من الصور الطبية
- **اكتشاف الأدوية** بسرعة أكبر
- **التنبؤ بالأوبئة** وانتشار الأمراض
- **روبوتات الجراحة** الدقيقة

### 2. 🚗 النقل والمواصلات
- **السيارات ذاتية القيادة** (Tesla, Waymo)
- **تحسين المسارات** (Google Maps, Uber)
- **التنبؤ بحركة المرور**

### 3. 💬 المساعدين الافتراضيين
- **ChatGPT** للمحادثة والكتابة
- **Siri, Alexa, Google Assistant**
- **روبوتات خدمة العملاء**

### 4. 🛒 التجارة الإلكترونية
- **التوصيات الشخصية** (Amazon, Netflix)
- **التسعير الديناميكي**
- **كشف الاحتيال** في المعاملات

### 5. 🎨 الإبداع والفنون
- **توليد الصور** (DALL-E, Midjourney)
- **كتابة المحتوى**
- **تأليف الموسيقى**

### 6. 🔒 الأمن السيبراني
- **كشف التهديدات** والهجمات
- **تحليل السلوك** المشبوه
- **حماية البيانات**

## أدوات AI يمكنك استخدامها اليوم

| الأداة | الاستخدام | رابط |
|--------|----------|------|
| ChatGPT | محادثة، كتابة، برمجة | chatgpt.com |
| GitHub Copilot | مساعد برمجة | github.com/copilot |
| DALL-E | توليد صور | labs.openai.com |
| Hugging Face | نماذج جاهزة | huggingface.co |

## مشروع عملي: Chatbot بسيط

\`\`\`python
from transformers import pipeline

# تحميل نموذج محادثة
chatbot = pipeline("text-generation", model="gpt2")

def chat(user_input):
    response = chatbot(
        user_input, 
        max_length=100, 
        num_return_sequences=1
    )
    return response[0]['generated_text']

# محادثة
print(chat("Hello, how are you?"))
\`\`\`

## نصائح للبدء في AI

1. **تعلم Python جيداً** - الأساس
2. **افهم الرياضيات** - الجبر الخطي والاحتمالات
3. **ابدأ بمشاريع صغيرة** على Kaggle
4. **استخدم نماذج جاهزة** أولاً
5. **انضم للمجتمع** - Discord, Reddit
`,
    codeExample: `# مثال: تصنيف الصور باستخدام نموذج جاهز
from transformers import pipeline

# تحميل نموذج تصنيف صور
classifier = pipeline("image-classification")

# تصنيف صورة
result = classifier("https://example.com/cat.jpg")
print(f"التصنيف: {result[0]['label']}")
print(f"الثقة: {result[0]['score']:.2%}")

# -------------------------------------------
# مثال: تحليل المشاعر بالعربية
from transformers import pipeline

# نموذج للعربية
sentiment = pipeline(
    "sentiment-analysis",
    model="CAMeL-Lab/bert-base-arabic-camelbert-msa-sentiment"
)

texts = [
    "هذا المنتج رائع جداً",
    "خدمة سيئة للغاية",
    "الجودة متوسطة"
]

for text in texts:
    result = sentiment(text)
    print(f"{text}")
    print(f"  → {result[0]['label']}: {result[0]['score']:.2%}")
    print()`,
    language: 'python',
    xpReward: 200,
    order: 5,
    quiz: {
      question: 'ما هو أفضل مكان للبدء بمشاريع AI عملية؟',
      options: [
        'بناء نموذج من الصفر',
        'Kaggle - منصة للمسابقات والبيانات',
        'شراء GPU قوي',
        'قراءة الأبحاث الأكاديمية فقط',
      ],
      correctAnswer: 1,
      explanation:
        'Kaggle منصة ممتازة للمبتدئين، توفر بيانات جاهزة ومسابقات ومجتمع داعم',
    },
  },
];

// ===== دروس تعلم الآلة - الجزء الأول =====
export const ML_BASICS_LESSONS: Lesson[] = [
  {
    id: 'ml-1',
    courseId: 'ai-ml-basics',
    title: 'مقدمة في تعلم الآلة',
    description: 'ما هو ML وكيف يعمل',
    content: `
# مقدمة في تعلم الآلة

## ما هو تعلم الآلة؟
تعلم الآلة = تعليم الكمبيوتر من **البيانات** بدلاً من البرمجة الصريحة.

## الفرق عن البرمجة التقليدية

### البرمجة التقليدية
\`\`\`
القواعد + البيانات = النتيجة
\`\`\`

### تعلم الآلة
\`\`\`
البيانات + النتائج = القواعد (النموذج)
\`\`\`

## أنواع تعلم الآلة

### 1. Supervised Learning (بإشراف)
- البيانات تحتوي الإجابات (Labels)
- مثال: تصنيف الصور، التنبؤ بالأسعار

### 2. Unsupervised Learning (بدون إشراف)
- البيانات بدون إجابات
- مثال: تجميع العملاء، اكتشاف الأنماط

### 3. Reinforcement Learning (التعزيزي)
- التعلم من التجربة والخطأ
- مثال: ألعاب، روبوتات

## مصطلحات أساسية

| المصطلح | المعنى |
|---------|--------|
| Dataset | مجموعة البيانات |
| Features | المدخلات (X) |
| Labels | المخرجات (y) |
| Training | تدريب النموذج |
| Testing | اختبار النموذج |
| Model | النموذج المُدرَّب |
`,
    codeExample: `# أول مثال على ML
from sklearn.linear_model import LinearRegression
import numpy as np

# البيانات: ساعات الدراسة → الدرجة
X = np.array([[1], [2], [3], [4], [5]])  # ساعات
y = np.array([50, 60, 70, 80, 90])        # درجات

# إنشاء وتدريب النموذج
model = LinearRegression()
model.fit(X, y)

# التنبؤ
hours = 6
prediction = model.predict([[hours]])
print(f"إذا درست {hours} ساعات، درجتك المتوقعة: {prediction[0]:.0f}")`,
    language: 'python',
    xpReward: 150,
    order: 1,
    quiz: {
      question: 'ما الفرق بين Supervised و Unsupervised Learning؟',
      options: [
        'لا فرق',
        'Supervised يحتاج Labels، Unsupervised لا يحتاج',
        'Unsupervised أسرع',
        'Supervised للصور فقط',
      ],
      correctAnswer: 1,
      explanation:
        'Supervised Learning يتعلم من بيانات تحتوي الإجابات الصحيحة (Labels)',
    },
  },
  {
    id: 'ml-2',
    courseId: 'ai-ml-basics',
    title: 'تحضير البيانات',
    description: 'تنظيف وتجهيز البيانات للتدريب',
    content: `
# تحضير البيانات

80% من وقت ML يُقضى في تحضير البيانات!

## خطوات تحضير البيانات

### 1. جمع البيانات
- CSV, Excel, Database
- APIs, Web Scraping

### 2. استكشاف البيانات (EDA)
\`\`\`python
df.head()      # أول 5 صفوف
df.info()      # معلومات الأعمدة
df.describe()  # إحصائيات
df.isnull().sum()  # القيم الناقصة
\`\`\`

### 3. تنظيف البيانات
- إزالة المكررات
- معالجة القيم الناقصة
- تصحيح الأخطاء

### 4. تحويل البيانات
- Encoding للنصوص
- Scaling للأرقام
- Feature Engineering

### 5. تقسيم البيانات
- Training set (70-80%)
- Testing set (20-30%)
`,
    codeExample: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

# قراءة البيانات
df = pd.read_csv('data.csv')

# معالجة القيم الناقصة
df['age'].fillna(df['age'].mean(), inplace=True)

# تحويل النصوص لأرقام
le = LabelEncoder()
df['gender'] = le.fit_transform(df['gender'])

# تحديد X و y
X = df[['age', 'gender', 'income']]
y = df['purchased']

# تقسيم البيانات
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# تطبيع البيانات
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

print(f"Training: {len(X_train)}, Testing: {len(X_test)}")`,
    language: 'python',
    xpReward: 160,
    order: 2,
    quiz: {
      question: 'لماذا نقسم البيانات لـ Training و Testing؟',
      options: [
        'لتوفير الوقت',
        'لاختبار النموذج على بيانات لم يرها',
        'لتقليل حجم البيانات',
        'غير ضروري',
      ],
      correctAnswer: 1,
      explanation:
        'Testing set يقيس أداء النموذج على بيانات جديدة لم يتدرب عليها',
    },
  },
  {
    id: 'ml-3',
    courseId: 'ai-ml-basics',
    title: 'Linear Regression',
    description: 'التنبؤ بالقيم المستمرة',
    content: `
# Linear Regression

أبسط خوارزمية ML للتنبؤ بقيم رقمية.

## الفكرة
إيجاد خط مستقيم يمثل العلاقة بين X و y.

\`\`\`
y = mx + b
y = التنبؤ
m = الميل (slope)
x = المدخل
b = الثابت (intercept)
\`\`\`

## متى نستخدمها؟
- التنبؤ بالأسعار
- التنبؤ بالمبيعات
- أي علاقة خطية

## مقاييس التقييم

| المقياس | الوصف |
|---------|-------|
| MSE | متوسط مربع الخطأ |
| RMSE | جذر MSE |
| MAE | متوسط الخطأ المطلق |
| R² | نسبة التباين المُفسَّر |

## R² Score
- 1.0 = مثالي
- 0.0 = سيء جداً
- أعلى = أفضل
`,
    codeExample: `from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# بيانات: مساحة المنزل → السعر
X = np.array([[50], [80], [100], [120], [150]])
y = np.array([150000, 240000, 300000, 360000, 450000])

# تقسيم
X_train, X_test = X[:4], X[4:]
y_train, y_test = y[:4], y[4:]

# التدريب
model = LinearRegression()
model.fit(X_train, y_train)

# معاملات النموذج
print(f"الميل: {model.coef_[0]:.0f}")
print(f"الثابت: {model.intercept_:.0f}")

# التنبؤ والتقييم
y_pred = model.predict(X_test)
print(f"التنبؤ: {y_pred[0]:.0f}")
print(f"الفعلي: {y_test[0]}")
print(f"R² Score: {r2_score(y_test, y_pred):.2f}")

# تنبؤ جديد
new_area = 130
price = model.predict([[new_area]])
print(f"منزل {new_area}م²: {price[0]:.0f} ريال")`,
    language: 'python',
    xpReward: 170,
    order: 3,
    quiz: {
      question: 'ما يعني R² = 0.95؟',
      options: [
        'الخطأ 95%',
        'النموذج يفسر 95% من تباين البيانات',
        'الدقة 95%',
        'النموذج خاطئ',
      ],
      correctAnswer: 1,
      explanation: 'R² يقيس نسبة التباين في y الذي يفسره النموذج، 0.95 ممتاز',
    },
  },
  {
    id: 'ml-4',
    courseId: 'ai-ml-basics',
    title: 'Logistic Regression',
    description: 'التصنيف الثنائي',
    content: `
# Logistic Regression

للتصنيف وليس الانحدار (رغم الاسم!)

## الفكرة
تحويل المخرج لاحتمالية (0 إلى 1).

## Sigmoid Function
\`\`\`
σ(x) = 1 / (1 + e^(-x))
\`\`\`
- المخرج دائماً بين 0 و 1
- > 0.5 = Class 1
- < 0.5 = Class 0

## متى نستخدمها؟
- Spam أم لا
- مريض أم سليم
- نجاح أم فشل

## مقاييس التقييم

| المقياس | الوصف |
|---------|-------|
| Accuracy | نسبة الصحيح |
| Precision | دقة الـ Positive |
| Recall | اكتمال الـ Positive |
| F1-Score | توازن Precision و Recall |
`,
    codeExample: `from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
import numpy as np

# بيانات: ساعات دراسة، درجة سابقة → نجاح/رسوب
X = np.array([
    [1, 40], [2, 50], [3, 55], [4, 60],
    [5, 65], [6, 70], [7, 75], [8, 85]
])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])  # 0=رسوب، 1=نجاح

# تقسيم
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25)

# التدريب
model = LogisticRegression()
model.fit(X_train, y_train)

# التنبؤ
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)

print(f"الدقة: {accuracy_score(y_test, y_pred):.2%}")
print(classification_report(y_test, y_pred))

# تنبؤ جديد
student = [[5, 62]]
result = model.predict(student)
proba = model.predict_proba(student)
print(f"النتيجة: {'نجاح' if result[0] == 1 else 'رسوب'}")
print(f"احتمال النجاح: {proba[0][1]:.2%}")`,
    language: 'python',
    xpReward: 180,
    order: 4,
    quiz: {
      question: 'ما وظيفة Sigmoid في Logistic Regression؟',
      options: [
        'تسريع التدريب',
        'تحويل المخرج لاحتمالية بين 0 و 1',
        'زيادة الدقة',
        'تقليل الأخطاء',
      ],
      correctAnswer: 1,
      explanation: 'Sigmoid يضغط أي قيمة لتصبح بين 0 و 1، مما يمثل احتمالية',
    },
  },
  {
    id: 'ml-5',
    courseId: 'ai-ml-basics',
    title: 'Decision Trees',
    description: 'شجرة القرارات للتصنيف والانحدار',
    content: `
# Decision Trees

نموذج يتخذ قرارات بناءً على أسئلة متسلسلة.

## الفكرة
مثل لعبة "20 سؤال":
- هل العمر > 30؟
  - نعم → هل الدخل > 50000؟
  - لا → هل متزوج؟

## المصطلحات

| المصطلح | المعنى |
|---------|--------|
| Root | العقدة الأولى |
| Node | نقطة قرار |
| Branch | فرع |
| Leaf | النتيجة النهائية |

## المميزات
- سهلة الفهم والتفسير
- لا تحتاج Scaling
- تتعامل مع النص والأرقام

## العيوب
- Overfitting سهل
- حساسة للتغييرات الصغيرة
- قد تكون معقدة جداً
`,
    codeExample: `from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import numpy as np

# بيانات: عمر، دخل، قرض_سابق → موافقة
X = np.array([
    [25, 30000, 0], [35, 50000, 1], [45, 70000, 1],
    [22, 25000, 0], [55, 80000, 1], [30, 40000, 0],
    [40, 60000, 1], [28, 35000, 0]
])
y = np.array([0, 1, 1, 0, 1, 0, 1, 0])  # 0=رفض، 1=موافقة

# تقسيم
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25)

# التدريب
model = DecisionTreeClassifier(max_depth=3, random_state=42)
model.fit(X_train, y_train)

# الدقة
print(f"الدقة: {model.score(X_test, y_test):.2%}")

# أهمية الميزات
features = ['العمر', 'الدخل', 'قرض_سابق']
for name, importance in zip(features, model.feature_importances_):
    print(f"{name}: {importance:.2%}")

# رسم الشجرة
plt.figure(figsize=(12, 8))
plot_tree(model, feature_names=features, filled=True)
plt.show()`,
    language: 'python',
    xpReward: 180,
    order: 5,
    quiz: {
      question: 'ما هو Overfitting في Decision Trees؟',
      options: [
        'النموذج بطيء',
        'النموذج يحفظ بيانات التدريب ولا يعمم',
        'النموذج لا يتعلم',
        'الشجرة صغيرة جداً',
      ],
      correctAnswer: 1,
      explanation:
        'Overfitting يحدث عندما تصبح الشجرة عميقة جداً فتحفظ التفاصيل بدلاً من التعلم',
    },
  },
  {
    id: 'ml-6',
    courseId: 'ai-ml-basics',
    title: 'Random Forest',
    description: 'قوة الغابات العشوائية',
    content: `
# Random Forest

مجموعة من Decision Trees تعمل معاً.

## الفكرة
"حكمة الجماهير" - عدة أشجار تصوت على النتيجة.

## كيف يعمل؟
1. إنشاء عينات عشوائية (Bootstrap)
2. بناء شجرة لكل عينة
3. كل شجرة تصوت
4. النتيجة = أغلبية الأصوات

## Hyperparameters

| المعامل | الوصف |
|---------|-------|
| n_estimators | عدد الأشجار |
| max_depth | عمق الشجرة |
| min_samples_split | الحد الأدنى للتقسيم |

## المميزات
- أدق من شجرة واحدة
- مقاوم للـ Overfitting
- يعطي أهمية الميزات
`,
    codeExample: `from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# تحميل البيانات
iris = load_iris()
X, y = iris.data, iris.target

# تقسيم
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# التدريب
model = RandomForestClassifier(
    n_estimators=100,  # 100 شجرة
    max_depth=5,
    random_state=42
)
model.fit(X_train, y_train)

# التقييم
y_pred = model.predict(X_test)
print(f"الدقة: {accuracy_score(y_test, y_pred):.2%}")

# أهمية الميزات
print("\\nأهمية الميزات:")
for name, importance in zip(iris.feature_names, model.feature_importances_):
    print(f"  {name}: {importance:.2%}")

# مقارنة مع شجرة واحدة
from sklearn.tree import DecisionTreeClassifier
single_tree = DecisionTreeClassifier(max_depth=5)
single_tree.fit(X_train, y_train)
print(f"\\nشجرة واحدة: {single_tree.score(X_test, y_test):.2%}")
print(f"Random Forest: {model.score(X_test, y_test):.2%}")`,
    language: 'python',
    xpReward: 190,
    order: 6,
    quiz: {
      question: 'لماذا Random Forest أفضل من Decision Tree واحدة؟',
      options: [
        'أسرع',
        'أبسط',
        'يقلل Overfitting بالتصويت الجماعي',
        'يستخدم ذاكرة أقل',
      ],
      correctAnswer: 2,
      explanation:
        'تجميع عدة أشجار يقلل التباين ويحسن التعميم على بيانات جديدة',
    },
  },
  {
    id: 'ml-7',
    courseId: 'ai-ml-basics',
    title: 'K-Nearest Neighbors',
    description: 'التصنيف بالجيران الأقرب',
    content: `
# K-Nearest Neighbors (KNN)

## الفكرة البسيطة
"قل لي من أصدقاؤك أقول لك من أنت"

## كيف يعمل؟
1. حدد K (عدد الجيران)
2. احسب المسافة لكل نقطة
3. اختر أقرب K جيران
4. صوّت للفئة الأكثر

## اختيار K
- K صغير = حساس للـ noise
- K كبير = بطيء وأقل دقة
- عادة: K = 3, 5, 7 (فردي)

## المسافات

| النوع | الصيغة |
|-------|--------|
| Euclidean | √Σ(x-y)² |
| Manhattan | Σ|x-y| |
| Minkowski | عام |

## ملاحظات
- يحتاج Scaling
- بطيء مع بيانات كبيرة
- لا يحتاج تدريب (Lazy)
`,
    codeExample: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import numpy as np

# بيانات
X = np.array([
    [1, 2], [1.5, 1.8], [5, 8], [8, 8],
    [1, 0.6], [9, 11], [8, 2], [10, 2]
])
y = np.array([0, 0, 1, 1, 0, 1, 0, 0])

# تقسيم
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25)

# Scaling مهم جداً لـ KNN
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# تجربة قيم K مختلفة
for k in [1, 3, 5, 7]:
    model = KNeighborsClassifier(n_neighbors=k)
    model.fit(X_train, y_train)
    acc = model.score(X_test, y_test)
    print(f"K={k}: الدقة = {acc:.2%}")

# النموذج الأفضل
best_model = KNeighborsClassifier(n_neighbors=3)
best_model.fit(X_train, y_train)

# تنبؤ جديد
new_point = scaler.transform([[5, 5]])
prediction = best_model.predict(new_point)
print(f"التنبؤ: {prediction[0]}")`,
    language: 'python',
    xpReward: 170,
    order: 7,
    quiz: {
      question: 'لماذا نختار K فردي في KNN؟',
      options: [
        'أسرع',
        'لتجنب التعادل في التصويت',
        'أدق دائماً',
        'يستخدم ذاكرة أقل',
      ],
      correctAnswer: 1,
      explanation: 'K فردي يمنع التعادل عند التصويت بين الفئات',
    },
  },
  {
    id: 'ml-8',
    courseId: 'ai-ml-basics',
    title: 'Support Vector Machines',
    description: 'آلات المتجهات الداعمة',
    content: `
# Support Vector Machines (SVM)

## الفكرة
إيجاد أفضل خط (أو سطح) يفصل بين الفئات.

## المصطلحات

| المصطلح | المعنى |
|---------|--------|
| Hyperplane | سطح الفصل |
| Margin | المسافة للأقرب |
| Support Vectors | النقاط الأقرب للخط |

## الهدف
تعظيم الـ Margin = أفضل تعميم

## Kernel Trick
للبيانات غير الخطية:
- Linear: خطي
- RBF: الأكثر استخداماً
- Polynomial: متعدد الحدود

## المميزات
- فعال للأبعاد العالية
- مقاوم للـ Overfitting
- يعمل مع بيانات صغيرة
`,
    codeExample: `from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification
import matplotlib.pyplot as plt
import numpy as np

# إنشاء بيانات
X, y = make_classification(n_samples=100, n_features=2, 
                           n_redundant=0, n_clusters_per_class=1)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Scaling
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# تجربة Kernels مختلفة
kernels = ['linear', 'rbf', 'poly']
for kernel in kernels:
    model = SVC(kernel=kernel)
    model.fit(X_train, y_train)
    acc = model.score(X_test, y_test)
    print(f"{kernel}: {acc:.2%}")

# RBF مع C مختلفة
for c in [0.1, 1, 10]:
    model = SVC(kernel='rbf', C=c)
    model.fit(X_train, y_train)
    acc = model.score(X_test, y_test)
    print(f"C={c}: {acc:.2%}")

# النموذج النهائي
final_model = SVC(kernel='rbf', C=1, probability=True)
final_model.fit(X_train, y_train)

# التنبؤ مع الاحتمالية
proba = final_model.predict_proba(X_test[:1])
print(f"احتمالية الفئات: {proba}")`,
    language: 'python',
    xpReward: 190,
    order: 8,
    quiz: {
      question: 'ما هي Support Vectors؟',
      options: [
        'كل نقاط البيانات',
        'النقاط الأقرب لخط الفصل',
        'النقاط الأبعد',
        'نقاط الاختبار',
      ],
      correctAnswer: 1,
      explanation:
        'Support Vectors هي النقاط الأقرب للـ Hyperplane وتحدد موقعه',
    },
  },
  {
    id: 'ml-9',
    courseId: 'ai-ml-basics',
    title: 'Clustering - K-Means',
    description: 'تجميع البيانات بدون إشراف',
    content: `
# K-Means Clustering

## Unsupervised Learning
لا توجد Labels - نكتشف الأنماط

## الفكرة
تقسيم البيانات لـ K مجموعات متشابهة

## الخوارزمية
1. اختر K مراكز عشوائية
2. اربط كل نقطة بأقرب مركز
3. احسب المراكز الجديدة (المتوسط)
4. كرر حتى الاستقرار

## اختيار K
- Elbow Method
- Silhouette Score

## الاستخدامات
- تقسيم العملاء
- ضغط الصور
- اكتشاف الشذوذ
`,
    codeExample: `from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import numpy as np

# إنشاء بيانات
np.random.seed(42)
X = np.vstack([
    np.random.randn(50, 2) + [0, 0],
    np.random.randn(50, 2) + [5, 5],
    np.random.randn(50, 2) + [10, 0]
])

# Scaling
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ===== Elbow Method =====
inertias = []
K_range = range(1, 10)

for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(X_scaled)
    inertias.append(kmeans.inertia_)

plt.plot(K_range, inertias, 'bo-')
plt.xlabel('K')
plt.ylabel('Inertia')
plt.title('Elbow Method')
plt.show()

# ===== K-Means مع K=3 =====
kmeans = KMeans(n_clusters=3, random_state=42)
labels = kmeans.fit_predict(X_scaled)

# رسم النتائج
plt.scatter(X[:, 0], X[:, 1], c=labels, cmap='viridis')
centers = scaler.inverse_transform(kmeans.cluster_centers_)
plt.scatter(centers[:, 0], centers[:, 1], c='red', marker='X', s=200)
plt.title('K-Means Clustering')
plt.show()

print(f"عدد النقاط في كل مجموعة:")
for i in range(3):
    print(f"  Cluster {i}: {(labels == i).sum()}")`,
    language: 'python',
    xpReward: 180,
    order: 9,
    quiz: {
      question: 'ما هو Elbow Method؟',
      options: [
        'طريقة تدريب',
        'طريقة اختيار K الأمثل',
        'نوع من Clustering',
        'طريقة تقييم',
      ],
      correctAnswer: 1,
      explanation:
        'Elbow Method يرسم Inertia مقابل K ونختار النقطة التي تشبه المرفق',
    },
  },
  {
    id: 'ml-10',
    courseId: 'ai-ml-basics',
    title: 'تقييم النماذج',
    description: 'مقاييس الأداء والتحقق',
    content: `
# تقييم النماذج

## لماذا التقييم مهم؟
- معرفة أداء النموذج الحقيقي
- مقارنة النماذج
- اكتشاف المشاكل

## مقاييس التصنيف

### Confusion Matrix
\`\`\`
              Predicted
            |  0  |  1  |
Actual  0   | TN  | FP  |
        1   | FN  | TP  |
\`\`\`

### المقاييس
| المقياس | الصيغة |
|---------|--------|
| Accuracy | (TP+TN) / Total |
| Precision | TP / (TP+FP) |
| Recall | TP / (TP+FN) |
| F1-Score | 2×P×R / (P+R) |

## Cross-Validation
تقسيم متعدد للحصول على تقييم أدق
`,
    codeExample: `from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, classification_report)
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import load_breast_cancer
import numpy as np

# تحميل البيانات
data = load_breast_cancer()
X, y = data.data, data.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# التدريب
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

# ===== المقاييس =====
print("=== مقاييس الأداء ===")
print(f"Accuracy:  {accuracy_score(y_test, y_pred):.2%}")
print(f"Precision: {precision_score(y_test, y_pred):.2%}")
print(f"Recall:    {recall_score(y_test, y_pred):.2%}")
print(f"F1-Score:  {f1_score(y_test, y_pred):.2%}")

# ===== Confusion Matrix =====
cm = confusion_matrix(y_test, y_pred)
print(f"\\nConfusion Matrix:\\n{cm}")

# ===== تقرير شامل =====
print("\\n=== Classification Report ===")
print(classification_report(y_test, y_pred, target_names=data.target_names))

# ===== Cross-Validation =====
scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
print(f"\\nCross-Validation Scores: {scores}")
print(f"Mean: {scores.mean():.2%} (+/- {scores.std()*2:.2%})")`,
    language: 'python',
    xpReward: 200,
    order: 10,
    quiz: {
      question: 'متى نستخدم F1-Score بدل Accuracy؟',
      options: [
        'دائماً',
        'عندما البيانات غير متوازنة',
        'عندما نريد السرعة',
        'للانحدار فقط',
      ],
      correctAnswer: 1,
      explanation:
        'F1-Score أفضل للبيانات غير المتوازنة لأنه يجمع Precision و Recall',
    },
  },
  {
    id: 'ml-11',
    courseId: 'ai-ml-basics',
    title: 'Overfitting و Regularization',
    description: 'مشكلة الإفراط في التعلم وحلولها',
    content: `
# Overfitting

## ما هو Overfitting؟
النموذج يحفظ التدريب ولا يعمم

## العلامات
- دقة تدريب عالية جداً
- دقة اختبار منخفضة
- فرق كبير بينهما

## Underfitting vs Overfitting

| الحالة | التدريب | الاختبار |
|--------|---------|----------|
| Underfitting | منخفض | منخفض |
| Good fit | عالي | عالي |
| Overfitting | عالي جداً | منخفض |

## الحلول

### 1. المزيد من البيانات
### 2. تبسيط النموذج
### 3. Regularization
### 4. Cross-Validation
### 5. Early Stopping
`,
    codeExample: `from sklearn.linear_model import Ridge, Lasso, LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import PolynomialFeatures
import numpy as np
import matplotlib.pyplot as plt

# إنشاء بيانات
np.random.seed(42)
X = np.linspace(0, 1, 50).reshape(-1, 1)
y = np.sin(2 * np.pi * X).ravel() + np.random.randn(50) * 0.3

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# ===== مقارنة درجات Polynomial =====
degrees = [1, 4, 15]
plt.figure(figsize=(15, 4))

for i, degree in enumerate(degrees):
    plt.subplot(1, 3, i + 1)
    
    poly = PolynomialFeatures(degree)
    X_poly_train = poly.fit_transform(X_train)
    X_poly_test = poly.transform(X_test)
    
    from sklearn.linear_model import LinearRegression
    model = LinearRegression()
    model.fit(X_poly_train, y_train)
    
    train_score = model.score(X_poly_train, y_train)
    test_score = model.score(X_poly_test, y_test)
    
    plt.scatter(X_train, y_train, label='Training')
    X_plot = np.linspace(0, 1, 100).reshape(-1, 1)
    y_plot = model.predict(poly.transform(X_plot))
    plt.plot(X_plot, y_plot, 'r-')
    plt.title(f'Degree {degree}\\nTrain: {train_score:.2f}, Test: {test_score:.2f}')

plt.show()

# ===== Regularization =====
print("\\n=== Regularization ===")
poly = PolynomialFeatures(15)
X_poly = poly.fit_transform(X_train)
X_poly_test = poly.transform(X_test)

# بدون Regularization
from sklearn.linear_model import LinearRegression
lr = LinearRegression()
lr.fit(X_poly, y_train)
print(f"Linear: Train={lr.score(X_poly, y_train):.2f}, Test={lr.score(X_poly_test, y_test):.2f}")

# Ridge (L2)
ridge = Ridge(alpha=0.1)
ridge.fit(X_poly, y_train)
print(f"Ridge:  Train={ridge.score(X_poly, y_train):.2f}, Test={ridge.score(X_poly_test, y_test):.2f}")

# Lasso (L1)
lasso = Lasso(alpha=0.01)
lasso.fit(X_poly, y_train)
print(f"Lasso:  Train={lasso.score(X_poly, y_train):.2f}, Test={lasso.score(X_poly_test, y_test):.2f}")`,
    language: 'python',
    xpReward: 200,
    order: 11,
    quiz: {
      question: 'ما الفرق بين Ridge و Lasso؟',
      options: [
        'لا فرق',
        'Ridge = L2 يصغر الأوزان، Lasso = L1 يلغي بعضها',
        'Lasso أسرع',
        'Ridge للتصنيف فقط',
      ],
      correctAnswer: 1,
      explanation:
        'Ridge يصغر الأوزان، Lasso يمكن أن يجعل بعضها صفر (Feature Selection)',
    },
  },
  {
    id: 'ml-12',
    courseId: 'ai-ml-basics',
    title: 'مشروع ML متكامل',
    description: 'تطبيق كل ما تعلمته',
    content: `
# مشروع: التنبؤ بأسعار المنازل

## الخطوات
1. تحميل واستكشاف البيانات
2. تنظيف ومعالجة البيانات
3. Feature Engineering
4. تقسيم البيانات
5. تجربة عدة نماذج
6. تحسين أفضل نموذج
7. التقييم النهائي

## أفضل الممارسات
- ابدأ بسيطاً
- قيّم باستمرار
- وثّق خطواتك
- لا تنظر للـ Test حتى النهاية
`,
    codeExample: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score

# ===== 1. تحميل البيانات =====
from sklearn.datasets import fetch_california_housing
data = fetch_california_housing()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = data.target

print("=== استكشاف البيانات ===")
print(X.head())
print(f"\\nالحجم: {X.shape}")
print(f"\\nالإحصائيات:\\n{X.describe()}")

# ===== 2. تحضير البيانات =====
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ===== 3. تجربة النماذج =====
models = {
    'Linear Regression': LinearRegression(),
    'Ridge': Ridge(alpha=1.0),
    'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
    'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42)
}

print("\\n=== مقارنة النماذج ===")
results = {}

for name, model in models.items():
    # Cross-validation
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
    
    # تدريب على كل التدريب
    model.fit(X_train_scaled, y_train)
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    
    results[name] = {
        'CV Mean': cv_scores.mean(),
        'Train R²': train_score,
        'Test R²': test_score
    }
    
    print(f"{name}:")
    print(f"  CV: {cv_scores.mean():.3f} (+/- {cv_scores.std()*2:.3f})")
    print(f"  Train R²: {train_score:.3f}, Test R²: {test_score:.3f}")

# ===== 4. أفضل نموذج =====
best_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
best_model.fit(X_train_scaled, y_train)

y_pred = best_model.predict(X_test_scaled)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"\\n=== النتائج النهائية ===")
print(f"RMSE: {rmse:.3f}")
print(f"R² Score: {r2:.3f}")

# أهمية الميزات
print("\\nأهمية الميزات:")
for name, importance in sorted(zip(X.columns, best_model.feature_importances_), 
                                key=lambda x: x[1], reverse=True):
    print(f"  {name}: {importance:.3f}")`,
    language: 'python',
    xpReward: 300,
    order: 12,
    quiz: {
      question: 'لماذا نستخدم Cross-Validation؟',
      options: [
        'للسرعة',
        'للحصول على تقييم أدق وأكثر موثوقية',
        'لتقليل البيانات',
        'للتدريب فقط',
      ],
      correctAnswer: 1,
      explanation:
        'Cross-Validation يعطي تقدير أفضل للأداء باستخدام كل البيانات للتدريب والاختبار',
    },
  },
];

// ===== دروس التعلم العميق - الجزء الأول =====
export const DEEP_LEARNING_LESSONS: Lesson[] = [
  {
    id: 'dl-1',
    courseId: 'ai-deep-learning',
    title: 'مقدمة في التعلم العميق',
    description: 'ما هو Deep Learning ولماذا هو مهم',
    content: `
# مقدمة في التعلم العميق

## ما هو التعلم العميق؟
فرع من ML يستخدم **شبكات عصبية** متعددة الطبقات.

## لماذا "عميق"؟
عدد الطبقات (Layers) الكبير = "العمق"

## الفرق عن ML التقليدي

| ML التقليدي | Deep Learning |
|-------------|---------------|
| Feature Engineering يدوي | يستخرج الميزات تلقائياً |
| بيانات صغيرة-متوسطة | بيانات ضخمة |
| أجهزة عادية | GPU مطلوب |
| سريع التدريب | بطيء لكن أدق |

## متى نستخدم DL؟
- الصور (تصنيف، كشف)
- النصوص (ترجمة، توليد)
- الصوت (تحويل، تعرف)
- الألعاب والروبوتات

## الأدوات
- TensorFlow (Google)
- PyTorch (Meta)
- Keras (High-level API)
`,
    codeExample: `# مقارنة ML التقليدي vs Deep Learning
import numpy as np

# ===== ML التقليدي =====
from sklearn.ensemble import RandomForestClassifier

# تحتاج تحضير الميزات يدوياً
# مثال: من صورة 28x28 نستخرج ميزات
features = extract_features(image)  # يدوياً!
rf = RandomForestClassifier()
rf.fit(X_features, y)

# ===== Deep Learning =====
import tensorflow as tf

# الشبكة تستخرج الميزات تلقائياً
model = tf.keras.Sequential([
    tf.keras.layers.Flatten(input_shape=(28, 28)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])

# ندخل الصورة مباشرة - بدون feature engineering!
model.fit(images, labels, epochs=5)

print("Deep Learning يتعلم الميزات تلقائياً!")`,
    language: 'python',
    xpReward: 160,
    order: 1,
    quiz: {
      question: 'ما الميزة الرئيسية للـ Deep Learning؟',
      options: [
        'أسرع دائماً',
        'يستخرج الميزات تلقائياً',
        'لا يحتاج بيانات',
        'أبسط من ML',
      ],
      correctAnswer: 1,
      explanation: 'DL يتعلم استخراج الميزات المهمة تلقائياً من البيانات الخام',
    },
  },
  {
    id: 'dl-2',
    courseId: 'ai-deep-learning',
    title: 'الشبكة العصبية الأساسية',
    description: 'بنية ومكونات Neural Network',
    content: `
# الشبكة العصبية

## المكونات الأساسية

### 1. Neuron (العصبون)
وحدة حسابية بسيطة:
\`\`\`
output = activation(weights × inputs + bias)
\`\`\`

### 2. Layer (الطبقة)
مجموعة من العصبونات

### 3. الطبقات الرئيسية
- **Input Layer**: استقبال البيانات
- **Hidden Layers**: المعالجة
- **Output Layer**: النتيجة

## Weights & Biases
- **Weights**: أوزان الاتصالات
- **Bias**: قيمة إضافية للمرونة

## Forward Propagation
تدفق البيانات من المدخل للمخرج:
\`\`\`
Input → Hidden 1 → Hidden 2 → Output
\`\`\`
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras

# ===== بناء شبكة بسيطة =====
model = keras.Sequential([
    # Input layer: 784 ميزة (صورة 28×28)
    keras.layers.Input(shape=(784,)),
    
    # Hidden layer 1: 128 عصبون
    keras.layers.Dense(128, activation='relu'),
    
    # Hidden layer 2: 64 عصبون
    keras.layers.Dense(64, activation='relu'),
    
    # Output layer: 10 أصناف
    keras.layers.Dense(10, activation='softmax')
])

# ملخص الشبكة
model.summary()

# ===== فهم المعاملات =====
# Dense(128) مع input 784:
# Weights: 784 × 128 = 100,352
# Biases: 128
# Total: 100,480 معامل

# Dense(64) مع input 128:
# Weights: 128 × 64 = 8,192
# Biases: 64
# Total: 8,256 معامل

print(f"إجمالي المعاملات: {model.count_params():,}")`,
    language: 'python',
    xpReward: 180,
    order: 2,
    quiz: {
      question: 'ما هي الـ Weights في الشبكة العصبية؟',
      options: [
        'البيانات المدخلة',
        'قوة الاتصال بين العصبونات',
        'عدد الطبقات',
        'سرعة التدريب',
      ],
      correctAnswer: 1,
      explanation: 'Weights تحدد قوة تأثير كل عصبون على العصبون التالي',
    },
  },
  {
    id: 'dl-3',
    courseId: 'ai-deep-learning',
    title: 'دوال التنشيط',
    description: 'Activation Functions وأهميتها',
    content: `
# دوال التنشيط

## لماذا نحتاجها؟
بدونها الشبكة = معادلة خطية فقط!

## الدوال الشائعة

### 1. ReLU (الأكثر استخداماً)
\`\`\`
f(x) = max(0, x)
\`\`\`
- سريعة وفعالة
- للطبقات المخفية

### 2. Sigmoid
\`\`\`
f(x) = 1 / (1 + e^(-x))
\`\`\`
- المخرج: 0 إلى 1
- للتصنيف الثنائي

### 3. Softmax
- المخرج: احتمالات (مجموعها 1)
- للتصنيف متعدد الفئات

### 4. Tanh
\`\`\`
f(x) = (e^x - e^(-x)) / (e^x + e^(-x))
\`\`\`
- المخرج: -1 إلى 1

## متى نستخدم ماذا؟

| الموقع | الدالة |
|--------|--------|
| Hidden layers | ReLU |
| Output (ثنائي) | Sigmoid |
| Output (متعدد) | Softmax |
`,
    codeExample: `import numpy as np
import matplotlib.pyplot as plt

# ===== تعريف الدوال =====
def relu(x):
    return np.maximum(0, x)

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def tanh(x):
    return np.tanh(x)

# ===== رسم الدوال =====
x = np.linspace(-5, 5, 100)

plt.figure(figsize=(12, 4))

plt.subplot(1, 3, 1)
plt.plot(x, relu(x))
plt.title('ReLU')
plt.grid(True)

plt.subplot(1, 3, 2)
plt.plot(x, sigmoid(x))
plt.title('Sigmoid')
plt.grid(True)

plt.subplot(1, 3, 3)
plt.plot(x, tanh(x))
plt.title('Tanh')
plt.grid(True)

plt.show()

# ===== في Keras =====
from tensorflow import keras

model = keras.Sequential([
    keras.layers.Dense(128, activation='relu'),      # Hidden
    keras.layers.Dense(64, activation='relu'),       # Hidden
    keras.layers.Dense(10, activation='softmax')     # Output (10 فئات)
])

# للتصنيف الثنائي
binary_model = keras.Sequential([
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(1, activation='sigmoid')      # Output (0 أو 1)
])`,
    language: 'python',
    xpReward: 170,
    order: 3,
    quiz: {
      question: 'أي دالة تنشيط نستخدم للتصنيف متعدد الفئات؟',
      options: ['ReLU', 'Sigmoid', 'Softmax', 'Tanh'],
      correctAnswer: 2,
      explanation:
        'Softmax تحول المخرجات لاحتمالات مجموعها 1، مثالية للتصنيف المتعدد',
    },
  },
  {
    id: 'dl-4',
    courseId: 'ai-deep-learning',
    title: 'Loss Functions',
    description: 'قياس خطأ النموذج',
    content: `
# Loss Functions

## ما هي Loss Function؟
دالة تقيس الفرق بين التنبؤ والقيمة الحقيقية.

## الهدف
تقليل الـ Loss = تحسين النموذج

## دوال الخسارة الشائعة

### للتصنيف
| الدالة | الاستخدام |
|--------|-----------|
| Binary Crossentropy | ثنائي (0/1) |
| Categorical Crossentropy | متعدد (one-hot) |
| Sparse Categorical | متعدد (أرقام) |

### للانحدار
| الدالة | الوصف |
|--------|-------|
| MSE | متوسط مربع الخطأ |
| MAE | متوسط الخطأ المطلق |
| Huber | مزيج MSE و MAE |

## مثال عملي
\`\`\`
تنبؤ: [0.9, 0.1]
حقيقي: [1, 0]
Loss = -log(0.9) ≈ 0.1
\`\`\`
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras

# ===== التصنيف الثنائي =====
binary_model = keras.Sequential([
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(1, activation='sigmoid')
])

binary_model.compile(
    optimizer='adam',
    loss='binary_crossentropy',  # للتصنيف الثنائي
    metrics=['accuracy']
)

# ===== التصنيف المتعدد =====
multi_model = keras.Sequential([
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(10, activation='softmax')
])

# إذا y = [0, 0, 1, 0, ...] (one-hot)
multi_model.compile(
    loss='categorical_crossentropy',
    optimizer='adam'
)

# إذا y = [2, 5, 0, 3, ...] (أرقام)
multi_model.compile(
    loss='sparse_categorical_crossentropy',
    optimizer='adam'
)

# ===== الانحدار =====
regression_model = keras.Sequential([
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(1)  # بدون activation
])

regression_model.compile(
    loss='mse',  # Mean Squared Error
    optimizer='adam'
)

print("اختر Loss Function بناءً على نوع المشكلة!")`,
    language: 'python',
    xpReward: 180,
    order: 4,
    quiz: {
      question: 'متى نستخدم sparse_categorical_crossentropy؟',
      options: [
        'للانحدار',
        'للتصنيف الثنائي',
        'للتصنيف المتعدد عندما y أرقام صحيحة',
        'دائماً',
      ],
      correctAnswer: 2,
      explanation:
        'sparse عندما تكون الـ labels أرقام (0,1,2...) وليست one-hot encoded',
    },
  },
  {
    id: 'dl-5',
    courseId: 'ai-deep-learning',
    title: 'Optimizers والتدريب',
    description: 'خوارزميات تحسين الشبكة',
    content: `
# Optimizers

## ما هو Optimizer؟
خوارزمية لتحديث Weights لتقليل Loss.

## Gradient Descent
الأساس لكل Optimizers:
\`\`\`
weight_new = weight_old - learning_rate × gradient
\`\`\`

## Learning Rate
- كبير جداً → لا يتقارب
- صغير جداً → بطيء جداً
- القيمة المثلى: 0.001 - 0.01

## Optimizers الشائعة

| Optimizer | المميزات |
|-----------|----------|
| SGD | بسيط، يحتاج ضبط |
| Adam | الأكثر استخداماً، تكيفي |
| RMSprop | جيد للـ RNN |
| AdaGrad | يتكيف تلقائياً |

## Adam (الأفضل للبداية)
يجمع مميزات عدة optimizers:
- Momentum
- Adaptive learning rate
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras

# ===== Optimizers المختلفة =====

# SGD البسيط
model.compile(
    optimizer=keras.optimizers.SGD(learning_rate=0.01),
    loss='sparse_categorical_crossentropy'
)

# SGD مع Momentum (أفضل)
model.compile(
    optimizer=keras.optimizers.SGD(learning_rate=0.01, momentum=0.9),
    loss='sparse_categorical_crossentropy'
)

# Adam (الأكثر استخداماً)
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy'
)

# أو ببساطة
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy')

# ===== التدريب =====
history = model.fit(
    X_train, y_train,
    epochs=10,           # عدد مرات المرور على البيانات
    batch_size=32,       # حجم الدفعة
    validation_split=0.2 # 20% للتحقق
)

# ===== رسم Loss =====
import matplotlib.pyplot as plt

plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.show()`,
    language: 'python',
    xpReward: 190,
    order: 5,
    quiz: {
      question: 'ما هو Learning Rate؟',
      options: [
        'عدد الطبقات',
        'حجم خطوة تحديث الأوزان',
        'سرعة الكمبيوتر',
        'عدد العصبونات',
      ],
      correctAnswer: 1,
      explanation: 'Learning Rate يحدد مقدار تغيير الأوزان في كل خطوة تدريب',
    },
  },
  {
    id: 'dl-6',
    courseId: 'ai-deep-learning',
    title: 'Backpropagation',
    description: 'كيف تتعلم الشبكة العصبية',
    content: `
# Backpropagation

## الفكرة
حساب تأثير كل Weight على الخطأ، ثم تحديثه.

## الخطوات

### 1. Forward Pass
المرور من Input → Output
\`\`\`
Input → Hidden → Output → Loss
\`\`\`

### 2. Backward Pass
حساب Gradients من Output → Input
\`\`\`
Loss → Output → Hidden → Input
\`\`\`

### 3. Update Weights
\`\`\`
W = W - lr × gradient
\`\`\`

## Chain Rule
المشتقات تتضاعف عبر الطبقات:
\`\`\`
∂Loss/∂W1 = ∂Loss/∂Out × ∂Out/∂H × ∂H/∂W1
\`\`\`

## لماذا "Back"?
لأننا نحسب من النهاية للبداية!
`,
    codeExample: `import numpy as np

# ===== Backpropagation يدوياً (للفهم) =====

# شبكة بسيطة: input → hidden → output
np.random.seed(42)

# البيانات
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([[0], [1], [1], [0]])  # XOR

# الأوزان العشوائية
W1 = np.random.randn(2, 4)  # 2 inputs → 4 hidden
W2 = np.random.randn(4, 1)  # 4 hidden → 1 output

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def sigmoid_derivative(x):
    return x * (1 - x)

learning_rate = 0.5

for epoch in range(10000):
    # === Forward Pass ===
    hidden = sigmoid(np.dot(X, W1))
    output = sigmoid(np.dot(hidden, W2))
    
    # === حساب الخطأ ===
    error = y - output
    
    # === Backward Pass ===
    # Gradient للطبقة الأخيرة
    d_output = error * sigmoid_derivative(output)
    
    # Gradient للطبقة المخفية
    error_hidden = d_output.dot(W2.T)
    d_hidden = error_hidden * sigmoid_derivative(hidden)
    
    # === Update Weights ===
    W2 += hidden.T.dot(d_output) * learning_rate
    W1 += X.T.dot(d_hidden) * learning_rate

print("التنبؤات النهائية:")
print(output.round(2))`,
    language: 'python',
    xpReward: 200,
    order: 6,
    quiz: {
      question: 'لماذا نسميه Backpropagation؟',
      options: [
        'لأنه يعود للبيانات الأصلية',
        'لأنه يحسب المشتقات من المخرج للمدخل',
        'لأنه بطيء',
        'لأنه يستخدم الذاكرة',
      ],
      correctAnswer: 1,
      explanation:
        'Back لأن حساب الـ Gradients يبدأ من طبقة المخرج وينتشر للخلف',
    },
  },
  {
    id: 'dl-7',
    courseId: 'ai-deep-learning',
    title: 'أول شبكة عصبية عملية',
    description: 'تصنيف الأرقام المكتوبة بخط اليد',
    content: `
# مشروع: تصنيف MNIST

## عن MNIST
- 70,000 صورة أرقام مكتوبة بخط اليد
- 28×28 pixels
- 10 فئات (0-9)
- "Hello World" للـ Deep Learning

## خطوات المشروع

1. تحميل البيانات
2. تحضير البيانات
3. بناء الشبكة
4. التدريب
5. التقييم

## النتيجة المتوقعة
دقة > 97% ممكنة!
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras
import matplotlib.pyplot as plt

# ===== 1. تحميل البيانات =====
(X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()

print(f"Training: {X_train.shape}")  # (60000, 28, 28)
print(f"Testing: {X_test.shape}")    # (10000, 28, 28)

# عرض بعض الصور
fig, axes = plt.subplots(1, 5, figsize=(10, 2))
for i, ax in enumerate(axes):
    ax.imshow(X_train[i], cmap='gray')
    ax.set_title(f"Label: {y_train[i]}")
    ax.axis('off')
plt.show()

# ===== 2. تحضير البيانات =====
# تسطيح الصور: 28×28 → 784
X_train = X_train.reshape(-1, 784) / 255.0
X_test = X_test.reshape(-1, 784) / 255.0

# ===== 3. بناء الشبكة =====
model = keras.Sequential([
    keras.layers.Dense(128, activation='relu', input_shape=(784,)),
    keras.layers.Dropout(0.2),  # لمنع Overfitting
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(10, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# ===== 4. التدريب =====
history = model.fit(
    X_train, y_train,
    epochs=10,
    batch_size=32,
    validation_split=0.1
)

# ===== 5. التقييم =====
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"دقة الاختبار: {test_acc:.2%}")

# تجربة على صورة
prediction = model.predict(X_test[:1])
print(f"التنبؤ: {prediction.argmax()}")
print(f"الفعلي: {y_test[0]}")`,
    language: 'python',
    xpReward: 250,
    order: 7,
    quiz: {
      question: 'ما وظيفة Dropout في الشبكة؟',
      options: [
        'تسريع التدريب',
        'منع Overfitting بإيقاف عصبونات عشوائية',
        'زيادة الدقة دائماً',
        'تقليل الطبقات',
      ],
      correctAnswer: 1,
      explanation:
        'Dropout يوقف عصبونات عشوائية أثناء التدريب لمنع الاعتماد الزائد',
    },
  },
  {
    id: 'dl-8',
    courseId: 'ai-deep-learning',
    title: 'Convolutional Neural Networks',
    description: 'الشبكات التلافيفية للصور',
    content: `
# CNN - Convolutional Neural Networks

## لماذا CNN للصور؟
- تستغل البنية المكانية
- أقل معاملات من Dense
- تكتشف الأنماط المحلية

## المكونات

### 1. Convolutional Layer
- Filter يتحرك على الصورة
- يستخرج Features
- حجم شائع: 3×3, 5×5

### 2. Pooling Layer
- تصغير الأبعاد
- Max Pooling الأشهر
- يحافظ على المهم

### 3. Flatten
- تحويل لـ 1D للـ Dense

## البنية النموذجية
\`\`\`
Input → [Conv → ReLU → Pool] × N → Flatten → Dense → Output
\`\`\`
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# ===== تحميل CIFAR-10 =====
(X_train, y_train), (X_test, y_test) = keras.datasets.cifar10.load_data()

# التطبيع
X_train = X_train / 255.0
X_test = X_test / 255.0

print(f"Shape: {X_train.shape}")  # (50000, 32, 32, 3)

# ===== بناء CNN =====
model = keras.Sequential([
    # Block 1
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 3)),
    layers.MaxPooling2D((2, 2)),
    
    # Block 2
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    
    # Block 3
    layers.Conv2D(64, (3, 3), activation='relu'),
    
    # Classification Head
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(10, activation='softmax')
])

model.summary()

# ===== التدريب =====
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

history = model.fit(
    X_train, y_train,
    epochs=10,
    batch_size=64,
    validation_split=0.1
)

# ===== التقييم =====
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {test_acc:.2%}")`,
    language: 'python',
    xpReward: 220,
    order: 8,
    quiz: {
      question: 'ما وظيفة Pooling Layer؟',
      options: [
        'زيادة الدقة',
        'تصغير الأبعاد والحفاظ على الميزات المهمة',
        'إضافة طبقات',
        'تسريع التنبؤ فقط',
      ],
      correctAnswer: 1,
      explanation:
        'Pooling يقلل الأبعاد ويجعل الشبكة أسرع ومقاومة للتغييرات الصغيرة',
    },
  },
  {
    id: 'dl-9',
    courseId: 'ai-deep-learning',
    title: 'Data Augmentation',
    description: 'توسيع البيانات لتحسين الأداء',
    content: `
# Data Augmentation

## المشكلة
بيانات قليلة = Overfitting

## الحل
إنشاء بيانات جديدة من الموجودة!

## تقنيات للصور

| التقنية | الوصف |
|---------|-------|
| Flip | قلب أفقي/عمودي |
| Rotation | تدوير |
| Zoom | تكبير/تصغير |
| Shift | إزاحة |
| Brightness | تغيير السطوع |

## المميزات
- لا تحتاج بيانات جديدة
- تحسن التعميم
- تقلل Overfitting

## ملاحظة
تُطبق على التدريب فقط!
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# ===== Data Augmentation Layer =====
data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
    layers.RandomTranslation(0.1, 0.1),
])

# ===== دمج مع النموذج =====
model = keras.Sequential([
    # Augmentation (تدريب فقط)
    data_augmentation,
    
    # CNN
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 3)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(10, activation='softmax')
])

# ===== أو باستخدام ImageDataGenerator =====
from tensorflow.keras.preprocessing.image import ImageDataGenerator

train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2
)

test_datagen = ImageDataGenerator(rescale=1./255)  # بدون augmentation!

# ===== عرض الـ Augmentation =====
import matplotlib.pyplot as plt

(X_train, y_train), _ = keras.datasets.cifar10.load_data()

plt.figure(figsize=(10, 4))
for i in range(5):
    augmented = data_augmentation(X_train[0:1])
    plt.subplot(1, 5, i+1)
    plt.imshow(augmented[0].numpy().astype('uint8'))
    plt.axis('off')
plt.suptitle('Data Augmentation Examples')
plt.show()`,
    language: 'python',
    xpReward: 180,
    order: 9,
    quiz: {
      question: 'متى نطبق Data Augmentation؟',
      options: [
        'على كل البيانات',
        'على بيانات التدريب فقط',
        'على بيانات الاختبار فقط',
        'بعد التدريب',
      ],
      correctAnswer: 1,
      explanation:
        'Augmentation للتدريب فقط، الاختبار يجب أن يكون على بيانات حقيقية',
    },
  },
  {
    id: 'dl-10',
    courseId: 'ai-deep-learning',
    title: 'Transfer Learning',
    description: 'استخدام نماذج مدربة مسبقاً',
    content: `
# Transfer Learning

## الفكرة
استخدام معرفة نموذج مُدرب على مهمة لمهمة أخرى.

## لماذا؟
- توفير الوقت والموارد
- أداء أفضل ببيانات قليلة
- النماذج المُدربة تعلمت ميزات عامة

## النماذج الشهيرة

| النموذج | الحجم | الدقة |
|---------|-------|-------|
| VGG16 | 528MB | جيدة |
| ResNet50 | 98MB | ممتازة |
| MobileNet | 16MB | خفيف |
| EfficientNet | متغير | الأفضل |

## الاستراتيجيات
1. **Feature Extraction**: تجميد الطبقات
2. **Fine-tuning**: فتح بعض الطبقات
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2

# ===== 1. تحميل النموذج المُدرب =====
base_model = MobileNetV2(
    weights='imagenet',      # أوزان ImageNet
    include_top=False,       # بدون الطبقة الأخيرة
    input_shape=(224, 224, 3)
)

# تجميد الطبقات
base_model.trainable = False

# ===== 2. إضافة طبقات جديدة =====
model = keras.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(10, activation='softmax')  # 10 فئات
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# ===== 3. التدريب الأول (Feature Extraction) =====
# history = model.fit(train_data, epochs=10)

# ===== 4. Fine-tuning (اختياري) =====
# فتح آخر 20 طبقة
base_model.trainable = True
for layer in base_model.layers[:-20]:
    layer.trainable = False

# إعادة Compile بـ learning rate صغير
model.compile(
    optimizer=keras.optimizers.Adam(1e-5),  # أصغر بكثير!
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# history = model.fit(train_data, epochs=5)

print(f"Total layers: {len(base_model.layers)}")
print(f"Trainable: {sum([l.trainable for l in base_model.layers])}")`,
    language: 'python',
    xpReward: 230,
    order: 10,
    quiz: {
      question: 'لماذا نستخدم learning rate صغير في Fine-tuning؟',
      options: [
        'للسرعة',
        'لعدم تدمير الأوزان المُتعلمة مسبقاً',
        'لزيادة الدقة دائماً',
        'لتوفير الذاكرة',
      ],
      correctAnswer: 1,
      explanation:
        'Learning rate صغير يُعدّل الأوزان برفق للحفاظ على المعرفة المُتعلمة',
    },
  },
  {
    id: 'dl-11',
    courseId: 'ai-deep-learning',
    title: 'Recurrent Neural Networks',
    description: 'الشبكات التكرارية للتسلسلات',
    content: `
# RNN - Recurrent Neural Networks

## لماذا RNN؟
للبيانات المتسلسلة حيث الترتيب مهم:
- النصوص
- الأسهم
- الصوت

## الفكرة
"ذاكرة" تنتقل من خطوة لأخرى

## المشكلة
Vanishing Gradient - صعوبة تذكر الماضي البعيد

## الحلول

### LSTM
- Long Short-Term Memory
- بوابات للتحكم بالذاكرة

### GRU
- Gated Recurrent Unit
- أبسط من LSTM
- أداء مشابه
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np

# ===== بيانات تجريبية: تنبؤ سلسلة =====
def create_sequences(data, seq_length):
    X, y = [], []
    for i in range(len(data) - seq_length):
        X.append(data[i:i+seq_length])
        y.append(data[i+seq_length])
    return np.array(X), np.array(y)

# سلسلة sin
data = np.sin(np.linspace(0, 100, 1000))
seq_length = 20

X, y = create_sequences(data, seq_length)
X = X.reshape(-1, seq_length, 1)  # (samples, timesteps, features)

split = int(len(X) * 0.8)
X_train, X_test = X[:split], X[split:]
y_train, y_test = y[:split], y[split:]

# ===== Simple RNN =====
rnn_model = keras.Sequential([
    layers.SimpleRNN(50, input_shape=(seq_length, 1)),
    layers.Dense(1)
])

# ===== LSTM =====
lstm_model = keras.Sequential([
    layers.LSTM(50, input_shape=(seq_length, 1)),
    layers.Dense(1)
])

# ===== GRU =====
gru_model = keras.Sequential([
    layers.GRU(50, input_shape=(seq_length, 1)),
    layers.Dense(1)
])

# ===== Stacked LSTM =====
stacked_model = keras.Sequential([
    layers.LSTM(50, return_sequences=True, input_shape=(seq_length, 1)),
    layers.LSTM(50),
    layers.Dense(1)
])

# التدريب
lstm_model.compile(optimizer='adam', loss='mse')
history = lstm_model.fit(X_train, y_train, epochs=20, validation_split=0.1, verbose=0)

# التقييم
loss = lstm_model.evaluate(X_test, y_test)
print(f"Test Loss: {loss:.4f}")

# التنبؤ
predictions = lstm_model.predict(X_test[:5])
print(f"Predictions: {predictions.flatten()}")
print(f"Actual: {y_test[:5]}")`,
    language: 'python',
    xpReward: 220,
    order: 11,
    quiz: {
      question: 'ما ميزة LSTM على RNN العادي؟',
      options: [
        'أسرع',
        'يحل مشكلة Vanishing Gradient',
        'يستخدم ذاكرة أقل',
        'للصور فقط',
      ],
      correctAnswer: 1,
      explanation: 'LSTM يستخدم بوابات تسمح له بتذكر المعلومات لفترات طويلة',
    },
  },
  {
    id: 'dl-12',
    courseId: 'ai-deep-learning',
    title: 'Word Embeddings',
    description: 'تمثيل الكلمات كأرقام',
    content: `
# Word Embeddings

## المشكلة
الكلمات نصوص، النماذج تحتاج أرقام!

## الحلول

### One-Hot Encoding
- كل كلمة vector من 0 و 1
- مشكلة: أبعاد ضخمة، لا علاقة بين الكلمات

### Word Embeddings
- كل كلمة vector كثيف صغير
- كلمات متشابهة = vectors قريبة

## Word2Vec
- CBOW: توقع كلمة من السياق
- Skip-gram: توقع السياق من كلمة

## في Keras
Embedding Layer يتعلم التمثيل
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np

# ===== مثال: تحليل المشاعر =====
# بيانات نصية
texts = [
    "هذا الفيلم رائع جداً",
    "فيلم سيء ومضيعة للوقت",
    "أحببت القصة كثيراً",
    "لن أشاهده مرة أخرى"
]
labels = [1, 0, 1, 0]  # 1=إيجابي، 0=سلبي

# ===== Tokenization =====
tokenizer = keras.preprocessing.text.Tokenizer(num_words=1000)
tokenizer.fit_on_texts(texts)
sequences = tokenizer.texts_to_sequences(texts)

# Padding
max_length = 10
padded = keras.preprocessing.sequence.pad_sequences(sequences, maxlen=max_length)

print(f"Vocabulary: {len(tokenizer.word_index)}")
print(f"Padded shape: {padded.shape}")

# ===== نموذج مع Embedding =====
vocab_size = 1000
embedding_dim = 32

model = keras.Sequential([
    layers.Embedding(vocab_size, embedding_dim, input_length=max_length),
    layers.GlobalAveragePooling1D(),  # أو LSTM/GRU
    layers.Dense(16, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])

model.compile(
    optimizer='adam',
    loss='binary_crossentropy',
    metrics=['accuracy']
)

model.summary()

# ===== استخدام Pre-trained Embeddings =====
# GloVe, FastText, Word2Vec
# embeddings_index = {}
# with open('glove.6B.100d.txt') as f:
#     for line in f:
#         values = line.split()
#         word = values[0]
#         coefs = np.asarray(values[1:], dtype='float32')
#         embeddings_index[word] = coefs

# # إنشاء Embedding Matrix
# embedding_matrix = np.zeros((vocab_size, embedding_dim))
# for word, i in tokenizer.word_index.items():
#     if i < vocab_size:
#         embedding_vector = embeddings_index.get(word)
#         if embedding_vector is not None:
#             embedding_matrix[i] = embedding_vector`,
    language: 'python',
    xpReward: 200,
    order: 12,
    quiz: {
      question: 'ما ميزة Word Embeddings على One-Hot؟',
      options: [
        'أسرع فقط',
        'تمثيل كثيف يحفظ العلاقات الدلالية بين الكلمات',
        'لا تحتاج تدريب',
        'أكبر حجماً',
      ],
      correctAnswer: 1,
      explanation:
        'Embeddings تمثل الكلمات المتشابهة بـ vectors قريبة في الفضاء',
    },
  },
  {
    id: 'dl-13',
    courseId: 'ai-deep-learning',
    title: 'Batch Normalization',
    description: 'تسريع وتحسين التدريب',
    content: `
# Batch Normalization

## المشكلة
- Internal Covariate Shift
- التدريب بطيء
- يحتاج learning rate صغير

## الحل
تطبيع المدخلات لكل طبقة

## الفوائد
- تدريب أسرع
- Learning rate أكبر
- يعمل كـ Regularization
- أقل حساسية للـ Initialization

## أين نضعه؟
بعد الطبقة، قبل أو بعد Activation
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# ===== بدون Batch Normalization =====
model_without_bn = keras.Sequential([
    layers.Dense(256, activation='relu', input_shape=(784,)),
    layers.Dense(128, activation='relu'),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])

# ===== مع Batch Normalization =====
model_with_bn = keras.Sequential([
    layers.Dense(256, input_shape=(784,)),
    layers.BatchNormalization(),
    layers.Activation('relu'),
    
    layers.Dense(128),
    layers.BatchNormalization(),
    layers.Activation('relu'),
    
    layers.Dense(64),
    layers.BatchNormalization(),
    layers.Activation('relu'),
    
    layers.Dense(10, activation='softmax')
])

# ===== في CNN =====
cnn_model = keras.Sequential([
    layers.Conv2D(32, (3, 3), input_shape=(28, 28, 1)),
    layers.BatchNormalization(),
    layers.Activation('relu'),
    layers.MaxPooling2D((2, 2)),
    
    layers.Conv2D(64, (3, 3)),
    layers.BatchNormalization(),
    layers.Activation('relu'),
    layers.MaxPooling2D((2, 2)),
    
    layers.Flatten(),
    layers.Dense(64),
    layers.BatchNormalization(),
    layers.Activation('relu'),
    layers.Dense(10, activation='softmax')
])

# ===== مقارنة =====
# تحميل MNIST
(X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()
X_train = X_train.reshape(-1, 784) / 255.0
X_test = X_test.reshape(-1, 784) / 255.0

for name, model in [('Without BN', model_without_bn), ('With BN', model_with_bn)]:
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    history = model.fit(X_train, y_train, epochs=5, validation_split=0.1, verbose=0)
    test_acc = model.evaluate(X_test, y_test, verbose=0)[1]
    print(f"{name}: Test Accuracy = {test_acc:.2%}")`,
    language: 'python',
    xpReward: 190,
    order: 13,
    quiz: {
      question: 'متى نضع Batch Normalization؟',
      options: [
        'في البداية فقط',
        'بعد الطبقة وقبل/بعد Activation',
        'في النهاية فقط',
        'لا يهم الترتيب',
      ],
      correctAnswer: 1,
      explanation: 'عادة بعد Dense/Conv وقبل أو بعد Activation، كلاهما يعمل',
    },
  },
  {
    id: 'dl-14',
    courseId: 'ai-deep-learning',
    title: 'Callbacks و Early Stopping',
    description: 'التحكم في عملية التدريب',
    content: `
# Callbacks

## ما هي Callbacks؟
دوال تُنفذ في نقاط معينة أثناء التدريب.

## Callbacks الشائعة

### EarlyStopping
- إيقاف التدريب عند توقف التحسن
- يمنع Overfitting

### ModelCheckpoint
- حفظ أفضل نموذج

### ReduceLROnPlateau
- تقليل Learning Rate عند الثبات

### TensorBoard
- مراقبة التدريب بصرياً

## لماذا مهمة؟
- توفير الوقت
- الحصول على أفضل نموذج
- منع Overfitting
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras

# ===== EarlyStopping =====
early_stop = keras.callbacks.EarlyStopping(
    monitor='val_loss',     # ما نراقبه
    patience=5,             # عدد epochs بدون تحسن
    restore_best_weights=True,  # استرجاع الأفضل
    verbose=1
)

# ===== ModelCheckpoint =====
checkpoint = keras.callbacks.ModelCheckpoint(
    'best_model.keras',     # مسار الحفظ
    monitor='val_accuracy',
    save_best_only=True,    # أفضل نموذج فقط
    verbose=1
)

# ===== ReduceLROnPlateau =====
reduce_lr = keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,             # LR الجديد = القديم × 0.5
    patience=3,
    min_lr=1e-7,
    verbose=1
)

# ===== TensorBoard =====
tensorboard = keras.callbacks.TensorBoard(
    log_dir='./logs',
    histogram_freq=1
)

# ===== Custom Callback =====
class PrintProgress(keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs=None):
        if (epoch + 1) % 5 == 0:
            print(f"\\n=== Epoch {epoch+1} ===")
            print(f"Loss: {logs['loss']:.4f}")
            print(f"Val Loss: {logs['val_loss']:.4f}")

# ===== استخدام Callbacks =====
(X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()
X_train = X_train.reshape(-1, 784) / 255.0
X_test = X_test.reshape(-1, 784) / 255.0

model = keras.Sequential([
    keras.layers.Dense(128, activation='relu', input_shape=(784,)),
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(10, activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

history = model.fit(
    X_train, y_train,
    epochs=100,  # كثير عمداً
    validation_split=0.2,
    callbacks=[early_stop, checkpoint, reduce_lr, PrintProgress()],
    verbose=1
)

print(f"\\nتوقف عند epoch: {len(history.history['loss'])}")`,
    language: 'python',
    xpReward: 200,
    order: 14,
    quiz: {
      question: 'ما وظيفة patience في EarlyStopping؟',
      options: [
        'عدد الطبقات',
        'عدد epochs المسموح بدون تحسن قبل التوقف',
        'حجم الـ batch',
        'سرعة التدريب',
      ],
      correctAnswer: 1,
      explanation: 'patience يحدد كم epoch ننتظر بدون تحسن قبل إيقاف التدريب',
    },
  },
  {
    id: 'dl-15',
    courseId: 'ai-deep-learning',
    title: 'مشروع Deep Learning متكامل',
    description: 'تصنيف الصور باحترافية',
    content: `
# مشروع: تصنيف الصور

## الهدف
بناء مُصنف صور احترافي باستخدام كل ما تعلمناه.

## المكونات
1. Data Augmentation
2. Transfer Learning
3. Batch Normalization
4. Callbacks
5. Fine-tuning

## أفضل الممارسات
- ابدأ بـ Feature Extraction
- راقب Overfitting
- استخدم Early Stopping
- Fine-tune بحذر
`,
    codeExample: `import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import EfficientNetB0

# ===== 1. تحميل البيانات =====
(X_train, y_train), (X_test, y_test) = keras.datasets.cifar10.load_data()

# Resize لـ EfficientNet
X_train = tf.image.resize(X_train, (224, 224))
X_test = tf.image.resize(X_test, (224, 224))

# ===== 2. Data Augmentation =====
data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
])

# ===== 3. Transfer Learning =====
base_model = EfficientNetB0(
    weights='imagenet',
    include_top=False,
    input_shape=(224, 224, 3)
)
base_model.trainable = False

# ===== 4. بناء النموذج =====
inputs = keras.Input(shape=(224, 224, 3))
x = data_augmentation(inputs)
x = keras.applications.efficientnet.preprocess_input(x)
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dense(256, activation='relu')(x)
x = layers.Dropout(0.5)(x)
x = layers.BatchNormalization()(x)
outputs = layers.Dense(10, activation='softmax')(x)

model = keras.Model(inputs, outputs)

# ===== 5. Callbacks =====
callbacks = [
    keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
    keras.callbacks.ModelCheckpoint('best_model.keras', save_best_only=True),
    keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=3)
]

# ===== 6. التدريب الأول =====
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

print("=== Feature Extraction ===")
history = model.fit(
    X_train, y_train,
    epochs=10,
    validation_split=0.1,
    callbacks=callbacks,
    batch_size=32
)

# ===== 7. Fine-tuning =====
print("\\n=== Fine-tuning ===")
base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=keras.optimizers.Adam(1e-5),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

history_fine = model.fit(
    X_train, y_train,
    epochs=10,
    validation_split=0.1,
    callbacks=callbacks,
    batch_size=32
)

# ===== 8. التقييم النهائي =====
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"\\n=== النتيجة النهائية ===")
print(f"Test Accuracy: {test_acc:.2%}")

# حفظ النموذج
model.save('cifar10_classifier.keras')
print("تم حفظ النموذج!")`,
    language: 'python',
    xpReward: 350,
    order: 15,
    quiz: {
      question: 'ما الترتيب الصحيح لبناء مُصنف صور؟',
      options: [
        'Fine-tuning ثم Feature Extraction',
        'Feature Extraction أولاً ثم Fine-tuning',
        'التدريب من الصفر دائماً',
        'لا يهم الترتيب',
      ],
      correctAnswer: 1,
      explanation:
        'نبدأ بـ Feature Extraction لتدريب الطبقات الجديدة، ثم Fine-tuning لتحسين الأداء',
    },
  },
];

// ===== تحديات AI =====
export const AI_CHALLENGES: Challenge[] = [
  {
    id: 'ai-challenge-1',
    title: 'تصنيف الأزهار',
    description: 'صنف أزهار Iris باستخدام ML',
    difficulty: 'easy',
    points: 150,
    language: 'Python',
    icon: 'code',
    starterCode: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
# أكمل الكود

# تحميل البيانات
iris = load_iris()
X, y = iris.data, iris.target

# قسم البيانات

# اختر نموذج وتدريبه

# قيم النموذج

print(f"الدقة: {accuracy:.2%}")`,
    solution: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

iris = load_iris()
X, y = iris.data, iris.target

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

model = RandomForestClassifier()
model.fit(X_train, y_train)

predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"الدقة: {accuracy:.2%}")`,
    hints: [
      'استخدم train_test_split للتقسيم',
      'جرب RandomForestClassifier أو LogisticRegression',
      'استخدم accuracy_score للتقييم',
    ],
    testCases: [
      {
        input:
          'print(sum(a == b for a, b in zip([0,1,1,0,1], [0,1,0,0,1])) / 5)',
        expectedOutput: '0.8',
        description: 'حساب دقة التصنيف',
      },
      {
        input:
          'data = list(range(10))\nsplit = int(len(data) * 0.8)\nprint(len(data[:split]), len(data[split:]))',
        expectedOutput: '8 2',
        description: 'تقسيم البيانات 80/20',
      },
      {
        input:
          'from collections import Counter\nprint(Counter([0,0,0,1,1,2,2,2,2]).most_common(1)[0][0])',
        expectedOutput: '2',
        description: 'إيجاد الفئة الأكثر تكراراً',
      },
    ],
    isLocked: false,
    category: 'ml',
  },
  {
    id: 'ai-challenge-2',
    title: 'تحليل المشاعر',
    description: 'حلل مشاعر التعليقات (إيجابي/سلبي)',
    difficulty: 'medium',
    points: 200,
    language: 'Python',
    icon: 'code',
    starterCode: `# بناء نموذج تحليل مشاعر
comments = [
    ("منتج رائع", 1),
    ("سيء جداً", 0),
    # أضف المزيد
]

# أكمل الكود:
# 1. حضر البيانات
# 2. استخدم TfidfVectorizer
# 3. درب النموذج
# 4. جرب على نص جديد`,
    solution: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split

comments = [
    ("منتج رائع", 1), ("خدمة ممتازة", 1),
    ("سيء جداً", 0), ("لن أشتري مرة أخرى", 0),
]

texts, labels = zip(*comments)

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

model = MultinomialNB()
model.fit(X, labels)

new_text = vectorizer.transform(["منتج جميل"])
print(model.predict(new_text))`,
    hints: [
      'TfidfVectorizer لتحويل النص لأرقام',
      'MultinomialNB مناسب لتصنيف النصوص',
      'لا تنسَ transform للنص الجديد',
    ],
    testCases: [
      {
        input:
          'pos = {"great","amazing","excellent"}\nwords = "great amazing product".split()\nprint(sum(w in pos for w in words))',
        expectedOutput: '2',
        description: 'عد الكلمات الإيجابية',
      },
      {
        input:
          'from collections import Counter\nprint(Counter("the cat sat on the mat the cat".split())["the"])',
        expectedOutput: '3',
        description: 'حساب تكرار الكلمة (TF)',
      },
      {
        input:
          'pos = {"great","good"}\nneg = {"bad","terrible"}\nwords = "bad terrible day".split()\nscore = sum(w in pos for w in words) - sum(w in neg for w in words)\nprint(1 if score > 0 else 0)',
        expectedOutput: '0',
        description: 'تصنيف نص سلبي',
      },
    ],
    isLocked: false,
    category: 'nlp',
  },
  {
    id: 'ai-challenge-3',
    title: 'التنبؤ بأسعار المنازل',
    description: 'بناء نموذج Regression للتنبؤ بالأسعار',
    difficulty: 'medium',
    points: 180,
    language: 'Python',
    icon: 'home',
    starterCode: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# بيانات افتراضية: [مساحة, غرف, عمر]
X = np.array([
    [120, 3, 5], [150, 4, 3], [80, 2, 10],
    [200, 5, 1], [100, 2, 8], [180, 4, 2]
])
y = np.array([250000, 350000, 150000, 500000, 180000, 420000])

# أكمل الكود:
# 1. قسم البيانات
# 2. أنشئ ودرب النموذج
# 3. تنبأ واحسب الأخطاء`,
    solution: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

X = np.array([
    [120, 3, 5], [150, 4, 3], [80, 2, 10],
    [200, 5, 1], [100, 2, 8], [180, 4, 2]
])
y = np.array([250000, 350000, 150000, 500000, 180000, 420000])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)

predictions = model.predict(X_test)
mse = mean_squared_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print(f"MSE: {mse:.2f}")
print(f"R²: {r2:.2f}")
print(f"معاملات: {model.coef_}")`,
    hints: [
      'LinearRegression للانحدار الخطي',
      'MSE: متوسط مربع الخطأ',
      'R²: معامل التحديد (أقرب لـ 1 أفضل)',
    ],
    testCases: [
      {
        input:
          'actual = [3, 5, 7]\npred = [2.5, 5.0, 7.5]\nmse = sum((a-p)**2 for a,p in zip(actual, pred)) / len(actual)\nprint(round(mse, 2))',
        expectedOutput: '0.17',
        description: 'حساب متوسط مربع الخطأ MSE',
      },
      {
        input: 'print(150 * 2500 + 50000)',
        expectedOutput: '425000',
        description: 'التنبؤ الخطي: y = mx + b',
      },
      {
        input:
          'a = [100, 200, 300]\np = [110, 190, 310]\nmean_a = sum(a)/len(a)\nss_res = sum((ai-pi)**2 for ai,pi in zip(a,p))\nss_tot = sum((ai-mean_a)**2 for ai in a)\nprint(round(1 - ss_res/ss_tot, 4))',
        expectedOutput: '0.985',
        description: 'حساب معامل التحديد R²',
      },
    ],
    isLocked: false,
    category: 'ml',
  },
  {
    id: 'ai-challenge-4',
    title: 'تجميع العملاء (Clustering)',
    description: 'تقسيم العملاء لمجموعات باستخدام K-Means',
    difficulty: 'medium',
    points: 200,
    language: 'Python',
    icon: 'people',
    starterCode: `import numpy as np
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

# بيانات العملاء: [العمر, الدخل السنوي, نقاط الإنفاق]
customers = np.array([
    [25, 30000, 70], [45, 80000, 20], [35, 50000, 50],
    [22, 25000, 80], [50, 90000, 15], [30, 40000, 60],
    [28, 35000, 75], [48, 85000, 25], [40, 60000, 40],
])

# أكمل الكود:
# 1. أنشئ نموذج KMeans بـ 3 مجموعات
# 2. توقع المجموعات
# 3. اطبع مراكز المجموعات`,
    solution: `import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

customers = np.array([
    [25, 30000, 70], [45, 80000, 20], [35, 50000, 50],
    [22, 25000, 80], [50, 90000, 15], [30, 40000, 60],
    [28, 35000, 75], [48, 85000, 25], [40, 60000, 40],
])

# تطبيع البيانات
scaler = StandardScaler()
X_scaled = scaler.fit_transform(customers)

# K-Means
kmeans = KMeans(n_clusters=3, random_state=42)
labels = kmeans.fit_predict(X_scaled)

print("تصنيف العملاء:", labels)
print("مراكز المجموعات:")
print(scaler.inverse_transform(kmeans.cluster_centers_))`,
    hints: [
      'تطبيع البيانات مهم قبل K-Means',
      'استخدم StandardScaler',
      'n_clusters يحدد عدد المجموعات',
    ],
    testCases: [
      {
        input:
          'import math\nprint(round(math.sqrt(sum((a-b)**2 for a,b in zip([1,2],[4,6]))), 1))',
        expectedOutput: '5.0',
        description: 'حساب المسافة الإقليدية',
      },
      {
        input:
          'centroids = [[0,0],[10,10],[20,20]]\npoint = [9,11]\ndists = [sum((a-b)**2 for a,b in zip(point,c))**0.5 for c in centroids]\nprint(dists.index(min(dists)))',
        expectedOutput: '1',
        description: 'تعيين أقرب مركز عنقود',
      },
      {
        input:
          'data = [10, 20, 30, 40, 50]\nmn, mx = min(data), max(data)\nprint([round((x-mn)/(mx-mn), 2) for x in data])',
        expectedOutput: '[0.0, 0.25, 0.5, 0.75, 1.0]',
        description: 'تطبيع البيانات Min-Max',
      },
    ],
    isLocked: false,
    category: 'ml',
  },
  {
    id: 'ai-challenge-5',
    title: 'شبكة عصبية بسيطة',
    description: 'بناء Neural Network لتصنيف الأرقام',
    difficulty: 'hard',
    points: 250,
    language: 'Python',
    icon: 'git-network',
    starterCode: `import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report

# تحميل MNIST المصغر
digits = load_digits()
X, y = digits.data, digits.target

# أكمل الكود:
# 1. قسم البيانات
# 2. أنشئ MLPClassifier مع طبقتين مخفيتين
# 3. درب النموذج
# 4. اطبع تقرير التصنيف`,
    solution: `import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report

digits = load_digits()
X, y = digits.data, digits.target

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

mlp = MLPClassifier(
    hidden_layer_sizes=(128, 64),
    max_iter=500,
    random_state=42
)
mlp.fit(X_train, y_train)

predictions = mlp.predict(X_test)
print(classification_report(y_test, predictions))
print(f"دقة: {mlp.score(X_test, y_test):.2%}")`,
    hints: [
      'hidden_layer_sizes تحدد عدد وحجم الطبقات',
      'max_iter يحدد عدد التكرارات',
      'جرب أحجام مختلفة للطبقات',
    ],
    testCases: [
      {
        input: 'import math\nprint(round(1 / (1 + math.exp(0)), 1))',
        expectedOutput: '0.5',
        description: 'دالة Sigmoid عند x=0',
      },
      {
        input: 'relu = lambda x: max(0, x)\nprint(relu(-3), relu(0), relu(5))',
        expectedOutput: '0 0 5',
        description: 'دالة ReLU',
      },
      {
        input:
          'inputs = [1, 2, 3]\nweights = [0.5, -0.5, 0.2]\nbias = 0.1\nprint(round(sum(i*w for i,w in zip(inputs, weights)) + bias, 1))',
        expectedOutput: '0.2',
        description: 'حساب التمرير الأمامي (forward pass)',
      },
    ],
    isLocked: true,
    category: 'deep-learning',
  },
  {
    id: 'ai-challenge-6',
    title: 'معالجة الصور مع CNN',
    description: 'تصنيف صور CIFAR-10 باستخدام PyTorch',
    difficulty: 'hard',
    points: 300,
    language: 'Python',
    icon: 'image',
    starterCode: `import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms

# تحويلات البيانات
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

# أكمل الكود:
# 1. حمل بيانات CIFAR-10
# 2. أنشئ شبكة CNN
# 3. درب لـ 5 epochs
# 4. قيم على بيانات الاختبار`,
    solution: `import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

trainset = datasets.CIFAR10(root='./data', train=True, download=True, transform=transform)
trainloader = DataLoader(trainset, batch_size=32, shuffle=True)

class SimpleCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, 3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        self.fc1 = nn.Linear(64 * 8 * 8, 256)
        self.fc2 = nn.Linear(256, 10)
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.pool(self.relu(self.conv1(x)))
        x = self.pool(self.relu(self.conv2(x)))
        x = x.view(-1, 64 * 8 * 8)
        x = self.relu(self.fc1(x))
        return self.fc2(x)

model = SimpleCNN()
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

for epoch in range(5):
    for images, labels in trainloader:
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
    print(f"Epoch {epoch+1}: Loss = {loss.item():.4f}")`,
    hints: [
      'Conv2d + ReLU + MaxPool = طبقة CNN',
      'Flatten قبل الطبقات الكاملة',
      'استخدم Adam optimizer',
    ],
    testCases: [
      {
        input:
          'img = [[1,2,3],[4,5,6],[7,8,9]]\nk = [[1,0],[0,1]]\nresult = [[sum(img[i+ki][j+kj]*k[ki][kj] for ki in range(2) for kj in range(2)) for j in range(2)] for i in range(2)]\nprint(result)',
        expectedOutput: '[[6, 8], [12, 14]]',
        description: 'عملية التفاف ثنائية الأبعاد',
      },
      {
        input:
          'm = [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]\nresult = [[max(m[i*2+di][j*2+dj] for di in range(2) for dj in range(2)) for j in range(2)] for i in range(2)]\nprint(result)',
        expectedOutput: '[[6, 8], [14, 16]]',
        description: 'عملية Max Pooling 2x2',
      },
      {
        input:
          'import math\ndef softmax(x):\n    e = [math.exp(i) for i in x]\n    s = sum(e)\n    return [round(i/s, 2) for i in e]\nprint(softmax([1, 2, 3]))',
        expectedOutput: '[0.09, 0.24, 0.67]',
        description: 'دالة Softmax',
      },
    ],
    isLocked: true,
    category: 'deep-learning',
  },
  {
    id: 'ai-challenge-7',
    title: 'نظام التوصيات',
    description: 'بناء Recommendation System بسيط',
    difficulty: 'medium',
    points: 220,
    language: 'Python',
    icon: 'star',
    starterCode: `import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# مصفوفة التقييمات: صفوف=مستخدمين, أعمدة=أفلام
ratings = np.array([
    [5, 3, 0, 1],
    [4, 0, 0, 1],
    [1, 1, 0, 5],
    [0, 0, 5, 4],
    [0, 1, 5, 4],
])

# أكمل الكود:
# 1. احسب التشابه بين المستخدمين
# 2. وصي بأفلام للمستخدم 0
# بناءً على المستخدمين المشابهين`,
    solution: `import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

ratings = np.array([
    [5, 3, 0, 1],
    [4, 0, 0, 1],
    [1, 1, 0, 5],
    [0, 0, 5, 4],
    [0, 1, 5, 4],
])

# حساب التشابه
similarity = cosine_similarity(ratings)
print("مصفوفة التشابه:")
print(similarity.round(2))

# توصيات للمستخدم 0
user_idx = 0
similar_users = np.argsort(similarity[user_idx])[::-1][1:]

# الأفلام التي لم يشاهدها
unwatched = np.where(ratings[user_idx] == 0)[0]

recommendations = {}
for movie in unwatched:
    weighted_sum = 0
    sim_sum = 0
    for other in similar_users:
        if ratings[other, movie] > 0:
            weighted_sum += similarity[user_idx, other] * ratings[other, movie]
            sim_sum += similarity[user_idx, other]
    if sim_sum > 0:
        recommendations[movie] = weighted_sum / sim_sum

print(f"\\nتوصيات للمستخدم {user_idx}:")
for movie, score in sorted(recommendations.items(), key=lambda x: -x[1]):
    print(f"  فيلم {movie}: {score:.2f}")`,
    hints: [
      'cosine_similarity يقيس التشابه',
      'استخدم المتوسط الموزون',
      'وزن التقييمات بحسب التشابه',
    ],
    testCases: [
      {
        input:
          'import math\na,b = [1,2,3],[2,4,6]\ndot = sum(x*y for x,y in zip(a,b))\nmag = math.sqrt(sum(x**2 for x in a)) * math.sqrt(sum(x**2 for x in b))\nprint(round(dot/mag, 2))',
        expectedOutput: '1.0',
        description: 'تشابه الجيب تمام (متجهان متناسبان)',
      },
      {
        input:
          'import math\na,b = [1,0,0],[0,1,0]\ndot = sum(x*y for x,y in zip(a,b))\nmag = math.sqrt(sum(x**2 for x in a)) * math.sqrt(sum(x**2 for x in b))\nprint(round(dot/mag, 2))',
        expectedOutput: '0.0',
        description: 'تشابه الجيب تمام (متجهان متعامدان)',
      },
      {
        input:
          'ratings = [[5,3,0,1],[4,0,0,1],[1,1,0,5]]\nprint([i for i, r in enumerate(ratings[0]) if r == 0])',
        expectedOutput: '[2]',
        description: 'إيجاد العناصر غير المقيّمة',
      },
    ],
    isLocked: false,
    category: 'ml',
  },
  {
    id: 'ai-challenge-8',
    title: 'معالجة اللغة NLP',
    description: 'استخراج الكيانات من النصوص',
    difficulty: 'hard',
    points: 280,
    language: 'Python',
    icon: 'text',
    starterCode: `# استخدام spaCy لاستخراج الكيانات
# pip install spacy
# python -m spacy download en_core_web_sm

text = """
Apple Inc. was founded by Steve Jobs in Cupertino, California.
The company announced $100 billion in revenue for 2023.
Tim Cook is the current CEO.
"""

# أكمل الكود:
# 1. حمل نموذج spaCy
# 2. حلل النص
# 3. استخرج الكيانات (الأشخاص، الشركات، المواقع، الأرقام)`,
    solution: `import spacy

nlp = spacy.load("en_core_web_sm")

text = """
Apple Inc. was founded by Steve Jobs in Cupertino, California.
The company announced $100 billion in revenue for 2023.
Tim Cook is the current CEO.
"""

doc = nlp(text)

print("الكيانات المستخرجة:")
print("-" * 40)

entities_by_type = {}
for ent in doc.ents:
    if ent.label_ not in entities_by_type:
        entities_by_type[ent.label_] = []
    entities_by_type[ent.label_].append(ent.text)

for label, entities in entities_by_type.items():
    print(f"{label}:")
    for e in entities:
        print(f"  - {e}")

# تحليل إضافي
print("\\nالأفعال في النص:")
for token in doc:
    if token.pos_ == "VERB":
        print(f"  - {token.text} ({token.lemma_})")`,
    hints: [
      'spacy.load للنموذج',
      'doc.ents للكيانات',
      'ent.label_ لنوع الكيان',
    ],
    testCases: [
      {
        input:
          'import re\nprint(re.findall(r"[A-Z][a-z]+", "Steve Jobs founded Apple in California"))',
        expectedOutput: "['Steve', 'Jobs', 'Apple', 'California']",
        description: 'استخراج الكيانات المسماة',
      },
      {
        input:
          'from collections import Counter\nwords = "the cat sat on the mat the cat".split()\nfreq = Counter(words)\nprint(sorted(freq.items(), key=lambda x: -x[1])[:2])',
        expectedOutput: "[('the', 3), ('cat', 2)]",
        description: 'أكثر الكلمات تكراراً',
      },
      {
        input:
          'import re\ntext = "Call 123-456-7890 or email test@mail.com"\nprint(bool(re.search(r"\\d{3}-\\d{3}-\\d{4}", text)))',
        expectedOutput: 'True',
        description: 'استخراج نمط (رقم هاتف)',
      },
    ],
    isLocked: true,
    category: 'nlp',
  },
];

// ===== التصدير =====
export const ALL_AI_LESSONS: Lesson[] = [
  ...AI_BEGINNER_LESSONS,
  ...ML_BASICS_LESSONS,
  ...DEEP_LEARNING_LESSONS,
];
export const ALL_AI_CHALLENGES: Challenge[] = AI_CHALLENGES;
