from pathlib import Path
import json,re,urllib.request
root=Path(__file__).parent
gsap=root/'assets/gsap.min.js'
if not gsap.exists(): urllib.request.urlretrieve('https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js',gsap)
glyphs=json.loads((root/'assets/icons.json').read_text())
page=(root/'composition.template.txt').read_text(encoding='utf-8')
page=re.sub(r'@i:([a-z-]+)@',lambda m:'<i class="icon" aria-hidden="true">&#'+str(glyphs[m[1]])+';</i>',page)
cursor='<svg viewBox="0 0 72 88" fill="none"><path d="M12 5L58 51 38 53 49 76 38 82 27 59 13 75Z" fill="#EDEDF4" stroke="#0E0E14" stroke-width="4" stroke-linejoin="round"/></svg>'
page=page.replace('@cursor@',cursor)
page=page.replace('<html lang="ar" dir="rtl">','<html lang="ar">')
page=page.replace('.scene{position:','.scene{direction:rtl;position:')
page=page.replace('.scene:not(#s1){opacity:0}','#s2,#s3,#s4{opacity:0}')
page=page.replace('class="scene" id="s2"','class="scene" id="s2" style="opacity:0"')
page=page.replace('class="scene" id="s3"','class="scene" id="s3" style="opacity:0"')
page=page.replace('class="scene" id="s4"','class="scene" id="s4" style="opacity:0"')
page=page.replace('#publish-cursor{left:268px;top:478px;opacity:0}','#publish-cursor{left:268px;top:478px}')
page=page.replace("x:150,y:130,opacity:0,duration:.65,ease:'expo.out'","x:150,y:130,opacity:0,duration:.42,ease:'expo.out'")
page=page.replace("tl.from('#publish-cursor',{x:220,y:150,opacity:0,duration:.4,ease:'expo.out'},5.78);\ntl.to('#publish-cursor',{x:-90,y:-160,opacity:1,duration:.48,ease:'power3.inOut'},5.83);", "tl.fromTo('#publish-cursor',{x:220,y:150,opacity:0},{x:-90,y:-160,opacity:1,duration:.53,ease:'power3.inOut'},5.78);")
page=page.replace('<img src="assets/icon.png" alt="">','<span style="display:block;width:38px;height:38px;border-radius:10px;background:url(assets/icon.png) center/cover"></span>')
page=page.replace('<img class="outro-logo" id="outro-logo" src="assets/icon.png" alt="أيقونة كوداكس">','<div class="outro-logo" id="outro-logo" style="background:url(assets/icon.png) center/cover" role="img" aria-label="أيقونة كوداكس"></div>')
page=page.replace('وخلي التفاعل يبدأ.','وتفاعل.')
page=page.replace('<span class="kw">for</span> i <span class="kw">in</span> <span class="fn">range</span>(<span class="num">3</span>):','message = <span class="str">"<span class="ar-code">مرحباً، </span>"</span> + name')
page=page.replace('    <span class="fn">print</span>(<span class="str">"<span class="ar-code">مرحباً، </span>"</span> + name)','<span class="fn">print</span>(message)')
page=page.replace("scale:2.35,opacity:0,duration:.6,ease:'power2.out'","scale:2.35,opacity:0,duration:.6,ease:'power2.out',immediateRender:false")
page=page.replace("scale:2.3,opacity:0,duration:.5,ease:'power2.out'","scale:2.3,opacity:0,duration:.5,ease:'power2.out',immediateRender:false")
page=page.replace("scale:1.8,opacity:0,duration:.65,ease:'power2.out'","scale:1.8,opacity:0,duration:.65,ease:'power2.out',immediateRender:false")
(root/'index.html').write_text(page,encoding='utf-8')
print('Built 14-second Arabic Kodax composition')
