import { getTitleById } from '../data/defaultData.js';

export function VerifyBadge({ show }) {
  if (!show) return null;
  return <span className="verify-badge" title="Tài khoản đã xác minh">✓</span>;
}

export function PremiumBadge({ show }) {
  if (!show) return null;
  return <span className="premium-badge">PREMIUM</span>;
}

export function LevelBadge({ level }) {
  return <span className={`level-badge level-tone-${Math.min(7, Math.max(1, Math.ceil((level || 1) / 10)))}`}>Cấp {level || 1}</span>;
}

export function TitleBadge() {
  return null;
}
