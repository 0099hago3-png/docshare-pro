import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  EmptyState,
  UserAvatar,
  formatNumber,
} from '../components/LiveUI.jsx';

export default function DocumentDetail() {
  const { id } = useParams();
  const viewedRef = useRef(false);

  const {
    state,
    currentUser,
    getUser,
    toggleLikeDocument,
    toggleSaveDocument,
    canAccessDocument,
    recordDocumentView,
    purchaseDocument,
    getDocumentDownloadUrl,
    addDocumentComment,
    reactDocumentComment,
    replyDocumentComment,
  } = useApp();

  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const document = state.documents.find((item) => item.id === id);
  const author = document ? getUser(document.authorId) : null;
  const comments = state.documentComments[id] || [];
  const liked = state.likes.documents.includes(id);
  const saved = state.savedDocuments.includes(id);
  const hasAccess = canAccessDocument(document, currentUser);

  const relatedDocuments = useMemo(() => (
    state.documents
      .filter((item) => item.id !== id)
      .filter((item) => (
        item.categoryId === document?.categoryId
        || item.subject === document?.subject
      ))
      .slice(0, 4)
  ), [document, id, state.documents]);

  useEffect(() => {
    if (!document || viewedRef.current) return;
    viewedRef.current = true;
    recordDocumentView(document.id);
  }, [document, recordDocumentView]);

  if (!document) {
    return (
      <div className="live-page">
        <EmptyState
          icon="📄"
          title="Không tìm thấy tài liệu"
          text="Tài liệu có thể đã bị xóa hoặc bạn không có quyền xem."
          actionTo="/documents"
          actionLabel="Quay lại thư viện"
        />
      </div>
    );
  }

  async function handlePurchase() {
    const accepted = window.confirm(
      `Bạn có chắc muốn mua “${document.title}” với ${formatNumber(document.price)} credit không?`,
    );

    if (!accepted) return;
    await purchaseDocument(document.id);
  }

  async function handleOpenFile(kind) {
    const url = await getDocumentDownloadUrl(document.id, kind);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    const ok = await addDocumentComment(document.id, comment, rating);
    setSubmitting(false);

    if (ok) {
      setComment('');
      setRating(5);
    }
  }

  return (
    <div className="live-page live-document-detail">
      <div className="live-breadcrumb">
        <Link to="/documents">Tài liệu</Link>
        <span>›</span>
        <span>{document.title}</span>
      </div>

      <section className="live-detail-hero">
        <div className="live-detail-cover">
          {document.coverPreview ? (
            <img src={document.coverPreview} alt={document.title} />
          ) : (
            <span>📘</span>
          )}
        </div>

        <div className="live-detail-main">
          <span className="live-eyebrow">{document.subject || document.category || 'TÀI LIỆU HỌC TẬP'}</span>
          <h1>{document.title}</h1>
          <p>{document.description || 'Tác giả chưa thêm mô tả.'}</p>

          <div className="live-author-card">
            <UserAvatar user={author} size="lg" />
            <div>
              <Link to={`/users/${author?.id}`}><b>{author?.name || 'Tác giả DocShare'}</b></Link>
              <small>{author?.school || 'DocShare Pro'} · {author?.major || 'Thành viên'}</small>
            </div>
          </div>

          <div className="live-tag-row">
            {(document.tags || []).map((tag) => <span key={tag}>#{tag}</span>)}
          </div>

          <div className="live-detail-stats">
            <span>👁 {formatNumber(document.views)} lượt xem</span>
            <span>♥ {formatNumber(document.likes)} lượt thích</span>
            <span>★ {Number(document.rating || 0).toFixed(1)} / 5</span>
            <span>💬 {formatNumber(document.comments)} bình luận</span>
          </div>

          <div className="live-detail-actions">
            <button
              type="button"
              className={liked ? 'live-action active' : 'live-action'}
              onClick={() => toggleLikeDocument(document.id)}
            >
              ♥ {liked ? 'Đã thích' : 'Thích'}
            </button>

            <button
              type="button"
              className={saved ? 'live-action active' : 'live-action'}
              onClick={() => toggleSaveDocument(document.id)}
            >
              🔖 {saved ? 'Đã lưu' : 'Lưu tài liệu'}
            </button>
          </div>
        </div>

        <aside className="live-access-card">
          <span className="live-eyebrow">QUYỀN TRUY CẬP</span>
          <h2>{hasAccess ? 'Tài liệu sẵn sàng' : 'Cần mua để xem toàn bộ'}</h2>

          <div className="live-price-line">
            {document.price > 0 ? `${formatNumber(document.price)} credit` : 'Miễn phí'}
          </div>

          {hasAccess ? (
            <button
              className="live-primary-button"
              type="button"
              onClick={() => handleOpenFile('full')}
            >
              Mở / tải file đầy đủ
            </button>
          ) : (
            <button
              className="live-primary-button"
              type="button"
              onClick={handlePurchase}
            >
              Mua tài liệu
            </button>
          )}

          {document.demoFiles?.length > 0 && (
            <button
              className="live-secondary-button"
              type="button"
              onClick={() => handleOpenFile('demo')}
            >
              Xem bản demo
            </button>
          )}

          {!document.fullFiles?.length && (
            <p className="live-note">Tác giả chưa tải file đầy đủ lên Storage.</p>
          )}
        </aside>
      </section>

      <section className="live-comments-section">
        <div className="live-section-title">
          <div>
            <span className="live-eyebrow">ĐÁNH GIÁ THẬT</span>
            <h2>Bình luận và đánh giá</h2>
          </div>
          <b>{comments.length} bình luận</b>
        </div>

        <form className="live-review-form" onSubmit={submitComment}>
          <div className="live-rating-input">
            <span>Đánh giá:</span>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={value <= rating ? 'active' : ''}
                onClick={() => setRating(value)}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Viết nhận xét thật về tài liệu..."
            required
          />

          <button className="live-primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>

        {comments.length ? (
          <div className="live-comment-list">
            {comments.map((item) => {
              const user = getUser(item.userId);

              return (
                <article className="live-comment-card" key={item.id}>
                  <UserAvatar user={user} />
                  <div className="live-comment-main">
                    <div className="live-comment-head">
                      <b>{user.name}</b>
                      <small>{item.createdAt}</small>
                    </div>

                    <p>{item.text}</p>

                    <div className="live-comment-actions">
                      <button type="button" onClick={() => reactDocumentComment(document.id, item.id)}>
                        ♥ {item.reactions || 0}
                      </button>
                    </div>

                    {(item.replies || []).map((reply) => {
                      const replyUser = getUser(reply.userId);

                      return (
                        <div className="live-comment-reply" key={reply.id}>
                          <b>{replyUser.name}</b>
                          <p>{reply.text}</p>
                        </div>
                      );
                    })}

                    <div className="live-inline-reply">
                      <input
                        value={replyText[item.id] || ''}
                        onChange={(event) => setReplyText((previous) => ({
                          ...previous,
                          [item.id]: event.target.value,
                        }))}
                        placeholder="Viết trả lời..."
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const value = (replyText[item.id] || '').trim();
                          if (!value) return;
                          const ok = await replyDocumentComment(document.id, item.id, value);
                          if (ok) setReplyText((previous) => ({ ...previous, [item.id]: '' }));
                        }}
                      >
                        Gửi
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="💬"
            title="Chưa có đánh giá"
            text="Hãy là người đầu tiên bình luận và đánh giá tài liệu này."
          />
        )}
      </section>

      {relatedDocuments.length > 0 && (
        <section className="live-related-section">
          <h2>Tài liệu liên quan</h2>
          <div className="live-related-list">
            {relatedDocuments.map((item) => (
              <Link key={item.id} to={`/documents/${item.id}`}>
                <b>{item.title}</b>
                <span>{item.subject || item.category || 'Tài liệu học tập'}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
