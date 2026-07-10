import { useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

function tone(ctx, frequency, start, duration, type = 'sine', volume = 0.08) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

function noise(ctx, start, duration, volume = 0.04, frequency = 360) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = 'lowpass';
  filter.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(start);
}

function playGiftSound(gift) {
  if (!gift?.sound) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime + 0.03;
    const chord = (notes, step = .12, duration = .65, type = 'sine', volume = .05) => notes.forEach((f,i) => tone(ctx,f,now+i*step,duration,type,volume));
    const presets = {
      rocket: () => { chord([180,240,320,480,720],.09,.34,'sawtooth',.045); noise(ctx,now,.65,.025,620); },
      car: () => { tone(ctx,85,now,.55,'sawtooth',.06); tone(ctx,120,now+.35,.55,'sawtooth',.055); tone(ctx,180,now+.7,.4,'square',.035); },
      lion: () => { noise(ctx,now,1.35,.08,260); tone(ctx,92,now,.9,'sawtooth',.09); tone(ctx,68,now+.4,.95,'square',.045); },
      crystal: () => chord([880,1174,1396,1760],.12,.75,'sine',.055),
      crown: () => chord([523,659,784,1046],.14,.8,'triangle',.055),
      castle: () => { chord([196,247,294,392,494,588],.16,1.0,'triangle',.045); tone(ctx,98,now,.9,'sine',.035); },
      dragon: () => { noise(ctx,now,1.6,.085,300); tone(ctx,72,now,.8,'sawtooth',.08); tone(ctx,105,now+.55,1.05,'sawtooth',.07); tone(ctx,58,now+1.0,.8,'square',.04); },
      yacht: () => { chord([220,330,440,660],.18,.9,'sine',.052); noise(ctx,now+.2,1.2,.018,1200); },
      phoenix: () => { chord([220,330,494,740,988],.11,1.05,'sawtooth',.045); noise(ctx,now,.9,.035,900); },
      angel: () => chord([659,784,988,1318,1568],.18,1.2,'sine',.048),
      throne: () => { chord([130,196,262,392,523],.2,1.1,'triangle',.052); tone(ctx,65,now,1.5,'sine',.04); },
      empire: () => { chord([98,147,196,294,392,588,784],.16,1.2,'triangle',.052); noise(ctx,now+.6,.8,.02,700); },
    };
    (presets[gift.sound] || presets.crystal)();
    window.setTimeout(() => ctx.close?.(), 3600);
  } catch {
    // Một số trình duyệt chặn âm thanh tự động; hiệu ứng hình ảnh vẫn hoạt động.
  }
}

export default function GiftEffect() {
  const { state } = useApp();
  const gift = state.lastGiftEffect;

  useEffect(() => {
    if (gift) playGiftSound(gift);
  }, [gift?.time]);

  if (!gift) return null;
  return (
    <div className={`gift-effect-universe ${gift.effect} gift-${gift.id} gift-theme-${gift.theme || 'default'} sound-${gift.sound || 'none'}`} data-gift={gift.id}>
      <div className="gift-scene-back" />
      <div className="gift-nebula" />
      <div className="gift-starfield">{Array.from({length: 22}, (_, index) => <i key={index} style={{ '--i': index }}/>)}</div>
      <div className="gift-ribbon one"/><div className="gift-ribbon two"/>
      <div className="gift-orbit one"/><div className="gift-orbit two"/>
      <div className="gift-visual"><span>{gift.icon}</span><i className="gift-trail"/></div>
      <b>{gift.name}</b>
      <small>Quà tặng đặc biệt từ cộng đồng DocShare</small>
    </div>
  );
}
