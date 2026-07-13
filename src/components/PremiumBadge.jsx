import { Crown, Sparkles } from 'lucide-react';

export function isPremiumActive(profile) {
  if (!profile?.premium) return false;

  if (!profile?.premium_expires_at) return true;

  const expiresAt = new Date(profile.premium_expires_at).getTime();

  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export default function PremiumBadge({
  profile,
  compact = false,
  showText = true,
  className = '',
}) {
  if (!isPremiumActive(profile)) return null;

  return (
    <span
      className={[
        'premium-badge-v63',
        compact ? 'is-compact' : '',
        className,
      ].filter(Boolean).join(' ')}
      title="Tài khoản Premium"
    >
      <span className="premium-badge-v63__shine" aria-hidden="true" />
      <Crown size={compact ? 12 : 14} />
      {showText && <strong>Premium</strong>}
      <Sparkles
        className="premium-badge-v63__sparkle"
        size={compact ? 9 : 10}
      />
    </span>
  );
}
