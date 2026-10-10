"""Build an offline gallery of actual Android release screenshots."""
from pathlib import Path
from html import escape
from PIL import Image, ImageOps, ImageDraw

root=Path('reports/android-release-20261009')
items=[
 ('font-baseline-after','قبل الإصلاح: تغيير الخط أغلق المسودة'),
 ('font160-sheet-draft','بعد الإصلاح: المسودة والكيبورد بخط 160%'),
 ('password-sheet-keyboard','آخر حقل لكلمة المرور وأزرار الحفظ'),
 ('publish-sheet-actions-keyboard','إجراءات الكود بعد التمرير مع الكيبورد'),
 ('editor-code-keyboard','الكتابة داخل محرر Android'),
 ('long-code-top','401 سطر: أزرار التشغيل متاحة'),
 ('long-code-run-result','الناتج والتعليقات دون اجتياز المصدر'),
 ('large-learn','التعلم بخط 160%'),
 ('compact-learn160','عرض 320 وخط 160%'),
 ('compact-badges160','معرض الشارات بعرض 320'),
 ('compact-sheet-keyboard160','نافذة الملف بعرض 320 مع الكيبورد'),
 ('xp-normal-result','إكمال حقيقي ومنح XP'),
 ('xp-normal-repeat','إعادة الدرس دون XP إضافي'),
 ('xp-reduced-result','إكمال مع تقليل الحركة'),
 ('phone-login-font160','APK الهاتف النهائي: خط 160%'),
]
cards=''.join(f'<figure><a href="{name}.png"><img loading="lazy" src="{name}.png" alt="{escape(label)}"></a><figcaption>{escape(label)}</figcaption></figure>' for name,label in items if (root/(name+'.png')).exists())
videos=''.join(f'<figure><video controls preload="metadata" src="xp-{mode}.mp4"></video><figcaption>{label}</figcaption></figure>' for mode,label in [('normal','XP والحركة العادية'),('reduced','تقليل الحركة')] if (root/f'xp-{mode}.mp4').exists())
page=f'''<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Kodax — اختبار Android Release</title><style>body{{margin:0;background:#101017;color:#ecebf4;font:17px/1.7 system-ui;padding:24px}}main{{max-width:1400px;margin:auto}}h1{{font-size:28px}}a{{color:#c8b5fc}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:24px}}figure{{margin:0}}img,video{{display:block;width:100%;border-radius:12px}}figcaption{{padding:10px 0}}p{{max-width:950px}}</style><main><h1>Kodax · اختبار Android Release</h1><p>لقطات فعلية من APK مستقل على محاكي Android 16، بالعربية وRTL. بيانات الحسابات وXP محلية للاختبار. نسخة الهاتف تستخدم اتصالات HTTPS وإعلانات اختبار، وتحديث OTA معطل. التفاصيل وحدود التحقق في <a href="../../KODAX-ANDROID-RELEASE-REVIEW.md">التقرير</a>.</p><p><a href="../../output/android-release/Kodax-1.2.0-preview.apk">تنزيل APK الهاتف</a></p><div class="grid">{cards}{videos}</div></main></html>'''
(root/'index.html').write_text(page,encoding='utf-8')
names=['font-baseline-after','font160-sheet-draft','password-sheet-keyboard']
canvas=Image.new('RGB',(1008,680),'#101017');draw=ImageDraw.Draw(canvas)
for i,(name,label) in enumerate(zip(names,['Before: draft lost','Fixed: live 160% + draft','Fixed: focused field + actions'])):
    im=Image.open(root/(name+'.png')).convert('RGB');im.thumbnail((320,615))
    canvas.paste(im,(i*336+(336-im.width)//2,45));draw.text((i*336+12,14),label,fill='#ecebf4')
canvas.save(root/'android-release-review.jpg',quality=93)
print('Gallery and screenshot comparison saved')
