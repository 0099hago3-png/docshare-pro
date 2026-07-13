import {
  Bell,
  CheckCheck,
  CircleDollarSign,
  FileWarning,
  Gift,
  Heart,
  Mail,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { useApp } from '../context/AppContext.jsx';
import { useUnread } from '../context/UnreadContext.jsx';
import { supabase } from '../lib/supabase.js';

function getIcon(kind) {
  const value = String(kind || '').toLowerCase();

  if (value.includes('report')) return FileWarning;
  if (value.includes('payment') || value.includes('topup')) {
    return CircleDollarSign;
  }
  if (value.includes('gift')) return Gift;
  if (value.includes('comment')) return MessageCircle;
  if (value.includes('like') || value.includes('heart')) return Heart;
  if (value.includes('message')) return Mail;
  if (value.includes('admin')) return ShieldAlert;

  return Bell;
}

function formatRelativeTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000),
  );

  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;

  return date.toLocaleDateString('vi-VN');
}

export default function NotificationPanel({
  open,
  onClose,
}) {
  const { currentUser, toast } = useApp();

  const {
    notifications: unreadCount,
    refresh,
    markNotificationsRead,
  } = useUnread();

  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!currentUser?.id || !open) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          kind,
          title,
          content,
          target_url,
          is_read,
          important,
          created_at
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      toast(
        error.message || 'Không tải được thông báo.',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, open, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const unreadItems = useMemo(
    () => items.filter((item) => !item.is_read).length,
    [items],
  );

  const visibleItems = useMemo(
    () => (
      filter === 'unread'
        ? items.filter((item) => !item.is_read)
        : items
    ),
    [filter, items],
  );

  async function markOneAndOpen(item) {
    try {
      if (!item.is_read) {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', item.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;

        setItems((current) => current.map((value) => (
          value.id === item.id
            ? { ...value, is_read: true }
            : value
        )));

        await refresh();
      }

      onClose?.();

      if (item.target_url) {
        navigate(item.target_url);
      }
    } catch (error) {
      toast(
        error.message || 'Không mở được thông báo.',
        'error',
      );
    }
  }

  async function markAll() {
    try {
      await markNotificationsRead();

      setItems((current) => current.map((item) => ({
        ...item,
        is_read: true,
      })));
    } catch (error) {
      toast(
        error.message || 'Không đánh dấu được thông báo.',
        'error',
      );
    }
  }

  if (!open) return null;

  return (
    <>
      <button
        className="notification-panel-backdrop"
        type="button"
        aria-label="Đóng thông báo"
        onClick={onClose}
      />

      <section
        className="notification-panel notification-panel--facebook-v63"
        aria-label="Thông báo"
      >
        <header className="notification-panel__header">
          <div>
            <span>TRUNG TÂM THÔNG BÁO</span>
            <h3>Thông báo</h3>
          </div>

          <div className="notification-panel__header-actions-v63">
            <button
              type="button"
              onClick={load}
              title="Làm mới"
              aria-label="Làm mới"
            >
              <RefreshCw size={16} />
            </button>

            <button
              className="notification-panel__close"
              type="button"
              onClick={onClose}
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="notification-panel__tabs-v63">
          <button
            className={filter === 'all' ? 'is-active' : ''}
            type="button"
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>

          <button
            className={filter === 'unread' ? 'is-active' : ''}
            type="button"
            onClick={() => setFilter('unread')}
          >
            Chưa đọc
            {(unreadCount || unreadItems) > 0 && (
              <b>{unreadCount || unreadItems}</b>
            )}
          </button>

          {(unreadCount > 0 || unreadItems > 0) && (
            <button
              className="notification-panel__mark-all-v63"
              type="button"
              onClick={markAll}
            >
              <CheckCheck size={14} />
              Đọc tất cả
            </button>
          )}
        </div>

        <div className="notification-panel__list">
          {loading ? (
            <div className="notification-panel__empty">
              Đang tải thông báo...
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="notification-panel__empty">
              <span>
                <Bell size={28} />
              </span>

              <strong>
                {filter === 'unread'
                  ? 'Không còn thông báo chưa đọc'
                  : 'Chưa có thông báo'}
              </strong>

              <p>
                Thích, bình luận, donate và thông báo hệ thống sẽ hiện ở đây.
              </p>
            </div>
          ) : (
            visibleItems.map((item) => {
              const Icon = getIcon(item.kind);

              return (
                <button
                  key={item.id}
                  className={[
                    'notification-item',
                    item.is_read ? '' : 'is-unread',
                    item.important ? 'is-important' : '',
                  ].filter(Boolean).join(' ')}
                  type="button"
                  onClick={() => markOneAndOpen(item)}
                >
                  <span className="notification-item__icon">
                    <Icon size={18} />
                  </span>

                  <span className="notification-item__content">
                    <strong>{item.title}</strong>
                    <span>{item.content}</span>
                    <small>
                      {formatRelativeTime(item.created_at)}
                    </small>
                  </span>

                  {!item.is_read && (
                    <i
                      className="notification-item__dot"
                      aria-label="Chưa đọc"
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

        <footer className="notification-panel__footer">
          <span>
            Bấm một thông báo để mở đúng nội dung liên quan
          </span>
        </footer>
      </section>
    </>
  );
}
