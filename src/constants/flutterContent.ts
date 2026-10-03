/**
 * Flutter Course Content - محتوى دورة Flutter
 * محتوى ضخم وشامل لتعلم Flutter من الصفر للاحتراف
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس Flutter للمبتدئين =====
export const FLUTTER_LESSONS_BEGINNER: Lesson[] = [
  {
    id: 'flutter-intro-001',
    courseId: 'flutter-basics',
    title: 'مقدمة في Flutter',
    description: 'تعرف على Flutter وكيف يعمل',
    content: `# مقدمة في Flutter

## ما هو Flutter؟

Flutter هو إطار عمل من Google لبناء تطبيقات جميلة وسريعة للموبايل والويب وسطح المكتب من كود واحد.

### مميزات Flutter:

1. **Hot Reload**: شاهد التغييرات فوراً خلال ثانية!
2. **كود واحد - كل المنصات**: iOS, Android, Web, Desktop
3. **أداء ممتاز**: يُترجم مباشرة لكود أصلي (ARM)
4. **تصميم جميل**: مكتبة Widgets غنية جداً
5. **مجاني ومفتوح المصدر**

### لغة Dart

Flutter يستخدم لغة Dart من Google:

\`\`\`dart
void main() {
  print('مرحباً بالعالم!');
}

// المتغيرات
var name = 'أحمد';        // نوع تلقائي
String city = 'بغداد';     // نوع محدد
int age = 25;
double price = 99.99;
bool isActive = true;

// const و final
const pi = 3.14;          // ثابت وقت الترجمة
final now = DateTime.now(); // ثابت وقت التشغيل

// القوائم
List<String> names = ['أحمد', 'محمد', 'علي'];
names.add('حسين');

// الخرائط
Map<String, int> ages = {
  'أحمد': 25,
  'محمد': 30,
};

// الدوال
String greet(String name) {
  return 'مرحباً $name!';
}

// Arrow functions
int add(int a, int b) => a + b;

// Classes
class Person {
  String name;
  int age;
  
  Person(this.name, this.age);
  
  void sayHello() {
    print('مرحباً، أنا $name');
  }
}

var person = Person('أحمد', 25);
person.sayHello();
\`\`\`

### أول تطبيق Flutter:

\`\`\`dart
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: Text('أول تطبيق')),
        body: Center(
          child: Text('مرحباً بالعالم!'),
        ),
      ),
    );
  }
}
\`\`\`

### الفرق بين Flutter و React Native:

| Flutter | React Native |
|---------|--------------|
| Dart | JavaScript |
| Widgets خاصة | Native Components |
| أداء أعلى | أداء جيد |
| تصميم موحد | تصميم أصلي |`,
    xpReward: 100,
    order: 1,
    type: 'theory',
    estimatedMinutes: 15,
    isLocked: false,
    quiz: {
      question: 'ما هي لغة البرمجة التي يستخدمها Flutter؟',
      options: ['JavaScript', 'Kotlin', 'Dart', 'Swift'],
      correctAnswer: 2,
      explanation:
        'Flutter يستخدم لغة Dart من Google، وهي لغة حديثة تدعم البرمجة الكائنية',
    },
  },
  {
    id: 'flutter-setup-002',
    courseId: 'flutter-basics',
    title: 'إعداد بيئة التطوير',
    description: 'تثبيت Flutter وإعداد المحرر',
    content: `# إعداد بيئة Flutter

## 1. تثبيت Flutter SDK

### Windows:
\`\`\`bash
# حمل Flutter SDK من flutter.dev
# استخرجه في C:\\flutter

# أضف للـ PATH
setx PATH "%PATH%;C:\\flutter\\bin"

# تحقق من التثبيت
flutter doctor
\`\`\`

### macOS:
\`\`\`bash
# باستخدام Homebrew
brew install flutter

# أو حمل يدوياً وأضف للـ PATH
export PATH="$PATH:/path/to/flutter/bin"
\`\`\`

## 2. تثبيت VS Code Extensions

1. **Flutter** - الإضافة الرئيسية
2. **Dart** - دعم لغة Dart

## 3. إنشاء مشروع جديد

\`\`\`bash
# إنشاء مشروع
flutter create my_app

# الدخول للمجلد
cd my_app

# تشغيل التطبيق
flutter run
\`\`\`

## 4. هيكل المشروع

\`\`\`
my_app/
├── lib/
│   └── main.dart        # نقطة البداية
├── android/             # ملفات Android
├── ios/                 # ملفات iOS
├── web/                 # ملفات الويب
├── test/                # الاختبارات
├── pubspec.yaml         # الحزم والإعدادات
└── README.md
\`\`\`

## 5. ملف pubspec.yaml

\`\`\`yaml
name: my_app
description: تطبيقي الأول

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0              # طلبات HTTP
  provider: ^6.0.5          # إدارة الحالة
  shared_preferences: ^2.2.0 # التخزين المحلي

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
  
  assets:
    - assets/images/
    
  fonts:
    - family: Cairo
      fonts:
        - asset: fonts/Cairo-Regular.ttf
        - asset: fonts/Cairo-Bold.ttf
          weight: 700
\`\`\`

## 6. أوامر مهمة

\`\`\`bash
flutter doctor         # فحص البيئة
flutter run            # تشغيل التطبيق
flutter run -d chrome  # تشغيل على الويب
flutter pub get        # تحميل الحزم
flutter pub add http   # إضافة حزمة
flutter clean          # مسح الكاش
flutter build apk      # بناء APK
flutter build ios      # بناء iOS
\`\`\`

## 7. Hot Reload vs Hot Restart

- **Hot Reload (r)**: يحفظ الحالة ويُحدث الواجهة
- **Hot Restart (R)**: يعيد تشغيل التطبيق من البداية`,
    xpReward: 100,
    order: 2,
    type: 'theory',
    estimatedMinutes: 20,
    isLocked: false,
    quiz: {
      question: 'ما الأمر المستخدم لتشغيل تطبيق Flutter؟',
      options: [
        'flutter start',
        'flutter run',
        'flutter execute',
        'flutter launch',
      ],
      correctAnswer: 1,
      explanation:
        'flutter run هو الأمر المستخدم لتشغيل التطبيق على المحاكي أو الجهاز الحقيقي',
    },
  },
  {
    id: 'flutter-widgets-003',
    courseId: 'flutter-basics',
    title: 'Widgets الأساسية',
    description: 'Container, Text, Image, Button والمزيد',
    content: `# Widgets في Flutter

كل شيء في Flutter هو Widget!

## 1. Text Widget

\`\`\`dart
Text(
  'مرحباً بك!',
  style: TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: Colors.blue,
    letterSpacing: 1.5,
  ),
  textAlign: TextAlign.center,
  maxLines: 2,
  overflow: TextOverflow.ellipsis,
)
\`\`\`

## 2. Container Widget

\`\`\`dart
Container(
  width: 200,
  height: 100,
  padding: EdgeInsets.all(16),
  margin: EdgeInsets.symmetric(horizontal: 20),
  decoration: BoxDecoration(
    color: Colors.blue,
    borderRadius: BorderRadius.circular(12),
    boxShadow: [
      BoxShadow(
        color: Colors.black26,
        blurRadius: 10,
        offset: Offset(0, 4),
      ),
    ],
    gradient: LinearGradient(
      colors: [Colors.blue, Colors.purple],
    ),
  ),
  child: Text('محتوى'),
)
\`\`\`

## 3. Image Widget

\`\`\`dart
// من الأصول
Image.asset(
  'assets/images/logo.png',
  width: 100,
  height: 100,
  fit: BoxFit.cover,
)

// من الإنترنت
Image.network(
  'https://example.com/image.jpg',
  loadingBuilder: (context, child, progress) {
    if (progress == null) return child;
    return CircularProgressIndicator();
  },
  errorBuilder: (context, error, stackTrace) {
    return Icon(Icons.error);
  },
)

// دائرية
ClipRRect(
  borderRadius: BorderRadius.circular(50),
  child: Image.network(url, width: 100, height: 100),
)

// أو
CircleAvatar(
  radius: 50,
  backgroundImage: NetworkImage(url),
)
\`\`\`

## 4. Buttons

\`\`\`dart
// ElevatedButton (مرتفع)
ElevatedButton(
  onPressed: () => print('ضغط'),
  style: ElevatedButton.styleFrom(
    backgroundColor: Colors.blue,
    foregroundColor: Colors.white,
    padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
  ),
  child: Text('اضغط هنا'),
)

// TextButton (نصي)
TextButton(
  onPressed: () {},
  child: Text('زر نصي'),
)

// OutlinedButton (محدد)
OutlinedButton(
  onPressed: () {},
  child: Text('زر محدد'),
)

// IconButton
IconButton(
  icon: Icon(Icons.favorite),
  color: Colors.red,
  onPressed: () {},
)

// FloatingActionButton
FloatingActionButton(
  onPressed: () {},
  child: Icon(Icons.add),
)
\`\`\`

## 5. TextField

\`\`\`dart
TextField(
  controller: _controller,
  decoration: InputDecoration(
    labelText: 'الاسم',
    hintText: 'أدخل اسمك',
    prefixIcon: Icon(Icons.person),
    suffixIcon: IconButton(
      icon: Icon(Icons.clear),
      onPressed: () => _controller.clear(),
    ),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
    ),
    filled: true,
    fillColor: Colors.grey[100],
  ),
  keyboardType: TextInputType.text,
  obscureText: false, // true لكلمة المرور
  onChanged: (value) => print(value),
  onSubmitted: (value) => print('Submitted: $value'),
)
\`\`\`

## 6. ListView

\`\`\`dart
// قائمة ثابتة
ListView(
  children: [
    ListTile(title: Text('عنصر 1')),
    ListTile(title: Text('عنصر 2')),
    ListTile(title: Text('عنصر 3')),
  ],
)

// قائمة ديناميكية (الأفضل)
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ListTile(
      leading: CircleAvatar(child: Text('\$\\{index + 1}')),
      title: Text(items[index].title),
      subtitle: Text(items[index].subtitle),
      trailing: Icon(Icons.arrow_forward_ios),
      onTap: () {},
    );
  },
)

// مع فواصل
ListView.separated(
  itemCount: 10,
  separatorBuilder: (context, index) => Divider(),
  itemBuilder: (context, index) => ListTile(title: Text('Item \$index')),
)
\`\`\`

## 7. Card

\`\`\`dart
Card(
  elevation: 4,
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(12),
  ),
  child: Padding(
    padding: EdgeInsets.all(16),
    child: Column(
      children: [
        Text('عنوان', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        SizedBox(height: 8),
        Text('محتوى البطاقة'),
      ],
    ),
  ),
)
\`\`\``,
    xpReward: 120,
    order: 3,
    type: 'theory',
    estimatedMinutes: 30,
    isLocked: false,
    quiz: {
      question: 'ما هو Widget المستخدم لعرض صورة من الإنترنت؟',
      options: ['Image.asset', 'Image.network', 'NetworkImage', 'WebImage'],
      correctAnswer: 1,
    },
  },
  {
    id: 'flutter-layout-004',
    courseId: 'flutter-basics',
    title: 'التخطيط والترتيب',
    description: 'Row, Column, Stack والمزيد',
    content: `# التخطيط في Flutter

## 1. Column - ترتيب عمودي

\`\`\`dart
Column(
  mainAxisAlignment: MainAxisAlignment.center,    // المحور الرئيسي (عمودي)
  crossAxisAlignment: CrossAxisAlignment.start,   // المحور الثانوي (أفقي)
  mainAxisSize: MainAxisSize.min,                 // الحجم
  children: [
    Text('عنصر 1'),
    SizedBox(height: 16), // مسافة
    Text('عنصر 2'),
    Text('عنصر 3'),
  ],
)

// MainAxisAlignment options:
// - start: البداية
// - end: النهاية
// - center: الوسط
// - spaceBetween: توزيع متساوي
// - spaceAround: مسافات حول
// - spaceEvenly: مسافات متساوية
\`\`\`

## 2. Row - ترتيب أفقي

\`\`\`dart
Row(
  mainAxisAlignment: MainAxisAlignment.spaceBetween,
  crossAxisAlignment: CrossAxisAlignment.center,
  children: [
    Icon(Icons.star, color: Colors.yellow),
    Text('4.5'),
    Text('(100 تقييم)'),
  ],
)
\`\`\`

## 3. Stack - تراكب

\`\`\`dart
Stack(
  alignment: Alignment.center,
  children: [
    // الطبقة السفلى
    Container(
      width: 200,
      height: 200,
      color: Colors.blue,
    ),
    // الطبقة العليا
    Container(
      width: 100,
      height: 100,
      color: Colors.red,
    ),
    // موقع محدد
    Positioned(
      top: 10,
      right: 10,
      child: Icon(Icons.star, color: Colors.yellow),
    ),
  ],
)
\`\`\`

## 4. Expanded و Flexible

\`\`\`dart
Row(
  children: [
    // يأخذ المساحة المتبقية
    Expanded(
      flex: 2, // نسبة 2
      child: Container(color: Colors.red, height: 100),
    ),
    Expanded(
      flex: 1, // نسبة 1
      child: Container(color: Colors.blue, height: 100),
    ),
  ],
)

// Flexible - مرن بدون إجبار
Row(
  children: [
    Flexible(
      child: Text('نص طويل جداً قد يتم قطعه...'),
    ),
    Text('ثابت'),
  ],
)
\`\`\`

## 5. Wrap - التفاف تلقائي

\`\`\`dart
Wrap(
  spacing: 8,      // مسافة أفقية
  runSpacing: 8,   // مسافة عمودية
  children: [
    Chip(label: Text('Flutter')),
    Chip(label: Text('Dart')),
    Chip(label: Text('Mobile')),
    Chip(label: Text('iOS')),
    Chip(label: Text('Android')),
  ],
)
\`\`\`

## 6. GridView

\`\`\`dart
// شبكة ثابتة الأعمدة
GridView.count(
  crossAxisCount: 2,
  mainAxisSpacing: 10,
  crossAxisSpacing: 10,
  padding: EdgeInsets.all(16),
  children: List.generate(10, (index) {
    return Container(
      color: Colors.blue[100 * (index % 9 + 1)],
      child: Center(child: Text('$index')),
    );
  }),
)

// شبكة ديناميكية
GridView.builder(
  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: 2,
    mainAxisSpacing: 10,
    crossAxisSpacing: 10,
    childAspectRatio: 1.0, // نسبة العرض للارتفاع
  ),
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ProductCard(product: items[index]);
  },
)
\`\`\`

## 7. SingleChildScrollView

\`\`\`dart
SingleChildScrollView(
  padding: EdgeInsets.all(16),
  child: Column(
    children: [
      // محتوى طويل
    ],
  ),
)
\`\`\`

## 8. مثال تطبيقي: بطاقة منتج

\`\`\`dart
class ProductCard extends StatelessWidget {
  final String title;
  final String image;
  final double price;
  final double rating;

  const ProductCard({
    required this.title,
    required this.image,
    required this.price,
    required this.rating,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // الصورة
          Expanded(
            child: Image.network(
              image,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
          // المحتوى
          Padding(
            padding: EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '$price د.ع',
                      style: TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Row(
                      children: [
                        Icon(Icons.star, size: 16, color: Colors.amber),
                        Text(' $rating'),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
\`\`\``,
    xpReward: 130,
    order: 4,
    type: 'theory',
    estimatedMinutes: 35,
    isLocked: false,
    quiz: {
      question: 'أي Widget يُستخدم لترتيب العناصر عمودياً؟',
      options: ['Row', 'Column', 'Stack', 'Wrap'],
      correctAnswer: 1,
    },
  },
  {
    id: 'flutter-stateful-005',
    courseId: 'flutter-basics',
    title: 'Stateful vs Stateless',
    description: 'فهم الفرق وإدارة الحالة',
    content: `# StatelessWidget vs StatefulWidget

## 1. StatelessWidget - بدون حالة

لا يتغير بمرور الوقت:

\`\`\`dart
class GreetingCard extends StatelessWidget {
  final String name;
  
  const GreetingCard({required this.name});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Text('مرحباً $name!'),
      ),
    );
  }
}

// الاستخدام
GreetingCard(name: 'أحمد')
\`\`\`

## 2. StatefulWidget - مع حالة

يتغير ويُعاد بناؤه:

\`\`\`dart
class Counter extends StatefulWidget {
  @override
  _CounterState createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;

  void _increment() {
    setState(() {
      _count++;
    });
  }

  void _decrement() {
    setState(() {
      _count--;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          '$_count',
          style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: _decrement,
              child: Icon(Icons.remove),
            ),
            SizedBox(width: 20),
            ElevatedButton(
              onPressed: _increment,
              child: Icon(Icons.add),
            ),
          ],
        ),
      ],
    );
  }
}
\`\`\`

## 3. دورة حياة StatefulWidget

\`\`\`dart
class MyWidget extends StatefulWidget {
  @override
  _MyWidgetState createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> {
  @override
  void initState() {
    super.initState();
    // يُستدعى مرة واحدة عند الإنشاء
    print('initState');
    _loadData();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // يُستدعى بعد initState وعند تغير dependencies
    print('didChangeDependencies');
  }

  @override
  void didUpdateWidget(MyWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    // يُستدعى عند تحديث الـ widget
    print('didUpdateWidget');
  }

  @override
  void dispose() {
    // يُستدعى عند حذف الـ widget
    print('dispose');
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
\`\`\`

## 4. TextEditingController

\`\`\`dart
class LoginForm extends StatefulWidget {
  @override
  _LoginFormState createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    setState(() => _isLoading = true);
    
    try {
      // محاكاة تسجيل الدخول
      await Future.delayed(Duration(seconds: 2));
      print('Email: \${_emailController.text}');
      print('Password: \${_passwordController.text}');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        children: [
          TextField(
            controller: _emailController,
            decoration: InputDecoration(labelText: 'البريد'),
            keyboardType: TextInputType.emailAddress,
          ),
          SizedBox(height: 16),
          TextField(
            controller: _passwordController,
            decoration: InputDecoration(labelText: 'كلمة المرور'),
            obscureText: true,
          ),
          SizedBox(height: 24),
          ElevatedButton(
            onPressed: _isLoading ? null : _login,
            child: _isLoading
                ? CircularProgressIndicator(color: Colors.white)
                : Text('دخول'),
          ),
        ],
      ),
    );
  }
}
\`\`\`

## 5. مثال: قائمة مهام

\`\`\`dart
class TodoList extends StatefulWidget {
  @override
  _TodoListState createState() => _TodoListState();
}

class _TodoListState extends State<TodoList> {
  final List<Map<String, dynamic>> _todos = [];
  final _controller = TextEditingController();

  void _addTodo() {
    if (_controller.text.isNotEmpty) {
      setState(() {
        _todos.add({
          'id': DateTime.now().toString(),
          'text': _controller.text,
          'done': false,
        });
        _controller.clear();
      });
    }
  }

  void _toggleTodo(int index) {
    setState(() {
      _todos[index]['done'] = !_todos[index]['done'];
    });
  }

  void _deleteTodo(int index) {
    setState(() {
      _todos.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('مهامي')),
      body: Column(
        children: [
          Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(
                      hintText: 'أضف مهمة...',
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (_) => _addTodo(),
                  ),
                ),
                SizedBox(width: 8),
                IconButton(
                  icon: Icon(Icons.add),
                  onPressed: _addTodo,
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: _todos.length,
              itemBuilder: (context, index) {
                final todo = _todos[index];
                return ListTile(
                  leading: Checkbox(
                    value: todo['done'],
                    onChanged: (_) => _toggleTodo(index),
                  ),
                  title: Text(
                    todo['text'],
                    style: TextStyle(
                      decoration: todo['done']
                          ? TextDecoration.lineThrough
                          : null,
                    ),
                  ),
                  trailing: IconButton(
                    icon: Icon(Icons.delete, color: Colors.red),
                    onPressed: () => _deleteTodo(index),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
\`\`\``,
    xpReward: 150,
    order: 5,
    type: 'practice',
    estimatedMinutes: 40,
    isLocked: false,
    quiz: {
      question: 'متى نستخدم StatefulWidget؟',
      options: [
        'عندما لا يتغير المحتوى',
        'عندما يتغير المحتوى بمرور الوقت',
        'دائماً',
        'للصور فقط',
      ],
      correctAnswer: 1,
    },
  },
  {
    id: 'flutter-navigation-006',
    courseId: 'flutter-basics',
    title: 'التنقل بين الشاشات',
    description: 'Navigator و Routes',
    content: `# التنقل في Flutter

## 1. التنقل البسيط (Navigator.push)

\`\`\`dart
// الانتقال لشاشة جديدة
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => DetailsScreen()),
);

// الرجوع
Navigator.pop(context);

// الرجوع مع بيانات
Navigator.pop(context, 'result data');
\`\`\`

## 2. تمرير البيانات

\`\`\`dart
// الشاشة الأولى - إرسال
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => DetailsScreen(
      title: 'عنوان',
      id: 123,
    ),
  ),
);

// الشاشة الثانية - استقبال
class DetailsScreen extends StatelessWidget {
  final String title;
  final int id;

  const DetailsScreen({required this.title, required this.id});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text('ID: $id')),
    );
  }
}
\`\`\`

## 3. Named Routes

\`\`\`dart
// في main.dart
MaterialApp(
  initialRoute: '/',
  routes: {
    '/': (context) => HomeScreen(),
    '/details': (context) => DetailsScreen(),
    '/profile': (context) => ProfileScreen(),
    '/settings': (context) => SettingsScreen(),
  },
)

// التنقل
Navigator.pushNamed(context, '/details');

// مع arguments
Navigator.pushNamed(
  context,
  '/details',
  arguments: {'id': 123, 'title': 'منتج'},
);

// استقبال arguments
class DetailsScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map;
    return Text('ID: \${args['id']}');
  }
}
\`\`\`

## 4. onGenerateRoute (للتحكم الكامل)

\`\`\`dart
MaterialApp(
  onGenerateRoute: (settings) {
    if (settings.name == '/details') {
      final args = settings.arguments as Map;
      return MaterialPageRoute(
        builder: (context) => DetailsScreen(
          id: args['id'],
          title: args['title'],
        ),
      );
    }
    return MaterialPageRoute(builder: (context) => HomeScreen());
  },
)
\`\`\`

## 5. Bottom Navigation Bar

\`\`\`dart
class MainScreen extends StatefulWidget {
  @override
  _MainScreenState createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final _screens = [
    HomeScreen(),
    SearchScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'الرئيسية',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.search),
            label: 'بحث',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'حسابي',
          ),
        ],
      ),
    );
  }
}
\`\`\`

## 6. Drawer (القائمة الجانبية)

\`\`\`dart
Scaffold(
  appBar: AppBar(title: Text('تطبيقي')),
  drawer: Drawer(
    child: ListView(
      padding: EdgeInsets.zero,
      children: [
        DrawerHeader(
          decoration: BoxDecoration(color: Colors.blue),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              CircleAvatar(
                radius: 30,
                backgroundImage: NetworkImage(userImage),
              ),
              SizedBox(height: 10),
              Text('أحمد محمد', style: TextStyle(color: Colors.white)),
              Text('ahmed@email.com', style: TextStyle(color: Colors.white70)),
            ],
          ),
        ),
        ListTile(
          leading: Icon(Icons.home),
          title: Text('الرئيسية'),
          onTap: () {
            Navigator.pop(context);
            Navigator.pushNamed(context, '/');
          },
        ),
        ListTile(
          leading: Icon(Icons.settings),
          title: Text('الإعدادات'),
          onTap: () {
            Navigator.pop(context);
            Navigator.pushNamed(context, '/settings');
          },
        ),
        Divider(),
        ListTile(
          leading: Icon(Icons.logout, color: Colors.red),
          title: Text('تسجيل خروج', style: TextStyle(color: Colors.red)),
          onTap: () => _logout(),
        ),
      ],
    ),
  ),
)
\`\`\`

## 7. Tab Bar

\`\`\`dart
class TabScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text('التبويبات'),
          bottom: TabBar(
            tabs: [
              Tab(icon: Icon(Icons.home), text: 'رئيسية'),
              Tab(icon: Icon(Icons.star), text: 'مميز'),
              Tab(icon: Icon(Icons.person), text: 'حسابي'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            HomeTab(),
            FeaturedTab(),
            ProfileTab(),
          ],
        ),
      ),
    );
  }
}
\`\`\``,
    xpReward: 160,
    order: 6,
    type: 'theory',
    estimatedMinutes: 45,
    isLocked: false,
    quiz: {
      question: 'كيف نرجع للشاشة السابقة في Flutter؟',
      options: [
        'Navigator.back(context)',
        'Navigator.pop(context)',
        'context.pop()',
        'Navigator.goBack()',
      ],
      correctAnswer: 1,
    },
  },
  {
    id: 'flutter-async-007',
    courseId: 'flutter-basics',
    title: 'البرمجة غير المتزامنة',
    description: 'Future و async/await و Stream',
    content: `# البرمجة غير المتزامنة في Dart

## 1. Future و async/await

\`\`\`dart
// دالة غير متزامنة
Future<String> fetchData() async {
  await Future.delayed(Duration(seconds: 2));
  return 'البيانات جاهزة!';
}

// استخدام
void main() async {
  print('جاري التحميل...');
  String result = await fetchData();
  print(result);
}

// أو باستخدام then
fetchData().then((result) {
  print(result);
}).catchError((error) {
  print('خطأ: $error');
});
\`\`\`

## 2. معالجة الأخطاء

\`\`\`dart
Future<void> loadUser() async {
  try {
    final response = await http.get(Uri.parse(url));
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      print(data);
    } else {
      throw Exception('فشل التحميل');
    }
  } catch (e) {
    print('خطأ: $e');
  } finally {
    print('انتهى التحميل');
  }
}
\`\`\`

## 3. FutureBuilder

\`\`\`dart
class UserProfile extends StatelessWidget {
  Future<Map<String, dynamic>> fetchUser() async {
    final response = await http.get(
      Uri.parse('https://api.example.com/user/1'),
    );
    return jsonDecode(response.body);
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: fetchUser(),
      builder: (context, snapshot) {
        // جاري التحميل
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        }
        
        // خطأ
        if (snapshot.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error, size: 48, color: Colors.red),
                Text('حدث خطأ: \${snapshot.error}'),
                ElevatedButton(
                  onPressed: () {}, // إعادة المحاولة
                  child: Text('إعادة المحاولة'),
                ),
              ],
            ),
          );
        }
        
        // نجاح
        if (snapshot.hasData) {
          final user = snapshot.data!;
          return Column(
            children: [
              CircleAvatar(
                backgroundImage: NetworkImage(user['avatar']),
              ),
              Text(user['name']),
              Text(user['email']),
            ],
          );
        }
        
        return Container();
      },
    );
  }
}
\`\`\`

## 4. Stream و StreamBuilder

\`\`\`dart
// إنشاء Stream
Stream<int> countStream(int max) async* {
  for (int i = 1; i <= max; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

// استخدام مع StreamBuilder
class CounterScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamBuilder<int>(
      stream: countStream(10),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return Text(
            '\${snapshot.data}',
            style: TextStyle(fontSize: 48),
          );
        }
        return CircularProgressIndicator();
      },
    );
  }
}

// StreamController
class ChatService {
  final _controller = StreamController<Message>.broadcast();
  
  Stream<Message> get messages => _controller.stream;
  
  void sendMessage(Message msg) {
    _controller.add(msg);
  }
  
  void dispose() {
    _controller.close();
  }
}
\`\`\`

## 5. مثال تطبيقي: تحميل قائمة منتجات

\`\`\`dart
class ProductsScreen extends StatefulWidget {
  @override
  _ProductsScreenState createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  late Future<List<Product>> _productsFuture;

  @override
  void initState() {
    super.initState();
    _productsFuture = _fetchProducts();
  }

  Future<List<Product>> _fetchProducts() async {
    final response = await http.get(
      Uri.parse('https://api.example.com/products'),
    );
    
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Product.fromJson(json)).toList();
    } else {
      throw Exception('فشل تحميل المنتجات');
    }
  }

  void _refresh() {
    setState(() {
      _productsFuture = _fetchProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('المنتجات'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _refresh,
          ),
        ],
      ),
      body: FutureBuilder<List<Product>>(
        future: _productsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 48, color: Colors.red),
                  SizedBox(height: 16),
                  Text('حدث خطأ في التحميل'),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _refresh,
                    child: Text('إعادة المحاولة'),
                  ),
                ],
              ),
            );
          }

          final products = snapshot.data!;
          
          if (products.isEmpty) {
            return Center(child: Text('لا توجد منتجات'));
          }

          return RefreshIndicator(
            onRefresh: () async {
              _refresh();
            },
            child: ListView.builder(
              itemCount: products.length,
              itemBuilder: (context, index) {
                final product = products[index];
                return ProductCard(product: product);
              },
            ),
          );
        },
      ),
    );
  }
}

// Model
class Product {
  final int id;
  final String name;
  final double price;
  final String image;

  Product({
    required this.id,
    required this.name,
    required this.price,
    required this.image,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      price: json['price'].toDouble(),
      image: json['image'],
    );
  }
}
\`\`\``,
    xpReward: 170,
    order: 7,
    type: 'practice',
    estimatedMinutes: 50,
    isLocked: false,
    quiz: {
      question: 'أي Widget يُستخدم لعرض بيانات من Future؟',
      options: ['AsyncWidget', 'FutureBuilder', 'FutureWidget', 'AsyncBuilder'],
      correctAnswer: 1,
    },
  },
  {
    id: 'flutter-http-008',
    courseId: 'flutter-basics',
    title: 'التعامل مع APIs',
    description: 'HTTP و JSON وإدارة البيانات',
    content: `# التعامل مع APIs في Flutter

## 1. إعداد http package

\`\`\`yaml
# pubspec.yaml
dependencies:
  http: ^1.1.0
\`\`\`

\`\`\`dart
import 'package:http/http.dart' as http;
import 'dart:convert';
\`\`\`

## 2. GET Request

\`\`\`dart
Future<List<User>> fetchUsers() async {
  final response = await http.get(
    Uri.parse('https://jsonplaceholder.typicode.com/users'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN',
    },
  );

  if (response.statusCode == 200) {
    final List<dynamic> data = jsonDecode(response.body);
    return data.map((json) => User.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load users');
  }
}
\`\`\`

## 3. POST Request

\`\`\`dart
Future<User> createUser(String name, String email) async {
  final response = await http.post(
    Uri.parse('https://api.example.com/users'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'name': name,
      'email': email,
    }),
  );

  if (response.statusCode == 201) {
    return User.fromJson(jsonDecode(response.body));
  } else {
    throw Exception('Failed to create user');
  }
}
\`\`\`

## 4. PUT و DELETE

\`\`\`dart
// PUT - تحديث
Future<User> updateUser(int id, Map<String, dynamic> data) async {
  final response = await http.put(
    Uri.parse('https://api.example.com/users/$id'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode(data),
  );

  if (response.statusCode == 200) {
    return User.fromJson(jsonDecode(response.body));
  } else {
    throw Exception('Failed to update user');
  }
}

// DELETE - حذف
Future<void> deleteUser(int id) async {
  final response = await http.delete(
    Uri.parse('https://api.example.com/users/$id'),
  );

  if (response.statusCode != 200) {
    throw Exception('Failed to delete user');
  }
}
\`\`\`

## 5. API Service Class

\`\`\`dart
class ApiService {
  static const baseUrl = 'https://api.example.com';
  
  static Future<Map<String, String>> _getHeaders() async {
    final token = await SecureStorage.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // GET
  static Future<T> get<T>(
    String endpoint,
    T Function(dynamic) fromJson,
  ) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: await _getHeaders(),
    );
    
    if (response.statusCode == 200) {
      return fromJson(jsonDecode(response.body));
    } else {
      throw ApiException(response.statusCode, response.body);
    }
  }

  // POST
  static Future<T> post<T>(
    String endpoint,
    Map<String, dynamic> body,
    T Function(dynamic) fromJson,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: await _getHeaders(),
      body: jsonEncode(body),
    );
    
    if (response.statusCode == 201 || response.statusCode == 200) {
      return fromJson(jsonDecode(response.body));
    } else {
      throw ApiException(response.statusCode, response.body);
    }
  }
}

// استثناء مخصص
class ApiException implements Exception {
  final int statusCode;
  final String message;
  
  ApiException(this.statusCode, this.message);
  
  @override
  String toString() => 'ApiException: $statusCode - $message';
}

// الاستخدام
final users = await ApiService.get<List<User>>(
  '/users',
  (json) => (json as List).map((e) => User.fromJson(e)).toList(),
);
\`\`\`

## 6. Dio (أقوى وأسهل)

\`\`\`yaml
dependencies:
  dio: ^5.3.0
\`\`\`

\`\`\`dart
import 'package:dio/dio.dart';

class DioClient {
  late Dio _dio;

  DioClient() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.example.com',
      connectTimeout: Duration(seconds: 10),
      receiveTimeout: Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    // Interceptors
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await getToken();
        options.headers['Authorization'] = 'Bearer $token';
        return handler.next(options);
      },
      onResponse: (response, handler) {
        return handler.next(response);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Token expired - refresh or logout
        }
        return handler.next(error);
      },
    ));
  }

  Future<List<User>> getUsers() async {
    final response = await _dio.get('/users');
    return (response.data as List)
        .map((json) => User.fromJson(json))
        .toList();
  }

  Future<User> createUser(Map<String, dynamic> data) async {
    final response = await _dio.post('/users', data: data);
    return User.fromJson(response.data);
  }

  // رفع ملف
  Future<String> uploadImage(File file) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path),
    });
    final response = await _dio.post('/upload', data: formData);
    return response.data['url'];
  }
}
\`\`\`

## 7. مثال كامل: Repository Pattern

\`\`\`dart
// models/user.dart
class User {
  final int id;
  final String name;
  final String email;
  final String? avatar;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.avatar,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      avatar: json['avatar'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'avatar': avatar,
    };
  }
}

// repositories/user_repository.dart
class UserRepository {
  final DioClient _client;

  UserRepository(this._client);

  Future<List<User>> getAll() => _client.getUsers();
  
  Future<User> getById(int id) async {
    final response = await _client.dio.get('/users/$id');
    return User.fromJson(response.data);
  }
  
  Future<User> create(User user) => _client.createUser(user.toJson());
  
  Future<User> update(User user) async {
    final response = await _client.dio.put(
      '/users/\${user.id}',
      data: user.toJson(),
    );
    return User.fromJson(response.data);
  }
  
  Future<void> delete(int id) => _client.dio.delete('/users/$id');
}
\`\`\``,
    xpReward: 180,
    order: 8,
    type: 'practice',
    estimatedMinutes: 55,
    isLocked: false,
    quiz: {
      question: 'أي package يُنصح به للتعامل مع HTTP في Flutter؟',
      options: ['http فقط', 'dio', 'fetch', 'axios'],
      correctAnswer: 1,
    },
  },
  {
    id: 'flutter-storage-009',
    courseId: 'flutter-basics',
    title: 'التخزين المحلي',
    description: 'SharedPreferences و Hive',
    content: `# التخزين المحلي في Flutter

## 1. SharedPreferences

\`\`\`yaml
dependencies:
  shared_preferences: ^2.2.0
\`\`\`

\`\`\`dart
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // حفظ قيم
  static Future<void> setString(String key, String value) async {
    await _prefs?.setString(key, value);
  }

  static Future<void> setInt(String key, int value) async {
    await _prefs?.setInt(key, value);
  }

  static Future<void> setBool(String key, bool value) async {
    await _prefs?.setBool(key, value);
  }

  static Future<void> setStringList(String key, List<String> value) async {
    await _prefs?.setStringList(key, value);
  }

  // قراءة قيم
  static String? getString(String key) => _prefs?.getString(key);
  static int? getInt(String key) => _prefs?.getInt(key);
  static bool? getBool(String key) => _prefs?.getBool(key);
  static List<String>? getStringList(String key) => _prefs?.getStringList(key);

  // حذف
  static Future<void> remove(String key) async {
    await _prefs?.remove(key);
  }

  static Future<void> clear() async {
    await _prefs?.clear();
  }
}

// في main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await LocalStorage.init();
  runApp(MyApp());
}

// الاستخدام
await LocalStorage.setString('username', 'أحمد');
final username = LocalStorage.getString('username');
\`\`\`

## 2. حفظ كائنات JSON

\`\`\`dart
import 'dart:convert';

class UserPrefs {
  static const _userKey = 'user_data';

  static Future<void> saveUser(User user) async {
    final json = jsonEncode(user.toJson());
    await LocalStorage.setString(_userKey, json);
  }

  static User? getUser() {
    final json = LocalStorage.getString(_userKey);
    if (json != null) {
      return User.fromJson(jsonDecode(json));
    }
    return null;
  }

  static Future<void> clearUser() async {
    await LocalStorage.remove(_userKey);
  }
}
\`\`\`

## 3. Hive (أسرع وأقوى)

\`\`\`yaml
dependencies:
  hive: ^2.2.3
  hive_flutter: ^1.1.0

dev_dependencies:
  hive_generator: ^2.0.0
  build_runner: ^2.4.0
\`\`\`

\`\`\`dart
import 'package:hive_flutter/hive_flutter.dart';

// تهيئة
void main() async {
  await Hive.initFlutter();
  
  // تسجيل Adapters
  Hive.registerAdapter(UserAdapter());
  
  // فتح Box
  await Hive.openBox<User>('users');
  await Hive.openBox('settings');
  
  runApp(MyApp());
}

// Model مع Hive
part 'user.g.dart';

@HiveType(typeId: 0)
class User extends HiveObject {
  @HiveField(0)
  String name;

  @HiveField(1)
  String email;

  @HiveField(2)
  int age;

  User({
    required this.name,
    required this.email,
    required this.age,
  });
}

// توليد الـ adapter
// flutter packages pub run build_runner build

// الاستخدام
class UserStorage {
  final Box<User> _box = Hive.box<User>('users');

  // إضافة
  Future<void> addUser(User user) async {
    await _box.add(user);
  }

  // إضافة بمفتاح
  Future<void> putUser(String key, User user) async {
    await _box.put(key, user);
  }

  // قراءة
  User? getUser(String key) {
    return _box.get(key);
  }

  // قراءة الكل
  List<User> getAllUsers() {
    return _box.values.toList();
  }

  // تحديث
  Future<void> updateUser(int index, User user) async {
    await _box.putAt(index, user);
  }

  // حذف
  Future<void> deleteUser(String key) async {
    await _box.delete(key);
  }

  // الاستماع للتغييرات
  ValueListenable<Box<User>> get listenable => _box.listenable();
}

// مع ValueListenableBuilder
ValueListenableBuilder<Box<User>>(
  valueListenable: Hive.box<User>('users').listenable(),
  builder: (context, box, _) {
    final users = box.values.toList();
    return ListView.builder(
      itemCount: users.length,
      itemBuilder: (context, index) {
        return ListTile(
          title: Text(users[index].name),
          subtitle: Text(users[index].email),
        );
      },
    );
  },
)
\`\`\`

## 4. Flutter Secure Storage (للبيانات الحساسة)

\`\`\`yaml
dependencies:
  flutter_secure_storage: ^9.0.0
\`\`\`

\`\`\`dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  static Future<void> setToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }

  static Future<void> deleteToken() async {
    await _storage.delete(key: 'auth_token');
  }

  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
\`\`\`

## 5. مثال: نظام Auth كامل

\`\`\`dart
class AuthService {
  final _secureStorage = SecureStorage();
  final _userPrefs = UserPrefs();

  Future<bool> login(String email, String password) async {
    try {
      final response = await api.post('/login', {
        'email': email,
        'password': password,
      });

      // حفظ Token بشكل آمن
      await _secureStorage.setToken(response['token']);
      
      // حفظ بيانات المستخدم
      final user = User.fromJson(response['user']);
      await _userPrefs.saveUser(user);

      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    await _secureStorage.deleteToken();
    await _userPrefs.clearUser();
  }

  Future<bool> isLoggedIn() async {
    final token = await _secureStorage.getToken();
    return token != null;
  }

  User? getCurrentUser() {
    return _userPrefs.getUser();
  }
}
\`\`\``,
    xpReward: 160,
    order: 9,
    type: 'practice',
    estimatedMinutes: 45,
    isLocked: false,
    quiz: {
      question: 'أين يجب تخزين Auth Token في Flutter؟',
      options: [
        'SharedPreferences',
        'Hive',
        'flutter_secure_storage',
        'ملف نصي',
      ],
      correctAnswer: 2,
    },
  },
  {
    id: 'flutter-provider-010',
    courseId: 'flutter-basics',
    title: 'إدارة الحالة مع Provider',
    description: 'Provider و ChangeNotifier',
    content: `# إدارة الحالة مع Provider

## 1. إعداد Provider

\`\`\`yaml
dependencies:
  provider: ^6.0.5
\`\`\`

## 2. ChangeNotifier

\`\`\`dart
import 'package:flutter/foundation.dart';

class CounterProvider extends ChangeNotifier {
  int _count = 0;

  int get count => _count;

  void increment() {
    _count++;
    notifyListeners(); // إعلام المستمعين
  }

  void decrement() {
    _count--;
    notifyListeners();
  }

  void reset() {
    _count = 0;
    notifyListeners();
  }
}
\`\`\`

## 3. تسجيل Provider

\`\`\`dart
void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CounterProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: MyApp(),
    ),
  );
}
\`\`\`

## 4. استخدام Provider

\`\`\`dart
// الطريقة 1: context.watch (يُعاد البناء عند التغيير)
class CounterScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final counter = context.watch<CounterProvider>();
    
    return Column(
      children: [
        Text('\${counter.count}', style: TextStyle(fontSize: 48)),
        ElevatedButton(
          onPressed: counter.increment,
          child: Text('زيادة'),
        ),
      ],
    );
  }
}

// الطريقة 2: context.read (لا يُعاد البناء)
ElevatedButton(
  onPressed: () => context.read<CounterProvider>().increment(),
  child: Text('زيادة'),
)

// الطريقة 3: Consumer (للتحكم الدقيق)
Consumer<CounterProvider>(
  builder: (context, counter, child) {
    return Text('\${counter.count}');
  },
)

// الطريقة 4: Selector (للأداء الأفضل)
Selector<CounterProvider, int>(
  selector: (_, provider) => provider.count,
  builder: (context, count, child) {
    return Text('$count');
  },
)
\`\`\`

## 5. مثال: عربة التسوق

\`\`\`dart
// models/cart_item.dart
class CartItem {
  final String id;
  final String name;
  final double price;
  int quantity;

  CartItem({
    required this.id,
    required this.name,
    required this.price,
    this.quantity = 1,
  });

  double get total => price * quantity;
}

// providers/cart_provider.dart
class CartProvider extends ChangeNotifier {
  final Map<String, CartItem> _items = {};

  Map<String, CartItem> get items => {..._items};
  
  int get itemCount => _items.values.fold(0, (sum, item) => sum + item.quantity);
  
  double get totalPrice => _items.values.fold(0, (sum, item) => sum + item.total);

  void addItem(String id, String name, double price) {
    if (_items.containsKey(id)) {
      _items[id]!.quantity++;
    } else {
      _items[id] = CartItem(id: id, name: name, price: price);
    }
    notifyListeners();
  }

  void removeItem(String id) {
    _items.remove(id);
    notifyListeners();
  }

  void decreaseQuantity(String id) {
    if (_items.containsKey(id)) {
      if (_items[id]!.quantity > 1) {
        _items[id]!.quantity--;
      } else {
        _items.remove(id);
      }
      notifyListeners();
    }
  }

  void clear() {
    _items.clear();
    notifyListeners();
  }
}

// screens/cart_screen.dart
class CartScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('العربة'),
        actions: [
          IconButton(
            icon: Icon(Icons.delete_sweep),
            onPressed: () => context.read<CartProvider>().clear(),
          ),
        ],
      ),
      body: Consumer<CartProvider>(
        builder: (context, cart, child) {
          if (cart.items.isEmpty) {
            return Center(child: Text('العربة فارغة'));
          }

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: cart.items.length,
                  itemBuilder: (context, index) {
                    final item = cart.items.values.toList()[index];
                    return ListTile(
                      title: Text(item.name),
                      subtitle: Text('\${item.price} × \${item.quantity}'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: Icon(Icons.remove),
                            onPressed: () => cart.decreaseQuantity(item.id),
                          ),
                          Text('\${item.quantity}'),
                          IconButton(
                            icon: Icon(Icons.add),
                            onPressed: () => cart.addItem(item.id, item.name, item.price),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [BoxShadow(blurRadius: 10, color: Colors.black12)],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('المجموع', style: TextStyle(color: Colors.grey)),
                        Text(
                          '\${cart.totalPrice.toStringAsFixed(0)} د.ع',
                          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: () {},
                      child: Text('إتمام الشراء'),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// widget أيقونة العربة
class CartIcon extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        IconButton(
          icon: Icon(Icons.shopping_cart),
          onPressed: () => Navigator.pushNamed(context, '/cart'),
        ),
        Positioned(
          right: 0,
          top: 0,
          child: Consumer<CartProvider>(
            builder: (context, cart, child) {
              if (cart.itemCount == 0) return SizedBox.shrink();
              return Container(
                padding: EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '\${cart.itemCount}',
                  style: TextStyle(color: Colors.white, fontSize: 12),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
\`\`\``,
    xpReward: 180,
    order: 10,
    type: 'practice',
    estimatedMinutes: 50,
    isLocked: false,
    quiz: {
      question: 'ما هي الدالة التي تُعلم المستمعين بتغيير الحالة؟',
      options: ['notify()', 'notifyListeners()', 'update()', 'setState()'],
      correctAnswer: 1,
    },
  },
];

// ===== دروس Flutter المتقدمة =====
export const FLUTTER_LESSONS_INTERMEDIATE: Lesson[] = [
  {
    id: 'flutter-riverpod-001',
    courseId: 'flutter-advanced',
    title: 'Riverpod - إدارة حالة متقدمة',
    description: 'تعلم Riverpod وأنواع Providers',
    content: `# Riverpod - الجيل التالي من Provider

## لماذا Riverpod؟

1. آمن من الأخطاء (Compile-time safe)
2. لا يحتاج BuildContext
3. قابل للاختبار بسهولة
4. دعم أفضل للـ async

## 1. الإعداد

\`\`\`yaml
dependencies:
  flutter_riverpod: ^2.4.0
\`\`\`

\`\`\`dart
void main() {
  runApp(
    ProviderScope(
      child: MyApp(),
    ),
  );
}
\`\`\`

## 2. أنواع Providers

\`\`\`dart
// Provider بسيط (قيمة ثابتة)
final greetingProvider = Provider<String>((ref) {
  return 'مرحباً بالعالم!';
});

// StateProvider (قيمة متغيرة)
final counterProvider = StateProvider<int>((ref) => 0);

// StateNotifierProvider (منطق معقد)
class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);
  
  void increment() => state++;
  void decrement() => state--;
  void reset() => state = 0;
}

final counterNotifierProvider = StateNotifierProvider<CounterNotifier, int>((ref) {
  return CounterNotifier();
});

// FutureProvider (بيانات async)
final userProvider = FutureProvider<User>((ref) async {
  final response = await http.get(Uri.parse('https://api.example.com/user'));
  return User.fromJson(jsonDecode(response.body));
});

// StreamProvider
final messagesProvider = StreamProvider<List<Message>>((ref) {
  return chatService.messagesStream;
});
\`\`\`

## 3. استخدام Providers

\`\`\`dart
// مع ConsumerWidget
class CounterScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    
    return Column(
      children: [
        Text('$count'),
        ElevatedButton(
          onPressed: () => ref.read(counterProvider.notifier).state++,
          child: Text('زيادة'),
        ),
      ],
    );
  }
}

// مع hooks
class CounterScreen extends HookConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    return Text('$count');
  }
}

// في StatelessWidget
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, child) {
        final count = ref.watch(counterProvider);
        return Text('$count');
      },
    );
  }
}
\`\`\`

## 4. FutureProvider مع UI

\`\`\`dart
final productsProvider = FutureProvider<List<Product>>((ref) async {
  final api = ref.watch(apiServiceProvider);
  return api.getProducts();
});

class ProductsScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productsProvider);
    
    return productsAsync.when(
      loading: () => Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('خطأ: $error'),
            ElevatedButton(
              onPressed: () => ref.refresh(productsProvider),
              child: Text('إعادة المحاولة'),
            ),
          ],
        ),
      ),
      data: (products) => ListView.builder(
        itemCount: products.length,
        itemBuilder: (context, index) {
          return ProductCard(product: products[index]);
        },
      ),
    );
  }
}
\`\`\`

## 5. Providers معتمدة على بعضها

\`\`\`dart
final authProvider = StateProvider<User?>((ref) => null);

final userOrdersProvider = FutureProvider<List<Order>>((ref) async {
  final user = ref.watch(authProvider);
  if (user == null) return [];
  
  final api = ref.watch(apiServiceProvider);
  return api.getOrders(user.id);
});
\`\`\``,
    xpReward: 200,
    order: 1,
    type: 'theory',
    estimatedMinutes: 55,
    isLocked: false,
    quiz: {
      question: 'ما الفرق بين ref.watch و ref.read؟',
      options: [
        'لا فرق',
        'watch يُعيد البناء، read لا يُعيد',
        'read يُعيد البناء، watch لا يُعيد',
        'كلاهما يُعيد البناء',
      ],
      correctAnswer: 1,
    },
  },
  {
    id: 'flutter-animations-002',
    courseId: 'flutter-advanced',
    title: 'الحركات المتقدمة',
    description: 'AnimationController و Custom Animations',
    content: `# الحركات المتقدمة في Flutter

## 1. AnimationController

\`\`\`dart
class FadeWidget extends StatefulWidget {
  @override
  _FadeWidgetState createState() => _FadeWidgetState();
}

class _FadeWidgetState extends State<FadeWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: 2),
      vsync: this,
    );
    
    _animation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ),
    );
    
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _animation,
      child: Text('مرحباً!'),
    );
  }
}
\`\`\`

## 2. حركات متعددة

\`\`\`dart
class MultiAnimationWidget extends StatefulWidget {
  @override
  _MultiAnimationWidgetState createState() => _MultiAnimationWidgetState();
}

class _MultiAnimationWidgetState extends State<MultiAnimationWidget>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _rotationAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 1500),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(0.0, 0.5, curve: Curves.easeOut),
      ),
    );

    _rotationAnimation = Tween<double>(begin: 0, end: 2 * 3.14159).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(0.3, 0.8, curve: Curves.easeInOut),
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: Offset(0, 1),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(0.5, 1.0, curve: Curves.elasticOut),
      ),
    );

    _controller.forward();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return SlideTransition(
          position: _slideAnimation,
          child: Transform.rotate(
            angle: _rotationAnimation.value,
            child: Transform.scale(
              scale: _scaleAnimation.value,
              child: child,
            ),
          ),
        );
      },
      child: Container(
        width: 100,
        height: 100,
        color: Colors.blue,
      ),
    );
  }
}
\`\`\`

## 3. Hero Animation

\`\`\`dart
// الشاشة الأولى
GestureDetector(
  onTap: () => Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => DetailScreen(imageUrl: url)),
  ),
  child: Hero(
    tag: 'image-$url',
    child: Image.network(url, width: 100, height: 100),
  ),
)

// الشاشة الثانية
class DetailScreen extends StatelessWidget {
  final String imageUrl;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Hero(
          tag: 'image-$imageUrl',
          child: Image.network(imageUrl),
        ),
      ),
    );
  }
}
\`\`\`

## 4. AnimatedContainer

\`\`\`dart
class AnimatedBox extends StatefulWidget {
  @override
  _AnimatedBoxState createState() => _AnimatedBoxState();
}

class _AnimatedBoxState extends State<AnimatedBox> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 500),
        curve: Curves.easeInOut,
        width: _expanded ? 200 : 100,
        height: _expanded ? 200 : 100,
        decoration: BoxDecoration(
          color: _expanded ? Colors.blue : Colors.red,
          borderRadius: BorderRadius.circular(_expanded ? 20 : 100),
        ),
      ),
    );
  }
}
\`\`\`

## 5. Lottie Animations

\`\`\`yaml
dependencies:
  lottie: ^2.6.0
\`\`\`

\`\`\`dart
import 'package:lottie/lottie.dart';

// من ملف محلي
Lottie.asset('assets/animations/loading.json')

// من الإنترنت
Lottie.network('https://assets.lottiefiles.com/animation.json')

// مع تحكم
class LottieExample extends StatefulWidget {
  @override
  _LottieExampleState createState() => _LottieExampleState();
}

class _LottieExampleState extends State<LottieExample>
    with TickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (_controller.isAnimating) {
          _controller.stop();
        } else {
          _controller.forward(from: 0);
        }
      },
      child: Lottie.asset(
        'assets/animations/heart.json',
        controller: _controller,
        onLoaded: (composition) {
          _controller.duration = composition.duration;
        },
      ),
    );
  }
}
\`\`\``,
    xpReward: 190,
    order: 2,
    type: 'practice',
    estimatedMinutes: 50,
    isLocked: false,
  },
  {
    id: 'flutter-testing-003',
    courseId: 'flutter-advanced',
    title: 'اختبار التطبيقات',
    description: 'Unit Tests و Widget Tests و Integration Tests',
    content: `# اختبار تطبيقات Flutter

## أنواع الاختبارات

1. **Unit Tests**: اختبار الدوال والـ Classes
2. **Widget Tests**: اختبار المكونات
3. **Integration Tests**: اختبار التطبيق كاملاً

## 1. Unit Tests

\`\`\`dart
// lib/services/calculator.dart
class Calculator {
  int add(int a, int b) => a + b;
  int subtract(int a, int b) => a - b;
  int multiply(int a, int b) => a * b;
  double divide(int a, int b) {
    if (b == 0) throw ArgumentError('Cannot divide by zero');
    return a / b;
  }
}

// test/calculator_test.dart
import 'package:test/test.dart';
import 'package:my_app/services/calculator.dart';

void main() {
  group('Calculator', () {
    late Calculator calculator;

    setUp(() {
      calculator = Calculator();
    });

    test('should add two numbers', () {
      expect(calculator.add(2, 3), equals(5));
    });

    test('should subtract two numbers', () {
      expect(calculator.subtract(5, 3), equals(2));
    });

    test('should multiply two numbers', () {
      expect(calculator.multiply(3, 4), equals(12));
    });

    test('should divide two numbers', () {
      expect(calculator.divide(10, 2), equals(5.0));
    });

    test('should throw error when dividing by zero', () {
      expect(
        () => calculator.divide(10, 0),
        throwsA(isA<ArgumentError>()),
      );
    });
  });
}
\`\`\`

## 2. Widget Tests

\`\`\`dart
// test/widgets/counter_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:my_app/screens/counter_screen.dart';

void main() {
  testWidgets('Counter increments', (WidgetTester tester) async {
    // Build widget
    await tester.pumpWidget(MaterialApp(home: CounterScreen()));

    // Verify initial state
    expect(find.text('0'), findsOneWidget);
    expect(find.text('1'), findsNothing);

    // Tap the button
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump(); // Rebuild

    // Verify state changed
    expect(find.text('0'), findsNothing);
    expect(find.text('1'), findsOneWidget);
  });

  testWidgets('Counter decrements', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(home: CounterScreen()));

    // Tap increment first
    await tester.tap(find.byIcon(Icons.add));
    await tester.pump();

    // Then decrement
    await tester.tap(find.byIcon(Icons.remove));
    await tester.pump();

    expect(find.text('0'), findsOneWidget);
  });
}
\`\`\`

## 3. Testing with Mocks

\`\`\`yaml
dev_dependencies:
  mockito: ^5.4.0
  build_runner: ^2.4.0
\`\`\`

\`\`\`dart
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'api_service.dart';

@GenerateMocks([ApiService])
import 'user_repository_test.mocks.dart';

void main() {
  late MockApiService mockApi;
  late UserRepository repository;

  setUp(() {
    mockApi = MockApiService();
    repository = UserRepository(mockApi);
  });

  test('should return users from API', () async {
    // Arrange
    final users = [User(id: 1, name: 'Test')];
    when(mockApi.getUsers()).thenAnswer((_) async => users);

    // Act
    final result = await repository.getUsers();

    // Assert
    expect(result, equals(users));
    verify(mockApi.getUsers()).called(1);
  });

  test('should throw when API fails', () async {
    when(mockApi.getUsers()).thenThrow(Exception('Network error'));

    expect(
      () => repository.getUsers(),
      throwsA(isA<Exception>()),
    );
  });
}
\`\`\`

## 4. تشغيل الاختبارات

\`\`\`bash
# كل الاختبارات
flutter test

# ملف محدد
flutter test test/calculator_test.dart

# مع تغطية الكود
flutter test --coverage
\`\`\``,
    xpReward: 180,
    order: 3,
    type: 'practice',
    estimatedMinutes: 45,
    isLocked: false,
  },
  {
    id: 'flutter-architecture-004',
    courseId: 'flutter-advanced',
    title: 'Clean Architecture',
    description: 'بناء تطبيقات قابلة للصيانة والتوسع',
    content: `# Clean Architecture في Flutter

## لماذا Clean Architecture؟

1. **فصل المسؤوليات**: كل طبقة لها وظيفة محددة
2. **قابلية الاختبار**: سهولة اختبار كل جزء منفصلاً
3. **المرونة**: تغيير التقنيات بدون تأثير على المنطق
4. **قابلية الصيانة**: أسهل للفهم والتعديل

## الطبقات الثلاث

### 1. Domain Layer (الأعمق)
- Entities
- Use Cases
- Repository Interfaces

### 2. Data Layer
- Repository Implementation
- Data Sources (Remote/Local)
- Models

### 3. Presentation Layer
- UI (Widgets)
- State Management
- Controllers/ViewModels

## هيكل المجلدات

\`\`\`
lib/
├── core/
│   ├── error/
│   ├── network/
│   └── usecases/
├── features/
│   └── auth/
│       ├── data/
│       │   ├── datasources/
│       │   ├── models/
│       │   └── repositories/
│       ├── domain/
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── usecases/
│       └── presentation/
│           ├── bloc/
│           ├── pages/
│           └── widgets/
└── injection_container.dart
\`\`\`
`,
    codeExample: `// ===== Domain Layer =====

// Entity
class User {
  final String id;
  final String name;
  final String email;
  
  User({required this.id, required this.name, required this.email});
}

// Repository Interface
abstract class UserRepository {
  Future<Either<Failure, User>> getUser(String id);
  Future<Either<Failure, List<User>>> getAllUsers();
}

// Use Case
class GetUser {
  final UserRepository repository;
  
  GetUser(this.repository);
  
  Future<Either<Failure, User>> call(String id) {
    return repository.getUser(id);
  }
}

// ===== Data Layer =====

// Model (يرث من Entity)
class UserModel extends User {
  UserModel({
    required String id,
    required String name,
    required String email,
  }) : super(id: id, name: name, email: email);
  
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      name: json['name'],
      email: json['email'],
    );
  }
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
  };
}

// Repository Implementation
class UserRepositoryImpl implements UserRepository {
  final RemoteDataSource remoteDataSource;
  final LocalDataSource localDataSource;
  final NetworkInfo networkInfo;
  
  UserRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });
  
  @override
  Future<Either<Failure, User>> getUser(String id) async {
    if (await networkInfo.isConnected) {
      try {
        final user = await remoteDataSource.getUser(id);
        await localDataSource.cacheUser(user);
        return Right(user);
      } on ServerException {
        return Left(ServerFailure());
      }
    } else {
      try {
        final user = await localDataSource.getCachedUser(id);
        return Right(user);
      } on CacheException {
        return Left(CacheFailure());
      }
    }
  }
}

// ===== Presentation Layer =====

// BLoC
class UserBloc extends Bloc<UserEvent, UserState> {
  final GetUser getUser;
  
  UserBloc({required this.getUser}) : super(UserInitial()) {
    on<GetUserEvent>((event, emit) async {
      emit(UserLoading());
      
      final result = await getUser(event.userId);
      
      result.fold(
        (failure) => emit(UserError(failure.message)),
        (user) => emit(UserLoaded(user)),
      );
    });
  }
}`,
    language: 'dart',
    xpReward: 200,
    order: 4,
    type: 'practice',
    estimatedMinutes: 60,
    isLocked: false,
    quiz: {
      question: 'أي طبقة تحتوي على Use Cases في Clean Architecture؟',
      options: ['Presentation', 'Data', 'Domain', 'Core'],
      correctAnswer: 2,
      explanation:
        'طبقة Domain تحتوي على Entities و Use Cases و Repository Interfaces، وهي مستقلة عن الطبقات الأخرى',
    },
  },
  {
    id: 'flutter-dio-005',
    courseId: 'flutter-advanced',
    title: 'Dio و HTTP المتقدم',
    description: 'Interceptors و Error Handling و Caching',
    content: `# Dio - HTTP Client متقدم

## لماذا Dio؟

1. **Interceptors**: اعتراض الطلبات والاستجابات
2. **Cancel Requests**: إلغاء الطلبات
3. **Download/Upload**: مع Progress
4. **FormData**: رفع الملفات

## الإعداد

\`\`\`yaml
dependencies:
  dio: ^5.3.0
  pretty_dio_logger: ^1.3.1
\`\`\`

## Interceptors

### أنواع Interceptors
1. **Request**: قبل إرسال الطلب
2. **Response**: بعد استلام الرد
3. **Error**: عند حدوث خطأ

## Error Handling

### DioException Types
- connectionTimeout
- sendTimeout
- receiveTimeout
- badResponse
- cancel
- connectionError
- unknown
`,
    codeExample: `// ===== إعداد Dio =====
class DioClient {
  late Dio _dio;
  
  DioClient() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.example.com',
      connectTimeout: Duration(seconds: 10),
      receiveTimeout: Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));
    
    _setupInterceptors();
  }
  
  void _setupInterceptors() {
    // Auth Interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final token = AuthService.token;
          if (token != null) {
            options.headers['Authorization'] = 'Bearer \$token';
          }
          handler.next(options);
        },
        onResponse: (response, handler) {
          handler.next(response);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Token expired - refresh
            await AuthService.refreshToken();
            // Retry request
            final opts = error.requestOptions;
            final response = await _dio.fetch(opts);
            handler.resolve(response);
          } else {
            handler.next(error);
          }
        },
      ),
    );
    
    // Logger Interceptor
    _dio.interceptors.add(PrettyDioLogger(
      requestHeader: true,
      requestBody: true,
      responseBody: true,
    ));
  }
  
  // GET Request
  Future<Response> get(String path, {Map<String, dynamic>? params}) {
    return _dio.get(path, queryParameters: params);
  }
  
  // POST Request
  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }
}

// ===== Error Handler =====
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  
  ApiException({required this.message, this.statusCode});
  
  factory ApiException.fromDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        return ApiException(message: 'انتهت مهلة الاتصال');
      case DioExceptionType.receiveTimeout:
        return ApiException(message: 'انتهت مهلة الاستقبال');
      case DioExceptionType.badResponse:
        return _handleBadResponse(error.response);
      case DioExceptionType.connectionError:
        return ApiException(message: 'لا يوجد اتصال بالإنترنت');
      default:
        return ApiException(message: 'حدث خطأ غير متوقع');
    }
  }
  
  static ApiException _handleBadResponse(Response? response) {
    switch (response?.statusCode) {
      case 400:
        return ApiException(message: 'طلب غير صالح', statusCode: 400);
      case 401:
        return ApiException(message: 'غير مصرح', statusCode: 401);
      case 404:
        return ApiException(message: 'غير موجود', statusCode: 404);
      case 500:
        return ApiException(message: 'خطأ في الخادم', statusCode: 500);
      default:
        return ApiException(message: 'خطأ غير معروف');
    }
  }
}

// ===== Upload with Progress =====
Future<void> uploadFile(File file) async {
  final formData = FormData.fromMap({
    'file': await MultipartFile.fromFile(
      file.path,
      filename: file.path.split('/').last,
    ),
  });
  
  await _dio.post(
    '/upload',
    data: formData,
    onSendProgress: (sent, total) {
      final progress = (sent / total * 100).toStringAsFixed(0);
      print('Upload: \$progress%');
    },
  );
}`,
    language: 'dart',
    xpReward: 180,
    order: 5,
    type: 'practice',
    estimatedMinutes: 45,
    isLocked: false,
    quiz: {
      question: 'ما هي وظيفة Interceptor في Dio؟',
      options: [
        'تشفير البيانات',
        'اعتراض الطلبات والاستجابات للتعديل عليها',
        'ضغط البيانات',
        'تخزين البيانات محلياً',
      ],
      correctAnswer: 1,
      explanation:
        'Interceptors تسمح باعتراض الطلبات قبل إرسالها والاستجابات بعد استلامها لإجراء تعديلات مثل إضافة Token',
    },
  },
  {
    id: 'flutter-localization-006',
    courseId: 'flutter-advanced',
    title: 'التعريب وتعدد اللغات',
    description: 'دعم RTL والترجمة الديناميكية',
    content: `# التعريب في Flutter

## خيارات التعريب

1. **flutter_localizations**: الرسمي من Flutter
2. **easy_localization**: سهل ومرن
3. **intl**: للتنسيق والترجمة

## الإعداد مع easy_localization

\`\`\`yaml
dependencies:
  easy_localization: ^3.0.3
  
flutter:
  assets:
    - assets/translations/
\`\`\`

## هيكل الملفات

\`\`\`
assets/
└── translations/
    ├── ar.json
    └── en.json
\`\`\`

## RTL Support

Flutter يدعم RTL تلقائياً مع:
- Directionality widget
- TextDirection
- start/end بدل left/right
`,
    codeExample: `// ===== ملفات الترجمة =====
// assets/translations/ar.json
{
  "app_name": "تطبيقي",
  "welcome": "مرحباً {name}!",
  "items_count": {
    "zero": "لا توجد عناصر",
    "one": "عنصر واحد",
    "two": "عنصران",
    "few": "{} عناصر",
    "many": "{} عنصراً",
    "other": "{} عنصر"
  }
}

// assets/translations/en.json
{
  "app_name": "My App",
  "welcome": "Welcome {name}!",
  "items_count": {
    "one": "One item",
    "other": "{} items"
  }
}

// ===== main.dart =====
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();
  
  runApp(
    EasyLocalization(
      supportedLocales: [Locale('ar'), Locale('en')],
      path: 'assets/translations',
      fallbackLocale: Locale('en'),
      startLocale: Locale('ar'),
      child: MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      localizationsDelegates: context.localizationDelegates,
      supportedLocales: context.supportedLocales,
      locale: context.locale,
      home: HomeScreen(),
    );
  }
}

// ===== استخدام الترجمة =====
class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('app_name'.tr()),
      ),
      body: Column(
        children: [
          // نص بسيط
          Text('app_name'.tr()),
          
          // نص مع متغير
          Text('welcome'.tr(namedArgs: {'name': 'أحمد'})),
          
          // جمع (Plural)
          Text('items_count'.plural(5)),
          
          // تغيير اللغة
          ElevatedButton(
            onPressed: () {
              context.setLocale(Locale('en'));
            },
            child: Text('English'),
          ),
          
          ElevatedButton(
            onPressed: () {
              context.setLocale(Locale('ar'));
            },
            child: Text('العربية'),
          ),
        ],
      ),
    );
  }
}

// ===== RTL Aware Widgets =====
class RTLAwareWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isRTL = Directionality.of(context) == TextDirection.rtl;
    
    return Padding(
      // استخدم start/end بدل left/right
      padding: EdgeInsetsDirectional.only(start: 16, end: 8),
      child: Row(
        children: [
          // يتغير تلقائياً حسب الاتجاه
          Icon(Icons.arrow_forward),
          Spacer(),
          Text('النص'),
        ],
      ),
    );
  }
}`,
    language: 'dart',
    xpReward: 170,
    order: 6,
    type: 'practice',
    estimatedMinutes: 40,
    isLocked: false,
    quiz: {
      question: 'ما البديل الصحيح لـ left/right في Flutter لدعم RTL؟',
      options: ['begin/finish', 'start/end', 'first/last', 'leading/trailing'],
      correctAnswer: 1,
      explanation: 'start/end يتغيران تلقائياً حسب اتجاه اللغة (RTL أو LTR)',
    },
  },
  {
    id: 'flutter-performance-007',
    courseId: 'flutter-advanced',
    title: 'تحسين الأداء',
    description: 'Flutter DevTools و Optimization Techniques',
    content: `# تحسين أداء Flutter

## Flutter DevTools

أدوات تحليل الأداء الرسمية.

### الأقسام الرئيسية
1. **Widget Inspector**: فحص شجرة الـ Widgets
2. **Timeline**: تحليل الـ Frames
3. **Memory**: استهلاك الذاكرة
4. **Performance Overlay**: FPS مباشر

## قواعد الأداء

### 1. تجنب rebuild غير الضروري
### 2. استخدم const constructors
### 3. فصل الـ Widgets
### 4. تجنب setState في الأعلى
### 5. استخدم ListView.builder

## الأخطاء الشائعة

- إنشاء objects في build()
- عدم استخدام keys
- صور كبيرة بدون تحسين
- Nested ListViews
`,
    codeExample: `// ===== 1. استخدم const =====
// ❌ سيء
Widget build(BuildContext context) {
  return Container(
    padding: EdgeInsets.all(16),
    child: Text('مرحباً'),
  );
}

// ✅ جيد
Widget build(BuildContext context) {
  return const Padding(
    padding: EdgeInsets.all(16),
    child: Text('مرحباً'),
  );
}

// ===== 2. فصل الـ Widgets =====
// ❌ سيء - كل شيء يُعاد بناؤه
class BadExample extends StatefulWidget {
  @override
  _BadExampleState createState() => _BadExampleState();
}

class _BadExampleState extends State<BadExample> {
  int counter = 0;
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Counter: \$counter'),
        ExpensiveWidget(), // يُعاد بناؤه كل مرة!
        ElevatedButton(
          onPressed: () => setState(() => counter++),
          child: Text('زيادة'),
        ),
      ],
    );
  }
}

// ✅ جيد - فصل الـ Widgets
class GoodExample extends StatefulWidget {
  @override
  _GoodExampleState createState() => _GoodExampleState();
}

class _GoodExampleState extends State<GoodExample> {
  int counter = 0;
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CounterText(counter: counter),
        const ExpensiveWidget(), // const = لا يُعاد بناؤه
        IncrementButton(onPressed: () => setState(() => counter++)),
      ],
    );
  }
}

// ===== 3. ListView.builder =====
// ❌ سيء للقوائم الطويلة
ListView(
  children: items.map((item) => ListTile(title: Text(item))).toList(),
)

// ✅ جيد - يبني العناصر المرئية فقط
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ListTile(title: Text(items[index])),
)

// ===== 4. RepaintBoundary =====
// لعزل الأجزاء كثيرة الرسم
RepaintBoundary(
  child: AnimatedWidget(), // لن يؤثر على الـ Widgets الأخرى
)

// ===== 5. تحسين الصور =====
// استخدم cacheWidth/cacheHeight
Image.network(
  'https://example.com/large-image.jpg',
  cacheWidth: 300, // يُصغر في الذاكرة
  cacheHeight: 300,
)

// ===== 6. AutomaticKeepAlive =====
// للحفاظ على حالة Tab
class MyTab extends StatefulWidget {
  @override
  _MyTabState createState() => _MyTabState();
}

class _MyTabState extends State<MyTab>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  
  @override
  Widget build(BuildContext context) {
    super.build(context);
    return ExpensiveContent();
  }
}

// ===== 7. Compute للعمليات الثقيلة =====
Future<List<Item>> parseItems(String jsonString) async {
  return compute(_parseItemsIsolate, jsonString);
}

List<Item> _parseItemsIsolate(String jsonString) {
  final json = jsonDecode(jsonString) as List;
  return json.map((e) => Item.fromJson(e)).toList();
}`,
    language: 'dart',
    xpReward: 190,
    order: 7,
    type: 'practice',
    estimatedMinutes: 50,
    isLocked: false,
    quiz: {
      question: 'لماذا نستخدم ListView.builder بدل ListView العادي؟',
      options: [
        'أسهل في الكتابة',
        'يبني العناصر المرئية فقط مما يوفر الذاكرة',
        'يدعم الصور فقط',
        'أجمل شكلاً',
      ],
      correctAnswer: 1,
      explanation:
        'ListView.builder يستخدم lazy loading - يبني فقط العناصر الظاهرة على الشاشة مما يحسن الأداء والذاكرة للقوائم الطويلة',
    },
  },
];

// ===== جميع دروس Flutter =====
export const ALL_FLUTTER_LESSONS: Lesson[] = [
  ...FLUTTER_LESSONS_BEGINNER,
  ...FLUTTER_LESSONS_INTERMEDIATE,
];

// ===== تحديات Flutter =====
export const FLUTTER_CHALLENGES: Challenge[] = [
  {
    id: 'flutter-challenge-001',
    courseId: 'flutter-basics',
    title: 'بناء شاشة تسجيل دخول',
    description: 'أنشئ شاشة تسجيل دخول جميلة مع تحقق من المدخلات',
    difficulty: 'easy',
    points: 200,
    xpReward: 200,
    timeLimit: 30,
    language: 'Dart',
    icon: 'log-in-outline',
    category: 'ui',
    isLocked: false,
    hints: [
      'استخدم TextEditingController للتحكم بالحقول',
      'استخدم Form و TextFormField للتحقق',
      'أضف validator لكل حقل',
    ],
    starterCode: `import 'package:flutter/material.dart';

// دالة للتحقق من صحة البريد الإلكتروني
String? validateEmail(String? value) {
  // أكمل التحقق
  return null;
}

// دالة للتحقق من صحة كلمة المرور
String? validatePassword(String? value) {
  // أكمل التحقق
  return null;
}

// دالة لمحاولة تسجيل الدخول
Map<String, dynamic> attemptLogin(String email, String password) {
  // أكمل المنطق: تحقق من المدخلات وأرجع نتيجة
  return {};
}`,
    solution: `import 'package:flutter/material.dart';

String? validateEmail(String? value) {
  if (value == null || value.isEmpty) {
    return 'البريد الإلكتروني مطلوب';
  }
  if (!value.contains('@') || !value.contains('.')) {
    return 'بريد إلكتروني غير صالح';
  }
  return null;
}

String? validatePassword(String? value) {
  if (value == null || value.isEmpty) {
    return 'كلمة المرور مطلوبة';
  }
  if (value.length < 6) {
    return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
  }
  return null;
}

Map<String, dynamic> attemptLogin(String email, String password) {
  final emailError = validateEmail(email);
  final passwordError = validatePassword(password);
  if (emailError != null || passwordError != null) {
    return {'success': false, 'error': emailError ?? passwordError};
  }
  return {'success': true, 'error': null};
}`,
    testCases: [
      {
        input: 'validateEmail("")',
        expectedOutput: 'البريد الإلكتروني مطلوب',
        description: 'رفض البريد الفارغ',
      },
      {
        input: 'validateEmail("user@example.com")',
        expectedOutput: 'null',
        description: 'قبول بريد إلكتروني صالح',
      },
      {
        input: 'validatePassword("123")',
        expectedOutput: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
        description: 'رفض كلمة مرور قصيرة',
      },
      {
        input: 'attemptLogin("user@example.com", "password123")',
        expectedOutput: '{success: true, error: null}',
        description: 'تسجيل دخول ناجح مع بيانات صحيحة',
      },
    ],
  },
  {
    id: 'flutter-challenge-002',
    courseId: 'flutter-basics',
    title: 'قائمة مهام مع حفظ محلي',
    description: 'أنشئ تطبيق مهام يحفظ البيانات محلياً',
    difficulty: 'medium',
    points: 350,
    xpReward: 350,
    timeLimit: 60,
    language: 'Dart',
    icon: 'checkbox-outline',
    category: 'crud',
    isLocked: false,
    hints: [
      'استخدم SharedPreferences أو Hive للتخزين',
      'استخدم setState أو Provider لإدارة الحالة',
      'أضف إمكانية إضافة وحذف وتعديل المهام',
    ],
    starterCode: `// نموذج مهمة
class Task {
  String id;
  String title;
  bool isDone;
  Task({required this.id, required this.title, this.isDone = false});
}

// دالة لإضافة مهمة إلى القائمة
List<Task> addTask(List<Task> tasks, String title) {
  // أكمل
  return tasks;
}

// دالة لتبديل حالة الإنجاز
List<Task> toggleTask(List<Task> tasks, String id) {
  // أكمل
  return tasks;
}

// دالة لحذف مهمة
List<Task> removeTask(List<Task> tasks, String id) {
  // أكمل
  return tasks;
}

// دالة لعدد المهام المكتملة
int completedCount(List<Task> tasks) {
  // أكمل
  return 0;
}`,
    solution: `class Task {
  String id;
  String title;
  bool isDone;
  Task({required this.id, required this.title, this.isDone = false});
}

List<Task> addTask(List<Task> tasks, String title) {
  final newTask = Task(
    id: DateTime.now().millisecondsSinceEpoch.toString(),
    title: title,
  );
  return [...tasks, newTask];
}

List<Task> toggleTask(List<Task> tasks, String id) {
  return tasks.map((task) {
    if (task.id == id) {
      task.isDone = !task.isDone;
    }
    return task;
  }).toList();
}

List<Task> removeTask(List<Task> tasks, String id) {
  return tasks.where((task) => task.id != id).toList();
}

int completedCount(List<Task> tasks) {
  return tasks.where((task) => task.isDone).length;
}`,
    testCases: [
      {
        input: 'addTask([], "مهمة جديدة").length',
        expectedOutput: '1',
        description: 'إضافة مهمة إلى قائمة فارغة',
      },
      {
        input: 'removeTask([Task(id:"1",title:"test")], "1").length',
        expectedOutput: '0',
        description: 'حذف مهمة من القائمة',
      },
      {
        input:
          'completedCount([Task(id:"1",title:"a",isDone:true), Task(id:"2",title:"b")])',
        expectedOutput: '1',
        description: 'عد المهام المكتملة',
      },
    ],
  },
  {
    id: 'flutter-challenge-003',
    courseId: 'flutter-basics',
    title: 'تطبيق طقس',
    description: 'تطبيق يعرض الطقس باستخدام API',
    difficulty: 'hard',
    points: 500,
    xpReward: 500,
    timeLimit: 90,
    language: 'Dart',
    icon: 'cloudy-outline',
    category: 'api',
    isLocked: true,
    hints: [
      'استخدم http أو dio للطلبات',
      'استخدم FutureBuilder لعرض البيانات',
      'أضف معالجة للأخطاء وحالة التحميل',
    ],
    starterCode: `// نموذج بيانات الطقس
class WeatherData {
  final String city;
  final double tempKelvin;
  final String description;
  final int humidity;
  WeatherData({required this.city, required this.tempKelvin, required this.description, required this.humidity});
}

// تحويل من كلفن إلى مئوي
double kelvinToCelsius(double kelvin) {
  // أكمل
  return 0.0;
}

// تحويل من كلفن إلى فهرنهايت
double kelvinToFahrenheit(double kelvin) {
  // أكمل
  return 0.0;
}

// تحويل بيانات JSON إلى WeatherData
WeatherData parseWeatherJson(Map<String, dynamic> json) {
  // أكمل: استخرج البيانات من JSON
  return WeatherData(city: '', tempKelvin: 0, description: '', humidity: 0);
}

// وصف حالة الطقس
String getWeatherAdvice(double tempCelsius) {
  // أكمل: أرجع نصيحة بناءً على درجة الحرارة
  return '';
}`,
    solution: `class WeatherData {
  final String city;
  final double tempKelvin;
  final String description;
  final int humidity;
  WeatherData({required this.city, required this.tempKelvin, required this.description, required this.humidity});
}

double kelvinToCelsius(double kelvin) {
  return kelvin - 273.15;
}

double kelvinToFahrenheit(double kelvin) {
  return (kelvin - 273.15) * 9 / 5 + 32;
}

WeatherData parseWeatherJson(Map<String, dynamic> json) {
  return WeatherData(
    city: json['name'] ?? '',
    tempKelvin: (json['main']['temp'] as num).toDouble(),
    description: json['weather'][0]['description'] ?? '',
    humidity: json['main']['humidity'] ?? 0,
  );
}

String getWeatherAdvice(double tempCelsius) {
  if (tempCelsius < 0) return 'بارد جداً، ارتدِ ملابس ثقيلة';
  if (tempCelsius < 15) return 'بارد، ارتدِ معطفاً';
  if (tempCelsius < 30) return 'معتدل، طقس مناسب';
  return 'حار، اشرب ماءً كثيراً';
}`,
    testCases: [
      {
        input: 'kelvinToCelsius(273.15)',
        expectedOutput: '0.0',
        description: 'تحويل 273.15 كلفن إلى 0 مئوي',
      },
      {
        input: 'kelvinToFahrenheit(273.15)',
        expectedOutput: '32.0',
        description: 'تحويل 273.15 كلفن إلى 32 فهرنهايت',
      },
      {
        input: 'getWeatherAdvice(35.0)',
        expectedOutput: 'حار، اشرب ماءً كثيراً',
        description: 'نصيحة لدرجة حرارة مرتفعة',
      },
      {
        input: 'getWeatherAdvice(10.0)',
        expectedOutput: 'بارد، ارتدِ معطفاً',
        description: 'نصيحة لدرجة حرارة منخفضة',
      },
    ],
  },
  {
    id: 'flutter-challenge-004',
    courseId: 'flutter-advanced',
    title: 'متجر إلكتروني',
    description: 'تطبيق متجر مع عربة تسوق وProvider',
    difficulty: 'hard',
    points: 600,
    xpReward: 600,
    timeLimit: 120,
    language: 'Dart',
    icon: 'cart-outline',
    category: 'state-management',
    isLocked: true,
    hints: [
      'استخدم Provider أو Riverpod لإدارة العربة',
      'أنشئ شاشات: المنتجات، تفاصيل المنتج، العربة',
      'احسب المجموع الكلي تلقائياً',
    ],
    starterCode: `// نموذج المنتج
class Product {
  final String id;
  final String name;
  final double price;
  int quantity;
  Product({required this.id, required this.name, required this.price, this.quantity = 1});
}

// عربة التسوق
class Cart {
  List<Product> items = [];

  // إضافة منتج للعربة
  void addItem(Product product) {
    // أكمل
  }

  // حذف منتج من العربة
  void removeItem(String productId) {
    // أكمل
  }

  // حساب المجموع الكلي
  double get totalPrice {
    // أكمل
    return 0.0;
  }

  // عدد العناصر
  int get itemCount {
    // أكمل
    return 0;
  }

  // تطبيق خصم بنسبة معينة
  double applyDiscount(double percentage) {
    // أكمل
    return 0.0;
  }
}`,
    solution: `class Product {
  final String id;
  final String name;
  final double price;
  int quantity;
  Product({required this.id, required this.name, required this.price, this.quantity = 1});
}

class Cart {
  List<Product> items = [];

  void addItem(Product product) {
    final index = items.indexWhere((item) => item.id == product.id);
    if (index >= 0) {
      items[index].quantity++;
    } else {
      items.add(product);
    }
  }

  void removeItem(String productId) {
    items.removeWhere((item) => item.id == productId);
  }

  double get totalPrice {
    return items.fold(0.0, (sum, item) => sum + (item.price * item.quantity));
  }

  int get itemCount {
    return items.fold(0, (sum, item) => sum + item.quantity);
  }

  double applyDiscount(double percentage) {
    return totalPrice * (1 - percentage / 100);
  }
}`,
    testCases: [
      {
        input:
          'Cart cart = Cart(); cart.addItem(Product(id:"1",name:"هاتف",price:500)); cart.totalPrice',
        expectedOutput: '500.0',
        description: 'حساب السعر بعد إضافة منتج واحد',
      },
      {
        input:
          'Cart cart = Cart(); cart.addItem(Product(id:"1",name:"هاتف",price:500)); cart.addItem(Product(id:"1",name:"هاتف",price:500)); cart.itemCount',
        expectedOutput: '2',
        description: 'عدد العناصر بعد إضافة نفس المنتج مرتين',
      },
      {
        input:
          'Cart cart = Cart(); cart.addItem(Product(id:"1",name:"هاتف",price:1000)); cart.applyDiscount(10)',
        expectedOutput: '900.0',
        description: 'تطبيق خصم 10% على 1000',
      },
      {
        input:
          'Cart cart = Cart(); cart.addItem(Product(id:"1",name:"هاتف",price:500)); cart.removeItem("1"); cart.totalPrice',
        expectedOutput: '0.0',
        description: 'السعر بعد حذف المنتج الوحيد',
      },
    ],
  },
  {
    id: 'flutter-challenge-005',
    courseId: 'flutter-advanced',
    title: 'تطبيق دردشة',
    description: 'تطبيق دردشة مع Firebase',
    difficulty: 'hard',
    points: 700,
    xpReward: 700,
    timeLimit: 150,
    language: 'Dart',
    icon: 'chatbubbles-outline',
    category: 'realtime',
    isLocked: true,
    hints: [
      'استخدم Firebase Auth للمصادقة',
      'استخدم Cloud Firestore للرسائل',
      'استخدم StreamBuilder للتحديث المباشر',
    ],
    starterCode: `// نموذج الرسالة
class Message {
  final String id;
  final String senderId;
  final String text;
  final DateTime timestamp;
  Message({required this.id, required this.senderId, required this.text, required this.timestamp});
}

// تنسيق وقت الرسالة
String formatMessageTime(DateTime time) {
  // أكمل: أرجع الوقت بصيغة HH:MM
  return '';
}

// ترتيب الرسائل حسب الوقت
List<Message> sortMessages(List<Message> messages) {
  // أكمل: رتب من الأقدم للأحدث
  return messages;
}

// تجميع الرسائل حسب التاريخ
Map<String, List<Message>> groupByDate(List<Message> messages) {
  // أكمل
  return {};
}

// عد الرسائل غير المقروءة
int unreadCount(List<Message> messages, String lastReadId) {
  // أكمل
  return 0;
}`,
    solution: `class Message {
  final String id;
  final String senderId;
  final String text;
  final DateTime timestamp;
  Message({required this.id, required this.senderId, required this.text, required this.timestamp});
}

String formatMessageTime(DateTime time) {
  final hour = time.hour.toString().padLeft(2, '0');
  final minute = time.minute.toString().padLeft(2, '0');
  return '\$hour:\$minute';
}

List<Message> sortMessages(List<Message> messages) {
  final sorted = List<Message>.from(messages);
  sorted.sort((a, b) => a.timestamp.compareTo(b.timestamp));
  return sorted;
}

Map<String, List<Message>> groupByDate(List<Message> messages) {
  final Map<String, List<Message>> grouped = {};
  for (final msg in messages) {
    final key = '\${msg.timestamp.year}-\${msg.timestamp.month.toString().padLeft(2, '0')}-\${msg.timestamp.day.toString().padLeft(2, '0')}';
    grouped.putIfAbsent(key, () => []);
    grouped[key]!.add(msg);
  }
  return grouped;
}

int unreadCount(List<Message> messages, String lastReadId) {
  final index = messages.indexWhere((m) => m.id == lastReadId);
  if (index < 0) return messages.length;
  return messages.length - index - 1;
}`,
    testCases: [
      {
        input: 'formatMessageTime(DateTime(2024, 1, 1, 9, 5))',
        expectedOutput: '09:05',
        description: 'تنسيق الوقت بصيغة HH:MM',
      },
      {
        input: 'formatMessageTime(DateTime(2024, 1, 1, 14, 30))',
        expectedOutput: '14:30',
        description: 'تنسيق وقت بعد الظهر',
      },
      {
        input:
          'sortMessages([Message(id:"2",senderId:"a",text:"ثاني",timestamp:DateTime(2024,1,1,10,0)), Message(id:"1",senderId:"b",text:"أول",timestamp:DateTime(2024,1,1,9,0))]).first.id',
        expectedOutput: '1',
        description: 'ترتيب الرسائل يضع الأقدم أولاً',
      },
      {
        input:
          'unreadCount([Message(id:"1",senderId:"a",text:"a",timestamp:DateTime(2024,1,1)), Message(id:"2",senderId:"a",text:"b",timestamp:DateTime(2024,1,2)), Message(id:"3",senderId:"a",text:"c",timestamp:DateTime(2024,1,3))], "1")',
        expectedOutput: '2',
        description: 'عدد الرسائل غير المقروءة بعد آخر رسالة مقروءة',
      },
    ],
  },
];

// ===== تصدير كل المحتوى =====
export const ALL_FLUTTER_CONTENT_LESSONS = ALL_FLUTTER_LESSONS;
export const ALL_FLUTTER_CONTENT_CHALLENGES = FLUTTER_CHALLENGES;
