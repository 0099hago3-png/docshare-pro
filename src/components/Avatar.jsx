import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getInitials,
  getProfileName,
  publicAssetUrl,
} from '../lib/helpers.js';
import { isPremiumActive } from './PremiumBadge.jsx';

function getAvatarSource(profile) {
  return (
    profile?.avatar_url
    || profile?.avatarUrl
    || profile?.photo_url
    || profile?.photoURL
    || profile?.picture
    || (
      profile?.avatar_path
        ? publicAssetUrl('avatars', profile.avatar_path)
        : ''
    )
  );
}

export default function Avatar({
  profile,
  size = 42,
  className = '',
}) {
  const name = getProfileName(profile);
  const initials = useMemo(
    () => getInitials(name),
    [name],
  );

  const source = useMemo(
    () => getAvatarSource(profile),
    [profile],
  );

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [source]);

  const premium = isPremiumActive(profile);
  const teacher = profile?.role === 'teacher';
  const showImage = Boolean(source) && !imageFailed;

  return (
    <span
      className={[
        'avatar',
        premium ? 'avatar--premium-v63' : '',
        teacher ? 'avatar--teacher-v70' : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, size * 0.34),
      }}
      title={premium ? `${name} · Premium` : name}
      aria-label={name}
    >
      {showImage ? (
        <img
          className="avatar__image-v66"
          src={source}
          alt={name}
          loading="lazy"
          draggable="false"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="avatar__initials-v66" aria-hidden="true">
          {initials}
        </span>
      )}

      {teacher && (
        <i
          className="avatar__teacher-v70"
          aria-label="Giảng viên"
          title="Tài khoản giảng viên"
        >
          🎓
        </i>
      )}

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
