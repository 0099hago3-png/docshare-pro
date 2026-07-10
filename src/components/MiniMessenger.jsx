import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import Avatar from './Avatar.jsx';

export default function MiniMessenger() {
  const { state, currentUser } = useApp();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(state.users.find((u) => u.id !== currentUser?.id)?.id || 'u_teacher');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([
    { from: active, text: 'Bạn cần mình gửi tài liệu nào không?', time: '09:00' },
    { from: 'me', text: 'Mình đang xem tài liệu trên DocShare.', time: '09:10' },
  ]);
  const user = state.users.find((u) => u.id === active) || state.users[0];

  function send() {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { from: 'me', text: text.trim(), time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }]);
    setText('');
  }

  return (
    <>
      <button className="message-fab message-cloud-fab" onClick={() => setOpen(!open)} title="Tin nhắn">💬</button>
      {open && (
        <div className={`mini-messenger ${currentUser?.activePanels?.message || 'panel-skin-default'}`}>
          <div className="mini-messenger-head">
            <button className="mini-user" onClick={() => setOpen(false)}><Avatar user={user} /><span><b>{user.name}</b><small>Đang hoạt động</small></span></button>
            <div><Link to="/messages">Mở rộng</Link><button onClick={() => setOpen(false)}>×</button></div>
          </div>
          <div className="mini-messenger-body">
            {messages.map((msg, index) => <div key={index} className={msg.from === 'me' ? 'mini-bubble me' : 'mini-bubble'}>{msg.text}<small>{msg.time}</small></div>)}
          </div>
          <div className="mini-messenger-send">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Nhập tin nhắn..." />
            <button onClick={send}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
