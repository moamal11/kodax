from pathlib import Path
import urllib.request, csv, json, wave
import numpy as np
import onnxruntime as ort

root=Path(__file__).parent
cache=Path.home()/'.cache'/'motion-reference-models'
cache.mkdir(parents=True,exist_ok=True)
for name in ['yamnet.onnx','yamnet_class_map.csv','LICENSE']:
    p=cache/name
    if not p.exists():
        urllib.request.urlretrieve('https://huggingface.co/audiomagic/yamnet-onnx/resolve/f25b741c2f0bdc6d7e6db24b5fddda23347dbafd/'+name,p)
labels=[x['display_name'] for x in csv.DictReader((cache/'yamnet_class_map.csv').open(encoding='utf-8'))]
options=ort.SessionOptions(); options.intra_op_num_threads=4
model=ort.InferenceSession(str(cache/'yamnet.onnx'),options,providers=['CPUExecutionProvider'])
all_results=[]
for i in range(1,6):
    folder=root/f'V{i:02}'
    with wave.open(str(folder/'audio.wav')) as w:
        a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
    scores=model.run(None,{'waveform':a})[0]
    mean=scores.mean(axis=0)
    result={'id':folder.name,'method':'YAMNet ONNX automated inference; not direct listening; class scores are not calibrated probabilities','top_mean_classes':[{'class':labels[k],'score':round(float(mean[k]),4)} for k in np.argsort(mean)[-10:][::-1]],'windows':[]}
    for j,row in enumerate(scores):
        result['windows'].append({'start_s':round(j*.48,2),'end_s':round(j*.48+.96,2),'top':[{'class':labels[k],'score':round(float(row[k]),4)} for k in np.argsort(row)[-5:][::-1]]})
    (folder/'audio-classification.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in result.items() if k!='windows'}),flush=True)
    all_results.append(result)

from faster_whisper import WhisperModel
speech_model=WhisperModel('small.en',device='cpu',compute_type='int8',cpu_threads=4,download_root=str(cache/'whisper'))
for i in range(1,6):
    folder=root/f'V{i:02}'
    with wave.open(str(folder/'audio.wav')) as w:
        waveform=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
    segments,info=speech_model.transcribe(waveform,language='en',vad_filter=True,beam_size=3,condition_on_previous_text=False)
    # User asked not to carry reference wording into future work. Keep timings/confidence only.
    result={'method':'Whisper small.en plus VAD; automated speech screening; no transcript retained','vad_speech_duration_s':info.duration_after_vad,'candidate_segments':[{'start_s':round(s.start,2),'end_s':round(s.end,2),'avg_logprob':round(s.avg_logprob,3),'no_speech_prob':round(s.no_speech_prob,3),'character_count':len(s.text)} for s in segments]}
    (folder/'speech-screening.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print(folder.name,json.dumps(result),flush=True)
