from pathlib import Path
import json,zipfile,ast,hashlib,shutil
root=Path.cwd(); out=root/'reports/visual-implementation-v2'
def read(p):return json.loads((out/p).read_text(encoding='utf-8'))
web=read('web/checks.json'); interactions=read('complete-interactions/results.json'); native=read('android/final-checks.json')
assert len(web['results'])==76 and all(r['ok'] for r in web['results']) and not web['errors']
assert len(interactions)==19 and all(r['ok'] for r in interactions)
assert all(r['ok'] for r in native['reduced']['checks']) and native['ordinaryFlight']['ok']
assert native['preferencesRestored']=={'font_scale':'1.0','transition_animation_scale':'1.0','show_ime_with_hard_keyboard':'0','stylus_handwriting_enabled':'null'}
summary={'web':'76/76 layout states, 19/19 focused interactions; final complete-web-build on localhost:8108','android':'Actual emulator UI, 100%/160% fonts, full Gboard, real ordinary/reduced awards and idempotent review; flight visible in actual recording','typecheck':'npm run typecheck:app passed; root multi-environment tsc limitation documented','initialWarnings':'Earlier font-load timeouts and earlier XP timing failure retained; subsequent checks passed','noCommitPublishOTA':True}
(out/'verification-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
report=root/'KODAX-VISUAL-IMPLEMENTATION-V2.md';shutil.copy2(report,out/report.name)
files=[out/'gallery/index.html',report,out/'version.json',out/'verification-summary.json',out/'gallery-checks.json',out/'phone-overview.jpg',out/'learn-before-after.jpg']
for folder in ['web','before','complete-interactions','details']:
 files += list((out/folder).glob('*.png'))
for name in ['web/checks.json','web/first-run-font-timeouts.json','complete-interactions/results.json','long-code/results.json','xp/phone-results.json','xp-retest/phone-results.json','xp-reduced/phone-reduced-results.json','android/final-checks.json','android/xp-normal-results.json','android/xp-reduced-results.json','android/xp-flight-results.json']:
 files.append(out/name)
tree=ast.parse((root/'scripts/dev/package-visual-v2.py').read_text(encoding='utf-8'))
names=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='native_names' for t in n.targets))
files += [out/'android'/(n+'.png') for n in names]
files.append(out/'android/xp-flight-clip.mp4')
destination=out/'KODAX-UI-V2-20261009.zip'
with zipfile.ZipFile(destination,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in files:
  if p.exists():z.write(p, p.name if p==report else str(p.relative_to(out)))
with zipfile.ZipFile(destination) as z:
 assert z.testzip() is None
 assert not any('.env' in n or n.endswith('.bundle') or '/auth' in n for n in z.namelist())
 print('Delivery files',len(z.namelist()),'ZIP MB',round(destination.stat().st_size/1e6,2),flush=True)
print('Source',read('version.json')['sourceDigest'][:16],'ZIP SHA256',hashlib.sha256(destination.read_bytes()).hexdigest(),flush=True)
