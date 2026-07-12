import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import {
  EmptyState,
  PageHeader,
  UserAvatar,
  formatNumber,
} from '../components/LiveUI.jsx';

function PostCard({ post }) {
  const {
    state,
    currentUser,
    getUser,
    toggleLikePost,
    toggleSavePost,
    addComment,
    replyComment,
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState({});

  const author = getUser(post.authorId);
  const document = state.documents.find((item) => item.id === post.documentId);
  const liked = state.likes.posts.includes(post.id);
  const saved = state.savedPosts.includes(post.id);

  return (
    <article className="live-post-card">
      <header className="live-post-head">
        <Link to={`/users/${author.id}`}>
          <UserAvatar user={author} size="lg" />
        </Link>

        <div className="live-post-author">
          <div>
            <Link to={`/users/${author.id}`}><b>{author.name}</b></Link>
            {author.verified && <span className="live-verified">✓</span>}
            {author.premium && <span className="live-premium">Premium</span>}
          </div>
          <small>@{author.username || author.id.slice(0, 8)} · {post.createdAt}</small>
        </div>

        <button
          className={saved ? 'live-icon-button active' : 'live-icon-button'}
          type="button"
          onClick={() => toggleSavePost(post.id)}
          title={saved ? 'Bỏ lưu' : 'Lưu bài viết'}
        >
          🔖
        </button>
      </header>

      {post.title && <h2>{post.title}</h2>}
      <p className="live-post-copy">{post.content}</p>

      {document && (
        <Link className="live-shared-document" to={`/documents/${document.id}`}>
          <div>
            {document.coverPreview ? (
              <img src={document.coverPreview} alt={document.title} />
            ) : (
              <span>📘</span>
            )}
          </div>
          <span>
            <b>{document.title}</b>
            <small>{document.subject || 'Tài liệu học tập'}</small>
          </span>
          <em>→</em>
        </Link>
      )}

      <div className="live-post-actions">
        <button
          type="button"
          className={liked ? 'active' : ''}
          onClick={() => toggleLikePost(post.id)}
        >
          ♥ {formatNumber(post.likes)}
        </button>
        <span>💬 {post.comments.length}</span>
      </div>

      <section className="live-post-comments">
        {post.comments.map((comment) => {
          const user = getUser(comment.userId);

          return (
            <article className="live-feed-comment" key={comment.id}>
              <UserAvatar user={user} size="sm" />
              <div>
                <b>{user.name}</b>
                <p>{comment.text}</p>

                {(comment.replies || []).map((reply) => {
                  const replyUser = getUser(reply.userId);
                  return (
                    <div className="live-feed-reply" key={reply.id}>
                      <b>{replyUser.name}</b>
                      <span>{reply.text}</span>
                    </div>
                  );
                })}

                <div className="live-inline-reply">
                  <input
                    value={replyText[comment.id] || ''}
                    onChange={(event) => setReplyText((previous) => ({
                      ...previous,
                      [comment.id]: event.target.value,
                    }))}
                    placeholder="Trả lời bình luận..."
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const value = (replyText[comment.id] || '').trim();
                      if (!value) return;
                      const ok = await replyComment(post.id, comment.id, value);
                      if (ok) setReplyText((previous) => ({ ...previous, [comment.id]: '' }));
                    }}
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        <div className="live-comment-compose">
          <UserAvatar user={currentUser} size="sm" />
          <input
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="Viết bình luận thật..."
          />
          <button
            type="button"
            onClick={async () => {
              const value = commentText.trim();
              if (!value) return;
              const ok = await addComment(post.id, value);
              if (ok) setCommentText('');
            }}
          >
            Gửi
          </button>
        </div>
      </section>
    </article>
  );
}

export default function Feed() {
  const { state, currentUser, addPost } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [filter, setFilter] = useState('all');
  const [posting, setPosting] = useState(false);

  const posts = useMemo(() => {
    if (filter === 'following') {
      return state.posts.filter((post) => state.follows.includes(post.authorId));
    }

    if (filter === 'saved') {
      return state.posts.filter((post) => state.savedPosts.includes(post.id));
    }

    return state.posts;
  }, [filter, state.follows, state.posts, state.savedPosts]);

  async function submitPost(event) {
    event.preventDefault();
    if (!content.trim()) return;

    setPosting(true);
    const ok = await addPost(content, null, title);
    setPosting(false);

    if (ok) {
      setTitle('');
      setContent('');
    }
  }

  return (
    <div className="live-page live-feed-page">
      <PageHeader
        eyebrow="CỘNG ĐỒNG HỌC THUẬT"
        title="Bảng tin dữ liệu thật"
        text="Bài viết, tim và bình luận được lưu trực tiếp vào Supabase."
      />

      <div className="live-feed-layout">
        <aside className="live-feed-side">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>🏠 Tất cả bài viết</button>
          <button className={filter === 'following' ? 'active' : ''} onClick={() => setFilter('following')}>👥 Đang theo dõi</button>
          <button className={filter === 'saved' ? 'active' : ''} onClick={() => setFilter('saved')}>🔖 Bài đã lưu</button>
        </aside>

        <main className="live-feed-main">
          <form className="live-composer" onSubmit={submitPost}>
            <UserAvatar user={currentUser} size="lg" />
            <div>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Tiêu đề bài viết"
              />
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Chia sẻ câu hỏi, kiến thức hoặc kinh nghiệm học tập..."
                required
              />
              <div className="live-composer-footer live-composer-footer-v42">
                <button className="live-primary-button" type="submit" disabled={posting}>
                  {posting ? 'Đang đăng...' : 'Đăng bài'}
                </button>
              </div>
            </div>
          </form>

          {posts.length ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <EmptyState
              icon="📝"
              title="Chưa có bài viết"
              text="Bảng tin bắt đầu từ số 0. Hãy đăng bài viết đầu tiên."
            />
          )}
        </main>

        <aside className="live-feed-right">
          <section className="live-panel">
            <h3>Thông báo</h3>
            {state.notifications.slice(0, 6).map((notice) => (
              <Link key={notice.id} to={notice.to || '/'}>
                <b>{notice.title}</b>
                <span>{notice.text}</span>
              </Link>
            ))}
            {!state.notifications.length && <p>Chưa có thông báo.</p>}
          </section>
        </aside>
      </div>
    </div>
  );
}
