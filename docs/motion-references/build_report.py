from pathlib import Path
import json, html, re

root=Path(__file__).parent
notes=json.loads((root/'reference-notes.json').read_text(encoding='utf-8'))
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
metrics={}
for m in manifest:
    vid=m.get('identical_to',m['id'])
    txt=(root/vid/'loudness.txt').read_text()
    metrics[m['id']]={'lufs':float(re.search(r'I:\s*([-\d.]+)',txt)[1]),'lra':float(re.search(r'LRA:\s*([-\d.]+)',txt)[1]),'true_peak':float(re.search(r'Peak:\s*([-\d.]+)',txt)[1])}

lines=['# دراسة مراجع الحركة — 10 أكتوبر 2026','',notes['scope'],'',
       '## حدود الفحص وطريقة الاسترجاع','',notes['verification'],'',
       'تم حفظ نسخ محلية من الفيديوهات الستة ومسارات الصوت للأعمال الخمسة المختلفة. فُحصت 339 صورة تغطي المدة الكاملة، و120 صورة إضافية للانتقالات المختارة. مجموع مدة الملفات 100.92 ثانية، ومجموع الأعمال المختلفة 84.77 ثانية.','',
       'للتصاميم القادمة داخل هذا المشروع توجد إشارة في AGENTS.md إلى هذا الأرشيف. في مشروع أو محادثة أخرى يجب إتاحة الأرشيف أو هذا التقرير؛ لا يوجد وعد بذاكرة دائمة داخل النموذج.','',
       '## طلب المستخدم والتفضيلات المحفوظة','']
lines += ['- '+x for x in notes['user_preferences']]
lines += ['','## بيانات الملفات','', '| المرجع | المدة بالثانية | الأبعاد | fps | متوسط الجهارة LUFS | مدى الجهارة LU | الذروة الحقيقية dBTP |','|---|---:|---|---:|---:|---:|---:|']
for m in manifest:
    a=metrics[m['id']]
    lines.append(f"| {m['id']} | {m['duration_s']:.2f} | {m['width']}×{m['height']} | {m['fps']:.0f} | {a['lufs']:.1f} | {a['lra']:.1f} | {a['true_peak']:+.1f} |")
lines+=['','الجهارة قِيست من المسار الأصلي الستيريو بمرشح FFmpeg ebur128. قيم RMS في manifest.json وaudio-peaks.json مأخوذة من نسخة تحليل أحادية 16kHz وهي مقياس مختلف. الذروات الحقيقية الموجبة تشير إلى تجاوزات محتملة بعد فك الترميز، ولا تثبت وحدها كيف كان الصوت قبل الضغط. مدة قصيرة كهذه تحد من دلالة LRA.','',
         '## اللغة البصرية المشتركة','']
lines+=['- '+x for x in notes['shared_language']]
for v in notes['videos']:
    lines+=['',f"## {v['id']} — {v['label']}",'']
    m=next(x for x in manifest if x['id']==v['id'])
    lines += ['الملف الأصلي: `'+m['source']+'`','', '### التكوين والخامات والألوان','',v['visual'],'','### الحركة','',v['motion'],'','### الانتقالات','',v['transitions'],'']
    if v['timeline']:
        lines+=['### خريطة المشاهد','', '| من — إلى (ثانية) | الملاحظة |','|---|---|']
        lines += [f'| {s:.2f} — {e:.2f} | {t} |' for s,e,t in v['timeline']]
    lines+=['','### الصوت — نتائج آلية وقياسات','',v['audio'],'']
    speech_path=root/m.get('identical_to',v['id'])/'speech-screening.json'
    if speech_path.exists():
        speech=json.loads(speech_path.read_text())
        if v['id'] in ['V01','V03']:
            lines+=['فحص Whisper المحلي أعطى مقاطع كلام محتملة تتفق مع تصنيف YAMNet. حُفظت التوقيتات ومؤشرات النموذج فقط؛ لم تُحفظ الجمل المنطوقة كنصوص قابلة لإعادة الاستخدام. حدود المقاطع الآلية، خصوصاً عند نهاية الملف، قد تتجاوز المدة ولا تُعد توقيتاً دقيقاً للصوت.','']
        elif v['id']=='V04':
            lines+=['فحص الكلام أعطى مرشحاً ضعيفاً: متوسط log-probability = -1.03 وno-speech score = 0.564. مع غياب تصنيف كلام قوي من YAMNet، لا يُعتمد هذا كتأكيد لتعليق صوتي.','']
        else:
            lines+=['فحص Whisper مع كشف النشاط الصوتي لم يعطِ مقاطع كلام مرشحة. هذا يدعم عدم وجود تعليق كلامي واضح، ولا يثبت غياب أي صوت بشري قصير.','']
    lines+=['### ما يُستفاد منه في التصميم القادم','',v['takeaway'],'']
