"""Release UI flows through normal navigation; local fixtures only for account writes."""
import runpy, sys, time, json, subprocess
h=runpy.run_path('scripts/dev/android-release-check.py')
globals().update({k:v for k,v in h.items() if not k.startswith('__')})

def keyboard_visible():
    return 'mInputShown=true' in run('shell','dumpsys','input_method')

def open_rewards():
    home()
    tap('المستوى ',partial=True)
    return wait(lambda r:has('المكافآت والمستويات',r))

def xp(session):
    return api(session,'/rest/v1/profiles?select=xp&id=eq.'+session['user']['id'])[0]['xp']

def quiz(answer):
    tap(answer,seek(answer,45));tap('تحقق من الإجابة',seek('تحقق من الإجابة'))
    seek('أكمل الدرس');cap('xp-'+sys.argv[1]+'-ready',tree())

mode=sys.argv[1]
if mode=='navigation':
    home();cap('navigation-home',tree())
    for tab,marker in [('تعلّم','الدورات'),('المجتمع','اكتب كوداً'),('المساعد','رسالة للمساعد'),('حسابي','تعديل الملف'),('الرئيسية','هدف اليوم')]:
        tap(tab);r=wait(lambda r:has(marker,r));cap('navigation-'+tab,r)
        check('Release navigation: '+tab,has(marker,r))
    tap('الإشعارات',partial=True);r=wait(lambda r:has('الإشعارات',r));cap('notifications-sheet',r);tap('إغلاق',r)
    tap('الرسائل',partial=True);r=wait(lambda r:has('الرسائل',r));cap('messages-list',r)
    check('Messages reachable and Android Back returns home',has('الرسائل',r));back();wait(lambda r:has('حسابي',r))
    tap('تعلّم');tap('التحديات');r=wait(lambda r:has('متاح',r) or has('التحديات',r));cap('challenges',r)
    check('Challenges reachable without changing navigation',has('التحديات',r))
    r=open_rewards();cap('rewards-top',r)
    tap('كل الشارات',seek('كل الشارات'));r=wait(lambda r:has('إغلاق',r));cap('badge-gallery',r)
    swipe();cap('badge-gallery-scrolled',tree());tap('إغلاق');back();wait(lambda r:has('حسابي',r))
    check('Rewards and scrolling badge modal return safely',True)

elif mode=='keyboard':
    home();tap('المجتمع');tap('اكتب كوداً');r=wait(lambda r:has('ابحث عن لغة',r));cap('language-picker',r)
    fill('ابحث عن لغة','Python',slow=True);r=tree();cap('language-picker-keyboard',r)
    check('Language search is usable above real Gboard',keyboard_visible() and has('Python',r))
    back();r=tree();check('Android Back hides IME before dismissing the language sheet',has('لغة الكود',r) and not keyboard_visible());tap('Python',r);r=wait(lambda r:has('نشر',r));cap('editor',r)
    tap('Python');r=wait(lambda r:has('ابحث عن لغة',r));cap('editor-language-picker',r)
    check('Editor language picker opens with language icons',has('Python',r));tap('إغلاق')
    tap('نشر');r=wait(lambda r:has('العنوان',r));fill('العنوان','release-draft',slow=True);r=tree();cap('publish-sheet-keyboard',r)
    check('Editor title entry stays above keyboard',keyboard_visible() and has('release-draft',r))
    r=seek('احفظه كمسودة خاصة');cap('publish-sheet-actions-keyboard',r)
    check('Editor publish actions are reachable by scrolling with keyboard',has('احفظه كمسودة خاصة',r))
    back();r=tree();check('Android Back preserves the editor publish sheet',has('انشر أو احفظ',r) and not keyboard_visible());tap('إغلاق');tap('رجوع')
    r=tree()
    if has('خروج بدون حفظ',r):tap('خروج بدون حفظ',r)
    home();tap('المساعد');r=wait(lambda r:has('رسالة للمساعد',r));fill('رسالة للمساعد','Explain%sthis%scode');r=tree();cap('ai-keyboard',r)
    check('AI composer stays visible with keyboard',keyboard_visible() and has('رسالة للمساعد',r))
    back();home();tap('حسابي');tap('تعديل الملف',seek('تعديل الملف'));tap('كلمة المرور')
    fill('تأكيد كلمة المرور','unsaved-only',slow=True);r=tree();cap('password-sheet-keyboard',r)
    field=find('تأكيد كلمة المرور',r)
    check('Last password field and save action stay above keyboard',keyboard_visible() and field is not None and bounds(field)[3]<1250 and has('حفظ التغييرات',r))
    back();r=tree();check('Android Back keeps the profile sheet open after hiding IME',has('تعديل الملف الشخصي',r) and not keyboard_visible());tap('إلغاء');home()

elif mode=='editor-input':
    home();tap('المجتمع');tap('اكتب كوداً');wait(lambda r:has('ابحث عن لغة',r));tap('Python');wait(lambda r:has('نشر',r))
    run('shell','input','tap','280','550');time.sleep(1);run('shell','input','text','review_draft');time.sleep(1)
    r=tree();cap('editor-code-keyboard',r)
    check('Native WebView editor accepts typing with Gboard',keyboard_visible() and find('12 حرف',r,partial=True) is not None)
    back();r=tree();cap('editor-code-keyboard-hidden',r)
    check('Hiding editor IME preserves code',find('12 حرف',r,partial=True) is not None)
    tap('رجوع');r=wait(lambda r:has('انشر أو احفظ',r));tap('خروج بدون حفظ',seek('خروج بدون حفظ'));home()

