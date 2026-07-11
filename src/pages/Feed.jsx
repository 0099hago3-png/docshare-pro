import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, Bell, Bookmark, Edit3, Flag, Flame, Gift, Home, Link2, MessageCircle, MoreHorizontal, Save, Send, ShieldAlert, Sparkles, Trash2, UsersRound, WalletCards, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';
import { LevelBadge, PremiumBadge, TitleBadge, VerifyBadge } from '../components/Badges.jsx';
import ReportModal from '../components/ReportModal.jsx';
import DonateModal from '../components/DonateModal.jsx';
import BookCover from '../components/BookCover.jsx';

const hotTopics = [
  { label:'Python', keywords:['python'] },
  { label:'PostgreSQL', keywords:['postgresql','sql','supabase'] },
  { label:'Học thuật', keywords:['học','tài liệu','đề cương','giáo trình'] },
  { label:'AI · Machine Learning', keywords:['ai','machine learning'] },
  { label:'Web Development', keywords:['react','vite','web','node'] },
];

function Comment({ postId, comment }) {
  const {
    currentUser, getUser, replyComment, reactComment,
    editPostComment, deletePostComment, reportPostComment, showToast,
  } = useApp();
  const [reply, setReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState('Spam / quảng cáo');
  const [otherReason, setOtherReason] = useState('');
  const user = getUser(comment.userId);
  const canManage = currentUser?.id === comment.userId || currentUser?.role === 'admin';

  function submitReport() {
    if (reason === 'Lý do khác' && !otherReason.trim()) {
      showToast('Vui lòng nhập lý do báo cáo.');
      return;
    }
    reportPostComment(postId, comment.id, comment.userId, reason === 'Lý do khác' ? 'other' : reason, otherReason);
    setReportOpen(false);
  }

  return <>
    <div className={`comment-v14 comment-v22 ${user.premium ? 'premium-comment' : ''} ${user.activePanels?.comment || 'panel-skin-default'}`}>
      <Link to={`/users/${user.id}`}><Avatar user={user}/></Link>
      <div className="comment-content-v14">
        <div className="comment-meta-v14"><Link to={`/users/${user.id}`}><b>{user.name}</b></Link><VerifyBadge show={user.verified}/><LevelBadge level={user.level}/><PremiumBadge show={user.premium}/><TitleBadge user={user} compact/></div>
        {editing ? <div className="inline-comment-editor-v22"><input value={editText} onChange={(event) => setEditText(event.target.value)}/><button onClick={() => { if (editPostComment(postId, comment.id, editText)) setEditing(false); }}><Save size={14}/>Lưu</button><button onClick={() => { setEditing(false); setEditText(comment.text); }}><X size={14}/></button></div> : <p>{comment.text}</p>}
        <div className="comment-actions-v14">
          <button onClick={() => reactComment(postId, comment.id)}>♥ {comment.reactions || 0}</button>
          {(comment.replies || []).length > 0 && <button onClick={() => setShowReplies((value) => !value)}>{showReplies ? 'Ẩn trả lời' : `Xem trả lời (${comment.replies.length})`}</button>}
          <button onClick={() => setReply(!reply)}>Trả lời</button>
          {canManage && !editing && <button onClick={() => setEditing(true)}><Edit3 size={13}/>Sửa</button>}
          {canManage && <button className="danger-text" onClick={() => deletePostComment(postId, comment.id)}><Trash2 size={13}/>Xóa</button>}
          {!canManage && <button onClick={() => setReportOpen(true)}><Flag size={13}/>Báo cáo</button>}
        </div>
        {showReplies && (comment.replies || []).map((item) => { const replyUser = getUser(item.userId); return <div className={`reply-v14 ${replyUser.premium ? 'premium-comment' : ''} ${replyUser.activePanels?.comment || 'panel-skin-default'}`} key={item.id}><Link to={`/users/${replyUser.id}`}><Avatar user={replyUser}/></Link><div><span><b>{replyUser.name}</b><VerifyBadge show={replyUser.verified}/><LevelBadge level={replyUser.level}/><PremiumBadge show={replyUser.premium}/><TitleBadge user={replyUser} compact/></span><p>{item.text}</p></div></div>; })}
        {reply && <div className="reply-input-v14"><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Viết phản hồi..."/><button onClick={() => { if (text.trim()) replyComment(postId, comment.id, text.trim()); setText(''); setReply(false); setShowReplies(true); }}>Gửi</button></div>}
      </div>
    </div>
    {reportOpen && <div className="modal-backdrop" onMouseDown={() => setReportOpen(false)}><div className="modal-card report-modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><h3>🚩 Báo cáo bình luận</h3><button onClick={() => setReportOpen(false)}>×</button></div><div className="reason-grid">{['Spam / quảng cáo','Lừa đảo','Ngôn từ xúc phạm','Nội dung phản cảm','Thông tin sai lệch','Lý do khác'].map((item) => <button key={item} className={reason === item ? 'active' : ''} onClick={() => setReason(item)}>{item}</button>)}</div>{reason === 'Lý do khác' && <textarea value={otherReason} onChange={(event) => setOtherReason(event.target.value)} placeholder="Nhập lý do chi tiết..."/>}<div className="modal-actions"><button className="btn ghost" onClick={() => setReportOpen(false)}>Hủy</button><button className="btn primary" onClick={submitReport}>Gửi báo cáo</button></div></div></div>}
  </>;
}

function PostCard({ post }) {
  const { state, getUser, toggleLikePost, toggleFollow, addComment, toggleSavePost } = useApp();
  const [commentText, setCommentText] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const author = getUser(post.authorId);
  const doc = state.documents.find((item) => item.id === post.documentId);
  const liked = state.likes.posts.includes(post.id);
  const postTitle = (post.title || '').trim();
  const following = state.follows.includes(author.id);
  const saved = (state.savedPosts || []).includes(post.id);

  return (
    <article className="social-post-v14">
      <div className="social-post-head-v14">
        <Link to={`/users/${author.id}`}><Avatar user={author} size="lg"/></Link>
        <div><div><Link to={`/users/${author.id}`}><b>{author.name}</b></Link><VerifyBadge show={author.verified}/><PremiumBadge show={author.premium}/><LevelBadge level={author.level}/><TitleBadge user={author} compact/></div><small>@{author.id.replace('u_','')} · {post.createdAt} · Công khai</small></div>
        <button className="follow-pill-v14" onClick={() => toggleFollow(author.id)}>{following ? '✓ Đang theo dõi' : '+ Theo dõi'}</button>
        <button className={`post-save-v19 ${saved ? 'saved' : ''}`} onClick={() => toggleSavePost(post.id)} title={saved ? 'Bỏ lưu' : 'Lưu bài viết'}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'}/></button>
        <button className="post-more-v14"><MoreHorizontal size={18}/></button>
        <button className="post-flag-v14" onClick={() => setReportOpen(true)}>⚑</button>
      </div>
      {postTitle ? <h2 className="post-knowledge-title post-knowledge-title-v30">{postTitle}</h2> : null}
      <p className="post-copy-v14">{post.content}</p>
      {doc && <Link to={`/documents/${doc.id}`} className="shared-document-v14 shared-document-v25"><BookCover doc={doc} size="mini"/><div><b>{doc.title}</b><p>{doc.type} · Tài liệu học thuật</p></div><em>→</em></Link>}
      <div className="post-social-v14">
        <button className={liked ? 'liked' : ''} onClick={() => toggleLikePost(post.id)}>♥ <b>{post.likes}</b></button>
        <button><MessageCircle size={17}/> <b>{post.comments.length}</b></button>
        <button className="donate-button-v14 donate-button-v39" onClick={() => setDonateOpen(true)}><Gift size={16}/>Gửi quà tặng</button>
      </div>
      <div className="post-comments-v14">
        <div className="comments-title-v14"><b><MessageCircle size={16}/> Bình luận ({post.comments.length})</b><select><option>Mới nhất</option><option>Phù hợp nhất</option></select></div>
        {post.comments.map((comment) => <Comment key={comment.id} postId={post.id} comment={comment}/>) }
        <div className="comment-compose-v14"><Avatar user={getUser(state.currentUserId)}/><input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Viết bình luận..."/><button onClick={() => { if(commentText.trim()) addComment(post.id,commentText.trim()); setCommentText(''); }}><Send size={17}/></button></div>
      </div>
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} type="post" targetId={post.id} userId={post.authorId}/>
      <DonateModal open={donateOpen} onClose={() => setDonateOpen(false)} mode="post" targetId={post.id}/>
    </article>
  );
}

export default function Feed() {
  const navigate = useNavigate();
  const { state, currentUser, addPost, markNotification, markAllNotifications } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mode, setMode] = useState('question');
  const [documentId, setDocumentId] = useState('');
  const [feedView, setFeedView] = useState('all');
  const [noticeTab, setNoticeTab] = useState('all');
  const [hotTopic, setHotTopic] = useState('');

  const visiblePosts = useMemo(() => {
    let posts = feedView === 'following'
      ? state.posts.filter((post) => state.follows.includes(post.authorId))
      : feedView === 'suggested'
        ? [...state.posts].sort((a, b) => (b.likes + (b.comments?.length || 0) * 10) - (a.likes + (a.comments?.length || 0) * 10))
        : feedView === 'saved'
          ? state.posts.filter((post) => (state.savedPosts || []).includes(post.id))
          : state.posts;
    if (hotTopic) {
      const topic = hotTopics.find((item) => item.label === hotTopic);
      posts = posts.filter((post) => {
        const doc = state.documents.find((item) => item.id === post.documentId);
        const haystack = `${post.content} ${doc?.title || ''} ${(doc?.tags || []).join(' ')}`.toLowerCase();
        return topic?.keywords.some((word) => haystack.includes(word.toLowerCase()));
      });
    }
    return posts;
  }, [feedView, hotTopic, state.posts, state.follows, state.savedPosts, state.documents]);

  const visibleNotices = state.notifications.filter((notice) => noticeTab === 'unread' ? notice.unread : noticeTab === 'important' ? notice.important : true);

  function openNotice(notice) {
    const to = markNotification(notice.id);
    navigate(to || '/');
  }

  function submit() {
    const prefix = mode === 'question' ? 'Câu hỏi: ' : 'Chia sẻ liên kết: ';
    if (addPost(prefix + content, documentId || null, title)) { setTitle(''); setContent(''); setDocumentId(''); }
  }

  return (
    <div className="feed-shell-v14 page">
      <aside className="feed-left-v14">
        <nav>
          <button className={feedView === 'all' ? 'active' : ''} onClick={() => { setFeedView('all'); setHotTopic(''); }}><Home size={18}/>Bảng tin</button>
          <button className={feedView === 'following' ? 'active' : ''} onClick={() => { setFeedView('following'); setHotTopic(''); }}><UsersRound size={18}/>Đang theo dõi</button>
          <button className={feedView === 'suggested' ? 'active' : ''} onClick={() => { setFeedView('suggested'); setHotTopic(''); }}><Sparkles size={18}/>Đề xuất cho bạn</button>
          <button className={feedView === 'saved' ? 'active' : ''} onClick={() => { setFeedView('saved'); setHotTopic(''); }}><Bookmark size={18}/>Bài viết đã lưu</button>
        </nav>
        <section className="hot-topic-panel-v19"><div><h3><Flame size={18}/>Chủ đề đang hot</h3><button onClick={() => { setFeedView('all'); setHotTopic(''); }}>Xem tất cả</button></div>{hotTopics.map((topic,index) => <button className={hotTopic === topic.label ? 'active' : ''} key={topic.label} onClick={() => { setFeedView('all'); setHotTopic(topic.label); }}><span>#{topic.label}</span><small>{1250-index*157} bài viết</small></button>)}</section>
        <section><div><h3>Đang theo dõi</h3><button onClick={() => setFeedView('following')}>Xem tất cả</button></div>{state.users.slice(1,7).map((user) => <Link key={user.id} to={`/users/${user.id}`}><Avatar user={user}/><span><b>{user.name}</b><small>@{user.id.replace('u_','')}</small></span><VerifyBadge show={user.verified}/></Link>)}</section>
      </aside>

      <main className="feed-center-v14">
        <section className="composer-v14">
          <Avatar user={currentUser} size="lg"/>
          <div className="composer-box-v14">
            <div className="composer-tabs-v14"><button className={mode === 'question' ? 'active' : ''} onClick={() => setMode('question')}><MessageCircle size={16}/>Đặt câu hỏi</button><button className={mode === 'link' ? 'active' : ''} onClick={() => setMode('link')}><Link2 size={16}/>Chia sẻ liên kết</button></div>
            <input className="composer-title-v21" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={mode === 'question' ? 'Tiêu đề câu hỏi rõ ràng, giàu kiến thức...' : 'Tiêu đề bài chia sẻ nổi bật...'}/>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={mode === 'question' ? 'Trình bày bối cảnh, điều bạn đã thử và nội dung cần cộng đồng hỗ trợ...' : 'Chia sẻ kiến thức, kinh nghiệm hoặc liên kết hữu ích...'}/>
            <div className="composer-tools-v14"><div><button title="Thêm biểu tượng"><Sparkles size={16}/></button><button title="Đính kèm"><Bookmark size={16}/></button></div><select value={documentId} onChange={(e) => setDocumentId(e.target.value)}><option value="">Không đính kèm tài liệu</option>{state.documents.map((doc) => <option key={doc.id} value={doc.id}>{doc.title}</option>)}</select><button className="publish-v14" onClick={submit}>Đăng bài</button></div>
          </div>
        </section>
        {hotTopic && <section className="active-topic-v19"><span>Đang xem chủ đề <b>#{hotTopic}</b></span><button onClick={() => setHotTopic('')}>× Bỏ lọc</button></section>}
        {visiblePosts.map((post) => <PostCard key={post.id} post={post}/>) }
        {!visiblePosts.length && <section className="panel-universe empty-feed"><Bookmark size={34}/><h3>{feedView === 'saved' ? 'Bạn chưa lưu bài viết nào' : 'Chưa có bài viết trong mục này'}</h3><p>{feedView === 'saved' ? 'Bấm biểu tượng lưu ở góc bài viết để thêm vào danh sách này.' : 'Chọn chủ đề khác hoặc quay lại Bảng tin.'}</p>{feedView === 'saved' && <button className="space-btn primary" onClick={() => setFeedView('all')}>Khám phá bảng tin</button>}</section>}
      </main>

      <aside className="feed-right-v14">
        <section className="notification-card-v14"><div className="notification-title-v14"><h2>Thông báo</h2><button onClick={markAllNotifications}>Đánh dấu đã đọc</button></div><div className="notification-tabs-v14"><button className={noticeTab === 'all' ? 'active' : ''} onClick={() => setNoticeTab('all')}>Tất cả <em>{state.notifications.length}</em></button><button className={noticeTab === 'unread' ? 'active' : ''} onClick={() => setNoticeTab('unread')}>Chưa đọc <em>{state.notifications.filter((n) => n.unread).length}</em></button><button className={noticeTab === 'important' ? 'active' : ''} onClick={() => setNoticeTab('important')}>Quan trọng</button></div><div className="notification-scroll-v14 custom-scroll">{visibleNotices.map((notice,index) => <button key={notice.id} className={notice.unread ? 'unread' : ''} onClick={() => openNotice(notice)}><span>{notice.kind === 'wallet' ? <WalletCards size={19}/> : notice.kind === 'report' ? <ShieldAlert size={19}/> : notice.kind === 'frame' ? <Award size={19}/> : notice.kind === 'like' ? <Sparkles size={19}/> : <Bell size={19}/>}</span><div><b>{notice.title}</b><p>{notice.text}</p><small>{notice.date || `${index + 2} phút trước`}</small></div></button>)}{!visibleNotices.length && <p className="empty-search">Không có thông báo trong mục này.</p>}</div></section>
      </aside>
    </div>
  );
}
