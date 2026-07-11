import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  EmptyState,
  PageHeader,
  UserAvatar,
} from '../components/LiveUI.jsx';

export default function Messages() {
  const {
    state,
    currentUser,
    getUser,
    createMailboxThread,
    sendMailboxMessage,
    markMailboxThreadRead,
  } = useApp();

  const [selectedId, setSelectedId] = useState(state.mailboxThreads[0]?.id || '');
  const [message, setMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const selected = useMemo(() => (
    state.mailboxThreads.find((item) => item.id === selectedId) || null
  ), [selectedId, state.mailboxThreads]);

  async function createThread(event) {
    event.preventDefault();
    const id = await createMailboxThread(recipientId, subject, newMessage, 'user');
    if (id) {
      setSelectedId(id);
      setRecipientId('');
      setSubject('');
      setNewMessage('');
    }
  }

  return (
    <div className="live-page">
      <PageHeader
        eyebrow="HỘP THƯ SUPABASE"
        title="Tin nhắn"
        text="Cuộc trò chuyện và nội dung thư được lưu trong mail_threads, mail_thread_members và mail_messages."
      />

      <div className="live-message-layout">
        <aside className="live-message-list">
          <form className="live-new-message" onSubmit={createThread}>
            <h3>Tạo cuộc trò chuyện</h3>
            <select value={recipientId} onChange={(event) => setRecipientId(event.target.value)} required>
              <option value="">Chọn người nhận</option>
              {state.users
                .filter((user) => user.id !== currentUser?.id)
                .map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
            </select>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Chủ đề" required />
            <textarea value={newMessage} onChange={(event) => setNewMessage(event.target.value)} placeholder="Nội dung đầu tiên" />
            <button className="live-primary-button" type="submit">Tạo thư</button>
          </form>

          {state.mailboxThreads.map((thread) => {
            const otherId = thread.participants.find((id) => id !== currentUser?.id);
            const otherUser = getUser(otherId);

            return (
              <button
                className={selectedId === thread.id ? 'live-thread-button active' : 'live-thread-button'}
                key={thread.id}
                type="button"
                onClick={() => {
                  setSelectedId(thread.id);
                  markMailboxThreadRead(thread.id);
                }}
              >
                <UserAvatar user={otherUser} size="sm" />
                <span>
                  <b>{thread.subject}</b>
                  <small>{otherUser.name} · {thread.updatedAt}</small>
                </span>
              </button>
            );
          })}
        </aside>

        <main className="live-message-main">
          {selected ? (
            <>
              <header>
                <h2>{selected.subject}</h2>
                <small>{selected.updatedAt}</small>
              </header>

              <div className="live-message-scroll">
                {selected.messages.map((item) => {
                  const sender = getUser(item.senderId);
                  const mine = item.senderId === currentUser?.id;

                  return (
                    <div className={mine ? 'live-message-bubble mine' : 'live-message-bubble'} key={item.id}>
                      {!mine && <b>{sender.name}</b>}
                      <p>{item.text}</p>
                      <small>{item.time}</small>
                    </div>
                  );
                })}
              </div>

              <form
                className="live-message-compose"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const value = message.trim();
                  if (!value) return;
                  const ok = await sendMailboxMessage(selected.id, value);
                  if (ok) setMessage('');
                }}
              >
                <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Nhập tin nhắn..." />
                <button className="live-primary-button" type="submit">Gửi</button>
              </form>
            </>
          ) : (
            <EmptyState
              icon="✉️"
              title="Chưa có cuộc trò chuyện"
              text="Tạo thư mới để bắt đầu."
            />
          )}
        </main>
      </div>
    </div>
  );
}
