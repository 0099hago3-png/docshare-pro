import { useEffect, useMemo, useState } from 'react';
import {
  Archive, Bell, Bold, ChevronDown, FileText, Filter, Headphones, Image, Inbox, Italic,
  Link as LinkIcon, Mail, Menu, MoreVertical, Paperclip, PenLine, Plus, Search, Send,
  ShieldCheck, Smile, Sparkles, Star, Trash2, Underline, UserRound, Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/Avatar.jsx';

function otherParticipant(thread, currentUserId) {
  return (thread.participants || []).find((id) => id !== currentUserId) || currentUserId;
}

function latestMessage(thread) {
  return (thread.messages || []).at(-1) || null;
}

const navItems = [
  { id: 'all', label: 'Tất cả', icon: Inbox },
  { id: 'admin', label: 'Với admin', icon: UserRound },
  { id: 'support', label: 'Hỗ trợ', icon: Headphones },
  { id: 'starred', label: 'Đánh dấu', icon: Star },
  { id: 'archived', label: 'Lưu trữ', icon: Archive },
  { id: 'trash', label: 'Thùng rác', icon: Trash2 },
];

const quickTags = [
  { label: 'Phản hồi nhanh', icon: Zap, tone: 'green' },
  { label: 'Hỗ trợ tài liệu', icon: FileText, tone: 'blue' },
  { label: 'Báo cáo lỗi', icon: Bell, tone: 'orange' },
  { label: 'Góp ý tính năng', icon: Sparkles, tone: 'purple' },
];

export default function Messages() {
  const {
    state,
    currentUser,
    getUser,
    sendMailboxMessage,
    createMailboxThread,
    markMailboxThreadRead,
    toggleMailboxStar,
    archiveMailboxThread,
    restoreMailboxThread,
    deleteMailboxThread,
  } = useApp();

  const [section, setSection] = useState('all');
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState('');
  const [reply, setReply] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('u_admin');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeText, setComposeText] = useState('');
  const [sortNewest, setSortNewest] = useState(true);

  const allUserThreads = useMemo(() => (
    (state.mailboxThreads || []).filter((thread) => (thread.participants || []).includes(currentUser.id))
  ), [state.mailboxThreads, currentUser.id]);

  const counts = useMemo(() => ({
    all: allUserThreads.filter((thread) => !(thread.deletedBy || []).includes(currentUser.id) && !(thread.archivedBy || []).includes(currentUser.id)).length,
    admin: allUserThreads.filter((thread) => (thread.participants || []).includes('u_admin') && !(thread.deletedBy || []).includes(currentUser.id)).length,
    support: allUserThreads.filter((thread) => thread.category === 'support' && !(thread.deletedBy || []).includes(currentUser.id)).length,
    starred: allUserThreads.filter((thread) => (thread.starredBy || []).includes(currentUser.id) && !(thread.deletedBy || []).includes(currentUser.id)).length,
    archived: allUserThreads.filter((thread) => (thread.archivedBy || []).includes(currentUser.id) && !(thread.deletedBy || []).includes(currentUser.id)).length,
    trash: allUserThreads.filter((thread) => (thread.deletedBy || []).includes(currentUser.id)).length,
  }), [allUserThreads, currentUser.id]);

  const visibleThreads = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const rows = allUserThreads.filter((thread) => {
      const deleted = (thread.deletedBy || []).includes(currentUser.id);
      const archived = (thread.archivedBy || []).includes(currentUser.id);
      const starred = (thread.starredBy || []).includes(currentUser.id);
      const other = getUser(otherParticipant(thread, currentUser.id));
      const haystack = `${thread.subject} ${other.name} ${latestMessage(thread)?.text || ''}`.toLowerCase();
      const matchSearch = !keyword || haystack.includes(keyword);
      const matchSection = section === 'all' ? !deleted && !archived
        : section === 'admin' ? !deleted && (thread.participants || []).includes('u_admin')
          : section === 'support' ? !deleted && thread.category === 'support'
            : section === 'starred' ? !deleted && starred
              : section === 'archived' ? !deleted && archived
                : deleted;
      return matchSearch && matchSection;
    });
    return sortNewest ? rows : [...rows].reverse();
  }, [allUserThreads, currentUser.id, getUser, search, section, sortNewest]);

  useEffect(() => {
    if (!visibleThreads.length) {
      setActiveId('');
      return;
    }
    if (!visibleThreads.some((thread) => thread.id === activeId)) setActiveId(visibleThreads[0].id);
  }, [visibleThreads, activeId]);

  const activeThread = visibleThreads.find((thread) => thread.id === activeId) || null;
  const activeOther = activeThread ? getUser(otherParticipant(activeThread, currentUser.id)) : null;
  const activeStarred = activeThread ? (activeThread.starredBy || []).includes(currentUser.id) : false;

  useEffect(() => {
    if (activeThread && (activeThread.unreadBy || []).includes(currentUser.id)) {
      markMailboxThreadRead(activeThread.id, currentUser.id);
    }
  }, [activeThread?.id, currentUser.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function sendReply() {
    if (!activeThread || !reply.trim()) return;
    if (sendMailboxMessage(activeThread.id, reply)) setReply('');
  }

  function sendNewThread() {
    if (!composeSubject.trim() || !composeText.trim()) return;
    const id = createMailboxThread(
      composeTo,
      composeSubject,
      composeText,
      composeTo === 'u_admin' ? 'support' : 'user',
    );
    setComposeOpen(false);
    setComposeSubject('');
    setComposeText('');
    setSection('all');
    setActiveId(id);
  }

  function archiveActive() {
    if (!activeThread) return;
    archiveMailboxThread(activeThread.id, currentUser.id);
    setActiveId('');
  }

  function deleteActive() {
    if (!activeThread) return;
    deleteMailboxThread(activeThread.id, currentUser.id);
    setActiveId('');
  }

  function restoreActive() {
    if (!activeThread) return;
    restoreMailboxThread(activeThread.id, currentUser.id);
    setSection('all');
  }

  return (
    <div className="page mailbox-page-v38">
      <section className="mailbox-app-window-v38">
        <div className="mailbox-window-controls-v38" aria-hidden="true"><i/><i/><i/></div>

        <header className="mailbox-app-header-v38">
          <div className="mailbox-app-brand-v38">
            <span className="mailbox-logo-v38"><Mail size={26}/></span>
            <div><b>DocShare Pro</b><small>Thư viện tài liệu học thuật</small></div>
          </div>
          <div className="mailbox-app-title-v38">
            <h1>Hộp thư DocShare Pro</h1>
            <p>Trao đổi, hỗ trợ và phản hồi nhanh chóng</p>
          </div>
          <div className="mailbox-app-user-v38">
            <span className="admin-mail-pill-v38"><ShieldCheck size={16}/> Hộp thư quản trị</span>
            <button className="mailbox-bell-v38"><Bell size={19}/><i/></button>
            <Avatar user={currentUser}/>
            <div><b>{currentUser.name}</b><small>{currentUser.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}</small></div>
            <ChevronDown size={16}/>
          </div>
        </header>

        <div className="mailbox-app-body-v38">
          <aside className="mailbox-nav-v38">
            <button className="mail-compose-main-v38" onClick={() => setComposeOpen(true)}><PenLine size={18}/> Soạn thư</button>

            <nav>
              {navItems.map(({ id, label, icon: Icon }) => (
                <button key={id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}>
                  <Icon size={18}/><span>{label}</span>{counts[id] > 0 && <em>{counts[id]}</em>}
                </button>
              ))}
            </nav>

            <div className="mail-quick-tags-v38">
              <div><h3>Thẻ nhanh</h3><button><Plus size={15}/></button></div>
              {quickTags.map(({ label, icon: Icon, tone }) => <button key={label} className={tone}><Icon size={15}/>{label}</button>)}
            </div>

            <div className="mail-brand-card-v38">
              <div className="mail-brand-illustration-v38"><Sparkles size={35}/><Mail size={58}/><Zap size={28}/></div>
              <b>DocShare Pro</b>
              <p>Kết nối tri thức,<br/>Chia sẻ giá trị học thuật</p>
            </div>
          </aside>

          <section className="mail-thread-list-panel-v38">
            <div className="mail-search-toolbar-v38">
              <label><Search size={18}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm thư, người gửi..."/></label>
              <button title="Bộ lọc"><Filter size={18}/></button>
            </div>

            <div className="mail-list-filter-v38">
              <div>
                <button className={section === 'all' ? 'active' : ''} onClick={() => setSection('all')}>Tất cả</button>
                <button className={section === 'admin' ? 'active' : ''} onClick={() => setSection('admin')}>Với admin</button>
                <button className={section === 'support' ? 'active' : ''} onClick={() => setSection('support')}>Hỗ trợ</button>
              </div>
              <button onClick={() => setSortNewest((value) => !value)}>{sortNewest ? 'Mới nhất' : 'Cũ nhất'} <ChevronDown size={14}/></button>
            </div>

            <div className="mail-thread-list-v38 custom-scroll">
              {visibleThreads.map((thread) => {
                const other = getUser(otherParticipant(thread, currentUser.id));
                const last = latestMessage(thread);
                const unread = (thread.unreadBy || []).includes(currentUser.id);
                const starred = (thread.starredBy || []).includes(currentUser.id);
                return (
                  <button key={thread.id} className={`mail-thread-row-v38 ${activeId === thread.id ? 'active' : ''}`} onClick={() => setActiveId(thread.id)}>
                    <span className="mail-thread-dot-v38">{unread ? <i/> : null}</span>
                    <Avatar user={other}/>
                    <span className="mail-thread-copy-v38">
                      <b>{other.name}</b>
                      <strong>{thread.subject}</strong>
                      <small>{last?.text || 'Chưa có nội dung'}</small>
                    </span>
                    <span className="mail-thread-meta-v38"><time>{last?.time?.split(' ').at(-1) || 'Mới'}</time>{unread && <em>Mới</em>}{starred && <Star size={14} fill="currentColor"/>}</span>
                  </button>
                );
              })}
              {!visibleThreads.length && <div className="mail-empty-v38"><Mail size={40}/><h3>Chưa có thư</h3><p>Hãy soạn một thư mới hoặc chọn mục khác.</p></div>}
            </div>
          </section>

          <main className="mail-reader-panel-v38">
            {activeThread ? (
              <>
                <header className="mail-reader-head-v38">
                  <div className="mail-reader-title-v38">
                    <button className="mail-mobile-back-v38"><Menu size={18}/></button>
                    <div><h2>{activeThread.subject}</h2><p>{activeThread.category === 'support' ? 'Yêu cầu hỗ trợ DocShare Pro' : 'Cuộc trao đổi trong cộng đồng'}</p></div>
                  </div>
                  <div className="mail-reader-actions-v38">
                    <button className={activeStarred ? 'active' : ''} onClick={() => toggleMailboxStar(activeThread.id, currentUser.id)} title="Đánh dấu"><Star size={19} fill={activeStarred ? 'currentColor' : 'none'}/></button>
                    {section === 'trash' ? <button onClick={restoreActive} title="Khôi phục"><Archive size={19}/></button> : <button onClick={archiveActive} title="Lưu trữ"><Archive size={19}/></button>}
                    <button onClick={deleteActive} title="Xóa"><Trash2 size={19}/></button>
                    <button title="Thêm"><MoreVertical size={19}/></button>
                  </div>
                </header>

                <div className="mail-reader-sender-v38">
                  <Avatar user={activeOther} size="lg"/>
                  <div><b>{activeOther.name}</b><span>{activeOther.email}</span><small>Gửi đến: {activeThread.category === 'support' ? 'Hỗ trợ DocShare Pro' : currentUser.name} <ChevronDown size={13}/></small></div>
                  <div><time>{latestMessage(activeThread)?.time || activeThread.updatedAt}</time>{(activeThread.unreadBy || []).includes(currentUser.id) && <em>Mới</em>}</div>
                </div>

                <div className="mail-reader-conversation-v38 custom-scroll">
                  {(activeThread.messages || []).map((message) => {
                    const mine = message.senderId === currentUser.id;
                    const sender = getUser(message.senderId);
                    return (
                      <article key={message.id} className={`mail-message-v38 ${mine ? 'mine' : ''} ${sender.role === 'admin' ? 'admin' : ''}`}>
                        {!mine && <Avatar user={sender}/>} 
                        <div>
                          <b>{mine ? 'Bạn' : sender.name}</b>
                          <p>{message.text}</p>
                          <small>{message.time}{mine ? '  ✓✓' : ''}</small>
                        </div>
                        {mine && <Avatar user={sender}/>} 
                      </article>
                    );
                  })}
                </div>

                <div className="mail-reply-composer-v38">
                  <textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Nhập nội dung trả lời..." onKeyDown={(event) => { if (event.ctrlKey && event.key === 'Enter') sendReply(); }}/>
                  <div className="mail-reply-toolbar-v38">
                    <div><button><Bold size={16}/></button><button><Italic size={16}/></button><button><Underline size={16}/></button><button><Menu size={16}/></button><button><LinkIcon size={16}/></button><button><Image size={16}/></button><button><Smile size={16}/></button><button><Paperclip size={16}/></button></div>
                    <button className="mail-send-reply-v38" onClick={sendReply}><Send size={17}/> Gửi phản hồi <ChevronDown size={14}/></button>
                  </div>
                </div>

                <div className="mail-info-cards-v38">
                  <article><Zap size={22}/><div><b>Phản hồi nhanh</b><p>Ưu tiên xử lý các yêu cầu mới trong vòng 24h.</p></div></article>
                  <article><FileText size={22}/><div><b>Hỗ trợ tài liệu</b><p>Giải đáp thắc mắc về quyền truy cập và tải xuống.</p></div></article>
                  <article><ShieldCheck size={22}/><div><b>Hộp thư quản trị</b><p>Kênh liên lạc trực tiếp với đội ngũ quản trị hệ thống.</p></div></article>
                </div>
              </>
            ) : (
              <div className="mail-reader-empty-v38"><Mail size={64}/><h2>Chọn một thư để đọc</h2><p>Nội dung trao đổi sẽ xuất hiện tại đây.</p></div>
            )}
          </main>
        </div>
      </section>

      {composeOpen && (
        <div className="mail-compose-backdrop-v38" onMouseDown={() => setComposeOpen(false)}>
          <section className="mail-compose-window-v38" onMouseDown={(event) => event.stopPropagation()}>
            <header><div><i/><i/><i/></div><h2>Soạn thư mới</h2><button onClick={() => setComposeOpen(false)}>×</button></header>
            <label><span>Người nhận</span><select value={composeTo} onChange={(event) => setComposeTo(event.target.value)}>{state.users.filter((user) => user.id !== currentUser.id).map((user) => <option key={user.id} value={user.id}>{user.name}{user.role === 'admin' ? ' · Admin' : ''}</option>)}</select></label>
            <label><span>Tiêu đề</span><input value={composeSubject} onChange={(event) => setComposeSubject(event.target.value)} placeholder="Nhập tiêu đề thư..."/></label>
            <label><span>Nội dung</span><textarea rows="9" value={composeText} onChange={(event) => setComposeText(event.target.value)} placeholder="Nhập nội dung cần trao đổi..."/></label>
            <footer><button onClick={() => setComposeOpen(false)}>Hủy</button><button className="primary" onClick={sendNewThread}><Send size={16}/> Gửi thư</button></footer>
          </section>
        </div>
      )}
    </div>
  );
}
