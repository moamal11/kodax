"""Tablet layout regression checks in the embedded Release APK, fictional local data."""
import sys, time, importlib.util
from pathlib import Path
spec = importlib.util.spec_from_file_location('release_checks', 'scripts/dev/android-release-check.py')
h = importlib.util.module_from_spec(spec)
spec.loader.exec_module(h)

h.OUT = Path('reports/android-tablet-fixes-20261009')
h.OUT.mkdir(parents=True, exist_ok=True)
h.CHECKS = h.OUT / 'native-checks.json'
mode = sys.argv[1]
if mode == 'dev-login':
    h.PACKAGE = 'com.kodax.app'
    r = h.wait(lambda r: h.has('البريد الإلكتروني', r) or h.has('حسابي', r) or h.has('Continue', r) or h.has('Close', r), limit=30)
    if h.has('Continue', r):
        h.tap('Continue', r)
        r = h.tree()
    if h.has('Close', r): h.tap('Close', r)
    h.login('qa@kodax.local')
    sys.exit(0)
if mode in ['dev', 'calendar-detail']:
    h.PACKAGE = 'com.kodax.app'
if mode == 'calendar-detail':
    h.run('shell','wm','size','960x2220')
    h.run('shell','wm','density','480')
    h.run('shell','settings','put','system','font_scale','1.6')
    h.run('shell','am','force-stop',h.PACKAGE)
    h.run('shell','am','start','-a','android.intent.action.VIEW','-d','kodax://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8102',h.PACKAGE)
    time.sleep(5)
    h.wait(lambda r:h.has('الرئيسية',r),limit=20)
    h.home()
    r=h.seek('آخر 7 أيام')
    areas=[h.bounds(n) for n in r.iter('node') if n.get('scrollable')=='true' and 'Horizontal' not in n.get('class','')]
    left,top,right,bottom=max(areas,key=lambda b:b[3]-b[1])
    delta=max(0,h.bounds(h.find('آخر 7 أيام',r))[1]-top-24)
    start=bottom-40
    h.run('shell','input','swipe',str((left+right)//2),str(start),str(max(top+30,start-delta)),'500')
    time.sleep(1)
    r=h.tree()
    if not h.has('آخر 7 أيام',r): raise RuntimeError('Calendar capture left the target screen')
    h.cap('after-phone-320-font160-calendar',r)
    h.run('shell','am','force-stop',h.PACKAGE)
    h.run('shell','wm','size','reset')
    h.run('shell','wm','density','reset')
    h.run('shell','settings','put','system','font_scale','1.0')
    sys.exit(0)
if mode == 'before':
    h.launch()
    h.login('qa@kodax.local')
    h.home()
    h.cap('before-tablet-home', h.tree())
    h.tap('المجتمع')
    h.tap('ملف ليث العبيدي', h.seek('ملف ليث العبيدي'))
    r = h.wait(lambda r: h.has('أكواده المنشورة', r))
    h.cap('before-tablet-profile', r)
    for label in ['متابعة', 'مراسلة']:
        n = h.find(label, r)
        h.check('Before: public action bounds ' + label, n is not None, h.bounds(n) if n is not None else None)
else:
    for name, size, density, font in [
        ('tablet-960', '1440x2160', '240', '1.0'),
        ('tablet-1280', '1920x1440', '240', '1.0'),
        ('tablet-font160', '1440x2160', '240', '1.6'),
        ('phone-390', '1170x2340', '480', '1.0'),
        ('phone-320-font160', '960x2220', '480', '1.6'),
    ]:
        if len(sys.argv) > 2 and name not in sys.argv[2:]: continue
        h.run('shell', 'wm', 'size', size)
        h.run('shell', 'wm', 'density', density)
        h.run('shell', 'settings', 'put', 'system', 'font_scale', font)
        if mode == 'dev':
            # This existing dev APK predates the release's native metrics refresh;
            # cold-start each simulated density/size so its viewport is measured correctly.
            h.run('shell', 'am', 'force-stop', h.PACKAGE)
            h.run('shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'kodax://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8102', h.PACKAGE)
        time.sleep(5)
        h.wait(lambda r: h.has('الرئيسية', r), limit=20)
        h.home()
        # Return to the top regardless of the previous viewport.
        h.swipe(up=False)
        r = h.tree()
        goal_seen = h.has('هدف اليوم', r)
        if not goal_seen:
            r = h.seek('هدف اليوم')
            goal_seen = h.has('هدف اليوم', r)
        if not h.has('آخر 7 أيام', r): r = h.seek('آخر 7 أيام')
        h.cap('after-' + name + '-home', r)
        h.check(name + ': daily goal and week reachable', goal_seen and h.has('آخر 7 أيام', r))
        days = [n for n in r.iter('node') if any(n.get('content-desc','').endswith(': ' + status) for status in ['تعلمت','مجمّد','بلا نشاط'])]
        scale = int(density) / 160
        h.check(name + ': seven compact day cells', len(days) == 7 and all((h.bounds(n)[3]-h.bounds(n)[1])/scale <= 90 for n in days), [h.bounds(n) for n in days])
        h.tap('المجتمع')
        h.swipe(up=False)
        h.tap('ملف ليث العبيدي', h.seek('ملف ليث العبيدي'))
        r = h.wait(lambda r: h.has('أكواده المنشورة', r))
        h.cap('after-' + name + '-profile', r)
        scale = int(density) / 160
        follow_label = 'إلغاء المتابعة' if h.has('إلغاء المتابعة', r) else 'متابعة'
        for label in [follow_label, 'مراسلة']:
            n = h.find(label, r)
            b = h.bounds(n) if n is not None else [0,0,0,0]
            h.check(name + ': visible usable action ' + label,
                    n is not None and (b[2]-b[0])/scale >= 100 and (b[3]-b[1])/scale >= 44,
                    {'bounds':b, 'density':density, 'fontScale':font})
        # Local backend only: verify the follow handler and the conversation destination.
        if name == 'tablet-960':
            next_label = 'متابعة' if follow_label == 'إلغاء المتابعة' else 'إلغاء المتابعة'
            h.tap(follow_label, r)
            r = h.wait(lambda r: h.has(next_label, r))
            h.check('Tablet follow state updates', h.has(next_label, r))
            h.tap(next_label, r)
            h.wait(lambda r: h.has(follow_label, r))
            h.tap('مراسلة')
            r = h.wait(lambda r: h.has('اكتب رسالة', r) or h.find('رسالة', r, partial=True) is not None)
            h.cap('after-tablet-message-destination', r)
            h.check('Tablet message action opens conversation', True)
            h.back()
        h.back()
    h.run('shell', 'wm', 'size', 'reset')
    h.run('shell', 'wm', 'density', 'reset')
    h.run('shell', 'settings', 'put', 'system', 'font_scale', '1.0')
