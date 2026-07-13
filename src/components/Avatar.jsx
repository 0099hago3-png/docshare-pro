import { useEffect, useMemo, useState } from 'react';
import '../message-avatar-fix.css';

const SIZE_MAP = {
  xs: 26,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  xxl: 88,
};

function getAvatarSource(user, directSource) {
  return (
    directSource
    || user?.avatar_url
    || user?.avatarUrl
    || user?.avatar
    || user?.photo_url
    || user?.photoURL
    || user?.picture
    || user?.image
    || ''
  );
}

function getDisplayName(user, directName) {
  return (
    directName
    || user?.full_name
    || user?.fullName
    || user?.name
    || user?.username
    || user?.display_name
    || user?.displayName
    || user?.email?.split('@')?.[0]
    || 'Người dùng'
  );
}

function getInitials(name) {
  const words = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return 'U';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0] || ''}${words[words.length - 1][0] || ''}`.toUpperCase();
}

export function Avatar({
  user,
  src,
  name,
  alt,
  size = 'md',
  className = '',
  title,
  onClick,
  premium = false,
  verified = false,
  frame = false,
  style,
  ...rest
}) {
  const avatarSource = useMemo(
    () => getAvatarSource(user, src),
    [user, src]
  );

  const displayName = useMemo(
    () => getDisplayName(user, name),
    [user, name]
  );

  const initials = useMemo(
    () => getInitials(displayName),
    [displayName]
  );

  const pixelSize = typeof size === 'number'
    ? size
    : SIZE_MAP[size] || SIZE_MAP.md;

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarSource]);

  const classes = [
    'ds-avatar',
    premium ? 'is-premium' : '',
    verified ? 'is-verified' : '',
    frame ? 'has-frame' : '',
    onClick ? 'is-clickable' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      title={title || displayName}
      onClick={onClick}
      style={{
        '--ds-avatar-size': `${pixelSize}px`,
        ...style,
      }}
      {...rest}
    >
      {avatarSource && !imageFailed ? (
        <img
          src={avatarSource}
          alt={alt || displayName}
          loading="lazy"
          draggable="false"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="ds-avatar__fallback" aria-hidden="true">
          {initials}
        </span>
      )}

      {verified && (
        <span className="ds-avatar__verified" aria-label="Đã xác minh">
          ✓
        </span>
      )}
    </span>
  );
}

export default Avatar;
