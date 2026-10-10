"""Discrete designed foley and motion effects. NO music, pad, beat or melody."""
from pathlib import Path
import json, wave, subprocess
import numpy as np

root=Path(__file__).parent
sr=48000;duration=15;rng=np.random.default_rng(14102026)
mix=np.zeros((sr*duration,2));cues=[]
def put(s,start,gain,pan=0,name=''):
    if s.ndim==1:
        s=s[:,None]*np.array([np.cos((pan+1)*np.pi/4),np.sin((pan+1)*np.pi/4)])
    k=round(start*sr);n=min(len(s),len(mix)-k)
    mix[k:k+n]+=s[:n]*gain
    cues.append(dict(time_s=start,duration_s=round(len(s)/sr,3),name=name))
def noise(n):return rng.normal(size=n)
def smooth(x,n):return np.convolve(x,np.ones(n)/n,'same')
def time(sec):return np.arange(round(sec*sr))/sr
def sweep(sec,reverse=False,body=.25):
    t=time(sec);p=t/sec;white=noise(len(t))
    low=smooth(white,65);mid=smooth(white,9)-low;high=white-smooth(white,4)
    q=1-p if reverse else p
    env=np.sin(np.pi*p)**2.1
    airy=(low*(1-q)*3+mid*(.25+q)*1.2+high*q**3*.15)*env
    thud=np.sin(2*np.pi*(64*t-16*t*t))*np.exp(-t*17)*np.minimum(t/.007,1)
    # Stereo side differences and a short delayed tail preserve travel.
    a=airy+thud*body;b=np.roll(airy,round(.006*sr))+thud*body
    stereo=np.stack([a*(1.1-.3*p),b*(.8+.3*p)],axis=1)
    return stereo
def impact(sec=.3):
    t=time(sec);white=noise(len(t));attack=np.minimum(t/.002,1)
    low=np.sin(2*np.pi*(110*t-90*t*t))*np.exp(-t*27)
    texture=(smooth(white,6)-smooth(white,50))*np.exp(-t*60)
    snap=(white-smooth(white,3))*np.exp(-t*240)
    return (low*.65+texture*.6+snap*.12)*attack
def tap():
    t=time(.13);n=noise(len(t));env=np.exp(-t*90)*np.minimum(t/.0007,1)
    # Dry switch down + delayed release; no tuned ping.
    s=(n-smooth(n,7))*.15*env+np.sin(2*np.pi*260*t)*env*.33
    s+=np.roll(smooth(n,5)*np.exp(-t*170)*.11,round(.035*sr))
    return s
def key():
    t=time(.048);n=noise(len(t));s=(n-smooth(n,4))*np.exp(-t*230)*.35
    s+=smooth(n,11)*np.exp(-t*100)*.6
    s*=np.minimum(t/.0006,1)
    return s
def tick(sec=.15):
    t=time(sec);n=noise(len(t))
    # Short inharmonic ceramic texture; not a chord or musical cue.
    s=sum(np.sin(2*np.pi*f*t)*g*np.exp(-t*d) for f,g,d in [(1730,.35,39),(2467,.21,55),(3923,.08,73)])
    return (s+(n-smooth(n,4))*np.exp(-t*110)*.1)*np.minimum(t/.0015,1)

def library(name):
    ffmpeg=root.parent/'tools/node_modules/ffmpeg-static/ffmpeg.exe'
    data=subprocess.run([str(ffmpeg),'-v','error','-i',str(root/'.media/audio/sfx'/name),'-f','f32le','-ac','2','-ar',str(sr),'pipe:1'],capture_output=True,check=True).stdout
    a=np.frombuffer(data,dtype='<f4').reshape(-1,2).astype(float)
    active=np.flatnonzero(np.max(np.abs(a),axis=1)>np.max(np.abs(a))*.008)
    if len(active):a=a[max(0,active[0]-240):min(len(a),active[-1]+480)]
    return a/max(np.max(np.abs(a)),.001)
def retime(a,factor):
    positions=np.arange(0,len(a)-1,factor)
    return np.stack([np.interp(positions,np.arange(len(a)),a[:,k]) for k in range(2)],axis=1)

# Curated bundled effects add an established texture to major handoffs. The
# 5.5-second build and 2.5-second notification chime are intentionally UNUSED.
short_whoosh=library('sfx_001.mp3')
soft_click=library('sfx_003.mp3')
for j,st in enumerate([1.66,5.69,8.36,11.16,13.25]):
    s=retime(short_whoosh,[1,.9,1.1,.84,1.2][j])
    if j in [3,4]:s=s[::-1].copy()
    put(s,st,.16,name='bundled short whoosh, varied direction and speed')
for st in [1.51,4.48,5.53,10.03]:put(soft_click,st,.14,name='bundled quiet UI click')

for start,sec,reverse,gain,body,label in [
    (.1,.72,False,.65,.1,'phone depth reveal'),
    (1.64,.57,False,.9,.18,'launch push through icon'),
    (2.05,.48,True,.48,0,'editor unfurl'),
    (2.85,.62,False,.34,0,'approach code'),
    (4.4,.55,True,.48,0,'camera pull from code'),
    (4.65,.28,False,.32,0,'result strip lift'),
    (5.66,.55,False,.82,.12,'publish control expansion'),
    (6.2,.47,True,.58,0,'post surface formation'),
    (7.4,.34,False,.36,0,'reaction arrives forward'),
    (8.32,.71,False,.8,.1,'approach comment controls'),
    (10.16,.36,True,.5,0,'comment sends outward'),
    (11.14,.58,True,.85,.1,'camera returns from comment'),
    (11.8,.39,False,.75,0,'interface collects'),
    (13.23,.37,True,.76,0,'words collect into logo')]:put(sweep(sec,reverse,body),start,gain,name=label)
for st in [1.51,4.48,5.53,10.03]:put(tap(),st,.62,name='dry mechanical tap')
for st,pan,gain in [(2.15,0,.27),(4.68,-.1,.22),(6.24,0,.33),(7.48,.3,.19),(10.17,-.3,.23),(13.45,0,.35)]:put(impact(),st,gain,pan,'short weighted landing')
for a,b,count in [(2.87,3.33,10),(3.4,3.93,13),(4,4.36,8),(9.1,9.87,12)]:
    for j,st in enumerate(np.linspace(a,b,count)):
        put(key(),float(st),.12+.04*(j%3),(-.12 if j%2 else .12),'keyboard switch')
for st,pan,g in [(6.39,0,.13),(6.57,-.3,.12),(7.52,.3,.27),(10.2,-.3,.26),(12.01,.4,.2),(12.16,0,.24),(12.31,-.4,.2)]:put(tick(),st,g,pan,'short ceramic interface accent')
# Peak limit, not loudness normalization of a continuous music bed.
peak=np.max(np.abs(mix));mix*=.83/max(peak,.001)
pcm=(np.clip(mix,-1,1)*32767).astype('<i2')
with wave.open(str(root/'assets/effects-only.wav'),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes(pcm.tobytes())
(root/'sound-cues.json').write_text(json.dumps({'music':False,'duration_s':15,'cues':cues},indent=2),encoding='utf-8')
print(json.dumps({'effects':len(cues),'music':False,'peak_dbfs':round(float(20*np.log10(np.max(np.abs(mix)))),2),'tail_silent_s':round(15-max(c['time_s']+c['duration_s'] for c in cues),3)}))
