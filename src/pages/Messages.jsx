import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';

export default function Messages() {
  const { state, currentUser } = useApp();
  const [active, setActive] = useState('u_teacher');
  const [messages, setMessages] = useState([
    { from: 'u_teacher', text: 'Bạn cần tài liệu PostgreSQL nào thêm không?', time: '09:00' },
    { from: 'me', text: 'Dạ em cần phần RLS Supabase ạ.', time: '09:10' },
  ]);
  const [text, setText] = useState('');
  const user = state.users.find((u) => u.id === active);
  function send() { if (!text.trim()) return; setMessages([...messages, { from: 'me', text, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }]); setText(''); }
  return <div className="page messages-page"><aside className="panel message-list"><h2>Tin nhắn</h2>{state.users.filter((u) => u.id !== currentUser.id).map((u) => <button className={active === u.id ? 'active' : ''} onClick={() => setActive(u.id)} key={u.id}><Avatar user={u} /> <span>{u.name}</span></button>)}</aside><main className={`panel message-room ${currentUser?.activePanels?.message || 'panel-skin-default'}`}><div className="message-room-head"><Avatar user={user} /><div><h2>Đang chat với {user.name}</h2><p>Hoạt động gần đây</p></div></div><div className="message-bubbles">{messages.map((msg, i) => <div key={i} className={`${msg.from === 'me' ? 'bubble me' : 'bubble'} ${currentUser?.activePanels?.message || 'panel-skin-default'}`}><p>{msg.text}</p><small>{msg.time}</small></div>)}</div><div className="message-send"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Nhập tin nhắn..." /><button onClick={send}>Gửi</button></div></main></div>;
}
