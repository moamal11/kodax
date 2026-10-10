"""Extract real release motion evidence; no generated animation or test overlays."""
import sys,subprocess
from pathlib import Path
import imageio_ffmpeg
from PIL import Image,ImageDraw
root=Path('reports/android-release-20261009');mode=sys.argv[1]
frames=root/('xp-'+mode+'-frames');frames.mkdir(exist_ok=True)
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error','-y','-i',str(root/('xp-'+mode+'.mp4')),'-vf','fps=8,scale=216:-1',str(frames/'%03d.jpg')],check=True)
files=list(sorted(frames.glob('*.jpg')))
# UI Automator takes a few seconds before the tap; inspect the completion interval.
offset=64;selected=files[offset:offset+64];canvas=Image.new('RGB',(216*8,408*8),'#101017');draw=ImageDraw.Draw(canvas)
for i,p in enumerate(selected):
    im=Image.open(p);x=(i%8)*216;y=(i//8)*408
    canvas.paste(im,(x,y+22));draw.text((x+8,y+3),f'{(offset+i)/8:.3f}s',fill='white')
canvas.save(root/('xp-'+mode+'-contact.jpg'),quality=95)
print('Motion contact saved:',mode,'frames:',len(files))
