/**
 * محتوى سياسة الخصوصية وشروط الاستخدام — مبني على ما يفعله الكود والخدمات فعلياً
 * (راجعه عند إضافة خدمة أو جمع بيانات جديدة). يُعرض في /privacy و /terms داخل التطبيق والموقع.
 */

/** تاريخ آخر تحديث (يظهر في رأس الصفحتين) */
export const LEGAL_UPDATED_AT = { ar: '3 أكتوبر 2026', en: 'October 3, 2026' };

/**
 * بريد التواصل العام للأمور القانونية/الخصوصية. اتركه null حتى يُحدَّد بريد رسمي —
 * عندها يظهر قسم البريد تلقائياً. (مطلوب في Google Play Console كبريد المطوّر.)
 */
export const LEGAL_CONTACT_EMAIL: string | null = null;

/** الحد الأدنى للعمر المعلن (يجب أن يطابق "الجمهور المستهدف" في Google Play Console) */
export const LEGAL_MIN_AGE = 13;

export const LEGAL_CONTACT_LINKS = [
  { label: 'Telegram', url: 'https://t.me/mo7za' },
  { label: 'Instagram', url: 'https://instagram.com/mo_nz.0' },
];

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export const PRIVACY_POLICY: Record<'ar' | 'en', LegalDocument> = {
  ar: {
    title: 'سياسة الخصوصية',
    intro:
      'توضح هذه السياسة البيانات التي يجمعها تطبيق Kodax وموقعه kodax.app، ولماذا نستخدمها، ومع من نشاركها، وكيف تتحكم بها أو تحذفها.',
    sections: [
      {
        title: 'الحساب وتسجيل الدخول',
        bullets: [
          'البريد الإلكتروني وكلمة المرور عند التسجيل بالبريد. كلمة المرور لا نراها؛ تُدار عبر Supabase Auth.',
          'عند الدخول بحساب Google: الاسم والبريد وصورة الحساب كما تشاركها Google.',
          'نستخدمها لإنشاء حسابك وتأمين الدخول فقط.',
        ],
      },
      {
        title: 'الملف الشخصي (عام)',
        bullets: [
          'الاسم، واسم المستخدم، والصورة، والمحافظة، والجنس، وعدد المتابعين والمتابَعين، والمستوى والـ XP والسلسلة.',
          'هذه المعلومات تظهر للمستخدمين الآخرين في ملفك وفي لوحة المتصدرين.',
        ],
      },
      {
        title: 'التعلم والتقدم',
        bullets: [
          'الدروس المكتملة وإجابات اختبارات الدروس، ومحاولات التحديات ونتائجها، والـ XP والمستوى والسلسلة والأهداف والإنجازات والشهادات.',
          'رصيد الكوينات وسجل معاملاتها (من أين كُسبت وأين صُرفت).',
          'نستخدمها لحفظ تقدمك ومنح المكافآت ومنع التلاعب. الشهادات قابلة للتحقق العلني عبر رابطها.',
        ],
      },
      {
        title: 'المحتوى والتفاعل الاجتماعي',
        bullets: [
          'الأكواد التي تنشرها علناً، والتعليقات والإعجابات والمتابعات: تظهر للآخرين.',
          'الرسائل الخاصة: تُخزَّن لعرضها لك وللطرف الآخر فقط. نصل إليها تقنياً فقط عند الضرورة (مثل التحقيق في بلاغ إساءة أو طلب قانوني).',
          'الحظر والبلاغات: نسجّل من حظرت ومن أبلغت عنه وسبب البلاغ ووقته لأغراض الإشراف.',
        ],
      },
      {
        title: 'المساعد الذكي (Google Gemini)',
        bullets: [
          'عند استخدام المساعد تُرسل رسالتك والكود المرتبط بها (وسياق الدرس/التحدي) إلى Google Gemini API لتوليد الرد. لا نرسل اسمك أو بريدك.',
          'نخزّن محادثاتك مع المساعد لتظهر لك لاحقاً، ونحسب عدد طلباتك اليومية لتطبيق الحد المجاني.',
          'تخضع معالجة Google لشروط Gemini API الخاصة بها.',
        ],
      },
      {
        title: 'تشغيل الكود',
        bullets: [
          'عند تشغيل كود أو التحقق من حل تحدٍ يُرسل نص الكود إلى خدمات تشغيل خارجية: Wandbox (wandbox.org) ولغة Kotlin عبر خادم JetBrains (api.kotlinlang.org).',
          'لا ترسل لهذه الخدمات أي بيانات شخصية؛ لا تكتب معلومات خاصة داخل الكود.',
        ],
      },
      {
        title: 'الإعلانات (Google AdMob)',
        bullets: [
          'نعرض إعلانات بمكافأة فقط وبطلب منك (لا لافتات ولا إعلانات منبثقة).',
          'تجمع Google AdMob معرّف الإعلانات للجهاز وعنوان IP ومعلومات الجهاز لعرض الإعلان وقياسه ومنع الاحتيال، وفق سياسة Google.',
          'في المناطق التي تتطلب ذلك (مثل أوروبا والمملكة المتحدة) نطلب موافقتك عبر نموذج الموافقة من Google (UMP). يمكنك إعادة ضبط معرّف الإعلانات أو تعطيل التخصيص من إعدادات جهازك.',
          'نخزّن جلسة المكافأة (المستخدم، الوقت، الغرض، معرّف التحقق من Google) لمنح المكافأة مرة واحدة فقط.',
        ],
      },
      {
        title: 'الإحصاءات والسجلات',
        bullets: [
          'نسجّل أحداث استخدام داخل خوادمنا (مثل فتح التطبيق، فتح درس، طلب إعلان) لتحسين التعليم وقياس الاحتفاظ. لا نستخدم أي خدمة تحليلات خارجية.',
          'عند حذف الحساب تُفصل هذه الأحداث عن هويتك وتبقى إحصاءات مجهولة.',
        ],
      },
      {
        title: 'الإشعارات',
        bullets: [
          'إشعارات داخل التطبيق (الإعجابات، التعليقات، المتابعات، ردود الدعم، رسائل الإدارة).',
          'عند تفعيل الإشعارات على جهازك نخزّن رمز الجهاز (push token) لإرسال التنبيهات، ويمكنك التحكم بأنواعها أو إيقافها من الإعدادات أو من إعدادات الجهاز.',
        ],
      },
      {
        title: 'الدعم الفني',
        bullets: ['عند فتح تذكرة دعم نخزّن اسمك وبريدك ونص المحادثة للرد عليك.'],
      },
      {
        title: 'التحديثات والتخزين على الجهاز',
        bullets: [
          'يستخدم التطبيق Expo (EAS Updates) لتنزيل تحديثات البرنامج؛ يتطلب ذلك إرسال إصدار التطبيق ونوع الجهاز إلى خوادم Expo.',
          'نحفظ على جهازك جلسة الدخول وبعض البيانات المؤقتة (التقدم، المسودات) لتسريع التطبيق والعمل دون اتصال.',
        ],
      },
      {
        title: 'أين تُخزَّن البيانات ومن يصل إليها',
        bullets: [
          'تُخزَّن البيانات في Supabase (قاعدة بيانات وتخزين ملفات وتوثيق) في منطقة آسيا (مومباي).',
          'الوصول محمي بصلاحيات لكل مستخدم على مستوى قاعدة البيانات؛ فريق الإدارة يصل لما يلزم للإشراف والدعم فقط.',
          'لا نبيع بياناتك ولا نشاركها لأغراض تسويقية. نشاركها فقط مع مزوّدي الخدمة المذكورين أعلاه بالقدر اللازم لعمل الميزة، أو عند وجود إلزام قانوني.',
        ],
      },
      {
        title: 'مدة الاحتفاظ والحذف',
        bullets: [
          'نحتفظ ببياناتك ما دام حسابك قائماً.',
          'يمكنك حذف حسابك نهائياً من: ملفي ← الإعدادات ← حذف الحساب. يحذف ذلك ملفك وصورتك وتقدمك وكوينزك وأكوادك وتعليقاتك ورسائلك ومحادثات المساعد وتذاكر الدعم وكل ما يرتبط بحسابك فوراً.',
          'تبقى سجلات إشراف إدارية وإحصاءات مجهولة غير مرتبطة بك، وقد تبقى نسخ في النسخ الاحتياطية للخادم لفترة محدودة حتى تُستبدل.',
          'رسائل الطرف الآخر في محادثاتكما تبقى عنده.',
        ],
      },
      {
        title: 'الأطفال',
        paragraphs: [
          `Kodax غير موجّه للأطفال دون ${LEGAL_MIN_AGE} عاماً، ولا نجمع عن قصد بيانات منهم. إذا علمت أن طفلاً أنشأ حساباً تواصل معنا لحذفه.`,
        ],
      },
      {
        title: 'حقوقك',
        bullets: [
          'تعديل ملفك من داخل التطبيق.',
          'حذف حسابك وبياناتك في أي وقت.',
          'طلب نسخة من بياناتك أو الاستفسار عنها عبر الدعم الفني.',
        ],
      },
      {
        title: 'التغييرات',
        paragraphs: ['قد نحدّث هذه السياسة عند تغيّر الخدمات؛ يظهر تاريخ آخر تحديث أعلى الصفحة.'],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    intro:
      'This policy explains what data the Kodax app and kodax.app collect, why, who we share it with, and how you can control or delete it.',
    sections: [
      {
        title: 'Account and sign-in',
        bullets: [
          'Email and password when you sign up with email. Passwords are handled by Supabase Auth; we never see them.',
          'With Google Sign-In: your name, email and profile picture as shared by Google.',
          'Used only to create and secure your account.',
        ],
      },
      {
        title: 'Profile (public)',
        bullets: [
          'Name, username, avatar, province, gender, follower/following counts, level, XP and streak.',
          'Visible to other users on your profile and on the leaderboard.',
        ],
      },
      {
        title: 'Learning progress',
        bullets: [
          'Completed lessons and quiz answers, challenge attempts and results, XP, level, streak, goals, achievements and certificates.',
          'Coin balance and transaction history.',
          'Used to save progress, grant rewards and prevent abuse. Certificates can be publicly verified via their link.',
        ],
      },
      {
        title: 'Content and social features',
        bullets: [
          'Code you publish publicly, comments, likes and follows are visible to others.',
          'Private messages are stored to show them to you and the other participant only. We access them only when necessary (e.g. investigating an abuse report or a legal request).',
          'Blocks and reports: we record who you blocked or reported, the reason and the time, for moderation.',
        ],
      },
      {
        title: 'AI assistant (Google Gemini)',
        bullets: [
          'When you use the assistant, your message and related code (plus lesson/challenge context) are sent to the Google Gemini API to generate a reply. Your name and email are not sent.',
          'We store your assistant conversations so you can see them later, and count daily requests to apply the free limit.',
          "Google's processing is subject to the Gemini API terms.",
        ],
      },
      {
        title: 'Code execution',
        bullets: [
          'When you run code or verify a challenge, the code text is sent to external execution services: Wandbox (wandbox.org) and JetBrains Kotlin (api.kotlinlang.org).',
          'No personal data is sent; do not put private information in your code.',
        ],
      },
      {
        title: 'Ads (Google AdMob)',
        bullets: [
          'We show rewarded ads only, and only when you choose to watch one (no banners or interstitials).',
          "Google AdMob collects the device advertising ID, IP address and device information to serve and measure ads and prevent fraud, under Google's policies.",
          "Where required (e.g. EEA/UK) we ask for consent through Google's User Messaging Platform (UMP). You can reset your advertising ID or opt out of personalization in your device settings.",
          'We store each reward session (user, time, purpose, Google verification ID) to grant a reward only once.',
        ],
      },
      {
        title: 'Analytics and logs',
        bullets: [
          'We record usage events on our own servers (e.g. app opened, lesson opened, ad requested) to improve learning and measure retention. We do not use third-party analytics.',
          'When you delete your account these events are unlinked from you and kept only as anonymous statistics.',
        ],
      },
      {
        title: 'Notifications',
        bullets: [
          'In-app notifications (likes, comments, follows, support replies, admin messages).',
          'If you enable push notifications we store your device push token to send alerts; you can choose the types or turn them off in settings or in your device settings.',
        ],
      },
      { title: 'Support', bullets: ['When you open a support ticket we store your name, email and the conversation to reply to you.'] },
      {
        title: 'Updates and on-device storage',
        bullets: [
          'The app uses Expo (EAS Updates) to download software updates; this sends the app version and platform to Expo servers.',
          'We keep your session and some cached data (progress, drafts) on your device for speed and offline use.',
        ],
      },
      {
        title: 'Where data is stored and who can access it',
        bullets: [
          'Data is stored with Supabase (database, file storage and auth) in the Asia (Mumbai) region.',
          'Access is protected by per-user database permissions; our admin team accesses only what is needed for moderation and support.',
          'We do not sell your data or share it for marketing. We share it only with the service providers above, as needed for each feature, or when legally required.',
        ],
      },
      {
        title: 'Retention and deletion',
        bullets: [
          'We keep your data while your account exists.',
          'You can permanently delete your account from Profile → Settings → Delete account. This immediately deletes your profile, avatar, progress, coins, code, comments, messages, assistant conversations, support tickets and everything linked to your account.',
          'Administrative moderation records and anonymous statistics not linked to you are kept, and server backups may retain copies for a limited period until they rotate.',
          "The other participant's messages in your conversations remain with them.",
        ],
      },
      {
        title: 'Children',
        paragraphs: [
          `Kodax is not directed to children under ${LEGAL_MIN_AGE}, and we do not knowingly collect their data. If you believe a child created an account, contact us to delete it.`,
        ],
      },
      {
        title: 'Your rights',
        bullets: ['Edit your profile in the app.', 'Delete your account and data at any time.', 'Request a copy of your data or ask about it through support.'],
      },
      { title: 'Changes', paragraphs: ['We may update this policy when our services change; the last updated date is shown at the top.'] },
    ],
  },
};

export const TERMS_OF_SERVICE: Record<'ar' | 'en', LegalDocument> = {
  ar: {
    title: 'شروط الاستخدام',
    intro: 'باستخدامك تطبيق Kodax أو موقعه فإنك توافق على هذه الشروط. إذا لم توافق عليها فلا تستخدم الخدمة.',
    sections: [
      {
        title: 'الحساب',
        bullets: [
          `يجب أن يكون عمرك ${LEGAL_MIN_AGE} عاماً على الأقل.`,
          'أنت مسؤول عن سرية حسابك وعن كل نشاط يتم من خلاله، وعن صحة المعلومات التي تقدمها.',
          'حساب واحد لكل شخص؛ يُمنع إنشاء حسابات متعددة للحصول على مكافآت إضافية.',
        ],
      },
      {
        title: 'التعلم والمحتوى التعليمي',
        bullets: [
          'المحتوى التعليمي للتعلم الشخصي؛ لا يجوز نسخه أو إعادة نشره تجارياً دون إذن.',
          'الشهادات تعكس التقدم المسجّل في التطبيق ولا تمثل شهادة أكاديمية معتمدة.',
        ],
      },
      {
        title: 'الكوينات والمكافآت والإعلانات',
        bullets: [
          'التعلم الأساسي مجاني. الكوينات عملة افتراضية داخل التطبيق تُكتسب من التعلم والإعلانات الاختيارية، ولا قيمة نقدية لها، ولا يمكن بيعها أو تحويلها أو استبدالها بمال.',
          'يحق لنا تعديل قيم المكافآت والأسعار، وإلغاء المكافآت التي تُكتسب بالغش أو الأتمتة أو استغلال الأخطاء، وتقييد الحساب المخالف.',
          'الإعلانات بمكافأة اختيارية؛ تُمنح المكافأة بعد تأكيد Google لإكمال المشاهدة.',
        ],
      },
      {
        title: 'المحتوى الذي تنشره',
        bullets: [
          'تبقى ملكية أكوادك وتعليقاتك لك، وتمنحنا ترخيصاً غير حصري لعرضها داخل الخدمة حسب إعدادات النشر.',
          'يُمنع نشر: كود ضار أو احتيالي أو لسرقة البيانات، محتوى مسيء أو يحض على الكراهية، انتهاك حقوق الآخرين، الرسائل المزعجة، أو معلومات شخصية لغيرك.',
          'يمكن للمستخدمين الإبلاغ عن المحتوى وحظر مستخدمين آخرين. نراجع البلاغات وقد نخفي المحتوى أو نحذفه أو نقيد الحساب أو نحظره.',
        ],
      },
      {
        title: 'الرسائل الخاصة',
        bullets: [
          'استخدم الرسائل باحترام. يُمنع التحرش والتهديد والاحتيال والرسائل المزعجة.',
          'يمكنك حظر أي مستخدم لمنعه من مراسلتك.',
        ],
      },
      {
        title: 'المساعد الذكي وتشغيل الكود',
        bullets: [
          'ردود المساعد مولّدة آلياً وقد تحتوي أخطاء؛ تحقق منها قبل الاعتماد عليها.',
          'للمساعد حدود استخدام يومية. يُمنع استخدامه أو استخدام خدمة تشغيل الكود لأغراض ضارة أو لإرهاق الخدمة.',
        ],
      },
      {
        title: 'الإنهاء',
        bullets: [
          'يمكنك حذف حسابك في أي وقت من الإعدادات.',
          'يحق لنا تعليق أو إنهاء الحساب الذي يخالف هذه الشروط.',
        ],
      },
      {
        title: 'إخلاء المسؤولية',
        paragraphs: [
          'تُقدَّم الخدمة "كما هي". نسعى لتوفرها ودقتها لكن لا نضمن خلوها من الأخطاء أو انقطاعها، ولا نتحمل مسؤولية الأضرار غير المباشرة الناتجة عن استخدامها، في حدود ما يسمح به القانون.',
        ],
      },
      { title: 'التغييرات', paragraphs: ['قد نحدّث هذه الشروط؛ استمرارك في الاستخدام بعد التحديث يعني موافقتك عليها.'] },
    ],
  },
  en: {
    title: 'Terms of Service',
    intro: 'By using the Kodax app or website you agree to these terms. If you do not agree, do not use the service.',
    sections: [
      {
        title: 'Your account',
        bullets: [
          `You must be at least ${LEGAL_MIN_AGE} years old.`,
          'You are responsible for keeping your account secure, for all activity on it, and for the accuracy of your information.',
          'One account per person; creating multiple accounts to obtain extra rewards is not allowed.',
        ],
      },
      {
        title: 'Learning content',
        bullets: [
          'Learning content is for personal learning; it may not be copied or republished commercially without permission.',
          'Certificates reflect progress recorded in the app and are not accredited academic degrees.',
        ],
      },
      {
        title: 'Coins, rewards and ads',
        bullets: [
          'Core learning is free. Coins are an in-app virtual currency earned through learning and optional ads; they have no cash value and cannot be sold, transferred or exchanged for money.',
          'We may change reward values and prices, revoke rewards obtained through cheating, automation or exploiting bugs, and restrict violating accounts.',
          'Rewarded ads are optional; rewards are granted after Google confirms the ad was completed.',
        ],
      },
      {
        title: 'Content you post',
        bullets: [
          'You keep ownership of your code and comments and grant us a non-exclusive license to display them in the service according to your publishing settings.',
          'Not allowed: malicious, fraudulent or data-stealing code; abusive or hateful content; infringing others’ rights; spam; or other people’s personal information.',
          'Users can report content and block other users. We review reports and may hide or delete content, or restrict or ban accounts.',
        ],
      },
      {
        title: 'Private messages',
        bullets: ['Use messages respectfully. Harassment, threats, fraud and spam are prohibited.', 'You can block any user to stop them from messaging you.'],
      },
      {
        title: 'AI assistant and code execution',
        bullets: [
          'Assistant replies are generated automatically and may contain mistakes; verify them before relying on them.',
          'The assistant has daily limits. Do not use it or the code execution service for harmful purposes or to overload the service.',
        ],
      },
      {
        title: 'Termination',
        bullets: ['You can delete your account at any time from settings.', 'We may suspend or terminate accounts that violate these terms.'],
      },
      {
        title: 'Disclaimer',
        paragraphs: [
          'The service is provided "as is". We aim for availability and accuracy but do not guarantee it will be error-free or uninterrupted, and are not liable for indirect damages arising from its use, to the extent permitted by law.',
        ],
      },
      { title: 'Changes', paragraphs: ['We may update these terms; continued use after an update means you accept them.'] },
    ],
  },
};

/** صفحة عامة لحذف الحساب (رابط "Delete account URL" في Google Play Data safety) */
export const ACCOUNT_DELETION_INFO: Record<'ar' | 'en', LegalDocument> = {
  ar: {
    title: 'حذف حساب Kodax',
    intro: 'يمكنك حذف حسابك وكل بياناته نهائياً في أي وقت.',
    sections: [
      {
        title: 'من داخل التطبيق (فوري)',
        bullets: [
          'افتح Kodax وسجّل الدخول.',
          'اذهب إلى: ملفي ← الإعدادات ← حذف الحساب.',
          'اكتب كلمة التأكيد ثم اضغط «حذف حسابي نهائياً».',
        ],
      },
      {
        title: 'ما الذي يُحذف',
        bullets: [
          'الحساب وبيانات الدخول، والملف الشخصي والصورة.',
          'التقدم والدروس والتحديات والـ XP والسلسلة والأهداف والإنجازات والشهادات والكوينات.',
          'الأكواد والتعليقات والإعجابات والمتابعات وقائمة المحظورين.',
          'الرسائل الخاصة التي أرسلتها، ومحادثات المساعد الذكي، وتذاكر الدعم والإشعارات.',
        ],
      },
      {
        title: 'ما الذي قد يبقى',
        bullets: [
          'إحصاءات استخدام مجهولة لا ترتبط بك، وسجلات إشراف إدارية.',
          'رسائل الطرف الآخر في محادثاتكما.',
          'نسخ في النسخ الاحتياطية للخادم لفترة محدودة حتى تُستبدل.',
        ],
      },
      {
        title: 'لا تستطيع الدخول إلى التطبيق؟',
        paragraphs: ['تواصل معنا عبر الروابط أدناه من نفس الحساب أو مع إثبات ملكيته، وسنحذفه لك.'],
      },
    ],
  },
  en: {
    title: 'Delete your Kodax account',
    intro: 'You can permanently delete your account and all of its data at any time.',
    sections: [
      {
        title: 'In the app (immediate)',
        bullets: ['Open Kodax and sign in.', 'Go to Profile → Settings → Delete account.', 'Type the confirmation word and tap "Delete my account permanently".'],
      },
      {
        title: 'What is deleted',
        bullets: [
          'Your account and sign-in data, profile and avatar.',
          'Progress, lessons, challenges, XP, streak, goals, achievements, certificates and coins.',
          'Code, comments, likes, follows and your block list.',
          'Private messages you sent, AI assistant conversations, support tickets and notifications.',
        ],
      },
      {
        title: 'What may remain',
        bullets: [
          'Anonymous usage statistics not linked to you, and administrative moderation records.',
          "The other participant's messages in your conversations.",
          'Copies in server backups for a limited period until they rotate.',
        ],
      },
      {
        title: "Can't access the app?",
        paragraphs: ['Contact us using the links below from the same account or with proof of ownership, and we will delete it for you.'],
      },
    ],
  },
};
