"""Refresh the local visual review. Includes only referenced media, no app bundle or secrets."""
from pathlib import Path
import re, json, zipfile, html
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[2]
base = root / 'reports/design-polish'
gallery = base / 'gallery/index.html'
report = root / 'KODAX-DESIGN-POLISH-REPORT.md'

def check_results(file, count, key=None):
    data = json.loads(file.read_text(encoding='utf-8'))
    rows = data[key] if key else data
    assert len(rows) == count and all(r['ok'] for r in rows), str(file)

check_results(base / 'latest-matrix/ui-results.json', 110)
check_results(base / 'latest/results.json', 69, 'checks')
check_results(base / 'gamification/results.json', 50)

original = report.read_text(encoding='utf-8')
s = original
s = s.replace('## الصفحات: هدفها، التغيير، ما حُفظ، وما اختُبر\n\n', '')
s = s.replace('«المصفوفة» أدناه', '## الصفحات: هدفها، التغيير، ما حُفظ، وما اختُبر\n\n«المصفوفة» أدناه')
s = s.replace('نسخة التسليم الثابتة محلية على 8111، ومسارها reports/design-polish/delivery-web-build.',
              'نسخة التسليم الثابتة محلية على 8103، ومسارها reports/design-polish/final-web-build.')
s = s.replace('النسخة قبل تعديل قياس النص الأخير نجحت بالكامل، وتُعاد المصفوفة على نسخة التسليم.',
              'نجحت الفحوص الـ110 بالكامل على النسخة النهائية بعد تعديلات Gamification والأزرار والكود الطويل.')
s = s.replace('- 39 فحصًا للتعديلات',
              '- 50/50 فحصًا لتوجيه Gamification: الدرس التالي الصحيح، تغيره مع المسار، تحدٍّ غير محلول، المستوى والهدف التالي، الشارة والأهداف على المقاسات الأربعة والوضع النهاري. التنقل لم يغيّر XP: بقي 1160، والكوينات بقيت 58.\n'
              '- 69/69 فحصًا لملاحظات الصور الأخيرة: الصورة والاسم، توزيع الشارات، أيقونات كل اللغات، Dart، تمرير 401 سطرًا والوصول لنهايتها، نسخ المصدر كله وتشغيله وفتحه في المحرر، والوضع النهاري.\n'
              '- 39 فحصًا للتعديلات')
s = s.replace('الملف الشخصي وكيبوردها', 'الملف الشخصي وكيبوردها')
s = s.replace('ملفات نتائج الفحوص محفوظة',
              'على Android جرى أيضًا فتح صفحة التعلم والمكافآت الجديدة، والتحقق من الشارة القادمة 4 من 5. وفي كود من 401 سطرًا وصلت بالسحب الفعلي إلى السطر الأخير مع بقاء أزرار التشغيل والنسخ؛ لم يُقص المصدر.\n\nملفات نتائج الفحوص محفوظة')
s = s.replace('منها delivery/ui-results.json', 'منها latest-matrix/ui-results.json وlatest/results.json وgamification/results.json وdelivery/ui-results.json')
s = s.replace('صورك الأربع محفوظة كما هي في before/feedback؛ الصور الجديدة المقابلة لها في revised.',
              'صورك محفوظة كما هي في before/feedback وbefore/latest-feedback؛ اللقطات الحديثة في latest وgamification وlatest-matrix، وتبقى لقطات الجولة الأولى في revised.')
s = s.replace('- تمدد اختيار Python',
              '- كان تمدد نص الزر دون قيد مناسبًا للزر الكامل لكنه يضغط عنوان الصف المجاور على Android؛ صار التمدد مشروطًا بعرض الزر بدل تعميمه على الأزرار الصغيرة.\n'
              '- على Android، تداخل تمرير أفقي داخل عمودي كان يستهلك السحب؛ صار العمودي داخل العرض الأفقي في الكود المحدود، مع قياس عرض خط monospace لتجنب مساحة زائدة. تم التحقق من السطر 401 وأزرار الصفحة فعليًا.\n'
              '- تمدد اختيار Python')
s = s.replace('| التعلّم والتحديات | أوصاف الدورات وشروط فتحها أوضح وأقل قصًا',
              '| التعلّم والتحديات | مستوى وتقدم XP، الدرس التالي الحقيقي وثلاث خطوات، وتحدٍّ متاح غير محلول؛ أوصاف وشروط أوضح')
s = s.replace('| الحساب | هوية المستخدم ثم تقدم فعلي في الدروس والتحديات؛ لا تكرار لوحة الأرقام',
              '| الحساب | صورة وهوية وبيانات اتصال متوازنة؛ إزالة الخط الزخرفي؛ أرقام متجاوبة وتقدم فعلي')
s = s.replace('| الشارات | أسماء وشروط أوضح وأقل قصًا، مع زيادة المساحة',
              '| الشارات | توزيع 3 أعمدة للشاشة الضيقة و6 للعريضة؛ اسم وشرط واضحان وأقرب هدف في المكافآت')
s = s.replace('| تفاصيل الكود والتعليقات | حُفظت واجهة المحتوى والتعليقات المناسبة؛ تحسينات النص وأهداف اللمس مشتركة',
              '| تفاصيل الكود والتعليقات | تمرير مستقل محدود للكود كاملًا، أزرار ثابتة، ونسخ المشروع كاملًا عند تعدد الملفات')
