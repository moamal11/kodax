/**
 * MobileWebEditor – WebView-based code editor for Android / iOS
 *
 * Architecture (cursor-jump-proof):
 *   • The WebView <textarea> is the SOLE source of truth for text.
 *   • RN **never** writes text back to the WebView during normal typing.
 *   • RN only calls setCode() for **external** changes (file switch, load snippet).
 *   • External changes are gated by an explicit version counter so stale
 *     round-trips can never reset the cursor.
 *   • Syntax highlighting runs via requestAnimationFrame — non-blocking.
 *   • Auto-indent (Enter key) is handled entirely inside the WebView.
 *   • Code change messages are batched with a 16 ms debounce to avoid
 *     overwhelming the RN bridge during fast typing.
 */

import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

// ===== Public ref API =====
export interface MobileWebEditorRef {
  insertText: (text: string, cursorBackOffset?: number) => void;
  replaceWord: (replacement: string) => void;
  focus: () => void;
  /** Force-set code from outside (file switch, load). Bumps version. */
  setCodeExternal: (code: string) => void;
}

interface MobileWebEditorProps {
  language: string;
  onChange: (code: string) => void;
  onCursorChange?: (position: number) => void;
  /** Called once when the WebView finishes loading */
  onReady?: () => void;
  /** Initial code to load */
  initialCode?: string;
}

