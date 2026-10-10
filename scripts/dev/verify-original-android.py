"""Verify the distributable original-package APK without printing private values."""
import hashlib,json,os,re,subprocess,sys,zipfile
from pathlib import Path
root=Path.cwd();out=root/'reports/android-original-20261010';out.mkdir(parents=True,exist_ok=True)
meta=json.loads((root/'output/android-release/original-build.json').read_text())
apk=root/'output/android-release'/meta['apk'];sdk=Path(os.environ['LOCALAPPDATA'])/'Android/Sdk/build-tools/36.0.0'
def tool(name,*args):return subprocess.check_output([str(sdk/name),*args],timeout=60).decode('utf8','replace')
badging=tool('aapt.exe','dump','badging',str(apk));manifest=tool('aapt.exe','dump','xmltree',str(apk),'AndroidManifest.xml')
sig=tool('apksigner.bat','verify','--verbose','--print-certs',str(apk))
aligned=tool('zipalign.exe','-c','-P','16','-v','4',str(apk))
config=int(re.search(r'android:configChanges[^\n]*0x([\da-f]+)\s*$',manifest,re.M).group(1),16)
checks={
 'originalPackageVersion':f"name='com.kodax.app' versionCode='{meta['versionCode']}' versionName='{meta['version']}'" in badging,
 'originalName':"application-label:'Kodax'" in badging,
 'releaseNonDebuggable':'android:debuggable' not in manifest or re.search(r'android:debuggable[^\n]*0x0\s*$',manifest,re.M) is not None,
 'sdk24target36':"sdkVersion:'24'" in badging and "targetSdkVersion:'36'" in badging,
 'arm64AndX64':"native-code: 'arm64-v8a' 'x86_64'" in badging,
 'noCleartext':re.search(r'android:usesCleartextTraffic[^\n]*0x0\s*$',manifest,re.M) is not None,
 'fontScaleHandled':bool(config & 0x40000000),
 'singleTask':'"singleTask"' in manifest or re.search(r'android:launchMode[^\n]*0x2',manifest) is not None,
 'originalDeepLink':'"kodax"' in manifest and '"kodax-preview"' not in manifest,
 'embeddedBundleOnly':re.search(r'expo\.modules\.updates\.ENABLED[^\n]*\n\s*A: android:value[^\n]*0x0\s*$',manifest,re.M) is not None and '"NEVER"' in manifest,
 'expectedEasCertificate':meta['certificateSha256'].lower().replace(':','') in sig.lower().replace(':',''),
 'apkSignatureV2':'Verified using v2 scheme (APK Signature Scheme v2): true' in sig,
 'aligned16KiB':'Verification successful' in aligned,
}
with zipfile.ZipFile(apk) as z:
 bundle=z.read('assets/index.android.bundle')
 checks['embeddedBundle']=len(bundle)>1000000
 checks['actualSupabaseProject']=b'krtulodnhmfuoxjqajwl.supabase.co' in bundle
 checks['noLocalBackend']=b'http://127.0.0.1:54321' not in bundle
 for token in ['assistant-ai-chip-icon','journey-next-lesson','shared-content-','social_delivery_allowed']:
  if token=='social_delivery_allowed':continue # Server function, not client bundle.
  checks['currentFeature:'+token]=token.encode() in bundle
 checks['noPrivateQaPasswords']=all(a['password'].encode() not in bundle for a in json.loads(Path('.env.community-social-qa.local').read_text())['accounts'])
 checks['noSigningSecrets']=all(s.encode() not in bundle for s in [json.loads(Path('.env.android-signing.local').read_text())[k] for k in ['storePassword','keyPassword']])
 resources=tool('aapt.exe','dump','--values','resources',str(apk))
 firebase=json.loads(Path('google-services.json').read_text())
 client=next(c for c in firebase['client'] if c['client_info']['android_client_info']['package_name']=='com.kodax.app')
 checks['originalFirebaseApp']=client['client_info']['mobilesdk_app_id'] in resources
 checks['originalFirebaseProject']=firebase['project_info']['project_id'] in resources
 report={**meta,'sha256':hashlib.sha256(apk.read_bytes()).hexdigest(),'embeddedBundleBytes':len(bundle),'checks':checks}
(out/'apk-verification.json').write_text(json.dumps(report,indent=2),encoding='utf8')
(out/'manifest.txt').write_text(manifest,encoding='utf8');(out/'badging.txt').write_text(badging,encoding='utf8');(out/'signature.txt').write_text(sig,encoding='utf8')
print(json.dumps(report,indent=2))
if not all(checks.values()):raise SystemExit('Original APK verification failed')
