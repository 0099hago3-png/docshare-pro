import {
  BookOpen, Crown, Download, Eye, Feather, Flame, Flower2, Gem, Heart,
  MessageCircle, Moon, Orbit, Rocket, Satellite, Shield, Sparkles, Sword,
  Users, Waves, Zap,
} from 'lucide-react';
import { getFrameById } from '../data/defaultData.js';

function DragonMark() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true" className="frame-dragon-svg">
      <path d="M61 12c-12 2-18 8-20 18-6-7-14-9-22-5 7 2 12 8 13 15-10-1-19 4-23 13 8-5 16-4 22 2-2 8-8 12-17 14 14 5 27 1 34-10 3 6 3 12 0 18 11-7 15-18 11-29 7-4 11-11 11-19-3 5-7 7-12 8 2-7 3-13 3-19Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="54" cy="26" r="2" fill="currentColor"/>
    </svg>
  );
}

const DECOR = {
  orbit: Orbit,
  rocket: Rocket,
  satellite: Satellite,
  crown: Crown,
  wave: Waves,
  spark: Sparkles,
  blackhole: Orbit,
  book: BookOpen,
  zap: Zap,
  gem: Gem,
  shield: Shield,
  moon: Moon,
  flower: Flower2,
  sword: Sword,
  feather: Feather,
  leaf: Feather,
  heart: Heart,
  eye: Eye,
  download: Download,
  message: MessageCircle,
  users: Users,
  flame: Flame,
};

export default function Avatar({ user, size = 'md', className = '' }) {
  const frame = getFrameById(user?.activeFrame || user?.avatarFrame || 'orbit-basic');
  const cls = size === 'xl' ? 'avatar avatar-xl' : size === 'lg' ? 'avatar avatar-lg' : 'avatar';
  const image = user?.avatarImage?.data;
  const zoom = user?.avatarImage?.zoom || 100;
  const x = user?.avatarImage?.x ?? 50;
  const y = user?.avatarImage?.y ?? 50;
  const decoration = frame?.decoration || 'spark';
  const DecorIcon = DECOR[decoration] || Sparkles;

  return (
    <span
      className={`${cls} avatar-framed ${frame?.className || 'frame-orbit-basic'} ${className}`}
      title={`${frame?.name || 'Khung mặc định'} · ${frame?.requirement || ''}`}
      data-frame={frame?.id}
      data-effect={frame?.effect || 'static'}
      data-tier={frame?.tier || 1}
    >
      <span className="avatar-frame-aura" />
      <span className="avatar-frame-wing wing-left" />
      <span className="avatar-frame-wing wing-right" />
      <span className="avatar-frame-ring" />
      <span className="avatar-frame-scan" />
      <span className="avatar-frame-orbit orbit-a" />
      <span className="avatar-frame-orbit orbit-b" />
      <span className="avatar-frame-particle particle-1" />
      <span className="avatar-frame-particle particle-2" />
      <span className="avatar-frame-particle particle-3" />
      <span className="avatar-frame-particle particle-4" />
      <span className="avatar-frame-base" />
      <span className={`avatar-frame-decoration decoration-${decoration}`}>
        {decoration === 'dragon' ? <DragonMark/> : <DecorIcon size="100%" strokeWidth={1.8}/>} 
      </span>
      {image ? (
        <span
          className="avatar-photo"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: `${zoom}%`,
            backgroundPosition: `${x}% ${y}%`,
          }}
        />
      ) : (
        <span className="avatar-letter">{user?.avatar || user?.name?.charAt(0) || 'U'}</span>
      )}
    </span>
  );
}
