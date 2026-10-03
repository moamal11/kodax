/**
 * BLIND — مجموعة كُتبت بعد انتهاء الضبط على DEV/HOLDOUT، وقيست مرة واحدة بدون أي تعديل على المطابق بعدها.
 * (HOLDOUT لم يعد أعمى تماماً: اطلعنا على إخفاقاته وأصلحنا أسبابها بشكل عام في القاموس/المنطق،
 *  لذلك هذه المجموعة هي القياس النظيف لقدرة الفهم على صياغات لم تُرَ.)
 */
import type { PosCase, NegCase } from './smart-eval-set';

const P = (q: string, expect: string | string[], must?: string): PosCase => ({ q, expect, must });
const N = (q: string, why: string, history = false): NegCase => ({ q, why, history });

export const BLIND_POS: PosCase[] = [
  // XP
  P('نقاط الخبرة شنو فايدتها', ['faq:what-is-xp', 'faq:xp-levels']),
  P('XP يعني ايش', 'faq:what-is-xp'),
  P('ما فهمت شنو الاكس بي', 'faq:what-is-xp'),
  P('what does xp mean', 'faq:what-is-xp'),
  P('شلون احصل نقاط خبره', 'faq:earn-xp'),
  P('طريقة جمع XP', 'faq:earn-xp'),
  P('how do i earn xp', 'faq:earn-xp'),
  P('اذا عدت الدرس ياخذ XP مرة ثانية', 'faq:xp-repeat'),
  P('شلون اترقى بالمستوى', 'faq:levels'),
  P('ما الفرق بين نقاط الخبرة والعملات', 'faq:xp-vs-coins'),
  // Coins
  P('العملات شنو', 'faq:what-are-coins'),
  P('شنو فايدة الكوينات', ['faq:what-are-coins', 'faq:coins-earn']),
  P('what are coins', 'faq:what-are-coins'),
  P('كيف اجمع عملات', 'faq:earn-coins'),
  P('شلون احصل كوينز ببلاش', 'faq:earn-coins'),
  P('how to get more coins', 'faq:earn-coins'),
  P('اقدر اشحن كوينز', 'faq:buy-coins'),
  P('كويناتي راحت', 'faq:coins-disappeared'),
  P('شنو المكافأة اليومية', 'faq:daily-reward'),
  // Courses
  P('شنو يعني دورة', 'faq:what-is-course'),
  P('what is a course', 'faq:what-is-course'),
  P('شلون افتح دورة مقفولة', ['faq:unlock-course', 'faq:courses-unlock']),
  P('how do i unlock a course', ['faq:unlock-course', 'faq:courses-unlock']),
  P('اكو دورات مجانية', ['faq:free-courses', 'faq:is-free']),
  P('شنو دورة اختار بالبداية', 'faq:which-course-first'),
  P('كم درس بدورة أساسيات C++', 'course:cpp-basics:count'),
  P('سعر دورة Firebase', 'course:backend-firebase:price'),
  P('شنو دورة تعلم الآلة', 'course:ai-ml-basics'),
  P('دورات الأمن السيبراني', 'course:list'),
  P('كم كورس موجود', 'catalog:courses-count'),
  // Lessons
  P('شنو هو الدرس', 'faq:what-is-lesson'),
  P('what is a lesson', 'faq:what-is-lesson'),
  P('ليش الدرس مقفل', 'faq:lesson-locked'),
  P('كم عدد الدروس', 'catalog:lessons-count'),
  P('درس الوراثة Inheritance', 'lesson:', 'Inheritance'),
  P('شنو درس أمن كلمات المرور', 'lesson:', 'كلمات المرور'),
  // Challenges
  P('التحديات شنو', 'faq:what-is-challenge'),
  P('what is a challenge', 'faq:what-is-challenge'),
  P('شلون افتح التحدي', 'faq:unlock-challenge'),
  P('شنو جائزة التحدي', 'faq:challenge-rewards'),
  P('شلون يتم تصحيح التحديات', 'faq:challenge-check'),
  P('كم تحدي موجود', 'catalog:challenges-count'),
  P('تحدي البحث الثنائي', 'challenge:', 'البحث الثنائي'),
  P('شنو تحدي جدول الضرب', 'challenge:', 'جدول الضرب'),
  // فتح المحتوى / الإعلانات
  P('شلون اشوف اعلان', 'faq:watch-ad'),
  P('الاعلان ما انحسب', 'faq:ad-not-counted'),
  P('شنو الإعلانات المكافئة', ['faq:what-are-ads', 'faq:ads']),
  P('شنو المسار', 'faq:what-is-path'),
  // استخدام Kodax
  P('شلون استخدم كوداكس', 'faq:how-to-use'),
  P('how to use kodax', 'faq:how-to-use'),
  P('هل التطبيق ببلاش', 'faq:is-free'),
  P('شنو هو كوداكس', 'faq:what-is-kodax'),
  P('اكو نسخة ويب', ['faq:platforms', 'faq:ads-web']),
  P('شلون اطلع من حسابي', 'faq:logout'),
  P('شلون اعدل اسمي', 'faq:edit-profile'),
  P('شلون اتواصل وياكم', 'faq:support'),
  P('شنو الستريك', 'faq:streak'),
  P('شلون احصل شهادة', 'faq:certificates'),
  P('لوحة الصدارة شنو', 'faq:leaderboard'),
  P('كم سؤال اكدر اسأل الذكاء باليوم', 'faq:ai-limit'),
  P('شلون ابدأ محادثة جديدة', 'faq:new-chat'),
  P('منو سوى التطبيق', 'smalltalk:developer'),
  P('شنو تكدر تسوي', 'smalltalk:what-can-you-do'),
  P('منو انت', 'smalltalk:who-are-you'),
  // رد قاموس موجود من الـ802 مكتوب لهذا السؤال بالضبط (صُنِّف خطأً كسلبي في القياس الأول)
  P('شنو الفرق بين list و tuple', 'glossary:list-vs-tuple'),
  // تحيات
  P('هلا والله', 'smalltalk:greet'),
  P('السلام عليكم', 'smalltalk:greet'),
  P('hey', 'smalltalk:greet'),
  P('مشكور حبي', 'smalltalk:thanks'),
  P('thank you', 'smalltalk:thanks'),
  P('شلونك اليوم', 'smalltalk:how-are-you'),
  P('مع السلامة', 'smalltalk:bye'),
  P('تمام', 'smalltalk:ok'),
];

