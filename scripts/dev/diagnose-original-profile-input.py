import importlib.util,time
from pathlib import Path
s=importlib.util.spec_from_file_location('h','scripts/dev/android-release-check.py');h=importlib.util.module_from_spec(s);s.loader.exec_module(h)
h.PACKAGE='com.kodax.app';h.OUT=Path('reports/android-original-20261010/input-diagnosis');h.OUT.mkdir(exist_ok=True)
h.tap('تعديل الملف');r=h.wait(lambda r:h.has('نبذة عنك (اختيارية)',r));h.cap('opened',r)
for _ in range(12):
 r=h.tree();n=next((n for n in r.iter('node') if n.get('content-desc')=='نبذة عنك (اختيارية)' and 'EditText' in n.get('class','')),None)
 if n is not None and h.bounds(n)[3]<1660:break
 h.swipe(root=r)
h.cap('before-focus',r);h.click(n);r=h.tree();h.cap('focused',r)
print('after focus',h.labels(r),flush=True)
h.run('shell','input','keycombination','113','29');r=h.tree();h.cap('selected',r)
h.run('shell','input','keyevent','67');r=h.tree();h.cap('deleted',r)
h.run('shell','input','text','Kodax_original_draft');r=h.tree();h.cap('typed',r)
print('after typing',h.labels(r),flush=True)
