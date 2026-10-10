from pathlib import Path
import subprocess, re, json, hashlib, shutil, wave
import numpy as np
from PIL import Image, ImageDraw
import imageio_ffmpeg

ROOT = Path(__file__).parent
FF = imageio_ffmpeg.get_ffmpeg_exe()
NAMES = ['oUZquYDVQBBEse5mfvEgIItFE07EtkW0SDC9pT.mp4', 'o4PCBxfDcQifVLqC4t3ciOrVDBiA2Eq5FgCkIg (1).mp4', 'oYekeS9W8ACvAMMTIfi2vERAqWjZ32LEEoQgDs.mp4', 'o8IjitIA4hKfGeGWCAe6L7A4K9QtU4ZBDBQUII.mp4', 'oY8oBbguEwnFXLyAygkI271tRoDFDFIkEfGEek.mp4', 'o4PCBxfDcQifVLqC4t3ciOrVDBiA2Eq5FgCkIg.mp4']

def run(args):
    return subprocess.run([FF, '-hide_banner', '-y', *args], capture_output=True, check=True)

manifest = []
seen = {}
for i, name in enumerate(NAMES, 1):
    source = Path('C:/Users/moamal/Downloads') / name
    sha = hashlib.sha256(source.read_bytes()).hexdigest()
    info = subprocess.run([FF, '-hide_banner', '-i', str(source)], capture_output=True).stderr.decode('utf-8', 'replace')
    duration_match = re.search(r'Duration: (\d+):(\d+):([\d.]+)', info)
    h, m, s = map(float, duration_match.groups())
    duration = h*3600+m*60+s
    res = re.search(r'Video:.*?, (\d+)x(\d+).*?, ([\d.]+) fps', info)
    entry = {'id': f'V{i:02}', 'source': str(source), 'sha256': sha, 'duration_s': duration, 'width': int(res[1]), 'height': int(res[2]), 'fps': float(res[3])}
    folder = ROOT / entry['id']
    folder.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, folder/'source.mp4')
    if sha in seen:
        entry['identical_to'] = seen[sha]
    else:
        seen[sha] = entry['id']
        (folder/'metadata.txt').write_text(info, encoding='utf-8')
        frames = folder/'frames'
        frames.mkdir(exist_ok=True)
        run(['-i',str(source),'-vf','fps=4,scale=384:216','-q:v','3',str(frames/'%04d.jpg')])
        jpgs = sorted(frames.glob('*.jpg'))
        for page in range((len(jpgs)+23)//24):
            sheet = Image.new('RGB', (384*4, 244*6), '#202024')
            draw = ImageDraw.Draw(sheet)
            for j, p in enumerate(jpgs[page*24:(page+1)*24]):
                x, y = j%4*384, j//4*244
                sheet.paste(Image.open(p), (x,y+28))
                draw.text((x+8,y+6),f'{entry["id"]}  {(page*24+j)/4:.2f}s',fill='white')
            sheet.save(folder/f'contact-{page+1:02}.jpg', quality=92)
        run(['-i',str(source),'-vn','-ac','1','-ar','16000','-c:a','pcm_s16le',str(folder/'audio.wav')])
        with wave.open(str(folder/'audio.wav')) as w:
            sr=w.getframerate()
            a=np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float)/32768
        hop=160
        rms=np.array([np.sqrt(np.mean(a[k:k+hop]**2)) for k in range(0,len(a),hop)])
        peak=float(np.max(np.abs(a)))
        entry['audio']={'sample_rate_analysis':sr,'peak_dbfs':float(20*np.log10(max(peak,1e-10))),'rms_dbfs':float(20*np.log10(max(np.sqrt(np.mean(a*a)),1e-10))),'samples':len(a)}
        (folder/'audio-envelope.json').write_text(json.dumps({'hop_s':0.01,'rms':rms.round(5).tolist()}),encoding='utf-8')
        # Objective image-change curve at 30 fps, used to locate fast transitions.
        raw=run(['-i',str(source),'-an','-vf','scale=64:36','-pix_fmt','rgb24','-f','rawvideo','pipe:1']).stdout
        small=np.frombuffer(raw,dtype=np.uint8).reshape(-1,36,64,3).astype(float)
        diffs=np.mean(np.abs(np.diff(small,axis=0)),axis=(1,2,3))
        entry['largest_frame_changes']=[{'time_s':round((int(k)+1)/30,3),'mean_rgb_change':round(float(diffs[k]),2)} for k in np.argsort(diffs)[-20:][::-1]]
        # Audio spectrogram and waveform; these are measurements, not listening judgments.
        chart=Image.new('RGB',(1400,500),'#111118')
        d=ImageDraw.Draw(chart)
        for x in range(1400):
            k=int(x/1400*len(rms)); v=float(rms[min(k,len(rms)-1)])
            d.line((x,180,x,180-min(155,v*600)),fill='#a78bfa')
        win=512; step=128
        windows=np.lib.stride_tricks.sliding_window_view(a,win)[::step]
        mag=20*np.log10(np.maximum(np.abs(np.fft.rfft(windows*np.hanning(win),axis=1)),1e-6))
        norm=np.clip((mag+65)/90,0,1)
        rgb=np.stack([norm*220,norm*180,norm*255],axis=-1).astype(np.uint8)
        im=Image.fromarray(rgb.transpose(1,0,2)[::-1]).resize((1400,260))
        chart.paste(im,(0,210))
        for t in range(int(duration)+1):
            x=int(t/duration*1400);d.text((x,480),str(t)+'s',fill='white')
        chart.save(folder/'audio-analysis.png')
    manifest.append(entry)
(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(manifest,ensure_ascii=False,indent=2))
