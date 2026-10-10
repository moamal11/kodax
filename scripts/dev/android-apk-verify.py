"""Validate the distributable preview APK's embedded configuration."""
import os,re,json,subprocess,hashlib,zipfile,sys
from pathlib import Path
apk=Path(sys.argv[1] if len(sys.argv)>1 else 'output/android-release/Kodax-1.2.0-preview.apk').resolve()
sdk=Path(os.environ['LOCALAPPDATA'])/'Android/Sdk/build-tools/36.0.0'
def aapt(*args):return subprocess.check_output([str(sdk/'aapt.exe'),*args],timeout=30).decode('utf-8','replace')
badging=aapt('dump','badging',str(apk));manifest=aapt('dump','xmltree',str(apk),'AndroidManifest.xml')
config=int(re.search(r'android:configChanges[^\n]*0x([\da-f]+)\s*$',manifest,re.M).group(1),16)
checks={
 'packageVersion':"name='com.kodax.app.preview' versionCode='1' versionName='1.2.0'" in badging,
 'previewName':"application-label:'Kodax Preview'" in badging,
 'sdk24target36':"sdkVersion:'24'" in badging and "targetSdkVersion:'36'" in badging,
 'arm64AndX64':"native-code: 'arm64-v8a' 'x86_64'" in badging,
 'notDebuggable':'android:debuggable' not in manifest or re.search(r'android:debuggable[^\n]*0x0\s*$',manifest,re.M) is not None,
 'cleartextDisabled':re.search(r'android:usesCleartextTraffic[^\n]*0x0\s*$',manifest,re.M) is not None,
 'fontScaleHandled':bool(config & 0x40000000),
 'otaDisabled':re.search(r'expo\.modules\.updates\.ENABLED[^\n]*\n\s*A: android:value[^\n]*0x0\s*$',manifest,re.M) is not None,
 'updatesNever':'"NEVER"' in manifest,
}
with zipfile.ZipFile(apk) as z:
    bundle=z.read('assets/index.android.bundle')
    checks['embeddedBundle']=len(bundle)>1_000_000
    checks['phoneBackendEmbedded']=b'krtulodnhmfuoxjqajwl.supabase.co' in bundle
    checks['noLocalTestBackend']=b'http://127.0.0.1:54321' not in bundle
    public={}
    for envfile in ['.env','.env.local']:
        if Path(envfile).exists():
            for line in Path(envfile).read_text(encoding='utf-8').splitlines():
                match=re.match(r'^(EXPO_PUBLIC_[A-Z0-9_]+)=(.*)$',line)
                if match:public[match[1]]=match[2].strip().strip('\"\'')
    checks['configuredPublicKeyEmbedded']=bool(public.get('EXPO_PUBLIC_SUPABASE_ANON_KEY')) and public['EXPO_PUBLIC_SUPABASE_ANON_KEY'].encode() in bundle
    checks['configuredAiEndpointEmbedded']=public.get('EXPO_PUBLIC_AI_API_ENDPOINT','').encode() in bundle and public.get('EXPO_PUBLIC_AI_API_ENDPOINT','').startswith('https://')
metadata={'apk':apk.name,'sha256':hashlib.sha256(apk.read_bytes()).hexdigest(),'bytes':apk.stat().st_size,'embeddedBundleBytes':len(bundle),'checks':checks}
out=Path(sys.argv[2] if len(sys.argv)>2 else 'reports/android-release-20261009')
out.mkdir(parents=True,exist_ok=True)
(out/'phone-apk-verification.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
(out/'phone-manifest.txt').write_text(manifest,encoding='utf-8')
(out/'phone-badging.txt').write_text(badging,encoding='utf-8')
print(json.dumps(metadata,indent=2))
if not all(checks.values()):raise SystemExit('APK verification failed')
