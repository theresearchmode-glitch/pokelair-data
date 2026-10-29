# Synthesized sound effects placed on the video's cue list. Usage: python3 sfx.py cues.json total_seconds out.wav
import json, sys, wave, numpy as np
SR = 48000
cues = json.load(open(sys.argv[1])); total = float(sys.argv[2]); out = sys.argv[3]
buf = np.zeros(int(SR * (total + 1)))
rng = np.random.default_rng(3)
def env(n, a=0.004, d=0.08):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def tone(f0, f1, dur, d=0.06, vol=0.35):
    n = int(SR * dur); t = np.arange(n) / SR; f = np.linspace(f0, f1, n); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, d=d) * vol
def noise_sweep(dur, up=True, vol=0.22):
    n = int(SR * dur); x = rng.standard_normal(n)
    # simple moving low-pass whose width changes over time = a sweep
    out = np.zeros(n); k = np.linspace(40, 4, n) if up else np.linspace(4, 40, n); acc = 0.0
    for i in range(n): a = 1 / k[i]; acc += a * (x[i] - acc); out[i] = acc
    shape = np.sin(np.linspace(0, np.pi, n)) ** 2
    return out / (np.abs(out).max() + 1e-9) * shape * vol
SND = {
  'send': lambda: tone(520, 980, 0.12, d=0.045, vol=0.30),
  'recv': lambda: np.concatenate([tone(880, 880, 0.07, d=0.03, vol=0.22), tone(1175, 1175, 0.12, d=0.05, vol=0.22)]),
  'type': lambda: tone(1400, 1400, 0.03, d=0.01, vol=0.06),
  'pop':  lambda: tone(700, 1500, 0.1, d=0.04, vol=0.28),
  'whoosh': lambda: noise_sweep(0.55, True, 0.25),
  'out':  lambda: noise_sweep(0.4, False, 0.12),
  'boom': lambda: tone(120, 38, 1.2, d=0.35, vol=0.75) + np.pad(noise_sweep(0.3, False, 0.3), (0, int(SR * 0.9))),
}
for c in cues:
    s = SND[c['k']](); i = int(c['t'] * SR); buf[i:i + len(s)] += s[:len(buf) - i]
buf = np.tanh(buf * 1.2) * 0.9
pcm = (np.stack([buf, buf], 1) * 32767).astype('<i2')
with wave.open(out, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', out, len(cues), 'cues')
