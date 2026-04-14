/**
 * محتوى Java - Kodax
 * دروس وتحديات شاملة للغة Java
 */

import { Lesson, Challenge } from './courseData';

// ===== دروس Java للمبتدئين =====
export const JAVA_LESSONS_BEGINNER: Lesson[] = [
  {
    id: 'java-1',
    courseId: 'java-basics',
    title: 'مرحباً Java!',
    description: 'أول برنامج لك بالجافا',
    content: `
# مرحباً بك في Java! ☕

## ما هي Java؟
Java لغة برمجة:
- 🎯 قوية وآمنة
- 💻 متعددة المنصات (اكتب مرة، شغّل في أي مكان)
- 🏢 مستخدمة في التطبيقات الكبيرة
- 📱 تطوير تطبيقات Android

## استخدامات Java
- تطبيقات Android
- تطبيقات الويب (Spring)
- أنظمة المؤسسات
- تطبيقات سطح المكتب
- معالجة البيانات الضخمة

## أول برنامج
كل برنامج Java يبدأ بـ class تحتوي على main
    `,
    codeExample: `// أول برنامج Java!
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("مرحباً بالعالم!");
        
        // طباعة عدة أسطر
        System.out.println("اسمي أحمد");
        System.out.println("أتعلم الجافا");
        
        // طباعة بدون سطر جديد
        System.out.print("Hello ");
        System.out.print("World!");
    }
}`,
    language: 'java',
    xpReward: 100,
    order: 1,
    quiz: {
      question: 'ما هي الدالة المستخدمة للطباعة مع سطر جديد في Java؟',
      options: ['print()', 'System.out.println()', 'console.log()', 'echo()'],
      correctAnswer: 1,
      explanation: 'System.out.println() تطبع النص مع سطر جديد',
    },
  },
  {
    id: 'java-2',
    courseId: 'java-basics',
    title: 'المتغيرات وأنواع البيانات',
    description: 'تخزين البيانات في متغيرات',
    content: `
# المتغيرات في Java

## أنواع البيانات الأساسية (Primitive Types)
- \`int\` - عدد صحيح (4 bytes)
- \`long\` - عدد صحيح كبير (8 bytes)
- \`double\` - عدد عشري (8 bytes)
- \`float\` - عدد عشري (4 bytes)
- \`boolean\` - صح/خطأ
- \`char\` - حرف واحد
- \`byte\` - عدد صغير (1 byte)
- \`short\` - عدد قصير (2 bytes)

## String
String نوع مرجعي (Reference Type) للنصوص

## قواعد التسمية
- تبدأ بحرف أو _ أو $
- حساسة لحالة الأحرف
- لا تستخدم الكلمات المحجوزة
    `,
    codeExample: `public class Variables {
    public static void main(String[] args) {
        // أنواع الأعداد
        int age = 25;
        long population = 7900000000L;
        double price = 99.99;
        float rate = 4.5f;
        
        // نص
        String name = "أحمد";
        
        // حرف
        char grade = 'A';
        
        // قيمة منطقية
        boolean isStudent = true;
        
        // ثوابت
        final double PI = 3.14159;
        
        // طباعة المتغيرات
        System.out.println("الاسم: " + name);
        System.out.println("العمر: " + age);
        System.out.println("الطالب: " + isStudent);
    }
}`,
    language: 'java',
    xpReward: 100,
    order: 2,
    quiz: {
      question: 'أي نوع بيانات يُستخدم للأعداد العشرية في Java؟',
      options: ['int', 'String', 'double', 'char'],
      correctAnswer: 2,
      explanation: 'double يُستخدم للأعداد العشرية بدقة عالية',
    },
  },
  {
    id: 'java-3',
    courseId: 'java-basics',
    title: 'العمليات والمعاملات',
    description: 'العمليات الحسابية والمنطقية',
    content: `
# المعاملات في Java

## المعاملات الحسابية
- \`+\` جمع
- \`-\` طرح
- \`*\` ضرب
- \`/\` قسمة
- \`%\` باقي القسمة
- \`++\` زيادة 1
- \`--\` نقصان 1

## معاملات المقارنة
- \`==\` يساوي
- \`!=\` لا يساوي
- \`>\` أكبر من
- \`<\` أصغر من
- \`>=\` أكبر أو يساوي
- \`<=\` أصغر أو يساوي

## المعاملات المنطقية
- \`&&\` AND
- \`||\` OR
- \`!\` NOT
    `,
    codeExample: `public class Operators {
    public static void main(String[] args) {
        // العمليات الحسابية
        int a = 10, b = 3;
        System.out.println("الجمع: " + (a + b));
        System.out.println("الطرح: " + (a - b));
        System.out.println("الضرب: " + (a * b));
        System.out.println("القسمة: " + (a / b));
        System.out.println("الباقي: " + (a % b));
        
        // الزيادة والنقصان
        int count = 5;
        count++;  // 6
        count--;  // 5
        
        // المقارنة
        System.out.println(a > b);   // true
        System.out.println(a == b);  // false
        
        // العمليات المنطقية
        boolean x = true, y = false;
        System.out.println(x && y);  // false
        System.out.println(x || y);  // true
        System.out.println(!x);      // false
        
        // معامل ثلاثي
        String result = (a > b) ? "أكبر" : "أصغر";
        System.out.println(result);
    }
}`,
    language: 'java',
    xpReward: 100,
    order: 3,
    quiz: {
      question: 'ما هو ناتج 10 % 3 في Java؟',
      options: ['3', '1', '3.33', '0'],
      correctAnswer: 1,
      explanation: 'عامل % يُرجع باقي القسمة، 10 ÷ 3 = 3 والباقي 1',
    },
  },
  {
    id: 'java-4',
    courseId: 'java-basics',
    title: 'الجمل الشرطية',
    description: 'if, else, switch',
    content: `
# الجمل الشرطية في Java

## if Statement
تنفيذ كود إذا تحقق شرط

## if-else
تنفيذ كود مختلف إذا لم يتحقق الشرط

## else if
التحقق من شروط متعددة

## switch
اختيار من عدة حالات
    `,
    codeExample: `public class Conditions {
    public static void main(String[] args) {
        int score = 85;
        
        // if-else if-else
        if (score >= 90) {
            System.out.println("ممتاز! A");
        } else if (score >= 80) {
            System.out.println("جيد جداً! B");
        } else if (score >= 70) {
            System.out.println("جيد! C");
        } else if (score >= 60) {
            System.out.println("مقبول! D");
        } else {
            System.out.println("راسب! F");
        }
        
        // switch
        int day = 3;
        switch (day) {
            case 1:
                System.out.println("الأحد");
                break;
            case 2:
                System.out.println("الاثنين");
                break;
            case 3:
                System.out.println("الثلاثاء");
                break;
            default:
                System.out.println("يوم آخر");
        }
        
        // switch expression (Java 14+)
        String dayName = switch (day) {
            case 1 -> "الأحد";
            case 2 -> "الاثنين";
            case 3 -> "الثلاثاء";
            default -> "يوم آخر";
        };
    }
}`,
    language: 'java',
    xpReward: 100,
    order: 4,
    quiz: {
      question: 'ما الكلمة المستخدمة للخروج من switch؟',
      options: ['exit', 'break', 'stop', 'end'],
      correctAnswer: 1,
      explanation: 'break تُستخدم للخروج من switch بعد تنفيذ الحالة',
    },
  },
  {
    id: 'java-5',
    courseId: 'java-basics',
    title: 'الحلقات التكرارية',
    description: 'for, while, do-while',
    content: `
# الحلقات في Java

## for Loop
عندما نعرف عدد التكرارات

## while Loop
عندما لا نعرف عدد التكرارات

## do-while Loop
تنفيذ مرة واحدة على الأقل

## for-each Loop
للتكرار على المجموعات
    `,
    codeExample: `public class Loops {
    public static void main(String[] args) {
        // for loop
        System.out.println("العد من 1 إلى 5:");
        for (int i = 1; i <= 5; i++) {
            System.out.println(i);
        }
        
        // while loop
        System.out.println("\\nالعد التنازلي:");
        int count = 5;
        while (count > 0) {
            System.out.println(count);
            count--;
        }
        
        // do-while
        System.out.println("\\ndo-while:");
        int num = 1;
        do {
            System.out.println(num);
            num++;
        } while (num <= 3);
        
        // for-each
        String[] fruits = {"تفاح", "برتقال", "موز"};
        System.out.println("\\nالفواكه:");
        for (String fruit : fruits) {
            System.out.println(fruit);
        }
        
        // break و continue
        for (int i = 1; i <= 10; i++) {
            if (i == 5) continue;  // تخطي 5
            if (i == 8) break;     // إيقاف عند 8
            System.out.print(i + " ");
        }
    }
}`,
    language: 'java',
    xpReward: 100,
    order: 5,
    quiz: {
      question: 'أي حلقة تُنفذ مرة واحدة على الأقل حتى لو كان الشرط خاطئاً؟',
      options: ['for', 'while', 'do-while', 'for-each'],
      correctAnswer: 2,
      explanation: 'do-while تُنفذ الكود أولاً ثم تتحقق من الشرط',
    },
  },
  {
    id: 'java-6',
    courseId: 'java-basics',
    title: 'المصفوفات (Arrays)',
    description: 'تخزين مجموعة من القيم',
    content: `
# المصفوفات في Java

## ما هي المصفوفة؟
مجموعة من العناصر من نفس النوع

## خصائص المصفوفات
- حجم ثابت بعد الإنشاء
- الفهرس يبدأ من 0
- يمكن أن تكون متعددة الأبعاد

## العمليات على المصفوفات
- الوصول للعناصر
- التعديل
- التكرار
- البحث
    `,
    codeExample: `import java.util.Arrays;

public class ArraysDemo {
    public static void main(String[] args) {
        // إنشاء مصفوفة
        int[] numbers = {1, 2, 3, 4, 5};
        
        // إنشاء مصفوفة فارغة
        String[] names = new String[3];
        names[0] = "أحمد";
        names[1] = "محمد";
        names[2] = "علي";
        
        // الوصول للعناصر
        System.out.println("أول عنصر: " + numbers[0]);
        System.out.println("آخر عنصر: " + numbers[numbers.length - 1]);
        
        // التكرار
        for (int num : numbers) {
            System.out.print(num + " ");
        }
        System.out.println();
        
        // الترتيب
        int[] unsorted = {5, 2, 8, 1, 9};
        Arrays.sort(unsorted);
        System.out.println("مرتب: " + Arrays.toString(unsorted));
        
        // البحث
        int index = Arrays.binarySearch(unsorted, 5);
        System.out.println("موقع 5: " + index);
        
        // مصفوفة ثنائية الأبعاد
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        
        for (int[] row : matrix) {
            for (int val : row) {
                System.out.print(val + " ");
            }
            System.out.println();
        }
    }
}`,
    language: 'java',
    xpReward: 100,
    order: 6,
    quiz: {
      question: 'ما الفهرس لأول عنصر في المصفوفة؟',
      options: ['1', '0', '-1', 'first'],
      correctAnswer: 1,
      explanation: 'الفهارس في Java تبدأ من 0',
    },
  },
  {
    id: 'java-7',
    courseId: 'java-basics',
    title: 'الدوال (Methods)',
    description: 'إنشاء واستخدام الدوال',
    content: `
# الدوال في Java

## ما هي الدالة؟
كتلة من الكود تُنفذ مهمة محددة

## مكونات الدالة
- نوع الإرجاع (return type)
- اسم الدالة
- المعاملات (parameters)
- جسم الدالة

## أنواع الدوال
- void - لا تُرجع قيمة
- مع قيمة إرجاع
- static - تُستدعى بدون كائن
    `,
    codeExample: `public class Methods {
    public static void main(String[] args) {
        // استدعاء الدوال
        sayHello();
        greet("أحمد");
        
        int sum = add(5, 3);
        System.out.println("المجموع: " + sum);
        
        System.out.println("الأكبر: " + max(10, 20));
        
        // دالة بمعاملات متعددة
        printInfo("محمد", 25, true);
        
        // varargs
        System.out.println("المجموع: " + sumAll(1, 2, 3, 4, 5));
    }
    
    // دالة بدون معاملات ولا إرجاع
    static void sayHello() {
        System.out.println("مرحباً!");
    }
    
    // دالة بمعامل
    static void greet(String name) {
        System.out.println("أهلاً " + name + "!");
    }
    
    // دالة مع إرجاع
    static int add(int a, int b) {
        return a + b;
    }
    
    // دالة لإيجاد الأكبر
    static int max(int a, int b) {
        return (a > b) ? a : b;
    }
    
    // دالة بمعاملات متعددة
    static void printInfo(String name, int age, boolean student) {
        System.out.println("الاسم: " + name);
        System.out.println("العمر: " + age);
        System.out.println("طالب: " + student);
    }
    
    // varargs - عدد متغير من المعاملات
    static int sumAll(int... numbers) {
        int total = 0;
        for (int n : numbers) {
            total += n;
        }
        return total;
    }
}`,
    language: 'java',
    xpReward: 100,
    order: 7,
    quiz: {
      question: 'ما الكلمة المستخدمة للدالة التي لا تُرجع قيمة؟',
      options: ['null', 'void', 'empty', 'none'],
      correctAnswer: 1,
      explanation: 'void تُستخدم للدوال التي لا تُرجع قيمة',
    },
  },
  {
    id: 'java-8',
    courseId: 'java-basics',
    title: 'الكائنات والأصناف',
    description: 'مقدمة في OOP',
    content: `
# البرمجة الكائنية في Java

## ما هو الصنف (Class)؟
قالب أو مخطط لإنشاء الكائنات

## ما هو الكائن (Object)؟
نسخة من الصنف تحتوي على بيانات

## مكونات الصنف
- الخصائص (Fields/Attributes)
- الدوال (Methods)
- المُنشئ (Constructor)

## الوصول (Access Modifiers)
- public - متاح للجميع
- private - متاح فقط داخل الصنف
- protected - متاح للصنف والأبناء
    `,
    codeExample: `// ملف Student.java
public class Student {
    // الخصائص
    private String name;
    private int age;
    private double gpa;
    
    // المُنشئ
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
        this.gpa = 0.0;
    }
    
    // Getters و Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public int getAge() {
        return age;
    }
    
    public double getGpa() {
        return gpa;
    }
    
    public void setGpa(double gpa) {
        if (gpa >= 0 && gpa <= 4.0) {
            this.gpa = gpa;
        }
    }
    
    // دالة لعرض المعلومات
    public void displayInfo() {
        System.out.println("الطالب: " + name);
        System.out.println("العمر: " + age);
        System.out.println("المعدل: " + gpa);
    }
}

// الاستخدام في main
public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("أحمد", 20);
        s1.setGpa(3.5);
        s1.displayInfo();
    }
}`,
    language: 'java',
    xpReward: 100,
    order: 8,
    quiz: {
      question: 'ما الكلمة المستخدمة لإنشاء كائن جديد؟',
      options: ['create', 'new', 'make', 'build'],
      correctAnswer: 1,
      explanation: 'new تُستخدم لإنشاء كائن جديد من الصنف',
    },
  },
  {
    id: 'java-9',
    courseId: 'java-basics',
    title: 'الوراثة (Inheritance)',
    description: 'توريث الأصناف',
    content: `
# الوراثة في Java

## ما هي الوراثة؟
إنشاء صنف جديد يرث خصائص ودوال صنف موجود

## الفوائد
- إعادة استخدام الكود
- تمديد الوظائف
- تنظيم البرنامج

## المصطلحات
- Superclass (الأب)
- Subclass (الابن)
- extends للوراثة
- super للوصول للأب
    `,
    codeExample: `// الصنف الأب
class Animal {
    protected String name;
    
    public Animal(String name) {
        this.name = name;
    }
    
    public void eat() {
        System.out.println(name + " يأكل");
    }
    
    public void sleep() {
        System.out.println(name + " ينام");
    }
}

// الصنف الابن
class Dog extends Animal {
    private String breed;
    
    public Dog(String name, String breed) {
        super(name);  // استدعاء مُنشئ الأب
        this.breed = breed;
    }
    
    public void bark() {
        System.out.println(name + " ينبح!");
    }
    
    // Override
    @Override
    public void eat() {
        System.out.println(name + " يأكل العظام");
    }
}

class Cat extends Animal {
    public Cat(String name) {
        super(name);
    }
    
    public void meow() {
        System.out.println(name + " يموء!");
    }
}

// الاستخدام
public class Main {
    public static void main(String[] args) {
        Dog dog = new Dog("ريكس", "جيرمن شيبرد");
        dog.eat();    // يأكل العظام (override)
        dog.sleep();  // من الأب
        dog.bark();   // خاص بالكلب
        
        Cat cat = new Cat("قطقوط");
        cat.eat();
        cat.meow();
    }
}`,
    language: 'java',
    xpReward: 100,
    order: 9,
    quiz: {
      question: 'ما الكلمة المستخدمة للوراثة في Java؟',
      options: ['inherits', 'extends', 'implements', 'derives'],
      correctAnswer: 1,
      explanation: 'extends تُستخدم لجعل صنف يرث من صنف آخر',
    },
  },
  {
    id: 'java-10',
    courseId: 'java-basics',
    title: 'الواجهات والتجريد',
    description: 'Interfaces و Abstract Classes',
    content: `
# التجريد في Java

## Abstract Class
صنف لا يمكن إنشاء كائن منه مباشرة

## Interface
عقد يحدد الدوال التي يجب تنفيذها

## الفرق بينهما
- Abstract يمكن أن يحتوي على تنفيذ
- Interface عادة تحتوي على تعريفات فقط
- الصنف يرث abstract واحد فقط
- الصنف يمكن أن يُنفذ عدة interfaces
    `,
    codeExample: `// Interface
interface Drawable {
    void draw();  // دالة مجردة
    
    // دالة افتراضية (Java 8+)
    default void print() {
        System.out.println("طباعة...");
    }
}

interface Colorable {
    void setColor(String color);
}

// Abstract Class
abstract class Shape {
    protected String name;
    
    public Shape(String name) {
        this.name = name;
    }
    
    // دالة مجردة
    abstract double getArea();
    
    // دالة عادية
    public void display() {
        System.out.println("الشكل: " + name);
    }
}

// تنفيذ
class Circle extends Shape implements Drawable, Colorable {
    private double radius;
    private String color;
    
    public Circle(double radius) {
        super("دائرة");
        this.radius = radius;
    }
    
    @Override
    double getArea() {
        return Math.PI * radius * radius;
    }
    
    @Override
    public void draw() {
        System.out.println("رسم دائرة بنصف قطر " + radius);
    }
    
    @Override
    public void setColor(String color) {
        this.color = color;
    }
}

public class Main {
    public static void main(String[] args) {
        Circle c = new Circle(5);
        c.display();
        c.draw();
        System.out.println("المساحة: " + c.getArea());
    }
}`,
    language: 'java',
    xpReward: 100,
    order: 10,
    quiz: {
      question: 'ما الكلمة المستخدمة لتنفيذ Interface؟',
      options: ['extends', 'inherits', 'implements', 'uses'],
      correctAnswer: 2,
      explanation: 'implements تُستخدم لجعل صنف يُنفذ واجهة',
    },
  },
];

