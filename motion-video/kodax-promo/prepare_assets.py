from pathlib import Path
from PIL import Image
import numpy as np
import wave

ROOT = Path(__file__).parent
A = ROOT / 'assets'
A.mkdir(exist_ok=True)
photos = {
    'community': 'photo_5336818331157209007_y.jpg',
    'courses': 'photo_5336818331157209008_y.jpg',
    'editor': 'photo_5336818331157209002_y (1).jpg',
    'challenges': 'photo_5336818331157209009_y.jpg',
    'ranking': 'photo_5336818331157209003_y.jpg',
    'home': 'photo_5336818331157209004_y.jpg',
    'certificate': 'photo_5336818331157209005_y.jpg',
    'assistant': 'photo_5336818331157209006_y.jpg',
}
for name, filename in photos.items():
    im = Image.open(Path('C:/Users/moamal/Downloads') / filename).convert('RGB')
    # Extract only the app viewport; preserve all original UI proportions.
    im.crop((82, 344, 638, 1142)).save(A / f'{name}.jpg', quality=96)
im = Image.open('C:/Users/moamal/myProjects/kodax/assets/icon.png').convert('RGBA')
im.crop((330, 330, 2332, 2332)).resize((600, 600), Image.Resampling.LANCZOS).save(A / 'logo.png')

# Original instrumental: 120 BPM, A minor, warm pads, arpeggios and restrained drums.
sr = 44100
duration = 52
mix = np.zeros((sr * duration, 2), dtype=np.float64)
rng = np.random.default_rng(20261006)
def note(n): return 440 * 2 ** ((n - 69) / 12)
def add(start, signal, volume=1., pan=0.):
    idx = int(start * sr)
    if idx < 0: signal = signal[-idx:]; idx = 0
    length = min(len(signal), len(mix) - idx)
    if length <= 0: return
    signal = signal[:length] * volume
    mix[idx:idx+length, 0] += signal * np.sqrt((1-pan)/2)
    mix[idx:idx+length, 1] += signal * np.sqrt((1+pan)/2)
def tone(midi, dur, kind='pluck'):
    t = np.arange(int(sr*dur)) / sr
    f = note(midi)
    if kind == 'pad':
        signal = (np.sin(2*np.pi*f*t)+.22*np.sin(2*np.pi*f*2*t)+.18*np.sin(2*np.pi*(f*1.002)*t))
        env = np.minimum(t/.28,1) * np.minimum((dur-t)/.6,1)
        return signal * np.maximum(env,0) * .22
    if kind == 'bass':
        return (np.sin(2*np.pi*f*t)+.20*np.sin(2*np.pi*f*2*t)) * (1-np.exp(-t*120)) * np.exp(-t*5)
    return (np.sin(2*np.pi*f*t)+.20*np.sin(2*np.pi*f*2*t)+.08*np.sin(2*np.pi*f*3*t)) * (1-np.exp(-t*200)) * np.exp(-t*8)
chords = [[57,60,64],[53,57,60],[48,52,55],[55,59,62]]
for bar in range(26):
    chord = chords[(bar//2)%4]
    for pitch in chord: add(bar*2, tone(pitch,2.65,'pad'), .16, (pitch-chord[0])/16-.3)
    for step in range(8):
        when = bar*2+step*.25
        pitch = chord[[0,1,2,1,0,2,1,2][step]] + 12
        add(when, tone(pitch,.65), .09 if bar < 3 else .13, .35 if step%2 else -.35)
        add(when+.125, tone(pitch,.4),.025,-.3 if step%2 else .3)
    for beat in range(4):
        when=bar*2+beat*.5
        add(when,tone(chord[0]-24,.48,'bass'),.22)
        t=np.arange(int(sr*.24))/sr
        freq=45+95*np.exp(-t*35)
        kick=np.sin(2*np.pi*np.cumsum(freq)/sr)*np.exp(-t*23)
        if bar >= 2: add(when,kick,.34)
        if beat in (1,3) and bar>=3:
            t=np.arange(int(sr*.15))/sr
            noise=rng.normal(0,1,len(t))
            snare=(noise-np.roll(noise,1))*.2*np.exp(-t*24)+np.sin(2*np.pi*180*t)*.12*np.exp(-t*35)
            add(when,snare,.27)
    if bar >= 2:
        for step in range(8):
            t=np.arange(int(sr*.05))/sr
            noise=rng.normal(0,1,len(t))
            hat=(noise-np.roll(noise,1))*.13*np.exp(-t*80)
            add(bar*2+step*.25,hat,.13 if step%2 else .07,.4)
for boundary in [6,13,19,25,31,38,43,48]:
    t=np.arange(int(sr*.55))/sr
    n=rng.normal(0,1,len(t))
    smooth=np.convolve(n,np.ones(8)/8,mode='same')
    swoosh=(n-smooth)*np.sin(np.pi*t/.55)**2*.04
    add(boundary-.38,swoosh,.65)
    add(boundary+.1,tone(81,.7),.1,-.15)
fade=np.minimum(np.arange(len(mix))/sr/1.,1)*np.minimum((duration-np.arange(len(mix))/sr)/1.5,1)
mix*=np.maximum(fade,0)[:,None]
mix=np.tanh(mix*1.4)
mix*=.85/max(np.abs(mix).max(),.001)
with wave.open(str(A/'kodax-original-music.wav'),'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((mix*32767).astype('<i2').tobytes())
print('Prepared eight screen extracts, brand icon and original 52-second soundtrack.')