lines+=['## قواعد التطبيق لاحقاً','']+['- '+x for x in notes['future_design_rules']]
lines+=['','## ما بقي غير متحقق','']+['- '+x for x in notes['unknowns']]
lines+=['','## محتويات الأرشيف','',
 '- index.html: فهرس محلي مع تشغيل الفيديو والقفز إلى المشاهد وتشغيل الصوت وعرض صور الفحص.',
 '- reference-notes.json: الملاحظات العربية المنظمة وتفضيلات المستخدم وقواعد العمل القادم.',
 '- manifest.json: أسماء الملفات وبصماتها والأبعاد والتوقيتات وقياس تغير الصورة.',
 '- V01 إلى V06/source.mp4: نسخ محفوظة من الملفات الستة.',
 '- V01 إلى V05/audio.wav: نسخ تحليل أحادية للصوت؛ المسار الأصلي الستيريو موجود داخل الفيديو.',
 '- contact-*.jpg وframes/: صور تغطي الفيديوهات كل ربع ثانية.',
 '- transition-details.jpg: ثماني صور لكل واحد من ثلاثة انتقالات مختارة في كل فيديو.',
 '- audio-analysis.png وaudio-envelope.json وaudio-peaks.json: شكل الإشارة وطيفها وقممها.',
 '- audio-classification.json: نتائج المصنف الخام، بما فيها تسميات ضعيفة قد تكون خاطئة؛ لا تعاملها كقائمة أصوات مؤكدة.',
 '- speech-screening.json: كشف كلام آلي وتوقيتات ومؤشرات، من دون نصوص منقولة.',
 '- loudness.txt: ملخص قياس الجهارة الأصلي.',
 '- ملفات Python: خطوات الاستخراج والفحص وبناء التقرير، لإعادة العمل عند إضافة مراجع.',
 '', '## أدوات التحليل الصوتي','',
 'استخدم [تحويل YAMNet إلى ONNX](https://huggingface.co/audiomagic/yamnet-onnx/blob/f25b741c2f0bdc6d7e6db24b5fddda23347dbafd/README.md)، المبني على [YAMNet الأصلي](https://github.com/tensorflow/models/tree/master/research/audioset/yamnet)، و[Whisper عبر faster-whisper](https://github.com/SYSTRAN/faster-whisper). النماذج شُغّلت محلياً؛ لم تُرفع فيديوهات المستخدم لخدمة خارجية. درجات التصنيف ليست نسب احتمالية معايرة.']
(root/'REVIEW.ar.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')

