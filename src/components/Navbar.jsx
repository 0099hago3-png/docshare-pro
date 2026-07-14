import {
  Bell,
  ChevronDown,
  CreditCard,
  LogOut,
  Search,
  ShoppingCart,
  ShieldCheck,
  Upload,
  UserRound,
  WalletCards,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom';

import { useApp } from '../context/AppContext.jsx';
import { useUnread } from '../context/UnreadContext.jsx';
import { formatNumber } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';
import Avatar from './Avatar.jsx';
import CartPanel from './CartPanel.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import PremiumBadge, {
  isPremiumActive,
} from './PremiumBadge.jsx';
import SecurityModal from './SecurityModal.jsx';
import TeacherBadge from './TeacherBadge.jsx';

const links = [
  ['/', 'Trang chủ'],
  ['/documents', 'Tài liệu'],
  ['/categories', 'Danh mục'],
  ['/feed', 'Bảng tin'],
  ['/leaderboard', 'Xếp hạng'],
];

function CountBadge({ value, title }) {
  const count = Number(value || 0);

  if (count <= 0) return null;

  return (
    <span
      className="unread-count-badge"
      title={title}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Navbar() {
  const {
    currentUser,
    logout,
    toast,
  } = useApp();

  const { notifications } = useUnread();

  const [keyword, setKeyword] = useState('');
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [accountSummary, setAccountSummary] = useState({
    credit: 0,
    cash: 0,
    loading: false,
  });

  const navigate = useNavigate();

  const name = useMemo(
    () => (
      currentUser?.full_name
      || currentUser?.username
      || 'Tài khoản'
    ),
    [currentUser],
  );

  const premium = isPremiumActive(currentUser);

  const loadAccountSummary = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      setAccountSummary((current) => ({
        ...current,
        loading: true,
      }));

      const { data, error } = await supabase
        .from('wallets')
        .select('credit_balance,cash_balance')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error) throw error;

      setAccountSummary({
        credit: Number(data?.credit_balance || 0),
        cash: Number(data?.cash_balance || 0),
        loading: false,
      });
    } catch (error) {
      console.warn('Không tải được số dư:', error?.message || error);

      setAccountSummary((current) => ({
        ...current,
        loading: false,
      }));
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (open) {
      loadAccountSummary();
    }
  }, [loadAccountSummary, open]);

  useEffect(() => {
    const refresh = () => loadAccountSummary();

    window.addEventListener('docshare:wallet-refresh', refresh);

    return () => {
      window.removeEventListener('docshare:wallet-refresh', refresh);
    };
  }, [loadAccountSummary]);


  const loadCartCount = useCallback(async () => {
    if (!currentUser?.id) {
      setCartCount(0);
      return;
    }

    const { count, error } = await supabase
      .from('document_cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id);

    if (!error) setCartCount(Number(count || 0));
  }, [currentUser?.id]);

  useEffect(() => {
    loadCartCount();

    const refresh = () => loadCartCount();
    window.addEventListener('docshare:cart-refresh', refresh);

    return () => window.removeEventListener('docshare:cart-refresh', refresh);
  }, [loadCartCount]);

  function search(event) {
    event.preventDefault();

    navigate(
      keyword.trim()
        ? `/documents?search=${encodeURIComponent(keyword.trim())}`
        : '/documents',
    );
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      toast(error.message, 'error');
    }
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <img src="/assets/logo-mark.svg" alt="" />

        <span>
          <strong>DocShare</strong> <em>Pro</em>
          <small>GREEN ACADEMIC LIBRARY</small>
        </span>
      </Link>

      <form className="navbar-search" onSubmit={search}>
        <Search size={17} />

        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm tài liệu, môn học, tác giả..."
        />

        <button type="submit">Tìm</button>
      </form>

      <nav className="navbar-links">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => (
              isActive ? 'active' : ''
            )}
          >
            {label}
          </NavLink>
        ))}

        <NavLink
          className={({ isActive }) => (
            `navbar-upload${isActive ? ' active' : ''}`
          )}
          to="/upload"
        >
          <Upload size={15} />
          Đăng tải
        </NavLink>

        {currentUser?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => (
              `navbar-admin-link${isActive ? ' active' : ''}`
            )}
          >
            Admin
          </NavLink>
        )}
      </nav>

      <div className="navbar-actions">
        <div className="navbar-cart-wrap-v70">
          <button
            className="icon-button notification-icon-button"
            type="button"
            onClick={() => {
              setOpen(false);
              setNotificationsOpen(false);
              setCartOpen((value) => !value);
            }}
            title="Giỏ hàng tài liệu"
            aria-label="Giỏ hàng tài liệu"
          >
            <ShoppingCart size={19} />
            <CountBadge value={cartCount} title="Tài liệu trong giỏ hàng" />
          </button>

          <CartPanel
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            onCountChange={setCartCount}
          />
        </div>

        <div className="navbar-notification-wrap-v63">
          <button
            className="icon-button notification-icon-button"
            type="button"
            onClick={() => {
              setOpen(false);
              setCartOpen(false);
              setNotificationsOpen((value) => !value);
            }}
            title={
              notifications > 0
                ? `${notifications} thông báo chưa đọc`
                : 'Thông báo'
            }
            aria-label="Thông báo"
          >
            <Bell size={19} />

            <CountBadge
              value={notifications}
              title="Thông báo chưa đọc"
            />
          </button>

          <NotificationPanel
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>

        <div className="account-menu">
          <button
            className={`account-menu__trigger${premium ? ' is-premium-v63' : ''}`}
            type="button"
            onClick={() => {
              setNotificationsOpen(false);
              setCartOpen(false);
              setOpen((value) => !value);
            }}
          >
            <Avatar profile={currentUser} size={34} />

            <span className="account-menu__identity-v63">
              <span>
                <strong>{name}</strong>
                <PremiumBadge
                  profile={currentUser}
                  compact
                  showText={false}
                />
                <TeacherBadge profile={currentUser} compact />
              </span>

              <small>
                {premium
                  ? 'Thành viên Premium'
                  : currentUser?.role === 'admin'
                    ? 'Quản trị viên'
                    : 'Thành viên'}
              </small>
            </span>

            <ChevronDown size={15} />
          </button>

          {open && (
            <>
              <button
                className="menu-backdrop"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
              />

              <div className="account-menu__dropdown account-menu__dropdown--v63">
                <section className={`account-summary-v63${premium ? ' is-premium' : ''}`}>
                  <div className="account-summary-v63__head">
                    <Avatar profile={currentUser} size={44} />

                    <div>
                      <strong>{name}</strong>
                      <PremiumBadge
                        profile={currentUser}
                        compact
                      />
                      <TeacherBadge profile={currentUser} compact />
                    </div>
                  </div>

                  <div className="account-summary-v63__balances">
                    <article>
                      <WalletCards size={16} />
                      <span>
                        <small>Số dư credit</small>
                        <strong>
                          {accountSummary.loading
                            ? '...'
                            : `${formatNumber(accountSummary.credit)} credit`}
                        </strong>
                      </span>
                    </article>

                    <article>
                      <CreditCard size={16} />
                      <span>
                        <small>Tiền tác giả</small>
                        <strong>
                          {accountSummary.loading
                            ? '...'
                            : `${formatNumber(accountSummary.cash)}đ`}
                        </strong>
                      </span>
                    </article>
                  </div>

                  <Link
                    className="account-summary-v63__wallet-link"
                    to="/wallet"
                    onClick={() => setOpen(false)}
                  >
                    Mở Ví & Premium
                  </Link>
                </section>

                <Link
                  to={`/profile/${currentUser?.id}`}
                  onClick={() => setOpen(false)}
                >
                  <UserRound size={17} />
                  Hồ sơ cá nhân
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setSecurityOpen(true);
                  }}
                >
                  <ShieldCheck size={17} />
                  Bảo mật
                </button>

                {currentUser?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                  >
                    <ShieldCheck size={17} />
                    Quản trị
                  </Link>
                )}

                <button type="button" onClick={handleLogout}>
                  <LogOut size={17} />
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <SecurityModal
        open={securityOpen}
        onClose={() => setSecurityOpen(false)}
      />
    </header>
  );
}
