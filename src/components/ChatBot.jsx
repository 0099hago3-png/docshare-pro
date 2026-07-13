import { Bot, Send, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

const quickAnswers = {
  'Cách đăng tài liệu?': 'Vào mục Đăng tải, điền thông tin, chọn danh mục, ảnh bìa và file đầy đủ rồi bấm Đăng tài liệu.',
  'Mua tài liệu thế nào?': 'Mở trang chi tiết tài liệu, bấm mua và xác nhận. Hệ thống sẽ kiểm tra số credit của bạn.',
  'Premium có gì?': 'Premium có huy hiệu riêng, khung hồ sơ và các quyền lợi được công bố trong trang Ví & Premium.',
};

export default function ChatBot() {
  const { floatingPanel, setFloatingPanel } = useApp();
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Chào bạn, mình có thể hướng dẫn sử dụng DocShare Pro.' }]);
  const [value, setValue] = useState('');
  const open = floatingPanel === 'bot';

  function send(text = value) {
    const question = text.trim();
    if (!question) return;
    setMessages((items) => [...items, { from: 'me', text: question }, { from: 'bot', text: quickAnswers[question] || 'Mình đã ghi nhận câu hỏi. Bạn có thể vào mục Hỗ trợ để gửi yêu cầu chi tiết.' }]);
    setValue('');
  }

  if (!open) return null;
  return (
    <section className="floating-chat botanical-card">
      <header><span><Bot size={19} /> Hỏi đáp DocShare Pro</span><button type="button" onClick={() => setFloatingPanel(null)}><X size={17} /></button></header>
      <div className="floating-chat__quick">{Object.keys(quickAnswers).map((item) => <button key={item} type="button" onClick={() => send(item)}>{item}</button>)}</div>
      <div className="floating-chat__messages">{messages.map((item, index) => <p key={index} className={item.from === 'me' ? 'is-me' : ''}>{item.text}</p>)}</div>
      <form onSubmit={(event) => { event.preventDefault(); send(); }}><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Nhập câu hỏi..." /><button type="submit"><Send size={17} /></button></form>
    </section>
  );
}
