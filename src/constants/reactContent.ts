/**
 * محتوى React الشامل - Kodax
 * دورة كاملة من الصفر إلى الاحتراف
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس React الأساسية =====
export const REACT_BEGINNER_LESSONS: Lesson[] = [
  {
    id: 'react-1',
    courseId: 'web-react-intro',
    title: 'مقدمة في React',
    description: 'تعرف على مكتبة بناء واجهات المستخدم',
    content: `
# مقدمة في React

React هي **مكتبة JavaScript** من Meta (Facebook) لبناء واجهات مستخدم تفاعلية.

## لماذا React؟

### 1. الشعبية والانتشار
- أكثر مكتبة Front-end استخداماً في العالم
- مستخدمة في: Facebook, Instagram, Netflix, Airbnb, Uber
- مجتمع ضخم ومكتبات لانهائية

### 2. Component-Based
- قسّم واجهتك لمكونات صغيرة قابلة لإعادة الاستخدام
- كل مكون له منطقه وشكله الخاص
- سهولة الصيانة والتطوير

### 3. Virtual DOM
- تحديثات سريعة وفعالة
- React يحدث فقط ما تغير، ليس كل الصفحة
- أداء ممتاز حتى مع التطبيقات الكبيرة

### 4. Declarative (تصريحي)
- تصف ماذا تريد، وليس كيف
- كود أسهل للقراءة والفهم
- أخطاء أقل

## إنشاء مشروع React

### باستخدام Vite (الأسرع والأفضل) ⭐
\`\`\`bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
\`\`\`

### باستخدام Create React App
\`\`\`bash
npx create-react-app my-app
cd my-app
npm start
\`\`\`

## هيكل المشروع

\`\`\`
my-app/
├── node_modules/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── package.json
└── vite.config.js
\`\`\`

## أول مكون React

\`\`\`jsx
// App.jsx
function App() {
  return (
    <div>
      <h1>مرحباً بالعالم!</h1>
      <p>هذا أول تطبيق React</p>
    </div>
  );
}

export default App;
\`\`\`

## JSX - ما هو؟

JSX يسمح لك بكتابة HTML داخل JavaScript:

\`\`\`jsx
// JSX
const element = <h1>مرحباً!</h1>;

// يتحول إلى:
const element = React.createElement('h1', null, 'مرحباً!');
\`\`\`

### قواعد JSX:
1. **عنصر واحد جذري** - استخدم \`<>\` أو \`<div>\`
2. **أغلق كل الوسوم** - \`<img />\` وليس \`<img>\`
3. **className بدل class** - لأن class كلمة محجوزة
4. **htmlFor بدل for** - في \`<label>\`
5. **التعبيرات في {}** - \`{variable}\`

\`\`\`jsx
function Greeting() {
  const name = "أحمد";
  const isLoggedIn = true;
  
  return (
    <>
      <h1 className="title">مرحباً {name}!</h1>
      {isLoggedIn && <p>أهلاً بعودتك</p>}
      <img src="avatar.png" alt="صورة" />
    </>
  );
}
\`\`\`
`,
    codeExample: `// مكون React بسيط
function Welcome() {
  const name = "أحمد";
  const currentTime = new Date().toLocaleTimeString('ar-IQ');
  
  return (
    <div className="welcome">
      <h1>مرحباً {name}!</h1>
      <p>الوقت الآن: {currentTime}</p>
    </div>
  );
}

// تصدير المكون
export default Welcome;`,
    language: 'jsx',
    xpReward: 150,
    order: 1,
    quiz: {
      question: 'ما الفرق بين class و className في JSX؟',
      options: [
        'لا فرق',
        'class لـ CSS و className لـ JavaScript',
        'className يُستخدم في JSX لأن class كلمة محجوزة',
        'className أسرع',
      ],
      correctAnswer: 2,
      explanation:
        'في JavaScript، class هي كلمة محجوزة لتعريف Classes، لذا React يستخدم className بدلاً منها.',
    },
  },
  {
    id: 'react-2',
    courseId: 'web-react-intro',
    title: 'المكونات (Components)',
    description: 'بناء وتنظيم المكونات',
    content: `
# المكونات (Components)

المكونات هي **اللبنات الأساسية** لأي تطبيق React.

## أنواع المكونات

### 1. Function Components (الأفضل حالياً) ⭐
\`\`\`jsx
function Button() {
  return <button>انقر هنا</button>;
}

// أو Arrow Function
const Button = () => {
  return <button>انقر هنا</button>;
};

// اختصار (بدون return)
const Button = () => <button>انقر هنا</button>;
\`\`\`

### 2. Class Components (القديمة)
\`\`\`jsx
class Button extends React.Component {
  render() {
    return <button>انقر هنا</button>;
  }
}
\`\`\`

## Props (الخصائص)

Props تُمرر البيانات من المكون الأب للابن:

\`\`\`jsx
// تعريف المكون مع props
function Greeting({ name, age }) {
  return (
    <div>
      <h1>مرحباً {name}!</h1>
      <p>عمرك {age} سنة</p>
    </div>
  );
}

// استخدام المكون
function App() {
  return (
    <>
      <Greeting name="أحمد" age={25} />
      <Greeting name="محمد" age={30} />
    </>
  );
}
\`\`\`

### Props مع القيم الافتراضية
\`\`\`jsx
function Button({ text = "انقر", color = "blue", size = "medium" }) {
  return (
    <button className={\`btn btn-\${color} btn-\${size}\`}>
      {text}
    </button>
  );
}

// استخدام
<Button />
<Button text="إرسال" color="green" />
<Button text="حذف" color="red" size="small" />
\`\`\`

### Props Children
\`\`\`jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

// استخدام
<Card title="عنوان البطاقة">
  <p>هذا محتوى البطاقة</p>
  <button>زر داخل البطاقة</button>
</Card>
\`\`\`

## التركيب (Composition)

\`\`\`jsx
// مكونات صغيرة
function Avatar({ src, alt }) {
  return <img src={src} alt={alt} className="avatar" />;
}

function UserInfo({ user }) {
  return (
    <div className="user-info">
      <h3>{user.name}</h3>
      <p>{user.bio}</p>
    </div>
  );
}

// مكون مركب
function UserCard({ user }) {
  return (
    <div className="user-card">
      <Avatar src={user.avatar} alt={user.name} />
      <UserInfo user={user} />
    </div>
  );
}

// قائمة مستخدمين
function UserList({ users }) {
  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
\`\`\`

## تنظيم المكونات

\`\`\`
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── Input.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Sidebar.jsx
│   └── features/
│       ├── UserCard.jsx
│       └── ProductList.jsx
├── pages/
│   ├── Home.jsx
│   └── Profile.jsx
└── App.jsx
\`\`\`

## أفضل الممارسات

1. **مكون واحد = ملف واحد**
2. **اسم المكون يبدأ بحرف كبير**: \`Button\` وليس \`button\`
3. **المكونات الصغيرة أفضل** من المكونات الكبيرة
4. **Props للقراءة فقط** - لا تُعدّل props
5. **استخدم PropTypes أو TypeScript** للتحقق
`,
    codeExample: `// مكون بطاقة منتج
function ProductCard({ name, price, image, onAddToCart }) {
  return (
    <div className="product-card">
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p className="price">{price} دينار</p>
      <button onClick={onAddToCart}>
        أضف للسلة
      </button>
    </div>
  );
}

// قائمة المنتجات
function ProductList({ products }) {
  return (
    <div className="products">
      {products.map(product => (
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
          image={product.image}
          onAddToCart={() => console.log('Added:', product.name)}
        />
      ))}
    </div>
  );
}`,
    language: 'jsx',
    xpReward: 160,
    order: 2,
    quiz: {
      question: 'ما هي Props في React؟',
      options: [
        'متغيرات داخلية للمكون',
        'بيانات تُمرر من الأب للابن',
        'دوال JavaScript',
        'أنماط CSS',
      ],
      correctAnswer: 1,
      explanation:
        'Props (Properties) هي البيانات التي يُمررها المكون الأب لأبنائه، وهي للقراءة فقط.',
    },
  },
  {
    id: 'react-3',
    courseId: 'web-react-intro',
    title: 'State و useState',
    description: 'إدارة حالة المكون',
    content: `
# State وuseState

State هي **البيانات المتغيرة** داخل المكون التي تُسبب إعادة الرسم عند تغييرها.

## useState Hook

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  // [القيمة, دالة التحديث] = useState(القيمة الأولية)
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>العداد: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        زيادة
      </button>
    </div>
  );
}
\`\`\`

## أنواع State

### 1. أرقام ونصوص
\`\`\`jsx
const [age, setAge] = useState(25);
const [name, setName] = useState("أحمد");
const [isActive, setIsActive] = useState(false);
\`\`\`

### 2. Objects
\`\`\`jsx
const [user, setUser] = useState({
  name: "أحمد",
  email: "ahmed@email.com"
});

// ❌ خطأ - لا تُعدّل مباشرة
user.name = "محمد";
setUser(user);

// ✅ صحيح - أنشئ نسخة جديدة
setUser({ ...user, name: "محمد" });

// ✅ أو باستخدام دالة
setUser(prevUser => ({
  ...prevUser,
  name: "محمد"
}));
\`\`\`

### 3. Arrays
\`\`\`jsx
const [items, setItems] = useState([]);

// إضافة عنصر
setItems([...items, newItem]);

// حذف عنصر
setItems(items.filter(item => item.id !== idToDelete));

// تحديث عنصر
setItems(items.map(item => 
  item.id === idToUpdate 
    ? { ...item, name: newName }
    : item
));
\`\`\`

## أمثلة عملية

### نموذج تسجيل
\`\`\`jsx
function SignupForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // إرسال البيانات
      await submitForm(formData);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="اسم المستخدم"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="البريد الإلكتروني"
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="كلمة المرور"
      />
      <button disabled={isSubmitting}>
        {isSubmitting ? "جارٍ التسجيل..." : "تسجيل"}
      </button>
    </form>
  );
}
\`\`\`

### قائمة المهام
\`\`\`jsx
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  
  const addTodo = () => {
    if (!input.trim()) return;
    
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: input,
        completed: false
      }
    ]);
    setInput("");
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };
  
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && addTodo()}
        placeholder="مهمة جديدة..."
      />
      <button onClick={addTodo}>إضافة</button>
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{
              textDecoration: todo.completed ? "line-through" : "none"
            }}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>
              حذف
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

## قواعد مهمة

1. **لا تُعدّل State مباشرة** - استخدم دالة التحديث
2. **State غير متزامن** - لا تعتمد على قيمته فوراً
3. **استخدم الدالة** للتحديث بناءً على القيمة السابقة
4. **أنشئ State منفصلة** للبيانات المختلفة
`,
    codeExample: `import { useState } from 'react';

function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  
  const addItem = (product) => {
    setItems([...items, { ...product, id: Date.now() }]);
    setTotal(prev => prev + product.price);
  };
  
  const removeItem = (id, price) => {
    setItems(items.filter(item => item.id !== id));
    setTotal(prev => prev - price);
  };
  
  return (
    <div className="cart">
      <h2>سلة التسوق ({items.length})</h2>
      
      {items.map(item => (
        <div key={item.id} className="cart-item">
          <span>{item.name}</span>
          <span>{item.price} دينار</span>
          <button onClick={() => removeItem(item.id, item.price)}>
            ✕
          </button>
        </div>
      ))}
      
      <div className="total">
        المجموع: {total} دينار
      </div>
    </div>
  );
}`,
    language: 'jsx',
    xpReward: 180,
    order: 3,
    quiz: {
      question: 'لماذا لا نُعدّل State مباشرة؟',
      options: [
        'لأنها بطيئة',
        'لأن React لن يكتشف التغيير ولن يُعيد الرسم',
        'لأنها ستُسبب أخطاء',
        'لا يوجد سبب',
      ],
      correctAnswer: 1,
      explanation:
        'React يعتمد على المقارنة بين القيمة القديمة والجديدة. التعديل المباشر لا يُغير المرجع، فلا يكتشف React التغيير.',
    },
  },
  {
    id: 'react-4',
    courseId: 'web-react-intro',
    title: 'useEffect و Side Effects',
    description: 'التعامل مع العمليات الجانبية',
    content: `
# useEffect و Side Effects

useEffect يُستخدم للعمليات الجانبية مثل: طلبات API، الاشتراكات، تعديل DOM.

## الاستخدام الأساسي

\`\`\`jsx
import { useEffect, useState } from 'react';

function Component() {
  useEffect(() => {
    // هذا الكود يُنفذ بعد كل render
    console.log("Component rendered!");
  });
  
  return <div>محتوى</div>;
}
\`\`\`

## Dependency Array

\`\`\`jsx
// يُنفذ بعد كل render
useEffect(() => {
  console.log("كل مرة");
});

// يُنفذ مرة واحدة عند التحميل
useEffect(() => {
  console.log("مرة واحدة");
}, []);

// يُنفذ عند تغير count
useEffect(() => {
  console.log("Count changed:", count);
}, [count]);

// يُنفذ عند تغير أي من القيمتين
useEffect(() => {
  console.log("Updated");
}, [value1, value2]);
\`\`\`

## Cleanup Function

\`\`\`jsx
useEffect(() => {
  // Setup
  const timer = setInterval(() => {
    console.log("Tick");
  }, 1000);
  
  // Cleanup - يُنفذ قبل الـ effect التالي أو عند unmount
  return () => {
    clearInterval(timer);
  };
}, []);
\`\`\`

## جلب البيانات (Data Fetching)

\`\`\`jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(\`/api/users/\${userId}\`);
        
        if (!response.ok) {
          throw new Error('فشل جلب البيانات');
        }
        
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]); // يُنفذ عند تغير userId
  
  if (loading) return <div>جارٍ التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;
  if (!user) return <div>لا يوجد مستخدم</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
\`\`\`

## أمثلة شائعة

### 1. عنوان الصفحة
\`\`\`jsx
function Page({ title }) {
  useEffect(() => {
    document.title = title;
    
    return () => {
      document.title = "Kodax";
    };
  }, [title]);
  
  return <h1>{title}</h1>;
}
\`\`\`

### 2. Event Listeners
\`\`\`jsx
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <p>
      حجم النافذة: {size.width} × {size.height}
    </p>
  );
}
\`\`\`

### 3. Local Storage
\`\`\`jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}

// استخدام
function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      الوضع: {theme}
    </button>
  );
}
\`\`\`

### 4. WebSocket
\`\`\`jsx
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    const ws = new WebSocket(\`wss://chat.com/\${roomId}\`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
    
    ws.onopen = () => {
      console.log('Connected to room:', roomId);
    };
    
    return () => {
      ws.close();
    };
  }, [roomId]);
  
  return (
    <div>
      {messages.map((msg, i) => (
        <p key={i}>{msg.text}</p>
      ))}
    </div>
  );
}
\`\`\`

## قواعد مهمة

1. **لا تنسَ Cleanup** للاشتراكات والـ timers
2. **أضف كل Dependencies** المستخدمة داخل useEffect
3. **تجنب تحديث State** داخل useEffect بدون شرط (infinite loop)
4. **استخدم multiple useEffect** لعمليات مختلفة
`,
    codeExample: `import { useState, useEffect } from 'react';

function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  // جلب المنشورات
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      
      const response = await fetch(
        \`https://jsonplaceholder.typicode.com/posts?_page=\${page}&_limit=10\`
      );
      const data = await response.json();
      
      setPosts(data);
      setLoading(false);
    };
    
    fetchPosts();
  }, [page]);
  
  // تحديث العنوان
  useEffect(() => {
    document.title = \`صفحة \${page}\`;
  }, [page]);
  
  if (loading) return <p>جارٍ التحميل...</p>;
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </article>
      ))}
      
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        السابق
      </button>
      <span>صفحة {page}</span>
      <button onClick={() => setPage(p => p + 1)}>
        التالي
      </button>
    </div>
  );
}`,
    language: 'jsx',
    xpReward: 200,
    order: 4,
    quiz: {
      question: 'ما الغرض من Cleanup function في useEffect؟',
      options: [
        'تنظيف الذاكرة',
        'إلغاء الاشتراكات والـ timers قبل unmount أو الـ effect التالي',
        'حذف المكون',
        'إعادة تعيين State',
      ],
      correctAnswer: 1,
      explanation:
        'Cleanup function تُنفذ لتنظيف أي اشتراكات أو timers قبل تنفيذ effect جديد أو قبل إزالة المكون.',
    },
  },
  {
    id: 'react-5',
    courseId: 'web-react-intro',
    title: 'Hooks الأخرى',
    description: 'useContext, useRef, useMemo, useCallback',
    content: `
# Hooks الأخرى المهمة

## useContext - مشاركة البيانات

\`\`\`jsx
import { createContext, useContext, useState } from 'react';

// إنشاء Context
const ThemeContext = createContext();

// Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// استخدام في أي مكون
function Button() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button 
      onClick={toggleTheme}
      className={\`btn btn-\${theme}\`}
    >
      الوضع: {theme}
    </button>
  );
}

// App
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
      <Button />
    </ThemeProvider>
  );
}
\`\`\`

## useRef - مرجع للعناصر

\`\`\`jsx
import { useRef, useEffect } from 'react';

function TextInput() {
  const inputRef = useRef(null);
  
  useEffect(() => {
    // التركيز على الحقل عند التحميل
    inputRef.current.focus();
  }, []);
  
  return (
    <input 
      ref={inputRef}
      placeholder="اكتب هنا..."
    />
  );
}

// حفظ قيمة بدون إعادة render
function Timer() {
  const countRef = useRef(0);
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      countRef.current += 1;
      console.log(countRef.current); // يتحدث
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div>
      <p>العداد الداخلي: {countRef.current}</p>
      <button onClick={() => setDisplay(countRef.current)}>
        عرض القيمة الحالية
      </button>
      <p>المعروض: {display}</p>
    </div>
  );
}
\`\`\`

## useMemo - تخزين القيم المحسوبة

\`\`\`jsx
import { useMemo, useState } from 'react';

function ExpensiveList({ items, filter }) {
  // تُنفذ فقط عند تغير items أو filter
  const filteredItems = useMemo(() => {
    console.log("Filtering...");
    return items.filter(item => 
      item.name.includes(filter)
    );
  }, [items, filter]);
  
  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// مثال: حساب معقد
function Calculator({ numbers }) {
  const sum = useMemo(() => {
    return numbers.reduce((acc, n) => acc + n, 0);
  }, [numbers]);
  
  const average = useMemo(() => {
    return sum / numbers.length;
  }, [sum, numbers.length]);
  
  return (
    <div>
      <p>المجموع: {sum}</p>
      <p>المتوسط: {average}</p>
    </div>
  );
}
\`\`\`

## useCallback - تخزين الدوال

\`\`\`jsx
import { useCallback, useState, memo } from 'react';

// مكون ابن مُحسّن
const Button = memo(({ onClick, children }) => {
  console.log("Button rendered:", children);
  return <button onClick={onClick}>{children}</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  
  // ❌ بدون useCallback - تُنشأ دالة جديدة كل render
  const handleClick = () => setCount(c => c + 1);
  
  // ✅ مع useCallback - نفس الدالة
  const handleClickMemo = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return (
    <div>
      <input 
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <p>العداد: {count}</p>
      <Button onClick={handleClickMemo}>زيادة</Button>
    </div>
  );
}
\`\`\`

## useReducer - للـ State المعقد

\`\`\`jsx
import { useReducer } from 'react';

// الحالة الأولية
const initialState = {
  items: [],
  loading: false,
  error: null
};

// Reducer Function
function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'DELETE_ITEM':
      return { 
        ...state, 
        items: state.items.filter(item => item.id !== action.payload)
      };
    default:
      return state;
  }
}

function ItemList() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const fetchItems = async () => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  };
  
  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };
  
  const deleteItem = (id) => {
    dispatch({ type: 'DELETE_ITEM', payload: id });
  };
  
  return (
    <div>
      {state.loading && <p>جارٍ التحميل...</p>}
      {state.error && <p>خطأ: {state.error}</p>}
      
      <ul>
        {state.items.map(item => (
          <li key={item.id}>
            {item.name}
            <button onClick={() => deleteItem(item.id)}>حذف</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

## Custom Hooks

\`\`\`jsx
// Hook مخصص لجلب البيانات
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url]);
  
  return { data, loading, error };
}

// استخدام
function Users() {
  const { data: users, loading, error } = useFetch('/api/users');
  
  if (loading) return <p>جارٍ التحميل...</p>;
  if (error) return <p>خطأ: {error}</p>;
  
  return (
    <ul>
      {users?.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
\`\`\`
`,
    codeExample: `import { useState, useContext, createContext, useMemo } from 'react';

// Auth Context
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);
  
  const value = useMemo(() => ({
    user,
    isLoggedIn: !!user,
    login,
    logout
  }), [user]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook مخصص
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// استخدام
function Profile() {
  const { user, isLoggedIn, logout } = useAuth();
  
  if (!isLoggedIn) {
    return <p>الرجاء تسجيل الدخول</p>;
  }
  
  return (
    <div>
      <h2>مرحباً {user.name}</h2>
      <button onClick={logout}>تسجيل الخروج</button>
    </div>
  );
}`,
    language: 'jsx',
    xpReward: 220,
    order: 5,
    quiz: {
      question: 'متى نستخدم useMemo؟',
      options: [
        'دائماً لكل حساب',
        'للحسابات المكلفة التي تتكرر دون تغيير المدخلات',
        'لتخزين الدوال',
        'لتحديث DOM',
      ],
      correctAnswer: 1,
      explanation:
        'useMemo يُستخدم لتخزين نتائج الحسابات المكلفة، فلا تُعاد إلا عند تغير المدخلات.',
    },
  },
  {
    id: 'react-6',
    courseId: 'web-react-intro',
    title: 'React Router',
    description: 'التنقل بين الصفحات',
    content: `
# React Router

React Router هي المكتبة الأكثر استخداماً للتنقل في تطبيقات React.

## التثبيت

\`\`\`bash
npm install react-router-dom
\`\`\`

## الإعداد الأساسي

\`\`\`jsx
import { 
  BrowserRouter, 
  Routes, 
  Route,
  Link,
  NavLink 
} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">الرئيسية</Link>
        <Link to="/about">من نحن</Link>
        <Link to="/contact">اتصل بنا</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
\`\`\`

## Dynamic Routes

\`\`\`jsx
import { useParams, useSearchParams } from 'react-router-dom';

// Route
<Route path="/users/:userId" element={<UserProfile />} />
<Route path="/products/:category/:id" element={<Product />} />

// Component
function UserProfile() {
  const { userId } = useParams();
  
  return <h1>المستخدم: {userId}</h1>;
}

function Product() {
  const { category, id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const sort = searchParams.get('sort') || 'newest';
  
  return (
    <div>
      <h1>منتج {id} من قسم {category}</h1>
      <p>الترتيب: {sort}</p>
      <button onClick={() => setSearchParams({ sort: 'price' })}>
        ترتيب بالسعر
      </button>
    </div>
  );
}
\`\`\`

## Navigation البرمجي

\`\`\`jsx
import { useNavigate, useLocation } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // تسجيل الدخول
    await login(credentials);
    
    // العودة للصفحة السابقة أو الرئيسية
    const from = location.state?.from || '/';
    navigate(from, { replace: true });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <button type="submit">تسجيل الدخول</button>
    </form>
  );
}

// التنقل
navigate('/dashboard');        // الذهاب
navigate(-1);                   // رجوع
navigate('/login', { replace: true }); // استبدال
navigate('/profile', { state: { from: location } });
\`\`\`

## Nested Routes

\`\`\`jsx
import { Outlet } from 'react-router-dom';

// Layout مع Outlet
function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />
      <main>
        <Outlet /> {/* هنا تظهر الصفحات الفرعية */}
      </main>
    </div>
  );
}

