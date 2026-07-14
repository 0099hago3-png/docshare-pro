import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Gift,
  Heart,
  MessageCircle,
  Search,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BotanicalHero from '../components/BotanicalHero.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatDateTime, normalizeError } from '../lib/helpers.js';
import { normalizeSearchText } from '../lib/searchEngine.js';
import { supabase } from '../lib/supabase.js';

const HISTORY_TYPES = [
  ['all', Clock3, 'Tất cả'],
  ['view', Eye, 'Đã xem'],
  ['like', Heart, 'Đã thích'],
  ['comment', MessageCircle, 'Bình luận'],
  ['rating', Star, 'Đánh giá'],
  ['bookmark', Bookmark, 'Đã lưu'],
  ['purchase', ShoppingBag, 'Đã mua'],
  ['download', Download, 'Đã tải'],
  ['gift', Gift, 'Đã tặng quà'],
];

const TYPE_CONFIG = {
  view: { icon: Eye, label: 'Đã xem', tone: 'blue' },
  like: { icon: Heart, label: 'Đã thích', tone: 'red' },
  comment: { icon: MessageCircle, label: 'Đã bình luận', tone: 'green' },
  rating: { icon: Star, label: 'Đã đánh giá', tone: 'yellow' },
  bookmark: { icon: Bookmark, label: 'Đã lưu', tone: 'teal' },
  purchase: { icon: ShoppingBag, label: 'Đã mua', tone: 'purple' },
  cart_purchase: { icon: ShoppingBag, label: 'Thanh toán giỏ hàng', tone: 'purple' },
  download: { icon: Download, label: 'Đã tải', tone: 'indigo' },
  gift: { icon: Gift, label: 'Đã tặng quà', tone: 'orange' },
  post_like: { icon: Heart, label: 'Thích bài viết', tone: 'red' },
  post_comment: { icon: MessageCircle, label: 'Bình luận bài viết', tone: 'green' },
};

function normalizedType(item) {
  if (item.action_type === 'cart_purchase') return 'purchase';
  if (item.action_type === 'post_like') return 'like';
  if (item.action_type === 'post_comment') return 'comment';
  return item.action_type;
}

function targetUrl(item) {
  if (item.metadata?.target_url) return item.metadata.target_url;
  if (!item.target_id) return null;

  if (item.target_type === 'document') return `/documents/${item.target_id}`;
  if (item.target_type === 'post') return `/feed?post=${item.target_id}`;
  if (item.target_type === 'profile') return `/profile/${item.target_id}`;

  return null;
}

function historyDescription(item) {
  const metadata = item.metadata || {};

  if (item.action_type === 'gift') {
    const giftName = metadata.gift_name || 'quà tặng';
    const cost = metadata.cost_credit ? ` · ${metadata.cost_credit} credit` : '';
    return `${metadata.gift_icon || '🎁'} ${giftName}${cost}`;
  }

  if (item.action_type === 'purchase') {
    const finalPrice = metadata.final_price;
    const discount = metadata.discount_credit;
    if (finalPrice != null) {
      return `Đã thanh toán ${finalPrice} credit${discount ? ` · tiết kiệm ${discount} credit` : ''}`;
    }
  }

  if (item.action_type === 'cart_purchase') {
    return `Đã mua ${metadata.purchased_count || 0} tài liệu · tổng ${metadata.final_total || 0} credit`;
  }

  return metadata.description || TYPE_CONFIG[item.action_type]?.label || 'Hoạt động trên DocShare Pro';
}

export default function History() {
  const { currentUser, toast } = useApp();
  const [items, setItems] = useState([]);
  const [activeType, setActiveType] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase
      .from('activity_history')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) toast(normalizeError(error), 'error');
        else setItems(data || []);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentUser.id, toast]);

  const counts = useMemo(() => {
    const result = { all: items.length };

    items.forEach((item) => {
      const type = normalizedType(item);
      result[type] = (result[type] || 0) + 1;
    });

    return result;
  }, [items]);

  const filtered = useMemo(() => {
    const keyword = normalizeSearchText(query);

    return items.filter((item) => {
      if (activeType !== 'all' && normalizedType(item) !== activeType) return false;
      if (!keyword) return true;

      return normalizeSearchText([
        item.title,
        item.action_type,
        item.target_type,
        historyDescription(item),
      ].filter(Boolean).join(' ')).includes(keyword);
    });
  }, [activeType, items, query]);

  return (
    <div className="page history-page-v70-2">
      <BotanicalHero
        compact
        eyebrow="DẤU CHÂN HỌC TẬP"
        title="Lịch sử hoạt động"
        description="Theo dõi đầy đủ lịch sử xem, thích, bình luận, đánh giá, mua, tải và tặng quà."
      />

      <section className="history-summary-v70-2 botanical-card">
        <div>
          <span><Clock3 size={20} /></span>
          <small>Tổng hoạt động</small>
          <strong>{items.length}</strong>
        </div>
        <div>
          <span><Eye size={20} /></span>
          <small>Lượt đã xem</small>
          <strong>{counts.view || 0}</strong>
        </div>
        <div>
          <span><Heart size={20} /></span>
          <small>Lượt đã thích</small>
          <strong>{counts.like || 0}</strong>
        </div>
        <div>
          <span><CheckCircle2 size={20} /></span>
          <small>Tài liệu đã mua</small>
          <strong>{counts.purchase || 0}</strong>
        </div>
      </section>

      <section className="history-toolbar-v70-2 botanical-card">
        <div className="history-tabs-v70-2">
          {HISTORY_TYPES.map(([value, Icon, label]) => (
            <button
              className={activeType === value ? 'is-active' : ''}
              key={value}
              type="button"
              onClick={() => setActiveType(value)}
            >
              <Icon size={16} />
              <span>{label}</span>
              <b>{counts[value] || 0}</b>
            </button>
          ))}
        </div>

        <label className="history-search-v70-2">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm trong lịch sử..."
          />
        </label>
      </section>

      {loading ? (
        <Loading />
      ) : filtered.length ? (
        <div className="history-list-v70-2 botanical-card">
          {filtered.map((item) => {
            const config = TYPE_CONFIG[item.action_type] || {
              icon: BookOpen,
              label: item.action_type,
              tone: 'green',
            };
            const Icon = config.icon;
            const url = targetUrl(item);

            const content = (
              <>
                <span className={`history-icon-v70-2 is-${config.tone}`}>
                  <Icon size={20} />
                </span>
                <div className="history-copy-v70-2">
                  <span className="history-type-v70-2">{config.label}</span>
                  <strong>{item.title || config.label}</strong>
                  <p>{historyDescription(item)}</p>
                  <small>{formatDateTime(item.created_at)}</small>
                </div>
                {url && <span className="history-open-v70-2">Mở</span>}
              </>
            );

            return url ? (
              <Link className="history-item-v70-2" key={item.id} to={url}>
                {content}
              </Link>
            ) : (
              <article className="history-item-v70-2" key={item.id}>
                {content}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Chưa có hoạt động phù hợp"
          description="Hãy chọn mục khác hoặc xóa từ khóa tìm kiếm."
        />
      )}
    </div>
  );
}
