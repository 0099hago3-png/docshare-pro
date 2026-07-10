import { BookOpen } from 'lucide-react';
import { getFrameById } from '../data/defaultData.js';

export default function Avatar({ user, size = 'md', className = '' }) {
  const frame = getFrameById(user?.activeFrame || user?.avatarFrame || 'orbit-basic');
  const cls = size === 'xl' ? 'avatar avatar-xl' : size === 'lg' ? 'avatar avatar-lg' : 'avatar';
  const image = user?.avatarImage?.data;
  const zoom = user?.avatarImage?.zoom || 100;
  const x = user?.avatarImage?.x ?? 50;
  const y = user?.avatarImage?.y ?? 50;
  const tier = frame?.tier || 1;

  return (
    <span
      className={`${cls} avatar-framed frame-elegant frame-tier-${Math.min(8, tier)} ${className}`}
      title={`${frame?.name || 'Khung mặc định'} · ${frame?.requirement || 'Mặc định'}`}
      data-frame={frame?.id || 'orbit-basic'}
      data-tier={tier}
    >
      <span className="avatar-frame-ring" />
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
      {tier >= 5 && <span className="avatar-frame-medallion"><BookOpen size={10}/></span>}
    </span>
  );
}