export const BLIND_NEG: NegCase[] = [
  N('اشرح لي الفرق بين XP والكوينز بمثال', 'شرح بمثال'),
  N('ليش نظام الكوينات بالتطبيق مو عادل برأيك', 'رأي'),
  N('عندي 1200 XP كم باقي للمستوى الجاي احسبها', 'حساب'),
  N('اكتب لي كود يحسب مجموع الأرقام', 'كتابة كود'),
  N('ما فهمت درس الحلقات اشرحه من جديد', 'شرح درس'),
  N('شنو الخطأ بالكود print(x', 'تحليل كود'),
  N('حليت التحدي بس يطلعلي خطأ بالسطر الثالث ليش', 'تصحيح'),
  N('ساعدني بفكرة حل تحدي البحث الثنائي', 'مساعدة بالحل'),
  N('قارن بين Flutter و React Native', 'مقارنة'),
  N('شنو افضل لغة للوظائف بالعراق', 'رأي/نصيحة عامة'),
  N('كيف اسوي تطبيق مثل كوداكس', 'شرح تقني'),
  N('وضح لي الـ recursion', 'شرح برمجي'),
  N('اعطني خطة اتعلم بيها البرمجة بشهرين', 'تخطيط'),
  N('ليش', 'متابعة', true),
  N('طيب وبعدين', 'متابعة', true),
  N('وضحها اكثر', 'متابعة', true),
  N('الكوينز', 'مفهوم وحيد مع سياق', true),
  N('شنو معنى هذا الخطأ TypeError', 'تحليل خطأ'),
  N('سولي ملخص لدرس الدوال', 'تلخيص'),
  N('شلون اذاكر بدون ما امل', 'نصيحة عامة'),
  N('ترجم لي هذي الجملة للانكليزي', 'مهمة عامة'),
  N('شنو رايك بالتطبيق', 'رأي'),
  N('اختبرني بأسئلة عن Python', 'توليد محتوى'),
];
