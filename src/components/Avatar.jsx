import {
  getInitials,
  getProfileName,
  publicAssetUrl,
} from '../lib/helpers.js';
import { isPremiumActive } from './PremiumBadge.jsx';

export default function Avatar({
  profile,
  size = 42,
  className = '',
}) {
  const name = getProfileName(profile);
  const url = profile?.avatar_path
    ? publicAssetUrl('avatars', profile.avatar_path)
    : '';

  const premium = isPremiumActive(profile);

  return (
    <span
      className={[
        'avatar',
        premium ? 'avatar--premium-v63' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, size * 0.34),
      }}
      title={premium ? `${name} · Premium` : name}
    >
      {url
        ? <img src={url} alt={name} />
        : getInitials(name)}

      {premium && (
        <i
          className="avatar__premium-crown-v63"
          aria-label="Premium"
        >
          ♛
        </i>
      )}
    </span>
  );
}
