import { Search, Send, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import BotanicalHero from '../components/BotanicalHero.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useUnread } from '../context/UnreadContext.jsx';
import { formatDateTime, getProfileName, normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

export default function Messages() {
  const { currentUser, toast } = useApp();
  const { markMessagesRead, refresh: refreshUnread } = useUnread();
  const [people, setPeople] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const loadPeople = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id,full_name,username,email,avatar_path,school_name,faculty,major').neq('id', currentUser.id).order('full_name').limit(100);
      if (error) throw error;
      setPeople(data || []);
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally { setLoading(false); }
  }, [currentUser.id, toast]);

  const loadMessages = useCallback(async (personId) => {
    if (!personId) return setMessages([]);
    const { data, error } = await supabase.from('direct_messages').select('*').or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${personId}),and(sender_id.eq.${personId},receiver_id.eq.${currentUser.id})`).order('created_at', { ascending: true });
    if (error) return toast(normalizeError(error), 'error');

    setMessages(data || []);

    await markMessagesRead(personId);

    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, [currentUser.id, markMessagesRead, toast]);

  useEffect(() => { loadPeople(); }, [loadPeople]);
  useEffect(() => { if (selected) loadMessages(selected.id); }, [selected, loadMessages]);
  useEffect(() => {
    if (!selected) return undefined;
    const channel = supabase.channel(`dm-${currentUser.id}-${selected.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
      const item = payload.new;
      const belongs = (item.sender_id === currentUser.id && item.receiver_id === selected.id) || (item.sender_id === selected.id && item.receiver_id === currentUser.id);
      if (belongs) {
        setMessages((items) => [...items, item]);

        if (
          item.sender_id === selected.id
          && item.receiver_id === currentUser.id
        ) {
          markMessagesRead(selected.id);
        } else {
          refreshUnread();
        }
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUser.id, markMessagesRead, refreshUnread, selected]);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return people;
    return people.filter((person) => [person.full_name, person.username, person.email, person.school_name, person.faculty, person.major].some((value) => value?.toLowerCase().includes(text)));
  }, [people, query]);

  async function send(event) {
    event.preventDefault();
    if (!selected || !value.trim()) return;
    try {
      setBusy(true);
      const { error } = await supabase.from('direct_messages').insert({ sender_id: currentUser.id, receiver_id: selected.id, content: value.trim() });
      if (error) throw error;
      setValue('');
      await loadMessages(selected.id);
    } catch (error) { toast(normalizeError(error), 'error'); } finally { setBusy(false); }
  }

  if (loading) return <Loading label="Đang tải danh sách người dùng..." />;

  return (
    <div className="page messages-page">
      <BotanicalHero compact eyebrow="KẾT NỐI CỘNG ĐỒNG" title="Tin nhắn" description="Tìm người dùng và trò chuyện trực tiếp như một ứng dụng nhắn tin hiện đại." />
      <div className="messenger-layout botanical-card">
        <aside className="messenger-people"><div className="input-icon"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm người để nhắn tin..." /></div><div className="messenger-people__list">{filtered.map((person) => <button key={person.id} className={selected?.id === person.id ? 'is-active' : ''} type="button" onClick={() => setSelected(person)}><Avatar profile={person} size={44} /><span><strong>{getProfileName(person)}</strong><small>{person.major || person.school_name || `@${person.username}`}</small></span></button>)}</div></aside>
        <section className="messenger-chat">{selected ? <><header><Avatar profile={selected} size={45} /><div><strong>{getProfileName(selected)}</strong><small>@{selected.username} · {selected.school_name || 'DocShare Pro'}</small></div></header><div className="messenger-chat__messages">{messages.length ? messages.map((item) => <div key={item.id} className={item.sender_id === currentUser.id ? 'message-bubble is-me' : 'message-bubble'}><p>{item.content}</p><small>{formatDateTime(item.created_at)}</small></div>) : <EmptyState title="Chưa có tin nhắn" description={`Hãy gửi lời chào tới ${getProfileName(selected)}.`} />}<div ref={endRef} /></div><form onSubmit={send}><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Nhập tin nhắn..." /><button className="button" type="submit" disabled={busy || !value.trim()}><Send size={18} /></button></form></> : <div className="messenger-empty"><UserRound size={48} /><h2>Chọn người để bắt đầu</h2><p>Dùng thanh tìm kiếm bên trái và bấm vào một người dùng.</p></div>}</section>
      </div>
    </div>
  );
}
