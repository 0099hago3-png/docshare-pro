import { useNavigate, Link } from 'react-router-dom';
import { Bookmark, Eye, Heart, Star, Lock, ArrowRight, Download } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from './Avatar.jsx';
import BookCover from './BookCover.jsx';
import { PremiumBadge, VerifyBadge } from './Badges.jsx';
import { formatNumber } from '../utils/helpers.js';

export default function DocumentCard({ doc, compact = false, rank }) {
  const navigate = useNavigate();
  const { state, getUser, toggleLikeDocument, toggleSaveDocument, addHistory, canAccessDocument } = useApp();
  const author = getUser(doc.authorId);
  const liked = state.likes.documents.includes(doc.id);
  const saved = (state.savedDocuments || []).includes(doc.id);
  const canAccess = canAccessDocument(doc);
  const price = Number(doc.price || 0);
  const isPaid = price > 0;

  function openDocument() {
    addHistory({ type: 'view', targetId: doc.id, title: `Đã xem ${doc.title}` });
    navigate(`/documents/${doc.id}`);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDocument();
    }
  }

  return (
    <article className={`doc-poster-card-v34 ${compact ? 'compact' : ''}`} role="link" tabIndex={0} onClick={openDocument} onKeyDown={handleKeyDown}>
      {rank ? <span className={`doc-rank-badge rank-${rank}`}>#{rank}</span> : null}

      <div className="doc-poster-cover-zone-v34">
        <BookCover doc={doc} size="card" className="doc-poster-cover-v34" />
        <div className="doc-poster-badges-v34">
          <span className="doc-poster-type-v34">{doc.type}</span>
          <span className={`doc-poster-price-v34 ${isPaid ? 'paid' : 'free'}`}>
            {isPaid ? <><Lock size={12} /> {formatNumber(price)} credit</> : 'Miễn phí'}
          </span>
        </div>
      </div>

      <div className="doc-poster-info-v34">
        <h3>{doc.title}</h3>

        <Link className="doc-poster-author-v34" to={`/users/${author.id}`} onClick={(event) => event.stopPropagation()}>
          <Avatar user={author} />
          <span className="doc-poster-author-copy-v34">
            <b>
              <span>{author.name}</span>
              <VerifyBadge show={author.verified} />
              <PremiumBadge show={author.premium} />
            </b>
            <small>{doc.school || 'DocShare Library'}</small>
          </span>
        </Link>

        <div className="doc-poster-stats-v34">
          <span><Eye size={14} /> {formatNumber(doc.views)}</span>
          <span><Heart size={14} /> {formatNumber(doc.likes)}</span>
          <span><Download size={14} /> {formatNumber(doc.downloads)}</span>
          <span><Star size={14} /> {doc.rating}</span>
        </div>

        <div className="doc-poster-access-v34">
          {isPaid ? (
            canAccess ? <span className="owned">Đã sở hữu · xem toàn bộ</span> : <span className="locked">Cần {formatNumber(price)} credit để mở toàn bộ</span>
          ) : (
            <span className="free">Xem trước toàn bộ</span>
          )}
        </div>

        <div className="doc-poster-actions-v34">
          <button
            className={liked ? 'liked' : ''}
            onClick={(event) => {
              event.stopPropagation();
              toggleLikeDocument(doc.id);
            }}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            <b>{formatNumber(doc.likes)}</b>
          </button>

          <button
            className={saved ? 'saved' : ''}
            onClick={(event) => {
              event.stopPropagation();
              toggleSaveDocument(doc.id);
            }}
            aria-label={saved ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
            title={saved ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
          >
            <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
          </button>

          <button
            className="open-doc-btn-v34"
            onClick={(event) => {
              event.stopPropagation();
              openDocument();
            }}
          >
            Xem <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
