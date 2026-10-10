"""Original motion-synced sound design. No music, rhythm bed, or voiceover."""
from pathlib import Path
import json
import wave
import numpy as np

ROOT = Path(__file__).parent
SR, DURATION = 48000, 52
rng = np.random.default_rng(6100626)
mix = np.zeros((SR * DURATION, 2), dtype=np.float64)
cues = []

def noise(seconds, center=2000, spread=1.0):
    size = int(seconds * SR)
    raw = rng.normal(0, 1, size)
    frequencies = np.fft.rfftfreq(size, 1 / SR)
    weight = np.exp(-.5 * (np.log2(np.maximum(frequencies, 1) / center) / spread) ** 2)
    filtered = np.fft.irfft(np.fft.rfft(raw) * weight, n=size)
    return filtered / max(np.std(filtered), .001)

def envelope(t, attack=.005, decay=18):
    return (1 - np.exp(-t / attack)) * np.exp(-t * decay)

def add(at, signal, level=.2, pan=0., name='effect', tail=True):
    # Small reflections add depth without sustained ambience.
    signal = np.asarray(signal, dtype=np.float64)
    fade = min(len(signal)//2, int(.004*SR))
    if fade:
        signal = signal.copy()
        signal[:fade] *= np.linspace(0, 1, fade)
        signal[-fade:] *= np.linspace(1, 0, fade)
    offset = int(at * SR)
    if offset < 0:
        signal = signal[-offset:]; offset = 0
    n = min(len(signal), len(mix) - offset)
    if n <= 0: return
    pan = np.broadcast_to(np.asarray(pan), len(signal))[:n]
    stereo = signal[:n, None] * np.column_stack((np.sqrt((1-pan)/2), np.sqrt((1+pan)/2)))
    mix[offset:offset+n] += stereo * level
    if tail:
        for delay, gain in [(0.043, .10), (0.081, .055)]:
            pos = offset + int(delay*SR)
            count = min(n, len(mix)-pos)
            if count > 0: mix[pos:pos+count] += stereo[:count, ::-1] * level * gain
    cues.append({'time':round(at,3), 'duration':round(len(signal)/SR,3), 'effect':name})

def tap(at, level=.13, pan=0., style=0, name='UI tap'):
    t=np.arange(int(.16*SR))/SR
    body=np.sin(2*np.pi*(190+45*style)*t)*envelope(t,.0015,45)
    click=noise(.16,2200+300*style,.85)*envelope(t,.0008,105)
    add(at,.5*body+.24*click,level,pan,name)

def whoosh(at, duration=.45, direction=1, level=.11, name='transition whoosh'):
    t=np.arange(int(duration*SR))/SR
    position=t/duration
    air=noise(duration,1600,1.1)
    silk=noise(duration,450,.8)
    shape=np.sin(np.pi*position)**2.3
    low=np.sin(2*np.pi*(130*t-42*t*t/duration))
    sound=(.40*air+.18*silk+.12*low)*shape
    pan=direction*np.linspace(-.65,.65,len(t))
    add(at,sound,level,pan,name)

def impact(at, level=.18, pan=0., name='soft impact', heavier=False):
    dur=.40 if heavier else .25
    t=np.arange(int(dur*SR))/SR
    frequencies=65+110*np.exp(-t*35)
    phase=np.cumsum(frequencies)/SR
    body=np.sin(2*np.pi*phase)*envelope(t,.0007,18 if heavier else 26)
    texture=noise(dur,800,1.15)*envelope(t,.0005,65)
    add(at,.70*body+.13*texture,level,pan,name)

def blip(at, level=.17, pan=0., name='confirmation', falling=False):
    dur=.23
    t=np.arange(int(dur*SR))/SR
    # A short rounded frequency gesture, rather than musical notes.
    f=960-600*t/dur if falling else 540+650*(1-np.exp(-t*22))
    phase=2*np.pi*np.cumsum(f)/SR
    signal=(np.sin(phase)+.10*np.sin(phase*2.04))*envelope(t,.004,22)
    add(at,signal,level,pan,name)

def keypress(at, pan=0., strength=1.):
    t=np.arange(int(.07*SR))/SR
    body=np.sin(2*np.pi*(150+rng.uniform(-25,35))*t)*envelope(t,.0003,100)
    snap=noise(.07,rng.uniform(1600,2900),.7)*envelope(t,.0002,140)
    add(at,.5*body+.35*snap,.10*strength,pan,'keyboard key',tail=False)

# Opening: air movement, logo lock-in, then small code-entry taps.
whoosh(.18,.5,level=.10,name='opening reveal')
impact(.42,.20,name='logo lands')
tap(.73,.12,style=1,name='wordmark locks in')
for at in [1.25,1.45,1.65]: tap(at,.095,-.28,style=1,name='intro code line')

# Transitions match the animation's 0.45-second handoff exactly.
for i, boundary in enumerate([6,13,19,25,31,38,43,48]):
    whoosh(boundary-.45,.46,1 if i%2==0 else -1,
           .10 if boundary==48 else .13)
    impact(boundary+.18,.12 if boundary==48 else .16,name='scene settles')

# Course cards, then the lesson pathway.
for i, at in enumerate([6.48,6.555,6.63,6.705]):
    tap(at,.105,(-.32 if i%2 else .32),i%3,name='course card appears')
whoosh(7.15,.25,level=.07,name='learning path underline')

# Short, uneven mechanical typing groups track each visible code line.
for line in range(6):
    at=14.15+line*.33
    for interval in [0,.065,.115,.195]:
        keypress(at+interval,-.15+line*.04,rng.uniform(.7,1.05))
tap(16.45,.15,name='run code')
blip(16.68,.21,name='code runs successfully')

# Completion and XP: tactile notification, restrained upward sweep and ticks.
blip(20.22,.18,-.25,'challenge complete')
tap(20.80,.16,.25,style=2,name='experience badge pop')
whoosh(20.55,.72,level=.055,name='experience rising')
for i,at in enumerate([20.55,20.94,21.26,21.52,21.74,21.95,22.12,22.26]):
    tap(at,.055+i*.004,.10,style=2,name='experience progress tick')
blip(22.58,.19,name='level progress confirmed')

# Podium columns and trophy reveal.
for at,pan in [(26.0,-.3),(26.12,0),(26.24,.3)]:
    impact(at,.16,pan,'podium rises')
blip(26.84,.15,name='ranking achievement')

# Three different UI gestures distinguish like, comment, and follow.
tap(32.21,.18,-.35,style=1,name='like notification')
blip(33.24,.145,.35,'comment arrives',falling=True)
whoosh(34.20,.20,level=.07,name='follow bubble appears')
blip(34.30,.18,-.25,'new follower')
tap(34.75,.075,-.35,name='heart pulse')

# Assistant: message sends, response arrives, a few fine typing details.
whoosh(39.10,.22,level=.08,name='question sends')
blip(40.05,.13,.3,'assistant response',falling=True)
for at in [40.17,40.24,40.34,40.42]: keypress(at,.2,.65)

# Certificate: drawing swipe and a firm physical seal, with a tiny release click.
whoosh(43.80,.35,level=.08,name='certificate rule draws')
impact(44.50,.29,name='certificate stamp',heavier=True)
tap(44.54,.13,style=1,name='stamp contact')
tap(44.68,.07,style=2,name='stamp releases')

# Finish with one rounded CTA click. Silence during the final reading hold.
tap(48.52,.13,name='closing wordmark')
for at in [48.40,48.455,48.51]: tap(at,.07,style=1,name='closing verb')
impact(49.12,.13,name='call to action lands')
blip(50.12,.12,name='final CTA pulse',falling=True)

# Keep dynamics intact. Peak ceiling is -3 dBFS; there is no continuous bed.
peak=float(np.abs(mix).max())
gain=.707/max(peak,.0001)
mix*=gain
pcm=np.rint(np.clip(mix,-.999,.999)*32767).astype('<i2')
with wave.open(str(ROOT/'assets/kodax-sound-effects.wav'),'wb') as out:
    out.setnchannels(2);out.setsampwidth(2);out.setframerate(SR)
    out.writeframes(pcm.tobytes())
report={'duration':DURATION,'sample_rate':SR,'music':False,
        'peak_dbfs':round(20*np.log10(max(np.abs(mix).max(),1e-12)),2),
        'cues':sorted(cues,key=lambda c:c['time'])}
(ROOT/'sound-effects-cues.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(f"Created {len(cues)} synced sound effects; peak {report['peak_dbfs']} dBFS; no music.")
