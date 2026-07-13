import { Maximize2, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { supabase } from '../lib/supabase.js';
import { getProfileName } from '../lib/helpers.js';

export default function MiniMessenger() {
  const { floatingPanel, setFloatingPanel, currentUser } = useApp();
  const [people, setPeople] = useState([]);
  const [selected, setSelected] = useState(null);
  const [value, setValue] = useState('');
  const navigate = useNavigate();
  const open = floatingPanel === 'messages';

  useEffect(() => {
    if (!open || !currentUser) return;
    supabase.from('profiles').select('id,full_name,username,email,avatar_path').neq('id', currentUser.id).limit(8).then(({ data }) => {
      setPeople(data || []);
      if (!selected && data?.[0]) setSelected(data[0]);
    });
  }, [open, currentUser, selected]);

  async function send(event) {
    event.preventDefault();
    if (!selected || !value.trim()) return;
    await supabase.from('direct_messages').insert({ sender_id: currentUser.id, receiver_id: selected.id, content: value.trim() });
    setValue('');
  }

  if (!open) return null;
  return (
    <section className="mini-messenger botanical-card">
      <header><span><MessageCircle size={18} /> {selected ? getProfileName(selected) : 'Tin nhắn'}</span><div><button type="button" onClick={() => navigate('/messages')}><Maximize2 size={16} /></button><button type="button" onClick={() => setFloatingPanel(null)}><X size={16} /></button></div></header>
      <div className="mini-messenger__people">{people.map((person) => <button key={person.id} type="button" className={selected?.id === person.id ? 'is-active' : ''} onClick={() => setSelected(person)}>{getProfileName(person)}</button>)}</div>
      <div className="mini-messenger__empty">{selected ? `Nhắn tin với ${getProfileName(selected)}` : 'Chọn một người để nhắn tin'}</div>
      <form onSubmit={send}><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Nhập tin nhắn..." /><button type="submit"><Send size={17} /></button></form>
    </section>
  );
}
