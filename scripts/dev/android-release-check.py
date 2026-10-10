"""Real standalone release APK checks on fictional local accounts. No Metro/deep-link harness."""
import json, os, re, subprocess, sys, time, urllib.request, xml.etree.ElementTree as E
from pathlib import Path

ADB = str(Path(os.environ['LOCALAPPDATA']) / 'Android/Sdk/platform-tools/adb.exe')
SERIAL = os.environ.get('KODAX_ANDROID_SERIAL', 'emulator-5554')
PACKAGE = 'com.kodax.app.preview'
OUT = Path('reports/android-release-20261009')
OUT.mkdir(parents=True, exist_ok=True)
CHECKS = OUT / 'checks.json'

def run(*args, timeout=30):
    return subprocess.check_output([ADB, '-s', SERIAL, *args], timeout=timeout).decode('utf-8', errors='replace')

def tree():
    for _ in range(4):
        try:
            result = run('shell', 'uiautomator', 'dump', '/sdcard/kodax-release.xml', timeout=20)
            if 'dumped' in result:
                return E.fromstring(run('shell', 'cat', '/sdcard/kodax-release.xml'))
        except (subprocess.SubprocessError, E.ParseError):
            pass
        time.sleep(1)
    raise RuntimeError('No fresh UI tree')

def labels(root):
    return [n.get('content-desc') or n.get('text') for n in root.iter('node') if n.get('content-desc') or n.get('text')]

def bounds(n):
    return list(map(int, re.findall(r'\d+', n.get('bounds', ''))))

def find(label, root=None, partial=False):
    root = root if root is not None else tree()
    nodes = [n for n in root.iter('node') if (label in (n.get('text', '') + n.get('content-desc', '')) if partial else label in [n.get('text'), n.get('content-desc')]) and len(bounds(n)) == 4 and bounds(n)[3] > bounds(n)[1]]
    if not nodes:
        return None
    return next((n for n in reversed(nodes) if n.get('clickable') == 'true'), nodes[-1])

