import { PenLine, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import BotanicalHero from '../components/BotanicalHero.jsx';
import DonateModal from '../components/DonateModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import GiftBurst from '../components/GiftBurst.jsx';
import Loading from '../components/Loading.jsx';
import PostCard from '../components/PostCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { getProfileName, normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';
import '../comment-gift-system.css';

export default function Feed() {
  const [searchParams] = useSearchParams();
  const { currentUser, toast } = useApp();
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [giftPost, setGiftPost] = useState(null);
  const [giftEffect, setGiftEffect] = useState(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);

      const { data: postRows, error: postError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(
            id,
            full_name,
            username,
            email,
            avatar_path,
            premium,
            premium_expires_at,
            verified
          ),
          post_likes(user_id)
        `)
        .eq('status', 'visible')
        .order('created_at', { ascending: false })
        .limit(50);

      if (postError) throw postError;

      const postIds = (postRows || []).map((post) => post.id);
      let commentRows = [];

      if (postIds.length) {
        const { data, error } = await supabase
          .from('post_comments')
          .select(`
            *,
            profiles:user_id(
              id,
              full_name,
              username,
              email,
              avatar_path,
              premium,
              verified
            ),
            post_comment_reactions(
              user_id,
              reaction
            )
          `)
          .in('post_id', postIds)
          .eq('status', 'visible')
          .order('created_at', { ascending: true });

        if (error) throw error;
        commentRows = data || [];
      }

      const commentIds = commentRows.map((comment) => comment.id);
      let commentGiftRows = [];

      if (commentIds.length) {
        const { data, error } = await supabase
          .from('gift_transactions')
          .select(`
            id,
            gift_id,
            sender_id,
            receiver_id,
            target_type,
            target_id,
            cost_credit,
            receiver_credit,
            created_at,
            gifts(
              id,
              name,
              icon,
              credit_price
            ),
            sender:sender_id(
              id,
              full_name,
              username,
              avatar_path
            ),
            receiver:receiver_id(
              id,
              full_name,
              username,
              avatar_path
            )
          `)
          .eq('target_type', 'post_comment')
          .in('target_id', commentIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        commentGiftRows = data || [];
      }

      const giftsByComment = new Map();

      commentGiftRows.forEach((giftLog) => {
        const existing = giftsByComment.get(giftLog.target_id) || [];
        existing.push(giftLog);
        giftsByComment.set(giftLog.target_id, existing);
      });

      const commentsByPost = new Map();

      commentRows.forEach((comment) => {
        const reactions = comment.post_comment_reactions || [];
        const normalizedComment = {
          ...comment,
          like_count: reactions.length,
          liked_by_me: reactions.some((item) => item.user_id === currentUser.id),
          gifts: giftsByComment.get(comment.id) || [],
        };

        const existing = commentsByPost.get(comment.post_id) || [];
        existing.push(normalizedComment);
        commentsByPost.set(comment.post_id, existing);
      });

      setPosts((postRows || []).map((post) => {
        const comments = commentsByPost.get(post.id) || [];

        return {
          ...post,
          comments,
          like_count: post.post_likes?.length || 0,
          comment_count: comments.length,
          liked_by_me: post.post_likes?.some((item) => item.user_id === currentUser.id),
        };
      }));
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [currentUser.id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loading || !posts.length) return;

    const commentId = searchParams.get('comment');
    const postId = searchParams.get('post');
    const elementId = commentId
      ? `comment-${commentId}`
      : postId
        ? `post-${postId}`
        : null;

    if (!elementId) return;

    const timer = window.setTimeout(() => {
      const element = document.getElementById(elementId);

      if (!element) return;

      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      element.classList.add('notification-target-v63');

      window.setTimeout(() => {
        element.classList.remove('notification-target-v63');
      }, 2600);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [loading, posts, searchParams]);

  async function createPost(event) {
    event.preventDefault();

    if (!content.trim()) {
      toast('Hãy nhập nội dung bài viết.', 'error');
      return;
    }

    try {
      setBusy(true);

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: currentUser.id,
          title: title.trim() || null,
          content: content.trim(),
          visibility: 'public',
          status: 'visible',
        });

      if (error) throw error;

      setTitle('');
      setContent('');
      toast('Đăng bài thành công.');
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page feed-page feed-page--advanced-comments">
      <BotanicalHero
        compact
        eyebrow="CỘNG ĐỒNG HỌC THUẬT"
        title="Bảng tin tri thức"
        description="Chia sẻ kiến thức, kinh nghiệm học tập và câu chuyện truyền cảm hứng mỗi ngày."
      />

      <div className="feed-layout">
        <aside className="feed-tabs botanical-card">
          <button className="is-active" type="button">Tất cả bài viết</button>
          <button type="button">Đang theo dõi</button>
          <button type="button">Bài đã lưu</button>
        </aside>

        <section className="feed-main">
          <form className="post-composer botanical-card" onSubmit={createPost}>
            <Avatar profile={currentUser} size={48} />

            <div className="post-composer__fields">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Tiêu đề bài viết (không bắt buộc)"
              />

              <textarea
                rows="4"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Bạn đang nghĩ gì? Chia sẻ kiến thức hoặc kinh nghiệm hữu ích với mọi người..."
                maxLength={2000}
              />

              <div>
                <span>{content.length}/2000</span>
                <button className="button" type="submit" disabled={busy || !content.trim()}>
                  <PenLine size={17} /> {busy ? 'Đang đăng...' : 'Đăng bài'}
                </button>
              </div>
            </div>
          </form>

          {loading ? (
            <Loading />
          ) : posts.length ? (
            <div className="feed-list">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onChanged={() => load({ silent: true })}
                  onGift={setGiftPost}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Chưa có bài viết"
              description="Hãy chia sẻ bài viết đầu tiên với cộng đồng."
            />
          )}
        </section>

        <aside className="feed-aside botanical-card">
          <h3>Gợi ý viết bài</h3>
          <p>Chia sẻ mẹo học tập, kiến thức chuyên ngành hoặc trải nghiệm sử dụng tài liệu.</p>
          <ul>
            <li>Viết tiêu đề ngắn gọn</li>
            <li>Nội dung rõ ràng, tôn trọng cộng đồng</li>
            <li>Không đăng thông tin cá nhân nhạy cảm</li>
          </ul>
          <button
            className="button button--wide"
            type="button"
            onClick={() => document.querySelector('.post-composer textarea')?.focus()}
          >
            <Send size={17} /> Viết bài ngay
          </button>
        </aside>
      </div>

      <DonateModal
        open={Boolean(giftPost)}
        onClose={() => setGiftPost(null)}
        receiver={giftPost?.profiles}
        targetType="post"
        targetId={giftPost?.id}
        onSent={(gift) => {
          setGiftEffect({
            gift,
            receiverName: getProfileName(giftPost?.profiles),
          });
          load({ silent: true });
        }}
      />

      {giftEffect && (
        <GiftBurst
          gift={giftEffect.gift}
          senderName={getProfileName(currentUser)}
          receiverName={giftEffect.receiverName}
          onDone={() => setGiftEffect(null)}
        />
      )}
    </div>
  );
}