// ===== Build HTML once =====
function buildEditorHTML(): string {
  return `<!DOCTYPE html>
<html dir="ltr" lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;background:#0d0d1a;overflow:hidden;-webkit-text-size-adjust:100%}
.outer{display:flex;height:100%;overflow:hidden}
.lines{flex-shrink:0;padding:10px 4px;background:#08081a;border-right:1px solid #1e1e3a;text-align:right;min-width:36px;color:#374151;font:12px/20px monospace;user-select:none;-webkit-user-select:none;overflow:hidden}
.lines div{padding-right:4px}
.inner{flex:1;overflow:auto;-webkit-overflow-scrolling:touch}
.code-area{display:grid;min-width:max-content;min-height:100%}
.code-area>*{grid-area:1/1;padding:10px;font:13px/20px monospace;white-space:pre;margin:0;word-wrap:normal;overflow-wrap:normal}
#hl{color:#abb2bf;pointer-events:none;z-index:1}
#ed{color:transparent;-webkit-text-fill-color:transparent;caret-color:#8b5cf6;background:transparent;border:none;outline:none;resize:none;z-index:2;-webkit-appearance:none;line-height:20px}
#ed::selection{background:rgba(139,92,246,0.25)}
.kw{color:#c678dd}.s{color:#98c379}.n{color:#d19a66}.c{color:#5c6370;font-style:italic}.f{color:#61afef}.o{color:#56b6c2}.t{color:#e5c07b}.tg{color:#e06c75}.at{color:#d19a66}.pr{color:#61afef}.v{color:#e06c75}
</style>
</head>
<body>
<div class="outer">
<div class="lines" id="ln"></div>
<div class="inner" id="inn">
<div class="code-area">
<pre id="hl"></pre>
<textarea id="ed" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" data-gramm="false"></textarea>
</div>
</div>
</div>
<script>
(function(){
var ed=document.getElementById('ed'),hl=document.getElementById('hl'),ln=document.getElementById('ln'),inn=document.getElementById('inn');
var lang='javascript';
var hlRAF=0;
var sendTimer=null;
var codeVer=0;

// ===== Keywords =====
var KW={};
KW.javascript='var let const function return if else for while do switch case break continue new this class extends import export default from try catch finally throw async await yield typeof instanceof in of delete void null undefined true false NaN Infinity super static get set debugger with enum implements interface package private protected public'.split(' ');
KW.typescript=KW.javascript.concat('type interface enum namespace declare abstract as is keyof readonly infer never unknown any number string boolean symbol bigint object satisfies'.split(' '));
KW.python='def class return if elif else for while break continue import from as try except finally raise with pass lambda yield global nonlocal assert del and or not is in True False None async await print self range len int str float list dict set tuple type input open map filter zip enumerate super'.split(' ');
KW.java='public private protected static final abstract class interface extends implements return if else for while do switch case break continue new this super try catch finally throw throws void int long double float boolean char byte short String null true false import package synchronized volatile transient native instanceof enum'.split(' ');
KW.cpp='int long double float char bool void unsigned signed short class struct enum union public private protected static const virtual override final template typename namespace using return if else for while do switch case break continue new delete this try catch throw nullptr true false auto sizeof typedef extern inline volatile register include define ifdef ifndef endif pragma std cout cin endl vector string map set pair'.split(' ');
KW.csharp='public private protected internal static readonly const class interface struct enum abstract sealed virtual override new this base return if else for foreach while do switch case break continue try catch finally throw using namespace void int long double float bool string char byte decimal var null true false async await event delegate ref out in is as typeof sizeof checked unchecked default lock yield params get set value'.split(' ');
KW.php='function class return if else elseif for foreach while do switch case break continue new this try catch finally throw public private protected static abstract interface extends implements use namespace echo print var const null true false array string int float bool void isset unset empty include require die exit'.split(' ');
KW.go='func return if else for range switch case break continue var const type struct interface map chan go defer select import package nil true false int int8 int16 int32 int64 uint float32 float64 string bool byte rune error make len cap append copy delete new panic recover close print println fmt'.split(' ');
KW.rust='fn let mut const if else for while loop match return break continue struct enum impl trait pub use mod crate self super where as in ref move async await unsafe extern type true false Some None Ok Err Self Box Vec String Option Result i8 i16 i32 i64 u8 u16 u32 u64 f32 f64 bool char str usize isize println print macro_rules'.split(' ');
KW.swift='func var let class struct enum protocol extension return if else for while repeat switch case break continue import guard defer do try catch throw throws init deinit self super nil true false is as in where typealias associatedtype static override final open public private internal fileprivate Any Int Double Float String Bool Array Dictionary Set Optional'.split(' ');
KW.kotlin='fun val var class object interface return if else for while when do break continue import package try catch finally throw null true false this super is as in by constructor init companion data sealed enum abstract open override private protected public internal suspend inline reified const annotation lateinit lazy Unit Nothing Any println print'.split(' ');
KW.dart='void int double bool String var final const class abstract extends implements with return if else for while do switch case break continue new this super try catch finally throw rethrow assert import export library part as show hide is in true false null async await yield static late required factory get set operator typedef enum mixin extension on dynamic Function Future Stream List Map Set print'.split(' ');
KW.ruby='def end class module return if elsif else unless for while until do case when break next redo retry begin rescue ensure raise yield self super nil true false and or not in then require include extend puts print p gets each map select reject reduce inject collect detect find sort length size push pop shift unshift delete insert'.split(' ');
KW.sql='SELECT FROM WHERE AND OR NOT INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE ALTER DROP INDEX VIEW JOIN INNER LEFT RIGHT OUTER FULL CROSS ON AS IN BETWEEN LIKE IS NULL ORDER BY ASC DESC GROUP HAVING UNION ALL DISTINCT TOP LIMIT OFFSET EXISTS COUNT SUM AVG MIN MAX CASE WHEN THEN ELSE END PRIMARY KEY FOREIGN REFERENCES CONSTRAINT DEFAULT CHECK UNIQUE INT VARCHAR TEXT DATE BOOLEAN FLOAT DOUBLE DECIMAL CHAR BLOB IF BEGIN COMMIT ROLLBACK GRANT REVOKE TRIGGER PROCEDURE FUNCTION RETURNS DECLARE'.split(' ');
KW.html='html head body div span p a img input button form table tr td th ul ol li h1 h2 h3 h4 h5 h6 header footer nav section article aside main meta link script style title br hr pre code strong em b i u label select option textarea video audio source canvas svg'.split(' ');
KW.css='color background margin padding border width height font display position top left right bottom float overflow opacity visibility cursor transition transform animation flex grid justify-content align-items gap box-shadow border-radius outline none auto inherit initial important hover focus active'.split(' ');
KW.react=KW.javascript;

var KS={};
for(var k in KW){var st=new Set();KW[k].forEach(function(w){st.add(w);st.add(w.toLowerCase())});KS[k]=st}
function isKw(w){return (KS[lang]||KS.javascript).has(w)}

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

// ===== Tokenizer =====
var BT=String.fromCharCode(96);
function highlight(code){
var r='',i=0,L=code.length;
var isPyRb=(lang==='python'||lang==='ruby'||lang==='bash');
var isSql=(lang==='sql');
var isHtml=(lang==='html'||lang==='react');
while(i<L){
if(code[i]==='/'&&code[i+1]==='/'){var j=i;while(j<L&&code[j]!=='\\n')j++;r+='<span class="c">'+esc(code.slice(i,j))+'</span>';i=j;continue}
if(code[i]==='/'&&code[i+1]==='*'){var j=code.indexOf('*/',i+2);if(j===-1)j=L-2;if(j<i)j=L-2;r+='<span class="c">'+esc(code.slice(i,j+2))+'</span>';i=j+2;continue}
if(code[i]==='#'&&isPyRb){var j=i;while(j<L&&code[j]!=='\\n')j++;r+='<span class="c">'+esc(code.slice(i,j))+'</span>';i=j;continue}
if(code[i]==='-'&&code[i+1]==='-'&&isSql){var j=i;while(j<L&&code[j]!=='\\n')j++;r+='<span class="c">'+esc(code.slice(i,j))+'</span>';i=j;continue}
if(isHtml&&code[i]==='<'&&code[i+1]==='!'&&code[i+2]==='-'&&code[i+3]==='-'){var j=code.indexOf('-->',i+4);if(j===-1)j=L-3;r+='<span class="c">'+esc(code.slice(i,j+3))+'</span>';i=j+3;continue}
if(code[i]==='"'||code[i]==="'"||code[i]===BT){var q=code[i],j=i+1;while(j<L){if(code[j]==='\\\\'){j+=2;continue}if(code[j]===q)break;if(q!==BT&&code[j]==='\\n')break;j++}r+='<span class="s">'+esc(code.slice(i,j+1))+'</span>';i=j+1;continue}
if(code[i]>='0'&&code[i]<='9'&&(i===0||!/[a-zA-Z_$]/.test(code[i-1]))){var j=i;while(j<L&&/[0-9.xXeEbBoOa-fA-F_]/.test(code[j]))j++;r+='<span class="n">'+esc(code.slice(i,j))+'</span>';i=j;continue}
if(/[a-zA-Z_$]/.test(code[i])){var j=i;while(j<L&&/[a-zA-Z0-9_$]/.test(code[j]))j++;var w=code.slice(i,j);if(isKw(w))r+='<span class="kw">'+esc(w)+'</span>';else if(j<L&&code[j]==='(')r+='<span class="f">'+esc(w)+'</span>';else r+=esc(w);i=j;continue}
if(isHtml&&code[i]==='<'&&/[a-zA-Z\\/!]/.test(code[i+1]||'')){var j=code.indexOf('>',i);if(j!==-1&&j-i<200){r+='<span class="tg">'+esc(code.slice(i,j+1))+'</span>';i=j+1;continue}}
if(/[+\\-*\\/%=&|!<>^~?:]/.test(code[i])){r+='<span class="o">'+esc(code[i])+'</span>';i++;continue}
r+=esc(code[i]);i++}
return r}

// ===== Display =====
function scheduleHL(){
  if(hlRAF) cancelAnimationFrame(hlRAF);
  hlRAF=requestAnimationFrame(function(){hlRAF=0;hl.innerHTML=highlight(ed.value);updateLN()})
}
function updateLN(){
  var c=ed.value.split('\\n').length;
  var h='';for(var i=1;i<=Math.max(c,25);i++)h+='<div>'+i+'</div>';
  ln.innerHTML=h
}
inn.addEventListener('scroll',function(){ln.scrollTop=inn.scrollTop});

// ===== Typing: schedule HL, debounce message to RN =====
ed.addEventListener('input',function(){
  scheduleHL();
  if(sendTimer) clearTimeout(sendTimer);
  sendTimer=setTimeout(function(){sendTimer=null;sendCode()},16);
});

function sendCode(){
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'codeChange',code:ed.value,ver:codeVer}));
}

// ===== Cursor =====
function emitCursor(){
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'cursorChange',position:ed.selectionStart}))
}
ed.addEventListener('mouseup',emitCursor);
ed.addEventListener('touchend',function(){setTimeout(emitCursor,50)});
ed.addEventListener('keyup',emitCursor);

// ===== Tab + Enter =====
ed.addEventListener('keydown',function(e){
  if(e.key==='Tab'){e.preventDefault();insertAtCursor('  ',0);return}
  if(e.key==='Enter'){
    e.preventDefault();
    var s=ed.selectionStart,end=ed.selectionEnd,val=ed.value;
    var before=val.substring(0,s),after=val.substring(end);
    var ls=before.lastIndexOf('\\n')+1;
    var curLine=before.substring(ls);
    var m=curLine.match(/^(\\s*)/);var indent=m?m[1]:'';
    var tr=curLine.trim();
    if(tr.endsWith('{')||tr.endsWith(':')||tr.endsWith('('))indent+='  ';
    ed.value=before+'\\n'+indent+after;
    var np=s+1+indent.length;
    ed.selectionStart=ed.selectionEnd=np;
    scheduleHL();sendCode();emitCursor();
    return;
  }
});

function insertAtCursor(text,backOff){
  var s=ed.selectionStart,e=ed.selectionEnd;
  var before=ed.value.substring(0,s),after=ed.value.substring(e);
  ed.value=before+text+after;
  var np=s+text.length-(backOff||0);
  ed.selectionStart=ed.selectionEnd=np;
  scheduleHL();sendCode();emitCursor();
}

// ===== RN Bridge =====
// setCode is ONLY called for external / programmatic changes (file switch, load).
// It bumps codeVer so that stale onChange messages from prior sessions don't
// accidentally re-inject text.
window.setCode=function(c,newVer){
  codeVer=newVer;
  ed.value=c;
  ed.selectionStart=ed.selectionEnd=c.length;
  scheduleHL();
};
window.setLanguage=function(l){lang=l;scheduleHL()};
window.doInsert=function(text,backOffset){insertAtCursor(text,backOffset)};
window.doReplaceWord=function(replacement){
  var s=ed.selectionStart;
  var before=ed.value.substring(0,s),after=ed.value.substring(s);
  var m=before.match(/[a-zA-Z_$][\\w$]*$/);
  var ws=m?s-m[0].length:s;
  ed.value=ed.value.substring(0,ws)+replacement+after;
  var np=ws+replacement.length;
  ed.selectionStart=ed.selectionEnd=np;
  scheduleHL();sendCode();emitCursor();
};
window.focusEditor=function(){ed.focus()};
window.getCode=function(){return ed.value};

scheduleHL();
})();
</script>
</body>
</html>`;
}