s = s.replace('| اختيار لغة الكود | نافذة جديدة قابلة للبحث، أسماء كاملة، ملفات تعريفية وأوصاف؛ مشتركة بين المجتمع والمحرر',
              '| اختيار لغة الكود | بحث وأسماء مع أيقونات اللغات الفعلية؛ نافذة مشتركة للمجتمع والمحرر دون تراكب')
if '- 50/50 فحصًا لتوجيه Gamification' not in original:
    report.write_text(s, encoding='utf-8')

page = gallery.read_text(encoding='utf-8').replace('../delivery/', '../latest-matrix/')
for size in ('phone', 'desktop', 'small', 'tablet'):
    page = page.replace(f'../revised/{size}-languages.png', f'../latest/{size}-languages.png')
    page = page.replace(f'../revised/{size}-download.png', f'../latest-matrix/{size}/guest-download.png')

def figure(label, file):
    return f'<figure><figcaption>{html.escape(label)}</figcaption><a href="{file}"><img loading="lazy" src="{file}" alt="{html.escape(label)}"></a></figure>'

latest = '<section id="latest"><h2>آخر ملاحظات الصور</h2>'
for name, label in [('profile','الملف الشخصي'), ('home','صورة المستخدم بدل التحية'), ('languages','اللغة مع أيقونتها'), ('badges','توزيع الشارات'), ('long-code','الكود الطويل والأزرار الثابتة')]:
    latest += '<article><h3>' + label + '</h3><div class="pair">'
    latest += figure('الصورة التي أرسلتها', f'../before/latest-feedback/{name}.png')
    latest += figure('التصميم الحالي', f'../latest/phone-{name}.png')
    latest += f'</div><p><a href="../latest/desktop-{name}.png">الكمبيوتر</a></p></article>'
latest += '</section>'
game = '<section id="game"><h2>التقدم والهدف القادم</h2><p>الأنظمة الموجودة: XP والمستويات والدروس والتحديات والشارات. دون نظام لعب أو اقتصاد جديد.</p><div class="grid">'
for name, label in [('learn','المستوى والدرس التالي'), ('challenges','تقدم التحديات'), ('rewards','المكافآت والمستويات'), ('badge-goal','الشارة القادمة')]:
    game += figure(label, f'../gamification/phone-{name}.png')
game += '</div><p><a href="../gamification/desktop-learn.png">التعلم على الكمبيوتر</a> · <a href="../gamification/desktop-rewards.png">المكافآت على الكمبيوتر</a></p></section>'
native = '<section id="native"><h2>Android الفعلي على المحاكي</h2><div class="grid">'
for name, label in [('native-warm-final','الرئيسية'), ('native-rewards-loaded','المكافآت والهدف القادم'), ('native-code-mounted','الكود والأزرار'), ('native-code-end-final','نهاية المصدر'), ('native-learn-final-font130','التعلّم بخط 1.3'), ('native-profile-final-font130','الحساب بخط 1.3')]:
    native += figure(label, f'../android/{name}.png')
native += '</div></section>'
if '<section id="latest">' not in page:
    page = page.replace('<section id="compare">', latest + game + native + '<section id="compare">')
    page = page.replace('<a href="#compare">قبل وبعد</a>', '<a href="#latest">آخر الملاحظات</a><a href="#game">Gamification</a><a href="#native">Android</a><a href="#compare">قبل وبعد</a>')
else:
    page = re.sub(r'<section id="native">.*?</section>', lambda _: native, page, flags=re.S)
gallery.write_text(page, encoding='utf-8')

for size in ('phone', 'desktop'):
    for name, target in [('download','guest-download'), ('ai','ai'), ('certificate','certificates'), ('rewards','rewards')]:
        before = Image.open(base / f'before/{size}/{name}.png').convert('RGB')
        after = Image.open(base / f'latest-matrix/{size}/{target}.png').convert('RGB')
        # Preserve complete screenshots; no cropping or simulated UI.
        canvas = Image.new('RGB', (before.width + after.width + 48, max(before.height, after.height) + 60), '#0e0e14')
        canvas.paste(before, (16, 48)); canvas.paste(after, (before.width + 32, 48))
        draw = ImageDraw.Draw(canvas)
        draw.text((16,16), 'BEFORE', fill='white'); draw.text((before.width+32,16), 'AFTER', fill='white')
        canvas.save(base / f'comparisons/{size}-{name}.jpg', quality=90)

refs = set(re.findall(r'(?:src|href)="([^"]+)"', page))
assets = {gallery, report}
for ref in refs:
    if ref.startswith('#') or '://' in ref: continue
    file = (gallery.parent / ref).resolve()
    assert file.is_relative_to(base.resolve()) and file.is_file(), str(file)
    assets.add(file)
for file in base.joinpath('comparisons').glob('*.jpg'): assets.add(file)
for file in ('latest-matrix/ui-results.json','latest/results.json','gamification/results.json','interactions/results.json','revised/feedback-results.json'):
    assets.add(base/file)
with zipfile.ZipFile(root/'KODAX-DESIGN-POLISH-REVIEW.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for file in sorted(assets): z.write(file, file.relative_to(root))
print('Verified local references:', len(refs), 'Packaged artifacts:', len(assets))
