import {
  Activity,
  BookOpen,
  Clock3,
  Eye,
  Gift,
  Heart,
  MessageCircle,
  RefreshCw,
  Search,
  ShoppingCart,
  Star,
  WalletCards,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

import { useApp } from '../context/AppContext.jsx';
import { supabase } from '../lib/supabase.js';

const FILTERS = [
  {
    id: 'all',
    label: 'Tất cả',
  },
  {
    id: 'document',
    label: 'Tài liệu',
  },
  {
    id: 'interaction',
    label: 'Tương tác',
  },
  {
    id: 'gift',
    label: 'Quà tặng',
  },
  {
    id: 'finance',
    label: 'Giao dịch',
  },
];

function normalizeAction(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function getActionConfig(item) {
  const action = normalizeAction(item.action_type);

  if (
    action.includes('gift')
    || action === 'gift'
  ) {
    return {
      group: 'gift',
      label: 'Quà tặng',
      icon: Gift,
      tone: 'gift',
    };
  }

  if (
    action.includes('purchase')
    || action.includes('cart')
  ) {
    return {
      group: 'finance',
      label: 'Mua tài liệu',
      icon: ShoppingCart,
      tone: 'purchase',
    };
  }

  if (
    action.includes('payment')
    || action.includes('topup')
    || action.includes('withdraw')
    || action.includes('premium')
  ) {
    return {
      group: 'finance',
      label: 'Giao dịch',
      icon: WalletCards,
      tone: 'finance',
    };
  }

  if (
    action.includes('comment')
    || action.includes('reply')
  ) {
    return {
      group: 'interaction',
      label: 'Bình luận',
      icon: MessageCircle,
      tone: 'comment',
    };
  }

  if (
    action.includes('like')
    || action.includes('favorite')
    || action.includes('bookmark')
  ) {
    return {
      group: 'interaction',
      label: 'Tương tác',
      icon: Heart,
      tone: 'like',
    };
  }

  if (
    action.includes('rating')
    || action.includes('review')
  ) {
    return {
      group: 'interaction',
      label: 'Đánh giá',
      icon: Star,
      tone: 'rating',
    };
  }

  if (
    action.includes('view')
    || action.includes('open')
    || action.includes('read')
  ) {
    return {
      group: 'document',
      label: 'Đã xem',
      icon: Eye,
      tone: 'view',
    };
  }

  return {
    group: item.target_type === 'document'
      ? 'document'
      : 'interaction',
    label: 'Hoạt động',
    icon: Activity,
    tone: 'default',
  };
}

function getTargetUrl(item) {
  if (!item?.target_id) {
    if (item?.target_type === 'payment_request') {
      return '/wallet';
    }

    if (item?.target_type === 'cart') {
      return '/documents';
    }

    return null;
  }

  switch (item.target_type) {
    case 'document':
      return `/documents/${item.target_id}`;

    case 'post':
      return `/feed?post=${item.target_id}`;

    case 'profile':
    case 'user':
      return `/profile/${item.target_id}`;

    case 'payment_request':
      return '/wallet';

    default:
      return null;
  }
}

function formatDate(value) {
  if (!value) return '';

  return new Intl.DateTimeFormat(
    'vi-VN',
    {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  ).format(new Date(value));
}

function getDescription(item) {
  const metadata = item?.metadata || {};

  if (item.action_type === 'gift') {
    const giftName = metadata.gift_name;
    const giftIcon = metadata.gift_icon || '🎁';
    const credit = metadata.cost_credit;

    if (giftName) {
      return `${giftIcon} ${giftName}${credit ? ` · ${credit} credit` : ''}`;
    }
  }

  if (item.action_type === 'purchase') {
    const finalPrice = metadata.final_price;

    if (finalPrice !== undefined) {
      return `Đã thanh toán ${finalPrice} credit`;
    }
  }

  if (item.action_type === 'payment_request') {
    const amount = Number(metadata.amount_vnd || 0);

    if (amount > 0) {
      return `${amount.toLocaleString('vi-VN')}đ · ${metadata.status || 'pending'}`;
    }
  }

  if (metadata.document_title) {
    return metadata.document_title;
  }

  if (metadata.note) {
    return metadata.note;
  }

  return 'Hoạt động đã được lưu trên hệ thống.';
}

export default function History() {
  const { currentUser } = useApp();

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = useCallback(
    async (silent = false) => {
      if (!currentUser?.id) {
        setItems([]);
        setLoading(false);
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const {
        data,
        error: queryError,
      } = await supabase
        .from('activity_history')
        .select(`
          id,
          action_type,
          target_type,
          target_id,
          title,
          metadata,
          created_at
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', {
          ascending: false,
        })
        .limit(150);

      if (queryError) {
        setError(queryError.message);
      } else {
        setItems(data || []);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [currentUser?.id],
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const counts = useMemo(() => {
    const result = {
      all: items.length,
      document: 0,
      interaction: 0,
      gift: 0,
      finance: 0,
    };

    items.forEach((item) => {
      const config = getActionConfig(item);
      result[config.group] += 1;
    });

    return result;
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = keyword
      .trim()
      .toLocaleLowerCase('vi');

    return items.filter((item) => {
      const config = getActionConfig(item);

      const matchesFilter = (
        filter === 'all'
        || config.group === filter
      );

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        item.title,
        item.action_type,
        item.target_type,
        getDescription(item),
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('vi')
        .includes(query);
    });
  }, [
    filter,
    items,
    keyword,
  ]);

  return (
    <div className="page history-page-v76">
      <section className="history-hero-v76">
        <div>
          <span className="history-eyebrow-v76">
            NHẬT KÝ CÁ NHÂN
          </span>

          <h1>Lịch sử hoạt động</h1>

          <p>
            Theo dõi các tài liệu đã xem, tương tác,
            quà tặng và giao dịch gần đây của bạn.
          </p>
        </div>

        <button
          type="button"
          className="history-refresh-v76"
          onClick={() => loadHistory(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? 'is-spinning-v76' : ''}
          />

          {refreshing ? 'Đang tải...' : 'Làm mới'}
        </button>
      </section>

      <section className="history-summary-v76">
        <article>
          <span>
            <Activity size={17} />
          </span>

          <div>
            <small>Tổng hoạt động</small>
            <strong>{counts.all}</strong>
          </div>
        </article>

        <article>
          <span>
            <BookOpen size={17} />
          </span>

          <div>
            <small>Tài liệu</small>
            <strong>{counts.document}</strong>
          </div>
        </article>

        <article>
          <span>
            <Heart size={17} />
          </span>

          <div>
            <small>Tương tác</small>
            <strong>{counts.interaction}</strong>
          </div>
        </article>

        <article>
          <span>
            <Gift size={17} />
          </span>

          <div>
            <small>Quà tặng</small>
            <strong>{counts.gift}</strong>
          </div>
        </article>
      </section>

      <section className="history-toolbar-v76">
        <div className="history-filters-v76">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={filter === item.id ? 'is-active' : ''}
              onClick={() => setFilter(item.id)}
            >
              {item.label}

              <span>{counts[item.id] || 0}</span>
            </button>
          ))}
        </div>

        <label className="history-search-v76">
          <Search size={15} />

          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm trong lịch sử..."
          />
        </label>
      </section>

      <section className="history-content-v76">
        {loading ? (
          <div className="history-state-v76">
            <RefreshCw
              size={25}
              className="is-spinning-v76"
            />

            <strong>Đang tải lịch sử...</strong>
          </div>
        ) : error ? (
          <div className="history-state-v76 history-state-v76--error">
            <Activity size={26} />

            <strong>Không tải được lịch sử</strong>

            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadHistory()}
            >
              Thử lại
            </button>
          </div>
        ) : filteredItems.length ? (
          <div className="history-timeline-v76">
            {filteredItems.map((item) => {
              const config = getActionConfig(item);
              const Icon = config.icon;
              const targetUrl = getTargetUrl(item);

              const content = (
                <>
                  <span
                    className={`history-item-v76__icon history-item-v76__icon--${config.tone}`}
                  >
                    <Icon size={18} />
                  </span>

                  <span className="history-item-v76__content">
                    <span className="history-item-v76__top">
                      <span className="history-item-v76__type">
                        {config.label}
                      </span>

                      <time>
                        <Clock3 size={12} />
                        {formatDate(item.created_at)}
                      </time>
                    </span>

                    <strong>
                      {item.title || 'Hoạt động mới'}
                    </strong>

                    <small>
                      {getDescription(item)}
                    </small>
                  </span>

                  {targetUrl ? (
                    <ArrowRightIcon />
                  ) : null}
                </>
              );

              if (targetUrl) {
                return (
                  <Link
                    key={item.id}
                    to={targetUrl}
                    className="history-item-v76"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <article
                  key={item.id}
                  className="history-item-v76"
                >
                  {content}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="history-state-v76">
            <Clock3 size={28} />

            <strong>Chưa có hoạt động phù hợp</strong>

            <span>
              Hãy xem tài liệu, tương tác hoặc thay đổi bộ lọc.
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <span className="history-item-v76__arrow">
      →
    </span>
  );
}
