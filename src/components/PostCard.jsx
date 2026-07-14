import { Edit3, Gift, Heart, MessageCircle, MoreHorizontal, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { supabase } from '../lib/supabase.js';
import { formatRelativeTime, getProfileName, normalizeError } from '../lib/helpers.js';
import Avatar from './Avatar.jsx';
import CommentThread from './CommentThread.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import Modal from './Modal.jsx';
import PremiumBadge from './PremiumBadge.jsx';
import TeacherBadge from './TeacherBadge.jsx';

export default function PostCard({ post, onChanged, onGift }) {
  const { currentUser, toast } = useApp();
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editContent, setEditContent] = useState(post.content || '');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const author = post.profiles || {};
  const canManage = currentUser?.id === post.author_id || currentUser?.role === 'admin';

  async function toggleLike() {
    try {
      if (post.liked_by_me) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: currentUser.id,
          });

        if (error) throw error;
      }

      await onChanged?.();
    } catch (error) {
      toast(normalizeError(error), 'error');
    }
  }

  async function addComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;

    try {
      setBusy(true);

      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          user_id: currentUser.id,
          content: comment.trim(),
          parent_id: null,
          status: 'visible',
        });

      if (error) throw error;

      setComment('');
      toast('Đã thêm bình luận.');
      await onChanged?.();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(event) {
    event.preventDefault();

    try {
      setBusy(true);

      const { error } = await supabase
        .from('posts')
        .update({
          title: editTitle.trim() || null,
          content: editContent.trim(),
        })
        .eq('id', post.id);

      if (error) throw error;

      toast('Đã cập nhật bài viết.');
      setEditing(false);
      await onChanged?.();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    try {
      setBusy(true);

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast('Đã xóa bài viết.');
      setDeleteOpen(false);
      await onChanged?.();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <article id={`post-${post.id}`} className="post-card botanical-card post-card--enhanced-comments">
      <header className="post-card__header">
        <Link className="profile-avatar-link-v70" to={`/profile/${post.author_id}`}>
          <Avatar profile={author} size={46} />
        </Link>

        <div className="post-card__identity">
          <div className="post-card__name-row-v63">
            <Link className="profile-name-link-v70" to={`/profile/${post.author_id}`}>
              <strong>{getProfileName(author)}</strong>
            </Link>
            <PremiumBadge profile={author} compact />
            <TeacherBadge profile={author} compact />
          </div>
          <span>@{author.username || 'user'} · {formatRelativeTime(post.created_at)}</span>
        </div>

        {canManage && (
          <div className="post-card__menu-wrap">
            <button
              className="icon-button"
              type="button"
              onClick={() => setMenu((value) => !value)}
              aria-label="Tùy chọn bài viết"
            >
              <MoreHorizontal size={18} />
            </button>

            {menu && (
              <div className="post-card__menu">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    setMenu(false);
                  }}
                >
                  <Edit3 size={16} /> Sửa bài
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteOpen(true);
                    setMenu(false);
                  }}
                >
                  <Trash2 size={16} /> Xóa bài
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {post.title && <h3 className="post-card__title">{post.title}</h3>}
      <p className="post-card__content">{post.content}</p>

      <div className="post-card__actions">
        <button className={post.liked_by_me ? 'is-active' : ''} type="button" onClick={toggleLike}>
          <Heart size={17} fill={post.liked_by_me ? 'currentColor' : 'none'} />
          {post.like_count || 0}
        </button>

        <span>
          <MessageCircle size={17} />
          {post.comment_count || 0}
        </span>

        <button type="button" onClick={() => onGift?.(post)}>
          <Gift size={17} /> Gửi quà
        </button>
      </div>

      <form className="post-card__comment-form" onSubmit={addComment}>
        <Avatar profile={currentUser} size={32} />
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Viết bình luận..."
          maxLength={1200}
        />
        <button type="submit" disabled={busy || !comment.trim()} aria-label="Gửi bình luận">
          <Send size={16} />
        </button>
      </form>

      <CommentThread
        postId={post.id}
        comments={post.comments || []}
        onChanged={onChanged}
      />

      <Modal open={editing} onClose={() => setEditing(false)} title="Sửa bài viết" width={650}>
        <form className="stack-form" onSubmit={saveEdit}>
          <label>
            Tiêu đề
            <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} />
          </label>

          <label>
            Nội dung
            <textarea
              rows="6"
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
              required
            />
          </label>

          <div className="form-actions form-actions--end">
            <button className="button button--ghost" type="button" onClick={() => setEditing(false)}>
              Hủy
            </button>
            <button className="button" disabled={busy || !editContent.trim()}>
              {busy ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={remove}
        title="Xóa bài viết"
        message="Bài viết và các bình luận liên quan sẽ bị xóa. Bạn có chắc chắn không?"
        confirmLabel="Xóa bài viết"
        danger
        loading={busy}
      />
    </article>
  );
}