// Routes
<Route path="/dashboard" element={<Dashboard />}>
  <Route index element={<DashboardHome />} />
  <Route path="profile" element={<Profile />} />
  <Route path="settings" element={<Settings />} />
</Route>

// الروابط
<Link to="/dashboard">الرئيسية</Link>
<Link to="/dashboard/profile">الملف الشخصي</Link>
<Link to="/dashboard/settings">الإعدادات</Link>
\`\`\`

## Protected Routes

\`\`\`jsx
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  
  if (!isLoggedIn) {
    // حفظ الموقع الحالي للعودة بعد تسجيل الدخول
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }
  
  return children;
}

// استخدام
<Route 
  path="/dashboard/*" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
\`\`\`

## NavLink للتنسيق

\`\`\`jsx
<NavLink 
  to="/about"
  className={({ isActive }) => 
    isActive ? "nav-link active" : "nav-link"
  }
  style={({ isActive }) => ({
    fontWeight: isActive ? "bold" : "normal"
  })}
>
  من نحن
</NavLink>
\`\`\`

## Lazy Loading

\`\`\`jsx
import { lazy, Suspense } from 'react';

// تحميل كسول
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
\`\`\`
`,
    codeExample: `import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Link, 
  useParams,
  useNavigate 
} from 'react-router-dom';

// الصفحات
function Home() {
  return <h1>الصفحة الرئيسية</h1>;
}

function Products() {
  const products = [
    { id: 1, name: 'منتج 1' },
    { id: 2, name: 'منتج 2' },
  ];
  
  return (
    <div>
      <h1>المنتجات</h1>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            <Link to={\`/products/\${p.id}\`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>تفاصيل المنتج {id}</h1>
      <button onClick={() => navigate(-1)}>رجوع</button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">الرئيسية</Link>
        <Link to="/products">المنتجات</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}`,
    language: 'jsx',
    xpReward: 200,
    order: 6,
    quiz: {
      question: 'ما الفرق بين Link و NavLink؟',
      options: [
        'لا فرق',
        'NavLink يوفر className/style حسب حالة النشاط',
        'Link أسرع',
        'NavLink للصفحات الخارجية',
      ],
      correctAnswer: 1,
      explanation:
        'NavLink يُتيح تنسيق الرابط بناءً على ما إذا كان نشطاً (المسار الحالي) باستخدام isActive.',
    },
  },
  {
    id: 'react-7',
    courseId: 'web-react-intro',
    title: 'Context API - إدارة الحالة العامة',
    description: 'مشاركة البيانات بين المكونات بدون prop drilling',
    content: `
# Context API

Context يوفر طريقة لمشاركة البيانات بين المكونات دون تمريرها يدوياً عبر كل مستوى.

## متى نستخدم Context؟
- بيانات يحتاجها عدة مكونات (مثل: المستخدم، الثيم، اللغة)
- تجنب "prop drilling" - تمرير props عبر مكونات لا تحتاجها

## إنشاء Context

\`\`\`jsx
import { createContext, useContext, useState } from 'react';

// 1. إنشاء Context
const ThemeContext = createContext();

// 2. إنشاء Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Hook مخصص للاستخدام
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export { ThemeProvider, useTheme };
\`\`\`

## الاستخدام

\`\`\`jsx
// App.jsx
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
      <Footer />
    </ThemeProvider>
  );
}

// Header.jsx
function Header() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className={\`header \${theme}\`}>
      <button onClick={toggleTheme}>
        تبديل الوضع
      </button>
    </header>
  );
}
\`\`\`
`,
    codeExample: `import { createContext, useContext, useState } from 'react';

// Auth Context مثال
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// الاستخدام في مكون
function Profile() {
  const { user, logout } = useAuth();
  
  if (!user) return <p>يرجى تسجيل الدخول</p>;
  
  return (
    <div>
      <p>مرحباً {user.name}</p>
      <button onClick={logout}>تسجيل خروج</button>
    </div>
  );
}`,
    language: 'javascript',
    xpReward: 150,
    order: 7,
    quiz: {
      question: 'ما هي فائدة Context API الرئيسية؟',
      options: [
        'تسريع الأداء',
        'تجنب prop drilling ومشاركة البيانات بين المكونات',
        'إنشاء مكونات جديدة',
        'التحكم في CSS',
      ],
      correctAnswer: 1,
      explanation:
        'Context API تساعد في مشاركة البيانات بين المكونات دون الحاجة لتمريرها يدوياً عبر كل مستوى (prop drilling).',
    },
  },
  {
    id: 'react-8',
    courseId: 'web-react-intro',
    title: 'Custom Hooks - بناء Hooks مخصصة',
    description: 'إعادة استخدام المنطق بين المكونات',
    content: `
# Custom Hooks

Custom Hooks تسمح لك باستخراج منطق المكون لإعادة استخدامه.

## قواعد Custom Hooks
1. اسم الـ Hook يجب أن يبدأ بـ "use"
2. يمكنها استدعاء hooks أخرى
3. يجب استدعاؤها في مستوى أعلى (ليس داخل شروط أو loops)

## مثال: useLocalStorage

\`\`\`jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue];
}

// الاستخدام
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      الوضع: {theme}
    </button>
  );
}
\`\`\`

## مثال: useFetch

\`\`\`jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    
    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
}

// الاستخدام
function UsersList() {
  const { data: users, loading, error } = useFetch('/api/users');
  
  if (loading) return <p>جارٍ التحميل...</p>;
  if (error) return <p>خطأ: {error}</p>;
  
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`
`,
    codeExample: `// useWindowSize - Hook لحجم النافذة
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// useToggle - Hook بسيط للتبديل
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(v => !v);
  return [value, toggle];
}

