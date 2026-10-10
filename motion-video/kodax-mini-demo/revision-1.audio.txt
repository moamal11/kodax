from pathlib import Path
import numpy as np, wave, json
root=Path(__file__).parent
sr=48000; duration=14; rng=np.random.default_rng(20261010)
mix=np.zeros((sr*duration,2),dtype=np.float64); cues=[]
def put(signal,start,gain=.1,pan=0,name='cue'):
    k=int(start*sr);n=min(len(signal),len(mix)-k)
    if n<=0:return
    gains=np.array([np.cos((pan+1)*np.pi/4),np.sin((pan+1)*np.pi/4)])
    mix[k:k+n]+=signal[:n,None]*gain*gains
    cues.append({'time_s':start,'duration_s':len(signal)/sr,'name':name})
def tone(freq,sec=.35):
    t=np.arange(int(sec*sr))/sr
    return (np.sin(2*np.pi*freq*t)+.24*np.sin(4*np.pi*freq*t))*np.exp(-t*8)*np.minimum(t/.008,1)
def whoosh(sec=.5):
    t=np.arange(int(sec*sr))/sr; noise=rng.standard_normal(len(t))
    smooth=np.convolve(noise,np.ones(13)/13,mode='same')
    return smooth*np.sin(np.pi*t/sec)**2
def click(sec=.075):
    t=np.arange(int(sec*sr))/sr
    return (np.sin(2*np.pi*(1800*t-4000*t*t))+.2*rng.standard_normal(len(t)))*np.exp(-t*80)
# A quiet original C-major/add9 plucked bed. No reference music is sampled.
freqs=[261.63,392,329.63,587.33,523.25,392,329.63,293.66]
for j,start in enumerate(np.arange(.12,13.5,.56)):
    put(tone(freqs[j%len(freqs)],.65),float(start),.023,(-.25 if j%2 else .25),'original pluck')
for start in [.1,4.6,9.1]:
    t=np.arange(int(4.4*sr))/sr
    pad=sum(np.sin(2*np.pi*f*t) for f in [130.81,164.81,196])/3
    env=np.minimum(t/.6,1)*np.minimum((4.4-t)/.8,1)
    put(pad*env,start,.015,0,'soft harmonic bed')
for start in [1.77,5.13,6.32]: put(click(),start,.10,0,'tap')
for start in np.arange(3.07,5.02,.13):put(click(.038),float(start),.018,-.2,'typing tick')
for start in [2.15,6.65,11.25]:put(whoosh(.58),start,.16,0,'transition swish')
for start,fs in [(5.3,[523.25,659.25]),(8.13,[659.25,783.99]),(9.28,[587.33,783.99]),(11.66,[523.25,659.25,783.99])]:
    for j,f in enumerate(fs):put(tone(f,.4),start+j*.075,.055,0,'success / reaction ping')
# Soft synthesized low pulses emphasize opening/publish without booming.
for start in [1.87,6.9]:
    t=np.arange(int(.34*sr))/sr;phase=2*np.pi*(90*t-65*t*t)
    put(np.sin(phase)*np.exp(-t*15),start,.09,0,'soft low pulse')
fade=np.minimum(np.arange(len(mix))/(sr*.15),1)*np.minimum((len(mix)-np.arange(len(mix)))/(sr*.7),1)
mix*=fade[:,None]
mix=np.tanh(mix*1.5)
peak=np.max(np.abs(mix))
mix*=.65/peak
pcm=(mix*32767).astype('<i2')
with wave.open(str(root/'assets/soundtrack.wav'),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes(pcm.tobytes())
(root/'sound-cues.json').write_text(json.dumps(cues,indent=2),encoding='utf-8')
print('Generated original 14-second stereo music and synchronized sound effects; peak',round(float(20*np.log10(np.max(np.abs(mix)))),2),'dBFS')
