/**
 * محتوى موسّع لتطوير التطبيقات - Expanded App Development Content
 * React Native و Flutter
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس React Native الموسّعة =====
export const EXPANDED_REACT_NATIVE_LESSONS: Lesson[] = [
  {
    id: 'rn-state-001',
    courseId: 'react-native-basics',
    title: 'إدارة الحالة في React Native',
    description: 'تعلم useState و useReducer و Context',
    content: `
# إدارة الحالة (State Management)

## ما هي الحالة؟
بيانات تتغير خلال تشغيل التطبيق وتؤثر على العرض.

## 1. useState - للحالات البسيطة
\`\`\`jsx
const [count, setCount] = useState(0);
const [user, setUser] = useState(null);
\`\`\`

## 2. useReducer - للحالات المعقدة
\`\`\`jsx
const [state, dispatch] = useReducer(reducer, initialState);
\`\`\`

## 3. Context API - للحالات المشتركة
- تجنب "prop drilling"
- مشاركة البيانات بين المكونات

## قواعد مهمة
1. لا تعدّل الحالة مباشرة!
2. التحديثات غير متزامنة
3. استخدم functional updates للقيم السابقة:
\`\`\`jsx
setCount(prev => prev + 1);
\`\`\`

## متى تستخدم كل طريقة؟
| الحالة | الطريقة |
|--------|---------|
| بسيطة (toggle, counter) | useState |
| معقدة (actions متعددة) | useReducer |
| مشتركة (theme, auth) | Context |
| كبيرة جداً | Redux/Zustand |
`,
    codeExample: `// مثال شامل على إدارة الحالة
import React, { useState, useReducer, createContext, useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

// ===== 1. useState - عداد بسيط =====
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>العداد: {count}</Text>
      <Button title="زيادة" onPress={() => setCount(c => c + 1)} />
      <Button title="تصفير" onPress={() => setCount(0)} />
    </View>
  );
}

// ===== 2. useReducer - قائمة مهام =====
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return [...state, { id: Date.now(), text: action.text, done: false }];
    case 'TOGGLE':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo
      );
    case 'DELETE':
      return state.filter(todo => todo.id !== action.id);
    default:
      return state;
  }
};

function TodoList() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  
  return (
    <View>
      <Button 
        title="إضافة مهمة" 
        onPress={() => dispatch({ type: 'ADD', text: 'مهمة جديدة' })}
      />
      {todos.map(todo => (
        <View key={todo.id} style={styles.todoItem}>
          <Text style={todo.done ? styles.done : null}>{todo.text}</Text>
          <Button 
            title="✓" 
            onPress={() => dispatch({ type: 'TOGGLE', id: todo.id })}
          />
          <Button 
            title="×" 
            onPress={() => dispatch({ type: 'DELETE', id: todo.id })}
          />
        </View>
      ))}
    </View>
  );
}

// ===== 3. Context API - ثيم المظهر =====
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  
  const theme = {
    isDark,
    colors: isDark
      ? { background: '#1a1a1a', text: '#fff' }
      : { background: '#fff', text: '#000' },
    toggleTheme: () => setIsDark(prev => !prev),
  };
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

const useTheme = () => useContext(ThemeContext);

function ThemedScreen() {
  const { colors, toggleTheme, isDark } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.text }}>
        الوضع: {isDark ? 'داكن 🌙' : 'فاتح ☀️'}
      </Text>
      <Button title="تبديل المظهر" onPress={toggleTheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  text: { fontSize: 24, marginBottom: 10 },
  todoItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  done: { textDecorationLine: 'line-through', color: 'gray' },
});

export { Counter, TodoList, ThemeProvider, ThemedScreen };`,
    language: 'typescript',
    xpReward: 180,
    order: 1,
    quiz: {
      question: 'متى يجب استخدام useReducer بدلاً من useState؟',
      options: [
        'دائماً',
        'عندما تكون الحالة بسيطة',
        'عندما تكون الحالة معقدة مع actions متعددة',
        'فقط في Class Components',
      ],
      correctAnswer: 2,
      explanation:
        'useReducer أفضل للحالات المعقدة مع عدة طرق للتعديل، مثل قوائم المهام',
    },
  },
  {
    id: 'rn-navigation-001',
    courseId: 'react-native-basics',
    title: 'التنقل مع React Navigation',
    description: 'تعلم إنشاء تطبيق متعدد الشاشات',
    content: `
# React Navigation

## التثبيت
\`\`\`bash
npm install @react-navigation/native
npm install @react-navigation/native-stack
npm install @react-navigation/bottom-tabs
expo install react-native-screens react-native-safe-area-context
\`\`\`

## أنواع Navigation

### 1. Stack Navigator
- شاشات فوق بعض (مثل الصفحات)
- زر رجوع تلقائي

### 2. Tab Navigator
- قائمة سفلية
- تبديل بين الشاشات

### 3. Drawer Navigator
- قائمة جانبية
- تُفتح بالسحب

## المفاهيم الأساسية

### navigation prop
- \`navigate()\`: الانتقال لشاشة
- \`goBack()\`: الرجوع
- \`push()\`: إضافة للـ stack
- \`setParams()\`: تعديل المعاملات

### route prop
- \`params\`: المعاملات المُمرّرة
- \`name\`: اسم الشاشة الحالية

## تمرير البيانات بين الشاشات
\`\`\`jsx
// الإرسال
navigation.navigate('Details', { itemId: 42, title: 'منتج' });

// الاستقبال
const { itemId, title } = route.params;
\`\`\`
`,
    codeExample: `// تطبيق كامل مع Navigation
import React from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// ===== 1. Stack Navigator - المنتجات =====
const Stack = createNativeStackNavigator();

const products = [
  { id: '1', name: 'هاتف iPhone', price: 999 },
  { id: '2', name: 'لابتوب MacBook', price: 1999 },
  { id: '3', name: 'سماعات AirPods', price: 199 },
];

function ProductList({ navigation }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
          >
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>\${item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function ProductDetails({ route, navigation }) {
  const { product } = route.params;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>السعر: \${product.price}</Text>
      <Button 
        title="إضافة للسلة 🛒" 
        onPress={() => navigation.navigate('Cart', { product })}
      />
    </View>
  );
}

function CartScreen({ route }) {
  const product = route.params?.product;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 السلة</Text>
      {product ? (
        <View style={styles.cartItem}>
          <Text>{product.name}</Text>
          <Text>\${product.price}</Text>
        </View>
      ) : (
        <Text>السلة فارغة</Text>
      )}
    </View>
  );
}

function ProductsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6200ee' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="ProductList" 
        component={ProductList}
        options={{ title: '🛍️ المنتجات' }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetails}
        options={({ route }) => ({ title: route.params.product.name })}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'السلة' }}
      />
    </Stack.Navigator>
  );
}

// ===== 2. Tab Navigator - التطبيق الرئيسي =====
const Tab = createBottomTabNavigator();

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 الرئيسية</Text>
      <Text>مرحباً بك في التطبيق!</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 الملف الشخصي</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Shop') {
              iconName = focused ? 'cart' : 'cart-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6200ee',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'الرئيسية' }} />
        <Tab.Screen name="Shop" component={ProductsStack} options={{ headerShown: false, title: 'المتجر' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'حسابي' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  productCard: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: { fontSize: 18, fontWeight: '600' },
  productPrice: { fontSize: 16, color: '#6200ee', marginTop: 4 },
  price: { fontSize: 20, marginVertical: 16 },
  cartItem: {
    padding: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    marginTop: 16,
  },
});`,
    language: 'typescript',
    xpReward: 200,
    order: 2,
    quiz: {
      question: 'ما الفرق بين navigation.navigate() و navigation.push()؟',
      options: [
        'لا فرق بينهما',
        'navigate يضيف للـ stack، push ينتقل فقط',
        'navigate ينتقل لشاشة موجودة أو يضيفها، push يضيف دائماً',
        'push للـ tabs فقط',
      ],
      correctAnswer: 2,
      explanation:
        'navigate ينتقل لشاشة إذا كانت موجودة أو يضيفها، بينما push يضيف نسخة جديدة دائماً',
    },
  },
];

// ===== دروس Flutter الموسّعة =====
export const EXPANDED_FLUTTER_LESSONS: Lesson[] = [
  {
    id: 'flutter-widgets-001',
    courseId: 'flutter-basics',
    title: 'فهم الـ Widgets في Flutter',
    description: 'تعلم StatelessWidget و StatefulWidget',
    content: `
# Widgets في Flutter

## كل شيء Widget!
في Flutter، كل عنصر على الشاشة هو Widget:
- النصوص
- الأزرار
- التخطيطات
- حتى التطبيق نفسه!

## أنواع Widgets

### 1. StatelessWidget
- **لا تتغير** بعد البناء
- للعناصر الثابتة
- أداء أفضل

### 2. StatefulWidget
- **تتغير** خلال التشغيل
- تستخدم \`setState()\`
- للعناصر التفاعلية

## Widgets شائعة

### تخطيط (Layout)
- \`Container\`: صندوق مع تنسيق
- \`Row\`: ترتيب أفقي
- \`Column\`: ترتيب عمودي
- \`Stack\`: عناصر فوق بعض
- \`ListView\`: قائمة قابلة للتمرير

### إدخال (Input)
- \`TextField\`: حقل نصي
- \`Button\`: أزرار متنوعة
- \`Checkbox\`, \`Switch\`, \`Slider\`

### عرض (Display)
- \`Text\`: نص
- \`Image\`: صورة
- \`Icon\`: أيقونة
- \`Card\`: بطاقة

## القاعدة الذهبية
> إذا كان العنصر يتغير، استخدم StatefulWidget
> إذا كان ثابتاً، استخدم StatelessWidget
`,
    codeExample: `// مثال شامل على Widgets
import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'تطبيق Widgets',
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
        useMaterial3: true,
      ),
      home: HomePage(),
    );
  }
}

// ===== 1. StatelessWidget - بطاقة منتج =====
class ProductCard extends StatelessWidget {
  final String name;
  final double price;
  final String imageUrl;
  final VoidCallback? onTap;

  const ProductCard({
    super.key,
    required this.name,
    required this.price,
    required this.imageUrl,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // الصورة
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              child: Image.network(
                imageUrl,
                height: 120,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            // المحتوى
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '\$\${price.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 14,
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ===== 2. StatefulWidget - عداد مع أنيميشن =====
class AnimatedCounter extends StatefulWidget {
  const AnimatedCounter({super.key});

  @override
  State<AnimatedCounter> createState() => _AnimatedCounterState();
}

class _AnimatedCounterState extends State<AnimatedCounter>
    with SingleTickerProviderStateMixin {
  int _count = 0;
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _animation = Tween<double>(begin: 1, end: 1.2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _increment() {
    setState(() => _count++);
    _controller.forward().then((_) => _controller.reverse());
  }

  void _decrement() {
    if (_count > 0) {
      setState(() => _count--);
      _controller.forward().then((_) => _controller.reverse());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text('العداد', style: TextStyle(fontSize: 18)),
            const SizedBox(height: 16),
            ScaleTransition(
              scale: _animation,
              child: Text(
                '\$_count',
                style: const TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  onPressed: _decrement,
                  child: const Icon(Icons.remove),
                ),
                const SizedBox(width: 20),
                ElevatedButton(
                  onPressed: _increment,
                  child: const Icon(Icons.add),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ===== الصفحة الرئيسية =====
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('تعلم Widgets'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'StatefulWidget - عداد',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const AnimatedCounter(),
            const SizedBox(height: 24),
            const Text(
              'StatelessWidget - منتجات',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.8,
              children: [
                ProductCard(
                  name: 'هاتف ذكي',
                  price: 599.99,
                  imageUrl: 'https://via.placeholder.com/150',
                  onTap: () => print('تم النقر!'),
                ),
                ProductCard(
                  name: 'سماعات',
                  price: 199.99,
                  imageUrl: 'https://via.placeholder.com/150',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}`,
    language: 'dart',
    xpReward: 180,
    order: 1,
    quiz: {
      question: 'متى يجب استخدام StatefulWidget؟',
      options: [
        'دائماً',
        'للعناصر الثابتة فقط',
        'عندما يتغير العنصر خلال التشغيل',
        'فقط للقوائم',
      ],
      correctAnswer: 2,
      explanation:
        'StatefulWidget للعناصر التي تتغير حالتها، مثل العدادات والنماذج',
    },
  },
];

// ===== تحديات تطوير التطبيقات =====
export const EXPANDED_APP_DEV_CHALLENGES: Challenge[] = [
  {
    id: 'rn-ch-todo-001',
    title: 'تطبيق مهام React Native',
    description: 'اكتب تطبيق قائمة مهام مع إضافة وحذف المهام',
    difficulty: 'medium',
    points: 80,
    language: 'TypeScript',
    icon: 'checkbox',
    category: 'app-dev',
    starterCode: `import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');

  const addTodo = () => {
    // أضف مهمة جديدة
  };

  const toggleTodo = (id: string) => {
    // بدّل حالة المهمة
  };

  const deleteTodo = (id: string) => {
    // احذف المهمة
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 مهامي</Text>
      {/* أكمل الكود */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});`,
    solution: `import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([
        ...todos,
        { id: Date.now().toString(), text: inputText.trim(), completed: false },
      ]);
      setInputText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 مهامي</Text>
      
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="أضف مهمة جديدة..."
        />
        <Button title="إضافة" onPress={addTodo} />
      </View>

      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity onPress={() => toggleTodo(item.id)} style={styles.todoText}>
              <Text style={item.completed ? styles.completed : undefined}>
                {item.completed ? '✅' : '⬜'} {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <Text style={styles.deleteBtn}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      <Text style={styles.stats}>
        المهام: {todos.length} | مكتملة: {todos.filter(t => t.completed).length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  inputRow: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginRight: 10 },
  todoItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 8 },
  todoText: { flex: 1 },
  completed: { textDecorationLine: 'line-through', color: 'gray' },
  deleteBtn: { fontSize: 18 },
  stats: { textAlign: 'center', marginTop: 20, color: '#666' },
});`,
    hints: [
      'استخدم Date.now() لإنشاء ID فريد',
      'استخدم filter() للحذف',
      'استخدم map() مع spread operator للتعديل',
      'تأكد من مسح الـ input بعد الإضافة',
    ],
    testCases: [
      {
        input: 'إضافة مهمة',
        expectedOutput: 'تظهر في القائمة',
        description: 'إضافة مهمة',
      },
      {
        input: 'تبديل حالة',
        expectedOutput: 'تتغير الأيقونة',
        description: 'إكمال مهمة',
      },
    ],
    isLocked: true,
  },
  {
    id: 'flutter-ch-counter-001',
    title: 'عداد Flutter متقدم',
    description: 'اكتب عداد مع حفظ القيمة وأنيميشن',
    difficulty: 'medium',
    points: 70,
    language: 'Dart',
    icon: 'calculator',
    category: 'app-dev',
    starterCode: `import 'package:flutter/material.dart';