// الاستخدام
function Modal() {
  const [isOpen, toggleModal] = useToggle(false);
  const { width } = useWindowSize();
  
  return (
    <>
      <button onClick={toggleModal}>
        {isOpen ? 'إغلاق' : 'فتح'} Modal
      </button>
      {isOpen && (
        <div className={width < 768 ? 'modal-mobile' : 'modal-desktop'}>
          محتوى Modal
        </div>
      )}
    </>
  );
}`,
    language: 'javascript',
    xpReward: 150,
    order: 8,
    quiz: {
      question: 'ما هو الشرط الأساسي لاسم Custom Hook؟',
      options: [
        'يبدأ بـ "hook"',
        'يبدأ بـ "use"',
        'ينتهي بـ "Hook"',
        'لا يوجد شرط',
      ],
      correctAnswer: 1,
      explanation:
        'اسم Custom Hook يجب أن يبدأ بـ "use" لكي يتعرف عليه React ويطبق قواعد Hooks.',
    },
  },
  {
    id: 'react-9',
    courseId: 'web-react-intro',
    title: 'Forms وإدارة النماذج',
    description: 'التعامل مع النماذج والتحقق من صحة البيانات',
    content: `
# Forms في React

## Controlled Components

\`\`\`jsx
function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      newErrors.email = 'البريد غير صالح';
    }
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور قصيرة جداً';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // إرسال البيانات
      console.log('Submitting:', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="البريد الإلكتروني"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="كلمة المرور"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      
      <button type="submit">تسجيل الدخول</button>
    </form>
  );
}
\`\`\`

## useReducer للنماذج المعقدة

\`\`\`jsx
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

function ComplexForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  
  const updateField = (field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  };
  
  // ...
}
\`\`\`
`,
    codeExample: `function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('بيانات التسجيل:', formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="الاسم" />
      <input name="email" value={formData.email} onChange={handleChange} placeholder="البريد" />
      <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="كلمة المرور" />
      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="تأكيد كلمة المرور" />
      <label>
        <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} />
        أوافق على الشروط
      </label>
      <button type="submit">تسجيل</button>
    </form>
  );
}`,
    language: 'javascript',
    xpReward: 150,
    order: 9,
    quiz: {
      question: 'ما هو Controlled Component في React؟',
      options: [
        'مكون يتحكم في مكونات أخرى',
        'مكون يتم التحكم في قيمته بواسطة React state',
        'مكون محمي من التعديل',
        'مكون ثابت لا يتغير',
      ],
      correctAnswer: 1,
      explanation:
        'Controlled Component هو عنصر form يتم التحكم في قيمته من خلال React state، مما يجعل React هو "مصدر الحقيقة" للبيانات.',
    },
  },
  {
    id: 'react-10',
    courseId: 'web-react-intro',
    title: 'Error Boundaries',
    description: 'التعامل مع الأخطاء في React',
    content: `
# Error Boundaries

Error Boundaries هي مكونات React تلتقط أخطاء JavaScript في شجرة المكونات الفرعية.

## إنشاء Error Boundary

\`\`\`jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // إرسال الخطأ لخدمة تتبع الأخطاء
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>حدث خطأ ما!</h2>
          <p>نعتذر عن هذا الخطأ، يرجى تحديث الصفحة.</p>
          <button onClick={() => window.location.reload()}>
            تحديث الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// الاستخدام
function App() {
  return (
    <ErrorBoundary>
      <Header />
      <ErrorBoundary>
        <MainContent />
      </ErrorBoundary>
      <Footer />
    </ErrorBoundary>
  );
}
\`\`\`

## ملاحظات مهمة
- Error Boundaries لا تلتقط أخطاء:
  - Event handlers (استخدم try-catch)
  - Async code (استخدم .catch())
  - Server-side rendering
  - أخطاء في Error Boundary نفسه
`,
    codeExample: `class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h2>حدث خطأ!</h2>;
    }
    return this.props.children;
  }
}

// استخدام مع fallback مخصص
function App() {
  return (
    <ErrorBoundary fallback={<CustomErrorUI />}>
      <Dashboard />
    </ErrorBoundary>
  );
}`,
    language: 'javascript',
    xpReward: 150,
    order: 10,
    quiz: {
      question: 'ما الذي لا تستطيع Error Boundaries التقاطه؟',
      options: [
        'أخطاء render',
        'أخطاء lifecycle methods',
        'أخطاء event handlers',
        'أخطاء constructors',
      ],
      correctAnswer: 2,
      explanation:
        'Error Boundaries لا تلتقط أخطاء event handlers لأنها تحدث خارج دورة render. استخدم try-catch داخل event handlers.',
    },
  },
  {
    id: 'react-11',
    courseId: 'web-react-intro',
    title: 'React.memo و Optimization',
    description: 'تحسين أداء تطبيقات React',
    content: `
# تحسين الأداء في React

## React.memo

\`\`\`jsx
// المكون يُعاد render فقط عند تغير props
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  // حسابات مكلفة...
  return <div>{data}</div>;
});

// مع دالة مقارنة مخصصة
const MemoizedList = React.memo(
  function List({ items }) {
    return (
      <ul>
        {items.map(item => <li key={item.id}>{item.name}</li>)}
      </ul>
    );
  },
  (prevProps, nextProps) => {
    // return true إذا لا نريد إعادة render
    return prevProps.items.length === nextProps.items.length;
  }
);
\`\`\`

## useCallback

\`\`\`jsx
function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // بدون useCallback، handleClick جديدة في كل render
  const handleClick = useCallback(() => {
    console.log('Clicked!');
  }, []); // لا يوجد dependencies

  const handleCountClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // الدالة مستقرة

  return (
    <div>
      <ChildComponent onClick={handleClick} />
      <AnotherChild onIncrement={handleCountClick} />
    </div>
  );
}
\`\`\`

## useMemo

\`\`\`jsx
function DataTable({ items, filter }) {
  // حساب مكلف يُنفذ فقط عند تغير items أو filter
  const filteredItems = useMemo(() => {
    console.log('Filtering...');
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return (
    <table>
      <tbody>
        {filteredItems.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
\`\`\`
`,
    codeExample: `// مثال شامل على التحسين
const SearchableList = React.memo(function SearchableList({ items }) {
  const [search, setSearch] = useState('');
  
  // تصفية مُحسّنة
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);
  
  // handler مستقر
  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
  }, []);
  
  return (
    <div>
      <input 
        value={search} 
        onChange={handleSearch} 
        placeholder="ابحث..."
      />
      <ul>
        {filteredItems.map(item => (
          <ListItem key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
});

// مكون فرعي محسّن
const ListItem = React.memo(function ListItem({ item }) {
  return <li>{item.name}</li>;
});`,
    language: 'javascript',
    xpReward: 150,
    order: 11,
    quiz: {
      question: 'متى نستخدم useCallback؟',
      options: [
        'دائماً لكل دالة',
        'عند تمرير دوال كـ props لمكونات محسّنة (memo)',
        'فقط في class components',
        'لتخزين القيم',
      ],
      correctAnswer: 1,
      explanation:
        'useCallback مفيد عند تمرير دوال كـ props لمكونات تستخدم React.memo، لتجنب إعادة render غير ضرورية.',
    },
  },
  {
    id: 'react-12',
    courseId: 'web-react-intro',
    title: 'Suspense و Code Splitting',
    description: 'تحميل المكونات بشكل كسول',
    content: `
# Suspense و Code Splitting

## Lazy Loading للمكونات

\`\`\`jsx
import { lazy, Suspense } from 'react';

// تحميل كسول
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));
const Profile = lazy(() => import('./Profile'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

## Loading States

\`\`\`jsx
// Skeleton Loading
function LoadingSkeleton() {
  return (
    <div className="skeleton">
      <div className="skeleton-header"></div>
      <div className="skeleton-body"></div>
    </div>
  );
}

// استخدام متعدد Suspense
function App() {
  return (
    <div>
      <Header />
      
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      
      <Suspense fallback={<ContentSkeleton />}>
        <MainContent />
      </Suspense>
    </div>
  );
}
\`\`\`

## تحميل مشروط

\`\`\`jsx
function ConditionalLoad() {
  const [showChart, setShowChart] = useState(false);
  
  // Chart يُحمّل فقط عند الحاجة
  const Chart = showChart 
    ? lazy(() => import('./HeavyChart')) 
    : null;
  
  return (
    <div>
      <button onClick={() => setShowChart(true)}>
        عرض الرسم البياني
      </button>
      
      {showChart && (
        <Suspense fallback={<p>جارٍ تحميل الرسم...</p>}>
          <Chart />
        </Suspense>
      )}
    </div>
  );
}
\`\`\`
`,
    codeExample: `import { lazy, Suspense, useState } from 'react';

// تحميل كسول للمكونات الثقيلة
const HeavyEditor = lazy(() => import('./HeavyEditor'));
const DataVisualization = lazy(() => import('./DataVisualization'));

function App() {
  const [activeTab, setActiveTab] = useState('home');
  
  return (
    <div>
      <nav>
        <button onClick={() => setActiveTab('home')}>الرئيسية</button>
        <button onClick={() => setActiveTab('editor')}>المحرر</button>
        <button onClick={() => setActiveTab('charts')}>الرسوم</button>
      </nav>
      
      <main>
        {activeTab === 'home' && <Home />}
        
        {activeTab === 'editor' && (
          <Suspense fallback={<EditorSkeleton />}>
            <HeavyEditor />
          </Suspense>
        )}
        
        {activeTab === 'charts' && (
          <Suspense fallback={<ChartSkeleton />}>
            <DataVisualization />
          </Suspense>
        )}
      </main>
    </div>
  );
}

// Skeleton components
function EditorSkeleton() {
  return <div className="skeleton editor-skeleton">جارٍ تحميل المحرر...</div>;
}

function ChartSkeleton() {
  return <div className="skeleton chart-skeleton">جارٍ تحميل الرسوم...</div>;
}`,
    language: 'javascript',
    xpReward: 150,
    order: 12,
    quiz: {
      question: 'ما فائدة Code Splitting؟',
      options: [
        'تقسيم الكود لسهولة القراءة فقط',
        'تقليل حجم التحميل الأولي وتحسين الأداء',
        'زيادة الأمان',
        'تحسين SEO',
      ],
      correctAnswer: 1,
      explanation:
        'Code Splitting يقسم الكود لـ chunks صغيرة تُحمّل عند الحاجة، مما يقلل حجم التحميل الأولي ويحسن تجربة المستخدم.',
    },
  },
  {
    id: 'react-13',
    courseId: 'web-react-intro',
    title: 'Testing React Components',
    description: 'اختبار مكونات React',
    content: `
# اختبار React

## Jest + React Testing Library

\`\`\`bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
\`\`\`

## اختبار أساسي

\`\`\`jsx
// Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('renders button with text', () => {
  render(<Button>اضغطني</Button>);
  expect(screen.getByText('اضغطني')).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>اضغط</Button>);
  
  fireEvent.click(screen.getByText('اضغط'));
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
\`\`\`

## اختبار async

\`\`\`jsx
import { render, screen, waitFor } from '@testing-library/react';
import UserProfile from './UserProfile';

test('loads and displays user', async () => {
  render(<UserProfile userId="1" />);
  
  // انتظار ظهور البيانات
  await waitFor(() => {
    expect(screen.getByText('أحمد')).toBeInTheDocument();
  });
});

test('shows error on failure', async () => {
  // Mock fetch failure
  global.fetch = jest.fn(() => Promise.reject(new Error('Failed')));
  
  render(<UserProfile userId="1" />);
  
  await waitFor(() => {
    expect(screen.getByText(/خطأ/)).toBeInTheDocument();
  });
});
\`\`\`

## اختبار Hooks

\`\`\`jsx
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

test('increments counter', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
\`\`\`
`,
    codeExample: `// Counter.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

describe('Counter', () => {
  test('renders initial count', () => {
    render(<Counter initialCount={5} />);
    expect(screen.getByText('العدد: 5')).toBeInTheDocument();
  });

  test('increments count', () => {
    render(<Counter initialCount={0} />);
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText('العدد: 1')).toBeInTheDocument();
  });

  test('decrements count', () => {
    render(<Counter initialCount={5} />);
    fireEvent.click(screen.getByText('-'));
    expect(screen.getByText('العدد: 4')).toBeInTheDocument();
  });

  test('resets count', () => {
    render(<Counter initialCount={10} />);
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('إعادة تعيين'));
    expect(screen.getByText('العدد: 10')).toBeInTheDocument();
  });
});`,
    language: 'javascript',
    xpReward: 150,
    order: 13,
    quiz: {
      question: 'ما هي أفضل ممارسة في اختبار React؟',
      options: [
        'اختبار implementation details',
        'اختبار ما يراه المستخدم (testing library)',
        'اختبار كل دالة داخلية',
        'لا نحتاج اختبارات',
      ],
      correctAnswer: 1,
      explanation:
        'React Testing Library تشجع على اختبار المكونات من منظور المستخدم، وليس implementation details الداخلية.',
    },
  },
  {
    id: 'react-14',
    courseId: 'web-react-intro',
    title: 'State Management مع Zustand',
    description: 'إدارة الحالة باستخدام مكتبات خارجية',
    content: `
# State Management مع Zustand

Zustand هي مكتبة خفيفة وسهلة لإدارة الحالة في React.

## التثبيت

\`\`\`bash
npm install zustand
\`\`\`

## إنشاء Store

\`\`\`jsx
import { create } from 'zustand';

const useStore = create((set, get) => ({
  // الحالة
  count: 0,
  user: null,
  
  // الإجراءات
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
  
  // يمكن الوصول للحالة داخل الإجراءات
  doubleCount: () => {
    const currentCount = get().count;
    set({ count: currentCount * 2 });
  },
}));

export default useStore;
\`\`\`

## الاستخدام في المكونات

\`\`\`jsx
function Counter() {
  // استخدام جزء من الحالة
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);
  
  return (
    <div>
      <p>العدد: {count}</p>
      <button onClick={increment}>زيادة</button>
    </div>
  );
}

function UserInfo() {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  
  if (!user) return <p>مرحباً زائر</p>;
  
  return (
    <div>
      <p>مرحباً {user.name}</p>
      <button onClick={logout}>تسجيل خروج</button>
    </div>
  );
}
\`\`\`

## Persist (حفظ في localStorage)

\`\`\`jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'light',
      language: 'ar',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'settings-storage', // اسم المفتاح في localStorage
    }
  )
);
\`\`\`
`,
    codeExample: `import { create } from 'zustand';

// Cart Store للتسوق
const useCartStore = create((set, get) => ({
  items: [],
  
  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i.id === product.id);
    if (existing) {
      return {
        items: state.items.map(i => 
          i.id === product.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      };
    }
    return { items: [...state.items, { ...product, quantity: 1 }] };
  }),
  
  removeItem: (productId) => set((state) => ({
    items: state.items.filter(i => i.id !== productId)
  })),
  
  clearCart: () => set({ items: [] }),
  
  get total() {
    return get().items.reduce((sum, item) => 
      sum + item.price * item.quantity, 0
    );
  }
}));

// الاستخدام
function Cart() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const clearCart = useCartStore((s) => s.clearCart);
  
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name} × {item.quantity}</div>
      ))}
      <p>المجموع: {total} ريال</p>
      <button onClick={clearCart}>إفراغ السلة</button>
    </div>
  );
}`,
    language: 'javascript',
    xpReward: 150,
    order: 14,
    quiz: {
      question: 'ما ميزة Zustand على Context API؟',
      options: [
        'لا يوجد فرق',
        'أبسط في الاستخدام ولا يسبب re-renders غير ضرورية',
        'يعمل فقط مع TypeScript',
        'أكثر تعقيداً',
      ],
      correctAnswer: 1,
      explanation:
        'Zustand أبسط في الاستخدام ولا يحتاج Providers، كما أنه يمنع re-renders غير ضرورية من خلال التحديد الدقيق للـ selectors.',
    },
  },
  {
    id: 'react-15',
    courseId: 'web-react-intro',
    title: 'مشروع عملي: Todo App متكامل',
    description: 'تطبيق المفاهيم في مشروع حقيقي',
    content: `
# مشروع Todo App متكامل

سنبني تطبيق مهام متكامل يجمع كل ما تعلمناه.

## المميزات
- إضافة/حذف/تعديل المهام
- تصفية حسب الحالة
- حفظ في localStorage
- Dark/Light mode
- تصميم متجاوب

## هيكل المشروع

\`\`\`
src/
├── components/
│   ├── TodoForm.jsx
│   ├── TodoList.jsx
│   ├── TodoItem.jsx
│   └── FilterButtons.jsx
├── hooks/
│   └── useTodos.js
├── store/
│   └── todoStore.js
├── styles/
│   └── App.css
└── App.jsx
\`\`\`

## Store (Zustand)

\`\`\`jsx
// store/todoStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTodoStore = create(
  persist(
    (set) => ({
      todos: [],
      filter: 'all', // all, active, completed
      
      addTodo: (text) => set((state) => ({
        todos: [
          ...state.todos,
          { id: Date.now(), text, completed: false }
        ]
      })),
      
      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map(todo =>
          todo.id === id 
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      })),
      
      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter(todo => todo.id !== id)
      })),
      
      editTodo: (id, text) => set((state) => ({
        todos: state.todos.map(todo =>
          todo.id === id ? { ...todo, text } : todo
        )
      })),
      
      setFilter: (filter) => set({ filter }),
      
      clearCompleted: () => set((state) => ({
        todos: state.todos.filter(todo => !todo.completed)
      })),
    }),
    { name: 'todo-storage' }
  )
);
\`\`\`
`,
    codeExample: `// App.jsx الكامل
import { useMemo } from 'react';
import useTodoStore from './store/todoStore';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import FilterButtons from './components/FilterButtons';
import './styles/App.css';

function App() {
  const { todos, filter, addTodo, clearCompleted } = useTodoStore();
  
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(t => !t.completed);
      case 'completed':
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);
  
  const activeCount = todos.filter(t => !t.completed).length;
  
  return (
    <div className="app">
      <h1>قائمة المهام</h1>
      
      <TodoForm onAdd={addTodo} />
      
      <FilterButtons 
        current={filter} 
        counts={{
          all: todos.length,
          active: activeCount,
          completed: todos.length - activeCount
        }}
      />
      
      <TodoList todos={filteredTodos} />
      
      <footer>
        <span>{activeCount} مهام متبقية</span>
        <button onClick={clearCompleted}>
          حذف المكتملة
        </button>
      </footer>
    </div>
  );
}

export default App;`,
    language: 'javascript',
    xpReward: 200,
    order: 15,
    quiz: {
      question: 'ما أهم شيء تعلمته في هذه الدورة؟',
      options: [
        'React سهل جداً',
        'المكونات + الحالة + الـ hooks = تطبيقات قوية',
        'لا أحتاج لممارسة',
        'JavaScript غير مهم',
      ],
      correctAnswer: 1,
      explanation:
        'React يعتمد على ثلاثة مفاهيم أساسية: المكونات القابلة لإعادة الاستخدام، إدارة الحالة، والـ hooks للمنطق. إتقان هذه المفاهيم يمكّنك من بناء أي تطبيق!',
    },
  },
];

