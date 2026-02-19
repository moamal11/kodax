/**
 * React Native Course Content - محتوى دورة React Native
 * محتوى ضخم وشامل لتعلم React Native من الصفر للاحتراف
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس React Native للمبتدئين =====
export const REACT_NATIVE_LESSONS_BEGINNER: Lesson[] = [
  {
    id: 'rn-intro-001',
    courseId: 'rn-basics',
    title: 'مقدمة في React Native',
    description: 'تعرف على React Native وكيف يعمل',
    content: `# مقدمة في React Native

## ما هو React Native؟

React Native هو إطار عمل مفتوح المصدر من فيسبوك لبناء تطبيقات الهواتف الذكية باستخدام JavaScript و React.

### مميزات React Native:

1. **كود واحد - منصتين**: اكتب كودك مرة واحدة وشغله على iOS و Android
2. **أداء أصلي**: التطبيقات تعمل بشكل أصلي وليست WebView
3. **Hot Reloading**: شاهد التغييرات فوراً بدون إعادة بناء التطبيق
4. **مجتمع كبير**: ملايين المطورين ومكتبات ضخمة
5. **مدعوم من شركات كبرى**: فيسبوك، إنستغرام، أوبر، وغيرها

### كيف يعمل React Native؟

\`\`\`
JavaScript Code
     ↓
Bridge (الجسر)
     ↓
Native Components (مكونات أصلية)
\`\`\`

React Native يستخدم "الجسر" للتواصل بين JavaScript والمكونات الأصلية.

### الفرق بين React و React Native:

| React | React Native |
|-------|--------------|
| للويب | للموبايل |
| يستخدم HTML | يستخدم مكونات أصلية |
| div, span | View, Text |
| CSS مباشر | StyleSheet |

### أول تطبيق:

\`\`\`javascript
import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View>
      <Text>مرحباً بالعالم!</Text>
    </View>
  );
}
\`\`\`

### ملاحظات مهمة:
- لا يمكن استخدام HTML في React Native
- كل النصوص يجب أن تكون داخل \`<Text>\`
- الـ View هو بديل الـ div`,
    xpReward: 100,
    order: 1,
    type: 'theory',
    estimatedMinutes: 15,
    isLocked: false,
    quiz: {
      question: 'ما هو React Native؟',
      options: [
        'مكتبة لبناء مواقع الويب',
        'إطار عمل لبناء تطبيقات موبايل بـ JavaScript',
        'لغة برمجة جديدة',
        'نظام تشغيل للهواتف',
      ],
      correctAnswer: 1,
      explanation:
        'React Native هو إطار عمل من فيسبوك يتيح بناء تطبيقات iOS و Android باستخدام JavaScript و React',
    },
  },
  {
    id: 'rn-setup-002',
    courseId: 'rn-basics',
    title: 'إعداد بيئة التطوير',
    description: 'تثبيت وإعداد كل ما تحتاجه للبدء',
    content: `# إعداد بيئة التطوير

## الأدوات المطلوبة

### 1. Node.js
\`\`\`bash
# تحقق من التثبيت
node --version
npm --version
\`\`\`

### 2. Expo CLI (الطريقة السهلة)
\`\`\`bash
npm install -g expo-cli
\`\`\`

### 3. إنشاء مشروع جديد
\`\`\`bash
npx create-expo-app MyApp
cd MyApp
npx expo start
\`\`\`

## طرق تشغيل التطبيق:

### 1. Expo Go (الأسهل)
- حمل تطبيق Expo Go على هاتفك
- امسح QR Code
- شاهد تطبيقك مباشرة!

### 2. محاكي Android
\`\`\`bash
# تثبيت Android Studio
# إعداد AVD (Android Virtual Device)
npx expo start --android
\`\`\`

### 3. محاكي iOS (Mac فقط)
\`\`\`bash
npx expo start --ios
\`\`\`

## هيكل المشروع:
\`\`\`
MyApp/
├── App.js           # نقطة البداية
├── package.json     # الحزم
├── app.json         # إعدادات Expo
├── assets/          # الصور والأيقونات
└── node_modules/    # المكتبات
\`\`\`

## أوامر مهمة:
\`\`\`bash
npx expo start        # تشغيل المشروع
npx expo start -c     # تشغيل مع مسح الكاش
npm install [package] # تثبيت مكتبة
\`\`\`

## نصائح للمبتدئين:
1. ابدأ مع Expo - إنه أسهل بكثير
2. استخدم هاتفك الحقيقي للاختبار
3. فعّل Hot Reload للتطوير السريع`,
    xpReward: 100,
    order: 2,
    type: 'theory',
    estimatedMinutes: 20,
    isLocked: false,
    quiz: {
      question: 'ما هي أسهل طريقة للبدء مع React Native؟',
      options: [
        'تثبيت Android Studio من الصفر',
        'استخدام Expo CLI',
        'برمجة بـ Swift مباشرة',
        'استخدام Xcode فقط',
      ],
      correctAnswer: 1,
      explanation:
        'Expo هي الطريقة الأسهل للبدء حيث لا تحتاج لإعدادات معقدة ويمكنك تشغيل التطبيق على هاتفك مباشرة',
    },
  },
  {
    id: 'rn-components-003',
    courseId: 'rn-basics',
    title: 'المكونات الأساسية',
    description: 'View, Text, Image والمزيد',
    content: `# المكونات الأساسية في React Native

## 1. View - الحاوية الرئيسية

\`\`\`javascript
import { View } from 'react-native';

// View هو مثل div في HTML
<View style={{ flex: 1, backgroundColor: '#fff' }}>
  {/* محتوى */}
