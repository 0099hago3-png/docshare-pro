import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { EmptyState, PageHeader } from '../components/LiveUI.jsx';

export default function Support() {
  const { state, currentUser, createSupportTicket } = useApp();

  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');

  const ownTickets = state.supportTickets.filter((item) => item.userId === currentUser?.id);

  async function submit(event) {
    event.preventDefault();
    const ok = await createSupportTicket(subject, content, priority);
    if (ok) {
      setSubject('');
      setContent('');
      setPriority('normal');
    }
  }

  return (
    <div className="live-page">
      <PageHeader
        eyebrow="TRUNG TÂM HỖ TRỢ"
        title="Gửi yêu cầu hỗ trợ"
        text="Mọi yêu cầu được lưu vào bảng support_tickets."
      />

      <div className="live-support-grid">
        <form className="live-panel" onSubmit={submit}>
          <h2>Tạo yêu cầu mới</h2>

          <label className="live-field">
            <span>Chủ đề</span>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} required />
          </label>

          <label className="live-field">
            <span>Nội dung</span>
            <textarea value={content} onChange={(event) => setContent(event.target.value)} required />
          </label>

          <label className="live-field">
            <span>Mức ưu tiên</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              <option value="low">Thấp</option>
              <option value="normal">Bình thường</option>
              <option value="high">Cao</option>
            </select>
          </label>

          <button className="live-primary-button" type="submit">Gửi yêu cầu</button>
        </form>

        <section className="live-panel">
          <h2>Yêu cầu của bạn</h2>

          {ownTickets.length ? (
            <div className="live-ticket-list">
              {ownTickets.map((ticket) => (
                <article key={ticket.id}>
                  <div>
                    <b>{ticket.subject}</b>
                    <span className={`live-status ${ticket.status}`}>{ticket.status}</span>
                  </div>
                  <p>{ticket.content}</p>
                  <small>{ticket.createdAt}</small>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon="🎫" title="Chưa có yêu cầu" text="Bạn chưa gửi yêu cầu hỗ trợ nào." />
          )}
        </section>
      </div>
    </div>
  );
}
