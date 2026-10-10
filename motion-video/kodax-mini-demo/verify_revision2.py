from pathlib import Path
import json,subprocess
import numpy as np
from PIL import Image,ImageDraw
root=Path(__file__).parent;tools=root.parent/'tools/node_modules'
ff=tools/'ffmpeg-static/ffmpeg.exe';fp=tools/'ffprobe-static/bin/win32/x64/ffprobe.exe'
movie=root/'Kodax-Motion-V2-15s.mp4';out=root/'verified-v2';out.mkdir(exist_ok=True)
meta=json.loads(subprocess.run([str(fp),'-v','error','-show_streams','-show_format','-of','json',str(movie)],capture_output=True,text=True,check=True).stdout)
video=next(s for s in meta['streams'] if s['codec_type']=='video');audio=next(s for s in meta['streams'] if s['codec_type']=='audio')
assert video['width']==1920 and video['height']==1080 and video['r_frame_rate']=='60/1'
assert abs(float(meta['format']['duration'])-15)<.05
times=[.55,1.52,1.85,2.3,3.5,4.8,5.9,6.7,7.75,8.7,9.9,10.6,11.5,12.8,13.6,14.5]
sheet=Image.new('RGB',(1920,1200),'#111116');draw=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
    path=out/f'frame-{i:02}-{t}.png'
    subprocess.run([str(ff),'-v','error','-y','-ss',str(t),'-i',str(movie),'-frames:v','1','-vf','scale=480:270',str(path)],check=True)
    x=(i%4)*480;y=(i//4)*300
    sheet.paste(Image.open(path),(x,y+27));draw.text((x+12,y+7),f'{t:.2f}s',fill='white')
sheet.save(out/'final-contact.jpg',quality=92)
data=subprocess.run([str(ff),'-v','error','-i',str(movie),'-vn','-f','f32le','-ac','2','-ar','48000','pipe:1'],capture_output=True,check=True).stdout
pcm=np.frombuffer(data,dtype='<f4').reshape(-1,2)
metrics={'file':movie.name,'duration_s':float(meta['format']['duration']),'size_mb':round(movie.stat().st_size/1e6,2),'width':video['width'],'height':video['height'],'fps':video['r_frame_rate'],'video_codec':video['codec_name'],'audio_codec':audio['codec_name'],'audio_channels':audio['channels'],'audio_peak_dbfs':round(float(20*np.log10(max(np.max(np.abs(pcm)),1e-10))),2),'tail_rms_dbfs':round(float(20*np.log10(max(np.sqrt(np.mean(pcm[-48000:]**2)),1e-10))),2),'direct_listening':False,'music_in_composition':False}
(out/'verification.json').write_text(json.dumps(metrics,indent=2),encoding='utf-8')
print(json.dumps(metrics))
