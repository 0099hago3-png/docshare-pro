import { useEffect, useMemo } from 'react';
import { getGiftTier } from '../lib/giftTiers.js';

const PARTICLE_COUNTS = {
  seedling: 14,
  blossom: 20,
  radiant: 26,
  royal: 34,
  legendary: 48,
};

export default function GiftBurst({ gift, senderName, receiverName, onDone }) {
  const tier = useMemo(() => getGiftTier(gift), [gift]);
  const particles = useMemo(() => {
    const count = PARTICLE_COUNTS[tier.key] || 18;

    return Array.from({ length: count }, (_, index) => ({
      id: `${tier.key}-${index}`,
      left: `${(index * 37) % 100}%`,
      delay: `${(index % 9) * 0.09}s`,
      duration: `${1.7 + (index % 7) * 0.16}s`,
      rotate: `${(index * 47) % 360}deg`,
      scale: 0.7 + (index % 5) * 0.13,
    }));
  }, [tier.key]);

  useEffect(() => {
    const timer = window.setTimeout(() => onDone?.(), tier.key === 'legendary' ? 4700 : 3400);
    return () => window.clearTimeout(timer);
  }, [onDone, tier.key]);

  if (!gift) return null;

  return (
    <div className={`gift-burst gift-burst--${tier.key}`} role="status" aria-live="polite">
      <div className="gift-burst__veil" />

      <div className="gift-burst__particles" aria-hidden="true">
        {particles.map((particle, index) => (
          <span
            key={particle.id}
            style={{
              '--particle-left': particle.left,
              '--particle-delay': particle.delay,
              '--particle-duration': particle.duration,
              '--particle-rotate': particle.rotate,
              '--particle-scale': particle.scale,
            }}
          >
            {index % 4 === 0 ? gift.icon || '🎁' : index % 4 === 1 ? '✦' : index % 4 === 2 ? '🍃' : '✨'}
          </span>
        ))}
      </div>

      <div className="gift-burst__card">
        <span className="gift-burst__tier">{tier.label}</span>
        <div className="gift-burst__icon">{gift.icon || '🎁'}</div>
        <strong>{gift.name || 'Quà tặng'}</strong>
        <p>
          <b>{senderName || 'Một thành viên'}</b>
          {' đã tặng quà cho '}
          <b>{receiverName || 'người nhận'}</b>
        </p>
        <small>{tier.description}</small>
      </div>
    </div>
  );
}
