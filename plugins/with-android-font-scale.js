const { withAndroidManifest, withMainActivity, AndroidConfig } = require('expo/config-plugins');

// React Native refreshes font metrics on resume. Keep the existing Activity/React
// root when Android changes font size, so routes, dialogs and drafts survive.
const withFontScaleManifest = config => withAndroidManifest(config, cfg => {
  const activity = AndroidConfig.Manifest.getMainActivityOrThrow(cfg.modResults);
  const changes = new Set((activity.$['android:configChanges'] || '').split('|').filter(Boolean));
  changes.add('fontScale');
  activity.$['android:configChanges'] = [...changes].join('|');
  // Prebuild merges previously generated schemes. Avoid registering the production
  // scheme in a side-by-side preview, or leaving preview schemes in production.
  const known = new Set(['kodax', 'exp+kodax', 'kodax-preview', 'exp+kodax-preview']);
  const review = cfg.extra?.androidReview === true;
  for (const filter of activity['intent-filter'] || []) {
    if (!filter.data?.some(data => known.has(data.$?.['android:scheme']))) continue;
    filter.data = filter.data.filter(data => !known.has(data.$?.['android:scheme']));
    filter.data.push({ $: { 'android:scheme': review ? 'kodax-preview' : 'kodax' } });
    if (!review) filter.data.push({ $: { 'android:scheme': 'exp+kodax' } });
  }
  return cfg;
});

const withFontMetrics = config => withMainActivity(config, cfg => {
  const marker = '// Kodax: preserve drafts while refreshing Android font metrics.';
  if (cfg.modResults.language !== 'kt' || (cfg.modResults.contents.includes('override fun onConfigurationChanged') && !cfg.modResults.contents.includes(marker))) {
    throw new Error('Kodax font-scale handler requires the Kotlin MainActivity without another configuration override.');
  }
  const imports = ['android.content.res.Configuration', 'android.view.View', 'android.view.ViewGroup', 'android.view.ViewTreeObserver', 'androidx.core.view.ViewCompat', 'androidx.core.view.WindowInsetsCompat', 'com.facebook.react.ReactApplication', 'com.facebook.react.bridge.LifecycleEventListener', 'com.facebook.react.bridge.WritableNativeMap', 'com.facebook.react.uimanager.DisplayMetricsHolder', 'com.facebook.react.uimanager.PixelUtil', 'com.facebook.react.views.modal.ReactModalHostView'];
  for (const item of imports) {
    if (!cfg.modResults.contents.split(/\r?\n/).includes(`import ${item}`)) cfg.modResults.contents = cfg.modResults.contents.replace('import android.os.Bundle', `import android.os.Bundle\nimport ${item}`);
  }
  const block = `  ${marker}
  private var kodaxKeyboardDecor: View? = null
  private var kodaxKeyboardTop: Float? = null
  private val kodaxActivityLayout = ViewTreeObserver.OnGlobalLayoutListener { observeKodaxKeyboard() }
  private val kodaxDialogLayout = ViewTreeObserver.OnGlobalLayoutListener { emitKodaxKeyboardFrame() }

  private fun findKodaxDialog(view: View): View? {
    if (view is ReactModalHostView && view.dialog?.isShowing == true) {
      return view.dialog?.window?.decorView
    }
    if (view is ViewGroup) {
      for (index in 0 until view.childCount) {
        val found = findKodaxDialog(view.getChildAt(index))
        if (found != null) return found
      }
    }
    return null
  }

  private fun observeKodaxKeyboard() {
    val decor = findKodaxDialog(window.decorView) ?: window.decorView
    if (decor !== kodaxKeyboardDecor) {
      kodaxKeyboardDecor?.viewTreeObserver?.removeOnGlobalLayoutListener(kodaxDialogLayout)
      kodaxKeyboardDecor = decor
      if (decor !== window.decorView) decor.viewTreeObserver.addOnGlobalLayoutListener(kodaxDialogLayout)
    }
    emitKodaxKeyboardFrame()
  }

  private fun emitKodaxKeyboardFrame() {
    val decor = kodaxKeyboardDecor ?: return
    val insets = ViewCompat.getRootWindowInsets(decor) ?: return
    val ime = insets.getInsets(WindowInsetsCompat.Type.ime())
    val top = if (insets.isVisible(WindowInsetsCompat.Type.ime()))
      PixelUtil.toDIPFromPixel((DisplayMetricsHolder.getScreenDisplayMetrics().heightPixels - ime.bottom).toFloat())
      else null
    if (top == kodaxKeyboardTop) return
    kodaxKeyboardTop = top
    val context = (application as ReactApplication).reactHost?.currentReactContext ?: return
    if (!context.hasActiveReactInstance()) return
    val payload = WritableNativeMap()
    if (top == null) payload.putNull("screenY") else payload.putDouble("screenY", top.toDouble())
    context.emitDeviceEvent("kodaxKeyboardFrame", payload)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    // RN 0.81 stable does not refresh DisplayMetricsHolder for fontScale itself.
    DisplayMetricsHolder.initDisplayMetrics(this)
    // DeviceInfo normally refreshes fontScale on resume. A change while this Activity
    // stays foregrounded also needs a Dimensions event for responsive React layouts.
    val context = (application as ReactApplication).reactHost?.currentReactContext
    val deviceInfo = context?.getNativeModule("DeviceInfo") as? LifecycleEventListener
    deviceInfo?.onHostResume()
    // Re-measure the existing Fabric surface with its new fontSizeMultiplier.
    val content = findViewById<ViewGroup>(android.R.id.content)
    for (index in 0 until content.childCount) content.getChildAt(index).requestLayout()
    window.decorView.post { observeKodaxKeyboard() }
  }

  override fun onDestroy() {
    window.decorView.viewTreeObserver.removeOnGlobalLayoutListener(kodaxActivityLayout)
    kodaxKeyboardDecor?.viewTreeObserver?.removeOnGlobalLayoutListener(kodaxDialogLayout)
    kodaxKeyboardDecor = null
    super.onDestroy()
  }

`;
  const oldStart = cfg.modResults.contents.indexOf(`  ${marker}`);
  const componentStart = cfg.modResults.contents.indexOf('  override fun getMainComponentName()');
  if (componentStart < 0) throw new Error('Kodax: MainActivity component declaration missing.');
  cfg.modResults.contents = oldStart >= 0
    ? cfg.modResults.contents.slice(0, oldStart) + block + cfg.modResults.contents.slice(componentStart)
    : cfg.modResults.contents.slice(0, componentStart) + block + cfg.modResults.contents.slice(componentStart);
  if (!cfg.modResults.contents.includes('addOnGlobalLayoutListener(kodaxActivityLayout)')) {
    cfg.modResults.contents = cfg.modResults.contents.replace('super.onCreate(null)', 'super.onCreate(null)\n    DisplayMetricsHolder.initDisplayMetrics(this)\n    window.decorView.viewTreeObserver.addOnGlobalLayoutListener(kodaxActivityLayout)');
  }
  // Normalize previous generated files too; prebuild may preserve CRLF imports.
  const imported = new Set();
  cfg.modResults.contents = cfg.modResults.contents.split(/\r?\n/).filter(line => {
    if (!line.startsWith('import ')) return true;
    if (imported.has(line)) return false;
    imported.add(line); return true;
  }).join('\n');
  return cfg;
});

module.exports = config => withFontMetrics(withFontScaleManifest(config));
