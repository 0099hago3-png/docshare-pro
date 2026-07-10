import { useNavigate } from 'react-router-dom';
import { Bookmark, Download, Eye, Heart, Star } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from './Avatar.jsx';
import { PremiumBadge, TitleBadge, VerifyBadge } from './Badges.jsx';
import { formatNumber } from '../utils/helpers.js';

export default function DocumentCard({ doc, compact = false, rank }) {
  const navigate = useNavigate();
  const { state, getUser, toggleLikeDocument, toggleSaveDocument, addHistory } = useApp();
  const author = getUser(doc.authorId);
  const liked = state.likes.documents.includes(doc.id);
  const saved = (state.savedDocuments || []).includes(doc.id);

  function openDocument() {
    addHistory({ type: 'view', targetId: doc.id, title: `Đã xem ${doc.title}` });
    navigate(`/documents/${doc.id}`);
  }

  return (
    <article className={`universe-doc-card ${compact ? 'compact' : ''}`} onClick={openDocument} role="link" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && openDocument()}>
      {rank && <span className={`doc-rank-badge rank-${rank}`}>#{rank}</span>}
      <div className={`universe-doc-cover ${doc.color} ${doc.coverPreview ? 'has-cover-image' : ''}`} style={doc.coverPreview ? { backgroundImage: `linear-gradient(180deg,rgba(2,7,18,.08),rgba(2,7,18,.9)),url(${doc.coverPreview})` } : undefined}>
        <span className="doc-type-pill">{doc.type}</span>
        {!doc.coverPreview && <div className="cover-symbol">{doc.cover}</div>}
        <strong>{doc.title}</strong>
        <small>{doc.subject}</small>
        {doc.price > 0 && <span className="doc-price-pill">{doc.price} credit</span>}
      </div>
      <div className="universe-doc-info">
        <h3>{doc.title}</h3>
        <div className="doc-author-line">
          <Avatar user={author}/>
          <span><b>{author.name}</b><span className="inline-badges"><VerifyBadge show={author.verified}/><PremiumBadge show={author.premium}/><TitleBadge user={author} compact/></span></span>
        </div>
        <div className="doc-metrics">
          <span><Eye size={15}/>{formatNumber(doc.views)}</span>
          <span><Download size={15}/>{formatNumber(doc.downloads)}</span>
          <span><Star size={15}/>{doc.rating}</span>
        </div>
        <div className="doc-card-actions">
          <button className={liked ? 'liked' : ''} onClick={(event) => { event.stopPropagation(); toggleLikeDocument(doc.id); }}><Heart size={18} fill={liked ? 'currentColor' : 'none'}/><b>{formatNumber(doc.likes)}</b></button>
          <button className={saved ? 'saved' : ''} onClick={(event) => { event.stopPropagation(); toggleSaveDocument(doc.id); }} aria-label={saved ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'} title={saved ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'}/></button>
        </div>
      </div>
    </article>
  );
}
