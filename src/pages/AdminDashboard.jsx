import {
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  BarChart3,
  CalendarDays,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Coins,
  CreditCard,
  Crown,
  Download,
  Eye,
  FileText,
  Flag,
  Gift,
  HandCoins,
  Heart,
  MessageCircle,
  RefreshCw,
  Repeat2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import StockAnalyticsChart, { AnalyticsMetricCard } from '../components/StockAnalyticsChart.jsx';
import { useApp } from '../context/AppContext.jsx';
import {
  formatCredit,
  formatCurrency,
  makeDaySeries,
  percentChange,
  toNumber,
} from '../lib/analytics.js';
import { formatDateTime, formatNumber, getProfileName, normalizeError } from '../lib/helpers.js';
import { supabase } from '../lib/supabase.js';
import '../payment-admin-report.css';

const tabs = [
  ['overview', BarChart3, 'Thống kê'],
  ['users', Users, 'Người dùng'],
  ['documents', BookOpen, 'Tài liệu'],
  ['posts', FileText, 'Bảng tin'],
  ['payments', CreditCard, 'Nạp / Rút / Premium'],
  ['reports', Flag, 'Báo cáo'],
  ['gifts', Gift, 'Kho quà'],
];

const RANGE_OPTIONS = [7, 30, 90, 365];

const MAX_CUSTOM_RANGE_DAYS = 1096;

function toLocalInputDate(value) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDefaultCustomRange() {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setDate(start.getDate() - 29);

  return {
    start: toLocalInputDate(start),
    end: toLocalInputDate(end),
  };
}

function parseInputDate(value) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function countRangeDays(startValue, endValue) {
  const start = parseInputDate(startValue);
  const end = parseInputDate(endValue);

  if (!start || !end) return 0;

  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
}

function makeCustomDaySeries(startValue, endValue) {
  const start = parseInputDate(startValue);
  const end = parseInputDate(endValue);

  if (!start || !end || start > end) return [];

  const rows = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    rows.push({
      key: toLocalInputDate(cursor),
      label: cursor.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      }),
      fullLabel: cursor.toLocaleDateString('vi-VN'),
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return rows;
}

function formatCustomPeriod(startValue, endValue) {
  const start = parseInputDate(startValue);
  const end = parseInputDate(endValue);

  if (!start || !end) return 'Khoảng ngày tùy chọn';

  return `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`;
}

function dateOnly(value) {
  return String(value || '').slice(0, 10);
}

function countOnDate(items, field, key) {
  return (items || []).filter((item) => dateOnly(item?.[field]) === key).length;
}

function sumOnDate(items, field, key, getter) {
  return (items || [])
    .filter((item) => dateOnly(item?.[field]) === key)
    .reduce((sum, item) => sum + toNumber(getter(item)), 0);
}

function seriesChange(values) {
  const safeValues = values.map(toNumber);
  if (!safeValues.length) return 0;
  const middle = Math.max(1, Math.floor(safeValues.length / 2));
  const previous = safeValues.slice(0, middle).reduce((sum, value) => sum + value, 0);
  const current = safeValues.slice(middle).reduce((sum, value) => sum + value, 0);
  return percentChange(current, previous);
}

function csvCell(value) {
  const text = String(value ?? '').replace(/"/g, '""');
  return `"${text}"`;
}

function requestSearchText(item) {
  return [
    item?.type,
    item?.plan_code,
    item?.transfer_note,
    item?.admin_note,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('vi');
}

function isRenewalRequest(item) {
  const text = requestSearchText(item);
  return text.includes('gia hạn') || text.includes('giahan') || text.includes('renew');
}

function splitSubscriptions(subscriptions = []) {
  const ordered = [...subscriptions].sort(
    (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
  );
  const seen = new Set();
  const first = [];
  const renewals = [];

  for (const item of ordered) {
    if (seen.has(item.user_id)) renewals.push(item);
    else {
      first.push(item);
      seen.add(item.user_id);
    }
  }

  return { first, renewals };
}

function QuickStatButton({ active, icon: Icon, label, value, helper, onClick, tone = 'green' }) {
  return (
    <button
      type="button"
      className={`analytics-quick-stat is-${tone}${active ? ' is-active' : ''}`}
      onClick={onClick}
    >
      <span className="analytics-quick-stat__icon"><Icon size={18} /></span>
      <span className="analytics-quick-stat__copy">
        <small>{label}</small>
        <strong>{value}</strong>
        <em>{helper}</em>
      </span>
      <ArrowUpRight className="analytics-quick-stat__arrow" size={15} />
    </button>
  );
}

export default function AdminDashboard() {
  const { toast } = useApp();
  const [tab, setTab] = useState('overview');
  const [range, setRange] = useState(30);
  const [customRangeOpen, setCustomRangeOpen] = useState(false);
  const [customRangeDraft, setCustomRangeDraft] = useState(() => getDefaultCustomRange());
  const [appliedCustomRange, setAppliedCustomRange] = useState(null);
  const [metricFocus, setMetricFocus] = useState('overview');
  const [data, setData] = useState({
    profiles: [],
    documents: [],
    posts: [],
    requests: [],
    gifts: [],
    logs: [],
    views: [],
    downloads: [],
    documentLikes: [],
    documentComments: [],
    ratings: [],
    purchases: [],
    postLikes: [],
    postComments: [],
    giftTransactions: [],
    subscriptions: [],
    reports: [],
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const results = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('documents').select('id,title,status,price_credit,created_at,author_id,category_id,profiles:author_id(full_name,username,email),categories:category_id(name)').order('created_at', { ascending: false }),
        supabase.from('posts').select('id,title,content,status,created_at,author_id,profiles:author_id(full_name,username,email)').order('created_at', { ascending: false }),
        supabase.from('payment_requests').select('*,profiles:user_id(full_name,username,email,public_id),bank_accounts(*)').order('created_at', { ascending: false }),
        supabase.from('gifts').select('*').order('sort_order'),
        supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('document_views').select('document_id,user_id,viewed_at'),
        supabase.from('document_downloads').select('document_id,user_id,downloaded_at'),
        supabase.from('document_likes').select('document_id,user_id,created_at'),
        supabase.from('document_comments').select('id,document_id,user_id,created_at'),
        supabase.from('document_ratings').select('document_id,user_id,rating,created_at'),
        supabase.from('document_purchases').select('id,document_id,buyer_id,seller_id,price_credit,created_at'),
        supabase.from('post_likes').select('post_id,user_id,created_at'),
        supabase.from('post_comments').select('id,post_id,user_id,created_at'),
        supabase.from('gift_transactions').select('id,gift_id,sender_id,receiver_id,cost_credit,receiver_credit,created_at'),
        supabase.from('premium_subscriptions').select('id,user_id,plan_code,starts_at,ends_at,status,created_at').order('created_at', { ascending: false }),
        supabase.from('reports').select('*,reporter:reporter_id(full_name,username,email,public_id),reported_user:reported_user_id(full_name,username,email,public_id)').order('created_at', { ascending: false }),
      ]);

      const firstError = results.find((item) => item.error)?.error;
      if (firstError) throw firstError;

      setData({
        profiles: results[0].data || [],
        documents: results[1].data || [],
        posts: results[2].data || [],
        requests: results[3].data || [],
        gifts: results[4].data || [],
        logs: results[5].data || [],
        views: results[6].data || [],
        downloads: results[7].data || [],
        documentLikes: results[8].data || [],
        documentComments: results[9].data || [],
        ratings: results[10].data || [],
        purchases: results[11].data || [],
        postLikes: results[12].data || [],
        postComments: results[13].data || [],
        giftTransactions: results[14].data || [],
        subscriptions: results[15].data || [],
        reports: results[16].data || [],
      });
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const analytics = useMemo(() => {
    const days = appliedCustomRange
      ? makeCustomDaySeries(appliedCustomRange.start, appliedCustomRange.end)
      : makeDaySeries(range);
    const approvedRequests = data.requests.filter((item) => item.status === 'approved');
    const pendingRequests = data.requests.filter((item) => item.status === 'pending');

    const topupApproved = approvedRequests.filter((item) => item.type === 'topup');
    const withdrawApproved = approvedRequests.filter((item) => item.type === 'withdraw');
    const premiumApproved = approvedRequests.filter((item) => item.type === 'premium' && !isRenewalRequest(item));
    const renewalApproved = approvedRequests.filter((item) => item.type === 'premium' && isRenewalRequest(item));

    const topupPending = pendingRequests.filter((item) => item.type === 'topup');
    const withdrawPending = pendingRequests.filter((item) => item.type === 'withdraw');
    const premiumPending = pendingRequests.filter((item) => item.type === 'premium' && !isRenewalRequest(item));
    const renewalPending = pendingRequests.filter((item) => item.type === 'premium' && isRenewalRequest(item));

    const subscriptionGroups = splitSubscriptions(data.subscriptions);
    const renewalRows = subscriptionGroups.renewals;
    const newPremiumRows = subscriptionGroups.first;

    const inflowRequests = [...topupApproved, ...premiumApproved, ...renewalApproved];

    const daily = days.map((day) => {
      const topupAmount = sumOnDate(topupApproved, 'processed_at', day.key, (item) => item.amount_vnd);
      const withdrawAmount = sumOnDate(withdrawApproved, 'processed_at', day.key, (item) => item.amount_vnd);
      const premiumAmount = sumOnDate(premiumApproved, 'processed_at', day.key, (item) => item.amount_vnd);
      const renewalAmount = sumOnDate(renewalApproved, 'processed_at', day.key, (item) => item.amount_vnd);
      const donationCredit = sumOnDate(data.giftTransactions, 'created_at', day.key, (item) => item.cost_credit);
      const purchaseCredit = sumOnDate(data.purchases, 'created_at', day.key, (item) => item.price_credit);
      const likes = countOnDate(data.documentLikes, 'created_at', day.key) + countOnDate(data.postLikes, 'created_at', day.key);
      const comments = countOnDate(data.documentComments, 'created_at', day.key) + countOnDate(data.postComments, 'created_at', day.key);

      return {
        ...day,
        inflow: topupAmount + premiumAmount + renewalAmount,
        outflow: withdrawAmount,
        topupAmount,
        topupCount: countOnDate(topupApproved, 'processed_at', day.key),
        withdrawAmount,
        withdrawCount: countOnDate(withdrawApproved, 'processed_at', day.key),
        premiumAmount,
        premiumCount: countOnDate(newPremiumRows, 'created_at', day.key),
        renewalAmount,
        renewalCount: countOnDate(renewalRows, 'created_at', day.key),
        donationCredit,
        donationCount: countOnDate(data.giftTransactions, 'created_at', day.key),
        users: countOnDate(data.profiles, 'created_at', day.key),
        documents: countOnDate(data.documents, 'created_at', day.key),
        posts: countOnDate(data.posts, 'created_at', day.key),
        views: countOnDate(data.views, 'viewed_at', day.key),
        downloads: countOnDate(data.downloads, 'downloaded_at', day.key),
        likes,
        comments,
        interactions: likes + comments,
        purchases: countOnDate(data.purchases, 'created_at', day.key),
        purchaseCredit,
        gifts: countOnDate(data.giftTransactions, 'created_at', day.key),
      };
    });

    const totalTopup = topupApproved.reduce((sum, item) => sum + toNumber(item.amount_vnd), 0);
    const totalWithdraw = withdrawApproved.reduce((sum, item) => sum + toNumber(item.amount_vnd), 0);
    const totalPremium = premiumApproved.reduce((sum, item) => sum + toNumber(item.amount_vnd), 0);
    const totalRenewal = renewalApproved.reduce((sum, item) => sum + toNumber(item.amount_vnd), 0);
    const totalInflow = totalTopup + totalPremium + totalRenewal;
    const netCash = totalInflow - totalWithdraw;
    const totalDonationCredit = data.giftTransactions.reduce((sum, item) => sum + toNumber(item.cost_credit), 0);
    const totalPurchaseCredit = data.purchases.reduce((sum, item) => sum + toNumber(item.price_credit), 0);
    const successfulTransactions = approvedRequests.length + data.purchases.length + data.giftTransactions.length;
    const totalInteractions = data.views.length + data.downloads.length + data.documentLikes.length + data.postLikes.length + data.documentComments.length + data.postComments.length;
    const averageRating = data.ratings.length
      ? data.ratings.reduce((sum, item) => sum + toNumber(item.rating), 0) / data.ratings.length
      : 0;

    const categories = new Map();
    for (const document of data.documents) {
      const name = document.categories?.name || 'Khác';
      categories.set(name, (categories.get(name) || 0) + 1);
    }
    const categoryRows = [...categories.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    const maxCategory = Math.max(1, ...categoryRows.map((item) => item.value));

    const topDocuments = data.documents.map((document) => {
      const purchases = data.purchases.filter((item) => item.document_id === document.id);
      const views = data.views.filter((item) => item.document_id === document.id).length;
      const downloads = data.downloads.filter((item) => item.document_id === document.id).length;
      const likes = data.documentLikes.filter((item) => item.document_id === document.id).length;
      const revenueCredit = purchases.reduce((sum, item) => sum + toNumber(item.price_credit), 0);
      return { ...document, purchases: purchases.length, views, downloads, likes, revenueCredit };
    }).sort((a, b) => (b.revenueCredit * 5 + b.downloads * 3 + b.views + b.likes * 2) - (a.revenueCredit * 5 + a.downloads * 3 + a.views + a.likes * 2)).slice(0, 7);

    return {
      daily,
      totalTopup,
      totalWithdraw,
      totalPremium,
      totalRenewal,
      totalInflow,
      netCash,
      totalDonationCredit,
      totalPurchaseCredit,
      successfulTransactions,
      totalInteractions,
      averageRating,
      categoryRows,
      maxCategory,
      topDocuments,
      newPremiumCount: newPremiumRows.length,
      renewalCount: renewalRows.length,
      activePremiumCount: data.profiles.filter((item) => item.premium).length,
      pending: {
        topup: topupPending.length,
        withdraw: withdrawPending.length,
        premium: premiumPending.length,
        renewal: renewalPending.length,
        all: pendingRequests.length,
      },
      approved: {
        topup: topupApproved.length,
        withdraw: withdrawApproved.length,
        premium: premiumApproved.length,
        renewal: renewalApproved.length,
      },
      changes: {
        inflow: seriesChange(daily.map((item) => item.inflow)),
        outflow: seriesChange(daily.map((item) => item.outflow)),
        topup: seriesChange(daily.map((item) => item.topupAmount)),
        withdraw: seriesChange(daily.map((item) => item.withdrawAmount)),
        premium: seriesChange(daily.map((item) => item.premiumAmount)),
        renewal: seriesChange(daily.map((item) => item.renewalCount)),
        donation: seriesChange(daily.map((item) => item.donationCredit)),
        purchases: seriesChange(daily.map((item) => item.purchaseCredit)),
        users: seriesChange(daily.map((item) => item.users)),
        documents: seriesChange(daily.map((item) => item.documents)),
        posts: seriesChange(daily.map((item) => item.posts)),
        views: seriesChange(daily.map((item) => item.views)),
        downloads: seriesChange(daily.map((item) => item.downloads)),
        interactions: seriesChange(daily.map((item) => item.interactions)),
        transactions: seriesChange(daily.map((item) => item.purchases + item.gifts)),
      },
    };
  }, [appliedCustomRange, data, range]);

  const focusConfig = useMemo(() => {
    const configs = {
      overview: {
        title: 'Dòng tiền toàn hệ thống',
        subtitle: 'So sánh tổng tiền vào và tiền rút đã được Admin duyệt.',
        series: [
          { key: 'inflow', label: 'Tiền vào' },
          { key: 'outflow', label: 'Tiền rút' },
        ],
        formatter: formatCurrency,
        summaryLabel: 'Tiền vào',
        primaryKey: 'inflow',
        total: analytics.totalInflow,
        pending: analytics.pending.all,
        approved: analytics.successfulTransactions,
      },
      topup: {
        title: 'Thống kê nạp tiền',
        subtitle: 'Số tiền nạp đã được duyệt theo từng ngày.',
        series: [{ key: 'topupAmount', label: 'Tiền nạp' }],
        formatter: formatCurrency,
        summaryLabel: 'Tiền nạp',
        primaryKey: 'topupAmount',
        total: analytics.totalTopup,
        pending: analytics.pending.topup,
        approved: analytics.approved.topup,
      },
      withdraw: {
        title: 'Thống kê rút tiền',
        subtitle: 'Số tiền rút đã được duyệt theo từng ngày.',
        series: [{ key: 'withdrawAmount', label: 'Tiền rút' }],
        formatter: formatCurrency,
        summaryLabel: 'Tiền rút',
        primaryKey: 'withdrawAmount',
        total: analytics.totalWithdraw,
        pending: analytics.pending.withdraw,
        approved: analytics.approved.withdraw,
      },
      premium: {
        title: 'Thống kê đăng ký Premium',
        subtitle: 'Doanh thu Premium mới và số tài khoản Premium đang hoạt động.',
        series: [{ key: 'premiumAmount', label: 'Doanh thu Premium' }],
        formatter: formatCurrency,
        summaryLabel: 'Doanh thu Premium',
        primaryKey: 'premiumAmount',
        total: analytics.totalPremium,
        pending: analytics.pending.premium,
        approved: analytics.approved.premium,
      },
      renewal: {
        title: 'Thống kê gia hạn Premium',
        subtitle: 'Số lượt gia hạn Premium được ghi nhận theo từng ngày.',
        series: [{ key: 'renewalCount', label: 'Lượt gia hạn' }],
        formatter: formatNumber,
        summaryLabel: 'Lượt gia hạn',
        primaryKey: 'renewalCount',
        total: analytics.renewalCount,
        pending: analytics.pending.renewal,
        approved: analytics.approved.renewal,
      },
      donation: {
        title: 'Thống kê Donate và quà tặng',
        subtitle: 'Tổng credit người dùng đã sử dụng để gửi quà trên hệ thống.',
        series: [{ key: 'donationCredit', label: 'Credit Donate' }],
        formatter: formatCredit,
        summaryLabel: 'Credit Donate',
        primaryKey: 'donationCredit',
        total: analytics.totalDonationCredit,
        pending: 0,
        approved: data.giftTransactions.length,
      },
      purchases: {
        title: 'Thống kê mua tài liệu',
        subtitle: 'Credit phát sinh từ hoạt động mua tài liệu.',
        series: [{ key: 'purchaseCredit', label: 'Credit mua tài liệu' }],
        formatter: formatCredit,
        summaryLabel: 'Credit mua tài liệu',
        primaryKey: 'purchaseCredit',
        total: analytics.totalPurchaseCredit,
        pending: 0,
        approved: data.purchases.length,
      },
      users: {
        title: 'Tăng trưởng người dùng',
        subtitle: 'Số tài khoản mới được tạo theo từng ngày.',
        series: [{ key: 'users', label: 'Người dùng mới' }],
        formatter: formatNumber,
        summaryLabel: 'Người dùng mới',
        primaryKey: 'users',
        total: data.profiles.length,
        pending: 0,
        approved: data.profiles.length,
      },
      documents: {
        title: 'Tăng trưởng tài liệu',
        subtitle: 'Số tài liệu được đăng lên hệ thống theo từng ngày.',
        series: [{ key: 'documents', label: 'Tài liệu mới' }],
        formatter: formatNumber,
        summaryLabel: 'Tài liệu mới',
        primaryKey: 'documents',
        total: data.documents.length,
        pending: data.documents.filter((item) => item.status === 'pending').length,
        approved: data.documents.filter((item) => item.status === 'published').length,
      },
      posts: {
        title: 'Tăng trưởng bảng tin',
        subtitle: 'Số bài viết cộng đồng được đăng theo từng ngày.',
        series: [{ key: 'posts', label: 'Bài viết mới' }],
        formatter: formatNumber,
        summaryLabel: 'Bài viết mới',
        primaryKey: 'posts',
        total: data.posts.length,
        pending: data.posts.filter((item) => item.status === 'hidden').length,
        approved: data.posts.filter((item) => item.status === 'visible').length,
      },
      views: {
        title: 'Thống kê lượt xem',
        subtitle: 'Lượt xem tài liệu trên toàn website theo từng ngày.',
        series: [{ key: 'views', label: 'Lượt xem' }],
        formatter: formatNumber,
        summaryLabel: 'Lượt xem',
        primaryKey: 'views',
        total: data.views.length,
        pending: 0,
        approved: data.views.length,
      },
      downloads: {
        title: 'Thống kê lượt tải xuống',
        subtitle: 'Lượt tải tài liệu được ghi nhận theo từng ngày.',
        series: [{ key: 'downloads', label: 'Lượt tải' }],
        formatter: formatNumber,
        summaryLabel: 'Lượt tải',
        primaryKey: 'downloads',
        total: data.downloads.length,
        pending: 0,
        approved: data.downloads.length,
      },
      interactions: {
        title: 'Tương tác toàn website',
        subtitle: 'Lượt thích và bình luận của người dùng theo từng ngày.',
        series: [
          { key: 'likes', label: 'Lượt thích' },
          { key: 'comments', label: 'Bình luận' },
        ],
        formatter: formatNumber,
        summaryLabel: 'Tương tác',
        primaryKey: 'interactions',
        total: data.documentLikes.length + data.postLikes.length + data.documentComments.length + data.postComments.length,
        pending: 0,
        approved: data.documentLikes.length + data.postLikes.length + data.documentComments.length + data.postComments.length,
      },
    };

    return configs[metricFocus] || configs.overview;
  }, [analytics, data, metricFocus]);

  const periodLabel = useMemo(() => {
    if (appliedCustomRange) {
      return formatCustomPeriod(appliedCustomRange.start, appliedCustomRange.end);
    }

    return range === 365 ? '1 năm gần nhất' : `${range} ngày gần nhất`;
  }, [appliedCustomRange, range]);

  const periodSummary = useMemo(() => {
    const values = analytics.daily.map((item) => toNumber(item[focusConfig.primaryKey]));
    const high = Math.max(0, ...values);
    const low = values.length ? Math.min(...values) : 0;
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    const total = values.reduce((sum, value) => sum + value, 0);
    return { high, low, average, total };
  }, [analytics.daily, focusConfig.primaryKey]);

  const quickStats = useMemo(() => [
    { key: 'overview', icon: BarChart3, label: 'Tổng quan', value: formatCurrency(analytics.totalInflow), helper: `${analytics.pending.all} yêu cầu chờ`, tone: 'green' },
    { key: 'topup', icon: CircleDollarSign, label: 'Nạp tiền', value: formatCurrency(analytics.totalTopup), helper: `${analytics.pending.topup} đang chờ`, tone: 'green' },
    { key: 'withdraw', icon: Banknote, label: 'Rút tiền', value: formatCurrency(analytics.totalWithdraw), helper: `${analytics.pending.withdraw} đang chờ`, tone: 'red' },
    { key: 'premium', icon: Crown, label: 'Premium mới', value: formatNumber(analytics.newPremiumCount), helper: `${analytics.activePremiumCount} đang dùng`, tone: 'gold' },
    { key: 'renewal', icon: Repeat2, label: 'Gia hạn', value: formatNumber(analytics.renewalCount), helper: `${analytics.pending.renewal} đang chờ`, tone: 'blue' },
    { key: 'donation', icon: Gift, label: 'Donate', value: formatCredit(analytics.totalDonationCredit), helper: `${data.giftTransactions.length} lượt gửi`, tone: 'pink' },
    { key: 'purchases', icon: ShoppingCart, label: 'Mua tài liệu', value: formatCredit(analytics.totalPurchaseCredit), helper: `${data.purchases.length} giao dịch`, tone: 'purple' },
    { key: 'users', icon: UserPlus, label: 'Người dùng', value: formatNumber(data.profiles.length), helper: 'Tổng tài khoản', tone: 'blue' },
    { key: 'documents', icon: BookOpen, label: 'Tài liệu', value: formatNumber(data.documents.length), helper: `${data.documents.filter((item) => item.status === 'pending').length} chờ duyệt`, tone: 'green' },
    { key: 'posts', icon: FileText, label: 'Bài viết', value: formatNumber(data.posts.length), helper: 'Toàn bảng tin', tone: 'orange' },
    { key: 'views', icon: Eye, label: 'Lượt xem', value: formatNumber(data.views.length), helper: 'Toàn hệ thống', tone: 'cyan' },
    { key: 'downloads', icon: ArrowDownToLine, label: 'Tải xuống', value: formatNumber(data.downloads.length), helper: 'Tài liệu đã tải', tone: 'teal' },
    { key: 'interactions', icon: Heart, label: 'Tương tác', value: formatNumber(data.documentLikes.length + data.postLikes.length + data.documentComments.length + data.postComments.length), helper: 'Thích và bình luận', tone: 'pink' },
  ], [analytics, data]);

  async function updateUser(userId, patch) {
    try {
      setBusy(true);
      const { data: result, error } = await supabase.rpc('admin_update_user', {
        p_user_id: userId,
        p_role: patch.role || null,
        p_status: patch.status || null,
      });
      if (error) throw error;
      if (!result?.ok) throw new Error('Không thể cập nhật người dùng.');
      toast('Đã cập nhật người dùng.');
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function processRequest(request, action) {
    try {
      setBusy(true);
      const { data: result, error } = await supabase.rpc('admin_process_payment_request', {
        p_request_id: request.id,
        p_action: action,
        p_admin_note: action === 'approve' ? 'Đã duyệt trên Admin' : 'Từ chối trên Admin',
      });
      if (error) throw error;
      if (!result?.ok) throw new Error(result?.message || 'Không thể xử lý yêu cầu.');
      toast(action === 'approve' ? 'Đã duyệt yêu cầu.' : 'Đã từ chối yêu cầu.');
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function processReport(report, action) {
    try {
      setBusy(true);

      const { data: result, error } = await supabase.rpc('admin_process_report', {
        p_report_id: report.id,
        p_action: action,
        p_admin_action: action === 'resolve'
          ? 'Admin đã tiếp nhận và xử lý báo cáo.'
          : 'Admin đã kiểm tra và từ chối báo cáo.',
      });

      if (error) throw error;
      if (!result?.ok) throw new Error(result?.message || 'Không thể xử lý báo cáo.');

      toast(action === 'resolve' ? 'Đã đánh dấu báo cáo là đã xử lý.' : 'Đã từ chối báo cáo.');
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  async function removeTarget() {
    if (!deleteTarget) return;
    try {
      setBusy(true);
      const table = deleteTarget.type === 'document' ? 'documents' : 'posts';
      const { error } = await supabase.from(table).delete().eq('id', deleteTarget.id);
      if (error) throw error;
      toast(deleteTarget.type === 'document' ? 'Đã xóa tài liệu.' : 'Đã xóa bài viết.');
      setDeleteTarget(null);
      await load();
    } catch (error) {
      toast(normalizeError(error), 'error');
    } finally {
      setBusy(false);
    }
  }

  function selectPresetRange(days) {
    setRange(days);
    setAppliedCustomRange(null);
    setCustomRangeOpen(false);
  }

  function applyCustomRange() {
    const { start, end } = customRangeDraft;
    const startDate = parseInputDate(start);
    const endDate = parseInputDate(end);

    if (!startDate || !endDate) {
      toast('Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc.', 'error');
      return;
    }

    if (startDate > endDate) {
      toast('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.', 'error');
      return;
    }

    const totalDays = countRangeDays(start, end);

    if (totalDays > MAX_CUSTOM_RANGE_DAYS) {
      toast('Khoảng thời gian tối đa là 3 năm để biểu đồ luôn chạy mượt.', 'error');
      return;
    }

    setAppliedCustomRange({ start, end });
    setCustomRangeOpen(false);
    toast(`Đang xem số liệu từ ${formatCustomPeriod(start, end)}.`);
  }

  function clearCustomRange() {
    setAppliedCustomRange(null);
    setRange(30);
    setCustomRangeDraft(getDefaultCustomRange());
    setCustomRangeOpen(false);
  }

  function exportReport() {
    const headings = ['Ngày', 'Nạp tiền', 'Rút tiền', 'Premium', 'Gia hạn', 'Donate credit', 'Người dùng mới', 'Tài liệu mới', 'Bài viết mới', 'Lượt xem', 'Tải xuống', 'Lượt thích', 'Bình luận', 'Lượt mua'];
    const rows = analytics.daily.map((item) => [item.fullLabel, item.topupAmount, item.withdrawAmount, item.premiumAmount, item.renewalCount, item.donationCredit, item.users, item.documents, item.posts, item.views, item.downloads, item.likes, item.comments, item.purchases]);
    const csv = `\uFEFF${[headings, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    const rangeName = appliedCustomRange
      ? `${appliedCustomRange.start}-den-${appliedCustomRange.end}`
      : `${range}-ngay`;
    anchor.download = `docshare-thong-ke-${rangeName}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <Loading label="Đang tổng hợp số liệu toàn website..." />;

  return (
    <div className="page admin-page admin-analytics-page admin-font-unified">
      <div className="admin-analytics-topline">
        <div>
          <span className="analytics-eyebrow">TRUNG TÂM PHÂN TÍCH DOCSHARE PRO</span>
          <h1>Thống kê tổng quan</h1>
          <p className="admin-analytics-topline__subtitle">Theo dõi tài chính, nội dung, người dùng và tương tác trong cùng một nơi.</p>
        </div>
        <div className="analytics-toolbar__actions">
          <div className="analytics-range-tabs">
            {RANGE_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                className={!appliedCustomRange && range === item ? 'is-active' : ''}
                onClick={() => selectPresetRange(item)}
              >
                {item === 365 ? '1 năm' : `${item} ngày`}
              </button>
            ))}

            <button
              type="button"
              className={appliedCustomRange ? 'is-active is-custom' : 'is-custom'}
              onClick={() => setCustomRangeOpen((value) => !value)}
            >
              <CalendarDays size={15} />
              Tùy chọn
            </button>
          </div>
          <button className="button button--outline" type="button" onClick={load}><RefreshCw size={16} /> Làm mới</button>
          <button className="button" type="button" onClick={exportReport}><Download size={16} /> Xuất báo cáo</button>
        </div>
      </div>

      {customRangeOpen && (
        <section className="analytics-custom-range botanical-card">
          <div className="analytics-custom-range__heading">
            <span className="analytics-custom-range__icon">
              <CalendarDays size={20} />
            </span>

            <div>
              <span className="analytics-eyebrow">KHOẢNG THỜI GIAN TÙY CHỌN</span>
              <h2>Chọn ngày cần xem thống kê</h2>
              <p>Có thể xem theo một ngày hoặc một khoảng ngày bất kỳ.</p>
            </div>
          </div>

          <div className="analytics-custom-range__fields">
            <label>
              <span>Từ ngày</span>
              <input
                type="date"
                value={customRangeDraft.start}
                max={customRangeDraft.end || undefined}
                onChange={(event) => setCustomRangeDraft((current) => ({
                  ...current,
                  start: event.target.value,
                }))}
              />
            </label>

            <span className="analytics-custom-range__separator">đến</span>

            <label>
              <span>Đến ngày</span>
              <input
                type="date"
                value={customRangeDraft.end}
                min={customRangeDraft.start || undefined}
                onChange={(event) => setCustomRangeDraft((current) => ({
                  ...current,
                  end: event.target.value,
                }))}
              />
            </label>
          </div>

          <div className="analytics-custom-range__actions">
            {appliedCustomRange && (
              <button
                className="button button--outline"
                type="button"
                onClick={clearCustomRange}
              >
                Xóa ngày tùy chọn
              </button>
            )}

            <button
              className="button"
              type="button"
              onClick={applyCustomRange}
            >
              <CalendarDays size={16} />
              Xem thống kê
            </button>
          </div>
        </section>
      )}

      {appliedCustomRange && (
        <div className="analytics-active-period">
          <CalendarDays size={16} />
          <span>Đang xem:</span>
          <strong>{periodLabel}</strong>
          <button type="button" onClick={clearCustomRange}>
            Quay về 30 ngày
          </button>
        </div>
      )}

      <div className="admin-tabs botanical-card">
        {tabs.map(([value, Icon, label]) => (
          <button key={value} className={tab === value ? 'is-active' : ''} type="button" onClick={() => setTab(value)}>
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <section className="analytics-master-kpi-grid">
            <AnalyticsMetricCard icon={CircleDollarSign} label="Tổng tiền vào đã duyệt" value={formatCurrency(analytics.totalInflow)} change={analytics.changes.inflow} values={analytics.daily.map((item) => item.inflow)} />
            <AnalyticsMetricCard icon={WalletCards} label="Dòng tiền ròng" value={formatCurrency(analytics.netCash)} change={analytics.changes.inflow} values={analytics.daily.map((item) => item.inflow - item.outflow)} />
            <AnalyticsMetricCard icon={Users} label="Tổng người dùng" value={formatNumber(data.profiles.length)} change={analytics.changes.users} values={analytics.daily.map((item) => item.users)} />
            <AnalyticsMetricCard icon={HandCoins} label="Giao dịch thành công" value={formatNumber(analytics.successfulTransactions)} change={analytics.changes.transactions} values={analytics.daily.map((item) => item.purchases + item.gifts)} />
          </section>

          <section className="analytics-selector-card botanical-card">
            <div className="analytics-selector-card__header">
              <div>
                <span className="analytics-eyebrow">CHỌN NHÓM SỐ LIỆU</span>
                <h2>Bấm vào từng mục để xem biểu đồ riêng</h2>
              </div>
              <span>{periodLabel}</span>
            </div>

            <div className="analytics-quick-grid">
              {quickStats.map((item) => (
                <QuickStatButton
                  key={item.key}
                  {...item}
                  active={metricFocus === item.key}
                  onClick={() => setMetricFocus(item.key)}
                />
              ))}
            </div>
          </section>

          <div className="admin-analytics-layout">
            <StockAnalyticsChart
              title={focusConfig.title}
              subtitle={focusConfig.subtitle}
              data={analytics.daily}
              series={focusConfig.series}
              valueFormatter={focusConfig.formatter}
            />

            <aside className="analytics-period-card">
              <div className="analytics-period-card__title">
                <div>
                  <span className="analytics-eyebrow">ĐANG XEM</span>
                  <h3>{focusConfig.summaryLabel}</h3>
                </div>
                <span className="analytics-period-card__badge">{appliedCustomRange ? 'Tùy chọn' : range === 365 ? '1 năm' : `${range} ngày`}</span>
              </div>

              <div className="analytics-focus-total">
                <small>Tổng hiện tại</small>
                <strong>{focusConfig.formatter(focusConfig.total)}</strong>
              </div>

              <div className="analytics-period-list">
                <article><span><TrendingUp size={17} /></span><div><small>Cao nhất trong ngày</small><strong>{focusConfig.formatter(periodSummary.high)}</strong></div></article>
                <article><span><TrendingDown size={17} /></span><div><small>Thấp nhất trong ngày</small><strong>{focusConfig.formatter(periodSummary.low)}</strong></div></article>
                <article><span><BarChart3 size={17} /></span><div><small>Trung bình mỗi ngày</small><strong>{focusConfig.formatter(periodSummary.average)}</strong></div></article>
                <article><span><ArrowUpRight size={17} /></span><div><small>Tổng trong kỳ</small><strong>{focusConfig.formatter(periodSummary.total)}</strong></div></article>
                <article><span><CheckCircle2 size={17} /></span><div><small>Đã ghi nhận / duyệt</small><strong>{formatNumber(focusConfig.approved)}</strong></div></article>
                <article><span><RefreshCw size={17} /></span><div><small>Đang chờ xử lý</small><strong>{formatNumber(focusConfig.pending)}</strong></div></article>
              </div>
            </aside>
          </div>

          <section className="analytics-finance-breakdown botanical-card">
            <div className="analytics-finance-breakdown__header">
              <div>
                <span className="analytics-eyebrow">TÀI CHÍNH CHI TIẾT</span>
                <h2>Nạp, rút, Premium, gia hạn và Donate</h2>
              </div>
              <button type="button" className="button button--outline button--small" onClick={() => setTab('payments')}>Mở quản lý giao dịch</button>
            </div>

            <div className="analytics-finance-breakdown__grid">
              <button type="button" onClick={() => setMetricFocus('topup')}><CircleDollarSign /><span><small>Nạp đã duyệt</small><strong>{formatCurrency(analytics.totalTopup)}</strong><em>{analytics.pending.topup} yêu cầu đang chờ</em></span></button>
              <button type="button" onClick={() => setMetricFocus('withdraw')}><Banknote /><span><small>Rút đã duyệt</small><strong>{formatCurrency(analytics.totalWithdraw)}</strong><em>{analytics.pending.withdraw} yêu cầu đang chờ</em></span></button>
              <button type="button" onClick={() => setMetricFocus('premium')}><Crown /><span><small>Premium mới</small><strong>{formatCurrency(analytics.totalPremium)}</strong><em>{analytics.activePremiumCount} tài khoản đang dùng</em></span></button>
              <button type="button" onClick={() => setMetricFocus('renewal')}><Repeat2 /><span><small>Gia hạn</small><strong>{formatNumber(analytics.renewalCount)} lượt</strong><em>{analytics.pending.renewal} yêu cầu đang chờ</em></span></button>
              <button type="button" onClick={() => setMetricFocus('donation')}><Gift /><span><small>Donate / Quà tặng</small><strong>{formatCredit(analytics.totalDonationCredit)}</strong><em>{data.giftTransactions.length} lượt gửi quà</em></span></button>
              <button type="button" onClick={() => setMetricFocus('purchases')}><Coins /><span><small>Mua tài liệu</small><strong>{formatCredit(analytics.totalPurchaseCredit)}</strong><em>{data.purchases.length} giao dịch</em></span></button>
            </div>
          </section>

          <div className="analytics-lower-grid">
            <section className="analytics-detail-card">
              <div className="analytics-detail-card__header"><div><BarChart3 size={19} /><h3>Biến động từng ngày</h3></div><span>{periodLabel}</span></div>
              <div className="analytics-table-scroll">
                <table className="analytics-table">
                  <thead><tr><th>Ngày</th><th>Nạp</th><th>Rút</th><th>Premium</th><th>Gia hạn</th><th>Donate</th><th>Người dùng</th><th>Tài liệu</th><th>Xem</th><th>Tải</th></tr></thead>
                  <tbody>{[...analytics.daily].slice(-10).reverse().map((item) => <tr key={item.key}><td><strong>{item.fullLabel}</strong></td><td><b>{formatCurrency(item.topupAmount)}</b></td><td>{formatCurrency(item.withdrawAmount)}</td><td>{formatCurrency(item.premiumAmount)}</td><td>{item.renewalCount}</td><td>{formatCredit(item.donationCredit)}</td><td>{item.users}</td><td>{item.documents}</td><td>{item.views}</td><td>{item.downloads}</td></tr>)}</tbody>
                </table>
              </div>
            </section>

            <section className="analytics-category-card">
              <div className="analytics-category-card__header"><div><BookOpen size={19} /><h3>Tài liệu theo danh mục</h3></div><span>{data.documents.length} tài liệu</span></div>
              <div className="analytics-category-list">
                {analytics.categoryRows.length ? analytics.categoryRows.map((item) => <div className="analytics-category-row" key={item.name}><div><strong>{item.name}</strong><span>{item.value}</span></div><i><b style={{ width: `${(item.value / analytics.maxCategory) * 100}%` }} /></i></div>) : <EmptyState title="Chưa có danh mục" />}
              </div>
            </section>

            <section className="analytics-ranking-card">
              <div className="analytics-ranking-card__header"><div><ShoppingCart size={19} /><h3>Top tài liệu nổi bật</h3></div><span>Xếp theo hiệu quả</span></div>
              <div className="analytics-ranking-list">
                {analytics.topDocuments.length ? analytics.topDocuments.map((item, index) => <article key={item.id}><span>{index + 1}</span><div><strong>{item.title}</strong><small>{item.views} xem · {item.downloads} tải · {item.purchases} lượt mua</small></div><b>{formatCredit(item.revenueCredit)}</b></article>) : <EmptyState title="Chưa có tài liệu" />}
              </div>
            </section>
          </div>

          <section className="botanical-card admin-log">
            <div className="section-heading"><div><ShieldCheck size={21} /><h2>Nhật ký Admin gần đây</h2></div></div>
            {data.logs.length ? data.logs.slice(0, 12).map((item) => <article key={item.id}><strong>{item.action}</strong><p>{item.detail || item.target_type || '-'}</p><small>{formatDateTime(item.created_at)}</small></article>) : <EmptyState title="Chưa có nhật ký" />}
          </section>
        </>
      )}

      {tab === 'users' && <AdminTable headings={['Người dùng', 'ID', 'Vai trò', 'Trạng thái', 'Premium', 'Thao tác']}>{data.profiles.map((item) => <tr key={item.id}><td><strong>{getProfileName(item)}</strong><small>{item.email}</small></td><td><code>{item.public_id}</code></td><td><select value={item.role} onChange={(event) => updateUser(item.id, { role: event.target.value })} disabled={busy}><option value="user">user</option><option value="teacher">teacher</option><option value="admin">admin</option></select></td><td><span className={`status status--${item.status}`}>{item.status}</span></td><td>{item.premium ? 'Có' : 'Không'}</td><td><button className="button button--small button--outline" type="button" onClick={() => updateUser(item.id, { status: item.status === 'active' ? 'locked' : 'active' })}>{item.status === 'active' ? 'Khóa' : 'Mở khóa'}</button></td></tr>)}</AdminTable>}

      {tab === 'documents' && <AdminTable headings={['Tài liệu', 'Tác giả', 'Giá', 'Trạng thái', 'Ngày đăng', 'Thao tác']}>{data.documents.map((item) => <tr key={item.id}><td><strong>{item.title}</strong></td><td>{getProfileName(item.profiles)}</td><td>{item.price_credit} credit</td><td><span className={`status status--${item.status}`}>{item.status}</span></td><td>{formatDateTime(item.created_at)}</td><td><button className="button button--small button--danger-soft" type="button" onClick={() => setDeleteTarget({ type: 'document', id: item.id })}><Trash2 size={15} /> Xóa</button></td></tr>)}</AdminTable>}

      {tab === 'posts' && <AdminTable headings={['Bài viết', 'Tác giả', 'Trạng thái', 'Ngày đăng', 'Thao tác']}>{data.posts.map((item) => <tr key={item.id}><td><strong>{item.title || item.content.slice(0, 60)}</strong></td><td>{getProfileName(item.profiles)}</td><td><span className={`status status--${item.status}`}>{item.status}</span></td><td>{formatDateTime(item.created_at)}</td><td><button className="button button--small button--danger-soft" type="button" onClick={() => setDeleteTarget({ type: 'post', id: item.id })}><Trash2 size={15} /> Xóa</button></td></tr>)}</AdminTable>}

      {tab === 'payments' && <AdminTable headings={['Người dùng', 'Loại', 'Số tiền', 'Nội dung', 'Trạng thái', 'Ngày tạo', 'Thao tác']}>{data.requests.map((item) => <tr key={item.id}><td><strong>{getProfileName(item.profiles)}</strong><small>{item.profiles?.public_id}</small></td><td>{item.type === 'topup' ? 'Nạp tiền' : item.type === 'withdraw' ? 'Rút tiền' : isRenewalRequest(item) ? 'Gia hạn Premium' : 'Mua Premium'}</td><td>{formatNumber(item.amount_vnd)}đ</td><td><code>{item.transfer_note}</code></td><td><span className={`status status--${item.status}`}>{item.status}</span></td><td>{formatDateTime(item.created_at)}</td><td>{item.status === 'pending' ? <div className="inline-actions"><button className="button button--small" type="button" onClick={() => processRequest(item, 'approve')}><CheckCircle2 size={15} /> Duyệt</button><button className="button button--small button--danger-soft" type="button" onClick={() => processRequest(item, 'reject')}><XCircle size={15} /> Từ chối</button></div> : '-'}</td></tr>)}</AdminTable>}

      {tab === 'reports' && (
        <AdminTable headings={['Người báo cáo', 'Nội dung bị báo cáo', 'Lý do', 'Trạng thái', 'Ngày gửi', 'Thao tác']}>
          {data.reports.map((item) => {
            const targetDocument = item.target_type === 'document' ? data.documents.find((documentItem) => documentItem.id === item.target_id) : null;
            const targetPost = item.target_type === 'post' ? data.posts.find((postItem) => postItem.id === item.target_id) : null;
            const targetLabel = targetDocument?.title || targetPost?.title || targetPost?.content?.slice(0, 70) || item.target_type;

            return (
              <tr key={item.id}>
                <td><strong>{getProfileName(item.reporter)}</strong><small>{item.reporter?.public_id || item.reporter?.email}</small></td>
                <td><div className="admin-report-target"><strong>{targetLabel}</strong><small>{item.target_type} · {item.target_id}</small></div></td>
                <td><div className="admin-report-reason"><strong>{item.reason}</strong>{item.detail && <small>{item.detail}</small>}</div></td>
                <td><span className={`status status--${item.status}`}>{item.status === 'pending' ? 'Chờ xử lý' : item.status === 'resolved' ? 'Đã xử lý' : 'Đã từ chối'}</span></td>
                <td>{formatDateTime(item.created_at)}</td>
                <td>{item.status === 'pending' ? <div className="inline-actions"><button className="button button--small" type="button" onClick={() => processReport(item, 'resolve')} disabled={busy}><CheckCircle2 size={15} /> Đã xử lý</button><button className="button button--small button--danger-soft" type="button" onClick={() => processReport(item, 'reject')} disabled={busy}><XCircle size={15} /> Từ chối</button></div> : item.admin_action || '-'}</td>
              </tr>
            );
          })}
        </AdminTable>
      )}

      {tab === 'gifts' && <div className="gift-grid admin-gift-grid">{data.gifts.map((item) => <article className="gift-option botanical-card" key={item.id}><span>{item.icon}</span><strong>{item.name}</strong><small>{item.credit_price} credit · tác giả nhận {item.creator_share_percent}%</small><span className={`status status--${item.active ? 'active' : 'locked'}`}>{item.active ? 'Đang bán' : 'Đã ẩn'}</span></article>)}</div>}

      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={removeTarget} title={deleteTarget?.type === 'document' ? 'Xóa tài liệu' : 'Xóa bài viết'} message="Dữ liệu liên quan sẽ bị xóa khỏi hệ thống. Bạn có chắc chắn không?" confirmLabel="Xóa" danger loading={busy} />
    </div>
  );
}

function AdminTable({ headings, children }) {
  return <section className="table-card botanical-card"><div className="table-scroll"><table><thead><tr>{headings.map((item) => <th key={item}>{item}</th>)}</tr></thead><tbody>{children}</tbody></table></div></section>;
}
