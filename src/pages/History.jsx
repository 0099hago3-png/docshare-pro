import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { EmptyState, PageHeader } from '../components/LiveUI.jsx';

const typeLabels = {
  view: 'Đã xem',
  like: 'Đã thích',
  comment: 'Đã bình luận',
  purchase: 'Đã mua',
  upload: 'Đã đăng',
  gift: 'Đã tặng quà',
};

export default function History() {
  const { state } = useApp();
  const [filter, setFilter] = useState('all');

  const history = useMemo(() => (
    filter === 'all'
      ? state.history
      : state.history.filter((item) => item.type === filter)
  ), [filter, state.history]);

  return (
    <div className="live-page">
      <PageHeader
        eyebrow="HOẠT ĐỘNG ĐƯỢC LƯU"
        title="Lịch sử của bạn"
        text="Lượt xem, tim, bình luận, mua tài liệu và các hoạt động thật được lấy từ bảng activity_history."
      />

      <div className="live-filter-tabs">
        {[
          ['all', 'Tất cả'],
          ['view', 'Đã xem'],
          ['like', 'Đã thích'],
          ['comment', 'Bình luận'],
          ['purchase', 'Đã mua'],
          ['upload', 'Đã đăng'],
        ].map(([value, label]) => (
          <button
            key={value}
            className={filter === value ? 'active' : ''}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {history.length ? (
        <div className="live-history-list">
          {history.map((item) => {
            const targetUrl = item.targetType === 'document' && item.targetId
              ? `/documents/${item.targetId}`
              : item.targetType === 'post'
                ? '/feed'
                : null;

            const content = (
              <>
                <div className="live-history-icon">{item.type === 'view' ? '👁' : item.type === 'like' ? '♥' : item.type === 'comment' ? '💬' : item.type === 'purchase' ? '🛒' : item.type === 'upload' ? '📤' : '•'}</div>
                <div>
                  <span>{typeLabels[item.type] || item.type}</span>
                  <h3>{item.title}</h3>
                  <small>{item.date}</small>
                </div>
              </>
            );

            return targetUrl ? (
              <Link className="live-history-item" key={item.id} to={targetUrl}>{content}</Link>
            ) : (
              <article className="live-history-item" key={item.id}>{content}</article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="🕘"
          title="Chưa có lịch sử"
          text="Dữ liệu sẽ xuất hiện sau khi bạn xem, thích, bình luận hoặc đăng tài liệu."
        />
      )}
    </div>
  );
}