const EDITOR_HTML = buildEditorHTML();

// ===== Component =====
const MobileWebEditor = forwardRef<MobileWebEditorRef, MobileWebEditorProps>(
  ({ language, onChange, onCursorChange, onReady, initialCode }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const isLoaded = useRef(false);
    /** Version counter – bumped only on explicit external setCode calls */
    const codeVersion = useRef(0);

    // ===== Expose methods to parent =====
    useImperativeHandle(ref, () => ({
      insertText: (text: string, cursorBackOffset?: number) => {
        const escaped = JSON.stringify(text);
        webViewRef.current?.injectJavaScript(
          `doInsert(${escaped},${cursorBackOffset || 0});true;`
        );
      },
      replaceWord: (replacement: string) => {
        const escaped = JSON.stringify(replacement);
        webViewRef.current?.injectJavaScript(`doReplaceWord(${escaped});true;`);
      },
      focus: () => {
        webViewRef.current?.injectJavaScript(`focusEditor();true;`);
      },
      setCodeExternal: (code: string) => {
        codeVersion.current += 1;
        const escaped = JSON.stringify(code);
        webViewRef.current?.injectJavaScript(
          `setCode(${escaped},${codeVersion.current});true;`
        );
      },
    }));

    // ===== Sync language only (no code sync from RN → WV during typing!) =====
    useEffect(() => {
      if (!isLoaded.current) return;
      const escaped = JSON.stringify(language);
      webViewRef.current?.injectJavaScript(`setLanguage(${escaped});true;`);
    }, [language]);

    // ===== Handle messages from WebView =====
    const onMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'codeChange') {
            // Ignore stale messages from a prior codeVersion
            if (data.ver !== undefined && data.ver !== codeVersion.current)
              return;
            onChange(data.code);
          } else if (data.type === 'cursorChange') {
            onCursorChange?.(data.position);
          }
        } catch {
          // ignore
        }
      },
      [onChange, onCursorChange]
    );

    // ===== Initial load =====
    const onLoad = useCallback(() => {
      isLoaded.current = true;
      if (initialCode) {
        codeVersion.current += 1;
        const escapedCode = JSON.stringify(initialCode);
        webViewRef.current?.injectJavaScript(
          `setCode(${escapedCode},${codeVersion.current});true;`
        );
      }
      const escapedLang = JSON.stringify(language);
      webViewRef.current?.injectJavaScript(`setLanguage(${escapedLang});true;`);
      onReady?.();
    }, []);

    return (
      <WebView
        ref={webViewRef}
        source={{ html: EDITOR_HTML }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={true}
        nestedScrollEnabled={true}
        bounces={false}
        keyboardDisplayRequiresUserAction={false}
        onMessage={onMessage}
        onLoad={onLoad}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        textInteractionEnabled
        allowsInlineMediaPlayback
        startInLoadingState={false}
        androidLayerType="hardware"
      />
    );
  }
);

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
});

export default MobileWebEditor;