</View>
\`\`\`

## 2. Text - عرض النصوص

\`\`\`javascript
import { Text } from 'react-native';

<Text style={{ fontSize: 24, color: '#333' }}>
  مرحباً بك!
</Text>

// نص متعدد الأسطر
<Text numberOfLines={2} ellipsizeMode="tail">
  نص طويل جداً سيتم قطعه...
</Text>
\`\`\`

## 3. Image - عرض الصور

\`\`\`javascript
import { Image } from 'react-native';

// صورة محلية
<Image 
  source={require('./assets/logo.png')}
  style={{ width: 100, height: 100 }}
/>

// صورة من الإنترنت
<Image 
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200 }}
  resizeMode="cover"
/>
\`\`\`

## 4. ScrollView - التمرير

\`\`\`javascript
import { ScrollView } from 'react-native';

<ScrollView 
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ padding: 20 }}
>
  {/* محتوى قابل للتمرير */}
</ScrollView>
\`\`\`

## 5. TextInput - إدخال النصوص

\`\`\`javascript
import { TextInput } from 'react-native';

const [text, setText] = useState('');

<TextInput
  value={text}
  onChangeText={setText}
  placeholder="اكتب هنا..."
  style={{
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  }}
/>
\`\`\`

## 6. TouchableOpacity - الأزرار

\`\`\`javascript
import { TouchableOpacity, Text } from 'react-native';

<TouchableOpacity 
  onPress={() => alert('تم الضغط!')}
  activeOpacity={0.7}
  style={{
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
  }}
>
  <Text style={{ color: '#fff', textAlign: 'center' }}>
    اضغط هنا
  </Text>
</TouchableOpacity>
\`\`\`

## 7. FlatList - القوائم

\`\`\`javascript
import { FlatList, Text } from 'react-native';

const data = [
  { id: '1', name: 'عنصر 1' },
  { id: '2', name: 'عنصر 2' },
];

<FlatList
  data={data}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <Text>{item.name}</Text>
  )}
/>
\`\`\``,
    xpReward: 120,
    order: 3,
    type: 'theory',
    estimatedMinutes: 25,
    isLocked: false,
    quiz: {
      question: 'ما هو المكون المستخدم لعرض النصوص في React Native؟',
      options: ['View', 'Text', 'Label', 'Span'],
      correctAnswer: 1,
    },
  },
  {
    id: 'rn-styling-004',
    courseId: 'rn-basics',
    title: 'التنسيق والـ Styles',
    description: 'تعلم كيفية تصميم تطبيقك',
    content: `# التنسيق في React Native

## StyleSheet

\`\`\`javascript
import { StyleSheet, View, Text } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>عنوان</Text>
      <Text style={[styles.text, styles.bold]}>نص غامق</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
  bold: {
    fontWeight: 'bold',
  },
});
\`\`\`

## Flexbox في React Native

### اتجاه العناصر (flexDirection)
\`\`\`javascript
// افتراضياً: column (عمودي)
{ flexDirection: 'column' }  // عمودي
{ flexDirection: 'row' }     // أفقي
\`\`\`

### توزيع العناصر (justifyContent)
\`\`\`javascript
{ justifyContent: 'flex-start' }    // البداية
{ justifyContent: 'center' }        // الوسط
{ justifyContent: 'flex-end' }      // النهاية
{ justifyContent: 'space-between' } // توزيع متساوي
{ justifyContent: 'space-around' }  // توزيع مع مسافات
\`\`\`

### محاذاة العناصر (alignItems)
\`\`\`javascript
{ alignItems: 'flex-start' } // البداية
{ alignItems: 'center' }     // الوسط
{ alignItems: 'flex-end' }   // النهاية
{ alignItems: 'stretch' }    // تمدد
\`\`\`

## مثال تطبيقي: بطاقة مستخدم

\`\`\`javascript
const UserCard = () => (
  <View style={cardStyles.container}>
    <Image 
      source={{ uri: 'https://via.placeholder.com/80' }}
      style={cardStyles.avatar}
    />
    <View style={cardStyles.info}>
      <Text style={cardStyles.name}>أحمد محمد</Text>
      <Text style={cardStyles.email}>ahmed@email.com</Text>
    </View>
  </View>
);

const cardStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3, // للأندرويد
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});
\`\`\`

## الألوان والظلال
\`\`\`javascript
{
  // ألوان
  backgroundColor: '#3b82f6',
  color: 'rgba(0, 0, 0, 0.8)',
  
  // حدود
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  
  // ظلال iOS
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  
  // ظلال Android
  elevation: 5,
}
\`\`\``,
    xpReward: 130,
    order: 4,
    type: 'theory',
    estimatedMinutes: 30,
    isLocked: false,
    quiz: {
      question: 'ما هو الاتجاه الافتراضي لـ flexDirection في React Native؟',
      options: ['row', 'column', 'row-reverse', 'column-reverse'],
      correctAnswer: 1,
    },
  },
  {
    id: 'rn-state-005',
    courseId: 'rn-basics',
    title: 'State و useState',
    description: 'إدارة حالة التطبيق',
    content: `# State في React Native

## ما هو State؟

State هو البيانات التي يمكن أن تتغير في تطبيقك. عندما يتغير الـ State، يُعاد رسم المكون تلقائياً.

## useState Hook

\`\`\`javascript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function Counter() {
  // [القيمة, دالة التغيير] = useState(القيمة الابتدائية)
  const [count, setCount] = useState(0);

  return (
    <View style={{ alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 48 }}>{count}</Text>
      
      <TouchableOpacity 
        onPress={() => setCount(count + 1)}
        style={{ backgroundColor: '#3b82f6', padding: 15, borderRadius: 10 }}
      >
        <Text style={{ color: '#fff' }}>زيادة</Text>
      </TouchableOpacity>
    </View>
  );
}
\`\`\`

## أنواع State مختلفة

### 1. State للنصوص
\`\`\`javascript
const [name, setName] = useState('');

<TextInput
  value={name}
  onChangeText={setName}
  placeholder="اسمك"
/>
\`\`\`

### 2. State للقيم المنطقية
\`\`\`javascript
const [isVisible, setIsVisible] = useState(false);

<TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
  <Text>{isVisible ? 'إخفاء' : 'إظهار'}</Text>
</TouchableOpacity>

{isVisible && <Text>محتوى مخفي</Text>}
\`\`\`

### 3. State للمصفوفات
\`\`\`javascript
const [items, setItems] = useState([]);

const addItem = () => {
  setItems([...items, { id: Date.now(), text: 'عنصر جديد' }]);
};

const removeItem = (id) => {
  setItems(items.filter(item => item.id !== id));
};
\`\`\`

### 4. State للكائنات
\`\`\`javascript
const [user, setUser] = useState({
  name: '',
  email: '',
  age: 0,
});

// تحديث خاصية واحدة
setUser({ ...user, name: 'أحمد' });

// تحديث عدة خصائص
setUser(prev => ({
  ...prev,
  name: 'أحمد',
  email: 'ahmed@email.com',
}));
\`\`\`

## مثال تطبيقي: قائمة مهام

\`\`\`javascript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';

export default function TodoList() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (task.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now().toString(), text: task, done: false }
      ]);
      setTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <TextInput
          value={task}
          onChangeText={setTask}
          placeholder="مهمة جديدة..."
          style={{ flex: 1, borderWidth: 1, padding: 10, borderRadius: 8 }}
        />
        <TouchableOpacity 
          onPress={addTask}
          style={{ backgroundColor: '#3b82f6', padding: 10, borderRadius: 8, marginLeft: 10 }}
        >
          <Text style={{ color: '#fff' }}>إضافة</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', padding: 15, backgroundColor: '#f5f5f5', marginBottom: 10, borderRadius: 8 }}>
            <TouchableOpacity onPress={() => toggleTask(item.id)}>
              <Text style={{ fontSize: 20 }}>{item.done ? '✅' : '⬜'}</Text>
            </TouchableOpacity>
            <Text style={{ flex: 1, marginLeft: 10, textDecorationLine: item.done ? 'line-through' : 'none' }}>
              {item.text}
            </Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={{ color: 'red' }}>حذف</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
\`\`\``,
    xpReward: 150,
    order: 5,
    type: 'practice',
    estimatedMinutes: 35,
    isLocked: false,
    quiz: {
      question: 'كيف نحدث قيمة state في React؟',
      options: [
        'state = newValue',
        'this.state = newValue',
        'setState(newValue)',
        'state.update(newValue)',
      ],
      correctAnswer: 2,
    },
  },
  {
    id: 'rn-props-006',
    courseId: 'rn-basics',
    title: 'Props والتمرير بين المكونات',
    description: 'تمرير البيانات بين المكونات',
    content: `# Props في React Native

## ما هي Props؟

Props (اختصار Properties) هي طريقة لتمرير البيانات من مكون أب إلى مكون ابن.

## مثال بسيط

\`\`\`javascript
// المكون الابن
function Greeting({ name, age }) {
  return (
    <View>
      <Text>مرحباً {name}!</Text>
      <Text>عمرك {age} سنة</Text>
    </View>
  );
}

// المكون الأب
function App() {
  return (
    <View>
      <Greeting name="أحمد" age={25} />
      <Greeting name="محمد" age={30} />
    </View>
  );
}
\`\`\`

## أنواع Props المختلفة

### 1. نصوص
\`\`\`javascript
<MyComponent title="عنوان" />
\`\`\`

### 2. أرقام
\`\`\`javascript
<MyComponent count={10} />
\`\`\`

### 3. دوال (callbacks)
\`\`\`javascript
<MyComponent onPress={() => console.log('تم الضغط')} />
\`\`\`

### 4. كائنات
\`\`\`javascript
<MyComponent user={{ name: 'أحمد', age: 25 }} />
\`\`\`

### 5. مصفوفات
\`\`\`javascript
<MyComponent items={['عنصر1', 'عنصر2']} />
\`\`\`

### 6. مكونات (children)
\`\`\`javascript
<Card>
  <Text>محتوى داخل البطاقة</Text>
</Card>

function Card({ children }) {
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}
\`\`\`

## القيم الافتراضية

\`\`\`javascript
function Button({ title = 'اضغط هنا', color = '#3b82f6' }) {
  return (
    <TouchableOpacity style={{ backgroundColor: color }}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}

// استخدام بدون props
<Button />

// استخدام مع props مخصصة
<Button title="إرسال" color="#10b981" />
\`\`\`

## TypeScript مع Props

\`\`\`typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}

function Button({ title, onPress, color = '#3b82f6', disabled = false }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? '#ccc' : color,
        padding: 15,
        borderRadius: 10,
      }}
    >
      <Text style={{ color: '#fff' }}>{title}</Text>
    </TouchableOpacity>
  );
}
\`\`\`

## مثال تطبيقي: مكون بطاقة قابل لإعادة الاستخدام

\`\`\`javascript
// Card.js
function Card({ title, description, image, onPress, footer }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {image && (
        <Image source={{ uri: image }} style={styles.cardImage} />
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        {description && (
          <Text style={styles.cardDescription}>{description}</Text>
        )}
      </View>
      {footer && (
        <View style={styles.cardFooter}>{footer}</View>
      )}
    </TouchableOpacity>
  );
}

// الاستخدام
<Card
  title="دورة React Native"
  description="تعلم بناء تطبيقات الموبايل"
  image="https://example.com/image.jpg"
  onPress={() => navigation.navigate('CourseDetails')}
  footer={
    <View style={{ flexDirection: 'row' }}>
      <Text>⭐ 4.8</Text>
      <Text>👥 1000 طالب</Text>
    </View>
  }
/>
\`\`\``,
    xpReward: 140,
    order: 6,
    type: 'theory',
    estimatedMinutes: 30,
    isLocked: false,
    quiz: {
      question: 'Props في React Native هي:',
      options: [
        'بيانات يمكن تغييرها داخل المكون',
        'بيانات تُمرر من الأب للابن ولا يمكن تغييرها',
        'متغيرات عامة',
        'دوال فقط',
      ],
      correctAnswer: 1,
    },
  },
  {
    id: 'rn-navigation-007',
    courseId: 'rn-basics',
    title: 'التنقل بين الشاشات',
    description: 'React Navigation وأنواع التنقل',
    content: `# التنقل في React Native

## React Navigation

هي المكتبة الأشهر للتنقل في React Native.

### التثبيت
\`\`\`bash
npm install @react-navigation/native
npm install @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
\`\`\`

## 1. Stack Navigation (التنقل العمودي)

\`\`\`javascript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'الرئيسية' }}
        />
        <Stack.Screen 
          name="Details" 
          component={DetailsScreen}
          options={{ title: 'التفاصيل' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// التنقل
function HomeScreen({ navigation }) {
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Details')}>
      <Text>اذهب للتفاصيل</Text>
    </TouchableOpacity>
  );
}

// تمرير بيانات
navigation.navigate('Details', { itemId: 123, name: 'منتج' });

// استقبال البيانات
function DetailsScreen({ route }) {
  const { itemId, name } = route.params;
  return <Text>المنتج: {name} - ID: {itemId}</Text>;
}
\`\`\`

## 2. Tab Navigation (التنقل بالتبويبات)

\`\`\`bash
npm install @react-navigation/bottom-tabs
\`\`\`

\`\`\`javascript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#888',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
\`\`\`

## 3. Drawer Navigation (القائمة الجانبية)

\`\`\`bash
npm install @react-navigation/drawer
\`\`\`

\`\`\`javascript
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

// فتح القائمة
navigation.openDrawer();
navigation.closeDrawer();
navigation.toggleDrawer();
\`\`\`

## دوال التنقل المهمة

\`\`\`javascript
// التنقل لشاشة
navigation.navigate('ScreenName');

// التنقل مع بيانات
navigation.navigate('ScreenName', { id: 1 });

// الرجوع
navigation.goBack();

// إضافة شاشة للمكدس
navigation.push('ScreenName');

// استبدال الشاشة الحالية
navigation.replace('ScreenName');

// الرجوع للشاشة الرئيسية
navigation.popToTop();

// إعادة ضبط التنقل
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});
\`\`\`

## تخصيص Header

\`\`\`javascript
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{
    title: 'الرئيسية',
    headerStyle: { backgroundColor: '#3b82f6' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' },
    headerRight: () => (
      <TouchableOpacity onPress={() => alert('!')}>
        <Ionicons name="settings" size={24} color="#fff" />
      </TouchableOpacity>
    ),
  }}
/>
\`\`\``,
    xpReward: 160,
    order: 7,
    type: 'theory',
    estimatedMinutes: 40,
    isLocked: false,
    quiz: {
      question: 'ما هي المكتبة الأشهر للتنقل في React Native؟',
      options: [
        'React Router',
        'React Navigation',
        'Navigation Native',
        'Expo Router',
      ],
      correctAnswer: 1,
    },
  },
  {
    id: 'rn-hooks-008',
    courseId: 'rn-basics',
    title: 'Hooks المتقدمة',
    description: 'useEffect, useContext, useRef والمزيد',
    content: `# React Hooks المتقدمة

## 1. useEffect - التأثيرات الجانبية

\`\`\`javascript
import { useEffect, useState } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // يعمل عند تحميل المكون
  useEffect(() => {
    fetchData();
  }, []); // المصفوفة الفارغة = مرة واحدة فقط

  // يعمل عند تغير قيمة معينة
  useEffect(() => {
    console.log('Data changed:', data);
  }, [data]); // يراقب data

  // تنظيف عند إزالة المكون
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Tick');
    }, 1000);

    return () => {
      clearInterval(timer); // تنظيف
    };
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('https://api.example.com/data');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Text>جاري التحميل...</Text>;
  return <Text>{JSON.stringify(data)}</Text>;
}
\`\`\`

## 2. useContext - مشاركة البيانات

\`\`\`javascript
import { createContext, useContext, useState } from 'react';

// إنشاء Context
const ThemeContext = createContext();

// Provider
function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// استخدام Context
function ThemedButton() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  
  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={{ backgroundColor: isDark ? '#333' : '#fff' }}
    >
      <Text style={{ color: isDark ? '#fff' : '#333' }}>
        {isDark ? '🌙 داكن' : '☀️ فاتح'}
      </Text>
    </TouchableOpacity>
  );
}

// الاستخدام في App
function App() {
  return (
    <ThemeProvider>
      <ThemedButton />
    </ThemeProvider>
  );
}
\`\`\`

## 3. useRef - المراجع

\`\`\`javascript
import { useRef, useEffect } from 'react';
import { TextInput, TouchableOpacity, Text } from 'react-native';

function FormWithRef() {
  const inputRef = useRef(null);
  const countRef = useRef(0); // قيمة لا تسبب إعادة رسم

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const incrementCount = () => {
    countRef.current += 1;
    console.log('Count:', countRef.current);
    // لا يسبب إعادة رسم!
  };

  return (
    <View>
      <TextInput ref={inputRef} placeholder="اكتب هنا" />
      <TouchableOpacity onPress={focusInput}>
        <Text>Focus</Text>
      </TouchableOpacity>
    </View>
  );
}
\`\`\`

## 4. useMemo - تحسين الأداء

\`\`\`javascript
import { useMemo, useState } from 'react';

function ExpensiveList({ items, filter }) {
  // يُحسب مرة واحدة فقط عند تغير items أو filter
  const filteredItems = useMemo(() => {
    console.log('Filtering...');
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return (
    <FlatList
      data={filteredItems}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
\`\`\`

## 5. useCallback - تذكر الدوال

\`\`\`javascript
import { useCallback, useState } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);

  // الدالة تُعاد إنشاؤها فقط عند تغير count
  const handlePress = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return (
    <View>
      <Text>Count: {count}</Text>
      <ChildComponent onPress={handlePress} />
    </View>
  );
}

// المكون الابن لن يُعاد رسمه بدون سبب
const ChildComponent = React.memo(({ onPress }) => {
  console.log('Child rendered');
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>زيادة</Text>
    </TouchableOpacity>
  );
});
\`\`\`

## 6. Custom Hooks - إنشاء Hooks مخصصة

\`\`\`javascript
// useLocalStorage.js
function useAsyncStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadValue();
  }, []);

  const loadValue = async () => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        setStoredValue(JSON.parse(value));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const setValue = async (value) => {
    try {
      setStoredValue(value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue, loading];
}

// الاستخدام
function App() {
  const [user, setUser, loading] = useAsyncStorage('user', null);
  
  if (loading) return <Text>Loading...</Text>;
  
  return <Text>مرحباً {user?.name}</Text>;
}
\`\`\``,
    xpReward: 180,
    order: 8,
    type: 'theory',
    estimatedMinutes: 45,
    isLocked: false,
    quiz: {
      question: 'ما هو الغرض من useEffect؟',
      options: [
        'إدارة الحالة',
        'التأثيرات الجانبية مثل fetch وtimers',
        'تمرير البيانات',
        'تحسين الأداء',
      ],
      correctAnswer: 1,
    },
  },
  {
    id: 'rn-api-009',
    courseId: 'rn-basics',
    title: 'التعامل مع APIs',
    description: 'Fetch و Axios وإدارة البيانات',
    content: `# التعامل مع APIs في React Native

## 1. Fetch API

\`\`\`javascript
// GET Request
const fetchUsers = async () => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// POST Request
const createUser = async (userData) => {
  try {
    const response = await fetch('https://api.example.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
\`\`\`

## 2. Axios (أسهل وأقوى)

\`\`\`bash
npm install axios
\`\`\`

\`\`\`javascript
import axios from 'axios';

// إعداد Axios
const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors
api.interceptors.request.use(config => {
  // إضافة token
  config.headers.Authorization = \`Bearer \${getToken()}\`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired - logout
    }
    return Promise.reject(error);
  }
);

// GET
const getUsers = () => api.get('/users');

// POST
const createUser = (data) => api.post('/users', data);

// PUT
const updateUser = (id, data) => api.put(\`/users/\${id}\`, data);

// DELETE
const deleteUser = (id) => api.delete(\`/users/\${id}\`);
\`\`\`

## 3. Custom Hook للـ API

\`\`\`javascript
// useFetch.js
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  const refetch = () => {
    setLoading(true);
    fetchData();
  };

  return { data, loading, error, refetch };
}

// الاستخدام
function UsersList() {
  const { data: users, loading, error, refetch } = useFetch(
    'https://jsonplaceholder.typicode.com/users'
  );

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>خطأ: {error}</Text>;

  return (
    <FlatList
      data={users}
      onRefresh={refetch}
      refreshing={loading}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
\`\`\`

## 4. React Query (الأفضل للمشاريع الكبيرة)

\`\`\`bash
npm install @tanstack/react-query
\`\`\`

\`\`\`javascript
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';

const queryClient = new QueryClient();

// في App.js
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UsersList />
    </QueryClientProvider>
  );
}

// استخدام useQuery
function UsersList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>خطأ!</Text>;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}

// استخدام useMutation
function CreateUserForm() {
  const mutation = useMutation({
    mutationFn: (newUser) => api.post('/users', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      Alert.alert('تم إنشاء المستخدم!');
    },
    onError: (error) => {
      Alert.alert('خطأ', error.message);
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <View>
      {/* Form fields */}
      <TouchableOpacity 
        onPress={() => handleSubmit({ name: 'أحمد' })}
        disabled={mutation.isPending}
      >
        <Text>{mutation.isPending ? 'جاري...' : 'إنشاء'}</Text>
      </TouchableOpacity>
    </View>
  );
}
\`\`\`

## 5. معالجة الأخطاء

\`\`\`javascript
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>حدث خطأ ما!</Text>
        <TouchableOpacity onPress={() => setHasError(false)}>
          <Text>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
}
\`\`\``,
    xpReward: 170,
    order: 9,
    type: 'practice',
    estimatedMinutes: 50,
    isLocked: false,
    quiz: {
      question: 'أي مكتبة تُنصح للتعامل مع APIs في المشاريع الكبيرة؟',
      options: ['Fetch API', 'Axios فقط', 'React Query', 'XMLHttpRequest'],
      correctAnswer: 2,
    },
  },
  {
    id: 'rn-storage-010',
    courseId: 'rn-basics',
    title: 'التخزين المحلي',
    description: 'AsyncStorage و SecureStore',
    content: `# التخزين المحلي في React Native

## 1. AsyncStorage

\`\`\`bash
npm install @react-native-async-storage/async-storage
\`\`\`

\`\`\`javascript
import AsyncStorage from '@/lib/platformStorage';

// حفظ قيمة نصية
await AsyncStorage.setItem('username', 'أحمد');

// حفظ كائن
const user = { name: 'أحمد', age: 25 };
await AsyncStorage.setItem('user', JSON.stringify(user));

// قراءة قيمة
const username = await AsyncStorage.getItem('username');

// قراءة كائن
const userJSON = await AsyncStorage.getItem('user');
const user = userJSON ? JSON.parse(userJSON) : null;

// حذف قيمة
await AsyncStorage.removeItem('username');

// حذف كل البيانات
await AsyncStorage.clear();

// الحصول على كل المفاتيح
const keys = await AsyncStorage.getAllKeys();

// عمليات متعددة
await AsyncStorage.multiSet([
  ['key1', 'value1'],
  ['key2', 'value2'],
]);

const values = await AsyncStorage.multiGet(['key1', 'key2']);
\`\`\`

## Custom Hook للـ AsyncStorage

\`\`\`javascript
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function useStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadValue();
  }, []);

  const loadValue = async () => {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveValue = async (newValue) => {
    try {
      setValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const removeValue = async () => {
    try {
      setValue(initialValue);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing:', error);
    }
  };

  return { value, saveValue, removeValue, loading };
}

// الاستخدام
function SettingsScreen() {
  const { value: settings, saveValue: setSettings, loading } = useStorage('settings', {
    darkMode: false,
    notifications: true,
    language: 'ar',
  });

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Switch
        value={settings.darkMode}
        onValueChange={(value) => 
          setSettings({ ...settings, darkMode: value })
        }
      />
    </View>
  );
}
\`\`\`

## 2. Expo SecureStore (للبيانات الحساسة)

\`\`\`bash
npx expo install expo-secure-store
\`\`\`

\`\`\`javascript
import * as SecureStore from 'expo-secure-store';

// حفظ Token
await SecureStore.setItemAsync('authToken', 'your-secret-token');

// قراءة Token
const token = await SecureStore.getItemAsync('authToken');

// حذف Token
await SecureStore.deleteItemAsync('authToken');

// خيارات إضافية
await SecureStore.setItemAsync('pin', '1234', {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
});
\`\`\`

## 3. MMKV (أسرع بكثير)

\`\`\`bash
npm install react-native-mmkv
\`\`\`

\`\`\`javascript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// حفظ
storage.set('username', 'أحمد');
storage.set('age', 25);
storage.set('isLoggedIn', true);

// قراءة
const username = storage.getString('username');
const age = storage.getNumber('age');
const isLoggedIn = storage.getBoolean('isLoggedIn');

// حذف
storage.delete('username');

// التحقق من وجود مفتاح
const exists = storage.contains('username');

// كل المفاتيح
const keys = storage.getAllKeys();

// مسح الكل
storage.clearAll();
\`\`\`

## 4. مثال تطبيقي: نظام Auth كامل

\`\`\`javascript
// services/authStorage.js
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const AuthStorage = {
  // Token (آمن)
  async setToken(token) {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  },

  async getToken() {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  },

  async removeToken() {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  },

  // User Data (عادي)
  async setUser(user) {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  },

  async getUser() {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },

  async removeUser() {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  },

  // تسجيل خروج كامل
  async logout() {
    await Promise.all([
      this.removeToken(),
      this.removeUser(),
    ]);
  },
};

// الاستخدام في Context
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AuthStorage.getToken();
      if (token) {
        const userData = await AuthStorage.getUser();
        setUser(userData);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    await AuthStorage.setToken(response.token);
    await AuthStorage.setUser(response.user);
    setUser(response.user);
  };

  const logout = async () => {
    await AuthStorage.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
\`\`\``,
    xpReward: 160,
    order: 10,
    type: 'practice',
    estimatedMinutes: 40,
    isLocked: false,
    quiz: {
      question: 'أين يجب تخزين Auth Token؟',
      options: ['AsyncStorage', 'SecureStore', 'في State فقط', 'في ملف عادي'],
      correctAnswer: 1,
    },
  },
];

