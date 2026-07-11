import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Maximize2, MessageCircle, Send, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from './Avatar.jsx';

export default function MiniMessenger() {
  const { state, currentUser } = useApp();
  const [open, setOpen] = useState(false);
  const [active] = useState(state.users.find((u) => u.id !== currentUser?.id)?.id || 'u_teacher');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    { from: active, text: 'Chào bạn, mình vừa cập nhật bộ tài liệu mới. Bạn đang cần hỗ trợ chủ đề nào?', time: '09:00' },
    { from: 'me', text: 'Mình đang tìm tài liệu PostgreSQL và Supabase.', time: '09:10' },
    { from: active, text: 'Mình sẽ gửi bạn tài liệu phù hợp. Bạn có thể xem trước trước khi lưu vào thư viện nhé.', time: '09:11' },
  ]);
  const bodyRef = useRef(null);
  const user = state.users.find((u) => u.id === active) || state.users[0];

  useEffect(() => {
    if (open) window.setTimeout(() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight }), 30);
  }, [open, messages]);

  function send() {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: 'me', text: text.trim(), time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }]);
    setText('');
  }

  return (
    <>
      <button className="message-fab message-cloud-fab messenger-fab-v28" onClick={() => setOpen((value) => !value)} title="Tin nhắn" aria-label="Mở tin nhắn"><MessageCircle size={23}/></button>
      {open && (
        <section className="mini-messenger mini-messenger-v28">
          <header className="mini-messenger-head mini-messenger-head-v28">
            <button className="mini-user" onClick={() => setOpen(false)}><Avatar user={user}/><span><b>{user.name}</b><small><i/>Đang hoạt động</small></span></button>
            <div><Link to="/messages" title="Mở trang tin nhắn"><Maximize2 size={17}/></Link><button onClick={() => setOpen(false)} aria-label="Đóng"><X size={18}/></button></div>
          </header>
          <div className="mini-messenger-body mini-messenger-body-v28 custom-scroll" ref={bodyRef}>
            <div className="chat-date-v28">Hôm nay</div>
            {messages.map((msg, index) => <div key={index} className={msg.from === 'me' ? 'mini-bubble me' : 'mini-bubble'}><p>{msg.text}</p><small>{msg.time}</small></div>)}
          </div>
          <footer className="mini-messenger-send mini-messenger-send-v28">
            <input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && send()} placeholder="Nhập tin nhắn..."/>
            <button onClick={send} aria-label="Gửi"><Send size={18}/></button>
          </footer>
        </section>
      )}
    </>
  );
}
