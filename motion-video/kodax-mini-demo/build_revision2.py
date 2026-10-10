from pathlib import Path
import json

root=Path(__file__).parent
icons=json.loads((root/'assets/icons.json').read_text())
def ico(name):return '<i class="ion" aria-hidden="true">'+chr(icons[name])+'</i>'
apps=[('images','الصور','#385A86'),('camera','الكاميرا','#454552'),('mail','البريد','#436884'),('map','الخرائط','#507452'),('kodax','كوداكس','#8B5CF6'),('chatbubble','الرسائل','#417B63'),('calendar','التقويم','#8D505E'),('settings','الإعدادات','#55556D'),('cloud','الملفات','#4B6682')]
grid=''.join('<div class="app"'+(' id="selected-app"' if k=='kodax' else '')+'><div class="app-icon" style="background:'+c+'">'+('<span class="app-mark"></span>' if k=='kodax' else ico(k))+'</div><span class="app-label">'+label+'</span></div>' for k,label,c in apps)
code=['name = <span class="string">"<b class="arabic">كوداكس</b>"</span>','message = <span class="string">"<b class="arabic">مرحباً، </b>"</span> + name','<span class="function">print</span>(message)']
rows=''.join('<div class="code-row"><span class="line-number">'+str(i+1)+'</span><span class="code-line" id="code-'+str(i)+'">'+s+'</span></div>' for i,s in enumerate(code))
pointer='<svg viewBox="0 0 64 80"><path d="M9 5L53 47 34 50 45 70 34 76 23 55 10 70Z" fill="#EDEDF4" stroke="#0E0E14" stroke-width="3" stroke-linejoin="round"/></svg>'
html=r'''<!doctype html>
<html lang="ar"><head><meta charset="utf-8"><title>كوداكس — حركة متصلة</title><script src="assets/gsap.min.js"></script><style>
@font-face{font-family:IBM;src:url(assets/IBM-Regular.ttf);font-weight:400}
@font-face{font-family:IBM;src:url(assets/IBM-Medium.ttf);font-weight:500}
@font-face{font-family:IBM;src:url(assets/IBM-SemiBold.ttf);font-weight:600}
@font-face{font-family:IBM;src:url(assets/IBM-Bold.ttf);font-weight:700}
@font-face{font-family:JetBrains;src:url(assets/JetBrainsMono.ttf)}
@font-face{font-family:Ionicons;src:url(assets/Ionicons.ttf)}
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:#0E0E14}
body{font-family:IBM,sans-serif;color:#EDEDF4}h1,h2,h3,p{margin:0}.ion{font-family:Ionicons;font-style:normal;line-height:1;display:inline-block}button{font:inherit}b{font-weight:400}
#root{width:100%;height:100%;position:relative;overflow:hidden;background:#0E0E14}
.ambient{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 35% 38%,rgba(139,92,246,.20),transparent 49%),radial-gradient(ellipse at 85% 92%,rgba(124,58,237,.12),transparent 35%)}
.stage{width:100%;height:100%;display:grid;place-items:center;perspective:1700px;padding:80px}
.rig{width:100%;height:100%;display:grid;place-items:center;transform-style:preserve-3d}
.layer{grid-area:1/1;transform-style:preserve-3d;position:relative}
.phone{width:468px;height:866px;border-radius:64px;padding:10px;background:linear-gradient(135deg,#686875 0%,#2C2C37 14%,#08080F 43%,#454550 82%,#16161F);box-shadow:-12px 15px 0 #090910,0 55px 95px rgba(0,0,0,.75),inset 0 0 0 2px #B6B6C844;z-index:2}
.phone-screen{width:100%;height:100%;border-radius:55px;overflow:hidden;background:#16161F;display:flex;flex-direction:column;align-items:center;padding:31px 30px;position:relative}
.phone-screen:before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 10% 80%,#38215F,transparent 70%),radial-gradient(ellipse at 95% 0%,#232340,transparent 60%);pointer-events:none}
.island{width:127px;height:31px;background:#050509;border-radius:28px;position:absolute;top:15px}
.status{width:100%;display:flex;justify-content:space-between;font-size:18px;z-index:1;line-height:24px}
.status-icons{display:flex;gap:8px;font-size:18px}.home-time{font-size:90px;font-weight:500;line-height:1.15;position:relative;margin:65px 0 8px;direction:ltr}.home-date{font-size:23px;color:#B6B6C8;position:relative}
.home-grid{display:grid;grid-template-columns:repeat(3,98px);gap:24px 24px;margin-top:55px;position:relative;direction:ltr}
.app{width:98px;text-align:center}.app-icon{height:88px;width:88px;border-radius:23px;display:grid;place-items:center;margin:0 auto;box-shadow:inset 0 1px 1px #FFFFFF22,0 6px 15px #0003}.app-icon .ion{font-size:48px;color:#EDEDF4}.app-label{display:block;font-size:17px;line-height:1.6;margin-top:5px;direction:rtl}.app-mark{display:block;width:100%;height:100%;border-radius:23px;background:url(assets/icon.png) center/cover}
.dock{display:flex;align-items:center;justify-content:space-around;width:100%;height:94px;border-radius:28px;background:#EDEDF40C;margin-top:auto;position:relative;font-size:38px;color:#B6B6C8}.home-indicator{width:122px;height:5px;border-radius:8px;background:#EDEDF4;margin-top:22px;position:relative}
.tap{width:110px;height:110px;border:3px solid #C4B5FD;border-radius:50%;position:absolute;left:calc(50% - 55px);top:calc(50% - 55px);opacity:0;pointer-events:none;z-index:50}
.cursor{width:60px;height:80px;z-index:51;pointer-events:none}.cursor svg{width:100%;height:100%;filter:drop-shadow(0 4px 7px #0008)}
.intro-label{z-index:0;font-size:76px;font-weight:600;direction:rtl;white-space:nowrap;color:#EDEDF4}
.intro-label em{font-style:normal;color:#C4B5FD}
.hero-icon{width:88px;height:88px;border-radius:23px;background:url(assets/icon.png) center/cover;z-index:12;opacity:0;box-shadow:0 15px 60px #0006}
.editor-wrap{width:1080px;height:700px;z-index:4;opacity:0}
.shell{width:100%;height:100%;background:#16161F;border:2px solid #36364C;border-radius:34px;box-shadow:0 50px 130px #0008,inset 0 1px 0 #EDEDF41C;position:relative;overflow:visible}
.panel-layout{width:100%;height:100%;display:flex;flex-direction:column;padding:34px;gap:20px;direction:rtl}
.header{height:86px;display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid #262634;padding-bottom:18px;position:relative}
.editor-head-title{display:flex;align-items:center;gap:16px;font-size:32px;font-weight:500}.editor-head-title .ion{color:#C4B5FD;font-size:37px}.head-actions{display:flex;gap:16px;align-items:center}.btn{padding:11px 26px;border-radius:16px;font-size:26px;display:flex;align-items:center;gap:12px;white-space:nowrap}.btn.publish{background:#8B5CF6;color:#FFF}.btn.run{background:#1D1D29;border:1px solid #36364C;color:#EDEDF4}.btn .ion{font-size:24px}
.file{height:50px;display:flex;align-items:center;justify-content:space-between;color:#B6B6C8;font-size:25px}.language{display:flex;align-items:center;gap:11px}.language small{font-size:21px;direction:ltr;background:#1D1D29;border:1px solid #36364C;padding:6px 16px;border-radius:9px}
.code{width:100%;height:278px;background:#0B0B12;border:1px solid #262634;border-radius:22px;padding:31px 27px;direction:ltr;position:relative;overflow:hidden}
.code-row{display:flex;align-items:center;gap:24px;height:63px;font-size:34px;line-height:1.7;font-family:JetBrains,monospace;white-space:nowrap;direction:ltr}.line-number{font-size:24px;color:#A2A2B8;width:35px;text-align:center;flex-shrink:0}.code-line{display:block}.string{color:#A8D68A}.function{color:#82AAFF}.arabic{font-family:IBM,sans-serif;unicode-bidi:isolate;direction:rtl;display:inline}.caret{height:38px;width:3px;background:#C4B5FD;position:absolute;left:87px;top:45px}
.result{height:78px;background:#14261E;border:1px solid #25593E;border-radius:17px;padding:18px 25px;display:flex;align-items:center;gap:20px;color:#4ADE80;position:relative;font-size:25px;opacity:0;box-shadow:0 18px 50px #0004}.result .ion{font-size:33px}.result-output{margin-right:auto;color:#EDEDF4}
.panel-foot{font-size:22px;display:flex;justify-content:space-between;color:#B6B6C8;padding:0 6px;align-items:center}.panel-foot .ion{color:#C4B5FD;font-size:28px}
.editor-caption{font-size:42px;font-weight:500;position:absolute;top:-85px;right:2px;color:#EDEDF4;direction:rtl}.editor-caption span{color:#C4B5FD}
.back-panel{width:1040px;height:630px;z-index:1;background:#1D1D29;border:1px solid #36364C;border-radius:32px;opacity:0;box-shadow:0 35px 70px #0005}
.social-header{position:absolute;inset:34px 34px auto;display:flex;align-items:center;gap:17px;direction:rtl;opacity:0;height:86px}.avatar{width:61px;height:61px;border-radius:50%;display:grid;place-items:center;background:#392B56;border:1px solid #8B5CF666;font-size:28px;font-weight:500;color:#C4B5FD;flex-shrink:0}.author{font-size:26px;line-height:1.5}.author small{display:block;color:#B6B6C8;font-size:20px}.post-tag{margin-right:auto;background:#28203D;border:1px solid #554275;padding:9px 20px;font-size:21px;border-radius:13px;color:#C4B5FD}.post-tag .ion{font-size:24px;vertical-align:middle;margin-left:7px}
.post-heading{position:absolute;inset:134px 42px auto;direction:rtl;opacity:0;display:flex;justify-content:space-between;align-items:center}.post-heading h2{font-size:29px;font-weight:500}.post-heading span{font-size:21px;color:#B6B6C8}
.social-bar{position:absolute;left:34px;right:34px;bottom:132px;height:74px;display:flex;align-items:center;gap:31px;padding:15px 24px;border:1px solid #36364C;background:#1D1D29;border-radius:18px;direction:rtl;opacity:0;box-shadow:0 20px 50px #0005}
.social-control{font-size:27px;display:flex;align-items:center;gap:12px;font-variant-numeric:tabular-nums}.social-control .ion{font-size:32px}.heart{color:#C4B5FD}.views{margin-right:auto;color:#B6B6C8}
.comment-input{position:absolute;left:34px;right:34px;bottom:35px;height:78px;background:#0E0E14;border:1px solid #36364C;border-radius:18px;display:flex;align-items:center;gap:22px;padding:15px 19px;direction:rtl;opacity:0;box-shadow:0 20px 50px #0005}.comment-input .avatar{width:44px;height:44px;font-size:22px}.comment-text{font-size:26px;position:relative;white-space:nowrap;min-width:370px}.send{margin-right:auto;width:53px;height:47px;border-radius:12px;background:#8B5CF6;display:grid;place-items:center;font-size:25px;color:white}
.publish-bridge{width:170px;height:68px;border-radius:16px;background:#8B5CF6;z-index:14;opacity:0;box-shadow:0 25px 70px #8B5CF633;display:grid;place-items:center;direction:rtl;font-size:28px;color:white;overflow:hidden}.bridge-ink{display:block}
.notice{width:365px;min-height:98px;border-radius:21px;background:#1D1D29;border:1px solid #554275;box-shadow:0 22px 70px #0007;display:flex;align-items:center;gap:18px;padding:19px 23px;direction:rtl;font-size:25px;z-index:17;opacity:0}.notice .ion{font-size:39px;color:#C4B5FD}.notice small{font-size:19px;color:#B6B6C8;display:block}.notice-comment{width:405px}.mini-logo{width:51px;height:51px;border-radius:13px;background:url(assets/icon.png) center/cover;flex-shrink:0}
.heart-particle{font-size:47px;color:#C4B5FD;z-index:18;opacity:0;pointer-events:none}
.word-stage{display:flex;align-items:center;justify-content:center;gap:50px;direction:rtl;font-size:108px;font-weight:600;z-index:22;opacity:0;white-space:nowrap}.word-stage span{display:block}.word-stage .purple{color:#C4B5FD}
.brand-stage{width:100%;height:100%;padding:130px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:19px;z-index:24;opacity:0;direction:rtl}.brand-logo{width:170px;height:170px;border-radius:43px;background:url(assets/icon.png) center/cover;box-shadow:0 30px 85px #0005}.brand-name{font-size:90px;font-weight:600;line-height:1.4}.brand-tagline{font-size:38px;color:#B6B6C8}.brand-rule{width:92px;height:3px;background:#8B5CF6;margin-top:16px}
</style></head><body><div id="root" data-composition-id="kodax-mini" data-start="0" data-duration="15" data-width="1920" data-height="1080" data-fps="30">
<div class="ambient" id="ambient" data-layout-ignore></div>
<div class="stage"><div class="rig" id="rig">
<div class="layer intro-label" id="intro-label">فكرتك <em>تبدأ هنا.</em></div>
<div class="layer phone" id="phone"><div class="phone-screen"><div class="island" data-layout-ignore></div><div class="status"><span>9:41</span><div class="status-icons">@@wifi@@ @@battery@@</div></div><div class="home-time">9:41</div><div class="home-date">السبت، ١٠ أكتوبر</div><div class="home-grid">@@grid@@</div><div class="dock">@@call@@ @@search@@ @@code@@</div><div class="home-indicator" data-layout-ignore></div></div></div>
<div class="layer hero-icon" id="hero-icon" role="img" aria-label="أيقونة كوداكس"></div>
<div class="layer cursor" id="cursor" data-layout-ignore>@@pointer@@</div><div class="tap" id="tap-a" data-layout-ignore></div>
<div class="layer back-panel" id="back-panel" data-layout-ignore></div>
<div class="layer editor-wrap" id="editor-card"><div class="editor-caption" id="caption">اكتب. <span>جرّب.</span></div><div class="shell" id="shell"><div class="panel-layout">
<div class="header" id="editor-header"><div class="editor-head-title">@@code@@ <span>كود جديد</span></div><div class="head-actions"><div class="btn publish" id="publish">نشر @@send@@</div><div class="btn run" id="run">@@play@@ شغّل</div></div></div>
<div class="file" id="file"><span dir="ltr">main.py</span><div class="language"><span>لغة الكود</span><small>Python</small>@@chev@@</div></div>
<div class="code" id="code-panel">@@rows@@<span class="caret" id="caret" data-layout-ignore></span></div>
<div class="result" id="result">@@check@@ <span>تم التشغيل بنجاح</span><span class="result-output">مرحباً، كوداكس</span></div>
<div class="panel-foot" id="panel-foot"><span>جاهز للمشاركة</span>@@code@@</div>
</div>
<div class="social-header" id="social-header"><div class="avatar">م</div><div class="author">مطور كوداكس<small>الآن · المجتمع</small></div><div class="post-tag">@@code@@ كود · Python</div></div>
<div class="post-heading" id="post-heading"><h2>فكرتي الأولى</h2><span>ثلاثة أسطر… وبداية جديدة.</span></div>
<div class="social-bar" id="social-bar"><div class="social-control heart" id="heart">@@heart@@<span id="likes">0</span></div><div class="social-control">@@comment@@ <span id="comments">0</span></div><div class="social-control">@@share@@</div><div class="social-control views">@@eye@@<span id="views">1</span></div></div>
<div class="comment-input" id="comment-input"><div class="avatar">س</div><div class="comment-text" id="comment-text">فكرة حلوة، استمر!</div><div class="send" id="send">@@send@@</div></div>
</div></div>
<div class="layer publish-bridge" id="publish-bridge"><span class="bridge-ink" id="bridge-ink">نشر @@send@@</span></div>
<div class="layer notice" id="notice-like">@@heart@@<div>أعجب بكودك<small>تفاعل جديد من المجتمع</small></div></div>
<div class="layer notice notice-comment" id="notice-comment"><div class="avatar">س</div><div>فكرة حلوة، استمر!<small>سارة · تعليق جديد</small></div></div>
<div class="layer heart-particle" id="hp0">@@heart@@</div><div class="layer heart-particle" id="hp1">@@heart@@</div><div class="layer heart-particle" id="hp2">@@heart@@</div>
<div class="layer word-stage" id="words"><span id="word-a">اكتب.</span><span class="purple" id="word-b">جرّب.</span><span id="word-c">شارك.</span></div>
<div class="layer brand-stage" id="brand"><div class="brand-logo" id="brand-logo" role="img" aria-label="كوداكس"></div><h1 class="brand-name" id="brand-name">كوداكس</h1><p class="brand-tagline" id="brand-tagline">كودك يصنع الفرق.</p><div class="brand-rule" id="brand-rule"></div></div>
</div></div>
<audio id="sfx" data-start="0" data-duration="15" data-track-index="2" data-volume="1" src="assets/effects-only.wav"></audio>
</div><script>
window.__timelines=window.__timelines||{};
const tl=gsap.timeline({paused:true});
// Registered primitives adapted: camera-rig-depth-stack and zoom-through-transition.
// The chosen app, code panel and action strip remain continuous subjects.
tl.fromTo('#phone',{rotationY:-68,rotationX:18,rotation:-13,z:-700,scale:.57,x:220,y:200,opacity:0},{rotationY:-15,rotationX:6,rotation:-7,z:0,scale:.88,x:0,y:0,opacity:1,duration:1.05,ease:'expo.out'},.1);
tl.from('#home-time',{y:35,opacity:0,duration:.65,ease:'power3.out'},.3);
tl.from('.app',{y:22,z:-60,scale:.8,opacity:0,duration:.55,stagger:{each:.035,from:'center'},ease:'back.out(1.8)'},.39);
tl.fromTo('#intro-label',{x:400,opacity:0,rotationY:-8},{x:540,opacity:1,rotationY:0,duration:.65,ease:'power3.out'},.25);
tl.to('#intro-label',{x:590,opacity:0,filter:'blur(12px)',duration:.33,ease:'power3.in'},1.42);
tl.fromTo('#cursor',{x:300,y:360,opacity:0,rotation:12},{x:5,y:22,opacity:1,rotation:0,duration:.62,ease:'power3.inOut'},.9);
tl.to('#selected-app .app-icon',{scale:.89,duration:.1,ease:'power2.in'},1.51);
tl.to('#cursor',{scale:.82,duration:.1,ease:'power2.in'},1.51);
tl.to('#cursor',{scale:1,opacity:0,x:15,y:35,duration:.22,ease:'power3.out'},1.61);
tl.fromTo('#tap-a',{scale:.4,opacity:.9,x:-8,y:-3},{scale:1.75,opacity:0,duration:.42,ease:'power2.out',immediateRender:false},1.54);
// Push through app icon: its silhouette becomes the editor, while the phone recedes.
tl.set('#selected-app',{opacity:0},1.63);
tl.fromTo('#hero-icon',{x:-8,y:-3,scale:.89,rotation:-7,opacity:1},{x:0,y:0,scale:4.1,rotation:0,opacity:1,duration:.42,ease:'expo.inOut',immediateRender:false},1.63);
tl.to('#phone',{scale:1.7,z:-350,x:-200,y:130,rotationY:20,filter:'blur(14px)',opacity:0,duration:.55,ease:'power3.inOut'},1.65);
tl.to('#hero-icon',{scale:1.1,x:-625,y:-285,rotation:0,duration:.58,ease:'expo.out'},2.04);
tl.to('#hero-icon',{opacity:0,duration:.16,ease:'power1.in'},2.62);
tl.fromTo('#editor-card',{scale:.15,rotationY:-25,rotationX:13,rotation:-8,z:-160,opacity:0},{scale:1,rotationY:-9,rotationX:4,rotation:-3,z:0,opacity:1,duration:.78,ease:'expo.out'},2.02);
tl.fromTo('#shell',{borderRadius:110},{borderRadius:34,duration:.65,ease:'power3.out'},2.05);
tl.from('#editor-header',{y:-30,opacity:0,duration:.6,ease:'power3.out'},2.23);
tl.from('#file',{x:40,opacity:0,duration:.5,ease:'power2.out'},2.34);
tl.from('#code-panel',{scaleX:.91,scaleY:.75,opacity:0,duration:.6,ease:'back.out(1.2)'},2.34);
tl.from('#panel-foot',{y:20,opacity:0,duration:.48,ease:'power4.out'},2.58);
tl.from('#caption',{x:65,opacity:0,duration:.6,ease:'power3.out'},2.4);
tl.from('#line-number',{opacity:0,duration:.4,ease:'sine.out'},2.4);
// Camera follows the code, rather than leaving a stationary card next to a headline.
tl.to('#editor-card',{scale:1.24,x:60,y:72,rotationY:2,rotationX:-2,rotation:1,duration:.7,ease:'power3.inOut'},2.85);
tl.from('#code-0',{clipPath:'inset(0 100% 0 0)',duration:.5,ease:'steps(16)'},2.85);
tl.from('#code-1',{clipPath:'inset(0 100% 0 0)',duration:.57,ease:'steps(21)'},3.38);
tl.from('#code-2',{clipPath:'inset(0 100% 0 0)',duration:.4,ease:'steps(12)'},3.98);
tl.to('#caret',{x:430,duration:.5,ease:'steps(16)'},2.85);
tl.set('#caret',{x:0,y:63},3.38);tl.to('#caret',{x:710,duration:.57,ease:'steps(21)'},3.38);
tl.set('#caret',{x:0,y:126},3.98);tl.to('#caret',{x:295,duration:.4,ease:'steps(12)'},3.98);
tl.to('#caret',{opacity:0,duration:.1},4.42);
tl.to('#editor-card',{scale:1,x:0,y:0,rotationY:-5,rotationX:3,rotation:-2,duration:.65,ease:'expo.inOut'},4.4);
tl.to('#run',{scale:.9,backgroundColor:'#392B56',duration:.12,ease:'power2.in'},4.48);
tl.to('#run',{scale:1,backgroundColor:'#1D1D29',duration:.25,ease:'back.out(2)'},4.6);
tl.fromTo('#result',{opacity:0,y:38,z:0,rotationX:-15},{opacity:1,y:0,z:80,rotationX:0,duration:.5,ease:'back.out(1.5)'},4.63);
// Publish control leaves the header, expands, then wraps the same snippet as a post.
tl.fromTo('#cursor',{x:-510,y:-15,opacity:0},{x:-324,y:-236,opacity:1,duration:.38,ease:'power3.inOut',immediateRender:false},5.13);
tl.to('#publish',{scale:.9,duration:.09,ease:'power2.in'},5.53);
tl.to('#cursor',{scale:.84,duration:.09,ease:'power2.in'},5.53);
tl.to('#cursor',{opacity:0,duration:.15},5.65);
tl.set('#publish',{opacity:0},5.65);
tl.fromTo('#publish-bridge',{x:-325,y:-264,scale:1,opacity:1,rotation:-2},{x:0,y:0,scaleX:6.37,scaleY:10.35,rotation:0,opacity:1,duration:.55,ease:'expo.inOut',immediateRender:false},5.65);
tl.to('#bridge-ink',{opacity:0,duration:.18},5.77);
tl.to('#publish-bridge',{scaleX:1,scaleY:1,x:620,y:-255,opacity:0,duration:.6,ease:'expo.out'},6.2);
tl.to('#editor-card',{rotationY:9,rotationX:-3,rotation:3,scale:.94,x:-45,y:0,duration:.72,ease:'expo.inOut'},5.65);
tl.to(['#editor-header','#file','#result','#panel-foot','#caption'],{opacity:0,duration:.18,ease:'power1.in'},5.98);
tl.to('#code-panel',{y:18,scaleY:.95,duration:.58,ease:'power3.inOut'},6.18);
tl.fromTo('#social-header',{opacity:0,x:35,y:-20},{opacity:1,x:0,y:0,duration:.55,ease:'power3.out'},6.24);
tl.fromTo('#post-heading',{opacity:0,y:22},{opacity:1,y:0,duration:.5,ease:'power2.out'},6.34);
tl.fromTo('#social-bar',{opacity:0,y:50,z:0},{opacity:1,y:0,z:65,duration:.55,ease:'back.out(1.4)'},6.5);
tl.fromTo('#comment-input',{opacity:0,y:35},{opacity:1,y:0,duration:.55,ease:'power4.out'},6.62);
tl.fromTo('#comment-text',{clipPath:'inset(0 0 0 100%)'},{clipPath:'inset(0 0 0 100%)',duration:.1},6.6);
tl.fromTo('#back-panel',{opacity:0,rotationY:9,rotation:7,x:20,y:15,z:-120,scale:.95},{opacity:1,rotationY:9,rotation:7,x:20,y:15,z:-120,scale:1,duration:.7,ease:'sine.out'},6.4);
// The action strip advances toward the camera and acquires real foreground depth.
tl.to('#editor-card',{rotationY:0,rotationX:0,rotation:0,scale:1.04,x:-65,y:-15,duration:.7,ease:'power3.inOut'},7.18);
tl.fromTo('#notice-like',{x:340,y:255,rotationY:-25,rotation:8,z:120,scale:.55,opacity:0},{x:600,y:-140,rotationY:-7,rotation:5,z:120,scale:1,opacity:1,duration:.65,ease:'back.out(1.5)'},7.4);
tl.to('#heart .ion',{scale:1.48,duration:.12,ease:'power3.out'},7.48);
tl.to('#heart .ion',{scale:1,duration:.4,ease:'elastic.out(1,.38)'},7.6);
for(let i=0;i<13;i++)tl.set('#likes',{textContent:String(i)},7.53+i*.058);
for(let i=0;i<25;i++)tl.set('#views',{textContent:String(i+1)},7.55+i*.023);
for(let i=0;i<3;i++){
tl.fromTo('#hp'+i,{x:355,y:190,scale:.4,opacity:1,rotation:0},{x:245+i*80,y:-30-i*40,scale:.9+i*.13,opacity:0,rotation:-25+i*22,duration:.63,ease:'power2.out',immediateRender:false},7.54+i*.075);
}
// Anchored camera zoom: bottom of panel fills the frame, not an unrelated dissolve.
tl.to('#editor-card',{scale:1.64,x:-5,y:-270,rotationY:-3,rotationX:2,duration:.72,ease:'expo.inOut'},8.32);
tl.to('#back-panel',{scale:1.55,x:30,y:-200,rotation:5,filter:'blur(8px)',duration:.72,ease:'expo.inOut'},8.32);
tl.to('#notice-like',{scale:.62,x:620,y:-370,filter:'blur(5px)',opacity:.5,duration:.72,ease:'expo.inOut'},8.32);
tl.to('#social-bar',{z:105,duration:.55,ease:'power2.inOut'},8.35);
tl.to('#comment-input',{z:75,duration:.55,ease:'power2.out'},8.5);
// Arabic stays connected: reveal a shaped whole phrase with a right-to-left mask.
tl.to('#comment-text',{clipPath:'inset(0 0 0 0%)',duration:.82,ease:'steps(18)'},9.08);
tl.to('#send',{scale:.88,duration:.1,ease:'power2.in'},10.03);
tl.to('#send',{scale:1,duration:.32,ease:'back.out(2)'},10.13);
tl.set('#comments',{textContent:'1'},10.16);
tl.fromTo('#notice-comment',{x:-70,y:180,z:220,scale:.8,rotation:-6,opacity:0},{x:-600,y:-40,z:170,scale:1,rotation:-4,opacity:1,duration:.65,ease:'expo.out'},10.16);
// Pull out of the conversation and collect the interface layers into kinetic words.
tl.to('#editor-card',{scale:.62,x:0,y:40,rotationY:20,rotationX:6,rotation:7,duration:.63,ease:'expo.inOut'},11.14);
tl.to('#back-panel',{scale:.57,x:0,y:40,rotation:12,filter:'blur(4px)',duration:.63,ease:'expo.inOut'},11.14);
tl.to('#notice-comment',{x:-360,y:90,scale:.65,rotation:-8,duration:.63,ease:'expo.inOut'},11.14);
tl.to('#notice-like',{x:320,y:-50,scale:.65,filter:'blur(0px)',opacity:1,duration:.63,ease:'expo.inOut'},11.14);
tl.to(['#editor-card','#back-panel','#notice-comment','#notice-like'],{scale:.05,x:0,y:0,rotationY:60,opacity:0,filter:'blur(12px)',duration:.4,ease:'power4.in'},11.8);
tl.set('#words',{opacity:1},11.92);
tl.from('#word-a',{x:250,y:90,z:350,rotation:12,opacity:0,filter:'blur(12px)',duration:.53,ease:'expo.out'},11.93);
tl.from('#word-b',{y:-160,z:-180,rotation:-10,opacity:0,filter:'blur(10px)',duration:.58,ease:'back.out(1.3)'},12.08);
tl.from('#word-c',{x:-260,y:90,z:250,rotation:-12,opacity:0,filter:'blur(12px)',duration:.58,ease:'expo.out'},12.23);
tl.to('#words',{scale:.75,rotationX:9,duration:.35,ease:'power3.in'},12.88);
tl.to('#words',{scale:.08,rotationX:65,opacity:0,filter:'blur(13px)',duration:.32,ease:'expo.in'},13.23);
tl.set('#brand',{opacity:1},13.35);
tl.from('#brand-logo',{scale:.3,rotationY:-75,rotation:-15,z:200,opacity:0,duration:.58,ease:'back.out(1.5)'},13.35);
tl.from('#brand-name',{y:45,opacity:0,filter:'blur(9px)',duration:.57,ease:'expo.out'},13.57);
tl.from('#brand-tagline',{y:20,opacity:0,duration:.48,ease:'power3.out'},13.84);
tl.from('#brand-rule',{scaleX:0,duration:.45,ease:'power2.out'},14.02);
tl.to('#ambient',{backgroundPosition:'60px -50px',duration:14,ease:'sine.inOut'},.2);
window.__timelines['kodax-mini']=tl;
</script></body></html>'''
mapping={'grid':grid,'rows':rows,'pointer':pointer,'code':ico('code-slash'),'send':ico('send'),'play':ico('play'),'chev':ico('chevron-down'),'check':ico('checkmark-circle'),'heart':ico('heart'),'comment':ico('chatbox-outline'),'share':ico('share-social-outline'),'eye':ico('eye-outline'),'wifi':ico('cloud'),'battery':ico('hardware-chip-outline'),'call':ico('chatbubble'),'search':ico('search')}
for key,val in mapping.items():html=html.replace('@@'+key+'@@',val)
html=html.replace("tl.from('#line-number'","tl.from('.line-number'").replace("tl.from('#home-time'","tl.from('.home-time'")
# Keep separate 3D surfaces in independent stacking contexts; otherwise the rear
# card can intersect and cover the code plane during a perspective punch-in.
html=html.replace('transform-style:preserve-3d}', 'transform-style:flat;perspective:1700px}')
html=html.replace('transform-style:preserve-3d;position:relative','transform-style:flat;position:relative')
html=html.replace('x:5,y:22,opacity:1','x:28,y:110,opacity:1')
html=html.replace('x:-8,y:-3','x:8,y:76')
html=html.replace("rotation:0,duration:.58,ease:'expo.out'},2.04", "rotation:0,duration:.58,ease:'expo.out'},2.06")
html=html.replace('scale:1.1,x:-625,y:-285','scale:.55,x:370,y:-292')
html=html.replace("},4.6);","},4.61);").replace("},7.6);","},7.61);")
html=html.replace('x:-600,y:-40,z:170','x:-360,y:400,z:170')
html=html.replace("duration:.4,ease:'power4.in'},11.8", "duration:.23,ease:'power4.in'},11.8")
html=html.replace("},11.92);", "},12.06);").replace("},11.93);", "},12.06);")
html=html.replace("},12.08);", "},12.18);").replace("},12.23);", "},12.3);")
html=html.replace('id="caption"','id="caption" data-layout-allow-overflow')
html=html.replace('id="publish-bridge"','id="publish-bridge" data-layout-allow-occlusion')
html=html.replace('id="social-header"','id="social-header" data-layout-allow-overflow')
html=html.replace('id="post-heading"','id="post-heading" data-layout-allow-overflow')
html=html.replace("tl.from('#word-b',{y:-160,z:-180,rotation:-10,opacity:0,filter:'blur(10px)',duration:.58,ease:'back.out(1.3)'},12.18);", "tl.from('#word-b',{y:-160,z:-180,rotation:-10,duration:.58,ease:'back.out(1.3)'},12.18);\ntl.from('#word-b',{opacity:0,filter:'blur(10px)',duration:.48,ease:'power2.out'},12.18);")
# Keep the collecting notice clear of the send-control during the camera pull.
html=html.replace('x:-360,y:90,scale:.65','x:-500,y:285,scale:.65')
html=html.replace('data-fps="30"','data-fps="60"')
html=html.replace("tl.to('#ambient',{backgroundPosition:'60px -50px',duration:14,ease:'sine.inOut'},.2);",'')
(root/'index.html').write_text(html,encoding='utf-8')
print('Revision 2: single-subject connected choreography, 15s, no music.')