// ===== دروس React Native المتقدمة =====
export const REACT_NATIVE_LESSONS_INTERMEDIATE: Lesson[] = [
  {
    id: 'rn-animations-001',
    courseId: 'rn-advanced',
    title: 'Animations و Reanimated',
    description: 'إنشاء حركات سلسة وجميلة',
    content: `# الحركات في React Native

## 1. Animated API (المدمج)

\`\`\`javascript
import { Animated } from 'react-native';

function FadeInView() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Text>Fade In!</Text>
    </Animated.View>
  );
}
\`\`\`

## 2. React Native Reanimated (الأفضل)

\`\`\`bash
npm install react-native-reanimated
\`\`\`

\`\`\`javascript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

function AnimatedBox() {
  const offset = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value },
      { scale: scale.value },
    ],
  }));

  const moveRight = () => {
    offset.value = withSpring(200);
  };

  const pulse = () => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 150 }),
        withTiming(1, { duration: 150 })
      ),
      3 // تكرار 3 مرات
    );
  };

  return (
    <View>
      <Animated.View style={[styles.box, animatedStyle]} />
      <TouchableOpacity onPress={moveRight}>
        <Text>تحريك</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={pulse}>
        <Text>نبض</Text>
      </TouchableOpacity>
    </View>
  );
}
\`\`\`

## 3. Entering & Exiting Animations

\`\`\`javascript
import Animated, {
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideOutRight,
  BounceIn,
  ZoomIn,
} from 'react-native-reanimated';

function AnimatedList() {
  const [items, setItems] = useState([1, 2, 3]);

  const addItem = () => setItems([...items, items.length + 1]);
  const removeItem = (id) => setItems(items.filter(i => i !== id));

  return (
    <View>
      {items.map((item, index) => (
        <Animated.View
          key={item}
          entering={FadeIn.delay(index * 100).springify()}
          exiting={SlideOutRight}
          style={styles.listItem}
        >
          <Text>Item {item}</Text>
          <TouchableOpacity onPress={() => removeItem(item)}>
            <Text>حذف</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
      <TouchableOpacity onPress={addItem}>
        <Text>إضافة عنصر</Text>
      </TouchableOpacity>
    </View>
  );
}
\`\`\`

## 4. Gesture Handler مع Reanimated

\`\`\`bash
npm install react-native-gesture-handler
\`\`\`

\`\`\`javascript
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function DraggableBox() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.box, animatedStyle]} />
    </GestureDetector>
  );
}
\`\`\`

## 5. مثال: زر Like مع حركة

\`\`\`javascript
function LikeButton() {
  const [liked, setLiked] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.8),
      withSpring(1.3),
      withSpring(1)
    );
    setLiked(!liked);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={32}
          color={liked ? '#ef4444' : '#888'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
\`\`\``,
    xpReward: 200,
    order: 1,
    type: 'theory',
    estimatedMinutes: 50,
    isLocked: false,
    quiz: {
      question: 'ما هي أفضل مكتبة للحركات في React Native؟',
      options: [
        'Animated API',
        'React Native Reanimated',
        'Lottie',
        'CSS Animations',
      ],
      correctAnswer: 1,
    },
  },
  {
    id: 'rn-forms-002',
    courseId: 'rn-advanced',
    title: 'النماذج والتحقق',
    description: 'React Hook Form و Yup',
    content: `# النماذج في React Native

## 1. React Hook Form

\`\`\`bash
npm install react-hook-form
\`\`\`

\`\`\`javascript
import { useForm, Controller } from 'react-hook-form';

function LoginForm() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="email"
        rules={{
          required: 'البريد مطلوب',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$/i,
            message: 'بريد غير صالح'
          }
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="البريد الإلكتروني"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, errors.email && styles.inputError]}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        rules={{
          required: 'كلمة المرور مطلوبة',
          minLength: {
            value: 6,
            message: 'يجب أن تكون 6 أحرف على الأقل'
          }
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="كلمة المرور"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry
            style={[styles.input, errors.password && styles.inputError]}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <TouchableOpacity 
        onPress={handleSubmit(onSubmit)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>تسجيل الدخول</Text>
      </TouchableOpacity>
    </View>
  );
}
\`\`\`

## 2. Yup للتحقق

\`\`\`bash
npm install yup @hookform/resolvers
\`\`\`

\`\`\`javascript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string()
    .required('الاسم مطلوب')
    .min(2, 'الاسم قصير جداً'),
  email: yup.string()
    .required('البريد مطلوب')
    .email('بريد غير صالح'),
  password: yup.string()
    .required('كلمة المرور مطلوبة')
    .min(8, 'يجب 8 أحرف على الأقل')
    .matches(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
    .matches(/[0-9]/, 'يجب أن تحتوي على رقم'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'كلمات المرور غير متطابقة'),
  age: yup.number()
    .required('العمر مطلوب')
    .min(18, 'يجب أن تكون 18 سنة أو أكثر')
    .max(100, 'عمر غير صالح'),
  phone: yup.string()
    .matches(/^07[0-9]{9}$/, 'رقم هاتف عراقي غير صالح'),
}).required();

function RegisterForm() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur', // التحقق عند مغادرة الحقل
  });

  return (
    // ... النموذج
  );
}
\`\`\`

## 3. مكون Input قابل لإعادة الاستخدام

\`\`\`javascript
function FormInput({
  control,
  name,
  label,
  rules,
  error,
  secureTextEntry,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputWrapper}>
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry={secureTextEntry && !showPassword}
              style={[styles.input, error && styles.inputError]}
              {...rest}
            />
            {secureTextEntry && (
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      
      {error && (
        <Animated.Text 
          entering={FadeInDown}
          style={styles.errorText}
        >
          {error.message}
        </Animated.Text>
      )}
    </View>
  );
}

// الاستخدام
<FormInput
  control={control}
  name="email"
  label="البريد الإلكتروني"
  error={errors.email}
  keyboardType="email-address"
  autoCapitalize="none"
/>
\`\`\``,
    xpReward: 180,
    order: 2,
    type: 'practice',
    estimatedMinutes: 45,
    isLocked: false,
  },
  {
    id: 'rn-state-management-003',
    courseId: 'rn-advanced',
    title: 'إدارة الحالة المتقدمة',
    description: 'Zustand و Redux Toolkit',
    content: `# إدارة الحالة المتقدمة

## 1. Zustand (الأسهل والأفضل)

\`\`\`bash
npm install zustand
\`\`\`

\`\`\`javascript
// stores/useAuthStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/login', { email, password });
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: { ...state.user, ...updates },
        }));
      },

      // Selector
      isLoggedIn: () => get().token !== null,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// الاستخدام
function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn());

  return (
    <View>
      <Text>مرحباً {user?.name}</Text>
      <TouchableOpacity onPress={logout}>
        <Text>تسجيل خروج</Text>
      </TouchableOpacity>
    </View>
  );
}
\`\`\`

## 2. متجر للعربة (Cart Store)

\`\`\`javascript
// stores/useCartStore.js
import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product) => {
    const items = get().items;
    const existingItem = items.find((i) => i.id === product.id);

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...items, { ...product, quantity: 1 }] });
    }
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter((i) => i.id !== productId),
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.id === productId ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  // Computed values
  get totalItems() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  get totalPrice() {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },
}));

// الاستخدام
function CartScreen() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <View style={styles.cartItem}>
          <Text>{item.name}</Text>
          <Text>{item.price} د.ع</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Text>-</Text>
            </TouchableOpacity>
            <Text>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Text>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListFooterComponent={
        <Text style={styles.total}>المجموع: {totalPrice} د.ع</Text>
      }
    />
  );
}

// في Header
function CartIcon() {
  const totalItems = useCartStore((state) => state.totalItems);

  return (
    <View>
      <Ionicons name="cart" size={24} />
      {totalItems > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalItems}</Text>
        </View>
      )}
    </View>
  );
}
\`\`\`

## 3. Redux Toolkit (للمشاريع الكبيرة جداً)

\`\`\`bash
npm install @reduxjs/toolkit react-redux
\`\`\`

\`\`\`javascript
// store/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId) => {
    const response = await api.get(\`/users/\${userId}\`);
    return response.data;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload;
    },
    clearUser: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;

// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// App.js
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
}

// الاستخدام
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser } from './store/slices/userSlice';

function UserProfile() {
  const dispatch = useDispatch();
  const { data: user, status, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUser(1));
  }, []);

  if (status === 'loading') return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;

  return <Text>{user?.name}</Text>;
}
\`\`\``,
    xpReward: 200,
    order: 3,
    type: 'theory',
    estimatedMinutes: 55,
    isLocked: false,
    quiz: {
      question: 'ما هي أسهل مكتبة لإدارة الحالة في React Native؟',
      options: ['Redux', 'MobX', 'Zustand', 'Context API'],
      correctAnswer: 2,
    },
  },
  {
    id: 'rn-performance-004',
    courseId: 'rn-advanced',
    title: 'تحسين الأداء',
    description: 'FlatList وmemo وأفضل الممارسات',
    content: `# تحسين أداء React Native

## 1. FlatList Optimization

\`\`\`javascript
// ❌ سيء
<FlatList
  data={items}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  )}
/>

// ✅ جيد
const renderItem = useCallback(({ item }) => (
  <ListItem item={item} onPress={handlePress} />
), [handlePress]);

<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>

// مكون العنصر مع memo
const ListItem = React.memo(({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)}>
    <Text>{item.name}</Text>
  </TouchableOpacity>
));
\`\`\`

## 2. React.memo للمكونات

\`\`\`javascript
// ❌ يُعاد رسمه في كل مرة
const ExpensiveComponent = ({ data, onUpdate }) => {
  return (
    <View>
      {data.map(item => <Text key={item.id}>{item.name}</Text>)}
    </View>
  );
};

// ✅ يُعاد رسمه فقط عند تغير props
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  return (
    <View>
      {data.map(item => <Text key={item.id}>{item.name}</Text>)}
    </View>
  );
});

// مع مقارنة مخصصة
const ExpensiveComponent = React.memo(
  ({ data, onUpdate }) => {
    // ...
  },
  (prevProps, nextProps) => {
    return prevProps.data.length === nextProps.data.length;
  }
);
\`\`\`

## 3. useMemo و useCallback

\`\`\`javascript
function SearchScreen() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);

  // ❌ يُحسب في كل render
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  // ✅ يُحسب فقط عند تغير items أو query
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  // ❌ دالة جديدة في كل render
  const handlePress = (item) => {
    console.log(item);
  };

  // ✅ نفس الدالة طالما لم تتغير dependencies
  const handlePress = useCallback((item) => {
    console.log(item);
  }, []);

  return (
    <FlatList
      data={filteredItems}
      renderItem={({ item }) => (
        <ListItem item={item} onPress={handlePress} />
      )}
    />
  );
}
\`\`\`

## 4. تحسين الصور

\`\`\`bash
npm install expo-image
\`\`\`

\`\`\`javascript
import { Image } from 'expo-image';

// بدلاً من Image العادي
<Image
  source={{ uri: imageUrl }}
  style={{ width: 200, height: 200 }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
  placeholder={blurhash}
/>

// Blurhash للتحميل
const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';
\`\`\`

## 5. تجنب re-renders غير ضرورية

\`\`\`javascript
// ❌ سيء - inline styles
<View style={{ backgroundColor: 'red', padding: 10 }}>

// ✅ جيد - StyleSheet
<View style={styles.container}>

// ❌ سيء - inline functions
<TouchableOpacity onPress={() => handlePress(item)}>

// ✅ جيد
const handleItemPress = useCallback(() => handlePress(item), [item]);
<TouchableOpacity onPress={handleItemPress}>

// ❌ سيء - anonymous component
{items.map(item => <View>{item.name}</View>)}

// ✅ جيد - مكون منفصل
{items.map(item => <ListItem key={item.id} item={item} />)}
\`\`\`

## 6. Hermes Engine (تحسين كبير)

في app.json:
\`\`\`json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
\`\`\`

## 7. قياس الأداء

\`\`\`javascript
// قياس وقت التنفيذ
console.time('fetchData');
await fetchData();
console.timeEnd('fetchData');

// React DevTools Profiler
import { Profiler } from 'react';

<Profiler
  id="FlatList"
  onRender={(id, phase, actualDuration) => {
    console.log(\`\${id} took \${actualDuration}ms\`);
  }}
>
  <FlatList ... />
</Profiler>
\`\`\``,
    xpReward: 190,
    order: 4,
    type: 'practice',
    estimatedMinutes: 50,
    isLocked: false,
    quiz: {
      question: 'ما هو الغرض من React.memo؟',
      options: [
        'حفظ البيانات',
        'منع إعادة رسم المكون بدون تغيير',
        'تسريع الحركات',
        'تقليل حجم التطبيق',
      ],
      correctAnswer: 1,
    },
  },
  {
    id: 'rn-native-features-005',
    courseId: 'rn-advanced',
    title: 'ميزات الجهاز الأصلية',
    description: 'الكاميرا والموقع والإشعارات',
    content: `# الميزات الأصلية في React Native

## 1. الكاميرا

\`\`\`bash
npx expo install expo-camera expo-image-picker
\`\`\`

\`\`\`javascript
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

// اختيار صورة من المعرض
async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    console.log(result.assets[0].uri);
  }
}

// التقاط صورة بالكاميرا
async function takePhoto() {
  const { status } = await Camera.requestCameraPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert('يجب السماح بالكاميرا');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
}

// مكون الكاميرا المباشر
function CameraScreen() {
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      console.log(photo.uri);
    }
  };

  return (
    <Camera 
      ref={cameraRef}
      style={{ flex: 1 }} 
      facing={facing}
    >
      <TouchableOpacity onPress={takePicture}>
        <Text>📸</Text>
      </TouchableOpacity>
    </Camera>
  );
}
\`\`\`

## 2. الموقع الجغرافي

\`\`\`bash
npx expo install expo-location
\`\`\`

\`\`\`javascript
import * as Location from 'expo-location';

async function getLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert('يجب السماح بالموقع');
    return;
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  console.log(location.coords.latitude, location.coords.longitude);
  return location;
}

// تتبع الموقع
useEffect(() => {
  let subscription;

  const startTracking = async () => {
    subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        console.log('New location:', location);
      }
    );
  };

  startTracking();

  return () => subscription?.remove();
}, []);

// تحويل الإحداثيات لعنوان
const address = await Location.reverseGeocodeAsync({
  latitude: 33.3,
  longitude: 44.4,
});
console.log(address[0].city, address[0].country);
\`\`\`

## 3. الإشعارات

\`\`\`bash
npx expo install expo-notifications
\`\`\`

\`\`\`javascript
import * as Notifications from 'expo-notifications';

// إعداد الإشعارات
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// طلب الإذن
async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert('يجب السماح بالإشعارات');
    return;
  }

  const token = await Notifications.getExpoPushTokenAsync();
  console.log('Push Token:', token.data);
  return token.data;
}

// إرسال إشعار محلي
async function sendLocalNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'مرحباً!',
      body: 'هذا إشعار تجريبي',
      data: { screen: 'Home' },
    },
    trigger: { seconds: 2 },
  });
}

// الاستماع للإشعارات
useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
    }
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const { screen } = response.notification.request.content.data;
      if (screen) navigation.navigate(screen);
    }
  );

  return () => {
    subscription.remove();
    responseSubscription.remove();
  };
}, []);
\`\`\`

## 4. التخزين المحلي للملفات

\`\`\`bash
npx expo install expo-file-system
\`\`\`

\`\`\`javascript
import * as FileSystem from 'expo-file-system';

// قراءة ملف
const content = await FileSystem.readAsStringAsync(
  FileSystem.documentDirectory + 'data.json'
);

// كتابة ملف
await FileSystem.writeAsStringAsync(
  FileSystem.documentDirectory + 'data.json',
  JSON.stringify({ name: 'test' })
);

// تحميل ملف
const downloadResult = await FileSystem.downloadAsync(
  'https://example.com/image.jpg',
  FileSystem.documentDirectory + 'image.jpg'
);
console.log('Downloaded to:', downloadResult.uri);

// معلومات الملف
const info = await FileSystem.getInfoAsync(fileUri);
console.log('Size:', info.size);
\`\`\`

## 5. المشاركة

\`\`\`bash
npx expo install expo-sharing
\`\`\`

\`\`\`javascript
import * as Sharing from 'expo-sharing';

async function shareFile(uri) {
  const isAvailable = await Sharing.isAvailableAsync();
  
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: 'image/jpeg',
      dialogTitle: 'شارك الصورة',
    });
  }
}
\`\`\``,
    xpReward: 200,
    order: 5,
    type: 'practice',
    estimatedMinutes: 55,
    isLocked: false,
    quiz: {
      question: 'ما هي المكتبة المستخدمة للتعامل مع الموقع في Expo؟',
      options: [
        'react-native-geolocation',
        'expo-location',
        '@react-native-community/geolocation',
        'native-location',
      ],
      correctAnswer: 1,
    },
  },
];