// ===== دروس Java المتقدمة =====
export const JAVA_LESSONS_ADVANCED: Lesson[] = [
  {
    id: 'java-adv-1',
    courseId: 'java-advanced',
    title: 'Collections Framework',
    description: 'مجموعات البيانات المتقدمة',
    content: `
# Collections في Java

## الأنواع الرئيسية
- List - قائمة مرتبة
- Set - مجموعة فريدة
- Map - أزواج مفتاح-قيمة
- Queue - طابور

## التنفيذات الشائعة
- ArrayList, LinkedList
- HashSet, TreeSet
- HashMap, TreeMap
- PriorityQueue
    `,
    codeExample: `import java.util.*;

public class CollectionsDemo {
    public static void main(String[] args) {
        // ArrayList
        List<String> names = new ArrayList<>();
        names.add("أحمد");
        names.add("محمد");
        names.add("علي");
        
        for (String name : names) {
            System.out.println(name);
        }
        
        // HashSet - لا يسمح بالتكرار
        Set<Integer> numbers = new HashSet<>();
        numbers.add(1);
        numbers.add(2);
        numbers.add(1);  // لن يُضاف
        System.out.println("الحجم: " + numbers.size());  // 2
        
        // HashMap
        Map<String, Integer> ages = new HashMap<>();
        ages.put("أحمد", 25);
        ages.put("محمد", 30);
        
        for (Map.Entry<String, Integer> entry : ages.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
        
        // الترتيب
        Collections.sort(names);
        Collections.reverse(names);
        
        // البحث
        boolean found = names.contains("أحمد");
        int index = names.indexOf("محمد");
    }
}`,
    language: 'java',
    xpReward: 120,
    order: 1,
    quiz: {
      question: 'أي مجموعة لا تسمح بالعناصر المكررة؟',
      options: ['ArrayList', 'LinkedList', 'HashSet', 'HashMap'],
      correctAnswer: 2,
      explanation: 'HashSet لا يسمح بتكرار العناصر',
    },
  },
  {
    id: 'java-adv-2',
    courseId: 'java-advanced',
    title: 'Exception Handling',
    description: 'معالجة الأخطاء والاستثناءات',
    content: `
# معالجة الاستثناءات

## ما هو الاستثناء؟
حدث غير متوقع يحدث أثناء التنفيذ

## أنواع الاستثناءات
- Checked - يجب معالجتها
- Unchecked - Runtime exceptions
- Error - أخطاء النظام

## الكلمات المفتاحية
- try - كود قد يُسبب خطأ
- catch - معالجة الخطأ
- finally - يُنفذ دائماً
- throw - رمي استثناء
- throws - إعلان استثناء
    `,
    codeExample: `import java.io.*;

public class ExceptionDemo {
    public static void main(String[] args) {
        // try-catch
        try {
            int result = 10 / 0;
        } catch (ArithmeticException e) {
            System.out.println("خطأ: لا يمكن القسمة على صفر");
        }
        
        // معالجة استثناءات متعددة
        try {
            int[] arr = {1, 2, 3};
            System.out.println(arr[10]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("خطأ: فهرس خارج الحدود");
        } catch (Exception e) {
            System.out.println("خطأ عام: " + e.getMessage());
        } finally {
            System.out.println("تم تنفيذ finally");
        }
        
        // try-with-resources
        try (BufferedReader reader = new BufferedReader(
                new FileReader("file.txt"))) {
            String line = reader.readLine();
        } catch (IOException e) {
            System.out.println("خطأ في قراءة الملف");
        }
        
        // رمي استثناء
        try {
            validateAge(-5);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
    
    static void validateAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("العمر لا يمكن أن يكون سالباً");
        }
    }
}`,
    language: 'java',
    xpReward: 120,
    order: 2,
    quiz: {
      question: 'أي كتلة تُنفذ دائماً سواء حدث استثناء أم لا؟',
      options: ['try', 'catch', 'finally', 'throw'],
      correctAnswer: 2,
      explanation: 'finally تُنفذ دائماً بعد try-catch',
    },
  },
  {
    id: 'java-adv-3',
    courseId: 'java-advanced',
    title: 'Lambda Expressions',
    description: 'الدوال المجهولة والبرمجة الوظيفية',
    content: `
# Lambda في Java

## ما هي Lambda؟
طريقة مختصرة لكتابة الدوال المجهولة

## الصيغة
(parameters) -> expression
(parameters) -> { statements }

## Functional Interfaces
واجهات تحتوي على دالة واحدة فقط
    `,
    codeExample: `import java.util.*;
import java.util.function.*;

public class LambdaDemo {
    public static void main(String[] args) {
        // Lambda بسيطة
        List<String> names = Arrays.asList("أحمد", "محمد", "علي");
        
        // بدون Lambda
        names.forEach(new Consumer<String>() {
            @Override
            public void accept(String name) {
                System.out.println(name);
            }
        });
        
        // مع Lambda
        names.forEach(name -> System.out.println(name));
        
        // Method Reference
        names.forEach(System.out::println);
        
        // الترتيب بـ Lambda
        List<String> list = new ArrayList<>(names);
        list.sort((a, b) -> a.compareTo(b));
        
        // التصفية
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6);
        numbers.stream()
               .filter(n -> n % 2 == 0)
               .forEach(System.out::println);
        
        // Functional Interfaces
        Predicate<Integer> isEven = n -> n % 2 == 0;
        System.out.println(isEven.test(4));  // true
        
        Function<String, Integer> length = s -> s.length();
        System.out.println(length.apply("Hello"));  // 5
        
        Supplier<Double> random = () -> Math.random();
        System.out.println(random.get());
    }
}`,
    language: 'java',
    xpReward: 120,
    order: 3,
    quiz: {
      question: 'ما الرمز المستخدم في Lambda expression؟',
      options: ['=>', '->', '::', '->'],
      correctAnswer: 1,
      explanation: 'السهم -> يُستخدم في Lambda expressions',
    },
  },
  {
    id: 'java-adv-4',
    courseId: 'java-advanced',
    title: 'Streams API',
    description: 'معالجة البيانات بشكل متسلسل',
    content: `
# Streams في Java

## ما هو Stream؟
تدفق من العناصر يدعم العمليات المتسلسلة

## أنواع العمليات
- Intermediate: filter, map, sorted
- Terminal: collect, forEach, reduce

## المزايا
- كود أنظف وأوضح
- دعم المعالجة المتوازية
- تأجيل التنفيذ (Lazy)
    `,
    codeExample: `import java.util.*;
import java.util.stream.*;

public class StreamsDemo {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        // filter - تصفية
        List<Integer> evens = numbers.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());
        
        // map - تحويل
        List<Integer> squares = numbers.stream()
            .map(n -> n * n)
            .collect(Collectors.toList());
        
        // reduce - تجميع
        int sum = numbers.stream()
            .reduce(0, (a, b) -> a + b);
        
        // سلسلة عمليات
        double average = numbers.stream()
            .filter(n -> n > 5)
            .mapToInt(n -> n)
            .average()
            .orElse(0);
        
        // الأشخاص
        List<Person> people = Arrays.asList(
            new Person("أحمد", 25),
            new Person("محمد", 30),
            new Person("علي", 20)
        );
        
        // الأسماء فقط
        List<String> names = people.stream()
            .map(Person::getName)
            .collect(Collectors.toList());
        
        // التجميع
        Map<Integer, List<Person>> byAge = people.stream()
            .collect(Collectors.groupingBy(Person::getAge));
        
        // الإحصائيات
        IntSummaryStatistics stats = numbers.stream()
            .mapToInt(n -> n)
            .summaryStatistics();
        
        System.out.println("الحد الأدنى: " + stats.getMin());
        System.out.println("الحد الأقصى: " + stats.getMax());
        System.out.println("المتوسط: " + stats.getAverage());
    }
}

class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String getName() { return name; }
    public int getAge() { return age; }
}`,
    language: 'java',
    xpReward: 120,
    order: 4,
    quiz: {
      question: 'أي عملية Stream تُرجع مجموعة جديدة؟',
      options: ['filter', 'map', 'collect', 'forEach'],
      correctAnswer: 2,
      explanation: 'collect تُحول Stream إلى مجموعة مثل List',
    },
  },
  {
    id: 'java-adv-5',
    courseId: 'java-advanced',
    title: 'Multithreading',
    description: 'البرمجة متعددة المسارات',
    content: `
# المسارات في Java

## ما هو Thread؟
وحدة تنفيذ مستقلة داخل البرنامج

## إنشاء Thread
1. extends Thread
2. implements Runnable
3. Lambda expression

## المزامنة (Synchronization)
لتجنب التعارضات عند الوصول المشترك
    `,
    codeExample: `public class ThreadDemo {
    public static void main(String[] args) {
        // الطريقة 1: extends Thread
        MyThread t1 = new MyThread();
        t1.start();
        
        // الطريقة 2: Runnable
        Thread t2 = new Thread(new MyRunnable());
        t2.start();
        
        // الطريقة 3: Lambda
        Thread t3 = new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                System.out.println("Lambda: " + i);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {}
            }
        });
        t3.start();
        
        // انتظار انتهاء المسارات
        try {
            t1.join();
            t2.join();
            t3.join();
        } catch (InterruptedException e) {}
        
        System.out.println("انتهت جميع المسارات");
        
        // مثال على المزامنة
        Counter counter = new Counter();
        Thread inc1 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) counter.increment();
        });
        Thread inc2 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) counter.increment();
        });
        
        inc1.start();
        inc2.start();
    }
}

class MyThread extends Thread {
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println("Thread: " + i);
        }
    }
}

class MyRunnable implements Runnable {
    @Override
    public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println("Runnable: " + i);
        }
    }
}

class Counter {
    private int count = 0;
    
    public synchronized void increment() {
        count++;
    }
    
    public int getCount() {
        return count;
    }
}`,
    language: 'java',
    xpReward: 120,
    order: 5,
    quiz: {
      question: 'ما الكلمة المستخدمة لمنع التعارضات في المسارات؟',
      options: ['volatile', 'synchronized', 'atomic', 'lock'],
      correctAnswer: 1,
      explanation: 'synchronized تضمن أن مسار واحد فقط يصل للكود في وقت واحد',
    },
  },
];

