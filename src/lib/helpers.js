export function cn(...values) {
  return values.filter(Boolean).join(' ');
}

export function formatDate(value, options = {}) {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatNumber(value = 0) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0));
}

export function formatRelativeTime(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return formatDate(value);
}

export function slugify(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function safeFileName(value = 'file') {
  const parts = value.split('.');
  const extension = parts.length > 1 ? `.${parts.pop().toLowerCase()}` : '';
  const base = slugify(parts.join('.')) || 'file';
  return `${base}-${Date.now()}${extension}`;
}

export function getInitials(name = 'U') {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'U';
}

export function getProfileName(profile) {
  return profile?.full_name || profile?.username || profile?.email?.split('@')[0] || 'Người dùng';
}

export function publicAssetUrl(bucket, path) {
  if (!path) return '';
  const base = import.meta.env.VITE_SUPABASE_URL;
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function toTags(value = '') {
  return [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))].slice(0, 12);
}

export function normalizeError(error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  const message = error?.message || String(error || '');
  const map = [
    ['Invalid login credentials', 'Email hoặc mật khẩu không đúng.'],
    ['Email not confirmed', 'Email chưa được xác nhận.'],
    ['User already registered', 'Email này đã được đăng ký.'],
    ['email rate limit exceeded', 'Bạn thao tác gửi email quá nhanh. Hãy chờ rồi thử lại.'],
    ['permission denied', 'Tài khoản chưa có quyền thực hiện thao tác này.'],
    ['duplicate key', 'Dữ liệu đã tồn tại.'],
  ];
  return map.find(([key]) => message.toLowerCase().includes(key.toLowerCase()))?.[1] || message || fallback;
}
