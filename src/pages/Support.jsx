import { HelpCircle, LifeBuoy, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import BotanicalHero from '../components/BotanicalHero.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatDateTime, normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

export default function Support() {
  const { currentUser, toast } = useApp();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [tickets, setTickets] = useState([]);
  const [busy, setBusy] = useState(false);

  async function load() { const { data } = await supabase.from('support_tickets').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }); setTickets(data || []); }
  useEffect(() => { load(); }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      setBusy(true);
      const { error } = await supabase.from('support_tickets').insert({ user_id: currentUser.id, subject: subject.trim(), content: content.trim(), priority, status: 'open' });
      if (error) throw error;
      setSubject(''); setContent(''); setPriority('normal'); toast('Đã gửi yêu cầu hỗ trợ.'); await load();
    } catch (error) { toast(normalizeError(error), 'error'); } finally { setBusy(false); }
  }

  return <div className="page"><BotanicalHero compact eyebrow="ĐỒNG HÀNH CÙNG BẠN" title="Trung tâm hỗ trợ" description="Gửi vấn đề cần hỗ trợ và theo dõi trạng thái xử lý ngay trên website." /><div className="support-layout"><form className="support-form botanical-card" onSubmit={submit}><h2><LifeBuoy size={22} /> Gửi yêu cầu</h2><label>Chủ đề<input value={subject} onChange={(event) => setSubject(event.target.value)} required /></label><label>Mức ưu tiên<select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="low">Thấp</option><option value="normal">Bình thường</option><option value="high">Cao</option></select></label><label>Nội dung<textarea rows="8" value={content} onChange={(event) => setContent(event.target.value)} required /></label><button className="button button--wide" disabled={busy}><Send size={17} /> {busy ? 'Đang gửi...' : 'Gửi yêu cầu'}</button></form><section className="support-list botanical-card"><h2><HelpCircle size={22} /> Yêu cầu của bạn</h2>{tickets.length ? tickets.map((item) => <article key={item.id}><div><strong>{item.subject}</strong><small>{formatDateTime(item.created_at)}</small></div><span className={`status status--${item.status}`}>{item.status}</span><p>{item.content}</p></article>) : <EmptyState title="Chưa có yêu cầu hỗ trợ" />}</section></div></div>;
}
