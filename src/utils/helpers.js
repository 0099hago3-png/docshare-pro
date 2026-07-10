export function formatNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0));
}

export function formatMoney(value) {
  return `${formatNumber(value)} đ`;
}

export function normalizeText(text = '') {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function hasBadWords(text = '', bannedWords = []) {
  const normalized = normalizeText(text);
  return bannedWords.some((word) => normalized.includes(normalizeText(word)));
}

export function getScore(doc, user, likes = []) {
  const userText = normalizeText(`${user?.major || ''} ${user?.school || ''}`);
  const tagScore = (doc.tags || []).reduce((sum, tag) => sum + (userText.includes(normalizeText(tag)) ? 30 : 0), 0);
  const likeScore = likes.includes(doc.id) ? 80 : 0;
  return doc.likes * 1.4 + doc.views / 100 + doc.downloads / 50 + tagScore + likeScore;
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function vietQrUrl({ amount, note }) {
  const bank = '970407';
  const account = '6666665261';
  const name = encodeURIComponent('Nguyen Trong Hoang Giang');
  const addInfo = encodeURIComponent(note || 'NAP CREDIT');
  return `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=${amount || 0}&addInfo=${addInfo}&accountName=${name}`;
}
