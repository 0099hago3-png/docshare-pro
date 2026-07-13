import { BarChart3, BookOpen, Download, Eye, FileText, Heart, MessageCircle, Star, WalletCards } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import EmptyState from './EmptyState.jsx';
import StockAnalyticsChart, { AnalyticsMetricCard } from './StockAnalyticsChart.jsx';
import { formatCredit, formatCompact, makeDaySeries, percentChange, toNumber } from '../lib/analytics.js';
import { normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';

const RANGE_OPTIONS = [7, 30, 90];

function countByDate(items, field) {
  const map = new Map();
  for (const item of items || []) {
    const key = String(item?.[field] || '').slice(0, 10);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

function changeFromSeries(values) {
  const middle = Math.max(1, Math.floor(values.length / 2));
  const previous = values.slice(0, middle).reduce((sum, value) => sum + toNumber(value), 0);
  const current = values.slice(middle).reduce((sum, value) => sum + toNumber(value), 0);
  return percentChange(current, previous);
}

export default function CreatorAnalyticsPanel({ userId }) {
  const [range, setRange] = useState(30);
  const [mode, setMode] = useState('engagement');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [raw, setRaw] = useState({
    documents: [], posts: [], views: [], downloads: [], documentLikes: [], documentComments: [], ratings: [], purchases: [], postLikes: [], postComments: [], gifts: [],
  });

  const load = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError('');

      const [{ data: documents, error: documentError }, { data: posts, error: postError }] = await Promise.all([
        supabase.from('documents').select('id,title,created_at,status').eq('author_id', userId).order('created_at', { ascending: false }),
        supabase.from('posts').select('id,title,content,created_at,status').eq('author_id', userId).order('created_at', { ascending: false }),
      ]);

      if (documentError) throw documentError;
      if (postError) throw postError;

      const documentIds = (documents || []).map((item) => item.id);
      const postIds = (posts || []).map((item) => item.id);
      const emptyResult = Promise.resolve({ data: [], error: null });

      const [views, downloads, documentLikes, documentComments, ratings, purchases, postLikes, postComments, gifts] = await Promise.all([
        documentIds.length ? supabase.from('document_views').select('document_id,viewed_at').in('document_id', documentIds) : emptyResult,
        documentIds.length ? supabase.from('document_downloads').select('document_id,downloaded_at').in('document_id', documentIds) : emptyResult,
        documentIds.length ? supabase.from('document_likes').select('document_id,created_at').in('document_id', documentIds) : emptyResult,
        documentIds.length ? supabase.from('document_comments').select('document_id,created_at').in('document_id', documentIds) : emptyResult,
        documentIds.length ? supabase.from('document_ratings').select('document_id,rating,created_at').in('document_id', documentIds) : emptyResult,
        documentIds.length ? supabase.from('document_purchases').select('document_id,price_credit,created_at').in('document_id', documentIds) : emptyResult,
        postIds.length ? supabase.from('post_likes').select('post_id,created_at').in('post_id', postIds) : emptyResult,
        postIds.length ? supabase.from('post_comments').select('post_id,created_at').in('post_id', postIds) : emptyResult,
        supabase.from('gift_transactions').select('receiver_id,receiver_credit,created_at').eq('receiver_id', userId),
      ]);

      const allResults = [views, downloads, documentLikes, documentComments, ratings, purchases, postLikes, postComments, gifts];
      const firstError = allResults.find((item) => item.error)?.error;
      if (firstError) throw firstError;

      setRaw({
        documents: documents || [],
        posts: posts || [],
        views: views.data || [],
        downloads: downloads.data || [],
        documentLikes: documentLikes.data || [],
        documentComments: documentComments.data || [],
        ratings: ratings.data || [],
        purchases: purchases.data || [],
        postLikes: postLikes.data || [],
        postComments: postComments.data || [],
        gifts: gifts.data || [],
      });
    } catch (nextError) {
      setError(normalizeError(nextError));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const analytics = useMemo(() => {
    const days = makeDaySeries(range);
    const maps = {
      documents: countByDate(raw.documents, 'created_at'),
      posts: countByDate(raw.posts, 'created_at'),
      views: countByDate(raw.views, 'viewed_at'),
      downloads: countByDate(raw.downloads, 'downloaded_at'),
      documentLikes: countByDate(raw.documentLikes, 'created_at'),
      documentComments: countByDate(raw.documentComments, 'created_at'),
      postLikes: countByDate(raw.postLikes, 'created_at'),
      postComments: countByDate(raw.postComments, 'created_at'),
      purchases: countByDate(raw.purchases, 'created_at'),
      gifts: countByDate(raw.gifts, 'created_at'),
    };

    const data = days.map((day) => ({
      ...day,
      documents: maps.documents.get(day.key) || 0,
      posts: maps.posts.get(day.key) || 0,
      views: maps.views.get(day.key) || 0,
      downloads: maps.downloads.get(day.key) || 0,
      likes: (maps.documentLikes.get(day.key) || 0) + (maps.postLikes.get(day.key) || 0),
      comments: (maps.documentComments.get(day.key) || 0) + (maps.postComments.get(day.key) || 0),
      sales: maps.purchases.get(day.key) || 0,
      gifts: maps.gifts.get(day.key) || 0,
      credit: raw.purchases.filter((item) => String(item.created_at).slice(0, 10) === day.key).reduce((sum, item) => sum + toNumber(item.price_credit), 0)
        + raw.gifts.filter((item) => String(item.created_at).slice(0, 10) === day.key).reduce((sum, item) => sum + toNumber(item.receiver_credit), 0),
    }));

    const totalLikes = raw.documentLikes.length + raw.postLikes.length;
    const totalComments = raw.documentComments.length + raw.postComments.length;
    const totalCredit = raw.purchases.reduce((sum, item) => sum + toNumber(item.price_credit), 0)
      + raw.gifts.reduce((sum, item) => sum + toNumber(item.receiver_credit), 0);
    const averageRating = raw.ratings.length
      ? raw.ratings.reduce((sum, item) => sum + toNumber(item.rating), 0) / raw.ratings.length
      : 0;

    const documentStats = raw.documents.map((document) => ({
      ...document,
      views: raw.views.filter((item) => item.document_id === document.id).length,
      downloads: raw.downloads.filter((item) => item.document_id === document.id).length,
      likes: raw.documentLikes.filter((item) => item.document_id === document.id).length,
      comments: raw.documentComments.filter((item) => item.document_id === document.id).length,
      sales: raw.purchases.filter((item) => item.document_id === document.id).length,
      credit: raw.purchases.filter((item) => item.document_id === document.id).reduce((sum, item) => sum + toNumber(item.price_credit), 0),
    })).sort((a, b) => (b.views + b.downloads * 2 + b.likes * 2 + b.sales * 4) - (a.views + a.downloads * 2 + a.likes * 2 + a.sales * 4));

    return { data, totalLikes, totalComments, totalCredit, averageRating, documentStats };
  }, [range, raw]);

  const chartConfig = mode === 'content'
    ? { title: 'Nhịp độ đăng nội dung', subtitle: 'Số tài liệu và bài viết bạn đã đăng theo ngày.', series: [{ key: 'documents', label: 'Tài liệu' }, { key: 'posts', label: 'Bài viết' }] }
    : mode === 'income'
      ? { title: 'Thu nhập nội dung', subtitle: 'Credit từ bán tài liệu và quà tặng.', series: [{ key: 'credit', label: 'Credit nhận' }, { key: 'sales', label: 'Lượt mua' }, { key: 'gifts', label: 'Quà nhận' }] }
      : { title: 'Biến động tương tác', subtitle: 'Lượt xem, tải xuống, thích và bình luận theo ngày.', series: [{ key: 'views', label: 'Lượt xem' }, { key: 'downloads', label: 'Tải xuống' }, { key: 'likes', label: 'Lượt thích' }, { key: 'comments', label: 'Bình luận' }] };

  const viewsSeries = analytics.data.map((item) => item.views);
  const downloadSeries = analytics.data.map((item) => item.downloads);
  const likeSeries = analytics.data.map((item) => item.likes);
  const creditSeries = analytics.data.map((item) => item.credit);

  if (error) {
    return <section className="creator-analytics botanical-card"><EmptyState title="Chưa tải được thống kê" description={error} /></section>;
  }

  return (
    <section className="creator-analytics">
      <div className="creator-analytics__heading">
        <div><span className="analytics-eyebrow">TRUNG TÂM TÁC GIẢ</span><h2>Thống kê nội dung của bạn</h2><p>Dữ liệu lấy trực tiếp từ lượt xem, tải xuống, tương tác và giao dịch trên hệ thống.</p></div>
        <div className="analytics-range-tabs">{RANGE_OPTIONS.map((item) => <button key={item} type="button" className={range === item ? 'is-active' : ''} onClick={() => setRange(item)}>{item} ngày</button>)}</div>
      </div>

      <div className="creator-kpi-grid">
        <AnalyticsMetricCard icon={BookOpen} label="Tài liệu đã đăng" value={formatCompact(raw.documents.length)} change={changeFromSeries(analytics.data.map((item) => item.documents))} values={analytics.data.map((item) => item.documents)} />
        <AnalyticsMetricCard icon={FileText} label="Bài viết đã đăng" value={formatCompact(raw.posts.length)} change={changeFromSeries(analytics.data.map((item) => item.posts))} values={analytics.data.map((item) => item.posts)} />
        <AnalyticsMetricCard icon={Eye} label="Lượt xem tài liệu" value={formatCompact(raw.views.length)} change={changeFromSeries(viewsSeries)} values={viewsSeries} />
        <AnalyticsMetricCard icon={Download} label="Lượt tải xuống" value={formatCompact(raw.downloads.length)} change={changeFromSeries(downloadSeries)} values={downloadSeries} />
        <AnalyticsMetricCard icon={Heart} label="Tổng lượt thích" value={formatCompact(analytics.totalLikes)} change={changeFromSeries(likeSeries)} values={likeSeries} />
        <AnalyticsMetricCard icon={MessageCircle} label="Tổng bình luận" value={formatCompact(analytics.totalComments)} change={changeFromSeries(analytics.data.map((item) => item.comments))} values={analytics.data.map((item) => item.comments)} />
        <AnalyticsMetricCard icon={Star} label="Điểm đánh giá" value={`${analytics.averageRating.toFixed(1)} / 5`} change={0} values={analytics.data.map((item) => item.sales)} helper={`${raw.ratings.length} lượt đánh giá`} />
        <AnalyticsMetricCard icon={WalletCards} label="Credit đã nhận" value={formatCredit(analytics.totalCredit)} change={changeFromSeries(creditSeries)} values={creditSeries} />
      </div>

      <div className="analytics-mode-tabs">
        <button type="button" className={mode === 'engagement' ? 'is-active' : ''} onClick={() => setMode('engagement')}><BarChart3 size={16} /> Tương tác</button>
        <button type="button" className={mode === 'content' ? 'is-active' : ''} onClick={() => setMode('content')}><FileText size={16} /> Đăng bài</button>
        <button type="button" className={mode === 'income' ? 'is-active' : ''} onClick={() => setMode('income')}><WalletCards size={16} /> Thu nhập</button>
      </div>

      <StockAnalyticsChart
        title={chartConfig.title}
        subtitle={chartConfig.subtitle}
        data={analytics.data}
        series={chartConfig.series}
        valueFormatter={(value, series) => series.key === 'credit' ? formatCredit(value) : new Intl.NumberFormat('vi-VN').format(toNumber(value))}
        emptyText={loading ? 'Đang tải số liệu...' : 'Bạn chưa có hoạt động trong khoảng thời gian này.'}
      />

      <section className="analytics-detail-card">
        <div className="analytics-detail-card__header"><div><BookOpen size={19} /><h3>Hiệu quả từng tài liệu</h3></div><span>Top {Math.min(8, analytics.documentStats.length)} tài liệu</span></div>
        {analytics.documentStats.length ? (
          <div className="analytics-table-scroll"><table className="analytics-table"><thead><tr><th>Tài liệu</th><th>Lượt xem</th><th>Tải xuống</th><th>Thích</th><th>Bình luận</th><th>Lượt mua</th><th>Credit</th></tr></thead><tbody>{analytics.documentStats.slice(0, 8).map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.status}</small></td><td>{formatCompact(item.views)}</td><td>{formatCompact(item.downloads)}</td><td>{formatCompact(item.likes)}</td><td>{formatCompact(item.comments)}</td><td>{formatCompact(item.sales)}</td><td><b>{formatCredit(item.credit)}</b></td></tr>)}</tbody></table></div>
        ) : <EmptyState title="Chưa có tài liệu" description="Khi bạn đăng tài liệu, hiệu quả từng tài liệu sẽ xuất hiện tại đây." />}
      </section>
    </section>
  );
}
