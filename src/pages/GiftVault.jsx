import { Gift, Search, Send, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Avatar from '../components/Avatar.jsx';
import BotanicalHero from '../components/BotanicalHero.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatDateTime, formatNumber, getProfileName, normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

export default function GiftVault() {
  const { currentUser, refreshProfile, toast } = useApp();
  const [gifts, setGifts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [people, setPeople] = useState([]);
  const [query, setQuery] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: giftRows, error }, { data: logs }] = await Promise.all([
        supabase.from('gifts').select('*').eq('active', true).order('sort_order'),
        supabase.from('gift_transactions').select('*,gifts(name,icon),sender:sender_id(id,full_name,username,avatar_path),receiver:receiver_id(id,full_name,username,avatar_path)').or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`).order('created_at', { ascending: false }).limit(50),
      ]);
      if (error) throw error;
      setGifts(giftRows || []);
      setSelected((current) => current || giftRows?.[0] || null);
      setTransactions(logs || []);
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally { setLoading(false); }
  }, [currentUser.id, toast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) return setPeople([]);
      const { data } = await supabase.from('profiles').select('id,full_name,username,email,avatar_path').neq('id', currentUser.id).or(`full_name.ilike.%${query.trim()}%,username.ilike.%${query.trim()}%,email.ilike.%${query.trim()}%`).limit(8);
      setPeople(data || []);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, currentUser.id]);

  async function send() {
    if (!receiver || !selected) return toast('Hãy chọn người nhận và món quà.', 'error');
    try {
      setBusy(true);
      const { data, error } = await supabase.rpc('send_gift', { p_gift_id: selected.id, p_receiver_id: receiver.id, p_target_type: 'profile', p_target_id: receiver.id });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.code === 'INSUFFICIENT_CREDIT' ? 'Bạn không đủ credit để gửi quà.' : 'Không thể gửi quà.');
      toast(`Đã gửi ${selected.name} tới ${getProfileName(receiver)}.`);
      setReceiver(null); setQuery(''); setPeople([]);
      await refreshProfile(); await load();
    } catch (error) { toast(normalizeError(error), 'error'); } finally { setBusy(false); }
  }

  if (loading) return <Loading label="Đang tải kho quà..." />;

  return <div className="page"><BotanicalHero compact eyebrow="TRI ÂN CỘNG ĐỒNG" title="Kho quà DocShare" description="Chọn quà, tìm người nhận và gửi lời cảm ơn bằng credit của bạn." /><div className="gift-page-layout"><section className="gift-send-card botanical-card"><h2><Gift size={23} /> Gửi quà</h2><label>Tìm người nhận<div className="input-icon"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên, username hoặc email..." /></div></label>{people.length > 0 && <div className="people-search-results">{people.map((person) => <button key={person.id} type="button" onClick={() => { setReceiver(person); setPeople([]); setQuery(getProfileName(person)); }}><Avatar profile={person} size={34} /><span><strong>{getProfileName(person)}</strong><small>@{person.username}</small></span></button>)}</div>}{receiver && <div className="selected-person"><Avatar profile={receiver} size={42} /><div><small>Người nhận</small><strong>{getProfileName(receiver)}</strong></div></div>}<div className="gift-grid">{gifts.map((gift) => <button key={gift.id} className={selected?.id === gift.id ? 'gift-option is-active' : 'gift-option'} type="button" onClick={() => setSelected(gift)}><span>{gift.icon}</span><strong>{gift.name}</strong><small>{formatNumber(gift.credit_price)} credit</small></button>)}</div><button className="button button--wide button--large" type="button" onClick={send} disabled={busy || !selected || !receiver}><Send size={18} /> {busy ? 'Đang gửi...' : 'Gửi quà'}</button></section><section className="gift-history botanical-card"><h2><Trophy size={23} /> Lịch sử quà tặng</h2>{transactions.length ? <div className="gift-log-list">{transactions.map((item) => { const sent = item.sender_id === currentUser.id; const person = sent ? item.receiver : item.sender; return <article key={item.id}><span className="gift-log-icon">{item.gifts?.icon || '🎁'}</span><div><strong>{sent ? `Bạn đã gửi ${item.gifts?.name}` : `Bạn nhận được ${item.gifts?.name}`}</strong><p>{sent ? `Tới ${getProfileName(person)}` : `Từ ${getProfileName(person)}`}</p><small>{formatDateTime(item.created_at)}</small></div><b className={sent ? 'negative' : 'positive'}>{sent ? '-' : '+'}{formatNumber(sent ? item.cost_credit : item.receiver_credit)} credit</b></article>; })}</div> : <EmptyState title="Chưa có lịch sử quà" />}</section></div></div>;
}
