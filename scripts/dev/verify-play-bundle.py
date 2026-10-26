"""Check the signed Play bundle itself without installing it or disclosing credentials."""
import hashlib,json,subprocess,zipfile,struct
from pathlib import Path
root=Path(__file__).resolve().parents[2]
meta=json.loads((root/'output/android-release/aab-build.json').read_text())
artifact=root/'output/android-release'/meta['apk']
out=root/'reports/android-production-20261026'
out.mkdir(parents=True,exist_ok=True)
def fields(data):
    i=0
    def varint():
        nonlocal i
        value=shift=0
        while True:
            b=data[i]; i+=1; value|=(b&127)<<shift
            if b<128:return value
            shift+=7
    result={}
    while i<len(data):
        tag=varint(); n,w=tag>>3,tag&7
        if w==0:value=varint()
        elif w==2:
            length=varint(); value=data[i:i+length]; i+=length
        elif w in (1,5):
            length=8 if w==1 else 4; value=data[i:i+length]; i+=length
        else:raise ValueError('Unsupported protobuf wire type')
        result.setdefault(n,[]).append(value)
    return result

def xml(node):
    n=fields(node)
    if 1 not in n:return None
    e=fields(n[1][0]); attrs={}
    for raw in e.get(4,[]):
        a=fields(raw); name=a.get(2,[b''])[0].decode(); value=a.get(3,[b''])[0].decode()
        if not value and 6 in a:
            item=fields(a[6][0])
            if 7 in item:
                primitive=fields(item[7][0]); value=next((str(primitive[k][0]) for k in (6,7,8) if k in primitive),'')
            elif 2 in item:value=fields(item[2][0]).get(1,[b''])[0].decode()
        attrs[name]=value
    return {'tag':e.get(3,[b''])[0].decode(),'attrs':attrs,'children':[child for raw in e.get(5,[]) if (child:=xml(raw))]}
with zipfile.ZipFile(artifact) as z:
    manifest=xml(z.read('base/manifest/AndroidManifest.xml'))
    app=next(c for c in manifest['children'] if c['tag']=='application')
    bundle=z.read('base/assets/index.android.bundle')
    updates={c['attrs'].get('name'):c['attrs'].get('value') for c in app['children'] if c['tag']=='meta-data'}
    abis=sorted({n.split('/')[2] for n in z.namelist() if n.startswith('base/lib/') and n.endswith('.so')})
    elf_alignment=[]
    for name in z.namelist():
        if not name.startswith(('base/lib/arm64-v8a/','base/lib/x86_64/')) or not name.endswith('.so'):continue
        elf=z.read(name)
        if elf[:5]!=b'\x7fELF\x02':raise ValueError('Unexpected 64-bit library')
        phoff=struct.unpack_from('<Q',elf,32)[0]
        phsize,phcount=struct.unpack_from('<HH',elf,54)
        elf_alignment.extend(struct.unpack_from('<Q',elf,phoff+i*phsize+48)[0] for i in range(phcount) if struct.unpack_from('<I',elf,phoff+i*phsize)[0]==1)
    signing=json.loads((root/'.env.android-signing.local').read_text())
    checks={
        'package':manifest['attrs']['package']=='com.kodax.app',
        'versionName':manifest['attrs']['versionName']==meta['version'],
        'versionCode':manifest['attrs']['versionCode']==str(meta['versionCode']),
        'releaseNotDebuggable':app['attrs'].get('debuggable','0') in ('0','false'),
        'allExistingArchitectures':abis==sorted(['armeabi-v7a','arm64-v8a','x86','x86_64']),
        'nativeLibrariesSupport16KiB':bool(elf_alignment) and min(elf_alignment)>=16384,
        'otaDisabled':updates.get('expo.modules.updates.ENABLED') in ('0','false'),
        'originalBackend':b'krtulodnhmfuoxjqajwl.supabase.co' in bundle,
        'noLocalBackend':b'http://127.0.0.1:54321' not in bundle,
        'sharedContentCards':b'shared-content-' in bundle,
        'mixedProfilePublications':b'profile_publications' in bundle,
        'publishedCodeInput':'مدخلات التشغيل'.encode('utf-16le') in bundle or 'مدخلات التشغيل'.encode() in bundle,
        'noSigningPasswords':all(signing[k].encode() not in bundle for k in ('storePassword','keyPassword')),
        'noTestPasswords':all(a['password'].encode() not in bundle for a in json.loads((root/'.env.community-social-qa.local').read_text())['accounts'])
    }
jdk=Path('C:/Program Files/Android/Android Studio/jbr/bin')
verify=subprocess.run([str(jdk/'jarsigner.exe'),'-verify',str(artifact)],capture_output=True,text=True,timeout=120)
checks['jarSignatureValid']=verify.returncode==0 and 'jar verified' in verify.stdout.lower()
cert=subprocess.run([str(jdk/'keytool.exe'),'-printcert','-jarfile',str(artifact)],capture_output=True,text=True,timeout=60)
checks['originalSigningCertificate']=meta['certificateSha256'].lower().replace(':','') in cert.stdout.lower().replace(':','')
report={**meta,'manifest':manifest['attrs'],'architectures':abis,'checks':checks,'sha256':hashlib.sha256(artifact.read_bytes()).hexdigest()}
(out/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=True,indent=2))
if not all(checks.values()):raise SystemExit('Bundle checks failed')
