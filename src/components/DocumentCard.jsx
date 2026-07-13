import { Bookmark, Eye, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatNumber, publicAssetUrl } from '../lib/helpers.js';

export default function DocumentCard({ document, onBookmark }) {
  const cover = document?.cover_path ? publicAssetUrl('document-covers', document.cover_path) : '/assets/default-cover.svg';
  const author = document?.profiles?.full_name || document?.profiles?.username || 'Tác giả';
  const category = document?.categories?.name || 'Học thuật';
  const stats = document?.document_stats || document?.stats || {};

  return (
    <article className="document-card botanical-card">
      <Link className="document-card__cover" to={`/documents/${document.id}`}>
        <img src={cover} alt={document.title} />
        <span className="document-card__badge">{document.price_credit > 0 ? `${document.price_credit} credit` : 'Miễn phí'}</span>
      </Link>
      <div className="document-card__body">
        <span className="document-card__category">{category}</span>
        <Link to={`/documents/${document.id}`}><h3>{document.title}</h3></Link>
        <p className="document-card__author">{author}</p>
        <div className="document-card__stats">
          <span><Eye size={14} /> {formatNumber(stats.view_count || 0)}</span>
          <span><Heart size={14} /> {formatNumber(stats.like_count || 0)}</span>
          <span><Star size={14} /> {Number(stats.average_rating || 0).toFixed(1)}</span>
        </div>
        <div className="document-card__actions">
          <Link className="button button--small button--outline" to={`/documents/${document.id}`}>Xem chi tiết</Link>
          {onBookmark && <button className="icon-button" type="button" onClick={() => onBookmark(document)} title="Lưu tài liệu"><Bookmark size={17} /></button>}
        </div>
      </div>
    </article>
  );
}
