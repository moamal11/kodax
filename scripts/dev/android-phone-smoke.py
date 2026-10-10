"""Fresh-install smoke check of the HTTPS phone artifact; no account submission."""
import runpy,time
h=runpy.run_path('scripts/dev/android-release-check.py')
globals().update({k:v for k,v in h.items() if not k.startswith('__')})
def email_visible(root):
    return any(n.get('text')=='release-draft@example.invalid' and 'EditText' in n.get('class','') and bounds(n)[3]>bounds(n)[1] for n in root.iter('node') if len(bounds(n))==4)
r=launch();cap('phone-login',r)
check('Final HTTPS phone APK launches independently at sign-in',has('البريد الإلكتروني',r))
fill('البريد الإلكتروني','release-draft@example.invalid',slow=True);r=tree();cap('phone-login-keyboard',r)
check('Phone artifact sign-in keyboard and unsent input are usable',email_visible(r))
try:
    run('shell','settings','put','system','font_scale','1.6');time.sleep(2)
    r=wait(email_visible);cap('phone-login-font160',r)
    check('Final phone APK preserves visible sign-in draft through live font change',email_visible(r))
    back();r=tree();cap('phone-login-font160-keyboard-hidden',r)
    check('Final phone APK stays at sign-in after hiding Gboard',has('البريد الإلكتروني',r))
finally:
    run('shell','settings','put','system','font_scale','1.0')
print('No sign-in or account mutation submitted')