// ===== تحديات Java =====
export const JAVA_CHALLENGES: Challenge[] = [
  {
    id: 'java-ch-1',
    title: 'مرحباً Java',
    description: 'اكتب برنامج يطبع "Hello, World!"',
    difficulty: 'easy',
    points: 10,
    language: 'Java',
    icon: 'logo-java',
    starterCode: `public class Solution {
    public static void main(String[] args) {
        // اكتب الكود هنا
    }
}`,
    solution: `public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    hints: ['استخدم System.out.println()'],
    testCases: [
      {
        input: '',
        expectedOutput: 'Hello, World!',
        description: 'يجب طباعة Hello, World!',
      },
    ],
    isLocked: false,
    category: 'basics',
  },
  {
    id: 'java-ch-2',
    title: 'مجموع مصفوفة',
    description: 'احسب مجموع جميع عناصر المصفوفة',
    difficulty: 'easy',
    points: 15,
    language: 'Java',
    icon: 'calculator',
    starterCode: `public class Solution {
    public static int sumArray(int[] arr) {
        // اكتب الكود هنا
        return 0;
    }
}`,
    solution: `public class Solution {
    public static int sumArray(int[] arr) {
        int sum = 0;
        for (int num : arr) {
            sum += num;
        }
        return sum;
    }
}`,
    hints: ['استخدم حلقة for-each', 'أضف كل عنصر للمجموع'],
    testCases: [
      {
        input: 'new int[]{1, 2, 3, 4, 5}',
        expectedOutput: '15',
        description: 'مجموع 1-5',
      },
      {
        input: 'new int[]{10, 20, 30}',
        expectedOutput: '60',
        description: 'مجموع 10, 20, 30',
      },
    ],
    isLocked: false,
    category: 'arrays',
  },
  {
    id: 'java-ch-3',
    title: 'عكس نص',
    description: 'اكتب دالة تعكس النص المُدخل',
    difficulty: 'medium',
    points: 25,
    language: 'Java',
    icon: 'swap-horizontal',
    starterCode: `public class Solution {
    public static String reverseString(String s) {
        // اكتب الكود هنا
        return "";
    }
}`,
    solution: `public class Solution {
    public static String reverseString(String s) {
        return new StringBuilder(s).reverse().toString();
    }
}`,
    hints: ['استخدم StringBuilder', 'أو كرر من النهاية للبداية'],
    testCases: [
      { input: '"hello"', expectedOutput: 'olleh', description: 'عكس hello' },
      { input: '"Java"', expectedOutput: 'avaJ', description: 'عكس Java' },
    ],
    isLocked: false,
    category: 'strings',
  },
  {
    id: 'java-ch-4',
    title: 'FizzBuzz',
    description:
      'طبع Fizz للقابل لـ3، Buzz للقابل لـ5، FizzBuzz للقابل لكليهما',
    difficulty: 'medium',
    points: 30,
    language: 'Java',
    icon: 'code',
    starterCode: `public class Solution {
    public static String fizzBuzz(int n) {
        // اكتب الكود هنا
        return "";
    }
}`,
    solution: `public class Solution {
    public static String fizzBuzz(int n) {
        if (n % 15 == 0) return "FizzBuzz";
        if (n % 3 == 0) return "Fizz";
        if (n % 5 == 0) return "Buzz";
        return String.valueOf(n);
    }
}`,
    hints: ['تحقق من القابلية للقسمة على 15 أولاً', 'استخدم عامل %'],
    testCases: [
      {
        input: '3',
        expectedOutput: 'Fizz',
        description: '3 قابل للقسمة على 3',
      },
      {
        input: '5',
        expectedOutput: 'Buzz',
        description: '5 قابل للقسمة على 5',
      },
      {
        input: '15',
        expectedOutput: 'FizzBuzz',
        description: '15 قابل لكليهما',
      },
    ],
    isLocked: false,
    category: 'logic',
  },
  {
    id: 'java-ch-5',
    title: 'البحث الثنائي',
    description: 'ابحث عن عنصر في مصفوفة مرتبة باستخدام Binary Search',
    difficulty: 'hard',
    points: 50,
    language: 'Java',
    icon: 'search',
    starterCode: `public class Solution {
    public static int binarySearch(int[] arr, int target) {
        // اكتب الكود هنا
        return -1;
    }
}`,
    solution: `public class Solution {
    public static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
    hints: ['قسم المصفوفة للنصف', 'قارن العنصر الأوسط مع الهدف'],
    testCases: [
      {
        input: 'new int[]{1,2,3,4,5}, 3',
        expectedOutput: '2',
        description: 'البحث عن 3',
      },
      {
        input: 'new int[]{1,2,3,4,5}, 6',
        expectedOutput: '-1',
        description: 'عنصر غير موجود',
      },
    ],
    isLocked: true,
    category: 'algorithms',
  },
];

// ===== تصدير كل المحتوى =====
export const ALL_JAVA_LESSONS = [
  ...JAVA_LESSONS_BEGINNER,
  ...JAVA_LESSONS_ADVANCED,
];
export const ALL_JAVA_CHALLENGES = JAVA_CHALLENGES;