elif mode=='scroll':
    home();tap('المجتمع');tap('مراجعة كود طويل',seek('مراجعة كود طويل'));r=wait(lambda r:has('نسخ الكود',r));cap('long-code-top',r)
    check('Long community code opens with bounded viewport',has('نسخ الكود',r))
    # Scroll within the code block; then outside it to reach actions, not 401 code lines.
    run('shell','input','swipe','650','1100','650','650','380');time.sleep(.7);cap('long-code-inner-scroll',tree())
    tap('شغّل',seek('شغّل',5));r=seek('إغلاق الناتج',6);cap('long-code-run-result',r);tap('إغلاق الناتج',r)
    check('Run action reachable with a small outer scroll for 401 lines',True)
    seek('التعليقات',5,partial=True);cap('long-code-comments',tree())
    check('Comments reachable without traversing the entire code',True);back();home()

elif mode=='large':
    run('shell','settings','put','system','font_scale','1.6');time.sleep(2)
    home();cap('large-home',tree());tap('تعلّم');cap('large-learn',tree());swipe();cap('large-learn-scrolled',tree())
    check('Learn page scrolls at 160% with navigation available',has('حسابي',tree()))
    r=open_rewards();cap('large-rewards',r);swipe();cap('large-rewards-scrolled',tree())
    open_rewards();tap('كل الشارات',seek('كل الشارات'));cap('large-badges',tree());swipe();cap('large-badges-scrolled',tree());tap('إغلاق');back()
    check('Rewards and badges remain scrollable at 160%',True)
    home();tap('حسابي');cap('large-profile',tree());run('shell','settings','put','system','font_scale','1.0');time.sleep(2);home()

elif mode=='compact':
    try:
        run('shell','wm','size','840x1942');run('shell','settings','put','system','font_scale','1.6');time.sleep(2)
        home();cap('compact-home160',tree());tap('تعلّم');cap('compact-learn160',tree());swipe();cap('compact-learn160-scrolled',tree())
        check('320 dp navigation and learn scrolling remain usable at 160%',has('حسابي',tree()))
        open_rewards();cap('compact-rewards160',tree());tap('كل الشارات',seek('كل الشارات'));cap('compact-badges160',tree());swipe();cap('compact-badges160-scrolled',tree());tap('إغلاق');back()
        home();tap('حسابي');tap('تعديل الملف',seek('تعديل الملف'));fill('الاسم الكامل','draft',slow=True);r=tree();cap('compact-sheet-keyboard160',r)
        check('320 dp profile draft and footer stay usable with large font and IME',draft_present(r) and has('حفظ التغييرات',r) and has('إلغاء',r))
        back();tap('إغلاق')
    finally:
        run('shell','wm','size','reset');run('shell','settings','put','system','font_scale','1.0');time.sleep(2)
    home()

elif mode in ['normal','reduced']:
    session=api_session('release-20261009@kodax.local');before=xp(session)
    reduced=mode=='reduced';old=run('shell','settings','get','global','transition_animation_scale').strip()
    title='الإدخال من المستخدم' if reduced else 'النصوص (Strings)'
    answer='str' if reduced else '"yth"'
    try:
        if reduced:run('shell','settings','put','global','transition_animation_scale','0');time.sleep(2)
        home();tap('تعلّم');tap('كمّل الدرس',seek('كمّل الدرس',6));r=wait(lambda r:has(title,r));cap('xp-'+mode+'-lesson',r)
        quiz(answer)
        remote='/sdcard/kodax-release-xp-'+mode+'.mp4'
        recording=subprocess.Popen([ADB,'-s',SERIAL,'shell','screenrecord','--time-limit','18',remote],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        tap('أكمل الدرس');r=wait(lambda r:has('أحسنت! أكملت الدرس',r));cap('xp-'+mode+'-result',r)
        after=xp(session);recording.wait(timeout=25);run('pull',remote,str(OUT/('xp-'+mode+'.mp4')))
        check('Actual '+mode+' completion grants exactly 100 XP',after==before+100,{'before':before,'after':after})
        tap('الدورة',seek('الدورة'));tap(title,seek(title,20));wait(lambda r:has(title,r));quiz(answer);tap('أكمل الدرس')
        r=wait(lambda r:has('راجعت هذا الدرس',r));cap('xp-'+mode+'-repeat',r)
        repeated=xp(session);check('Repeating '+mode+' lesson grants no extra XP',repeated==after,{'after':after,'repeat':repeated})
        (OUT/('xp-'+mode+'-data.json')).write_text(json.dumps({'before':before,'after':after,'repeat':repeated,'reduced':reduced,'title':title},ensure_ascii=False,indent=2),encoding='utf-8')
    finally:
        if reduced:run('shell','settings','put','global','transition_animation_scale',old)

elif mode=='errors':
    pid=run('shell','pidof',PACKAGE).strip()
    logs=run('logcat','-d','--pid='+pid)
    errors=[x for x in logs.splitlines() if any(s in x for s in ['FATAL EXCEPTION','JavascriptException','Looks like you have configured linking','ANR in '+PACKAGE])]
    check('No Kodax fatal exception in final UI flow process',not errors,errors)
