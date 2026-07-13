export function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function dateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function makeDaySeries(days = 30) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));

    return {
      key: dateKey(date),
      label: date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      }),
      fullLabel: date.toLocaleDateString('vi-VN'),
    };
  });
}

export function sumBy(items, getter) {
  return (items || []).reduce((total, item) => total + toNumber(getter(item)), 0);
}

export function average(values) {
  if (!values?.length) return 0;
  return values.reduce((total, value) => total + toNumber(value), 0) / values.length;
}

export function percentChange(current, previous) {
  const safeCurrent = toNumber(current);
  const safePrevious = toNumber(previous);

  if (safePrevious === 0) {
    return safeCurrent === 0 ? 0 : 100;
  }

  return ((safeCurrent - safePrevious) / Math.abs(safePrevious)) * 100;
}

export function formatCompact(value) {
  return new Intl.NumberFormat('vi-VN', {
    notation: Math.abs(toNumber(value)) >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(toNumber(value));
}

export function formatCurrency(value) {
  return `${new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(toNumber(value))}đ`;
}

export function formatCredit(value) {
  return `${new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(toNumber(value))} credit`;
}

export function groupCountByDate(items, field) {
  const result = new Map();

  for (const item of items || []) {
    const key = dateKey(item?.[field]);
    if (!key) continue;
    result.set(key, (result.get(key) || 0) + 1);
  }

  return result;
}

export function groupSumByDate(items, field, getter) {
  const result = new Map();

  for (const item of items || []) {
    const key = dateKey(item?.[field]);
    if (!key) continue;
    result.set(key, (result.get(key) || 0) + toNumber(getter(item)));
  }

  return result;
}

export function safeFileName(value, fallback = 'tai-lieu') {
  const text = String(value || fallback)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return text || fallback;
}
