import { Link } from 'react-router-dom';

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export function formatDate(value) {
  if (!value) return '';

  try {
    return new Date(value).toLocaleString('vi-VN');
  } catch {
    return String(value);
  }
}

export function EmptyState({
  icon = '📭',
  title,
  text,
  actionTo,
  actionLabel,
}) {
  return (
    <section className="live-empty-state">
      <div className="live-empty-icon">{icon}</div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {actionTo && actionLabel && (
        <Link className="live-primary-link" to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </section>
  );
}

export function PageHeader({ eyebrow, title, text, children }) {
  return (
    <header className="live-page-header">
      <div>
        {eyebrow && <span className="live-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {text && <p>{text}</p>}
      </div>
      {children && <div className="live-page-actions">{children}</div>}
    </header>
  );
}

export function UserAvatar({ user, size = 'md' }) {
  return (
    <div className={`live-user-avatar ${size}`}>
      {user?.avatarImage ? (
        <img src={user.avatarImage} alt={user.name || 'Avatar'} />
      ) : (
        <span>{user?.name?.charAt(0)?.toUpperCase() || 'D'}</span>
      )}
    </div>
  );
}

export function DocumentCard({ document, author }) {
  return (
    <Link className="live-document-card" to={`/documents/${document.id}`}>
      <div className="live-document-cover">
        {document.coverPreview ? (
          <img src={document.coverPreview} alt={document.title} />
        ) : (
          <span>📘</span>
        )}
        <em>{document.price > 0 ? `${formatNumber(document.price)} credit` : 'Miễn phí'}</em>
      </div>

      <div className="live-document-body">
        <div className="live-card-kicker">
          {document.subject || document.category || 'Tài liệu học tập'}
        </div>
        <h3>{document.title}</h3>
        <p>{document.description || 'Chưa có mô tả.'}</p>

        <div className="live-document-author">
          <UserAvatar user={author} size="sm" />
          <span>
            <b>{author?.name || 'Tác giả DocShare'}</b>
            <small>{author?.school || 'DocShare Pro'}</small>
          </span>
        </div>

        <div className="live-document-stats">
          <span>👁 {formatNumber(document.views)}</span>
          <span>♥ {formatNumber(document.likes)}</span>
          <span>★ {Number(document.rating || 0).toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}
