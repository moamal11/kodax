// ⚠️ ملف مولّد بواسطة scripts/build-verify-function.ts — لا تعدّله يدوياً
import type { ChallengeSpec } from './core.ts';

export const CHALLENGE_SPECS: Record<string, ChallengeSpec> = {
 "ch-1": {
  "id": "ch-1",
  "language": "Python",
  "difficulty": "easy",
  "points": 10,
  "starterCode": "# اكتب الكود هنا\n",
  "testCases": [
   {
    "input": "",
    "expectedOutput": "Hello, World!",
    "description": "يجب أن يطبع Hello, World!"
   }
  ]
 },
 "ch-2": {
  "id": "ch-2",
  "language": "Python",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "def add(a, b):\n    # اكتب الكود هنا\n    pass\n",
  "testCases": [
   {
    "input": "2, 3",
    "expectedOutput": "5",
    "description": "2 + 3 = 5"
   },
   {
    "input": "0, 0",
    "expectedOutput": "0",
    "description": "0 + 0 = 0"
   },
   {
    "input": "-1, 1",
    "expectedOutput": "0",
    "description": "-1 + 1 = 0"
   },
   {
    "input": "100, 250",
    "expectedOutput": "350",
    "description": "أعداد كبيرة",
    "hidden": true
   },
   {
    "input": "-7, -3",
    "expectedOutput": "-10",
    "description": "عددان سالبان",
    "hidden": true
   },
   {
    "input": "2.5, 0.5",
    "expectedOutput": "3",
    "description": "أعداد عشرية",
    "hidden": true
   }
  ]
 },
 "ch-3": {
  "id": "ch-3",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "def reverse_string(text):\n    # اكتب الكود هنا\n    pass\n",
  "testCases": [
   {
    "input": "\"hello\"",
    "expectedOutput": "olleh",
    "description": "عكس hello"
   },
   {
    "input": "\"مرحبا\"",
    "expectedOutput": "ابحرم",
    "description": "عكس نص عربي"
   },
   {
    "input": "\"a\"",
    "expectedOutput": "a",
    "description": "حرف واحد",
    "hidden": true
   },
   {
    "input": "\"\"",
    "expectedOutput": "",
    "description": "نص فارغ",
    "hidden": true
   },
   {
    "input": "\"abc def\"",
    "expectedOutput": "fed cba",
    "description": "نص فيه مسافة",
    "hidden": true
   }
  ]
 },
 "ch-4": {
  "id": "ch-4",
  "language": "Python",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "def is_prime(n):\n    # الرقم الأولي يقبل القسمة على 1 ونفسه فقط\n    pass\n",
  "testCases": [
   {
    "input": "7",
    "expectedOutput": "True",
    "description": "7 رقم أولي"
   },
   {
    "input": "4",
    "expectedOutput": "False",
    "description": "4 ليس أولي"
   },
   {
    "input": "1",
    "expectedOutput": "False",
    "description": "1 ليس أولي"
   },
   {
    "input": "17",
    "expectedOutput": "True",
    "description": "17 رقم أولي"
   },
   {
    "input": "2",
    "expectedOutput": "True",
    "description": "أصغر عدد أولي",
    "hidden": true
   },
   {
    "input": "0",
    "expectedOutput": "False",
    "description": "صفر",
    "hidden": true
   },
   {
    "input": "25",
    "expectedOutput": "False",
    "description": "مربع عدد أولي",
    "hidden": true
   },
   {
    "input": "97",
    "expectedOutput": "True",
    "description": "عدد أولي كبير",
    "hidden": true
   },
   {
    "input": "-5",
    "expectedOutput": "False",
    "description": "عدد سالب",
    "hidden": true
   }
  ]
 },
 "ch-5": {
  "id": "ch-5",
  "language": "Python",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "def fibonacci(n):\n    # سلسلة فيبوناتشي: 0, 1, 1, 2, 3, 5, 8, 13, ...\n    pass\n",
  "testCases": [
   {
    "input": "0",
    "expectedOutput": "0",
    "description": "fib(0) = 0"
   },
   {
    "input": "1",
    "expectedOutput": "1",
    "description": "fib(1) = 1"
   },
   {
    "input": "10",
    "expectedOutput": "55",
    "description": "fib(10) = 55"
   },
   {
    "input": "2",
    "expectedOutput": "1",
    "description": "F(2)",
    "hidden": true
   },
   {
    "input": "20",
    "expectedOutput": "6765",
    "description": "F(20)",
    "hidden": true
   },
   {
    "input": "30",
    "expectedOutput": "832040",
    "description": "F(30) — يحتاج حلاً غير بطيء",
    "hidden": true
   }
  ]
 },
 "ch-6": {
  "id": "ch-6",
  "language": "Python",
  "difficulty": "medium",
  "points": 50,
  "starterCode": "def bubble_sort(arr):\n    # رتب القائمة بدون استخدام sort()\n    pass\n",
  "testCases": [
   {
    "input": "[64, 34, 25, 12, 22]",
    "expectedOutput": "[12, 22, 25, 34, 64]",
    "description": "ترتيب قائمة أرقام"
   },
   {
    "input": "[1]",
    "expectedOutput": "[1]",
    "description": "عنصر واحد"
   },
   {
    "input": "[3, -1, 0, 5, -2]",
    "expectedOutput": "[-2, -1, 0, 3, 5]",
    "description": "أرقام سالبة وموجبة"
   },
   {
    "input": "[]",
    "expectedOutput": "[]",
    "description": "قائمة فارغة",
    "hidden": true
   },
   {
    "input": "[5, 5, 1]",
    "expectedOutput": "[1, 5, 5]",
    "description": "قيم مكررة",
    "hidden": true
   },
   {
    "input": "[2, 1]",
    "expectedOutput": "[1, 2]",
    "description": "عنصران",
    "hidden": true
   }
  ]
 },
 "ch-7": {
  "id": "ch-7",
  "language": "Python",
  "difficulty": "medium",
  "points": 70,
  "starterCode": "def binary_search(arr, target):\n    # ابحث عن target في القائمة المرتبة arr\n    # أرجع الفهرس أو -1 إذا لم يوجد\n    pass\n",
  "testCases": [
   {
    "input": "[1, 2, 3, 4, 5], 3",
    "expectedOutput": "2",
    "description": "البحث عن 3 في الفهرس 2"
   },
   {
    "input": "[1, 2, 3, 4, 5], 6",
    "expectedOutput": "-1",
    "description": "6 غير موجود يرجع -1"
   },
   {
    "input": "[1, 2, 3, 4, 5], 1",
    "expectedOutput": "0",
    "description": "أول عنصر في الفهرس 0"
   },
   {
    "input": "[10, 20, 30, 40, 50], 50",
    "expectedOutput": "4",
    "description": "آخر عنصر في الفهرس 4"
   },
   {
    "input": "[], 3",
    "expectedOutput": "-1",
    "description": "قائمة فارغة",
    "hidden": true
   },
   {
    "input": "[7], 7",
    "expectedOutput": "0",
    "description": "عنصر واحد",
    "hidden": true
   },
   {
    "input": "[1, 3, 5, 7, 9, 11, 13], 13",
    "expectedOutput": "6",
    "description": "آخر عنصر",
    "hidden": true
   }
  ]
 },
 "ch-8": {
  "id": "ch-8",
  "language": "Python",
  "difficulty": "medium",
  "points": 80,
  "starterCode": "def is_balanced(s):\n    # تحقق من توازن الأقواس: (), [], {}\n    pass\n",
  "testCases": [
   {
    "input": "\"([{}])\"",
    "expectedOutput": "True",
    "description": "متوازن"
   },
   {
    "input": "\"([)]\"",
    "expectedOutput": "False",
    "description": "غير متوازن"
   },
   {
    "input": "\"\"",
    "expectedOutput": "True",
    "description": "نص فارغ"
   },
   {
    "input": "\"(\"",
    "expectedOutput": "False",
    "description": "قوس غير مغلق",
    "hidden": true
   },
   {
    "input": "\")(\"",
    "expectedOutput": "False",
    "description": "إغلاق قبل الفتح",
    "hidden": true
   },
   {
    "input": "\"a(b[c]{d}e)f\"",
    "expectedOutput": "True",
    "description": "أقواس بين أحرف",
    "hidden": true
   },
   {
    "input": "\"{[}]\"",
    "expectedOutput": "False",
    "description": "ترتيب خاطئ",
    "hidden": true
   }
  ]
 },
 "ch-9": {
  "id": "ch-9",
  "language": "Python",
  "difficulty": "hard",
  "points": 100,
  "starterCode": "def spiral_order(matrix):\n    # أرجع عناصر المصفوفة بترتيب حلزوني\n    pass\n",
  "testCases": [
   {
    "input": "[[1,2,3],[4,5,6],[7,8,9]]",
    "expectedOutput": "[1, 2, 3, 6, 9, 8, 7, 4, 5]",
    "description": "مصفوفة 3×3"
   },
   {
    "input": "[[1,2],[3,4]]",
    "expectedOutput": "[1, 2, 4, 3]",
    "description": "مصفوفة 2×2"
   },
   {
    "input": "[]",
    "expectedOutput": "[]",
    "description": "مصفوفة فارغة",
    "hidden": true
   },
   {
    "input": "[[1, 2, 3]]",
    "expectedOutput": "[1, 2, 3]",
    "description": "صف واحد",
    "hidden": true
   },
   {
    "input": "[[1], [2], [3]]",
    "expectedOutput": "[1, 2, 3]",
    "description": "عمود واحد",
    "hidden": true
   },
   {
    "input": "[[1,2,3,4],[5,6,7,8],[9,10,11,12]]",
    "expectedOutput": "[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]",
    "description": "مصفوفة غير مربعة",
    "hidden": true
   }
  ]
 },
 "css-ch-beg-1": {
  "id": "css-ch-beg-1",
  "language": "CSS",
  "difficulty": "easy",
  "points": 10,
  "starterCode": ".title {\n    /* نسق العنوان الرئيسي */\n}\n\n.paragraph {\n    /* نسق الفقرة */\n}\n\n.highlight {\n    /* نسق النص المميز */\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "\\.title\\s*\\{[^}]*font-size\\s*:",
    "message": "حدد font-size للعنوان"
   },
   {
    "pattern": "\\.title\\s*\\{[^}]*text-align\\s*:\\s*center",
    "message": "توسيط العنوان (text-align: center)"
   },
   {
    "pattern": "letter-spacing\\s*:",
    "message": "أضف letter-spacing"
   },
   {
    "pattern": "\\.paragraph\\s*\\{[^}]*line-height\\s*:",
    "message": "حدد line-height للفقرة"
   },
   {
    "pattern": "\\.highlight\\s*\\{[^}]*background",
    "message": "أضف خلفية للنص المميز"
   }
  ],
  "validation": "structural"
 },
 "css-ch-beg-2": {
  "id": "css-ch-beg-2",
  "language": "CSS",
  "difficulty": "easy",
  "points": 15,
  "starterCode": ".custom-list {\n    /* تنسيق القائمة */\n}\n\n.custom-list li {\n    /* تنسيق عناصر القائمة */\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "list-style(-type)?\\s*:\\s*none",
    "message": "أزل العلامات الافتراضية (list-style: none)"
   },
   {
    "pattern": "li\\s*::?before\\s*\\{[^}]*content\\s*:",
    "message": "أضف علامة مخصصة عبر li::before مع content"
   },
   {
    "pattern": "\\.custom-list\\s+li\\s*\\{[^}]*padding",
    "message": "أضف padding لعناصر القائمة"
   }
  ],
  "validation": "structural"
 },
 "css-ch-beg-3": {
  "id": "css-ch-beg-3",
  "language": "CSS",
  "difficulty": "easy",
  "points": 15,
  "starterCode": ".box-shadow {\n    /* أضف ظل للصندوق */\n}\n\n.text-shadow {\n    /* أضف ظل للنص */\n}\n\n.bordered {\n    /* أضف حدود متعددة */\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "\\.box-shadow\\s*\\{[^}]*box-shadow\\s*:",
    "message": "أضف box-shadow للصندوق"
   },
   {
    "pattern": "\\.text-shadow\\s*\\{[^}]*text-shadow\\s*:",
    "message": "أضف text-shadow للنص"
   },
   {
    "pattern": "\\.bordered\\s*\\{[^}]*border\\s*:",
    "message": "أضف border للعنصر .bordered"
   },
   {
    "pattern": "border-radius\\s*:",
    "message": "أضف border-radius"
   },
   {
    "pattern": "outline\\s*:",
    "message": "أضف حداً ثانياً باستخدام outline"
   }
  ],
  "validation": "structural"
 },
 "css-ch-int-1": {
  "id": "css-ch-int-1",
  "language": "CSS",
  "difficulty": "medium",
  "points": 25,
  "starterCode": ".container {\n    /* استخدم Flexbox */\n}\n\n.item {\n    /* نسق العناصر */\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "\\.container\\s*\\{[^}]*display\\s*:\\s*flex",
    "message": "اجعل الحاوية display: flex"
   },
   {
    "pattern": "justify-content\\s*:",
    "message": "حدد justify-content"
   },
   {
    "pattern": "align-items\\s*:\\s*center",
    "message": "توسيط عمودي (align-items: center)"
   },
   {
    "pattern": "gap\\s*:",
    "message": "أضف gap بين العناصر"
   },
   {
    "pattern": "flex-wrap\\s*:\\s*wrap",
    "message": "اسمح بالالتفاف (flex-wrap: wrap)"
   },
   {
    "pattern": "\\.item\\s*\\{[^}]*flex\\s*:",
    "message": "حدد flex للعناصر"
   }
  ],
  "validation": "structural"
 },
 "css-ch-int-2": {
  "id": "css-ch-int-2",
  "language": "CSS",
  "difficulty": "medium",
  "points": 30,
  "starterCode": ".grid-container {\n    /* استخدم CSS Grid */\n}\n\n.grid-item {\n    /* نسق العناصر */\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "display\\s*:\\s*grid",
    "message": "استخدم display: grid"
   },
   {
    "pattern": "grid-template-columns\\s*:",
    "message": "حدد grid-template-columns"
   },
   {
    "pattern": "gap\\s*:",
    "message": "أضف gap"
   },
   {
    "pattern": ":hover\\s*\\{[^}]*transform\\s*:",
    "message": "أضف transform عند :hover"
   },
   {
    "pattern": "transition\\s*:",
    "message": "أضف transition"
   }
  ],
  "validation": "structural"
 },
 "css-ch-int-3": {
  "id": "css-ch-int-3",
  "language": "CSS",
  "difficulty": "medium",
  "points": 35,
  "starterCode": ".card {\n    /* تنسيق البطاقة */\n}\n\n@media (max-width: 768px) {\n    /* تنسيقات للموبايل */\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "@media\\s*\\(\\s*max-width\\s*:\\s*768px\\s*\\)",
    "message": "استخدم @media (max-width: 768px)"
   },
   {
    "pattern": "@media[^{]*\\{[\\s\\S]*\\.card\\s*\\{",
    "message": "عدّل .card داخل الـ media query"
   },
   {
    "pattern": "grid-template-columns\\s*:\\s*1fr\\s*;|flex-direction\\s*:\\s*column",
    "message": "حوّل التخطيط إلى عمود واحد على الموبايل"
   },
   {
    "pattern": "^\\s*\\.card\\s*\\{[^}]*(display|grid|flex|padding)",
    "message": "نسّق .card للشاشات الكبيرة",
    "flags": "im"
   }
  ],
  "validation": "structural"
 },
 "css-ch-int-4": {
  "id": "css-ch-int-4",
  "language": "CSS",
  "difficulty": "medium",
  "points": 30,
  "starterCode": ".form-group {\n    /* تنسيق مجموعة الحقل */\n}\n\n.input-field {\n    /* نسق حقل الإدخال */\n}\n\n.input-field:focus {\n    /* تنسيق عند التركيز */\n}\n\n.input-label {\n    /* تنسيق التسمية */\n}\n\n.input-field:focus + .input-label,\n.input-field:not(:placeholder-shown) + .input-label {\n    /* تنسيق التسمية عند التركيز */\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "\\.input-field\\s*\\{[^}]*border\\s*:",
    "message": "أضف border للحقل"
   },
   {
    "pattern": "\\.input-field:focus\\s*\\{[^}]*(border-color|box-shadow|outline)",
    "message": "غيّر الشكل عند التركيز"
   },
   {
    "pattern": "transition\\s*:",
    "message": "أضف transition"
   },
   {
    "pattern": "\\.input-label\\s*\\{[^}]*position\\s*:\\s*absolute",
    "message": "اجعل التسمية position: absolute"
   },
   {
    "pattern": "transform\\s*:",
    "message": "حرّك التسمية بـ transform"
   }
  ],
  "validation": "structural"
 },
 "css-ch-1": {
  "id": "css-ch-1",
  "language": "CSS",
  "difficulty": "easy",
  "points": 15,
  "starterCode": ".button {\n    /* أضف تنسيقاتك هنا */\n    \n}\n\n.button:hover {\n    /* تأثير عند المرور */\n    \n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "\\.button\\s*\\{[^}]*background",
    "message": "أضف خلفية للزر"
   },
   {
    "pattern": "linear-gradient\\s*\\(",
    "message": "استخدم linear-gradient"
   },
   {
    "pattern": "border-radius\\s*:",
    "message": "أضف زوايا دائرية"
   },
   {
    "pattern": "cursor\\s*:\\s*pointer",
    "message": "أضف cursor: pointer"
   },
   {
    "pattern": "transition\\s*:",
    "message": "أضف transition"
   },
   {
    "pattern": "\\.button:hover\\s*\\{[^}]*(transform|box-shadow)\\s*:",
    "message": "أضف تأثيراً عند المرور (transform أو box-shadow)"
   }
  ],
  "validation": "structural"
 },
 "css-ch-2": {
  "id": "css-ch-2",
  "language": "CSS",
  "difficulty": "medium",
  "points": 30,
  "starterCode": ".product-card {\n    /* تنسيق البطاقة */\n}\n\n.product-image {\n    /* تنسيق الصورة */\n}\n\n.product-info {\n    /* تنسيق المعلومات */\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "\\.product-card\\s*\\{[^}]*border-radius\\s*:",
    "message": "زوايا دائرية للبطاقة"
   },
   {
    "pattern": "\\.product-card\\s*\\{[^}]*box-shadow\\s*:",
    "message": "ظل للبطاقة"
   },
   {
    "pattern": "\\.product-card:hover\\s*\\{",
    "message": "تأثير عند المرور على البطاقة"
   },
   {
    "pattern": "transition\\s*:",
    "message": "أضف transition"
   },
   {
    "pattern": "\\.product-image\\s*\\{[^}]*(width|object-fit)\\s*:",
    "message": "نسّق الصورة (width أو object-fit)"
   },
   {
    "pattern": "\\.product-info\\s*\\{[^}]*padding\\s*:",
    "message": "أضف padding للمعلومات"
   }
  ],
  "validation": "structural"
 },
 "css-ch-3": {
  "id": "css-ch-3",
  "language": "CSS",
  "difficulty": "medium",
  "points": 35,
  "starterCode": ".nav {\n    /* تنسيق القائمة الرئيسية */\n}\n\n.nav-link {\n    /* تنسيق الروابط */\n}\n\n.nav-link:hover {\n    /* تأثير المرور */\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "\\.nav\\s*\\{[^}]*display\\s*:\\s*flex",
    "message": "اجعل القائمة display: flex"
   },
   {
    "pattern": "text-decoration\\s*:\\s*none",
    "message": "أزل الخط السفلي الافتراضي"
   },
   {
    "pattern": "::?after\\s*\\{",
    "message": "أنشئ الخط المتحرك عبر ::after"
   },
   {
    "pattern": "\\.nav-link:hover",
    "message": "أضف تأثيراً عند المرور"
   },
   {
    "pattern": "transition\\s*:",
    "message": "أضف transition"
   }
  ],
  "validation": "structural"
 },
 "css-ch-4": {
  "id": "css-ch-4",
  "language": "CSS",
  "difficulty": "hard",
  "points": 50,
  "starterCode": ".spinner {\n    /* تنسيق المؤشر */\n}\n\n@keyframes spin {\n    /* حركة الدوران */\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "border-radius\\s*:\\s*50%",
    "message": "اجعله دائرياً (border-radius: 50%)"
   },
   {
    "pattern": "border-top(-color)?\\s*:",
    "message": "لوّن الحد العلوي"
   },
   {
    "pattern": "@keyframes\\s+spin[\\s\\S]*rotate\\s*\\(\\s*360deg\\s*\\)",
    "message": "أنشئ @keyframes spin تنتهي بـ rotate(360deg)"
   },
   {
    "pattern": "animation\\s*:[^;]*spin",
    "message": "طبّق الحركة spin"
   },
   {
    "pattern": "infinite",
    "message": "اجعل الحركة لا نهائية (infinite)"
   }
  ],
  "validation": "structural"
 },
 "css-ch-5": {
  "id": "css-ch-5",
  "language": "CSS",
  "difficulty": "hard",
  "points": 60,
  "starterCode": ":root {\n    /* متغيرات الوضع الفاتح */\n}\n\n.dark-mode {\n    /* متغيرات الوضع المظلم */\n}\n\n.toggle-switch {\n    /* تنسيق زر التبديل */\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": ":root\\s*\\{[^}]*--[\\w-]+\\s*:",
    "message": "عرّف متغيرات في :root"
   },
   {
    "pattern": "\\.dark-mode\\s*\\{[^}]*--[\\w-]+\\s*:",
    "message": "أعد تعريف المتغيرات في .dark-mode"
   },
   {
    "pattern": "var\\s*\\(\\s*--",
    "message": "استخدم المتغيرات بـ var()"
   },
   {
    "pattern": "\\.toggle-switch\\s*\\{[^}]*(width|border-radius)\\s*:",
    "message": "نسّق زر التبديل"
   },
   {
    "pattern": "transition\\s*:",
    "message": "أضف transition"
   }
  ],
  "validation": "structural"
 },
 "py-ch-beg-1": {
  "id": "py-ch-beg-1",
  "language": "Python",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "def calculator(a, b, operation):\n    \"\"\"\n    احسب النتيجة بناءً على العملية\n    العمليات: '+', '-', '*', '/'\n    \"\"\"\n    pass\n\n# أمثلة:\n# calculator(10, 5, '+') -> 15\n# calculator(10, 5, '-') -> 5",
  "testCases": [
   {
    "input": "10, 5, \"+\"",
    "expectedOutput": "15",
    "description": "جمع"
   },
   {
    "input": "10, 5, \"-\"",
    "expectedOutput": "5",
    "description": "طرح"
   },
   {
    "input": "10, 5, \"*\"",
    "expectedOutput": "50",
    "description": "ضرب"
   },
   {
    "input": "10, 2, \"/\"",
    "expectedOutput": "5.0",
    "description": "قسمة"
   },
   {
    "input": "10, 0, \"/\"",
    "expectedOutput": "لا يمكن القسمة على صفر",
    "description": "القسمة على صفر"
   },
   {
    "input": "7, 2, \"-\"",
    "expectedOutput": "5",
    "description": "طرح",
    "hidden": true
   },
   {
    "input": "3, 4, \"%\"",
    "expectedOutput": "عملية غير صالحة",
    "description": "عملية غير مدعومة",
    "hidden": true
   },
   {
    "input": "9, 3, \"/\"",
    "expectedOutput": "3",
    "description": "قسمة",
    "hidden": true
   }
  ]
 },
 "py-ch-beg-2": {
  "id": "py-ch-beg-2",
  "language": "Python",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "def reverse_string(text):\n    \"\"\"\n    اعكس النص المُدخل\n    \"\"\"\n    pass\n\n# أمثلة:\n# reverse_string(\"hello\") -> \"olleh\"\n# reverse_string(\"Python\") -> \"nohtyP\"",
  "testCases": [
   {
    "input": "\"hello\"",
    "expectedOutput": "\"olleh\"",
    "description": "عكس كلمة"
   },
   {
    "input": "\"Python\"",
    "expectedOutput": "\"nohtyP\"",
    "description": "عكس اسم"
   },
   {
    "input": "\"\"",
    "expectedOutput": "\"\"",
    "description": "نص فارغ"
   },
   {
    "input": "\"a b\"",
    "expectedOutput": "b a",
    "description": "نص فيه مسافة",
    "hidden": true
   },
   {
    "input": "\"x\"",
    "expectedOutput": "x",
    "description": "حرف واحد",
    "hidden": true
   }
  ]
 },
 "py-ch-beg-3": {
  "id": "py-ch-beg-3",
  "language": "Python",
  "difficulty": "easy",
  "points": 10,
  "starterCode": "def even_or_odd(number):\n    \"\"\"\n    أرجع \"زوجي\" إذا كان العدد زوجياً\n    أرجع \"فردي\" إذا كان العدد فردياً\n    \"\"\"\n    pass",
  "testCases": [
   {
    "input": "4",
    "expectedOutput": "\"زوجي\"",
    "description": "4 زوجي"
   },
   {
    "input": "7",
    "expectedOutput": "\"فردي\"",
    "description": "7 فردي"
   },
   {
    "input": "0",
    "expectedOutput": "\"زوجي\"",
    "description": "0 زوجي"
   },
   {
    "input": "-3",
    "expectedOutput": "فردي",
    "description": "عدد سالب فردي",
    "hidden": true
   },
   {
    "input": "-4",
    "expectedOutput": "زوجي",
    "description": "عدد سالب زوجي",
    "hidden": true
   },
   {
    "input": "101",
    "expectedOutput": "فردي",
    "description": "عدد كبير",
    "hidden": true
   }
  ]
 },
 "py-ch-beg-4": {
  "id": "py-ch-beg-4",
  "language": "Python",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "def calculate_average(numbers):\n    \"\"\"\n    احسب متوسط الأرقام في القائمة\n    أرجع 0 إذا كانت القائمة فارغة\n    \"\"\"\n    pass\n\n# مثال:\n# calculate_average([10, 20, 30]) -> 20.0",
  "testCases": [
   {
    "input": "[10, 20, 30]",
    "expectedOutput": "20.0",
    "description": "متوسط ثلاثة أرقام"
   },
   {
    "input": "[5]",
    "expectedOutput": "5.0",
    "description": "رقم واحد"
   },
   {
    "input": "[]",
    "expectedOutput": "0",
    "description": "قائمة فارغة"
   },
   {
    "input": "[1, 2]",
    "expectedOutput": "1.5",
    "description": "متوسط عشري",
    "hidden": true
   },
   {
    "input": "[-5, 5]",
    "expectedOutput": "0",
    "description": "أعداد سالبة وموجبة",
    "hidden": true
   }
  ]
 },
 "py-ch-beg-5": {
  "id": "py-ch-beg-5",
  "language": "Python",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "def count_words(text):\n    \"\"\"\n    احسب عدد الكلمات في النص\n    \"\"\"\n    pass\n\n# مثال:\n# count_words(\"مرحباً بك في Python\") -> 4",
  "testCases": [
   {
    "input": "\"مرحباً بك\"",
    "expectedOutput": "2",
    "description": "كلمتان"
   },
   {
    "input": "\"Hello World\"",
    "expectedOutput": "2",
    "description": "كلمتان بالإنجليزي"
   },
   {
    "input": "\"\"",
    "expectedOutput": "0",
    "description": "نص فارغ"
   },
   {
    "input": "\"  many   spaces here \"",
    "expectedOutput": "3",
    "description": "مسافات متعددة",
    "hidden": true
   },
   {
    "input": "\"one\"",
    "expectedOutput": "1",
    "description": "كلمة واحدة",
    "hidden": true
   }
  ]
 },
 "py-ch-int-1": {
  "id": "py-ch-int-1",
  "language": "Python",
  "difficulty": "medium",
  "points": 25,
  "starterCode": "def fizzbuzz(n):\n    \"\"\"\n    أرجع قائمة من 1 إلى n حيث:\n    - \"Fizz\" للأرقام التي تقبل القسمة على 3\n    - \"Buzz\" للأرقام التي تقبل القسمة على 5\n    - \"FizzBuzz\" للأرقام التي تقبل القسمة على كليهما\n    - الرقم نفسه لباقي الحالات\n    \"\"\"\n    pass",
  "testCases": [
   {
    "input": "5",
    "expectedOutput": "[\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\"]",
    "description": "أول 5"
   },
   {
    "input": "15",
    "expectedOutput": "[\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\", \"Fizz\", \"7\", \"8\", \"Fizz\", \"Buzz\", \"11\", \"Fizz\", \"13\", \"14\", \"FizzBuzz\"]",
    "description": "يشمل 15"
   },
   {
    "input": "1",
    "expectedOutput": "['1']",
    "description": "n = 1",
    "hidden": true
   },
   {
    "input": "0",
    "expectedOutput": "[]",
    "description": "n = 0",
    "hidden": true
   }
  ]
 },
 "py-ch-int-2": {
  "id": "py-ch-int-2",
  "language": "Python",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "def is_prime(n):\n    \"\"\"\n    تحقق إذا كان العدد أولياً\n    العدد الأولي يقبل القسمة على 1 وعلى نفسه فقط\n    \"\"\"\n    pass\n\ndef primes_up_to(limit):\n    \"\"\"\n    أرجع قائمة بالأعداد الأولية حتى limit\n    \"\"\"\n    pass",
  "testCases": [
   {
    "input": "is_prime(7)",
    "expectedOutput": "True",
    "description": "7 أولي"
   },
   {
    "input": "is_prime(10)",
    "expectedOutput": "False",
    "description": "10 ليس أولي"
   },
   {
    "input": "primes_up_to(10)",
    "expectedOutput": "[2, 3, 5, 7]",
    "description": "أولية حتى 10"
   },
   {
    "input": "is_prime(2)",
    "expectedOutput": "True",
    "description": "العدد 2",
    "hidden": true
   },
   {
    "input": "primes_up_to(1)",
    "expectedOutput": "[]",
    "description": "لا توجد أعداد أولية",
    "hidden": true
   },
   {
    "input": "primes_up_to(20)",
    "expectedOutput": "[2, 3, 5, 7, 11, 13, 17, 19]",
    "description": "حتى 20",
    "hidden": true
   }
  ]
 },
 "py-ch-int-3": {
  "id": "py-ch-int-3",
  "language": "Python",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "def bubble_sort(arr):\n    \"\"\"\n    رتب القائمة باستخدام Bubble Sort\n    أرجع قائمة جديدة مرتبة\n    \"\"\"\n    pass",
  "testCases": [
   {
    "input": "[64, 34, 25, 12]",
    "expectedOutput": "[12, 25, 34, 64]",
    "description": "ترتيب أرقام"
   },
   {
    "input": "[1, 2, 3]",
    "expectedOutput": "[1, 2, 3]",
    "description": "مرتبة مسبقاً"
   },
   {
    "input": "[]",
    "expectedOutput": "[]",
    "description": "قائمة فارغة"
   },
   {
    "input": "[-3, 1, -5, 2]",
    "expectedOutput": "[-5, -3, 1, 2]",
    "description": "أرقام سالبة"
   },
   {
    "input": "[5, 1, 5, 1]",
    "expectedOutput": "[1, 1, 5, 5]",
    "description": "قيم مكررة",
    "hidden": true
   }
  ]
 },
 "py-ch-int-4": {
  "id": "py-ch-int-4",
  "language": "Python",
  "difficulty": "medium",
  "points": 25,
  "starterCode": "def count_frequency(items):\n    \"\"\"\n    أرجع قاموساً بعدد تكرار كل عنصر\n    \"\"\"\n    pass\n\n# مثال:\n# count_frequency(['a', 'b', 'a', 'c', 'a', 'b'])\n# -> {'a': 3, 'b': 2, 'c': 1}",
  "testCases": [
   {
    "input": "['a', 'b', 'a']",
    "expectedOutput": "{'a': 2, 'b': 1}",
    "description": "تكرار حروف"
   },
   {
    "input": "[1, 1, 2, 2, 2]",
    "expectedOutput": "{1: 2, 2: 3}",
    "description": "تكرار أرقام"
   },
   {
    "input": "[]",
    "expectedOutput": "{}",
    "description": "قائمة فارغة",
    "hidden": true
   },
   {
    "input": "[\"x\"]",
    "expectedOutput": "{'x': 1}",
    "description": "عنصر واحد",
    "hidden": true
   }
  ]
 },
 "py-ch-int-5": {
  "id": "py-ch-int-5",
  "language": "Python",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "def fibonacci(n):\n    \"\"\"\n    أرجع أول n أرقام من متتالية فيبوناتشي\n    \"\"\"\n    pass\n\ndef fibonacci_recursive(n):\n    \"\"\"\n    أرجع الرقم n من متتالية فيبوناتشي (باستخدام التكرار)\n    \"\"\"\n    pass",
  "testCases": [
   {
    "input": "fibonacci(5)",
    "expectedOutput": "[0, 1, 1, 2, 3]",
    "description": "أول 5"
   },
   {
    "input": "fibonacci_recursive(10)",
    "expectedOutput": "55",
    "description": "الرقم العاشر"
   },
   {
    "input": "fibonacci(0)",
    "expectedOutput": "[]",
    "description": "n = 0",
    "hidden": true
   },
   {
    "input": "fibonacci(1)",
    "expectedOutput": "[0]",
    "description": "n = 1",
    "hidden": true
   },
   {
    "input": "fibonacci_recursive(0)",
    "expectedOutput": "0",
    "description": "F(0)",
    "hidden": true
   },
   {
    "input": "fibonacci_recursive(15)",
    "expectedOutput": "610",
    "description": "F(15)",
    "hidden": true
   }
  ]
 },
 "py-ch-adv-1": {
  "id": "py-ch-adv-1",
  "language": "Python",
  "difficulty": "hard",
  "points": 80,
  "starterCode": "def is_balanced(expression):\n    \"\"\"\n    تحقق من توازن الأقواس في التعبير\n    الأقواس المدعومة: () [] {} <>\n    \"\"\"\n    pass\n\n# أمثلة:\n# is_balanced(\"([{}])\") -> True\n# is_balanced(\"([)]\") -> False\n# is_balanced(\"<div>{text}</div>\") -> True",
  "testCases": [
   {
    "input": "\"([{}])\"",
    "expectedOutput": "True",
    "description": "أقواس متوازنة"
   },
   {
    "input": "\"([)]\"",
    "expectedOutput": "False",
    "description": "أقواس غير متوازنة"
   },
   {
    "input": "\"\"",
    "expectedOutput": "True",
    "description": "نص فارغ"
   },
   {
    "input": "\"<[()]>\"",
    "expectedOutput": "True",
    "description": "أقواس زاوية متوازنة"
   },
   {
    "input": "\"<(>)\"",
    "expectedOutput": "False",
    "description": "تداخل خاطئ",
    "hidden": true
   },
   {
    "input": "\"((\"",
    "expectedOutput": "False",
    "description": "أقواس غير مغلقة",
    "hidden": true
   }
  ]
 },
 "py-ch-adv-2": {
  "id": "py-ch-adv-2",
  "language": "Python",
  "difficulty": "hard",
  "points": 50,
  "starterCode": "def compress(text):\n    \"\"\"\n    ضغط النص باستخدام Run-Length Encoding\n    مثال: \"AAABBC\" -> \"A3B2C1\"\n    \"\"\"\n    pass\n\ndef decompress(compressed):\n    \"\"\"\n    فك ضغط النص\n    مثال: \"A3B2C1\" -> \"AAABBC\"\n    \"\"\"\n    pass",
  "testCases": [
   {
    "input": "\"AAABBC\"",
    "expectedOutput": "\"A3B2C1\"",
    "description": "ضغط نص"
   },
   {
    "input": "\"AABBCCCC\"",
    "expectedOutput": "\"A2B2C4\"",
    "description": "ضغط حروف متفاوتة"
   },
   {
    "input": "decompress(\"A3B2C1\")",
    "expectedOutput": "AAABBC",
    "description": "فك ضغط النص"
   },
   {
    "input": "\"\"",
    "expectedOutput": "\"\"",
    "description": "نص فارغ"
   },
   {
    "input": "\"A\"",
    "expectedOutput": "A1",
    "description": "حرف واحد",
    "hidden": true
   },
   {
    "input": "\"ABAB\"",
    "expectedOutput": "A1B1A1B1",
    "description": "أحرف متناوبة",
    "hidden": true
   },
   {
    "input": "decompress(\"X1Y3\")",
    "expectedOutput": "XYYY",
    "description": "فك الضغط",
    "hidden": true
   },
   {
    "input": "decompress(\"\")",
    "expectedOutput": "",
    "description": "فك نص فارغ",
    "hidden": true
   }
  ]
 },
 "py-ch-adv-3": {
  "id": "py-ch-adv-3",
  "language": "Python",
  "difficulty": "hard",
  "points": 100,
  "starterCode": "class Node:\n    def __init__(self, value):\n        self.value = value\n        self.left = None\n        self.right = None\n\nclass BST:\n    def __init__(self):\n        self.root = None\n    \n    def insert(self, value):\n        \"\"\"إضافة قيمة للشجرة\"\"\"\n        pass\n    \n    def search(self, value):\n        \"\"\"البحث عن قيمة، ترجع True/False\"\"\"\n        pass\n    \n    def inorder(self):\n        \"\"\"إرجاع القيم مرتبة\"\"\"\n        pass",
  "testCases": [
   {
    "input": "tree = BST()\nfor v in [5, 3, 7]:\n    tree.insert(v)\ntree.inorder()",
    "expectedOutput": "[3, 5, 7]",
    "description": "إضافة 5، 3، 7 ثم inorder"
   },
   {
    "input": "tree = BST()\nfor v in [5, 3, 7, 1, 4]:\n    tree.insert(v)\ntree.inorder()",
    "expectedOutput": "[1, 3, 4, 5, 7]",
    "description": "إضافة 5 عناصر"
   },
   {
    "input": "tree = BST()\nfor v in [10, 5, 15]:\n    tree.insert(v)\ntree.search(15)",
    "expectedOutput": "True",
    "description": "البحث عن قيمة موجودة"
   },
   {
    "input": "tree = BST()\nfor v in [10, 5, 15]:\n    tree.insert(v)\ntree.search(7)",
    "expectedOutput": "False",
    "description": "البحث عن قيمة غير موجودة",
    "hidden": true
   },
   {
    "input": "tree = BST()\ntree.inorder()",
    "expectedOutput": "[]",
    "description": "شجرة فارغة",
    "hidden": true
   },
   {
    "input": "tree = BST()\nfor v in [3, 2, 1]:\n    tree.insert(v)\ntree.inorder()",
    "expectedOutput": "[1, 2, 3]",
    "description": "إدخال بترتيب تنازلي",
    "hidden": true
   }
  ]
 },
 "cpp-ch-beg-1": {
  "id": "cpp-ch-beg-1",
  "language": "C++",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "#include <iostream>\nusing namespace std;\n\nint sumToN(int n) {\n    // احسب مجموع 1 + 2 + ... + n\n}\n\nint main() {\n    cout << sumToN(5) << endl;   // 15\n    cout << sumToN(10) << endl;  // 55\n    return 0;\n}",
  "testCases": [
   {
    "input": "5",
    "expectedOutput": "15",
    "description": "مجموع 1 إلى 5"
   },
   {
    "input": "10",
    "expectedOutput": "55",
    "description": "مجموع 1 إلى 10"
   },
   {
    "input": "1",
    "expectedOutput": "1",
    "description": "n = 1",
    "hidden": true
   },
   {
    "input": "100",
    "expectedOutput": "5050",
    "description": "n = 100",
    "hidden": true
   },
   {
    "input": "0",
    "expectedOutput": "0",
    "description": "n = 0",
    "hidden": true
   }
  ]
 },
 "cpp-ch-beg-2": {
  "id": "cpp-ch-beg-2",
  "language": "C++",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "#include <iostream>\nusing namespace std;\n\nint maxOfThree(int a, int b, int c) {\n    // أرجع أكبر رقم\n}\n\nint main() {\n    cout << maxOfThree(5, 9, 3) << endl;  // 9\n    return 0;\n}",
  "testCases": [
   {
    "input": "5, 9, 3",
    "expectedOutput": "9",
    "description": "أرقام مختلفة"
   },
   {
    "input": "7, 7, 7",
    "expectedOutput": "7",
    "description": "أرقام متساوية"
   },
   {
    "input": "-5, -2, -9",
    "expectedOutput": "-2",
    "description": "أعداد سالبة",
    "hidden": true
   },
   {
    "input": "10, 3, 2",
    "expectedOutput": "10",
    "description": "الأكبر أولاً",
    "hidden": true
   },
   {
    "input": "1, 2, 3",
    "expectedOutput": "3",
    "description": "الأكبر أخيراً",
    "hidden": true
   }
  ]
 },
 "cpp-ch-beg-3": {
  "id": "cpp-ch-beg-3",
  "language": "C++",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "#include <iostream>\nusing namespace std;\n\nvoid printTable(int n) {\n    // اطبع جدول الضرب لـ n\n}\n\nint main() {\n    printTable(5);\n    return 0;\n}",
  "testCases": [
   {
    "input": "5",
    "expectedOutput": "5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50",
    "description": "جدول 5"
   },
   {
    "input": "3",
    "expectedOutput": "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30",
    "description": "جدول 3"
   },
   {
    "input": "7",
    "expectedOutput": "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70",
    "description": "جدول 7",
    "hidden": true
   },
   {
    "input": "1",
    "expectedOutput": "1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10",
    "description": "جدول 1",
    "hidden": true
   }
  ]
 },
 "cpp-ch-beg-4": {
  "id": "cpp-ch-beg-4",
  "language": "C++",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "#include <iostream>\nusing namespace std;\n\nbool isPrime(int n) {\n    // أرجع true إذا كان n أولي\n}\n\nint main() {\n    cout << isPrime(7) << endl;   // 1 (true)\n    cout << isPrime(10) << endl;  // 0 (false)\n    return 0;\n}",
  "testCases": [
   {
    "input": "7",
    "expectedOutput": "1",
    "description": "7 أولي"
   },
   {
    "input": "10",
    "expectedOutput": "0",
    "description": "10 ليس أولي"
   },
   {
    "input": "1",
    "expectedOutput": "0",
    "description": "العدد 1",
    "hidden": true
   },
   {
    "input": "2",
    "expectedOutput": "1",
    "description": "العدد 2",
    "hidden": true
   },
   {
    "input": "9",
    "expectedOutput": "0",
    "description": "مربع عدد أولي",
    "hidden": true
   },
   {
    "input": "97",
    "expectedOutput": "1",
    "description": "عدد أولي كبير",
    "hidden": true
   }
  ]
 },
 "cpp-ch-beg-5": {
  "id": "cpp-ch-beg-5",
  "language": "C++",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "#include <iostream>\nusing namespace std;\n\nlong long factorial(int n) {\n    // احسب n!\n}\n\nint main() {\n    cout << factorial(5) << endl;   // 120\n    cout << factorial(0) << endl;   // 1\n    return 0;\n}",
  "testCases": [
   {
    "input": "5",
    "expectedOutput": "120",
    "description": "5!"
   },
   {
    "input": "0",
    "expectedOutput": "1",
    "description": "0!"
   },
   {
    "input": "1",
    "expectedOutput": "1",
    "description": "1!",
    "hidden": true
   },
   {
    "input": "10",
    "expectedOutput": "3628800",
    "description": "10!",
    "hidden": true
   },
   {
    "input": "20",
    "expectedOutput": "2432902008176640000",
    "description": "20! — يحتاج long long",
    "hidden": true
   }
  ]
 },
 "cpp-ch-int-1": {
  "id": "cpp-ch-int-1",
  "language": "C++",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "int binarySearch(vector<int> arr, int target) {\n    // أرجع فهرس target أو -1 إذا غير موجود\n    return -1;\n}",
  "testCases": [
   {
    "input": "vector<int>{1,3,5,7,9,11}, 7",
    "expectedOutput": "3",
    "description": "موجود"
   },
   {
    "input": "vector<int>{1,3,5,7,9,11}, 4",
    "expectedOutput": "-1",
    "description": "غير موجود"
   },
   {
    "input": "vector<int>{1,3,5,7,9,11}, 1",
    "expectedOutput": "0",
    "description": "أول عنصر",
    "hidden": true
   },
   {
    "input": "vector<int>{1,3,5,7,9,11}, 11",
    "expectedOutput": "5",
    "description": "آخر عنصر",
    "hidden": true
   },
   {
    "input": "vector<int>{}, 5",
    "expectedOutput": "-1",
    "description": "vector فارغ",
    "hidden": true
   }
  ]
 },
 "cpp-ch-int-2": {
  "id": "cpp-ch-int-2",
  "language": "C++",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "string bubbleSort(vector<int> arr) {\n    // رتب المصفوفة تصاعدياً وأرجع النتيجة كنص مفصول بمسافات\n    return \"\";\n}",
  "testCases": [
   {
    "input": "vector<int>{64,34,25,12,22}",
    "expectedOutput": "12 22 25 34 64",
    "description": "ترتيب 5 عناصر"
   },
   {
    "input": "vector<int>{5,1,4,2,8}",
    "expectedOutput": "1 2 4 5 8",
    "description": "ترتيب مصفوفة أخرى"
   },
   {
    "input": "vector<int>{-3,10,-1,7,0}",
    "expectedOutput": "-3 -1 0 7 10",
    "description": "ترتيب أرقام سالبة وموجبة"
   },
   {
    "input": "vector<int>{1,2,3}",
    "expectedOutput": "1 2 3",
    "description": "مرتبة مسبقاً",
    "hidden": true
   },
   {
    "input": "vector<int>{3,3,1}",
    "expectedOutput": "1 3 3",
    "description": "قيم مكررة",
    "hidden": true
   },
   {
    "input": "vector<int>{42}",
    "expectedOutput": "42",
    "description": "عنصر واحد",
    "hidden": true
   }
  ]
 },
 "cpp-ch-int-3": {
  "id": "cpp-ch-int-3",
  "language": "C++",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "struct Node {\n    int data;\n    Node* next;\n};\n\nclass LinkedList {\npublic:\n    Node* head;\n    \n    LinkedList() : head(nullptr) {}\n    \n    void insert(int value) {\n        // أضف في النهاية\n    }\n    \n    string print() {\n        // أرجع العناصر بشكل \"1 -> 2 -> 3 -> NULL\"\n        return \"\";\n    }\n};\n\nstring solution(vector<int> vals) {\n    LinkedList list;\n    for (int v : vals) list.insert(v);\n    return list.print();\n}",
  "testCases": [
   {
    "input": "vector<int>{1,2,3}",
    "expectedOutput": "1 -> 2 -> 3 -> NULL",
    "description": "إضافة وطباعة"
   },
   {
    "input": "vector<int>{10,20}",
    "expectedOutput": "10 -> 20 -> NULL",
    "description": "إضافة عنصرين"
   },
   {
    "input": "vector<int>{7}",
    "expectedOutput": "7 -> NULL",
    "description": "عنصر واحد",
    "hidden": true
   },
   {
    "input": "vector<int>{}",
    "expectedOutput": "NULL",
    "description": "قائمة فارغة",
    "hidden": true
   }
  ]
 },
 "cpp-ch-int-4": {
  "id": "cpp-ch-int-4",
  "language": "C++",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "class Stack {\nprivate:\n    int arr[100];\n    int topIndex;\npublic:\n    Stack() : topIndex(-1) {}\n    \n    void push(int value) { }\n    int pop() { return -1; }\n    int top() { return -1; }\n    bool isEmpty() { return true; }\n};\n\nint solution(vector<int> vals) {\n    Stack s;\n    for (int v : vals) s.push(v);\n    return s.pop();\n}",
  "testCases": [
   {
    "input": "vector<int>{1,2,3}",
    "expectedOutput": "3",
    "description": "LIFO"
   },
   {
    "input": "vector<int>{5,10}",
    "expectedOutput": "10",
    "description": "عنصر القمة"
   },
   {
    "input": "vector<int>{42}",
    "expectedOutput": "42",
    "description": "عنصر واحد",
    "hidden": true
   },
   {
    "input": "vector<int>{}",
    "expectedOutput": "-1",
    "description": "pop من Stack فارغ",
    "hidden": true
   }
  ]
 },
 "cpp-ch-int-5": {
  "id": "cpp-ch-int-5",
  "language": "C++",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "class Queue {\nprivate:\n    int arr[100];\n    int front, rear, size;\npublic:\n    Queue() : front(0), rear(-1), size(0) {}\n    \n    void enqueue(int value) { }\n    int dequeue() { return -1; }\n    bool isEmpty() { return true; }\n};\n\nint solution(vector<int> vals) {\n    Queue q;\n    for (int v : vals) q.enqueue(v);\n    return q.dequeue();\n}",
  "testCases": [
   {
    "input": "vector<int>{1,2,3}",
    "expectedOutput": "1",
    "description": "FIFO"
   },
   {
    "input": "vector<int>{7,8}",
    "expectedOutput": "7",
    "description": "أول عنصر"
   },
   {
    "input": "vector<int>{9}",
    "expectedOutput": "9",
    "description": "عنصر واحد",
    "hidden": true
   },
   {
    "input": "vector<int>{}",
    "expectedOutput": "-1",
    "description": "dequeue من Queue فارغة",
    "hidden": true
   }
  ]
 },
 "cpp-ch-1": {
  "id": "cpp-ch-1",
  "language": "C++",
  "difficulty": "easy",
  "points": 30,
  "starterCode": "string reverseArray(vector<int> arr) {\n    // اعكس المصفوفة وأرجع النتيجة كنص مفصول بمسافات\n    return \"\";\n}",
  "testCases": [
   {
    "input": "vector<int>{1,2,3,4,5}",
    "expectedOutput": "5 4 3 2 1",
    "description": "مصفوفة عادية"
   },
   {
    "input": "vector<int>{1}",
    "expectedOutput": "1",
    "description": "عنصر واحد"
   },
   {
    "input": "vector<int>{1,2}",
    "expectedOutput": "2 1",
    "description": "عنصران",
    "hidden": true
   },
   {
    "input": "vector<int>{}",
    "expectedOutput": "",
    "description": "vector فارغ",
    "hidden": true
   }
  ]
 },
 "cpp-ch-2": {
  "id": "cpp-ch-2",
  "language": "C++",
  "difficulty": "medium",
  "points": 50,
  "starterCode": "#include <iostream>\n#include <string>\nusing namespace std;\n\nbool isPalindrome(string text) {\n    // اكتب الحل هنا\n}\n\nint main() {\n    cout << isPalindrome(\"radar\") << endl;     // 1\n    cout << isPalindrome(\"hello\") << endl;     // 0\n    cout << isPalindrome(\"A man a plan a canal Panama\") << endl;  // 1\n    return 0;\n}",
  "testCases": [
   {
    "input": "\"radar\"",
    "expectedOutput": "1",
    "description": "كلمة palindrome"
   },
   {
    "input": "\"hello\"",
    "expectedOutput": "0",
    "description": "ليس palindrome"
   },
   {
    "input": "\"Was it a car or a cat I saw\"",
    "expectedOutput": "1",
    "description": "جملة متماثلة"
   },
   {
    "input": "\"\"",
    "expectedOutput": "1",
    "description": "نص فارغ",
    "hidden": true
   },
   {
    "input": "\"ab\"",
    "expectedOutput": "0",
    "description": "حرفان مختلفان",
    "hidden": true
   },
   {
    "input": "\"No lemon, no melon\"",
    "expectedOutput": "1",
    "description": "جملة مع فاصلة",
    "hidden": true
   }
  ]
 },
 "cpp-ch-3": {
  "id": "cpp-ch-3",
  "language": "C++",
  "difficulty": "medium",
  "points": 50,
  "starterCode": "#include <iostream>\nusing namespace std;\n\n// الحل التكراري (أفضل)\nlong long fibonacci(int n) {\n    // اكتب الحل هنا\n}\n\nint main() {\n    cout << fibonacci(10) << endl;  // 55\n    cout << fibonacci(20) << endl;  // 6765\n    return 0;\n}",
  "testCases": [
   {
    "input": "10",
    "expectedOutput": "55",
    "description": "العدد العاشر"
   },
   {
    "input": "20",
    "expectedOutput": "6765",
    "description": "العدد العشرين"
   },
   {
    "input": "0",
    "expectedOutput": "0",
    "description": "F(0)",
    "hidden": true
   },
   {
    "input": "1",
    "expectedOutput": "1",
    "description": "F(1)",
    "hidden": true
   },
   {
    "input": "2",
    "expectedOutput": "1",
    "description": "F(2)",
    "hidden": true
   },
   {
    "input": "50",
    "expectedOutput": "12586269025",
    "description": "F(50) — يحتاج long long وحلاً سريعاً",
    "hidden": true
   }
  ]
 },
 "cyber-ch-1": {
  "id": "cyber-ch-1",
  "language": "Python",
  "difficulty": "easy",
  "points": 30,
  "starterCode": "def caesar_decrypt(ciphertext, shift):\n    \"\"\"\n    فك تشفير قيصر\n    \"\"\"\n    # اكتب الحل هنا\n    pass\n\n# اختبار\n# النص المشفر بإزاحة 3\nencrypted = \"KHOOR ZRUOG\"\nprint(caesar_decrypt(encrypted, 3))  # HELLO WORLD",
  "testCases": [
   {
    "input": "\"KHOOR ZRUOG\", 3",
    "expectedOutput": "\"HELLO WORLD\"",
    "description": "نص بسيط"
   },
   {
    "input": "\"ABC\", 1",
    "expectedOutput": "\"ZAB\"",
    "description": "التفاف"
   },
   {
    "input": "\"Wklv lv d whvw!\", 3",
    "expectedOutput": "This is a test!",
    "description": "جملة مع علامات ترقيم",
    "hidden": true
   },
   {
    "input": "\"abc\", 0",
    "expectedOutput": "abc",
    "description": "إزاحة صفر",
    "hidden": true
   },
   {
    "input": "\"bcd\", 27",
    "expectedOutput": "abc",
    "description": "إزاحة أكبر من 26",
    "hidden": true
   }
  ]
 },
 "cyber-ch-2": {
  "id": "cyber-ch-2",
  "language": "Python",
  "difficulty": "medium",
  "points": 50,
  "starterCode": "import re\n\ndef detect_sqli(input_string):\n    \"\"\"\n    اكتشاف محاولات SQL Injection\n    أرجع True إذا كان مشبوهاً\n    \"\"\"\n    # اكتب الحل هنا\n    pass\n\n# اختبار\nprint(detect_sqli(\"admin\"))              # False\nprint(detect_sqli(\"' OR 1=1 --\"))       # True\nprint(detect_sqli(\"1; DROP TABLE\"))     # True",
  "testCases": [
   {
    "input": "\"normal text\"",
    "expectedOutput": "False",
    "description": "نص عادي"
   },
   {
    "input": "\"' OR '1'='1\"",
    "expectedOutput": "True",
    "description": "Classic SQLi"
   },
   {
    "input": "\"hello; world\"",
    "expectedOutput": "False",
    "description": "فاصلة منقوطة عادية بدون SQL"
   },
   {
    "input": "\"1; DROP TABLE users\"",
    "expectedOutput": "True",
    "description": "SQL Injection مع DROP"
   },
   {
    "input": "\"admin'--\"",
    "expectedOutput": "True",
    "description": "تعليق SQL بعد اسم المستخدم",
    "hidden": true
   },
   {
    "input": "\"john.doe@mail.com\"",
    "expectedOutput": "False",
    "description": "بريد إلكتروني عادي",
    "hidden": true
   },
   {
    "input": "\"UNION SELECT password FROM users\"",
    "expectedOutput": "True",
    "description": "UNION SELECT",
    "hidden": true
   }
  ]
 },
 "cyber-ch-3": {
  "id": "cyber-ch-3",
  "language": "Python",
  "difficulty": "medium",
  "points": 50,
  "starterCode": "def analyze_password(password):\n    \"\"\"\n    تحليل قوة كلمة المرور\n    أرجع: {\"score\": 0-100, \"strength\": \"weak/medium/strong\", \"tips\": [...]}\n    \"\"\"\n    # اكتب الحل هنا\n    pass\n\n# اختبار\nprint(analyze_password(\"hello\"))\nprint(analyze_password(\"MyP@ssw0rd!2024\"))",
  "testCases": [
   {
    "input": "analyze_password(\"123\")[\"strength\"]",
    "expectedOutput": "weak",
    "description": "كلمة ضعيفة"
   },
   {
    "input": "analyze_password(\"MyP@ss123!\")[\"strength\"]",
    "expectedOutput": "strong",
    "description": "كلمة قوية"
   },
   {
    "input": "analyze_password(\"\")[\"strength\"]",
    "expectedOutput": "weak",
    "description": "كلمة فارغة",
    "hidden": true
   },
   {
    "input": "len(analyze_password(\"abc\")[\"tips\"]) > 0",
    "expectedOutput": "True",
    "description": "نصائح لكلمة ضعيفة",
    "hidden": true
   }
  ]
 },
 "js-ch-beg-1": {
  "id": "js-ch-beg-1",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "function calculator(a, b, operator) {\n  // العمليات: '+', '-', '*', '/'\n  // أرجع النتيجة\n}\n\nconsole.log(calculator(10, 5, '+')); // 15",
  "testCases": [
   {
    "input": "10, 5, \"+\"",
    "expectedOutput": "15",
    "description": "جمع"
   },
   {
    "input": "10, 5, \"-\"",
    "expectedOutput": "5",
    "description": "طرح"
   },
   {
    "input": "10, 5, \"*\"",
    "expectedOutput": "50",
    "description": "ضرب"
   },
   {
    "input": "10, 5, \"/\"",
    "expectedOutput": "2",
    "description": "قسمة"
   },
   {
    "input": "7, 2, \"/\"",
    "expectedOutput": "3.5",
    "description": "قسمة عشرية",
    "hidden": true
   },
   {
    "input": "1, 0, \"/\"",
    "expectedOutput": "Error",
    "description": "قسمة على صفر",
    "hidden": true
   },
   {
    "input": "1, 1, \"^\"",
    "expectedOutput": "Invalid operator",
    "description": "عملية غير مدعومة",
    "hidden": true
   }
  ]
 },
 "js-ch-beg-2": {
  "id": "js-ch-beg-2",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "function findMax(arr) {\n  // أرجع أكبر عدد في المصفوفة\n}\n\nconsole.log(findMax([1, 5, 3, 9, 2])); // 9",
  "testCases": [
   {
    "input": "[1, 5, 3, 9, 2]",
    "expectedOutput": "9",
    "description": "أرقام موجبة"
   },
   {
    "input": "[-5, -2, -8]",
    "expectedOutput": "-2",
    "description": "أرقام سالبة"
   },
   {
    "input": "[7]",
    "expectedOutput": "7",
    "description": "عنصر واحد",
    "hidden": true
   },
   {
    "input": "[]",
    "expectedOutput": "undefined",
    "description": "مصفوفة فارغة",
    "hidden": true
   },
   {
    "input": "[0, -1, 0]",
    "expectedOutput": "0",
    "description": "أصفار",
    "hidden": true
   }
  ]
 },
 "js-ch-beg-3": {
  "id": "js-ch-beg-3",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "function countChar(str, char) {\n  // أرجع عدد مرات ظهور char في str\n}\n\nconsole.log(countChar(\"hello\", \"l\")); // 2",
  "testCases": [
   {
    "input": "\"hello\", \"l\"",
    "expectedOutput": "2",
    "description": "حرف متكرر"
   },
   {
    "input": "\"hello\", \"z\"",
    "expectedOutput": "0",
    "description": "حرف غير موجود"
   },
   {
    "input": "\"banana\", \"a\"",
    "expectedOutput": "3",
    "description": "تكرار متعدد",
    "hidden": true
   },
   {
    "input": "\"\", \"a\"",
    "expectedOutput": "0",
    "description": "نص فارغ",
    "hidden": true
   },
   {
    "input": "\"Aa\", \"a\"",
    "expectedOutput": "1",
    "description": "حساسية الحالة",
    "hidden": true
   }
  ]
 },
 "js-ch-beg-4": {
  "id": "js-ch-beg-4",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 10,
  "starterCode": "function celsiusToFahrenheit(celsius) {\n  // C to F: (C × 9/5) + 32\n}\n\nfunction fahrenheitToCelsius(fahrenheit) {\n  // F to C: (F - 32) × 5/9\n}",
  "testCases": [
   {
    "input": "celsiusToFahrenheit(0)",
    "expectedOutput": "32",
    "description": "تجمد الماء"
   },
   {
    "input": "celsiusToFahrenheit(100)",
    "expectedOutput": "212",
    "description": "غليان الماء"
   },
   {
    "input": "fahrenheitToCelsius(32)",
    "expectedOutput": "0",
    "description": "فهرنهايت إلى سلسيوس"
   },
   {
    "input": "celsiusToFahrenheit(-40)",
    "expectedOutput": "-40",
    "description": "نقطة التساوي",
    "hidden": true
   },
   {
    "input": "fahrenheitToCelsius(212)",
    "expectedOutput": "100",
    "description": "درجة الغليان",
    "hidden": true
   },
   {
    "input": "celsiusToFahrenheit(37)",
    "expectedOutput": "98.6",
    "description": "حرارة الجسم",
    "hidden": true
   }
  ]
 },
 "js-ch-beg-5": {
  "id": "js-ch-beg-5",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 10,
  "starterCode": "function isAdult(age) {\n  // أرجع true إذا كان العمر 18 أو أكبر\n}\n\nfunction canVote(age, country) {\n  // السن القانوني للتصويت:\n  // \"USA\": 18, \"Brazil\": 16, \"Austria\": 16\n}",
  "testCases": [
   {
    "input": "isAdult(20)",
    "expectedOutput": "true",
    "description": "بالغ"
   },
   {
    "input": "isAdult(15)",
    "expectedOutput": "false",
    "description": "قاصر"
   },
   {
    "input": "canVote(18, \"USA\")",
    "expectedOutput": "true",
    "description": "تصويت في أمريكا"
   },
   {
    "input": "canVote(16, \"Brazil\")",
    "expectedOutput": "true",
    "description": "تصويت في البرازيل"
   },
   {
    "input": "isAdult(18)",
    "expectedOutput": "true",
    "description": "بالضبط 18",
    "hidden": true
   },
   {
    "input": "canVote(15, \"Brazil\")",
    "expectedOutput": "false",
    "description": "أقل من 16 في البرازيل",
    "hidden": true
   },
   {
    "input": "canVote(17, \"Iraq\")",
    "expectedOutput": "false",
    "description": "دولة أخرى (18)",
    "hidden": true
   }
  ]
 },
 "js-ch-int-1": {
  "id": "js-ch-int-1",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 25,
  "starterCode": "function removeDuplicates(arr) {\n  // أرجع مصفوفة بدون تكرارات\n}\n\nconsole.log(removeDuplicates([1, 2, 2, 3, 3, 3])); // [1, 2, 3]",
  "testCases": [
   {
    "input": "[1, 2, 2, 3]",
    "expectedOutput": "[1, 2, 3]",
    "description": "أرقام مكررة"
   },
   {
    "input": "[\"a\", \"b\", \"a\"]",
    "expectedOutput": "[\"a\", \"b\"]",
    "description": "نصوص مكررة"
   },
   {
    "input": "[]",
    "expectedOutput": "[]",
    "description": "مصفوفة فارغة",
    "hidden": true
   },
   {
    "input": "[1, \"1\", 1]",
    "expectedOutput": "[1, \"1\"]",
    "description": "رقم ونص مختلفان",
    "hidden": true
   }
  ]
 },
 "js-ch-int-2": {
  "id": "js-ch-int-2",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "function flatten(arr) {\n  // سطّح المصفوفة بأي عمق\n}\n\nconsole.log(flatten([1, [2, [3, [4]]]])); // [1, 2, 3, 4]",
  "testCases": [
   {
    "input": "[1, [2, 3]]",
    "expectedOutput": "[1, 2, 3]",
    "description": "مستوى واحد"
   },
   {
    "input": "[1, [2, [3]]]",
    "expectedOutput": "[1, 2, 3]",
    "description": "مستويات متعددة"
   },
   {
    "input": "[]",
    "expectedOutput": "[]",
    "description": "مصفوفة فارغة",
    "hidden": true
   },
   {
    "input": "[[[[1]]], 2]",
    "expectedOutput": "[1, 2]",
    "description": "تداخل عميق",
    "hidden": true
   }
  ]
 },
 "js-ch-int-3": {
  "id": "js-ch-int-3",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "function groupBy(arr, key) {\n  // جمّع العناصر حسب قيمة key\n}\n\nconst people = [\n  { name: 'Ali', age: 25 },\n  { name: 'Sara', age: 25 },\n  { name: 'Omar', age: 30 }\n];\nconsole.log(groupBy(people, 'age'));\n// { 25: [{...}, {...}], 30: [{...}] }",
  "testCases": [
   {
    "input": "[{name: \"Ali\", age: 25}, {name: \"Sara\", age: 30}], \"age\"",
    "expectedOutput": "{\"25\": [{\"name\": \"Ali\", \"age\": 25}], \"30\": [{\"name\": \"Sara\", \"age\": 30}]}",
    "description": "تجميع حسب العمر"
   },
   {
    "input": "[{name: \"Ali\", city: \"Baghdad\"}, {name: \"Sara\", city: \"Baghdad\"}], \"city\"",
    "expectedOutput": "{\"Baghdad\": [{\"name\": \"Ali\", \"city\": \"Baghdad\"}, {\"name\": \"Sara\", \"city\": \"Baghdad\"}]}",
    "description": "تجميع مدينة واحدة"
   },
   {
    "input": "[], \"x\"",
    "expectedOutput": "{}",
    "description": "مصفوفة فارغة",
    "hidden": true
   }
  ]
 },
 "js-ch-int-4": {
  "id": "js-ch-int-4",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "function throttle(func, limit) {\n  // نفذ الدالة مرة واحدة كل limit مللي ثانية\n}\n\nconst log = throttle(() => console.log('Hello'), 1000);",
  "testCases": [
   {
    "input": "const calls = []; const f = throttle((x) => calls.push(x), 100); f(1); f(2); f(3); calls",
    "expectedOutput": "[1]",
    "description": "ثلاث استدعاءات متتالية تنفّذ الأول فقط"
   },
   {
    "input": "const calls = []; const f = throttle((x) => calls.push(x), 50); f(1); await new Promise((r) => setTimeout(r, 90)); f(2); calls",
    "expectedOutput": "[1, 2]",
    "description": "بعد انتهاء المدة يُقبل استدعاء جديد"
   },
   {
    "input": "let n = 0; const f = throttle(() => n++, 80); f(); f(); await new Promise((r) => setTimeout(r, 20)); f(); n",
    "expectedOutput": "1",
    "description": "استدعاء داخل المدة يُتجاهل",
    "hidden": true
   }
  ]
 },
 "js-ch-int-5": {
  "id": "js-ch-int-5",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "function deepClone(obj) {\n  // انسخ الكائن بكل مستوياته\n}\n\nconst original = { a: 1, b: { c: 2 } };\nconst copy = deepClone(original);",
  "testCases": [
   {
    "input": "deepClone({\"a\": {\"b\": 1}})",
    "expectedOutput": "{\"a\": {\"b\": 1}}",
    "description": "نسخ كائن متداخل"
   },
   {
    "input": "const o = {a: {b: 1}, list: [1, [2]]}; const c = deepClone(o); c.a.b = 99; c.list[1][0] = 5; o.a.b + \",\" + o.list[1][0]",
    "expectedOutput": "1,2",
    "description": "تعديل النسخة لا يغيّر الأصل"
   },
   {
    "input": "const o = {x: [1, 2]}; const c = deepClone(o); c !== o && c.x !== o.x",
    "expectedOutput": "true",
    "description": "النسخة كائنات جديدة"
   },
   {
    "input": "deepClone(null)",
    "expectedOutput": "null",
    "description": "قيمة null",
    "hidden": true
   },
   {
    "input": "deepClone([1, {\"a\": [2]}])",
    "expectedOutput": "[1, {\"a\": [2]}]",
    "description": "مصفوفة فيها كائنات",
    "hidden": true
   }
  ]
 },
 "js-challenge-1": {
  "id": "js-challenge-1",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "function reverseString(str) {\n  // اكتب الحل هنا\n  \n}\n\n// اختبر الدالة\nconsole.log(reverseString(\"مرحباً\")); // ًابحرم\nconsole.log(reverseString(\"hello\")); // olleh",
  "testCases": [
   {
    "input": "\"hello\"",
    "expectedOutput": "\"olleh\"",
    "description": "نص إنجليزي"
   },
   {
    "input": "\"مرحباً\"",
    "expectedOutput": "\"ًابحرم\"",
    "description": "نص عربي"
   },
   {
    "input": "\"\"",
    "expectedOutput": "\"\"",
    "description": "نص فارغ"
   },
   {
    "input": "\"a\"",
    "expectedOutput": "a",
    "description": "حرف واحد",
    "hidden": true
   },
   {
    "input": "\"ab c\"",
    "expectedOutput": "c ba",
    "description": "مع مسافة",
    "hidden": true
   }
  ]
 },
 "js-challenge-2": {
  "id": "js-challenge-2",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "function fizzBuzz(n) {\n  const result = [];\n  // اكتب الحل هنا\n  \n  return result;\n}\n\nconsole.log(fizzBuzz(15));",
  "testCases": [
   {
    "input": "5",
    "expectedOutput": "[1, 2, \"Fizz\", 4, \"Buzz\"]",
    "description": "أول 5 أرقام"
   },
   {
    "input": "15",
    "expectedOutput": "[1,2,\"Fizz\",4,\"Buzz\",\"Fizz\",7,8,\"Fizz\",\"Buzz\",11,\"Fizz\",13,14,\"FizzBuzz\"]",
    "description": "يشمل 15"
   },
   {
    "input": "1",
    "expectedOutput": "[1]",
    "description": "n = 1",
    "hidden": true
   },
   {
    "input": "0",
    "expectedOutput": "[]",
    "description": "n = 0",
    "hidden": true
   }
  ]
 },
 "js-challenge-3": {
  "id": "js-challenge-3",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "function isPalindrome(str) {\n  // اكتب الحل هنا\n  \n}\n\nconsole.log(isPalindrome(\"A man a plan a canal Panama\")); // true\nconsole.log(isPalindrome(\"hello\")); // false",
  "testCases": [
   {
    "input": "\"racecar\"",
    "expectedOutput": "true",
    "description": "كلمة متماثلة"
   },
   {
    "input": "\"hello\"",
    "expectedOutput": "false",
    "description": "كلمة غير متماثلة"
   },
   {
    "input": "\"A man a plan a canal Panama\"",
    "expectedOutput": "true",
    "description": "جملة متماثلة مع مسافات"
   },
   {
    "input": "\"\"",
    "expectedOutput": "true",
    "description": "نص فارغ",
    "hidden": true
   },
   {
    "input": "\"No 'x' in Nixon\"",
    "expectedOutput": "true",
    "description": "علامات ترقيم",
    "hidden": true
   },
   {
    "input": "\"ab\"",
    "expectedOutput": "false",
    "description": "حرفان مختلفان",
    "hidden": true
   }
  ]
 },
 "js-challenge-4": {
  "id": "js-challenge-4",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "function twoSum(nums, target) {\n  // اكتب الحل هنا\n  \n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]\nconsole.log(twoSum([3, 2, 4], 6)); // [1, 2]",
  "testCases": [
   {
    "input": "[2, 7, 11, 15], 9",
    "expectedOutput": "[0, 1]",
    "description": "2 + 7 = 9"
   },
   {
    "input": "[3, 3], 6",
    "expectedOutput": "[0, 1]",
    "description": "أرقام متشابهة"
   },
   {
    "input": "[1, 5, 3, 7], 10",
    "expectedOutput": "[2, 3]",
    "description": "الزوج في النهاية",
    "hidden": true
   },
   {
    "input": "[0, 4, 3, 0], 0",
    "expectedOutput": "[0, 3]",
    "description": "أصفار",
    "hidden": true
   },
   {
    "input": "[1, 2], 7",
    "expectedOutput": "[]",
    "description": "لا يوجد حل",
    "hidden": true
   }
  ]
 },
 "js-challenge-5": {
  "id": "js-challenge-5",
  "language": "JavaScript",
  "difficulty": "hard",
  "points": 50,
  "starterCode": "function debounce(func, delay) {\n  // اكتب الحل هنا\n  \n}\n\n// مثال الاستخدام:\nconst search = debounce((query) => {\n  console.log(\"Searching:\", query);\n}, 300);\n\nsearch(\"a\");\nsearch(\"ab\");\nsearch(\"abc\"); // فقط هذه تُنفذ بعد 300ms",
  "testCases": [
   {
    "input": "const calls = []; const d = debounce((x) => calls.push(x), 50); d(1); d(2); d(3); await new Promise((r) => setTimeout(r, 150)); calls",
    "expectedOutput": "[3]",
    "description": "استدعاءات متتالية تنفّذ الأخير فقط"
   },
   {
    "input": "const calls = []; const d = debounce((x) => calls.push(x), 30); d(1); await new Promise((r) => setTimeout(r, 90)); d(2); await new Promise((r) => setTimeout(r, 90)); calls",
    "expectedOutput": "[1, 2]",
    "description": "استدعاءات متباعدة تُنفذ كلها"
   },
   {
    "input": "const calls = []; const d = debounce(() => calls.push(1), 50); d(); calls.length",
    "expectedOutput": "0",
    "description": "لا يُنفذ فوراً",
    "hidden": true
   }
  ]
 },
 "react-ch-beg-1": {
  "id": "react-ch-beg-1",
  "language": "React",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "function ProfileCard({ name, title, avatar }) {\n  // أنشئ بطاقة تعريفية\n  return (\n    <div className=\"card\">\n      {/* أضف الصورة والاسم والعنوان */}\n    </div>\n  );\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "<img[^>]*src=\\{\\s*avatar\\s*\\}",
    "message": "اعرض الصورة بـ <img src={avatar}>"
   },
   {
    "pattern": "<img[^>]*alt=",
    "message": "أضف نصاً بديلاً alt للصورة"
   },
   {
    "pattern": "\\{\\s*name\\s*\\}",
    "message": "اعرض الاسم {name}"
   },
   {
    "pattern": "\\{\\s*title\\s*\\}",
    "message": "اعرض المسمى {title}"
   }
  ],
  "validation": "structural"
 },
 "react-ch-beg-2": {
  "id": "react-ch-beg-2",
  "language": "React",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "function ColorButton() {\n  // استخدم useState للون\n  \n  return (\n    <button>\n      اضغطني!\n    </button>\n  );\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "useState\\s*\\(",
    "message": "استخدم useState لتخزين اللون"
   },
   {
    "pattern": "onClick\\s*=\\s*\\{",
    "message": "أضف onClick للزر"
   },
   {
    "pattern": "\\bset[A-Z]\\w*\\s*\\(",
    "message": "حدّث اللون باستدعاء دالة set..."
   },
   {
    "pattern": "(backgroundColor|background)\\s*:",
    "message": "طبّق اللون على backgroundColor في style"
   }
  ],
  "validation": "structural"
 },
 "react-ch-beg-3": {
  "id": "react-ch-beg-3",
  "language": "React",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "function ToggleText() {\n  // استخدم useState للحالة\n  \n  return (\n    <div>\n      <button>إظهار/إخفاء</button>\n      {/* النص المخفي */}\n    </div>\n  );\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "useState\\s*\\(\\s*(false|true)\\s*\\)",
    "message": "استخدم useState بقيمة منطقية (false أو true)"
   },
   {
    "pattern": "onClick\\s*=\\s*\\{",
    "message": "أضف onClick للزر"
   },
   {
    "pattern": "set\\w+\\s*\\(\\s*(!\\s*\\w+|\\(?\\s*\\w+\\s*\\)?\\s*=>\\s*!\\s*\\w+)",
    "message": "اعكس الحالة عند الضغط (مثلاً setShow(!show))"
   },
   {
    "pattern": "\\{\\s*!?\\w+\\s*&&|\\?\\s*\\(?\\s*<",
    "message": "اعرض النص شرطياً باستخدام && أو ?:"
   }
  ],
  "validation": "structural"
 },
 "react-ch-beg-4": {
  "id": "react-ch-beg-4",
  "language": "React",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "function FruitList() {\n  const fruits = ['تفاح', 'برتقال', 'موز', 'عنب'];\n  \n  return (\n    <ul>\n      {/* استخدم map لعرض القائمة */}\n    </ul>\n  );\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "fruits\\s*\\.\\s*map\\s*\\(",
    "message": "استخدم fruits.map()"
   },
   {
    "pattern": "<li[^>]*\\bkey\\s*=",
    "message": "أضف key لكل <li>"
   },
   {
    "pattern": "<li",
    "message": "اعرض كل فاكهة داخل <li>"
   }
  ],
  "validation": "structural"
 },
 "react-ch-beg-5": {
  "id": "react-ch-beg-5",
  "language": "React",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "function ControlledInput() {\n  // أضف state للقيمة\n  \n  return (\n    <div>\n      <input />\n      <p>كتبت: </p>\n    </div>\n  );\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "useState\\s*\\(",
    "message": "أضف state لقيمة الحقل"
   },
   {
    "pattern": "<input[^>]*value\\s*=\\s*\\{",
    "message": "اربط value بالـ state"
   },
   {
    "pattern": "onChange\\s*=\\s*\\{",
    "message": "حدّث القيمة في onChange"
   },
   {
    "pattern": "(e|event|evt)\\s*\\.\\s*target\\s*\\.\\s*value",
    "message": "اقرأ القيمة من e.target.value"
   },
   {
    "pattern": "كتبت:\\s*\\{\\s*\\w+",
    "message": "اعرض القيمة بعد \"كتبت:\""
   }
  ],
  "validation": "structural"
 },
 "react-ch-int-1": {
  "id": "react-ch-int-1",
  "language": "React",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "function FilterableList() {\n  const items = ['React', 'Angular', 'Vue', 'Svelte', 'Next.js'];\n  \n  return (\n    <div>\n      <input placeholder=\"ابحث...\" />\n      <ul>\n        {/* القائمة المفلترة */}\n      </ul>\n    </div>\n  );\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "useState\\s*\\(",
    "message": "خزّن نص البحث في useState"
   },
   {
    "pattern": "onChange\\s*=\\s*\\{|onInput\\s*=\\s*\\{",
    "message": "حدّث نص البحث أثناء الكتابة (onChange)"
   },
   {
    "pattern": "\\.filter\\s*\\(",
    "message": "فلتر العناصر بـ filter()"
   },
   {
    "pattern": "to(Locale)?(Lower|Upper)Case\\s*\\(|RegExp\\s*\\([^)]*,\\s*['\"][a-z]*i|\\/[gmsuy]*i[gmsuy]*\\s*\\.test\\s*\\(|localeCompare",
    "message": "قارن بدون حساسية لحالة الأحرف"
   },
   {
    "pattern": "\\.map\\s*\\(",
    "message": "اعرض النتائج بـ map()"
   }
  ],
  "validation": "structural"
 },
 "react-ch-int-2": {
  "id": "react-ch-int-2",
  "language": "React",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "function SignupForm() {\n  // State للنموذج والأخطاء\n  \n  const handleSubmit = (e) => {\n    e.preventDefault();\n    // التحقق\n  };\n  \n  return (\n    <form onSubmit={handleSubmit}>\n      {/* الحقول */}\n    </form>\n  );\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "useState\\s*\\(|useReducer\\s*\\(",
    "message": "خزّن بيانات النموذج والأخطاء في state"
   },
   {
    "pattern": "type\\s*=\\s*[\"']email[\"']",
    "message": "أضف حقل type=\"email\""
   },
   {
    "pattern": "type\\s*=\\s*[\"']password[\"']",
    "message": "أضف حقل type=\"password\""
   },
   {
    "pattern": "(includes|indexOf|split|search)\\s*\\(\\s*[\"']@[\"']|\\.test\\s*\\(|\\.match\\s*\\(",
    "message": "تحقق من وجود @ في البريد"
   },
   {
    "pattern": "\\.length\\s*(<\\s*6|<=\\s*5|>=\\s*6|>\\s*5)",
    "message": "تحقق أن كلمة المرور 6 أحرف على الأقل"
   },
   {
    "pattern": "\\{\\s*[\\w.]*[eE]rrors?\\b[\\w.]*\\s*(&&|\\?|\\})",
    "message": "اعرض رسائل الأخطاء تحت الحقول"
   }
  ],
  "validation": "structural"
 },
 "react-ch-int-3": {
  "id": "react-ch-int-3",
  "language": "React",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "function Countdown() {\n  // State للوقت\n  // useEffect للعد\n  \n  return (\n    <div>\n      <h1>الوقت: </h1>\n      <button>بدء/إيقاف</button>\n      <button>إعادة</button>\n    </div>\n  );\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "useState\\s*\\(",
    "message": "خزّن الوقت في useState"
   },
   {
    "pattern": "useEffect\\s*\\(",
    "message": "استخدم useEffect للعد"
   },
   {
    "pattern": "setInterval\\s*\\(",
    "message": "استخدم setInterval"
   },
   {
    "pattern": "clearInterval\\s*\\(",
    "message": "نظّف المؤقت بـ clearInterval"
   },
   {
    "pattern": "onClick\\s*=\\s*\\{",
    "message": "أضف أزرار التحكم",
    "min": 2
   }
  ],
  "validation": "structural"
 },
 "react-ch-int-4": {
  "id": "react-ch-int-4",
  "language": "React",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "function Modal({ isOpen, onClose, title, children }) {\n  // أنشئ Modal\n  \n  return null;\n}\n\nfunction App() {\n  const [showModal, setShowModal] = useState(false);\n  \n  return (\n    <div>\n      <button onClick={() => setShowModal(true)}>فتح</button>\n      <Modal \n        isOpen={showModal} \n        onClose={() => setShowModal(false)}\n        title=\"عنوان\"\n      >\n        <p>محتوى</p>\n      </Modal>\n    </div>\n  );\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "if\\s*\\(\\s*!\\s*isOpen\\s*\\)\\s*return\\s+null|isOpen\\s*&&|isOpen\\s*\\?",
    "message": "لا تعرض شيئاً عندما يكون isOpen = false"
   },
   {
    "pattern": "\\{\\s*title\\s*\\}",
    "message": "اعرض العنوان {title}"
   },
   {
    "pattern": "\\{\\s*children\\s*\\}",
    "message": "اعرض المحتوى {children}"
   },
   {
    "pattern": "onClick\\s*=\\s*\\{\\s*onClose\\s*\\}",
    "message": "أغلق النافذة بـ onClose"
   },
   {
    "pattern": "stopPropagation\\s*\\(",
    "message": "امنع الإغلاق عند النقر داخل النافذة (stopPropagation)"
   }
  ],
  "validation": "structural"
 },
 "react-ch-int-5": {
  "id": "react-ch-int-5",
  "language": "React",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "const ThemeContext = createContext();\n\nfunction ThemeProvider({ children }) {\n  // أنشئ context للثيم\n}\n\nfunction ThemeToggle() {\n  // زر التبديل\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "useState\\s*\\(",
    "message": "خزّن حالة الثيم في useState"
   },
   {
    "pattern": "ThemeContext\\s*\\.\\s*Provider",
    "message": "وفّر القيمة عبر ThemeContext.Provider"
   },
   {
    "pattern": "useContext\\s*\\(\\s*ThemeContext\\s*\\)",
    "message": "اقرأ الثيم بـ useContext(ThemeContext)"
   },
   {
    "pattern": "onClick\\s*=\\s*\\{",
    "message": "بدّل الثيم عند الضغط"
   },
   {
    "pattern": "\\{\\s*children\\s*\\}",
    "message": "اعرض children داخل الـ Provider"
   }
  ],
  "validation": "structural"
 },
 "react-challenge-1": {
  "id": "react-challenge-1",
  "language": "React",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "function Counter() {\n  // أضف useState هنا\n  \n  return (\n    <div>\n      <h1>العداد: {/* القيمة */}</h1>\n      <button>-</button>\n      <button>0</button>\n      <button>+</button>\n    </div>\n  );\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "useState\\s*\\(\\s*0\\s*\\)",
    "message": "ابدأ العداد بـ useState(0)"
   },
   {
    "pattern": "العداد:\\s*\\{\\s*\\w+\\s*\\}",
    "message": "اعرض القيمة بعد \"العداد:\""
   },
   {
    "pattern": "onClick\\s*=\\s*\\{",
    "message": "أضف onClick للأزرار الثلاثة",
    "min": 3
   },
   {
    "pattern": "\\+\\s*1",
    "message": "زر + يزيد بمقدار 1"
   },
   {
    "pattern": "-\\s*1",
    "message": "زر - ينقص بمقدار 1"
   },
   {
    "pattern": "set\\w+\\s*\\(\\s*0\\s*\\)",
    "message": "زر 0 يصفّر العداد"
   }
  ],
  "validation": "structural"
 },
 "react-challenge-2": {
  "id": "react-challenge-2",
  "language": "React",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "function TodoList() {\n  // State للمهام والإدخال\n  \n  return (\n    <div>\n      <input placeholder=\"مهمة جديدة...\" />\n      <button>إضافة</button>\n      \n      <ul>\n        {/* عرض المهام هنا */}\n      </ul>\n    </div>\n  );\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "useState\\s*\\(|useReducer\\s*\\(",
    "message": "استخدم state للمهام والإدخال"
   },
   {
    "pattern": "onChange\\s*=\\s*\\{",
    "message": "اربط حقل الإدخال بالـ state (onChange)"
   },
   {
    "pattern": "\\.\\.\\.\\s*\\w+|\\.concat\\s*\\(",
    "message": "أضف المهمة الجديدة إلى نسخة من المصفوفة"
   },
   {
    "pattern": "\\.trim\\s*\\(\\s*\\)|\\.length\\s*(>|===?|!==?)\\s*0|if\\s*\\(\\s*!\\s*[\\w.]+\\s*\\)",
    "message": "تجاهل النص الفارغ"
   },
   {
    "pattern": "\\.filter\\s*\\(|\\.splice\\s*\\(",
    "message": "احذف المهمة"
   },
   {
    "pattern": "\\.map\\s*\\(",
    "message": "اعرض المهام بـ map()"
   }
  ],
  "validation": "structural"
 },
 "react-challenge-3": {
  "id": "react-challenge-3",
  "language": "React",
  "difficulty": "medium",
  "points": 45,
  "starterCode": "function UsersList() {\n  // State للبيانات والتحميل والأخطاء\n  \n  // useEffect لجلب البيانات\n  \n  return (\n    <div>\n      {/* عرض حالة التحميل/الخطأ/البيانات */}\n    </div>\n  );\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "useEffect\\s*\\(",
    "message": "اجلب البيانات داخل useEffect"
   },
   {
    "pattern": ",\\s*\\[\\s*\\]\\s*\\)",
    "message": "مرّر [] ليعمل الجلب مرة واحدة"
   },
   {
    "pattern": "fetch\\s*\\(|axios",
    "message": "اجلب البيانات من الـ API (fetch)"
   },
   {
    "pattern": "[lL]oading|[pP]ending|جار",
    "message": "اعرض حالة التحميل"
   },
   {
    "pattern": "catch\\b|[eE]rror",
    "message": "تعامل مع الأخطاء واعرضها"
   },
   {
    "pattern": "\\.map\\s*\\(",
    "message": "اعرض المستخدمين بـ map()"
   }
  ],
  "validation": "structural"
 },
 "react-ch-4": {
  "id": "react-ch-4",
  "language": "React",
  "difficulty": "medium",
  "points": 70,
  "starterCode": "// أنشئ custom hook يخزن ويسترجع من localStorage\n// مع sync عند تغيير القيمة\n\nfunction useLocalStorage(key, initialValue) {\n  // أكمل الكود\n}\n\n// مكون تجريبي يستخدم الـ Hook\nfunction Demo() {\n  const [name, setName] = useLocalStorage('name', '');\n  return <div>{name}</div>;\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "useState\\s*\\(|useReducer\\s*\\(",
    "message": "احفظ القيمة في state داخل الـ Hook"
   },
   {
    "pattern": "localStorage\\s*\\.\\s*getItem\\s*\\(",
    "message": "اقرأ القيمة بـ localStorage.getItem"
   },
   {
    "pattern": "localStorage\\s*\\.\\s*setItem\\s*\\(",
    "message": "احفظ القيمة بـ localStorage.setItem"
   },
   {
    "pattern": "JSON\\s*\\.\\s*parse",
    "message": "حوّل النص المخزن بـ JSON.parse"
   },
   {
    "pattern": "JSON\\s*\\.\\s*stringify",
    "message": "خزّن القيمة بـ JSON.stringify"
   },
   {
    "pattern": "return\\s*\\[",
    "message": "أرجع [value, setValue]"
   }
  ],
  "validation": "structural"
 },
 "react-ch-5": {
  "id": "react-ch-5",
  "language": "React",
  "difficulty": "medium",
  "points": 80,
  "starterCode": "// أنشئ ThemeContext مع:\n// 1. theme state (light/dark)\n// 2. toggleTheme function\n// 3. Provider component\n// 4. useTheme hook\n\n// ThemeContext.js",
  "testCases": [],
  "checks": [
   {
    "pattern": "createContext\\s*\\(",
    "message": "أنشئ الـ Context بـ createContext"
   },
   {
    "pattern": "useState\\s*\\(|useReducer\\s*\\(",
    "message": "خزّن الثيم في state"
   },
   {
    "pattern": "\\.\\s*Provider",
    "message": "وفّر القيمة عبر Provider"
   },
   {
    "pattern": "toggleTheme",
    "message": "أضف الدالة toggleTheme"
   },
   {
    "pattern": "[\"']dark[\"']",
    "message": "ادعم الوضع \"dark\""
   },
   {
    "pattern": "(function\\s+useTheme|const\\s+useTheme)",
    "message": "أنشئ Hook اسمه useTheme"
   },
   {
    "pattern": "useContext\\s*\\(",
    "message": "استخدم useContext داخل useTheme"
   }
  ],
  "validation": "structural"
 },
 "react-ch-6": {
  "id": "react-ch-6",
  "language": "React",
  "difficulty": "medium",
  "points": 80,
  "starterCode": "// أنشئ نموذج تسجيل مع:\n// 1. الحقول: name, email, password, confirmPassword\n// 2. Validation لكل حقل\n// 3. عرض الأخطاء\n// 4. منع الإرسال إذا كان غير صالح\n\nfunction RegistrationForm() {\n  // أكمل الكود\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "useState\\s*\\(|useReducer\\s*\\(",
    "message": "خزّن البيانات والأخطاء في state"
   },
   {
    "pattern": "confirmPassword",
    "message": "أضف حقل confirmPassword"
   },
   {
    "pattern": "type\\s*=\\s*[\"']email[\"']",
    "message": "أضف حقل type=\"email\""
   },
   {
    "pattern": "onSubmit\\s*=\\s*\\{|onClick\\s*=\\s*\\{",
    "message": "أضف معالج الإرسال"
   },
   {
    "pattern": "password\\s*!==?\\s*[\\w.]*confirmPassword|confirmPassword\\s*!==?\\s*[\\w.]*password|password\\s*===?\\s*[\\w.]*confirmPassword|confirmPassword\\s*===?\\s*[\\w.]*password",
    "message": "تحقق من تطابق كلمتي المرور"
   },
   {
    "pattern": "\\{\\s*[\\w.]*[eE]rrors?\\b[\\w.]*\\s*(&&|\\?|\\})",
    "message": "اعرض رسائل الأخطاء"
   }
  ],
  "validation": "structural"
 },
 "react-ch-7": {
  "id": "react-ch-7",
  "language": "React",
  "difficulty": "hard",
  "points": 100,
  "starterCode": "// أنشئ مكون يحمل بيانات عند الوصول لأسفل الصفحة\n// استخدم Intersection Observer API\n\nfunction InfiniteList() {\n  // أكمل الكود\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "IntersectionObserver",
    "message": "استخدم IntersectionObserver"
   },
   {
    "pattern": "useRef\\s*\\(",
    "message": "احفظ الـ observer أو العنصر في useRef"
   },
   {
    "pattern": "isIntersecting|intersectionRatio",
    "message": "تحقق من ظهور العنصر"
   },
   {
    "pattern": "set\\w*[pP]age\\s*\\(|[pP]age\\s*\\+\\s*1|\\+\\+\\s*\\w*[pP]age|[pP]age\\w*\\s*\\+\\+|load\\w*\\s*\\(|fetch\\w*\\s*\\(",
    "message": "حمّل الصفحة التالية"
   },
   {
    "pattern": "[hH]asMore|[lL]oading|[mM]ore|[dD]one|[eE]nd\\b",
    "message": "توقف عند التحميل أو عند انتهاء البيانات"
   }
  ],
  "validation": "structural"
 },
 "ai-challenge-1": {
  "id": "ai-challenge-1",
  "language": "Python",
  "difficulty": "easy",
  "points": 150,
  "starterCode": "def accuracy(y_true, y_pred):\n    # نسبة التوقعات الصحيحة مقربة لرقمين\n    pass\n\n\ndef majority_class(labels):\n    # الفئة الأكثر تكراراً (عند التعادل: الأصغر)\n    pass",
  "testCases": [
   {
    "input": "accuracy([0, 1, 1, 0, 1], [0, 1, 0, 0, 1])",
    "expectedOutput": "0.8",
    "description": "أربع توقعات صحيحة من خمس"
   },
   {
    "input": "majority_class([0, 0, 0, 1, 1, 2, 2, 2, 2])",
    "expectedOutput": "2",
    "description": "الفئة الأكثر تكراراً"
   },
   {
    "input": "accuracy([2, 2, 2], [2, 2, 2])",
    "expectedOutput": "1.0",
    "description": "دقة كاملة",
    "hidden": true
   },
   {
    "input": "accuracy([], [])",
    "expectedOutput": "0.0",
    "description": "قوائم فارغة",
    "hidden": true
   },
   {
    "input": "accuracy([0, 1, 2], [2, 1, 0])",
    "expectedOutput": "0.33",
    "description": "التقريب لرقمين",
    "hidden": true
   },
   {
    "input": "majority_class([1, 0, 1, 0])",
    "expectedOutput": "0",
    "description": "تعادل ← الأصغر",
    "hidden": true
   }
  ],
  "entryFunction": "accuracy"
 },
 "ai-challenge-2": {
  "id": "ai-challenge-2",
  "language": "Python",
  "difficulty": "medium",
  "points": 200,
  "starterCode": "def sentiment(text, positive_words, negative_words):\n    # أرجع \"إيجابي\" أو \"سلبي\" أو \"محايد\"\n    pass",
  "testCases": [
   {
    "input": "sentiment(\"great product, amazing quality\", {\"great\", \"amazing\"}, {\"bad\"})",
    "expectedOutput": "إيجابي",
    "description": "كلمتان إيجابيتان"
   },
   {
    "input": "sentiment(\"bad service, terrible\", {\"good\"}, {\"bad\", \"terrible\"})",
    "expectedOutput": "سلبي",
    "description": "كلمتان سلبيتان"
   },
   {
    "input": "sentiment(\"it is ok\", {\"good\"}, {\"bad\"})",
    "expectedOutput": "محايد",
    "description": "لا كلمات معروفة",
    "hidden": true
   },
   {
    "input": "sentiment(\"Good but bad\", {\"good\"}, {\"bad\"})",
    "expectedOutput": "محايد",
    "description": "تعادل",
    "hidden": true
   },
   {
    "input": "sentiment(\"GOOD good bad!\", {\"good\"}, {\"bad\"})",
    "expectedOutput": "إيجابي",
    "description": "حالة الأحرف وعلامات الترقيم",
    "hidden": true
   }
  ]
 },
 "ai-challenge-3": {
  "id": "ai-challenge-3",
  "language": "Python",
  "difficulty": "medium",
  "points": 180,
  "starterCode": "def predict_price(size, m, b):\n    pass\n\n\ndef mse(actual, predicted):\n    # متوسط مربع الخطأ مقرب لرقمين\n    pass\n\n\ndef r2_score(actual, predicted):\n    # 1 - (مجموع مربعات الخطأ / مجموع مربعات الانحراف عن المتوسط) مقرب لثلاثة أرقام\n    pass",
  "testCases": [
   {
    "input": "predict_price(150, 2500, 50000)",
    "expectedOutput": "425000",
    "description": "التنبؤ الخطي"
   },
   {
    "input": "mse([3, 5, 7], [2.5, 5.0, 7.5])",
    "expectedOutput": "0.17",
    "description": "متوسط مربع الخطأ"
   },
   {
    "input": "r2_score([100, 200, 300], [110, 190, 310])",
    "expectedOutput": "0.985",
    "description": "معامل التحديد"
   },
   {
    "input": "mse([1, 2], [1, 2])",
    "expectedOutput": "0.0",
    "description": "تنبؤ مثالي",
    "hidden": true
   },
   {
    "input": "predict_price(0, 3, 7)",
    "expectedOutput": "7",
    "description": "قيمة b عند الصفر",
    "hidden": true
   },
   {
    "input": "r2_score([1, 2, 3], [1, 2, 3])",
    "expectedOutput": "1.0",
    "description": "R² مثالي",
    "hidden": true
   }
  ],
  "entryFunction": "predict_price"
 },
 "ai-challenge-4": {
  "id": "ai-challenge-4",
  "language": "Python",
  "difficulty": "medium",
  "points": 200,
  "starterCode": "def euclidean(a, b):\n    pass\n\n\ndef nearest_centroid(point, centroids):\n    # أرجع رقم (index) أقرب مركز\n    pass\n\n\ndef min_max_normalize(values):\n    pass",
  "testCases": [
   {
    "input": "euclidean([1, 2], [4, 6])",
    "expectedOutput": "5.0",
    "description": "مسافة 3-4-5"
   },
   {
    "input": "nearest_centroid([9, 11], [[0, 0], [10, 10], [20, 20]])",
    "expectedOutput": "1",
    "description": "أقرب مركز"
   },
   {
    "input": "min_max_normalize([10, 20, 30, 40, 50])",
    "expectedOutput": "[0.0, 0.25, 0.5, 0.75, 1.0]",
    "description": "تطبيع Min-Max"
   },
   {
    "input": "euclidean([0, 0], [0, 0])",
    "expectedOutput": "0.0",
    "description": "نفس النقطة",
    "hidden": true
   },
   {
    "input": "nearest_centroid([19, 19], [[0, 0], [10, 10], [20, 20]])",
    "expectedOutput": "2",
    "description": "آخر مركز",
    "hidden": true
   },
   {
    "input": "min_max_normalize([5, 5])",
    "expectedOutput": "[0.0, 0.0]",
    "description": "قيم متساوية",
    "hidden": true
   }
  ],
  "entryFunction": "euclidean"
 },
 "ai-challenge-5": {
  "id": "ai-challenge-5",
  "language": "Python",
  "difficulty": "hard",
  "points": 250,
  "starterCode": "import math\n\n\ndef sigmoid(x):\n    pass\n\n\ndef relu(x):\n    pass\n\n\ndef neuron_output(inputs, weights, bias):\n    pass",
  "testCases": [
   {
    "input": "sigmoid(0)",
    "expectedOutput": "0.5",
    "description": "Sigmoid عند الصفر"
   },
   {
    "input": "relu(-3)",
    "expectedOutput": "0",
    "description": "ReLU لقيمة سالبة"
   },
   {
    "input": "neuron_output([1, 2, 3], [0.5, -0.5, 0.2], 0.1)",
    "expectedOutput": "0.5498",
    "description": "التمرير الأمامي"
   },
   {
    "input": "sigmoid(2)",
    "expectedOutput": "0.8808",
    "description": "Sigmoid لقيمة موجبة",
    "hidden": true
   },
   {
    "input": "relu(5)",
    "expectedOutput": "5",
    "description": "ReLU لقيمة موجبة",
    "hidden": true
   },
   {
    "input": "neuron_output([0, 0], [1, 1], 0)",
    "expectedOutput": "0.5",
    "description": "مدخلات صفرية",
    "hidden": true
   }
  ],
  "entryFunction": "sigmoid"
 },
 "ai-challenge-6": {
  "id": "ai-challenge-6",
  "language": "Python",
  "difficulty": "hard",
  "points": 300,
  "starterCode": "def conv2d(image, kernel):\n    # التفاف بدون حشو، خطوة 1\n    pass\n\n\ndef max_pool2d(matrix):\n    # نافذة 2x2 وخطوة 2\n    pass",
  "testCases": [
   {
    "input": "conv2d([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, 1]])",
    "expectedOutput": "[[6, 8], [12, 14]]",
    "description": "التفاف ثنائي الأبعاد"
   },
   {
    "input": "max_pool2d([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]])",
    "expectedOutput": "[[6, 8], [14, 16]]",
    "description": "Max Pooling 2×2"
   },
   {
    "input": "conv2d([[1, 1], [1, 1]], [[1, 1], [1, 1]])",
    "expectedOutput": "[[4]]",
    "description": "فلتر بحجم الصورة",
    "hidden": true
   },
   {
    "input": "conv2d([[0, 1, 2], [3, 4, 5]], [[1, -1]])",
    "expectedOutput": "[[-1, -1], [-1, -1]]",
    "description": "فلتر غير مربع",
    "hidden": true
   },
   {
    "input": "max_pool2d([[1, 2], [3, 4]])",
    "expectedOutput": "[[4]]",
    "description": "مربع واحد",
    "hidden": true
   }
  ],
  "entryFunction": "conv2d"
 },
 "ai-challenge-7": {
  "id": "ai-challenge-7",
  "language": "Python",
  "difficulty": "medium",
  "points": 220,
  "starterCode": "import math\n\n\ndef cosine_similarity(a, b):\n    pass\n\n\ndef unrated_items(ratings):\n    pass",
  "testCases": [
   {
    "input": "cosine_similarity([1, 2, 3], [2, 4, 6])",
    "expectedOutput": "1.0",
    "description": "متجهان متناسبان"
   },
   {
    "input": "cosine_similarity([1, 0, 0], [0, 1, 0])",
    "expectedOutput": "0.0",
    "description": "متجهان متعامدان"
   },
   {
    "input": "unrated_items([5, 3, 0, 1])",
    "expectedOutput": "[2]",
    "description": "عنصر غير مقيّم"
   },
   {
    "input": "cosine_similarity([0, 0], [1, 1])",
    "expectedOutput": "0.0",
    "description": "متجه صفري",
    "hidden": true
   },
   {
    "input": "cosine_similarity([1, 1], [1, 0])",
    "expectedOutput": "0.71",
    "description": "زاوية 45 درجة",
    "hidden": true
   },
   {
    "input": "unrated_items([0, 0, 4])",
    "expectedOutput": "[0, 1]",
    "description": "عدة عناصر",
    "hidden": true
   }
  ],
  "entryFunction": "cosine_similarity"
 },
 "ai-challenge-8": {
  "id": "ai-challenge-8",
  "language": "Python",
  "difficulty": "hard",
  "points": 280,
  "starterCode": "import re\n\n\ndef tokenize(text):\n    pass\n\n\ndef top_words(text, n):\n    pass\n\n\ndef find_phone_numbers(text):\n    pass",
  "testCases": [
   {
    "input": "top_words(\"the cat sat on the mat the cat\", 2)",
    "expectedOutput": "[('the', 3), ('cat', 2)]",
    "description": "أكثر الكلمات تكراراً"
   },
   {
    "input": "find_phone_numbers(\"Call 123-456-7890 or 555-000-1111\")",
    "expectedOutput": "['123-456-7890', '555-000-1111']",
    "description": "استخراج أرقام الهاتف"
   },
   {
    "input": "tokenize(\"Hello, World! 2024\")",
    "expectedOutput": "['hello', 'world', '2024']",
    "description": "تقسيم النص"
   },
   {
    "input": "top_words(\"B a b A c\", 2)",
    "expectedOutput": "[('a', 2), ('b', 2)]",
    "description": "تعادل ← ترتيب أبجدي",
    "hidden": true
   },
   {
    "input": "find_phone_numbers(\"no numbers here\")",
    "expectedOutput": "[]",
    "description": "لا توجد أرقام",
    "hidden": true
   },
   {
    "input": "top_words(\"\", 3)",
    "expectedOutput": "[]",
    "description": "نص فارغ",
    "hidden": true
   },
   {
    "input": "tokenize(\"  Python3 is FUN!!  \")",
    "expectedOutput": "['python3', 'is', 'fun']",
    "description": "رموز ومسافات زائدة",
    "hidden": true
   }
  ],
  "entryFunction": "tokenize"
 },
 "deploy-challenge-1": {
  "id": "deploy-challenge-1",
  "language": "HTML",
  "difficulty": "easy",
  "points": 100,
  "starterCode": "<!-- index.html -->\n<!DOCTYPE html>\n<html>\n<head>\n  <title>My Portfolio</title>\n</head>\n<body>\n  <h1>اسمك</h1>\n  <p>مطور ويب</p>\n  \n  <!-- أضف:\n  - قسم المشاريع\n  - قسم المهارات\n  - قسم التواصل\n  -->\n</body>\n</html>\n\n<!-- المطلوب:\n1. أنشئ صفحة Portfolio كاملة\n2. ارفعها على GitHub\n3. انشرها على Vercel\n4. شارك الرابط\n-->",
  "testCases": [],
  "checks": [
   {
    "pattern": "<!DOCTYPE\\s+html>",
    "message": "ابدأ بـ <!DOCTYPE html>"
   },
   {
    "pattern": "<meta[^>]*name\\s*=\\s*[\"']viewport[\"']",
    "message": "أضف وسم viewport"
   },
   {
    "pattern": "<header",
    "message": "أضف <header>"
   },
   {
    "pattern": "<section",
    "message": "أضف ثلاثة أقسام <section>",
    "min": 3
   },
   {
    "pattern": "مشاريع|projects",
    "message": "أضف قسم المشاريع"
   },
   {
    "pattern": "مهارات|skills",
    "message": "أضف قسم المهارات"
   },
   {
    "pattern": "تواصل|contact",
    "message": "أضف قسم التواصل"
   },
   {
    "pattern": "<footer",
    "message": "أضف <footer>"
   }
  ],
  "validation": "structural"
 },
 "deploy-challenge-2": {
  "id": "deploy-challenge-2",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 40,
  "starterCode": "// أنشئ ملف package.json يحتوي على:\n// 1. اسم المشروع: my-app\n// 2. الإصدار: 1.0.0\n// 3. وصف مناسب\n// 4. scripts:\n//    - start: تشغيل السيرفر\n//    - dev: تشغيل في وضع التطوير\n//    - build: بناء المشروع\n//    - test: تشغيل الاختبارات\n// 5. dependencies: express\n// 6. devDependencies: nodemon\n\n// اكتب محتوى package.json هنا:\nconst packageJson = {\n  // أكمل\n};\nconsole.log(JSON.stringify(packageJson, null, 2));",
  "testCases": [
   {
    "input": "packageJson.name",
    "expectedOutput": "my-app",
    "description": "اسم المشروع صحيح"
   },
   {
    "input": "packageJson.scripts.dev",
    "expectedOutput": "nodemon index.js",
    "description": "سكريبت التطوير صحيح"
   },
   {
    "input": "packageJson.scripts.start",
    "expectedOutput": "node index.js",
    "description": "سكريبت التشغيل",
    "hidden": true
   },
   {
    "input": "Object.keys(packageJson.scripts).includes(\"test\")",
    "expectedOutput": "true",
    "description": "سكريبت الاختبار موجود",
    "hidden": true
   }
  ]
 },
 "deploy-challenge-3": {
  "id": "deploy-challenge-3",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 60,
  "starterCode": "// أنشئ نظام يقرأ متغيرات البيئة ويوفرها للتطبيق\n// المطلوب:\n// 1. قراءة المتغيرات من process.env\n// 2. توفير قيم افتراضية\n// 3. التحقق من المتغيرات المطلوبة\n// 4. تصدير الإعدادات ككائن\n\n// المتغيرات المطلوبة:\n// PORT, DATABASE_URL, API_KEY, NODE_ENV\n\nfunction loadConfig() {\n  // أكمل الكود\n}\n\nmodule.exports = loadConfig();",
  "testCases": [
   {
    "input": "loadConfig().port",
    "expectedOutput": "3000",
    "description": "المنفذ الافتراضي"
   },
   {
    "input": "loadConfig().isDev",
    "expectedOutput": "true",
    "description": "وضع التطوير افتراضياً"
   },
   {
    "input": "process.env.PORT = \"8080\"; loadConfig().port",
    "expectedOutput": "8080",
    "description": "قراءة PORT كرقم",
    "hidden": true
   },
   {
    "input": "process.env.NODE_ENV = \"production\"; loadConfig().isProd",
    "expectedOutput": "true",
    "description": "وضع الإنتاج",
    "hidden": true
   }
  ]
 },
 "deploy-challenge-4": {
  "id": "deploy-challenge-4",
  "language": "Dockerfile",
  "difficulty": "hard",
  "points": 80,
  "starterCode": "# اكتب Dockerfile لتطبيق Node.js يحتوي على:\n# 1. اختيار صورة أساسية (node:18-alpine)\n# 2. تحديد مجلد العمل\n# 3. نسخ package.json أولاً وتثبيت المكتبات\n# 4. نسخ بقية الملفات\n# 5. كشف المنفذ 3000\n# 6. تشغيل التطبيق\n\n# اكتب Dockerfile هنا:\n# FROM ...\n# WORKDIR ...\n# COPY ...\n# RUN ...\n# COPY ...\n# EXPOSE ...\n# CMD ...",
  "testCases": [],
  "checks": [
   {
    "pattern": "^\\s*FROM\\s+node:18-alpine",
    "message": "ابدأ بـ FROM node:18-alpine",
    "flags": "im"
   },
   {
    "pattern": "^\\s*WORKDIR\\s+\\S+",
    "message": "حدد مجلد العمل WORKDIR",
    "flags": "im"
   },
   {
    "pattern": "^\\s*COPY\\s+package[^\\n]*\\.json",
    "message": "انسخ package.json أولاً",
    "flags": "im"
   },
   {
    "pattern": "^\\s*RUN\\s+npm\\s+(ci|install)",
    "message": "ثبّت المكتبات بـ RUN npm ci أو npm install",
    "flags": "im"
   },
   {
    "pattern": "COPY\\s+package[\\s\\S]*RUN\\s+npm[\\s\\S]*COPY\\s+\\.\\s+\\.",
    "message": "ثبّت المكتبات قبل نسخ بقية الملفات (COPY . .)"
   },
   {
    "pattern": "^\\s*EXPOSE\\s+3000",
    "message": "اكشف المنفذ EXPOSE 3000",
    "flags": "im"
   },
   {
    "pattern": "^\\s*CMD\\s+",
    "message": "أضف أمر التشغيل CMD",
    "flags": "im"
   }
  ],
  "validation": "structural"
 },
 "rn-challenge-001": {
  "id": "rn-challenge-001",
  "language": "React",
  "difficulty": "easy",
  "points": 200,
  "starterCode": "import React, { useState } from 'react';\nimport { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';\n\nexport default function LoginScreen() {\n  // أكمل الكود هنا\n  \n  return (\n    <View style={styles.container}>\n      {/* أضف حقول الإدخال والزر */}\n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    padding: 20,\n    justifyContent: 'center',\n  },\n});",
  "testCases": [
   {
    "input": "email field exists",
    "expectedOutput": "true",
    "description": "تحقق من وجود حقل البريد"
   },
   {
    "input": "password field exists",
    "expectedOutput": "true",
    "description": "تحقق من وجود حقل كلمة المرور"
   }
  ]
 },
 "rn-challenge-002": {
  "id": "rn-challenge-002",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 150,
  "starterCode": "// منطق العداد\n\n// إنشاء حالة العداد\nfunction createCounter(initialValue = 0) {\n  // أكمل: أرجع كائن يحتوي على\n  // getValue, increment, decrement, reset, incrementBy\n  return {};\n}\n\n// حساب الخطوة الآمنة (لا ينزل تحت الصفر)\nfunction safeDecrement(value) {\n  // أكمل\n  return value;\n}\n\n// تنسيق العداد للعرض (إضافة + أو -)\nfunction formatCounter(value) {\n  // أكمل: أرجع \"+5\" للموجب، \"-3\" للسالب، \"0\" للصفر\n  return '';\n}",
  "testCases": [
   {
    "input": "createCounter(5).getValue()",
    "expectedOutput": "5",
    "description": "إنشاء عداد بقيمة 5"
   },
   {
    "input": "const c = createCounter(0); c.increment(); c.increment(); c.getValue()",
    "expectedOutput": "2",
    "description": "زيادة العداد مرتين"
   },
   {
    "input": "safeDecrement(0)",
    "expectedOutput": "0",
    "description": "العداد لا ينزل تحت الصفر"
   },
   {
    "input": "formatCounter(5)",
    "expectedOutput": "+5",
    "description": "تنسيق العدد الموجب"
   },
   {
    "input": "safeDecrement(3)",
    "expectedOutput": "2",
    "description": "إنقاص عادي",
    "hidden": true
   },
   {
    "input": "const c = createCounter(10); c.decrement(); c.reset()",
    "expectedOutput": "10",
    "description": "إعادة التعيين للقيمة الأولية",
    "hidden": true
   },
   {
    "input": "const c = createCounter(3); c.decrement(); c.decrement(); c.getValue()",
    "expectedOutput": "1",
    "description": "إنقاص مرتين",
    "hidden": true
   },
   {
    "input": "formatCounter(-3)",
    "expectedOutput": "-3",
    "description": "رقم سالب بدون +",
    "hidden": true
   },
   {
    "input": "formatCounter(0)",
    "expectedOutput": "0",
    "description": "الصفر بدون +",
    "hidden": true
   },
   {
    "input": "createCounter(7).getValue()",
    "expectedOutput": "7",
    "description": "قيمة أولية أخرى",
    "hidden": true
   }
  ]
 },
 "rn-challenge-003": {
  "id": "rn-challenge-003",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 350,
  "starterCode": "// منطق قائمة المهام\n\nfunction createTodoList() {\n  let tasks = [];\n  let nextId = 1;\n\n  return {\n    // إضافة مهمة جديدة\n    addTask(text) {\n      // أكمل\n    },\n    // تبديل حالة الإنجاز\n    toggleTask(id) {\n      // أكمل\n    },\n    // حذف مهمة\n    removeTask(id) {\n      // أكمل\n    },\n    // جلب المهام\n    getTasks() { return tasks; },\n    // عدد المكتملة\n    completedCount() {\n      // أكمل\n      return 0;\n    },\n    // تصفية - إرجاع مهام غير مكتملة فقط\n    getActiveTasks() {\n      // أكمل\n      return [];\n    },\n  };\n}",
  "testCases": [
   {
    "input": "const todo = createTodoList(); todo.addTask(\"مهمة 1\"); todo.getTasks().length",
    "expectedOutput": "1",
    "description": "إضافة مهمة واحدة"
   },
   {
    "input": "const todo = createTodoList(); todo.addTask(\"مهمة\"); todo.toggleTask(1); todo.completedCount()",
    "expectedOutput": "1",
    "description": "تبديل حالة مهمة إلى مكتملة"
   },
   {
    "input": "const todo = createTodoList(); todo.addTask(\"a\"); todo.addTask(\"b\"); todo.removeTask(1); todo.getTasks().length",
    "expectedOutput": "1",
    "description": "حذف مهمة من القائمة"
   },
   {
    "input": "const todo = createTodoList(); todo.addTask(\"a\"); todo.addTask(\"b\"); todo.toggleTask(1); todo.getActiveTasks().length",
    "expectedOutput": "1",
    "description": "تصفية المهام غير المكتملة"
   },
   {
    "input": "const todo = createTodoList(); todo.addTask(\"a\"); todo.addTask(\"b\"); todo.addTask(\"c\"); todo.getTasks().length",
    "expectedOutput": "3",
    "description": "ثلاث مهام",
    "hidden": true
   },
   {
    "input": "const todo = createTodoList(); todo.addTask(\"a\"); todo.addTask(\"b\"); todo.getTasks()[1].id",
    "expectedOutput": "2",
    "description": "المعرّف الثاني = 2",
    "hidden": true
   },
   {
    "input": "const todo = createTodoList(); todo.addTask(\"a\"); todo.toggleTask(1); todo.toggleTask(1); todo.completedCount()",
    "expectedOutput": "0",
    "description": "التبديل مرتين يلغي الإنجاز",
    "hidden": true
   },
   {
    "input": "const todo = createTodoList(); todo.getTasks().length",
    "expectedOutput": "0",
    "description": "قائمة فارغة",
    "hidden": true
   }
  ]
 },
 "rn-challenge-004": {
  "id": "rn-challenge-004",
  "language": "JavaScript",
  "difficulty": "hard",
  "points": 500,
  "starterCode": "// منطق عربة التسوق\n\nfunction createStore() {\n  const products = [\n    { id: '1', name: 'هاتف', price: 500 },\n    { id: '2', name: 'لابتوب', price: 1200 },\n    { id: '3', name: 'سماعات', price: 80 },\n  ];\n  let cart = [];\n\n  return {\n    getProducts() { return products; },\n    // إضافة منتج للعربة (زيادة الكمية إذا موجود)\n    addToCart(productId) {\n      // أكمل\n    },\n    // حذف منتج من العربة\n    removeFromCart(productId) {\n      // أكمل\n    },\n    // حساب المجموع\n    getTotal() {\n      // أكمل\n      return 0;\n    },\n    // عدد العناصر في العربة\n    getCartCount() {\n      // أكمل\n      return 0;\n    },\n    getCart() { return cart; },\n  };\n}",
  "testCases": [
   {
    "input": "const s = createStore(); s.addToCart(\"1\"); s.getTotal()",
    "expectedOutput": "500",
    "description": "إضافة هاتف للعربة وحساب المجموع"
   },
   {
    "input": "const s = createStore(); s.addToCart(\"1\"); s.addToCart(\"1\"); s.getCartCount()",
    "expectedOutput": "2",
    "description": "إضافة نفس المنتج مرتين يزيد الكمية"
   },
   {
    "input": "const s = createStore(); s.addToCart(\"1\"); s.addToCart(\"2\"); s.getTotal()",
    "expectedOutput": "1700",
    "description": "مجموع منتجين مختلفين"
   },
   {
    "input": "const s = createStore(); s.addToCart(\"1\"); s.removeFromCart(\"1\"); s.getTotal()",
    "expectedOutput": "0",
    "description": "المجموع بعد حذف المنتج"
   }
  ]
 },
 "rn-challenge-005": {
  "id": "rn-challenge-005",
  "language": "JavaScript",
  "difficulty": "hard",
  "points": 600,
  "starterCode": "// منطق تطبيق الطقس\n\n// تحويل كلفن إلى مئوي\nfunction kelvinToCelsius(kelvin) {\n  // أكمل\n  return 0;\n}\n\n// تحويل كلفن إلى فهرنهايت\nfunction kelvinToFahrenheit(kelvin) {\n  // أكمل\n  return 0;\n}\n\n// تحليل استجابة API واستخراج البيانات\nfunction parseWeatherData(apiResponse) {\n  // أكمل: استخرج city, temp (مئوي), description, humidity\n  return {};\n}\n\n// نصيحة بناءً على درجة الحرارة\nfunction getWeatherAdvice(tempCelsius) {\n  // أكمل\n  return '';\n}",
  "testCases": [
   {
    "input": "kelvinToCelsius(273.15)",
    "expectedOutput": "0",
    "description": "تحويل 273.15 كلفن إلى 0 مئوي"
   },
   {
    "input": "kelvinToFahrenheit(273.15)",
    "expectedOutput": "32",
    "description": "تحويل كلفن إلى فهرنهايت"
   },
   {
    "input": "getWeatherAdvice(35)",
    "expectedOutput": "حار، اشرب ماءً كثيراً",
    "description": "نصيحة طقس حار"
   },
   {
    "input": "getWeatherAdvice(-5)",
    "expectedOutput": "بارد جداً، ارتدِ ملابس ثقيلة",
    "description": "نصيحة طقس بارد جداً"
   },
   {
    "input": "kelvinToCelsius(300)",
    "expectedOutput": "26.85",
    "description": "تحويل مع كسور",
    "hidden": true
   },
   {
    "input": "kelvinToFahrenheit(300)",
    "expectedOutput": "80.33",
    "description": "فهرنهايت مع تقريب",
    "hidden": true
   },
   {
    "input": "getWeatherAdvice(20)",
    "expectedOutput": "طقس معتدل",
    "description": "طقس معتدل",
    "hidden": true
   },
   {
    "input": "getWeatherAdvice(10)",
    "expectedOutput": "بارد، ارتدِ معطفاً",
    "description": "طقس بارد",
    "hidden": true
   },
   {
    "input": "parseWeatherData({ name: \"Baghdad\", main: { temp: 313.15, humidity: 20 }, weather: [{ description: \"clear\" }] }).temp",
    "expectedOutput": "40",
    "description": "قراءة الحرارة من الاستجابة",
    "hidden": true
   },
   {
    "input": "parseWeatherData({ name: \"Erbil\", main: { temp: 280, humidity: 55 }, weather: [{ description: \"rain\" }] }).city",
    "expectedOutput": "Erbil",
    "description": "قراءة اسم المدينة",
    "hidden": true
   }
  ]
 },
 "flutter-challenge-001": {
  "id": "flutter-challenge-001",
  "language": "Dart",
  "difficulty": "easy",
  "points": 200,
  "starterCode": "import 'package:flutter/material.dart';\n\n// دالة للتحقق من صحة البريد الإلكتروني\nString? validateEmail(String? value) {\n  // أكمل التحقق\n  return null;\n}\n\n// دالة للتحقق من صحة كلمة المرور\nString? validatePassword(String? value) {\n  // أكمل التحقق\n  return null;\n}\n\n// دالة لمحاولة تسجيل الدخول\nMap<String, dynamic> attemptLogin(String email, String password) {\n  // أكمل المنطق: تحقق من المدخلات وأرجع نتيجة\n  return {};\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "isEmpty|==\\s*['\"]{2}|\\.length\\s*==\\s*0",
    "message": "تحقق من القيمة الفارغة"
   },
   {
    "pattern": "البريد الإلكتروني مطلوب",
    "message": "رسالة \"البريد الإلكتروني مطلوب\""
   },
   {
    "pattern": "(contains|indexOf|split)\\s*\\(\\s*['\"]@['\"]|RegExp\\s*\\(|hasMatch\\s*\\(",
    "message": "تحقق من وجود @"
   },
   {
    "pattern": "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    "message": "رسالة كلمة المرور القصيرة"
   },
   {
    "pattern": "\\.length\\s*(<\\s*6|<=\\s*5|>=\\s*6|>\\s*5)",
    "message": "تحقق أن الطول 6 على الأقل"
   },
   {
    "pattern": "validateEmail\\s*\\(\\s*email\\s*\\)",
    "message": "استخدم validateEmail داخل attemptLogin"
   },
   {
    "pattern": "['\"]success['\"]\\s*:",
    "message": "أرجع مفتاح success من attemptLogin"
   }
  ],
  "validation": "structural"
 },
 "flutter-challenge-002": {
  "id": "flutter-challenge-002",
  "language": "Dart",
  "difficulty": "medium",
  "points": 350,
  "starterCode": "// نموذج مهمة\nclass Task {\n  String id;\n  String title;\n  bool isDone;\n  Task({required this.id, required this.title, this.isDone = false});\n}\n\n// دالة لإضافة مهمة إلى القائمة\nList<Task> addTask(List<Task> tasks, String title) {\n  // أكمل\n  return tasks;\n}\n\n// دالة لتبديل حالة الإنجاز\nList<Task> toggleTask(List<Task> tasks, String id) {\n  // أكمل\n  return tasks;\n}\n\n// دالة لحذف مهمة\nList<Task> removeTask(List<Task> tasks, String id) {\n  // أكمل\n  return tasks;\n}\n\n// دالة لعدد المهام المكتملة\nint completedCount(List<Task> tasks) {\n  // أكمل\n  return 0;\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "\\[\\s*\\.\\.\\.\\s*tasks|List<Task>\\.from\\s*\\(\\s*tasks|tasks\\s*\\.\\s*add\\s*\\(",
    "message": "أضف المهمة الجديدة إلى القائمة"
   },
   {
    "pattern": "Task\\s*\\(\\s*id\\s*:",
    "message": "أنشئ Task جديدة بمعرّف"
   },
   {
    "pattern": "isDone\\s*=\\s*!|isDone\\s*:\\s*!|!\\s*\\w+\\s*\\.\\s*isDone",
    "message": "اعكس isDone في toggleTask"
   },
   {
    "pattern": "\\.where\\s*\\(|removeWhere\\s*\\(|removeAt\\s*\\(|\\.remove\\s*\\(",
    "message": "احذف المهمة في removeTask"
   },
   {
    "pattern": "\\.where\\s*\\([^)]*isDone|isDone\\s*\\)\\s*\\.\\s*length|fold\\s*\\(|for\\s*\\(|forEach\\s*\\(",
    "message": "احسب المهام المنجزة في completedCount"
   }
  ],
  "validation": "structural"
 },
 "flutter-challenge-003": {
  "id": "flutter-challenge-003",
  "language": "Dart",
  "difficulty": "hard",
  "points": 500,
  "starterCode": "// نموذج بيانات الطقس\nclass WeatherData {\n  final String city;\n  final double tempKelvin;\n  final String description;\n  final int humidity;\n  WeatherData({required this.city, required this.tempKelvin, required this.description, required this.humidity});\n}\n\n// تحويل من كلفن إلى مئوي\ndouble kelvinToCelsius(double kelvin) {\n  // أكمل\n  return 0.0;\n}\n\n// تحويل من كلفن إلى فهرنهايت\ndouble kelvinToFahrenheit(double kelvin) {\n  // أكمل\n  return 0.0;\n}\n\n// تحويل بيانات JSON إلى WeatherData\nWeatherData parseWeatherJson(Map<String, dynamic> json) {\n  // أكمل: استخرج البيانات من JSON\n  return WeatherData(city: '', tempKelvin: 0, description: '', humidity: 0);\n}\n\n// وصف حالة الطقس\nString getWeatherAdvice(double tempCelsius) {\n  // أكمل: أرجع نصيحة بناءً على درجة الحرارة\n  return '';\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "-\\s*273\\.15",
    "message": "التحويل من كلفن بطرح 273.15"
   },
   {
    "pattern": "(9\\s*/\\s*5|1\\.8)[\\s\\S]{0,25}32|32\\s*\\+[\\s\\S]{0,25}(9\\s*/\\s*5|1\\.8)",
    "message": "التحويل إلى فهرنهايت (× 9/5 + 32)"
   },
   {
    "pattern": "json\\s*\\[\\s*['\"]name['\"]\\s*\\]",
    "message": "اقرأ json['name']"
   },
   {
    "pattern": "\\[\\s*['\"]main['\"]\\s*\\]\\s*\\[\\s*['\"]temp['\"]\\s*\\]",
    "message": "اقرأ json['main']['temp']"
   },
   {
    "pattern": "\\[\\s*['\"]weather['\"]\\s*\\]\\s*\\[\\s*0\\s*\\]",
    "message": "اقرأ json['weather'][0]"
   }
  ],
  "validation": "structural"
 },
 "flutter-challenge-004": {
  "id": "flutter-challenge-004",
  "language": "Dart",
  "difficulty": "hard",
  "points": 600,
  "starterCode": "// نموذج المنتج\nclass Product {\n  final String id;\n  final String name;\n  final double price;\n  int quantity;\n  Product({required this.id, required this.name, required this.price, this.quantity = 1});\n}\n\n// عربة التسوق\nclass Cart {\n  List<Product> items = [];\n\n  // إضافة منتج للعربة\n  void addItem(Product product) {\n    // أكمل\n  }\n\n  // حذف منتج من العربة\n  void removeItem(String productId) {\n    // أكمل\n  }\n\n  // حساب المجموع الكلي\n  double get totalPrice {\n    // أكمل\n    return 0.0;\n  }\n\n  // عدد العناصر\n  int get itemCount {\n    // أكمل\n    return 0;\n  }\n\n  // تطبيق خصم بنسبة معينة\n  double applyDiscount(double percentage) {\n    // أكمل\n    return 0.0;\n  }\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "indexWhere\\s*\\(|firstWhere\\s*\\(|\\.any\\s*\\(|\\.where\\s*\\(|\\.contains\\s*\\(|for\\s*\\(",
    "message": "ابحث إن كان المنتج موجوداً في العربة"
   },
   {
    "pattern": "quantity\\s*(\\+\\+|\\+=)|\\+\\+\\s*[\\w.]*quantity|quantity\\s*=\\s*[\\w.]*quantity\\s*\\+|quantity\\s*:\\s*[\\w.]*quantity\\s*\\+",
    "message": "زد الكمية للمنتج الموجود"
   },
   {
    "pattern": "removeWhere\\s*\\(|\\.where\\s*\\(|removeAt\\s*\\(|\\.remove\\s*\\(",
    "message": "احذف المنتج في removeItem"
   },
   {
    "pattern": "price\\s*\\*\\s*[\\w.]*quantity|quantity\\s*\\*\\s*[\\w.]*price",
    "message": "اضرب السعر في الكمية"
   },
   {
    "pattern": "fold\\s*\\(|reduce\\s*\\(|for\\s*\\(|forEach\\s*\\(",
    "message": "اجمع العناصر لحساب المجموع"
   }
  ],
  "validation": "structural"
 },
 "flutter-challenge-005": {
  "id": "flutter-challenge-005",
  "language": "Dart",
  "difficulty": "hard",
  "points": 700,
  "starterCode": "// نموذج الرسالة\nclass Message {\n  final String id;\n  final String senderId;\n  final String text;\n  final DateTime timestamp;\n  Message({required this.id, required this.senderId, required this.text, required this.timestamp});\n}\n\n// تنسيق وقت الرسالة\nString formatMessageTime(DateTime time) {\n  // أكمل: أرجع الوقت بصيغة HH:MM\n  return '';\n}\n\n// ترتيب الرسائل حسب الوقت\nList<Message> sortMessages(List<Message> messages) {\n  // أكمل: رتب من الأقدم للأحدث\n  return messages;\n}\n\n// تجميع الرسائل حسب التاريخ\nMap<String, List<Message>> groupByDate(List<Message> messages) {\n  // أكمل\n  return {};\n}\n\n// عد الرسائل غير المقروءة\nint unreadCount(List<Message> messages, String lastReadId) {\n  // أكمل\n  return 0;\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "padLeft\\s*\\(\\s*2\\s*,\\s*['\"]0['\"]\\s*\\)|<\\s*10\\s*\\?|DateFormat\\s*\\(",
    "message": "أضف صفراً في البداية (HH:MM)"
   },
   {
    "pattern": "\\.hour\\b|DateFormat\\s*\\(|substring\\s*\\(\\s*11",
    "message": "استخرج الساعة من الوقت"
   },
   {
    "pattern": "\\.minute\\b|DateFormat\\s*\\(|substring\\s*\\(\\s*11",
    "message": "استخرج الدقائق من الوقت"
   },
   {
    "pattern": "List<Message>\\.from\\s*\\(|\\[\\s*\\.\\.\\.\\s*messages|toList\\s*\\(",
    "message": "انسخ القائمة قبل الترتيب"
   },
   {
    "pattern": "\\.sort\\s*\\(",
    "message": "رتّب بـ sort()"
   },
   {
    "pattern": "compareTo\\s*\\(|isBefore\\s*\\(|isAfter\\s*\\(|difference\\s*\\(|millisecondsSinceEpoch",
    "message": "قارن أوقات الرسائل"
   },
   {
    "pattern": "\\.day\\b|toIso8601String|substring\\s*\\(\\s*0\\s*,\\s*10\\s*\\)|DateTime\\s*\\([^)]*\\.year",
    "message": "اجمع الرسائل حسب اليوم في groupByDate"
   },
   {
    "pattern": "indexWhere\\s*\\([\\s\\S]{0,80}?lastReadId|\\.where\\s*\\(|skipWhile\\s*\\(",
    "message": "ابحث عن آخر رسالة مقروءة (lastReadId) في unreadCount"
   }
  ],
  "validation": "structural"
 },
 "backend-ch-1": {
  "id": "backend-ch-1",
  "language": "Node.js",
  "difficulty": "medium",
  "points": 50,
  "starterCode": "const express = require('express');\nconst app = express();\napp.use(express.json());\n\nlet tasks = [];\n\n// GET /tasks - جلب كل المهام\n\n// POST /tasks - إضافة مهمة\n\n// PUT /tasks/:id - تحديث مهمة\n\n// DELETE /tasks/:id - حذف مهمة\n\napp.listen(3000);",
  "testCases": [
   {
    "input": "await __kx.req('POST', '/tasks', { title: 'تعلم Express' }); const r = await __kx.req('GET', '/tasks'); r.status + ' ' + r.body.length",
    "expectedOutput": "200 1",
    "description": "إضافة مهمة ثم جلب القائمة"
   },
   {
    "input": "const r = await __kx.req('POST', '/tasks', { title: 'a' }); r.status + ' ' + r.body.title",
    "expectedOutput": "201 a",
    "description": "POST يرجع 201 مع المهمة"
   },
   {
    "input": "const r = await __kx.req('PUT', '/tasks/999', { title: 'x' }); r.status",
    "expectedOutput": "404",
    "description": "تحديث مهمة غير موجودة"
   },
   {
    "input": "const a = await __kx.req('POST', '/tasks', { title: 'a' }); const b = await __kx.req('POST', '/tasks', { title: 'b' }); typeof a.body.id === 'number' && a.body.id !== b.body.id",
    "expectedOutput": "true",
    "description": "معرّفات رقمية فريدة",
    "hidden": true
   },
   {
    "input": "const a = await __kx.req('POST', '/tasks', { title: 'a' }); const u = await __kx.req('PUT', '/tasks/' + a.body.id, { title: 'b' }); u.status + ' ' + u.body.title",
    "expectedOutput": "200 b",
    "description": "تحديث مهمة موجودة",
    "hidden": true
   },
   {
    "input": "const a = await __kx.req('POST', '/tasks', { title: 'a' }); await __kx.req('DELETE', '/tasks/' + a.body.id); const r = await __kx.req('GET', '/tasks'); r.body.length",
    "expectedOutput": "0",
    "description": "الحذف يزيل المهمة",
    "hidden": true
   },
   {
    "input": "const d = await __kx.req('DELETE', '/tasks/999'); d.status",
    "expectedOutput": "404",
    "description": "حذف مهمة غير موجودة",
    "hidden": true
   }
  ],
  "validation": "execution",
  "prelude": "\nvar __kx = (function () {\n  var apps = [];\n  var fakeNow = null;\n  var RealDate = Date;\n  function currentTime() { return fakeNow === null ? RealDate.now() : fakeNow; }\n  function FakeDate() {\n    var args = [].slice.call(arguments);\n    if (!(this instanceof FakeDate)) return new RealDate(currentTime()).toString();\n    if (args.length === 0) return new RealDate(currentTime());\n    return new (Function.prototype.bind.apply(RealDate, [null].concat(args)))();\n  }\n  FakeDate.now = currentTime;\n  FakeDate.parse = RealDate.parse;\n  FakeDate.UTC = RealDate.UTC;\n  FakeDate.prototype = RealDate.prototype;\n  Date = FakeDate;\n  var realSetInterval = setInterval;\n  setInterval = function () { var tm = realSetInterval.apply(null, arguments); if (tm && tm.unref) tm.unref(); return tm; };\n  if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'kodax-test-secret';\n  function lower(obj) { var o = {}; Object.keys(obj || {}).forEach(function (k) { o[k.toLowerCase()] = obj[k]; }); return o; }\n  function makeRes() {\n    var res = { statusCode: 200, body: undefined, ended: false, headers: {} };\n    res.status = function (c) { res.statusCode = c; return res; };\n    res.json = function (b) { res.body = b; res.ended = true; return res; };\n    res.send = function (b) { res.body = b; res.ended = true; return res; };\n    res.sendStatus = function (c) { res.statusCode = c; res.ended = true; return res; };\n    res.end = function () { res.ended = true; return res; };\n    res.set = function (k, v) { res.headers[k] = v; return res; };\n    res.setHeader = res.set;\n    return res;\n  }\n  function matchPath(pattern, path) {\n    var pp = String(pattern).split('/'), sp = path.split('/');\n    if (pp.length !== sp.length) return null;\n    var params = {};\n    for (var i = 0; i < pp.length; i++) {\n      if (pp[i].charAt(0) === ':') params[pp[i].slice(1)] = decodeURIComponent(sp[i]);\n      else if (pp[i] !== sp[i]) return null;\n    }\n    return params;\n  }\n  function runChain(fns, req, res) {\n    return new Promise(function (resolve, reject) {\n      var i = 0, done = false;\n      function finish(v) { if (!done) { done = true; resolve(v); } }\n      function next(err) {\n        if (done) return;\n        if (err) { done = true; return reject(err); }\n        var fn = fns[i++];\n        if (!fn) return finish(true);\n        var called = false;\n        var wrapped = function (e) { called = true; next(e); };\n        try {\n          var out = fn(req, res, wrapped);\n          if (out && typeof out.then === 'function') out.then(function () { if (res.ended && !called) finish(false); }, function (e) { done = true; reject(e); });\n        } catch (e) { done = true; return reject(e); }\n        if (res.ended && !called) return finish(false);\n        setTimeout(function () { if (!called) finish(false); }, 100);\n      }\n      next();\n    });\n  }\n  function express() {\n    var stack = [];\n    var app = { _stack: stack };\n    ['get', 'post', 'put', 'patch', 'delete'].forEach(function (m) {\n      app[m] = function (path) { stack.push({ method: m.toUpperCase(), path: path, handlers: [].slice.call(arguments, 1) }); return app; };\n    });\n    app.use = function (a) {\n      var rest = [].slice.call(arguments, 1);\n      if (typeof a === 'function') stack.push({ method: null, path: null, handlers: [a].concat(rest) });\n      else stack.push({ method: null, path: a, handlers: rest });\n      return app;\n    };\n    app.listen = function () { return { close: function () {} }; };\n    apps.push(app);\n    return app;\n  }\n  express.json = function () { return function (req, res, next) { next(); }; };\n  express.urlencoded = express.json;\n  var jwt = {\n    verify: function (token, secret) {\n      if (token === 'valid.token.123' && secret) return { id: 7, email: 'student@kodax.app' };\n      var e = new Error('invalid token'); e.name = 'JsonWebTokenError'; throw e;\n    },\n    sign: function (payload) { return 'signed.' + JSON.stringify(payload); },\n    decode: function () { return null; }\n  };\n  var mocks = { express: express, jsonwebtoken: jwt };\n  var realRequire = require;\n  require = function (name) { return Object.prototype.hasOwnProperty.call(mocks, name) ? mocks[name] : realRequire(name); };\n  async function request(method, url, body, headers) {\n    var app = apps[apps.length - 1];\n    if (!app) throw new Error('لم يتم إنشاء تطبيق express');\n    var path = url.split('?')[0];\n    var req = { method: method, url: url, path: path, params: {}, query: {}, headers: lower(headers), ip: '127.0.0.1', body: body === undefined ? {} : JSON.parse(JSON.stringify(body)) };\n    var res = makeRes();\n    for (var i = 0; i < app._stack.length; i++) {\n      var layer = app._stack[i];\n      if (layer.method === null) { if (layer.path && path.indexOf(layer.path) !== 0) continue; }\n      else { if (layer.method !== method) continue; var p = matchPath(layer.path, path); if (!p) continue; req.params = p; }\n      var cont = await runChain(layer.handlers, req, res);\n      if (!cont || res.ended) break;\n    }\n    return res.ended ? { status: res.statusCode, body: res.body } : { status: 404, body: undefined };\n  }\n  async function middleware(fn, reqInit) {\n    var req = Object.assign({ headers: {}, ip: '127.0.0.1', body: {}, params: {}, query: {} }, reqInit || {});\n    req.headers = lower(req.headers);\n    var res = makeRes();\n    var nextCalled = false;\n    await new Promise(function (resolve) {\n      var done = false;\n      function fin() { if (!done) { done = true; resolve(); } }\n      try {\n        var out = fn(req, res, function () { nextCalled = true; fin(); });\n        if (out && typeof out.then === 'function') out.then(fin, fin);\n      } catch (e) { req.__error = String(e && e.message || e); fin(); }\n      if (res.ended) fin();\n      setTimeout(fin, 100);\n    });\n    return { next: nextCalled, status: res.ended ? res.statusCode : null, body: res.body, req: req };\n  }\n  return { req: request, mw: middleware, setNow: function (ms) { fakeNow = ms; } };\n})()"
 },
 "backend-ch-2": {
  "id": "backend-ch-2",
  "language": "SQL",
  "difficulty": "medium",
  "points": 80,
  "starterCode": "-- لديك جداول: users, posts, comments\n-- اكتب استعلام يرجع:\n-- اسم المستخدم، عدد منشوراته، عدد التعليقات على منشوراته\n-- مرتب حسب عدد المنشورات تنازلياً\n\nSELECT \n  -- اكتب الاستعلام هنا\nFROM users",
  "testCases": [
   {
    "input": "CREATE TABLE users(id INTEGER, name TEXT); CREATE TABLE posts(id INTEGER, user_id INTEGER); CREATE TABLE comments(id INTEGER, post_id INTEGER);\nINSERT INTO users VALUES (1,'Ali'),(2,'Sara'),(3,'Omar');\nINSERT INTO posts VALUES (1,1),(2,1),(3,2);\nINSERT INTO comments VALUES (1,1),(2,2),(3,3);",
    "expectedOutput": "Ali|2|2\nSara|1|1\nOmar|0|0",
    "description": "ثلاثة مستخدمين (أحدهم بدون منشورات)"
   },
   {
    "input": "CREATE TABLE users(id INTEGER, name TEXT); CREATE TABLE posts(id INTEGER, user_id INTEGER); CREATE TABLE comments(id INTEGER, post_id INTEGER);\nINSERT INTO users VALUES (1,'Ali'),(2,'Mona');\nINSERT INTO posts VALUES (1,2),(2,2),(3,1);\nINSERT INTO comments VALUES (1,1),(2,1),(3,1);",
    "expectedOutput": "Mona|2|3\nAli|1|0",
    "description": "منشور بدون تعليقات لا يُحسب تعليقاً",
    "hidden": true
   }
  ]
 },
 "backend-ch-3": {
  "id": "backend-ch-3",
  "language": "Node.js",
  "difficulty": "medium",
  "points": 60,
  "starterCode": "// أنشئ middleware يتحقق من وجود وصحة Token\n// Token يكون في Header: Authorization: Bearer <token>\n\nconst authMiddleware = (req, res, next) => {\n  // اكتب الكود هنا\n};\n\nmodule.exports = authMiddleware;",
  "testCases": [
   {
    "input": "const r = await __kx.mw(authMiddleware, { headers: {} }); r.status + ' ' + r.next",
    "expectedOutput": "401 false",
    "description": "بدون Header"
   },
   {
    "input": "const r = await __kx.mw(authMiddleware, { headers: { Authorization: 'Bearer valid.token.123' } }); r.next + ' ' + r.req.user.id",
    "expectedOutput": "true 7",
    "description": "توكن صالح ← next و req.user"
   },
   {
    "input": "const r = await __kx.mw(authMiddleware, { headers: { Authorization: 'Basic abc' } }); r.status + ' ' + r.next",
    "expectedOutput": "401 false",
    "description": "نوع Header خاطئ",
    "hidden": true
   },
   {
    "input": "const r = await __kx.mw(authMiddleware, { headers: { Authorization: 'Bearer wrong' } }); r.status + ' ' + r.next",
    "expectedOutput": "401 false",
    "description": "توكن غير صالح",
    "hidden": true
   },
   {
    "input": "const r = await __kx.mw(authMiddleware, { headers: { Authorization: 'valid.token.123' } }); r.status + ' ' + r.next",
    "expectedOutput": "401 false",
    "description": "توكن بدون Bearer",
    "hidden": true
   }
  ],
  "validation": "execution",
  "prelude": "\nvar __kx = (function () {\n  var apps = [];\n  var fakeNow = null;\n  var RealDate = Date;\n  function currentTime() { return fakeNow === null ? RealDate.now() : fakeNow; }\n  function FakeDate() {\n    var args = [].slice.call(arguments);\n    if (!(this instanceof FakeDate)) return new RealDate(currentTime()).toString();\n    if (args.length === 0) return new RealDate(currentTime());\n    return new (Function.prototype.bind.apply(RealDate, [null].concat(args)))();\n  }\n  FakeDate.now = currentTime;\n  FakeDate.parse = RealDate.parse;\n  FakeDate.UTC = RealDate.UTC;\n  FakeDate.prototype = RealDate.prototype;\n  Date = FakeDate;\n  var realSetInterval = setInterval;\n  setInterval = function () { var tm = realSetInterval.apply(null, arguments); if (tm && tm.unref) tm.unref(); return tm; };\n  if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'kodax-test-secret';\n  function lower(obj) { var o = {}; Object.keys(obj || {}).forEach(function (k) { o[k.toLowerCase()] = obj[k]; }); return o; }\n  function makeRes() {\n    var res = { statusCode: 200, body: undefined, ended: false, headers: {} };\n    res.status = function (c) { res.statusCode = c; return res; };\n    res.json = function (b) { res.body = b; res.ended = true; return res; };\n    res.send = function (b) { res.body = b; res.ended = true; return res; };\n    res.sendStatus = function (c) { res.statusCode = c; res.ended = true; return res; };\n    res.end = function () { res.ended = true; return res; };\n    res.set = function (k, v) { res.headers[k] = v; return res; };\n    res.setHeader = res.set;\n    return res;\n  }\n  function matchPath(pattern, path) {\n    var pp = String(pattern).split('/'), sp = path.split('/');\n    if (pp.length !== sp.length) return null;\n    var params = {};\n    for (var i = 0; i < pp.length; i++) {\n      if (pp[i].charAt(0) === ':') params[pp[i].slice(1)] = decodeURIComponent(sp[i]);\n      else if (pp[i] !== sp[i]) return null;\n    }\n    return params;\n  }\n  function runChain(fns, req, res) {\n    return new Promise(function (resolve, reject) {\n      var i = 0, done = false;\n      function finish(v) { if (!done) { done = true; resolve(v); } }\n      function next(err) {\n        if (done) return;\n        if (err) { done = true; return reject(err); }\n        var fn = fns[i++];\n        if (!fn) return finish(true);\n        var called = false;\n        var wrapped = function (e) { called = true; next(e); };\n        try {\n          var out = fn(req, res, wrapped);\n          if (out && typeof out.then === 'function') out.then(function () { if (res.ended && !called) finish(false); }, function (e) { done = true; reject(e); });\n        } catch (e) { done = true; return reject(e); }\n        if (res.ended && !called) return finish(false);\n        setTimeout(function () { if (!called) finish(false); }, 100);\n      }\n      next();\n    });\n  }\n  function express() {\n    var stack = [];\n    var app = { _stack: stack };\n    ['get', 'post', 'put', 'patch', 'delete'].forEach(function (m) {\n      app[m] = function (path) { stack.push({ method: m.toUpperCase(), path: path, handlers: [].slice.call(arguments, 1) }); return app; };\n    });\n    app.use = function (a) {\n      var rest = [].slice.call(arguments, 1);\n      if (typeof a === 'function') stack.push({ method: null, path: null, handlers: [a].concat(rest) });\n      else stack.push({ method: null, path: a, handlers: rest });\n      return app;\n    };\n    app.listen = function () { return { close: function () {} }; };\n    apps.push(app);\n    return app;\n  }\n  express.json = function () { return function (req, res, next) { next(); }; };\n  express.urlencoded = express.json;\n  var jwt = {\n    verify: function (token, secret) {\n      if (token === 'valid.token.123' && secret) return { id: 7, email: 'student@kodax.app' };\n      var e = new Error('invalid token'); e.name = 'JsonWebTokenError'; throw e;\n    },\n    sign: function (payload) { return 'signed.' + JSON.stringify(payload); },\n    decode: function () { return null; }\n  };\n  var mocks = { express: express, jsonwebtoken: jwt };\n  var realRequire = require;\n  require = function (name) { return Object.prototype.hasOwnProperty.call(mocks, name) ? mocks[name] : realRequire(name); };\n  async function request(method, url, body, headers) {\n    var app = apps[apps.length - 1];\n    if (!app) throw new Error('لم يتم إنشاء تطبيق express');\n    var path = url.split('?')[0];\n    var req = { method: method, url: url, path: path, params: {}, query: {}, headers: lower(headers), ip: '127.0.0.1', body: body === undefined ? {} : JSON.parse(JSON.stringify(body)) };\n    var res = makeRes();\n    for (var i = 0; i < app._stack.length; i++) {\n      var layer = app._stack[i];\n      if (layer.method === null) { if (layer.path && path.indexOf(layer.path) !== 0) continue; }\n      else { if (layer.method !== method) continue; var p = matchPath(layer.path, path); if (!p) continue; req.params = p; }\n      var cont = await runChain(layer.handlers, req, res);\n      if (!cont || res.ended) break;\n    }\n    return res.ended ? { status: res.statusCode, body: res.body } : { status: 404, body: undefined };\n  }\n  async function middleware(fn, reqInit) {\n    var req = Object.assign({ headers: {}, ip: '127.0.0.1', body: {}, params: {}, query: {} }, reqInit || {});\n    req.headers = lower(req.headers);\n    var res = makeRes();\n    var nextCalled = false;\n    await new Promise(function (resolve) {\n      var done = false;\n      function fin() { if (!done) { done = true; resolve(); } }\n      try {\n        var out = fn(req, res, function () { nextCalled = true; fin(); });\n        if (out && typeof out.then === 'function') out.then(fin, fin);\n      } catch (e) { req.__error = String(e && e.message || e); fin(); }\n      if (res.ended) fin();\n      setTimeout(fin, 100);\n    });\n    return { next: nextCalled, status: res.ended ? res.statusCode : null, body: res.body, req: req };\n  }\n  return { req: request, mw: middleware, setNow: function (ms) { fakeNow = ms; } };\n})()"
 },
 "backend-ch-4": {
  "id": "backend-ch-4",
  "language": "Node.js",
  "difficulty": "medium",
  "points": 70,
  "starterCode": "// أنشئ rate limiter بسيط\n// الحد: 100 طلب لكل IP كل دقيقة\n\nconst rateLimiter = (maxRequests, windowMs) => {\n  const requests = new Map();\n  \n  return (req, res, next) => {\n    // أكمل الكود\n  };\n};\n\n// الاستخدام:\n// app.use(rateLimiter(100, 60000));",
  "testCases": [
   {
    "input": "const lim = rateLimiter(2, 60000); const a = await __kx.mw(lim, { ip: '1.1.1.1' }); const b = await __kx.mw(lim, { ip: '1.1.1.1' }); const c = await __kx.mw(lim, { ip: '1.1.1.1' }); [a.next, b.next, c.next, c.status].join(' ')",
    "expectedOutput": "true true false 429",
    "description": "الطلب الثالث يُرفض بـ 429"
   },
   {
    "input": "const lim = rateLimiter(1, 60000); await __kx.mw(lim, { ip: 'a' }); const b = await __kx.mw(lim, { ip: 'b' }); b.next",
    "expectedOutput": "true",
    "description": "كل IP له عدّاده"
   },
   {
    "input": "__kx.setNow(1000000); const lim = rateLimiter(1, 60000); await __kx.mw(lim, { ip: 'a' }); const blocked = await __kx.mw(lim, { ip: 'a' }); __kx.setNow(1060001); const again = await __kx.mw(lim, { ip: 'a' }); blocked.status + ' ' + again.next",
    "expectedOutput": "429 true",
    "description": "بعد انتهاء النافذة يُسمح من جديد",
    "hidden": true
   },
   {
    "input": "__kx.setNow(1000000); const lim = rateLimiter(1, 60000); await __kx.mw(lim, { ip: 'a' }); __kx.setNow(1030000); const r = await __kx.mw(lim, { ip: 'a' }); r.status + ' ' + r.next",
    "expectedOutput": "429 false",
    "description": "داخل النافذة يبقى محظوراً",
    "hidden": true
   },
   {
    "input": "const lim = rateLimiter(3, 60000); const out = []; for (let i = 0; i < 4; i++) out.push((await __kx.mw(lim, { ip: 'x' })).next); out.join(' ')",
    "expectedOutput": "true true true false",
    "description": "الحد 3 طلبات",
    "hidden": true
   }
  ],
  "validation": "execution",
  "prelude": "\nvar __kx = (function () {\n  var apps = [];\n  var fakeNow = null;\n  var RealDate = Date;\n  function currentTime() { return fakeNow === null ? RealDate.now() : fakeNow; }\n  function FakeDate() {\n    var args = [].slice.call(arguments);\n    if (!(this instanceof FakeDate)) return new RealDate(currentTime()).toString();\n    if (args.length === 0) return new RealDate(currentTime());\n    return new (Function.prototype.bind.apply(RealDate, [null].concat(args)))();\n  }\n  FakeDate.now = currentTime;\n  FakeDate.parse = RealDate.parse;\n  FakeDate.UTC = RealDate.UTC;\n  FakeDate.prototype = RealDate.prototype;\n  Date = FakeDate;\n  var realSetInterval = setInterval;\n  setInterval = function () { var tm = realSetInterval.apply(null, arguments); if (tm && tm.unref) tm.unref(); return tm; };\n  if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'kodax-test-secret';\n  function lower(obj) { var o = {}; Object.keys(obj || {}).forEach(function (k) { o[k.toLowerCase()] = obj[k]; }); return o; }\n  function makeRes() {\n    var res = { statusCode: 200, body: undefined, ended: false, headers: {} };\n    res.status = function (c) { res.statusCode = c; return res; };\n    res.json = function (b) { res.body = b; res.ended = true; return res; };\n    res.send = function (b) { res.body = b; res.ended = true; return res; };\n    res.sendStatus = function (c) { res.statusCode = c; res.ended = true; return res; };\n    res.end = function () { res.ended = true; return res; };\n    res.set = function (k, v) { res.headers[k] = v; return res; };\n    res.setHeader = res.set;\n    return res;\n  }\n  function matchPath(pattern, path) {\n    var pp = String(pattern).split('/'), sp = path.split('/');\n    if (pp.length !== sp.length) return null;\n    var params = {};\n    for (var i = 0; i < pp.length; i++) {\n      if (pp[i].charAt(0) === ':') params[pp[i].slice(1)] = decodeURIComponent(sp[i]);\n      else if (pp[i] !== sp[i]) return null;\n    }\n    return params;\n  }\n  function runChain(fns, req, res) {\n    return new Promise(function (resolve, reject) {\n      var i = 0, done = false;\n      function finish(v) { if (!done) { done = true; resolve(v); } }\n      function next(err) {\n        if (done) return;\n        if (err) { done = true; return reject(err); }\n        var fn = fns[i++];\n        if (!fn) return finish(true);\n        var called = false;\n        var wrapped = function (e) { called = true; next(e); };\n        try {\n          var out = fn(req, res, wrapped);\n          if (out && typeof out.then === 'function') out.then(function () { if (res.ended && !called) finish(false); }, function (e) { done = true; reject(e); });\n        } catch (e) { done = true; return reject(e); }\n        if (res.ended && !called) return finish(false);\n        setTimeout(function () { if (!called) finish(false); }, 100);\n      }\n      next();\n    });\n  }\n  function express() {\n    var stack = [];\n    var app = { _stack: stack };\n    ['get', 'post', 'put', 'patch', 'delete'].forEach(function (m) {\n      app[m] = function (path) { stack.push({ method: m.toUpperCase(), path: path, handlers: [].slice.call(arguments, 1) }); return app; };\n    });\n    app.use = function (a) {\n      var rest = [].slice.call(arguments, 1);\n      if (typeof a === 'function') stack.push({ method: null, path: null, handlers: [a].concat(rest) });\n      else stack.push({ method: null, path: a, handlers: rest });\n      return app;\n    };\n    app.listen = function () { return { close: function () {} }; };\n    apps.push(app);\n    return app;\n  }\n  express.json = function () { return function (req, res, next) { next(); }; };\n  express.urlencoded = express.json;\n  var jwt = {\n    verify: function (token, secret) {\n      if (token === 'valid.token.123' && secret) return { id: 7, email: 'student@kodax.app' };\n      var e = new Error('invalid token'); e.name = 'JsonWebTokenError'; throw e;\n    },\n    sign: function (payload) { return 'signed.' + JSON.stringify(payload); },\n    decode: function () { return null; }\n  };\n  var mocks = { express: express, jsonwebtoken: jwt };\n  var realRequire = require;\n  require = function (name) { return Object.prototype.hasOwnProperty.call(mocks, name) ? mocks[name] : realRequire(name); };\n  async function request(method, url, body, headers) {\n    var app = apps[apps.length - 1];\n    if (!app) throw new Error('لم يتم إنشاء تطبيق express');\n    var path = url.split('?')[0];\n    var req = { method: method, url: url, path: path, params: {}, query: {}, headers: lower(headers), ip: '127.0.0.1', body: body === undefined ? {} : JSON.parse(JSON.stringify(body)) };\n    var res = makeRes();\n    for (var i = 0; i < app._stack.length; i++) {\n      var layer = app._stack[i];\n      if (layer.method === null) { if (layer.path && path.indexOf(layer.path) !== 0) continue; }\n      else { if (layer.method !== method) continue; var p = matchPath(layer.path, path); if (!p) continue; req.params = p; }\n      var cont = await runChain(layer.handlers, req, res);\n      if (!cont || res.ended) break;\n    }\n    return res.ended ? { status: res.statusCode, body: res.body } : { status: 404, body: undefined };\n  }\n  async function middleware(fn, reqInit) {\n    var req = Object.assign({ headers: {}, ip: '127.0.0.1', body: {}, params: {}, query: {} }, reqInit || {});\n    req.headers = lower(req.headers);\n    var res = makeRes();\n    var nextCalled = false;\n    await new Promise(function (resolve) {\n      var done = false;\n      function fin() { if (!done) { done = true; resolve(); } }\n      try {\n        var out = fn(req, res, function () { nextCalled = true; fin(); });\n        if (out && typeof out.then === 'function') out.then(fin, fin);\n      } catch (e) { req.__error = String(e && e.message || e); fin(); }\n      if (res.ended) fin();\n      setTimeout(fin, 100);\n    });\n    return { next: nextCalled, status: res.ended ? res.statusCode : null, body: res.body, req: req };\n  }\n  return { req: request, mw: middleware, setNow: function (ms) { fakeNow = ms; } };\n})()"
 },
 "backend-ch-5": {
  "id": "backend-ch-5",
  "language": "Node.js",
  "difficulty": "medium",
  "points": 80,
  "starterCode": "const mongoose = require('mongoose');\nconst express = require('express');\nconst app = express();\napp.use(express.json());\n\n// 1. أنشئ Schema للمنتج\n// الحقول: name, price, category, inStock\n\n// 2. أنشئ routes للـ CRUD\n\napp.listen(3000);",
  "testCases": [],
  "checks": [
   {
    "pattern": "new\\s+mongoose\\s*\\.\\s*Schema\\s*\\(",
    "message": "أنشئ Schema"
   },
   {
    "pattern": "required\\s*:\\s*true",
    "message": "اجعل name و price مطلوبين",
    "min": 2
   },
   {
    "pattern": "mongoose\\s*\\.\\s*model\\s*\\(",
    "message": "أنشئ model"
   },
   {
    "pattern": "app\\s*\\.\\s*post\\s*\\(",
    "message": "مسار الإنشاء POST"
   },
   {
    "pattern": "app\\s*\\.\\s*get\\s*\\(",
    "message": "مسارات القراءة GET"
   },
   {
    "pattern": "app\\s*\\.\\s*(put|patch)\\s*\\(",
    "message": "مسار التحديث PUT أو PATCH"
   },
   {
    "pattern": "app\\s*\\.\\s*delete\\s*\\(",
    "message": "مسار الحذف DELETE"
   },
   {
    "pattern": "status\\s*\\(\\s*404\\s*\\)",
    "message": "أرجع 404 إذا لم يوجد المنتج"
   }
  ],
  "validation": "structural"
 },
 "backend-ch-6": {
  "id": "backend-ch-6",
  "language": "Node.js",
  "difficulty": "hard",
  "points": 100,
  "starterCode": "const express = require('express');\nconst http = require('http');\nconst { Server } = require('socket.io');\n\nconst app = express();\nconst server = http.createServer(app);\nconst io = new Server(server);\n\n// أنشئ:\n// 1. حدث اتصال مستخدم جديد\n// 2. حدث إرسال رسالة\n// 3. حدث انضمام لغرفة\n// 4. حدث قطع الاتصال\n\nserver.listen(3000);",
  "testCases": [],
  "checks": [
   {
    "pattern": "io\\s*\\.\\s*on\\s*\\(\\s*['\"]connection['\"]",
    "message": "استمع لحدث connection"
   },
   {
    "pattern": "socket\\s*\\.\\s*on\\s*\\(\\s*['\"]message",
    "message": "استمع لحدث message"
   },
   {
    "pattern": "\\.\\s*emit\\s*\\(",
    "message": "ابث الرسائل بـ emit"
   },
   {
    "pattern": "socket\\s*\\.\\s*join\\s*\\(",
    "message": "انضم لغرفة بـ socket.join"
   },
   {
    "pattern": "\\.\\s*(to|in)\\s*\\(",
    "message": "ابث داخل الغرفة بـ to(room)"
   },
   {
    "pattern": "socket\\s*\\.\\s*on\\s*\\(\\s*['\"]disconnect['\"]",
    "message": "تعامل مع disconnect"
   }
  ],
  "validation": "structural"
 },
 "backend-ch-7": {
  "id": "backend-ch-7",
  "language": "Node.js",
  "difficulty": "medium",
  "points": 70,
  "starterCode": "const express = require('express');\nconst multer = require('multer');\nconst path = require('path');\n\nconst app = express();\n\n// أنشئ:\n// 1. storage configuration\n// 2. file filter (صور فقط)\n// 3. route لرفع ملف واحد\n// 4. route لرفع عدة ملفات\n\napp.listen(3000);",
  "testCases": [],
  "checks": [
   {
    "pattern": "multer\\s*\\.\\s*diskStorage\\s*\\(",
    "message": "أعدّ التخزين بـ multer.diskStorage"
   },
   {
    "pattern": "filename\\s*:",
    "message": "حدد اسم الملف"
   },
   {
    "pattern": "fileFilter",
    "message": "أضف fileFilter"
   },
   {
    "pattern": "mimetype|extname",
    "message": "افحص نوع الملف (mimetype أو extname)"
   },
   {
    "pattern": "limits\\s*:",
    "message": "حدد حجم الملف الأقصى (limits)"
   },
   {
    "pattern": "\\.\\s*single\\s*\\(",
    "message": "مسار لملف واحد upload.single"
   },
   {
    "pattern": "\\.\\s*array\\s*\\(",
    "message": "مسار لعدة ملفات upload.array"
   }
  ],
  "validation": "structural"
 },
 "backend-ch-8": {
  "id": "backend-ch-8",
  "language": "Node.js",
  "difficulty": "hard",
  "points": 90,
  "starterCode": "const express = require('express');\nconst Redis = require('ioredis');\n\nconst app = express();\nconst redis = new Redis();\n\n// أنشئ:\n// 1. middleware للـ caching\n// 2. route مع cache\n// 3. invalidation عند التحديث\n\napp.listen(3000);",
  "testCases": [],
  "checks": [
   {
    "pattern": "redis\\s*\\.\\s*get\\s*\\(",
    "message": "ابحث في الكاش بـ redis.get"
   },
   {
    "pattern": "JSON\\s*\\.\\s*parse",
    "message": "حوّل القيمة المخزنة بـ JSON.parse"
   },
   {
    "pattern": "redis\\s*\\.\\s*(setex|set)\\s*\\(",
    "message": "خزّن الرد بـ redis.setex"
   },
   {
    "pattern": "JSON\\s*\\.\\s*stringify",
    "message": "خزّن الرد بـ JSON.stringify"
   },
   {
    "pattern": "redis\\s*\\.\\s*del\\s*\\(",
    "message": "احذف الكاش عند التحديث بـ redis.del"
   },
   {
    "pattern": "next\\s*\\(\\s*\\)",
    "message": "استدعِ next() عند عدم وجود الكاش"
   }
  ],
  "validation": "structural"
 },
 "html-ch-form-001": {
  "id": "html-ch-form-001",
  "language": "HTML",
  "difficulty": "medium",
  "points": 60,
  "starterCode": "<!-- أنشئ نموذج تسجيل يحتوي على:\n- الاسم الكامل (مطلوب)\n- البريد الإلكتروني (مطلوب)\n- كلمة المرور (8 أحرف على الأقل)\n- تأكيد كلمة المرور\n- رقم الهاتف (11 رقم)\n- تاريخ الميلاد\n- الجنس (ذكر/أنثى)\n- الموافقة على الشروط\n-->\n\n<form>\n  <!-- اكتب كودك هنا -->\n</form>",
  "testCases": [],
  "checks": [
   {
    "pattern": "<form",
    "message": "أنشئ <form>"
   },
   {
    "pattern": "type\\s*=\\s*[\"']email[\"']",
    "message": "حقل type=\"email\""
   },
   {
    "pattern": "\\brequired\\b",
    "message": "اجعل الحقول الأساسية required",
    "min": 2
   },
   {
    "pattern": "type\\s*=\\s*[\"']password[\"']",
    "message": "حقلا كلمة المرور والتأكيد",
    "min": 2
   },
   {
    "pattern": "minlength\\s*=\\s*[\"']?8",
    "message": "كلمة المرور 8 أحرف على الأقل (minlength=\"8\")"
   },
   {
    "pattern": "type\\s*=\\s*[\"']tel[\"']",
    "message": "حقل هاتف type=\"tel\""
   },
   {
    "pattern": "pattern\\s*=",
    "message": "تحقق من رقم الهاتف بـ pattern"
   },
   {
    "pattern": "type\\s*=\\s*[\"']date[\"']",
    "message": "حقل تاريخ type=\"date\""
   },
   {
    "pattern": "type\\s*=\\s*[\"']radio[\"']",
    "message": "خياران للجنس type=\"radio\"",
    "min": 2
   },
   {
    "pattern": "type\\s*=\\s*[\"']checkbox[\"']",
    "message": "موافقة على الشروط type=\"checkbox\""
   },
   {
    "pattern": "<button[^>]*type\\s*=\\s*[\"']submit[\"']|<input[^>]*type\\s*=\\s*[\"']submit[\"']",
    "message": "زر إرسال submit"
   }
  ],
  "validation": "structural"
 },
 "html-ch-semantic-001": {
  "id": "html-ch-semantic-001",
  "language": "HTML",
  "difficulty": "easy",
  "points": 40,
  "starterCode": "<!-- حول هذه الصفحة لتستخدم عناصر HTML5 الدلالية -->\n<div class=\"header\">\n  <div class=\"logo\">مدونتي</div>\n  <div class=\"nav\">\n    <a href=\"/\">الرئيسية</a>\n    <a href=\"/about\">من نحن</a>\n  </div>\n</div>\n\n<div class=\"main\">\n  <div class=\"article\">\n    <div class=\"article-header\">\n      <h1>عنوان المقال</h1>\n      <span>15 يناير 2024</span>\n    </div>\n    <div class=\"article-content\">\n      <p>محتوى المقال...</p>\n    </div>\n  </div>\n  \n  <div class=\"sidebar\">\n    <h2>مقالات أخرى</h2>\n  </div>\n</div>\n\n<div class=\"footer\">\n  <p>حقوق النشر 2024</p>\n</div>",
  "testCases": [],
  "checks": [
   {
    "pattern": "<header",
    "message": "استبدل div.header بـ <header>"
   },
   {
    "pattern": "<nav",
    "message": "استبدل div.nav بـ <nav>"
   },
   {
    "pattern": "<main",
    "message": "استبدل div.main بـ <main>"
   },
   {
    "pattern": "<article",
    "message": "استخدم <article> للمقال"
   },
   {
    "pattern": "<aside",
    "message": "استخدم <aside> للشريط الجانبي"
   },
   {
    "pattern": "<footer",
    "message": "أضف <footer>"
   },
   {
    "pattern": "<time",
    "message": "ضع التاريخ داخل <time>"
   },
   {
    "pattern": "<div[^>]*class\\s*=\\s*[\"'](header|nav|main|article|sidebar|footer)[\"']",
    "message": "لا تستخدم div بأسماء العناصر الدلالية",
    "forbid": true
   }
  ],
  "validation": "structural"
 },
 "html-ch-table-001": {
  "id": "html-ch-table-001",
  "language": "HTML",
  "difficulty": "easy",
  "points": 30,
  "starterCode": "<!-- أنشئ جدول درجات يحتوي على:\n- رأس الجدول (thead) مع أعمدة: الاسم، الرياضيات، العلوم، المعدل\n- 3 طلاب على الأقل (tbody)\n- تذييل (tfoot) يعرض المعدل العام\n- استخدم colspan عند الحاجة\n-->\n\n<table>\n  <!-- اكتب كودك هنا -->\n</table>",
  "testCases": [],
  "checks": [
   {
    "pattern": "<thead",
    "message": "أضف <thead>"
   },
   {
    "pattern": "<th[\\s>]",
    "message": "أربعة عناوين أعمدة <th>",
    "min": 4
   },
   {
    "pattern": "<tbody",
    "message": "أضف <tbody>"
   },
   {
    "pattern": "<tr[\\s>]",
    "message": "صف العناوين + 3 طلاب + صف المعدل",
    "min": 5
   },
   {
    "pattern": "<tfoot",
    "message": "أضف <tfoot>"
   },
   {
    "pattern": "colspan\\s*=",
    "message": "استخدم colspan في التذييل"
   }
  ],
  "validation": "structural"
 },
 "html-ch-media-001": {
  "id": "html-ch-media-001",
  "language": "HTML",
  "difficulty": "easy",
  "points": 35,
  "starterCode": "<!-- أنشئ صفحة وسائط تحتوي على:\n1. فيديو مع عناصر التحكم وposter\n2. ملف صوتي مع عناصر التحكم\n3. صورة مع figure و figcaption\n4. استخدم source لدعم صيغ متعددة\n-->\n\n<div>\n  <!-- اكتب كودك هنا -->\n</div>",
  "testCases": [],
  "checks": [
   {
    "pattern": "<video[^>]*\\bcontrols\\b",
    "message": "فيديو مع controls"
   },
   {
    "pattern": "<video[^>]*\\bposter\\s*=",
    "message": "أضف poster للفيديو"
   },
   {
    "pattern": "<audio[^>]*\\bcontrols\\b",
    "message": "صوت مع controls"
   },
   {
    "pattern": "<source",
    "message": "استخدم <source> لصيغ متعددة",
    "min": 2
   },
   {
    "pattern": "<figure",
    "message": "استخدم <figure>"
   },
   {
    "pattern": "<figcaption",
    "message": "أضف <figcaption>"
   },
   {
    "pattern": "<img[^>]*alt\\s*=",
    "message": "صورة مع نص بديل alt"
   }
  ],
  "validation": "structural"
 },
 "html-ch-nav-001": {
  "id": "html-ch-nav-001",
  "language": "HTML",
  "difficulty": "medium",
  "points": 55,
  "starterCode": "<!-- أنشئ شريط تنقل يحتوي على:\n1. شعار الموقع\n2. روابط رئيسية (الرئيسية، الدورات، المقالات، اتصل بنا)\n3. قائمة منسدلة تحت \"الدورات\" (HTML, CSS, JS)\n4. استخدم العناصر الدلالية المناسبة\n-->\n\n<nav>\n  <!-- اكتب كودك هنا -->\n</nav>",
  "testCases": [],
  "checks": [
   {
    "pattern": "<nav",
    "message": "استخدم <nav>"
   },
   {
    "pattern": "<ul",
    "message": "قائمة رئيسية وقائمة منسدلة <ul>",
    "min": 2
   },
   {
    "pattern": "<a[^>]*href",
    "message": "4 روابط رئيسية + 3 في القائمة المنسدلة + الشعار",
    "min": 7
   },
   {
    "pattern": "الدورات",
    "message": "رابط \"الدورات\""
   },
   {
    "pattern": ">\\s*HTML\\s*<",
    "message": "رابط HTML في القائمة المنسدلة"
   },
   {
    "pattern": ">\\s*(JS|JavaScript)\\s*<",
    "message": "رابط JavaScript في القائمة المنسدلة"
   },
   {
    "pattern": ":hover",
    "message": "أظهر القائمة المنسدلة عند المرور (:hover)"
   }
  ],
  "validation": "structural"
 },
 "html-ch-faq-001": {
  "id": "html-ch-faq-001",
  "language": "HTML",
  "difficulty": "medium",
  "points": 45,
  "starterCode": "<!-- أنشئ صفحة أسئلة شائعة تحتوي على:\n1. عنوان رئيسي\n2. 5 أسئلة على الأقل باستخدام <details> و <summary>\n3. أحد الأسئلة مفتوح افتراضياً (open)\n4. أضف تنسيق CSS مناسب\n-->\n\n<section>\n  <h1>الأسئلة الشائعة</h1>\n  <!-- اكتب كودك هنا -->\n</section>",
  "testCases": [],
  "checks": [
   {
    "pattern": "<details",
    "message": "خمسة عناصر <details>",
    "min": 5
   },
   {
    "pattern": "<summary",
    "message": "خمسة عناصر <summary>",
    "min": 5
   },
   {
    "pattern": "<details[^>]*\\sopen\\b",
    "message": "اجعل سؤالاً مفتوحاً بخاصية open"
   },
   {
    "pattern": "<style|style\\s*=",
    "message": "أضف تنسيق CSS"
   }
  ],
  "validation": "structural"
 },
 "git-ch-basics-001": {
  "id": "git-ch-basics-001",
  "language": "Git",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "# رتب الأوامر بالترتيب الصحيح لرفع مشروع:\n# A: git push -u origin main\n# B: git add .\n# C: git init\n# D: git commit -m \"first commit\"\n# E: git remote add origin URL\n\n# الترتيب الصحيح:\n# 1. ?\n# 2. ?\n# 3. ?\n# 4. ?\n# 5. ?",
  "testCases": [],
  "checks": [
   {
    "pattern": "git\\s+init[\\s\\S]*git\\s+add[\\s\\S]*git\\s+commit[\\s\\S]*git\\s+remote\\s+add[\\s\\S]*git\\s+push",
    "message": "الترتيب: init ← add ← commit ← remote add ← push"
   },
   {
    "pattern": "git\\s+commit\\s+-m\\s+[\"']",
    "message": "أضف رسالة للـ commit بـ -m \"...\""
   },
   {
    "pattern": "git\\s+push\\s+(-u\\s+)?origin",
    "message": "ارفع إلى origin"
   }
  ],
  "validation": "structural"
 },
 "json-ch-001": {
  "id": "json-ch-001",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "// المطلوب: اكتب دالة تأخذ كائن JavaScript وتُرجع:\n// 1. تحويله لـ JSON string\n// 2. ثم إعادة تحويله لـ Object\n// 3. إرجاع قيمة name من الكائن الناتج\n\nfunction processJSON(obj) {\n  // اكتب الكود هنا\n}",
  "testCases": [
   {
    "input": "{\"name\": \"سارة\", \"age\": 22}",
    "expectedOutput": "سارة",
    "description": "استرجاع البيانات بنجاح"
   },
   {
    "input": "{\"name\": \"أحمد\", \"skills\": [\"JS\"]}",
    "expectedOutput": "أحمد",
    "description": "استرجاع اسم من كائن مختلف"
   },
   {
    "input": "{\"name\": \"\"}",
    "expectedOutput": "",
    "description": "اسم فارغ",
    "hidden": true
   }
  ]
 },
 "web-ch-slugify-001": {
  "id": "web-ch-slugify-001",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "function slugify(text) {\n  // حوّل النص إلى slug\n  // مثال: \"Hello World\" → \"hello-world\"\n}",
  "testCases": [
   {
    "input": "\"Hello World\"",
    "expectedOutput": "hello-world",
    "description": "نص بسيط"
   },
   {
    "input": "\"  Learn JavaScript!  \"",
    "expectedOutput": "learn-javascript",
    "description": "مسافات وعلامات"
   },
   {
    "input": "\"API Design 101\"",
    "expectedOutput": "api-design-101",
    "description": "نص مع أرقام"
   },
   {
    "input": "\"Hello   World\"",
    "expectedOutput": "hello-world",
    "description": "مسافات متعددة",
    "hidden": true
   },
   {
    "input": "\"C++ & Python\"",
    "expectedOutput": "c-python",
    "description": "رموز تُحذف",
    "hidden": true
   }
  ]
 },
 "web-ch-querystring-001": {
  "id": "web-ch-querystring-001",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "function parseQueryString(query) {\n  // حلّل query string مثل \"name=ali&age=25\"\n  // أرجع object { name: \"ali\", age: \"25\" }\n}",
  "testCases": [
   {
    "input": "\"name=ali&age=25\"",
    "expectedOutput": "{\"name\":\"ali\",\"age\":\"25\"}",
    "description": "معاملين"
   },
   {
    "input": "\"key=value\"",
    "expectedOutput": "{\"key\":\"value\"}",
    "description": "معامل واحد"
   },
   {
    "input": "\"\"",
    "expectedOutput": "{}",
    "description": "نص فارغ",
    "hidden": true
   },
   {
    "input": "\"q=hello%20world\"",
    "expectedOutput": "{\"q\": \"hello world\"}",
    "description": "فك الترميز",
    "hidden": true
   }
  ]
 },
 "web-ch-truncate-001": {
  "id": "web-ch-truncate-001",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "function truncate(text, maxLength) {\n  // اقتطع النص إذا تجاوز maxLength\n  // أضف \"...\" في النهاية\n}",
  "testCases": [
   {
    "input": "\"Hello World\", 8",
    "expectedOutput": "Hello...",
    "description": "اقتطاع نص طويل"
   },
   {
    "input": "\"Hi\", 10",
    "expectedOutput": "Hi",
    "description": "نص أقصر من الحد"
   },
   {
    "input": "\"abcdef\", 6",
    "expectedOutput": "abcdef",
    "description": "بالضبط الحد",
    "hidden": true
   },
   {
    "input": "\"abcdefg\", 6",
    "expectedOutput": "abc...",
    "description": "أطول بحرف",
    "hidden": true
   }
  ]
 },
 "web-ch-camelcase-001": {
  "id": "web-ch-camelcase-001",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "function toCamelCase(str) {\n  // حوّل \"hello-world\" أو \"hello_world\" إلى \"helloWorld\"\n}",
  "testCases": [
   {
    "input": "\"hello-world\"",
    "expectedOutput": "helloWorld",
    "description": "dash-case"
   },
   {
    "input": "\"background_color\"",
    "expectedOutput": "backgroundColor",
    "description": "snake_case"
   },
   {
    "input": "\"simple\"",
    "expectedOutput": "simple",
    "description": "كلمة واحدة"
   },
   {
    "input": "\"my-long_variable-name\"",
    "expectedOutput": "myLongVariableName",
    "description": "فواصل مختلطة",
    "hidden": true
   },
   {
    "input": "\"a-b\"",
    "expectedOutput": "aB",
    "description": "كلمتان قصيرتان",
    "hidden": true
   }
  ]
 },
 "web-ch-flatten-obj-001": {
  "id": "web-ch-flatten-obj-001",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "function flattenObject(obj) {\n  // سطّح {a: {b: 1}} إلى {\"a.b\": 1}\n}",
  "testCases": [
   {
    "input": "{\"a\": {\"b\": 1}}",
    "expectedOutput": "{\"a.b\":1}",
    "description": "مستوى واحد"
   },
   {
    "input": "{\"x\": 1, \"y\": 2}",
    "expectedOutput": "{\"x\":1,\"y\":2}",
    "description": "بدون تداخل"
   },
   {
    "input": "{\"a\": {\"b\": {\"c\": 1}}, \"d\": [1, 2]}",
    "expectedOutput": "{\"a.b.c\": 1, \"d\": [1, 2]}",
    "description": "تداخل ثلاثي ومصفوفة",
    "hidden": true
   },
   {
    "input": "{}",
    "expectedOutput": "{}",
    "description": "كائن فارغ",
    "hidden": true
   }
  ]
 },
 "web-ch-htmlentity-001": {
  "id": "web-ch-htmlentity-001",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "function encodeHTML(str) {\n  // حوّل < > & \" ' إلى HTML entities\n}",
  "testCases": [
   {
    "input": "\"<h1>Hello</h1>\"",
    "expectedOutput": "&lt;h1&gt;Hello&lt;/h1&gt;",
    "description": "ترميز وسوم HTML"
   },
   {
    "input": "\"a & b\"",
    "expectedOutput": "a &amp; b",
    "description": "ترميز &"
   },
   {
    "input": "\"'\"",
    "expectedOutput": "&#39;",
    "description": "علامة اقتباس مفردة",
    "hidden": true
   },
   {
    "input": "\"plain\"",
    "expectedOutput": "plain",
    "description": "نص بدون رموز",
    "hidden": true
   }
  ]
 },
 "web-ch-debounce-impl-001": {
  "id": "web-ch-debounce-impl-001",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "function debounce(fn, delay) {\n  // أرجع دالة جديدة تؤخّر التنفيذ\n  // إذا استُدعيت مرة أخرى قبل انتهاء التأخير، ألغِ السابقة\n}",
  "testCases": [
   {
    "input": "const calls = []; const d = debounce((x) => calls.push(x), 40); d(\"a\"); d(\"b\"); await new Promise((r) => setTimeout(r, 120)); calls",
    "expectedOutput": "[\"b\"]",
    "description": "آخر استدعاء فقط"
   },
   {
    "input": "let n = 0; const d = debounce(() => n++, 40); d(); n",
    "expectedOutput": "0",
    "description": "لا يُنفذ فوراً",
    "hidden": true
   },
   {
    "input": "let n = 0; const d = debounce(() => n++, 20); d(); await new Promise((r) => setTimeout(r, 60)); d(); await new Promise((r) => setTimeout(r, 60)); n",
    "expectedOutput": "2",
    "description": "استدعاءات متباعدة",
    "hidden": true
   }
  ]
 },
 "cyber-ch-http-001": {
  "id": "cyber-ch-http-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 40,
  "starterCode": "def parse_http_request(request_text):\n    \"\"\"\n    حلل HTTP request وأرجع قاموساً فيه:\n    - method  (GET, POST, ...)\n    - path    (/index.html)\n    - version (HTTP/1.1)\n    - headers (قاموس: اسم الرأس ← قيمته)\n    \"\"\"\n    # اكتب كودك هنا\n    pass\n\n# تجربة\nrequest = \"\"\"GET /index.html HTTP/1.1\nHost: example.com\nUser-Agent: Mozilla/5.0\n\"\"\"\n\ninfo = parse_http_request(request)\nprint(info)",
  "testCases": [
   {
    "input": "parse_http_request(\"GET /index.html HTTP/1.1\")[\"method\"]",
    "expectedOutput": "GET",
    "description": "استخراج HTTP method"
   },
   {
    "input": "parse_http_request(\"POST /api/users HTTP/1.1\")[\"method\"]",
    "expectedOutput": "POST",
    "description": "استخراج method من POST request"
   },
   {
    "input": "parse_http_request(\"GET / HTTP/2\")[\"version\"]",
    "expectedOutput": "HTTP/2",
    "description": "استخراج الإصدار",
    "hidden": true
   },
   {
    "input": "parse_http_request(\"GET /index.html HTTP/1.1\")[\"path\"]",
    "expectedOutput": "/index.html",
    "description": "استخراج المسار"
   },
   {
    "input": "parse_http_request(\"GET /a HTTP/1.1\\nHost: kodax.app\")[\"headers\"][\"Host\"]",
    "expectedOutput": "kodax.app",
    "description": "قراءة Header",
    "hidden": true
   },
   {
    "input": "parse_http_request(\"DELETE /api/1 HTTP/2\")[\"method\"]",
    "expectedOutput": "DELETE",
    "description": "طريقة أخرى",
    "hidden": true
   }
  ]
 },
 "cyber-ch-csrf-001": {
  "id": "cyber-ch-csrf-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 60,
  "starterCode": "import secrets\nimport hmac\nimport hashlib\n\ndef generate_csrf_token(secret_key, user_id):\n    \"\"\"\n    ولّد CSRF token فريد للمستخدم\n    \n    Args:\n        secret_key: مفتاح سري للتطبيق\n        user_id: معرّف المستخدم\n    \n    Returns:\n        token string\n    \"\"\"\n    # اكتب كودك هنا\n    pass\n\ndef verify_csrf_token(token, secret_key, user_id):\n    \"\"\"\n    تحقق من صحة CSRF token\n    \n    Args:\n        token: التوكن المُرسل\n        secret_key: مفتاح سري للتطبيق\n        user_id: معرّف المستخدم\n    \n    Returns:\n        True/False\n    \"\"\"\n    # اكتب كودك هنا\n    pass\n\n# اختبار\nsecret = \"my_secret_key_123\"\nuser = \"user_456\"\n\ntoken = generate_csrf_token(secret, user)\nprint(f\"Token: {token}\")\n\nis_valid = verify_csrf_token(token, secret, user)\nprint(f\"Valid: {is_valid}\")",
  "testCases": [
   {
    "input": "verify_csrf_token(generate_csrf_token(\"secret\", \"user123\"), \"secret\", \"user123\")",
    "expectedOutput": "True",
    "description": "توليد وتحقق لنفس المستخدم"
   },
   {
    "input": "verify_csrf_token(generate_csrf_token(\"secret\", \"user123\"), \"secret\", \"different_user\")",
    "expectedOutput": "False",
    "description": "توكن لمستخدم مختلف يُرفض"
   },
   {
    "input": "verify_csrf_token(generate_csrf_token(\"secret\", \"admin_user\"), \"secret\", \"admin_user\")",
    "expectedOutput": "True",
    "description": "توليد وتحقق لمستخدم آخر"
   }
  ]
 },
 "cyber-ch-hash-001": {
  "id": "cyber-ch-hash-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 70,
  "starterCode": "import hashlib\n\ndef crack_md5(target_hash, wordlist):\n    \"\"\"\n    حاول كسر هاش MD5 باستخدام قائمة كلمات\n    \n    Args:\n        target_hash: الهاش المراد كسره\n        wordlist: قائمة بالكلمات المحتملة\n    \n    Returns:\n        الكلمة الأصلية أو None\n    \"\"\"\n    # اكتب كودك هنا\n    pass\n\n# اختبار\nwordlist = ['password', '123456', 'admin', 'letmein', 'welcome', 'monkey', 'dragon']\ntarget = '21232f297a57a5a743894a0e4a801fc3'  # admin\n\nresult = crack_md5(target, wordlist)\nprint(f\"الكلمة: {result}\")",
  "testCases": [
   {
    "input": "\"5f4dcc3b5aa765d61d8327deb882cf99\", [\"password\", \"admin\", \"123456\"]",
    "expectedOutput": "password",
    "description": "كسر hash لكلمة password"
   },
   {
    "input": "\"abc123\", [\"test\", \"hello\"]",
    "expectedOutput": "None",
    "description": "كلمة غير موجودة في القائمة"
   },
   {
    "input": "\"21232f297a57a5a743894a0e4a801fc3\", [\"root\", \"admin\"]",
    "expectedOutput": "admin",
    "description": "كلمة في آخر القائمة",
    "hidden": true
   },
   {
    "input": "\"21232f297a57a5a743894a0e4a801fc3\", []",
    "expectedOutput": "None",
    "description": "قائمة فارغة",
    "hidden": true
   }
  ]
 },
 "cyber-ch-xss-001": {
  "id": "cyber-ch-xss-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 60,
  "starterCode": "def sanitize_input(user_input):\n    \"\"\"\n    تنظيف المدخلات من أكواد XSS\n    \n    يجب تحويل: < > \" ' & إلى HTML entities\n    \n    Args:\n        user_input: النص المدخل من المستخدم\n    \n    Returns:\n        النص المنظف\n    \"\"\"\n    # اكتب كودك هنا\n    pass\n\n# اختبار\nmalicious = '<script>alert(\"XSS\")</script>'\nsafe = sanitize_input(malicious)\nprint(safe)  # يجب أن يكون آمناً للعرض",
  "testCases": [
   {
    "input": "\"<script>\"",
    "expectedOutput": "&lt;script&gt;",
    "description": "تحويل وسوم script"
   },
   {
    "input": "'Hello \"World\"'",
    "expectedOutput": "Hello &quot;World&quot;",
    "description": "تحويل علامات الاقتباس"
   },
   {
    "input": "\"\"",
    "expectedOutput": "",
    "description": "نص فارغ",
    "hidden": true
   },
   {
    "input": "\"a/b\"",
    "expectedOutput": "a&#x2F;b",
    "description": "شرطة مائلة",
    "hidden": true
   },
   {
    "input": "\"Tom & Jerry\"",
    "expectedOutput": "Tom &amp; Jerry",
    "description": "علامة &",
    "hidden": true
   }
  ]
 },
 "cyber-ch-base64-001": {
  "id": "cyber-ch-base64-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 20,
  "starterCode": "def base64_encode(text):\n    # شفّر النص إلى Base64\n    pass",
  "testCases": [
   {
    "input": "\"Hello\"",
    "expectedOutput": "SGVsbG8=",
    "description": "تشفير Hello"
   },
   {
    "input": "\"Python\"",
    "expectedOutput": "UHl0aG9u",
    "description": "تشفير Python"
   },
   {
    "input": "\"AB\"",
    "expectedOutput": "QUI=",
    "description": "تشفير نص قصير"
   },
   {
    "input": "\"\"",
    "expectedOutput": "",
    "description": "نص فارغ",
    "hidden": true
   },
   {
    "input": "\"a\"",
    "expectedOutput": "YQ==",
    "description": "حرف واحد (حشو ==)",
    "hidden": true
   },
   {
    "input": "\"Man\"",
    "expectedOutput": "TWFu",
    "description": "ثلاثة أحرف بدون حشو",
    "hidden": true
   },
   {
    "input": "\"مرحبا\"",
    "expectedOutput": "2YXYsdit2KjYpw==",
    "description": "نص عربي (UTF-8)",
    "hidden": true
   }
  ],
  "checks": [
   {
    "pattern": "\\bimport\\s+base64|\\bfrom\\s+base64\\b|b64encode",
    "message": "نفّذ الترميز يدوياً دون استخدام مكتبة base64",
    "forbid": true
   }
  ]
 },
 "cyber-ch-vigenere-001": {
  "id": "cyber-ch-vigenere-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "def vigenere_encrypt(plaintext, key):\n    # شفّر النص باستخدام مفتاح فيجنير\n    # الأحرف الكبيرة فقط\n    pass",
  "testCases": [
   {
    "input": "\"HELLO\", \"KEY\"",
    "expectedOutput": "RIJVS",
    "description": "تشفير HELLO بمفتاح KEY"
   },
   {
    "input": "\"ABC\", \"A\"",
    "expectedOutput": "ABC",
    "description": "مفتاح A لا يغيّر"
   },
   {
    "input": "\"ATTACK AT DAWN\", \"LEMON\"",
    "expectedOutput": "LXFOPV EF RNHR",
    "description": "المثال الكلاسيكي مع مسافات",
    "hidden": true
   },
   {
    "input": "\"hello\", \"key\"",
    "expectedOutput": "RIJVS",
    "description": "أحرف صغيرة",
    "hidden": true
   }
  ]
 },
 "cyber-ch-ipvalidator-001": {
  "id": "cyber-ch-ipvalidator-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "def is_valid_ipv4(ip):\n    # تحقق من صحة عنوان IPv4\n    # أرجع True أو False\n    pass",
  "testCases": [
   {
    "input": "\"192.168.1.1\"",
    "expectedOutput": "True",
    "description": "IP صالح"
   },
   {
    "input": "\"256.1.1.1\"",
    "expectedOutput": "False",
    "description": "قيمة أكبر من 255"
   },
   {
    "input": "\"1.2.3\"",
    "expectedOutput": "False",
    "description": "3 أجزاء فقط"
   },
   {
    "input": "\"01.01.01.01\"",
    "expectedOutput": "False",
    "description": "أصفار بادئة"
   },
   {
    "input": "\"0.0.0.0\"",
    "expectedOutput": "True",
    "description": "كل الأجزاء صفر",
    "hidden": true
   },
   {
    "input": "\"255.255.255.255\"",
    "expectedOutput": "True",
    "description": "القيمة القصوى",
    "hidden": true
   },
   {
    "input": "\"1.2.3.4.5\"",
    "expectedOutput": "False",
    "description": "خمسة أجزاء",
    "hidden": true
   },
   {
    "input": "\"a.b.c.d\"",
    "expectedOutput": "False",
    "description": "أحرف",
    "hidden": true
   },
   {
    "input": "\"\"",
    "expectedOutput": "False",
    "description": "نص فارغ",
    "hidden": true
   }
  ]
 },
 "cyber-ch-urlparse-001": {
  "id": "cyber-ch-urlparse-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "def parse_url(url):\n    # استخرج protocol, domain, path من URL\n    # أرجع dict\n    pass",
  "testCases": [
   {
    "input": "parse_url(\"https://example.com/page\")[\"protocol\"]",
    "expectedOutput": "https",
    "description": "استخراج البروتوكول"
   },
   {
    "input": "parse_url(\"http://test.org\")[\"protocol\"]",
    "expectedOutput": "http",
    "description": "بروتوكول HTTP"
   },
   {
    "input": "parse_url(\"https://example.com/page\")[\"domain\"]",
    "expectedOutput": "example.com",
    "description": "استخراج النطاق"
   },
   {
    "input": "parse_url(\"http://test.org\")[\"path\"]",
    "expectedOutput": "/",
    "description": "مسار افتراضي",
    "hidden": true
   },
   {
    "input": "parse_url(\"https://kodax.app/a/b\")[\"path\"]",
    "expectedOutput": "/a/b",
    "description": "مسار متعدد",
    "hidden": true
   }
  ]
 },
 "cyber-ch-emailval-001": {
  "id": "cyber-ch-emailval-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "def is_valid_email(email):\n    # تحقق من صحة عنوان البريد\n    # أرجع True أو False\n    pass",
  "testCases": [
   {
    "input": "\"user@example.com\"",
    "expectedOutput": "True",
    "description": "بريد صالح"
   },
   {
    "input": "\"invalid@\"",
    "expectedOutput": "False",
    "description": "بدون نطاق"
   },
   {
    "input": "\"no-at-sign.com\"",
    "expectedOutput": "False",
    "description": "بدون @"
   },
   {
    "input": "\"test@site.org\"",
    "expectedOutput": "True",
    "description": "بريد صالح .org"
   },
   {
    "input": "\"a@b.co\"",
    "expectedOutput": "True",
    "description": "أقصر بريد صالح",
    "hidden": true
   },
   {
    "input": "\"a@b\"",
    "expectedOutput": "False",
    "description": "بدون امتداد",
    "hidden": true
   },
   {
    "input": "\"a b@c.com\"",
    "expectedOutput": "False",
    "description": "مسافة",
    "hidden": true
   }
  ]
 },
 "cyber-ch-hash-compare-001": {
  "id": "cyber-ch-hash-compare-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "def hash_password(password):\n    # أرجع SHA-256 hash للكلمة\n    pass\n\ndef verify_password(password, hash_value):\n    # تحقق إذا password يطابق hash_value\n    pass",
  "testCases": [
   {
    "input": "\"hello\"",
    "expectedOutput": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    "description": "hash كلمة hello"
   },
   {
    "input": "\"test\"",
    "expectedOutput": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    "description": "hash كلمة test"
   },
   {
    "input": "verify_password(\"hello\", hash_password(\"hello\"))",
    "expectedOutput": "True",
    "description": "كلمة صحيحة"
   },
   {
    "input": "verify_password(\"hello\", hash_password(\"Hello\"))",
    "expectedOutput": "False",
    "description": "حالة الأحرف مختلفة",
    "hidden": true
   },
   {
    "input": "verify_password(\"\", hash_password(\"\"))",
    "expectedOutput": "True",
    "description": "كلمة فارغة",
    "hidden": true
   }
  ]
 },
 "cyber-ch-jwt-decode-001": {
  "id": "cyber-ch-jwt-decode-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "def decode_jwt(token):\n    # فك JWT واستخرج payload\n    # أرجع dict\n    pass",
  "testCases": [
   {
    "input": "decode_jwt(\"eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.sig\")[\"user\"]",
    "expectedOutput": "admin",
    "description": "استخراج user من JWT"
   },
   {
    "input": "decode_jwt(\"eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoidGVzdCJ9.sig\")[\"name\"]",
    "expectedOutput": "test",
    "description": "استخراج name من JWT"
   },
   {
    "input": "decode_jwt(\"invalid.token\")",
    "expectedOutput": "None",
    "description": "توكن غير صالح"
   }
  ]
 },
 "cyber-ch-bruteforce-001": {
  "id": "cyber-ch-bruteforce-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 50,
  "starterCode": "def brute_force_count(charset, length):\n    # احسب عدد التركيبات الممكنة\n    # charset = مجموعة الحروف المتاحة\n    # length = طول كلمة المرور\n    pass",
  "testCases": [
   {
    "input": "\"abc\", 2",
    "expectedOutput": "9",
    "description": "3 حروف، طول 2 = 9"
   },
   {
    "input": "\"ab\", 3",
    "expectedOutput": "8",
    "description": "2 حروف، طول 3 = 8"
   },
   {
    "input": "\"abcdefghij\", 4",
    "expectedOutput": "10000",
    "description": "10 حروف، طول 4"
   },
   {
    "input": "\"0123456789\", 6",
    "expectedOutput": "1000000",
    "description": "رمز PIN من 6 أرقام",
    "hidden": true
   },
   {
    "input": "\"abc\", 0",
    "expectedOutput": "1",
    "description": "طول صفر",
    "hidden": true
   },
   {
    "input": "\"ab\", 10",
    "expectedOutput": "1024",
    "description": "نمو أسي",
    "hidden": true
   }
  ]
 },
 "cyber-ch-port-001": {
  "id": "cyber-ch-port-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "def identify_port(port):\n    # أرجع اسم الخدمة للمنفذ المعطى\n    # أرجع \"Unknown\" إذا غير معروف\n    pass",
  "testCases": [
   {
    "input": "80",
    "expectedOutput": "HTTP",
    "description": "منفذ HTTP"
   },
   {
    "input": "443",
    "expectedOutput": "HTTPS",
    "description": "منفذ HTTPS"
   },
   {
    "input": "22",
    "expectedOutput": "SSH",
    "description": "منفذ SSH"
   },
   {
    "input": "9999",
    "expectedOutput": "Unknown",
    "description": "منفذ غير معروف"
   },
   {
    "input": "3306",
    "expectedOutput": "MySQL",
    "description": "قاعدة بيانات",
    "hidden": true
   },
   {
    "input": "0",
    "expectedOutput": "Unknown",
    "description": "منفذ غير معروف",
    "hidden": true
   }
  ]
 },
 "cyber-ch-xor-001": {
  "id": "cyber-ch-xor-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "def xor_encrypt(text, key):\n    # شفّر/فك النص باستخدام XOR مع المفتاح\n    pass",
  "testCases": [
   {
    "input": "\"abc\", \" \"",
    "expectedOutput": "ABC",
    "description": "XOR مع مسافة يحوّل الحالة"
   },
   {
    "input": "\"ABC\", \" \"",
    "expectedOutput": "abc",
    "description": "XOR عكسي يحوّل الحالة"
   },
   {
    "input": "\"A\", \"1\"",
    "expectedOutput": "p",
    "description": "XOR حرف A مع 1 = p"
   },
   {
    "input": "xor_encrypt(xor_encrypt(\"Secret\", \"k\"), \"k\")",
    "expectedOutput": "Secret",
    "description": "التشفير ثم فك التشفير",
    "hidden": true
   }
  ]
 },
 "rn-ch-todo-001": {
  "id": "rn-ch-todo-001",
  "language": "TypeScript",
  "difficulty": "medium",
  "points": 80,
  "starterCode": "import React, { useState } from 'react';\nimport { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';\n\ninterface Todo {\n  id: string;\n  text: string;\n  completed: boolean;\n}\n\nexport default function TodoApp() {\n  const [todos, setTodos] = useState<Todo[]>([]);\n  const [inputText, setInputText] = useState('');\n\n  const addTodo = () => {\n    // أضف مهمة جديدة\n  };\n\n  const toggleTodo = (id: string) => {\n    // بدّل حالة المهمة\n  };\n\n  const deleteTodo = (id: string) => {\n    // احذف المهمة\n  };\n\n  return (\n    <View style={styles.container}>\n      <Text style={styles.title}>📝 مهامي</Text>\n      {/* أكمل الكود */}\n    </View>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: { flex: 1, padding: 20 },\n  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },\n});",
  "testCases": [],
  "checks": [
   {
    "pattern": "setTodos\\s*\\(\\s*(\\[\\s*\\.\\.\\.\\s*todos|todos\\s*\\.\\s*concat|\\(?\\s*\\w+\\s*\\)?\\s*=>\\s*\\[\\s*\\.\\.\\.)",
    "message": "أضف المهمة إلى نسخة من todos"
   },
   {
    "pattern": "\\.trim\\s*\\(\\s*\\)",
    "message": "تجاهل النص الفارغ (trim)"
   },
   {
    "pattern": "setInputText\\s*\\(\\s*['\"]{2}\\s*\\)",
    "message": "فرّغ حقل الإدخال بعد الإضافة"
   },
   {
    "pattern": "completed\\s*:\\s*!",
    "message": "اعكس completed في toggleTodo"
   },
   {
    "pattern": "\\.filter\\s*\\(|\\.splice\\s*\\(",
    "message": "احذف المهمة"
   },
   {
    "pattern": "<FlatList",
    "message": "اعرض المهام في FlatList"
   },
   {
    "pattern": "keyExtractor",
    "message": "أضف keyExtractor"
   }
  ],
  "validation": "structural"
 },
 "flutter-ch-counter-001": {
  "id": "flutter-ch-counter-001",
  "language": "Dart",
  "difficulty": "medium",
  "points": 70,
  "starterCode": "import 'package:flutter/material.dart';\n\nclass AdvancedCounter extends StatefulWidget {\n  @override\n  _AdvancedCounterState createState() => _AdvancedCounterState();\n}\n\nclass _AdvancedCounterState extends State<AdvancedCounter> {\n  int _count = 0;\n  \n  void _increment() {\n    // زيادة العداد\n  }\n  \n  void _decrement() {\n    // إنقاص العداد (لا يقل عن 0)\n  }\n  \n  void _reset() {\n    // تصفير العداد\n  }\n\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(title: Text('العداد')),\n      body: Center(\n        // أكمل الواجهة\n      ),\n    );\n  }\n}",
  "testCases": [],
  "checks": [
   {
    "pattern": "_count\\s*\\+\\+|_count\\s*\\+=\\s*1",
    "message": "زد العداد في _increment"
   },
   {
    "pattern": "_count\\s*>\\s*0|max\\s*\\(",
    "message": "امنع النزول تحت الصفر"
   },
   {
    "pattern": "_count\\s*=\\s*0",
    "message": "صفّر العداد في _reset"
   },
   {
    "pattern": "setState\\s*\\(",
    "message": "حدّث الواجهة بـ setState",
    "min": 3
   },
   {
    "pattern": "AnimationController\\s*\\(",
    "message": "أنشئ AnimationController للأنيميشن"
   },
   {
    "pattern": "dispose\\s*\\(\\s*\\)",
    "message": "تخلّص من الـ controller في dispose()"
   }
  ],
  "validation": "structural"
 },
 "algo-ch-linear-001": {
  "id": "algo-ch-linear-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "def linear_search(arr, target):\n    # ابحث عن target في arr\n    # أرجع index أو -1\n    pass",
  "testCases": [
   {
    "input": "[10, 20, 30, 40, 50], 30",
    "expectedOutput": "2",
    "description": "عنصر موجود"
   },
   {
    "input": "[1, 2, 3], 5",
    "expectedOutput": "-1",
    "description": "عنصر غير موجود"
   },
   {
    "input": "[7], 7",
    "expectedOutput": "0",
    "description": "قائمة بعنصر واحد"
   },
   {
    "input": "[], 1",
    "expectedOutput": "-1",
    "description": "قائمة فارغة",
    "hidden": true
   },
   {
    "input": "[5, 5, 5], 5",
    "expectedOutput": "0",
    "description": "أول ظهور",
    "hidden": true
   }
  ]
 },
 "algo-ch-binary-001": {
  "id": "algo-ch-binary-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "def binary_search(arr, target):\n    # ابحث عن target في قائمة مرتبة\n    # أرجع index أو -1\n    pass",
  "testCases": [
   {
    "input": "[1, 3, 5, 7, 9, 11], 7",
    "expectedOutput": "3",
    "description": "عنصر موجود"
   },
   {
    "input": "[2, 4, 6, 8], 5",
    "expectedOutput": "-1",
    "description": "عنصر غير موجود"
   },
   {
    "input": "[10], 10",
    "expectedOutput": "0",
    "description": "قائمة بعنصر واحد"
   },
   {
    "input": "[], 1",
    "expectedOutput": "-1",
    "description": "قائمة فارغة",
    "hidden": true
   },
   {
    "input": "[1, 2, 3, 4, 5, 6, 7, 8], 1",
    "expectedOutput": "0",
    "description": "أول عنصر",
    "hidden": true
   },
   {
    "input": "[1, 2, 3, 4, 5, 6, 7, 8], 8",
    "expectedOutput": "7",
    "description": "آخر عنصر",
    "hidden": true
   }
  ]
 },
 "algo-ch-selection-001": {
  "id": "algo-ch-selection-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "def selection_sort(arr):\n    # رتب القائمة باستخدام Selection Sort\n    # أرجع القائمة المرتبة\n    pass",
  "testCases": [
   {
    "input": "[64, 25, 12, 22, 11]",
    "expectedOutput": "[11, 12, 22, 25, 64]",
    "description": "ترتيب أرقام"
   },
   {
    "input": "[3, 1, 2]",
    "expectedOutput": "[1, 2, 3]",
    "description": "قائمة قصيرة"
   },
   {
    "input": "[1]",
    "expectedOutput": "[1]",
    "description": "عنصر واحد"
   },
   {
    "input": "[]",
    "expectedOutput": "[]",
    "description": "قائمة فارغة",
    "hidden": true
   },
   {
    "input": "[2, 2, 1]",
    "expectedOutput": "[1, 2, 2]",
    "description": "قيم مكررة",
    "hidden": true
   },
   {
    "input": "[-1, -5, 0]",
    "expectedOutput": "[-5, -1, 0]",
    "description": "أعداد سالبة",
    "hidden": true
   }
  ]
 },
 "algo-ch-insertion-001": {
  "id": "algo-ch-insertion-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "def insertion_sort(arr):\n    # رتب القائمة باستخدام Insertion Sort\n    # أرجع القائمة المرتبة\n    pass",
  "testCases": [
   {
    "input": "[12, 11, 13, 5, 6]",
    "expectedOutput": "[5, 6, 11, 12, 13]",
    "description": "ترتيب أرقام"
   },
   {
    "input": "[1, 2, 3]",
    "expectedOutput": "[1, 2, 3]",
    "description": "مرتبة مسبقاً"
   },
   {
    "input": "[]",
    "expectedOutput": "[]",
    "description": "قائمة فارغة",
    "hidden": true
   },
   {
    "input": "[3, 3, -1]",
    "expectedOutput": "[-1, 3, 3]",
    "description": "قيم مكررة وسالبة",
    "hidden": true
   },
   {
    "input": "[9, 8, 7, 6]",
    "expectedOutput": "[6, 7, 8, 9]",
    "description": "ترتيب عكسي",
    "hidden": true
   }
  ]
 },
 "algo-ch-max-001": {
  "id": "algo-ch-max-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "def find_min_max(arr):\n    # أرجع tuple يحتوي (أصغر, أكبر)\n    pass",
  "testCases": [
   {
    "input": "[3, 1, 4, 1, 5, 9]",
    "expectedOutput": "(1, 9)",
    "description": "قائمة أرقام متنوعة"
   },
   {
    "input": "[5]",
    "expectedOutput": "(5, 5)",
    "description": "عنصر واحد"
   },
   {
    "input": "[-3, -1, -7]",
    "expectedOutput": "(-7, -1)",
    "description": "أرقام سالبة"
   },
   {
    "input": "[]",
    "expectedOutput": "None",
    "description": "قائمة فارغة",
    "hidden": true
   },
   {
    "input": "[2, 2]",
    "expectedOutput": "(2, 2)",
    "description": "قيم متساوية",
    "hidden": true
   }
  ]
 },
 "algo-ch-merge-001": {
  "id": "algo-ch-merge-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "def merge_sort(arr):\n    # رتب القائمة باستخدام Merge Sort\n    # أرجع القائمة المرتبة\n    pass",
  "testCases": [
   {
    "input": "[38, 27, 43, 3, 9, 82, 10]",
    "expectedOutput": "[3, 9, 10, 27, 38, 43, 82]",
    "description": "ترتيب أرقام"
   },
   {
    "input": "[5, 1, 3, 2, 4]",
    "expectedOutput": "[1, 2, 3, 4, 5]",
    "description": "قائمة قصيرة"
   },
   {
    "input": "[]",
    "expectedOutput": "[]",
    "description": "قائمة فارغة",
    "hidden": true
   },
   {
    "input": "[1]",
    "expectedOutput": "[1]",
    "description": "عنصر واحد",
    "hidden": true
   },
   {
    "input": "[3, 1, 2, 3]",
    "expectedOutput": "[1, 2, 3, 3]",
    "description": "قيم مكررة",
    "hidden": true
   }
  ]
 },
 "algo-ch-quick-001": {
  "id": "algo-ch-quick-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 45,
  "starterCode": "def quick_sort(arr):\n    # رتب القائمة باستخدام Quick Sort\n    # أرجع القائمة المرتبة\n    pass",
  "testCases": [
   {
    "input": "[10, 7, 8, 9, 1, 5]",
    "expectedOutput": "[1, 5, 7, 8, 9, 10]",
    "description": "ترتيب أرقام"
   },
   {
    "input": "[3, 3, 1, 2, 2]",
    "expectedOutput": "[1, 2, 2, 3, 3]",
    "description": "أرقام مكررة"
   },
   {
    "input": "[]",
    "expectedOutput": "[]",
    "description": "قائمة فارغة",
    "hidden": true
   },
   {
    "input": "[9, -2, 5, -2]",
    "expectedOutput": "[-2, -2, 5, 9]",
    "description": "قيم سالبة مكررة",
    "hidden": true
   }
  ]
 },
 "algo-ch-kadane-001": {
  "id": "algo-ch-kadane-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "def max_subarray_sum(arr):\n    # أوجد أكبر مجموع لعناصر متتالية\n    pass",
  "testCases": [
   {
    "input": "[-2, 1, -3, 4, -1, 2, 1, -5, 4]",
    "expectedOutput": "6",
    "description": "مصفوفة فرعية [4,-1,2,1]"
   },
   {
    "input": "[1, 2, 3]",
    "expectedOutput": "6",
    "description": "كل العناصر موجبة"
   },
   {
    "input": "[-1, -2, -3]",
    "expectedOutput": "-1",
    "description": "كل العناصر سالبة"
   },
   {
    "input": "[5]",
    "expectedOutput": "5",
    "description": "عنصر واحد",
    "hidden": true
   },
   {
    "input": "[2, -1, 2, 3, -9, 4]",
    "expectedOutput": "6",
    "description": "المجموع الأكبر في البداية",
    "hidden": true
   },
   {
    "input": "[]",
    "expectedOutput": "0",
    "description": "قائمة فارغة",
    "hidden": true
   }
  ]
 },
 "algo-ch-anagram-001": {
  "id": "algo-ch-anagram-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "def is_anagram(s1, s2):\n    # تحقق إذا s1 و s2 يحتويان نفس الحروف\n    pass",
  "testCases": [
   {
    "input": "\"listen\", \"silent\"",
    "expectedOutput": "True",
    "description": "كلمتان anagram"
   },
   {
    "input": "\"hello\", \"world\"",
    "expectedOutput": "False",
    "description": "ليستا anagram"
   },
   {
    "input": "\"Triangle\", \"Integral\"",
    "expectedOutput": "True",
    "description": "حالة أحرف مختلفة"
   },
   {
    "input": "\"a\", \"a\"",
    "expectedOutput": "True",
    "description": "حرف واحد",
    "hidden": true
   },
   {
    "input": "\"ab\", \"a\"",
    "expectedOutput": "False",
    "description": "طول مختلف",
    "hidden": true
   },
   {
    "input": "\"Dormitory\", \"Dirty room\"",
    "expectedOutput": "True",
    "description": "مع مسافات",
    "hidden": true
   }
  ]
 },
 "algo-ch-twopointer-001": {
  "id": "algo-ch-twopointer-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "def two_sum_sorted(arr, target):\n    # أوجد index لعنصرين مجموعهما = target\n    # أرجع tuple (i, j)\n    pass",
  "testCases": [
   {
    "input": "[1, 2, 3, 4, 6], 6",
    "expectedOutput": "(1, 3)",
    "description": "زوج موجود: 2+4=6"
   },
   {
    "input": "[2, 3, 5, 8], 10",
    "expectedOutput": "(0, 3)",
    "description": "2+8=10"
   },
   {
    "input": "[1, 2], 5",
    "expectedOutput": "(-1, -1)",
    "description": "لا يوجد زوج"
   },
   {
    "input": "[1, 2, 3, 4, 5], 9",
    "expectedOutput": "(3, 4)",
    "description": "آخر عنصرين",
    "hidden": true
   },
   {
    "input": "[], 1",
    "expectedOutput": "(-1, -1)",
    "description": "قائمة فارغة",
    "hidden": true
   },
   {
    "input": "[1, 1], 2",
    "expectedOutput": "(0, 1)",
    "description": "عنصران متساويان",
    "hidden": true
   }
  ]
 },
 "algo-ch-lcs-001": {
  "id": "algo-ch-lcs-001",
  "language": "Python",
  "difficulty": "hard",
  "points": 60,
  "starterCode": "def lcs_length(s1, s2):\n    # أوجد طول أطول سلسلة فرعية مشتركة\n    pass",
  "testCases": [
   {
    "input": "\"ABCBDAB\", \"BDCAB\"",
    "expectedOutput": "4",
    "description": "LCS = BCAB"
   },
   {
    "input": "\"ABC\", \"AC\"",
    "expectedOutput": "2",
    "description": "LCS = AC"
   },
   {
    "input": "\"ABC\", \"DEF\"",
    "expectedOutput": "0",
    "description": "لا توجد أحرف مشتركة"
   },
   {
    "input": "\"\", \"ABC\"",
    "expectedOutput": "0",
    "description": "نص فارغ",
    "hidden": true
   },
   {
    "input": "\"AGGTAB\", \"GXTXAYB\"",
    "expectedOutput": "4",
    "description": "مثال كلاسيكي",
    "hidden": true
   }
  ]
 },
 "algo-ch-knapsack-001": {
  "id": "algo-ch-knapsack-001",
  "language": "Python",
  "difficulty": "hard",
  "points": 70,
  "starterCode": "def knapsack(weights, values, capacity):\n    # أوجد أقصى قيمة يمكن حملها\n    pass",
  "testCases": [
   {
    "input": "[1, 2, 3], [6, 10, 12], 5",
    "expectedOutput": "22",
    "description": "سعة 5"
   },
   {
    "input": "[2, 3, 4, 5], [3, 4, 5, 6], 5",
    "expectedOutput": "7",
    "description": "اختيار أفضل مجموعة"
   },
   {
    "input": "[5], [10], 4",
    "expectedOutput": "0",
    "description": "لا يتسع أي عنصر",
    "hidden": true
   },
   {
    "input": "[], [], 10",
    "expectedOutput": "0",
    "description": "لا توجد عناصر",
    "hidden": true
   },
   {
    "input": "[1, 3, 4, 5], [1, 4, 5, 7], 7",
    "expectedOutput": "9",
    "description": "اختيار أفضل تركيبة",
    "hidden": true
   }
  ]
 },
 "algo-ch-dijkstra-001": {
  "id": "algo-ch-dijkstra-001",
  "language": "Python",
  "difficulty": "hard",
  "points": 80,
  "starterCode": "def dijkstra(graph, start):\n    # graph = {node: [(neighbor, weight), ...]}\n    # أرجع dict بأقصر مسافة لكل نقطة\n    pass",
  "testCases": [
   {
    "input": "{\"A\": [(\"B\", 1), (\"C\", 4)], \"B\": [(\"C\", 2)], \"C\": []}, \"A\"",
    "expectedOutput": "{'A': 0, 'B': 1, 'C': 3}",
    "description": "أقصر مسار من A"
   },
   {
    "input": "{\"A\": [(\"B\", 4), (\"C\", 1)], \"B\": [(\"D\", 1)], \"C\": [(\"B\", 2), (\"D\", 5)], \"D\": []}, \"A\"",
    "expectedOutput": "{'A': 0, 'B': 3, 'C': 1, 'D': 4}",
    "description": "رسم بياني أكبر مع مسارات متعددة"
   },
   {
    "input": "{\"X\": [(\"Y\", 2)], \"Y\": [(\"Z\", 3)], \"Z\": []}, \"X\"",
    "expectedOutput": "{'X': 0, 'Y': 2, 'Z': 5}",
    "description": "مسار خطي بسيط"
   },
   {
    "input": "{\"A\": []}, \"A\"",
    "expectedOutput": "{'A': 0}",
    "description": "عقدة واحدة",
    "hidden": true
   }
  ]
 },
 "algo-ch-dp-coins-001": {
  "id": "algo-ch-dp-coins-001",
  "language": "Python",
  "difficulty": "hard",
  "points": 60,
  "starterCode": "def coin_change(coins, amount):\n    # أوجد أقل عدد عملات لتكوين amount\n    # أرجع -1 إذا مستحيل\n    pass",
  "testCases": [
   {
    "input": "[1, 5, 10, 25], 30",
    "expectedOutput": "2",
    "description": "25+5=30"
   },
   {
    "input": "[2], 3",
    "expectedOutput": "-1",
    "description": "مستحيل"
   },
   {
    "input": "[1, 2, 5], 11",
    "expectedOutput": "3",
    "description": "5+5+1=11"
   },
   {
    "input": "[1], 0",
    "expectedOutput": "0",
    "description": "مبلغ صفر",
    "hidden": true
   },
   {
    "input": "[2, 5], 3",
    "expectedOutput": "-1",
    "description": "مستحيل",
    "hidden": true
   },
   {
    "input": "[3, 7], 14",
    "expectedOutput": "2",
    "description": "عملتان من 7",
    "hidden": true
   }
  ]
 },
 "ds-ch-stack-001": {
  "id": "ds-ch-stack-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "def stack_operations(operations):\n    # نفّذ عمليات Stack وأرجع النتائج\n    # operations = [(\"push\", 1), (\"push\", 2), (\"pop\",), (\"peek\",)]\n    # أرجع قائمة بنتائج pop و peek\n    pass",
  "testCases": [
   {
    "input": "[(\"push\", 1), (\"push\", 2), (\"pop\",), (\"peek\",)]",
    "expectedOutput": "[2, 1]",
    "description": "push ثم pop ثم peek"
   },
   {
    "input": "[(\"push\", 5), (\"push\", 10), (\"pop\",), (\"pop\",)]",
    "expectedOutput": "[10, 5]",
    "description": "LIFO ترتيب"
   },
   {
    "input": "[(\"pop\",), (\"peek\",), (\"is_empty\",)]",
    "expectedOutput": "[-1, -1, True]",
    "description": "عمليات على Stack فارغ",
    "hidden": true
   },
   {
    "input": "[(\"push\", 1), (\"is_empty\",)]",
    "expectedOutput": "[False]",
    "description": "is_empty بعد push",
    "hidden": true
   }
  ]
 },
 "ds-ch-queue-001": {
  "id": "ds-ch-queue-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "def queue_operations(operations):\n    # نفّذ عمليات Queue وأرجع النتائج\n    # operations = [(\"enqueue\", 1), (\"dequeue\",), (\"peek\",)]\n    pass",
  "testCases": [
   {
    "input": "[(\"enqueue\", 1), (\"enqueue\", 2), (\"dequeue\",), (\"peek\",)]",
    "expectedOutput": "[1, 2]",
    "description": "FIFO ترتيب"
   },
   {
    "input": "[(\"enqueue\", 10), (\"enqueue\", 20), (\"enqueue\", 30), (\"dequeue\",), (\"dequeue\",)]",
    "expectedOutput": "[10, 20]",
    "description": "ثلاث عناصر"
   },
   {
    "input": "[(\"dequeue\",)]",
    "expectedOutput": "[-1]",
    "description": "dequeue من Queue فارغة",
    "hidden": true
   },
   {
    "input": "[(\"enqueue\", 1), (\"enqueue\", 2), (\"dequeue\",), (\"dequeue\",), (\"peek\",)]",
    "expectedOutput": "[1, 2, -1]",
    "description": "تفريغ كامل",
    "hidden": true
   }
  ]
 },
 "ds-ch-hashtable-001": {
  "id": "ds-ch-hashtable-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "def hashtable_operations(operations):\n    # نفّذ عمليات Hash Table\n    # operations = [(\"set\", \"name\", \"Ali\"), (\"get\", \"name\"), (\"delete\", \"name\")]\n    pass",
  "testCases": [
   {
    "input": "[(\"set\", \"a\", 1), (\"set\", \"b\", 2), (\"get\", \"a\"), (\"get\", \"b\")]",
    "expectedOutput": "[1, 2]",
    "description": "تخزين واسترجاع"
   },
   {
    "input": "[(\"set\", \"x\", 10), (\"delete\", \"x\"), (\"get\", \"x\")]",
    "expectedOutput": "[True, None]",
    "description": "حذف واسترجاع"
   },
   {
    "input": "[(\"get\", \"nope\"), (\"delete\", \"nope\")]",
    "expectedOutput": "[None, False]",
    "description": "مفتاح غير موجود",
    "hidden": true
   },
   {
    "input": "[(\"set\", \"k\", 1), (\"set\", \"k\", 2), (\"get\", \"k\")]",
    "expectedOutput": "[2]",
    "description": "تحديث قيمة",
    "hidden": true
   }
  ]
 },
 "ds-ch-set-001": {
  "id": "ds-ch-set-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "def set_union(set1, set2):\n    # أرجع اتحاد المجموعتين\n    pass\n\ndef set_intersection(set1, set2):\n    # أرجع تقاطع المجموعتين\n    pass\n\ndef set_difference(set1, set2):\n    # أرجع الفرق (عناصر في set1 وليست في set2)\n    pass",
  "testCases": [
   {
    "input": "set_union([1, 2, 3], [2, 3, 4])",
    "expectedOutput": "[1, 2, 3, 4]",
    "description": "اتحاد المجموعتين"
   },
   {
    "input": "set_intersection([1, 2, 3], [2, 3, 4])",
    "expectedOutput": "[2, 3]",
    "description": "تقاطع المجموعتين"
   },
   {
    "input": "set_difference([1, 2, 3], [2, 3, 4])",
    "expectedOutput": "[1]",
    "description": "فرق المجموعتين (عناصر في الأولى وليست في الثانية)"
   },
   {
    "input": "set_union([5, 10, 15], [10, 20, 30])",
    "expectedOutput": "[5, 10, 15, 20, 30]",
    "description": "اتحاد مجموعتين مختلفتين"
   },
   {
    "input": "set_intersection([1, 2, 3], [4, 5, 6])",
    "expectedOutput": "[]",
    "description": "تقاطع مجموعتين بدون عناصر مشتركة"
   },
   {
    "input": "set_difference([1, 2], [1, 2])",
    "expectedOutput": "[]",
    "description": "فرق فارغ",
    "hidden": true
   },
   {
    "input": "set_union([], [])",
    "expectedOutput": "[]",
    "description": "قائمتان فارغتان",
    "hidden": true
   },
   {
    "input": "set_union([3, 3, 1], [1])",
    "expectedOutput": "[1, 3]",
    "description": "إزالة التكرار",
    "hidden": true
   }
  ]
 },
 "ds-ch-linkedlist-001": {
  "id": "ds-ch-linkedlist-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 35,
  "starterCode": "def reverse_linked_list(arr):\n    # اعكس ترتيب العناصر (محاكاة عكس Linked List)\n    # أرجع القائمة المعكوسة\n    pass",
  "testCases": [
   {
    "input": "[1, 2, 3, 4, 5]",
    "expectedOutput": "[5, 4, 3, 2, 1]",
    "description": "عكس قائمة"
   },
   {
    "input": "[1]",
    "expectedOutput": "[1]",
    "description": "عنصر واحد"
   },
   {
    "input": "[1, 2]",
    "expectedOutput": "[2, 1]",
    "description": "عنصرين"
   },
   {
    "input": "[]",
    "expectedOutput": "[]",
    "description": "قائمة فارغة",
    "hidden": true
   }
  ]
 },
 "ds-ch-minheap-001": {
  "id": "ds-ch-minheap-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "def k_smallest(arr, k):\n    # أوجد أصغر k عناصر باستخدام heap\n    pass",
  "testCases": [
   {
    "input": "[7, 10, 4, 3, 20, 15], 3",
    "expectedOutput": "[3, 4, 7]",
    "description": "أصغر 3"
   },
   {
    "input": "[1, 23, 12, 9, 30, 2, 50], 4",
    "expectedOutput": "[1, 2, 9, 12]",
    "description": "أصغر 4"
   },
   {
    "input": "[5, 1, 4], 0",
    "expectedOutput": "[]",
    "description": "k = 0",
    "hidden": true
   },
   {
    "input": "[3, 1, 2], 3",
    "expectedOutput": "[1, 2, 3]",
    "description": "k يساوي الطول",
    "hidden": true
   },
   {
    "input": "[4, 4, 1], 2",
    "expectedOutput": "[1, 4]",
    "description": "قيم مكررة",
    "hidden": true
   }
  ]
 },
 "ds-ch-treetraversal-001": {
  "id": "ds-ch-treetraversal-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "def inorder_traversal(tree):\n    # tree = [root, [left_subtree], [right_subtree]]\n    # tree = [1, [2, [], []], [3, [], []]]\n    # أرجع قائمة العناصر بترتيب inorder\n    pass",
  "testCases": [
   {
    "input": "[1, [2, [], []], [3, [], []]]",
    "expectedOutput": "[2, 1, 3]",
    "description": "شجرة بسيطة"
   },
   {
    "input": "[4, [2, [1, [], []], [3, [], []]], [6, [5, [], []], [7, [], []]]]",
    "expectedOutput": "[1, 2, 3, 4, 5, 6, 7]",
    "description": "شجرة متوازنة"
   },
   {
    "input": "[]",
    "expectedOutput": "[]",
    "description": "شجرة فارغة",
    "hidden": true
   },
   {
    "input": "[1, [], [2, [], []]]",
    "expectedOutput": "[1, 2]",
    "description": "فرع أيمن فقط",
    "hidden": true
   }
  ]
 },
 "ds-ch-bfs-001": {
  "id": "ds-ch-bfs-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "def bfs(graph, start):\n    # graph = {node: [neighbors]}\n    # أرجع قائمة العقد بترتيب BFS\n    pass",
  "testCases": [
   {
    "input": "{\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [\"D\"], \"D\": []}, \"A\"",
    "expectedOutput": "['A', 'B', 'C', 'D']",
    "description": "بحث بالعرض من A"
   },
   {
    "input": "{\"1\": [\"2\", \"3\"], \"2\": [\"4\"], \"3\": [], \"4\": []}, \"1\"",
    "expectedOutput": "['1', '2', '3', '4']",
    "description": "بحث بالعرض من 1"
   },
   {
    "input": "{\"A\": []}, \"A\"",
    "expectedOutput": "['A']",
    "description": "عقدة واحدة",
    "hidden": true
   },
   {
    "input": "{\"A\": [\"B\"], \"B\": [], \"C\": []}, \"A\"",
    "expectedOutput": "['A', 'B']",
    "description": "عقدة غير متصلة لا تُزار",
    "hidden": true
   }
  ]
 },
 "ds-ch-dfs-001": {
  "id": "ds-ch-dfs-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "def dfs(graph, start):\n    # graph = {node: [neighbors]}\n    # أرجع قائمة العقد بترتيب DFS\n    pass",
  "testCases": [
   {
    "input": "{\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [\"D\"], \"D\": []}, \"A\"",
    "expectedOutput": "['A', 'B', 'D', 'C']",
    "description": "بحث بالعمق من A"
   },
   {
    "input": "{\"1\": [\"2\", \"3\"], \"2\": [\"4\"], \"3\": [], \"4\": []}, \"1\"",
    "expectedOutput": "['1', '2', '4', '3']",
    "description": "بحث بالعمق من 1"
   },
   {
    "input": "{\"A\": []}, \"A\"",
    "expectedOutput": "['A']",
    "description": "عقدة واحدة",
    "hidden": true
   },
   {
    "input": "{\"A\": [\"B\"], \"B\": [\"A\"]}, \"A\"",
    "expectedOutput": "['A', 'B']",
    "description": "دورة لا تسبب تكراراً",
    "hidden": true
   }
  ]
 },
 "ds-ch-trie-001": {
  "id": "ds-ch-trie-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 50,
  "starterCode": "def find_words_with_prefix(words, prefix):\n    # أوجد كل الكلمات التي تبدأ بـ prefix\n    # أرجع قائمة مرتبة\n    pass",
  "testCases": [
   {
    "input": "[\"apple\", \"app\", \"ape\", \"banana\", \"band\"], \"ap\"",
    "expectedOutput": "['ape', 'app', 'apple']",
    "description": "كلمات تبدأ بـ ap"
   },
   {
    "input": "[\"car\", \"card\", \"care\", \"dog\"], \"car\"",
    "expectedOutput": "['car', 'card', 'care']",
    "description": "كلمات تبدأ بـ car"
   },
   {
    "input": "[\"hello\", \"world\"], \"xyz\"",
    "expectedOutput": "[]",
    "description": "لا توجد نتائج"
   },
   {
    "input": "[\"Apple\", \"apple\"], \"a\"",
    "expectedOutput": "['apple']",
    "description": "حساسية حالة الأحرف",
    "hidden": true
   },
   {
    "input": "[], \"a\"",
    "expectedOutput": "[]",
    "description": "قائمة فارغة",
    "hidden": true
   }
  ]
 },
 "ds-ch-lru-001": {
  "id": "ds-ch-lru-001",
  "language": "Python",
  "difficulty": "hard",
  "points": 60,
  "starterCode": "def lru_cache_operations(capacity, operations):\n    # capacity = سعة الذاكرة\n    # operations = [(\"get\", key), (\"put\", key, value)]\n    # أرجع نتائج عمليات get (-1 إذا غير موجود)\n    pass",
  "testCases": [
   {
    "input": "2, [(\"put\", 1, 1), (\"put\", 2, 2), (\"get\", 1), (\"put\", 3, 3), (\"get\", 2)]",
    "expectedOutput": "[1, -1]",
    "description": "LRU مع سعة 2"
   },
   {
    "input": "1, [(\"put\", 1, 10), (\"put\", 2, 20), (\"get\", 1), (\"get\", 2)]",
    "expectedOutput": "[-1, 20]",
    "description": "LRU مع سعة 1"
   },
   {
    "input": "2, [(\"put\", 1, 1), (\"put\", 1, 5), (\"get\", 1)]",
    "expectedOutput": "[5]",
    "description": "تحديث قيمة موجودة",
    "hidden": true
   },
   {
    "input": "2, [(\"get\", 1)]",
    "expectedOutput": "[-1]",
    "description": "Cache فارغ",
    "hidden": true
   }
  ]
 },
 "ds-ch-graph-cycle-001": {
  "id": "ds-ch-graph-cycle-001",
  "language": "Python",
  "difficulty": "hard",
  "points": 55,
  "starterCode": "def has_cycle(graph):\n    # graph = {node: [neighbors]}\n    # أرجع True إذا وُجدت دورة\n    pass",
  "testCases": [
   {
    "input": "{\"A\": [\"B\"], \"B\": [\"C\"], \"C\": [\"A\"]}",
    "expectedOutput": "True",
    "description": "دورة A→B→C→A"
   },
   {
    "input": "{\"A\": [\"B\"], \"B\": [\"C\"], \"C\": []}",
    "expectedOutput": "False",
    "description": "بدون دورة"
   },
   {
    "input": "{}",
    "expectedOutput": "False",
    "description": "رسم فارغ",
    "hidden": true
   },
   {
    "input": "{\"A\": [\"A\"]}",
    "expectedOutput": "True",
    "description": "حلقة ذاتية",
    "hidden": true
   },
   {
    "input": "{\"A\": [\"B\", \"C\"], \"B\": [\"D\"], \"C\": [\"D\"], \"D\": []}",
    "expectedOutput": "False",
    "description": "شكل معيّن بدون دورة",
    "hidden": true
   }
  ]
 },
 "pyoop-ch-001": {
  "id": "pyoop-ch-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "class BankAccount:\n    def __init__(self, owner, balance=0):\n        # خزّن الرصيد في self.__balance\n        pass\n\n    def deposit(self, amount):\n        pass\n\n    def withdraw(self, amount):\n        pass\n\n    @property\n    def balance(self):\n        pass",
  "testCases": [
   {
    "input": "a = BankAccount(\"Ali\", 100)\na.deposit(50)\na.balance",
    "expectedOutput": "150",
    "description": "إيداع 50"
   },
   {
    "input": "a = BankAccount(\"Ali\", 100)\na.withdraw(30)",
    "expectedOutput": "True",
    "description": "سحب ممكن"
   },
   {
    "input": "a = BankAccount(\"Ali\", 100)\na.withdraw(500)\na.balance",
    "expectedOutput": "100",
    "description": "سحب أكبر من الرصيد لا يغيّر شيئاً"
   },
   {
    "input": "a = BankAccount(\"Sara\")\na.deposit(-20)\na.balance",
    "expectedOutput": "0",
    "description": "إيداع سالب يُرفض",
    "hidden": true
   },
   {
    "input": "a = BankAccount(\"Sara\", 10)\nhasattr(a, \"_BankAccount__balance\") and not hasattr(a, \"balance_value\")",
    "expectedOutput": "True",
    "description": "الرصيد مخزّن كخاصية خاصة",
    "hidden": true
   }
  ]
 },
 "pyoop-ch-002": {
  "id": "pyoop-ch-002",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    # أضف from_fahrenheit (classmethod)\n\n    # أضف is_freezing (staticmethod)\n\n    def to_fahrenheit(self):\n        pass",
  "testCases": [
   {
    "input": "Temperature(100).to_fahrenheit()",
    "expectedOutput": "212.0",
    "description": "100°C"
   },
   {
    "input": "Temperature.from_fahrenheit(212).celsius",
    "expectedOutput": "100.0",
    "description": "من فهرنهايت"
   },
   {
    "input": "Temperature.is_freezing(-3)",
    "expectedOutput": "True",
    "description": "تحت الصفر"
   },
   {
    "input": "isinstance(Temperature.from_fahrenheit(50), Temperature) and Temperature.from_fahrenheit(50).celsius",
    "expectedOutput": "10.0",
    "description": "classmethod تُرجع كائناً",
    "hidden": true
   },
   {
    "input": "Temperature.is_freezing(0.5)",
    "expectedOutput": "False",
    "description": "فوق الصفر",
    "hidden": true
   },
   {
    "input": "Temperature(0).to_fahrenheit()",
    "expectedOutput": "32.0",
    "description": "نقطة التجمد",
    "hidden": true
   },
   {
    "input": "isinstance(Temperature.from_fahrenheit(50), str)",
    "expectedOutput": "False",
    "description": "النوع ليس نصاً",
    "hidden": true
   },
   {
    "input": "Temperature(-40).to_fahrenheit()",
    "expectedOutput": "-40.0",
    "description": "نقطة التساوي",
    "hidden": true
   }
  ]
 },
 "pyoop-ch-003": {
  "id": "pyoop-ch-003",
  "language": "Python",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "class Shape:\n    def area(self):\n        raise NotImplementedError\n\n\nclass Rectangle(Shape):\n    pass\n\n\nclass Circle(Shape):\n    pass\n\n\ndef total_area(shapes):\n    pass",
  "testCases": [
   {
    "input": "total_area([Rectangle(2, 3)])",
    "expectedOutput": "6",
    "description": "مستطيل"
   },
   {
    "input": "total_area([Circle(1)])",
    "expectedOutput": "3.14",
    "description": "دائرة"
   },
   {
    "input": "total_area([Rectangle(2, 3), Circle(2), Rectangle(1, 1)])",
    "expectedOutput": "19.57",
    "description": "أشكال مختلطة"
   },
   {
    "input": "total_area([])",
    "expectedOutput": "0",
    "description": "قائمة فارغة",
    "hidden": true
   },
   {
    "input": "isinstance(Circle(1), Shape) and isinstance(Rectangle(1, 1), Shape)",
    "expectedOutput": "True",
    "description": "الوراثة من Shape",
    "hidden": true
   },
   {
    "input": "isinstance(Rectangle(1, 1), Circle)",
    "expectedOutput": "False",
    "description": "أنواع مستقلة",
    "hidden": true
   }
  ]
 },
 "pyoop-ch-004": {
  "id": "pyoop-ch-004",
  "language": "Python",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "class Vector:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    # __add__, __mul__, __eq__, __abs__, __repr__",
  "testCases": [
   {
    "input": "Vector(1, 2) + Vector(3, 4)",
    "expectedOutput": "Vector(4, 6)",
    "description": "الجمع"
   },
   {
    "input": "Vector(1, -2) * 3",
    "expectedOutput": "Vector(3, -6)",
    "description": "الضرب بعدد"
   },
   {
    "input": "abs(Vector(3, 4))",
    "expectedOutput": "5.0",
    "description": "الطول"
   },
   {
    "input": "abs(Vector(1, 1))",
    "expectedOutput": "1.41",
    "description": "طول مقرب",
    "hidden": true
   },
   {
    "input": "Vector(2, 2) == Vector(2, 2)",
    "expectedOutput": "True",
    "description": "المساواة",
    "hidden": true
   },
   {
    "input": "Vector(2, 2) == Vector(2, 3)",
    "expectedOutput": "False",
    "description": "عدم المساواة",
    "hidden": true
   }
  ]
 },
 "pyoop-ch-005": {
  "id": "pyoop-ch-005",
  "language": "Python",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "class Engine:\n    def __init__(self, hp):\n        self.hp = hp\n\n    def start(self):\n        pass\n\n\nclass Car:\n    def __init__(self, model, engine):\n        pass\n\n    def start(self):\n        pass\n\n    def upgrade_engine(self, engine):\n        pass",
  "testCases": [
   {
    "input": "Car(\"Camry\", Engine(200)).start()",
    "expectedOutput": "Camry: Engine 200hp started",
    "description": "تشغيل"
   },
   {
    "input": "c = Car(\"Golf\", Engine(110))\nc.upgrade_engine(Engine(150))\nc.start()",
    "expectedOutput": "Golf: Engine 150hp started",
    "description": "استبدال المحرك"
   },
   {
    "input": "c = Car(\"Kia\", Engine(90))\n(issubclass(Car, Engine), isinstance(c.engine, Engine))",
    "expectedOutput": "(False, True)",
    "description": "Car تحتوي محركاً ولا ترث منه",
    "hidden": true
   },
   {
    "input": "Car(\"Niro\", Engine(140)).start()",
    "expectedOutput": "Niro: Engine 140hp started",
    "description": "سيارة أخرى",
    "hidden": true
   }
  ]
 },
 "pyoop-ch-006": {
  "id": "pyoop-ch-006",
  "language": "Python",
  "difficulty": "hard",
  "points": 80,
  "starterCode": "class Library:\n    def __init__(self):\n        pass\n\n    def add_book(self, title, copies=1):\n        pass\n\n    def borrow(self, member, title):\n        pass\n\n    def return_book(self, member, title):\n        pass\n\n    def available(self, title):\n        pass\n\n    def borrowed_by(self, member):\n        pass",
  "testCases": [
   {
    "input": "lib = Library()\nlib.add_book(\"Python\", 2)\nlib.borrow(\"ali\", \"Python\")",
    "expectedOutput": "True",
    "description": "إعارة متاحة"
   },
   {
    "input": "lib = Library()\nlib.add_book(\"Python\", 1)\nlib.borrow(\"ali\", \"Python\")\nlib.borrow(\"sara\", \"Python\")",
    "expectedOutput": "False",
    "description": "لا نسخ متبقية"
   },
   {
    "input": "lib = Library()\nlib.add_book(\"A\", 3)\nlib.borrow(\"ali\", \"A\")\nlib.borrow(\"ali\", \"A\")",
    "expectedOutput": "False",
    "description": "لا يستعير نفس الكتاب مرتين"
   },
   {
    "input": "lib = Library()\nlib.add_book(\"B\", 1)\nlib.add_book(\"A\", 1)\nlib.borrow(\"ali\", \"B\")\nlib.borrow(\"ali\", \"A\")\nlib.borrowed_by(\"ali\")",
    "expectedOutput": "[\"A\", \"B\"]",
    "description": "كتب العضو مرتبة",
    "hidden": true
   },
   {
    "input": "lib = Library()\nlib.add_book(\"A\", 1)\nlib.borrow(\"ali\", \"A\")\nlib.return_book(\"ali\", \"A\")\nlib.available(\"A\")",
    "expectedOutput": "1",
    "description": "الإرجاع يعيد النسخة",
    "hidden": true
   },
   {
    "input": "lib = Library()\n(lib.borrow(\"ali\", \"X\"), lib.return_book(\"ali\", \"X\"), lib.available(\"X\"))",
    "expectedOutput": "(False, False, 0)",
    "description": "كتاب غير موجود",
    "hidden": true
   }
  ]
 },
 "pyadv-ch-001": {
  "id": "pyadv-ch-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "def compose(*funcs):\n    pass",
  "testCases": [
   {
    "input": "compose(lambda x: x + 1, lambda x: x * 2)(5)",
    "expectedOutput": "11",
    "description": "(5×2)+1"
   },
   {
    "input": "compose(str.upper, str.strip)(\"  hi \")",
    "expectedOutput": "HI",
    "description": "دوال نصية"
   },
   {
    "input": "compose()(42)",
    "expectedOutput": "42",
    "description": "بدون دوال",
    "hidden": true
   }
  ]
 },
 "pyadv-ch-002": {
  "id": "pyadv-ch-002",
  "language": "Python",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "import functools\n\n\ndef count_calls(func):\n    pass",
  "testCases": [
   {
    "input": "@count_calls\ndef add(a, b):\n    return a + b\nadd(1, 2)\nadd(3, 4)\nadd.calls",
    "expectedOutput": "2",
    "description": "استدعاءان"
   },
   {
    "input": "@count_calls\ndef add(a, b):\n    return a + b\nadd(10, 5)",
    "expectedOutput": "15",
    "description": "النتيجة لا تتغير"
   },
   {
    "input": "@count_calls\ndef greet():\n    return \"hi\"\ngreet.__name__",
    "expectedOutput": "greet",
    "description": "الاسم محفوظ",
    "hidden": true
   },
   {
    "input": "@count_calls\ndef f(x=1):\n    return x\nf(x=3)\nf.calls",
    "expectedOutput": "1",
    "description": "وسائط بالاسم",
    "hidden": true
   }
  ]
 },
 "pyadv-ch-003": {
  "id": "pyadv-ch-003",
  "language": "Python",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "def batched(items, size):\n    pass",
  "testCases": [
   {
    "input": "list(batched([1, 2, 3, 4, 5], 2))",
    "expectedOutput": "[[1, 2], [3, 4], [5]]",
    "description": "دفعات من 2"
   },
   {
    "input": "list(batched(\"abcdef\", 3))",
    "expectedOutput": "[[\"a\", \"b\", \"c\"], [\"d\", \"e\", \"f\"]]",
    "description": "نص"
   },
   {
    "input": "list(batched([], 4))",
    "expectedOutput": "[]",
    "description": "فارغة",
    "hidden": true
   },
   {
    "input": "import types\nisinstance(batched([1], 1), types.GeneratorType)",
    "expectedOutput": "True",
    "description": "generator فعلاً",
    "hidden": true
   },
   {
    "input": "b = batched([1, 2, 3], 3)\nnext(b)",
    "expectedOutput": "[1, 2, 3]",
    "description": "دفعة واحدة كاملة",
    "hidden": true
   }
  ]
 },
 "pyadv-ch-004": {
  "id": "pyadv-ch-004",
  "language": "Python",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "import time\n\n\nclass Timer:\n    def __enter__(self):\n        pass\n\n    def __exit__(self, exc_type, exc, tb):\n        pass",
  "testCases": [
   {
    "input": "with Timer() as t:\n    pass\n(t.entered, t.elapsed >= 0, t.error)",
    "expectedOutput": "(True, True, None)",
    "description": "بدون خطأ"
   },
   {
    "input": "t = Timer()\ntry:\n    with t:\n        1 / 0\nexcept ZeroDivisionError:\n    pass\nt.error",
    "expectedOutput": "ZeroDivisionError",
    "description": "الخطأ مسجّل ولم يُكتم"
   },
   {
    "input": "t = Timer()\ncaught = False\ntry:\n    with t:\n        raise ValueError(\"x\")\nexcept ValueError:\n    caught = True\ncaught",
    "expectedOutput": "True",
    "description": "الاستثناء يصل للخارج",
    "hidden": true
   }
  ]
 },
 "pyadv-ch-005": {
  "id": "pyadv-ch-005",
  "language": "Python",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "import re\n\n\ndef extract_dates(text):\n    pass",
  "testCases": [
   {
    "input": "extract_dates(\"start 2024-03-15 end 2024-12-01\")",
    "expectedOutput": "[\"2024-03-15\", \"2024-12-01\"]",
    "description": "تاريخان"
   },
   {
    "input": "extract_dates(\"bad 2024-13-01 and 2024-02-30x\")",
    "expectedOutput": "[]",
    "description": "شهر غير صالح"
   },
   {
    "input": "extract_dates(\"لا توجد تواريخ\")",
    "expectedOutput": "[]",
    "description": "بدون تواريخ",
    "hidden": true
   },
   {
    "input": "extract_dates(\"2023-01-31,2023-10-09\")",
    "expectedOutput": "[\"2023-01-31\", \"2023-10-09\"]",
    "description": "مفصولة بفاصلة",
    "hidden": true
   }
  ]
 },
 "pyadv-ch-006": {
  "id": "pyadv-ch-006",
  "language": "Python",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "class Countdown:\n    def __init__(self, start):\n        self.start = start\n\n    def __iter__(self):\n        pass",
  "testCases": [
   {
    "input": "list(Countdown(3))",
    "expectedOutput": "[3, 2, 1]",
    "description": "من 3"
   },
   {
    "input": "list(Countdown(0))",
    "expectedOutput": "[]",
    "description": "صفر"
   },
   {
    "input": "c = Countdown(2)\n(list(c), list(c))",
    "expectedOutput": "([2, 1], [2, 1])",
    "description": "يعاد من البداية",
    "hidden": true
   },
   {
    "input": "c = Countdown(1)\nlist(c)",
    "expectedOutput": "[1]",
    "description": "عنصر واحد",
    "hidden": true
   }
  ]
 },
 "pyadv-ch-007": {
  "id": "pyadv-ch-007",
  "language": "Python",
  "difficulty": "hard",
  "points": 75,
  "starterCode": "def summarize_logs(lines):\n    pass",
  "testCases": [
   {
    "input": "summarize_logs([\"INFO start\", \"ERROR db down\", \"ERROR db down\", \"WARNING slow\"])",
    "expectedOutput": "{\"counts\": {\"ERROR\": 2, \"INFO\": 1, \"WARNING\": 1}, \"top_error\": \"db down\"}",
    "description": "سجل عادي"
   },
   {
    "input": "summarize_logs([\"INFO ok\", \"\", \"garbage\"])",
    "expectedOutput": "{\"counts\": {\"INFO\": 1}, \"top_error\": None}",
    "description": "أسطر غير صالحة"
   },
   {
    "input": "summarize_logs([\"ERROR b\", \"ERROR a\"])",
    "expectedOutput": "{\"counts\": {\"ERROR\": 2}, \"top_error\": \"a\"}",
    "description": "تعادل → أبجدياً",
    "hidden": true
   },
   {
    "input": "summarize_logs([])",
    "expectedOutput": "{\"counts\": {}, \"top_error\": None}",
    "description": "فارغ",
    "hidden": true
   }
  ]
 },
 "aib-ch-001": {
  "id": "aib-ch-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "import re\n\n\ndef tokenize(text):\n    pass",
  "testCases": [
   {
    "input": "tokenize(\"Hello, World!\")",
    "expectedOutput": "[\"hello\", \"world\"]",
    "description": "علامات ترقيم"
   },
   {
    "input": "tokenize(\"AI is fun. AI 2024\")",
    "expectedOutput": "[\"ai\", \"is\", \"fun\", \"ai\", \"2024\"]",
    "description": "أرقام"
   },
   {
    "input": "tokenize(\"...\")",
    "expectedOutput": "[]",
    "description": "لا كلمات",
    "hidden": true
   }
  ]
 },
 "aib-ch-002": {
  "id": "aib-ch-002",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "def bag_of_words(sentence, vocab):\n    pass",
  "testCases": [
   {
    "input": "bag_of_words(\"the cat sat on the mat\", [\"the\", \"cat\", \"dog\"])",
    "expectedOutput": "[2, 1, 0]",
    "description": "تكرار"
   },
   {
    "input": "bag_of_words(\"AI ai Ai\", [\"ai\"])",
    "expectedOutput": "[3]",
    "description": "حالة الأحرف"
   },
   {
    "input": "bag_of_words(\"\", [\"x\"])",
    "expectedOutput": "[0]",
    "description": "فارغة",
    "hidden": true
   }
  ]
 },
 "aib-ch-003": {
  "id": "aib-ch-003",
  "language": "Python",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "def min_max_scale(values):\n    pass",
  "testCases": [
   {
    "input": "min_max_scale([10, 20, 30])",
    "expectedOutput": "[0.0, 0.5, 1.0]",
    "description": "ثلاث قيم"
   },
   {
    "input": "min_max_scale([5, 5, 5])",
    "expectedOutput": "[0.0, 0.0, 0.0]",
    "description": "قيم متساوية"
   },
   {
    "input": "min_max_scale([3, 1, 2, 7])",
    "expectedOutput": "[0.333, 0.0, 0.167, 1.0]",
    "description": "غير مرتبة",
    "hidden": true
   }
  ]
 },
 "aib-ch-004": {
  "id": "aib-ch-004",
  "language": "Python",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "def confusion_counts(actual, predicted):\n    pass",
  "testCases": [
   {
    "input": "confusion_counts([1, 0, 1, 0], [1, 1, 0, 0])",
    "expectedOutput": "{\"tp\": 1, \"fp\": 1, \"tn\": 1, \"fn\": 1}",
    "description": "حالة لكل نوع"
   },
   {
    "input": "confusion_counts([1, 1], [1, 1])",
    "expectedOutput": "{\"tp\": 2, \"fp\": 0, \"tn\": 0, \"fn\": 0}",
    "description": "كلها صحيحة"
   },
   {
    "input": "confusion_counts([], [])",
    "expectedOutput": "{\"tp\": 0, \"fp\": 0, \"tn\": 0, \"fn\": 0}",
    "description": "فارغة",
    "hidden": true
   }
  ]
 },
 "ml-ch-001": {
  "id": "ml-ch-001",
  "language": "Python",
  "difficulty": "medium",
  "points": 45,
  "starterCode": "def fit_line(xs, ys):\n    pass",
  "testCases": [
   {
    "input": "fit_line([1, 2, 3], [2, 4, 6])",
    "expectedOutput": "(2.0, 0.0)",
    "description": "خط مثالي"
   },
   {
    "input": "fit_line([0, 1, 2, 3], [1, 3, 5, 7])",
    "expectedOutput": "(2.0, 1.0)",
    "description": "مع قاطع"
   },
   {
    "input": "fit_line([1, 2, 3, 4], [2, 3, 5, 4])",
    "expectedOutput": "(0.8, 1.5)",
    "description": "بيانات مشوشة",
    "hidden": true
   }
  ]
 },
 "ml-ch-002": {
  "id": "ml-ch-002",
  "language": "Python",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "import math\n\n\ndef predict_proba(weights, bias, x):\n    pass\n\n\ndef predict(weights, bias, x):\n    pass",
  "testCases": [
   {
    "input": "predict_proba([0, 0], 0, [5, 5])",
    "expectedOutput": "0.5",
    "description": "z = 0"
   },
   {
    "input": "predict_proba([1, 2], -1, [1, 1])",
    "expectedOutput": "0.881",
    "description": "z = 2"
   },
   {
    "input": "predict([1, 1], -5, [1, 1])",
    "expectedOutput": "0",
    "description": "تصنيف سلبي",
    "hidden": true
   },
   {
    "input": "predict([2], 0, [3])",
    "expectedOutput": "1",
    "description": "تصنيف إيجابي",
    "hidden": true
   }
  ]
 },
 "ml-ch-003": {
  "id": "ml-ch-003",
  "language": "Python",
  "difficulty": "medium",
  "points": 50,
  "starterCode": "def knn_predict(points, labels, query, k):\n    pass",
  "testCases": [
   {
    "input": "knn_predict([[0, 0], [1, 1], [5, 5]], [\"a\", \"a\", \"b\"], [0, 1], 1)",
    "expectedOutput": "a",
    "description": "أقرب جار"
   },
   {
    "input": "knn_predict([[0, 0], [1, 1], [5, 5], [6, 6]], [\"a\", \"a\", \"b\", \"b\"], [5, 6], 3)",
    "expectedOutput": "b",
    "description": "k=3"
   },
   {
    "input": "knn_predict([[0, 0], [2, 0]], [\"z\", \"y\"], [1, 0], 2)",
    "expectedOutput": "y",
    "description": "تعادل → أبجدياً",
    "hidden": true
   }
  ]
 },
 "ml-ch-004": {
  "id": "ml-ch-004",
  "language": "Python",
  "difficulty": "hard",
  "points": 80,
  "starterCode": "def gini(labels):\n    pass\n\n\ndef best_split(values, labels):\n    pass",
  "testCases": [
   {
    "input": "gini([\"a\", \"a\", \"b\", \"b\"])",
    "expectedOutput": "0.5",
    "description": "نصف ونصف"
   },
   {
    "input": "gini([\"a\", \"a\"])",
    "expectedOutput": "0.0",
    "description": "نقي"
   },
   {
    "input": "best_split([1, 2, 3, 4], [\"x\", \"x\", \"y\", \"y\"])",
    "expectedOutput": "2",
    "description": "فصل مثالي"
   },
   {
    "input": "best_split([5, 1, 9, 3], [\"n\", \"y\", \"n\", \"y\"])",
    "expectedOutput": "3",
    "description": "قيم غير مرتبة",
    "hidden": true
   }
  ]
 },
 "dl-ch-001": {
  "id": "dl-ch-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "import math\n\n\ndef relu(x):\n    pass\n\n\ndef sigmoid(x):\n    pass\n\n\ndef softmax(values):\n    pass",
  "testCases": [
   {
    "input": "list(map(relu, [-3, 2]))",
    "expectedOutput": "[0, 2]",
    "description": "ReLU"
   },
   {
    "input": "relu(7)",
    "expectedOutput": "7",
    "description": "ReLU موجب",
    "hidden": true
   },
   {
    "input": "relu(-0.5)",
    "expectedOutput": "0",
    "description": "ReLU سالب",
    "hidden": true
   },
   {
    "input": "list(map(relu, [0, -1.5, 4]))",
    "expectedOutput": "[0, 0, 4]",
    "description": "ReLU على قائمة",
    "hidden": true
   },
   {
    "input": "sigmoid(0)",
    "expectedOutput": "0.5",
    "description": "Sigmoid"
   },
   {
    "input": "sigmoid(2)",
    "expectedOutput": "0.8808",
    "description": "Sigmoid موجب",
    "hidden": true
   },
   {
    "input": "softmax([1, 2, 3])",
    "expectedOutput": "[0.09, 0.2447, 0.6652]",
    "description": "Softmax"
   },
   {
    "input": "softmax([1000, 1000])",
    "expectedOutput": "[0.5, 0.5]",
    "description": "ثبات عددي",
    "hidden": true
   }
  ]
 },
 "dl-ch-002": {
  "id": "dl-ch-002",
  "language": "Python",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "import math\n\n\ndef mse(y_true, y_pred):\n    pass\n\n\ndef binary_cross_entropy(y_true, y_pred):\n    pass",
  "testCases": [
   {
    "input": "mse([1, 2, 3], [1, 2, 5])",
    "expectedOutput": "1.3333",
    "description": "MSE"
   },
   {
    "input": "mse([0, 0], [1, 1])",
    "expectedOutput": "1.0",
    "description": "MSE بسيط",
    "hidden": true
   },
   {
    "input": "binary_cross_entropy([1, 0], [0.9, 0.1])",
    "expectedOutput": "0.1054",
    "description": "BCE"
   },
   {
    "input": "binary_cross_entropy([1], [0.0]) > 10",
    "expectedOutput": "True",
    "description": "قص الاحتمال يمنع الانهيار",
    "hidden": true
   }
  ]
 },
 "dl-ch-003": {
  "id": "dl-ch-003",
  "language": "Python",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "def dense_forward(x, W, b):\n    pass",
  "testCases": [
   {
    "input": "dense_forward([1, 2], [[1, 0], [0, 1]], [0, 0])",
    "expectedOutput": "[1, 2]",
    "description": "مصفوفة الوحدة"
   },
   {
    "input": "dense_forward([1, 1], [[1, -2], [1, -2]], [0, 1])",
    "expectedOutput": "[2, 0]",
    "description": "ReLU يقص السالب"
   },
   {
    "input": "dense_forward([2], [[0.5, 1.5, -1]], [1, 0, 1])",
    "expectedOutput": "[2.0, 3.0, 0]",
    "description": "ثلاثة عصبونات",
    "hidden": true
   }
  ]
 },
 "dl-ch-004": {
  "id": "dl-ch-004",
  "language": "Python",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "def gradient_descent(lr, steps, start):\n    pass",
  "testCases": [
   {
    "input": "gradient_descent(0.5, 1, 0)",
    "expectedOutput": "3.0",
    "description": "خطوة واحدة مثالية"
   },
   {
    "input": "gradient_descent(0.1, 50, 0)",
    "expectedOutput": "3.0",
    "description": "تقارب"
   },
   {
    "input": "gradient_descent(0.1, 2, 0)",
    "expectedOutput": "1.08",
    "description": "خطوتان",
    "hidden": true
   }
  ]
 },
 "dl-ch-005": {
  "id": "dl-ch-005",
  "language": "Python",
  "difficulty": "hard",
  "points": 75,
  "starterCode": "def conv2d(image, kernel):\n    pass\n\n\ndef max_pool(matrix, size):\n    pass",
  "testCases": [
   {
    "input": "conv2d([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0], [0, -1]])",
    "expectedOutput": "[[-4, -4], [-4, -4]]",
    "description": "التفاف 2×2"
   },
   {
    "input": "max_pool([[1, 3, 2, 4], [5, 6, 1, 0], [7, 2, 9, 8], [1, 1, 3, 4]], 2)",
    "expectedOutput": "[[6, 4], [7, 9]]",
    "description": "تجميع"
   },
   {
    "input": "max_pool([[1, 2, 3], [4, 5, 6], [7, 8, 9]], 2)",
    "expectedOutput": "[[5]]",
    "description": "تجاهل الأطراف",
    "hidden": true
   },
   {
    "input": "conv2d([[1, 1], [1, 1]], [[2]])",
    "expectedOutput": "[[2, 2], [2, 2]]",
    "description": "نواة 1×1",
    "hidden": true
   }
  ]
 },
 "dl-ch-006": {
  "id": "dl-ch-006",
  "language": "Python",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "def batch_norm(values, eps=1e-5):\n    pass",
  "testCases": [
   {
    "input": "batch_norm([1, 2, 3])",
    "expectedOutput": "[-1.225, 0.0, 1.225]",
    "description": "ثلاث قيم"
   },
   {
    "input": "batch_norm([5, 5])",
    "expectedOutput": "[0.0, 0.0]",
    "description": "قيم متساوية"
   },
   {
    "input": "batch_norm([0, 10])",
    "expectedOutput": "[-1.0, 1.0]",
    "description": "قيمتان",
    "hidden": true
   }
  ]
 },
 "dl-ch-007": {
  "id": "dl-ch-007",
  "language": "Python",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "def early_stop_epoch(val_losses, patience):\n    pass",
  "testCases": [
   {
    "input": "early_stop_epoch([0.9, 0.7, 0.71, 0.72, 0.73], 2)",
    "expectedOutput": "3",
    "description": "توقف بعد حقبتين بلا تحسن"
   },
   {
    "input": "early_stop_epoch([0.9, 0.8, 0.7], 2)",
    "expectedOutput": "2",
    "description": "لم يتوقف"
   },
   {
    "input": "early_stop_epoch([0.5, 0.6, 0.4, 0.45, 0.5, 0.55], 3)",
    "expectedOutput": "5",
    "description": "تحسن متأخر يصفّر العداد",
    "hidden": true
   }
  ]
 },
 "dl-ch-008": {
  "id": "dl-ch-008",
  "language": "Python",
  "difficulty": "hard",
  "points": 70,
  "starterCode": "import math\n\n\ndef attention_weights(query, keys):\n    pass",
  "testCases": [
   {
    "input": "attention_weights([1, 0], [[1, 0], [0, 1]])",
    "expectedOutput": "[0.67, 0.33]",
    "description": "مفتاحان"
   },
   {
    "input": "attention_weights([0, 0], [[1, 2], [3, 4], [5, 6]])",
    "expectedOutput": "[0.333, 0.333, 0.333]",
    "description": "استعلام صفري"
   },
   {
    "input": "attention_weights([2, 1], [[1, 1], [2, 0], [0, 3]])",
    "expectedOutput": "[0.248, 0.503, 0.248]",
    "description": "ثلاثة مفاتيح",
    "hidden": true
   },
   {
    "input": "attention_weights([1, 1], [[1, 1], [1, 1]])",
    "expectedOutput": "[0.5, 0.5]",
    "description": "مفاتيح متطابقة",
    "hidden": true
   }
  ]
 },
 "cybd-ch-001": {
  "id": "cybd-ch-001",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "def cookie_issues(header):\n    pass",
  "testCases": [
   {
    "input": "cookie_issues(\"session=abc; Path=/\")",
    "expectedOutput": "[\"HttpOnly\", \"SameSite\", \"Secure\"]",
    "description": "كلها ناقصة"
   },
   {
    "input": "cookie_issues(\"id=1; HttpOnly; Secure; SameSite=Lax\")",
    "expectedOutput": "[]",
    "description": "آمنة"
   },
   {
    "input": "cookie_issues(\"id=1; secure; httponly\")",
    "expectedOutput": "[\"SameSite\"]",
    "description": "حروف صغيرة",
    "hidden": true
   }
  ]
 },
 "cybd-ch-002": {
  "id": "cybd-ch-002",
  "language": "Python",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "import re\n\n\ndef phishing_flags(url):\n    pass",
  "testCases": [
   {
    "input": "phishing_flags(\"https://kodax.app/learn\")",
    "expectedOutput": "[]",
    "description": "رابط سليم"
   },
   {
    "input": "phishing_flags(\"http://192.168.1.5/login\")",
    "expectedOutput": "[\"ip_host\", \"no_https\"]",
    "description": "IP بدون https"
   },
   {
    "input": "phishing_flags(\"https://secure.login.bank.example.com@evil.io\")",
    "expectedOutput": "[\"at_sign\"]",
    "description": "علامة @",
    "hidden": true
   },
   {
    "input": "phishing_flags(\"https://a.b.c.d.example.com\")",
    "expectedOutput": "[\"many_subdomains\"]",
    "description": "نطاقات فرعية كثيرة",
    "hidden": true
   }
  ]
 },
 "cybd-ch-003": {
  "id": "cybd-ch-003",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "import hashlib\nimport hmac\n\n\ndef verify_integrity(content, expected_hex):\n    pass",
  "testCases": [
   {
    "input": "verify_integrity(\"hello\", \"2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\")",
    "expectedOutput": "True",
    "description": "سليم"
   },
   {
    "input": "verify_integrity(\"hello!\", \"2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\")",
    "expectedOutput": "False",
    "description": "معدّل"
   },
   {
    "input": "verify_integrity(\"hello\", \"2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824\")",
    "expectedOutput": "True",
    "description": "حروف كبيرة",
    "hidden": true
   }
  ]
 },
 "cybd-ch-004": {
  "id": "cybd-ch-004",
  "language": "Python",
  "difficulty": "medium",
  "points": 45,
  "starterCode": "ALLOWED = {\"users\": {\"id\", \"name\", \"email\", \"role\"}}\n\n\ndef build_select(table, filters):\n    pass",
  "testCases": [
   {
    "input": "build_select(\"users\", {\"name\": \"Ali\"})",
    "expectedOutput": "(\"SELECT * FROM users WHERE name = ?\", [\"Ali\"])",
    "description": "شرط واحد"
   },
   {
    "input": "build_select(\"users\", {\"role\": \"admin\", \"id\": 5})",
    "expectedOutput": "(\"SELECT * FROM users WHERE id = ? AND role = ?\", [5, \"admin\"])",
    "description": "شرطان مرتبان"
   },
   {
    "input": "build_select(\"users\", {\"name\": \"x' OR '1'='1\"})[0]",
    "expectedOutput": "SELECT * FROM users WHERE name = ?",
    "description": "القيمة الخبيثة لا تدخل النص",
    "hidden": true
   },
   {
    "input": "try:\n    build_select(\"users; DROP TABLE users\", {})\n    r = \"no error\"\nexcept ValueError:\n    r = \"rejected\"\nr",
    "expectedOutput": "rejected",
    "description": "جدول غير مسموح",
    "hidden": true
   },
   {
    "input": "sql, params = build_select(\"users\", {})\n(sql, params)",
    "expectedOutput": "(\"SELECT * FROM users\", [])",
    "description": "بدون شروط",
    "hidden": true
   }
  ]
 },
 "cybd-ch-005": {
  "id": "cybd-ch-005",
  "language": "Python",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "def escape_html(text):\n    pass",
  "testCases": [
   {
    "input": "escape_html(\"<b>hi</b>\")",
    "expectedOutput": "&lt;b&gt;hi&lt;/b&gt;",
    "description": "وسوم"
   },
   {
    "input": "escape_html(\"a & b\")",
    "expectedOutput": "a &amp; b",
    "description": "علامة &"
   },
   {
    "input": "escape_html(\"&lt;\")",
    "expectedOutput": "&amp;lt;",
    "description": "لا ترميز مزدوج خاطئ",
    "hidden": true
   }
  ]
 },
 "cybd-ch-006": {
  "id": "cybd-ch-006",
  "language": "Python",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "def severity(cvss):\n    pass\n\n\ndef prioritize(findings):\n    pass",
  "testCases": [
   {
    "input": "severity(9.8)",
    "expectedOutput": "critical",
    "description": "حرجة"
   },
   {
    "input": "severity(5.5)",
    "expectedOutput": "medium",
    "description": "متوسطة",
    "hidden": true
   },
   {
    "input": "prioritize([{\"id\": \"B\", \"cvss\": 5.0}, {\"id\": \"A\", \"cvss\": 9.1}, {\"id\": \"C\", \"cvss\": 5.0}])",
    "expectedOutput": "[\"A\", \"B\", \"C\"]",
    "description": "ترتيب"
   },
   {
    "input": "list(map(severity, [7.0, 4.0, 3.9]))",
    "expectedOutput": "[\"high\", \"medium\", \"low\"]",
    "description": "الحدود",
    "hidden": true
   },
   {
    "input": "prioritize([])",
    "expectedOutput": "[]",
    "description": "لا نتائج",
    "hidden": true
   },
   {
    "input": "list(map(severity, [9.0, 0]))",
    "expectedOutput": "[\"critical\", \"low\"]",
    "description": "الطرفان",
    "hidden": true
   }
  ]
 },
 "cppoop-ch-001": {
  "id": "cppoop-ch-001",
  "language": "C++",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "class Rectangle {\npublic:\n    Rectangle(int w, int h) {\n        // خزّن العرض والارتفاع\n    }\n    int area() { return 0; }\n    int perimeter() { return 0; }\n};",
  "testCases": [
   {
    "input": "Rectangle r(3, 4); r.area()",
    "expectedOutput": "12",
    "description": "المساحة"
   },
   {
    "input": "Rectangle r(3, 4); r.perimeter()",
    "expectedOutput": "14",
    "description": "المحيط"
   },
   {
    "input": "Rectangle r(10, 1); r.area()",
    "expectedOutput": "10",
    "description": "مستطيل طويل",
    "hidden": true
   },
   {
    "input": "Rectangle r(5, 5); r.perimeter()",
    "expectedOutput": "20",
    "description": "مربع",
    "hidden": true
   }
  ]
 },
 "cppoop-ch-002": {
  "id": "cppoop-ch-002",
  "language": "C++",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "class Account {\npublic:\n    Account(int initial) {}\n    void deposit(int amount) {}\n    bool withdraw(int amount) { return false; }\n    int balance() { return 0; }\n};",
  "testCases": [
   {
    "input": "Account a(100); a.deposit(50); a.balance()",
    "expectedOutput": "150",
    "description": "إيداع"
   },
   {
    "input": "Account a(100); a.withdraw(30)",
    "expectedOutput": "1",
    "description": "سحب ممكن"
   },
   {
    "input": "Account a(100); a.withdraw(500); a.balance()",
    "expectedOutput": "100",
    "description": "سحب مرفوض",
    "hidden": true
   },
   {
    "input": "Account a(10); a.deposit(-5); a.balance()",
    "expectedOutput": "10",
    "description": "إيداع سالب",
    "hidden": true
   }
  ]
 },
 "cppoop-ch-003": {
  "id": "cppoop-ch-003",
  "language": "C++",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "class Ticket {\npublic:\n    Ticket() {}\n    int id() { return 0; }\n    static int total() { return 0; }\n};",
  "testCases": [
   {
    "input": "Ticket a; Ticket b; int t = Ticket::total(); t",
    "expectedOutput": "2",
    "description": "تذكرتان"
   },
   {
    "input": "Ticket a; Ticket b; Ticket c; c.id()",
    "expectedOutput": "3",
    "description": "الرقم التسلسلي"
   },
   {
    "input": "int t = Ticket::total(); t",
    "expectedOutput": "0",
    "description": "بلا تذاكر",
    "hidden": true
   },
   {
    "input": "Ticket a; a.id()",
    "expectedOutput": "1",
    "description": "أول تذكرة",
    "hidden": true
   }
  ]
 },
 "cppoop-ch-004": {
  "id": "cppoop-ch-004",
  "language": "C++",
  "difficulty": "medium",
  "points": 45,
  "starterCode": "class Fraction {\npublic:\n    Fraction(int n, int d) {}\n    std::string str() { return \"\"; }\n};",
  "testCases": [
   {
    "input": "Fraction a(1, 2); Fraction b(1, 3); (a + b).str()",
    "expectedOutput": "5/6",
    "description": "الجمع"
   },
   {
    "input": "Fraction a(2, 4); a.str()",
    "expectedOutput": "1/2",
    "description": "التبسيط"
   },
   {
    "input": "Fraction a(1, -2); a.str()",
    "expectedOutput": "-1/2",
    "description": "الإشارة",
    "hidden": true
   },
   {
    "input": "Fraction a(1, 2); Fraction b(3, 6); a == b",
    "expectedOutput": "1",
    "description": "المساواة بعد التبسيط",
    "hidden": true
   },
   {
    "input": "Fraction a(1, 4); Fraction b(3, 4); (a + b).str()",
    "expectedOutput": "1/1",
    "description": "ناتج صحيح",
    "hidden": true
   }
  ]
 },
 "cppoop-ch-005": {
  "id": "cppoop-ch-005",
  "language": "C++",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "class Shape {\npublic:\n    virtual double area() const = 0;\n    virtual ~Shape() {}\n};\n\n// Square, Circle\n\ndouble totalArea(const std::vector<Shape*>& shapes) {\n    return 0;\n}",
  "testCases": [
   {
    "input": "Square s(2); Circle c(1); std::vector<Shape*> v = {&s, &c}; totalArea(v)",
    "expectedOutput": "7.14159",
    "description": "مربع ودائرة"
   },
   {
    "input": "Square s(3); std::vector<Shape*> v = {&s}; totalArea(v)",
    "expectedOutput": "9",
    "description": "مربع"
   },
   {
    "input": "std::vector<Shape*> v; totalArea(v)",
    "expectedOutput": "0",
    "description": "فارغة",
    "hidden": true
   },
   {
    "input": "Circle a(2); Circle b(1); std::vector<Shape*> v = {&a, &b}; totalArea(v)",
    "expectedOutput": "15.708",
    "description": "دائرتان",
    "hidden": true
   }
  ]
 },
 "cppoop-ch-006": {
  "id": "cppoop-ch-006",
  "language": "C++",
  "difficulty": "medium",
  "points": 55,
  "starterCode": "class Buffer {\n    int* data;\n    int n;\npublic:\n    Buffer(int n) : data(new int[n]()), n(n) {}\n    ~Buffer() { delete[] data; }\n    // مُنشئ النسخ + عامل الإسناد\n    void set(int i, int v) { data[i] = v; }\n    int get(int i) const { return data[i]; }\n    int size() const { return n; }\n};",
  "testCases": [
   {
    "input": "Buffer a(3); a.set(0, 5); Buffer b = a; b.set(0, 9); a.get(0)",
    "expectedOutput": "5",
    "description": "النسخة مستقلة"
   },
   {
    "input": "Buffer a(2); a.set(1, 7); Buffer b(5); b = a; b.size()",
    "expectedOutput": "2",
    "description": "الإسناد"
   },
   {
    "input": "Buffer a(2); a.set(1, 7); Buffer b(1); b = a; a.set(1, 0); b.get(1)",
    "expectedOutput": "7",
    "description": "الإسناد نسخ عميق",
    "hidden": true
   },
   {
    "input": "Buffer a(2); a.set(0, 4); a = a; a.get(0)",
    "expectedOutput": "4",
    "description": "الإسناد للذات",
    "hidden": true
   }
  ]
 },
 "cppoop-ch-007": {
  "id": "cppoop-ch-007",
  "language": "C++",
  "difficulty": "hard",
  "points": 85,
  "starterCode": "class Employee {\npublic:\n    std::string name;\n    Employee(std::string n) : name(n) {}\n    virtual int salary() const = 0;\n    virtual ~Employee() {}\n};\n\n// Engineer, Manager\n\nstd::string payroll(const std::vector<Employee*>& staff) {\n    return \"\";\n}\n\nint totalPayroll(const std::vector<Employee*>& staff) {\n    return 0;\n}",
  "testCases": [
   {
    "input": "Engineer a(\"Ali\", 1000); Manager m(\"Sara\", 900, 3); std::vector<Employee*> v = {&a, &m}; payroll(v)",
    "expectedOutput": "Sara,Ali",
    "description": "الترتيب"
   },
   {
    "input": "Engineer a(\"Ali\", 1000); Manager m(\"Sara\", 900, 3); std::vector<Employee*> v = {&a, &m}; totalPayroll(v)",
    "expectedOutput": "2200",
    "description": "المجموع"
   },
   {
    "input": "Engineer a(\"Zaid\", 500); Engineer b(\"Huda\", 500); std::vector<Employee*> v = {&a, &b}; payroll(v)",
    "expectedOutput": "Huda,Zaid",
    "description": "تعادل → أبجدياً",
    "hidden": true
   },
   {
    "input": "std::vector<Employee*> v; totalPayroll(v)",
    "expectedOutput": "0",
    "description": "بلا موظفين",
    "hidden": true
   }
  ]
 },
 "cppadv-ch-001": {
  "id": "cppadv-ch-001",
  "language": "C++",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "template <typename T>\nT maxOf(const std::vector<T>& items) {\n    return items[0];\n}",
  "testCases": [
   {
    "input": "maxOf(std::vector<int>{3, 9, 2})",
    "expectedOutput": "9",
    "description": "أرقام"
   },
   {
    "input": "maxOf(std::vector<std::string>{\"b\", \"z\", \"a\"})",
    "expectedOutput": "z",
    "description": "نصوص"
   },
   {
    "input": "maxOf(std::vector<double>{-1.5, -0.5})",
    "expectedOutput": "-0.5",
    "description": "سالبة",
    "hidden": true
   },
   {
    "input": "maxOf(std::vector<int>{7})",
    "expectedOutput": "7",
    "description": "عنصر واحد",
    "hidden": true
   }
  ]
 },
 "cppadv-ch-002": {
  "id": "cppadv-ch-002",
  "language": "C++",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "std::string topWord(const std::string& text) {\n    return \"\";\n}",
  "testCases": [
   {
    "input": "topWord(\"a b a c b a\")",
    "expectedOutput": "a",
    "description": "تكرار واضح"
   },
   {
    "input": "topWord(\"dog cat cat dog\")",
    "expectedOutput": "cat",
    "description": "تعادل"
   },
   {
    "input": "topWord(\"one\")",
    "expectedOutput": "one",
    "description": "كلمة واحدة",
    "hidden": true
   },
   {
    "input": "topWord(\"x  y   y\")",
    "expectedOutput": "y",
    "description": "مسافات متعددة",
    "hidden": true
   }
  ]
 },
 "cppadv-ch-003": {
  "id": "cppadv-ch-003",
  "language": "C++",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "std::vector<int> evenSquaresDesc(std::vector<int> v) {\n    return {};\n}",
  "testCases": [
   {
    "input": "evenSquaresDesc({1, 2, 3, 4})",
    "expectedOutput": "[16, 4]",
    "description": "أرقام مختلطة"
   },
   {
    "input": "evenSquaresDesc({1, 3, 5})",
    "expectedOutput": "[]",
    "description": "لا زوجية"
   },
   {
    "input": "evenSquaresDesc({-2, 6, 0})",
    "expectedOutput": "[36, 4, 0]",
    "description": "سالب وصفر",
    "hidden": true
   }
  ]
 },
 "cppadv-ch-004": {
  "id": "cppadv-ch-004",
  "language": "C++",
  "difficulty": "medium",
  "points": 30,
  "starterCode": "int safeDivide(int a, int b) {\n    return a / b;\n}\n\nstd::string tryDivide(int a, int b) {\n    return \"\";\n}",
  "testCases": [
   {
    "input": "tryDivide(10, 2)",
    "expectedOutput": "ok:5",
    "description": "قسمة عادية"
   },
   {
    "input": "tryDivide(1, 0)",
    "expectedOutput": "error:division by zero",
    "description": "قسمة على صفر"
   },
   {
    "input": "tryDivide(-9, 3)",
    "expectedOutput": "ok:-3",
    "description": "سالب",
    "hidden": true
   },
   {
    "input": "safeDivide(8, 4)",
    "expectedOutput": "2",
    "description": "safeDivide مباشرة",
    "hidden": true
   },
   {
    "input": "safeDivide(9, 2)",
    "expectedOutput": "4",
    "description": "قسمة صحيحة",
    "hidden": true
   }
  ]
 },
 "cppadv-ch-005": {
  "id": "cppadv-ch-005",
  "language": "C++",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "std::optional<int> findIndex(const std::vector<int>& v, int target) {\n    return std::nullopt;\n}\n\nstd::string describe(const std::vector<int>& v, int target) {\n    return \"\";\n}",
  "testCases": [
   {
    "input": "describe({5, 7, 9}, 7)",
    "expectedOutput": "found at 1",
    "description": "موجود"
   },
   {
    "input": "describe({5, 7, 9}, 4)",
    "expectedOutput": "not found",
    "description": "غير موجود"
   },
   {
    "input": "findIndex({3, 3}, 3).value()",
    "expectedOutput": "0",
    "description": "أول ظهور",
    "hidden": true
   },
   {
    "input": "int r = findIndex({}, 1).has_value(); r",
    "expectedOutput": "0",
    "description": "فارغة",
    "hidden": true
   },
   {
    "input": "int r = findIndex({2}, 2).has_value(); r",
    "expectedOutput": "1",
    "description": "has_value عند الوجود",
    "hidden": true
   },
   {
    "input": "findIndex({4, 8, 8}, 8).value()",
    "expectedOutput": "1",
    "description": "موقع غير صفري",
    "hidden": true
   }
  ]
 },
 "cppadv-ch-006": {
  "id": "cppadv-ch-006",
  "language": "C++",
  "difficulty": "hard",
  "points": 70,
  "starterCode": "std::vector<int> mergeIntervals(std::vector<std::pair<int, int>> intervals) {\n    return {};\n}",
  "testCases": [
   {
    "input": "mergeIntervals({{1, 3}, {2, 6}, {8, 10}})",
    "expectedOutput": "[1, 6, 8, 10]",
    "description": "تداخل"
   },
   {
    "input": "mergeIntervals({{5, 7}, {1, 2}})",
    "expectedOutput": "[1, 2, 5, 7]",
    "description": "غير مرتبة"
   },
   {
    "input": "mergeIntervals({{1, 4}, {4, 5}})",
    "expectedOutput": "[1, 5]",
    "description": "متلاصقة",
    "hidden": true
   },
   {
    "input": "mergeIntervals({{1, 10}, {2, 3}, {4, 5}})",
    "expectedOutput": "[1, 10]",
    "description": "فترات داخلية",
    "hidden": true
   },
   {
    "input": "mergeIntervals({})",
    "expectedOutput": "[]",
    "description": "فارغة",
    "hidden": true
   }
  ]
 },
 "sql-ch-001": {
  "id": "sql-ch-001",
  "language": "SQL",
  "difficulty": "easy",
  "points": 15,
  "starterCode": "-- الجدول: products(id, name, category, price)\n-- اكتب الاستعلام هنا\nSELECT name FROM products;",
  "testCases": [
   {
    "input": "CREATE TABLE products(id INTEGER, name TEXT, category TEXT, price REAL);\nINSERT INTO products VALUES (1,'Laptop','tech',900),(2,'Mouse','tech',25),(3,'Desk','home',150),(4,'Lamp','home',40),(5,'Phone','tech',600),(6,'Chair','home',120);",
    "expectedOutput": "Laptop|900.0\nPhone|600.0\nDesk|150.0\nChair|120.0",
    "description": "منتجات المتجر"
   },
   {
    "input": "CREATE TABLE products(id INTEGER, name TEXT, category TEXT, price REAL);\nINSERT INTO products VALUES (1,'A','x',100),(2,'B','x',101);",
    "expectedOutput": "B|101.0",
    "description": "100 بالضبط لا تُحتسب",
    "hidden": true
   }
  ]
 },
 "sql-ch-002": {
  "id": "sql-ch-002",
  "language": "SQL",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "-- customers(id, name), orders(id, customer_id, total)\nSELECT id FROM orders;",
  "testCases": [
   {
    "input": "CREATE TABLE customers(id INTEGER, name TEXT); CREATE TABLE orders(id INTEGER, customer_id INTEGER, total INTEGER);\nINSERT INTO customers VALUES (1,'Ali'),(2,'Sara');\nINSERT INTO orders VALUES (10,2,50),(11,1,70),(12,2,20);",
    "expectedOutput": "10|Sara|50\n11|Ali|70\n12|Sara|20",
    "description": "ثلاثة طلبات"
   },
   {
    "input": "CREATE TABLE customers(id INTEGER, name TEXT); CREATE TABLE orders(id INTEGER, customer_id INTEGER, total INTEGER);\nINSERT INTO customers VALUES (1,'Omar'),(2,'Mona');\nINSERT INTO orders VALUES (3,1,15);",
    "expectedOutput": "3|Omar|15",
    "description": "عميل بلا طلبات لا يظهر",
    "hidden": true
   }
  ]
 },
 "sql-ch-003": {
  "id": "sql-ch-003",
  "language": "SQL",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "-- products(id, name, category, price)\nSELECT category FROM products;",
  "testCases": [
   {
    "input": "CREATE TABLE products(id INTEGER, name TEXT, category TEXT, price REAL);\nINSERT INTO products VALUES (1,'Laptop','tech',900),(2,'Mouse','tech',25),(3,'Desk','home',150),(4,'Lamp','home',40),(5,'Phone','tech',600),(6,'Chair','home',120);",
    "expectedOutput": "home|3|103.33\ntech|3|508.33",
    "description": "فئتان"
   },
   {
    "input": "CREATE TABLE products(id INTEGER, name TEXT, category TEXT, price REAL);\nINSERT INTO products VALUES (1,'A','solo',10),(2,'B','pair',10),(3,'C','pair',21);",
    "expectedOutput": "pair|2|15.5",
    "description": "فئة بمنتج واحد تُستبعد",
    "hidden": true
   }
  ]
 },
 "sql-ch-004": {
  "id": "sql-ch-004",
  "language": "SQL",
  "difficulty": "medium",
  "points": 45,
  "starterCode": "-- employees(name, dept, salary)\nSELECT name FROM employees;",
  "testCases": [
   {
    "input": "CREATE TABLE employees(name TEXT, dept TEXT, salary INTEGER);\nINSERT INTO employees VALUES ('Ali','it',900),('Sara','it',1500),('Omar','hr',700),('Mona','hr',500),('Zaid','it',1300);",
    "expectedOutput": "Omar\nSara\nZaid",
    "description": "قسمان"
   },
   {
    "input": "CREATE TABLE employees(name TEXT, dept TEXT, salary INTEGER);\nINSERT INTO employees VALUES ('A','x',100),('B','x',100);",
    "expectedOutput": "",
    "description": "رواتب متساوية: لا أحد أعلى",
    "hidden": true
   }
  ]
 },
 "sql-ch-005": {
  "id": "sql-ch-005",
  "language": "SQL",
  "difficulty": "hard",
  "points": 75,
  "starterCode": "-- customers(id, name, city), orders(customer_id, total)\nSELECT city FROM customers;",
  "testCases": [
   {
    "input": "CREATE TABLE customers(id INTEGER, name TEXT, city TEXT); CREATE TABLE orders(customer_id INTEGER, total INTEGER);\nINSERT INTO customers VALUES (1,'Ali','Baghdad'),(2,'Sara','Baghdad'),(3,'Omar','Basra'),(4,'Mona','Basra');\nINSERT INTO orders VALUES (1,100),(1,50),(2,120),(3,80),(4,30),(4,20);",
    "expectedOutput": "Baghdad|Ali|150\nBasra|Omar|80",
    "description": "مدينتان"
   },
   {
    "input": "CREATE TABLE customers(id INTEGER, name TEXT, city TEXT); CREATE TABLE orders(customer_id INTEGER, total INTEGER);\nINSERT INTO customers VALUES (1,'Zaid','Erbil'),(2,'Huda','Erbil'),(3,'Noor','Mosul');\nINSERT INTO orders VALUES (1,60),(2,60);",
    "expectedOutput": "Erbil|Huda|60",
    "description": "تعادل + مدينة بلا طلبات",
    "hidden": true
   }
  ]
 },
 "auth-ch-001": {
  "id": "auth-ch-001",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "function passwordProblems(pw) {\n  return [];\n}",
  "testCases": [
   {
    "input": "passwordProblems(\"abc\")",
    "expectedOutput": "[\"digit\",\"length\",\"upper\"]",
    "description": "قصيرة وضعيفة"
   },
   {
    "input": "passwordProblems(\"Secure123\")",
    "expectedOutput": "[]",
    "description": "قوية"
   },
   {
    "input": "passwordProblems(\"ALLUPPER99\")",
    "expectedOutput": "[\"lower\"]",
    "description": "بلا حروف صغيرة",
    "hidden": true
   },
   {
    "input": "passwordProblems(\"lowercase1\")",
    "expectedOutput": "[\"upper\"]",
    "description": "بلا حروف كبيرة",
    "hidden": true
   }
  ]
 },
 "auth-ch-002": {
  "id": "auth-ch-002",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "function jwtStatus(token, nowSeconds) {\n  return 'invalid';\n}",
  "testCases": [
   {
    "input": "jwtStatus(\"h.\" + Buffer.from(JSON.stringify({ sub: \"u1\", exp: 2000 })).toString(\"base64url\") + \".s\", 1000)",
    "expectedOutput": "valid:u1",
    "description": "صالح"
   },
   {
    "input": "jwtStatus(\"h.\" + Buffer.from(JSON.stringify({ sub: \"u1\", exp: 500 })).toString(\"base64url\") + \".s\", 1000)",
    "expectedOutput": "expired",
    "description": "منتهي"
   },
   {
    "input": "jwtStatus(\"not-a-token\", 1)",
    "expectedOutput": "invalid",
    "description": "شكل خاطئ",
    "hidden": true
   },
   {
    "input": "jwtStatus(\"a.%%%.c\", 1)",
    "expectedOutput": "invalid",
    "description": "محتوى غير قابل للقراءة",
    "hidden": true
   }
  ]
 },
 "auth-ch-003": {
  "id": "auth-ch-003",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 55,
  "starterCode": "class TokenStore {\n  issue(userId) {}\n  rotate(token) {}\n  activeCount(userId) {}\n}",
  "testCases": [
   {
    "input": "const s = new TokenStore(); const a = s.issue(\"u1\"); s.rotate(a)",
    "expectedOutput": "rt-2",
    "description": "تدوير"
   },
   {
    "input": "const s = new TokenStore(); const a = s.issue(\"u1\"); s.rotate(a); s.activeCount(\"u1\")",
    "expectedOutput": "1",
    "description": "القديم أُبطل"
   },
   {
    "input": "const s = new TokenStore(); const a = s.issue(\"u1\"); s.rotate(a); s.rotate(a)",
    "expectedOutput": "null",
    "description": "إعادة الاستخدام مرفوضة",
    "hidden": true
   },
   {
    "input": "const s = new TokenStore(); const a = s.issue(\"u1\"); s.issue(\"u1\"); s.rotate(a); s.rotate(a); s.activeCount(\"u1\")",
    "expectedOutput": "0",
    "description": "إبطال كل التوكنات",
    "hidden": true
   }
  ]
 },
 "auth-ch-004": {
  "id": "auth-ch-004",
  "language": "JavaScript",
  "difficulty": "hard",
  "points": 90,
  "starterCode": "const crypto = require('crypto');\n\nfunction totp(secretHex, timeSeconds, digits = 6) {\n  return '';\n}",
  "testCases": [
   {
    "input": "totp(\"3132333435363738393031323334353637383930\", 59, 8)",
    "expectedOutput": "94287082",
    "description": "متجه RFC 6238 (59)"
   },
   {
    "input": "totp(\"3132333435363738393031323334353637383930\", 1111111109, 8)",
    "expectedOutput": "07081804",
    "description": "أصفار بادئة"
   },
   {
    "input": "totp(\"3132333435363738393031323334353637383930\", 59, 6)",
    "expectedOutput": "287082",
    "description": "6 أرقام",
    "hidden": true
   },
   {
    "input": "totp(\"3132333435363738393031323334353637383930\", 1234567890, 8)",
    "expectedOutput": "89005924",
    "description": "متجه RFC آخر",
    "hidden": true
   }
  ]
 },
 "supa-ch-001": {
  "id": "supa-ch-001",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "function toPostgrest(filters) {\n  return '';\n}",
  "testCases": [
   {
    "input": "toPostgrest({ age: [\"gt\", 18], name: [\"eq\", \"Ali\"] })",
    "expectedOutput": "age=gt.18&name=eq.Ali",
    "description": "فلتران"
   },
   {
    "input": "toPostgrest({ title: [\"eq\", \"a b&c\"] })",
    "expectedOutput": "title=eq.a%20b%26c",
    "description": "ترميز القيم"
   },
   {
    "input": "toPostgrest({})",
    "expectedOutput": "",
    "description": "بلا فلاتر",
    "hidden": true
   },
   {
    "input": "const rejected = (f) => { try { f(); return \"no\"; } catch (e) { return \"rejected\"; } }; rejected(() => toPostgrest({ x: [\"drop\", 1] }))",
    "expectedOutput": "rejected",
    "description": "عملية غير مسموحة",
    "hidden": true
   },
   {
    "input": "const q = toPostgrest({ b: [\"lte\", 2], a: [\"neq\", 1] }); q",
    "expectedOutput": "a=neq.1&b=lte.2",
    "description": "ترتيب المفاتيح",
    "hidden": true
   }
  ]
 },
 "supa-ch-002": {
  "id": "supa-ch-002",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "function visibleNoteIds(notes, userId, teamIds) {\n  return [];\n}",
  "testCases": [
   {
    "input": "visibleNoteIds([{ id: 2, owner_id: \"u1\" }, { id: 1, owner_id: \"u2\", is_public: true }, { id: 3, owner_id: \"u2\" }], \"u1\", [])",
    "expectedOutput": "[1,2]",
    "description": "المالك + العامة"
   },
   {
    "input": "visibleNoteIds([{ id: 5, owner_id: \"u9\", team_id: \"t1\" }, { id: 6, owner_id: \"u9\", team_id: \"t2\" }], \"u1\", [\"t1\"])",
    "expectedOutput": "[5]",
    "description": "ملاحظات الفريق"
   },
   {
    "input": "visibleNoteIds([{ id: 1, owner_id: \"u1\" }, { id: 2, is_public: true, team_id: \"t1\" }, { id: 3, team_id: \"t1\" }], null, [\"t1\"])",
    "expectedOutput": "[2]",
    "description": "زائر",
    "hidden": true
   }
  ]
 },
 "supa-ch-003": {
  "id": "supa-ch-003",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "function applyChanges(rows, events) {\n  return rows;\n}",
  "testCases": [
   {
    "input": "applyChanges([{ id: 1, t: \"a\" }], [{ type: \"INSERT\", record: { id: 2, t: \"b\" } }])",
    "expectedOutput": "[{\"id\":1,\"t\":\"a\"},{\"id\":2,\"t\":\"b\"}]",
    "description": "إضافة"
   },
   {
    "input": "applyChanges([{ id: 1, t: \"a\" }, { id: 2, t: \"b\" }], [{ type: \"UPDATE\", record: { id: 1, t: \"z\" } }, { type: \"DELETE\", record: { id: 2 } }])",
    "expectedOutput": "[{\"id\":1,\"t\":\"z\"}]",
    "description": "تعديل وحذف"
   },
   {
    "input": "applyChanges([], [{ type: \"UPDATE\", record: { id: 9, t: \"x\" } }])",
    "expectedOutput": "[]",
    "description": "تعديل صف غير موجود",
    "hidden": true
   },
   {
    "input": "const base = [{ id: 1, t: \"a\" }]; applyChanges(base, [{ type: \"UPDATE\", record: { id: 1, t: \"b\" } }]); base[0].t",
    "expectedOutput": "a",
    "description": "الأصل لا يتغير",
    "hidden": true
   },
   {
    "input": "const base = [{ id: 2, t: \"q\" }]; applyChanges(base, [{ type: \"INSERT\", record: { id: 3 } }]).length",
    "expectedOutput": "2",
    "description": "عدد الصفوف",
    "hidden": true
   }
  ]
 },
 "supa-ch-004": {
  "id": "supa-ch-004",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "function safeStoragePath(userId, filename) {\n  return null;\n}",
  "testCases": [
   {
    "input": "safeStoragePath(\"u1\", \"avatar.PNG\")",
    "expectedOutput": "u1/avatar.PNG",
    "description": "ملف صالح"
   },
   {
    "input": "safeStoragePath(\"u1\", \"../u2/secret.pdf\")",
    "expectedOutput": "null",
    "description": "محاولة الخروج من المجلد"
   },
   {
    "input": "safeStoragePath(\"u1\", \"script.js\")",
    "expectedOutput": "null",
    "description": "امتداد غير مسموح",
    "hidden": true
   },
   {
    "input": "safeStoragePath(\"u7\", \"cv.pdf\")",
    "expectedOutput": "u7/cv.pdf",
    "description": "PDF",
    "hidden": true
   }
  ]
 },
 "fire-ch-001": {
  "id": "fire-ch-001",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "function pathKind(path) {\n  return 'invalid';\n}",
  "testCases": [
   {
    "input": "pathKind(\"users/u1\")",
    "expectedOutput": "document",
    "description": "مستند"
   },
   {
    "input": "pathKind(\"users/u1/posts\")",
    "expectedOutput": "collection",
    "description": "مجموعة فرعية"
   },
   {
    "input": "pathKind(\"users//u1\")",
    "expectedOutput": "invalid",
    "description": "جزء فارغ",
    "hidden": true
   },
   {
    "input": "pathKind(\"rooms\")",
    "expectedOutput": "collection",
    "description": "مجموعة جذر",
    "hidden": true
   }
  ]
 },
 "fire-ch-002": {
  "id": "fire-ch-002",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "function canUpdatePost(request, resource) {\n  return false;\n}",
  "testCases": [
   {
    "input": "canUpdatePost({ auth: { uid: \"a\" }, data: { ownerId: \"a\", title: \"Hi\" } }, { ownerId: \"a\" })",
    "expectedOutput": "true",
    "description": "المالك يعدّل"
   },
   {
    "input": "canUpdatePost({ auth: { uid: \"b\" }, data: { ownerId: \"a\", title: \"Hi\" } }, { ownerId: \"a\" })",
    "expectedOutput": "false",
    "description": "مستخدم آخر"
   },
   {
    "input": "canUpdatePost({ auth: { uid: \"a\" }, data: { ownerId: \"b\", title: \"Hi\" } }, { ownerId: \"a\" })",
    "expectedOutput": "false",
    "description": "محاولة نقل الملكية",
    "hidden": true
   },
   {
    "input": "canUpdatePost({ auth: null, data: {} }, { ownerId: \"a\" })",
    "expectedOutput": "false",
    "description": "غير مسجل",
    "hidden": true
   },
   {
    "input": "canUpdatePost({ auth: { uid: \"a\" }, data: { ownerId: \"a\", title: \"\" } }, { ownerId: \"a\" })",
    "expectedOutput": "false",
    "description": "عنوان فارغ",
    "hidden": true
   }
  ]
 },
 "fire-ch-003": {
  "id": "fire-ch-003",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 45,
  "starterCode": "function nextPage(messages, pageSize, afterTs) {\n  return { items: [], nextCursor: null };\n}",
  "testCases": [
   {
    "input": "nextPage([{ ts: 3, text: \"c\" }, { ts: 1, text: \"a\" }, { ts: 2, text: \"b\" }], 2, null)",
    "expectedOutput": "{\"items\":[\"a\",\"b\"],\"nextCursor\":2}",
    "description": "الصفحة الأولى"
   },
   {
    "input": "nextPage([{ ts: 3, text: \"c\" }, { ts: 1, text: \"a\" }, { ts: 2, text: \"b\" }], 2, 2)",
    "expectedOutput": "{\"items\":[\"c\"],\"nextCursor\":null}",
    "description": "الصفحة الأخيرة"
   },
   {
    "input": "nextPage([], 5, null)",
    "expectedOutput": "{\"items\":[],\"nextCursor\":null}",
    "description": "بلا رسائل",
    "hidden": true
   }
  ]
 },
 "fire-ch-004": {
  "id": "fire-ch-004",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 20,
  "starterCode": "function allowedUploads(files, maxMB) {\n  return [];\n}",
  "testCases": [
   {
    "input": "allowedUploads([{ name: \"a.png\", type: \"image/png\", size: 1000 }, { name: \"b.exe\", type: \"application/x-msdownload\", size: 10 }], 1)",
    "expectedOutput": "[\"a.png\"]",
    "description": "صورة فقط"
   },
   {
    "input": "allowedUploads([{ name: \"big.jpg\", type: \"image/jpeg\", size: 3 * 1024 * 1024 }], 2)",
    "expectedOutput": "[]",
    "description": "حجم كبير"
   },
   {
    "input": "allowedUploads([{ name: \"x.gif\", type: \"image/gif\", size: 2 * 1024 * 1024 }], 2)",
    "expectedOutput": "[\"x.gif\"]",
    "description": "على الحد بالضبط",
    "hidden": true
   }
  ]
 },
 "mongo-ch-001": {
  "id": "mongo-ch-001",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 40,
  "starterCode": "function findIds(docs, query) {\n  return [];\n}",
  "testCases": [
   {
    "input": "findIds([{ _id: 1, role: \"admin\" }, { _id: 2, role: \"user\" }], { role: \"admin\" })",
    "expectedOutput": "[1]",
    "description": "مساواة"
   },
   {
    "input": "findIds([{ _id: 1, age: 17 }, { _id: 2, age: 25 }, { _id: 3, age: 40 }], { age: { $gt: 18, $lte: 30 } })",
    "expectedOutput": "[2]",
    "description": "مدى"
   },
   {
    "input": "findIds([{ _id: 1, s: \"a\" }, { _id: 2, s: \"b\" }], { s: { $ne: \"a\" } })",
    "expectedOutput": "[2]",
    "description": "$ne",
    "hidden": true
   },
   {
    "input": "findIds([{ _id: 1, a: 1, b: 2 }, { _id: 2, a: 1, b: 3 }], { a: 1, b: { $gte: 3 } })",
    "expectedOutput": "[2]",
    "description": "شروط مركبة",
    "hidden": true
   }
  ]
 },
 "mongo-ch-002": {
  "id": "mongo-ch-002",
  "language": "JavaScript",
  "difficulty": "medium",
  "points": 35,
  "starterCode": "function groupSum(docs, key, field) {\n  return [];\n}",
  "testCases": [
   {
    "input": "groupSum([{ c: \"x\", v: 2 }, { c: \"y\", v: 5 }, { c: \"x\", v: 4 }], \"c\", \"v\")",
    "expectedOutput": "[{\"_id\":\"x\",\"total\":6},{\"_id\":\"y\",\"total\":5}]",
    "description": "فئتان"
   },
   {
    "input": "groupSum([{ c: \"b\", v: 1 }, { c: \"a\", v: 1 }], \"c\", \"v\")",
    "expectedOutput": "[{\"_id\":\"a\",\"total\":1},{\"_id\":\"b\",\"total\":1}]",
    "description": "تعادل",
    "hidden": true
   },
   {
    "input": "groupSum([], \"c\", \"v\")",
    "expectedOutput": "[]",
    "description": "فارغة",
    "hidden": true
   }
  ]
 },
 "mongo-ch-003": {
  "id": "mongo-ch-003",
  "language": "JavaScript",
  "difficulty": "easy",
  "points": 25,
  "starterCode": "function populate(posts, users) {\n  return posts;\n}",
  "testCases": [
   {
    "input": "populate([{ _id: \"p1\", author: \"u1\" }], [{ _id: \"u1\", name: \"Ali\", password: \"x\" }])",
    "expectedOutput": "[{\"_id\":\"p1\",\"author\":{\"_id\":\"u1\",\"name\":\"Ali\"}}]",
    "description": "مؤلف موجود (بلا حقول حساسة)"
   },
   {
    "input": "populate([{ _id: \"p2\", author: \"u9\" }], [])",
    "expectedOutput": "[{\"_id\":\"p2\",\"author\":null}]",
    "description": "مؤلف محذوف"
   },
   {
    "input": "const posts = [{ _id: \"p1\", author: \"u1\" }]; populate(posts, [{ _id: \"u1\", name: \"A\" }]); posts[0].author",
    "expectedOutput": "u1",
    "description": "المدخلات لا تتغير",
    "hidden": true
   },
   {
    "input": "const out = populate([{ _id: \"p\", author: \"u\" }], [{ _id: \"u\", name: \"Noor\" }]); out[0].author.name",
    "expectedOutput": "Noor",
    "description": "اسم المؤلف",
    "hidden": true
   }
  ]
 },
 "mongo-ch-004": {
  "id": "mongo-ch-004",
  "language": "JavaScript",
  "difficulty": "hard",
  "points": 80,
  "starterCode": "function runPipeline(docs, stages) {\n  return docs;\n}",
  "testCases": [
   {
    "input": "runPipeline([{ n: \"a\", age: 30, city: \"B\" }, { n: \"b\", age: 20, city: \"B\" }, { n: \"c\", age: 40, city: \"M\" }], [{ $match: { city: \"B\" } }, { $sort: { age: 1 } }, { $project: { n: 1 } }])",
    "expectedOutput": "[{\"n\":\"b\"},{\"n\":\"a\"}]",
    "description": "match + sort + project"
   },
   {
    "input": "runPipeline([{ v: 1 }, { v: 3 }, { v: 2 }], [{ $sort: { v: -1 } }, { $limit: 2 }])",
    "expectedOutput": "[{\"v\":3},{\"v\":2}]",
    "description": "sort تنازلي + limit"
   },
   {
    "input": "runPipeline([{ a: 1, b: 2 }], [])",
    "expectedOutput": "[{\"a\":1,\"b\":2}]",
    "description": "بلا مراحل",
    "hidden": true
   },
   {
    "input": "const rejected = (f) => { try { f(); return \"no\"; } catch (e) { return \"rejected\"; } }; rejected(() => runPipeline([], [{ $out: \"x\" }]))",
    "expectedOutput": "rejected",
    "description": "مرحلة غير مدعومة",
    "hidden": true
   },
   {
    "input": "const r = runPipeline([{ x: 1 }, { x: 2 }], [{ $match: { x: 2 } }]); r.length",
    "expectedOutput": "1",
    "description": "match وحده",
    "hidden": true
   }
  ]
 },
 "cssx-ch-001": {
  "id": "cssx-ch-001",
  "language": "CSS",
  "difficulty": "easy",
  "points": 15,
  "starterCode": ".center {\n  /* اكتب التنسيق هنا */\n}",
  "testCases": [
   {
    "input": "",
    "expectedOutput": "structure",
    "description": "المتطلبات البنيوية"
   }
  ],
  "checks": [
   {
    "pattern": "\\.center\\s*\\{[^}]*display\\s*:\\s*flex",
    "message": ".center يستخدم display: flex"
   },
   {
    "pattern": "\\.center\\s*\\{[^}]*justify-content\\s*:\\s*center",
    "message": "توسيط أفقي بـ justify-content: center"
   },
   {
    "pattern": "\\.center\\s*\\{[^}]*align-items\\s*:\\s*center",
    "message": "توسيط عمودي بـ align-items: center"
   },
   {
    "pattern": "\\.center\\s*\\{[^}]*height\\s*:\\s*100vh",
    "message": "الارتفاع 100vh"
   }
  ]
 },
 "cssx-ch-002": {
  "id": "cssx-ch-002",
  "language": "CSS",
  "difficulty": "easy",
  "points": 20,
  "starterCode": ".cards {\n  /* اكتب التنسيق هنا */\n}",
  "testCases": [
   {
    "input": "",
    "expectedOutput": "structure",
    "description": "المتطلبات البنيوية"
   }
  ],
  "checks": [
   {
    "pattern": "\\.cards\\s*\\{[^}]*display\\s*:\\s*grid",
    "message": ".cards يستخدم display: grid"
   },
   {
    "pattern": "grid-template-columns\\s*:\\s*repeat\\(\\s*3\\s*,\\s*1fr\\s*\\)",
    "message": "ثلاثة أعمدة متساوية repeat(3, 1fr)"
   },
   {
    "pattern": "(?:^|[;{\\s])gap\\s*:\\s*16px",
    "message": "فجوة 16px"
   }
  ]
 },
 "cssx-ch-003": {
  "id": "cssx-ch-003",
  "language": "CSS",
  "difficulty": "medium",
  "points": 30,
  "starterCode": ".cards {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}\n\n/* أضف media query للشاشات الصغيرة */",
  "testCases": [
   {
    "input": "",
    "expectedOutput": "structure",
    "description": "المتطلبات البنيوية"
   }
  ],
  "checks": [
   {
    "pattern": "@media\\s*\\(\\s*max-width\\s*:\\s*600px\\s*\\)",
    "message": "media query بـ max-width: 600px"
   },
   {
    "pattern": "@media[^{]*\\{\\s*\\.cards\\s*\\{[^}]*grid-template-columns\\s*:\\s*1fr",
    "message": "عمود واحد داخل media query"
   },
   {
    "pattern": "repeat\\(\\s*3\\s*,\\s*1fr\\s*\\)",
    "message": "الثلاثة أعمدة الافتراضية باقية"
   }
  ]
 },
 "cssx-ch-004": {
  "id": "cssx-ch-004",
  "language": "CSS",
  "difficulty": "medium",
  "points": 30,
  "starterCode": ":root {\n  /* عرّف المتغيرات */\n}\n\nbody {\n}\n\n.btn {\n}",
  "testCases": [
   {
    "input": "",
    "expectedOutput": "structure",
    "description": "المتطلبات البنيوية"
   }
  ],
  "checks": [
   {
    "pattern": ":root\\s*\\{[^}]*--primary\\s*:",
    "message": "تعريف --primary في :root"
   },
   {
    "pattern": ":root\\s*\\{[^}]*--bg\\s*:",
    "message": "تعريف --bg في :root"
   },
   {
    "pattern": "\\.btn\\s*\\{[^}]*background(?:-color)?\\s*:\\s*var\\(\\s*--primary\\s*\\)",
    "message": ".btn يستخدم var(--primary)"
   },
   {
    "pattern": "body\\s*\\{[^}]*background(?:-color)?\\s*:\\s*var\\(\\s*--bg\\s*\\)",
    "message": "body يستخدم var(--bg)"
   },
   {
    "pattern": "\\.dark\\s*\\{[^}]*--bg\\s*:",
    "message": ".dark يعيد تعريف --bg"
   }
  ]
 }
};
