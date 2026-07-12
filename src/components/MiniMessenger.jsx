import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Maximize2, MessageCircle, Send, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from './Avatar.jsx';

function displayName(user) {
  return user?.name
    || user?.fullName
    || user?.username
    || user?.email
    || 'Người dùng DocShare';
}

export default function MiniMessenger() {
  const {
    state,
    currentUser,
    getUser,
    sendMailboxMessage,
    markMailboxThreadRead,
  } = useApp();

  const [open, setOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bodyRef = useRef(null);

  const activeThread = useMemo(() => (
    state.mailboxThreads.find((thread) => thread.id === activeThreadId)
    || state.mailboxThreads[0]
    || null
  ), [activeThreadId, state.mailboxThreads]);

  const otherUser = useMemo(() => {
    if (!activeThread) return null;
    const otherId = activeThread.participants.find((id) => id !== currentUser?.id);
    return getUser(otherId);
  }, [activeThread, currentUser?.id, getUser]);

  useEffect(() => {
    if (!activeThreadId && state.mailboxThreads[0]?.id) {
      setActiveThreadId(state.mailboxThreads[0].id);
    }
  }, [activeThreadId, state.mailboxThreads]);

  useEffect(() => {
    const closeMessenger = () => setOpen(false);
    window.addEventListener('docshare:open-chatbot', closeMessenger);
    return () => window.removeEventListener('docshare:open-chatbot', closeMessenger);
  }, []);

  useEffect(() => {
    if (open && activeThread?.id) {
      markMailboxThreadRead(activeThread.id);
      window.setTimeout(() => {
        bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
      }, 30);
    }
  }, [activeThread?.id, activeThread?.messages?.length, open]);

  function toggleOpen() {
    setOpen((previous) => {
      const next = !previous;
      if (next) {
        window.dispatchEvent(new CustomEvent('docshare:open-messenger'));
      }
      return next;
    });
  }

  async function send() {
    const value = text.trim();
    if (!value || !activeThread || sending) return;

    setSending(true);
    const ok = await sendMailboxMessage(activeThread.id, value);
    setSending(false);

    if (ok) setText('');
  }

  return (
    <>
      <button
        className="message-fab message-cloud-fab messenger-fab-v28"
        onClick={toggleOpen}
        title="Tin nhắn"
        aria-label="Mở tin nhắn"
      >
        <MessageCircle size={23} />
      </button>

      {open && (
        <section className="mini-messenger mini-messenger-v28 mini-messenger-v42">
          <header className="mini-messenger-head mini-messenger-head-v28 mini-messenger-head-v42">
            <div className="mini-user mini-user-v42">
              {otherUser ? <Avatar user={otherUser} /> : <span className="mini-empty-avatar-v42">💬</span>}
              <span>
                <b>{otherUser ? displayName(otherUser) : 'Tin nhắn DocShare'}</b>
                <small><i />{otherUser ? 'Đang hoạt động' : 'Dữ liệu thật từ Supabase'}</small>
              </span>
            </div>

            <div>
              <Link to="/messages" title="Mở trang tin nhắn" onClick={() => setOpen(false)}>
                <Maximize2 size={17} />
              </Link>
              <button onClick={() => setOpen(false)} aria-label="Đóng">
                <X size={18} />
              </button>
            </div>
          </header>

          {activeThread ? (
            <>
              <div className="mini-messenger-body mini-messenger-body-v28 custom-scroll" ref={bodyRef}>
                <div className="chat-date-v28">Cuộc trò chuyện gần nhất</div>
                {activeThread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={message.senderId === currentUser?.id ? 'mini-bubble me' : 'mini-bubble'}
                  >
                    <p>{message.text}</p>
                    <small>{message.time}</small>
                  </div>
                ))}

                {!activeThread.messages.length && (
                  <div className="mini-empty-conversation-v42">
                    Chưa có tin nhắn. Hãy gửi lời chào đầu tiên.
                  </div>
                )}
              </div>

              <footer className="mini-messenger-send mini-messenger-send-v28">
                <input
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                />
                <button onClick={send} disabled={sending || !text.trim()} aria-label="Gửi">
                  <Send size={18} />
                </button>
              </footer>
            </>
          ) : (
            <div className="mini-no-thread-v42">
              <MessageCircle size={38} />
              <b>Chưa có cuộc trò chuyện</b>
              <p>Mở trang Tin nhắn để tìm người dùng và bắt đầu trò chuyện.</p>
              <Link to="/messages" onClick={() => setOpen(false)}>Mở Tin nhắn</Link>
            </div>
          )}
        </section>
      )}
    </>
  );
}