// ===== تحديات React المبتدئة =====
export const REACT_CHALLENGES_BEGINNER: Challenge[] = [
  {
    id: 'react-ch-beg-1',
    title: 'بطاقة تعريف',
    description: 'أنشئ مكون بطاقة تعريفية',
    difficulty: 'easy',
    points: 15,
    language: 'React',
    icon: 'person',
    starterCode: `function ProfileCard({ name, title, avatar }) {
  // أنشئ بطاقة تعريفية
  return (
    <div className="card">
      {/* أضف الصورة والاسم والعنوان */}
    </div>
  );
}`,
    solution: `function ProfileCard({ name, title, avatar }) {
  return (
    <div className="card">
      <img src={avatar} alt={name} className="avatar" />
      <h2>{name}</h2>
      <p>{title}</p>
    </div>
  );
}`,
    hints: ['استخدم props للبيانات', 'أضف className للتنسيق'],
    testCases: [
      {
        input: 'name="أحمد"',
        expectedOutput: 'Shows "أحمد"',
        description: 'عرض الاسم',
      },
    ],
    isLocked: false,
    category: 'components',
  },
  {
    id: 'react-ch-beg-2',
    title: 'زر متغير اللون',
    description: 'زر يغير لونه عند الضغط',
    difficulty: 'easy',
    points: 15,
    language: 'React',
    icon: 'color-lens',
    starterCode: `function ColorButton() {
  // استخدم useState للون
  
  return (
    <button>
      اضغطني!
    </button>
  );
}`,
    solution: `function ColorButton() {
  const [color, setColor] = useState('blue');
  
  const colors = ['blue', 'red', 'green', 'purple', 'orange'];
  
  const changeColor = () => {
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    setColor(newColor);
  };
  
  return (
    <button 
      onClick={changeColor}
      style={{ backgroundColor: color, color: 'white', padding: '10px 20px' }}
    >
      اضغطني!
    </button>
  );
}`,
    hints: ['استخدم useState لتخزين اللون', 'غير اللون عند onClick'],
    testCases: [
      {
        input: 'Click button',
        expectedOutput: 'Color changes',
        description: 'تغيير اللون',
      },
    ],
    isLocked: false,
    category: 'state',
  },
  {
    id: 'react-ch-beg-3',
    title: 'إظهار/إخفاء النص',
    description: 'زر لإظهار وإخفاء نص',
    difficulty: 'easy',
    points: 15,
    language: 'React',
    icon: 'visibility',
    starterCode: `function ToggleText() {
  // استخدم useState للحالة
  
  return (
    <div>
      <button>إظهار/إخفاء</button>
      {/* النص المخفي */}
    </div>
  );
}`,
    solution: `function ToggleText() {
  const [show, setShow] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShow(!show)}>
        {show ? 'إخفاء' : 'إظهار'}
      </button>
      {show && <p>هذا نص سري! 🎉</p>}
    </div>
  );
}`,
    hints: ['استخدم boolean في useState', 'استخدم && للعرض الشرطي'],
    testCases: [
      {
        input: 'Click toggle',
        expectedOutput: 'Shows/hides text',
        description: 'تبديل',
      },
    ],
    isLocked: false,
    category: 'state',
  },
  {
    id: 'react-ch-beg-4',
    title: 'قائمة عناصر',
    description: 'اعرض قائمة من البيانات',
    difficulty: 'easy',
    points: 15,
    language: 'React',
    icon: 'list',
    starterCode: `function FruitList() {
  const fruits = ['تفاح', 'برتقال', 'موز', 'عنب'];
  
  return (
    <ul>
      {/* استخدم map لعرض القائمة */}
    </ul>
  );
}`,
    solution: `function FruitList() {
  const fruits = ['تفاح', 'برتقال', 'موز', 'عنب'];
  
  return (
    <ul>
      {fruits.map((fruit, index) => (
        <li key={index}>{fruit}</li>
      ))}
    </ul>
  );
}`,
    hints: ['استخدم map() لتحويل المصفوفة', 'أضف key فريد لكل عنصر'],
    testCases: [
      {
        input: 'Render',
        expectedOutput: '4 list items',
        description: 'عرض القائمة',
      },
    ],
    isLocked: false,
    category: 'lists',
  },
  {
    id: 'react-ch-beg-5',
    title: 'حقل إدخال مُتحكم',
    description: 'حقل إدخال يعكس القيمة',
    difficulty: 'easy',
    points: 20,
    language: 'React',
    icon: 'edit',
    starterCode: `function ControlledInput() {
  // أضف state للقيمة
  
  return (
    <div>
      <input />
      <p>كتبت: </p>
    </div>
  );
}`,
    solution: `function ControlledInput() {
  const [value, setValue] = useState('');
  
  return (
    <div>
      <input 
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="اكتب شيئاً..."
      />
      <p>كتبت: {value}</p>
      <p>عدد الأحرف: {value.length}</p>
    </div>
  );
}`,
    hints: ['اربط value مع state', 'استخدم onChange للتحديث'],
    testCases: [
      {
        input: 'Type "مرحبا"',
        expectedOutput: 'Shows "مرحبا"',
        description: 'عرض النص',
      },
    ],
    isLocked: false,
    category: 'forms',
  },
];

