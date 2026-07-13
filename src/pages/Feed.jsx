import { PenLine, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import BotanicalHero from '../components/BotanicalHero.jsx';
import DonateModal from '../components/DonateModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import PostCard from '../components/PostCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

export default function Feed() {
  const { currentUser, toast } = useApp();
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [giftPost, setGiftPost] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('posts').select('*,profiles:author_id(id,full_name,username,email,avatar_path,premium),post_comments(id,content,user_id,created_at,profiles:user_id(id,full_name,username,avatar_path)),post_likes(user_id)').eq('status', 'visible').order('created_at', { ascending: false });
      if (error) throw error;
      setPosts((data || []).map((post) => ({
        ...post,
        comments: post.post_comments || [],
        like_count: post.post_likes?.length || 0,
        comment_count: post.post_comments?.length || 0,
        liked_by_me: post.post_likes?.some((item) => item.user_id === currentUser.id),
      })));
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser.id, toast]);

  useEffect(() => { load(); }, [load]);

  async function createPost(event) {
    event.preventDefault();
    if (!content.trim()) return toast('Hãy nhập nội dung bài viết.', 'error');
    try {
      setBusy(true);
      const { error } = await supabase.from('posts').insert({ author_id: currentUser.id, title: title.trim() || null, content: content.trim(), visibility: 'public', status: 'visible' });
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
    <div className="page feed-page">
      <BotanicalHero compact eyebrow="CỘNG ĐỒNG HỌC THUẬT" title="Bảng tin tri thức" description="Chia sẻ kiến thức, kinh nghiệm học tập và câu chuyện truyền cảm hứng mỗi ngày." />
      <div className="feed-layout">
        <aside className="feed-tabs botanical-card"><button className="is-active" type="button">Tất cả bài viết</button><button type="button">Đang theo dõi</button><button type="button">Bài đã lưu</button></aside>
        <section className="feed-main">
          <form className="post-composer botanical-card" onSubmit={createPost}>
            <Avatar profile={currentUser} size={48} />
            <div className="post-composer__fields"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tiêu đề bài viết (không bắt buộc)" /><textarea rows="4" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Bạn đang nghĩ gì? Chia sẻ kiến thức hoặc kinh nghiệm hữu ích với mọi người..." maxLength={2000} /><div><span>{content.length}/2000</span><button className="button" type="submit" disabled={busy}><PenLine size={17} /> {busy ? 'Đang đăng...' : 'Đăng bài'}</button></div></div>
          </form>
          {loading ? <Loading /> : posts.length ? <div className="feed-list">{posts.map((post) => <PostCard key={post.id} post={post} onChanged={load} onGift={setGiftPost} />)}</div> : <EmptyState title="Chưa có bài viết" description="Hãy chia sẻ bài viết đầu tiên với cộng đồng." />}
        </section>
        <aside className="feed-aside botanical-card"><h3>Gợi ý viết bài</h3><p>Chia sẻ mẹo học tập, kiến thức chuyên ngành hoặc trải nghiệm sử dụng tài liệu.</p><ul><li>Viết tiêu đề ngắn gọn</li><li>Nội dung rõ ràng, tôn trọng cộng đồng</li><li>Không đăng thông tin cá nhân nhạy cảm</li></ul><button className="button button--wide" type="button" onClick={() => document.querySelector('.post-composer textarea')?.focus()}><Send size={17} /> Viết bài ngay</button></aside>
      </div>
      <DonateModal open={Boolean(giftPost)} onClose={() => setGiftPost(null)} receiver={giftPost?.profiles} targetType="post" targetId={giftPost?.id} />
    </div>
  );
}
