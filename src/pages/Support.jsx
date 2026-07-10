import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Support() {
  const { state, currentUser, patch } = useApp();
  const [ticket, setTicket] = useState({ title: '', content: '' });
  function send() { if (!ticket.title) return; patch((prev) => ({ ...prev, supportTickets: [{ id: 's_' + Date.now(), userId: prev.currentUserId, title: ticket.title, status: 'open', answer: 'Admin sẽ phản hồi sớm.' }, ...prev.supportTickets] })); setTicket({ title: '', content: '' }); }
  return <div className="page support-page"><section className="page-hero"><span className="eyebrow">HỖ TRỢ</span><h1>Trung tâm hỗ trợ</h1><p>Hỏi về tài khoản, nạp credit, rút tiền, báo cáo và đăng tài liệu.</p></section><div className="support-grid"><aside className="panel"><h2>Câu hỏi phổ biến</h2>{['Làm sao đăng tài liệu?', 'Credit dùng để làm gì?', 'Rút tiền thế nào?', 'Báo cáo vi phạm ra sao?', 'Premium có quyền gì?'].map((q) => <button key={q}>{q}</button>)}</aside><main className="panel"><h2>Gửi yêu cầu hỗ trợ</h2><input value={ticket.title} onChange={(e) => setTicket({ ...ticket, title: e.target.value })} placeholder="Tiêu đề" /><textarea value={ticket.content} onChange={(e) => setTicket({ ...ticket, content: e.target.value })} placeholder="Nội dung cần hỗ trợ" /><button className="btn primary" onClick={send}>Gửi yêu cầu</button><h3>Yêu cầu của bạn</h3>{state.supportTickets.filter((t) => t.userId === currentUser.id || currentUser.role === 'admin').map((t) => <div className="ticket" key={t.id}><b>{t.title}</b><span>{t.status}</span><p>{t.answer}</p></div>)}</main></div></div>;
}