// ===== جميع دروس React Native =====
export const ALL_REACT_NATIVE_LESSONS: Lesson[] = [
  ...REACT_NATIVE_LESSONS_BEGINNER,
  ...REACT_NATIVE_LESSONS_INTERMEDIATE,
];

// ===== تحديات React Native =====
export const REACT_NATIVE_CHALLENGES: Challenge[] = [
  {
    id: 'rn-challenge-001',
    courseId: 'rn-basics',
    title: 'بناء شاشة تسجيل دخول',
    description: 'أنشئ شاشة تسجيل دخول جميلة مع حقول البريد وكلمة المرور',
    difficulty: 'easy',
    points: 200,
    xpReward: 200,
    timeLimit: 30,
    language: 'React',
    icon: 'log-in-outline',
    category: 'ui',
    isLocked: false,
    hints: [
      'استخدم useState لتخزين قيم الحقول',
      'استخدم TextInput مع secureTextEntry لكلمة المرور',
      'أضف تحقق من صحة البيانات قبل الإرسال',
    ],
    starterCode: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function LoginScreen() {
  // أكمل الكود هنا
  
  return (
    <View style={styles.container}>
      {/* أضف حقول الإدخال والزر */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});`,
    solution: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }
    Alert.alert('نجاح', 'تم تسجيل الدخول بنجاح!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تسجيل الدخول</Text>
      <TextInput
        style={styles.input}
        placeholder="البريد الإلكتروني"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="كلمة المرور"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>دخول</Text>
      </TouchableOpacity>
    </View>
  );
}`,
    testCases: [
      {
        input: 'email field exists',
        expectedOutput: 'true',
        description: 'تحقق من وجود حقل البريد',
      },
      {
        input: 'password field exists',
        expectedOutput: 'true',
        description: 'تحقق من وجود حقل كلمة المرور',
      },
    ],
  },
  {
    id: 'rn-challenge-002',
    courseId: 'rn-basics',
    title: 'عداد متقدم',
    description: 'أنشئ عداداً مع أزرار الزيادة والنقصان وإعادة التعيين',
    difficulty: 'easy',
    points: 150,
    xpReward: 150,
    timeLimit: 20,
    language: 'JavaScript',
    icon: 'calculator-outline',
    category: 'state',
    isLocked: false,
    hints: [
      'استخدم useState لتخزين قيمة العداد',
      'أضف 3 أزرار: زيادة، نقصان، إعادة تعيين',
      'استخدم StyleSheet لتنسيق الأزرار بألوان مختلفة',
    ],
    starterCode: `// منطق العداد

// إنشاء حالة العداد
function createCounter(initialValue = 0) {
  // أكمل: أرجع كائن يحتوي على
  // getValue, increment, decrement, reset, incrementBy
  return {};
}

// حساب الخطوة الآمنة (لا ينزل تحت الصفر)
function safeDecrement(value) {
  // أكمل
  return value;
}

// تنسيق العداد للعرض (إضافة + أو -)
function formatCounter(value) {
  // أكمل: أرجع "+5" للموجب، "-3" للسالب، "0" للصفر
  return '';
}`,
    solution: `function createCounter(initialValue = 0) {
  let value = initialValue;
  return {
    getValue: () => value,
    increment: () => ++value,
    decrement: () => --value,
    reset: () => { value = initialValue; return value; },
    incrementBy: (n) => { value += n; return value; },
  };
}

function safeDecrement(value) {
  return Math.max(0, value - 1);
}

function formatCounter(value) {
  if (value > 0) return '+' + value;
  return '' + value;
}`,
    testCases: [
      {
        input: 'createCounter(5).getValue()',
        expectedOutput: '5',
        description: 'إنشاء عداد بقيمة 5',
      },
      {
        input:
          'const c = createCounter(0); c.increment(); c.increment(); c.getValue()',
        expectedOutput: '2',
        description: 'زيادة العداد مرتين',
      },
      {
        input: 'safeDecrement(0)',
        expectedOutput: '0',
        description: 'العداد لا ينزل تحت الصفر',
      },
      {
        input: 'formatCounter(5)',
        expectedOutput: '+5',
        description: 'تنسيق العدد الموجب',
      },
    ],
  },
  {
    id: 'rn-challenge-003',
    courseId: 'rn-basics',
    title: 'قائمة مهام كاملة',
    description: 'أنشئ تطبيق قائمة مهام مع إضافة وحذف وتحديد المهام المكتملة',
    difficulty: 'medium',
    points: 350,
    xpReward: 350,
    timeLimit: 45,
    language: 'JavaScript',
    icon: 'checkbox-outline',
    category: 'crud',
    isLocked: false,
    hints: [
      'استخدم مصفوفة لتخزين المهام',
      'كل مهمة تحتاج: id, text, done',
      'استخدم FlatList لعرض المهام',
      'استخدم filter للحذف و map للتحديث',
    ],
    starterCode: `// منطق قائمة المهام

function createTodoList() {
  let tasks = [];
  let nextId = 1;

  return {
    // إضافة مهمة جديدة
    addTask(text) {
      // أكمل
    },
    // تبديل حالة الإنجاز
    toggleTask(id) {
      // أكمل
    },
    // حذف مهمة
    removeTask(id) {
      // أكمل
    },
    // جلب المهام
    getTasks() { return tasks; },
    // عدد المكتملة
    completedCount() {
      // أكمل
      return 0;
    },
    // تصفية - إرجاع مهام غير مكتملة فقط
    getActiveTasks() {
      // أكمل
      return [];
    },
  };
}`,
    solution: `function createTodoList() {
  let tasks = [];
  let nextId = 1;

  return {
    addTask(text) {
      tasks.push({ id: nextId++, text, done: false });
      return tasks;
    },
    toggleTask(id) {
      tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
      return tasks;
    },
    removeTask(id) {
      tasks = tasks.filter(t => t.id !== id);
      return tasks;
    },
    getTasks() { return tasks; },
    completedCount() {
      return tasks.filter(t => t.done).length;
    },
    getActiveTasks() {
      return tasks.filter(t => !t.done);
    },
  };
}`,
    testCases: [
      {
        input:
          'const todo = createTodoList(); todo.addTask("مهمة 1"); todo.getTasks().length',
        expectedOutput: '1',
        description: 'إضافة مهمة واحدة',
      },
      {
        input:
          'const todo = createTodoList(); todo.addTask("مهمة"); todo.toggleTask(1); todo.completedCount()',
        expectedOutput: '1',
        description: 'تبديل حالة مهمة إلى مكتملة',
      },
      {
        input:
          'const todo = createTodoList(); todo.addTask("a"); todo.addTask("b"); todo.removeTask(1); todo.getTasks().length',
        expectedOutput: '1',
        description: 'حذف مهمة من القائمة',
      },
      {
        input:
          'const todo = createTodoList(); todo.addTask("a"); todo.addTask("b"); todo.toggleTask(1); todo.getActiveTasks().length',
        expectedOutput: '1',
        description: 'تصفية المهام غير المكتملة',
      },
    ],
  },
  {
    id: 'rn-challenge-004',
    courseId: 'rn-advanced',
    title: 'متجر بسيط مع عربة',
    description: 'أنشئ متجراً مع قائمة منتجات وعربة تسوق',
    difficulty: 'hard',
    points: 500,
    xpReward: 500,
    timeLimit: 60,
    language: 'JavaScript',
    icon: 'cart-outline',
    category: 'state-management',
    isLocked: true,
    hints: [
      'استخدم Context أو Zustand لإدارة الحالة',
      'أنشئ مكون ProductCard قابل لإعادة الاستخدام',
      'احسب مجموع العربة تلقائياً',
    ],
    starterCode: `// منطق عربة التسوق

function createStore() {
  const products = [
    { id: '1', name: 'هاتف', price: 500 },
    { id: '2', name: 'لابتوب', price: 1200 },
    { id: '3', name: 'سماعات', price: 80 },
  ];
  let cart = [];

  return {
    getProducts() { return products; },
    // إضافة منتج للعربة (زيادة الكمية إذا موجود)
    addToCart(productId) {
      // أكمل
    },
    // حذف منتج من العربة
    removeFromCart(productId) {
      // أكمل
    },
    // حساب المجموع
    getTotal() {
      // أكمل
      return 0;
    },
    // عدد العناصر في العربة
    getCartCount() {
      // أكمل
      return 0;
    },
    getCart() { return cart; },
  };
}`,
    solution: `function createStore() {
  const products = [
    { id: '1', name: 'هاتف', price: 500 },
    { id: '2', name: 'لابتوب', price: 1200 },
    { id: '3', name: 'سماعات', price: 80 },
  ];
  let cart = [];

  return {
    getProducts() { return products; },
    addToCart(productId) {
      const existing = cart.find(item => item.productId === productId);
      if (existing) {
        existing.quantity++;
      } else {
        const product = products.find(p => p.id === productId);
        if (product) cart.push({ productId, name: product.name, price: product.price, quantity: 1 });
      }
      return cart;
    },
    removeFromCart(productId) {
      cart = cart.filter(item => item.productId !== productId);
      return cart;
    },
    getTotal() {
      return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    getCartCount() {
      return cart.reduce((sum, item) => sum + item.quantity, 0);
    },
    getCart() { return cart; },
  };
}`,
    testCases: [
      {
        input: 'const s = createStore(); s.addToCart("1"); s.getTotal()',
        expectedOutput: '500',
        description: 'إضافة هاتف للعربة وحساب المجموع',
      },
      {
        input:
          'const s = createStore(); s.addToCart("1"); s.addToCart("1"); s.getCartCount()',
        expectedOutput: '2',
        description: 'إضافة نفس المنتج مرتين يزيد الكمية',
      },
      {
        input:
          'const s = createStore(); s.addToCart("1"); s.addToCart("2"); s.getTotal()',
        expectedOutput: '1700',
        description: 'مجموع منتجين مختلفين',
      },
      {
        input:
          'const s = createStore(); s.addToCart("1"); s.removeFromCart("1"); s.getTotal()',
        expectedOutput: '0',
        description: 'المجموع بعد حذف المنتج',
      },
    ],
  },
  {
    id: 'rn-challenge-005',
    courseId: 'rn-advanced',
    title: 'تطبيق طقس',
    description: 'أنشئ تطبيق طقس يستخدم API حقيقي',
    difficulty: 'hard',
    points: 600,
    xpReward: 600,
    timeLimit: 90,
    language: 'JavaScript',
    icon: 'cloudy-outline',
    category: 'api',
    isLocked: true,
    hints: [
      'استخدم OpenWeatherMap API',
      'استخدم fetch أو axios للطلبات',
      'أضف حالة التحميل والأخطاء',
    ],
    starterCode: `// منطق تطبيق الطقس

// تحويل كلفن إلى مئوي
function kelvinToCelsius(kelvin) {
  // أكمل
  return 0;
}

// تحويل كلفن إلى فهرنهايت
function kelvinToFahrenheit(kelvin) {
  // أكمل
  return 0;
}

// تحليل استجابة API واستخراج البيانات
function parseWeatherData(apiResponse) {
  // أكمل: استخرج city, temp (مئوي), description, humidity
  return {};
}

// نصيحة بناءً على درجة الحرارة
function getWeatherAdvice(tempCelsius) {
  // أكمل
  return '';
}`,
    solution: `function kelvinToCelsius(kelvin) {
  return Math.round((kelvin - 273.15) * 100) / 100;
}

function kelvinToFahrenheit(kelvin) {
  return Math.round(((kelvin - 273.15) * 9/5 + 32) * 100) / 100;
}

function parseWeatherData(apiResponse) {
  return {
    city: apiResponse.name,
    temp: kelvinToCelsius(apiResponse.main.temp),
    description: apiResponse.weather[0].description,
    humidity: apiResponse.main.humidity,
  };
}

function getWeatherAdvice(tempCelsius) {
  if (tempCelsius < 0) return 'بارد جداً، ارتدِ ملابس ثقيلة';
  if (tempCelsius < 15) return 'بارد، ارتدِ معطفاً';
  if (tempCelsius < 30) return 'طقس معتدل';
  return 'حار، اشرب ماءً كثيراً';
}`,
    testCases: [
      {
        input: 'kelvinToCelsius(273.15)',
        expectedOutput: '0',
        description: 'تحويل 273.15 كلفن إلى 0 مئوي',
      },
      {
        input: 'kelvinToFahrenheit(273.15)',
        expectedOutput: '32',
        description: 'تحويل كلفن إلى فهرنهايت',
      },
      {
        input: 'getWeatherAdvice(35)',
        expectedOutput: 'حار، اشرب ماءً كثيراً',
        description: 'نصيحة طقس حار',
      },
      {
        input: 'getWeatherAdvice(-5)',
        expectedOutput: 'بارد جداً، ارتدِ ملابس ثقيلة',
        description: 'نصيحة طقس بارد جداً',
      },
    ],
  },
];

// ===== تصدير كل المحتوى =====
export const ALL_RN_LESSONS = ALL_REACT_NATIVE_LESSONS;
export const ALL_RN_CHALLENGES = REACT_NATIVE_CHALLENGES;