def click(n):
    if n is None:
        raise RuntimeError('UI target missing')
    x1, y1, x2, y2 = bounds(n)
    run('shell', 'input', 'tap', str((x1+x2)//2), str((y1+y2)//2))
    time.sleep(.7)

def tap(label, root=None, partial=False):
    click(find(label, root, partial))

def has(label, root):
    return find(label, root) is not None

def wait(predicate, limit=15):
    system_dialogs=0
    for _ in range(limit):
        root = tree()
        titles=labels(root)
        if any(s in titles for s in ['واجهة مستخدم النظام لا يستجيب','الرفاهية الرقمية لا يستجيب']):
            if system_dialogs>=3: raise RuntimeError('Emulator system services repeatedly unresponsive')
            events=OUT/'environment-events.json'
            items=json.loads(events.read_text(encoding='utf-8')) if events.exists() else []
            items.append({'at':time.strftime('%Y-%m-%dT%H:%M:%S'),'systemDialog':titles[0],'action':'Close the unresponsive emulator system service; not Kodax'})
            events.write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf-8')
            tap('إغلاق التطبيق',root); system_dialogs+=1; time.sleep(2); continue
        if predicate(root):
            return root
        time.sleep(.7)
    raise RuntimeError('UI wait failed: ' + json.dumps(labels(root), ensure_ascii=False))

def swipe(up=True, x=520, root=None):
    root=root if root is not None else tree()
    areas=[bounds(n) for n in root.iter('node') if n.get('scrollable')=='true' and n.get('package')==PACKAGE and 'Horizontal' not in n.get('class','') and len(bounds(n))==4 and bounds(n)[3]-bounds(n)[1]>160]
    if areas:
        left,top,right,bottom=max(areas,key=lambda b:b[3]-b[1])
        # The outer padding avoids nested code scrollers consuming page swipes.
        x=left+min(12,(right-left)//10); start=int(top+(bottom-top)*.85);end=int(top+(bottom-top)*.2)
    else:
        start,end=1580,470
    run('shell', 'input', 'swipe', str(x), str(start if up else end), str(x), str(end if up else start), '350')
    time.sleep(.4)

def seek(label, limit=12, partial=False):
    for _ in range(limit):
        root = tree()
        node = find(label, root, partial)
        if node is not None and 70 < bounds(node)[1] < 1780:
            return root
        swipe(root=root)
    raise RuntimeError('Unreachable UI: ' + label)

def fill(label, value, slow=False):
    root = tree()
    node = next(n for n in root.iter('node') if n.get('content-desc') == label and 'EditText' in n.get('class', ''))
    click(node)
    run('shell', 'input', 'keycombination', '113', '29')
    run('shell', 'input', 'keyevent', '67')
    time.sleep(.7)  # Let the controlled field and IME finish clearing before typing.
    if slow:
        for char in value:
            run('shell','input','text',char); time.sleep(.15)
    else:
        run('shell', 'input', 'text', value)
    time.sleep(.5)

def back():
    run('shell', 'input', 'keyevent', '4')
    time.sleep(.6)

def cap(name, root=None):
    (OUT / (name + '.png')).write_bytes(subprocess.check_output([ADB, '-s', SERIAL, 'exec-out', 'screencap', '-p'], timeout=30))
    if root is not None:
        (OUT / (name + '.xml')).write_bytes(E.tostring(root, encoding='utf-8'))
    print('CAPTURE', name, flush=True)

def check(name, ok, detail=None):
    checks = json.loads(CHECKS.read_text(encoding='utf-8')) if CHECKS.exists() else []
    checks.append({'name': name, 'ok': bool(ok), 'detail': detail, 'at': time.strftime('%Y-%m-%dT%H:%M:%S')})
    CHECKS.write_text(json.dumps(checks, ensure_ascii=False, indent=2), encoding='utf-8')
    print('PASS' if ok else 'FAIL', name, flush=True)

def launch():
    run('shell', 'am', 'force-stop', PACKAGE)
    run('shell', 'am', 'start', '-n', PACKAGE + '/.MainActivity')
    return wait(lambda root: has('البريد الإلكتروني', root) or has('حسابي', root))

def home():
    for _ in range(8):
        root = tree()
        if has('الرئيسية', root):
            tap('الرئيسية', root)
            return
        back()
    raise RuntimeError('Home navigation unavailable')

def login(email):
    root = tree()
    if has('حسابي', root):
        home(); tap('حسابي'); tap('تسجيل الخروج', seek('تسجيل الخروج')); tap('خروج')
        root = wait(lambda r: has('البريد الإلكتروني', r))
    fill('البريد الإلكتروني', email); back()
    fill('كلمة المرور', 'kodax-local-123'); back()
    tap('تسجيل الدخول', seek('تسجيل الدخول', 4))
    wait(lambda r: has('حسابي', r))
    time.sleep(2)

def api_session(email):
    req = urllib.request.Request('http://localhost:54321/auth/v1/token?grant_type=password', data=json.dumps({'email': email, 'password': 'kodax-local-123'}).encode(), headers={'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req))

def api(session, path, body=None):
    req = urllib.request.Request('http://localhost:54321' + path, data=None if body is None else json.dumps(body).encode(), headers={'Authorization': 'Bearer ' + session['access_token'], 'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(req))

def activity():
    return '\n'.join(line.strip() for line in run('shell', 'dumpsys', 'activity', 'activities').splitlines() if PACKAGE in line and ('mResumedActivity' in line or 'topResumedActivity' in line))

def draft_present(root):
    return any(n.get('text') == 'draft' and 'EditText' in n.get('class','') and len(bounds(n))==4 and bounds(n)[3]>bounds(n)[1] for n in root.iter('node'))

def label_height(root, text):
    nodes = [n for n in root.iter('node') if n.get('text') == text and len(bounds(n))==4 and bounds(n)[3]>bounds(n)[1]]
    return bounds(nodes[-1])[3]-bounds(nodes[-1])[1] if nodes else 0

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'inspect':
        root = tree(); print(json.dumps(labels(root), ensure_ascii=False)); cap(sys.argv[2] if len(sys.argv)>2 else 'inspect', root)
    elif mode == 'launch':
        root = launch(); print(json.dumps(labels(root), ensure_ascii=False)); cap('release-login', root)
    elif mode == 'prepare-xp':
        email = 'release-20261009@kodax.local'
        body = {'email': email, 'password': 'kodax-local-123', 'data': {'full_name': 'اختبار Android', 'username': 'android_release_20261009'}}
        req = urllib.request.Request('http://localhost:54321/auth/v1/signup', data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
        try:
            session = json.load(urllib.request.urlopen(req))
        except urllib.error.HTTPError as error:
            if error.code != 422:
                raise
            session = api_session(email)
        req = urllib.request.Request('http://localhost:54321/rest/v1/profiles?id=eq.' + session['user']['id'], method='PATCH', data=json.dumps({'province':'بغداد','gender':'male'}).encode(), headers={'Authorization':'Bearer '+session['access_token'],'Content-Type':'application/json'})
        urllib.request.urlopen(req).close()
        catalog = api(session, '/rest/v1/lesson_catalog?select=lesson_id,quiz_correct&course_id=eq.py-basics&order=position&limit=3')
        for lesson in catalog:
            result = api(session, '/rest/v1/rpc/progress_complete_lesson', {'p_lesson_id':lesson['lesson_id'],'p_quiz_answer':lesson['quiz_correct']})
            if not result.get('success'):
                raise RuntimeError(result)
            time.sleep(5.1)
        profile = api(session, '/rest/v1/profiles?select=xp&id=eq.' + session['user']['id'])[0]
        check('Local release fixture uses real lesson RPCs at 300 XP', profile['xp'] == 300, {'email':email,'xp':profile['xp']})
    elif mode == 'login':
        login(sys.argv[2]); cap('release-home', tree())
    elif mode == 'font-baseline':
        root=tree()
        if has('الاسم الكامل',root): tap('إغلاق',root)
        run('shell','settings','put','system','font_scale','1.0'); time.sleep(2)
        home(); tap('حسابي'); tap('تعديل الملف', seek('تعديل الملف'))
        time.sleep(2); fill('الاسم الكامل', 'draft',slow=True)
        before = activity(); initial = tree(); cap('font-baseline-before', initial)
        if not draft_present(initial): raise RuntimeError('Baseline precondition: draft is not visible')
        run('logcat', '-c')
        run('shell', 'settings', 'put', 'system', 'font_scale', '1.6'); time.sleep(3)
        root = tree(); cap('font-baseline-after', root)
        after = activity()
        (OUT/'font-baseline.json').write_text(json.dumps({'activityBefore':before,'activityAfter':after,'draftVisibleBefore':True,'draftVisibleAfter':draft_present(root),'labels':labels(root)},ensure_ascii=False,indent=2),encoding='utf-8')
        (OUT/'font-baseline-logcat.txt').write_text(run('logcat','-d','-t','1500'),encoding='utf-8')
        print(json.dumps({'before':before,'after':after,'labels':labels(root)},ensure_ascii=False),flush=True)
    elif mode == 'font':
        home(); tap('حسابي'); tap('تعديل الملف', seek('تعديل الملف'))
        time.sleep(2); fill('الاسم الكامل','draft',slow=True)
        initial=tree(); cap('font100-sheet-draft',initial)
        check('Font test starts with a visible unsaved draft',draft_present(initial))
        height_before=label_height(initial,'تعديل الملف الشخصي')
        run('logcat','-c')
        run('shell','settings','put','system','font_scale','1.6')
        time.sleep(1)
        root=wait(lambda r:draft_present(r) and label_height(r,'تعديل الملف الشخصي')>height_before); cap('font160-sheet-draft',root)
        height_after=label_height(root,'تعديل الملف الشخصي')
        check('Live font change preserves the open sheet and its draft',draft_present(root))
        check('Live font change actually enlarges text metrics',height_after>height_before,{'labelHeight100':height_before,'labelHeight160':height_after})
        run('shell','am','start','-a','android.settings.DISPLAY_SETTINGS')
        run('shell','settings','put','system','font_scale','1.2')
        run('shell','am','start','-n',PACKAGE+'/.MainActivity')
        root=wait(draft_present); cap('font-settings-return-draft',root)
        check('Font change through Settings preserves the session and draft',draft_present(root))
        run('shell','settings','put','system','font_scale','1.0')
        root=wait(draft_present)
        check('Returning to 100% preserves the draft',draft_present(root))
        tap('إغلاق',root); wait(lambda r:has('حسابي',r)); home()
        check('Navigation remains usable after repeated live font changes',has('الرئيسية',tree()))
        logs=run('logcat','-d','-t','2500')
        errors=[line for line in logs.splitlines() if 'FATAL EXCEPTION' in line or 'JavascriptException' in line or 'Looks like you have configured linking' in line]
        check('No release crash or linking diagnostic during font checks',not errors,errors)
        (OUT/'font-metrics.json').write_text(json.dumps({'labelHeight100':height_before,'labelHeight160':height_after,'draftPreserved':True},indent=2),encoding='utf-8')
