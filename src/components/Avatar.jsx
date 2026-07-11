import { BookOpen, Crown, Leaf, ShieldCheck } from 'lucide-react';
import { getFrameById } from '../data/defaultData.js';

export default function Avatar({ user, size = 'md', className = '' }) {
  const frame = getFrameById(user?.activeFrame || user?.avatarFrame || 'frame-classic');
  const cls = size === 'xl' ? 'avatar avatar-xl' : size === 'lg' ? 'avatar avatar-lg' : 'avatar';
  const image = user?.avatarImage?.data;
  const zoom = user?.avatarImage?.zoom || 100;
  const x = user?.avatarImage?.x ?? 50;
  const y = user?.avatarImage?.y ?? 50;
  const tier = frame?.tier || 1;
  const DecorIcon = frame?.id === 'frame-spring-laurel' ? Leaf : frame?.id === 'frame-autumn-gold' ? Crown : frame?.id === 'frame-curator' ? ShieldCheck : BookOpen;

  return (
    <span
      className={`${cls} avatar-framed frame-academic ${frame?.className || 'frame-classic'} frame-tier-${Math.min(6, tier)} ${className}`}
      title={`${frame?.name || 'Khung mặc định'} · ${frame?.requirement || 'Mặc định'}`}
      data-frame={frame?.id || 'frame-classic'}
      data-tier={tier}
    >
      <span className="avatar-frame-ring" />
      <span className="avatar-frame-corner corner-a"/><span className="avatar-frame-corner corner-b"/>
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
      {tier >= 3 && <span className="avatar-frame-medallion"><DecorIcon size={10}/></span>}
    </span>
  );
}
