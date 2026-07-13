import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useApp } from './AppContext.jsx';
import { supabase } from '../lib/supabase.js';

const UnreadContext = createContext(null);

const EMPTY_COUNTS = {
  notifications: 0,
  messages: 0,
  ownPendingPayments: 0,
  adminPendingReports: 0,
  adminPendingPayments: 0,
  adminTotal: 0,
};

function toCount(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

export function UnreadProvider({ children }) {
  const { currentUser } = useApp();
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!currentUser?.id) {
      setCounts(EMPTY_COUNTS);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('get_docshare_unread_counts');

      if (error) throw error;

      const next = {
        notifications: toCount(data?.notifications),
        messages: toCount(data?.messages),
        ownPendingPayments: toCount(data?.own_pending_payments),
        adminPendingReports: toCount(data?.admin_pending_reports),
        adminPendingPayments: toCount(data?.admin_pending_payments),
        adminTotal: toCount(data?.admin_total),
      };

      setCounts(next);
    } catch (error) {
      // Không làm hỏng giao diện nếu database chưa chạy file V61.
      console.warn('Không tải được số chưa đọc:', error?.message || error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const markNotificationsRead = useCallback(async () => {
    if (!currentUser?.id) return;

    const { error } = await supabase.rpc('mark_docshare_notifications_read');

    if (error) {
      console.warn('Không đánh dấu được thông báo:', error.message);
      return;
    }

    setCounts((current) => ({
      ...current,
      notifications: 0,
    }));
  }, [currentUser?.id]);

  const markMessagesRead = useCallback(async (senderId = null) => {
    if (!currentUser?.id) return;

    const { error } = await supabase.rpc('mark_docshare_messages_read', {
      p_sender_id: senderId || null,
    });

    if (error) {
      console.warn('Không đánh dấu được tin nhắn:', error.message);
      return;
    }

    await refresh();
  }, [currentUser?.id, refresh]);

  useEffect(() => {
    if (!currentUser?.id) {
      setCounts(EMPTY_COUNTS);
      return undefined;
    }

    refresh();

    const intervalId = window.setInterval(refresh, 30000);

    const channel = supabase
      .channel(`docshare-unread-${currentUser.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        refresh,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'direct_messages' },
        refresh,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        refresh,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payment_requests' },
        refresh,
      )
      .subscribe();

    const onRefresh = () => refresh();
    window.addEventListener('docshare:unread-refresh', onRefresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('docshare:unread-refresh', onRefresh);
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, refresh]);

  const value = useMemo(() => ({
    ...counts,
    loading,
    refresh,
    markNotificationsRead,
    markMessagesRead,
  }), [
    counts,
    loading,
    refresh,
    markNotificationsRead,
    markMessagesRead,
  ]);

  return (
    <UnreadContext.Provider value={value}>
      {children}
    </UnreadContext.Provider>
  );
}

export function useUnread() {
  const value = useContext(UnreadContext);

  if (!value) {
    return {
      ...EMPTY_COUNTS,
      loading: false,
      refresh: async () => {},
      markNotificationsRead: async () => {},
      markMessagesRead: async () => {},
    };
  }

  return value;
}