payload={'notes':notes,'manifest':manifest,'metrics':metrics}
data=json.dumps(payload,ensure_ascii=False).replace('</','<\\/')
page='''<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>أرشيف مراجع الحركة</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#111319;color:#edeef3;font:16px/1.85 "Segoe UI",Tahoma,sans-serif}header{padding:28px 4vw;border-bottom:1px solid #333847}h1{font-size:28px;margin:0}header p{max-width:1000px;color:#b9c1d3}a{color:#98bbff}main{max-width:1400px;margin:auto;padding:28px;display:grid;grid-template-columns:260px minmax(0,1fr);gap:30px}aside{align-self:start;position:sticky;top:20px}button{font:inherit;text-align:right;cursor:pointer;color:inherit;background:#202531;border:1px solid #394154;border-radius:12px;padding:12px 16px}button:hover,button[aria-pressed="true"]{border-color:#97b9ff;background:#293a58}aside button{display:block;width:100%;margin-bottom:10px}.card{background:#191e28;padding:24px;border:1px solid #343c4d;border-radius:18px;margin-bottom:20px}h2{font-size:24px;margin-top:0}h3{font-size:18px;color:#a7c3ff}video{width:100%;max-height:580px;background:#000;display:block;border-radius:12px}audio{width:100%;margin-top:12px}.meta{color:#b9c1d3;font-size:14px;direction:ltr;text-align:right}.timeline button{display:block;width:100%;margin:8px 0}.time{display:inline-block;direction:ltr;color:#97b9ff;min-width:115px}.status{padding:12px;background:#272a39;border-radius:10px;color:#cbd4e4}.sheets img{width:100%;display:block;border-radius:8px;margin:16px 0}.small{font-size:14px;color:#bbc5d5}li{margin:10px 0}summary{cursor:pointer;color:#a7c3ff}input{accent-color:#97b9ff}#position{font-variant-numeric:tabular-nums;color:#97b9ff}table{width:100%;border-collapse:collapse;font-size:14px}td,th{padding:8px;border-bottom:1px solid #354056} @media(max-width:850px){main{display:block;padding:16px}aside{position:static;display:grid;grid-template-columns:1fr 1fr;gap:8px}aside button{font-size:14px;padding:8px}.card{padding:16px}h1{font-size:23px}}
</style></head><body>
<header><h1>مراجعك للحركة والتصميم</h1><p>خمسة أعمال مختلفة ضمن ستة ملفات. ملاحظات التصميم والحركة محفوظة من دون اقتباس نصوص المراجع للاستخدام في التصاميم القادمة.</p><p class="status">الفحص البصري يغطي المدة الكاملة عبر إطارات متتابعة. الصوت محلل آلياً وعددياً؛ لم تتم مراجعة سمعية مباشرة من النموذج.</p><a href="REVIEW.ar.md">التقرير العربي الكامل</a> · <a href="reference-notes.json">الذاكرة المرجعية المنظمة</a></header>
<main><aside id="choices" aria-label="اختيار المرجع"></aside><section>
<article class="card"><h2 id="title"></h2><p class="meta" id="meta"></p><video id="player" controls preload="metadata" playsinline></video><p>التوقيت: <span id="position" dir="ltr">0.00s</span> · <label><input id="loop" type="checkbox"> إعادة المشهد المختار</label></p><p class="small">الفيديو يشغل الصوت الأصلي الستيريو. المشغل التالي يشغل نسخة تحليل أحادية بدقة 16kHz.</p><audio id="sound" controls preload="none"></audio></article>
<article class="card"><h3>خريطة المشاهد — اضغط للانتقال</h3><div class="timeline" id="timeline"></div></article>
<article class="card" id="details"></article>
<article class="card"><details><summary>صور الفحص والانتقالات والطيف الصوتي</summary><div class="sheets" id="sheets"></div></details></article>
<article class="card"><h3>قواعد تصميمك القادم</h3><ul id="rules"></ul><h3>ما بقي غير متحقق</h3><ul id="unknowns"></ul></article>
</section></main><script>
const DATA=__DATA__; const $=id=>document.getElementById(id);let selected=null,range=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const v of DATA.notes.videos){const b=document.createElement('button');b.textContent=v.id+' · '+v.label;b.dataset.id=v.id;b.setAttribute('aria-pressed','false');b.onclick=()=>choose(v.id);$('choices').append(b)}
function choose(id){$('player').pause();$('sound').pause();range=null;selected=id;const original=DATA.notes.videos.find(v=>v.id===id);const v=original.identical_to?DATA.notes.videos.find(x=>x.id===original.identical_to):original;const m=DATA.manifest.find(x=>x.id===id),a=DATA.metrics[id];$('title').textContent=original.label;$('meta').textContent=id+' / '+m.duration_s.toFixed(2)+'s / '+m.width+'×'+m.height+' / '+m.fps+'fps / '+a.lufs+' LUFS / '+a.lra+' LU LRA / '+a.true_peak+' dBTP';$('player').src=id+'/source.mp4';$('sound').src=v.id+'/audio.wav';$('position').textContent='0.00s';for(const b of $('choices').children)b.setAttribute('aria-pressed',String(b.dataset.id===id));$('timeline').replaceChildren();for(const [s,e,n] of v.timeline){const b=document.createElement('button');b.innerHTML='<span class="time">'+s.toFixed(2)+'–'+e.toFixed(2)+'s</span> '+esc(n);b.onclick=()=>{range=[s,e];$('player').currentTime=s;$('player').play().catch(()=>{});};$('timeline').append(b)}$('details').innerHTML=(original.identical_to?'<p class="status">هذا الملف مطابق بايتياً للمرجع V02؛ الملاحظات التالية تخص العمل نفسه.</p>':'')+[['التكوين والخامات والألوان',v.visual],['الحركة',v.motion],['الانتقالات',v.transitions],['الصوت — نتائج آلية',v.audio],['ما يُستفاد منه',v.takeaway]].map(([h,p])=>'<h3>'+esc(h)+'</h3><p>'+esc(p)+'</p>').join('');const sheets=[];for(let p=1;p<=Math.ceil(m.duration_s*4/24);p++)sheets.push(v.id+'/contact-'+String(p).padStart(2,'0')+'.jpg');sheets.push(v.id+'/transition-details.jpg',v.id+'/audio-analysis.png');$('sheets').innerHTML=sheets.map((src,i)=>'<a href="'+src+'" target="_blank"><img loading="lazy" src="'+src+'" alt="'+esc(v.label)+' — لوحة فحص '+(i+1)+'"></a>').join('')}
$('player').ontimeupdate=()=>{const p=$('player');$('position').textContent=p.currentTime.toFixed(2)+'s';if($('loop').checked&&range&&p.currentTime>=range[1])p.currentTime=range[0]};
$('player').onplay=()=>{$('sound').pause()};$('sound').onplay=()=>{$('player').pause()};
$('rules').innerHTML=DATA.notes.future_design_rules.map(x=>'<li>'+esc(x)+'</li>').join('');$('unknowns').innerHTML=DATA.notes.unknowns.map(x=>'<li>'+esc(x)+'</li>').join('');choose('V01');
</script></body></html>'''.replace('__DATA__',data)
(root/'index.html').write_text(page,encoding='utf-8')
print('Saved REVIEW.ar.md and index.html')