class AdvancedCounter extends StatefulWidget {
  @override
  _AdvancedCounterState createState() => _AdvancedCounterState();
}

class _AdvancedCounterState extends State<AdvancedCounter> {
  int _count = 0;
  
  void _increment() {
    // زيادة العداد
  }
  
  void _decrement() {
    // إنقاص العداد (لا يقل عن 0)
  }
  
  void _reset() {
    // تصفير العداد
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('العداد')),
      body: Center(
        // أكمل الواجهة
      ),
    );
  }
}`,
    solution: `import 'package:flutter/material.dart';

class AdvancedCounter extends StatefulWidget {
  @override
  _AdvancedCounterState createState() => _AdvancedCounterState();
}

class _AdvancedCounterState extends State<AdvancedCounter>
    with SingleTickerProviderStateMixin {
  int _count = 0;
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1, end: 1.3).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _animate() {
    _controller.forward().then((_) => _controller.reverse());
  }

  void _increment() {
    setState(() => _count++);
    _animate();
  }

  void _decrement() {
    if (_count > 0) {
      setState(() => _count--);
      _animate();
    }
  }

  void _reset() {
    setState(() => _count = 0);
  }

  Color get _countColor {
    if (_count < 10) return Colors.green;
    if (_count < 50) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('العداد المتقدم'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _reset,
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('القيمة الحالية', style: TextStyle(fontSize: 18)),
            SizedBox(height: 16),
            ScaleTransition(
              scale: _scaleAnimation,
              child: Text(
                '\$_count',
                style: TextStyle(
                  fontSize: 72,
                  fontWeight: FontWeight.bold,
                  color: _countColor,
                ),
              ),
            ),
            SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FloatingActionButton(
                  heroTag: 'dec',
                  onPressed: _decrement,
                  backgroundColor: Colors.red[400],
                  child: Icon(Icons.remove, size: 32),
                ),
                SizedBox(width: 32),
                FloatingActionButton(
                  heroTag: 'inc',
                  onPressed: _increment,
                  backgroundColor: Colors.green[400],
                  child: Icon(Icons.add, size: 32),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}`,
    hints: [
      'استخدم AnimationController للأنيميشن',
      'غيّر اللون حسب القيمة',
      'لا تنسَ dispose() للـ controller',
      'استخدم ScaleTransition للتكبير',
    ],
    testCases: [
      {
        input: 'زيادة 5 مرات',
        expectedOutput: '_count == 5',
        description: 'زيادة العداد',
      },
      {
        input: 'إنقاص من 0',
        expectedOutput: '_count == 0',
        description: 'لا ينقص تحت الصفر',
      },
    ],
    isLocked: true,
  },
];

// تصدير كل المحتوى
export const ALL_EXPANDED_APP_DEV_LESSONS: Lesson[] = [
  ...EXPANDED_REACT_NATIVE_LESSONS,
  ...EXPANDED_FLUTTER_LESSONS,
];

export const ALL_EXPANDED_APP_DEV_CHALLENGES: Challenge[] = [
  ...EXPANDED_APP_DEV_CHALLENGES,
];