// ===== تحديات React المتوسطة =====
export const REACT_CHALLENGES_INTERMEDIATE: Challenge[] = [
  {
    id: 'react-ch-int-1',
    title: 'فلترة القائمة',
    description: 'أضف بحث لفلترة القائمة',
    difficulty: 'medium',
    points: 30,
    language: 'React',
    icon: 'search',
    starterCode: `function FilterableList() {
  const items = ['React', 'Angular', 'Vue', 'Svelte', 'Next.js'];
  
  return (
    <div>
      <input placeholder="ابحث..." />
      <ul>
        {/* القائمة المفلترة */}
      </ul>
    </div>
  );
}`,
    solution: `function FilterableList() {
  const items = ['React', 'Angular', 'Vue', 'Svelte', 'Next.js'];
  const [search, setSearch] = useState('');
  
  const filtered = items.filter(item => 
    item.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div>
      <input 
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="ابحث..."
      />
      <ul>
        {filtered.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <p>{filtered.length} نتيجة</p>
    </div>
  );
}`,
    hints: ['استخدم filter() مع includes()', 'حول للحالة الصغيرة للمقارنة'],
    testCases: [
      { input: 'Search "re"', expectedOutput: 'React', description: 'فلترة' },
    ],
    isLocked: false,
    category: 'state',
  },
  {
    id: 'react-ch-int-2',
    title: 'نموذج التسجيل',
    description: 'أنشئ نموذج تسجيل مع التحقق',
    difficulty: 'medium',
    points: 35,
    language: 'React',
    icon: 'person-add',
    starterCode: `function SignupForm() {
  // State للنموذج والأخطاء
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // التحقق
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* الحقول */}
    </form>
  );
}`,
    solution: `function SignupForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    if (!form.email.includes('@')) {
      newErrors.email = 'بريد غير صالح';
    }
    if (form.password.length < 6) {
      newErrors.password = 'كلمة المرور قصيرة';
    }
    return newErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      alert('تم التسجيل!');
    } else {
      setErrors(newErrors);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={form.email}
        onChange={e => setForm({...form, email: e.target.value})}
        placeholder="البريد الإلكتروني"
      />
      {errors.email && <span>{errors.email}</span>}
      
      <input
        type="password"
        value={form.password}
        onChange={e => setForm({...form, password: e.target.value})}
        placeholder="كلمة المرور"
      />
      {errors.password && <span>{errors.password}</span>}
      
      <button type="submit">تسجيل</button>
    </form>
  );
}`,
    hints: [
      'استخدم object لـ form state',
      'أنشئ دالة validate',
      'اعرض الأخطاء تحت الحقول',
    ],
    testCases: [
      {
        input: 'Invalid email',
        expectedOutput: 'Error message',
        description: 'خطأ',
      },
    ],
    isLocked: false,
    category: 'forms',
  },
  {
    id: 'react-ch-int-3',
    title: 'Timer مع Hooks',
    description: 'أنشئ مؤقت عد تنازلي',
    difficulty: 'medium',
    points: 35,
    language: 'React',
    icon: 'timer',
    starterCode: `function Countdown() {
  // State للوقت
  // useEffect للعد
  
  return (
    <div>
      <h1>الوقت: </h1>
      <button>بدء/إيقاف</button>
      <button>إعادة</button>
    </div>
  );
}`,
    solution: `function Countdown() {
  const [time, setTime] = useState(60);
  const [running, setRunning] = useState(false);
  
  useEffect(() => {
    let interval;
    if (running && time > 0) {
      interval = setInterval(() => {
        setTime(t => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [running, time]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };
  
  return (
    <div>
      <h1>{formatTime(time)}</h1>
      <button onClick={() => setRunning(!running)}>
        {running ? 'إيقاف' : 'بدء'}
      </button>
      <button onClick={() => { setTime(60); setRunning(false); }}>
        إعادة
      </button>
    </div>
  );
}`,
    hints: [
      'استخدم setInterval في useEffect',
      'نظف الـ interval عند unmount',
      'استخدم return في useEffect للتنظيف',
    ],
    testCases: [
      { input: 'Start', expectedOutput: 'Counts down', description: 'العد' },
    ],
    isLocked: false,
    category: 'effects',
  },
  {
    id: 'react-ch-int-4',
    title: 'Modal مخصص',
    description: 'أنشئ مكون Modal قابل لإعادة الاستخدام',
    difficulty: 'medium',
    points: 30,
    language: 'React',
    icon: 'browsers',
    starterCode: `function Modal({ isOpen, onClose, title, children }) {
  // أنشئ Modal
  
  return null;
}

function App() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowModal(true)}>فتح</button>
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        title="عنوان"
      >
        <p>محتوى</p>
      </Modal>
    </div>
  );
}`,
    solution: `function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}`,
    hints: [
      'استخدم children لعرض المحتوى',
      'stopPropagation لمنع الإغلاق عند النقر داخلها',
    ],
    testCases: [
      {
        input: 'Open modal',
        expectedOutput: 'Shows modal',
        description: 'فتح',
      },
    ],
    isLocked: false,
    category: 'components',
  },
  {
    id: 'react-ch-int-5',
    title: 'Dark Mode',
    description: 'أضف وضع مظلم للتطبيق',
    difficulty: 'medium',
    points: 35,
    language: 'React',
    icon: 'dark-mode',
    starterCode: `const ThemeContext = createContext();

function ThemeProvider({ children }) {
  // أنشئ context للثيم
}

function ThemeToggle() {
  // زر التبديل
}`,
    solution: `const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  
  const toggle = () => setDark(!dark);
  
  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div className={dark ? 'dark-theme' : 'light-theme'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

function ThemeToggle() {
  const { dark, toggle } = useContext(ThemeContext);
  
  return (
    <button onClick={toggle}>
      {dark ? '☀️ فاتح' : '🌙 مظلم'}
    </button>
  );
}`,
    hints: ['استخدم createContext و useContext', 'خزن الحالة في Provider'],
    testCases: [
      {
        input: 'Toggle',
        expectedOutput: 'Theme changes',
        description: 'تبديل',
      },
    ],
    isLocked: false,
    category: 'context',
  },
];

