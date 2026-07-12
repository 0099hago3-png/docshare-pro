import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Search, Send, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import {
  EmptyState,
  PageHeader,
  UserAvatar,
} from '../components/LiveUI.jsx';

function displayName(user) {
  return user?.name
    || user?.fullName
    || user?.username
    || user?.email
    || 'Người dùng DocShare';
}

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function Messages() {
  const {
    state,
    currentUser,
    getUser,
    createMailboxThread,
    sendMailboxMessage,
    markMailboxThreadRead,
  } = useApp();

  const [selectedId, setSelectedId] = useState('');
  const [pendingUserId, setPendingUserId] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const visibleUsers = useMemo(() => {
    const keyword = normalize(search.trim());

    return state.users
      .filter((user) => user.id !== currentUser?.id)
      .filter((user) => {
        if (!keyword) return false;
        return normalize([
          displayName(user),
          user.username,
          user.email,
          user.school,
          user.faculty,
          user.major,
        ].filter(Boolean).join(' ')).includes(keyword);
      })
      .slice(0, 12);
  }, [currentUser?.id, search, state.users]);

  const selected = useMemo(() => (
    state.mailboxThreads.find((item) => item.id === selectedId) || null
  ), [selectedId, state.mailboxThreads]);

  const selectedOtherUser = useMemo(() => {
    if (!selected) return null;
    const otherId = selected.participants.find((id) => id !== currentUser?.id);
    return getUser(otherId);
  }, [currentUser?.id, getUser, selected]);

  const pendingUser = useMemo(
    () => state.users.find((user) => user.id === pendingUserId) || null,
    [pendingUserId, state.users],
  );

  const activeUser = pendingUser || selectedOtherUser;

  useEffect(() => {
    if (!selectedId && !pendingUserId && state.mailboxThreads.length) {
      const first = state.mailboxThreads[0];
      setSelectedId(first.id);
      markMailboxThreadRead(first.id);
    }
  }, [markMailboxThreadRead, pendingUserId, selectedId, state.mailboxThreads]);

  useEffect(() => {
    window.setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }, 30);
  }, [selected?.messages?.length, selectedId]);

  function openThread(thread) {
    setPendingUserId('');
    setSelectedId(thread.id);
    setSearch('');
    markMailboxThreadRead(thread.id);
  }

  function openUser(user) {
    const existing = state.mailboxThreads.find((thread) => (
      thread.participants.includes(currentUser?.id)
      && thread.participants.includes(user.id)
    ));

    setSearch('');

    if (existing) {
      openThread(existing);
      return;
    }

    setSelectedId('');
    setPendingUserId(user.id);
    setMessage('');
  }

  async function submitMessage(event) {
    event.preventDefault();
    const value = message.trim();
    if (!value || !activeUser || sending) return;

    setSending(true);

    let ok = false;

    if (selected) {
      ok = await sendMailboxMessage(selected.id, value);
    } else if (pendingUser) {
      const newThreadId = await createMailboxThread(
        pendingUser.id,
        `Trò chuyện với ${displayName(pendingUser)}`,
        value,
        'user',
      );

      if (newThreadId) {
        setPendingUserId('');
        setSelectedId(newThreadId);
        ok = true;
      }
    }

    setSending(false);

    if (ok) {
      setMessage('');
    }
  }

  return (
    <div className="live-page live-messages-page-v42">
      <PageHeader
        eyebrow="TIN NHẮN SUPABASE"
        title="Tin nhắn"
        text="Tìm người dùng, mở cuộc trò chuyện và nhắn trực tiếp như ứng dụng Zalo."
      />

      <div className="zalo-message-layout-v42">
        <aside className="zalo-message-sidebar-v42">
          <div className="zalo-message-sidebar-head-v42">
            <h2>Tin nhắn</h2>
            <span>{state.mailboxThreads.length} cuộc trò chuyện</span>
          </div>

          <label className="zalo-user-search-v42">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên, email hoặc ngành học..."
            />
          </label>

          {search.trim() && (
            <section className="zalo-search-results-v42">
              <div className="zalo-section-label-v42">Kết quả tìm người</div>

              {visibleUsers.map((user) => (
                <button type="button" key={user.id} onClick={() => openUser(user)}>
                  <UserAvatar user={user} size="sm" />
                  <span>
                    <b>{displayName(user)}</b>
                    <small>{user.email || `@${user.username || user.id.slice(0, 8)}`}</small>
                  </span>
                  <MessageCircle size={17} />
                </button>
              ))}

              {!visibleUsers.length && (
                <p>Không tìm thấy người dùng phù hợp.</p>
              )}
            </section>
          )}

          <div className="zalo-section-label-v42">Cuộc trò chuyện gần đây</div>

          <div className="zalo-thread-list-v42">
            {state.mailboxThreads.map((thread) => {
              const otherId = thread.participants.find((id) => id !== currentUser?.id);
              const otherUser = getUser(otherId);
              const lastMessage = thread.messages[thread.messages.length - 1];
              const unread = (thread.unreadBy || []).includes(currentUser?.id);

              return (
                <button
                  className={selectedId === thread.id ? 'active' : ''}
                  key={thread.id}
                  type="button"
                  onClick={() => openThread(thread)}
                >
                  <UserAvatar user={otherUser} size="sm" />
                  <span>
                    <strong>{displayName(otherUser)}</strong>
                    <small>{lastMessage?.text || 'Chưa có tin nhắn'}</small>
                  </span>
                  <em>
                    {unread && <i />}
                    {thread.updatedAt}
                  </em>
                </button>
              );
            })}

            {!state.mailboxThreads.length && !search.trim() && (
              <div className="zalo-no-thread-v42">
                <UserRound size={28} />
                <b>Chưa có cuộc trò chuyện</b>
                <p>Dùng ô tìm kiếm phía trên để tìm người và bắt đầu nhắn tin.</p>
              </div>
            )}
          </div>
        </aside>

        <main className="zalo-conversation-v42">
          {activeUser ? (
            <>
              <header className="zalo-conversation-head-v42">
                <UserAvatar user={activeUser} size="sm" />
                <div>
                  <h2>{displayName(activeUser)}</h2>
                  <small>{activeUser.email || `@${activeUser.username || activeUser.id.slice(0, 8)}`}</small>
                </div>
                <span><i /> Đang hoạt động</span>
              </header>

              <div className="zalo-message-scroll-v42" ref={scrollRef}>
                {selected?.messages?.length ? selected.messages.map((item) => {
                  const sender = getUser(item.senderId);
                  const mine = item.senderId === currentUser?.id;

                  return (
                    <div className={mine ? 'zalo-message-row-v42 mine' : 'zalo-message-row-v42'} key={item.id}>
                      {!mine && <UserAvatar user={sender} size="xs" />}
                      <div className="zalo-message-bubble-v42">
                        {!mine && <b>{displayName(sender)}</b>}
                        <p>{item.text}</p>
                        <small>{item.time}</small>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="zalo-start-chat-v42">
                    <MessageCircle size={36} />
                    <h3>Bắt đầu trò chuyện với {displayName(activeUser)}</h3>
                    <p>Nhập tin nhắn ở bên dưới. Cuộc trò chuyện sẽ được lưu thật vào Supabase.</p>
                  </div>
                )}
              </div>

              <form className="zalo-message-compose-v42" onSubmit={submitMessage}>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={`Nhắn tin cho ${displayName(activeUser)}...`}
                  autoComplete="off"
                />
                <button type="submit" disabled={sending || !message.trim()} aria-label="Gửi tin nhắn">
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <EmptyState
              icon="💬"
              title="Chọn một cuộc trò chuyện"
              text="Tìm người dùng ở thanh bên trái hoặc chọn một cuộc trò chuyện gần đây."
            />
          )}
        </main>
      </div>
    </div>
  );
}
