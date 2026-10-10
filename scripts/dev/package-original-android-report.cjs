/** Assemble evidence from completed standalone APK checks; preserve harness diagnostics. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'reports/android-original-20261010');
const artifact=JSON.parse(fs.readFileSync(path.join(dir,'apk-verification.json'),'utf8'));
const latest=new Map();
for(const file of ['checks-before-field-harness-fix.json','checks-before-startup-harness-fix.json','checks.json']){
 for(const c of JSON.parse(fs.readFileSync(path.join(dir,'device',file),'utf8'))){
  if(c.name.startsWith('Native case '))continue;
  latest.set(c.name,{...c,evidenceFile:'device/'+file});
 }
}
const checks=[...latest.values()];
if(checks.some(c=>!c.ok)||checks.length!==33)throw new Error('Native evidence incomplete');
if(Object.values(artifact.checks).some(c=>!c))throw new Error('Artifact checks failed');
const apk=path.join(root,'output/android-release',artifact.apk);
if(crypto.createHash('sha256').update(fs.readFileSync(apk)).digest('hex')!==artifact.sha256)throw new Error('APK changed after testing');
const record={artifact,native:{passed:checks.length,total:checks.length,checks},
 motionVisualReview:{normal:'Real recording shows the XP counter increasing to 100 and the completion card appearing.',reduced:'Real recording shows a readable completion card and the counter at 200 without the normal count tween.'},
 harnessDiagnostics:['login-install-race.log','profile-keyboard-field-harness.log','images-startup-harness.log','xp-repeat-route-harness.log','xp-normal-first-completion.log'],
 limits:['API 36 x86_64 emulator only; physical ARM64 device not tested','External push delivery deferred to user phone','Google OAuth, production ads/payment/AI integration not certified','Hosted kodax.app sharing links require separately tested Web deployment'],
 commitments:{commit:false,playUpload:false,otaPublish:false,aabBuilt:false,easCloudBuild:false}};
fs.writeFileSync(path.join(dir,'final-evidence.json'),JSON.stringify(record,null,2));
const p='C:/Users/moamal/myProjects/kodax',d=p+'/reports/android-original-20261010/device';
const report=`# Kodax — APK الأساسي، 10 أكتوبر 2026

تم بناء وتثبيت واختبار APK مستقل بالحزمة الأساسية **com.kodax.app** واسم **Kodax**، مع أحدث التعديلات الحالية. هذه حزمة Release موقّعة بمفتاح Android الأصلي المحفوظ في EAS، وليست حزمة Preview ولا تعتمد على Metro.

## الملف والنسخة

| الخاصية | القيمة |
|---|---|
| الملف | [${artifact.apk}](${p}/output/android-release/${artifact.apk}) |
| الإصدار | ${artifact.version}، رقم البناء ${artifact.versionCode} |
| الحجم | ${artifact.bytes.toLocaleString('en-US')} بايت، نحو 88 MB |
| Android | 7.0 فأحدث، ARM64 وx86_64؛ target SDK 36 |
| التوقيع | مفتاح EAS الأصلي؛ ليست شهادة debug المحلية |
| Firebase | إعداد com.kodax.app مضمّن، وبيانات FCM v1 موجودة في EAS |
| Supabase | مشروع Kodax الحالي krtulodnhmfuoxjqajwl، HTTPS |
| الإعلانات | إعداد الإنتاج؛ لم أنقر إعلانات حقيقية في الاختبار |
| OTA في هذا الملف | معطّل لكي يفتح المحتوى المضمّن الذي تم اختباره |

SHA-256 للملف:

${artifact.sha256}

SHA-256 لشهادة التوقيع:

${artifact.certificateSha256}

رقم EAS البعيد بقي 23. رقم 24 خاص بهذا البناء المحلي؛ لم أغيّر سجل الإصدارات البعيد أو المفاتيح. إعدادات EAS المعتادة وقناة الإنتاج في المشروع بقيت كما هي. استخدام مفتاح EAS لا يثبت أن شهادة Google Play App Signing تطابقه؛ تحديث نسخة المتجر مباشرة غير متحقق، وقد يرفض Android التحديث إذا اختلف التوقيع. لا يلزم حذف التطبيق الموجود قبل معرفة سبب أي رفض للتثبيت.

## الاختبار الفعلي

ثبتُّ هذا الملف على محاكي Android 16 / API 36 / x86_64 بالعربية. استبدلت عميل التطوير القديم على المحاكي المخصص للاختبار فقط. أوقفت Metro قبل الاختبار، ولم أستخدم واجهة Web أو حزمة Preview بدل APK الأساسي.

- ${Object.keys(artifact.checks).length} تحققًا من الحزمة نجحت: الحزمة والاسم والإصدار، عدم debuggable، التوقيع V2، محاذاة 16 KiB، الحزمة البرمجية الحالية، Firebase، الخلفيات HTTPS، معالجة fontScale، وإغلاق OTA. لم تُضمّن كلمات مرور حسابات الاختبار أو أسرار التوقيع.
- **33 فحصًا وظيفيًا فعليًا ناجحًا** بعد تصحيح خطوات الأتمتة، باستخدام الحسابات المخصصة للاختبار فقط.
- الدخول إلى Supabase، الملف الخاص والعام، الإعدادات، عرض الغلاف، وانتقال نافذة التعديل.
- تغيير الخط أثناء الجلسة من 100% إلى 160% في المشاركة وتعديل الملف، والكيبورد مفتوح: ارتفع ارتفاع نص العنوان فعليًا من 74 إلى 118 بكسل، وبقيت المسودة والنافذة محفوظتين. استمرت الكتابة، ثم أخفى الرجوع الأول الكيبورد وأغلق الثاني النافذة.
- زر الإرسال مثبت ولا يتطلب تمرير قائمة الحسابات. البحث والكتابة بقيا صالحين مع الخط المكبّر.
- منتقي الصور والقص ورفع الغلاف إلى Supabase واستبداله، ثم بقاء الغلاف والـBio بعد إيقاف التطبيق وإعادة فتحه. الـBio غير المحفوظ في فحص الكيبورد لم يتحول إلى بيانات الحساب.
- الملف وتعديل الـBio والإعدادات على مقاسات Android المكافئة لـ320×740 و390×844 و900×900، مع احتساب مساحة أشرطة النظام.
- روابط الملف باسم المستخدم وإجراءات المتابعة والمراسلة ظاهرة على الهاتف وعلى 900×900.
- إكمال py-1 زاد XP لحساب الاختبار من 0 إلى 100، وإعادته أبقته 100. إكمال py-2 مع تقليل الحركة زاده من 100 إلى 200، وإعادته أبقته 200. هذه مكافآت الدروس الموجودة؛ لم أغيّر الاقتصاد أو أكتب XP مباشرة.
- راجعت تسجيلَي XP: في الحالة المعتادة يتحرك العداد وتظهر نتيجة الإكمال؛ في تقليل الحركة تبقى النتيجة واضحة دون التدرج العددي المعتاد.

بعض المحاولات الأولى كانت أخطاء في أتمتة الفحص: بدء الفحص قبل اكتمال التثبيت، النقر على حقل قبل تمريره بالكامل بعيدًا عن التذييل، إرسال قصد تنقل أثناء استعادة الجلسة، أو إعادة قصد الدرس نفسه دون فتحه من جديد. أوقفت أيضًا محاولة بدأت قبل اكتمال سابقتها؛ احتوى سجل AndroidRuntime على أعطال أدوات UiAutomator بسبب تسجيل خدمة الأتمتة أكثر من مرة، ولم تُظهر هذه السجلات انهيار عملية Kodax. صححت تسلسل الفحص وأعدته. السجلات الأصلية محفوظة في مجلد التقرير؛ لم أحتسب هذه المحاولات فشلًا وظيفيًا بعد التحقق من سببها. لم تتطلب هذه الجولة تغيير التصميم المعتمد.

## اللقطات والأدلة

| الحالة | الدليل |
|---|---|
| الغلاف بعد إعادة الفتح | [لقطة](${d}/release-cover-after-restart.png) |
| الملف والتعديل 320 | [الملف](${d}/320-profile.png)، [التعديل](${d}/320-edit.png) |
| إعدادات 390 | [لقطة](${d}/390-settings.png) |
| الملف الخاص والعام 900×900 | [الخاص](${d}/tablet900-profile.png)، [العام](${d}/tablet900-public-username.png) |
| المشاركة والخط المكبّر أثناء الكيبورد | [لقطة](${d}/release-share-keyboard160-live.png) |
| تعديل الملف والخط المكبّر أثناء الكيبورد | [لقطة](${d}/release-profile-edit-keyboard160-live.png) |
| منتقي الصور والقص | [المنتقي](${d}/release-photo-picker.png)، [القص](${d}/release-cover-crop.png) |
| XP المعتاد وتقليل الحركة | [تسجيل المعتاد](${d}/xp-normal.mp4)، [تسجيل تقليل الحركة](${d}/xp-reduced.mp4) |
| الفحوص والتوقيع | [البيانات الكاملة](${p}/reports/android-original-20261010/final-evidence.json)، [التوقيع](${p}/reports/android-original-20261010/signature.txt) |

## الحدود

لم أختبر هذا الملف على هاتف ARM64 حقيقي أو جهاز Google Play فعلي. Firebase وFCM v1 مهيآن للحزمة الأصلية، لكن وصول إشعارات النشر والرد خارج التطبيق إلى هاتفك مؤجل حسب اتفاقنا؛ لم أرسل تجربة إلى أجهزة مستخدمين حقيقيين. رفضت إذن الإشعارات على المحاكي أثناء هذه الفحوص.

تسجيل الدخول بالبريد نجح. لم أعتمد تسجيل Google أو خدمات AI أو المدفوعات أو عرض الإعلانات الحقيقية كتكاملات إنتاج ناجحة. Google في التطبيق يستخدم Supabase OAuth عبر المتصفح، وليس Android OAuth من ملف Firebase؛ عدم وجود OAuth clients داخل ذلك الملف لا يكفي للحكم على هذا المسار. الروابط الخارجية إلى kodax.app تحتاج اختبار النسخة المنشورة على النطاق أيضًا؛ لم أنشر Web ضمن هذا الطلب.

اختبارات Web السابقة على 320×740 و390×844 و900×900 و1440×900 موثقة في [تقرير المجتمع](${p}/KODAX-COMMUNITY-SOCIAL-20261010.md). هذه الجولة لم تغيّر مكونات الواجهة، لذلك لم أقدّم تلك النتائج على أنها إعادة فحص Web جديدة. تغييرات Supabase المطلوبة مطبقة سابقًا؛ لم أضف مهاجرة جديدة للبناء، ورفع الغلاف وقراءة البيانات وXP اختُبرت على الخدمة الفعلية.

لم أنفّذ Commit أو رفع Google Play أو OTA أو بناء AAB أو بناء سحابي. ملف APK المحلي هو التسليم الحالي.
`;
fs.writeFileSync(path.join(root,'KODAX-ANDROID-ORIGINAL-20261010.md'),report);
console.log(JSON.stringify({apk:artifact.apk,artifactChecks:Object.keys(artifact.checks).length,nativeChecks:checks.length,sha256:artifact.sha256,report:'KODAX-ANDROID-ORIGINAL-20261010.md'},null,2));
