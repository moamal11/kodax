from pathlib import Path
import subprocess, io, json, wave
import numpy as np
from PIL import Image,ImageDraw
import imageio_ffmpeg

root=Path(__file__).parent
ff=imageio_ffmpeg.get_ffmpeg_exe()
ranges={1:[(3.4,4.1),(7.4,8.1),(14.25,14.95)],2:[(1.35,2.05),(3.65,4.35),(8.2,8.9)],3:[(.7,1.4),(3.1,3.8),(12.0,12.7)],4:[(5.7,6.4),(8.5,9.2),(10.0,10.7)],5:[(2.95,3.65),(5.0,5.7),(6.2,6.9)]}
for i,rs in ranges.items():
    folder=root/f'V{i:02}'
    sheet=Image.new('RGB',(1536,1464),'#202024');d=ImageDraw.Draw(sheet)
    for r,(start,end) in enumerate(rs):
        for k,t in enumerate(np.linspace(start,end,8)):
            raw=subprocess.run([ff,'-v','error','-ss',str(t),'-i',str(folder/'source.mp4'),'-frames:v','1','-vf','scale=384:216','-f','image2pipe','-vcodec','png','pipe:1'],capture_output=True,check=True).stdout
            x=k%4*384;y=(r*2+k//4)*244
            sheet.paste(Image.open(io.BytesIO(raw)),(x,y+28));d.text((x+8,y+6),f'V{i:02}  {t:.3f}s',fill='white')
    sheet.save(folder/'transition-details.jpg',quality=94)
    with wave.open(str(folder/'audio.wav')) as w:
        sr=w.getframerate();a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(float)/32768
    hop=160; rms=np.array([np.sqrt(np.mean(a[k:k+hop]**2)) for k in range(0,len(a),hop)])
    peaks=[k for k in range(1,len(rms)-1) if rms[k]>rms[k-1] and rms[k]>=rms[k+1]]
    chosen=[]
    for k in sorted(peaks,key=lambda k:rms[k],reverse=True):
        if all(abs(k-p)>25 for p in chosen): chosen.append(k)
        if len(chosen)>=16:break
    events=[{'time_s':round(k*.01,2),'rms_dbfs':round(float(20*np.log10(rms[k]+1e-10)),2)} for k in sorted(chosen)]
    (folder/'audio-peaks.json').write_text(json.dumps(events,indent=2),encoding='utf-8')
    print(folder.name,json.dumps(events))