// ===== تحديات React المتقدمة =====
export const REACT_CHALLENGES: Challenge[] = [
  {
    id: 'react-challenge-1',
    title: 'عداد بسيط',
    description: 'أنشئ مكون عداد مع أزرار للزيادة والنقصان والتصفير',
    difficulty: 'easy',
    points: 25,
    language: 'React',
    icon: 'code',
    starterCode: `function Counter() {
  // أضف useState هنا
  
  return (
    <div>
      <h1>العداد: {/* القيمة */}</h1>
      <button>-</button>
      <button>0</button>
      <button>+</button>
    </div>
  );
}`,
    solution: `function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>العداد: {count}</h1>
      <button onClick={() => setCount(c => c - 1)}>-</button>
      <button onClick={() => setCount(0)}>0</button>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}`,
    hints: [
      'استخدم useState لتخزين القيمة',
      'استخدم onClick للأزرار',
      'setCount(c => c + 1) أفضل من setCount(count + 1)',
    ],
    testCases: [
      {
        input: 'Click + 3 times',
        expectedOutput: '3',
        description: 'زيادة العداد',
      },
      {
        input: 'Click reset',
        expectedOutput: '0',
        description: 'تصفير العداد',
      },
    ],
    isLocked: false,
    category: 'state',
  },
  {
    id: 'react-challenge-2',
    title: 'قائمة مهام',
    description: 'أنشئ تطبيق Todo List مع إضافة وحذف المهام',
    difficulty: 'medium',
    points: 35,
    language: 'React',
    icon: 'code',
    starterCode: `function TodoList() {
  // State للمهام والإدخال
  
  return (
    <div>
      <input placeholder="مهمة جديدة..." />
      <button>إضافة</button>
      
      <ul>
        {/* عرض المهام هنا */}
      </ul>
    </div>
  );
}`,
    solution: `function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  
  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, done: false }]);
    setInput('');
  };
  
  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };
  
  return (
    <div>
      <input 
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && addTodo()}
        placeholder="مهمة جديدة..."
      />
      <button onClick={addTodo}>إضافة</button>
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input 
              type="checkbox" 
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>حذف</button>
          </li>
        ))}
      </ul>
    </div>
  );
}`,
    hints: [
      'استخدم مصفوفة للمهام مع id فريد',
      'استخدم filter للحذف',
      'استخدم map للتحديث',
    ],
    testCases: [
      {
        input: 'Add "مهمة 1"',
        expectedOutput: 'Shows "مهمة 1"',
        description: 'إضافة مهمة',
      },
      {
        input: 'Toggle checkbox',
        expectedOutput: 'Strikethrough',
        description: 'تبديل الإكمال',
      },
    ],
    isLocked: false,
    category: 'state',
  },
  {
    id: 'react-challenge-3',
    title: 'جلب بيانات API',
    description: 'أنشئ مكون يجلب ويعرض بيانات من API',
    difficulty: 'medium',
    points: 45,
    language: 'React',
    icon: 'code',
    starterCode: `function UsersList() {
  // State للبيانات والتحميل والأخطاء
  
  // useEffect لجلب البيانات
  
  return (
    <div>
      {/* عرض حالة التحميل/الخطأ/البيانات */}
    </div>
  );
}`,
    solution: `function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then(res => {
        if (!res.ok) throw new Error('فشل الجلب');
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <p>جارٍ التحميل...</p>;
  if (error) return <p>خطأ: {error}</p>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}`,
    hints: [
      'استخدم useEffect مع [] للتحميل مرة واحدة',
      'تعامل مع 3 حالات: loading, error, success',
      'استخدم try-catch أو .catch()',
    ],
    testCases: [
      {
        input: 'Initial load',
        expectedOutput: 'Shows loading',
        description: 'حالة التحميل',
      },
      {
        input: 'After fetch',
        expectedOutput: 'Shows users list',
        description: 'عرض البيانات',
      },
    ],
    isLocked: false,
    category: 'effects',
  },
  {
    id: 'react-ch-4',
    title: 'Custom Hook',
    description: 'أنشئ useLocalStorage hook',
    difficulty: 'medium',
    points: 70,
    language: 'React',
    icon: 'code-slash',
    starterCode: `// أنشئ custom hook يخزن ويسترجع من localStorage
// مع sync عند تغيير القيمة

function useLocalStorage(key, initialValue) {
  // أكمل الكود
}

// مكون تجريبي يستخدم الـ Hook
function Demo() {
  const [name, setName] = useLocalStorage('name', '');
  return <div>{name}</div>;
}`,
    solution: `import { useState } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

function Demo() {
  const [name, setName] = useLocalStorage('name', '');
  return <div>{name}</div>;
}`,
    hints: [
      'استخدم useState مع lazy initialization',
      'احفظ كـ JSON في localStorage',
      'تعامل مع الأخطاء',
    ],
    testCases: [
      {
        input: 'setValue("test")',
        expectedOutput: 'Stored in localStorage',
        description: 'حفظ القيمة',
      },
      {
        input: 'Reload page',
        expectedOutput: 'Value persisted',
        description: 'استمرار القيمة',
      },
    ],
    isLocked: false,
    category: 'hooks',
  },
  {
    id: 'react-ch-5',
    title: 'Context API',
    description: 'بناء Theme Context',
    difficulty: 'medium',
    points: 80,
    language: 'React',
    icon: 'color-palette',
    starterCode: `// أنشئ ThemeContext مع:
// 1. theme state (light/dark)
// 2. toggleTheme function
// 3. Provider component
// 4. useTheme hook

// ThemeContext.js`,
    solution: `import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// الاستخدام:
// <ThemeProvider><App /></ThemeProvider>
// const { theme, toggleTheme } = useTheme();`,
    hints: [
      'createContext للـ context',
      'Provider يلف التطبيق',
      'useContext للوصول',
    ],
    testCases: [
      {
        input: 'toggleTheme()',
        expectedOutput: 'Theme changes',
        description: 'تبديل الثيم',
      },
      {
        input: 'Reload',
        expectedOutput: 'Theme persisted',
        description: 'حفظ الثيم',
      },
    ],
    isLocked: false,
    category: 'context',
  },
  {
    id: 'react-ch-6',
    title: 'Form Validation',
    description: 'بناء نموذج تسجيل مع validation',
    difficulty: 'medium',
    points: 80,
    language: 'React',
    icon: 'create',
    starterCode: `// أنشئ نموذج تسجيل مع:
// 1. الحقول: name, email, password, confirmPassword
// 2. Validation لكل حقل
// 3. عرض الأخطاء
// 4. منع الإرسال إذا كان غير صالح

function RegistrationForm() {
  // أكمل الكود
}`,
    solution: `import { useState } from 'react';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    } else if (formData.name.length < 3) {
      newErrors.name = 'الاسم قصير جداً';
    }
    
    if (!formData.email) {
      newErrors.email = 'البريد مطلوب';
    } else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) {
      newErrors.email = 'بريد غير صالح';
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور قصيرة (8 أحرف على الأقل)';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('تم الإرسال:', formData);
      setSubmitted(true);
    }
  };
  
  if (submitted) {
    return <p>✅ تم التسجيل بنجاح!</p>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="name"
          placeholder="الاسم"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      
      <div>
        <input
          name="email"
          type="email"
          placeholder="البريد"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <input
          name="password"
          type="password"
          placeholder="كلمة المرور"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>
      
      <div>
        <input
          name="confirmPassword"
          type="password"
          placeholder="تأكيد كلمة المرور"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
      </div>
      
      <button type="submit">تسجيل</button>
    </form>
  );
}`,
    hints: [
      'استخدم state للبيانات والأخطاء',
      'validate عند الإرسال',
      'امسح الخطأ عند التعديل',
    ],
    testCases: [
      {
        input: 'Empty form submit',
        expectedOutput: 'Shows errors',
        description: 'عرض الأخطاء',
      },
      {
        input: 'Valid form submit',
        expectedOutput: 'Success',
        description: 'نجاح الإرسال',
      },
    ],
    isLocked: false,
    category: 'forms',
  },
  {
    id: 'react-ch-7',
    title: 'Infinite Scroll',
    description: 'تحميل المزيد عند التمرير',
    difficulty: 'hard',
    points: 100,
    language: 'React',
    icon: 'infinite',
    starterCode: `// أنشئ مكون يحمل بيانات عند الوصول لأسفل الصفحة
// استخدم Intersection Observer API

function InfiniteList() {
  // أكمل الكود
}`,
    solution: `import { useState, useEffect, useRef, useCallback } from 'react';

function InfiniteList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const observerRef = useRef();
  const lastItemRef = useCallback(node => {
    if (loading) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore]);
  
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(
          \`https://jsonplaceholder.typicode.com/posts?_page=\${page}&_limit=10\`
        );
        const data = await response.json();
        
        setItems(prev => [...prev, ...data]);
        setHasMore(data.length > 0);
      } catch (error) {
        console.error(error);
      }
      
      setLoading(false);
    };
    
    fetchItems();
  }, [page]);
  
  return (
    <div>
      {items.map((item, index) => (
        <div
          key={item.id}
          ref={index === items.length - 1 ? lastItemRef : null}
          className="item"
        >
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </div>
      ))}
      
      {loading && <p>جارٍ التحميل...</p>}
      {!hasMore && <p>لا يوجد المزيد</p>}
    </div>
  );
}`,
    hints: [
      'IntersectionObserver للرصد',
      'useRef للـ observer',
      'useCallback لتجنب re-renders',
    ],
    testCases: [
      {
        input: 'Initial load',
        expectedOutput: 'First 10 items',
        description: 'تحميل أولي',
      },
      {
        input: 'Scroll to bottom',
        expectedOutput: 'Load more',
        description: 'تحميل المزيد',
      },
    ],
    isLocked: true,
    category: 'advanced',
  },
];

// ===== التصدير =====
export const ALL_REACT_LESSONS: Lesson[] = REACT_BEGINNER_LESSONS;
export const ALL_REACT_CHALLENGES: Challenge[] = [
  ...REACT_CHALLENGES_BEGINNER,
  ...REACT_CHALLENGES_INTERMEDIATE,
  ...REACT_CHALLENGES,
];
